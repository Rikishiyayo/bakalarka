$(function () {
    validation();
    setPages();
    changeStatusColor();
    experimentRowHover();
    tooltips();
    changePageOnPageClick();
    changePageOnNextClick();
    changePageOnPreviousClick();

    $('.img_reload_list').on('click', function(){
        $('.experiment_list_overlay').show();
        $.get("/get_experiments/0", onGetExperimentsSuccess);
        selectPageControl(1);
    });
});

//
function setPages(){
    $('span._1').addClass('selected');
    $('span.page:not(.previous, .next)').slice(13).addClass('hiddenAfter')
}

//
function changePageOnPageClick(){
    $('span.page:not(.previous, .next)').on('click', function(){
       if ( !$(this).hasClass('selected') ){
           $.get("/get_experiments/" + (parseInt($(this).text()) - 1).toString(), onGetExperimentsSuccess);
           selectPageControl($(this).text());
       }
    });
}

//
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

//
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

//
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
    experimentRowHover();
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

//hovering over row with experiment
function experimentRowHover(){
        $('.experiment_row').on('mouseover', function () {
            $(this).find('img').css('display', 'inline-block');
        }).on('mouseout', function () {
            $('.experiment_row img').css('display', 'none');
        }).on('click', function () {
            var href = $(this).children('a').attr('href');
            window.location.href = href;
        });
}

//
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
                required: true,
                maxlength: 35

            },
            models: "required",
            expData: "required",
            calcSteps: {
                required: true,
                range: [10000, 1000000],
                number: true
            },
            stepsBetweenSync: {
                required: true,
                range: [100, 10000],
                number: true
            },
            alpha: {
                required: true,
                number: true
            },
            beta: {
                required: true,
                number: true
            },
            gama: {
                required: true,
                number: true
            }
        },
        errorElement: 'span',
        errorLabelContainer: '.error_span',
        wrapper: 'div',
        invalidHandler: function(){

        },
        errorPlacement: function(error, element) {
               return true;
        }
    });
}

function tooltips() {
    position = {
        my: "left center",
        at: "right+25 center",
        collision: "none"
    }
    $( "#calcSteps" ).tooltip({
        content: "Integer number between 10 000 - 1 000 000",
        position: position,
        items: "#calcSteps"
    });
    $( "#stepsBetweenSync" ).tooltip({
        content: "Integer number between 100 - 10 000",
        position: position,
        items: "#stepsBetweenSync"
    });
    $( "#alpha, #beta, #gama" ).tooltip({
        content: "Float number",
        position: position,
        items: "#alpha, #beta, #gama"
    });
}


