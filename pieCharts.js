// Define a global variable to store the selected data
let selectedData = {
    "Gender": null,
    "Age Group": null
};

// Define the dimensions and radius of the pie chart.
const width = 200;
const height = 200;
const radius = Math.min(width, height) / 2;

// Legend Labels for Gender
const genderLegendLabels = ["Male", "Female", "Others", "Prefer not to say"];

const uniqueAgeGroups = ["0-20", "21-30", "31-40", "41-50", "51-65"];

const genderColors = {
    "Male": "blue",
    "Female": "magenta",
    "Others": "red",
    "Prefer not to say": "black"
};

// Define specific colors for age categories
const ageColors = {
    "0-20": "#f0fff0", // Lightest pastel green
    "21-30": "#d9ead3",
    "31-40": "#a9dfbf",
    "41-50": "#77c4a7",
    "51-65": "#4d9f83", // Darkest pastel green
    
};


// Create a function to draw the pie chart.
function drawPieChart(data, containerId, columnName, legendLabels) {

    // Define color scale for the pie chart segments.
    let color;
    if (columnName === "Gender") {
        color = d3.scaleOrdinal()
            .domain(legendLabels)
            .range(legendLabels.map(label => genderColors[label]));
    } else if (columnName === "Age Group") {
        color = d3.scaleOrdinal()
            .domain(legendLabels)
            .range(legendLabels.map(label => ageColors[label]));
    }
    legendLabels.sort((a, b) => Object.keys(ageColors).indexOf(a) - Object.keys(ageColors).indexOf(b));
    


    const svg = d3.select(`#${containerId}`)
        //.append("svg")
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
        .on("mouseover", function (d) {
            // Handle hover event (enlarge the slice).
            d3.select(this).transition()
                .duration(100)
                .attr("d", d => arc.innerRadius(0).outerRadius(radius * 1.1)(d))
                .style("stroke", "black")
                .style("stroke-width", 2);
        })
        .on("mouseout", function (d, event) {
            //console.log("mouseout");
            //console.log(event);
            if (selectedData[columnName] !== event.data[0]) {
                // Handle mouseout event (restore the slice size).
                d3.select(this).transition()
                    .duration(100)
                    .attr("d", d => arc.innerRadius(0).outerRadius(radius)(d))
                    .style("stroke", "none");
            }
            
        })
        .on("click", function (d, event) {
            // Handle click event (update global filter variable).
            if (selectedData[columnName] === event.data[0]) {
                // If already selected, deselect it
                selectedData[columnName] = null;
            } else {
                //selectedData[columnName] = event.data[0];
                // Deselect the previously selected slice
                if (selectedData[columnName] !== null) {
                    const previouslySelected = arcs.filter((arc) => arc.data[0] === selectedData[columnName]);
                    previouslySelected.select("path")
                        .transition()
                        .duration(100)
                        .attr("d", d => arc.innerRadius(0).outerRadius(radius)(d))
                        .style("stroke", "none");
                }

                // Select the new slice
                selectedData[columnName] = event.data[0];
                
            }

            // Update the chart based on the selected data
            //updateCharts();

            // Log the selected data (you can replace this with your own logic)
            /*console.log(`Selected ${event}`);
            console.log(event);
            console.log(event.data);
            console.log(event.data[0]);*/
            createRadarChart(selectedData["Gender"], selectedData["Age Group"]);
        });

    // Add a legend.
    const legend = svg.selectAll(".legend")
        .data(legendLabels)
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", (d, i) => `translate(-${width*1.6},${i * 20 - height/5})`);

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


// Load the CSV data and draw the pie charts.
d3.csv("Amazon_Customer_Behavior_Survey.csv").then(data => {
    // Draw Pie Chart for Gender
    drawPieChart(data, "pie-chart-gender", "Gender", genderLegendLabels);

    // Dynamically extract unique values from the "Age Group" column
    //const uniqueAgeGroups = [...new Set(data.map(d => d["Age Group"]))];
    
    // Draw Pie Chart for Age with dynamic legend labels
    drawPieChart(data, "pie-chart-age", "Age Group", uniqueAgeGroups);
});


