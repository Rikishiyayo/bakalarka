var weights = [], models = [], metadata;
var jmol1;

var info = {
    color: "#cdd0d7", // white background (note this changes legacy default which was black)
    height: 476, // pixels (but it may be in percent, like "100%")
    width: "99%",
    use: "HTML5", // "HTML5" or "Java" (case-insensitive)
    j2sPath: "/static/scripts/j2s", // only used in the HTML5 modality
    console: "jmolApplet0_infodiv"
};

var options = {
    chart: { renderTo: 'chart', type: 'spline' },
    xAxis: { title: { text: "q" } },
    yAxis: { title: { text: 'intensity' } },
    series: [],
    plotOptions: { spline: { lineWidth: 5, marker: { enabled: false } } },
    tooltip: { enabled: false },
    legend: { enabled: false }
};

$(function () {
    $('header').on('mousemove', function(){
        $('.loading-screen').hide();
    });


    $('.PageWrapper').css('min-width', '1550px');
    updateSliderValue();
    viewExperiment();
    radioButtonSelectChange();
    radioButtonSortChange();

    $('.model_buttons').on('click', 'input', function () {
        //if user click on model button, select or unselect it and hide/show respective model
        if (canDeselect($(this).attr('name')) && $(this).attr('id') != "btnSelectAll") {
            $('.Controls input#btnSelectAll').removeClass('selected');
            $(this).toggleClass('selected');

            //if all models are selected, select 'Select all' button
            if (allModelButtonsClicked())
                $('.Controls input#btnSelectAll').addClass('selected');

            displayModelsButton();
            displayCharts();
        }
    });

    $('#btnFullscreen').on('click', function () {
        $('.chart-fullscreen').append($('#chart')).css({ 'display': 'block', 'height': $(window).innerHeight() });
        var chart = new Highcharts.Chart(options);
        chart.setSize($('#chart').width(), $('#chart').height());
    });

    $('.btnCloseChartFullscreen').on('click', function () {
        $('#chart').insertAfter('#PresentationPanel .DataViewerPanel #jsmolViewer');
        $('.chart-fullscreen').css('display', 'none');
        var chart = new Highcharts.Chart(options);
        chart.setSize($('#chart').width(), $('#chart').height());
    });
});

function radioButtonSortChange(){
    $('input[type=radio][name=sort]').on('change', function () {
        switch($(this).val()){
            case "1":
                sortModels("asc");
                highlightSelectedOption("sort");
                return;
            case "2":
                sortModels("desc");
                highlightSelectedOption("sort");
                return;
        }
    });
}

function radioButtonSelectChange(){
    $('input[type=radio][name=select]').on('change', function () {
        switch($(this).val()){
            case "1":
                $('.model_buttons input').addClass('selected');
                displayModelsButton();
                displayCharts();
                highlightSelectedOption("select");
                return;
            case "2":
                $('.model_buttons input').removeClass('selected');
                displayModelsButton();
                displayCharts();
                highlightSelectedOption("select");
                return;
            case "3":
                $('.model_buttons input').removeClass('selected');
                $('.model_buttons input#' + getModelWithHighestWeight()).addClass('selected');
                displayModelsButton();
                displayCharts();
                highlightSelectedOption("select");
                return;
            case "4":
                $('.model_buttons input').removeClass('selected');
                $('.model_buttons input#' + getModelWithLowestWeight()).addClass('selected');
                displayModelsButton();
                displayCharts();
                highlightSelectedOption("select");
                return;
        }
    });
}

function highlightSelectedOption(option){
    if (option == "select") {
        $('input[type=radio][name=select]').next().removeClass('option-selected');
        $('input[type=radio][name=select]:checked').next().addClass('option-selected');
    } else if (option == "sort") {
        $('input[type=radio][name=sort]').next().removeClass('option-selected');
        $('input[type=radio][name=sort]:checked').next().addClass('option-selected');
    }
}

//return id of a model with highest weight
function getModelWithHighestWeight(){
    var temp = weights;
    temp.sort(function (a, b) {
        return b.weight - a.weight;
    });

    return temp[0].model_no;
}

//return id of a model with lowest height
function getModelWithLowestWeight(){
    var temp = weights;
    temp.sort(function (a, b) {
        return a.weight - b.weight;
    });

    return temp[0].model_no;
}

//function sorts model buttons ascending or descending, depending on attribute value
function sortModels(order) {
    //create a copy of array with weights
    var temp = weights;
    //sort weights ascending
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

function updateSliderValue() {
    $('#slider').on('mousemove', function () {
        $('.sliderValue').text($(this).val() + "%");
    });
    $('#slider').on('mouseup', function () {
        $('input[type=radio][name=select]:checked').prop('checked', false);
        $('input[type=radio][name=select]').change();
        selectButtons($(this).val());
        displayModelsSlider($(this).val());
        displayCharts();
    });
};

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
    $.each(data.models, function (k, v) {
        models.push({ model: (k + 1), values: v });
    });

    viewFile();

    for (var i = 0; i < weights.length; i++) {
        options.series.push({ data: getComputedDataForModel(i) });
    }
    var chart = new Highcharts.Chart(options);

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

    $(".progressBar").progressbar({
        value: parseInt(metadata.progress)
    });

    $('.progress_value').text(metadata.progress + "%");
}

function getComputedDataForModel(model) {
    var data = [];
    $.each(models[model].values.model, function (i, o) {
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

function viewFile() {
    setTimeout(function(){
        $('header').mousemove();
    }, 3000);
    $('.model_buttons').html("");
    //open file and display it - defaultly all models
//    Jmol._isAsync = true;
    jmol1 = Jmol.getApplet("jmol1", info);
    Jmol.script(jmol1, "load /static/uploads/final.pdb; ribbons only");
    $("#jsmolViewer").html(Jmol.getAppletHtml(jmol1));
    Jmol.script(jmol1, "frame all");
    Jmol.script(jmol1, "select model = 1; color red;select model = 2; color deepskyblue;select model = 3; color cyan;" +
        "select model = 4; color gold;select model = 5; color green;select model = 6; color chartreuse;select model = 7; color deeppink;select model = 8; color magenta;select model = 9; color darkmagenta;" +
        "select model = 10; color turquoise;select model = 11; color orange;select model = 12; color mediumspringgreen;select model = 13; color purple;select model = 14; color redorange;" +
        "select model = 15; color blue;" + "select model = 16; color yellow;select model = 17; color greenblue;select model = 18; color gray;select model = 19; color black;" +
        "select model = 20; color burlywood");
    createButtons();

}

//create control buttons and buttons that represent each model in a given file
function createButtons() {
    var targetElement1 = $('.model_buttons');
    for (var i = 0; i < weights.length; i++) {
        targetElement1.append("<input type=\"button\" id=\"" + weights[i].model_no + "\" value=\"Model " + (weights[i].model_no + 1) + "\" class=\"btnModel selected\" name=\""
            + (weights[i].model_no + 1) + "\" />" + "<span class=\"" + i + "\">" + weights[i].weight + "</span>");
    }
}

//this function displays selected models
function displayModelsButton() {
    var displayedModels = "";

    //get selected models
    $('.model_buttons input.btnModel.selected').each(function () {
        displayedModels += $(this).attr('name') + " ";
    });

    //erase a last whitespace
    displayedModels = displayedModels.substring(0, displayedModels.length - 1);

    //execute a script
    if  (displayedModels == "") {
        Jmol.script(jmol1, "display none")
    } else {
        Jmol.script(jmol1, "display all");
        Jmol.script(jmol1, "frame [" + displayedModels + "]");
    }
}

function displayModelsSlider(weight) {
    var displayedModels = "";

    //get selected models whose weight is >= selected weight on a slider
    for (var i = 0; i < weights.length; i++) {
        if (parseFloat(weights[i].weight) >= (parseFloat(weight) / 100)) {
            displayedModels += (weights[i].model_no + 1) + " ";
        }
    }

    //erase a last whitespace
    displayedModels = displayedModels.substring(0, displayedModels.length - 1);

    //execute a script
    if (displayedModels == "") { //hide all models
        Jmol.script(jmol1, "display none");
    } else {
        Jmol.script(jmol1, "display all");
        Jmol.script(jmol1, "frame [" + displayedModels + "]");
    }
}

function displayCharts() {
    var displayedCharts = [];
    var hiddenCharts = [];

    //get selected models
    $('.model_buttons input.btnModel').each(function () {
        if ($(this).hasClass('selected')) {
            displayedCharts.push(parseInt($(this).attr('id'), 10));
        } else {
            hiddenCharts.push(parseInt($(this).attr('id'), 10));
        }
    });

    //execute a script
    var chart = $('#chart').highcharts();
    for (var i = 0; i < displayedCharts.length; i++) {
        var series = chart.series[displayedCharts[i]];
        if (!series.visible) {
            series.setVisible(true, false);
        }
    }
    for (var j = 0; j < hiddenCharts.length; j++) {
        series = chart.series[hiddenCharts[j]];
        if (series.visible) {
            series.setVisible(false, false);
        }
    }
    chart.redraw();
}

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