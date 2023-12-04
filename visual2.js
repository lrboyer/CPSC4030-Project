d3.csv("Amazon_Customer_Behavior_Survey.csv").then((dataset) => {
    const dimensions = {
        width: 800,
        height: 400,
        margin: { top: 20, right: 60, bottom: 60, left: 60 },
        barPadding: 0.2
    };

    const svg = d3.select("#test")
        .append("svg")
        .attr("width", dimensions.width + dimensions.margin.left + dimensions.margin.right)
        .attr("height", dimensions.height + dimensions.margin.top + dimensions.margin.bottom)
        .append("g")
        .attr("transform", `translate(${dimensions.margin.left},${dimensions.margin.top})`);

    const satisfactionLevels = d3.range(1, 6);
    const genders = Array.from(new Set(dataset.map(d => d.Gender)));

    const genderCounts = genders.map(gender => ({
        gender: gender,
        count: dataset.filter(d => d.Gender === gender).length
    }));

    const totalCount = dataset.length;

    // Calculate percentages based on total count across all genders
    const dataByGender = genders.map(gender => ({
        gender: gender,
        values: satisfactionLevels.map(level => {
            const count = dataset.filter(d => d.Gender === gender && +d.Shopping_Satisfaction === level).length;
            return {
                satisfaction: level,
                percentage: count / totalCount * 100 || 0
            };
        })
    }));

    dataByGender.forEach(genderData => {
        const totalPercentage = genderData.values.reduce((total, value) => total + value.percentage, 0);
        console.log(`Total percentage for ${genderData.gender}: ${totalPercentage}`);
    });

    const xScale = d3.scaleBand()
        .domain(satisfactionLevels.map(String))
        .range([0, dimensions.width])
        .padding(dimensions.barPadding);

    const yScale = d3.scaleLinear()
        .domain([0, 40])
        .range([dimensions.height, 0]);

    const color = d3.scaleOrdinal()
        .domain(genders)
        .range(d3.schemeCategory10);

    const barGroups = svg.selectAll(".barGroup")
        .data(dataByGender)
        .enter()
        .append("g")
        .attr("class", "barGroup")
        .attr("fill", d => color(d.gender))
        .selectAll("rect")
        .data(d => d.values)
        .enter()
        .append("rect")
        .attr("x", d => xScale(String(d.satisfaction)))
        .attr("y", d => yScale(d.percentage))
        .attr("width", xScale.bandwidth())
        .attr("height", d => dimensions.height - yScale(d.percentage));

    svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0, ${dimensions.height})`)
        .call(d3.axisBottom(xScale).tickSize(0))
        .selectAll("text")
        .attr("transform", "rotate(-45)")
        .attr("text-anchor", "end");

    svg.append("g")
        .attr("class", "y-axis")
        .call(d3.axisLeft(yScale).ticks(5));

    const legend = svg.selectAll(".legend")
        .data(genders)
        .enter()
        .append("g")
        .attr("class", "legend")
        .attr("transform", (d, i) => `translate(0,${i * 20})`);

    legend.append("rect")
        .attr("x", dimensions.width - 18)
        .attr("width", 18)
        .attr("height", 18)
        .attr("fill", color);

    legend.append("text")
        .attr("x", dimensions.width - 24)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text(d => d);

    svg.append("text")
        .attr("transform", `translate(${dimensions.width / 2},${dimensions.height + dimensions.margin.top + 10})`)
        .style("text-anchor", "middle")
        .text("Satisfaction Levels");

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - dimensions.margin.left)
        .attr("x", 0 - (dimensions.height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Percentage");
});