/**
 * Scatter Plot Chart object
 * @param data
 * @param svg
 */

scatterPlot = function(data)
{
    let svg = d3.select("#SVG_CONTAINER_ScatterPlot");

    //** SETUP *****************************************
    //Creates group for scatter plot
    let chart = svg.append('g')
        .attr("class", "scatterPlot");

    scatterTooltip = d3.select("body")
        .append("div")
        .attr("class", "tooltip")
        .attr("id", "scatter_tooltip")
        .style("opacity", 0);

    //** SCALES *****************************************
    let xScale = d3.scalePoint()
        .domain(attributes)
        .range([MARGIN.LEFT + 75, MARGIN.LEFT + 300]);

    let yScale = d3.scaleLinear()
        .domain([0, 1])
        .range([heightTopSongs - MARGIN.BOTTOM, MARGIN.TOP]);

    //Colour Scale for each attribute
    let colourScale = d3.scaleOrdinal()
        .domain(attributes)
        .range(["green", "blue", "red"]);

    //Heat Map Colour Scales
    let valenceHeatMapColours = ["#5a0001","#cb000a", "#e35e5f", "#ffe6e1"]
    let valenceHeatMapScale = d3.scaleLinear()
        .domain([0, 3, 6, 10])
        .range(valenceHeatMapColours);

    let energyHeatMapColours = ["#121315", "#2a2b2d", "#707377", "#caced5"]
    let energyHeatMapScale = d3.scaleLinear()
        .domain([0, 3,6, 10])
        .range(energyHeatMapColours);

    let instrumentalnessHeatMapColours = ["#001635", "#0044a0", "#417ed5", "#c6eaff"]
    let instrumentalnessHeatMapScale = d3.scaleLinear()
        .domain([0, 3, 6, 10])
        .range(instrumentalnessHeatMapColours);

    //** CREATE AXIS ****************************************

    let xAxis = d3.axisBottom()
        .scale(xScale)
        .tickPadding(20)
        .tickSize(-(heightTopSongs - MARGIN.BOTTOM * 2 + 35));

    chart.append("g")
        .attr("transform", "translate(0," + (heightTopSongs -MARGIN.BOTTOM)  +")")
        .call(xAxis)
        .select(".domain")
        .attr("stroke-width", 0);

    //Create and draw y axis
    let yAxis = d3.axisLeft()
        .scale(yScale)
        .tickSize(-(375));

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
        .attr("transform", "rotate(-90 " + (MARGIN.LEFT - 40) + " " + (heightTopSongs/2 - MARGIN.TOP)+")")
        .attr("x", MARGIN.LEFT)
        .attr("y", heightTopSongs/2 - MARGIN.TOP)
        .attr("font-size", "12px")
        .text(yLabel);

    chart.append("text")
        .attr("class", "attributesLabel")
        .attr("text-anchor", "end")
        .attr("x", MARGIN.LEFT + 140)
        .attr("y", MARGIN.TOP - 20)
        .attr("font-size", "20px")
        .attr("font-weight", "bold")
        .text("Song Attributes");

    //** CREATE LEGEND *****************************************

    heatMapScale = [instrumentalnessHeatMapScale, energyHeatMapScale,valenceHeatMapScale];

    let xPosLegend = 100;
    let yPosLegend = heightTopSongs - MARGIN.TOP + 110;

    //Rectangle legend
    let legendWidth = 500;
    let legendHeight = 20;
    let squarewidth = legendWidth/10;

    chart.append("text")
        .attr("x", 0)
        .attr("y", yPosLegend - 40)
        .text("Yearly Rank")
        .attr("font-weight", "bold")
        .attr("font-size", "16px");

    for(let i = 0; i < heatMapScale.length; i++)
    {
        chart.append("text")
            .attr("x", 0)
            .attr("y", yPosLegend + 15)
            .attr("font-size", "12px")
            .text(attributes[i]);

        let rank = [];
        for(let j = 1; j <=10; j++) rank.push(j);

        chart.selectAll("rank_rect")
            .data(rank).enter()
            .append("rect")
            .attr("class", d => "rank_rect " + d)
            .attr("x", (d, j) =>
            {
                let posX = xPosLegend + (j * (squarewidth + 0.5));
                return posX;
            })
            .attr("y", yPosLegend)
            .attr("width", squarewidth)
            .attr("height", legendHeight)
            .style("fill", (d) => heatMapScale[i](d) )
            .on("mouseover", function(event, d)
            {
                let rankRects = document.getElementsByClassName("rank_rect " + d);

                d3.selectAll(rankRects)
                    .style("stroke-width", 2)
                    .style("stroke", "black");

                let rankCircle = document.getElementsByClassName("dot-" + attributes[0] + " " + d)[0];
                const mouseoverEvent = new Event('mouseover');
                rankCircle.dispatchEvent(mouseoverEvent);
            })
            .on("mouseout", function(event, d)
            {
                let rankRects = document.getElementsByClassName("rank_rect");
                d3.selectAll(rankRects)
                    .style("stroke-width", 0)

                let rankCircle = document.getElementsByClassName("dot-" + attributes[0] + " " + d)[0];
                const mouseoverEvent = new Event('mouseout');
                rankCircle.dispatchEvent(mouseoverEvent);
            });

        if(i == 0)
        {
            let heatMapAxisScale = d3.scaleLinear()
                .range([0, legendWidth - squarewidth])
                .domain([1, 10]);
            let heatMapAxis = d3.axisTop()
                .ticks(10)
                .tickSize(0)
                .scale(heatMapAxisScale);

            let heatMapAxisGroup =
                chart.append("g")
                .style("font-size", "14px")
                .attr("transform", "translate(" + (xPosLegend + squarewidth/2) + "," + (yPosLegend) + ")")
                .call(heatMapAxis);
            heatMapAxisGroup
                .select(".domain")
                .attr("stroke-width", 0);
        }

        yPosLegend += legendHeight;
    }

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
            .attr("class", d => "dot-" + attributes[i] +" " + d.songyear_pos)
            .attr("cx", () => {
                return xScale(attributes[i]);
            })
            .attr("cy", (d) => {
                return yScale(yValue(d));})
            .attr("r", 15)
            .style("fill", (d => heatMapScale[i](d.songyear_pos)))
            .style("opacity", 0.8)//popularity represented by opacity
            .on("mouseover", function(event, d)
            {
                mouseover_parallelLine(event, d);
                mouseover_scatter(event, d);

            })
            .on("mouseout", function(event, d)
            {
                mouseout_scatter(event, d)
                mouseout_parallelLine(event, d);
            });
    }
};
