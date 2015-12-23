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

var h = virtualDom.h;

function renderQuery(query) {
    var className = "elapsed short";
    if (query.elapsed >= 10.0) {
        className = "elapsed warn_long";
    } else if (query.elapsed >= 1.0) {
        className = "elapsed warn";
    }

    return h('td', { className: 'Query ' + className }, [
        query.elapsed ? formatElapsed(query.elapsed) : '',
        h('div', { className: 'popover left' }, [
            h('div', { className: 'popover-content' }, query.query),
            h('div', { className: 'arrow' })
        ])
    ]);
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

    var children = [
        h('td', { className: 'query-count' }, [
            h('span', { className: countClassName }, queries.length)
        ])
    ];

    children = children.concat(topFiveQueries.map(renderQuery));

    return children;
}

function renderDatabase(databases, db) {
    var samples = databases[db].samples;
    var lastSample = samples[samples.length - 1];

    var children = [
        h('td', { className: 'dbname' }, db),
    ];

    children = children.concat(
        renderSample(lastSample.queries, lastSample.time));

    return h('tr', children);
}

function renderDBMon(databases) {
    return h('div', [
        h('table', { className: 'table table-striped latest-data' }, [
            h('tbody', Object.keys(databases).map(function(db) {
                return renderDatabase(databases, db);
            }))
        ])
    ]);
}

var globals = {
    databases: {},
    loadCount: 0
};

var tree = renderDBMon(globals.databases);
var rootNode = virtualDom.create(tree);
document.getElementById('dbmon').appendChild(rootNode);

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

    var newTree = renderDBMon(globals.databases);
    var patches = virtualDom.diff(tree, newTree);
    rootNode = virtualDom.patch(rootNode, patches);
    tree = newTree;

    setTimeout(this.loadSamples, ENV.timeout);
}

// Start doing stuff
loadSamples();
