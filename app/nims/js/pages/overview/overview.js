/*Copyright 2015-2018 Timofey Rechkalov <ntsdk@yandex.ru>, Maria Sidekhmenova <matilda_@list.ru>

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

'use strict';


((exports) => {
    const defaultHists = ['storyEventsHist', 'storyCharactersHist', 'eventCompletenessHist',
        'characterSymbolsHist', 'characterStoriesHist'];
    const entityCharts = ['characterChart', 'playerChart', 'storyChart', 'groupChart'];

    const statisticKeys = [
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

    const root = '.overview-tab ';
    const state = {};

    state.Charts = {};

    exports.init = () => {
        state.name = getEl('gameNameInput');
        state.name.addEventListener('change', updateName);

        state.lastSaveTime = getEl('lastSaveTime');

        state.date = getEl('gameDatePicker');

        let opts = {
            lang: L10n.getLang(),
            mask: true,
            onChangeDateTime: updateTime
        };

        jQuery(state.date).datetimepicker(opts);

        state.preDate = getEl('preGameDatePicker');

        opts = {
            lang: L10n.getLang(),
            mask: true,
            onChangeDateTime: updatePreGameDate
        };

        jQuery(state.preDate).datetimepicker(opts);

        L10n.onL10nChange(() => {
            jQuery(state.date).datetimepicker({
                lang: L10n.getLang()
            });
            jQuery(state.preDate).datetimepicker({
                lang: L10n.getLang()
            });
        });

        state.descr = queryEl(`${root}.game-description-area`);
        state.descr.addEventListener('change', updateDescr);

        exports.content = queryEl(root);
    };

    function makeChart(id, canvas, data) {
        if (state.Charts[id]) {
            state.Charts[id].destroy();
        }

        const labels = [];
        const dataset = {
            data: [],
            backgroundColor: [],
            hoverBackgroundColor: []
        };
        data.forEach((item, i) => {
            if (Constants.colorPalette[i]) {
                labels.push(item.label);
                dataset.data.push(item.value);
                dataset.backgroundColor.push(Constants.colorPalette[i].color.background);
                dataset.hoverBackgroundColor.push(Constants.colorPalette[i].color.hover.background);
            }
        });

        const ctx = canvas.getContext('2d');
        state.Charts[id] = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels,
                datasets: [dataset]
            },
            options: {
                animation: {
                    animateRotate: false
                },
                responsive: false,
                legend: {
                    display: false,
                },
                tooltips: {
                    enabled: false,
                    custom: customTooltips
                }
            },
        });
    }

    function makeHistogram(place, data) {
        let max = null;
        data.forEach((barData) => {
            if (barData) {
                if (max === null || barData.value > max) {
                    max = barData.value;
                }
            }
        });
        data.forEach((barData) => {
            if (barData) {
                // barData.normValue = (barData.value - min)/(max-min);
                //      barData.normValue = (barData.value - 0)/(max-0);
                barData.normValue = (((barData.value - 0) / (max - 0)) * 0.9) + 0.1;
            }
        });

        let div;
        data.forEach((barData) => {
            div = barData === null ? makeEl('div') : addEl(makeEl('div'), makeText(barData.value));
            addClass(div, 'bar');
            if (barData) {
                div.style.height = `${barData.normValue * 100}%`;
                $(div).tooltip({
                    title: barData.tip,
                });
            }

            addEl(place, div);
        });
    }

    exports.refresh = () => {
        PermissionInformer.isAdmin((err, isAdmin) => {
            if (err) { Utils.handleError(err); return; }
            Utils.enable(exports.content, 'adminOnly', isAdmin);
        });
        
        Promise.all( [DBMS.getMetaInfoPm(), DBMS.getStatisticsPm()] ).then(updateOverviewTab).catch(Utils.handleError);
    };

    function updateOverviewTab(results) {
        const [metaInfo, statistics] = results;
        state.name.value = metaInfo.name;
        state.date.value = metaInfo.date;
        state.preDate.value = metaInfo.preGameDate;
        state.descr.value = metaInfo.description;
        addEl(clearEl(state.lastSaveTime), makeText(new Date(metaInfo.saveTime).format('yyyy/mm/dd HH:MM:ss')));
        
        statistics.lastEvent = statistics.lastEvent !== '' ? new Date(statistics.lastEvent).format('yyyy/mm/dd h:MM') : '';
        statistics.firstEvent = statistics.firstEvent !== '' ? new Date(statistics.firstEvent).format('yyyy/mm/dd h:MM') : '';
        
        statisticKeys.forEach((key) => {
            updateStatisticValue(statistics, key);
        });
        
        addEl(clearEl(getEl('generalCompleteness')), makeText(strFormat(getL10n('overview-general-completeness-value'), statistics.generalCompleteness)));
        addEl(clearEl(getEl('storyCompleteness')), makeText(strFormat(getL10n('overview-story-completeness-value'), statistics.storyCompleteness)));
        addEl(clearEl(getEl('relationCompleteness')), makeText(strFormat(getL10n('overview-relation-completeness-value'), statistics.relationCompleteness)));
        
        defaultHists.forEach((histName) => {
            makeHistogram(clearEl(queryEl(`${root}.${histName}`)), statistics[histName]);
        });
        
        entityCharts.forEach((entityChart) => {
            makeChart(entityChart, queryEl(`${root}.${entityChart}`), statistics[entityChart]);
        });
        
        const symbolChartData = R.toPairs(localizeConsts(statistics.textCharactersCount)).map(pair => ({
            value: pair[1],
            label: makeChartLabel(statistics.textCharacterNumber, pair[0], pair[1])
        }));
        makeChart('symbolChart', queryEl(`${root}.symbolChart`), symbolChartData);
        
        const bindingChartData = R.toPairs(localizeConsts(statistics.bindingStats)).map(pair => ({
            value: pair[1],
            label: [pair[0], ': ', pair[1]].join('')
        }));
        makeChart('bindingChart', queryEl(`${root}.bindingChart`), bindingChartData);
        
        let barData, barDiv, bar;
        
        function makeContainer(obj) {
            barDiv = makeEl('div');
            addClass(barDiv, 'col-xs-3');
            addEl(barDiv, addEl(makeEl('h4'), makeText(obj.name)));
            addEl(barDiv, obj.bar);
            return barDiv;
        }
        function buildChart(info) {
            bar = setAttr(setAttr(makeEl('canvas'), 'width', '300'), 'height', '100');
            const data = R.zipObj(['name', 'bar'], [info.name, bar]);
            const container = makeContainer(data);
            makeChart(info.id, bar, info.prepared);
            return container;
        }
        
        function buildHist(info) {
            bar = addClass(makeEl('div'), 'overviewHist');
            const data = R.zipObj(['name', 'bar'], [info.name, bar]);
            const container = makeContainer(data);
            makeHistogram(bar, info.prepared);
            return container;
        }
        
        const innerMakeChart = R.compose(buildChart, prepareChart);
        const innerMakeHist = R.compose(buildHist, prepareHist);
        
        function localizeCheckboxes(info) {
            info.data = R.fromPairs(R.toPairs(info.data).map((val) => {
                val[0] = constL10n(Constants[val[0]]);
                return val;
            }));
            return info;
        }
        
        const makeCheckboxChart = R.compose(innerMakeChart, localizeCheckboxes);
        
        const fn = R.cond([
            [R.compose(R.equals('enum'), R.prop('type')), innerMakeChart],
            [R.compose(R.equals('checkbox'), R.prop('type')), makeCheckboxChart],
            [R.T, innerMakeHist],
            ]);
        
        showEl(qe(`${root} .alert.character`), statistics.profileCharts.characterCharts.length === 0);
        statistics.profileCharts.characterCharts.map(fn)
            .map(addEl(clearEl(queryEl(`${root}.characterProfileDiagrams`))));
        showEl(qe(`${root} .alert.player`), statistics.profileCharts.playerCharts.length === 0);
        statistics.profileCharts.playerCharts.map(fn)
            .map(addEl(clearEl(queryEl(`${root}.playerProfileDiagrams`))));
    }
    
    function localizeConsts(info) {
        info = R.fromPairs(R.toPairs(info).map((val) => {
            val[0] = constL10n(val[0]);
            return val;
        }));
        return info;
    }

    function prepareChart(info) {
        const total = R.sum(R.values(info.data));
        info.prepared = R.keys(info.data).map(key => R.zipObj(['value', 'label'], [info.data[key], makeChartLabel(total, key, info.data[key])]));
        return info;
    }

    function prepareHist(info) {
        info.prepared = [];
        const { step } = info.data;
        info.data = info.data.groups;
        const min = R.apply(Math.min, R.keys(info.data));
        const max = R.apply(Math.max, R.keys(info.data));

        for (let i = min; i < max + 1; i++) {
            if (info.data[i]) {
                info.prepared.push({
                    value: info.data[i],
                    label: `${i * step}-${(i * step) + (step - 1)}`,
                    tip: `${i * step}-${(i * step) + (step - 1)}`
                });
            } else {
                info.prepared.push(null);
            }
        }
        return info;
    }

    // eslint-disable-next-line no-var,vars-on-top
    var makeChartLabel = R.curry((total, key, value) =>
        [key, ': ', ((value / total) * 100).toFixed(0), '% (', value, '/', total, ')'].join(''));

    function updateStatisticValue(statistics, key) {
        addEl(clearEl(getEl(key)), makeText(statistics[key]));
    }

    function updateName(event) {
        DBMS.setMetaInfoStringPm('name', event.target.value).catch(Utils.handleError);
    }
    function updateTime(dp, input) {
        DBMS.setMetaInfoDate('date', input.val(), Utils.processError());
    }
    function updatePreGameDate(dp, input) {
        DBMS.setMetaInfoDate('preGameDate', input.val(), Utils.processError());
    }
    function updateDescr(event) {
        DBMS.setMetaInfoString('description', event.target.value, Utils.processError());
    }

    function customTooltips(tooltip) {
        // Tooltip Element
        let tooltipEl = document.getElementById('chartjs-tooltip');

        if (!tooltipEl) {
            tooltipEl = document.createElement('div');
            tooltipEl.id = 'chartjs-tooltip';
            tooltipEl.innerHTML = '<table></table>';
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
            const titleLines = tooltip.title || [];
            const bodyLines = tooltip.body.map(getBody);

            let innerHtml = '<thead>';

            titleLines.forEach((title) => {
                innerHtml += `<tr><th>${title}</th></tr>`;
            });
            innerHtml += '</thead><tbody>';

            bodyLines.forEach((body, i) => {
                const colors = tooltip.labelColors[i];
                let style = `background:${colors.backgroundColor}`;
                style += `; border-color:${colors.borderColor}`;
                style += '; border-width: 2px';
                const span = `<span class="chartjs-tooltip-key" style="${style}"></span>`;
                innerHtml += `<tr><td>${span}${body}</td></tr>`;
            });
            innerHtml += '</tbody>';

            const tableRoot = tooltipEl.querySelector('table');
            tableRoot.innerHTML = innerHtml;
        }

        const position = this._chart.canvas.getBoundingClientRect();

        //        // Display, position, and set styles for font
        tooltipEl.style.opacity = 1;
        tooltipEl.style.left = `${position.left + tooltip.caretX}px`;
        tooltipEl.style.top = `${position.top + tooltip.caretY}px`;
        //        tooltipEl.style.fontFamily = tooltip._fontFamily;
        //        tooltipEl.style.fontSize = tooltip.fontSize;
        //        tooltipEl.style.fontStyle = tooltip._fontStyle;
        tooltipEl.style.padding = `${tooltip.yPadding}px ${tooltip.xPadding}px`;
    }
})(this.Overview = {});
