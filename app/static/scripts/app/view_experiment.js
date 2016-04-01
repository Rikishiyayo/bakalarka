//global variables
//models - array with models displayed in PV viewer to switch between them
//computationData - store a data about a computation that is being displayed(copy of JSON data obtained by AJAX request)
//viewer - represents a PV viewer object
//selectedSolution - number of currently selected solution
var models = [], computationData, viewer, selectedSolution = 1;

//available colors for models in PV viewer
var colors = ['white', 'grey', 'green', 'red', 'blue', 'yellow', 'black', 'cyan', 'magenta', 'orange', 'lightgrey',
                'darkred', 'darkgreen', 'darkblue', 'darkyellow', 'darkcyan', 'darkmagenta', 'darkorange', 'lightorange',
                'darkgrey', 'lightred', 'lightgreen', 'lightblue', 'lightyellow', 'lightcyan', 'lightmagenta'
             ];

//chart options
var chartOptions = {
    chart: { renderTo: 'chart',
             type: 'spline',
             events: {
                redraw: function () {
                }
             }
           },
    xAxis: { title: { text: "q" } },
    yAxis: { title: { text: 'log intensity' } },
    series: [],
    plotOptions: { spline: { lineWidth: 3, marker: { enabled: false } },
                   series: { turboTreshold: 0} },
    tooltip: { enabled: false },
    legend: { enabled: false },
    title: { text: "Computed curves" },
};

//PV viewer options
var options = {
  width: 'auto',
  height: 'auto',
  antialias: true,
  quality : 'medium',
  background: '#cdd0d7'
};

////////////////////////////////////////////// main function - calls other functions ////////////////////////////////////////////////////////////////////////////////////////////
$(function () {
    viewer = pv.Viewer(document.getElementById('jsmolViewer'), options);
    $('.PageWrapper').css('min-width', '1550px');
    $('.best-results-table .result-row').first().addClass('selected-solution');  //set currently displayed solution
    viewExperiment();
    setSelectedRadioButtons();
    setModelViewerWidth();
    windowResizeActions();

    $('.result-row').on('click', function(){
        $('#controls-panel-overlay').show();
        $('#best-results-table-overlay').show();

        var solution = $(this).find('input[type=hidden]').val();
        $('.result-row').removeClass('selected-solution');
        $(this).addClass('selected-solution');

        setSelectedRadioButtons();
        resetSliderValues();
        highlightSelectedRadioButton('select');
        highlightSelectedRadioButton('sort');

        setTimeout(function(){
            chartOptions.series = chartOptions.series.slice(0, 1);
            createButtons(solution);
            loadComputedCurvesForSolution(solution, true);
            displayModels();
        }, 10);
    });

    $('.model_buttons').on('click', 'input', function () {
        var button = $(this);
        $('#controls-panel-overlay').show();
        $('#best-results-table-overlay').show();
        resetSliderValues();
        $('input[type=radio][name=select]:checked').prop('checked', false);
        setTimeout(function(){
            modelButtonClicked(button);
        }, 10);
    });

    // handles a slider value change and displays corresponding models and curves
    $('#sliderWeight').on('input', function () {            //versions of IE < 9 do not support this event, they have proprietary onPropertyChange event
        $('.sliderWeightValue').text($(this).val() + "%");
    });

    $('#sliderSummation').on('input', function () {
        $('.sliderSummationValue').text($(this).val() + "%");
    });

    $('#sliderWeight').on('mouseup', function () {
        var value = $(this).val();

        //remove selected value on another slider
        $('#sliderSummation').val(0);
        $('.sliderSummationValue').text("-");

        $('#controls-panel-overlay').show();
        $('#best-results-table-overlay').show();
        $('.sliderWeightValue').text($(this).val() + "%");
        $('input[type=radio][name=select]:checked').prop('checked', false);
        setTimeout(function(){
            selectButtonsByWeight(value);
            displayModelsSelectedByWeight(value, selectedSolution);
            displayCurves();
        }, 10);
    });

    $('#sliderSummation').on('mouseup', function () {
        var value = $(this).val();

        //remove selected value on another slider
        $('#sliderWeight').val(0);
        $('.sliderWeightValue').text("-");

        $('#controls-panel-overlay').show();
        $('#best-results-table-overlay').show();
        $('.sliderSummationValue').text($(this).val() + "%");
        $('input[type=radio][name=select]:checked').prop('checked', false);
        setTimeout(function(){
            selectButtonsByWeightSummation(value, selectedSolution);
            displayModels();
            displayCurves();
        }, 10);
    });

    $('input[type=radio][name=sort]').on('change', function () {
        var button = $(this);
        $('#controls-panel-overlay').show();
        $('#best-results-table-overlay').show();
        setTimeout(function(){
            radioButtonSortChange(button);
        }, 10);
    });

    $('input[type=radio][name=select]').on('change', function () {
        var button = $(this);
        $('#controls-panel-overlay').show();
        $('#best-results-table-overlay').show();
        resetSliderValues();
        setTimeout(function(){
            radioButtonSelectChange(button);
        }, 10);
    });
//    $('#btnFullscreen').on('click', function () {
//        $('.chart-fullscreen').append($('#chart')).css({ 'display': 'block', 'height': $(window).innerHeight() });
//        var chart = new Highcharts.Chart(options);
//        chart.setSize($('#chart').width(), $('#chart').height());
//    });
//
//    $('.btnCloseChartFullscreen').on('click', function () {
//        $('#chart').insertAfter('#PresentationPanel .DataViewerPanel #jsmolViewer');
//        $('.chart-fullscreen').css('display', 'none');
//        var chart = new Highcharts.Chart(options);
//        chart.setSize($('#chart').width(), $('#chart').height());
//    });
});
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//handles a click on a model button
function modelButtonClicked(button){
        //if user click on model button, select or unselect it and hide/show respective model
        if (canDeselect(button.attr('name'))) {
            button.toggleClass('selected');

            //if all models are selected, select 'Select all' radio button
            $('.Controls input[name=select][value=1]').prop('checked', false);
            highlightSelectedRadioButton('select');
            if (allModelButtonsSelected()) {
                $('.Controls input[name=select][value=1]').prop('checked', true);
                highlightSelectedRadioButton('select');
            }
            displayModels();
            displayCurves();
        }
}

//handles a change in selected radio button for sorting option
function radioButtonSortChange(radioButton){
        switch(radioButton.val()){
            case "1":       //sort weights ascending
                sortModels("asc", selectedSolution);
                highlightSelectedRadioButton("sort");
                return;
            case "2":       //sort weights descending
                sortModels("desc", selectedSolution);
                highlightSelectedRadioButton("sort");
                return;
            case "3":       //sort weights by model number(default state)
                sortModels("def", selectedSolution);
                highlightSelectedRadioButton("sort");
        }
}

//handles a change in selected radio button for select option
function radioButtonSelectChange(radioButton){
    switch(radioButton.val()){
        case "1":       //display all models and curves
            $('.model_buttons input').addClass('selected');
            break;
        case "2":       //hide all models and curves
            $('.model_buttons input').removeClass('selected');
            break;
        case "3":       //display model and curve with highest weight
            $('.model_buttons input').removeClass('selected');
            $('.model_buttons input[name=' + getModelWithHighestWeight(selectedSolution) + ']').addClass('selected');
            break;
    }
    highlightSelectedRadioButton("select");
    displayModels();
    displayCurves();
}

//highlights selected radio button for select and sort option
function highlightSelectedRadioButton(option){
    if (option == "select") {
        $('input[type=radio][name=select]').next().removeClass('option-selected');
        $('input[type=radio][name=select]:checked').next().addClass('option-selected');
    } else if (option == "sort") {
        $('input[type=radio][name=sort]').next().removeClass('option-selected');
        $('input[type=radio][name=sort]:checked').next().addClass('option-selected');
    }
}

function setSelectedRadioButtons(){
    $('input[type=radio][name=select][value=1]').prop('checked', true);
    $('input[type=radio][name=sort][value=3]').prop('checked', true);
}

function resetSliderValues(){
    $('#sliderSummation').val(0);
    $('#sliderWeight').val(0);
    $('.sliderWeightValue').text("-");
    $('.sliderSummationValue').text("-");
}

function setModelViewerWidth(){
    var currentHeight = $('#jsmolViewer').height();
    var currentWidth = $('#jsmolViewer').width();
    $('#jsmolViewer canvas').attr({'width': currentWidth - 2, 'height': currentHeight -1});
}

function windowResizeActions(){
    $(window).resize(function(){
        setTimeout(function(){
            var currentWidth = $('#jsmolViewer').width();
            var currentHeight = $('#jsmolViewer').height();
            $('#jsmolViewer canvas').attr({'width': currentWidth - 1, 'height': currentHeight - 1});
        }, 50);
    });
}

//asynchronously calls a method on a server, which loads experiment data in JSON. If server method succesfully returns data to the browser, 'onGetExperimentDataSuccess' is executed
function viewExperiment() {
    $.get("/get_experiment_data", { user_id: $.url().segment(-2), comp_guid: $.url().segment(-1) }, onGetExperimentDataSuccess);
}

function onGetExperimentDataSuccess(data) {
    computationData = data;
    loadComputedCurvesForSolution(selectedSolution, false);

    chart = new Highcharts.Chart(chartOptions); //create a chart
    var chartWidth = $('#chart').width();
    var chartHeight = $('#chart').height();

    $('#btnZoomIn').click(function () {
        chartWidth *= 1.3;
        chartHeight *= 1.3;
        chart.setSize(chartWidth, chartHeight);
        return false;
    });

    $('#btnZoomOut').click(function () {
        chartWidth *= 0.7;
        chartHeight *= 0.7;
        chart.setSize(chartWidth, chartHeight);
        return false;
    });

    $('#btnDefault').click(function () {
        chart.setSize($('#chart').width(), $('#chart').height());
        return false;
    });

    //set value of a progress bar
//    $(".progressBar").progressbar({
//        value: parseInt(metadata.progress)
//    });
//
//    $('.progress_value').text(metadata.progress + "%");

    viewFile();
    createButtons(selectedSolution);
}

//this function loads data for every computed curve in a given solution to an array of arrays with 2 values - 'q_value' and 'intensity'
function loadComputedCurvesForSolution(solution, override) {
    if (!override)   //load experiment data to highcharts only once in the beginning
        chartOptions.series.push({ data: computationData.experimentData, color: '#434343', type: 'scatter' });

    var curve;
    for (var i = 1; i <= Object.keys(computationData.weights['solution' + solution]).length; i++) {  //iterate through all models of displayed solution
        curve = [];
        $.each(computationData.computedCurves['solution' + solution][i], function (i, v) {  //iterate through all points in that model
            curve.push([v.q_value, Math.log(v.intensity)]);
        });
        if (!override)
            chartOptions.series.push({ data: curve });
        else {
            $('#chart').highcharts().series[i].setData(curve, false);
            $('#chart').highcharts().series[i].setVisible(true, false);
        }
    }

    if (override){
        $('#chart').highcharts().redraw();
        setTimeout(function(){
            $('#controls-panel-overlay').toggle();
            $('#best-results-table-overlay').toggle();
        });
    }
}

function onError(xhr, errorType, exception) {
    var responseText;
    var error = "";
    try {
        responseText = jQuery.parseJSON(xhr.responseText);
        error.append("<div><b>" + errorType + " " + exception + "</b></div>");
        error.append("<div><u>Exception</u>:<br /><br />" + responseText.ExceptionType + "</div>");
        error.append("<div><u>StackTrace</u>:<br /><br />" + responseText.StackTrace + "</div>");
        error.append("<div><u>Message</u>:<br /><br />" + responseText.Message + "</div>");
        alert(error);
    } catch (e) {
        responseText = xhr.responseText;
        alert(responseText);

    }
}

//this function asynchronously loads models to be displayed by PV viewer
function viewFile() {
      pv.io.fetchPdb('/static/uploads/' + $.url().segment(-1) + '/model.pdb', function(structures) {
            for (var i = 0; i < structures.length; i++) {
                models.push(viewer.cartoon('model' + (i + 1), structures[i], { color: pv.color.uniform(colors[i % 26]) }));
            }
            viewer.autoZoom();
            $('.loading-screen').hide();
            $('html body').animate({ scrollTop: 60}, 500);
      }, { loadAllModels : true } );
}

//create buttons that represent each model with weight value in a given file
function createButtons(solution) {
    var targetElement = $('.model_buttons');
    targetElement.html("");
    var models = computationData.weights['solution' + solution];
    for (var i = 1; i <= Object.keys(models).length; i++) {
        targetElement.append("<input type=\"button\" id=\"btnDisplayModel" + i + "\" value=\"Model " + i + "\" class=\"btnModel selected\" name=\""
            + i + "\" />" + "<span class=\"" + i + "\">" + models[i] + "</span>");
    }
}

//return number of model with highest weight
function getModelWithHighestWeight(solution){
    obj = computationData.weights['solution' + solution];
    sortedWeights = Object.keys(obj).sort(function(a,b){return obj[b]-obj[a]})
    return sortedWeights[0];
}

//function sorts model buttons ascending or descending, depending on attribute 'order' value
function sortModels(order, solution) {
    obj = computationData.weights['solution' + solution];
    if (order == "asc")
        sortedWeights = Object.keys(obj).sort(function(a,b){return obj[a]-obj[b]})
    else if (order == "desc")
        sortedWeights = Object.keys(obj).sort(function(a,b){return obj[b]-obj[a]})
    else
        sortedWeights = Object.keys(obj);;

    //get all selected buttons so they can be selected after they are sorted
    var selectedModelsIds = [];
    $('.model_buttons input.selected').each(function () {
        selectedModelsIds.push($(this).attr('id'));
    });

    //create buttons and append them(sorted by weight)
    var targetElement = $('.model_buttons');
    targetElement.html("");
    for (var i = 0; i < sortedWeights.length; i++) {
        targetElement.append("<input type=\"button\" id=\"btnDisplayModel" + sortedWeights[i] + "\" value=\"Model "
            + sortedWeights[i] + "\" class=\"btnModel\" + name=\""
            + sortedWeights[i] + "\" />" + "<span class=\"" + i + "\">" + computationData.weights['solution' + solution][sortedWeights[i]] + "</span>");
    }

    //add class 'selected' to buttons that were selected before sorting
    for (var j = 0; j < selectedModelsIds.length; j++) {
        $('.model_buttons input#' + selectedModelsIds[j]).addClass('selected');
    }

    setTimeout(function() {
        $('#controls-panel-overlay').toggle();
        $('#best-results-table-overlay').toggle();
    }, 10);
}

////this function displays models in PV viewer selected by model buttons or radio buttons
function displayModels() {
    var displayedModels = [];

    //get selected models
    $('.model_buttons input.btnModel.selected').each(function () {
        displayedModels.push(parseInt($(this).attr('name')));
    });

    //show selected models
    $.each(models, function(){
        this.hide();
    });
    if  (displayedModels.length != 0) {
        $.each(displayedModels, function(index, model){
            models[model - 1].show();
        });
    }
    viewer.requestRedraw();
}

//this function displays models in PV viewer which weight is equal to or bigger than weight selected on slider
function displayModelsSelectedByWeight(weight, solution) {
    var displayedModels = [];
    var weights = computationData.weights['solution' + solution];

    //get selected models whose weight is >= selected weight on a slider
    for (var i = 1; i <= Object.keys(weights).length; i++) {
        if (parseFloat(weights[i]) >= (parseFloat(weight) / 100)) {
            displayedModels.push(i);
        }
    }

    //show selected models
    $.each(models,function(){
        this.hide();
    });
    if  (displayedModels.length != 0) {
        $.each(displayedModels, function(index, model){
            models[model - 1].show();
        });
    }
    viewer.requestRedraw();
}

// this function displays curves for selected models on the chart
function displayCurves() {
    var displayedCurves = [];
    var hiddenCurves = [];

    //get selected models
    $('.model_buttons input.btnModel').each(function () {
        if ($(this).hasClass('selected')) {
            displayedCurves.push(parseInt($(this).attr('name'), 10));
        } else {
            hiddenCurves.push(parseInt($(this).attr('name'), 10));
        }
    });

    //execute a script
    var chart = $('#chart').highcharts();
    for (var i = 0; i < displayedCurves.length; i++) {
        var series = chart.series[displayedCurves[i]];
        if (!series.visible) {
            series.setVisible(true, false);
        }
    }
    for (var j = 0; j < hiddenCurves.length; j++) {
        series = chart.series[hiddenCurves[j]];
        if (series.visible) {
            series.setVisible(false, false);
        }
    }
    chart.redraw();
    setTimeout(function() {
        $('#controls-panel-overlay').toggle();
        $('#best-results-table-overlay').toggle();
    }, 10);
}

//this function selects buttons, which weight is equal to or bigger than a selected weight on a slider
function selectButtonsByWeight(weight) {
    $('.model_buttons input').each(function () {
        if (parseFloat($(this).next().text()) >= (parseFloat(weight) / 100)) {
            $(this).addClass('selected');
        } else {
            $(this).removeClass('selected');
        }
    });
    toggleSelectAllButton();
}

//this function selects buttons, which summation of weight is equal to or bigger than a selected value on a slider
function selectButtonsByWeightSummation(value, solution) {
    obj = computationData.weights['solution' + solution];
    sortedWeights = Object.keys(obj).sort(function(a,b){return obj[a]-obj[b]});

    selectedModels = [];
    summation = 0;
    $.each(sortedWeights, function(i, v){
        if ((summation * 100) < parseInt(value))
            selectedModels.push(v);
        summation += parseFloat(computationData.weights['solution' + solution][v]);
    });

    $('.model_buttons input').removeClass('selected');
    $.each(selectedModels, function(i, v){
        $(".model_buttons input[name=" + v + "]").addClass('selected');
    });
    toggleSelectAllButton();
}

//check if clicked button is the last selected button. if yes, return false. if no, return yes.
function canDeselect(model) {
    if ($('.model_buttons input.selected').length == 1 && $('.model_buttons input.selected').attr('name') == model)
        return false;
    return true;
}

//check if all model buttons are clicked.if yes, return true.if no, return false.
function allModelButtonsSelected() {
    if ($('.model_buttons input.btnModel').length == $('.model_buttons input.btnModel.selected').length)
        return true;
    return false;
}

//select radio button 'selectAll' option if all models are selected, otherwise deselect
function toggleSelectAllButton(){
    if (allModelButtonsSelected()) {
        $('.Controls input[type=radio][name=select][value=1]').prop('checked', true);
        highlightSelectedRadioButton('select');
    } else {
        $('.Controls input[type=radio][name=select][value=1]').prop('checked', false);
        highlightSelectedRadioButton('select');
    }
}