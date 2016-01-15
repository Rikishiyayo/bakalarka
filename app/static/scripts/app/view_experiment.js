//global variables
//models - array with models displayed in PV viewer to switch between them
//weights - array with computed weights for every model
//computedCurves - array of computed curves for every model
//metadata - holds information about computation
//represents a PV viewer object
var models = [], weights = [], computedCurves = [], metadata, viewer;

//available colors for models in PV viewer
var colors = ['white', 'grey', 'green', 'red', 'blue', 'yellow', 'black', 'cyan', 'magenta', 'orange', 'lightgrey',
                'darkred', 'darkgreen', 'darkblue', 'darkyellow', 'darkcyan', 'darkmagenta', 'darkorange', 'lightorange',
                'darkgrey', 'lightred', 'lightgreen', 'lightblue', 'lightyellow', 'lightcyan', 'lightmagenta'
             ];

//chart options
var chartOptions = {
    chart: { renderTo: 'chart', type: 'spline' },
    xAxis: { title: { text: "q" } },
    yAxis: { title: { text: 'intensity' } },
    series: [],
    plotOptions: { spline: { lineWidth: 3, marker: { enabled: false } } },
    tooltip: { enabled: false },
    legend: { enabled: false },
    title: { text: "Computed curves" }
};


//PV viewer options
var options = {
  width: 'auto',
  height: 'auto',
  antialias: true,
  quality : 'medium',
  background: '#cdd0d7'
};

////////////////////////////////////////////// main fucntion - calls other functions ////////////////////////////////////////////////////////////////////////////////////////////
$(function () {
    viewer = pv.Viewer(document.getElementById('jsmolViewer'), options);
    $('.PageWrapper').css('min-width', '1550px');
    sliderValueChanged();
    viewExperiment();
    radioButtonSelectChange();
    radioButtonSortChange();
    modelButtonClicked();

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
function modelButtonClicked(){
    $('.model_buttons').on('click', 'input', function () {
        //if user click on model button, select or unselect it and hide/show respective model
        if (canDeselect($(this).attr('name')) && $(this).attr('id') != "btnSelectAll") {
            $('.Controls input#btnSelectAll').removeClass('selected');
            $(this).toggleClass('selected');

            //if all models are selected, select 'Select all' button
            if (allModelButtonsClicked())
                $('.Controls input#btnSelectAll').addClass('selected');

            displayModelsButton();
            displayCurves();
        }
    });
}

//handles a change in selected radio button for sorting option
function radioButtonSortChange(){
    $('input[type=radio][name=sort]').on('change', function () {
        switch($(this).val()){
            case "1":       //sort weights ascending
                sortModels("asc");
                highlightSelectedOption("sort");
                return;
            case "2":       //sort weights descending
                sortModels("desc");
                highlightSelectedOption("sort");
                return;
        }
    });
}

//handles a change in selected radio button for select option
function radioButtonSelectChange(){
    $('input[type=radio][name=select]').on('change', function () {
        switch($(this).val()){
            case "1":       //display all models
                $('.model_buttons input').addClass('selected');
                displayModelsButton();
                displayCurves();
                highlightSelectedOption("select");
                return;
            case "2":       //hide all models
                $('.model_buttons input').removeClass('selected');
                displayModelsButton();
                displayCurves();
                highlightSelectedOption("select");
                return;
            case "3":       //display model with heighest weight
                $('.model_buttons input').removeClass('selected');
                $('.model_buttons input#' + getModelWithHighestWeight()).addClass('selected');
                displayModelsButton();
                displayCurves();
                highlightSelectedOption("select");
                return;
            case "4":       //display model with lowest height
                $('.model_buttons input').removeClass('selected');
                $('.model_buttons input#' + getModelWithLowestWeight()).addClass('selected');
                displayModelsButton();
                displayCurves();
                highlightSelectedOption("select");
                return;
        }
    });
}

//highlights selected radio button for select and sort option
function highlightSelectedOption(option){
    if (option == "select") {
        $('input[type=radio][name=select]').next().removeClass('option-selected');
        $('input[type=radio][name=select]:checked').next().addClass('option-selected');
    } else if (option == "sort") {
        $('input[type=radio][name=sort]').next().removeClass('option-selected');
        $('input[type=radio][name=sort]:checked').next().addClass('option-selected');
    }
}

//return number of model with highest weight
function getModelWithHighestWeight(){
    var temp = weights;
    temp.sort(function (a, b) {
        return b.weight - a.weight;
    });

    return temp[0].model_no;
}

//return id number of model with lowest height
function getModelWithLowestWeight(){
    var temp = weights;
    temp.sort(function (a, b) {
        return a.weight - b.weight;
    });

    return temp[0].model_no;
}

//function sorts model buttons ascending or descending, depending on attribute 'order' value
function sortModels(order) {
    //create a copy of array with weights
    var temp = weights;
    //sort weights ascending or descending
    temp.sort(function (a, b) {
        if (order == "asc")
            return a.weight - b.weight;
        return b.weight - a.weight;
    });

    //get all selected buttons so they can be selected after they are sorted
    var selectedModelsIds = [];
    $('.model_buttons input.selected').each(function () {
        selectedModelsIds.push($(this).attr('id'));
    });

    //create buttons and append them(sorted by weight)
    var targetElement1 = $('.model_buttons');
    targetElement1.html("");
    for (var i = 0; i < temp.length; i++) {
        targetElement1.append("<input type=\"button\" id=\"" + temp[i].model_no + "\" value=\"Model "
            + (temp[i].model_no + 1) + "\" class=\"btnModel\" + name=\""
            + (temp[i].model_no + 1) + "\" />" + "<span class=\"" + i + "\">" + temp[i].weight + "</span>");
    }

    //add class 'selected' to buttons that were selected before sorting
    for (var j = 0; j < selectedModelsIds.length; j++) {
        $('.model_buttons input#' + selectedModelsIds[j]).addClass('selected');
    }
}

// handles a slider value change and displays corresponding models and curves
function sliderValueChanged() {
    $('#slider').on('mousemove', function () {
        $('.sliderValue').text($(this).val() + "%");
    });
    $('#slider').on('mouseup', function () {
        $('input[type=radio][name=select]:checked').prop('checked', false);
        $('input[type=radio][name=select]').change();
        selectButtons($(this).val());
        displayModelsSlider($(this).val());
        displayCurves();
    });
};

//asynchronously calls a method on a server, which loads experiment data in JSON. If server method succesfully returns data to the browser, 'onGetExperimentDataSuccess' is executed
function viewExperiment() {
    $.get("/get_experiment_data", { user_id: $.url().segment(-2), exp_guid: $.url().segment(-1) }
             , onGetExperimentDataSuccess);
}

function onGetExperimentDataSuccess(data) {
    //get metada for current experiment
    metadata = data.metadata;

    //get weights for all models
    var temp = data.weights;
    for (var j = 0; j < temp.length; j++) {
        weights.push({ model_no: j, weight: temp[j] });
    }

    //get all models and its computed values
    $.each(data.computedCurves, function (k, v) {
        computedCurves.push({ model: (k + 1), values: v });
    });

    viewFile();
    createButtons();

    //load data for every curve that will be displayed on chart
    for (var i = 0; i < weights.length; i++) {
        chartOptions.series.push({ data: getComputedCurveForModel(i) });
    }

    //create a chart
    var chart = new Highcharts.Chart(chartOptions);

    //set its width and height
    var chartWidth = $('#chart').width();
    var chartHeight = $('#chart').height();

    //create event listener for zoom in button
    $('#btnZoomIn').click(function () {
        chartWidth *= 1.3;
        chartHeight *= 1.3;
        chart.setSize(chartWidth, chartHeight);
        return false;
    });

    //create event listener for zoom out button
    $('#btnZoomOut').click(function () {
        chartWidth *= 0.7;
        chartHeight *= 0.7;
        chart.setSize(chartWidth, chartHeight);
        return false;
    });

    //create event listener for default size of a chart
    $('#btnDefault').click(function () {
        chart.setSize($('#chart').width(), $('#chart').height());
        return false;
    });

    //set value of a progress bar
    $(".progressBar").progressbar({
        value: parseInt(metadata.progress)
    });

    $('.progress_value').text(metadata.progress + "%");
}

//this function loads data for every computed curve to an array of arrays with 2 values - 'q_value' and 'intensity'
function getComputedCurveForModel(model) {
    var data = [];
    $.each(computedCurves[model].values.model, function (i, o) {
        data.push([o.q_value, Math.log(o.intensity)]);
    });
    return data;
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
  pv.io.fetchPdb('/static/uploads/final.pdb', function(structures) {
    for (var i = 0; i < structures.length; ++i) {
      models.push(viewer.cartoon('model'+ (i + 1), structures[i], { color: pv.color.uniform(colors[i % 26]) }));
    }
    viewer.autoZoom();
  }, { loadAllModels : true } );
}

//create buttons that represent each model with weight value in a given file
function createButtons() {
    var targetElement1 = $('.model_buttons');
    for (var i = 0; i < weights.length; i++) {
        targetElement1.append("<input type=\"button\" id=\"" + weights[i].model_no + "\" value=\"Model " + (weights[i].model_no + 1) + "\" class=\"btnModel selected\" name=\""
            + (weights[i].model_no + 1) + "\" />" + "<span class=\"" + i + "\">" + weights[i].weight + "</span>");
    }
}

////this function displays models in PV viewer sleected by model buttons or select radio buttons
function displayModelsButton() {
    var displayedModels = [];

    //get selected models
    $('.model_buttons input.btnModel.selected').each(function () {
        displayedModels.push(parseInt($(this).attr('name')));
    });

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

//this function displays models in PV viewer sleected by slider
function displayModelsSlider(weight) {
     var displayedModels = [];

    //get selected models whose weight is >= selected weight on a slider
    for (var i = 0; i < weights.length; i++) {
        if (parseFloat(weights[i].weight) >= (parseFloat(weight) / 100)) {
            displayedModels.push(parseInt(weights[i].model_no));
        }
    }

    //show selected models
    $.each(models,function(){
        this.hide();
    });
    if  (displayedModels.length != 0) {
        $.each(displayedModels, function(index, model){
            models[model].show();
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
            displayedCurves.push(parseInt($(this).attr('id'), 10));
        } else {
            hiddenCurves.push(parseInt($(this).attr('id'), 10));
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
}

//this function selects buttons , which weight is equal to orbigger to a selected weight on a slider
function selectButtons(weight) {
    $('.model_buttons input').each(function () {
        if (parseFloat($(this).next().text()) >= (parseFloat(weight) / 100)) {
            $(this).addClass('selected');
        } else {
            $(this).removeClass('selected');
        }
    });
    //select 'btnSelectAll' if all models are selected, otherwise deselect
    if (allModelButtonsClicked()) {
        $('.Controls input#btnSelectAll').addClass('selected');
    } else {
        $('.Controls input#btnSelectAll').removeClass('selected');
    }

}

//check if clicked button is the last selected button. if yes, return false. if no, return yes.
function canDeselect(model) {
    if ($('.model_buttons input.selected').length == 1 && $('.model_buttons input.selected').attr('name') == model)
        return false;
    return true;
}

//check if all model buttons are clicked.if yes, return true.if no, return false.
function allModelButtonsClicked() {
    if ($('.model_buttons input.btnModel').length == $('.model_buttons input.btnModel.selected').length)
        return true;
    return false;
}