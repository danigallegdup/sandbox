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

    var data = {"OkPercent": 88.49583333333334, "KoPercent": 11.504166666666666};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.16141666666666668, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.29475, 500, 1500, "23 Get Stock Portfolio Request"], "isController": false}, {"data": [0.024958333333333332, 500, 1500, "16 Get Stock Prices Request"], "isController": false}, {"data": [0.10916666666666666, 500, 1500, "14 Register Request"], "isController": false}, {"data": [0.5710416666666667, 500, 1500, "19 Place Stock Order Request"], "isController": false}, {"data": [0.1075, 500, 1500, "20 Get Stock Transactions Request"], "isController": false}, {"data": [0.028291666666666666, 500, 1500, "17 Add Money Request"], "isController": false}, {"data": [0.04620833333333333, 500, 1500, "18 Get Wallet Balance Request"], "isController": false}, {"data": [0.21216666666666667, 500, 1500, "22 Get Wallet Balance Request"], "isController": false}, {"data": [0.07908333333333334, 500, 1500, "15 Login Request"], "isController": false}, {"data": [0.141, 500, 1500, "21 Get Wallet Transactions Request"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 120000, 13805, 11.504166666666666, 9112.568691666822, 0, 80122, 58.5, 28362.100000000028, 37192.70000000002, 80001.0, 736.2189024203196, 338.05176874674066, 285.9790860628393], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["23 Get Stock Portfolio Request", 12000, 2920, 24.333333333333332, 5840.31508333332, 0, 80016, 777.0, 15518.9, 21491.54999999999, 36747.36999999999, 90.09009009009009, 32.70467488973349, 36.117020340653156], "isController": false}, {"data": ["16 Get Stock Prices Request", 12000, 275, 2.2916666666666665, 15159.356250000044, 34, 80085, 10271.0, 32361.99999999998, 65158.04999999996, 80001.0, 88.99304371041664, 45.171574069095676, 34.78741554930956], "isController": false}, {"data": ["14 Register Request", 12000, 0, 0.0, 7984.564666666665, 8, 40220, 7226.0, 16014.9, 18766.85, 24016.89, 167.80869808418402, 47.03232065445392, 45.55883246224304], "isController": false}, {"data": ["19 Place Stock Order Request", 12000, 0, 0.0, 1449.1385833333343, 4, 13795, 620.0, 4077.7999999999993, 5416.949999999999, 7959.949999999999, 80.01546965746711, 66.57537123843943, 42.5082182555294], "isController": false}, {"data": ["20 Get Stock Transactions Request", 12000, 3179, 26.491666666666667, 10053.5666666667, 1, 80122, 8432.0, 17236.899999999994, 26355.899999999932, 63309.93, 80.16353360856147, 58.30161759155344, 32.326140639404386], "isController": false}, {"data": ["17 Add Money Request", 12000, 458, 3.816666666666667, 13713.636666666634, 3, 80010, 9201.0, 26458.59999999999, 60037.0, 79264.95999999998, 82.81230590865803, 25.621135425724262, 35.81211699308517], "isController": false}, {"data": ["18 Get Wallet Balance Request", 12000, 756, 6.3, 11574.866749999941, 0, 80010, 8865.0, 18674.799999999996, 35771.299999999945, 69910.62999999998, 79.3729536660383, 24.847590751810696, 31.626582291563317], "isController": false}, {"data": ["22 Get Wallet Balance Request", 12000, 2679, 22.325, 7974.672583333312, 0, 80005, 6229.5, 18133.399999999998, 25238.54999999999, 60650.18999999996, 85.72408275231454, 26.323704572933334, 34.24017153299663], "isController": false}, {"data": ["15 Login Request", 12000, 0, 0.0, 7894.9349166666625, 7, 41779, 7293.5, 15530.0, 18032.899999999998, 22289.709999999992, 169.75286811616755, 87.69459690766858, 42.79729794545982], "isController": false}, {"data": ["21 Get Wallet Transactions Request", 12000, 3538, 29.483333333333334, 9480.634750000025, 0, 80005, 7742.0, 18768.0, 28980.599999999926, 62104.379999999874, 82.75747920718335, 36.03430227471, 33.449969655590955], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["504/Gateway Time-out", 56, 0.4056501267656646, 0.04666666666666667], "isController": false}, {"data": ["502/Bad Gateway", 5865, 42.4846070264397, 4.8875], "isController": false}, {"data": ["Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 503, 3.643607388627309, 0.4191666666666667], "isController": false}, {"data": ["Assertion failed", 7381, 53.46613545816733, 6.150833333333333], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 120000, 13805, "Assertion failed", 7381, "502/Bad Gateway", 5865, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 503, "504/Gateway Time-out", 56, "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["23 Get Stock Portfolio Request", 12000, 2920, "502/Bad Gateway", 2037, "Assertion failed", 869, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 14, "", "", "", ""], "isController": false}, {"data": ["16 Get Stock Prices Request", 12000, 275, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 227, "502/Bad Gateway", 48, "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["20 Get Stock Transactions Request", 12000, 3179, "Assertion failed", 2568, "502/Bad Gateway", 580, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 31, "", "", "", ""], "isController": false}, {"data": ["17 Add Money Request", 12000, 458, "502/Bad Gateway", 290, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 112, "504/Gateway Time-out", 56, "", "", "", ""], "isController": false}, {"data": ["18 Get Wallet Balance Request", 12000, 756, "502/Bad Gateway", 517, "Assertion failed", 181, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 58, "", "", "", ""], "isController": false}, {"data": ["22 Get Wallet Balance Request", 12000, 2679, "502/Bad Gateway", 1476, "Assertion failed", 1174, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 29, "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["21 Get Wallet Transactions Request", 12000, 3538, "Assertion failed", 2589, "502/Bad Gateway", 917, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 32, "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
