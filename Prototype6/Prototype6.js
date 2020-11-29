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

fillComboBox = function(options)
{
    let select = document.getElementById("selectYear");

    for(var i = 0; i < options.length; i++)
    {
        var option = options[i];
        var element = document.createElement("option");
        element.textContent = option[0];
        element.id = "option_" + option[0];
        element.value = option[0];
        select.appendChild(element);
    }
}

lineGraph = function (data, svg) {

    // append the svg object to the body of the page
    let chart = svg.append('g')
        .attr("class", "lineGraph")

    attributes = data.columns.slice(8, 11);
    uniqueYears = Array.from(d3.group(data, d => d.year));

    let startYear = 1970;
    let endYear = 2020;

    //** SCALES *****************************************
    // X scale
    let xScale = d3.scaleLinear()
        .domain([startYear, endYear])
        .range([MARGIN.LEFT, width - MARGIN.RIGHT]);

    // Y scale
    let yScale = d3.scaleLinear()
        .domain([0, 2])
        .range([height - MARGIN.BOTTOM, MARGIN.TOP]);

    //TODO: Change colour scheme... Yellow is too hard to see
    //Colour Scale for each attribute
    let colour = d3.scaleOrdinal()
        .domain(attributes)
        .range(["#481e85", "#f8c600", "#e05a00"]);

    let circleColour = d3.scaleOrdinal()
        .domain(attributes)
                        //blue      yellow      red
        .range(["#0842c2", "#cd66b8", "#ff6d72"]);

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
    let xLegend = width;
    let yLegend = MARGIN.TOP;

    let legend = svg.append("g").attr("class", "legend");

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
    for (let i = 0; i < attributes.length; i++)
    {
        for (let j = 0; j < groupByYearArray.length; j++)
        {
            let result = 0;
            for (let k = 0; k < 10; k++)
            {
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
    let finishedStack = chart.selectAll("stack")
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
    const tooltip = d3.select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    let mouseG = svg.append("g")
        .attr("class", "mouse-over-effects");

    // create vertical line to follow mouse
    let hoverLine = mouseG.append("path")
        .attr("class", "mouse-line")
        .style("stroke", "#A9A9A9")
        .style("stroke-width", "2")
        .style("opacity", "0");

    let mousePerLine = mouseG.selectAll('.mouse-per-line')
        .data(stackedData)
        .enter()
        .append("g")
        .attr("class", (d, i) =>
        {
            return "mouse-per-line " + attributes[i];
        });

    //Create a circle per each line to highlight data point on line graph
    let mousePerLineCircles =
        mousePerLine.append("circle")
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

    mouseG
        //MOUSE OUT EVENT
        .on('mouseout', function ()
        {
            // on mouse out hide line, circles and tooltip
            hoverLine.style("opacity", "0");
            mousePerLine.style("opacity", "0");
            mousePerLineCircles.style("opacity", "0");
            tooltip.transition().style("opacity", 0);
        })
        //MOUSE OVER EVENT
        .on('mouseover', function ()
        {
            // on mouse in show line, circles and tooltip
            hoverLine.style("opacity", "1");
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

                    //Translate vertical line
                    hoverLine.attr("d", function ()
                        {
                            var data = "M" + xScale(d[indexSelected].data[0]) + "," + (height - MARGIN.TOP );
                            data += " " + xScale(d[indexSelected].data[0]) + "," + MARGIN.BOTTOM;;
                            return data;
                        });

                    return "translate(" + xScale(d[indexSelected].data[0]) + "," + yScale(d[indexSelected][1]) + ")";
                });

            //Get selection
            let selection = getSelection(indexSelected);

            //Sort so that attributes are in the stacked order
            var a = selection[0];
            selection[0] = selection[2];
            selection[2] = a;

            //Add tooltip
            tooltip.style("left", (event.pageX + 20) + "px")
                .style("top", (event.pageY - 20) + "px")
                .html("<h2><u>" + yearSelected + "</u></h2>" +
                    "Click for top songs of the year </br></br>")
                .selectAll()
                .data(selection).enter()
                .append("div")
                .style("color", d => colour(attributes[d.key]))
                .style('font-size', "14px")
                .style("clear", "both")
                .html(d =>
                {
                    var html = "<span class=\"dot\" " +
                                "style=\"background-color:" + colour(attributes[d.key]) +
                                ";float:left;\">"
                                + "</span>";
                    html += "<span style='float:left;'>" + attributes[d.key] + ": " + "</span>"
                    html += "<span style=\"float:right;margin-left:10px\">";
                    html += d.stackedValue.toFixed(5);
                    html += "</span>";

                    return html;
                })
        })
        //CLICK EVENT
        //Shows Top Songs of the Year graph
        .on('click', function ( event)
        {
            //Clear previous scatterplot data
           d3.selectAll(".scatterPlot").remove();

            //Update scatterplot data
            updateScatterPlot(indexSelected);

            //Update combobox to select correct year
            document.getElementById("option_" + yearSelected).selected = true;

            //Click to scatterplot tab
            document.getElementById("scatterTab").click();
        });

        //Init scatterplot with 1970 data
        updateScatterPlot(0);

        // Open stacked chart by default
        document.getElementById("scatterTab").click();

        //TODO: 2. Show sliders for zoom functionality.

};

updateScatterPlot = function(indexSelected)
{
    let selection = getSelection(indexSelected);
    scatterPlot(selection[0].data);
}

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
