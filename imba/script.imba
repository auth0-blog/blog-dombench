var ENV = rows: 100, timeout: 0

var start = Date.now
var loadCount = 0

GET_DATA = do
	var data =
		start_at: Date.new.getTime / 1000
		databases: {}

	let i = 1
	while ++i < ENV:rows
		data:databases["cluster{i}"] = {queries: []}
		data:databases["cluster{i}slave"] = {queries: []}

	for own name,db of data:databases
		let r = Math.floor Math.random * 10 + 1
		let k = 0
		while k++ < r
			let q =
				canvas_action: null
				canvas_context_id: null
				canvas_controller: null
				canvas_hostname: null
				canvas_job_tag: null
				canvas_pid: null
				elapsed: Math.random * 15
				query: "SELECT blah FROM something"
				waiting: Math.random < 0.5

			if Math.random < 0.2
				q:query = "<IDLE> in transaction"
			if Math.random < 0.1
				q:query = "vacuum"

			db:queries.push(q)

		db:queries = db:queries.sort do |a,b|
			b:elapsed - a:elapsed

	return data

tag query

	def render
		let value = ""
		let query = ""
		let dt = 2

		<self.query.elapsed .short=(dt < 1) .warn=(10 < dt >= 1) .warn_long=(dt >= 10)>
			value
			<div.popover.left>
				<div.popover-content> query
				<div.arrow>

tag sample < td

	def render
		<self.query-count>
			<span>

tag database < tr
	prop name
	prop samples

	def render
		let last = @samples[@samples:length - 1]
		<self>
			<td.dbname> name
			<sample[last]>

tag dbmon

	prop databases

	def render
		<self>
			<table.table.table-striped.latest-data>
				<tbody>
					for own name,db of databases
						<database name=name samples=(db:samples)>
