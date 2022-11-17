// define all variables
/*var finalSVG;
var tooltip;
var mappingString;
var map;
var pop;
var color = "color";
var border= true; */

//Define Margin
var margin = {top: 1, right: 80, bottom: 50, left: 1}, 
    width = 960 - margin.left - margin.right, 
    height = 500 - margin.top - margin.bottom;

// define svg
var svg = d3.select("body")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .style("fill", "steelblue")
    .attr("transform", "translate(" + -2500 + "," + 600 + ")");
    
// projection
// textbook
var projection = d3.geoAlbersUsa()
                   .translate([width/50, height/2])
                   .scale(10000); 

// Define Path generator, using Albers USA projection
// textbook
var path = d3.geoPath()
             .projection(projection);

// Load in GeoJSON data
// got this far, the map is really small... once i tried to use projections, it stopped printing

var color = d3.scaleThreshold()
    .domain([1, 10, 50, 200, 500, 1000, 2000, 4000])
    .range(["white", "pink", "red"]);

// legend from: https://bl.ocks.org/mbostock/5562380
var x = d3.scaleSqrt()
    .domain([0, 4500])
    .rangeRound([440, 950]);

var g = svg.append("g")
    .attr("class", "key")
    .attr("transform", "translate(0,40)"); //change this

g.selectAll("rect")
  .data(color.range().map(function(d) {
      d = color.invertExtent(d);
      if (d[0] == null) d[0] = x.domain()[0];
      if (d[1] == null) d[1] = x.domain()[1];
      return d;
    }))
  .enter().append("rect")
    .attr("height", 8)
    .attr("x", function(d) { return x(d[0]); })
    .attr("width", function(d) { return x(d[1]) - x(d[0]); })
    .attr("fill", function(d) { return color(d[0]); });

g.append("text")
    .attr("class", "caption")
    .attr("x", x.range()[0])
    .attr("y", -6)
    .attr("fill", "#000")
    .attr("text-anchor", "start")
    .attr("font-weight", "bold")
    .text("Population per square mile");

g.call(d3.axisBottom(x)
    .tickSize(13)
    .tickValues(color.domain()))
  .select(".domain")
    .remove();

// from textbook
d3.csv("us_population_data.csv", function(data) {
    color.domain([
        d3.min(data, function(d) { return d.Density; }),
        d3.max(data, function(d) { return d.Density; })
    ]);
    
    // var div = d3.select("body").append('div').attr("id", "tooltip").style("opacity", 0);
    
    d3.json("us_counties.json", function(json) {
        //Merge the population data and GeoJSON
        //Loop through once for each ag. data value
        for (var i = 0; i < data.length; i++) {
            // Grab state name
            var dataState = data[i].STATE;
            if (dataState == 34) {
                //Grab county name
                console.log(data[i].GCT_STUB);
                var dataCounty = data[i].GCT_STUB;
                
                //Grab data value, and convert from string to float
                var dataValue = parseFloat(data[i].Density);

                //Find the corresponding state inside the GeoJSON
                for (var j = 0; j < json.features.length; j++) {

                    var jsonCounty = json.features[j].properties.GEO_ID;

                    if (dataCounty == jsonCounty) {

                        //Copy the data value into the JSON
                        json.features[j].properties.value = dataValue;
                        console.log(json.features[j].properties.value)

                        //Stop looking through the JSON
                        break;

                    }
                }
                
            }
        }

    // Bind data and create one path per GeoJSON feature
    // filtering help from rahul vaidun
    svg.selectAll("path")
       .data(json.features.filter(function(d){
        return d.properties.STATE == 34;
    }))
       .enter()
       .append("path")
       .attr("d", path)
       .style("fill", color(data.properties.Density))    
    });
    /*d3.json("us_counties.json", function(json) {
               
    svg.selectAll("path")
        .data(json.features)
        .enter()
        .append("path")
        .attr("d", path)
        .style("fill", function(d) {
           //Get data value
           var value = d.properties.Density;

              if (value) {
                  //If value exists…
                  return color(value);
               } else {
                  //If value is undefined…
                  return "#ccc";
            } });
        }); */
    });


