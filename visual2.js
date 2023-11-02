d3.csv("Amazon_Customer_Behavior_Survey.csv").then((dataset) => {

    console.log(dataset)

    var dimensions = {
        width: 700,
        height: 500,
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

})