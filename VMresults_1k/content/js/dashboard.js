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

    var data = {"OkPercent": 75.0, "KoPercent": 25.0};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.75, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.5, 500, 1500, "23 Get Stock Portfolio Request"], "isController": false}, {"data": [0.5, 500, 1500, "16 Get Stock Prices Request"], "isController": false}, {"data": [1.0, 500, 1500, "14 Register Request"], "isController": false}, {"data": [1.0, 500, 1500, "19 Place Stock Order Request"], "isController": false}, {"data": [0.5, 500, 1500, "20 Get Stock Transactions Request"], "isController": false}, {"data": [1.0, 500, 1500, "17 Add Money Request"], "isController": false}, {"data": [1.0, 500, 1500, "18 Get Wallet Balance Request"], "isController": false}, {"data": [0.5, 500, 1500, "22 Get Wallet Balance Request"], "isController": false}, {"data": [1.0, 500, 1500, "15 Login Request"], "isController": false}, {"data": [0.5, 500, 1500, "21 Get Wallet Transactions Request"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 10000, 2500, 25.0, 6.741899999999966, 2, 70, 6.0, 10.0, 12.0, 19.0, 185.66309574645848, 79.94982889985333, 72.06083352866638], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["23 Get Stock Portfolio Request", 1000, 500, 50.0, 6.50799999999999, 2, 30, 6.0, 10.0, 12.0, 19.0, 22.406955118868897, 7.7352135102735895, 8.969806102814314], "isController": false}, {"data": ["16 Get Stock Prices Request", 1000, 500, 50.0, 7.119999999999999, 3, 39, 6.0, 11.0, 13.0, 19.0, 22.379375167845314, 10.468477251365142, 8.893200901049592], "isController": false}, {"data": ["14 Register Request", 1000, 0, 0.0, 7.834000000000009, 3, 70, 7.0, 11.0, 13.0, 25.0, 22.32242510826376, 6.256382818429394, 6.141522605640876], "isController": false}, {"data": ["19 Place Stock Order Request", 1000, 0, 0.0, 8.094000000000014, 3, 44, 7.0, 12.0, 15.0, 23.980000000000018, 22.39541341933172, 18.358574538934427, 11.611518835942398], "isController": false}, {"data": ["20 Get Stock Transactions Request", 1000, 500, 50.0, 7.201999999999999, 3, 27, 7.0, 11.0, 12.0, 18.0, 22.395914985106717, 13.350414884325097, 9.030999620669188], "isController": false}, {"data": ["17 Add Money Request", 1000, 0, 0.0, 6.697999999999995, 2, 32, 6.0, 10.0, 13.0, 24.0, 22.383382576775002, 6.42647898200376, 9.747285490252036], "isController": false}, {"data": ["18 Get Wallet Balance Request", 1000, 0, 0.0, 5.811000000000006, 2, 25, 5.0, 9.0, 11.0, 15.0, 22.39140170174653, 6.756780396327811, 8.94171325710927], "isController": false}, {"data": ["22 Get Wallet Balance Request", 1000, 500, 50.0, 5.726000000000002, 2, 25, 5.0, 9.0, 11.0, 16.0, 22.406955118868897, 6.7505328654014205, 8.947924310706044], "isController": false}, {"data": ["15 Login Request", 1000, 0, 0.0, 6.605000000000004, 3, 24, 6.0, 10.0, 12.0, 17.0, 22.375369193591695, 11.530504096091024, 5.557132708314687], "isController": false}, {"data": ["21 Get Wallet Transactions Request", 1000, 500, 50.0, 5.820999999999999, 2, 22, 5.0, 9.0, 11.0, 14.0, 22.402437385187508, 8.772829483847843, 9.055507114174022], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Assertion failed", 2500, 100.0, 25.0], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 10000, 2500, "Assertion failed", 2500, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["23 Get Stock Portfolio Request", 1000, 500, "Assertion failed", 500, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["16 Get Stock Prices Request", 1000, 500, "Assertion failed", 500, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["20 Get Stock Transactions Request", 1000, 500, "Assertion failed", 500, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["22 Get Wallet Balance Request", 1000, 500, "Assertion failed", 500, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["21 Get Wallet Transactions Request", 1000, 500, "Assertion failed", 500, "", "", "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
