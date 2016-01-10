(function(){
	function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
	var ENV = {rows: 100,timeout: 0};
	var RUNS = 1000;
	
	var start = Date.now();
	var loadCount = 0;
	
	function zerofill(str,len){
		while (str.length < len){
			str += '0';
		};
		return str;
	};
	
	function formatElapsed(value){
		var str = parseFloat(value).toFixed(2);
		if (value > 60) {
			var minutes = Math.floor(value / 60);
			var comps = (value % 60).toFixed().split('.');
			var seconds = zerofill(comps[0],2);
			str = ("" + minutes + ":" + seconds + "." + (comps[1]));
		};
		return str;
	};
	
	tag$.defineTag('query', 'td', function(tag){
		
		
		tag.prototype.__lbl = {watch: 'lblDidSet',name: 'lbl'};
		tag.prototype.lbl = function(v){ return this._lbl; }
		tag.prototype.setLbl = function(v){
			var a = this.lbl();
			if(v != a) { this._lbl = v; }
			if(v != a) { this.lblDidSet && this.lblDidSet(v,a,this.__lbl) }
			return this;
		};
		
		tag.prototype.lblDidSet = function (new$,old){
			this.unflag(old);
			return this.flag(new$);
		};
		
		tag.prototype.render = function (){
			var t0, t1;
			var o = this.object();
			if (!o) { return this };
			
			var dt = o.elapsed;
			
			if (dt >= 10) {
				this.setLbl('warn_long');
			} else if (dt >= 1) {
				this.setLbl('warn');
			} else {
				this.setLbl('short');
			};
			
			return this.flag('elapsed').setChildren([
				("" + (dt && formatElapsed(dt) || '')),
				(t0 = this.$a=this.$a || tag$.$div().flag('popover').flag('left')).setContent([
					(t1 = t0.$$a=t0.$$a || tag$.$div().flag('popover-content')).setContent("" + (o.query || ''),3).end(),
					(t0.$$b = t0.$$b || tag$.$div().flag('arrow')).end()
				],2).end()
			],1).synced();
		};
	});
	
	
	tag$.defineTag('database', 'tr', function(tag,tag$){
		
		
		tag.prototype.name = function(v){ return this._name; }
		tag.prototype.setName = function(v){ this._name = v; return this; };
		
		
		tag.prototype.samples = function(v){ return this._samples; }
		tag.prototype.setSamples = function(v){ this._samples = v; return this; };
		
		tag$.defineTag('counter', 'span', function(tag1){
			
			
			tag1.prototype.__value = {watch: 'valueDidSet',name: 'value'};
			tag1.prototype.value = function(v){ return this._value; }
			tag1.prototype.setValue = function(v){
				var a = this.value();
				if(v != a) { this._value = v; }
				if(v != a) { this.valueDidSet && this.valueDidSet(v,a,this.__value) }
				return this;
			};
			
			tag1.prototype.valueDidSet = function (val){
				if (val >= 20) {
					this.dom().className = 'label label-important';
				} else if (val >= 10) {
					this.dom().className = 'label label-warning';
				} else {
					this.dom().className = 'label label-success';
				};
				return (this.setText(val),val);
			};
		});
		
		var placeholder = {query: ''};
		
		tag.prototype.render = function (){
			var t0, t1;
			var last = this._samples[this._samples.length - 1];
			var queries = last.queries;
			var count = queries.length;
			
			return this.setChildren([
				(t0 = this.$a=this.$a || tag$.$td().flag('dbname')).setContent(this.name(),3).end(),
				(t1 = this.$b=this.$b || tag$.$td().flag('query-count')).setContent((t1.$$a = t1.$$a || tag$.$counter()).setValue(count).end(),2).end(),
				(this.$c = this.$c || tag$.$query()).setObject(queries[0] || placeholder).end(),
				(this.$d = this.$d || tag$.$query()).setObject(queries[1] || placeholder).end(),
				(this.$e = this.$e || tag$.$query()).setObject(queries[2] || placeholder).end(),
				(this.$f = this.$f || tag$.$query()).setObject(queries[3] || placeholder).end(),
				(this.$g = this.$g || tag$.$query()).setObject(queries[4] || placeholder).end()
			],2).synced();
		};
	});
	
	tag$.defineTag('app', function(tag){
		
		
		
		tag.prototype.databases = function(v){ return this._databases; }
		tag.prototype.setDatabases = function(v){ this._databases = v; return this; };
		
		tag.prototype.build = function (){
			var self = this;
			self._timeout = function() { return self.loadSamples(); };
			self.setDatabases({});
			self.loadSamples();
			return self;
		};
		
		tag.prototype.loadSamples = function (){
			loadCount++;
			var dbs = this.databases();
			var data = Fixtures.getData(ENV.rows);
			this._dbkeys = Object.keys(this.databases());
			
			for (var o = data.databases, i = 0, keys = Object.keys(o), l = keys.length; i < l; i++){
				name = keys[i];dbs[($1 = name)] || (dbs[$1] = {name: name,samples: []});
				var samples = dbs[name].samples;
				samples.push({time: data.start_at,queries: o[name].queries});
				
				if (samples.length > 5) {
					samples.splice(0,samples.length - 5);
				};
			};
			
			this.render();
			return setTimeout(this._timeout,ENV.timeout);
		};
		
		
		tag.prototype.dbviews = function (){
			for (var i = 0, ary = iter$(this._dbkeys), len = ary.length, name, res = []; i < len; i++) {
				name = ary[i];
				res.push((this['_' + i] = this['_' + i] || tag$.$database()).setName(name).setSamples((this._databases[name].samples)).end());
			};
			return res;
		};
		
		tag.prototype.render = function (){
			var t0, t1;
			return this.setChildren(
				(t0 = this.$a=this.$a || tag$.$table().flag('table').flag('table-striped').flag('latest-data')).setContent(
					(t1 = t0.$$a=t0.$$a || tag$.$tbody()).setContent(this.dbviews(),3).end()
				,2).end()
			,2).synced();
		};
	});
	
	var app = tag$.$app().end();
	return id$('dbmon').append(app);

})()