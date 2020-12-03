parallelLines = function(data) {

    let svg = d3.select("#SVG_CONTAINER_ParallelLines");
    let chart = svg.append('g')
        .attr("class", "parallelLines");

    let ranks = [rank[1], rank[2], rank[0]];

    //** SCALES *****************************************

    let xScale = d3.scalePoint()
        .domain(ranks)
        .range([MARGIN.LEFT + 75, MARGIN.LEFT + 500]);

    let yScale = {};
    let max = 10;
    for(let i in ranks){
        let name = ranks[i];

        yScale[name] = d3.scaleLinear()
            .domain( [max,1] )
            .range([heightTopSongs - MARGIN.BOTTOM, MARGIN.TOP]);

        max *= 10;
    }

    //** CREATE AXIS ****************************************

    let rankNames = [ "Year Rank", "Decade Rank", "Overall Rank"];
    //x axis
    let xAxis = d3.axisBottom()
        .scale(xScale)
        .tickPadding(20)
        .tickFormat( (d, i) => rankNames[i]);

    chart.append("g")
        .attr("transform", "translate(0," + (heightTopSongs - MARGIN.BOTTOM) + ")")
        .call(xAxis)
        .select(".domain")
        .attr("stroke-width", 0);

    //y axis

    let yAxis = {};
    let offset = 75;
    for(let i in ranks){
        let name = ranks[i];
        yAxis[name] = d3.axisLeft()
            .scale(yScale[name]);

        chart.append("g")
            .attr("class", "yearAxis")
            .attr("transform", "translate("+ (MARGIN.LEFT+offset) + "," + 0 +")")
            .call(yAxis[name]);

        offset += 212.5;
    }

    chart.append("text")
        .attr("class", "popularityLabel")
        .attr("text-anchor", "end")
        .attr("x", MARGIN.LEFT + 220)
        .attr("y", MARGIN.TOP - 20)
        .attr("font-size", "20px")
        .attr("font-weight", "bold")
        .text("Song Popularity");


    let xLegend = 150;
    let yLegend = height - 340;

    let legend = chart.append("g").attr("class", "legend");

    //Colour encoding legend
    legend.append("text")
        .attr("x", xLegend)
        .attr("y", yLegend - 30)
        .text("Line Representation")
        .attr("font-weight", "bold")
        .attr("font-size", "16px");


    legendColor = function(d) {
        if(d === 0)
            return "#a1388d";
        else if (d === 1)
            return "#009ab9";
        else if (d === 2)
            return "#31872a";
        else return "#d7612d";
    };

    let legendNames = ["Has Every Rank","Is Missing Decade Rank", "Is Missing Overall Rank", "Is Missing Both Decade and Overall Rank"];
    for(let i = 0; i < legendNames.length; i++)
    {
        legend.append("circle")
            .attr("cx", xLegend)
            .attr("cy", yLegend)
            .attr("r", 8)
            .style("fill", legendColor(i));
        legend.append("text")
            .attr("x", xLegend + 20)
            .attr("y", yLegend + 5)
            .attr("font-size", "12px")
            .text(legendNames[i]);

        yLegend += 20;
    }

    //** CREATE LINES ****************************************

    function path(d) {
        return d3.line()(ranks.map(function(p,i) {

            if(d[p] === ""){
                if(d[ranks[1]] === "" && d[ranks[2]] === ""){
                    return [xScale(ranks[0]),yScale[ranks[0]](d[ranks[0]])];
                }
                else
                    return [xScale(ranks[i - 1]), yScale[ranks[i - 1]](d[ranks[i - 1]])];
            }else {
                return [xScale(p), yScale[p](d[p])];
            }
        }));
    }

    function color(d) {
        if (d[ranks[1]] === "") {
            if (d[ranks[2]] === "") {
                return "#d7612d";
            } else {
                return "#009ab9";
            }
        } else if (d[ranks[2]] === "") {
            return "#31872a";
        } else {
            return "#a1388d";
        }
    }

    chart.append('g').selectAll("myPath")
        .data(data[1])
        .enter()
        .append("path")
        .attr("class", d => "rank-line " + " " + d.songyear_pos + d.name)
        .attr("d",  path)
        .style("fill", "none")
        .style("stroke", color)
        .style("stroke-width", 5)
        .style("opacity", 0.7)
        .on("mouseover", function(event, d)
        {
            mouseover_parallelLine(event, d);
            mouseover_scatter(event, d)
        })
        .on("mouseout", function(event, d)
        {
            mouseout_parallelLine(event, d);
            mouseout_scatter(event, d)
        })


        for(let i = 0; i < ranks.length; i++) {

        chart.append('g').selectAll("points")
            .data(data[1])
            .enter().append("circle")
            .attr("class", d => "rank-circle " + d.name)
            .filter(function(d){
                return d[ranks[i]] !== "";
            })
            .attr("cx", function (d) {
                return xScale(ranks[i]);
            })
            .attr("cy", function (d) {
                return yScale[ranks[i]](d[ranks[i]]);
            })
            .attr("r", 8)
            .style("fill", color)
            .style("opacity", 0.7)
            .on("mouseover", function(event, d)
            {
                mouseover_parallelLine(event, d);
                mouseover_scatter(event, d);
            })
            .on("mouseout", function(event, d)
            {
                mouseout_parallelLine(event, d);
                mouseout_scatter(event, d);
            })

        }
};
