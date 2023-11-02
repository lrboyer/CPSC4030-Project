//Made by: Lucas Boyer
//shopping satisfaction x gender (percentage)
d3.csv("Amazon_Customer_Behavior_Survey.csv").then((dataset) => {

    console.log(dataset)

    var dimensions = {
        width: 700,
        height: 500,
        margin: {
            top: 20,
            bottom: 60,
            right: 20,
            left: 60
        }
    }

    var svg = d3.select("#visual1")
        .style("width", dimensions.width)
        .style("height", dimensions.height)

    var xScale = d3.scaleLinear()
        .domain(d3.extent(dataset, d => +d.year))
        .range([dimensions.margin.left, dimensions.width - dimensions.margin.right])

    var yScale = d3.scaleLinear().domain([0, maxSum])
        .range([dimensions.height - dimensions.margin.bottom, dimensions.margin.top])

    var bars = svg.append("g")
        .selectAll("rect")
        .data(dataset)
        .enter()
        .append("rect")
        .attr("x", d => xScale(+d.year))
        .attr("y", d => yScale(+d[name]))
        .attr("width", 5)
        .attr("height", d => dimensions.height - dimensions.margin.bottom - yScale(+d[name]))
        .attr("fill", "blue")
})