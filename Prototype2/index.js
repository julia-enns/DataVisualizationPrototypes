window.onload = function(){
    setup("TopYearlySongsAndAttributes.csv");
};

const MARGIN = {
    "LEFT":100,
    "RIGHT":100,
    "TOP":100,
    "BOTTOM":200,
};

//dimension of our workspace
const   width  = 1000,
    height = 1000;

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
            scatter = new scatterPlot(data, SVG);
        })

};

/**
 * Scatter Plot Chart object
 * @param data
 * @param svg
 */
scatterPlot = function(data, svg)
{
    //** SETUP *****************************************
    let startYear = 1970;
    let endYear = 2020;
    // let years = d3.group(data, d => d.year);
    // let uniqueYears = Array.from(years);

    //create series for each attribute
    let attributeGroupNames = data.columns.slice(8, 11);    //["energy", "instrumentalness", "valence"]

    //** SCALES *****************************************
    xScale = d3.scaleLinear()
        .domain([startYear, endYear])
        .range([MARGIN.LEFT, width - MARGIN.RIGHT]);

    yScale = d3.scaleLinear()
        .domain([0, 1])
        .range([height - MARGIN.BOTTOM, MARGIN.TOP]);

    //Colour Scale for each attribute
    let colour = d3.scaleOrdinal()
        .domain(attributeGroupNames)
        .range(["green", "blue", "red"]);

    //Creates group for scatter plot
    chart = svg.append('g')
        .attr("class", "scatterPlot")

    //** CREATE AXIS *****************************************
    //Create and draw x axis
    let yearCounter = startYear;
    let xAxis = d3.axisBottom()
        .tickFormat((d, i) =>
        {
            return yearCounter + (i*5);
        })
        .scale(xScale);
    chart.append("g")
        .attr("transform", "translate("+ 0 + ","+ (height-MARGIN.BOTTOM) +")")
        .call(xAxis);

    //Create and draw y axis
    let yAxis = d3.axisLeft().scale(yScale);
    chart.append("g")
        .attr("transform", "translate("+ MARGIN.LEFT + "," + 0 +")")
        .call(yAxis);

    //** DATA POINTS *****************************************
    chart.append("g")
        .selectAll("energyPoints")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", (d) =>
        {
            return xScale(d.year);
        })
        .attr("cy", (d) =>
        {
            return yScale(d.energy);
        })
        .attr("r", 10)
        .style("fill", colour(attributeGroupNames[0]))
        .style("opacity", "20%")
};