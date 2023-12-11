let xScale;
let yScale;

let createStackedBarChart = dataset => {
    const dimensions = {
        width: 250,
        height: 300,
        margin: { top: 20, right: 0, bottom: 40, left: 70 },
        barPadding: 0.2
    };

    const ageGroups = Array.from(new Set(dataset.map(d => d['Age Group'])));
    ageGroups.sort((a, b) => {
        const ageA = parseInt(a.split('-')[0]);
        const ageB = parseInt(b.split('-')[0]);
        return ageA - ageB;
    });

    const genders = Array.from(new Set(dataset.map(d => d.Gender)));

    const purchaseFrequencies = Array.from(new Set(dataset.map(d => d['Purchase_Frequency'])));
    const desiredOrder = ['Less than once a month', 'Once a month', 'Few times a month', 'Once a week', 'Multiple times a week'];
    purchaseFrequencies.sort((a, b) => desiredOrder.indexOf(a) - desiredOrder.indexOf(b));

    let customColors = ["Magenta", "Black", "Blue", "Gray"];
    const colorScale = d3.scaleOrdinal()
        .domain(genders)
        .range(customColors);

    //finds the overall max for the y axis
    const maxCombined = ageGroups.map(age => {
        return d3.max(purchaseFrequencies, frequency => {
            return d3.sum(genders, gender => {
                return d3.sum(dataset, d =>
                    (d['Age Group'] === age && d.Gender === gender && d['Purchase_Frequency'] === frequency) ? 1 : 0
                );
            });
        });
    });
    const overallMax = d3.max(maxCombined);

    //create the scales
    yScale = d3.scaleLinear()
        .domain([0, overallMax])
        .range([dimensions.height, 0]);

    xScale = d3.scaleBand()
        .domain(ageGroups)
        .range([0, dimensions.width])
        .padding(0.1);

    // Create a new SVG for each purchase frequency
    purchaseFrequencies.forEach((frequency, index) => {
        let svg = null
        if (index == 0) { //margin is different on first 1 b/c added y axis labels
            svg = d3.select("#stackedBar").append("svg")
                .attr("width", dimensions.width + dimensions.margin.left + dimensions.margin.right)
                .attr("height", dimensions.height + dimensions.margin.top + dimensions.margin.bottom)
                .append("g")
                .attr("transform", "translate(" + dimensions.margin.left + "," + dimensions.margin.top + ")");
        }
        else {
            svg = d3.select("#stackedBar").append("svg")
                .attr("width", dimensions.width + 10 + dimensions.margin.right)
                .attr("height", dimensions.height + dimensions.margin.top + dimensions.margin.bottom)
                .append("g")
                .attr("transform", "translate(" + 10 + "," + dimensions.margin.top + ")");
        }
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
        const stackedData = stack(dataForStackedBar);

        //Tooltip popup
        let Tooltip = d3.select("#stackedBar")
            .append("div")
            .style("opacity", 0)
            .attr("class", "tooltip")
            .style("background-color", "white")
            .style("border", "solid")
            .style("border-width", "2px")
            .style("border-radius", "5px")
            .style("padding", "5px");

        let mouseover = function (d) {
            Tooltip
                .style("opacity", 1);
            d3.select(this)
                .style("stroke", "black")
                .style("opacity", 1);
        };

        let mousemove = function (event, d) {
            let PF = event.target.id.split("_")[2]
            Tooltip
                .html(`Purchase Frequency: ${PF}<br>Age Group: ${d.data.age}<br>Gender: ${d.key}<br>Count: ${d[1] - d[0]}`)
                .style("position", "absolute")
                .style("top", (event.pageY + 10) + "px")
                .style("left", (event.pageX + 10) + "px");
        };

        let mouseleave = function (d) {
            Tooltip
                .style("opacity", 0);
            d3.select(this)
                .style("stroke", "none")
                .style("opacity", 0.8);
        };

        // Draw the stacked bars
        svg.selectAll(".bar")
            .data(stackedData)
            .enter().append("g")
            .style("fill", d => colorScale(d.key))
            .attr("class", "bar")
            .selectAll("rect")
            .data(d => d.map(point => ({ ...point, key: d.key })))
            .enter().append("rect")
            .attr("x", d => xScale(d.data.age))
            .attr("y", d => yScale(d[1]))
            .attr("height", d => yScale(d[0]) - yScale(d[1]))
            .attr("width", xScale.bandwidth())
            .attr("id", d => `${d.data.age}_${d.key}_${frequency}`)
            .on("mouseover", mouseover)
            .on("mousemove", mousemove)
            .on("mouseleave", mouseleave);

        //y axis only on the first chart
        if (index === 0) {
            svg.append("g")
                .call(d3.axisLeft(yScale));

            svg.append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", -dimensions.margin.left + 23)
                .attr("x", -dimensions.height / 2)
                .attr("dy", "1em")
                .style("text-anchor", "middle")
                .text("Purchase Frequency Count");
        }

        //add lines for the y axis
        const yLines = svg.append("g").attr("class", "y-lines");
        yLines.selectAll(".y-line")
            .data(yScale.ticks())
            .enter().append("line")
            .attr("class", "y-line")
            .attr("x1", 0)
            .attr("x2", dimensions.width)
            .attr("y1", d => yScale(d))
            .attr("y2", d => yScale(d))
            .attr("stroke", "#BBBBBB");

        //x axis
        svg.append("g")
            .attr("transform", "translate(0," + dimensions.height + ")")
            .call(d3.axisBottom(xScale));

        if (index == 2) {
            svg.append("text")
                .attr("transform", "translate(" + (dimensions.width / 2) + " ," +
                    (dimensions.height + dimensions.margin.top + 15) + ")")
                .style("text-anchor", "middle")
                .text("Age Groups");
        }

        // Title for each chart
        svg.append("text")
            .attr("x", dimensions.width / 2)
            .attr("y", -dimensions.margin.top / 2)
            .attr("text-anchor", "middle")
            .style("font-size", "14px")
            .text(`${frequency}`);
    });

    //add legend
    const svg = d3.select("#stackedBar").append("svg")
        .attr("width", 150)
        .attr("height", dimensions.height)

    const legend = svg.append("g")
        .attr("class", "legend")
        .attr("transform", `translate(10, ${dimensions.height / 3})`);

    const legendItems = legend.selectAll(".legend-item")
        .data(genders)
        .enter().append("g")
        .attr("class", "legend-item")
        .attr("transform", (d, i) => "translate(0," + i * 20 + ")");

    legendItems.append("rect")
        .attr("x", 0)
        .attr("width", 15)
        .attr("height", 15)
        .attr("fill", colorScale);

    legendItems.append("text")
        .attr("x", 20)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "start")
        .text(d => d);

};

let updateStackedBarChart = dataset => {

    const ageGroups = Array.from(new Set(dataset.map(d => d['Age Group'])));
    ageGroups.sort((a, b) => {
        const ageA = parseInt(a.split('-')[0]);
        const ageB = parseInt(b.split('-')[0]);
        return ageA - ageB;
    });

    const genders = Array.from(new Set(dataset.map(d => d.Gender)));

    const purchaseFrequencies = Array.from(new Set(dataset.map(d => d['Purchase_Frequency'])));
    const desiredOrder = ['Less than once a month', 'Once a month', 'Few times a month', 'Once a week', 'Multiple times a week'];
    purchaseFrequencies.sort((a, b) => desiredOrder.indexOf(a) - desiredOrder.indexOf(b));

    const maxCombined = ageGroups.map(age => {
        return d3.max(purchaseFrequencies, frequency => {
            return d3.sum(genders, gender => {
                return d3.sum(dataset, d =>
                    (d['Age Group'] === age && d.Gender === gender && d['Purchase_Frequency'] === frequency) ? 1 : 0
                );
            });
        });
    });

    const overallMax = d3.max(maxCombined);

    xScale.domain(ageGroups);
    yScale.domain([0, overallMax]);

    const stack = d3.stack().keys(genders);

    //Tooltip popup
    let Tooltip = d3.select("#stackedBar")
        .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "2px")
        .style("border-radius", "5px")
        .style("padding", "5px");

    let mouseover = function (d) {
        Tooltip
            .style("opacity", 1);
        d3.select(this)
            .style("stroke", "black")
            .style("opacity", 1);
    };

    let mousemove = function (event, d) {
        let PF = event.target.id.split("_")[2]
        Tooltip
            .html(`Purchase Frequency: ${PF}<br>Age Group: ${d.data.age}<br>Gender: ${d.key}<br>Count: ${d[1] - d[0]}`)
            .style("position", "absolute")
            .style("top", (event.pageY + 10) + "px")
            .style("left", (event.pageX + 10) + "px");
    };

    let mouseleave = function (d) {
        Tooltip
            .style("opacity", 0);
        d3.select(this)
            .style("stroke", "none")
            .style("opacity", 0.8);
    };

    // Select the SVG group containing the bars
    const bars = d3.select("#stackedBar").selectAll(".bar")
        .data(stack(dataset), d => d.key);

    console.log(bars)

    // Update existing bars
    bars.selectAll("rect")
        .data(d => d)
        .transition()
        .duration(500)
        .attr("y", d => yScale(d[1]))
        .attr("height", d => yScale(d[0]) - yScale(d[1]));

    // Enter new bars
    bars.enter().append("g")
        .attr("class", "bar")
        .style("fill", d => colorScale(d.key))
        .selectAll("rect")
        .data(d => d)
        .enter().append("rect")
        .attr("x", d => xScale(d.data.age))
        .attr("y", d => yScale(d[1]))
        .attr("height", d => yScale(d[0]) - yScale(d[1]))
        .attr("width", xScale.bandwidth())
        .attr("id", d => `${d.data.age}_${d.key}`)
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave);

    // Exit old bars
    bars.exit().remove();
}

window.createStackedBarChart = createStackedBarChart;