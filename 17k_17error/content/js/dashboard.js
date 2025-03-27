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

    var data = {"OkPercent": 82.85882352941177, "KoPercent": 17.141176470588235};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.05551470588235294, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.13876470588235293, 500, 1500, "23 Get Stock Portfolio Request"], "isController": false}, {"data": [0.028676470588235293, 500, 1500, "16 Get Stock Prices Request"], "isController": false}, {"data": [0.08411764705882353, 500, 1500, "14 Register Request"], "isController": false}, {"data": [0.08926470588235294, 500, 1500, "19 Place Stock Order Request"], "isController": false}, {"data": [0.012294117647058823, 500, 1500, "20 Get Stock Transactions Request"], "isController": false}, {"data": [0.017588235294117648, 500, 1500, "17 Add Money Request"], "isController": false}, {"data": [0.010941176470588235, 500, 1500, "18 Get Wallet Balance Request"], "isController": false}, {"data": [0.08229411764705882, 500, 1500, "22 Get Wallet Balance Request"], "isController": false}, {"data": [0.055058823529411764, 500, 1500, "15 Login Request"], "isController": false}, {"data": [0.036147058823529414, 500, 1500, "21 Get Wallet Transactions Request"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 170000, 29140, 17.141176470588235, 15998.809341176418, 2, 80427, 4592.5, 37256.700000000004, 56916.200000000026, 79539.89000000001, 649.539209243325, 309.22078966057757, 247.94481361448513], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["23 Get Stock Portfolio Request", 17000, 4883, 28.723529411764705, 12006.012882352843, 2, 80415, 8271.0, 29038.799999999996, 39492.59999999999, 66788.4200000001, 69.13604346623721, 26.097629211960943, 27.484508252098482], "isController": false}, {"data": ["16 Get Stock Prices Request", 17000, 675, 3.9705882352941178, 19239.25223529415, 25, 80164, 15597.0, 37923.49999999999, 62117.29999999999, 80000.0, 88.98147615034729, 44.29608598456695, 34.890470999890084], "isController": false}, {"data": ["14 Register Request", 17000, 0, 0.0, 7985.146882352931, 5, 48240, 7121.0, 14886.9, 18960.59999999999, 33108.58000000007, 135.60836304751876, 38.00742206507606, 36.8169383071689], "isController": false}, {"data": ["19 Place Stock Order Request", 17000, 733, 4.311764705882353, 15699.133764705883, 5, 80427, 9861.0, 33187.0, 44627.95, 80000.0, 67.66788601543624, 60.32956266270146, 34.39854693165942], "isController": false}, {"data": ["20 Get Stock Transactions Request", 17000, 7249, 42.641176470588235, 18858.568235293988, 3, 80291, 15360.0, 36508.9, 49617.799999999996, 79999.0, 67.78795926342401, 45.66274895252649, 26.892185929911236], "isController": false}, {"data": ["17 Add Money Request", 17000, 768, 4.517647058823529, 21204.321058823636, 17, 80419, 17296.5, 40711.79999999999, 61835.799999999996, 80001.0, 71.1145320454631, 24.042851832611035, 30.32734123680721], "isController": false}, {"data": ["18 Get Wallet Balance Request", 17000, 1899, 11.170588235294117, 24496.136470588222, 5, 80424, 19473.5, 49028.8, 69619.69999999992, 80001.0, 67.61136984612448, 27.287708843318605, 25.746074066267095], "isController": false}, {"data": ["22 Get Wallet Balance Request", 17000, 5329, 31.347058823529412, 15314.70829411765, 2, 80424, 11522.5, 35739.2, 46611.84999999998, 74408.98000000001, 68.63140896245459, 22.70762499369197, 27.059099969721437], "isController": false}, {"data": ["15 Login Request", 17000, 0, 0.0, 7670.425470588243, 13, 41590, 7081.5, 14006.0, 16113.699999999993, 22722.87000000002, 131.69208840412426, 68.03233863845874, 33.20155903824106], "isController": false}, {"data": ["21 Get Wallet Transactions Request", 17000, 7604, 44.72941176470588, 17514.38811764715, 2, 80424, 13466.0, 36875.299999999996, 48923.499999999985, 79422.95000000017, 68.29887588085462, 30.78479629985818, 27.142407989863642], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["504/Gateway Time-out", 50, 0.17158544955387783, 0.029411764705882353], "isController": false}, {"data": ["502/Bad Gateway", 1878, 6.444749485243651, 1.1047058823529412], "isController": false}, {"data": ["Non HTTP response code: java.io.InterruptedIOException/Non HTTP response message: Connection has been shut down", 3, 0.01029512697323267, 0.0017647058823529412], "isController": false}, {"data": ["Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 1842, 6.321207961564859, 1.0835294117647059], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:8080 failed to respond", 1453, 4.98627316403569, 0.8547058823529412], "isController": false}, {"data": ["Assertion failed", 23914, 82.06588881262869, 14.067058823529411], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 170000, 29140, "Assertion failed", 23914, "502/Bad Gateway", 1878, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 1842, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:8080 failed to respond", 1453, "504/Gateway Time-out", 50], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["23 Get Stock Portfolio Request", 17000, 4883, "Assertion failed", 4595, "502/Bad Gateway", 126, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:8080 failed to respond", 88, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 74, "", ""], "isController": false}, {"data": ["16 Get Stock Prices Request", 17000, 675, "502/Bad Gateway", 405, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 268, "Non HTTP response code: java.io.InterruptedIOException/Non HTTP response message: Connection has been shut down", 2, "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["19 Place Stock Order Request", 17000, 733, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:8080 failed to respond", 492, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 241, "", "", "", "", "", ""], "isController": false}, {"data": ["20 Get Stock Transactions Request", 17000, 7249, "Assertion failed", 6796, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 174, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:8080 failed to respond", 145, "502/Bad Gateway", 134, "", ""], "isController": false}, {"data": ["17 Add Money Request", 17000, 768, "502/Bad Gateway", 326, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 306, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:8080 failed to respond", 85, "504/Gateway Time-out", 50, "Non HTTP response code: java.io.InterruptedIOException/Non HTTP response message: Connection has been shut down", 1], "isController": false}, {"data": ["18 Get Wallet Balance Request", 17000, 1899, "502/Bad Gateway", 586, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 513, "Assertion failed", 481, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:8080 failed to respond", 319, "", ""], "isController": false}, {"data": ["22 Get Wallet Balance Request", 17000, 5329, "Assertion failed", 4931, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:8080 failed to respond", 156, "502/Bad Gateway", 138, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 104, "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["21 Get Wallet Transactions Request", 17000, 7604, "Assertion failed", 7111, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:8080 failed to respond", 168, "502/Bad Gateway", 163, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 162, "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
