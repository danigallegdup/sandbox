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

    var data = {"OkPercent": 84.40764705882353, "KoPercent": 15.59235294117647};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.054129411764705884, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.13855882352941176, 500, 1500, "23 Get Stock Portfolio Request"], "isController": false}, {"data": [0.023176470588235295, 500, 1500, "16 Get Stock Prices Request"], "isController": false}, {"data": [0.0728235294117647, 500, 1500, "14 Register Request"], "isController": false}, {"data": [0.13167647058823528, 500, 1500, "19 Place Stock Order Request"], "isController": false}, {"data": [0.013970588235294118, 500, 1500, "20 Get Stock Transactions Request"], "isController": false}, {"data": [0.009029411764705883, 500, 1500, "17 Add Money Request"], "isController": false}, {"data": [0.006411764705882353, 500, 1500, "18 Get Wallet Balance Request"], "isController": false}, {"data": [0.07844117647058824, 500, 1500, "22 Get Wallet Balance Request"], "isController": false}, {"data": [0.02673529411764706, 500, 1500, "15 Login Request"], "isController": false}, {"data": [0.04047058823529412, 500, 1500, "21 Get Wallet Transactions Request"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 170000, 26507, 15.59235294117647, 16465.00079411789, 1, 83000, 3929.0, 42200.10000000001, 60952.0, 74797.0, 661.0773227146168, 322.2738277057506, 251.19402534356576], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["23 Get Stock Portfolio Request", 17000, 4280, 25.176470588235293, 11807.420529411733, 1, 82916, 6707.0, 33964.899999999994, 45950.54999999999, 72555.83000000003, 76.9627771791784, 29.54125215467481, 30.39340888795578], "isController": false}, {"data": ["16 Get Stock Prices Request", 17000, 666, 3.9176470588235293, 20620.09664705884, 15, 80587, 16220.0, 36278.1, 69193.84999999998, 80001.0, 73.03032906607098, 38.58839858181545, 28.11465459607784], "isController": false}, {"data": ["14 Register Request", 17000, 141, 0.8294117647058824, 10245.08682352942, 30, 80006, 7654.0, 20040.8, 25287.749999999993, 75897.53000000007, 112.12241129138637, 33.328818293678275, 30.188302272952118], "isController": false}, {"data": ["19 Place Stock Order Request", 17000, 427, 2.511764705882353, 6750.739647058834, 2, 80002, 4217.0, 15911.0, 19575.649999999994, 37097.750000000204, 69.65700073344725, 59.054471358424195, 36.262158923983726], "isController": false}, {"data": ["20 Get Stock Transactions Request", 17000, 5763, 33.9, 21274.974823529497, 2, 80568, 15112.5, 47162.7, 62428.54999999999, 80000.0, 69.71184404230279, 50.46546431676242, 27.502307602999252], "isController": false}, {"data": ["17 Add Money Request", 17000, 1407, 8.276470588235295, 23032.236764706002, 4, 83000, 17383.0, 50424.1, 67970.84999999999, 80001.0, 70.21572749689192, 25.014635268017564, 29.566331081095036], "isController": false}, {"data": ["18 Get Wallet Balance Request", 17000, 2649, 15.58235294117647, 27438.55082352936, 2, 82921, 20875.0, 62828.299999999996, 76321.84999999998, 80002.0, 69.5538326207475, 29.29614382172739, 26.157922680175112], "isController": false}, {"data": ["22 Get Wallet Balance Request", 17000, 4652, 27.36470588235294, 15156.652647058803, 1, 82924, 8988.5, 40900.59999999999, 51907.04999999994, 79453.60000000006, 73.23514080532807, 24.442022101665454, 28.724704427548907], "isController": false}, {"data": ["15 Login Request", 17000, 147, 0.8647058823529412, 9649.887823529436, 18, 50675, 8202.5, 19090.299999999996, 22811.59999999999, 29647.99, 103.91071013801788, 53.66222338548734, 26.174312794923043], "isController": false}, {"data": ["21 Get Wallet Transactions Request", 17000, 6375, 37.5, 18674.361411764705, 1, 82901, 12016.0, 45343.99999999999, 60021.0, 80000.0, 71.25641831709106, 33.217279681441894, 28.09403407602431], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["400/Bad Request", 1255, 4.734598407967707, 0.7382352941176471], "isController": false}, {"data": ["504/Gateway Time-out", 71, 0.2678537744746671, 0.04176470588235294], "isController": false}, {"data": ["502/Bad Gateway", 4312, 16.267401063869922, 2.5364705882352943], "isController": false}, {"data": ["Non HTTP response code: java.io.InterruptedIOException/Non HTTP response message: Connection has been shut down", 8, 0.03018070698306108, 0.004705882352941176], "isController": false}, {"data": ["Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 2454, 9.257931867053985, 1.443529411764706], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:8080 failed to respond", 1122, 4.232844154374316, 0.66], "isController": false}, {"data": ["Assertion failed", 17285, 65.20919002527634, 10.16764705882353], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 170000, 26507, "Assertion failed", 17285, "502/Bad Gateway", 4312, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 2454, "400/Bad Request", 1255, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:8080 failed to respond", 1122], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["23 Get Stock Portfolio Request", 17000, 4280, "Assertion failed", 3290, "502/Bad Gateway", 651, "400/Bad Request", 146, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 105, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:8080 failed to respond", 88], "isController": false}, {"data": ["16 Get Stock Prices Request", 17000, 666, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 492, "400/Bad Request", 142, "502/Bad Gateway", 30, "Non HTTP response code: java.io.InterruptedIOException/Non HTTP response message: Connection has been shut down", 2, "", ""], "isController": false}, {"data": ["14 Register Request", 17000, 141, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 74, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:8080 failed to respond", 67, "", "", "", "", "", ""], "isController": false}, {"data": ["19 Place Stock Order Request", 17000, 427, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:8080 failed to respond", 268, "400/Bad Request", 146, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 13, "", "", "", ""], "isController": false}, {"data": ["20 Get Stock Transactions Request", 17000, 5763, "Assertion failed", 4631, "502/Bad Gateway", 658, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 259, "400/Bad Request", 142, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:8080 failed to respond", 72], "isController": false}, {"data": ["17 Add Money Request", 17000, 1407, "502/Bad Gateway", 682, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 409, "400/Bad Request", 126, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:8080 failed to respond", 117, "504/Gateway Time-out", 71], "isController": false}, {"data": ["18 Get Wallet Balance Request", 17000, 2649, "Assertion failed", 892, "502/Bad Gateway", 669, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 668, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:8080 failed to respond", 282, "400/Bad Request", 136], "isController": false}, {"data": ["22 Get Wallet Balance Request", 17000, 4652, "Assertion failed", 3431, "502/Bad Gateway", 811, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 162, "400/Bad Request", 144, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:8080 failed to respond", 104], "isController": false}, {"data": ["15 Login Request", 17000, 147, "400/Bad Request", 132, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:8080 failed to respond", 15, "", "", "", "", "", ""], "isController": false}, {"data": ["21 Get Wallet Transactions Request", 17000, 6375, "Assertion failed", 5041, "502/Bad Gateway", 811, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 272, "400/Bad Request", 141, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:8080 failed to respond", 109], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
