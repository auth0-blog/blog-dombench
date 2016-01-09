var ENV = rows: 100, timeout: 0

var start = Date.now
var loadCount = 0

def getData
	var data =
		start_at: Date.new.getTime / 1000
		databases: {}

	let i = 1
	while i++ < ENV:rows
		data:databases["cluster{i}"] = {queries: []}
		data:databases["cluster{i}slave"] = {queries: []}

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
