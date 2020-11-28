/**
 * Scatter Plot Chart object
 * @param data
 * @param svg
 */

scatterPlot = function(data, svg, attributeGroupNames, uniqueYears)
{
    console.log(data);

    //** SETUP *****************************************
    let startYear = 1970;
    let endYear = 2020;

    //Creates group for scatter plot
    chart = svg.append('g')
        .attr("class", "scatterPlot")

    //** SCALES *****************************************
    xScaleScatterPlot = d3.scaleLinear()
        .domain([startYear, endYear])
        .range([MARGIN.LEFT, width - MARGIN.RIGHT]);

    yScaleScatterPlot = d3.scaleLinear()
        .domain([0, 1])
        .range([height - MARGIN.BOTTOM, MARGIN.TOP]);

    //Colour Scale for each attribute
    let colourScale = d3.scaleOrdinal()
        .domain(attributeGroupNames)
        .range(["green", "blue", "red"]);

    //Opacity scale for rank
    let opacity = function(rank)
    {
        return (100 - (rank * 9))/100;
    }

    //** CREATE AXIS *****************************************
    //Create and draw x axis
    let xAxis = d3.axisBottom()
        .scale(xScaleScatterPlot)
        .ticks(uniqueYears.length/5)
        .tickFormat(d3.format("d"));

    chart.append("g")
        .attr("transform", "translate("+ 0 + ","+ (height-MARGIN.BOTTOM) +")")
        .call(xAxis);

    //Create and draw y axis
    let yAxis = d3.axisLeft().scale(yScaleScatterPlot);
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
    xLegend = width;
    yLegend = MARGIN.BOTTOM;

    //Colour encoding
    chart.append("text")
        .attr("x", xLegend)
        .attr("y", yLegend - 30)
        .attr("font-weight", "bold")
        .text("Attributes")
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
    for(let i = 0; i < attributeGroupNames.length; i++)
    {
        let y = attributeGroupNames[i];
        let yValue = function(d) {return d[y]};        //get attribute value for row

        data.forEach(function (d) {
            d[y] = +d[y];
        });

        chart.append("g")
            .selectAll("points" + i)
            .data(data)
            .enter()
            .append("circle")
            .attr("class", "dot-" + attributeGroupNames[i])
            .attr("cx", (d) => {
                return xScaleScatterPlot(d.year);
            })
            .attr("cy", (d) => yScaleScatterPlot(yValue(d)))
            .attr("r", 6)
            .style("fill", colourScale(attributeGroupNames[i]))
            // .style("opacity", (d => (100 - (d.songyear_pos * 9))/100));     //popularity represented by opacity
            .style("opacity", (d => opacity(d.songyear_pos)));     //popularity represented by opacity
    }
};


fillComboBox = function(options)
{
    var select = document.getElementById("selectYear");

    for(var i = 0; i < options.length; i++)
    {
        var option = options[i];
        var element = document.createElement("option");
        element.textContent = option[0];
        element.value = option[0];
        select.appendChild(element);
    }
}

updateScatterPlot = function(year)
{
    //TODO: if a year in combobox is selected, update graph.
    //TODO: if the stacked click event is triggered, update the combobox to the selected year

}
