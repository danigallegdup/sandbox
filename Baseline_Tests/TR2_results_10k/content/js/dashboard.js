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

    var data = {"OkPercent": 93.672, "KoPercent": 6.328};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.21883, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.22295, 500, 1500, "23 Get Stock Portfolio Request"], "isController": false}, {"data": [0.0673, 500, 1500, "16 Get Stock Prices Request"], "isController": false}, {"data": [0.3823, 500, 1500, "14 Register Request"], "isController": false}, {"data": [0.642, 500, 1500, "19 Place Stock Order Request"], "isController": false}, {"data": [0.1151, 500, 1500, "20 Get Stock Transactions Request"], "isController": false}, {"data": [0.07345, 500, 1500, "17 Add Money Request"], "isController": false}, {"data": [0.08545, 500, 1500, "18 Get Wallet Balance Request"], "isController": false}, {"data": [0.18275, 500, 1500, "22 Get Wallet Balance Request"], "isController": false}, {"data": [0.2641, 500, 1500, "15 Login Request"], "isController": false}, {"data": [0.1529, 500, 1500, "21 Get Wallet Transactions Request"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 100000, 6328, 6.328, 5902.805269999975, 1, 77671, 2286.5, 14694.90000000003, 59256.8, 64116.98, 742.6606560664236, 335.92918858289204, 284.42300314795284], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["23 Get Stock Portfolio Request", 10000, 722, 7.22, 4494.864600000018, 2, 66967, 3510.5, 8677.399999999998, 11974.899999999998, 27823.03999999998, 81.67265599477295, 30.412456483787977, 32.30217351355766], "isController": false}, {"data": ["16 Get Stock Prices Request", 10000, 0, 0.0, 11568.098200000033, 10, 75979, 8756.0, 18169.9, 42510.94999999995, 64231.649999999994, 79.84733190140452, 37.3504609187234, 31.34631584410607], "isController": false}, {"data": ["14 Register Request", 10000, 0, 0.0, 2019.7653999999873, 4, 9602, 1398.5, 5144.5999999999985, 6071.0, 7735.229999999983, 183.99264029438822, 51.568249770009196, 48.27992036568537], "isController": false}, {"data": ["19 Place Stock Order Request", 10000, 0, 0.0, 874.6211000000005, 3, 7784, 546.0, 2089.0, 3037.899999999998, 4674.0, 79.96353662729796, 66.06362498700592, 42.012092485826464], "isController": false}, {"data": ["20 Get Stock Transactions Request", 10000, 2309, 23.09, 6991.593699999976, 3, 77671, 5748.0, 12273.8, 16649.49999999999, 43457.979999999894, 80.08328661808281, 58.9560173830784, 31.908184511892365], "isController": false}, {"data": ["17 Add Money Request", 10000, 8, 0.08, 10189.800199999998, 4, 75844, 7200.0, 16877.9, 34766.95, 63103.93, 79.86327407478397, 22.93167846646541, 34.394242057597396], "isController": false}, {"data": ["18 Get Wallet Balance Request", 10000, 2, 0.02, 8825.618500000022, 2, 73536, 6364.5, 14999.9, 23966.999999999956, 61243.869999999995, 79.94244144216164, 24.123193800463664, 31.539791350227834], "isController": false}, {"data": ["22 Get Wallet Balance Request", 10000, 978, 9.78, 5410.349399999975, 1, 74441, 4393.0, 10170.399999999994, 13583.399999999987, 36197.899999999994, 81.34975513723704, 24.476218797284545, 32.09502058148805], "isController": false}, {"data": ["15 Login Request", 10000, 0, 0.0, 2535.714999999989, 5, 10419, 2213.0, 5480.0, 6330.899999999998, 7765.909999999998, 183.3483067783869, 93.46466419757614, 43.33036156286097], "isController": false}, {"data": ["21 Get Wallet Transactions Request", 10000, 2309, 23.09, 6117.626599999981, 1, 73479, 5098.5, 11030.999999999993, 14614.399999999987, 38936.729999999974, 80.59511432416967, 35.54338989095481, 32.19082202986855], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["504/Gateway Time-out", 8, 0.1264222503160556, 0.008], "isController": false}, {"data": ["Assertion failed", 6320, 99.87357774968395, 6.32], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 100000, 6328, "Assertion failed", 6320, "504/Gateway Time-out", 8, "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["23 Get Stock Portfolio Request", 10000, 722, "Assertion failed", 722, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["20 Get Stock Transactions Request", 10000, 2309, "Assertion failed", 2309, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["17 Add Money Request", 10000, 8, "504/Gateway Time-out", 8, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["18 Get Wallet Balance Request", 10000, 2, "Assertion failed", 2, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["22 Get Wallet Balance Request", 10000, 978, "Assertion failed", 978, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["21 Get Wallet Transactions Request", 10000, 2309, "Assertion failed", 2309, "", "", "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
