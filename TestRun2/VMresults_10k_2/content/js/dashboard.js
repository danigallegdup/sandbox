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

    var data = {"OkPercent": 71.876, "KoPercent": 28.124};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.113445, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.10355, 500, 1500, "23 Get Stock Portfolio Request"], "isController": false}, {"data": [0.0151, 500, 1500, "16 Get Stock Prices Request"], "isController": false}, {"data": [0.10155, 500, 1500, "14 Register Request"], "isController": false}, {"data": [0.5905, 500, 1500, "19 Place Stock Order Request"], "isController": false}, {"data": [0.03625, 500, 1500, "20 Get Stock Transactions Request"], "isController": false}, {"data": [0.02965, 500, 1500, "17 Add Money Request"], "isController": false}, {"data": [0.05715, 500, 1500, "18 Get Wallet Balance Request"], "isController": false}, {"data": [0.08215, 500, 1500, "22 Get Wallet Balance Request"], "isController": false}, {"data": [0.0623, 500, 1500, "15 Login Request"], "isController": false}, {"data": [0.05625, 500, 1500, "21 Get Wallet Transactions Request"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 100000, 28124, 28.124, 7494.780969999909, 1, 72990, 1502.0, 13059.800000000003, 60139.0, 63539.780000000035, 796.4573576730701, 335.53416901621586, 304.0926303551802], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["23 Get Stock Portfolio Request", 10000, 5113, 51.13, 4992.2699, 2, 65382, 4045.5, 9580.8, 12027.54999999999, 40073.11999999996, 89.26738259107505, 30.752395364679575, 35.30594721619668], "isController": false}, {"data": ["16 Get Stock Prices Request", 10000, 5000, 50.0, 11716.362800000046, 30, 72143, 9346.0, 16277.8, 41631.14999999998, 62962.829999999994, 83.69531557318736, 39.15044546831714, 32.8569500590052], "isController": false}, {"data": ["14 Register Request", 10000, 0, 0.0, 6915.0535999999975, 8, 22743, 7133.0, 12245.499999999998, 13346.849999999997, 15479.0, 189.33297991177085, 53.06500511199046, 49.68123278253214], "isController": false}, {"data": ["19 Place Stock Order Request", 10000, 0, 0.0, 1314.1228000000044, 3, 14138, 578.5, 3531.7999999999993, 5061.0, 8466.309999999963, 84.35259384226066, 68.74242144664699, 43.32955504006748], "isController": false}, {"data": ["20 Get Stock Transactions Request", 10000, 6405, 64.05, 7773.993599999986, 2, 68199, 6237.0, 13255.699999999999, 17865.85, 55206.16999999996, 85.32423208191128, 44.31602295755119, 33.99637372013652], "isController": false}, {"data": ["17 Add Money Request", 10000, 12, 0.12, 11930.436600000032, 11, 72990, 8718.0, 20318.999999999993, 43471.44999999999, 61951.96, 83.82440463716605, 24.069105428573227, 36.10015863768578], "isController": false}, {"data": ["18 Get Wallet Balance Request", 10000, 11, 0.11, 10098.6036, 2, 72910, 7409.5, 16456.5, 39648.899999999994, 61545.89, 84.19634587858887, 25.406543371642673, 33.218089584912015], "isController": false}, {"data": ["22 Get Wallet Balance Request", 10000, 5178, 51.78, 5757.032599999994, 2, 67555, 4808.5, 10870.699999999999, 13331.0, 40429.71999999997, 88.05840033109959, 26.530534112723558, 34.74179075562913], "isController": false}, {"data": ["15 Login Request", 10000, 0, 0.0, 7607.2818, 5, 21918, 7673.0, 12869.9, 14487.649999999992, 17577.92, 187.20982477160402, 95.43313333083721, 44.242946869851735], "isController": false}, {"data": ["21 Get Wallet Transactions Request", 10000, 6405, 64.05, 6842.652400000008, 1, 68302, 5594.0, 12072.9, 15409.399999999987, 42864.53999999999, 86.36473555117973, 33.338812096244865, 34.495289883234875], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["502/Bad Gateway", 9, 0.032001137818233535, 0.009], "isController": false}, {"data": ["504/Gateway Time-out", 3, 0.010667045939411179, 0.003], "isController": false}, {"data": ["Assertion failed", 28112, 99.95733181624236, 28.112], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 100000, 28124, "Assertion failed", 28112, "502/Bad Gateway", 9, "504/Gateway Time-out", 3, "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["23 Get Stock Portfolio Request", 10000, 5113, "Assertion failed", 5113, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["16 Get Stock Prices Request", 10000, 5000, "Assertion failed", 5000, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["20 Get Stock Transactions Request", 10000, 6405, "Assertion failed", 6405, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["17 Add Money Request", 10000, 12, "502/Bad Gateway", 9, "504/Gateway Time-out", 3, "", "", "", "", "", ""], "isController": false}, {"data": ["18 Get Wallet Balance Request", 10000, 11, "Assertion failed", 11, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["22 Get Wallet Balance Request", 10000, 5178, "Assertion failed", 5178, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["21 Get Wallet Transactions Request", 10000, 6405, "Assertion failed", 6405, "", "", "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
