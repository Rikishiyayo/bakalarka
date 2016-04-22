var pages, filterOptions = {}, compBeingDeleted;

$(function () {
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
    computationRowHoverAndClick();
//    deleteAllHoverAndClick();
    deleteRowButtonHoverAndClick();

    setPages();
    changePageOnPageClick();
    changePageOnNextClick();
    changePageOnPreviousClick();

    filterToggleClick();
    sortList();
    filterList();

    validation();
    fileFormatValidation();

    tooltips();
    dialog();
});

//this function erases current list of computations and replaces it with new list
function onGetExperimentsSuccess(data) {
    $('.experiment_list p.experiment_row').detach();
    var comps = data.comps;
    pages = data.pages;

    for (var i = 0; i < comps.length; i++) {
        var newEl = "<p class=\"experiment_row\">";

        if(comps[i].progress != 0){
            newEl += "<a href=\"/view_experiment/" + comps[i].user_id + "/" + comps[i].comp_guid + "\"></a>";
        }

        newEl += "<span class=\"date\">" + comps[i].date + "</span>";
        newEl += "<span class=\"name\">" + comps[i].name + "</span>";
        newEl += "<span class=\"progress\">" + comps[i].progress + "</span>";
        newEl += "<span class=\"status\">" + comps[i].status + "</span>";
        newEl += "<img src=\"/static/styles/icons/recycle_bin.png\">";
        $(newEl).insertBefore('.pagination-controls');
    }
    changeStatusColor();
    computationRowHoverAndClick();
//    deleteAllHoverAndClick();
    deleteRowButtonHoverAndClick();
    setTimeout(function(){
        $('.experiment_list_overlay').hide();
    }, 500);
}

//---------------------------------------------------------------------------------form manipulation---------------------------------------------------------------------------------------
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
        $('#alpha, #beta, #gama').attr('disabled', true).css('color', '#a8a8a8').prev().css('color', '#a8a8a8');
    else
        $('#alpha, #beta, #gama').attr('disabled', false).css('color', '#4c4c4c').prev().css('color', '#4c4c4c');
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
        $('.experiment_list_overlay').show();
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
            }
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
                $(this).css('color', '#8acc25');
                break;
            case "running":
                $(this).css('color', 'lightskyblue');
                break;
            case "queued":
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
            $(this).addClass('highlight');
            $(this).find('img').css('opacity', '1');
        }
    }).on('mouseout', function () {
        $(this).removeClass('highlight');
        $('.experiment_row img').css('opacity', '0');
    }).on('click', function () {
        if ($(this).find('a').length != 0) {
            var href = $(this).children('a').attr('href');
            window.location.href = href;
        }
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
    $('.experiment_list_overlay').show();
    data = compBeingDeleted;
    data['filter_values'] = filterOptions;

    if ($('span.page.selected').length == 0)
        selectedPage = 0;
    else
        selectedPage = parseInt($('span.page.selected').text()) - 1;

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
        }
    });
}

function getInfoOfComputationBeingDeleted(element){
    var json = {'all': 'False'}
    json['comp_guid'] = element.children('a').attr('href').split('/')[3];
    return json;
}
//----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

//--------------------------------------------------------------------------------pagination controls-------------------------------------------------------------------------------------------
//this function displays computations for clicked page
function changePageOnPageClick(){
    $('span.page:not(.previous, .next)').on('click', function(){
        if ( !$(this).hasClass('selected') ){
            $.ajax({
                type: 'POST',
                url: "/get_experiments/" + (parseInt($(this).text()) - 1).toString() + "/" + getSortOption() + "/" + determineSortOrder(),
                contentType: 'application/json',
                success: onGetExperimentsSuccess,
                data: JSON.stringify(filterOptions),
                dataType: 'json'
            });
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
            $.ajax({
                type: 'POST',
                url: "/get_experiments/" + selectedPage.text() + "/" + getSortOption() + "/" + determineSortOrder(),
                contentType: 'application/json',
                success: onGetExperimentsSuccess,
                data: JSON.stringify(filterOptions),
                dataType: 'json'
            });
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
           $.ajax({
                type: 'POST',
                url: "/get_experiments/" + ((parseInt(selectedPage.text()) - 2)).toString() + "/" + getSortOption() + "/" + determineSortOrder(),
                contentType: 'application/json',
                success: onGetExperimentsSuccess,
                data: JSON.stringify(filterOptions),
                dataType: 'json'
           });
           selectPageControl(parseInt(selectedPage.text()) - 1);

           if (selectedPage.is(firstVisiblePage)) {
               $('span.page:not(.previous, .next).hiddenBefore').last().removeClass('hiddenBefore');
               $('span.page:not(.previous, .next):visible').last().addClass('hiddenAfter');
           }
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
    $('span._1').addClass('selected');
    $('span.page:not(.previous, .next)').slice(13).addClass('hiddenAfter');
}

//this function highlights selected page
function selectPageControl(page){
   $('span.page').each(function(){
       $(this).removeClass('selected');
   });
   if ($('span.page:not(.previous, .next)').length != 0 && parseInt($('span.page:not(.previous, .next)').last().text()) < page)
       $('span._' + (page - 1)).addClass('selected');
   else
       $('span._' + page).addClass('selected');
}
//-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

//--------------------------------------------------------------------------------filtering and sorting----------------------------------------------------------------------------------
function filterToggleClick(){
    $('.experiment_list .filter-toggle').on('click', function(){
        $('.experiment_list .search-filter').slideToggle(150);
        $(this).toggleClass('filter-toggle-clicked');
    });
}

function filterList(){
    $('.search-filter .filter').on('click', function(){
        if (!filterValidation()) return;
        filterOptions = {};
        $.ajax({
            type: 'POST',
            url: "/get_experiments/0/" + getSortOption() + '/' + determineSortOrder(),
            contentType: 'application/json',
            success: function(data){
                onGetExperimentsSuccess(data);
                createPaginationControls(pages);
                setPages();
            },
            data: JSON.stringify(getFilterArguments()),
            dataType: 'json'
        });
    });
}

function sortList(){
    $('.list-header > span > span').on('click', function(){
        setSortOrder($(this).parent());
        $.ajax({
            type: 'POST',
            url: "/get_experiments/0/" + $(this).parent().attr('id') + "/" + determineSortOrder(),
            contentType: 'application/json',
            success: onGetExperimentsSuccess,
            data: JSON.stringify(filterOptions),
            dataType: 'json'
        });
        selectPageControl(1);
        showSortOrderIcon($(this));
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
    sortAttr = $('.list-header span.ascending, .list-header span.descending');
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
        }
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
        if (!bool1 || !bool2)
            return false;
    });
}

function validateFileFormatForModels(){
    var allowedExtensions = ["zip", "tar.gz", "pdb", "rar", "tar.bz2"];
    var firstDot = $('#models').val().indexOf('.');
    if (firstDot != -1) {
        var extension = $('#models').val().substring(firstDot + 1);
        if(allowedExtensions.indexOf(extension) == -1) {
            $('#models').parent().next().addClass('file-extension-validation-error');
            return false;
        } else {
            $('#models').parent().next().removeClass('file-extension-validation-error');
            return true;
        }
    }
    $('#models').parent().next().addClass('file-extension-validation-error');
    return false;
}

function validateFileFormatForExpData(){
    var allowedExtensions = ["dat"];
    var firstDot = $('#expData').val().indexOf('.');
    if (firstDot != -1) {
        var extension = $('#expData').val().substring(firstDot + 1);
        if(allowedExtensions.indexOf(extension) == -1) {
            $('#expData').parent().next().addClass('file-extension-validation-error');
            return false;
        } else {
            $('#expData').parent().next().removeClass('file-extension-validation-error');
            return true;
        }
    }
    $('#expData').parent().next().addClass('file-extension-validation-error');
    return false;
}

function filterValidation(){
    var progressInput = $('.search-filter input.progress');
    var progressReg1 = /^[> < =]\s+\d+$/;
    var progressReg2 = /^[> <]=\s+\d+$/;
    var progressReg3 = /^\d+\s+-\s+\d+$/;
    if (progressReg1.test(progressInput.val()) || progressReg2.test(progressInput.val()) || progressReg3.test(progressInput.val()) || progressInput.val() == ""){
        return true;
    } else {
        progressInput.addClass('search-filter-validation-error');
        return false;
    }
    var dateInput = $('.search-filter input.date');
    var dateReg1 = /^[> < =]\s+\d{1,2}\/\d{1,2}\/\d{4}$/;
    var dateReg2 = /^[> <]=\s+\d{1,2}\/\d{1,2}\/\d{4}$/;
    var dateReg3 = /^\d{1,2}\/\d{1,2}\/\d{4}\s+-\s+\d{1,2}\/\d{1,2}\/\d{4}$/;
    if (dateReg1.test(dateInput.val()) || dateReg2.test(dateInput.val()) || dateReg3.test(dateInput.val()) || dateInput.val() == ""){
        return true;
    } else {
        dateInput.addClass('search-filter-validation-error');
        return false;
    }
    /*
       date(> < =) - ^[> < =]\s\d{1,2}\/\d{1,2}\/\d{4}$
       date(>= <=) - ^[> <]=\s\d{1,2}\/\d{1,2}\/\d{4}$
       date(date - date) - ^\d{1,2}\/\d{1,2}\/\d{4}\s-\s\d{1,2}\/\d{1,2}\/\d{4}$
    */

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
            Cancel: function() {
                $( this ).dialog( "close" );
                compBeingDeleted = {};
            }
        }
    });
}

function tooltips() {
    position = {
        my: "left center",
        at: "right+20 center",
        collision: "none"
    }
    $('.delete-all').tooltip({
        content: "Delete all",
        position: {
            my: "right",
            at: "left-20",
            collision: "none"
        },
        items: ".delete-all"
    });
    $('.filter-toggle').tooltip({
        content: "Search filter",
        position: {
            my: "right",
            at: "left-20",
            collision: "none"
        },
        items: ".filter-toggle"
    });
    $( ".img_reload_list" ).tooltip({
        content: "Reload list",
        position: position,
        items: ".img_reload_list"
    });
    $( ".row-models" ).tooltip({
        content: "Allowed file formats: 'zip', 'tar.gz', 'pdb'.",
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


