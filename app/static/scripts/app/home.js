$(function () {
//    $('.loading-screen div').addClass('animate');
//    setTimeout(function(){
//        $('.loading-screen').hide();
//    }, 4000);
    setSliderValue();
    changeSliderValue();
    setOptParamsVisibility(0);
    setDefaultCalcStepsValue('random_walk');
    changeDefaultCalcStepsValueOnCalcTypeChange();
    fileUploadButtonsBehaviour();
    tooltips();
    advancedSettingsToggleClick();
    validation();
    fileFormatValidation();
    setPages();
    changeStatusColor();
    computationRowHoverAndClick();
    changePageOnPageClick();
    changePageOnNextClick();
    changePageOnPreviousClick();
    reloadList();
});

function setSliderValue(){
    $('.qRange-value').text($('#qRange').val());
}

function changeSliderValue(){
    $('#qRange').on('mousemove mouseup', function(){
        $('.qRange-value').text($(this).val());
    });
}

function changeDefaultCalcStepsValueOnCalcTypeChange(){
    $('input[name=calcType]').on('change', function(){
        var value = $('input[name=calcType]:checked').val();
        setDefaultCalcStepsValue(value);

        if (value == 'random_walk') {
            setOptParamsVisibility(0);
        } else {
            setOptParamsVisibility(1);
        }
    });
}

function setDefaultCalcStepsValue(value){
    if (value == 'random_walk')
        $('#calcSteps').val(500);
    else
        $('#calcSteps').val(10000);
}

function setOptParamsVisibility(visible){
    if (visible == 0) {
        $('#alpha, #beta, #gama').attr('disabled', true).css('color', '#a8a8a8').prev().css('color', '#a8a8a8');
    }
    else {
        $('#alpha, #beta, #gama').attr('disabled', false).css('color', '#4c4c4c').prev().css('color', '#4c4c4c');
    }
}

function fileUploadButtonsBehaviour(){
    $('#models').on('change', function(){
        $(this).parent().next().text(modifyFilename($(this).val()));
    });
    $('#expData').on('change', function(){
        $(this).parent().next().text(modifyFilename($(this).val()));
    });
}

function advancedSettingsToggleClick(){
    $('.advanced-settings-toggle-content-wrapper').on('click', function(){
        $('.advanced-settings').slideToggle(150);
        $(this).find('div.img').toggleClass('advanced-settings-toggle-clicked');
    });
}

//this function reloads list with computations - it asynchronously calls server method that returns list of computations in JSON
function reloadList(){
    $('.img_reload_list').on('click', function(){
        $('.experiment_list_overlay').show();
        $.get("/get_experiments/0", onGetExperimentsSuccess);
        selectPageControl(1);
    });
}

//
function setPages(){
    $('span._1').addClass('selected');
    $('span.page:not(.previous, .next)').slice(13).addClass('hiddenAfter')
}

//this function displays computations for clicked page
function changePageOnPageClick(){
    $('span.page:not(.previous, .next)').on('click', function(){
       if ( !$(this).hasClass('selected') ){
           $.get("/get_experiments/" + (parseInt($(this).text()) - 1).toString(), onGetExperimentsSuccess);
           selectPageControl($(this).text());
       }
    });
}

//this function displays computation for selected page when user clicked 'next' button
function changePageOnNextClick(){
    $('span.next').on('click', function(){
       selectedPage = $('span.page.selected');
       lastVisiblePage = $('span.page:not(.previous, .next):visible').last();

       if ( !selectedPage.is($('span.page:not(.previous, .next)').last()) ){
           $.get("/get_experiments/" + selectedPage.text(), onGetExperimentsSuccess);
           selectPageControl(parseInt(selectedPage.text()) + 1);

           if (selectedPage.is(lastVisiblePage)) {
               $('span.page:not(.previous, .next):visible').first().addClass('hiddenBefore');
               $('span.page:not(.previous, .next).hiddenAfter').first().removeClass('hiddenAfter');
           }
       }
    });
}

//this function displays computation for selected page when user clicked 'previous' button
function changePageOnPreviousClick(){
    $('span.previous').on('click', function(){
       selectedPage = $('span.page.selected');
       firstVisiblePage = $('span.page:not(.previous, .next):visible').first();

       if ( selectedPage.text() != "1" ){
           $.get("/get_experiments/" + ((parseInt(selectedPage.text()) - 2)).toString(), onGetExperimentsSuccess);
           selectPageControl(parseInt(selectedPage.text()) - 1);

           if (selectedPage.is(firstVisiblePage)) {
               $('span.page:not(.previous, .next).hiddenBefore').last().removeClass('hiddenBefore');
               $('span.page:not(.previous, .next):visible').last().addClass('hiddenAfter');
           }
       }
    });
}

//this function erases current list of computations and replaces it with new list
function onGetExperimentsSuccess(data) {
    $('.experiment_list p.experiment_row').detach();
    var exps = data.exps;
    
    for (var i = 0; i < exps.length; i++) {
        var newEl = "<p class=\"experiment_row\">";
        newEl += "<a href=\"/view_experiment/" + exps[i].user_id + "/" + exps[i].exp_guid + "\"></a>";
        newEl += "<span class=\"date\">" + exps[i].date + "</span>";
        newEl += "<span class=\"name\">" + exps[i].title + "</span>";
        newEl += "<span class=\"progress\">" + exps[i].progress + "</span>";
        newEl += "<span class=\"status\">" + exps[i].status + "</span>";
        newEl += "<img src=\"/static/styles/icons/eye_grey.png\">";
        $(newEl).insertBefore('.pagination-controls');
    }
    
    changeStatusColor();
    computationRowHoverAndClick();
    setTimeout(function(){
        $('.experiment_list_overlay').hide();
    }, 500);
}

//change color of a state text according to its value
function changeStatusColor() {
    $('.experiment_row span.status').each(function () {
        switch ($(this).text()) {
            case "accepted":
                $(this).css('color', '#b2a300');
                break;
            case "done":
                $(this).css('color', '#8acc25');
                break;
            case "processing":
                $(this).css('color', 'lightskyblue');
                break;
            case "crashed":
                $(this).css('color', '#F54646');
                break;
            default:
                break;
        }
    });
}

//hovering effect over a row with a computation. Clicking on a row will sent player to a page with results of a clicked computation
function computationRowHoverAndClick(){
        $('.experiment_row').on('mouseover', function () {
            if ($(this).find('a').length != 0) {
                $(this).css({'background-color': 'lightgrey', 'cursor': 'pointer'});
                $(this).find('img').css('display', 'inline-block');
            }
        }).on('mouseout', function () {
            $(this).css({'background-color': 'whitesmoke', 'cursor': 'default'});
            $('.experiment_row img').css('display', 'none');
        }).on('click', function () {
            if ($(this).find('a').length != 0) {
                var href = $(this).children('a').attr('href');
                window.location.href = href;
            }
        });
}

//this function highlights selected page
function selectPageControl(page){
   $('span.page').each(function(){
       $(this).removeClass('selected');
   });
   $('span._' + page).addClass('selected');
}

function validation() {
    $('#new_experiment_form').validate({
        rules: {
            title: {
                required: true
            },
            models: {
                required: true
            },
            expData: {
                required: true
            },
            qRange: {
                required: true,
                number: true
            },
            calcSteps: {
                required: true,
                range: [500, 1000000],
                number: true
            },
            stepsBetweenSync: {
                range: [100, 10000],
                number: true
            },
            alpha: {
                number: true
            },
            beta: {
                number: true
            },
            gama: {
                number: true
            }
        },
        errorPlacement: function(error, element) {
               return true;
        }
    });
}

//jquery validation plugin does not validate allowed extension for some reason mysterious to me
//this method validates selected file for models
//it validates file on form submit and when any input(textarea) control in a form recevies a focus(to simulate jquery validation plugin extension behaviour of validating forms
//when user types in a value and then clicks on a different input control )
function fileFormatValidation() {
    $('form textarea').on('focus', function(){
        if ($('#models').val() != "")
            validateFileFormatForModels();
        if ($('#expData').val() != "")
            validateFileFormatForExpData();
    });
    $('form input').not('input[type=submit]').not('input[type=reset]').on('focus', function(){
        if ($('#models').val() != "")
            validateFileFormatForModels();
        if ($('#expData').val() != "")
            validateFileFormatForExpData();
    });
    $('#new_experiment_form').on('submit', function(){
        var bool1 = validateFileFormatForModels();
        var bool2 = validateFileFormatForExpData();
        if (bool1 && bool2 != true)
            return false;
    });
}

function validateFileFormatForModels(){
    var allowedExtensions = ["zip", "tar.gz", "pdb"];
    var extension = $('#models').val().split('.');
    if(extension.length == 1 || allowedExtensions.indexOf(extension[1]) == -1) {
        $('#models').parent().next().addClass('file-extension-validation-error');
        return false;
    } else {
        $('#models').parent().next().removeClass('file-extension-validation-error');
        return true;
    }
}

function validateFileFormatForExpData(){
    var allowedExtensions = ["dat"];
    var extension = $('#expData').val().split('.');
    if(extension.length == 1 || allowedExtensions.indexOf(extension[1]) == -1) {
        $('#expData').parent().next().addClass('file-extension-validation-error');
        return false;
    } else {
        $('#expData').parent().next().removeClass('file-extension-validation-error');
        return true;
    }
}

function tooltips() {
    position = {
        my: "left center",
        at: "right+25 center",
        collision: "none"
    }
    $( ".row-models" ).tooltip({
        content: "Allowed file formats: 'zip', 'tar.gz' and 'pdb'.",
        position: position,
        items: ".row-models"
    });
    $( ".row-expData" ).tooltip({
        content: "Allowed file formats: 'dat'.",
        position: position,
        items: ".row-expData"
    });
    $( "#calcSteps" ).tooltip({
        content: "Integer number between 500 - 1 000 000.",
        position: position,
        items: "#calcSteps"
    });
    $( "#stepsBetweenSync" ).tooltip({
        content: "Integer number between 100 - 10 000.",
        position: position,
        items: "#stepsBetweenSync"
    });
    $( "#alpha" ).tooltip({
        content: "Maximal length of random walk step, 1 is whole range. Float number.",
        position: position,
        items: "#alpha"
    });
    $( "#beta" ).tooltip({
        content: "This increase of chi2 is accepted with 10% probability by Metropolis criterion. Float number.",
        position: position,
        items: "#beta"
    });
    $( "#gama" ).tooltip({
        content: "chi2 difference scaling in stochastic tunneling transformation. Float number.",
        position: position,
        items: "#gama"
    });
}

//this function modifies name of the selected file to show only filename
function modifyFilename(filename){
    var index = filename.indexOf("fakepath");

    if (index == -1)
        return filename;
    return filename.substring(index + 9);
}


