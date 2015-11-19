var dirs = {
	react: 'react',
	ember: 'ember/dist',
	ember2: 'ember2/dist',
	incrementaldom: 'incrementaldom'
}

var browserPerf = require('browser-perf');
var spawn = require('child_process').spawn;

var FILE = 'data.json';
var fs = require('fs');
if (!fs.existsSync(FILE)) {
	fs.writeFileSync(FILE, JSON.stringify({}));
}

function startServer(dir) {
    var fulldir = process.cwd() + '/' + dir;
    
    console.log("Starting Python HTTP server at " + fulldir);

    return spawn('python2', ['-m', 'SimpleHTTPServer'], {
        cwd: fulldir
    });
}

function stopServer(childProcess) {
    console.log("Stopping Python HTTP server");

    childProcess.kill('SIGTERM');
}

var frameworks = Object.keys(dirs);
(function runTest(i) {
	if (i >= frameworks.length) {
		console.log('All tests done');
		return;
	}
		    
	var child = startServer(dirs[frameworks[i]]);
	setTimeout(function() {
        console.log('Starting benchmark...');
        repeatTest(frameworks[i], function() {
            stopServer(child);
            runTest(i + 1);
        });
    }, 1000);
	
	child.on('error', function(err) {
	    console.log("Fatal error: ");
	    console.log(err);
	    process.exit(1);
	});
}(0));

function repeatTest(framework, cb) {
	var REPEAT = 1;
	console.log('Running test for %s', framework);
	(function iterate(i) {
		if (i >= REPEAT) {
			console.log('All tests done for %s', framework);
			cb();
			return;
		}				

		console.log('[%d|%d]', i, REPEAT);
		browserPerf('http://localhost:8000', function(err, result) {
			if (err) {
				console.error(err);
			} else {
				var data = JSON.parse(fs.readFileSync(FILE));
				if (typeof data[framework] === 'undefined') {
					data[framework] = {};
				}
				result.forEach(function(res) {
					for (var metric in res) {
						if (typeof data[framework][metric] === 'undefined') {
							data[framework][metric] = [];
						}
						data[framework][metric].push(res[metric]);
					}
				});
				fs.writeFileSync(FILE, JSON.stringify(data));
			}
			iterate(i + 1);
		}, {
			selenium: 'http://localhost:9515',
			browsers: ['chrome']
		});

	}(0));
}
