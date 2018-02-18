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
        const checkboxes = ['showRawData', 'showAvgData', 'showMedianData', 'showYLogData', 'showXLogData', 
            'maxXEnabled', 'minXEnabled', 'maxYEnabled', 'minYEnabled'];
        
        checkboxes.forEach(R.pipe(getEl, listen(R.__, 'change', onSettingsChange)));
        checkboxes.forEach(R.pipe(getEl, setProp(R.__, 'checked', false)));
        getEl('showMedianData').checked = true;
        listen(queryEl(`${root}.download-csv-button`), 'click', () => FileUtils.arr2d2Csv(state.data, 'table.csv'));
        
        const inputs = ['maxX', 'minX', 'maxY', 'minY'];
        inputs.forEach(R.pipe(getEl, listen(R.__, 'input', onSettingsChange)));

        exports.content = queryEl(root);
    };

    function paramTitle(param) {
        return `${param.name}, ${param.units}`;
    }

    const makeRow = R.curry((arr) => {
        const str2el = (value) => addEl(makeEl('td'), makeText(value || ''));
        return addEls(makeEl('tr'), arr.map(str2el));
    });

    const metaComparator = CommonUtils.charOrdAFactory(a => a[0].toLowerCase());
    const paramComparator = CommonUtils.charOrdAFactory(a => a.name.toLowerCase());
    
    exports.refresh = () => {
        DBMS.getDatabase((err, database) => {
            if (err) { Utils.handleError(err); return; }

            addEls(clearEl(queryEl(root + '#metainformation-table tbody')), 
                    R.toPairs(database.meta).sort(metaComparator).map(makeRow));
            addEls(clearEl(queryEl(root + '#constants-table tbody')), database.constantParams.sort(paramComparator)
                    .map(R.pipe(R.props(['name', 'units', 'value']), makeRow)));
            addEls(clearEl(queryEl(root + '#changed-params-table tbody')), database.changedParams.sort(paramComparator)
                    .map(R.pipe(R.props(['name', 'units']), makeRow)));
            addEls(clearEl(queryEl(root + '#measured-params-table tbody')), database.measuredParams.sort(paramComparator)
                    .map(R.pipe(R.props(['name', 'units', 'type', 'sumOf']), makeRow)));

            fillSelector(clearEl(getEl('chartDataSelector')), database.measuredParams.sort(paramComparator).map(val => ({
                name: val.name,
                value: val.name,
                selected: true
            })));
            setAttr(getEl('chartDataSelector'), 'size', Math.min(20, database.measuredParams.length));

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
                drawYLog: getEl('showYLogData').checked,
                drawXLog: getEl('showXLogData').checked,
                maxX: getEl('maxXEnabled').checked ? Number(getEl('maxX').value) : null,
                minX: getEl('minXEnabled').checked ? Number(getEl('minX').value) : null,
                maxY: getEl('maxYEnabled').checked ? Number(getEl('maxY').value) : null,
                minY: getEl('minYEnabled').checked ? Number(getEl('minY').value) : null,
            });
        });
    }

    function drawChart(database, measuredParamsList, opts) {
        const changedParam = database.changedParams[0];
        let data = [];
        const xScaler = opts.drawXLog ? Math.log : R.identity;
//        const xScaler = R.identity;
        const yScaler = opts.drawYLog ? Math.log : R.identity;

        const measuredParams = R.filter(R.compose(R.contains(R.__, measuredParamsList), R.prop('name')), database.measuredParams);

        if (opts.drawRaw) {
            const rawData = R.flatten(measuredParams.map(makeRawDataLines(xScaler, yScaler, database, changedParam)));
            data = data.concat(rawData);
        }

        if (opts.drawAvg) {
            const avgData = R.flatten(measuredParams.map(makeAvgDataLines(xScaler, yScaler, database, changedParam)));
            data = data.concat(avgData);
        }

        if (opts.drawMedian) {
            data = data.concat(R.flatten(measuredParams.map(makeMedianDataLines(xScaler, yScaler, database, changedParam))));
        }


        const chart = new CanvasJS.Chart('chartContainer', {
            zoomEnabled: true, 
            zoomType: "xy",
            exportEnabled: true,
//            interactivityEnabled: true,
            axisX: {
                title: paramTitle(changedParam),
                titleFontSize: 18,
                minimum: opts.minX,
                maximum: opts.maxX,
            },
            axisY: {
                title: paramTitle(database.measuredParams[0]),
                titleFontSize: 16,
                minimum: opts.minY,
                maximum: opts.maxY,
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
    var makeRawDataLines = R.curry((xScaler, yScaler, database, changedParam, measuredParam) => {
        const passes = R.groupBy(item => item.passId, R.values(database.measures));

        const dataPoints = R.map(passArray => passArray.map(item => ({
            x: xScaler(item[changedParam.name]),
            y: yScaler(item[measuredParam.name]),
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
        R.curry((label, aggregationFunction, xScaler, yScaler, database, changedParam, measuredParam) => {
            const pointed = R.groupBy(item => item[changedParam.name], R.values(database.measures));

            let avg = R.map((value) => {
                const clone = R.clone(value[0]);
                const rawValues = R.ap([R.prop(measuredParam.name)], value).sort();
                clone[measuredParam.name] = yScaler(aggregationFunction(rawValues));
                clone.yDisplayName = aggregationFunction(rawValues);
                clone[changedParam.name] = xScaler(value[0][changedParam.name]);
                clone.xDisplayName = value[0][changedParam.name];
                return clone;
            }, pointed);

            avg = R.values(avg).map(item => ({
                x: item[changedParam.name],
                y: item[measuredParam.name],
                toolTipContent: strFormat(
                    '{0}: {1}<br/>{2}: {3}',
                    [paramTitle(changedParam),
                        item[changedParam.name] + ' (raw value ' + item.xDisplayName + ')',
                        paramTitle(measuredParam),
                        item[measuredParam.name] + ' (raw value ' + item.yDisplayName + ')']
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
