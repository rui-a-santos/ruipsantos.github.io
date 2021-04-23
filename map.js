// creates svg and sets its size
let svg = d3.select("svg");
let width = parseInt(svg.attr("width"));
let height = parseInt(svg.attr("height"));

// creates the map to be used later using the Miller projection
var path = d3.geoPath();
var projection = d3.geoMiller()
    .scale(100)
    .center([0, 20])
    .translate([width / 2, height / 2]);

// creates a map for each months data and the country data
var dataJan = d3.map();
var dataFeb = d3.map();
var dataMar = d3.map();
var dataApr = d3.map();
var dataCountry = d3.map();

// creates the colour scale to be used in the choropleth
// d3.scheme method based on idea from Yan Holtz seen below:
// https://www.d3-graph-gallery.com/graph/choropleth_hover_effect.html
var colorScale = d3.scaleLinear()
    .domain([0, 10, 20, 30, 40, 50])
    .range(d3.schemePurples[6]);

// creates an svg for the legend of choropleth
// creating the legend method has been retrieved from Steve Nae's idea seen below:
// http://bl.ocks.org/stevenae/8362841
var legend = d3.select("#mapLegendDiv")
    .append("svg:svg")
    .attr("width", 240)
    .attr("height", 15)

// sets the position and colour of each rectangle on the legend
for (var i = 0; i <= 5; i++) {
    legend.append("svg:rect")
        .attr("x", i*30)
        .attr("height", 15)
        .attr("width", 30)
        .attr("class", "legend" + i); // sets the colour of each rectangle
};

// creates the tooltip to highlight individual country data
var tooltip = d3.select("body")
    .append("div")
    .attr('class', 'tooltip')
    .style("position", "absolute")
    .style("visibility", "hidden");

// loads the dataset and the country coordinates json file
d3.queue()
    .defer(d3.json, "countries.json")
    .defer(d3.csv, "vaccineDataQ1.csv", function (d) {
        if(d.month == "Jan"){
            dataJan.set(d.code, +d.vaccinationsPer100);
        } else if (d.month == "Feb") {
            dataFeb.set(d.code, +d.vaccinationsPer100);
        } else if (d.month == "Mar") {
            dataMar.set(d.code, +d.vaccinationsPer100);
        } else if (d.month == "Apr") {
            dataApr.set(d.code, +d.vaccinationsPer100);
        }
        dataCountry.set(d.code, d.country);
    })
    .await(ready);

// function called after loading in
// Map draw method based on idea from Yan Holtz seen below:
// https://www.d3-graph-gallery.com/graph/choropleth_hover_effect.html
function ready(error, topo) {
    // draws the map
    var countryMap = svg.append("g")
        // draws the map using the countries.json as the topojson
        .selectAll("path")
        .data(topo.features)
        .enter()
        .append("path")

        // draw each country onto projection
        .attr("d", d3.geoPath()
            .projection(projection)
        )

        // set the color of each country
        .attr("fill", function (d) {
            d.total = dataJan.get(d.id) || 0;
            return colorScale(d.total);
        })

        // set the country border color and width
        .attr("data-html", "true")
        //.style("stroke", "#bcbddc")
        .style("stroke", "black")
        .style("stroke-width", 0.25)
        .style("opacity", .8)

        // sets actions for the user's mouse
        // viewing tooltip method based on idea from AJ Welch seen below:
        // https://chartio.com/resources/tutorials/how-to-show-data-on-mouseover-in-d3js/
        .on("mouseover", function(d){tooltip.html(dataCountry.get(d.id) +"<br>"+ "Vaccine doses per 100: " + dataJan.get(d.id)); return tooltip.style("visibility", "visible");})
        .on("mousemove", function(){return tooltip.style("top", (d3.event.pageY-10)+"px").style("left",(d3.event.pageX+10)+"px");})
        .on("mouseout", function(){return tooltip.style("visibility", "hidden");});

    // function to update the month data being displayed in the visualization
    function update(month){
        slider.property("value", month);
        // loads data depending on the month slider
        countryMap.attr("fill", function (d) {
            if(month == 1){
                d3.select(".month").text("January");
                d.total = dataJan.get(d.id) || 0;
                countryMap.on("mouseover", function(d){tooltip.html(dataCountry.get(d.id) +"<br>"+ "Vaccine doses per 100: " + dataJan.get(d.id)); return tooltip.style("visibility", "visible");})
            } else if (month == 2) {
                d3.select(".month").text("February");
                d.total = dataFeb.get(d.id) || 0;
                countryMap.on("mouseover", function(d){tooltip.html(dataCountry.get(d.id) +"<br>"+ "Vaccine doses per 100: " + dataFeb.get(d.id)); return tooltip.style("visibility", "visible");})
            } else if (month == 3) {
                d3.select(".month").text("March");
                d.total = dataMar.get(d.id) || 0;
                countryMap.on("mouseover", function(d){tooltip.html(dataCountry.get(d.id) +"<br>"+ "Vaccine doses per 100: " + dataMar.get(d.id)); return tooltip.style("visibility", "visible");})
            } else if (month == 4) {
                d3.select(".month").text("April");
                d.total = dataApr.get(d.id) || 0;
                countryMap.on("mouseover", function(d){tooltip.html(dataCountry.get(d.id) +"<br>"+ "Vaccine doses per 100: " + dataApr.get(d.id)); return tooltip.style("visibility", "visible");})
            }
            // returns the new colour to be filled in each country based on month chosen
            return colorScale(d.total);
        })
    }

    // creates a slider action that changes the month being displayed
    // slider var based on idea from Doug Dowson seen below:
    // http://bl.ocks.org/dougdowson/9832019
    var slider = d3.select(".slider")
        .append("input")
        .attr("type", "range")
        .attr("min", 1) // January
        .attr("max", 4) // April
        .attr("step", 1) // increments every month
        .on("input", function() {
            var month = this.value;
            update(month);
        });

    // sets the first month to be displayed as January
    update(1);
}
