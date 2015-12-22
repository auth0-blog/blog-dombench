var dbmonApp = angular.module('dbmonApp', ['dbmonControllers']);

var dbmonControllers = angular.module('dbmonControllers', []);

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

dbmonControllers.controller('MainController', ['$scope', '$timeout',
    function($scope, $timeout) {
        $scope.loadCount = 0;
        $scope.databases = {};

        $scope.getClassName = function(query) {
            var className = "elapsed short";
            if (query.elapsed >= 10.0) {
                className = "elapsed warn_long";
            } else if (query.elapsed >= 1.0) {
                className = "elapsed warn";
            }
            return "Query " + className;
        };

        $scope.formatElapsed = function(value) {
          if(!value) {
              return '';
          }
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

        function loadSamples() {
            var newData = getData();

            Object.keys(newData.databases).forEach(function(dbname) {
              var sampleInfo = newData.databases[dbname];

              if (!$scope.databases[dbname]) {
                $scope.databases[dbname] = {
                  name: dbname,
                  samples: []
                }
              }

              var db = $scope.databases[dbname];
              var samples = $scope.databases[dbname].samples;
              samples.push({
                time: newData.start_at,
                queries: sampleInfo.queries
              });
              if (samples.length > 5) {
                samples.splice(0, samples.length - 5);
              }

              db.lastSample = db.samples[db.samples.length - 1];
              db.topFiveQueries = db.lastSample.queries.slice(0, 5);
              while (db.topFiveQueries.length < 5) {
                  db.topFiveQueries.push({ query: "" });
              }

              var countClassName = "label";
              if (db.lastSample.queries.length >= 20) {
                  countClassName += " label-important";
              } else if (db.lastSample.queries.length >= 10) {
                  countClassName += " label-warning";
              } else {
                  countClassName += " label-success";
              }

              db.countClassName = countClassName;
            });

            $timeout(loadSamples, ENV.timeout);
        }

        loadSamples();
    }
]);
