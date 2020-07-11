import Chart from "chart.js";
import dateFormat from "dateformat";
import PermissionInformer from "permissionInformer";

import './overview.css';

import Gears from "../gears/gears";
import Sliders from "../sliders/sliders";
let content;

function getContent(){
    return content;
}


// ((exports) => {
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

function init(){
    state.name = U.queryEl('#gameNameInput');
    state.name.addEventListener('change', updateName);

    state.lastSaveTime = U.queryEl('#lastSaveTime');

    state.date = U.queryEl('#gameDatePicker');

    let opts = {
        lang: L10n.getLang(),
        mask: true,
        onChangeDateTime: updateTime
    };

    jQuery(state.date).datetimepicker(opts);

    state.preDate = U.queryEl('#preGameDatePicker');

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

    state.descr = U.queryEl(`${root}.game-description-area`);
    state.descr.addEventListener('change', updateDescr);

    const gearsContainer = U.qee(U.queryEl(root), '#gears');
    U.addEl(gearsContainer, U.qe('.gears-tab'));
    Gears.init();
    const observer = new MutationObserver(((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.attributeName === 'class') {
                if (U.hasClass(gearsContainer, 'active')) {
                    Gears.refresh();
                }
            }
        });
    }));
    observer.observe(gearsContainer, {
        attributes: true
    });

    const slidersContainer = U.qee(U.queryEl(root), '#sliders');
    U.addEl(slidersContainer, U.qe('.sliders-tab'));
    Sliders.init();

    content = U.queryEl(root);
};

function refresh(){
    Gears.refresh();
    Sliders.refresh();
    PermissionInformer.isAdmin().then((isAdmin) => {
        UI.enable(content, 'adminOnly', isAdmin);
    }).catch(UI.handleError);

    Promise.all([DBMS.getMetaInfo(), DBMS.getStatistics()]).then(updateOverviewTab).catch(UI.handleError);
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
        div = barData === null ? U.makeEl('div') : U.addEl(U.makeEl('div'), U.makeText(barData.value));
        U.addClass(div, 'bar');
        if (barData) {
            div.style.height = `${barData.normValue * 100}%`;
            $(div).tooltip({
                title: barData.tip,
            });
        }

        U.addEl(place, div);
    });
}

function updateOverviewTab(results) {
    const [metaInfo, statistics] = results;
    state.name.value = metaInfo.name;
    state.date.value = metaInfo.date;
    state.preDate.value = metaInfo.preGameDate;
    state.descr.value = metaInfo.description;
    U.addEl(U.clearEl(state.lastSaveTime), U.makeText(dateFormat(new Date(metaInfo.saveTime), 'yyyy/mm/dd HH:MM:ss')));

    statistics.lastEvent = statistics.lastEvent !== '' ? dateFormat(new Date(statistics.lastEvent), 'yyyy/mm/dd h:MM') : '';
    statistics.firstEvent = statistics.firstEvent !== '' ? dateFormat(new Date(statistics.firstEvent), 'yyyy/mm/dd h:MM') : '';

    statisticKeys.forEach((key) => {
        updateStatisticValue(statistics, key);
    });

    U.addEl(U.clearEl(U.queryEl('#generalCompleteness')), U.makeText(CU.strFormat(L10n.getValue('overview-general-completeness-value'), statistics.generalCompleteness)));
    U.addEl(U.clearEl(U.queryEl('#storyCompleteness')), U.makeText(CU.strFormat(L10n.getValue('overview-story-completeness-value'), statistics.storyCompleteness)));
    U.addEl(U.clearEl(U.queryEl('#relationCompleteness')), U.makeText(CU.strFormat(L10n.getValue('overview-relation-completeness-value'), statistics.relationCompleteness)));

    defaultHists.forEach((histName) => {
        makeHistogram(U.clearEl(U.queryEl(`${root}.${histName}`)), statistics[histName]);
    });

    entityCharts.forEach((entityChart) => {
        makeChart(entityChart, U.queryEl(`${root}.${entityChart}`), statistics[entityChart]);
    });

    const symbolChartData = R.toPairs(localizeConsts(statistics.textCharactersCount)).map(pair => ({
        value: pair[1],
        label: makeChartLabel(statistics.textCharacterNumber, pair[0], pair[1])
    }));
    makeChart('symbolChart', U.queryEl(`${root}.symbolChart`), symbolChartData);

    const bindingChartData = R.toPairs(localizeConsts(statistics.bindingStats)).map(pair => ({
        value: pair[1],
        label: [pair[0], ': ', pair[1]].join('')
    }));
    makeChart('bindingChart', U.queryEl(`${root}.bindingChart`), bindingChartData);

    let barData, barDiv, bar;

    function makeContainer(obj) {
        barDiv = U.makeEl('div');
        U.addClass(barDiv, 'col-xs-3');
        U.addEl(barDiv, U.addEl(U.makeEl('h4'), U.makeText(obj.name)));
        U.addEl(barDiv, obj.bar);
        return barDiv;
    }
    function buildChart(info) {
        bar = U.setAttr(U.setAttr(U.makeEl('canvas'), 'width', '300'), 'height', '100');
        const data = R.zipObj(['name', 'bar'], [info.name, bar]);
        const container = makeContainer(data);
        makeChart(info.id, bar, info.prepared);
        return container;
    }

    function buildHist(info) {
        bar = U.addClass(U.makeEl('div'), 'overviewHist');
        const data = R.zipObj(['name', 'bar'], [info.name, bar]);
        const container = makeContainer(data);
        makeHistogram(bar, info.prepared);
        return container;
    }

    const innerMakeChart = R.compose(buildChart, prepareChart);
    const innerMakeHist = R.compose(buildHist, prepareHist);

    function localizeCheckboxes(info) {
        info.data = R.fromPairs(R.toPairs(info.data).map((val) => {
            val[0] = L10n.const(Constants[val[0]]);
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

    U.showEl(U.qe(`${root} .alert.character`), statistics.profileCharts.characterCharts.length === 0);
    statistics.profileCharts.characterCharts.map(fn)
        .map(U.addEl(U.clearEl(U.queryEl(`${root}.characterProfileDiagrams`))));
    U.showEl(U.qe(`${root} .alert.player`), statistics.profileCharts.playerCharts.length === 0);
    statistics.profileCharts.playerCharts.map(fn)
        .map(U.addEl(U.clearEl(U.queryEl(`${root}.playerProfileDiagrams`))));
}

function localizeConsts(info) {
    info = R.fromPairs(R.toPairs(info).map((val) => {
        val[0] = L10n.const(val[0]);
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
var makeChartLabel = R.curry((total, key, value) => [key, ': ', ((value / total) * 100).toFixed(0), '% (', value, '/', total, ')'].join(''));

function updateStatisticValue(statistics, key) {
    U.addEl(U.clearEl(U.queryEl(`#${key}`)), U.makeText(statistics[key]));
}

function updateName(event) {
    DBMS.setMetaInfoString({ name: 'name', value: event.target.value }).catch(UI.handleError);
}
function updateTime(dp, input) {
    DBMS.setMetaInfoDate({ name: 'date', value: input.val() }).catch(UI.handleError);
}
function updatePreGameDate(dp, input) {
    DBMS.setMetaInfoDate({ name: 'preGameDate', value: input.val() }).catch(UI.handleError);
}
function updateDescr(event) {
    DBMS.setMetaInfoString({ name: 'description', value: event.target.value }).catch(UI.handleError);
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

// })(window.Overview = {});
export default {
    init, refresh, getContent
};
