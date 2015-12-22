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
 jQuery, DBMS
 */

"use strict";

var Overview = {};

Overview.init = function () {
    "use strict";
    Overview.name = document.getElementById("gameNameInput");
    Overview.name.addEventListener("change", Overview.updateName);

    Overview.date = document.getElementById("gameDatePicker");

    var opts = {
        lang : "ru",
        mask : true,
        onChangeDateTime : Overview.updateTime
    };

    jQuery(Overview.date).datetimepicker(opts);

    Overview.preDate = document.getElementById("preGameDatePicker");

    opts = {
        lang : "ru",
        mask : true,
        onChangeDateTime : Overview.updatePreGameDate
    };

    jQuery(Overview.preDate).datetimepicker(opts);

    Overview.descr = document.getElementById("gameDescription");
    Overview.descr.addEventListener("change", Overview.updateDescr);

    Overview.content = document.getElementById("overviewDiv");
};

Overview.refresh = function () {
    "use strict";

    DBMS.getMetaInfo(function(err, info){
    	if(err) {Utils.handleError(err); return;}
        Overview.name.value = info.name;
        Overview.date.value = info.date;
        Overview.preDate.value = info.preGameDate;
        Overview.descr.value = info.description;
    });
};

Overview.updateName = function (event) {
    "use strict";
    DBMS.setMetaInfo("name", event.target.value, Utils.processError());
};
Overview.updateTime = function (dp, input) {
    "use strict";
    DBMS.setMetaInfo("date", input.val(), Utils.processError());
};
Overview.updatePreGameDate = function (dp, input) {
    "use strict";
    DBMS.setMetaInfo("preGameDate", input.val(), Utils.processError());
};
Overview.updateDescr = function (event) {
    "use strict";
    DBMS.setMetaInfo("description", event.target.value, Utils.processError());
};