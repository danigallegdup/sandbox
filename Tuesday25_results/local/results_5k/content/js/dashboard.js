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

    var data = {"OkPercent": 30.46, "KoPercent": 69.54};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.05501, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0E-4, 500, 1500, "23 Get Stock Portfolio Request"], "isController": false}, {"data": [0.0329, 500, 1500, "16 Get Stock Prices Request"], "isController": false}, {"data": [0.181, 500, 1500, "14 Register Request"], "isController": false}, {"data": [0.0687, 500, 1500, "19 Place Stock Order Request"], "isController": false}, {"data": [4.0E-4, 500, 1500, "20 Get Stock Transactions Request"], "isController": false}, {"data": [0.0524, 500, 1500, "17 Add Money Request"], "isController": false}, {"data": [0.0294, 500, 1500, "18 Get Wallet Balance Request"], "isController": false}, {"data": [3.0E-4, 500, 1500, "22 Get Wallet Balance Request"], "isController": false}, {"data": [0.1843, 500, 1500, "15 Login Request"], "isController": false}, {"data": [6.0E-4, 500, 1500, "21 Get Wallet Transactions Request"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 50000, 34770, 69.54, 6079.539120000044, 18, 12090, 8012.0, 8056.0, 8111.0, 8225.0, 406.01552603371556, 696.1886212372511, 54.9348602012416], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["23 Get Stock Portfolio Request", 5000, 4906, 98.12, 6980.4647999999925, 351, 12070, 8010.0, 8207.0, 9233.0, 11106.0, 48.72392052154084, 112.09887651775013, 0.8667528674027227], "isController": false}, {"data": ["16 Get Stock Prices Request", 5000, 3604, 72.08, 5669.946399999998, 132, 12090, 5417.5, 9108.900000000001, 11017.95, 11803.99, 74.89514679448772, 103.2619762020671, 16.791769842532954], "isController": false}, {"data": ["14 Register Request", 5000, 1066, 21.32, 3794.3605999999977, 18, 12082, 2131.0, 10899.900000000001, 11381.849999999999, 11850.99, 92.85395929282426, 70.60520759823949, 20.052247762219583], "isController": false}, {"data": ["19 Place Stock Order Request", 5000, 3269, 65.38, 6172.413400000006, 111, 12086, 8008.0, 8391.800000000001, 10348.95, 11745.09999999998, 56.241704348608586, 109.31244208862005, 10.400947549689546], "isController": false}, {"data": ["20 Get Stock Transactions Request", 5000, 4919, 98.38, 7471.695200000001, 228, 12080, 8014.0, 9727.300000000003, 10988.95, 11782.99, 51.76251358765982, 107.98545958641752, 4.350720145970288], "isController": false}, {"data": ["17 Add Money Request", 5000, 2735, 54.7, 6265.747800000005, 106, 12088, 8007.0, 10394.0, 10854.75, 11787.99, 67.25220923507337, 101.89977245635332, 13.388049660712605], "isController": false}, {"data": ["18 Get Wallet Balance Request", 5000, 3154, 63.08, 6620.701800000006, 182, 11999, 8012.0, 9339.600000000002, 11042.75, 11761.949999999999, 61.31508596375052, 104.73838194086773, 9.13017556808427], "isController": false}, {"data": ["22 Get Wallet Balance Request", 5000, 4845, 96.9, 7034.729200000002, 210, 12021, 8009.0, 8549.700000000012, 10642.0, 11439.99, 47.29339878739725, 105.93349077601374, 1.5869891130595992], "isController": false}, {"data": ["15 Login Request", 5000, 1349, 26.98, 3851.581799999999, 124, 12090, 2557.0, 8354.800000000001, 10858.75, 11861.0, 84.86947075398038, 89.99704548154938, 15.808281589477883], "isController": false}, {"data": ["21 Get Wallet Transactions Request", 5000, 4923, 98.46, 6933.750199999998, 256, 12086, 8011.0, 8803.0, 10335.9, 11613.97, 49.887752556747316, 107.43289512659018, 2.9080272511848344], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: java.io.InterruptedIOException/Non HTTP response message: Connection has been shut down", 9, 0.025884383088869714, 0.018], "isController": false}, {"data": ["Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 28294, 81.37474834627552, 56.588], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:8080 failed to respond", 3095, 8.901351740005753, 6.19], "isController": false}, {"data": ["Assertion failed", 3372, 9.698015530629853, 6.744], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 50000, 34770, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 28294, "Assertion failed", 3372, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:8080 failed to respond", 3095, "Non HTTP response code: java.io.InterruptedIOException/Non HTTP response message: Connection has been shut down", 9, "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["23 Get Stock Portfolio Request", 5000, 4906, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 3429, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:8080 failed to respond", 1351, "Assertion failed", 126, "", "", "", ""], "isController": false}, {"data": ["16 Get Stock Prices Request", 5000, 3604, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 2205, "Assertion failed", 1397, "Non HTTP response code: java.io.InterruptedIOException/Non HTTP response message: Connection has been shut down", 2, "", "", "", ""], "isController": false}, {"data": ["14 Register Request", 5000, 1066, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 1066, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["19 Place Stock Order Request", 5000, 3269, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 3269, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["20 Get Stock Transactions Request", 5000, 4919, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 3968, "Assertion failed", 951, "", "", "", "", "", ""], "isController": false}, {"data": ["17 Add Money Request", 5000, 2735, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 2735, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["18 Get Wallet Balance Request", 5000, 3154, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 3150, "Non HTTP response code: java.io.InterruptedIOException/Non HTTP response message: Connection has been shut down", 4, "", "", "", "", "", ""], "isController": false}, {"data": ["22 Get Wallet Balance Request", 5000, 4845, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 3517, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:8080 failed to respond", 1067, "Assertion failed", 261, "", "", "", ""], "isController": false}, {"data": ["15 Login Request", 5000, 1349, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 1349, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["21 Get Wallet Transactions Request", 5000, 4923, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 3606, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:8080 failed to respond", 677, "Assertion failed", 637, "Non HTTP response code: java.io.InterruptedIOException/Non HTTP response message: Connection has been shut down", 3, "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
