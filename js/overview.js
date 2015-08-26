/*global
 jQuery, Database
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
    name.value = Database.Meta.name;

    var date = document.getElementById("gameDatePicker");
    date.value = Database.Meta.date;

    date = document.getElementById("preGameDatePicker");
    date.value = Database.Meta.preGameDate;

    var descr = document.getElementById("gameDescription");
    descr.value = Database.Meta.description;

};

Overview.updateName = function (event) {
    "use strict";
    Database.Meta.name = event.target.value;
};
Overview.updateTime = function (dp, input) {
    "use strict";
    Database.Meta.date = input.val();
};
Overview.updatePreGameDate = function (dp, input) {
    "use strict";
    Database.Meta.preGameDate = input.val();
};
Overview.updateDescr = function (event) {
    "use strict";
    Database.Meta.description = event.target.value;
};