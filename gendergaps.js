// Datamaps expect data in format:
// { "USA": { "fillColor": "#42a844", numberOfWhatever: 75},
//   "FRA": { "fillColor": "#8dc386", numberOfWhatever: 43 } }
var dataset = {};

d3.queue()
    .defer(d3.csv, "output.csv", function (d) {
        var value = d.Jun_Internet_online_model * 100
        dataset[d.Country] = {numberOfThings: value, fillColor: 0};
    })
    .await(ready);

function ready(error, us) {
    if (error) throw error;
    // We need to colorize every country based on "numberOfWhatever"
    // colors should be uniq for every value.
    // For this purpose we create palette(using min/max series-value)
    var onlyValues = []
    //dataset.forEach(function(obj){ onlyValues.append(obj['numberOfThings']); });
    for (var key in dataset) {
        var item = dataset[key];
        if (!isNaN(item['numberOfThings'])) {
            onlyValues.push(item['numberOfThings']);
        }
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
        dataset[key]['fillColor'] = paletteScale(dataset[key]['numberOfThings'])
    }

    // render map
    new Datamap({
        element: document.getElementById('container1'),
        projection: 'mercator', // big world map
        // countries don't listed in dataset will be painted with this color
        fills: {defaultFill: '#F5F5F5'},
        data: dataset,
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
                    '<br>Jun_Internet_online_model: <strong>', data.numberOfThings / 100, '</strong>',
                    '</div>'].join('');
            }
        }
    });
}
