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
const   width  = 1500,
    height = 800;

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
    let years = d3.group(data, d => d.year);
    let uniqueYears = Array.from(years);

    //create series for each attribute
    let attributeGroupNames = data.columns.slice(8, 11);    //["energy", "instrumentalness", "valence"]

    //Creates group for scatter plot
    chartEnergy = svg.append('g')
        .attr("class", "scatterPlot")
    chartInstrumental = svg.append('g')
        .attr("class", "scatterPlot")
    chartValence = svg.append('g')
        .attr("class", "scatterPlot")

    chartArray = [chartEnergy, chartInstrumental, chartValence];

    //Height between charts for vertical transformation
    let padding = 20;
    let chartDistance = padding + height-MARGIN.BOTTOM-MARGIN.TOP;

    //** SCALES *****************************************
    xScale = d3.scaleLinear()
        .domain([startYear, endYear])
        .range([MARGIN.LEFT, width - MARGIN.RIGHT]);

    yScale = d3.scaleLinear()
        .domain([0, 1])
        .range([height - MARGIN.BOTTOM, MARGIN.TOP]);

    //Colour Scale for each attribute
    let colourScale = d3.scaleOrdinal()
        .domain(attributeGroupNames)
        .range(["green", "blue", "red"]);

    //** CREATE AXIS *****************************************
    //Create and draw x axis
    let xAxis = d3.axisBottom()
        .scale(xScale)
        .ticks(uniqueYears.length/5)
        .tickFormat(d3.format("d"));

    //Create and draw y axis
    let yAxis = d3.axisLeft().scale(yScale);

    //Draw axis and labels
    for(let i = 0; i < attributeGroupNames.length; i++)
    {
        //xAxis
        chartArray[i].append("g")
            .attr("transform", "translate("+ 0 + ","+ ((height-MARGIN.BOTTOM) + (chartDistance*i)) +")")
            .call(xAxis);

        //yAxis
        chartArray[i].append("g")
            .attr("transform", "translate("+ MARGIN.LEFT + "," + (chartDistance*i) +")")
            .call(yAxis);

        //yAxis label
        let yLabel = attributeGroupNames[i];
        chartArray[i].append("text")
            .attr("class", "y_label")
            .attr("text-anchor", "end")
            .attr("transform", "rotate(-90 " + (MARGIN.LEFT - 40) + " " + ( chartDistance*(i+1) - MARGIN.BOTTOM )+")")
            .attr("x", MARGIN.LEFT - 40)
            .attr("y", (chartDistance*(i+1) - MARGIN.BOTTOM))
            .text(yLabel);
    }

    //Add x Axis label
    let xLabel = "Year";
    svg.append("text")
        .attr("class", "x_label")
        .attr("text-anchor", "end")
        .attr("x", width/2 + 50)
        .attr("y", (height-MARGIN.BOTTOM ) * 3 - MARGIN.TOP)
        .text(xLabel);

    //Draw legend
    let xLegend = width;
    let yLegend = MARGIN.BOTTOM;
    for(let i = 0; i < attributeGroupNames.length; i++)
    {
        svg.append("circle")
            .attr("cx", xLegend)
            .attr("cy", yLegend)
            .attr("r", 6)
            .style("fill", colourScale(attributeGroupNames[i]));
        svg.append("text")
            .attr("x", xLegend + 20)
            .attr("y", yLegend)
            .attr("r", 6)
            .style("font-size", "15px")
            .text(attributeGroupNames[i]);

        yLegend += 30;
    }

    //** DATA POINTS *****************************************
    //Create point for each attribute
    for(let i = 0; i < attributeGroupNames.length; i++)
    {
        let y = attributeGroupNames[i];
        let yValue = function(d) {return d[y]};        //get attribute value for row

        data.forEach(function (d) {
            d[y] = +d[y];
        });

        chartArray[i].append("g")
            .selectAll("points" + i)
            .data(data)
            .enter()
            .append("circle")
            .attr("class", "dot-" + attributeGroupNames[i])
            .attr("cx", (d) =>
            {
                return xScale(d.year);
            })
            .attr("cy", (d) => yScale(yValue(d)) + + (chartDistance*i))
            .attr("r", 6)
            //.attr("r", d=> (20 - (d.songyear_pos*2)))           //popularity represented by size
            .style("fill", colourScale(attributeGroupNames[i]))
            //.style("opacity", "40%")
            .style("opacity", (d => (100 - (d.songyear_pos * 9))/100));     //popularity represented by opacity
    }

};