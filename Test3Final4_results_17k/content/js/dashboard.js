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

    var data = {"OkPercent": 85.95529411764706, "KoPercent": 14.044705882352941};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.061379411764705884, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.1455, 500, 1500, "23 Get Stock Portfolio Request"], "isController": false}, {"data": [0.028941176470588234, 500, 1500, "16 Get Stock Prices Request"], "isController": false}, {"data": [0.11044117647058824, 500, 1500, "14 Register Request"], "isController": false}, {"data": [0.12579411764705883, 500, 1500, "19 Place Stock Order Request"], "isController": false}, {"data": [0.016088235294117646, 500, 1500, "20 Get Stock Transactions Request"], "isController": false}, {"data": [0.011529411764705882, 500, 1500, "17 Add Money Request"], "isController": false}, {"data": [0.006588235294117647, 500, 1500, "18 Get Wallet Balance Request"], "isController": false}, {"data": [0.08364705882352941, 500, 1500, "22 Get Wallet Balance Request"], "isController": false}, {"data": [0.04076470588235294, 500, 1500, "15 Login Request"], "isController": false}, {"data": [0.0445, 500, 1500, "21 Get Wallet Transactions Request"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 170000, 23876, 14.044705882352941, 15850.839123529571, 1, 83070, 3718.5, 39910.10000000001, 61857.40000000002, 74836.92000000001, 662.8946660375666, 316.3841217778932, 253.54091918387917], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["23 Get Stock Portfolio Request", 17000, 3731, 21.94705882352941, 11796.823529411804, 2, 80524, 7001.0, 30742.5, 40317.799999999996, 68380.57000000007, 71.40786914718002, 27.074653744030094, 28.363190858007552], "isController": false}, {"data": ["16 Get Stock Prices Request", 17000, 394, 2.3176470588235296, 19607.768470588195, 40, 81624, 15640.5, 43413.89999999998, 58691.249999999985, 80001.0, 79.47824867341453, 40.34006901750859, 30.99417482146614], "isController": false}, {"data": ["14 Register Request", 17000, 74, 0.43529411764705883, 8683.315411764697, 11, 67255, 6913.5, 18017.0, 24311.849999999977, 35481.94000000001, 117.7635999639782, 33.89758387625817, 31.83287840648531], "isController": false}, {"data": ["19 Place Stock Order Request", 17000, 324, 1.9058823529411764, 11407.473176470592, 5, 80216, 7655.5, 24914.1, 31169.949999999997, 48755.85000000018, 69.724710437379, 59.16718046985226, 36.42983944603718], "isController": false}, {"data": ["20 Get Stock Transactions Request", 17000, 6329, 37.22941176470588, 19782.358823529332, 3, 81238, 15255.0, 42102.7, 60770.04999999994, 80000.0, 69.82523155278993, 48.899273894604974, 27.693389578584192], "isController": false}, {"data": ["17 Add Money Request", 17000, 726, 4.270588235294118, 20757.84552941168, 80, 83070, 16340.0, 43682.7, 62756.95, 80001.0, 70.2543206407194, 23.805895286709948, 29.880674360117446], "isController": false}, {"data": ["18 Get Wallet Balance Request", 17000, 1269, 7.464705882352941, 24415.3925294119, 6, 81647, 18219.5, 54866.2, 72383.19999999998, 80001.0, 69.47765067454625, 27.26446214336509, 26.587553940966476], "isController": false}, {"data": ["22 Get Wallet Balance Request", 17000, 4275, 25.147058823529413, 15451.546588235236, 1, 81635, 10266.5, 37418.7, 49568.89999999995, 76325.97, 70.35026153744289, 23.344817733335265, 27.677784421969147], "isController": false}, {"data": ["15 Login Request", 17000, 74, 0.43529411764705883, 7721.715058823538, 12, 80125, 7121.5, 13897.0, 16929.949999999997, 20770.99, 102.4997889710227, 52.95063848512848, 25.82955820706766], "isController": false}, {"data": ["21 Get Wallet Transactions Request", 17000, 6680, 39.294117647058826, 18884.152117647027, 2, 80584, 13582.0, 43331.0, 61979.39999999999, 80001.0, 69.98390370214851, 32.865149540421875, 27.626656553735288], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["400/Bad Request", 653, 2.734963980566259, 0.3841176470588235], "isController": false}, {"data": ["502/Bad Gateway", 204, 0.8544144747863964, 0.12], "isController": false}, {"data": ["504/Gateway Time-out", 52, 0.21779192494555202, 0.03058823529411765], "isController": false}, {"data": ["Non HTTP response code: java.io.InterruptedIOException/Non HTTP response message: Connection has been shut down", 4, 0.016753224995811694, 0.002352941176470588], "isController": false}, {"data": ["Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 1920, 8.041547997989612, 1.1294117647058823], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:8080 failed to respond", 915, 3.832300217791925, 0.538235294117647], "isController": false}, {"data": ["Assertion failed", 20128, 84.30222817892444, 11.84], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 170000, 23876, "Assertion failed", 20128, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 1920, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:8080 failed to respond", 915, "400/Bad Request", 653, "502/Bad Gateway", 204], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["23 Get Stock Portfolio Request", 17000, 3731, "Assertion failed", 3521, "400/Bad Request", 74, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 70, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:8080 failed to respond", 66, "", ""], "isController": false}, {"data": ["16 Get Stock Prices Request", 17000, 394, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 321, "400/Bad Request", 73, "", "", "", "", "", ""], "isController": false}, {"data": ["14 Register Request", 17000, 74, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:8080 failed to respond", 74, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["19 Place Stock Order Request", 17000, 324, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:8080 failed to respond", 213, "400/Bad Request", 74, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 37, "", "", "", ""], "isController": false}, {"data": ["20 Get Stock Transactions Request", 17000, 6329, "Assertion failed", 5972, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 207, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:8080 failed to respond", 76, "400/Bad Request", 74, "", ""], "isController": false}, {"data": ["17 Add Money Request", 17000, 726, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 307, "502/Bad Gateway", 204, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:8080 failed to respond", 89, "400/Bad Request", 71, "504/Gateway Time-out", 52], "isController": false}, {"data": ["18 Get Wallet Balance Request", 17000, 1269, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 542, "Assertion failed", 484, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:8080 failed to respond", 170, "400/Bad Request", 73, "", ""], "isController": false}, {"data": ["22 Get Wallet Balance Request", 17000, 4275, "Assertion failed", 3946, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 146, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:8080 failed to respond", 109, "400/Bad Request", 74, "", ""], "isController": false}, {"data": ["15 Login Request", 17000, 74, "400/Bad Request", 66, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:8080 failed to respond", 7, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 1, "", "", "", ""], "isController": false}, {"data": ["21 Get Wallet Transactions Request", 17000, 6680, "Assertion failed", 6205, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 289, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:8080 failed to respond", 111, "400/Bad Request", 74, "Non HTTP response code: java.io.InterruptedIOException/Non HTTP response message: Connection has been shut down", 1], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
