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

    var data = {"OkPercent": 70.07416666666667, "KoPercent": 29.925833333333333};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.09760833333333334, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.08679166666666667, 500, 1500, "23 Get Stock Portfolio Request"], "isController": false}, {"data": [0.019416666666666665, 500, 1500, "16 Get Stock Prices Request"], "isController": false}, {"data": [0.11470833333333333, 500, 1500, "14 Register Request"], "isController": false}, {"data": [0.472125, 500, 1500, "19 Place Stock Order Request"], "isController": false}, {"data": [0.02325, 500, 1500, "20 Get Stock Transactions Request"], "isController": false}, {"data": [0.029583333333333333, 500, 1500, "17 Add Money Request"], "isController": false}, {"data": [0.03383333333333333, 500, 1500, "18 Get Wallet Balance Request"], "isController": false}, {"data": [0.058916666666666666, 500, 1500, "22 Get Wallet Balance Request"], "isController": false}, {"data": [0.100625, 500, 1500, "15 Login Request"], "isController": false}, {"data": [0.036833333333333336, 500, 1500, "21 Get Wallet Transactions Request"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 120000, 35911, 29.925833333333333, 8753.441941666624, 0, 80227, 1428.5, 22317.700000000033, 62272.15000000001, 80001.0, 776.8498737618955, 331.56346474032176, 301.32519031810386], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["23 Get Stock Portfolio Request", 12000, 6696, 55.8, 6965.12399999998, 0, 80052, 5355.5, 15125.899999999996, 20515.799999999996, 36732.899999999994, 82.81116294476496, 28.354304972810336, 33.22106472296216], "isController": false}, {"data": ["16 Get Stock Prices Request", 12000, 6077, 50.641666666666666, 14533.204583333325, 17, 80219, 10988.5, 22621.599999999995, 60765.799999999974, 80000.0, 87.51841533322637, 43.18401339396414, 34.44926530113628], "isController": false}, {"data": ["14 Register Request", 12000, 0, 0.0, 5780.175916666689, 4, 28781, 5380.5, 10598.499999999998, 13039.199999999983, 17564.649999999994, 189.15212559701138, 53.01431645150612, 51.35341670804369], "isController": false}, {"data": ["19 Place Stock Order Request", 12000, 0, 0.0, 1744.1681666666657, 4, 12195, 1049.0, 4440.5999999999985, 6031.949999999999, 8828.829999999996, 80.8244089715094, 66.34073802788443, 41.99080622347949], "isController": false}, {"data": ["20 Get Stock Transactions Request", 12000, 7911, 65.925, 9965.842749999953, 0, 80227, 8015.0, 17315.5, 23674.24999999994, 62447.21999999999, 80.91869693925028, 41.665621818040826, 32.66065100777494], "isController": false}, {"data": ["17 Add Money Request", 12000, 207, 1.725, 13233.106666666652, 3, 80043, 9501.5, 21940.999999999993, 47860.94999999993, 75646.92, 80.34010645064104, 24.32798848458474, 34.836537174036756], "isController": false}, {"data": ["18 Get Wallet Balance Request", 12000, 288, 2.4, 11667.685833333342, 0, 80139, 8640.0, 19819.9, 40005.349999999984, 67775.50999999997, 80.53475074494644, 25.01534013977813, 32.1217519747792], "isController": false}, {"data": ["22 Get Wallet Balance Request", 12000, 6767, 56.391666666666666, 8157.919083333326, 0, 80001, 6849.0, 15839.599999999999, 21606.699999999993, 39591.43999999999, 82.19009198441128, 24.838102641726543, 32.897172917679775], "isController": false}, {"data": ["15 Login Request", 12000, 0, 0.0, 5924.5388333333485, 5, 25277, 5618.5, 10958.8, 12824.949999999999, 16414.98, 174.46678588563702, 90.12981419287303, 43.9857488123537], "isController": false}, {"data": ["21 Get Wallet Transactions Request", 12000, 7965, 66.375, 9562.65358333335, 0, 80004, 7791.0, 17022.9, 23857.749999999993, 63020.22999999996, 81.07669855683476, 31.13440236338576, 32.79799223268336], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["504/Gateway Time-out", 28, 0.0779705382751803, 0.023333333333333334], "isController": false}, {"data": ["502/Bad Gateway", 1553, 4.32458021219125, 1.2941666666666667], "isController": false}, {"data": ["Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 323, 0.89944585224583, 0.26916666666666667], "isController": false}, {"data": ["Assertion failed", 34007, 94.69800339728774, 28.339166666666667], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 120000, 35911, "Assertion failed", 34007, "502/Bad Gateway", 1553, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 323, "504/Gateway Time-out", 28, "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["23 Get Stock Portfolio Request", 12000, 6696, "Assertion failed", 6194, "502/Bad Gateway", 496, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 6, "", "", "", ""], "isController": false}, {"data": ["16 Get Stock Prices Request", 12000, 6077, "Assertion failed", 5918, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 145, "502/Bad Gateway", 14, "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["20 Get Stock Transactions Request", 12000, 7911, "Assertion failed", 7707, "502/Bad Gateway", 184, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 20, "", "", "", ""], "isController": false}, {"data": ["17 Add Money Request", 12000, 207, "502/Bad Gateway", 99, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 80, "504/Gateway Time-out", 28, "", "", "", ""], "isController": false}, {"data": ["18 Get Wallet Balance Request", 12000, 288, "502/Bad Gateway", 139, "Assertion failed", 103, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 46, "", "", "", ""], "isController": false}, {"data": ["22 Get Wallet Balance Request", 12000, 6767, "Assertion failed", 6402, "502/Bad Gateway", 361, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 4, "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["21 Get Wallet Transactions Request", 12000, 7965, "Assertion failed", 7683, "502/Bad Gateway", 260, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 22, "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
