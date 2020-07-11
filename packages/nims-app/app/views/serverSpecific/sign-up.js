const root = '.sign-up-tab ';

let content;
function getContent(){
    return content;
}
export default {
    init, refresh, getContent
}

function init(){
    $(document.forms['sign-up-form']).on('submit', submit);
    content = U.queryEl(root);
};

function refresh(){
};

function submit() {
    const form = $(this);

    $('.error', form).html('');
    $(':submit', form).button('loading');

    const request = $.ajax({
        url: '/signUp',
        method: 'POST',
        data: form.serialize(),
        complete() {
            $(':submit', form).button('reset');
        },
    });
    request.done((data) => {
        form.html(L10n.getValue('entrance-sign-up-success')).U.addClass('alert-success');
    });

    request.fail((errorInfo, textStatus, errorThrown) => {
        let msg;
        try {
            msg = UI.handleErrorMsg(JSON.parse(errorInfo.responseText));
        } catch (err) {
            msg = UI.handleErrorMsg(errorInfo.responseText || textStatus || 'error');
        }
        $('.error', form).html(msg);
    });

    return false;
}
// })(window.SignUp = {});
