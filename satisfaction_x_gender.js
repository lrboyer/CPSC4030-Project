// Made by: Lucas Boyer
// Shopping satisfaction x gender (percentage)
d3.csv("Amazon_Customer_Behavior_Survey.csv").then((dataset) => {


    var dimensions = {
        width: 900,
        height: 600,
        margin: {
            top: 60,
            bottom: 90,
            right: 60,
            left: 60
        }
    }

    var svg = d3.select("#visual1")
        .style("width", dimensions.width)
        .style("height", dimensions.height)
        .append("g")
        .attr("transform", `translate(${dimensions.margin.left},${dimensions.margin.top})`);


    var v1Text = document.getElementById('v1Text');

    svg.style("background-color", "white");

    var genderCounts = d3.rollup(dataset, v => v.length, d => d.Gender);

    var genderSatisfactionCounts = d3.rollup(dataset, v => {
        var counts = d3.range(1, 6).map(satisfaction => {
            return {
                satisfaction: satisfaction,
                count: d3.sum(v, d => +d.Shopping_Satisfaction === satisfaction ? 1 : 0)
            };
        });
        return counts;
    }, d => d.Gender);

    var genderSatisfactionPercentages = new Map();

    genderSatisfactionCounts.forEach((satisfactions, gender) => {
        var total = genderCounts.get(gender);
        satisfactions.forEach(s => {
            s.percentage = (s.count / total) * 100;
        });
        genderSatisfactionPercentages.set(gender, satisfactions);
    });

    var xScale = d3.scaleBand()
        .domain(d3.range(1, 6).map(String))
        .range([dimensions.margin.left, dimensions.width - dimensions.margin.right])
        .padding(0.1);

    var yScale = d3.scaleLinear()
        .domain([0, 50])
        .range([dimensions.height - dimensions.margin.bottom, dimensions.margin.top]);

    var customColors = ["Magenta", "Green", "Blue", "Black"];

    var color = d3.scaleOrdinal()
        .domain(genderSatisfactionCounts.keys())
        .range(customColors);

    var line = d3.line()
        .x(d => xScale(String(d.satisfaction)) + xScale.bandwidth() / 2)
        .y(d => yScale(d.percentage));

    var genderLines = svg.selectAll(".gender-line")
        .data(Array.from(genderSatisfactionPercentages.values()))
        .enter()
        .append("path")
        .attr("class", "gender-line")
        .attr("d", d => line(d))
        .style("stroke", (d, i) => color(Array.from(genderSatisfactionPercentages.keys())[i]))
        .style("fill", "none")
        .on('mouseover', function (d, i) {
            var genderData = i; // Array containing satisfaction counts for the specific gender

            var textContent = "";
            genderData.forEach(count => {
                textContent += `Satisfaction ${count.satisfaction}: ${count.percentage.toFixed(2)}%\n`;
            });

            v1Text.textContent = textContent;

            // Retrieve the x and y coordinates of the hovered point using D3's mouse event
            var [mouseX, mouseY] = d3.mouse(this);
            var xValue = xScale.invert(mouseX); // Get the x value from the scale using the mouse position
            var closestPoint = genderData.find(d => d.satisfaction == xValue); // Find the closest data point
            var hoveredX = xScale(String(closestPoint.satisfaction)) + xScale.bandwidth() / 2;
            var hoveredY = yScale(closestPoint.percentage);

            // Append a single circle to highlight the hovered data point
            svg.append("circle")
                .attr("class", "highlight-circle")
                .attr("cx", hoveredX)
                .attr("cy", hoveredY)
                .attr("r", 4) // Radius of the circle
                .style("fill", "red"); // Color of the circle, adjust as needed
        })


    // Add x-axis
    svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0,${dimensions.height - dimensions.margin.bottom})`)
        .call(d3.axisBottom(xScale));

    svg.append("text")
        .attr("class", "x-label")
        .attr("text-anchor", "middle")
        .attr("x", dimensions.width / 2)
        .attr("y", dimensions.height - 10)
        .text("Shopping Satisfaction Levels");


    // Add y-axis
    svg.append("g")
        .attr("class", "y-axis")
        .attr("transform", `translate(${dimensions.margin.left},0)`)
        .call(d3.axisLeft(yScale).tickFormat(d => `${d}%`));

    svg.append("text")
        .attr("class", "y-label")
        .attr("text-anchor", "middle")
        .attr("x", -(dimensions.height / 2))
        .attr("y", 10)
        .attr("transform", "rotate(-90)")
        .attr("dy", ".5em") // Adjust vertical padding (move text up)
        .text("Percentage of Gender");


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
