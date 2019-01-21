/*Copyright 2015 Timofey Rechkalov <ntsdk@yandex.ru>, Maria Sidekhmenova <matilda_@list.ru>

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
    limitations under the License. */

/*global
 Utils, DBMS
 */


'use strict';

// ((exports) => {
    const root = '.sign-up-tab ';

    exports.init = () => {
        $(document.forms['sign-up-form']).on('submit', submit);
        exports.content = U.queryEl(root);
    };

    exports.refresh = () => {
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
                msg = Utils.handleErrorMsg(JSON.parse(errorInfo.responseText));
            } catch (err) {
                msg = Utils.handleErrorMsg(errorInfo.responseText || textStatus || 'error');
            }
            $('.error', form).html(msg);
        });

        return false;
    }
// })(window.SignUp = {});
