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

comboboxListener_updateScatterPlot = function(selectObject)
{
    //console.log(selectObject.value);
    //clear
    d3.selectAll(".scatterPlot").remove();


    //TODO: if a year in combobox is selected, update graph.
    let selection = getSelection(selectObject.selectedIndex)[0].data
    scatterPlot(selection);
}