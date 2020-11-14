window.onload = function(){
    setup("data.csv");
};

const MARGIN = {
    "LEFT":100,
    "RIGHT":100,
    "TOP":100,
    "BOTTOM":100,
};

//dimension of our workspace
const   width  = 1500,
    height = 1000;

/**
 * This function loads the data and calls other necessary functions to create our visualization
 * @param dataPath - the path to your data file from the project's root folder
 */
setup = function (dataPath) {
    //Load in  Data with D3 and call stackedBarChart
    data = d3.csv(dataPath)
        .then(function (data)
        {
            console.log(data);
            line = new lineGraph(data);
        })

};


lineGraph = function (data) {
    // set the dimensions and margins of the graph
    var margin = {top: 20, right: 30, bottom: 30, left: 55},
        width = 460 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

    // append the svg object to the body of the page
    var svg = d3.select("#SVG_CONTAINER")
        .append("svg")
        // .attr("width", width + margin.left + margin.right)
        // .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");


    // List of groups = header of the csv files
    console.log(data);
    let attributes = data.columns.slice(8, 11);

    // Add X axis
    var x = d3.scaleLinear()
        .domain(d3.extent(data, function (d) {
            return d.year;
        }))
        .range([0, width]);
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).ticks(10).tickFormat(d3.format("d")));

    // Add Y axis
    var y = d3.scaleLinear()
        .domain([0, 3])
        .range([height, 0]);
    svg.append("g")
        .call(d3.axisLeft(y));

    // color palette
    let color = d3.scaleOrdinal()
        .domain(attributes)
        .range(["green", "blue", "red"]);

    //Create x and y axis labels
    let xLabel = "Year";
    let yLabel = "Attribute Measurement"

    svg.append("text")
        .attr("class", "x_label")
        .attr("text-anchor", "end")
        .attr("x", width / 2)
        .attr("y", height + 30)
        .attr("font-size", "15px")
        .text(xLabel);

    svg.append("text")
        .attr("class", "y_label")
        .attr("text-anchor", "end")
        .attr("transform", "rotate(-90 " + (MARGIN.LEFT - 40) + " " + (height / 2 - MARGIN.TOP) + ")")
        .attr("x", MARGIN.TOP - 60)
        .attr("y", height / 2 - MARGIN.LEFT * 2)
        .text(yLabel);

    let xLegend = width;
    let yLegend = MARGIN.TOP;

    //Colour encoding
    svg.append("text")
        .attr("x", xLegend)
        .attr("y", yLegend - 30)
        .attr("font-weight", "bold")
        .text("Attributes")

    for(let i = 0; i < attributes.length; i++)
    {
        svg.append("circle")
            .attr("cx", xLegend)
            .attr("cy", yLegend)
            .attr("r", 6)
            .style("fill", color(attributes[i]));
        svg.append("text")
            .attr("x", xLegend + 20)
            .attr("y", yLegend)
            .style("font-size", "10px")
            .text(attributes[i]);

        yLegend += 20;
    }

    //Calculate averages
    let attributeSeries = d3.group(data, d => d.year);
    let groupByYearArray = Array.from(attributeSeries);
    for (let i = 0; i < attributes.length; i++) {
        for (let j = 0; j < groupByYearArray.length; j++) {
            let result = 0;
            for (let k = 0; k < 10; k++) {
                if(attributes[i] === "energy")
                    result = parseFloat(result) + parseFloat(groupByYearArray[j][1][k].energy);
                else if(attributes[i] === "instrumentalness")
                    result = parseFloat(result) + parseFloat(groupByYearArray[j][1][k].instrumentalness);
                else if(attributes[i] === "valence")
                    result = parseFloat(result) + parseFloat(groupByYearArray[j][1][k].valence);
            }
            groupByYearArray[j].push(result / 10);
        }
    }

    var keys = [2, 3, 4];

    //stack the data?
    var stackedData = d3.stack()
        .keys(keys)
        (groupByYearArray);

    console.log("This is the stack result: ", stackedData);

    // Show the areas
    svg
    .selectAll("mylayers")
    .data(stackedData)
    .enter()
    .append("path")
    .style("fill", function(d) { return color(attributes[d.key-2]); })
    .attr("d", d3.area()
    .x(function(d, i) { return x(d.data[0]); })
    .y0(function(d) { return y(d[0]); })
    .y1(function(d) { return y(d[1]); })
    );
};
