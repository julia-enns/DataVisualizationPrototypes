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

    let years = d3.group(data, d => d.year);
    let uniqueYears = Array.from(years);

    let decades = Array.from(d3.group(data, d => d.decade));
    let decadesList = [];
    for(let i = 0; i < decades.length; i++)
    {
        decadesList.push(decades[i][0])
    }

    //create series for each attribute
    let attributeGroupNames = data.columns.slice(8, 11);    //["energy", "instrumentalness", "valence"]

    //Creates group for scatter plot
    chart = svg.append('g')
        .attr("class", "scatterPlot")

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
        .tickFormat(d3.format("d"))
        .tickPadding(15);

    chart.append("g")
        .attr("transform", "translate("+ 0 + ","+ (height-MARGIN.BOTTOM) +")")
        .call(xAxis);

    //Create and draw y axis
    let yAxis = d3.axisLeft().scale(yScale).tickPadding(10);
    chart.append("g")
        .attr("transform", "translate("+ MARGIN.LEFT + "," + 0 +")")
        .call(yAxis);

    //Create x and y axis labels
    let xLabel = "Year";
    let yLabel = "Percent"

    chart.append("text")
        .attr("class", "x_label")
        .attr("text-anchor", "end")
        .attr("x", width/2 + 50)
        .attr("y", height-MARGIN.BOTTOM + 50)
        .text(xLabel);

    chart.append("text")
        .attr("class", "y_label")
        .attr("text-anchor", "end")
        .attr("transform", "rotate(-90 " + (MARGIN.LEFT - 40) + " " + (height/2 - 50)+")")
        .attr("x", MARGIN.LEFT - 40)
        .attr("y", height/2 - 50)
        .text(yLabel);

    //Draw legend
    xLegend = width;
    yLegend = MARGIN.BOTTOM;
    for(let i = 0; i < attributeGroupNames.length; i++)
    {
        chart.append("circle")
            .attr("cx", xLegend)
            .attr("cy", yLegend)
            .attr("r", 6)
            .style("fill", colourScale(attributeGroupNames[i]));
        chart.append("text")
            .attr("x", xLegend + 20)
            .attr("y", yLegend)
            .attr("r", 6)
            .style("font-size", "15px")
            .text(attributeGroupNames[i]);

        yLegend += 30;
    }

    //** DATA POINTS *****************************************
    //Create point for each attribute
    /*let symbolType = d3.scaleOrdinal()
        .domain(decadesList)
        .range([d3.symbolDiamond, d3.symbolSquare, d3.symbolStar, d3.symbolCircle, d3.symbolTriangle]);

    console.log(decadesList);
    console.log(symbolType(decadesList[0]).toString());

    var symbol = d3.symbol();

    for(let i = 0; i < attributeGroupNames.length; i++)
    {
        let y = attributeGroupNames[i];
        let yValue = function (d) {
            return d[y]
        };        //get attribute value for row

        data.forEach(function (d) {
            d[y] = +d[y];
        });

        var dots = chart.selectAll("points")
            .data(data)
            .enter()
            .append("path");

        dots.attr("d", symbol.size(d => 100 - (d.songyear_pos * 5)).type(d => symbolType(d.decade)))
            .attr('fill', colourScale(attributeGroupNames[i]))
            .attr('stroke','#000')
            .attr('stroke-width',1)
            .attr('transform',function(d){ return "translate("+xScale(d.year)+","+yScale(yValue(d))+")"; });
    }*/

    //Try 2
    // let symbolType = d3.scaleOrdinal()
    //     .domain(attributeGroupNames)
    //     .range([d3.symbolDiamond, d3.symbolStar, d3.symbolCircle]);
    //
    // console.log(decadesList);
    // console.log(symbolType(decadesList[0]).toString());
    //
    // var symbol = d3.symbol();
    //
    // for(let i = 0; i < attributeGroupNames.length; i++)
    // {
    //     let y = attributeGroupNames[i];
    //     let yValue = function (d) {
    //         return d[y]
    //     };        //get attribute value for row
    //
    //     data.forEach(function (d) {
    //         d[y] = +d[y];
    //     });
    //
    //     var dots = chart.selectAll("points")
    //         .data(data)
    //         .enter()
    //         .append("path");
    //
    //     dots.attr("d", symbol.size( d=> 200 - (d.songyear_pos * 20)).type(d => symbolType(attributeGroupNames[i])))
    //         .attr('fill', colourScale(attributeGroupNames[i]))
    //         .attr('stroke','#000')
    //         .attr('stroke-width',1)
    //         .attr("opacity", "60%")
    //         .attr('transform',function(d){ return "translate("+xScale(d.year)+","+yScale(yValue(d))+")"; });
    // }


       for(let i = 0; i < attributeGroupNames.length; i++)
       {
           let y = attributeGroupNames[i];
           let yValue = function(d) {return d[y]};        //get attribute value for row

           data.forEach(function (d) {
               d[y] = +d[y];
           });

           chart.append("g")
               .selectAll("points")
               .data(data)
               .enter()
               .append("circle")
               .attr("class", "dot-" + attributeGroupNames[i])
               .attr("cx", (d) => {
                   return xScale(d.year);
               })
               .attr("cy", (d) => yScale(yValue(d)))
               //.attr("r", d=> (6))
               .attr("r", d=> (20 - (d.songyear_pos*2)))           //popularity represented by size
               .style("fill", colourScale(attributeGroupNames[i]))
               .style("opacity", "50%")
               //.style("opacity", (d => (100 - (d.songyear_pos * 9))/100));     //popularity represented by opacity
       }

};