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
    let xScale = d3.scalePoint()
        .domain(attributes)
        .range([MARGIN.LEFT + 250, width - MARGIN.RIGHT - 250]);

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

    let radius = function(rank){
        return (55 - rank*5);
    }

    let valenceHeatMapColours = ["#5a0001","#cb000a", "#e35e5f", "#ffe6e1"]
    let valenceHeatMapScale = d3.scaleLinear()
        .domain([0, 3, 6, 10])
        .range(valenceHeatMapColours);

    let energyHeatMapColours = ["#001635", "#0044a0", "#3c7bc2", "#c6eaff"]
    let energyHeatMapScale = d3.scaleLinear()
        .domain([0, 3,6, 10])
        .range(energyHeatMapColours);

    let instrumentalnessHeatMapColours = ["#001635", "#0044a0", "#3c7bc2", "#c6eaff"]
    let instrumentalnessHeatMapScale = d3.scaleLinear()
        .domain([0, 3, 6, 10])
        .range(instrumentalnessHeatMapColours);

    //** CREATE AXIS ****************************************

    let xAxis = d3.axisBottom()
        .scale(xScale)
        .tickPadding(10)
        .tickSize(-(height - MARGIN.BOTTOM * 2));

    chart.append("g")
        .attr("transform", "translate(0," + (height -MARGIN.BOTTOM)  +")")
        .call(xAxis)
        .select(".domain")
        .attr("stroke-width", 0);

    //Create and draw y axis
    let yAxis = d3.axisLeft()
        .scale(yScale)
        .tickSize(-1000);

    chart.append("g")
        .attr("transform", "translate("+ MARGIN.LEFT + "," + 0 +")")
        .call(yAxis)
        .selectAll(".tick line")
        .attr("stroke", "lightgrey");

    //Create x and y axis labels
    let yLabel = "Attribute Measurement";

    chart.append("text")
        .attr("class", "y_label")
        .attr("text-anchor", "end")
        .attr("transform", "rotate(-90 " + (MARGIN.LEFT - 40) + " " + (height/2 - MARGIN.TOP)+")")
        .attr("x", MARGIN.LEFT - 40)
        .attr("y", height/2 - MARGIN.TOP)
        .text(yLabel);

    //** CREATE LEGEND *****************************************

    let heatMapScale= [instrumentalnessHeatMapScale, energyHeatMapScale,valenceHeatMapScale];

    let xPosLegend = width;
    let yPosLegend = MARGIN.BOTTOM;

    for(let i = 0; i < heatMapScale.length; i++)
    {
        //Gradient
        var linearGradient = svg.append("defs")
            .append("linearGradient")
            .attr("id", "linear-gradient")
            .attr("x1", "0%")
            .attr("y1", "0%")
            .attr("x2", "0%")
            .attr("y2", "100%");
        linearGradient.selectAll("stop")
            .data(heatMapScale[i].range())
            .enter().append("stop")
            .attr("offset", function (d, i) {
                return i / (valenceHeatMapScale.range().length - 1);
            })
            .attr("stop-color", function (d) {
                return d;
            });

        //Rectangle legend
        let legendWidth = 50;
        let legendHeight = 300;

        svg.append("text")
            .attr("x", xPosLegend - 10)
            .attr("y", yPosLegend - 20)
            .text(attributes[i]);

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
            .attr("transform", "translate(" + xPosLegend + "," + yPosLegend + ")")
            .call(heatMapAxis);

        xPosLegend += 100;
    }

    //TODO: CREATE VISUALIZATION TO REPLACE THIS ONE
    //** DATA POINTS *****************************************
    //Create point for each attribute

    for(let i = 0; i < attributes.length; i++)
    {
        let y = attributes[i];
        let yValue = function(d) {
            return d[y]};//get attribute value for row

        chart.append("g")
            .selectAll("points" + i)
            .data(data[1])
            .enter()
            .append("circle")
            .attr("class", "dot-" + attributes[i])
            .attr("cx", () => {
                console.log("i " + i);
                return xScale(attributes[i]);
            })
            .attr("cy", (d) => {
                return yScale(yValue(d));})
            .attr("r", 15)
            .style("fill", (d => heatMapScale[i](d.songyear_pos)))
            // .style("opacity", (d => (100 - (d.songyear_pos * 9))/100));     //popularity represented by opacity
            .style("opacity", 0.8);     //popularity represented by opacity
    }
};
