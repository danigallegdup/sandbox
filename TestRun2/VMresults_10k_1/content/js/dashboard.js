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

    var data = {"OkPercent": 72.015, "KoPercent": 27.985};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.16166, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.1644, 500, 1500, "23 Get Stock Portfolio Request"], "isController": false}, {"data": [0.0341, 500, 1500, "16 Get Stock Prices Request"], "isController": false}, {"data": [0.2247, 500, 1500, "14 Register Request"], "isController": false}, {"data": [0.53835, 500, 1500, "19 Place Stock Order Request"], "isController": false}, {"data": [0.06595, 500, 1500, "20 Get Stock Transactions Request"], "isController": false}, {"data": [0.08285, 500, 1500, "17 Add Money Request"], "isController": false}, {"data": [0.10815, 500, 1500, "18 Get Wallet Balance Request"], "isController": false}, {"data": [0.12565, 500, 1500, "22 Get Wallet Balance Request"], "isController": false}, {"data": [0.1841, 500, 1500, "15 Login Request"], "isController": false}, {"data": [0.08835, 500, 1500, "21 Get Wallet Transactions Request"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 100000, 27985, 27.985, 6055.398100000057, 1, 74970, 666.0, 11833.800000000003, 53910.10000000001, 61476.870000000024, 753.5908604500444, 318.29373017114045, 287.72592124127715], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["23 Get Stock Portfolio Request", 10000, 5320, 53.2, 4454.82340000001, 1, 66909, 3238.5, 10155.599999999999, 12568.649999999992, 27044.169999999984, 85.81628449814636, 29.450740916346284, 33.941010958739525], "isController": false}, {"data": ["16 Get Stock Prices Request", 10000, 5000, 50.0, 11437.290599999978, 16, 73250, 9850.0, 16338.399999999998, 40032.64999999995, 61441.729999999996, 81.93161987005645, 38.32543546655961, 32.1645617067995], "isController": false}, {"data": ["14 Register Request", 10000, 0, 0.0, 3249.991799999997, 4, 12433, 2971.0, 6591.9, 7604.899999999998, 9307.949999999999, 187.76169285942282, 52.62461508852964, 49.268924911752], "isController": false}, {"data": ["19 Place Stock Order Request", 10000, 0, 0.0, 1226.3319000000042, 3, 6869, 808.0, 3099.0, 4043.5999999999913, 5013.909999999998, 81.45843176227172, 66.38384893126538, 41.842905377885664], "isController": false}, {"data": ["20 Get Stock Transactions Request", 10000, 6127, 61.27, 7120.245899999974, 3, 65911, 6143.0, 12507.299999999997, 15016.749999999995, 42026.53999999999, 81.53813538591999, 43.549374780866266, 32.4878508178275], "isController": false}, {"data": ["17 Add Money Request", 10000, 9, 0.09, 9991.366799999974, 5, 74970, 7759.5, 15113.499999999998, 30337.549999999857, 60821.95, 81.7467648717802, 23.47277724159848, 35.20539385591315], "isController": false}, {"data": ["18 Get Wallet Balance Request", 10000, 3, 0.03, 8214.144900000016, 2, 72819, 6572.5, 13646.199999999997, 18242.0, 60020.0, 81.26975871008639, 24.523689372760003, 32.06345949108877], "isController": false}, {"data": ["22 Get Wallet Balance Request", 10000, 5399, 53.99, 5224.130499999996, 1, 65579, 4506.5, 10848.599999999999, 13273.599999999991, 28447.889999999978, 82.21453059613756, 24.771936570975804, 32.4362015242574], "isController": false}, {"data": ["15 Login Request", 10000, 0, 0.0, 3526.568899999999, 4, 11979, 3171.5, 6967.0, 7885.949999999999, 10061.869999999997, 183.93510769400555, 93.76379513307705, 43.46903912299741], "isController": false}, {"data": ["21 Get Wallet Transactions Request", 10000, 6127, 61.27, 6109.086299999991, 2, 64353, 5547.0, 11616.199999999997, 13920.949999999999, 35908.97, 81.9000819000819, 31.404842342342345, 32.712044430794435], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["504/Gateway Time-out", 9, 0.03216008576022869, 0.009], "isController": false}, {"data": ["Assertion failed", 27976, 99.96783991423978, 27.976], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 100000, 27985, "Assertion failed", 27976, "504/Gateway Time-out", 9, "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["23 Get Stock Portfolio Request", 10000, 5320, "Assertion failed", 5320, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["16 Get Stock Prices Request", 10000, 5000, "Assertion failed", 5000, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["20 Get Stock Transactions Request", 10000, 6127, "Assertion failed", 6127, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["17 Add Money Request", 10000, 9, "504/Gateway Time-out", 9, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["18 Get Wallet Balance Request", 10000, 3, "Assertion failed", 3, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["22 Get Wallet Balance Request", 10000, 5399, "Assertion failed", 5399, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["21 Get Wallet Transactions Request", 10000, 6127, "Assertion failed", 6127, "", "", "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
