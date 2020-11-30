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

    const tooltip = d3.select("body")
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
        .range([height - MARGIN.BOTTOM, MARGIN.TOP]);

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
        .tickSize(-(height - MARGIN.BOTTOM * 2));

    chart.append("g")
        .attr("transform", "translate(0," + (height -MARGIN.BOTTOM)  +")")
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
        .attr("transform", "rotate(-90 " + (MARGIN.LEFT - 40) + " " + (height/2 - MARGIN.TOP)+")")
        .attr("x", MARGIN.LEFT - 40)
        .attr("y", height/2 - MARGIN.TOP)
        .text(yLabel);

    //** CREATE LEGEND *****************************************

    let heatMapScale = [instrumentalnessHeatMapScale, energyHeatMapScale,valenceHeatMapScale];

    let xPosLegend = 80;
    let yPosLegend = height - MARGIN.TOP + 110;

    //Rectangle legend
    let legendWidth = 500;
    let legendHeight = 20;
    let squarewidth = legendWidth/10;

    chart.append("text")
        .attr("x", 0)
        .attr("y", yPosLegend - 40)
        .text("Yearly Rank")
        .attr("font-size", 20);

    for(let i = 0; i < heatMapScale.length; i++)
    {

        chart.append("text")
            .attr("font-size", "11px")
            .attr("x", 0)
            .attr("y", yPosLegend + 15)
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
            .on("mouseover", function(event, d) {

                for(let j = 0; j < attributes.length; j++) {
                    let points = document.getElementsByClassName("dot-" + attributes[j]);

                    d3.selectAll(points)
                        .filter(function (f) {
                          return f.songyear_pos !== d.songyear_pos;
                        })
                        .style("opacity", 0.1);

                    d3.selectAll(points)
                        .filter(function (f) {
                            return f.songyear_pos === d.songyear_pos;
                        })
                        .transition()
                        .attr("r", 20)
                        .style("fill", (d => heatMapScale[j](3)));
                }

                tooltip.transition().style("opacity", 0.8);
                tooltip.style("left", (500) + "px")
                    .style("top", (250) + "px")
                    .style("width", 250 + "px")
                    .html("<h1>" + d.name + "</h1><h2>by "
                        + d.artist + "</h2><br/><h3>Rank: " + d.songyear_pos+
                        "</h3><h3>Score: "+d.score + "</h3><br/><div style='clear:both'><h3><span style='color:" + heatMapScale[0](3) + ";float:left;'>Instrumentalness: </span><span style='float:right;'>" + d.instrumentalness
                        + "</span></h3></div><div style='clear:both'><h3><span style='color:" + heatMapScale[1](3) + ";float:left;'>Energy: </span><span style='float:right;'>"+ d.energy
                        + "</span></h3></div><div style='clear:both'><h3><span style='color:" + heatMapScale[2](3) + ";float:left;'>Valence: </span><span style='float:right;'>" + d.valence + "</span></h3></div>");
            })
            .on("mouseout", function(d) {

                for(let j = 0; j < attributes.length; j++) {
                    let points = document.getElementsByClassName("dot-" + attributes[j]);

                    d3.selectAll(points)
                        .transition()
                        .attr("r", 15);
                    d3.selectAll(points)
                        .style("opacity", 0.8)
                        .style("fill", (d => heatMapScale[j](d.songyear_pos)));
                }

                tooltip.transition().style("opacity", 0);
            });
    }
};