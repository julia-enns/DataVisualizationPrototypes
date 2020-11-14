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
            line = new lineGraph(data, SVG);
        })

};


lineGraph = function (data, svg) {
    //** SETUP *****************************************
    let startYear = 1970;
    let endYear = 2020;
    let years = d3.group(data, d => d.year);
    let uniqueYears = Array.from(years);

    let attributeGroupNames = data.columns.slice(8, 11);    //["energy", "instrumentalness", "valence"]
    let attributeSeries = d3.group(data, d => d.year);
    let groupByYearArray = Array.from(attributeSeries);

    chart = svg.append('g')
        .attr("class", "lineGraph")

    //** SCALES *****************************************
    xScale = d3.scaleLinear()
        .domain([startYear, endYear])
        .range([MARGIN.LEFT, width - MARGIN.RIGHT]);


    yScale = d3.scaleLinear()
        .domain([0, 1])
        .range([height - MARGIN.BOTTOM, MARGIN.TOP]);


    let colour = d3.scaleOrdinal()
        .domain(attributeGroupNames)
        .range(["green", "blue", "red"]);


    //** CREATE AXIS *****************************************
    let xAxis = d3.axisBottom()
        .scale(xScale)
        .ticks(uniqueYears.length/5)
        .tickFormat(d3.format("d"));

    chart.append("g")
        .attr("transform", "translate("+ 0 + ","+ (height-MARGIN.BOTTOM) +")")
        .call(xAxis);

    let yAxis = d3.axisLeft().scale(yScale);
    chart.append("g")
        .attr("transform", "translate("+ MARGIN.LEFT + "," + 0 +")")
        .call(yAxis);

    //Create x and y axis labels
    let xLabel = "Year";
    let yLabel = "Attribute Measurement"

    chart.append("text")
        .attr("class", "x_label")
        .attr("text-anchor", "end")
        .attr("x", width/2 + 50)
        .attr("y", height-MARGIN.BOTTOM + 50)
        .text(xLabel);

    chart.append("text")
        .attr("class", "y_label")
        .attr("text-anchor", "end")
        .attr("transform", "rotate(-90 " + (MARGIN.LEFT - 40) + " " + (height/2 - MARGIN.TOP)+")")
        .attr("x", MARGIN.LEFT - 40)
        .attr("y", height/2 - MARGIN.TOP)
        .text(yLabel);

    //** CREATE LEGEND *****************************************
    xLegend = width - MARGIN.LEFT;
    yLegend = MARGIN.BOTTOM;

    //Colour encoding
    chart.append("text")
        .attr("x", xLegend - 10)
        .attr("y", yLegend - 30)
        .attr("font-weight", "bold")
        .text("Attributes")

    yLegend += 40;
    //Energy
    svg.append("circle")
        .attr("cx", xLegend)
        .attr("cy", yLegend)
        .attr("r", 40)
        .style("fill", colour(attributeGroupNames[0]))
        .style("opacity", 0.5);
    svg.append("text")
        .attr("x", xLegend - 100)
        .attr("y", yLegend)
        .style("font-size", "15px")
        .text(attributeGroupNames[0]);
    //Instrumnetalness
    svg.append("circle")
        .attr("cx", xLegend+50)
        .attr("cy", yLegend)
        .attr("r", 40)
        .style("fill", colour(attributeGroupNames[1]))
        .style("opacity", 0.5);
    svg.append("text")
        .attr("x", xLegend + 100)
        .attr("y", yLegend)
        .style("font-size", "15px")
        .text(attributeGroupNames[1]);
    //Valence
    svg.append("circle")
        .attr("cx", xLegend+25)
        .attr("cy", yLegend+40)
        .attr("r", 40)
        .style("fill", colour(attributeGroupNames[2]))
        .style("opacity", 0.5);
    svg.append("text")
        .attr("x", xLegend)
        .attr("y", yLegend + 100)
        .style("font-size", "15px")
        .text(attributeGroupNames[2]);

    for(let i = 0; i < attributeGroupNames.length; i++)
    {



        yLegend += 30;
    }

    for(let i = 0; i < attributeGroupNames.length; i++)
    {
        //Calculate average of attribute and push it to data grouped by year
        for(let j = 0; j < groupByYearArray.length; j++)
        {
            let result = 0;
            for(let k = 0; k < 10; k++)
            {
                if(attributeGroupNames[i] === "energy")
                    result = parseFloat(result) + parseFloat(groupByYearArray[j][1][k].energy);
                else if(attributeGroupNames[i] === "instrumentalness")
                    result = parseFloat(result) + parseFloat(groupByYearArray[j][1][k].instrumentalness);
                else if(attributeGroupNames[i] === "valence")
                    result = parseFloat(result) + parseFloat(groupByYearArray[j][1][k].valence);
            }
            groupByYearArray[j].push(result/10);
        }

        chart.append("path")
            .datum(groupByYearArray)
            .attr("class", "area")
            .attr("d", d3.area()
                .x(function(d) { return xScale(d[0]); })
                .y0(height - MARGIN.BOTTOM)
                .y1(function(d) { return yScale(d[i+2]);}))
            .attr('stroke-width', 2)
            .attr('fill', colour(attributeGroupNames[i]))
            .attr('opacity',0.5);
    }

};
