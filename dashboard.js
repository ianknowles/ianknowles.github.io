// Datamaps expect data in format:
// { "USA": { "fillColor": "#42a844", numberOfWhatever: 75},
//   "FRA": { "fillColor": "#8dc386", numberOfWhatever: 43 } }
var dataset = [{}, {}];
var csvdata = {};
var csvdatalist = [];
var map;

d3.queue()
    .defer(d3.csv, "https://s3.eu-west-3.amazonaws.com/www.digitalgendergaps.org/data/2018-05-14/monthly_model.csv", function (d) {
        csvdata[d.ISO3Code] = d;
        csvdatalist.push(d);
    })
    .await(ready);

var tabulate = function (dict) {
    columns = []
    for (var key in dict[0]) {
        columns.push(key)
    }
    data = dict
    var table = d3.select('#modeltable');
    var thead = table.append('thead')
    var tbody = table.append('tbody')

    thead.append('tr')
        .selectAll('th')
        .data(columns)
        .enter()
        .append('th')
        .text(function (d) { return d })

    var rows = tbody.selectAll('tr')
        .data(data)
        .enter()
        .append('tr')

    var cells = rows.selectAll('td')
        .data(function(row) {
            return columns.map(function (column) {
                return { column: column, value: row[column] }
            })
        })
        .enter()
        .append('td')
        .text(function (d) { return d.value })

    return table;
}

function ready(error, us) {
    if (error) throw error;
    // We need to colorize every country based on "numberOfWhatever"
    // colors should be uniq for every value.
    // For this purpose we create palette(using min/max series-value)
    //can we get the headers from the csv read func?
    var headers = [];
    //dataset.forEach(function(obj){ onlyValues.append(obj['numberOfThings']); });
    for (var key in csvdata['USA']) {
        if ((key !== "") && (key !== 'Country') && (key !== 'ISO3Code')) {
            headers.push(key);
        }
    }
    var selCol1 = document.getElementById('selCol1');

    for (var x in headers) {
        selCol1.options.add(new Option(headers[x], headers[x]));
    }
    selCol1.value = headers[1];

    map = createdatamap('myChart');
    updateMap(map, 'myChart', dataset[0], selCol1.value);
    tabulate(csvdatalist);
}

function changeColumn1() {
    var selCol = document.getElementById("selCol1");
    var column = selCol.value;
    updateMap(map, 'myChart', dataset[0], column);
}

function updateMap(map, id, dataset, column) {
    var onlyValues = [];
    for (var key in csvdata) {
        var item = {};
        item['numberOfThings'] = csvdata[key][column] * 100;
        if (!isNaN(item['numberOfThings'])) {
            onlyValues.push(item['numberOfThings']);
        }
        dataset[key] = item;
    }
    var minValue = Math.min.apply(null, onlyValues),
        maxValue = Math.max.apply(null, onlyValues);

    // create color palette function
    // color can be whatever you wish
    var paletteScale = d3.scale.linear()
        .domain([minValue, maxValue]) // min, max
        //.range(["#EFEFFF", "#02386F"]); // blue color
        .range(["#FF0000", "#00FF00"]);

    // fill dataset in appropriate format
    for (var key in dataset) {
        if (isNaN(dataset[key]['numberOfThings']) || (dataset[key]['numberOfThings'] === 0)) {
            //get defaultFill from map
            dataset[key]['fillColor'] = '#F5F5F5';
        }
        else {
            dataset[key]['fillColor'] = paletteScale(dataset[key]['numberOfThings']);
        }
    }

    map.updateChoropleth(dataset);
}

function createdatamap(id) {
    return new Datamap({
        element: document.getElementById(id),
        projection: 'mercator', // big world map
        // countries don't listed in dataset will be painted with this color
        fills: {defaultFill: '#F5F5F5'},
        data: {},
        geographyConfig: {
            borderColor: '#DEDEDE',
            highlightBorderWidth: 2,
            // don't change color on mouse hover
            highlightFillColor: function (geo) {
                return geo['fillColor'] || '#F5F5F5';
            },
            // only change border
            highlightBorderColor: '#B7B7B7',
            // show desired information in tooltip
            popupTemplate: function (geo, data) {
                // don't show tooltip if country don't present in dataset
                if (!data) {
                    return;
                }
                // tooltip content
                return ['<div class="hoverinfo">',
                    '<strong>', geo.properties.name, '</strong>',
                    '<br>', '<strong>', (data.numberOfThings / 100).toFixed(3), '</strong>',
                    '</div>'].join('');
            }
        }
    });
}

function csvshare() {
    /* Get the text field */
    var copyText = document.getElementById("csvlink").getAttribute("href");

    /* Select the text field */
    copyText.select();

    /* Copy the text inside the text field */
    document.execCommand("copy");

    /* Alert the copied text */
    alert("Copied the text: " + copyText.value);
}