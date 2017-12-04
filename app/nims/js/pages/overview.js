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


(function(exports){

    var defaultHists = [ 'storyEventsHist', 'storyCharactersHist', 'eventCompletenessHist', 'characterSymbolsHist', 'characterStoriesHist' ];
    var entityCharts = [ 'characterChart', 'playerChart', 'storyChart', 'groupChart' ];

    var statisticKeys = [
        'characterNumber',
        'playerNumber',
        'storyNumber',
        'groupNumber',
        'eventsNumber',
        'userNumber',
        'textCharacterNumber',
        'lastEvent',
        'firstEvent',
        ];

    var root = '.overview-tab ';
    var state = {};

    state.Charts = {};

    exports.init = function () {
        state.name = getEl("gameNameInput");
        state.name.addEventListener("change", updateName);

        state.lastSaveTime = getEl("lastSaveTime");

        state.date = getEl("gameDatePicker");

        var opts = {
            lang : L10n.getLang(),
            mask : true,
            onChangeDateTime : updateTime
        };

        jQuery(state.date).datetimepicker(opts);

        state.preDate = getEl("preGameDatePicker");

        opts = {
            lang : L10n.getLang(),
            mask : true,
            onChangeDateTime : updatePreGameDate
        };

        jQuery(state.preDate).datetimepicker(opts);

        L10n.onL10nChange(function(){
            jQuery(state.date).datetimepicker({
                lang : L10n.getLang()
            });
            jQuery(state.preDate).datetimepicker({
                lang : L10n.getLang()
            });
        });

        state.descr = queryEl(root + ".game-description-area");
        state.descr.addEventListener("change", updateDescr);

        UI.initTabPanel("overviewInfoButton", "overviewContainer");

        exports.content = queryEl(root);
    };

    var makeChart = function(id, canvas, data){
        if (state.Charts[id]) {
            state.Charts[id].destroy();
        }

        var labels = [];
        var dataset = {
            data : [],
            backgroundColor : [],
            hoverBackgroundColor : []
        };
        data.forEach(function(item, i) {
            if (Constants.colorPalette[i]) {
                labels.push(item.label);
                dataset.data.push(item.value);
                dataset.backgroundColor.push(Constants.colorPalette[i].color.background);
                dataset.hoverBackgroundColor.push(Constants.colorPalette[i].color.hover.background);
            }
        });

        var ctx = canvas.getContext("2d");
        state.Charts[id] = new Chart(ctx, {
            type : 'doughnut',
            data : {
                labels : labels,
                datasets : [ dataset ]
            },
            options : {
                animation:{
                    animateRotate:false
                },
                responsive : false,
                legend : {
                    display : false,
                },
                tooltips : {
                    enabled : false,
                    custom : customTooltips
                }
            },
        });
    };

    var makeHistogram = function(place, data){
    var min = null, max = null;
    data.forEach(function(barData){
        if(barData){
        if(max === null || barData.value > max){
            max = barData.value;
        }
        }
    });
    data.forEach(function(barData){
        if(barData){
    // barData.normValue = (barData.value - min)/(max-min);
    //      barData.normValue = (barData.value - 0)/(max-0);
        barData.normValue = (barData.value - 0)/(max-0)*0.9+0.1;
        }
    });

    var div;
    data.forEach(function(barData){
        div = barData === null ? makeEl('div') : addEl(makeEl('div'), makeText(barData.value));
        addClass(div, "bar");
        if(barData){
        div.style.height = (barData.normValue*100) + '%';
        $(div).tooltip({
            title : barData.tip,
        });
        }

        addEl(place, div);
    });
    };

    exports.refresh = function () {
        PermissionInformer.isAdmin(function(err, isAdmin){
        if(err) {Utils.handleError(err); return;}
        Utils.enable(exports.content, "adminOnly", isAdmin);
        });

        DBMS.getMetaInfo(function(err, info){
        if(err) {Utils.handleError(err); return;}
        DBMS.getStatistics(function(err, statistics){
            if(err) {Utils.handleError(err); return;}
            state.name.value = info.name;
            state.date.value = info.date;
            state.preDate.value = info.preGameDate;
            state.descr.value = info.description;
            addEl(clearEl(state.lastSaveTime), makeText(new Date(info.saveTime).format("yyyy/mm/dd HH:MM:ss")));

            statistics['lastEvent'] = statistics['lastEvent'] !== "" ? new Date(statistics['lastEvent']).format("yyyy/mm/dd h:MM") : "";
            statistics['firstEvent'] = statistics['firstEvent'] !== "" ? new Date(statistics['firstEvent']).format("yyyy/mm/dd h:MM") : "";

            statisticKeys.forEach(function(key){
                updateStatisticValue(statistics, key);
            });

            addEl(clearEl(getEl('generalCompleteness')), makeText(strFormat(getL10n('overview-general-completeness-value'),statistics['generalCompleteness'])));
            addEl(clearEl(getEl('storyCompleteness')), makeText(strFormat(getL10n('overview-story-completeness-value'),statistics['storyCompleteness'])));

            defaultHists.forEach(function(histName){
                makeHistogram(clearEl(queryEl(root + '.' + histName)), statistics[histName]);
            });

            entityCharts.forEach(function(entityChart){
                makeChart(entityChart, queryEl(root + '.' + entityChart), statistics[entityChart]);
            });

            var symbolChartData = R.toPairs(localizeConsts(statistics.textCharactersCount)).map(function(pair){
                return {
                    'value': pair[1],
                    'label': makeChartLabel(statistics.textCharacterNumber, pair[0], pair[1])
                };
            });
            makeChart("symbolChart", queryEl(root + ".symbolChart"), symbolChartData);

            var bindingChartData = R.toPairs(localizeConsts(statistics.bindingStats)).map(function(pair){
                return {
                    'value': pair[1],
                    'label': [ pair[0], ": ", pair[1]].join("")
                };
            });
            makeChart("bindingChart", queryEl(root + ".bindingChart"), bindingChartData);

            var barData, barDiv, bar;

            var makeContainer = function(obj){
                barDiv = makeEl('div');
                addEl(barDiv, addEl(makeEl('h4'),makeText(obj.name)));
                addEl(barDiv, obj.bar);
                return barDiv;
            }
            var buildChart = function(info){
                bar = setAttr(setAttr(makeEl('canvas'), "width", "300"), "height", "100");
                var data = R.zipObj(['name', 'bar'], [info.name, bar]);
                var container = makeContainer(data);
                makeChart(info.id, bar, info.prepared);
                return container;
            };

            var buildHist = function(info){
                bar = addClass(makeEl('div'),"overviewHist");
                var data = R.zipObj(['name', 'bar'], [info.name, bar]);
                var container = makeContainer(data);
                makeHistogram(bar, info.prepared);
                return container;
            };

            var innerMakeChart = R.compose(buildChart,prepareChart);
            var innerMakeHist = R.compose(buildHist,prepareHist);

            var localizeCheckboxes = function(info){
                info.data = R.fromPairs(R.toPairs(info.data).map(function(val){
                    val[0] = constL10n(Constants[val[0]]);
                    return val;
                }));
                return info;
            }

            var makeCheckboxChart = R.compose(innerMakeChart,localizeCheckboxes);

            var fn = R.cond([
                [R.compose(R.equals('enum'), R.prop('type')),   innerMakeChart],
                [R.compose(R.equals('checkbox'), R.prop('type')),   makeCheckboxChart],
                [R.T,   innerMakeHist],
            ]);

            statistics.profileCharts.characterCharts.map(fn).map(addEl(clearEl(queryEl(root + '.characterProfileDiagrams'))));
            statistics.profileCharts.playerCharts.map(fn).map(addEl(clearEl(queryEl(root + '.playerProfileDiagrams'))));

        });
        });
    };

    var localizeConsts = function(info){
        info = R.fromPairs(R.toPairs(info).map(function(val){
            val[0] = constL10n(val[0]);
            return val;
        }));
        return info;
    };

    var prepareChart = function(info){
        var total = R.sum(R.values(info.data));
        info.prepared = [];
        for ( var key in info.data) {
            info.prepared.push(R.zipObj(['value', 'label'], [info.data[key], makeChartLabel(total, key, info.data[key])]));
        }
        return info;
    };

    var prepareHist = function(info){
        info.prepared = [];
        var step = info.data.step;
        info.data = info.data.groups;
        var min = R.apply(Math.min, R.keys(info.data));
        var max = R.apply(Math.max, R.keys(info.data));

        for (var i = min; i < max+1; i++) {
            if (info.data[i]) {
                info.prepared.push({
                    value : info.data[i],
                    label : i * step + "-" + (i * step + (step-1)),
                    tip : i * step + "-" + (i *step + (step-1))
                });
            } else {
                info.prepared.push(null);
            }
        }
        return info;
    };

    var makeChartLabel = R.curry(function(total, key, value) {
        return [ key, ": ", (value / total * 100).toFixed(0), "% (", value, "/", total, ")" ].join("");
    });

    var updateStatisticValue = function (statistics, key) {
        addEl(clearEl(getEl(key)), makeText(statistics[key]));
    };

    var updateName = function (event) {
        DBMS.setMetaInfo("name", event.target.value, Utils.processError());
    };
    var updateTime = function (dp, input) {
        DBMS.setMetaInfo("date", input.val(), Utils.processError());
    };
    var updatePreGameDate = function (dp, input) {
        DBMS.setMetaInfo("preGameDate", input.val(), Utils.processError());
    };
    var updateDescr = function (event) {
        DBMS.setMetaInfo("description", event.target.value, Utils.processError());
    };

    var customTooltips = function(tooltip) {
        // Tooltip Element
        var tooltipEl = document.getElementById('chartjs-tooltip');

        if (!tooltipEl) {
            tooltipEl = document.createElement('div');
            tooltipEl.id = 'chartjs-tooltip';
            tooltipEl.innerHTML = "<table></table>"
            document.body.appendChild(tooltipEl);
        }

        // Hide if no tooltip
        if (tooltip.opacity === 0) {
            tooltipEl.style.opacity = 0;
            return;
        }

        // Set caret Position
        tooltipEl.classList.remove('above', 'below', 'no-transform');
        if (tooltip.yAlign) {
            tooltipEl.classList.add(tooltip.yAlign);
        } else {
            tooltipEl.classList.add('no-transform');
        }

        function getBody(bodyItem) {
            return bodyItem.lines;
        }

        // Set Text
        if (tooltip.body) {
            var titleLines = tooltip.title || [];
            var bodyLines = tooltip.body.map(getBody);

            var innerHtml = '<thead>';

            titleLines.forEach(function(title) {
                innerHtml += '<tr><th>' + title + '</th></tr>';
            });
            innerHtml += '</thead><tbody>';

            bodyLines.forEach(function(body, i) {
                var colors = tooltip.labelColors[i];
                var style = 'background:' + colors.backgroundColor;
                style += '; border-color:' + colors.borderColor;
                style += '; border-width: 2px';
                var span = '<span class="chartjs-tooltip-key" style="' + style + '"></span>';
                innerHtml += '<tr><td>' + span + body + '</td></tr>';
            });
            innerHtml += '</tbody>';

            var tableRoot = tooltipEl.querySelector('table');
            tableRoot.innerHTML = innerHtml;
        }

        var position = this._chart.canvas.getBoundingClientRect();

//        // Display, position, and set styles for font
        tooltipEl.style.opacity = 1;
        tooltipEl.style.left = position.left + tooltip.caretX + 'px';
        tooltipEl.style.top = position.top + tooltip.caretY + 'px';
//        tooltipEl.style.fontFamily = tooltip._fontFamily;
//        tooltipEl.style.fontSize = tooltip.fontSize;
//        tooltipEl.style.fontStyle = tooltip._fontStyle;
        tooltipEl.style.padding = tooltip.yPadding + 'px ' + tooltip.xPadding + 'px';
    };

})(this['Overview']={});
