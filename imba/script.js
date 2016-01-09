(function(){
	var ENV = {rows: 100,timeout: 0};
	
	var start = Date.now();
	var loadCount = 0;
	
	GET_DATA = function() {
		var data = {
			start_at: new Date().getTime() / 1000,
			databases: {}
		};
		
		var i = 1;
		while (++i < ENV.rows){
			data.databases[("cluster" + i)] = {queries: []};
			data.databases[("cluster" + i + "slave")] = {queries: []};
		};
		
		for (var o = data.databases, db, j = 0, keys = Object.keys(o), l = keys.length; j < l; j++){
			db = o[keys[j]];var r = Math.floor(Math.random() * 10 + 1);
			var k = 0;
			while (k++ < r){
				var q = {
					canvas_action: null,
					canvas_context_id: null,
					canvas_controller: null,
					canvas_hostname: null,
					canvas_job_tag: null,
					canvas_pid: null,
					elapsed: Math.random() * 15,
					query: "SELECT blah FROM something",
					waiting: Math.random() < 0.5
				};
				
				if (Math.random() < 0.2) {
					q.query = "<IDLE> in transaction";
				};
				if (Math.random() < 0.1) {
					q.query = "vacuum";
				};
				
				db.queries.push(q);
			};
			
			db.queries = db.queries.sort(function(a,b) {
				return b.elapsed - a.elapsed;
			});
		};
		
		return data;
	};
	
	tag$.defineTag('query', function(tag){
		
		tag.prototype.render = function (){
			var t0, t1;
			var value = "";
			var query = "";
			var dt = 2;
			
			return this.flag('query').flag('elapsed').flag('short',(dt < 1)).flag('warn',(10 < dt && dt >= 1)).flag('warn_long',(dt >= 10)).setChildren([
				value,
				(t0 = this.$a=this.$a || tag$.$div().flag('popover').flag('left')).setContent([
					(t1 = t0.$$a=t0.$$a || tag$.$div().flag('popover-content')).setContent(query,3).end(),
					(t0.$$b = t0.$$b || tag$.$div().flag('arrow')).end()
				],2).end()
			],1).synced();
		};
	});
	
	tag$.defineTag('sample', 'td', function(tag){
		
		tag.prototype.render = function (){
			return this.flag('query-count').setChildren(
				(this.$a = this.$a || tag$.$span()).end()
			,2).synced();
		};
	});
	
	tag$.defineTag('database', 'tr', function(tag){
		
		
		tag.prototype.name = function(v){ return this._name; }
		tag.prototype.setName = function(v){ this._name = v; return this; };
		
		
		tag.prototype.samples = function(v){ return this._samples; }
		tag.prototype.setSamples = function(v){ this._samples = v; return this; };
		
		tag.prototype.render = function (){
			var t0;
			var last = this._samples[this._samples.length - 1];
			return this.setChildren([
				(t0 = this.$a=this.$a || tag$.$td().flag('dbname')).setContent(this.name(),3).end(),
				(this.$b = this.$b || tag$.$sample()).setObject(last).end()
			],2).synced();
		};
	});
	
	return tag$.defineTag('dbmon', function(tag){
		
		
		
		tag.prototype.databases = function(v){ return this._databases; }
		tag.prototype.setDatabases = function(v){ this._databases = v; return this; };
		
		tag.prototype.render = function (){
			var t0, self = this, t1;
			return this.setChildren(
				(t0 = self.$a=self.$a || tag$.$table().flag('table').flag('table-striped').flag('latest-data')).setContent(
					(t1 = t0.$$a=t0.$$a || tag$.$tbody()).setContent(
						(function(t1) {
							for (var o = self.databases(), i = 0, keys = Object.keys(o), l = keys.length, res = []; i < l; i++){
								res.push((t1['$$a' + i] = t1['$$a' + i] || tag$.$database()).setName(keys[i]).setSamples((o[keys[i]].samples)).end());
							};
							return res;
						})(t1)
					,3).end()
				,2).end()
			,2).synced();
		};
	});

})()