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

    var data = {"OkPercent": 40.354, "KoPercent": 59.646};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.02473, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.01155, 500, 1500, "23 Get Stock Portfolio Request"], "isController": false}, {"data": [0.0106, 500, 1500, "16 Get Stock Prices Request"], "isController": false}, {"data": [0.10855, 500, 1500, "14 Register Request"], "isController": false}, {"data": [0.0496, 500, 1500, "19 Place Stock Order Request"], "isController": false}, {"data": [0.00375, 500, 1500, "20 Get Stock Transactions Request"], "isController": false}, {"data": [0.0157, 500, 1500, "17 Add Money Request"], "isController": false}, {"data": [0.00865, 500, 1500, "18 Get Wallet Balance Request"], "isController": false}, {"data": [0.0055, 500, 1500, "22 Get Wallet Balance Request"], "isController": false}, {"data": [0.02985, 500, 1500, "15 Login Request"], "isController": false}, {"data": [0.00355, 500, 1500, "21 Get Wallet Transactions Request"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 100000, 59646, 59.646, 37398.92470999988, 1, 80844, 22452.5, 78251.0, 80000.0, 80001.0, 214.54209208575676, 167.19710452986857, 60.49435409019135], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["23 Get Stock Portfolio Request", 10000, 8511, 85.11, 27047.713700000106, 1, 80405, 22576.5, 79379.6, 80001.0, 80006.99, 22.334889330623366, 12.479252981707726, 6.830262169722824], "isController": false}, {"data": ["16 Get Stock Prices Request", 10000, 7864, 78.64, 39765.76909999993, 17, 80844, 34820.0, 80001.0, 80011.0, 80304.99, 37.11153500731097, 33.63883761569521, 10.547152611677886], "isController": false}, {"data": ["14 Register Request", 10000, 1116, 11.16, 26249.363699999943, 17, 80204, 18159.0, 76910.0, 79999.0, 80005.0, 90.07791739854974, 40.0815064405711, 22.46796604062514], "isController": false}, {"data": ["19 Place Stock Order Request", 10000, 4155, 41.55, 40328.86210000019, 11, 80772, 41897.0, 80001.0, 80002.0, 80050.98, 23.11459987471887, 24.87351257549806, 8.72587205967843], "isController": false}, {"data": ["20 Get Stock Transactions Request", 10000, 8663, 86.63, 42289.19440000003, 8, 80510, 39080.0, 80001.0, 80002.0, 80041.0, 21.836349661099852, 17.099013310892843, 6.205263631614231], "isController": false}, {"data": ["17 Add Money Request", 10000, 4216, 42.16, 44456.57559999981, 12, 80449, 41379.0, 80001.0, 80003.0, 80181.91, 28.697945514080647, 25.858233359855017, 8.341766904704167], "isController": false}, {"data": ["18 Get Wallet Balance Request", 10000, 5155, 51.55, 46381.10619999999, 4, 80497, 43001.5, 80001.0, 80003.0, 80081.98, 23.355918506529147, 21.437108916092697, 6.024467587240195], "isController": false}, {"data": ["22 Get Wallet Balance Request", 10000, 8573, 85.73, 32406.58789999994, 1, 80459, 25110.0, 80000.0, 80001.0, 80023.0, 22.247534973124978, 13.388321041802007, 6.5582778350033815], "isController": false}, {"data": ["15 Login Request", 10000, 2382, 23.82, 34246.68290000001, 24, 80670, 28896.5, 80001.0, 80022.0, 80296.99, 52.67233069796105, 41.97657097695322, 10.81259044826787], "isController": false}, {"data": ["21 Get Wallet Transactions Request", 10000, 9011, 90.11, 40817.391499999845, 7, 80418, 38019.5, 80001.0, 80002.0, 80043.99, 21.92655481200172, 17.679728029866162, 5.9178850693591745], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["408/Request Timeout", 385, 0.6454749689836703, 0.385], "isController": false}, {"data": ["400/Bad Request", 14849, 24.895215102437717, 14.849], "isController": false}, {"data": ["504/Gateway Time-out", 647, 1.0847332595647654, 0.647], "isController": false}, {"data": ["502/Bad Gateway", 3421, 5.735506152969185, 3.421], "isController": false}, {"data": ["Non HTTP response code: java.io.InterruptedIOException/Non HTTP response message: Connection has been shut down", 4, 0.006706233443986185, 0.004], "isController": false}, {"data": ["Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 17616, 29.53425208731516, 17.616], "isController": false}, {"data": ["Assertion failed", 22724, 38.098112195285516, 22.724], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 100000, 59646, "Assertion failed", 22724, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 17616, "400/Bad Request", 14849, "502/Bad Gateway", 3421, "504/Gateway Time-out", 647], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["23 Get Stock Portfolio Request", 10000, 8511, "Assertion failed", 4957, "400/Bad Request", 2380, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 1013, "502/Bad Gateway", 156, "408/Request Timeout", 5], "isController": false}, {"data": ["16 Get Stock Prices Request", 10000, 7864, "Assertion failed", 4282, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 2157, "400/Bad Request", 1051, "502/Bad Gateway", 247, "408/Request Timeout", 127], "isController": false}, {"data": ["14 Register Request", 10000, 1116, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 698, "504/Gateway Time-out", 414, "Non HTTP response code: java.io.InterruptedIOException/Non HTTP response message: Connection has been shut down", 4, "", "", "", ""], "isController": false}, {"data": ["19 Place Stock Order Request", 10000, 4155, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 2002, "400/Bad Request", 1923, "502/Bad Gateway", 197, "504/Gateway Time-out", 25, "408/Request Timeout", 8], "isController": false}, {"data": ["20 Get Stock Transactions Request", 10000, 8663, "Assertion failed", 4122, "400/Bad Request", 2147, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 1692, "502/Bad Gateway", 651, "408/Request Timeout", 51], "isController": false}, {"data": ["17 Add Money Request", 10000, 4216, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 2626, "400/Bad Request", 1077, "502/Bad Gateway", 385, "504/Gateway Time-out", 81, "408/Request Timeout", 47], "isController": false}, {"data": ["18 Get Wallet Balance Request", 10000, 5155, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 2656, "400/Bad Request", 1378, "502/Bad Gateway", 719, "Assertion failed", 402, "", ""], "isController": false}, {"data": ["22 Get Wallet Balance Request", 10000, 8573, "Assertion failed", 4659, "400/Bad Request", 2364, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 1276, "502/Bad Gateway", 268, "408/Request Timeout", 6], "isController": false}, {"data": ["15 Login Request", 10000, 2382, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 1455, "502/Bad Gateway", 423, "400/Bad Request", 259, "504/Gateway Time-out", 127, "408/Request Timeout", 118], "isController": false}, {"data": ["21 Get Wallet Transactions Request", 10000, 9011, "Assertion failed", 4302, "400/Bad Request", 2270, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 2041, "502/Bad Gateway", 375, "408/Request Timeout", 23], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
