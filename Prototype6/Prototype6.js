window.onload = function(){
    setup("data.csv");
};

const MARGIN = {
    "LEFT":75,
    "RIGHT":50,
    "TOP":40,
    "BOTTOM":75,
};

//dimension of our workspace
const   width  = 1100,
    height = 900;

const heightTopSongs = 500;

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
            rank = data.columns.slice(5, 8);
            line = new lineGraph(data, SVG);
            let uniqueYears = Array.from(d3.group(data, d => d.year));
            fillComboBox(uniqueYears);
        })
};

fillComboBox = function(options)
{
    let select = document.getElementById("yearListTicks")
    for(var i = 0; i < options.length; i++)
    {
        {
            if(i % 3 == 0)
            {
                var option = options[i];
                var element = document.createElement("option");
                element.textContent = option[0];
                select.appendChild(element);
            }
        }
    }

    select = document.getElementById("yearSlider");
    select.max = uniqueYears.length - 1;
}

lineGraph = function (data, svg) {

    // append the svg object to the body of the page
    let chart = svg.append('g')
        .attr("class", "lineGraph")

    attributes = data.columns.slice(8, 11);
    uniqueYears = Array.from(d3.group(data, d => d.year));
    let ranks = [rank[2], rank[0]];

    let startYear = 1970;
    let endYear = 2020;

    //** SCALES *****************************************
    // X scale
    let xScale = d3.scaleLinear()
        .domain([startYear, endYear])
        .range([MARGIN.LEFT, width - MARGIN.RIGHT]);

    // Y scale
    let yScale = d3.scaleLinear()
        .domain([0, 1.8])
        .range([height - (MARGIN.BOTTOM * 2), height/2 - (MARGIN.TOP * 2)]);

    let yScaleRanks = {};
    let max = 100;
    let offset = 0 ;
    for(let i in ranks){
        let name = ranks[i];

        yScaleRanks[name] = d3.scaleLinear()
            .domain( [max,-max])
            .range([height/6 + offset - 10, MARGIN.TOP + offset]);

        max *= 10;
        offset += (height/6 ) - (MARGIN.TOP) + MARGIN.TOP;
    }

    //Colour Scale for each attribute
    let colour = d3.scaleOrdinal()
        .domain(attributes)
        .range(["#376ab3", "#2a2b2d", "#ce4d4a"]);

    let circleColour = d3.scaleOrdinal()
        .domain(attributes)
                        //blue      black      red
        .range(["#83b3ec", "#575d69", "#ffa7a7"]);

    //** CREATE AXIS *****************************************
    let xAxis = d3.axisBottom()
        .scale(xScale)
        .ticks(10)
        .tickFormat(d3.format("d"));

    let yAxisRanks = {};
    let tickValues = [1,"","","","",100,"","","","",1];
    let rankTitle = ["Average Decade Rank", "Average Overall Rank"];
    offset = 0;
    for(let i in ranks)
    {
        let name = ranks[i];
        yAxisRanks[name] = d3.axisLeft()
            .scale(yScaleRanks[name])
            .tickFormat((d,i) => {return tickValues[i]; })
            .tickPadding(10)
            .tickSize(10);

        let y = chart.append("g")
            .attr("class", "yearAxis")
            .attr("transform", "translate("+ (MARGIN.LEFT) + "," + 0 +")")
            .call(yAxisRanks[name]);

            y.select(".domain")
            .attr("stroke-width", 0);

            y.selectAll(".tick line")
            .attr("stroke", "lightgrey");

        chart.append("text")
            .attr("class", "y_RankLabel")
            .attr("text-anchor", "end")
            .attr("transform", "rotate(-90 " + (MARGIN.LEFT - 50) + " " + (MARGIN.TOP + 20)+")")
            .attr("x", MARGIN.LEFT - 30 - offset)
            .attr("y", MARGIN.TOP + 20)
            .attr("font-size", "10px")
            .text(rankTitle[i]);

        tickValues = [1,"","","","",1000,"","","","",1];
        offset = (height/6 ) - (MARGIN.TOP) + MARGIN.TOP;
    }

    chart.append("text")
        .attr("class", "popularityLabel")
        .attr("text-anchor", "end")
        .attr("x", MARGIN.LEFT + 80)
        .attr("y", MARGIN.TOP - 20)
        .attr("font-size", "20px")
        .attr("font-weight", "bold")
        .text("Song Popularity");

    chart.append("text")
        .attr("class", "attributesLabel")
        .attr("text-anchor", "end")
        .attr("x", MARGIN.LEFT + 80)
        .attr("y", MARGIN.TOP + 300)
        .attr("font-size", "20px")
        .attr("font-weight", "bold")
        .text("Song Attributes");

    let yAxis = d3.axisLeft().scale(yScale);

    chart.append("g")
        .attr("class", "xAxis")
        .attr("transform", "translate("+ 0 + ","+ (height - (2 * MARGIN.BOTTOM)) +")")
        .call(xAxis);

    chart.append("g")
        .attr("class", "yAxis")
        .attr("transform", "translate("+ MARGIN.LEFT + "," + (0) +")")
        .call(yAxis);

    //Create x and y axis labels
    let xLabel = "Year";
    let yLabel = "Attribute Measurement";

    chart.append("text")
        .attr("class", "x_label")
        .attr("text-anchor", "end")
        .attr("x", width/2 + 10)
        .attr("y", height - MARGIN.BOTTOM - 20)
        .text(xLabel);

    chart.append("text")
        .attr("class", "y_label")
        .attr("text-anchor", "end")
        .attr("transform", "rotate(-90 " + (MARGIN.LEFT - 40) + " " + (height/2)+")")
        .attr("x", MARGIN.LEFT - 80)
        .attr("y", height/2 )
        .text(yLabel);

    //** CREATE LEGEND *****************************************
    let xLegend = width - 30;
    let yLegend = height/2 + MARGIN.BOTTOM;

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
            .attr("r", 8)
            .style("fill", colour(attributes[i]));
        legend.append("text")
            .attr("x", xLegend + 20)
            .attr("y", yLegend)
            .style("font-size", "14px")
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


    max = 100;
    for(let i = 0; i < ranks.length; i ++)
    {
        for (let j = 0; j < groupByYearArray.length; j++)
        {
            let result = 0;
            let total = 0;
            for (let k = 0; k < 10; k++)
            {
                if(ranks[i] === "songdecade_pos" && groupByYearArray[j][1][k].songdecade_pos !== "") {
                    result = parseFloat(result) + parseFloat(groupByYearArray[j][1][k].songdecade_pos);
                    total++;
                }
                else if(ranks[i] === "songentry_pos" && groupByYearArray[j][1][k].songentry_pos !== "") {
                    result = parseFloat(result) + parseFloat(groupByYearArray[j][1][k].songentry_pos);
                    total++;
                }
            }

            if(result === 0) {
                groupByYearArray[j].push(max);
            }
            else
                groupByYearArray[j].push(result / total);
        }
        max *= 10;
    }

    rankColor = function(d){
        if(d === "songdecade_pos")
            return "#973b39";
        else
            return "#33849d";
    }

    //Create soundwaves
    max = 100;
    offset = 90;
    for(let i = 0; i < ranks.length; i++)
    {
        soundwave = chart.append("g")
            .attr("class", "soundwave")
            .selectAll("bars")
            .data(groupByYearArray)
            .enter()
            .append("rect")
            .attr("class", d => "soundwave-bar " + d[0])
            .attr("x", d => {
                return xScale(d[0]) - 5;
            })
            .attr("y",  d => {
                return (yScaleRanks[ranks[i]](-max + d[(5+i)]));
            })
            .attr("width", 10)
            .attr("height", d => {
                if(d[(5+i)] === max)
                    return 0;
                return yScaleRanks[ranks[i]]((max - d[(5+i)]) *2) - offset;})
            .attr("fill", rankColor(ranks[i]));

        max *= 10;
        offset += (height/6 ) - (MARGIN.TOP) + MARGIN.TOP;
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
            .attr("r", 6)
            .style("stroke", function (d, i)
            {
                return circleColour(attributes[i]);
            })
            .style("fill", "none")
            .style("stroke-width", "4")
            .style("opacity", "0");

    let yearSelected;
    let indexSelected;
    // append a rect to catch mouse movements on canvas
    mouseG.append('svg:rect')
        .attr('width', width - MARGIN.LEFT - MARGIN.RIGHT - 30)
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
            mouseout_soundwave();
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

                    mousemove_soundwave(event, d[indexSelected].data);

                    //Translate vertical line
                    hoverLine.attr("d", function ()
                        {
                            var data = "M" + xScale(d[indexSelected].data[0]) + "," + (height - MARGIN.BOTTOM*2);
                            data += " " + xScale(d[indexSelected].data[0]) + "," + MARGIN.TOP;
                            return data;
                        });

                    return "translate(" + xScale(d[indexSelected].data[0]) + "," + yScale(d[indexSelected][1]) + ")";
                });

            //Get selection
            let selection = getYearSelection(indexSelected);

            //Sort so that attributes are in the stacked order
            var a = selection[0];
            selection[0] = selection[2];
            selection[2] = a;

            //Add tooltip
            tooltip.style("left", (event.pageX + 20) + "px")
                .style("top", (event.pageY - 20) + "px")
                .html("<h2><u>" + yearSelected + "</u></h2>" +
                    "<h3>Click for top songs of the year<h3></h3></br>");

            tooltip.append("div")
                .html(function()
                {
                    let d = selection[0]

                    let noRank = "Unranked";
                    let decadeRank = (d.data[5] === 100) ? noRank : Math.round(d.data[5]);
                    let overallRank = (d.data[6] === 1000) ? noRank : Math.round(d.data[6]);

                    let html = "<h3 style='color: black;font-size:17px;font-weight: bold;'>Average Popularity</h3>"
                    html += "<div style='clear:both;font-size:14px;font-weight: bold;'><span class=\"dot\" " +
                        "style=\"background-color:" + rankColor(ranks[0]) +
                        ";float:left;\">"
                        + "</span>";
                    html += "<span style='float:left; color:" + rankColor(ranks[0]) + "'> Decade Rank: " + "</span>"
                    html += "<span style='float:right; margin-left:10px; color:" + rankColor(ranks[0]) + "'>";
                    html += decadeRank;
                    html += "</span></div>";

                    html += "<div style='clear:both;font-size:14px;font-weight: bold;'><span class=\"dot\" " +
                        "style=\"background-color:" + rankColor(ranks[1]) +
                        ";float:left;\">"
                        + "</span>";
                    html += "<span style='float:left; color:" + rankColor(ranks[1]) + "'> Overall Rank: " + "</span>"
                    html += "<span style='float:right; margin-left:10px; color:" + rankColor(ranks[1]) + "'>";
                    html += overallRank;
                    html += "</span></div></br></br>";
                    return html
                })

            tooltip.selectAll()
                .data(selection).enter()
                .append("div")
                .style("color", d => colour(attributes[d.key]))
                .style('font-size', "14px")
                .style("clear", "both")
                .html((d, i) =>
                {
                    let html = "";
                    if(i === 0)
                    {
                        html += "<h3 style='color: black'>Average Attributes</h3>"
                    }
                    html += "<span class=\"dot\" " +
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
            //Click to scatterplot tab
            document.getElementById("scatterTab").click();

            //Update scatterplot data
            updateScatterTab(indexSelected);
        });

        //Init scatterplot with 1970 data
        updateScatterTab(0);

        // Open stacked chart by default
        document.getElementById("stackedTab").click();

        //TODO: 2. Show sliders for zoom functionality.

};

updateScatterTab = function(indexSelected)
{
    //Clear previous scatterplot data
    d3.selectAll(".parallelLines").remove();
    // d3.selectAll(".rank-line").remove();
    // d3.selectAll(".rank-circle").remove();
    d3.selectAll(".scatterPlot").remove();
    d3.selectAll("#scatter_tooltip").remove();

    let selection = getYearSelection(indexSelected);
    scatterPlot(selection[0].data);
    parallelLines(selection[0].data);
    updateSlider(indexSelected);
}

getYearSelection = function(indexSelected)
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

mouseover_scatter = function(event, d)
{
    for(let j = 0; j < attributes.length; j++)
    {
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
    scatterTooltip.transition().style("opacity", 0.8);
    scatterTooltip.style("left", (545) + "px")
        .style("top", (250) + "px")
        .style("width", 250 + "px")
        .html("<h1>" + d.name + "</h1><h2>by "
            + d.artist + "</h2><br/>" +
            "<h3>Score: "+d.score + "</h3><br/>" +
            "<h3>Year Rank: " + d.songyear_pos + "</h3>" +
            "<h3>Decade Rank: " + d.songdecade_pos + "</h3>" +
            "<h3>Overall Rank: " + d.songentry_pos + "</h3>" +
            "<br/>" +
            "<div style='clear:both'><h3><span style='color:" + heatMapScale[0](3) + ";float:left;'>Instrumentalness: </span><span style='float:right;'>" + d.instrumentalness
            + "</span></h3></div><div style='clear:both'><h3><span style='color:" + heatMapScale[1](3) + ";float:left;'>Energy: </span><span style='float:right;'>"+ d.energy
            + "</span></h3></div><div style='clear:both'><h3><span style='color:" + heatMapScale[2](3) + ";float:left;'>Valence: </span><span style='float:right;'>" + d.valence + "</span></h3></div>");

}

mouseout_scatter = function(event, d)
{
    for(let j = 0; j < attributes.length; j++) {
        let points = document.getElementsByClassName("dot-" + attributes[j]);

        d3.selectAll(points)
            .transition()
            .attr("r", 15);
        d3.selectAll(points)
            .style("opacity", 0.8)
            .style("fill", (d => heatMapScale[j](d.songyear_pos)));
    }

    scatterTooltip.transition().style("opacity", 0);
}


mouseover_parallelLine = function(event, d)
{
    let lines = document.getElementsByClassName("rank-line");
    let dots = document.getElementsByClassName("rank-circle");

    d3.selectAll(lines)
        .filter(function (f) {
            return f.songyear_pos !== d.songyear_pos;
        })
        .style("opacity", 0.1);

    d3.selectAll(dots)
        .filter(function (f) {
            return f.songyear_pos !== d.songyear_pos;
        })
        .style("opacity", 0.1);
}

mouseout_parallelLine = function(event, d)
{
    let lines = document.getElementsByClassName("rank-line");
    let dots = document.getElementsByClassName("rank-circle");

    d3.selectAll(lines)
        .style("opacity", 0.7);
    d3.selectAll(dots)
        .style("opacity", 0.7);
}

mousemove_soundwave = function(event, d)
{
    let bars = document.getElementsByClassName("soundwave-bar");
    let selectedBar = document.getElementsByClassName("soundwave-bar " + d[0]);

    d3.selectAll(bars)
        .filter(function (f) {
            return f[0] !== d[0];
        })
        .style("opacity", 0.4);

    d3.selectAll(selectedBar)
        .style("opacity", 1);
}

mouseout_soundwave = function()
{
    let bars = document.getElementsByClassName("soundwave-bar");
    d3.selectAll(bars)
        .style("opacity", 1);
}
