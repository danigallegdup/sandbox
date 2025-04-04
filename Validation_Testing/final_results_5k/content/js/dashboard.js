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

    var data = {"OkPercent": 96.762, "KoPercent": 3.238};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.22562, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.4514, 500, 1500, "23 Get Stock Portfolio Request"], "isController": false}, {"data": [0.0872, 500, 1500, "16 Get Stock Prices Request"], "isController": false}, {"data": [0.2616, 500, 1500, "14 Register Request"], "isController": false}, {"data": [0.5617, 500, 1500, "19 Place Stock Order Request"], "isController": false}, {"data": [0.0752, 500, 1500, "20 Get Stock Transactions Request"], "isController": false}, {"data": [0.0584, 500, 1500, "17 Add Money Request"], "isController": false}, {"data": [0.0389, 500, 1500, "18 Get Wallet Balance Request"], "isController": false}, {"data": [0.3412, 500, 1500, "22 Get Wallet Balance Request"], "isController": false}, {"data": [0.1885, 500, 1500, "15 Login Request"], "isController": false}, {"data": [0.1921, 500, 1500, "21 Get Wallet Transactions Request"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 50000, 1619, 3.238, 3209.7801599999866, 2, 15487, 1822.0, 6388.0, 6978.950000000001, 8015.0, 891.8538073239035, 408.557062060762, 341.5628853087152], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["23 Get Stock Portfolio Request", 5000, 27, 0.54, 1861.5995999999961, 2, 9923, 1186.0, 5030.0, 6167.749999999999, 7326.9299999999985, 145.53075064761185, 54.80838716455162, 57.55854884011992], "isController": false}, {"data": ["16 Get Stock Prices Request", 5000, 0, 0.0, 4218.2890000000025, 18, 9334, 4517.0, 6341.800000000001, 6758.95, 7518.619999999992, 155.41464627626507, 72.6988433264951, 61.01239043267438], "isController": false}, {"data": ["14 Register Request", 5000, 0, 0.0, 3387.344600000004, 5, 10572, 3076.0, 7121.900000000001, 8199.9, 9680.349999999986, 230.2131774022745, 64.5226385883328, 60.4137380433031], "isController": false}, {"data": ["19 Place Stock Order Request", 5000, 0, 0.0, 1088.3918000000003, 5, 5617, 689.0, 2757.9000000000005, 3279.95, 4355.9299999999985, 115.6925355176084, 95.58191899208663, 60.783773543430975], "isController": false}, {"data": ["20 Get Stock Transactions Request", 5000, 756, 15.12, 3697.862999999988, 5, 11820, 3865.0, 6519.800000000001, 6989.95, 7780.939999999999, 110.4728236853734, 85.9885936809545, 44.016515687140966], "isController": false}, {"data": ["17 Add Money Request", 5000, 0, 0.0, 4405.281600000014, 17, 14533, 4533.5, 6432.600000000002, 6943.95, 8286.829999999996, 124.50819263907566, 35.74746937098461, 53.62120405647691], "isController": false}, {"data": ["18 Get Wallet Balance Request", 5000, 0, 0.0, 4720.001800000002, 13, 15487, 4785.0, 6955.700000000002, 7401.849999999999, 8529.899999999998, 115.48410938654841, 34.84823222699556, 45.56209003141168], "isController": false}, {"data": ["22 Get Wallet Balance Request", 5000, 80, 1.6, 2354.194199999999, 2, 14528, 1677.0, 5607.700000000002, 6465.0, 7418.859999999997, 131.1441011383308, 39.44773579709385, 51.740446152232074], "isController": false}, {"data": ["15 Login Request", 5000, 0, 0.0, 3324.4166000000023, 15, 11573, 3122.0, 6385.900000000001, 7641.799999999999, 9636.869999999997, 212.58503401360542, 108.36854272959184, 50.2398224914966], "isController": false}, {"data": ["21 Get Wallet Transactions Request", 5000, 756, 15.12, 3040.4194000000034, 2, 11404, 2656.0, 6222.900000000001, 6749.0, 7500.969999999999, 116.71880106447546, 52.79884390027546, 46.61913050329147], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Assertion failed", 1619, 100.0, 3.238], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 50000, 1619, "Assertion failed", 1619, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["23 Get Stock Portfolio Request", 5000, 27, "Assertion failed", 27, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["20 Get Stock Transactions Request", 5000, 756, "Assertion failed", 756, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["22 Get Wallet Balance Request", 5000, 80, "Assertion failed", 80, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["21 Get Wallet Transactions Request", 5000, 756, "Assertion failed", 756, "", "", "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
