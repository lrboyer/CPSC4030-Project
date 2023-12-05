//Made by Trevor Rizzo
//Browsing Frequency By Gender (%)

d3.csv("Amazon_Customer_Behavior_Survey.csv").then((dataset) => {
    console.log(dataset)

    var dimensions = {
        width: 900,
        height: 600,
        margin: {
            top: 20,
            bottom: 60,
            right: 20,
            left: 60
        }
    }

    var svg = d3.select("#visual2")
        .style("width", dimensions.width)
        .style("height", dimensions.height);

    svg.style("background-color", "white");


    var genderCounts = d3.rollup(dataset, v => v.length, d => d.Gender);

    let browsingOrdinal = d3.scaleOrdinal()
        .domain(['Rarely', 'Few times a month', 'Few times a week', 'Multiple times a day'])
        .range([1, 2, 3, 4]);

    var genderBrowsingCounts = d3.rollup(dataset, v => {
        var counts = d3.range(1, 5).map(browsing => {
            return {
                browsing: browsing,
                count: d3.sum(v, d => +browsingOrdinal(d.Browsing_Frequency) === browsing ? 1 : 0)
            };
        });
        return counts;
    }, d => d.Gender);


    var genderBrowsingPercent = new Map();

    genderBrowsingCounts.forEach((browsing, gender) => {
        var tot = genderCounts.get(gender);
        browsing.forEach(b => {
            b.percentage = (b.count / tot) * 100;
        });
        genderBrowsingPercent.set(gender, browsing);
    });

    var xScale = d3.scaleBand()
        .domain(d3.range(1, 5).map(String))
        .range([dimensions.margin.left, dimensions.width - dimensions.margin.right])
        .padding(0.1);

    var minPercent = d3.min(Array.from(genderBrowsingPercent.values()).flat(), d => d.percentage);
    var maxPercent = d3.max(Array.from(genderBrowsingPercent.values()).flat(), d => d.percentage);

    var yScale = d3.scaleLinear()
        .domain([minPercent, maxPercent])
        .range([dimensions.height - dimensions.margin.bottom, dimensions.margin.top + 50]);

    var genderColors = ["Blue", "Magenta", "Grey", "Black"];

    var color = d3.scaleOrdinal()
        .domain(['Male', 'Female', 'Others', 'Prefer not to say'])
        .range(genderColors);

    var line = d3.line()
        .x(d => xScale(String(d.browsing)) + xScale.bandwidth() / 2)
        .y(d => yScale(d.percentage));



    var genderLines = svg.selectAll(".gender-line")
        .data(Array.from(genderBrowsingPercent.values()))
        .enter()
        .append("path")
        .attr("class", "gender-line")
        .attr("d", d => line(d))
        .style("stroke", (d, i) => color(Array.from(genderBrowsingPercent.keys())[i]))
        .style("fill", "none");


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
        .text("Browsing Frequency Levels");


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
        .attr("dy", ".5em")
        .text("Percentage of Gender");

    // Add legend
    const orderedGenders = ["Male", "Female", "Prefer not to say", "Others"]

    var legend = svg.selectAll(".legend")
        .data(orderedGenders)
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


    function updateVis(gender) {
        if (gender != "All") {
            var genderData = [genderBrowsingPercent.get(gender)];
            var newGenderLine = svg.selectAll(".gender-line")
                .data(genderData);

            newGenderLine.exit().remove();

            newGenderLine.enter()
                .append("path")
                .attr("class", "gender-line")
                .merge(newGenderLine)
                .transition()
                .duration(100)
                .attr("d", d => line(d))
                .style("stroke", color(gender))
                .style("fill", "none");
        }
        else {
            var genderData = Array.from(genderBrowsingPercent.values());
            var newGenderLine = svg.selectAll(".gender-line")
                .data(genderData);

            newGenderLine.exit().remove();

            newGenderLine.enter()
                .append("path")
                .attr("class", "gender-line")
                .merge(newGenderLine)
                .transition()
                .duration(100)
                .attr("d", d => line(d))
                .style("stroke", (d, i) => color(Array.from(genderBrowsingPercent.keys())[i]))
                .style("fill", "none");
        }



    }

    var selected = d3.select("#genderFilter");
    selected.on("change", function () {
        var selection = selected.property("value");
        updateVis(selection);
    });

});


