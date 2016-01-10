// All implementations should use the same scripts for fetching data
// Creating the actual data takes a lot of time and gc, so to really compare
// the performance of the different frameworks it would be more natural to precreate
// 100 datasets or so - and then reuse these.

var cached = [];
var fetches = 0;

function createData(rows){
	data = {
    start_at: new Date().getTime() / 1000,
    databases: {}
  };

  for (var i = 1; i <= rows; i++) {
    data.databases["cluster" + i] = {
      queries: []
    };

    data.databases["cluster" + i + "slave"] = {
      queries: []
    };
  }

  Object.keys(data.databases).forEach(function (dbname) {
    var info = data.databases[dbname];

    var r = Math.floor(Math.random() * 10 + 1);
    for (var i = 0; i < r; i++) {
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
      }

      if (Math.random() < 0.1) {
        q.query = "vacuum";
      }

      info.queries.push(q);
    }

    info.queries = info.queries.sort(function (a, b) {
      return b.elapsed - a.elapsed;
    });
  });

  return data;
}

function pregenerateData(rows) {
	for(var i = 0; i < 20; i++) {
		cached[i] = createData(rows);
	}
}

Fixtures = {
  getData: function(rows){
    return createData(rows);
  },
	getCachedData: function(rows){
		if(cached.length == 0) pregenerateData(rows);
		var index = fetches % cached.length;
		fetches++;
		return cached[index];
	}
}