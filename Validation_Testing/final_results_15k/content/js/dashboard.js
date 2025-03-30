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

    var data = {"OkPercent": 91.302, "KoPercent": 8.698};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.07735333333333333, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.14853333333333332, 500, 1500, "23 Get Stock Portfolio Request"], "isController": false}, {"data": [0.024733333333333333, 500, 1500, "16 Get Stock Prices Request"], "isController": false}, {"data": [0.15676666666666667, 500, 1500, "14 Register Request"], "isController": false}, {"data": [0.18613333333333335, 500, 1500, "19 Place Stock Order Request"], "isController": false}, {"data": [0.0163, 500, 1500, "20 Get Stock Transactions Request"], "isController": false}, {"data": [0.011966666666666667, 500, 1500, "17 Add Money Request"], "isController": false}, {"data": [0.0074, 500, 1500, "18 Get Wallet Balance Request"], "isController": false}, {"data": [0.0838, 500, 1500, "22 Get Wallet Balance Request"], "isController": false}, {"data": [0.09856666666666666, 500, 1500, "15 Login Request"], "isController": false}, {"data": [0.03933333333333333, 500, 1500, "21 Get Wallet Transactions Request"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 150000, 13047, 8.698, 12693.81481333329, 1, 80338, 4187.0, 36051.0, 37747.9, 60052.93000000001, 714.5443112745565, 339.71690908078637, 275.2082626852456], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["23 Get Stock Portfolio Request", 15000, 1681, 11.206666666666667, 9263.654199999983, 2, 80327, 4854.5, 23649.299999999996, 36121.0, 77534.7, 84.23842844787887, 33.07527563515775, 33.428704104096234], "isController": false}, {"data": ["16 Get Stock Prices Request", 15000, 244, 1.6266666666666667, 16585.227999999985, 31, 80252, 14456.0, 27032.8, 42468.649999999754, 80000.0, 78.07660876852368, 39.01315314336427, 30.620288767964126], "isController": false}, {"data": ["14 Register Request", 15000, 19, 0.12666666666666668, 6365.538266666669, 12, 79304, 5037.0, 12487.499999999998, 14736.849999999997, 22663.92999999998, 103.2858677390035, 29.175830149403005, 28.007482738349353], "isController": false}, {"data": ["19 Place Stock Order Request", 15000, 149, 0.9933333333333333, 7117.826866666649, 7, 78892, 4364.0, 14001.699999999999, 24248.649999999994, 68761.78, 75.92975991009916, 63.90900621073799, 39.96695888814787], "isController": false}, {"data": ["20 Get Stock Transactions Request", 15000, 3872, 25.813333333333333, 17884.428866666647, 2, 80268, 14318.5, 36727.9, 45194.949999999975, 80000.0, 76.11933481850613, 57.76796424230814, 30.277639921609772], "isController": false}, {"data": ["17 Add Money Request", 15000, 235, 1.5666666666666667, 15802.982199999984, 4, 80258, 13908.0, 25016.0, 36856.69999999997, 73663.18999999999, 78.14250066421125, 23.559719754945117, 33.88007002382044], "isController": false}, {"data": ["18 Get Wallet Balance Request", 15000, 367, 2.4466666666666668, 17522.579133333315, 6, 80338, 14204.0, 31524.6, 44191.649999999994, 78422.09999999996, 75.8552681483729, 24.763505398366583, 30.006413128334472], "isController": false}, {"data": ["22 Get Wallet Balance Request", 15000, 2150, 14.333333333333334, 13053.821999999962, 1, 80326, 7620.5, 32275.799999999996, 38782.69999999997, 80000.0, 80.39877793857534, 26.802230731092887, 31.683530519711102], "isController": false}, {"data": ["15 Login Request", 15000, 19, 0.12666666666666668, 6459.736266666643, 9, 33551, 6036.0, 13045.8, 14793.949999999999, 16948.869999999995, 103.74161421951726, 53.56767141140466, 26.155368196279134], "isController": false}, {"data": ["21 Get Wallet Transactions Request", 15000, 4311, 28.74, 16882.35233333334, 2, 80333, 10545.5, 37990.9, 57099.59999999986, 80002.0, 76.71182436060694, 38.45152228222791, 30.060622118512097], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["400/Bad Request", 170, 1.3029815283206867, 0.11333333333333333], "isController": false}, {"data": ["504/Gateway Time-out", 28, 0.21460872231164252, 0.018666666666666668], "isController": false}, {"data": ["502/Bad Gateway", 97, 0.7434659308653331, 0.06466666666666666], "isController": false}, {"data": ["Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 1255, 9.619069517896834, 0.8366666666666667], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:8080 failed to respond", 484, 3.7096650571012493, 0.32266666666666666], "isController": false}, {"data": ["Assertion failed", 11013, 84.41020924350426, 7.342], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 150000, 13047, "Assertion failed", 11013, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 1255, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:8080 failed to respond", 484, "400/Bad Request", 170, "502/Bad Gateway", 97], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["23 Get Stock Portfolio Request", 15000, 1681, "Assertion failed", 1503, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 120, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:8080 failed to respond", 39, "400/Bad Request", 19, "", ""], "isController": false}, {"data": ["16 Get Stock Prices Request", 15000, 244, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 225, "400/Bad Request", 19, "", "", "", "", "", ""], "isController": false}, {"data": ["14 Register Request", 15000, 19, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:8080 failed to respond", 19, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["19 Place Stock Order Request", 15000, 149, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:8080 failed to respond", 130, "400/Bad Request", 19, "", "", "", "", "", ""], "isController": false}, {"data": ["20 Get Stock Transactions Request", 15000, 3872, "Assertion failed", 3621, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 170, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:8080 failed to respond", 62, "400/Bad Request", 19, "", ""], "isController": false}, {"data": ["17 Add Money Request", 15000, 235, "502/Bad Gateway", 97, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 90, "504/Gateway Time-out", 28, "400/Bad Request", 18, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:8080 failed to respond", 2], "isController": false}, {"data": ["18 Get Wallet Balance Request", 15000, 367, "Assertion failed", 178, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 134, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:8080 failed to respond", 36, "400/Bad Request", 19, "", ""], "isController": false}, {"data": ["22 Get Wallet Balance Request", 15000, 2150, "Assertion failed", 1905, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 168, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:8080 failed to respond", 58, "400/Bad Request", 19, "", ""], "isController": false}, {"data": ["15 Login Request", 15000, 19, "400/Bad Request", 19, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["21 Get Wallet Transactions Request", 15000, 4311, "Assertion failed", 3806, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 348, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:8080 failed to respond", 138, "400/Bad Request", 19, "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
