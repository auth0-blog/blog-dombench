"use strict";
/* jshint ignore:start */

/* jshint ignore:end */

define('dbmonster/app', ['exports', 'ember', 'ember/resolver', 'ember/load-initializers', 'dbmonster/config/environment'], function (exports, _ember, _emberResolver, _emberLoadInitializers, _dbmonsterConfigEnvironment) {

  var App;

  _ember['default'].MODEL_FACTORY_INJECTIONS = true;

  App = _ember['default'].Application.extend({
    modulePrefix: _dbmonsterConfigEnvironment['default'].modulePrefix,
    podModulePrefix: _dbmonsterConfigEnvironment['default'].podModulePrefix,
    Resolver: _emberResolver['default']
  });

  (0, _emberLoadInitializers['default'])(App, _dbmonsterConfigEnvironment['default'].modulePrefix);

  exports['default'] = App;
});
define('dbmonster/components/dbmon-database', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Component.extend({
    tagName: 'tr',

    queries: (function () {
      var samples = this.get('attrs.db.value.samples');
      return samples[samples.length - 1].queries;
    }).property('attrs.db'),

    topFiveQueries: (function () {
      var queries = this.get('queries');
      var topFiveQueries = queries.slice(0, 5);

      while (topFiveQueries.length < 5) {
        topFiveQueries.push({ query: "" });
      }

      return topFiveQueries.map(function (query, index) {
        return {
          key: index + '',
          query: query.query,
          elapsed: query.elapsed ? formatElapsed(query.elapsed) : '',
          className: elapsedClass(query.elapsed)
        };
      });
    }).property('queries'),

    countClassName: (function () {
      var queries = this.get('queries');
      var countClassName = "label";

      if (queries.length >= 20) {
        countClassName += " label-important";
      } else if (queries.length >= 10) {
        countClassName += " label-warning";
      } else {
        countClassName += " label-success";
      }

      return countClassName;
    }).property('queries')
  });

  function elapsedClass(elapsed) {
    if (elapsed >= 10.0) {
      return "elapsed warn_long";
    } else if (elapsed >= 1.0) {
      return "elapsed warn";
    } else {
      return "elapsed short";
    }
  }

  var _base;

  (_base = String.prototype).lpad || (_base.lpad = function (padding, toLength) {
    return padding.repeat((toLength - this.length) / padding.length).concat(this);
  });

  function formatElapsed(value) {
    var str = parseFloat(value).toFixed(2);
    if (value > 60) {
      var minutes = Math.floor(value / 60);
      var comps = (value % 60).toFixed(2).split('.');
      var seconds = comps[0].lpad('0', 2);
      var ms = comps[1];
      str = minutes + ":" + seconds + "." + ms;
    }
    return str;
  }
});
define("dbmonster/lib/get-data", ["exports"], function (exports) {
  exports["default"] = getData;
  var ROWS = 100;

  function getData() {
    // generate some dummy data
    var data = {
      start_at: new Date().getTime() / 1000,
      databases: {}
    };

    for (var i = 1; i <= ROWS; i++) {
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
});
define('dbmonster/router', ['exports', 'ember', 'dbmonster/config/environment'], function (exports, _ember, _dbmonsterConfigEnvironment) {

  var Router = _ember['default'].Router.extend({
    location: _dbmonsterConfigEnvironment['default'].locationType
  });

  Router.map(function () {});

  exports['default'] = Router;
});
define('dbmonster/routes/application', ['exports', 'ember', 'dbmonster/lib/get-data'], function (exports, _ember, _dbmonsterLibGetData) {
  exports['default'] = _ember['default'].Route.extend({
    model: function model() {
      return {
        databases: {}
      };
    },

    afterModel: function afterModel() {
      this.loadSamples();
    },

    loadSamples: function loadSamples() {
      var model = this.modelFor('application');
      var newData = (0, _dbmonsterLibGetData['default'])();
      var databaseArray = [];

      Object.keys(newData.databases).forEach(function (dbname) {
        var sampleInfo = newData.databases[dbname];

        if (!model.databases[dbname]) {
          model.databases[dbname] = {
            name: dbname,
            samples: []
          };
        }

        var samples = model.databases[dbname].samples;
        samples.push({
          time: newData.start_at,
          queries: sampleInfo.queries
        });
        if (samples.length > 5) {
          samples.splice(0, samples.length - 5);
        }

        databaseArray.push(model.databases[dbname]);
      });

      _ember['default'].set(model, 'databaseArray', databaseArray);

      requestAnimationFrame(_ember['default'].run.bind(this, this.loadSamples));
    }
  });
});
define("dbmonster/templates/application", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    var child0 = (function () {
      return {
        meta: {
          "revision": "Ember@1.13.11",
          "loc": {
            "source": null,
            "start": {
              "line": 4,
              "column": 6
            },
            "end": {
              "line": 6,
              "column": 6
            }
          },
          "moduleName": "dbmonster/templates/application.hbs"
        },
        arity: 1,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("        ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment, 1, 1, contextualElement);
          return morphs;
        },
        statements: [["inline", "dbmon-database", [], ["db", ["subexpr", "@mut", [["get", "db", ["loc", [null, [5, 28], [5, 30]]]]], [], []]], ["loc", [null, [5, 8], [5, 32]]]]],
        locals: ["db"],
        templates: []
      };
    })();
    return {
      meta: {
        "revision": "Ember@1.13.11",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 10,
            "column": 0
          }
        },
        "moduleName": "dbmonster/templates/application.hbs"
      },
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("table");
        dom.setAttribute(el2, "class", "table table-striped latest-data");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("tbody");
        var el4 = dom.createTextNode("\n");
        dom.appendChild(el3, el4);
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("  ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var morphs = new Array(1);
        morphs[0] = dom.createMorphAt(dom.childAt(fragment, [0, 1, 1]), 1, 1);
        return morphs;
      },
      statements: [["block", "each", [["get", "model.databaseArray", ["loc", [null, [4, 14], [4, 33]]]]], [], 0, null, ["loc", [null, [4, 6], [6, 15]]]]],
      locals: [],
      templates: [child0]
    };
  })());
});
define("dbmonster/templates/components/dbmon-database", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    var child0 = (function () {
      return {
        meta: {
          "revision": "Ember@1.13.11",
          "loc": {
            "source": null,
            "start": {
              "line": 9,
              "column": 0
            },
            "end": {
              "line": 17,
              "column": 0
            }
          },
          "moduleName": "dbmonster/templates/components/dbmon-database.hbs"
        },
        arity: 1,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("  ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("td");
          var el2 = dom.createTextNode("\n    ");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n    ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("div");
          dom.setAttribute(el2, "class", "popover left");
          var el3 = dom.createTextNode("\n      ");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("div");
          dom.setAttribute(el3, "class", "popover-content");
          var el4 = dom.createComment("");
          dom.appendChild(el3, el4);
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n      ");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("div");
          dom.setAttribute(el3, "class", "arrow");
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n    ");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n  ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var element0 = dom.childAt(fragment, [1]);
          var morphs = new Array(3);
          morphs[0] = dom.createAttrMorph(element0, 'class');
          morphs[1] = dom.createMorphAt(element0, 1, 1);
          morphs[2] = dom.createMorphAt(dom.childAt(element0, [3, 1]), 0, 0);
          return morphs;
        },
        statements: [["attribute", "class", ["concat", ["Query ", ["get", "query.className", ["loc", [null, [10, 21], [10, 36]]]]]]], ["content", "query.elapsed", ["loc", [null, [11, 4], [11, 21]]]], ["content", "query.query", ["loc", [null, [13, 35], [13, 50]]]]],
        locals: ["query"],
        templates: []
      };
    })();
    return {
      meta: {
        "revision": "Ember@1.13.11",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 18,
            "column": 0
          }
        },
        "moduleName": "dbmonster/templates/components/dbmon-database.hbs"
      },
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("td");
        dom.setAttribute(el1, "class", "dbname");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("td");
        dom.setAttribute(el1, "class", "query-count");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("span");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element1 = dom.childAt(fragment, [2, 1]);
        var morphs = new Array(4);
        morphs[0] = dom.createMorphAt(dom.childAt(fragment, [0]), 1, 1);
        morphs[1] = dom.createAttrMorph(element1, 'class');
        morphs[2] = dom.createMorphAt(element1, 1, 1);
        morphs[3] = dom.createMorphAt(fragment, 4, 4, contextualElement);
        dom.insertBoundary(fragment, null);
        return morphs;
      },
      statements: [["content", "attrs.db.name", ["loc", [null, [2, 2], [2, 19]]]], ["attribute", "class", ["concat", [["get", "countClassName", ["loc", [null, [5, 17], [5, 31]]]]]]], ["content", "queries.length", ["loc", [null, [6, 4], [6, 22]]]], ["block", "each", [["get", "topFiveQueries", ["loc", [null, [9, 8], [9, 22]]]]], [], 0, null, ["loc", [null, [9, 0], [17, 9]]]]],
      locals: [],
      templates: [child0]
    };
  })());
});
/* jshint ignore:start */

/* jshint ignore:end */

/* jshint ignore:start */

define('dbmonster/config/environment', ['ember'], function(Ember) {
  var prefix = 'dbmonster';
/* jshint ignore:start */

try {
  var metaName = prefix + '/config/environment';
  var rawConfig = Ember['default'].$('meta[name="' + metaName + '"]').attr('content');
  var config = JSON.parse(unescape(rawConfig));

  return { 'default': config };
}
catch(err) {
  throw new Error('Could not read config from meta tag with name "' + metaName + '".');
}

/* jshint ignore:end */

});

if (!runningTests) {
  require("dbmonster/app")["default"].create({});
}

/* jshint ignore:end */
