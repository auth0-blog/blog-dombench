var elementOpen = IncrementalDOM.elementOpen,
    elementClose = IncrementalDOM.elementClose,
    elementVoid = IncrementalDOM.elementVoid,
    text = IncrementalDOM.text,
    patch = IncrementalDOM.patch;

var ENV = {};
ENV.rows = 100;
ENV.timeout = 0;

var start = Date.now();
var loadCount = 0;

function getData() {
  // generate some dummy data
  data = {
    start_at: new Date().getTime() / 1000,
    databases: {}
  };

  for (var i = 1; i <= ENV.rows; i++) {
    data.databases["cluster" + i] = {
      queries: []
    };

    data.databases["cluster" + i + "slave"] = {
      queries: []
    };
  }

  Object.keys(data.databases).forEach(function(dbname) {
    var info = data.databases[dbname];

    var r = Math.floor((Math.random() * 10) + 1);
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

    info.queries = info.queries.sort(function(a, b) {
      return b.elapsed - a.elapsed;
    });
  });

  return data;
}

var _base;

(_base = String.prototype).lpad || (_base.lpad = function(padding, toLength) {
  return padding.repeat((toLength - this.length) / padding.length).concat(this);
});

function formatElapsed(value) {
  str = parseFloat(value).toFixed(2);
  if (value > 60) {
    minutes = Math.floor(value / 60);
    comps = (value % 60).toFixed(2).split('.');
    seconds = comps[0].lpad('0', 2);
    ms = comps[1];
    str = minutes + ":" + seconds + "." + ms;
  }
  return str;
}

function renderQuery(query) {
    var className = "elapsed short";
    if (query.elapsed >= 10.0) {
        className = "elapsed warn_long";
    } else if (query.elapsed >= 1.0) {
        className = "elapsed warn";
    }

    elementOpen('td', null, null, 'class', "Query " + className);
        text(query.elapsed ? formatElapsed(query.elapsed) : '');
        elementOpen('div', null, ['class', 'popover left']);
            elementOpen('div', null, ['class', 'popover-content']);
                text(query.query);
            elementClose('div');
            elementVoid('div', null, ['class', 'arrow']);
        elementClose('div');
    elementClose('td');
}

function renderSample(queries, time) {
    var topFiveQueries = queries.slice(0, 5);
    while (topFiveQueries.length < 5) {
        topFiveQueries.push({ query: "" });
    }

    var countClassName = "label";
    if (queries.length >= 20) {
        countClassName += " label-important";
    } else if (queries.length >= 10) {
        countClassName += " label-warning";
    } else {
        countClassName += " label-success";
    }

    elementOpen('td', null, ['class', 'query-count']);
        elementOpen('span', null, null, 'class', countClassName);
          text(queries.length);
        elementClose('span');
    elementClose('td');

    topFiveQueries.forEach(renderQuery);
}

function renderDatabase(db, samples, idx) {
    var lastSample = samples[samples.length - 1];

    elementOpen('tr');
        elementOpen('td', idx, ['class', 'dbname']);
            text(db);
        elementClose('td');
        renderSample(lastSample.queries, lastSample.time);
    elementClose('tr');
}

function renderDBMon(databases) {
    elementOpen('div');
        elementOpen('table', null, ['class', 'table table-striped latest-data']);
            elementOpen('tbody');

                Object.keys(databases).forEach(function(db, idx) {
                    renderDatabase(db, databases[db].samples, idx);
                });

            elementClose('tbody');
        elementClose('table');
    elementClose('div');
}

var globals = {
    databases: {},
    loadCount: 0
};

function loadSamples() {
    globals.loadCount++;
    var newData = getData();

    Object.keys(newData.databases).forEach(function(dbname) {
      var sampleInfo = newData.databases[dbname];

      if (!globals.databases[dbname]) {
        globals.databases[dbname] = {
          name: dbname,
          samples: []
        }
      }

      var samples = globals.databases[dbname].samples;
      samples.push({
        time: newData.start_at,
        queries: sampleInfo.queries
      });
      if (samples.length > 5) {
        samples.splice(0, samples.length - 5);
      }
    });

    patch(document.getElementById('dbmon'), renderDBMon, globals.databases);

    setTimeout(this.loadSamples, ENV.timeout);
}

// Start doing stuff
loadSamples();
