parallelLines = function(data)
{
    //** SETUP *****************************************
    let svg = d3.select("#SVG_CONTAINER_ParallelLines");
    let chart = svg.append('g')
        .attr("class", "parallelLines");

    console.log(data);

}