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

    var data = {"OkPercent": 63.612941176470585, "KoPercent": 36.387058823529415};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.05176470588235294, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.06464705882352942, 500, 1500, "23 Get Stock Portfolio Request"], "isController": false}, {"data": [0.01338235294117647, 500, 1500, "16 Get Stock Prices Request"], "isController": false}, {"data": [0.09482352941176471, 500, 1500, "14 Register Request"], "isController": false}, {"data": [0.18908823529411764, 500, 1500, "19 Place Stock Order Request"], "isController": false}, {"data": [0.010970588235294117, 500, 1500, "20 Get Stock Transactions Request"], "isController": false}, {"data": [0.01526470588235294, 500, 1500, "17 Add Money Request"], "isController": false}, {"data": [0.008323529411764705, 500, 1500, "18 Get Wallet Balance Request"], "isController": false}, {"data": [0.03267647058823529, 500, 1500, "22 Get Wallet Balance Request"], "isController": false}, {"data": [0.06155882352941176, 500, 1500, "15 Login Request"], "isController": false}, {"data": [0.026911764705882354, 500, 1500, "21 Get Wallet Transactions Request"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 170000, 61858, 36.387058823529415, 15751.354858823606, 1, 82479, 3826.5, 36479.9, 44125.200000000026, 72354.45000000024, 658.1876609172039, 314.7177158347368, 247.89044200205197], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["23 Get Stock Portfolio Request", 17000, 10982, 64.6, 11139.551941176462, 1, 80153, 5490.5, 31314.799999999985, 40239.649999999994, 70987.69000000005, 69.20443396879287, 25.311322952159383, 27.401723820115286], "isController": false}, {"data": ["16 Get Stock Prices Request", 17000, 8720, 51.294117647058826, 19765.156470588256, 40, 82211, 13880.5, 45610.9, 70573.94999999998, 80001.0, 77.61174950579577, 40.51762221853186, 30.12074636965335], "isController": false}, {"data": ["14 Register Request", 17000, 2000, 11.764705882352942, 9325.346235294135, 4, 80184, 8017.0, 17109.699999999997, 20286.59999999999, 42904.600000000064, 108.57971347729726, 33.67520474461413, 29.111557222706573], "isController": false}, {"data": ["19 Place Stock Order Request", 17000, 922, 5.423529411764706, 10066.048588235259, 4, 80190, 5077.5, 25375.9, 43120.59999999999, 80000.0, 68.75910046917974, 61.32988268610459, 33.80488957465418], "isController": false}, {"data": ["20 Get Stock Transactions Request", 17000, 11604, 68.25882352941177, 20056.586999999974, 3, 82479, 15294.5, 42789.49999999999, 55036.54999999997, 80000.0, 68.91966399636752, 40.01908102342661, 27.044083278518553], "isController": false}, {"data": ["17 Add Money Request", 17000, 821, 4.829411764705882, 20777.40417647059, 18, 82138, 15178.5, 46877.1, 66468.09999999998, 80001.0, 70.10135831690762, 25.00678704212473, 29.568453332082505], "isController": false}, {"data": ["18 Get Wallet Balance Request", 17000, 3590, 21.11764705882353, 25158.614117647103, 3, 81982, 17457.5, 59422.5, 77219.7, 80002.0, 68.61146537946176, 31.076335111009318, 25.462212203911257], "isController": false}, {"data": ["22 Get Wallet Balance Request", 17000, 11561, 68.00588235294117, 14613.807235294176, 1, 82413, 8976.0, 36876.0, 46062.54999999997, 80000.0, 69.16839248587134, 23.734211265445914, 27.115515760984554], "isController": false}, {"data": ["15 Login Request", 17000, 17, 0.1, 8842.274235294135, 9, 80000, 8335.0, 15998.0, 18110.949999999997, 22719.720000000045, 92.43450743282186, 47.893924775982256, 23.282095546355908], "isController": false}, {"data": ["21 Get Wallet Transactions Request", 17000, 11641, 68.47647058823529, 17768.758588235418, 1, 82421, 12564.0, 41214.899999999994, 54075.74999999993, 80001.0, 69.01087124195212, 30.37088839825768, 27.138739189142562], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["400/Bad Request", 1920, 3.103883087070387, 1.1294117647058823], "isController": false}, {"data": ["502/Bad Gateway", 240, 0.3879853858837984, 0.1411764705882353], "isController": false}, {"data": ["504/Gateway Time-out", 72, 0.11639561576513952, 0.042352941176470586], "isController": false}, {"data": ["Non HTTP response code: java.io.InterruptedIOException/Non HTTP response message: Connection has been shut down", 9, 0.01454945197064244, 0.005294117647058823], "isController": false}, {"data": ["Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 2726, 4.406867341330143, 1.6035294117647059], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:8080 failed to respond", 2184, 3.5306670115425653, 1.2847058823529411], "isController": false}, {"data": ["Assertion failed", 54707, 88.43965210643732, 32.18058823529412], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 170000, 61858, "Assertion failed", 54707, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 2726, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:8080 failed to respond", 2184, "400/Bad Request", 1920, "502/Bad Gateway", 240], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["23 Get Stock Portfolio Request", 17000, 10982, "Assertion failed", 10740, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 119, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:8080 failed to respond", 101, "400/Bad Request", 17, "502/Bad Gateway", 5], "isController": false}, {"data": ["16 Get Stock Prices Request", 17000, 8720, "Assertion failed", 8272, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 431, "400/Bad Request", 15, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:8080 failed to respond", 2, "", ""], "isController": false}, {"data": ["14 Register Request", 17000, 2000, "400/Bad Request", 1787, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 118, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:8080 failed to respond", 95, "", "", "", ""], "isController": false}, {"data": ["19 Place Stock Order Request", 17000, 922, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:8080 failed to respond", 678, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 227, "400/Bad Request", 17, "", "", "", ""], "isController": false}, {"data": ["20 Get Stock Transactions Request", 17000, 11604, "Assertion failed", 11055, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 245, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:8080 failed to respond", 241, "502/Bad Gateway", 41, "400/Bad Request", 17], "isController": false}, {"data": ["17 Add Money Request", 17000, 821, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 338, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:8080 failed to respond", 226, "502/Bad Gateway", 168, "504/Gateway Time-out", 72, "400/Bad Request", 16], "isController": false}, {"data": ["18 Get Wallet Balance Request", 17000, 3590, "Assertion failed", 2325, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 770, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:8080 failed to respond", 462, "400/Bad Request", 17, "502/Bad Gateway", 14], "isController": false}, {"data": ["22 Get Wallet Balance Request", 17000, 11561, "Assertion failed", 11194, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 198, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:8080 failed to respond", 147, "400/Bad Request", 17, "502/Bad Gateway", 4], "isController": false}, {"data": ["15 Login Request", 17000, 17, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:8080 failed to respond", 16, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 1, "", "", "", "", "", ""], "isController": false}, {"data": ["21 Get Wallet Transactions Request", 17000, 11641, "Assertion failed", 11121, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 279, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:8080 failed to respond", 216, "400/Bad Request", 17, "502/Bad Gateway", 8], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
