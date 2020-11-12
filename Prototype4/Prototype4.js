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

    //Sort data by lowest rank to highest rank (songyear_pos)
    //so that higher ranked data points show up in front of lower ranked
    data.sort(function(x, y){
        return d3.descending(x.songyear_pos, y.songyear_pos);
    })

    //** SCALES *****************************************
    xScale = d3.scaleLinear()
        .domain([startYear, endYear])
        .range([MARGIN.LEFT, width - MARGIN.RIGHT]);

    yScale = d3.scaleLinear()
        .domain([0, 1])
        .range([height - MARGIN.BOTTOM, MARGIN.TOP]);


    //Colour Scale for rank (heatmap)
    let heatMapColours = ["#1F2D86", "#3E9583", "#FFFFDD"]
    let colourScale = d3.scaleLinear()
        .domain([0, 5, 10])
        .range(heatMapColours);

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

    //** CREATE LEGEND *****************************************
    //Define linear gradient of legend
    var linearGradient = svg.append("defs")
        .append("linearGradient")
        .attr("id", "linear-gradient")
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "0%")
        .attr("y2", "100%");
    linearGradient.selectAll("stop")
        .data( colourScale.range() )
        .enter().append("stop")
        .attr("offset", function(d,i) { return i/(colourScale.range().length-1); })
        .attr("stop-color", function(d) { return d; });

    //Rectangle legend
    let xPosLegend = width;
    let yPosLegend = MARGIN.BOTTOM;
    let legendWidth = 50;
    let legendHeight = 300;
    svg.append("rect")
        .attr("x", xPosLegend)
        .attr("y", yPosLegend)
        .attr("width", legendWidth)
        .attr("height", legendHeight)
        .style("fill", "url(#linear-gradient)");

    //Define legend axis scale
    let heatMapAxisScale = d3.scaleLinear()
        .range([0, legendHeight])
        .domain([1, 10]);
    let heatMapAxis = d3.axisLeft().ticks(10).scale(heatMapAxisScale);
    svg.append("g")
    .attr("transform", "translate("+ xPosLegend + ","+ yPosLegend +")")
    .call(heatMapAxis);

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
            //.attr("r", d=> (d.score/1.5))        //score represented by size
            .style("fill", d => colourScale(d.songyear_pos))      //popularity represented by heatmap colours
            .style("opacity", "80%");
    }

};