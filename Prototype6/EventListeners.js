function openChart(evt, graphName) {
    // Declare all variables
    var i, tabcontent, tablinks;

    // Get all elements with class="tabcontent" and hide them
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    // Get all elements with class="tablinks" and remove the class "active"
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    // Show the current tab, and add an "active" class to the button that opened the tab
    document.getElementById(graphName).style.display = "block";
    evt.currentTarget.className += " active";

    //Change title
    if(graphName == "Stacked")
        document.getElementById("chartTitle").innerHTML = "Songs over the Decades";
    if(graphName == "Scatter")
        document.getElementById("chartTitle").innerHTML = "Top Songs of the Year";
}

updateSliderYearDisplay = function(year)
{
    let yearDisplay = document.getElementById("slider_yearDisplay");
    yearDisplay.innerHTML = year;

    document.getElementById("chartTitle").innerHTML = "Top Songs of the Year: " + year;
}

updateSlider = function(indexSelected, year)
{
    let slider = document.getElementById("yearSlider");
    slider.value = indexSelected;
    updateSliderYearDisplay(year);
}

sliderListener_updateScatterPlot = function(selectObject)
{
    d3.selectAll(".scatterPlot").remove();

    let selection = getSelection(selectObject.value)[0].data;
    updateSliderYearDisplay(selection[0]);
    scatterPlot(selection);

}