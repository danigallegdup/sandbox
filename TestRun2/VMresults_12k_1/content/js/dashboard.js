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

    var data = {"OkPercent": 72.423, "KoPercent": 27.577};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.123575, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.12525, 500, 1500, "23 Get Stock Portfolio Request"], "isController": false}, {"data": [0.0227, 500, 1500, "16 Get Stock Prices Request"], "isController": false}, {"data": [0.11405, 500, 1500, "14 Register Request"], "isController": false}, {"data": [0.53675, 500, 1500, "19 Place Stock Order Request"], "isController": false}, {"data": [0.0433, 500, 1500, "20 Get Stock Transactions Request"], "isController": false}, {"data": [0.061, 500, 1500, "17 Add Money Request"], "isController": false}, {"data": [0.08185, 500, 1500, "18 Get Wallet Balance Request"], "isController": false}, {"data": [0.10635, 500, 1500, "22 Get Wallet Balance Request"], "isController": false}, {"data": [0.07285, 500, 1500, "15 Login Request"], "isController": false}, {"data": [0.07165, 500, 1500, "21 Get Wallet Transactions Request"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 100000, 27577, 27.577, 7307.838070000042, 1, 74968, 1491.0, 23490.300000000025, 60630.9, 63121.97, 811.839872703508, 343.00974315669725, 309.96577524111643], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["23 Get Stock Portfolio Request", 10000, 5058, 50.58, 4574.65869999999, 1, 72923, 3155.0, 9374.8, 11829.849999999997, 31115.00999999972, 92.79278443308249, 31.99928361070643, 36.70027118691251], "isController": false}, {"data": ["16 Get Stock Prices Request", 10000, 5000, 50.0, 12039.858000000004, 22, 74968, 8525.0, 19293.599999999973, 59730.0, 62946.99, 84.94372478233171, 39.73441813548524, 33.347048205563816], "isController": false}, {"data": ["14 Register Request", 10000, 0, 0.0, 7480.404200000022, 4, 28115, 7550.5, 13676.699999999999, 15068.949999999999, 17064.739999999994, 205.3725457980777, 57.56046937895342, 53.89003680019305], "isController": false}, {"data": ["19 Place Stock Order Request", 10000, 0, 0.0, 1367.4031999999963, 4, 8201, 794.0, 3586.8999999999996, 4678.849999999997, 6595.639999999992, 85.72432770695995, 69.86030417134579, 44.03417614634857], "isController": false}, {"data": ["20 Get Stock Transactions Request", 10000, 6197, 61.97, 7782.836400000024, 2, 67506, 6420.5, 12935.8, 17296.899999999998, 60569.92, 86.21432882145012, 45.72749065113372, 34.351021639796535], "isController": false}, {"data": ["17 Add Money Request", 10000, 3, 0.03, 10375.308299999979, 6, 72712, 7739.0, 16194.699999999999, 35696.849999999955, 62249.62999999999, 85.00148752603171, 24.40559555495346, 36.60708593650389], "isController": false}, {"data": ["18 Get Wallet Balance Request", 10000, 2, 0.02, 9438.764800000003, 2, 70226, 7189.5, 15022.0, 25965.249999999985, 62178.97, 85.31913622906481, 25.74564925729692, 33.66106546537323], "isController": false}, {"data": ["22 Get Wallet Balance Request", 10000, 5120, 51.2, 5588.531999999979, 2, 67678, 4472.0, 10721.9, 13706.099999999959, 38157.429999999986, 90.61089867889311, 27.299364817600264, 35.74883111940704], "isController": false}, {"data": ["15 Login Request", 10000, 0, 0.0, 7953.08210000001, 10, 28194, 8117.0, 13907.599999999999, 15263.349999999986, 17914.659999999993, 198.58212363723018, 101.23034036975992, 46.93054093770479], "isController": false}, {"data": ["21 Get Wallet Transactions Request", 10000, 6197, 61.97, 6477.532999999987, 1, 64873, 5610.5, 11825.0, 14861.149999999981, 41863.66999999999, 88.82888004548039, 34.37139826650441, 35.479503846290505], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["504/Gateway Time-out", 3, 0.01087863074301048, 0.003], "isController": false}, {"data": ["Assertion failed", 27574, 99.98912136925699, 27.574], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 100000, 27577, "Assertion failed", 27574, "504/Gateway Time-out", 3, "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["23 Get Stock Portfolio Request", 10000, 5058, "Assertion failed", 5058, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["16 Get Stock Prices Request", 10000, 5000, "Assertion failed", 5000, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["20 Get Stock Transactions Request", 10000, 6197, "Assertion failed", 6197, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["17 Add Money Request", 10000, 3, "504/Gateway Time-out", 3, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["18 Get Wallet Balance Request", 10000, 2, "Assertion failed", 2, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["22 Get Wallet Balance Request", 10000, 5120, "Assertion failed", 5120, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["21 Get Wallet Transactions Request", 10000, 6197, "Assertion failed", 6197, "", "", "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
