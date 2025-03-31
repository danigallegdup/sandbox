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

    var data = {"OkPercent": 82.3064705882353, "KoPercent": 17.693529411764708};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.05419705882352941, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.11944117647058823, 500, 1500, "23 Get Stock Portfolio Request"], "isController": false}, {"data": [0.015823529411764705, 500, 1500, "16 Get Stock Prices Request"], "isController": false}, {"data": [0.08182352941176471, 500, 1500, "14 Register Request"], "isController": false}, {"data": [0.16217647058823528, 500, 1500, "19 Place Stock Order Request"], "isController": false}, {"data": [0.014852941176470588, 500, 1500, "20 Get Stock Transactions Request"], "isController": false}, {"data": [0.004264705882352941, 500, 1500, "17 Add Money Request"], "isController": false}, {"data": [0.0031176470588235292, 500, 1500, "18 Get Wallet Balance Request"], "isController": false}, {"data": [0.07173529411764706, 500, 1500, "22 Get Wallet Balance Request"], "isController": false}, {"data": [0.03458823529411765, 500, 1500, "15 Login Request"], "isController": false}, {"data": [0.03414705882352941, 500, 1500, "21 Get Wallet Transactions Request"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 170000, 30079, 17.693529411764708, 16045.095394117849, 1, 83061, 4222.0, 44271.700000000004, 60461.9, 66538.86000000002, 658.0195160847064, 323.6118849997194, 249.720001507155], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["23 Get Stock Portfolio Request", 17000, 5142, 30.24705882352941, 11536.114470588218, 2, 80322, 5702.0, 34618.49999999999, 43892.499999999985, 71233.88000000002, 75.64195547803492, 29.400335188415212, 29.855820731902664], "isController": false}, {"data": ["16 Get Stock Prices Request", 17000, 620, 3.6470588235294117, 20692.13588235296, 24, 80321, 16098.0, 41067.0, 69964.74999999993, 80001.0, 75.75217453301013, 40.4445028638221, 29.208598999737095], "isController": false}, {"data": ["14 Register Request", 17000, 34, 0.2, 8322.569176470575, 12, 80109, 6972.0, 16274.899999999996, 19264.899999999998, 26745.200000000288, 108.07992828578875, 30.776101054335594, 29.284532232454495], "isController": false}, {"data": ["19 Place Stock Order Request", 17000, 328, 1.9294117647058824, 6436.949352941212, 2, 80147, 3637.0, 16143.8, 20684.699999999993, 31431.3700000001, 69.04843138210589, 58.8741719899961, 36.01219193483859], "isController": false}, {"data": ["20 Get Stock Transactions Request", 17000, 6967, 40.98235294117647, 20772.746529411776, 3, 80469, 14980.0, 43840.6, 60463.74999999999, 80001.0, 69.08799778918407, 48.055572118471694, 27.24804756556248], "isController": false}, {"data": ["17 Add Money Request", 17000, 1283, 7.547058823529412, 22804.947882352935, 31, 80342, 17175.0, 49276.6, 71769.09999999989, 80001.0, 68.82507499908908, 25.853624658657992, 28.824157278707144], "isController": false}, {"data": ["18 Get Wallet Balance Request", 17000, 2556, 15.035294117647059, 26784.81400000005, 5, 82343, 19918.0, 62667.9, 80000.0, 80004.0, 68.87163946912119, 31.524180971880114, 25.584500564139752], "isController": false}, {"data": ["22 Get Wallet Balance Request", 17000, 5549, 32.641176470588235, 15366.835882352956, 1, 82889, 8206.0, 41430.8, 54281.499999999985, 80000.0, 72.35551242599522, 25.01799078584471, 28.310174914131032], "isController": false}, {"data": ["15 Login Request", 17000, 30, 0.17647058823529413, 9372.736705882364, 10, 34583, 7302.5, 18389.0, 26008.699999999928, 33504.97, 107.17235205487225, 55.46785484489955, 26.99929382482364], "isController": false}, {"data": ["21 Get Wallet Transactions Request", 17000, 7570, 44.529411764705884, 18361.10405882353, 2, 83061, 11855.5, 43166.899999999994, 60193.74999999999, 80001.0, 70.28859670883983, 32.73495966158108, 27.71988362973414], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["400/Bad Request", 250, 0.8311446524153063, 0.14705882352941177], "isController": false}, {"data": ["502/Bad Gateway", 3246, 10.791582166960337, 1.9094117647058824], "isController": false}, {"data": ["504/Gateway Time-out", 67, 0.2227467668473021, 0.039411764705882354], "isController": false}, {"data": ["Non HTTP response code: java.io.InterruptedIOException/Non HTTP response message: Connection has been shut down", 1, 0.0033245786096612255, 5.88235294117647E-4], "isController": false}, {"data": ["Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 3069, 10.2031317530503, 1.8052941176470587], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:8080 failed to respond", 1171, 3.893081551913295, 0.6888235294117647], "isController": false}, {"data": ["Assertion failed", 22275, 74.0549885302038, 13.102941176470589], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 170000, 30079, "Assertion failed", 22275, "502/Bad Gateway", 3246, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 3069, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:8080 failed to respond", 1171, "400/Bad Request", 250], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["23 Get Stock Portfolio Request", 17000, 5142, "Assertion failed", 4306, "502/Bad Gateway", 540, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:8080 failed to respond", 138, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 128, "400/Bad Request", 30], "isController": false}, {"data": ["16 Get Stock Prices Request", 17000, 620, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 532, "502/Bad Gateway", 59, "400/Bad Request", 29, "", "", "", ""], "isController": false}, {"data": ["14 Register Request", 17000, 34, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 29, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:8080 failed to respond", 5, "", "", "", "", "", ""], "isController": false}, {"data": ["19 Place Stock Order Request", 17000, 328, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:8080 failed to respond", 278, "400/Bad Request", 30, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 20, "", "", "", ""], "isController": false}, {"data": ["20 Get Stock Transactions Request", 17000, 6967, "Assertion failed", 6002, "502/Bad Gateway", 536, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 335, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:8080 failed to respond", 65, "400/Bad Request", 29], "isController": false}, {"data": ["17 Add Money Request", 17000, 1283, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 549, "502/Bad Gateway", 514, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:8080 failed to respond", 126, "504/Gateway Time-out", 67, "400/Bad Request", 27], "isController": false}, {"data": ["18 Get Wallet Balance Request", 17000, 2556, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 975, "Assertion failed", 918, "502/Bad Gateway", 399, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:8080 failed to respond", 235, "400/Bad Request", 28], "isController": false}, {"data": ["22 Get Wallet Balance Request", 17000, 5549, "Assertion failed", 4504, "502/Bad Gateway", 644, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 208, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:8080 failed to respond", 163, "400/Bad Request", 30], "isController": false}, {"data": ["15 Login Request", 17000, 30, "400/Bad Request", 17, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:8080 failed to respond", 13, "", "", "", "", "", ""], "isController": false}, {"data": ["21 Get Wallet Transactions Request", 17000, 7570, "Assertion failed", 6545, "502/Bad Gateway", 554, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 293, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:8080 failed to respond", 148, "400/Bad Request", 30], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
