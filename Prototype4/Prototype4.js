window.onload = function(){
    setup("TopYearlySongsAndAttributes.csv");
};

const MARGIN = {
    "LEFT":50,
    "RIGHT":50,
    "TOP":50,
    "BOTTOM":50,
};

//dimension of our workspace
const   width  = 1200,
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
            //console.log(data);
            line = new lineGraph(data, SVG);
        })

};


lineGraph = function (data, svg)
{
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
        .attr("class", "x_axis")
        .attr("transform", "translate("+ 0 + ","+ (height-MARGIN.BOTTOM) +")")
        .call(xAxis);

    let yAxis = d3.axisLeft().scale(yScale);
    chart.append("g")
        .attr("class", "y_axis")
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
    xLegend = width;
    yLegend = MARGIN.BOTTOM;

    legend = svg.append("g").attr("class", "legend");

    //Colour encoding
    legend.append("text")
        .attr("x", xLegend)
        .attr("y", yLegend - 30)
        .attr("font-weight", "bold")
        .text("Attributes")

    for(let i = 0; i < attributeGroupNames.length; i++)
    {
        legend.append("circle")
            .attr("cx", xLegend)
            .attr("cy", yLegend)
            .attr("r", 6)
            .style("fill", colour(attributeGroupNames[i]));
        legend.append("text")
            .attr("x", xLegend + 20)
            .attr("y", yLegend)
            .style("font-size", "15px")
            .text(attributeGroupNames[i]);

        yLegend += 30;
    }

    var lines = chart.append("g")
        .attr("class", "lines");

    //** DATA POINTS *****************************************
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

        //Line graph

        lines.append("path")
            .datum(groupByYearArray)
            .attr("class", "line " + attributeGroupNames[i])
            .attr("d", d3.line()
                .x(function(d)
                {return xScale(d[0]); })
                .y(function(d) {return yScale(d[i+2] )})
                .curve(d3.curveMonotoneX)
            )
            .attr('stroke', colour(attributeGroupNames[i]))
            .attr('stroke-width', 2)
            .attr('fill', 'none');
    }

    //** INTERACTIONS *****************************************

    //Create hover tooltip and vertical line
    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    mouseG = svg.append("g")
        .attr("class", "mouse-over-effects");

    // create vertical line to follow mouse
    mouseG.append("path")
        .attr("class", "mouse-line")
        .style("stroke", "#A9A9A9")
        .style("stroke-width", "2")
        .style("opacity", "0");

    //Create circles to highlight data point on line graph
    mousePerLine = mouseG.selectAll('.mouse-per-line')
        .data(groupByYearArray)
        .enter()
        .append("g")
        .attr("class", d =>
        {
            return "mouse-per-line " + d[0];
        });

    for(let i = 0; i < attributeGroupNames.length; i++)
    {
        mousePerLine
            .append("circle")
            .attr("r", 4)
            .attr("cx", (d) => {
                return xScale(d[0]);
            })
            .attr("cy", (d) => yScale(d[i + 2]))
            .style("stroke", function (d)
            {
                return colour(attributeGroupNames[i]);
            })
            .style("fill", "none")
            .style("stroke-width", "2")
            .style("opacity", "0");
    }

    let year;
    // append a rect to catch mouse movements on canvas
    mouseG.append('svg:rect')
        .attr('width', width - MARGIN.LEFT - MARGIN.RIGHT - 50)
        .attr('height', height - MARGIN.TOP)
        .attr('fill', 'none')
        .attr('pointer-events', 'all')
        .attr("transform", "translate("+ MARGIN.LEFT + "," + 0 +")");


        //MOUSE OUT EVENT
    mouseG.on('mouseout', function ()
        {
            // on mouse out hide line, circles and text
            d3.select(".mouse-line")
                .style("opacity", "0");
            d3.selectAll(".mouse-per-line")
                .style("opacity", "0");
            d3.selectAll(".mouse-per-line text")
                .style("opacity", "0");

            tooltip.transition().style("opacity", 0);
        })
        //MOUSE OVER EVENT
        .on('mouseover', function ()
        {
            // on mouse in show line, circles and text
            d3.select(".mouse-line")
                .style("opacity", "1");
            d3.selectAll(".mouse-per-line")
                .style("opacity", "1");

            //Show tooltip
            tooltip.transition().style("opacity", 0.9);
        })
        //MOUSE MOVE EVENT
        .on('mousemove', function ( event)
        {
            //get mouse position
            let mouse = d3.pointer(event);

            //get year from mouse posX
            year = xScale.invert(mouse[0]);
            year = Math.round(year);

            //Translate vertical line
            d3.select(".mouse-line")
                .attr("d", function ()
                {
                    var data = "M" + xScale(year) + "," + (height - MARGIN.TOP );
                    data += " " + xScale(year) + "," + MARGIN.BOTTOM;
                    return data;
                });

            //Un-highlight data points not hovered.
            let domGroups = document.getElementsByClassName("mouse-per-line");
            for(let i = 0; i < domGroups.length; i++)
            {
                domCircles = domGroups[i].children;
                for(let j = 0; j < domCircles.length; j++)
                {
                    d3.select(domCircles[j])
                        .style("opacity", "0");
                }
            }

            //Highlight data point on lines at year hovered.
            let highlightedDomCircles = document.getElementsByClassName("mouse-per-line " + year);
            highlightedDomCircles = highlightedDomCircles[0].childNodes;
            var selection;

            for(let i = 0; i < highlightedDomCircles.length; i++)
            {
                d3.select(highlightedDomCircles[i])
                    .style("opacity", "1")
                    .each(function(d)
                    {
                        selection = d;
                    });
            }

            //Update tooltip
            tooltip.style("left", (event.pageX) + "px")
                .style("top", (event.pageY) + "px")
                .html("<h2><u>" + year + "</u></h2>" +
                    "</br>" + attributeGroupNames[0] + " " + selection[2] +
                    "</br>" + attributeGroupNames[1] + " " + selection[3] +
                    "</br>" + attributeGroupNames[2] + " " + selection[4]);

        })
        //CLICK EVENT
        .on('click', function ( event)
        {
            //TODO: Show scatter plot graph for songs of selected year...
            console.log(year);
        });



};
