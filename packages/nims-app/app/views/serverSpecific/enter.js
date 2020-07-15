const root = '.enter-tab ';
import ReactDOM from 'react-dom';
import { getEnterTemplate } from "./EnterTemplate.jsx";
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
    ReactDOM.render(getEnterTemplate(), content);
    L10n.localizeStatic(content);

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
