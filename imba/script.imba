var ENV = rows: 100, timeout: 0
var RUNS = 1000

var start = Date.now
var loadCount = 0

def zerofill str, len
	while str:length < len
		str += '0'
	return str

def format-elapsed value
	let str = parseFloat(value).toFixed(2)
	if value > 60
		let minutes = Math.floor(value / 60)
		let comps = (value % 60).toFixed.split('.')
		let seconds = zerofill(comps[0],2)
		str = "{minutes}:{seconds}.{comps[1]}"
	return str

tag query < td

	prop lbl watch: yes

	def lblDidSet new, old
		unflag(old)
		flag(new)

	def render
		var o = object
		return self unless o

		let dt = o:elapsed

		if dt >= 10
			lbl = 'warn_long'
		elif dt >= 1
			lbl = 'warn'
		else
		 	lbl = 'short'

		<self.elapsed>
			"{dt and format-elapsed(dt) or ''}"
			<div.popover.left>
				<div.popover-content> "" + (o:query or '')
				<div.arrow>


tag database < tr
	prop name
	prop samples

	tag counter < span

		prop value watch: yes

		def valueDidSet val
			if val >= 20
				dom:className = 'label label-important'
			elif val >= 10
				dom:className = 'label label-warning'
			else
				dom:className = 'label label-success'
			text = val
			
	let placeholder = {query: ''}

	def render
		let last = @samples[@samples:length - 1]
		let queries = last:queries
		let count = queries:length

		<self>
			<td.dbname> name
			<td.query-count> <counter value=count>
			<query[queries[0] or placeholder]>
			<query[queries[1] or placeholder]>
			<query[queries[2] or placeholder]>
			<query[queries[3] or placeholder]>
			<query[queries[4] or placeholder]>

tag app

	prop databases

	def build
		@timeout = do load-samples
		databases = {}
		load-samples
		return self

	def load-samples
		loadCount++
		let dbs = databases
		let data = Fixtures.getData(ENV:rows)
		@dbkeys = Object.keys(databases)

		for own name,db of data:databases
			dbs[name] ||= {name: name, samples: []}
			let samples = dbs[name][:samples]
			samples.push {time: data:start_at, queries: db:queries}

			if samples:length > 5
				samples.splice(0,samples:length - 5)		
		
		render
		setTimeout(@timeout,ENV:timeout)


	def dbviews 
		for name,i in @dbkeys
			<database@{i} name=name samples=(@databases[name][:samples])>

	def render
		<self>
			<table.table.table-striped.latest-data>
				<tbody> dbviews

var app = <app>
#dbmon.append app
