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

    var data = {"OkPercent": 61.01866666666667, "KoPercent": 38.98133333333333};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.07947666666666667, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0798, 500, 1500, "23 Get Stock Portfolio Request"], "isController": false}, {"data": [0.016933333333333335, 500, 1500, "16 Get Stock Prices Request"], "isController": false}, {"data": [0.1002, 500, 1500, "14 Register Request"], "isController": false}, {"data": [0.36083333333333334, 500, 1500, "19 Place Stock Order Request"], "isController": false}, {"data": [0.019533333333333333, 500, 1500, "20 Get Stock Transactions Request"], "isController": false}, {"data": [0.023933333333333334, 500, 1500, "17 Add Money Request"], "isController": false}, {"data": [0.023666666666666666, 500, 1500, "18 Get Wallet Balance Request"], "isController": false}, {"data": [0.05706666666666667, 500, 1500, "22 Get Wallet Balance Request"], "isController": false}, {"data": [0.0793, 500, 1500, "15 Login Request"], "isController": false}, {"data": [0.0335, 500, 1500, "21 Get Wallet Transactions Request"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 150000, 58472, 38.98133333333333, 10297.47430666676, 2, 80237, 1652.0, 27038.30000000001, 37723.9, 57707.98, 789.1206565483863, 334.60805774390406, 305.33864270425073], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["23 Get Stock Portfolio Request", 15000, 10985, 73.23333333333333, 6089.888400000017, 2, 80194, 1951.0, 17376.6, 26722.549999999967, 57707.65999999999, 87.51356460251338, 29.20107727374827, 35.05013980291945], "isController": false}, {"data": ["16 Get Stock Prices Request", 15000, 8367, 55.78, 21503.87619999998, 30, 80237, 13995.0, 61553.399999999994, 65107.54999999999, 80001.0, 101.15451014242555, 50.95134894807739, 39.35526854836534], "isController": false}, {"data": ["14 Register Request", 15000, 0, 0.0, 6675.555466666679, 6, 32235, 6356.0, 12918.0, 14117.949999999999, 16488.98, 206.5688907250568, 57.89577308407354, 56.08528282723955], "isController": false}, {"data": ["19 Place Stock Order Request", 15000, 0, 0.0, 2750.804533333339, 4, 15838, 1702.0, 6781.399999999998, 8728.949999999999, 14336.889999999998, 83.4144306965105, 68.4666298832198, 43.33640344779647], "isController": false}, {"data": ["20 Get Stock Transactions Request", 15000, 10792, 71.94666666666667, 11916.31420000006, 3, 80210, 8490.0, 26312.6, 36475.0, 63354.99, 83.8494734253069, 40.433406136803214, 33.80515985203363], "isController": false}, {"data": ["17 Add Money Request", 15000, 2577, 17.18, 16546.112866666692, 12, 80234, 10339.5, 44223.1, 61949.85, 80000.0, 86.34783209376224, 27.352615268959106, 37.26315396789875], "isController": false}, {"data": ["18 Get Wallet Balance Request", 15000, 3562, 23.746666666666666, 12831.269333333361, 2, 80190, 8460.5, 27741.8, 44697.74999999999, 74732.27999999998, 83.38475393159115, 26.557843265499834, 33.15499419086214], "isController": false}, {"data": ["22 Get Wallet Balance Request", 15000, 10918, 72.78666666666666, 7763.290933333312, 2, 80206, 3331.0, 21610.599999999977, 32197.69999999995, 60156.869999999995, 86.75685523751135, 26.54138464663933, 34.678737105762394], "isController": false}, {"data": ["15 Login Request", 15000, 0, 0.0, 7045.4170666667, 13, 37236, 6686.5, 13502.8, 15090.949999999999, 17997.85, 205.08894023708282, 105.94926697794611, 51.70708770286715], "isController": false}, {"data": ["21 Get Wallet Transactions Request", 15000, 11271, 75.14, 9852.214066666655, 2, 80195, 5342.0, 25420.29999999999, 36684.09999999998, 61906.97, 85.47885253188362, 30.926532662538037, 34.58226173126019], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["502/Bad Gateway", 19362, 33.11328499110685, 12.908], "isController": false}, {"data": ["504/Gateway Time-out", 92, 0.1573402654261869, 0.06133333333333333], "isController": false}, {"data": ["Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 753, 1.2877958681078123, 0.502], "isController": false}, {"data": ["Assertion failed", 38265, 65.44157887535914, 25.51], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 150000, 58472, "Assertion failed", 38265, "502/Bad Gateway", 19362, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 753, "504/Gateway Time-out", 92, "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["23 Get Stock Portfolio Request", 15000, 10985, "Assertion failed", 7258, "502/Bad Gateway", 3695, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 32, "", "", "", ""], "isController": false}, {"data": ["16 Get Stock Prices Request", 15000, 8367, "Assertion failed", 6673, "502/Bad Gateway", 1341, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 353, "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["20 Get Stock Transactions Request", 15000, 10792, "Assertion failed", 8484, "502/Bad Gateway", 2266, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 42, "", "", "", ""], "isController": false}, {"data": ["17 Add Money Request", 15000, 2577, "502/Bad Gateway", 2314, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 171, "504/Gateway Time-out", 92, "", "", "", ""], "isController": false}, {"data": ["18 Get Wallet Balance Request", 15000, 3562, "502/Bad Gateway", 2835, "Assertion failed", 623, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 104, "", "", "", ""], "isController": false}, {"data": ["22 Get Wallet Balance Request", 15000, 10918, "Assertion failed", 7239, "502/Bad Gateway", 3654, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 25, "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["21 Get Wallet Transactions Request", 15000, 11271, "Assertion failed", 7988, "502/Bad Gateway", 3257, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 26, "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
