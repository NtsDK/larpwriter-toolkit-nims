const root = '.sign-up-tab ';
import ReactDOM from 'react-dom';
import { getSignUpTemplate } from "./SignUpTemplate.jsx";
import { UI, U, L10n } from 'nims-app-core';

let content;
function getContent(){
    return content;
}
export default {
    init, refresh, getContent
}

function init(){
    content = U.makeEl('div');
    U.addEl(U.qe('.tab-container'), content);
    ReactDOM.render(getSignUpTemplate(), content);
    L10n.localizeStatic(content);

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
