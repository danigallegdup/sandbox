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

    var data = {"OkPercent": 93.935, "KoPercent": 6.065};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.17760416666666667, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.2955833333333333, 500, 1500, "23 Get Stock Portfolio Request"], "isController": false}, {"data": [0.050291666666666665, 500, 1500, "16 Get Stock Prices Request"], "isController": false}, {"data": [0.11504166666666667, 500, 1500, "14 Register Request"], "isController": false}, {"data": [0.58025, 500, 1500, "19 Place Stock Order Request"], "isController": false}, {"data": [0.12233333333333334, 500, 1500, "20 Get Stock Transactions Request"], "isController": false}, {"data": [0.052, 500, 1500, "17 Add Money Request"], "isController": false}, {"data": [0.07775, 500, 1500, "18 Get Wallet Balance Request"], "isController": false}, {"data": [0.22420833333333334, 500, 1500, "22 Get Wallet Balance Request"], "isController": false}, {"data": [0.09045833333333334, 500, 1500, "15 Login Request"], "isController": false}, {"data": [0.168125, 500, 1500, "21 Get Wallet Transactions Request"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 120000, 7278, 6.065, 8274.62411666654, 2, 80173, 460.5, 24980.800000000003, 60792.850000000006, 80001.0, 765.0377737400784, 353.47929068646204, 297.62479056094804], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["23 Get Stock Portfolio Request", 12000, 873, 7.275, 6357.193166666634, 2, 80002, 4539.0, 13885.8, 19647.85, 41387.909999999974, 84.43271767810026, 31.598607904573438, 33.86028199208443], "isController": false}, {"data": ["16 Get Stock Prices Request", 12000, 108, 0.9, 13535.796499999964, 17, 80173, 9314.5, 24771.999999999996, 59404.24999999994, 79753.32999999996, 87.1250898477489, 42.431790583955916, 34.401477859336545], "isController": false}, {"data": ["14 Register Request", 12000, 0, 0.0, 6727.3569999999945, 3, 37337, 6831.0, 12214.099999999997, 14591.849999999997, 17989.509999999987, 180.82365173364676, 50.68006645269201, 49.09229705370463], "isController": false}, {"data": ["19 Place Stock Order Request", 12000, 0, 0.0, 1286.44075, 3, 11443, 664.5, 3632.699999999999, 4952.849999999997, 7239.9299999999985, 81.64098377385449, 67.92784978058985, 43.37177262986019], "isController": false}, {"data": ["20 Get Stock Transactions Request", 12000, 2387, 19.891666666666666, 8848.90633333334, 3, 80003, 7609.0, 14930.399999999998, 19629.299999999985, 60676.869999999995, 81.9000819000819, 62.25091391107016, 33.07883522727273], "isController": false}, {"data": ["17 Add Money Request", 12000, 162, 1.35, 12671.646499999992, 7, 80078, 8344.0, 21979.699999999968, 59455.24999999996, 79836.9, 81.4719261321203, 25.148987276376538, 35.235434506331046], "isController": false}, {"data": ["18 Get Wallet Balance Request", 12000, 152, 1.2666666666666666, 10619.840083333338, 3, 80130, 7712.5, 17398.8, 36102.04999999998, 68172.69999999997, 81.58270446665307, 25.320461749609084, 32.54245646797879], "isController": false}, {"data": ["22 Get Wallet Balance Request", 12000, 1182, 9.85, 7661.8209166666375, 2, 80090, 6249.5, 15036.599999999999, 20630.899999999998, 55353.96999999998, 83.59456635318705, 25.35768514890282, 33.43422098136538], "isController": false}, {"data": ["15 Login Request", 12000, 0, 0.0, 6593.245916666659, 8, 37949, 6588.0, 11491.0, 13370.849999999997, 17412.989999999998, 179.8588108334957, 92.91534270597582, 45.34516088464306], "isController": false}, {"data": ["21 Get Wallet Transactions Request", 12000, 2414, 20.116666666666667, 8443.993999999975, 2, 80110, 7110.0, 15432.399999999998, 20741.649999999994, 60492.97, 82.19684775088876, 36.80520385246351, 33.23724659182758], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["504/Gateway Time-out", 30, 0.41220115416323166, 0.025], "isController": false}, {"data": ["502/Bad Gateway", 21, 0.2885408079142622, 0.0175], "isController": false}, {"data": ["Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 326, 4.479252541907117, 0.27166666666666667], "isController": false}, {"data": ["Assertion failed", 6901, 94.82000549601538, 5.7508333333333335], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 120000, 7278, "Assertion failed", 6901, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 326, "504/Gateway Time-out", 30, "502/Bad Gateway", 21, "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["23 Get Stock Portfolio Request", 12000, 873, "Assertion failed", 863, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 10, "", "", "", "", "", ""], "isController": false}, {"data": ["16 Get Stock Prices Request", 12000, 108, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 108, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["20 Get Stock Transactions Request", 12000, 2387, "Assertion failed", 2375, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 12, "", "", "", "", "", ""], "isController": false}, {"data": ["17 Add Money Request", 12000, 162, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 111, "504/Gateway Time-out", 30, "502/Bad Gateway", 21, "", "", "", ""], "isController": false}, {"data": ["18 Get Wallet Balance Request", 12000, 152, "Assertion failed", 107, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 45, "", "", "", "", "", ""], "isController": false}, {"data": ["22 Get Wallet Balance Request", 12000, 1182, "Assertion failed", 1169, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 13, "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["21 Get Wallet Transactions Request", 12000, 2414, "Assertion failed", 2387, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 27, "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
