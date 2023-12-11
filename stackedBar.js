d3.csv("Amazon_Customer_Behavior_Survey.csv").then((dataset) => {

    const dimensions = {
        width: 200,
        height: 250,
        margin: { top: 20, right: 0, bottom: 20, left: 20 },
        barPadding: 0.2
    };

    // Assuming you have parsed your CSV data into the 'dataset' variable

    // Extract unique age groups, genders, and purchase frequencies
    const ageGroups = Array.from(new Set(dataset.map(d => d['Age Group'])));
    const genders = Array.from(new Set(dataset.map(d => d.Gender)));
    const purchaseFrequencies = Array.from(new Set(dataset.map(d => d['Purchase_Frequency'])));

    const desiredOrder = ['Less than once a month', 'Once a month', 'Few times a month', 'Once a week', 'Multiple times a week'];

    // Sort purchaseFrequencies based on the desired order
    purchaseFrequencies.sort((a, b) => desiredOrder.indexOf(a) - desiredOrder.indexOf(b));


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

    const maxCombined = ageGroups.map(age => {
        return d3.max(purchaseFrequencies, frequency => {
            return d3.sum(genders, gender => {
                return d3.sum(dataset, d =>
                    (d['Age Group'] === age && d.Gender === gender && d['Purchase_Frequency'] === frequency) ? 1 : 0
                );
            });
        });
    });

    // Find the overall maximum count from the array
    const overallMax = d3.max(maxCombined);

    // Create yScale
    const yScale = d3.scaleLinear()
        .domain([0, overallMax])
        .range([dimensions.height, 0]);

    const xScale = d3.scaleBand()
        .domain(ageGroups)
        .range([0, dimensions.width])
        .padding(0.1);

    // Create a new SVG for each purchase frequency
    purchaseFrequencies.forEach((frequency, index) => {
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
                    (d['Age Group'] === age && d.Gender === gender && d['Purchase_Frequency'] === frequency) ? 1 : 0
                );
            });
            return obj;
        });

        const stack = d3.stack().keys(genders);

        // Transform the data for stacking
        const stackedData = stack(dataForStackedBar);

        // Draw the stacked bars
        svg.selectAll(".bar")
            .data(stackedData)
            .enter().append("g")
            .style("fill", d => colorScale(d.key))
            .attr("class", "bar")
            .selectAll("rect")
            .data(d => d)
            .enter().append("rect")
            .attr("x", d => xScale(d.data.age))
            .attr("y", d => yScale(d[1]))
            .attr("height", d => yScale(d[0]) - yScale(d[1]))
            .attr("width", xScale.bandwidth())

        if (index === 0) {
            svg.append("g")
                .call(d3.axisLeft(yScale));
        }

        const yLines = svg.append("g").attr("class", "y-lines");

        yLines.selectAll(".y-line")
            .data(yScale.ticks())
            .enter().append("line")
            .attr("class", "y-line")
            .attr("x1", 0)
            .attr("x2", dimensions.width)
            .attr("y1", d => yScale(d))
            .attr("y2", d => yScale(d))
            .attr("stroke", "#333333"); // Add a stroke color for visibility

        svg.append("g")
            .attr("transform", "translate(0," + dimensions.height + ")")
            .call(d3.axisBottom(xScale));

        // Add a title or other information to distinguish between SVGs
        svg.append("text")
            .attr("x", dimensions.width / 2)
            .attr("y", -dimensions.margin.top / 2)
            .attr("text-anchor", "middle")
            .style("font-size", "14px")
            .text(`${frequency}`);
    });

});