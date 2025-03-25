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

    var data = {"OkPercent": 58.03, "KoPercent": 41.97};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.4505, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.08, 500, 1500, "23 Get Stock Portfolio Request"], "isController": false}, {"data": [0.28, 500, 1500, "16 Get Stock Prices Request"], "isController": false}, {"data": [0.972, 500, 1500, "14 Register Request"], "isController": false}, {"data": [0.96, 500, 1500, "19 Place Stock Order Request"], "isController": false}, {"data": [0.023, 500, 1500, "20 Get Stock Transactions Request"], "isController": false}, {"data": [0.5495, 500, 1500, "17 Add Money Request"], "isController": false}, {"data": [0.576, 500, 1500, "18 Get Wallet Balance Request"], "isController": false}, {"data": [0.0675, 500, 1500, "22 Get Wallet Balance Request"], "isController": false}, {"data": [0.967, 500, 1500, "15 Login Request"], "isController": false}, {"data": [0.03, 500, 1500, "21 Get Wallet Transactions Request"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 10000, 4197, 41.97, 654.3910999999994, 3, 3452, 279.0, 2035.0, 2337.0, 2845.99, 410.49218012396864, 154.09724110771313, 159.32303906602766], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["23 Get Stock Portfolio Request", 1000, 905, 90.5, 650.199000000001, 3, 3247, 321.5, 1957.6, 2328.0999999999985, 2878.9500000000007, 52.01560468140442, 15.400225536410922, 20.822547545513654], "isController": false}, {"data": ["16 Get Stock Prices Request", 1000, 500, 50.0, 1007.1110000000011, 4, 3452, 764.5, 2366.9, 2586.85, 3050.95, 55.657594478766626, 24.730669421717597, 22.117425784076364], "isController": false}, {"data": ["14 Register Request", 1000, 0, 0.0, 138.77200000000005, 4, 999, 75.5, 358.5999999999999, 550.4999999999993, 799.8800000000001, 64.88871585231328, 16.665754169099994, 17.852698052527415], "isController": false}, {"data": ["19 Place Stock Order Request", 1000, 0, 0.0, 194.9599999999996, 11, 1343, 125.5, 458.5999999999999, 575.8999999999999, 849.9100000000001, 51.37162231583273, 40.9077144925768, 26.635032315961162], "isController": false}, {"data": ["20 Get Stock Transactions Request", 1000, 943, 94.3, 902.3860000000005, 7, 3419, 628.5, 2229.7, 2480.449999999998, 2964.6600000000003, 51.39010226630351, 17.270236057222878, 20.72270743935968], "isController": false}, {"data": ["17 Add Money Request", 1000, 0, 0.0, 1007.6890000000006, 4, 3340, 827.0, 2270.8, 2536.8999999999996, 2995.99, 52.113189848350615, 13.740782479545572, 22.693716533560895], "isController": false}, {"data": ["18 Get Wallet Balance Request", 1000, 0, 0.0, 953.6609999999995, 5, 3334, 666.5, 2256.7, 2530.0, 2991.94, 51.46415521589213, 14.323519762235602, 20.551536928747876], "isController": false}, {"data": ["22 Get Wallet Balance Request", 1000, 906, 90.6, 724.864, 4, 3369, 383.5, 2073.6, 2310.7499999999995, 2809.6600000000003, 51.73038125290983, 14.392867188712431, 20.657850812813617], "isController": false}, {"data": ["15 Login Request", 1000, 0, 0.0, 149.77799999999982, 3, 890, 76.0, 400.79999999999995, 586.7499999999997, 769.9100000000001, 65.08721687060662, 32.01534685384665, 16.165020502473315], "isController": false}, {"data": ["21 Get Wallet Transactions Request", 1000, 943, 94.3, 814.4910000000006, 4, 3131, 496.0, 2107.3999999999996, 2382.0, 2898.82, 51.546391752577314, 16.095159471649485, 20.836068379510312], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Assertion failed", 4197, 100.0, 41.97], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 10000, 4197, "Assertion failed", 4197, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["23 Get Stock Portfolio Request", 1000, 905, "Assertion failed", 905, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["16 Get Stock Prices Request", 1000, 500, "Assertion failed", 500, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["20 Get Stock Transactions Request", 1000, 943, "Assertion failed", 943, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["22 Get Wallet Balance Request", 1000, 906, "Assertion failed", 906, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["21 Get Wallet Transactions Request", 1000, 943, "Assertion failed", 943, "", "", "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
