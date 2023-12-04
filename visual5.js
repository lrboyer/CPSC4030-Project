// Load the data from the CSV file
d3.csv("Amazon_Customer_Behavior_Survey.csv").then(function(data) {
    // Filter the data by gender and purchase frequency for men
    var filteredDataMen = data.filter(function(d) {
        return d.Gender === "Male" && d.Purchase_Frequency;
    });

    // Prepare the data by counting purchase frequencies
    var purchaseFrequencyCountsMen = d3.rollup(filteredDataMen, v => v.length, d => d.Purchase_Frequency);

    // Convert the data to an array of objects
    var pieDataMen = Array.from(purchaseFrequencyCountsMen, ([key, value]) => ({ category: key, count: value }));

    // Set up the SVG dimensions for the men's pie chart
    var widthMen = 500;
    var heightMen = 500;
    var radiusMen = Math.min(widthMen, heightMen) / 2;

    var categoryOrder = ["Multiple times a week", "Once a week", "Few times a month", "Once a month", "Less than once a month"];

    // Create a color scale
    var color = d3.scaleOrdinal()
        .domain(categoryOrder)
        .range(["#c7e9c0", "#a1d99b", "#74c476", "#41ab5d", "#238b45"]); // good green
    
    // Create a pie layout
    var pie = d3.pie()
        .value(function(d) { return d.count; })
        .sort(function(a, b) {
            return categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category);
        });
    
    // Create an SVG element
    var svgMen = d3.select("#pie-chart-men")
        .attr("width", widthMen)
        .attr("height", heightMen)
        .append("g")
        .attr("transform", "translate(" + widthMen / 2 + "," + heightMen / 2 + ")");
    
    // Create the pie chart arcs
    var arc = d3.arc()
        .innerRadius(0)
        .outerRadius(radiusMen);
    
    // Create the pie chart slices
    var slices = svgMen.selectAll("path")
        .data(pie(pieDataMen))
        .enter()
        .append("path")
        .attr("d", arc)
        .attr("fill", function(d, i) { return color(d.data.category); });

    // Create a separate selection for labels for men
    var labelsMen = svgMen.selectAll("text")
        .data(pie(pieDataMen))
        .enter()
        .append("text")
        .attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; })
        .attr("dy", ".35em")
        .style("text-anchor", "middle")
        .text(function(d) { return d.data.category; });

    // Add a legend for men
    var legendMen = svgMen.selectAll(".legend")
        .data(pieDataMen)
        .enter()
        .append("g")
        .attr("class", "legend")
        .attr("transform", function(d, i) { return "translate(" + (widthMen / 2 + 20) + "," + (i * 20 - 50) + ")"; });

    legendMen.append("rect")
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", function(d) { return color(d.category); });

    legendMen.append("text")
        .attr("x", 24)
        .attr("y", 9)
        .attr("dy", ".35em")
        .text(function(d) { return d.category; });
});
