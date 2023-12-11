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

    // Extract unique age groups and genders
    const ageGroups = Array.from(new Set(dataset.map(d => d['Age Group'])));
    ageGroups.sort((a, b) => {
        // Custom sorting logic here, for example, sorting by age range
        // You might need to adjust this based on your specific use case
        const ageA = parseInt(a.split('-')[0]);
        const ageB = parseInt(b.split('-')[0]);
        return ageA - ageB;
    });

    const genders = Array.from(new Set(dataset.map(d => d.Gender)));

    const countsByAge = ageGroups.map(age => ({
        age: age,
        count: d3.sum(dataset, d => d['Age Group'] === age ? 1 : 0)
    }));

    const xScale = d3.scaleBand()
        .domain(ageGroups)
        .range([0, dimensions.width])
        .padding(0.1);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(countsByAge, d => d.count)])
        .range([dimensions.height, 0]);

    const dataForStackedBar = ageGroups.map(age => {
        const obj = { age: age };
        genders.forEach(gender => {
            obj[gender] = d3.sum(dataset, d => (d['Age Group'] === age && d.Gender === gender) ? 1 : 0);
        });
        return obj;
    });

    const stack = d3.stack().keys(genders);

    // Transform the data for stacking
    const stackedData = stack(dataForStackedBar);

    const colorScale = d3.scaleOrdinal()
        .domain(genders)
        .range(d3.schemeCategory10);

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

    // Add axes
    svg.append("g")
        .attr("transform", "translate(0," + dimensions.height + ")")
        .call(d3.axisBottom(xScale));

    // Create y-axis
    svg.append("g")
        .call(d3.axisLeft(yScale));
});
