$(function () {
        validation();
        changeStatusColor();
        experimentRowHover();
        tooltips();
       
        $('.img_reload_list').on('click', function(){
            $('.experiment_list_overlay').show();
            $.get("/get_experiments", onGetExperimentsSuccess);
        });
});

function onGetExperimentsSuccess(data) {
    $('.experiment_list p').detach();        
    var expsListElement = $('.experiment_list');
    var exps = data.exps;
    
    for (var i = 0; i < exps.length; i++) {
        var newEl = "<p class=\"experiment_row\">";
        newEl += "<a href=\"/view_experiment/" + exps[i].user_id + "/" + exps[i].exp_guid + "\"></a>";
        newEl += "<span class=\"date\">" + exps[i].date + "</span>";
        newEl += "<span class=\"name\">" + exps[i].title + "</span>";
        newEl += "<span class=\"progress\">" + exps[i].progress + "</span>";
        newEl += "<span class=\"status\">" + exps[i].status + "</span>";
        newEl += "<img src=\"/static/styles/icons/eye_grey.png\">";
        expsListElement.append(newEl);
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


