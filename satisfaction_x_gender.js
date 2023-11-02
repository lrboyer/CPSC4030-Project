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

    var genderCounts = d3.rollup(dataset, v => v.length, d => d.Gender);

    // Compute the total count of each gender for each shopping satisfaction level
    var genderSatisfactionCounts = d3.rollup(dataset, v => {
        var counts = d3.range(1, 6).map(satisfaction => {
            return {
                satisfaction: satisfaction,
                count: d3.sum(v, d => +d.Shopping_Satisfaction === satisfaction ? 1 : 0)
            };
        });
        return counts;
    }, d => d.Gender);

    // Calculate the percentage for each satisfaction level for each gender
    var genderSatisfactionPercentages = new Map();

    genderSatisfactionCounts.forEach((satisfactions, gender) => {
        var total = genderCounts.get(gender);
        satisfactions.forEach(s => {
            s.percentage = (s.count / total) * 100;
        });
        genderSatisfactionPercentages.set(gender, satisfactions);
    });

    var xScale = d3.scaleBand()
        .domain(d3.range(1, 6).map(String)) // Shopping satisfaction levels 1-5 as strings
        .range([dimensions.margin.left, dimensions.width - dimensions.margin.right])
        .padding(0.1);

    var yScale = d3.scaleLinear()
        .domain([0, d3.max(Array.from(genderSatisfactionPercentages.values()).flatMap(d => d.map(s => s.percentage)))])
        .range([dimensions.height - dimensions.margin.bottom, dimensions.margin.top]);

    var color = d3.scaleOrdinal()
        .domain(genderSatisfactionCounts.keys())
        .range(d3.schemeCategory10);

    var stackedData = d3.stack()
        .keys(genderSatisfactionCounts.keys())
        .value((d, key) => d.percentage)
        (Array.from(genderSatisfactionPercentages.values()));

    var bars = svg.selectAll(".bar-group")
        .data(stackedData)
        .enter()
        .append("g")
        .attr("class", "bar-group")
        .attr("fill", d => color(d.key));

    bars.selectAll("rect")
        .data(d => d)
        .enter()
        .append("rect")
        .attr("x", d => xScale(String(d.data.satisfaction)))
        .attr("y", d => yScale(d[1]))
        .attr("width", xScale.bandwidth())
        .attr("height", d => yScale(d[0]) - yScale(d[1]));

    // Add x-axis
    svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0,${dimensions.height - dimensions.margin.bottom})`)
        .call(d3.axisBottom(xScale));

    // Add y-axis
    svg.append("g")
        .attr("class", "y-axis")
        .attr("transform", `translate(${dimensions.margin.left},0)`)
        .call(d3.axisLeft(yScale).tickFormat(d => `${d}%`));

    // Add legend
    var legend = svg.selectAll(".legend")
        .data(genderSatisfactionCounts.keys())
        .enter()
        .append("g")
        .attr("class", "legend")
        .attr("transform", (d, i) => `translate(0,${i * 20})`);

    legend.append("rect")
        .attr("x", dimensions.width - dimensions.margin.right - 18)
        .attr("width", 18)
        .attr("height", 18)
        .attr("fill", d => color(d));

    legend.append("text")
        .attr("x", dimensions.width - dimensions.margin.right - 24)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text(d => d);
});