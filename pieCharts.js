// Define the dimensions and radius of the pie chart.
const width = 200;
const height = 200;
const radius = Math.min(width, height) / 2;

// Define color scale for the pie chart segments.
const color = d3.scaleOrdinal()
    .domain(["Male", "Female", "Others", "Prefer not to say"])
    .range(["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728"]);

// Legend Labels for Gender
const genderLegendLabels = ["Male", "Female", "Others", "Prefer not to say"];

// Legend Labels for Age (may need to add other age groups as needed)
//const ageLegendLabels = ["16-25", /* Add other age groups as needed */];



// Create a function to draw the pie chart.
function drawPieChart(data, containerId, columnName, legendLabels) {
    const svg = d3.select(`#${containerId}`)
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${width / 2},${height / 2})`);

    // Extract the data for the specified column
    const columnData = d3.rollup(data, v => v.length, d => d[columnName]);

    // Convert Map to Array
    const dataArray = Array.from(columnData);

    // Generate the pie chart data.
    const pie = d3.pie().value(d => d[1]);
    const dataForPie = pie(dataArray);

    // Generate the arcs for the pie chart.
    const arc = d3.arc()
        .outerRadius(radius)
        .innerRadius(0);

    // Create the pie chart segments.
    const arcs = svg.selectAll("arc")
        .data(dataForPie)
        .enter()
        .append("g")
        .attr("class", "arc");

    arcs.append("path")
        .attr("d", arc)
        .attr("fill", d => color(d.data[0]))
        .on("click", d => {
            // Handle click event (can filter other visualizations based on the selected data).
            console.log(`Clicked on ${d.data[0]}`);
        });

    // Add a legend.
    const legend = svg.selectAll(".legend")
        .data(legendLabels)
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", (d, i) => `translate(0,${i * 20})`);

    legend.append("rect")
        .attr("x", width - 18)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", color);

    legend.append("text")
        .attr("x", width - 24)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text(d => d);
}
/*
// Load the CSV data and draw the pie charts.
d3.csv("Amazon_Customer_Behavior_Survey.csv").then(data => {
    // Draw Pie Chart for Gender
    drawPieChart(data, "pie-chart-gender-container", "Gender", genderLegendLabels);

    // Draw Pie Chart for Age
    drawPieChart(data, "pie-chart-age-container", "Age Group", ageLegendLabels);
});*/


// Load the CSV data and draw the pie charts.
d3.csv("Amazon_Customer_Behavior_Survey.csv").then(data => {
    // Draw Pie Chart for Gender
    drawPieChart(data, "pie-chart-gender-container", "Gender", genderLegendLabels);

    // Dynamically extract unique values from the "Age Group" column
    const uniqueAgeGroups = [...new Set(data.map(d => d["Age Group"]))];
    
    // Draw Pie Chart for Age with dynamic legend labels
    drawPieChart(data, "pie-chart-age-container", "Age Group", uniqueAgeGroups);
});



