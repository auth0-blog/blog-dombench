var ENV = {};
ENV.rows = 100;
ENV.timeout = 0;

var component = {
    databases: m.prop({}),
    loadCount: 0,

    view: function() {
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

        function renderQuery(query, idx) {
            var className = "elapsed short";
            if (query.elapsed >= 10.0) {
                className = "elapsed warn_long";
            } else if (query.elapsed >= 1.0) {
                className = "elapsed warn";
            }

            return m('td', { key: idx, className: 'Query ' + className }, [
                query.elapsed ? formatElapsed(query.elapsed) : '',
                m('div', { className: 'popover left' }, [
                    m('div', { className: 'popover-content' }, query.query),
                    m('div', { className: 'arrow' })
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
                m('td', { className: 'query-count' }, [
                    m('span', { className: countClassName }, queries.length)
                ])
            ];

            children = children.concat(topFiveQueries.map(renderQuery));

            return children;
        }

        function renderDatabase(db) {
            var databases = component.databases();
            var samples = databases[db].samples;
            var lastSample = samples[samples.length - 1];

            var children = [
                m('td', { className: 'dbname' }, db),
            ];

            children = children.concat(
                renderSample(lastSample.queries, lastSample.time));

            return m('tr', { key: db }, children);
        }

        return m('div', [
            m('table', { className: 'table table-striped latest-data' }, [
                m('tbody', Object.keys(component.databases()).map(renderDatabase))
            ])
        ]);
    },

    controller: function() {
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

        function loadSamples() {
            m.startComputation()

            component.loadCount++;
            var newData = getData();

            Object.keys(newData.databases).forEach(function(dbname) {
              var sampleInfo = newData.databases[dbname];

              if (!component.databases()[dbname]) {
                component.databases()[dbname] = {
                  name: dbname,
                  samples: []
                }
              }

              var samples = component.databases()[dbname].samples;
              samples.push({
                time: newData.start_at,
                queries: sampleInfo.queries
              });
              if (samples.length > 5) {
                samples.splice(0, samples.length - 5);
              }
            });

            m.endComputation();

            setTimeout(loadSamples, ENV.timeout);
        }

        loadSamples();
    }
};

m.mount(document.getElementById('dbmon'), component);
