var json2csv = require('json2csv');

var FILE = 'data.json';
var fs = require('fs');

function averageValues() {
    var fields = ['MajorGC', 'MinorGC', 'Layout', 'Paint', 'mean_frame_time',
        'droppedFrameCount', 'ExpensivePaints', 'ExpensiveEventHandlers',
        'NodePerLayout_avg', 'frames_per_sec', 'percentage_smooth',
        'domReadyTime', 'totalJSHeapSize_max', 'totalJSHeapSize_avg',
		'usedJSHeapSize_max', 'usedJSHeapSize_avg', 'Javascript'];

    var data = JSON.parse(fs.readFileSync(FILE));

    var result = [];

    fields.forEach(function(field) {
        var row = { field: field };
        Object.keys(data).forEach(function(framework) {
            var values = data[framework][field];
            if(!values) {
                row[framework] = "Missing";
            } else {
                var avg = values.reduce(function(a, v){ return a + v; }, 0) /
                          values.length;
                row[framework] = avg;
            }
        });
        result.push(row);
    });

    var columnNames = [ 'field' ].concat(Object.keys(data));

    json2csv({ data: result, fields: columnNames }, function(err, csv) {
        if(err) {
            console.log(err);
            return;
        }
        fs.writeFileSync('results.csv', csv);
        console.log('file saved');
    });
}

averageValues();
