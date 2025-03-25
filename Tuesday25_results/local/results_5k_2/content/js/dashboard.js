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

    var data = {"OkPercent": 41.716, "KoPercent": 58.284};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.06839, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0E-4, 500, 1500, "23 Get Stock Portfolio Request"], "isController": false}, {"data": [0.0583, 500, 1500, "16 Get Stock Prices Request"], "isController": false}, {"data": [0.2251, 500, 1500, "14 Register Request"], "isController": false}, {"data": [0.1143, 500, 1500, "19 Place Stock Order Request"], "isController": false}, {"data": [0.0032, 500, 1500, "20 Get Stock Transactions Request"], "isController": false}, {"data": [0.0393, 500, 1500, "17 Add Money Request"], "isController": false}, {"data": [0.028, 500, 1500, "18 Get Wallet Balance Request"], "isController": false}, {"data": [5.0E-4, 500, 1500, "22 Get Wallet Balance Request"], "isController": false}, {"data": [0.2135, 500, 1500, "15 Login Request"], "isController": false}, {"data": [0.0016, 500, 1500, "21 Get Wallet Transactions Request"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 50000, 29142, 58.284, 7169.9297799999395, 18, 15928, 8048.0, 14474.0, 14874.95, 15108.0, 354.46663405573634, 559.4507215500649, 58.55885719071014], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["23 Get Stock Portfolio Request", 5000, 4810, 96.2, 8706.414400000003, 1262, 15926, 8018.0, 13160.800000000001, 14091.95, 15046.98, 40.04036068356904, 93.36866248678669, 1.4690432956420072], "isController": false}, {"data": ["16 Get Stock Prices Request", 5000, 1808, 36.16, 6936.958799999992, 111, 15917, 6138.0, 12714.7, 12974.9, 14568.98, 68.5091048600359, 83.05924785138319, 17.56423584944439], "isController": false}, {"data": ["14 Register Request", 5000, 35, 0.7, 2818.847400000006, 18, 9613, 2646.5, 5616.800000000001, 6410.749999999999, 8659.849999999997, 92.07424867413081, 27.257394425364613, 25.10089683195529], "isController": false}, {"data": ["19 Place Stock Order Request", 5000, 2201, 44.02, 5672.762199999986, 46, 15111, 4827.5, 12022.0, 14384.649999999998, 15050.97, 50.70891056976532, 80.14326416109714, 15.163677666908379], "isController": false}, {"data": ["20 Get Stock Transactions Request", 5000, 4893, 97.86, 9204.134599999965, 326, 15928, 8178.0, 14380.0, 14923.0, 15232.809999999974, 47.14757190004715, 100.31725159123056, 3.6249115983026874], "isController": false}, {"data": ["17 Add Money Request", 5000, 2489, 49.78, 8498.170399999992, 109, 15923, 9425.0, 14481.7, 14677.95, 15097.98, 60.339833944776984, 84.76109715542937, 13.31660065740249], "isController": false}, {"data": ["18 Get Wallet Balance Request", 5000, 3156, 63.12, 8698.634199999988, 97, 15923, 9365.0, 13781.0, 14465.95, 15070.0, 55.168761240635106, 94.09627017797442, 8.246102758024296], "isController": false}, {"data": ["22 Get Wallet Balance Request", 5000, 4826, 96.52, 8892.873200000011, 525, 15919, 8032.5, 12847.900000000001, 13522.8, 14905.809999999996, 42.18554891836253, 98.76752611812798, 1.4564231189463737], "isController": false}, {"data": ["15 Login Request", 5000, 31, 0.62, 2965.134000000006, 36, 11123, 2455.0, 6347.900000000006, 7413.95, 8672.97, 86.43640009680877, 45.73336423434637, 21.917654337594648], "isController": false}, {"data": ["21 Get Wallet Transactions Request", 5000, 4893, 97.86, 9305.36860000002, 154, 15911, 8144.5, 14048.900000000001, 14560.95, 15070.779999999995, 44.528355656882304, 100.35440744447314, 2.3229712602860504], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["400/Bad Request", 10, 0.0343147347471004, 0.02], "isController": false}, {"data": ["Non HTTP response code: java.io.InterruptedIOException/Non HTTP response message: Connection has been shut down", 1, 0.0034314734747100404, 0.002], "isController": false}, {"data": ["Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 27238, 93.46647450415209, 54.476], "isController": false}, {"data": ["Assertion failed", 1893, 6.495779287626107, 3.786], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 50000, 29142, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 27238, "Assertion failed", 1893, "400/Bad Request", 10, "Non HTTP response code: java.io.InterruptedIOException/Non HTTP response message: Connection has been shut down", 1, "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["23 Get Stock Portfolio Request", 5000, 4810, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 4543, "Assertion failed", 261, "400/Bad Request", 6, "", "", "", ""], "isController": false}, {"data": ["16 Get Stock Prices Request", 5000, 1808, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 1803, "400/Bad Request", 4, "Non HTTP response code: java.io.InterruptedIOException/Non HTTP response message: Connection has been shut down", 1, "", "", "", ""], "isController": false}, {"data": ["14 Register Request", 5000, 35, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 35, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["19 Place Stock Order Request", 5000, 2201, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 2201, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["20 Get Stock Transactions Request", 5000, 4893, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 4056, "Assertion failed", 837, "", "", "", "", "", ""], "isController": false}, {"data": ["17 Add Money Request", 5000, 2489, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 2489, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["18 Get Wallet Balance Request", 5000, 3156, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 3147, "Assertion failed", 9, "", "", "", "", "", ""], "isController": false}, {"data": ["22 Get Wallet Balance Request", 5000, 4826, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 4572, "Assertion failed", 254, "", "", "", "", "", ""], "isController": false}, {"data": ["15 Login Request", 5000, 31, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 31, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["21 Get Wallet Transactions Request", 5000, 4893, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 4361, "Assertion failed", 532, "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
