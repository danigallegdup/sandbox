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

    var data = {"OkPercent": 87.54333333333334, "KoPercent": 12.456666666666667};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.13231, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.25166666666666665, 500, 1500, "23 Get Stock Portfolio Request"], "isController": false}, {"data": [0.030233333333333334, 500, 1500, "16 Get Stock Prices Request"], "isController": false}, {"data": [0.1215, 500, 1500, "14 Register Request"], "isController": false}, {"data": [0.40463333333333334, 500, 1500, "19 Place Stock Order Request"], "isController": false}, {"data": [0.06726666666666667, 500, 1500, "20 Get Stock Transactions Request"], "isController": false}, {"data": [0.0227, 500, 1500, "17 Add Money Request"], "isController": false}, {"data": [0.0386, 500, 1500, "18 Get Wallet Balance Request"], "isController": false}, {"data": [0.19026666666666667, 500, 1500, "22 Get Wallet Balance Request"], "isController": false}, {"data": [0.07343333333333334, 500, 1500, "15 Login Request"], "isController": false}, {"data": [0.1228, 500, 1500, "21 Get Wallet Transactions Request"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 150000, 18685, 12.456666666666667, 11107.359946666813, 0, 80249, 1092.5, 40315.20000000001, 60050.0, 62099.98, 757.2927289800782, 352.84797482569644, 293.0208434568646], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["23 Get Stock Portfolio Request", 15000, 3745, 24.966666666666665, 6510.9043999999785, 0, 80020, 1892.5, 18522.899999999994, 31245.0, 60814.97, 84.12032571390117, 30.78901951977108, 33.67760525906256], "isController": false}, {"data": ["16 Get Stock Prices Request", 15000, 608, 4.053333333333334, 18447.457400000032, 23, 80212, 13712.5, 39543.99999999999, 70276.29999999999, 80001.0, 88.71959875082806, 47.504839838944356, 34.208613785842715], "isController": false}, {"data": ["14 Register Request", 15000, 0, 0.0, 6103.151466666656, 5, 35582, 5731.0, 11847.0, 13699.849999999997, 17275.749999999993, 167.04158221786676, 46.81731845364039, 45.35326858616005], "isController": false}, {"data": ["19 Place Stock Order Request", 15000, 0, 0.0, 2213.9003333333317, 3, 19727, 1455.5, 5314.799999999999, 6924.249999999984, 12416.839999999997, 80.14918434846729, 66.68662603993566, 42.57925418512324], "isController": false}, {"data": ["20 Get Stock Transactions Request", 15000, 4296, 28.64, 14951.446866666685, 2, 80160, 10774.0, 36982.7, 46466.44999999975, 80000.0, 80.3307484683604, 58.918064477475255, 32.141870042923394], "isController": false}, {"data": ["17 Add Money Request", 15000, 641, 4.273333333333333, 17826.32540000002, 4, 80249, 13230.0, 40822.2, 62051.85, 80001.0, 79.76771640981461, 25.896204834854238, 34.26567148962222], "isController": false}, {"data": ["18 Get Wallet Balance Request", 15000, 947, 6.3133333333333335, 16471.32086666661, 1, 80126, 11940.0, 38762.399999999994, 60245.49999999997, 79995.68, 79.87177917050495, 25.99282493503762, 31.651584489699204], "isController": false}, {"data": ["22 Get Wallet Balance Request", 15000, 3680, 24.533333333333335, 9047.008266666679, 0, 80065, 3323.0, 25403.599999999988, 38870.799999999996, 65479.67999999997, 82.64872638312644, 25.41049082668011, 33.005736596442794], "isController": false}, {"data": ["15 Login Request", 15000, 0, 0.0, 7185.455666666652, 13, 27428, 7063.5, 13127.9, 15245.949999999999, 17205.92, 159.26102882624622, 82.27449633699634, 40.1529403567447], "isController": false}, {"data": ["21 Get Wallet Transactions Request", 15000, 4768, 31.786666666666665, 12316.62880000002, 0, 80012, 7325.5, 33658.399999999994, 42797.99999999991, 68644.73999999999, 81.16883116883116, 35.55150944433171, 32.726707293357684], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["502/Bad Gateway", 6460, 34.573187048434576, 4.306666666666667], "isController": false}, {"data": ["504/Gateway Time-out", 59, 0.31576130586031576, 0.03933333333333333], "isController": false}, {"data": ["Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 1186, 6.347337436446347, 0.7906666666666666], "isController": false}, {"data": ["Assertion failed", 10980, 58.763714209258765, 7.32], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 150000, 18685, "Assertion failed", 10980, "502/Bad Gateway", 6460, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 1186, "504/Gateway Time-out", 59, "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["23 Get Stock Portfolio Request", 15000, 3745, "502/Bad Gateway", 1980, "Assertion failed", 1727, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 38, "", "", "", ""], "isController": false}, {"data": ["16 Get Stock Prices Request", 15000, 608, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 484, "502/Bad Gateway", 124, "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["20 Get Stock Transactions Request", 15000, 4296, "Assertion failed", 3421, "502/Bad Gateway", 720, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 155, "", "", "", ""], "isController": false}, {"data": ["17 Add Money Request", 15000, 641, "502/Bad Gateway", 343, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 239, "504/Gateway Time-out", 59, "", "", "", ""], "isController": false}, {"data": ["18 Get Wallet Balance Request", 15000, 947, "Assertion failed", 419, "502/Bad Gateway", 374, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 154, "", "", "", ""], "isController": false}, {"data": ["22 Get Wallet Balance Request", 15000, 3680, "Assertion failed", 1899, "502/Bad Gateway", 1742, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 39, "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["21 Get Wallet Transactions Request", 15000, 4768, "Assertion failed", 3514, "502/Bad Gateway", 1177, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 77, "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
