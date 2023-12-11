//Made by Trevor Rizzo
//Radar chart showing Purchase Frequency, Browsing Frequency, Cart Completion, Personalized Recommendation Use, and Shopping Satisfaction.

function createRadarChart(gender, ageGroup){
d3.csv("Amazon_Customer_Behavior_Survey.csv").then((dataset) => {

    var dimensions = {
        width: 600,
        height: 400,
        margin: {
            top: 20,
            bottom: 60,
            right: 20,
            left: 60
        }
    }

    var svg = d3.select("#visual2")
        .style("width", dimensions.width)
        .style("height", dimensions.height)
        .append("svg");
    
    svg.style("background-color", "white");

    let numAxes = 5;
    let numLevels = 5;
    let angleSlice = (Math.PI * 2) / numAxes;

    //Calculating radius scale
    let radiusScale = d3.scaleLinear().domain([0, 5]).range([0, dimensions.height / 2]);
    
    
    // Create group for the radar chart
    const radarChart = svg.append("g")
        .attr("transform", `translate(${dimensions.width / 2}, ${dimensions.height / 2})`);
    

    const reducedScale = 0.8;
    const titleMargin = 35;

    // Draw axes
    for (let i = 0; i < numAxes; i++) {
        
        const angle = i * angleSlice- 90 * (Math.PI / 180);
        const x = reducedScale*(Math.cos(angle) * dimensions.height / 2);
        const y = reducedScale*(Math.sin(angle) * dimensions.height / 2);  

    let axisName = "axis";
    switch (i){
        case 0:
            axisName = "Purchase Frequency";
            break;
        case 1:
            axisName = "Browsing Frequency";
            break;
        case 2:
            axisName = "Cart Completion Frequency";
            break;
        case 3:
            axisName = "Personalized Recommendation Use";
            break;
        case 4: 
            axisName = "Shopping Satisfaction";
            break;
        default:
            axisName = "axis";
    }    
    radarChart.append("line")
      .attr("x1", 0)
      .attr("y1", 0)
      .attr("x2", x)
      .attr("y2", y)
      .attr("stroke", "black");

    radarChart.append("text")
      .attr("x", x + (Math.sign(x) * titleMargin))
      .attr("y", y + (Math.sign(y) * titleMargin))
      .text(axisName)
      .attr("text-anchor", "middle")
      .attr("dy", "0.5em");
    }

    for (let i = 1; i <= numLevels; i++) {
        radarChart.append("circle")
          .attr("cx", 0)
          .attr("cy", 0)
          .attr("r", reducedScale* radiusScale(i))
          .attr("fill", "none")
          .attr("stroke", "gray")
          .attr("stroke-dasharray", "2 2"); 
      }

    let purchaseFrequencyOrdinal = d3.scaleOrdinal()
        .domain(['Less than once a month', 'Once a month', 'Few times a month', 'Once a week', 'Multiple times a week'])
        .range([1,2,3,4,5]);
    
    let browsingFrequencyOrdinal = d3.scaleOrdinal()
        .domain(['Rarely', 'Few times a month', 'Few times a week', 'Multiple times a day'])
        .range([1, 2, 3, 4]);
    
    let cartCompletionFrequency = d3.scaleOrdinal()
        .domain(['Never', 'Rarely', 'Sometimes', 'Often', 'Always'])
        .range([1,2,3,4,5]);

    
    var color = 'Orange';    
    if(gender && !ageGroup){
        const genderFilteredData = dataset.filter(d => d.Gender === gender);
        
        if(gender == "Male"){
            color = 'Blue';
        }
        else if(gender == "Female"){
            color = 'Pink';
        }
        else if(gender == "Others"){
            color = 'Gray';
        }
        else{ 
            color = 'White';
        }

        const averagePurchaseFrequency = d3.mean(genderFilteredData, d => purchaseFrequencyOrdinal(d.Purchase_Frequency));
        const averageBrowsingFrequency = d3.mean(genderFilteredData, d => browsingFrequencyOrdinal(d.Browsing_Frequency));
        const averageCartCompletionFrequency = d3.mean(genderFilteredData, d => cartCompletionFrequency(d.Cart_Completion_Frequency));
        const averagePersonalizedRecFrequency = d3.mean(genderFilteredData, d=> d["Personalized_Recommendation_Frequency "]);
        const averageShoppingSatisfaction = d3.mean(genderFilteredData, d=> d.Shopping_Satisfaction);
    
        var allCoordinates = genderFilteredData.map((dataPoint, index) =>{
            const dataValues = [
              averagePurchaseFrequency,
              averageBrowsingFrequency,
              averageCartCompletionFrequency,
              averagePersonalizedRecFrequency,
              averageShoppingSatisfaction
            ];
            
            return dataValues.map((value, i) => {
                const angle = i * angleSlice - 90 * (Math.PI / 180);
                const distance = radiusScale(value);
                return {
                  x: Math.cos(angle) * distance,
                  y: Math.sin(angle) * distance
                };
            });
        });
    }
    else if(ageGroup && !gender){
        var minAge;
        var maxAge;
        if(ageGroup == 1)
        {
            minAge = 10;
            maxAge = 20;
        }
        else if(ageGroup == 2)
        {
            minAge = 21;
            maxAge = 30;
        }
        else if(ageGroup == 3)
        {
            minAge = 31;
            maxAge = 40;
        }
        else if(ageGroup == 4)
        {
            minAge = 41;
            maxAge = 50;
        }
        else if(ageGroup == 5)
        {
            minAge = 51;
            maxAge = 60;
        }
        const ageFilteredData = dataset.filter(d =>{
            const age = +d.age;
            return age >= minAge && age <= maxAge;
        });
        
        const averagePurchaseFrequency = d3.mean(ageFilteredData, d => purchaseFrequencyOrdinal(d.Purchase_Frequency));
        const averageBrowsingFrequency = d3.mean(ageFilteredData, d => browsingFrequencyOrdinal(d.Browsing_Frequency));
        const averageCartCompletionFrequency = d3.mean(ageFilteredData, d => cartCompletionFrequency(d.Cart_Completion_Frequency));
        const averagePersonalizedRecFrequency = d3.mean(ageFilteredData, d=> d["Personalized_Recommendation_Frequency "]);
        const averageShoppingSatisfaction = d3.mean(ageFilteredData, d=> d.Shopping_Satisfaction);
    
        var allCoordinates = ageFilteredData.map((dataPoint, index) =>{
            const dataValues = [
              averagePurchaseFrequency,
              averageBrowsingFrequency,
              averageCartCompletionFrequency,
              averagePersonalizedRecFrequency,
              averageShoppingSatisfaction
            ];
            
            return dataValues.map((value, i) => {
                const angle = i * angleSlice - 90 * (Math.PI / 180);
                const distance = radiusScale(value);
                return {
                  x: Math.cos(angle) * distance,
                  y: Math.sin(angle) * distance
                };
            });
        });
    }
    else if(gender && ageGroup){

        if(gender == "Male"){
            color = 'Blue';
        }
        else if(gender == "Female"){
            color = 'Pink';
        }
        else if(gender == "Others"){
            color = 'Gray';
        }
        else{ 
            color = 'White';
        }

        var minAge;
        var maxAge;
        if(ageGroup == 1)
        {
            minAge = 10;
            maxAge = 20;
        }
        else if(ageGroup == 2)
        {
            minAge = 21;
            maxAge = 30;
        }
        else if(ageGroup == 3)
        {
            minAge = 31;
            maxAge = 40;
        }
        else if(ageGroup == 4)
        {
            minAge = 41;
            maxAge = 50;
        }
        else if(ageGroup == 5)
        {
            minAge = 51;
            maxAge = 60;
        }
        const genderFilteredData = dataset.filter(d => d.Gender === gender);
        const bothFilteredData = genderFilteredData.filter(d =>{
            const age = +d.age;
            return age >= minAge && age <= maxAge;
        });

        const averagePurchaseFrequency = d3.mean(bothFilteredData, d => purchaseFrequencyOrdinal(d.Purchase_Frequency));
        const averageBrowsingFrequency = d3.mean(bothFilteredData, d => browsingFrequencyOrdinal(d.Browsing_Frequency));
        const averageCartCompletionFrequency = d3.mean(bothFilteredData, d => cartCompletionFrequency(d.Cart_Completion_Frequency));
        const averagePersonalizedRecFrequency = d3.mean(bothFilteredData, d=> d["Personalized_Recommendation_Frequency "]);
        const averageShoppingSatisfaction = d3.mean(bothFilteredData, d=> d.Shopping_Satisfaction);
    
        var allCoordinates = bothFilteredData.map((dataPoint, index) =>{
            const dataValues = [
              averagePurchaseFrequency,
              averageBrowsingFrequency,
              averageCartCompletionFrequency,
              averagePersonalizedRecFrequency,
              averageShoppingSatisfaction
            ];
            
            return dataValues.map((value, i) => {
                const angle = i * angleSlice - 90 * (Math.PI / 180);
                const distance = radiusScale(value);
                return {
                  x: Math.cos(angle) * distance,
                  y: Math.sin(angle) * distance
                };
            });
        });
    }

    else{
        const averagePurchaseFrequency = d3.mean(dataset, d => purchaseFrequencyOrdinal(d.Purchase_Frequency));
        const averageBrowsingFrequency = d3.mean(dataset, d => browsingFrequencyOrdinal(d.Browsing_Frequency));
        const averageCartCompletionFrequency = d3.mean(dataset, d => cartCompletionFrequency(d.Cart_Completion_Frequency));
        const averagePersonalizedRecFrequency = d3.mean(dataset, d=> d["Personalized_Recommendation_Frequency "]);
        const averageShoppingSatisfaction = d3.mean(dataset, d=> d.Shopping_Satisfaction);


        var allCoordinates = dataset.map((dataPoint, index) =>{
            const dataValues = [
            averagePurchaseFrequency,
            averageBrowsingFrequency,
            averageCartCompletionFrequency,
            averagePersonalizedRecFrequency,
            averageShoppingSatisfaction
            ];
            
            
            return dataValues.map((value, i) => {
                const angle = i * angleSlice - 90 * (Math.PI / 180);
                const distance = radiusScale(value);
                return {
                x: Math.cos(angle) * distance,
                y: Math.sin(angle) * distance
                };
            });
        });
    }   
    
        radarChart.selectAll(".data-point")
            .data(allCoordinates[0])
            .enter().append("circle")
            .attr("class", "data-point")
            .attr("cx", d => d.x)
            .attr("cy", d => d.y)
            .attr("r", 5)
            .attr("fill", "Purple");

        
        radarChart.append("polygon")
            .data([allCoordinates[0]])
            .attr("points", d => d.map(point => `${point.x},${point.y}`).join(" "))
            .attr("fill", color)
            .attr("opacity", 0.4);

  
});
}
createRadarChart("Others");
createRadarChart("Male");