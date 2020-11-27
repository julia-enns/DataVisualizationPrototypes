window.onload = function(){
    setup("data.csv");
};

const MARGIN = {
    "LEFT":50,
    "RIGHT":50,
    "TOP":50,
    "BOTTOM":50,
};

//dimension of our workspace
const   width  = 850,
    height = 600;

/**
 * This function loads the data and calls other necessary functions to create our visualization
 * @param dataPath - the path to your data file from the project's root folder
 */
setup = function (dataPath) {
    //Define reference for svg
    let SVG = d3.select("#SVG_CONTAINER");

    //Load in  Data with D3 and call stackedBarChart
    data = d3.csv(dataPath)
        .then(function (data)
        {
            console.log(data);
            line = new lineGraph(data, SVG);
        })

};

lineGraph = function (data, svg) {

    // append the svg object to the body of the page
    chart = svg.append('g')
        .attr("class", "lineGraph")

    // List of groups = header of the csv files
    let attributes = data.columns.slice(8, 11);

    //** SCALES *****************************************
    // X scale
    xScale = d3.scaleLinear()
        .domain(d3.extent(data, function (d) {
            return d.year;
        }))
        .range([MARGIN.LEFT, width - MARGIN.RIGHT]);

    // Y scale
    yScale = d3.scaleLinear()
        .domain([0, 3])
        .range([height - MARGIN.BOTTOM, MARGIN.TOP]);

    //Colour Scale for each attribute
    let color = d3.scaleOrdinal()
        .domain(attributes)
        .range(["green", "blue", "red"]);

    //** CREATE AXIS *****************************************
    let xAxis = d3.axisBottom()
        .scale(xScale)
        .ticks(10)
        .tickFormat(d3.format("d"))

    let yAxis = d3.axisLeft().scale(yScale);

    chart.append("g")
        .attr("class", "xAxis")
        .attr("transform", "translate("+ 0 + ","+ (height-MARGIN.BOTTOM) +")")
        .call(xAxis);

    chart.append("g")
        .attr("class", "yAxis")
        .attr("transform", "translate("+ MARGIN.LEFT + "," + 0 +")")
        .call(yAxis);

    //Create x and y axis labels
    let xLabel = "Year";
    let yLabel = "Attribute Measurement"

    chart.append("text")
        .attr("class", "x_label")
        .attr("text-anchor", "end")
        .attr("x", width / 2)
        .attr("y", height + 30)
        .attr("font-size", "15px")
        .text(xLabel);

    chart.append("text")
        .attr("class", "y_label")
        .attr("text-anchor", "end")
        .attr("transform", "rotate(-90 " + (MARGIN.LEFT - 40) + " " + (height / 2 - MARGIN.TOP) + ")")
        .attr("x", MARGIN.TOP - 60)
        .attr("y", height / 2 - MARGIN.LEFT * 2)
        .text(yLabel);

    //** CREATE LEGEND *****************************************
    let xLegend = width;
    let yLegend = MARGIN.TOP;

    legend = svg.append("g").attr("class", "legend");

    //Colour encoding legend
    legend.append("text")
        .attr("x", xLegend)
        .attr("y", yLegend - 30)
        .attr("font-weight", "bold")
        .text("Attributes")

    for(let i = 0; i < attributes.length; i++)
    {
        legend.append("circle")
            .attr("cx", xLegend)
            .attr("cy", yLegend)
            .attr("r", 6)
            .style("fill", color(attributes[i]));
        legend.append("text")
            .attr("x", xLegend + 20)
            .attr("y", yLegend)
            .style("font-size", "10px")
            .text(attributes[i]);

        yLegend += 20;
    }

    //** DATA POINTS *****************************************
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
    finishedStack = chart.selectAll("stack")
    .data(stackedData)
    .enter()
    .append("path")
    .style("fill", function(d) { return color(attributes[d.key-2]); })
    .attr("d", d3.area()
    .x(function(d, i) { return xScale(d.data[0]); })
    .y0(function(d) { return yScale(d[0]); })
    .y1(function(d) { return yScale(d[1]); })
    )
    .attr("class", d => "stack " + attributes[d.key - 2]);

};
