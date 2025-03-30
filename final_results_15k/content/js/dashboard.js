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

    var data = {"OkPercent": 75.44666666666667, "KoPercent": 24.553333333333335};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.09412666666666666, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.17106666666666667, 500, 1500, "23 Get Stock Portfolio Request"], "isController": false}, {"data": [0.027433333333333334, 500, 1500, "16 Get Stock Prices Request"], "isController": false}, {"data": [0.13813333333333333, 500, 1500, "14 Register Request"], "isController": false}, {"data": [0.2293, 500, 1500, "19 Place Stock Order Request"], "isController": false}, {"data": [0.05163333333333334, 500, 1500, "20 Get Stock Transactions Request"], "isController": false}, {"data": [0.007933333333333334, 500, 1500, "17 Add Money Request"], "isController": false}, {"data": [0.015233333333333333, 500, 1500, "18 Get Wallet Balance Request"], "isController": false}, {"data": [0.13233333333333333, 500, 1500, "22 Get Wallet Balance Request"], "isController": false}, {"data": [0.07953333333333333, 500, 1500, "15 Login Request"], "isController": false}, {"data": [0.08866666666666667, 500, 1500, "21 Get Wallet Transactions Request"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 150000, 36830, 24.553333333333335, 10728.173800000033, 1, 80349, 1025.0, 30540.200000000055, 60755.95, 62829.98, 814.8188386115487, 367.21663932213863, 315.16031985034493], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["23 Get Stock Portfolio Request", 15000, 7658, 51.053333333333335, 5238.947733333328, 2, 80087, 2030.0, 12845.099999999997, 21911.449999999968, 60155.97, 102.3059767151597, 35.18661542629195, 41.04309974960612], "isController": false}, {"data": ["16 Get Stock Prices Request", 15000, 1289, 8.593333333333334, 20713.581999999937, 20, 80349, 14700.0, 61235.0, 70097.39999999997, 80002.0, 97.47665434128525, 51.67500176676435, 37.55151031952847], "isController": false}, {"data": ["14 Register Request", 15000, 0, 0.0, 5157.232866666677, 10, 19682, 4593.5, 10521.0, 12105.899999999998, 14133.949999999999, 186.8972563482768, 52.38233649605024, 50.74425991801441], "isController": false}, {"data": ["19 Place Stock Order Request", 15000, 0, 0.0, 3328.319799999986, 5, 17648, 2581.0, 7696.0, 9351.849999999997, 11951.939999999999, 87.28136019271724, 72.62081922284676, 46.36822260238103], "isController": false}, {"data": ["20 Get Stock Transactions Request", 15000, 7123, 47.486666666666665, 14445.73573333334, 3, 80309, 10085.0, 36968.6, 60126.19999999998, 74373.41999999998, 88.0281690140845, 54.794216961927816, 35.33564178036972], "isController": false}, {"data": ["17 Add Money Request", 15000, 2024, 13.493333333333334, 18235.190600000118, 74, 80324, 12714.5, 43302.99999999999, 62502.7, 80001.0, 87.90951180917774, 29.158715129226984, 37.676145250322335], "isController": false}, {"data": ["18 Get Wallet Balance Request", 15000, 3142, 20.946666666666665, 16112.016133333349, 5, 80344, 11294.5, 38606.69999999998, 61411.799999999996, 80000.0, 87.00191404210892, 28.952056281175686, 34.37725434647062], "isController": false}, {"data": ["22 Get Wallet Balance Request", 15000, 7553, 50.35333333333333, 7308.867333333355, 2, 80346, 2535.0, 18497.9, 33210.7, 62265.11999999998, 95.9312364896842, 29.725449048122307, 38.27937384482803], "isController": false}, {"data": ["15 Login Request", 15000, 0, 0.0, 5960.814133333323, 17, 18222, 5086.0, 11566.299999999997, 13450.699999999993, 16823.989999999998, 175.43038922155688, 90.62761318183944, 44.22956455253555], "isController": false}, {"data": ["21 Get Wallet Transactions Request", 15000, 8041, 53.60666666666667, 10781.031666666624, 1, 80323, 4702.5, 28239.299999999996, 43332.69999999997, 71157.85999999993, 90.68375551659513, 36.90554318624932, 36.49200518786652], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["504/Gateway Time-out", 91, 0.24708118381754005, 0.06066666666666667], "isController": false}, {"data": ["502/Bad Gateway", 18446, 50.084170513168615, 12.297333333333333], "isController": false}, {"data": ["Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 1238, 3.361390171056204, 0.8253333333333334], "isController": false}, {"data": ["Assertion failed", 17055, 46.30735813195764, 11.37], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 150000, 36830, "502/Bad Gateway", 18446, "Assertion failed", 17055, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 1238, "504/Gateway Time-out", 91, "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["23 Get Stock Portfolio Request", 15000, 7658, "Assertion failed", 3962, "502/Bad Gateway", 3689, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 7, "", "", "", ""], "isController": false}, {"data": ["16 Get Stock Prices Request", 15000, 1289, "502/Bad Gateway", 792, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 497, "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["20 Get Stock Transactions Request", 15000, 7123, "Assertion failed", 4403, "502/Bad Gateway", 2613, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 107, "", "", "", ""], "isController": false}, {"data": ["17 Add Money Request", 15000, 2024, "502/Bad Gateway", 1660, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 273, "504/Gateway Time-out", 91, "", "", "", ""], "isController": false}, {"data": ["18 Get Wallet Balance Request", 15000, 3142, "502/Bad Gateway", 2587, "Assertion failed", 358, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 197, "", "", "", ""], "isController": false}, {"data": ["22 Get Wallet Balance Request", 15000, 7553, "Assertion failed", 3766, "502/Bad Gateway", 3736, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 51, "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["21 Get Wallet Transactions Request", 15000, 8041, "Assertion failed", 4566, "502/Bad Gateway", 3369, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 106, "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
