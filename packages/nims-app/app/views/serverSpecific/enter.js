const root = '.enter-tab ';

let content;
function getContent(){
    return content;
}
export default {
    init, refresh, getContent
}

function init(){
    $(document.forms['login-form']).on('submit', submit);
    content = U.queryEl(root);
};

function refresh(){

};

function submit() {
    const form = $(this);

    $('.error', form).html('');
    //        $(":submit", form).button("loading");

    const request = $.ajax({
        url: '/login',
        method: 'POST',
        data: form.serialize(),
        complete() {
            $(':submit', form).button('reset');
        },
        //             statusCode : {
        //                 200 : function() {
        //                 },
        //                 403 : function(jqXHR) {
        //                     var error = JSON.parse(jqXHR.responseText);
        //                     $('.error', form).html(error.message);
        //                 }
        //             }
    });
    request.done((data) => {
        //             //window.location.href = "/chat";
        //             window.location.href = "/nims.html";
        window.location.href = '/page.html';
    });

    request.fail((errorInfo, textStatus, errorThrown) => {
        let msg;
        try {
            msg = UI.handleErrorMsg(JSON.parse(errorInfo.responseText));
        } catch (err) {
            msg = UI.handleErrorMsg(errorInfo.responseText || textStatus || 'error');
        }
        //             var error = JSON.parse(jqXHR.responseText);
        //             $('.error', form).html(error.message);
        //            $('.error', form).html(textStatus);
        $('.error', form).html(msg);
    });

    return false;
}
// })(window.Enter = {});
