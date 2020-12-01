parallelLinesSetup = function(data) {
    //** SETUP *****************************************

    let ranks = [];
    let originalData = d3.csv("data.csv")
        .then(function (d) {
            ranks = d.columns.slice(5, 8);
            parallelLines(data, ranks);
        });
};

parallelLines = function(data, ranks) {

    let svg = d3.select("#SVG_CONTAINER_ParallelLines");
    let chart = svg.append('g')
        .attr("class", "parallelLines");

    console.log(ranks);

    ranks = [ranks[1], ranks[2], ranks[0]];

    //** SCALES *****************************************

    let xScale = d3.scalePoint()
        .domain(ranks)
        .range([MARGIN.LEFT + 75, MARGIN.LEFT + 300]);

    let yScale = {};
    let max = 10;
    for(let i in ranks){
        let name = ranks[i];
        yScale[name] = d3.scaleLinear()
            .domain( [max,1] )
            .range([height - MARGIN.BOTTOM, MARGIN.TOP]);

        max *= 10;
    }

    //** CREATE AXIS ****************************************

    //x axis
    let xAxis = d3.axisBottom()
        .scale(xScale)
        .tickPadding(20);

    chart.append("g")
        .attr("transform", "translate(0," + (height - MARGIN.BOTTOM) + ")")
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

        offset += 112.5;
    }

    //** CREATE LINES ****************************************

    function path(d) {
        return d3.line()(ranks.map(function(p) {

            console.log("dp" + d[p] + " " + p);
            return [xScale(p), yScale[p](d[p])]; }));
    }

    chart.append('g').selectAll("myPath")
        .data(data[1])
        .enter().append("path")
        .attr("d",  path)
        .style("fill", "none")
        .style("stroke", "#a0509b")
        .style("stroke-width", 3)
        .style("opacity", 0.5);
};
