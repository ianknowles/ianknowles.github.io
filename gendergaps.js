// Datamaps expect data in format:
// { "USA": { "fillColor": "#42a844", numberOfWhatever: 75},
//   "FRA": { "fillColor": "#8dc386", numberOfWhatever: 43 } }
var dataset = [{}, {}];
var csvdata = {};
var map1;
var map2;

d3.queue()
    .defer(d3.csv, "output.csv", function (d) {
        csvdata[d.Country] = d;
    })
    .await(ready);

function ready(error, us) {
    if (error) throw error;
    // We need to colorize every country based on "numberOfWhatever"
    // colors should be uniq for every value.
    // For this purpose we create palette(using min/max series-value)
    //can we get the headers from the csv read func?
    var headers = [];
    //dataset.forEach(function(obj){ onlyValues.append(obj['numberOfThings']); });
    for (var key in csvdata['USA']) {
        if ((key !== "id") && (key !== 'Country') && (key !== 'Numeric Country')) {
            headers.push(key);
        }
    }
    var selCol1 = document.getElementById('selCol1');
    var selCol2 = document.getElementById('selCol2');
    for (var x in headers) {
        selCol1.options.add(new Option(headers[x], headers[x]));
        selCol2.options.add(new Option(headers[x], headers[x]));
    }
    selCol1.value = headers[1];
    selCol2.value = headers[1];

    map1 = createdatamap('container1', dataset[0], headers[1]);
    map2 = createdatamap('container2', dataset[1], headers[1]);
    updateMap(map1, 'container1', dataset[0], headers[1]);
    updateMap(map2, 'container2', dataset[1], headers[1]);
}

function changeColumn1() {
    var selCol = document.getElementById("selCol1");
    var column = selCol.value;
    updateMap(map1, 'container1', dataset[0], column);
}

function changeColumn2() {
    var selCol = document.getElementById("selCol2");
    var column = selCol.value;
    updateMap(map2, 'container2', dataset[1], column);
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

function createdatamap(id, dataset, hovertext) {
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
                    '<br>', hovertext, ': <strong>', (data.numberOfThings / 100).toFixed(3), '</strong>',
                    '</div>'].join('');
            }
        }
    });
}