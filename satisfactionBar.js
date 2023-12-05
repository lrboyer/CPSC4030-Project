d3.csv("Amazon_Customer_Behavior_Survey.csv").then((dataset) => {
    const dimensions = {
        width: 800,
        height: 400,
        margin: { top: 20, right: 60, bottom: 60, left: 60 },
        barPadding: 0.2
    };

    const svg = d3.select("#barSatisfaction")
        .attr("width", dimensions.width + dimensions.margin.left + dimensions.margin.right)
        .attr("height", dimensions.height + dimensions.margin.top + dimensions.margin.bottom)
        .style("background-color", "white")
        .append("g")
        .attr("transform", `translate(${dimensions.margin.left},${dimensions.margin.top})`);



    const satisfactionLevels = d3.range(1, 6);
    const genders = Array.from(new Set(dataset.map(d => d.Gender)));

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

        var totalPercentage = satisfactions.reduce((total, value) => total + value.percentage, 0);

        genderSatisfactionPercentages.set(gender, satisfactions);
    });

    // Restructure the data for stacked bar chart
    const dataForStackedBar = satisfactionLevels.map(level => {
        const obj = { satisfaction: level };
        genders.forEach(gender => {
            const percentage = genderSatisfactionPercentages.get(gender).find(s => s.satisfaction === level).percentage;
            obj[gender] = percentage;
        });
        return obj;
    });

    const xScale = d3.scaleBand()
        .domain(satisfactionLevels.map(String))
        .range([0, dimensions.width])
        .padding(dimensions.barPadding);

    const yScale = d3.scaleLinear()
        .domain([0, 150]) // Adjust the domain based on your data
        .range([dimensions.height, 0]);

    var customColors = ["Magenta", "Black", "Blue", "Gray"];

    const color = d3.scaleOrdinal()
        .domain(genders)
        .range(customColors);

    svg.selectAll()
        .data(d3.stack().keys(genders)(dataForStackedBar))
        .enter().append("g")
        .attr("fill", d => color(d.key))
        .selectAll("rect")
        .data(d => d)
        .enter().append("rect")
        .attr("x", d => xScale(String(d.data.satisfaction)))
        .attr("y", d => yScale(d[1]))
        .attr("height", d => yScale(d[0]) - yScale(d[1]))
        .attr("width", xScale.bandwidth());


    svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0, ${dimensions.height})`)
        .call(d3.axisBottom(xScale)) // Add ticks to the x-axis
        .selectAll("text")
        .attr("dy", "0.5em")  // Adjust vertical position
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(0)"); // Set the rotation to 0 degrees

    svg.append("text")
        .attr("class", "x-label")
        .attr("text-anchor", "middle")
        .attr("x", dimensions.width / 2)
        .attr("y", dimensions.height + 30) // Adjust the vertical position
        .text("Shopping Satisfaction Levels");

    svg.append("g")
        .attr("class", "y-axis")
        .call(d3.axisLeft(yScale).ticks(5).tickFormat(d => `${d}%`)); // Add percentage sign to y-axis labels

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - dimensions.margin.left)
        .attr("x", 0 - (dimensions.height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Percentage of Gender");


    const orderedGenders = ["Male", "Female", "Prefer not to say", "Others"]
    const legend = svg.selectAll(".legend")
        .data(orderedGenders)
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
});
