d3.csv("Amazon_Customer_Behavior_Survey.csv").then((dataset) => {

    const dimensions = {
        width: 600,
        height: 500,
        margin: { top: 20, right: 60, bottom: 60, left: 60 },
        barPadding: 0.2
    };

    // Assuming you have parsed your CSV data into the 'dataset' variable

    // Extract unique age groups, genders, and purchase frequencies
    const ageGroups = Array.from(new Set(dataset.map(d => d['Age Group'])));
    const genders = Array.from(new Set(dataset.map(d => d.Gender)));
    const purchaseFrequencies = Array.from(new Set(dataset.map(d => d['Purchase Frequency'])));

    // Sort the age groups (you can customize the sort order as needed)
    ageGroups.sort((a, b) => {
        const ageA = parseInt(a.split('-')[0]);
        const ageB = parseInt(b.split('-')[0]);
        return ageA - ageB;
    });

    // Create color scale
    const colorScale = d3.scaleOrdinal()
        .domain(genders)
        .range(d3.schemeCategory10);

    // Create a new SVG for each purchase frequency
    purchaseFrequencies.forEach(frequency => {
        const svg = d3.select("#stackedBar").append("svg")
            .attr("width", dimensions.width + dimensions.margin.left + dimensions.margin.right)
            .attr("height", dimensions.height + dimensions.margin.top + dimensions.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + dimensions.margin.left + "," + dimensions.margin.top + ")");

        // Create dataForStackedBar for the specific purchase frequency
        const dataForStackedBar = ageGroups.map(age => {
            const obj = { age: age };
            genders.forEach(gender => {
                obj[gender] = d3.sum(dataset, d =>
                    (d['Age Group'] === age && d.Gender === gender && d['Purchase Frequency'] === frequency) ? 1 : 0
                );
            });
            return obj;
        });

        // Create scales
        const xScale = d3.scaleBand()
            .domain(ageGroups)
            .range([0, dimensions.width])
            .padding(0.1);

        const yScale = d3.scaleLinear()
            .domain([0, d3.max(dataForStackedBar, d => d3.sum(Object.values(d)))])
            .range([dimensions.height, 0]);

        console.log(dataForStackedBar)

        // Draw the stacked bars
        svg.selectAll(".bar")
            .data(dataForStackedBar)
            .enter().append("g")
            .attr("class", "bar")
            .selectAll("rect")
            .data(d => Object.keys(d).filter(key => key !== 'age'))
            .enter().append("rect")
            .attr("x", d => xScale(d))
            .attr("y", d => yScale(dataForStackedBar[d.age][d]))
            .attr("height", d => dimensions.height - yScale(dataForStackedBar[d.age][d]))
            .attr("width", xScale.bandwidth())
            .style("fill", d => colorScale(d.split('-')[0]));

        // Create x-axis
        svg.append("g")
            .attr("transform", "translate(0," + dimensions.height + ")")
            .call(d3.axisBottom(xScale));

        // Create y-axis
        svg.append("g")
            .call(d3.axisLeft(yScale));

        // Add a title or other information to distinguish between SVGs
        svg.append("text")
            .attr("x", dimensions.width / 2)
            .attr("y", -dimensions.margin.top / 2)
            .attr("text-anchor", "middle")
            .style("font-size", "14px")
            .text(`Purchase Frequency: ${frequency}`);
    });


});