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

    var data = {"OkPercent": 75.0, "KoPercent": 25.0};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.75, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.5, 500, 1500, "23 Get Stock Portfolio Request"], "isController": false}, {"data": [0.5, 500, 1500, "16 Get Stock Prices Request"], "isController": false}, {"data": [1.0, 500, 1500, "14 Register Request"], "isController": false}, {"data": [1.0, 500, 1500, "19 Place Stock Order Request"], "isController": false}, {"data": [0.5, 500, 1500, "20 Get Stock Transactions Request"], "isController": false}, {"data": [1.0, 500, 1500, "17 Add Money Request"], "isController": false}, {"data": [1.0, 500, 1500, "18 Get Wallet Balance Request"], "isController": false}, {"data": [0.5, 500, 1500, "22 Get Wallet Balance Request"], "isController": false}, {"data": [1.0, 500, 1500, "15 Login Request"], "isController": false}, {"data": [0.5, 500, 1500, "21 Get Wallet Transactions Request"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 10000, 2500, 25.0, 5.440800000000003, 2, 68, 5.0, 8.0, 9.0, 14.0, 185.6114039646596, 79.92756949987007, 72.04077055994321], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["23 Get Stock Portfolio Request", 1000, 500, 50.0, 5.5199999999999925, 2, 37, 5.0, 8.0, 9.0, 12.990000000000009, 22.38989767816761, 7.7293250285471204, 8.962977779425923], "isController": false}, {"data": ["16 Get Stock Prices Request", 1000, 500, 50.0, 5.254999999999996, 2, 33, 5.0, 8.0, 9.949999999999932, 14.990000000000009, 22.378874342620566, 10.468242978628174, 8.893001881224125], "isController": false}, {"data": ["14 Register Request", 1000, 0, 0.0, 6.460000000000003, 3, 68, 6.0, 9.0, 10.0, 24.980000000000018, 22.31644722160232, 6.254707375585807, 6.139877922059807], "isController": false}, {"data": ["19 Place Stock Order Request", 1000, 0, 0.0, 6.729000000000007, 3, 37, 6.0, 10.0, 11.0, 16.99000000000001, 22.38989767816761, 18.354053026274546, 11.608659048037527], "isController": false}, {"data": ["20 Get Stock Transactions Request", 1000, 500, 50.0, 5.880999999999994, 3, 24, 5.0, 8.0, 9.0, 12.990000000000009, 22.390900338102597, 13.347425606233626, 9.028977498544592], "isController": false}, {"data": ["17 Add Money Request", 1000, 0, 0.0, 5.154999999999997, 2, 38, 4.0, 8.0, 9.0, 16.0, 22.384885725158373, 6.426910549996642, 9.747940065867526], "isController": false}, {"data": ["18 Get Wallet Balance Request", 1000, 0, 0.0, 4.582000000000001, 2, 18, 4.0, 7.0, 8.0, 11.0, 22.390398996910125, 6.756477822309794, 8.941312840054184], "isController": false}, {"data": ["22 Get Wallet Balance Request", 1000, 500, 50.0, 4.621999999999999, 2, 14, 4.0, 7.0, 8.0, 11.0, 22.391903087843435, 6.745998147070019, 8.941913479085963], "isController": false}, {"data": ["15 Login Request", 1000, 0, 0.0, 5.562000000000005, 3, 24, 5.0, 8.0, 9.0, 14.0, 22.369863320135114, 11.527666802283962, 5.555765273024181], "isController": false}, {"data": ["21 Get Wallet Transactions Request", 1000, 500, 50.0, 4.642, 2, 26, 4.0, 7.0, 8.0, 11.990000000000009, 22.39390885679095, 8.769489698801925, 9.052059714757586], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Assertion failed", 2500, 100.0, 25.0], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 10000, 2500, "Assertion failed", 2500, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["23 Get Stock Portfolio Request", 1000, 500, "Assertion failed", 500, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["16 Get Stock Prices Request", 1000, 500, "Assertion failed", 500, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["20 Get Stock Transactions Request", 1000, 500, "Assertion failed", 500, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["22 Get Wallet Balance Request", 1000, 500, "Assertion failed", 500, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["21 Get Wallet Transactions Request", 1000, 500, "Assertion failed", 500, "", "", "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
