d3.csv("Amazon_Customer_Behavior_Survey.csv").then((dataset) => {
    const dimensions = {
        width: 600,
        height: 500,
        margin: { top: 20, right: 60, bottom: 60, left: 60 },
        barPadding: 0.2
    };

    const svg = d3.select("#genderCountBar")
        .attr("width", dimensions.width + dimensions.margin.left + dimensions.margin.right)
        .attr("height", dimensions.height + dimensions.margin.top + dimensions.margin.bottom)
        .style("background-color", "white")
        .append("g")
        .attr("transform", `translate(${dimensions.margin.left},${dimensions.margin.top})`);

    var genderShoppingFrequencyCounts = d3.rollup(dataset, v => {
        var counts = {};
        v.forEach(d => {
            var frequency = d.Purchase_Frequency;
            counts[frequency] = counts[frequency] || { Male: 0, Female: 0, "Prefer not to say": 0, Others: 0 };
            counts[frequency][d.Gender]++;
        });
        return counts;
    }, d => d.Purchase_Frequency);

    // Flatten the data for the bar chart
    var dataForBarChart = Array.from(genderShoppingFrequencyCounts, ([frequency, counts]) => ({ frequency, ...counts }));

    // Extract unique categories (genders) dynamically from the data
    const genders = ["Male", "Female", "Prefer not to say", "Others"];
    const purchaseFrequencies = dataForBarChart.map(d => d.frequency);

    // Transpose the data for stacking
    const transposedData = genders.map(gender => ({
        gender,
        values: dataForBarChart.map(d => ({ frequency: d.frequency, value: d[d.frequency][gender] || 0 }))
    }));

    // Set up scales
    const xScale = d3.scaleBand()
        .domain(purchaseFrequencies)
        .range([0, dimensions.width])
        .padding(dimensions.barPadding);

    const yScale = d3.scaleLinear()
        .domain([0, 200])
        .range([dimensions.height, 0]);

    var customColors = ["Magenta", "Black", "Blue", "Gray"];

    const colorScale = d3.scaleOrdinal()
        .domain(genders)
        .range(d3.schemeCategory10);


    console.log(dataForBarChart)
    console.log(transposedData)
    // Create stacked bars
    svg.selectAll(".bar")
        .data(d3.stack().keys(genders)(dataForBarChart))
        .enter().append("g")
        .attr("fill", d => colorScale(d.gender))
        .selectAll("rect")
        .data(d => d.values)
        .enter().append("rect")
        .attr("x", d => xScale(d.frequency))
        .attr("y", d => yScale(d.value))
        .attr("height", d => dimensions.height - yScale(d.value))
        .attr("width", xScale.bandwidth());

    // Add axes
    svg.append("g")
        .attr("transform", "translate(0," + dimensions.height + ")")
        .call(d3.axisBottom(xScale));

    svg.append("g")
        .call(d3.axisLeft(yScale));
});
