var pages, filterOptions = {}, compBeingDeleted;
var formFieldPosition = {
        my: "left center",
        at: "right+20 center",
        collision: "none"
    };

$(function () {
    changeTooltipPositionONWindowResize();
    preloadImages();
    setSliderValue();
    changeSliderValue();
    setOptParamsVisibility(0);
    setDefaultCalcStepsValue('random_walk');
    changeDefaultCalcStepsValueOnCalcTypeChange();
    highlightSelectedRadioButton();
    fileUploadButtonsBehaviour();
    advancedSettingsToggleClick();
    clearFilenamesAfterFormReset();

    reloadList();
    changeStatusColor();
    nonErroneousComputationRowHoverAndClick();
    erroneousComputationRowHoverAndClick();
//    deleteAllHoverAndClick();
    deleteRowButtonHoverAndClick();

    setPages();
    changePageOnPageClick();
    changePageOnNextClick();
    changePageOnPreviousClick();

    filterToggleClick();
    toggleHelpClick();
    sortList();
    filterList();
    clearFilter();

    validation();
    fileFormatValidation();

    tooltips();
    setComputationFormTooltipPosition();
    toggleHelpTooltips();
    dialog();
});

function changeTooltipPositionONWindowResize() {
    $(window).resize(function () {
        setComputationFormTooltipPosition();
    });
}

function setComputationFormTooltipPosition() {
    var abovePosition = {
        my: "right top-70",
        at: "right",
        collision: "none"
    };
    var rightPosition = {
        my: "left center",
        at: "right+20 center",
        collision: "none"
    };
    var down = "downArrowTooltip";
    var left = "leftArrowTooltip";
    if(window.innerWidth < 1200)
        computationRequestFormTooltips(abovePosition, down, 1);
    else
        computationRequestFormTooltips(rightPosition, left, 400);
}

function preloadImages() {
    images = ["/static/styles/icons/recycle_bin_red.png", "/static/styles/icons/question-mark-on.png", "/static/styles/icons/question-mark-off.png", "/static/styles/icons/arrow_up.png",
                "/static/styles/icons/gmail_dark_red.png", "/static/styles/icons/fb_dark_blue.png"];
    for (var i = 0; i < images.length; ++i) {
        var img = new Image();
        img.src = images[i];
    }
}

//---------------------------------------------------------------------------------ajax callback functions---------------------------------------------------------------------------------------
//success function for asynchronous calls, erases current list of computations and replaces it with new list
function onGetExperimentsSuccess(data) {
    $('.experiment_list .experiment_row').detach();
    var comps = data.comps;
    pages = data.pages;

    for (var i = 0; i < comps.length; i++) {
        var newEl = "<div class=\"experiment_row " + comps[i].status + "\">";

        if(comps[i].progress != 0 || comps[i].status == 'user_error' || comps[i].status == 'server_error'){
            newEl += "<a href=\"/view_experiment/" + comps[i].user_id + "/" + comps[i].comp_guid + "\"></a>";
        }

        newEl += "<span class=\"date\">" + comps[i].date + "</span>";
        newEl += "<span class=\"name\">" + comps[i].name + "</span>";
        newEl += "<span class=\"_progress\">" + comps[i].progress + "</span>";
        newEl += "<span class=\"status\">" + comps[i].status + "</span>";
        if(comps[i].progress != 0 || comps[i].status == 'user_error' || comps[i].status == 'server_error'){
            newEl += "<img class='delete' src=\"/static/styles/icons/recycle_bin.png\">";
        }
        if(comps[i].status == "user_error"){
            newEl += "<div class=\"error-row\">" + comps[i].error_message + "</div></div>";
        }
        $('.experiments-rows-wrapper').append(newEl);
    }
    changeStatusColor();
    nonErroneousComputationRowHoverAndClick();
    erroneousComputationRowHoverAndClick();
//    deleteAllHoverAndClick();
    deleteRowButtonHoverAndClick();
}

//error function for getComputations asynchronous calls, tries to log error to saxs.log on server
function onGetComputationsError(jqXHR, textStatus, errorThrown) {
    $('.get-comps-error').show();
    setTimeout(function () {
        $('.error-info').fadeOut(700);
        hideOverlays();
    }, 3000);
}

//error function for deleteComputation asynchronous call, tries to log error to saxs.log on server
function onDeleteComputationError(jqXHR, textStatus, errorThrown) {
    $('.delete-comps-error').show();
    setTimeout(function () {
        $('.error-info').fadeOut(700);
        hideOverlays();
    }, 3000);
}

//complete function for asynchronous calls, hides loading gif and displays error message to user
function onGetExperimentsComplete(textStatus) {
    setTimeout(function(){
        $('.experiment_list_overlay').hide();
        if (textStatus.status == 200)
            hideOverlays();
    }, 300);
}
//--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

//---------------------------------------------------------------------------------form manipulation------------------------------------------------------------------------------------------
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
        highlightSelectedRadioButton();
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
    if (visible == 0)
        $('#alpha, #beta, #gamma').attr('disabled', true).css('color', '#a8a8a8').prev().css('color', '#a8a8a8');
    else
        $('#alpha, #beta, #gamma').attr('disabled', false).css('color', '#4c4c4c').prev().css('color', '#4c4c4c');
}

function highlightSelectedRadioButton(){
    $('span.calcType label').removeClass('selected-radio-button');
    $('input[name=calcType]:checked').next().addClass('selected-radio-button');
}

function clearFilenamesAfterFormReset(){
    $('#btnReset').on('click', function(){
        $('.row-models span.filename').text("");
        $('.row-expData span.filename').text("");
    });
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
//--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

//--------------------------------------------------------------------------list of computations manipulation---------------------------------------------------------------------------------
//this function reloads list with computations - it asynchronously calls server method that returns list of computations in JSON
function reloadList(){
    $('.img_reload_list').on('click', function(){
        $('.error-info').hide();
        showOverlays();
        $('.search-filter input').val('');
        filterOptions = {};
        $.ajax({
            type: 'POST',
            url: "/get_experiments/0/date/-1",
            data: JSON.stringify({}),
            contentType: 'application/json',
            success: function(data){
                onGetExperimentsSuccess(data);
                createPaginationControls(pages);
                setPages();
                resetSortOrder();
            },
            complete: onGetExperimentsComplete,
            error: onGetComputationsError
        })
    });
}

function changeStatusColor() {
    $('.experiment_row span.status').each(function () {
        switch ($(this).text()) {
            case "accepted":
                $(this).css('color', '#b2a300');
                break;
            case "done":
                $(this).css('color', 'green');
                break;
            case "running":
                $(this).css('color', 'lightskyblue');
                break;
            case "queued":
                $(this).css('color', 'blue');
                break;
            case "checked":
                $(this).css('color', 'brown');
                break;
            case "preprocessed":
                $(this).css('color', 'pink');
                break;
            case "storage_ready":
                $(this).css('color', 'purple');
                break;
            case "optim_completed":
                $(this).css('color', 'magenta');
                break;
            case "server_error":
                $(this).css('color', 'red');
                break;
            case "user_error":
                $(this).css('color', 'red');
                break;
            default:
                break;
        }
    });
}

//hovering effect over a row with a computation. Clicking on a row will sent player to a page with results of a clicked computation
//delete button will be shown only if status is 'done'
function nonErroneousComputationRowHoverAndClick(){
    $('.experiment_row:not(.server_error, .user_error)').on('mouseover', function () {
        if ($(this).find('a').length != 0) {
            $(this).addClass('highlight');
            $(this).find('img').css('opacity', '1');
        }
    }).on('mouseout', function () {
        if ($(this).find('a').length != 0) {
            $(this).removeClass('highlight');
            $('.experiment_row img').css('opacity', '0');
        }
    }).on('click', function () {
        if ($(this).find('a').length != 0) {
            window.location.href = $(this).children('a').attr('href');
        }
    });
}

//hovering effect over a row with an erroneous computation. Clicking on this row will display player an error message
//delete button will be shown always, because the computation is erroneous, thus we can delete it seamlessly
function erroneousComputationRowHoverAndClick(){
    $('.experiment_row.user_error, .experiment_row.server_error').on('mouseover', function () {
        $(this).addClass('highlight');
        $(this).find('img').css('opacity', '1');
    }).on('mouseout', function () {
        $(this).removeClass('highlight');
        $('.experiment_row img').css('opacity', '0');
    }).on('click', function () {
        var errorRow = $(this).children('.error-row');
        errorRow.slideToggle(150);
        if(errorRow.length == 1)
            $(this).toggleClass("selectedRow");
    });
}

//function deleteAllHoverAndClick(){
//    $('.list-header .delete-all').on('mouseover', function () {
//        $(this).attr('src', '/static/styles/icons/recycle_bin_red.png');
//    }).on('mouseout', function () {
//        $(this).attr('src', '/static/styles/icons/recycle_bin.png');
//    }).on('click', function () {
//        alert("Are you sure you want to delete all computations ?");
//        $.ajax({
//            type: 'POST',
//            url: "/delete_computations",
//            data: JSON.stringify({'all': 'True'}),
//            contentType: 'application/json',
//            success: function(){
//                $('.img_reload_list').trigger('click');
//            }
//        });
//    });
//}

function deleteRowButtonHoverAndClick(){
    $('.experiment_row img').on('mouseover', function () {
        $(this).attr('src', '/static/styles/icons/recycle_bin_red.png');
    }).on('mouseout', function () {
        $(this).attr('src', '/static/styles/icons/recycle_bin.png');
    }).on('click', function (e) {
        e.stopPropagation();
        compBeingDeleted = getInfoOfComputationBeingDeleted($(this).parent());
        $('.delete-dialog').dialog("open");
    });
}

function deleteComputation(){
    $('.error-info').hide();
    showOverlays();
    var data = compBeingDeleted;
    data['filter_values'] = filterOptions;

    var selectedPageEl = $('span.page.selectedPaginationControl');
    if (selectedPageEl.length == 0)
        var selectedPage = 0;
    else
        selectedPage = parseInt(selectedPageEl.text()) - 1;

    $.ajax({
        type: 'POST',
        url: "/delete_computations/" + selectedPage + "/" + getSortOption() + "/" + determineSortOrder(),
        data: JSON.stringify(data),
        contentType: 'application/json',
        success: function(data){
            onGetExperimentsSuccess(data);
            createPaginationControls(pages);
            setPages();
            selectPageControl(selectedPage + 1);
        },
        complete: onGetExperimentsComplete,
        error: onDeleteComputationError
    });
}

function getInfoOfComputationBeingDeleted(element){
    var json = {'all': 'False'};
    json['comp_guid'] = element.children('a').attr('href').split('/')[3];
    return json;
}

function hideOverlays() {
    $('.list-header-overlay').hide();
    $('.search-filter-overlay').hide();
    $('.img-reload-list-overlay').hide();
    $('.filter-toggle-overlay').hide();
    $('.pagination-controls-overlay').hide();
}

function showOverlays() {
    $('.experiment_list_overlay').show();
    $('.list-header-overlay').show();
    $('.search-filter-overlay').show();
    $('.img-reload-list-overlay').show();
    $('.filter-toggle-overlay').show();
    $('.pagination-controls-overlay').show();
}
//----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

//--------------------------------------------------------------------------------pagination controls-------------------------------------------------------------------------------------------
//this function displays computations for clicked page
function changePageOnPageClick(){
    $('.pagination-controls').on('click', 'span.page:not(.previous, .next, .selectedPaginationControl)', function(){
        var selectedPage = $(this);
        $('.error-info').hide();
        showOverlays();
        $.ajax({
            type: 'POST',
            url: "/get_experiments/" + (parseInt($(this).text()) - 1).toString() + "/" + getSortOption() + "/" + determineSortOrder(),
            contentType: 'application/json',
            success: function (data) {
                onGetExperimentsSuccess(data);
                selectPageControl(selectedPage.text());
            },
            complete: onGetExperimentsComplete,
            error: onGetComputationsError,
            data: JSON.stringify(filterOptions),
            dataType: 'json'
        });
    });
}

//this function displays computation for selected page when user clicked 'next' button
function changePageOnNextClick(){
    $('span.next').on('click', function(){
        var selectedPage = $('span.page.selectedPaginationControl');
        var lastVisiblePage = $('span.page:not(.previous, .next):visible').last();
        if ( !selectedPage.is($('span.page:not(.previous, .next)').last()) ){
            $('.error-info').hide();
            showOverlays();
            $.ajax({
                type: 'POST',
                url: "/get_experiments/" + selectedPage.text() + "/" + getSortOption() + "/" + determineSortOrder(),
                contentType: 'application/json',
                success: function (data) {
                    onGetExperimentsSuccess(data);
                    selectPageControl(parseInt(selectedPage.text()) + 1);
                    if (selectedPage.is(lastVisiblePage)) {
                        $('span.page:not(.previous, .next):visible').first().addClass('hiddenBefore');
                        $('span.page:not(.previous, .next).hiddenAfter').first().removeClass('hiddenAfter');
                    }
                },
                complete: onGetExperimentsComplete,
                error: onGetComputationsError,
                data: JSON.stringify(filterOptions),
                dataType: 'json'
            });
        }
    });
}

//this function displays computation for selected page when user clicked 'previous' button
function changePageOnPreviousClick(){
    $('span.previous').on('click', function(){
        var selectedPage = $('span.page.selectedPaginationControl');
        var firstVisiblePage = $('span.page:not(.previous, .next):visible').first();
        if ( selectedPage.text() != "1" ){
            $('.error-info').hide();
            showOverlays();
            $.ajax({
                type: 'POST',
                url: "/get_experiments/" + ((parseInt(selectedPage.text()) - 2)).toString() + "/" + getSortOption() + "/" + determineSortOrder(),
                contentType: 'application/json',
                success: function (data) {
                    onGetExperimentsSuccess(data);
                    selectPageControl(parseInt(selectedPage.text()) - 1);
                    if (selectedPage.is(firstVisiblePage)) {
                        $('span.page:not(.previous, .next).hiddenBefore').last().removeClass('hiddenBefore');
                        $('span.page:not(.previous, .next):visible').last().addClass('hiddenAfter');
                    }
                },
                complete: onGetExperimentsComplete,
                error: onGetComputationsError,
                data: JSON.stringify(filterOptions),
                dataType: 'json'
            });
        }
    });
}

function createPaginationControls(pages){
    $('.pagination-controls span').detach();
    if (pages <= 1)
        return;
    $('.pagination-controls').append("<span class=\"page previous\"> < </span>");
    var newEl;
    for (var i = 1; i <= parseInt(pages); i++){
        newEl = "<span class=\"page _" + i + "\">" + i + "</span>";
        $('.pagination-controls').append(newEl);
    }
    $('.pagination-controls').append("<span class=\"page next\"> > </span>");
    changePageOnNextClick();
    changePageOnPreviousClick();
    changePageOnPageClick();
}

function setPages(){
    $('span._1').addClass('selectedPaginationControl');
    $('span.page:not(.previous, .next)').slice(13).addClass('hiddenAfter');
}

//this function highlights selected page
function selectPageControl(page){
    $('span.page').each(function(){
        $(this).removeClass('selectedPaginationControl');
    });
    if ($('span.page:not(.previous, .next)').length != 0 && parseInt($('span.page:not(.previous, .next)').last().text()) < page)
        $('span._' + (page - 1)).addClass('selectedPaginationControl');
    else
        $('span._' + page).addClass('selectedPaginationControl');
}
//-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

//--------------------------------------------------------------------------------filtering and sorting----------------------------------------------------------------------------------
function filterToggleClick(){
    $('.experiment_list .filter-toggle').on('click', function(){
        $('.experiment_list .search-filter').slideToggle(150);
        $(this).toggleClass('filter-toggle-clicked');
    });
}

function toggleHelpClick() {
    $('.search-filter').on('click', 'img.toggle-help.enabled', function () {
        $(this).removeClass("enabled").addClass("disabled");
        toggleHelpTooltips();
        setCookie("disabled");
    });
    $('.search-filter').on('click', 'img.toggle-help.disabled', function () {
        $(this).removeClass("disabled").addClass("enabled");
        toggleHelpTooltips();
        setCookie("enabled");
    });
}

function toggleHelpTooltips() {
    var el = $('.search-filter img.toggle-help');
    if (el.hasClass("enabled")) {
        el.tooltip( "option", "content", "Turn Off Help" );  //set content of tooltip
        el.attr('src', '/static/styles/icons/question-mark-on.png');  //set image
        $('input.date, input.status, input.name, input._progress').tooltip("enable");  //enable filter tooltips
    }
    else {
        el.tooltip( "option", "content", "Turn On Help" );  //set title of tooltip
        el.attr('src', '/static/styles/icons/question-mark-off.png');
        $('input.date, input.status, input.name, input._progress').tooltip("disable");
    }
}

function setCookie(value) {
    $.ajax({
        type: 'POST',
        url: "/set_cookie",
        contentType: 'application/json',
        data: JSON.stringify(value),
        dataType: 'json'
    });
}

function filterList(){
    $('.search-filter .filter').on('click', function(){
        if (!filterValidation()) return;
        $('.search-filter input').removeClass("search-filter-validation-error");
        filterOptions = {};
        $('.error-info').hide();
        showOverlays();
        $.ajax({
            type: 'POST',
            url: "/get_experiments/0/" + getSortOption() + '/' + determineSortOrder(),
            contentType: 'application/json',
            success: function(data){
                onGetExperimentsSuccess(data);
                createPaginationControls(pages);
                setPages();
            },
            complete: onGetExperimentsComplete,
            error: onGetComputationsError,
            data: JSON.stringify(getFilterArguments()),
            dataType: 'json'
        });
    });
}

function sortList(){
    $('.list-header > span > span').on('click', function(){
        var clickedEl = $(this);
        setSortOrder(clickedEl.parent());
        $('.error-info').hide();
        showOverlays();
        $.ajax({
            type: 'POST',
            url: "/get_experiments/0/" + $(this).parent().attr('id') + "/" + determineSortOrder(),
            contentType: 'application/json',
            success: function (data) {
                onGetExperimentsSuccess(data);
                selectPageControl(1);
                showSortOrderIcon(clickedEl);
            },
            complete: onGetExperimentsComplete,
            error: onGetComputationsError,
            data: JSON.stringify(filterOptions),
            dataType: 'json'
        });
    });
}

function clearFilter() {
    $('.search-filter .clear-filter').on('click', function(){
        $('.search-filter input').val("").removeClass("search-filter-validation-error");
    });
}

function showSortOrderIcon(clickedElement){
    $('.list-header span img').removeClass('visible');
    clickedElement.children('img').addClass('visible');
    if (determineSortOrder() == 1)
        clickedElement.children('img').attr('src', '/static/styles/icons/arrow_up.png');
    else
        clickedElement.children('img').attr('src', '/static/styles/icons/arrow_down2.png');
}

function setSortOrder(element){
    if(element.hasClass('ascending'))
        element.removeClass('ascending').addClass('descending');
    else if(element.hasClass('descending'))
        element.removeClass('descending').addClass('ascending');
    else {
        $('.list-header span').removeClass();
        element.addClass('descending');
    }
}

function determineSortOrder(){
    var sortAttr = $('.list-header span.ascending, .list-header span.descending');
    if (sortAttr.length != 0 && sortAttr.hasClass('ascending'))
        return 1;
    if (sortAttr.length != 0 && sortAttr.hasClass('descending'))
        return -1;
    return 0;
}

function getSortOption(){
    var sortAttr = $('.list-header span.ascending, .list-header span.descending');
    if (sortAttr.length == 0)
        return 0;
    return sortAttr.attr('id');
}

function resetSortOrder(){
    $('.list-header span').removeClass();
    $('.list-header span#date').addClass('descending');
    $('.list-header span img').removeClass('visible');
    $('.list-header span#date img').attr('src', '/static/styles/icons/arrow_down2.png').addClass('visible');
}

function getFilterArguments(){
    var result = {};
    $('.search-filter input').each(function(){
        if($(this).val().trim() != "") {
            result[$(this).attr('class')] = $(this).val().trim();
            filterOptions[$(this).attr('class')] = $(this).val().trim();
        }$('.search-filter input._progress')
    });
    return result;
}
//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

//----------------------------------------------------------------------------------validation-----------------------------------------------------------------------------------------
function validation() {
    $('#new_experiment_form').validate({
        rules: {
            title: {
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
            gamma: {
                number: true
            }
        },
        errorElement: "span"
        // errorPlacement: function(error, element) {
        //     return true;
        // }
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
        if (!bool1 || !bool2)
            return false;
    });
}

function validateFileFormatForModels(){
    // var allowedExtensions = ["zip", "tar.gz", "pdb", "rar", "tar.bz2"];
    var allowedExtensions = ["pdb"];
    var firstDot = $('#models').val().indexOf('.');
    if (firstDot != -1) {
        var extension = $('#models').val().substring(firstDot + 1);
        if(allowedExtensions.indexOf(extension) == -1) {
            $('#models').parent().next().addClass('file-extension-validation-error');
            $('#models').parent().parent().find('span.error').remove();
            $('#models').parent().parent().append('<span class="error">Invalid file format!</span>');
            return false;
        } else {
            $('#models').parent().next().removeClass('file-extension-validation-error');
            $('#models').parent().parent().find('span.error').remove();
            return true;
        }
    }
    $('#models').parent().next().addClass('file-extension-validation-error');
    $('#models').parent().parent().find('span.error').remove();
    $('#models').parent().parent().append('<span class="error">Invalid file format!</span>');
    return false;
}

function validateFileFormatForExpData(){
    var allowedExtensions = ["dat"];
    var expDataInput = $('#expData');
    var firstDot = expDataInput.val().indexOf('.');
    if (firstDot != -1) {
        var extension = expDataInput.val().substring(firstDot + 1);
        if(allowedExtensions.indexOf(extension) == -1) {
            expDataInput.parent().next().addClass('file-extension-validation-error');
            $('#expData').parent().parent().find('span.error').remove();
            $('#expData').parent().parent().append('<span class="error">Invalid file format!</span>');
            return false;
        } else {
            expDataInput.parent().next().removeClass('file-extension-validation-error');
            $('#expData').parent().parent().find('span.error').remove();
            return true;
        }
    }
    expDataInput.parent().next().addClass('file-extension-validation-error');
    $('#expData').parent().parent().find('span.error').remove();
    $('#expData').parent().parent().append('<span class="error">Invalid file format!</span>');
    return false;
}

function filterValidation(){
    var isValid = true;

    var progressInput = $('.search-filter input._progress');
    var progressRegEx1 = /^\s*[><=]\s\d+\s*$/;
    var progressRegEx2 = /^\s*[><]=\s\d+\s*$/;
    var progressRegEx3 = /^\s*\d+\s-\s\d+\s*$/;
    if (!(progressRegEx1.test(progressInput.val()) || progressRegEx2.test(progressInput.val()) || progressRegEx3.test(progressInput.val()) || progressInput.val() == "")) {
        progressInput.addClass('search-filter-validation-error');
        isValid = isValid && false;
    }

    var dateInput = $('.search-filter input.date');
    var dateRegEx1 = /^\s*[><=]\s\d{1,2}\/\d{1,2}\/\d{4}\s*$/;
    var dateRegEx2 = /^\s*[><]=\s\d{1,2}\/\d{1,2}\/\d{4}\s*$/;
    var dateRegEx3 = /^\s*\d{1,2}\/\d{1,2}\/\d{4}\s-\s\d{1,2}\/\d{1,2}\/\d{4}\s*$/;
    if (!(dateRegEx1.test(dateInput.val()) || dateRegEx2.test(dateInput.val()) || dateRegEx3.test(dateInput.val()) || dateInput.val() == "")) {
        dateInput.addClass('search-filter-validation-error');
        isValid = isValid && false;
    }

    var statusInput = $('.search-filter input.status');
    var statusRegEx = /^\s*(\w[ ]?)+\s*$/;;
    if (!(statusRegEx.test(statusInput.val()) || statusInput.val() == "")) {
        statusInput.addClass('search-filter-validation-error');
        isValid = isValid && false;
    }

    var nameInput = $('.search-filter input.name');
    var nameRegEx = /.*/;
    if (!(nameRegEx.test(nameInput.val()))) {
        nameInput.addClass('search-filter-validation-error');
        isValid = isValid && false;
    }

    return isValid;
}
//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
function dialog(){
    $( ".delete-dialog" ).dialog({
        title: "Are you sure ?",
        draggable: false,
        autoOpen: false,
        resizable: false,
        height:140,
        modal: true,
        position: { my: 'center', at: 'top-70 center'},
        buttons: {
            "Yes": function() {
                $( this ).dialog( "close" );
                deleteComputation();
            },
            "Cancel": function() {
                $( this ).dialog( "close" );
                compBeingDeleted = {};
            }
        }
    });
}

function tooltips() {
    var filterFieldPosition = {
        my: "center top+40",
        at: "center",
        collision: "none"
    };
    $('input.date').tooltip({
        content: "To search for computations with a certain date, type: <br><strong><span style=\"color:lawngreen;\">" +
                 "\"{number of day}/{number of month}/{number of year}\"</span></strong></br> eg. \"20/04/1998\"." +
                 "<br/><br/>To search for computations older/younger than a certain date, type: <br><strong><span style=\"color:lawngreen;\">" +
                 "\"{comparison operator}{whitespace}{number of day}/{number of month}/{number of year}\"</span></strong></br>" +
                 " eg. \">= 20/05/2011\". <br/><br/>To search for computations within a range of dates, type: <br><strong><span style=\"color:lawngreen;\">" +
                 "\"{number of day}/{number of month}/{number of year}{whitespace}{-}{whitespace}{number of day}/" +
                 "{number of month}/{number of year}\"</span></strong></br> eg. \"15/07/2011 - 20/05/2011\".",
        position: filterFieldPosition,
        items: "input.date",
        tooltipClass: "upArrowTooltip"
    });
    $('input.status').tooltip({
        content: "Search for computations with a certain status. These status values(and their shortcuts) are available: <br><strong><span style=\"color:lawngreen;\">" +
                 "accepted(a), done(d), running(r), queued(q), checked(ch), preprocessed(p), storage_ready(sr), optim_completed(oc), server_error(se), user_error(ue)</span></strong>.</br> " +
                 "Type these values(or shortcuts) separated by at least 1 whitespace character, eg. \"accepted q server_error d r\"",
        position: filterFieldPosition,
        items: "input.status",
        tooltipClass: "upArrowTooltip"
    });

    $('input.name').tooltip({
        content: "Search for computations with a certain name. No restrictions, any character is valid.",
        position: filterFieldPosition,
        items: "input.name",
        tooltipClass: "upArrowTooltip"
    });
    $('input._progress').tooltip({
        content: "To search for computations with a certain progress, type: <br><strong><span style=\"color:lawngreen;\">\"{integer}\"</span></strong></br> eg. \"500\"" +
                 "To search for computations with bigger/lower progress than a certain value, type: <br><strong><span style=\"color:lawngreen;\">" +
                 "\"{comparison operator}{whitespace}{integer}\"</span></strong></br> eg. \"< 785\"" +
                 "To search for computations within a range of progress values, type: <br><strong><span style=\"color:lawngreen;\">" +
                 "\"{integer}{whitespace}{-}{whitespace}{integer}\"</span></strong></br> eg. \"100 - 500\"",
        position: filterFieldPosition,
        items: "input._progress",
        tooltipClass: "upArrowTooltip"
    });
    $('.toggle-help').tooltip({
        position: {
            my: "right",
            at: "left-10",
            collision: "none"
        },
        items: ".toggle-help",
        tooltipClass: "helpToggleTooltip"
    });
    $('.delete-all').tooltip({
        content: "Delete all",
        position: {
            my: "right",
            at: "left-20",
            collision: "none"
        },
        items: ".delete-all",
        tooltipClass: "rightArrowTooltip"
    });
    $('.delete').tooltip({
        content: "Delete",
        position: {
            my: "right",
            at: "left-20",
            collision: "none"
        },
        items: ".delete",
        tooltipClass: "rightArrowTooltip"
    });
    $('.filter-toggle').tooltip({
        content: "Search filter",
        position: {
            my: "right",
            at: "left-20",
            collision: "none"
        },
        items: ".filter-toggle",
        tooltipClass: "rightArrowTooltip"
    });
    $( ".img_reload_list" ).tooltip({
        content: "Reload list",
        position: formFieldPosition,
        items: ".img_reload_list",
        tooltipClass: "leftArrowTooltip"
    });
}

function computationRequestFormTooltips(position, tooltipArrow, hideDuration) {
    $( ".row-models" ).tooltip({
        content: "Allowed file formats: 'pdb'.",
        position: position,
        items: ".row-models",
        tooltipClass: tooltipArrow,
        hide: hideDuration
    });
    $( ".row-expData" ).tooltip({
        content: "Allowed file formats: 'dat'.",
        position: position,
        items: ".row-expData",
        tooltipClass: tooltipArrow,
        hide: hideDuration
    });
    $( "#calcSteps" ).tooltip({
        content: "Integer number between 500 - 1 000 000.",
        position: position,
        items: "#calcSteps",
        tooltipClass: tooltipArrow,
        hide: hideDuration
    });
    $( "#stepsBetweenSync" ).tooltip({
        content: "Integer number between 100 - 10 000.",
        position: position,
        items: "#stepsBetweenSync",
        tooltipClass: tooltipArrow,
        hide: hideDuration
    });
    $( "#alpha" ).tooltip({
        content: "Maximal length of random walk step, 1 is whole range. Float number.",
        position: position,
        items: "#alpha",
        tooltipClass: tooltipArrow,
        hide: hideDuration
    });
    $( "#beta" ).tooltip({
        content: "This increase of chi2 is accepted with 10% probability by Metropolis criterion. Float number.",
        position: position,
        items: "#beta",
        tooltipClass: tooltipArrow,
        hide: hideDuration
    });
    $( "#gamma" ).tooltip({
        content: "chi2 difference scaling in stochastic tunneling transformation. Float number.",
        position: position,
        items: "#gamma",
        tooltipClass: tooltipArrow,
        hide: hideDuration
    });
}

//this function modifies name of the selected file to show only filename
function modifyFilename(filename){
    var index = filename.indexOf("fakepath");
    if (index == -1)
        return filename;
    return filename.substring(index + 9);
}


