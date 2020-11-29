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
        .attr("class", "scatterPlot");

    const tooltip = d3.select("body")
        .append("div")
        .attr("class", "tooltip")
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

    let xPosLegend = MARGIN.LEFT + 25;
    let yPosLegend = height - MARGIN.TOP + 110;


    chart.append("text")
        .attr("x", xPosLegend)
        .attr("y", yPosLegend - 40)
        .text("Yearly Rank")
        .attr("font-size", 20);

    for(let i = 0; i < heatMapScale.length; i++)
    {
        //Gradient
        var linearGradient = svg.append("defs")
            .append("linearGradient")
            .attr("id", "linear-gradient" + i)
            .attr("x1", "100%")
            .attr("y1", "0%")
            .attr("x2", "0%")
            .attr("y2", "0%");
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
        let legendWidth = 300;
        let legendHeight = 50;

        chart.append("text")
            .attr("x", xPosLegend)
            .attr("y", yPosLegend - 10)
            .text(attributes[i]);

        chart.append("rect")
            .attr("x", xPosLegend)
            .attr("y", yPosLegend)
            .attr("width", legendWidth)
            .attr("height", legendHeight)
            .style("fill", "url(#linear-gradient" + i + ")");

//Define legend axis scale
        let heatMapAxisScale = d3.scaleLinear()
            .range([0, legendWidth])
            .domain([1, 10]);
        let heatMapAxis = d3.axisBottom().ticks(10).scale(heatMapAxisScale);
        chart.append("g")
            .attr("transform", "translate(" + xPosLegend + "," + (yPosLegend + legendHeight) + ")")
            .call(heatMapAxis);

        yPosLegend += 100;
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
            .attr("class", "dot-" + attributes[i])
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
                        .attr("r", 15)
                        .style("opacity", 0.8)
                        .style("fill", (d => heatMapScale[j](d.songyear_pos)));
                }

                tooltip.transition().style("opacity", 0);
            });
    }
};
