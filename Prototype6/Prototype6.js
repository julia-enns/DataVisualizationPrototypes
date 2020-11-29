window.onload = function(){
    setup("data.csv");
};

const MARGIN = {
    "LEFT":100,
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
            line = new lineGraph(data, SVG);
            let uniqueYears = Array.from(d3.group(data, d => d.year));
            fillComboBox(uniqueYears);
        })

};

lineGraph = function (data, svg) {

    // append the svg object to the body of the page
    chart = svg.append('g')
        .attr("class", "lineGraph")

    // List of groups = header of the csv files

    attributes = data.columns.slice(8, 11);
    let startYear = 1970;
    let endYear = 2020;
    uniqueYears = Array.from(d3.group(data, d => d.year));

    //** SCALES *****************************************
    // X scale
    xScale = d3.scaleLinear()
        .domain([startYear, endYear])
        .range([MARGIN.LEFT, width - MARGIN.RIGHT]);


    // Y scale
    yScale = d3.scaleLinear()
        .domain([0, 2])
        .range([height - MARGIN.BOTTOM, MARGIN.TOP]);

    //Colour Scale for each attribute
    let colour = d3.scaleOrdinal()
        .domain(attributes)
        .range(["#4325b4", "#ffa600", "#f70068"]);

    let circleColour = d3.scaleOrdinal()
        .domain(attributes)
                        //blue      yellow      red
        .range(["#757be6", "#ffc242", "#ff709a"]);

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
        .attr("transform", "rotate(-90 " + (MARGIN.LEFT - 40) + " " + (height/2 - MARGIN.TOP)+")")
        .attr("x", MARGIN.LEFT - 40)
        .attr("y", height/2 - MARGIN.TOP)
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
            .style("fill", colour(attributes[i]));
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
    stackedData = d3.stack()
        .keys(keys)
        (groupByYearArray);

    //console.log("This is the stack result: ", stackedData);

    // Show the areas
    finishedStack = chart.selectAll("stack")
    .data(stackedData)
    .enter()
    .append("path")
    .style("fill", function(d) { return colour(attributes[d.key-2]); })
    .attr("d", d3.area()
    .x(function(d, i) { return xScale(d.data[0]); })
    .y0(function(d) { return yScale(d[0]); })
    .y1(function(d) { return yScale(d[1]); })
            .curve(d3.curveMonotoneX)
    )
    .attr("class", d => "stack " + attributes[d.key - 2]);

    //** INTERACTIONS *****************************************
    //Create hover tooltip and vertical line
    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    mouseG = svg.append("g")
        .attr("class", "mouse-over-effects");

    // create vertical line to follow mouse
    mouseLine = mouseG.append("path")
        .attr("class", "mouse-line")
        .style("stroke", "#A9A9A9")
        .style("stroke-width", "2")
        .style("opacity", "0");

    //Create circles to highlight data point on line graph
    mousePerLine = mouseG.selectAll('.mouse-per-line')
        .data(stackedData)
        .enter()
        .append("g")
        .attr("class", (d, i) =>
        {
            return "mouse-per-line " + attributes[i];
        });

    mousePerLineCircles = mousePerLine
            .append("circle")
            .attr("r", 4)
            .style("stroke", function (d, i)
            {
                return circleColour(attributes[i]);
            })
            .style("fill", "none")
            .style("stroke-width", "2")
            .style("opacity", "0");

    let yearSelected;
    let indexSelected;
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
        // on mouse out hide line, circles and tooltip
        mouseLine.style("opacity", "0");
        mousePerLine.style("opacity", "0");
        mousePerLineCircles.style("opacity", "0");
        tooltip.transition().style("opacity", 0);
    })
        //MOUSE OVER EVENT
        .on('mouseover', function ()
        {
            // on mouse in show line, circles and tooltip
            mouseLine.style("opacity", "1");
            mousePerLine.style("opacity", "1");
            mousePerLineCircles.style("opacity", "1");
            tooltip.transition().style("opacity", 0.9);
        })
        //MOUSE MOVE EVENT
        .on('mousemove', function ( event)
        {
            //get mouse position
            let mouse = d3.pointer(event);

            //get year from mouse posX
            yearSelected = xScale.invert(mouse[0]);
            yearSelected = Math.round(yearSelected);

            //translate circles
            mousePerLine
                .attr("transform", function (d, i)
                {
                    //find index in stacked data of the correct year
                    for(let i = 0; i < d.length; i++)
                    {
                        if(yearSelected == d[i].data[0])
                        {
                            indexSelected = i;
                            break;
                        }
                    }

                    //Move vertical line to correct position
                    mouseLine.attr("d", function ()
                        {
                            var data = "M" + xScale(d[indexSelected].data[0]) + "," + (height - MARGIN.TOP );
                            data += " " + xScale(d[indexSelected].data[0]) + "," + MARGIN.BOTTOM;;
                            return data;
                        });

                    return "translate(" + xScale(d[indexSelected].data[0]) + "," + yScale(d[indexSelected][1]) + ")";
                });

            //Add tooltip
            let selection = getSelection(indexSelected);

            tooltip.style("left", (event.pageX + 20) + "px")
                .style("top", (event.pageY - 20) + "px")
                .html("<h2><u>" + yearSelected + "</u></h2>")
                .selectAll()
                .data(selection).enter()
                .append("div")
                .style("color", d => colour(attributes[d.key]))
                .style('font-size', 10)
                .html(d => {
                    return attributes[d.key] + ": " + d.stackedValue.toFixed(6);
                });
        })
        //CLICK EVENT
        .on('click', function ( event)
        {
            //TODO: 1. Show scatter plot graph for songs of selected year...

            //Clear previous scatterplot data
           d3.selectAll(".scatterPlot").remove();

            //Update scatterplot data
            let selection = getSelection(indexSelected);
            scatterPlot(selection[0].data);

            //Update combobox to select correct year
            document.getElementById("option_" + yearSelected).selected = true;

            //Click to scatterplot tab
            document.getElementById("scatterTab").click();

        });

        //Init scatterplot with 1970 data
        let selection = getSelection(0);
        let scatterplot = d3.select("#SVG_CONTAINER_ScatterPlot");
        scatterPlot(selection[0].data, scatterplot, attributes, uniqueYears);

        // //Open stacked chart by default
        document.getElementById("stackedTab").click();

        //TODO: 2. Show sliders for zoom functionality.



};

getSelection = function(indexSelected)
{
    let selection = [];
    stackedData.map(d => {
        selection.push(
            {
                key: d.index,
                data: d[indexSelected].data,
                stackedValue: d[indexSelected][1]
            })
    })

    return selection;
}

