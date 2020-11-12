window.onload = function(){
    setup("TopYearlySongsAndAttributes.csv");
};

const MARGIN = {
    "LEFT":100,
    "RIGHT":100,
    "TOP":100,
    "BOTTOM":200,
};

//dimension of our workspace
const   width  = 1500,
    height = 1000;

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
            console.log(data);
            line = new lineGraph(data, SVG);
        })

};


lineGraph = function (data, svg) {

    let startYear = 1970;
    let endYear = 2020;
    let years = d3.group(data, d => d.year);
    let uniqueYears = Array.from(years);

    let attributeGroupNames = data.columns.slice(8, 11);    //["energy", "instrumentalness", "valence"]
    let attributeSeries = d3.group(data, d => d.year);

    console.log(attributeSeries);

    xScale = d3.scaleLinear()
        .domain([startYear, endYear])
        .range([MARGIN.LEFT, width - MARGIN.RIGHT]);


    yScale = d3.scaleLinear()
        .domain([0, 1])
        .range([height - MARGIN.BOTTOM, MARGIN.TOP]);


    let colour = d3.scaleOrdinal()
        .domain(attributeGroupNames)
        .range(["green", "blue", "red"]);


    chart = svg.append('g')
        .attr("class", "lineGraph")

    let xAxis = d3.axisBottom()
        .scale(xScale)
        .ticks(uniqueYears.length/5)
        .tickFormat(d3.format("d"));


    chart.append("g")
        .attr("transform", "translate("+ 0 + ","+ (height-MARGIN.BOTTOM) +")")
        .call(xAxis);


    let yAxis = d3.axisLeft().scale(yScale);
    chart.append("g")
        .attr("transform", "translate("+ MARGIN.LEFT + "," + 0 +")")
        .call(yAxis);

    for(let i = 0; i < attributeGroupNames.length; i++)
    {
        let y = attributeGroupNames[i];
        let yValue = function(d) {return d[y]};//get attribute value for row


        var filter = data.filter(function(d) {return d.songyear_pos == 1});
        //
        // let average = function(d) {
        //     let result = 0;
        //     for(let j = 0; j < d.length; j++){
        //         if(i === 0)
        //             result = parseFloat(result) + parseFloat(d[j].energy);
        //         if(i === 1)
        //             result = parseFloat(result) + parseFloat(d[j].instrumentalness);
        //         if(i === 2)
        //             result = parseFloat(result) + parseFloat(d[j].valence);
        //     }
        //     return result / d.length;
        // };

        var line = d3.line()
            .x(function(d) { return xScale(d.year); })
            .y(function(d) {return yScale(d[1][0].energy); })
            .curve(d3.curveMonotoneX);

        chart.append("path")
            .datum(attributeSeries)
            .attr("class", "line")
            .attr("d", line)
            .attr('stroke', colour(attributeGroupNames[i]))
            .attr('stroke-width', 2)
            .attr('fill', 'none');
    }

};
