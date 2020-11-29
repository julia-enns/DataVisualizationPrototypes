/**
 * Scatter Plot Chart object
 * @param data
 * @param svg
 */

scatterPlot = function(data)
{
    let svg = d3.select("#SVG_CONTAINER_ScatterPlot");

    console.log(data);

    //** SETUP *****************************************
    let startYear = 1970;
    let endYear = 2020;

    //Creates group for scatter plot
    let chart = svg.append('g')
        .attr("class", "scatterPlot")

    //** SCALES *****************************************
    let xScale = d3.scaleLinear()
        .domain([startYear, endYear])
        .range([MARGIN.LEFT, width - MARGIN.RIGHT]);

    let yScale = d3.scaleLinear()
        .domain([0, 1])
        .range([height - MARGIN.BOTTOM, MARGIN.TOP]);

    //Colour Scale for each attribute
    let colourScale = d3.scaleOrdinal()
        .domain(attributes)
        .range(["green", "blue", "red"]);

    //Opacity scale for rank
    let opacity = function(rank)
    {
        return (100 - (rank * 9))/100;
    }

    //** CREATE AXIS *****************************************
    //Create and draw x axis
    let xAxis = d3.axisBottom()
        .scale(xScale)
        .ticks(uniqueYears.length/5)
        .tickFormat(d3.format("d"));

    chart.append("g")
        .attr("transform", "translate("+ 0 + ","+ (height-MARGIN.BOTTOM) +")")
        .call(xAxis);

    //Create and draw y axis
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
    let xLegend = width;
    let yLegend = MARGIN.BOTTOM;

    //Colour encoding
    chart.append("text")
        .attr("x", xLegend)
        .attr("y", yLegend - 30)
        .attr("font-weight", "bold")
        .text("Attributes")
    for(let i = 0; i < attributes.length; i++)
    {
        chart.append("circle")
            .attr("cx", xLegend)
            .attr("cy", yLegend)
            .attr("r", 6)
            .style("fill", colourScale(attributes[i]));
        chart.append("text")
            .attr("x", xLegend + 20)
            .attr("y", yLegend)
            .attr("r", 6)
            .style("font-size", "15px")
            .text(attributes[i]);

        yLegend += 30;
    }

    //Opacity Legend
    yLegend += 30;
    chart.append("text")
        .attr("x", xLegend)
        .attr("y", yLegend)
        .attr("font-weight", "bold")
        .text("Yearly Song Rank")
    for(let i = 1; i <= 10; i++)
    {
        yLegend += 30;
        chart.append("circle")
            .attr("cx", xLegend)
            .attr("cy", yLegend)
            .attr("r", 6)
            .style("fill", "black")
            .style("opacity", (d => opacity(i)));
        chart.append("text")
            .attr("x", xLegend + 20)
            .attr("y", yLegend)
            .style("font-size", "15px")
            .text(i);

    }

    //TODO: CREATE VISUALIZATION TO REPLACE THIS ONE
    //** DATA POINTS *****************************************
    //Create point for each attribute
    for(let i = 0; i < attributes.length; i++)
    {
        let y = attributes[i];
        let yValue = function(d) {return d[y]};        //get attribute value for row

        data.forEach(function (d) {
            d[y] = +d[y];
        });

        chart.append("g")
            .selectAll("points" + i)
            .data(data)
            .enter()
            .append("circle")
            .attr("class", "dot-" + attributes[i])
            .attr("cx", (d) => {
                return xScale(d.year);
            })
            .attr("cy", (d) => yScale(yValue(d)))
            .attr("r", 6)
            .style("fill", colourScale(attributes[i]))
            // .style("opacity", (d => (100 - (d.songyear_pos * 9))/100));     //popularity represented by opacity
            .style("opacity", (d => opacity(d.songyear_pos)));     //popularity represented by opacity
    }
};