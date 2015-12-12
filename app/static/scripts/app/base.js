$(function(){
    setTimeout(function(){
        $('.flash-message').fadeOut();
    }, 8000);
    iconHover();
    showMailAddress();
});

function iconHover(){
    //hover effect over facebook and gmail icon in footer
    $('footer div img').on('mouseover', function () {
        if ($(this).attr('class') == "fb-icon")
            $(this).prop('src', '/static/styles/icons/fb_dark_blue.png');
        else
            $(this).prop('src', '/static/styles/icons/gmail_dark_red.png');
    }).on('mouseout', function () {
        if ($(this).attr('class') == "fb-icon")
            $(this).prop('src', '/static/styles/icons/fb_light_blue.png');
        else
            $(this).prop('src', '/static/styles/icons/gmail_light_red.png');
    });
}

function showMailAddress(){
    $('.gmail-icon').on('click', function(){
        $('.mail-address').toggle();
    });
}