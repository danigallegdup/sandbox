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

    var data = {"OkPercent": 8.174117647058823, "KoPercent": 91.82588235294118};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.013091176470588235, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0, 500, 1500, "23 Get Stock Portfolio Request"], "isController": false}, {"data": [0.0, 500, 1500, "16 Get Stock Prices Request"], "isController": false}, {"data": [0.061294117647058825, 500, 1500, "14 Register Request"], "isController": false}, {"data": [0.019852941176470587, 500, 1500, "19 Place Stock Order Request"], "isController": false}, {"data": [0.0, 500, 1500, "20 Get Stock Transactions Request"], "isController": false}, {"data": [0.009058823529411765, 500, 1500, "17 Add Money Request"], "isController": false}, {"data": [0.0051764705882352945, 500, 1500, "18 Get Wallet Balance Request"], "isController": false}, {"data": [0.0, 500, 1500, "22 Get Wallet Balance Request"], "isController": false}, {"data": [0.035529411764705886, 500, 1500, "15 Login Request"], "isController": false}, {"data": [0.0, 500, 1500, "21 Get Wallet Transactions Request"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 170000, 156104, 91.82588235294118, 16478.877964705363, 3, 28288, 19999.0, 20004.0, 20021.0, 20606.0, 615.3177935427827, 1390.1614155872214, 24.52273282539453], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["23 Get Stock Portfolio Request", 17000, 17000, 100.0, 14521.610764705954, 3, 28260, 19987.0, 20479.0, 22154.949999999997, 24921.960000000006, 66.58989243773846, 140.19255969955228, 2.4740547295471105], "isController": false}, {"data": ["16 Get Stock Prices Request", 17000, 17000, 100.0, 16492.263058823537, 14, 28281, 20004.0, 22048.9, 24274.899999999998, 27205.950000000008, 95.7638575935106, 213.06377890519377, 6.084745732875168], "isController": false}, {"data": ["14 Register Request", 17000, 11183, 65.78235294117647, 14741.175176470568, 8, 25492, 19999.0, 20308.9, 23186.949999999997, 24934.950000000008, 132.6156486465403, 238.6710751009244, 12.322826163799828], "isController": false}, {"data": ["19 Place Stock Order Request", 17000, 16000, 94.11764705882354, 17547.393823529426, 26, 28283, 20005.0, 22679.9, 24425.949999999997, 27557.0, 71.15769382100073, 173.54331028076942, 2.0963928085209247], "isController": false}, {"data": ["20 Get Stock Transactions Request", 17000, 17000, 100.0, 17747.59817647064, 17, 28096, 20001.0, 20899.9, 23841.949999999997, 26052.720000000045, 66.31506678317314, 165.7759033477406, 0.6816570209126515], "isController": false}, {"data": ["17 Add Money Request", 17000, 15289, 89.93529411764706, 17330.947647058932, 17, 28288, 20005.0, 23177.0, 24736.0, 27486.99, 85.19253512939243, 197.36794608941207, 3.7429170002330268], "isController": false}, {"data": ["18 Get Wallet Balance Request", 17000, 15904, 93.55294117647058, 17327.537705882427, 36, 28279, 20003.0, 22513.8, 24436.949999999997, 27662.970000000005, 77.47875031333318, 185.3198597691589, 1.9999914545495978], "isController": false}, {"data": ["22 Get Wallet Balance Request", 17000, 17000, 100.0, 16566.655823529207, 36, 28285, 20001.0, 20642.9, 22770.0, 26853.87000000018, 65.68499793285449, 151.44460735222808, 1.4064845461553026], "isController": false}, {"data": ["15 Login Request", 17000, 12728, 74.87058823529412, 14997.51599999999, 9, 28263, 20001.0, 22349.0, 23197.0, 25232.950000000008, 108.00096565569292, 221.87774097119868, 6.8444557287365155], "isController": false}, {"data": ["21 Get Wallet Transactions Request", 17000, 17000, 100.0, 17516.08147058824, 32, 28273, 20001.0, 22850.0, 23828.899999999998, 26211.960000000006, 65.29521117239472, 160.32230118328366, 0.695299476966154], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["400/Bad Request", 6103, 3.909573105109414, 3.59], "isController": false}, {"data": ["Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 37318, 23.905857633372623, 21.951764705882354], "isController": false}, {"data": ["Non HTTP response code: java.io.InterruptedIOException/Non HTTP response message: Connection already shutdown", 5, 0.0032029928765438427, 0.0029411764705882353], "isController": false}, {"data": ["Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 108464, 69.48188387229027, 63.80235294117647], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:8080 failed to respond", 903, 0.578460513503818, 0.5311764705882352], "isController": false}, {"data": ["Assertion failed", 3311, 2.1210218828473324, 1.9476470588235295], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 170000, 156104, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 108464, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 37318, "400/Bad Request", 6103, "Assertion failed", 3311, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:8080 failed to respond", 903], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["23 Get Stock Portfolio Request", 17000, 17000, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 9609, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 3624, "400/Bad Request", 3464, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:8080 failed to respond", 295, "Assertion failed", 6], "isController": false}, {"data": ["16 Get Stock Prices Request", 17000, 17000, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 10881, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 3397, "Assertion failed", 2711, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:8080 failed to respond", 11, "", ""], "isController": false}, {"data": ["14 Register Request", 17000, 11183, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 10044, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 1131, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:8080 failed to respond", 7, "Non HTTP response code: java.io.InterruptedIOException/Non HTTP response message: Connection already shutdown", 1, "", ""], "isController": false}, {"data": ["19 Place Stock Order Request", 17000, 16000, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 11356, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 4583, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:8080 failed to respond", 58, "400/Bad Request", 3, "", ""], "isController": false}, {"data": ["20 Get Stock Transactions Request", 17000, 17000, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 12231, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 4259, "Assertion failed", 403, "400/Bad Request", 64, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:8080 failed to respond", 43], "isController": false}, {"data": ["17 Add Money Request", 17000, 15289, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 11051, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 4205, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:8080 failed to respond", 32, "Non HTTP response code: java.io.InterruptedIOException/Non HTTP response message: Connection already shutdown", 1, "", ""], "isController": false}, {"data": ["18 Get Wallet Balance Request", 17000, 15904, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 10697, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 5164, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:8080 failed to respond", 42, "Non HTTP response code: java.io.InterruptedIOException/Non HTTP response message: Connection already shutdown", 1, "", ""], "isController": false}, {"data": ["22 Get Wallet Balance Request", 17000, 17000, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 11165, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 3698, "400/Bad Request", 1924, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:8080 failed to respond", 172, "Assertion failed", 41], "isController": false}, {"data": ["15 Login Request", 17000, 12728, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 9685, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 3031, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:8080 failed to respond", 12, "", "", "", ""], "isController": false}, {"data": ["21 Get Wallet Transactions Request", 17000, 17000, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 11745, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 4226, "400/Bad Request", 648, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:8080 failed to respond", 231, "Assertion failed", 150], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
