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
    var name = document.getElementById("gameNameInput");
    name.addEventListener("change", Overview.updateName);

    var date = document.getElementById("gameDatePicker");

    var opts = {
        lang : "ru",
        mask : true,
        onChangeDateTime : Overview.updateTime
    };

    jQuery(date).datetimepicker(opts);

    date = document.getElementById("preGameDatePicker");

    opts = {
        lang : "ru",
        mask : true,
        onChangeDateTime : Overview.updatePreGameDate
    };

    jQuery(date).datetimepicker(opts);

    var descr = document.getElementById("gameDescription");
    descr.addEventListener("change", Overview.updateDescr);

    Overview.content = document.getElementById("overviewDiv");
};

Overview.refresh = function () {
    "use strict";
    var name = document.getElementById("gameNameInput");
    var date1 = document.getElementById("gameDatePicker");
    var date2 = document.getElementById("preGameDatePicker");
    var descr = document.getElementById("gameDescription");

    DBMS.getMetaInfo(function(info){
        name.value = info.name;
        date1.value = info.date;
        date2.value = info.preGameDate;
        descr.value = info.description;
    });
};

Overview.updateName = function (event) {
    "use strict";
    DBMS.setMetaInfo("name", event.target.value);
};
Overview.updateTime = function (dp, input) {
    "use strict";
    DBMS.setMetaInfo("date", input.val());
};
Overview.updatePreGameDate = function (dp, input) {
    "use strict";
    DBMS.setMetaInfo("preGameDate", input.val());
};
Overview.updateDescr = function (event) {
    "use strict";
    DBMS.setMetaInfo("description", event.target.value);
};