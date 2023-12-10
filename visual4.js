var legend;

var womenSlices;
var colorWomen;

var colorArrayFemale = ["#ff3399", "#ff66b2", "#ff99cc", "#ffccd5", "#ffe6eb"];

// Load the data from the CSV file
d3.csv("Amazon_Customer_Behavior_Survey.csv").then(function (data) {
    // Filter the data by gender and purchase frequency
    var filteredData = data.filter(function (d) {
        return d.Gender === "Female" && d.Purchase_Frequency;
    });

    // Prepare the data by counting purchase frequencies
    var purchaseFrequencyCounts = d3.rollup(filteredData, v => v.length, d => d.Purchase_Frequency);

    // Convert the data to an array of objects
    var pieData = Array.from(purchaseFrequencyCounts, ([key, value]) => ({ category: key, count: value }));

    // Set up the SVG dimensions
    var width = 500;
    var height = 500;
    var radius = Math.min(width, height) / 2;


    var categoryOrder = ["Multiple times a week", "Once a week", "Few times a month", "Once a month", "Less than once a month"];

    // Create a color scale
    colorWomen = d3.scaleOrdinal()
        .domain(categoryOrder)
        .range(colorArrayFemale);
    //.range(["#ff3399", "#ff66b2", "#ff99cc", "#ffccd5", "#ffe6eb"]); // decent pink
    //.range(["#c7e9c0", "#a1d99b", "#74c476", "#41ab5d", "#238b45"]); // good green

    // Create a pie layout
    var pie = d3.pie()
        .value(function (d) { return d.count; })
        .sort(function (a, b) {
            return categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category);
        });

    // Create an SVG element
    var svg = d3.select("#pie-chart-women")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    // Create the pie chart arcs
    var arc = d3.arc()
        .innerRadius(0)
        .outerRadius(radius);

    // Create the pie chart slices
    womenSlices = svg.selectAll("path")
        .data(pie(pieData))
        .enter()
        .append("path")
        .attr("d", arc)
        .attr("fill", function (d, i) { return colorWomen(d.data.category); })
        .on("mouseover", function (event, d) {
            //console.log("Mouseover data: " + d);
            // Emphasize the selected slice
            d3.select(this)
                .transition()
                .duration(100)
                .attr("d", d3.arc().innerRadius(0).outerRadius(radius + 10))
                .attr("stroke", "black")  // Add a black border
                .attr("stroke-width", 2);

            var correspondingSliceMen = menSlices.filter(function (stuff) {
                return stuff.data.category === d.data.category;
            });

            correspondingSliceMen.transition()
                .duration(100)
                .attr("stroke", "black")  // Add a black border
                .attr("stroke-width", 2);

        })
        .on("mouseout", function (event, d) {
            // Reset the emphasized slice on mouseout
            d3.select(this)
                .transition()
                .duration(100)
                .attr("d", arc)
                .attr("fill", function (d) { return colorWomen(d.data.category); })
                .attr("stroke", "none");

            var correspondingSliceMen = menSlices.filter(function (stuff) {
                return stuff.data.category === d.data.category;
            });

            correspondingSliceMen.transition()
                .duration(100)
                .attr("d", arc)
                .attr("fill", function (d) { return colorMen(d.data.category); })
                .attr("stroke", "none");
        });


    // Create a separate selection for labels
    var labels = svg.selectAll("text")
        .data(pie(pieData))
        .enter()
        .append("text")
        .attr("transform", function (d) { return "translate(" + arc.centroid(d) + ")"; })
        .attr("dy", ".35em")
        .style("text-anchor", "middle")
        .text(function (d) { return d.data.category; });

    // Sort pieDataMen based on the order in categoryOrder
    pieData.sort(function (a, b) {
        return categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category);
    });

    /*// Add a legend
    legend = svg.selectAll(".legend")
        .data(pieData)
        .enter()
        .append("g")
        .attr("class", "legend")
        .attr("transform", function(d, i) { return "translate(" + (width / 2 + 40) + "," + (i * 20 - 50) + ")"; });

    legend.append("rect")
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", function(d) { return color(d.category); });

    legend.append("text")
        .attr("x", 24)
        .attr("y", 9)
        .attr("dy", ".35em")
        .text(function(d) { return d.category; });*/




});


