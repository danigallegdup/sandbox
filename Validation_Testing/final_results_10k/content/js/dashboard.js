/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 96.056, "KoPercent": 3.944};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.132695, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.19495, 500, 1500, "23 Get Stock Portfolio Request"], "isController": false}, {"data": [0.04045, 500, 1500, "16 Get Stock Prices Request"], "isController": false}, {"data": [0.1054, 500, 1500, "14 Register Request"], "isController": false}, {"data": [0.5191, 500, 1500, "19 Place Stock Order Request"], "isController": false}, {"data": [0.087, 500, 1500, "20 Get Stock Transactions Request"], "isController": false}, {"data": [0.02275, 500, 1500, "17 Add Money Request"], "isController": false}, {"data": [0.0311, 500, 1500, "18 Get Wallet Balance Request"], "isController": false}, {"data": [0.1491, 500, 1500, "22 Get Wallet Balance Request"], "isController": false}, {"data": [0.0645, 500, 1500, "15 Login Request"], "isController": false}, {"data": [0.1126, 500, 1500, "21 Get Wallet Transactions Request"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 100000, 3944, 3.944, 7482.501739999988, 1, 77614, 2610.0, 15773.100000000042, 60069.9, 65800.97, 753.6987767468853, 344.8795913209702, 288.65036514350425], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["23 Get Stock Portfolio Request", 10000, 374, 3.74, 5315.534299999985, 2, 71072, 4189.0, 10476.599999999999, 13036.799999999996, 26820.17999999996, 88.8833583688126, 33.29384852164754, 35.154062636102644], "isController": false}, {"data": ["16 Get Stock Prices Request", 10000, 0, 0.0, 12485.587899999986, 30, 77446, 9397.0, 20344.5, 44609.39999999999, 65644.89, 86.27755489409431, 40.35834843190544, 33.870680729908116], "isController": false}, {"data": ["14 Register Request", 10000, 0, 0.0, 5557.479499999964, 6, 18686, 4900.0, 10629.0, 12049.849999999997, 15277.99, 216.66594444685182, 60.7257090393032, 56.85344004582484], "isController": false}, {"data": ["19 Place Stock Order Request", 10000, 0, 0.0, 1644.7689000000034, 3, 13224, 784.0, 4493.799999999999, 5918.599999999991, 7904.879999999997, 84.15312502629784, 69.52494509008592, 44.21326295326977], "isController": false}, {"data": ["20 Get Stock Transactions Request", 10000, 1503, 15.03, 8312.38670000002, 3, 77614, 7260.5, 13562.699999999999, 17216.099999999937, 58084.279999999984, 84.94372478233171, 66.15800528243788, 33.844765342960294], "isController": false}, {"data": ["17 Add Money Request", 10000, 11, 0.11, 11017.769799999996, 12, 77551, 8264.5, 17080.199999999997, 29954.79999999993, 63564.94, 83.1379591293793, 23.872813276820306, 35.80453122661745], "isController": false}, {"data": ["18 Get Wallet Balance Request", 10000, 4, 0.04, 10071.754899999993, 2, 73207, 7875.0, 15899.999999999996, 25836.49999999999, 62330.66999999999, 83.40144451301897, 25.16690714083168, 32.904476155527014], "isController": false}, {"data": ["22 Get Wallet Balance Request", 10000, 549, 5.49, 6682.7857999999815, 1, 76750, 5773.5, 11939.099999999997, 15770.949999999955, 38415.2499999999, 86.2931897414656, 25.95996622969953, 34.045360015187605], "isController": false}, {"data": ["15 Login Request", 10000, 0, 0.0, 6173.874000000022, 8, 19250, 5627.5, 11377.599999999999, 13120.949999999999, 15831.869999999997, 210.19442984760903, 107.14989490278506, 49.674855491329474], "isController": false}, {"data": ["21 Get Wallet Transactions Request", 10000, 1503, 15.03, 7563.075600000022, 1, 74779, 6604.5, 13105.9, 16245.0, 41482.33999999984, 86.0303859323113, 38.60025470371135, 34.3617459436673], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["504/Gateway Time-out", 11, 0.2789046653144016, 0.011], "isController": false}, {"data": ["Assertion failed", 3933, 99.7210953346856, 3.933], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 100000, 3944, "Assertion failed", 3933, "504/Gateway Time-out", 11, "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["23 Get Stock Portfolio Request", 10000, 374, "Assertion failed", 374, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["20 Get Stock Transactions Request", 10000, 1503, "Assertion failed", 1503, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["17 Add Money Request", 10000, 11, "504/Gateway Time-out", 11, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["18 Get Wallet Balance Request", 10000, 4, "Assertion failed", 4, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["22 Get Wallet Balance Request", 10000, 549, "Assertion failed", 549, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["21 Get Wallet Transactions Request", 10000, 1503, "Assertion failed", 1503, "", "", "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
