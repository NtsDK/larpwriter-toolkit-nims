/*Copyright 2017 Timofey Rechkalov <ntsdk@yandex.ru>

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
    limitations under the License. */

'use strict';

((exports) => {
    const l10n = L10n.get('performance');
    const root = '.performance-tab ';
    const state = {};

    exports.init = () => {
        listen(getEl('chartDataSelector'), 'change', onSettingsChange);
        listen(getEl('showRawData'), 'change', onSettingsChange);
        listen(getEl('showAvgData'), 'change', onSettingsChange);
        listen(getEl('showMedianData'), 'change', onSettingsChange);
        listen(getEl('showYLogData'), 'change', onSettingsChange);
        getEl('showRawData').checked = true;
        getEl('showAvgData').checked = false;
        getEl('showMedianData').checked = false;
        getEl('showYLogData').checked = false;
        listen(queryEl(`${root}.download-csv-button`), 'click', () => FileUtils.arr2d2Csv(state.data, 'table.csv'));

        exports.content = queryEl(root);
    };

    function paramTitle(param) {
        return `${param.name}, ${param.units}`;
    }

    const makeRow = R.curry((title, getName, getValue, key, i, arr) => {
        let els = [addEl(makeEl('td'), makeText(getName(key))), addEl(makeEl('td'), makeText(getValue(key)))];
        if (i === 0) {
            const el = addEl(makeEl('th'), makeText(title));
            setAttr(el, 'rowspan', arr.length);
            els = [el].concat(els);
        }
        return addEls(makeEl('tr'), els);
    });

    exports.refresh = () => {
        const table = clearEl(queryEl('#benchmark-description tbody'));

        DBMS.getDatabase((err, database) => {
            if (err) { Utils.handleError(err); return; }

            addEls(
                table,
                Object.keys(database.meta)
                    .sort()
                    .map(makeRow(
                        l10n('metainformation'), key => key,
                        key => database.meta[key]
                    ))
            );
            addEls(table, database.constantParams.map(makeRow(l10n('constants'), item => paramTitle(item), item => item.value)));
            addEls(table, database.changedParams.map(makeRow(l10n('changed-params'), item => paramTitle(item), item => '')));
            addEls(table, database.measuredParams.map(makeRow(l10n('measured-params'), item => paramTitle(item), item => '')));

            fillSelector(clearEl(getEl('chartDataSelector')), database.measuredParams.map(val => ({
                name: val.name,
                value: val.name,
                selected: true
            })));
            setAttr(getEl('chartDataSelector'), 'size', database.measuredParams.length);

            onSettingsChange();
        });
    };

    function onSettingsChange() {
        const measuredParamsList = nl2array(getEl('chartDataSelector').selectedOptions).map(R.prop('value'));

        DBMS.getDatabase((err, database) => {
            drawChart(database, measuredParamsList, {
                drawRaw: getEl('showRawData').checked,
                drawAvg: getEl('showAvgData').checked,
                drawMedian: getEl('showMedianData').checked,
                drawYLog: getEl('showYLogData').checked
            });
        });
    }

    function drawChart(database, measuredParamsList, opts) {
        const changedParam = database.changedParams[0];
        let data = [];
        const scaler = opts.drawYLog ? Math.log : R.identity;

        const measuredParams = R.filter(R.compose(R.contains(R.__, measuredParamsList), R.prop('name')), database.measuredParams);

        if (opts.drawRaw) {
            const rawData = R.flatten(measuredParams.map(makeRawDataLines(scaler, database, changedParam)));
            data = data.concat(rawData);
        }

        if (opts.drawAvg) {
            const avgData = R.flatten(measuredParams.map(makeAvgDataLines(scaler, database, changedParam)));
            data = data.concat(avgData);
        }

        if (opts.drawMedian) {
            data = data.concat(R.flatten(measuredParams.map(makeMedianDataLines(scaler, database, changedParam))));
        }


        const chart = new CanvasJS.Chart('chartContainer', {
            axisX: {
                title: paramTitle(changedParam),
                titleFontSize: 18
            },
            axisY: {
                title: paramTitle(database.measuredParams[0]),
                titleFontSize: 16
            },
            legend: {
                verticalAlign: 'bottom',
                horizontalAlign: 'center'
            },

            data
        });

        chart.render();

        fillDataTable(data);
    }

    function fillDataTable(data) {
        const thead = clearEl(queryEl(`${root}.table-panel table thead`));
        const tbody = clearEl(queryEl(`${root}.table-panel table tbody`));

        const data2 = [];

        const keys = ['track name', 'units'].concat(data[0].dataPoints.map(R.prop('x')));
        data2.push(keys);
        addEl(thead, addEls(makeEl('tr'), keys.map(makeText).map(el => addEl(makeEl('th'), el))));

        addEls(tbody, data.map((row) => {
            const vals = [row.legendText, row.units].concat(row.dataPoints.map(R.prop('y')));
            data2.push(vals);
            return addEls(makeEl('tr'), vals.map(makeText).map(el => addEl(makeEl('td'), el)));
        }));
        state.data = data2;
    }


    // eslint-disable-next-line no-var,vars-on-top
    var makeRawDataLines = R.curry((scaler, database, changedParam, measuredParam) => {
        const passes = R.groupBy(item => item.passId, R.values(database.measures));

        const dataPoints = R.map(passArray => passArray.map(item => ({
            x: item[changedParam.name],
            y: scaler(item[measuredParam.name]),
            toolTipContent: L10n.format(
                'performance', 'tooltip-schema',
                [
                    measuredParam.name,
                    item.passId,
                    paramTitle(changedParam),
                    item[changedParam.name],
                    paramTitle(measuredParam),
                    item[measuredParam.name]
                ]
            )
        })), passes);

        return R.values(R.mapObjIndexed((array, key) => ({
            showInLegend: true,
            legendText: `${measuredParam.name} ${key}`,
            type: 'line',
            markerType: 'circle',
            markerBorderColor: 'black',
            markerSize: 15,
            markerBorderThickness: 1,
            units: measuredParam.units,
            dataPoints: array
        }), dataPoints));
    });

    const makeAggregatedDataLines =
        R.curry((label, aggregationFunction, scaler, database, changedParam, measuredParam) => {
            const pointed = R.groupBy(item => item[changedParam.name], R.values(database.measures));

            let avg = R.map((value) => {
                const clone = R.clone(value[0]);
                const rawValues = R.ap([R.prop(measuredParam.name)], value).sort();
                clone[measuredParam.name] = scaler(aggregationFunction(rawValues));
                return clone;
            }, pointed);

            avg = R.values(avg).map(item => ({
                x: item[changedParam.name],
                y: item[measuredParam.name],
                toolTipContent: strFormat(
                    '{0}: {1}<br/>{2}: {3}',
                    [paramTitle(changedParam),
                        item[changedParam.name],
                        paramTitle(measuredParam),
                        item[measuredParam.name]]
                )
            }));

            return {
                showInLegend: true,
                legendText: `${measuredParam.name} ${label}`,
                type: 'line',
                markerType: 'circle',
                markerBorderColor: 'black',
                markerSize: 30,
                markerBorderThickness: 1,
                units: measuredParam.units,
                dataPoints: avg
            };
        });

    // eslint-disable-next-line no-var,vars-on-top
    var makeMedianDataLines = makeAggregatedDataLines('median', R.median);
    // eslint-disable-next-line no-var,vars-on-top
    var makeAvgDataLines = makeAggregatedDataLines('avg', R.mean);
})(this.Performance = {});
