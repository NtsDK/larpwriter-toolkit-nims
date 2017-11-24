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

/*global
 Utils, DBMS
 */

"use strict";

(function(exports){
    
    var l10n = L10n.get('performance');

    exports.init = function() {
        listen(getEl('chartDataSelector'), 'change', onSettingsChange);
        listen(getEl('showRawData'), 'change', onSettingsChange);
        listen(getEl('showAvgData'), 'change', onSettingsChange);
        listen(getEl('showMedianData'), 'change', onSettingsChange);
        listen(getEl('showYLogData'), 'change', onSettingsChange);        
        getEl('showRawData').checked = true;
        getEl('showAvgData').checked = false;
        getEl('showMedianData').checked = false;
        getEl('showYLogData').checked = false;

        exports.content = getEl('performance');
    };
    
    function paramTitle(param){
        return param.name + ", " + param.units;
    }
    
    var makeRow = R.curry(function(title, getName, getValue, key, i, arr){
        var els = [addEl(makeEl('td'), makeText(getName(key))), addEl(makeEl('td'), makeText(getValue(key)))];
        if(i==0){
            var el = addEl(makeEl('th'), makeText(title));
            setAttr(el, 'rowspan', arr.length);
            els = [el].concat(els);
        }
        return addEls(makeEl('tr'), els);
    });
    
    exports.refresh = function() {
        var table = clearEl(queryEl('#benchmark-description tbody'));
        
        DBMS.getDatabase(function(err, database){
            if(err) {Utils.handleError(err); return;}
            
            addEls(
                table,
                Object.keys(database.meta)
                    .sort()
                    .map(makeRow(l10n('metainformation'),key => key,
                key => database.meta[key])));
            addEls(table, database.constantParams.map(makeRow(l10n('constants'), item => paramTitle(item), item => item.value)));
            addEls(table, database.changedParams.map(makeRow(l10n('changed-params'), item => paramTitle(item), item => '')));
            addEls(table, database.measuredParams.map(makeRow(l10n('measured-params'), item => paramTitle(item), item => '')));
            
            fillSelector(clearEl(getEl('chartDataSelector')), database.measuredParams.map(function(val){
                return {
                    name: val.name,
                    value: val.name,
                    selected: true
                };
            }));
            setAttr(getEl('chartDataSelector'), 'size', database.measuredParams.length);
            
            onSettingsChange();
        });
    };
    
    var onSettingsChange = function(){
        
        var measuredParamsList = nl2array(getEl('chartDataSelector').selectedOptions).map(R.prop('value'));
        
        DBMS.getDatabase(function(err, database){
            drawChart(database, measuredParamsList, {
                drawRaw: getEl('showRawData').checked,
                drawAvg: getEl('showAvgData').checked,
                drawMedian: getEl('showMedianData').checked,
                drawYLog: getEl('showYLogData').checked
            });
        });
    };
    
    var drawChart = function (database, measuredParamsList, opts) {
        var changedParam = database.changedParams[0];
        var data = [];
        var scaler = opts.drawYLog ? Math.log : R.identity

        // var scaler = Math.log
        
        var measuredParams = R.filter(R.compose(R.contains(R.__, measuredParamsList), R.prop('name')), database.measuredParams);
        
        if(opts.drawRaw){
            var rawData = R.flatten(measuredParams.map(makeRawDataLines(scaler, database, changedParam))); 
            data = data.concat(rawData);
        }
        
        if(opts.drawAvg){
            var avgData = R.flatten(measuredParams.map(makeAvgDataLines(scaler, database, changedParam))); 
            data = data.concat(avgData);
        }
        
        if(opts.drawMedian){
            data = data.concat(R.flatten(measuredParams.map(makeMedianDataLines(scaler, database, changedParam))));
        }


        
        var chart = new CanvasJS.Chart("chartContainer", {
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
                horizontalAlign: "center"
            },

            data: data
        });

        chart.render();
    };
    
    var makeRawDataLines = R.curry(function(scaler, database, changedParam, measuredParam){
        
        var passes = R.groupBy(function(item){
            return item.passId;
        }, R.values(database.measures));
        
        var dataPoints = R.map(function(passArray){
            return passArray.map(function(item){
                return {
                    x: item[changedParam.name],
                    y: scaler(item[measuredParam.name]),
                    toolTipContent: L10n.format('performance','tooltip-schema',
                                        [
                                            measuredParam.name,
                                            item.passId,
                                            paramTitle(changedParam), 
                                            item[changedParam.name],
                                            paramTitle(measuredParam),
                                            item[measuredParam.name]
                                        ])
                }
            })
        }, passes);
        
        return R.values(R.mapObjIndexed(function(array, key){
            return {
                showInLegend: true,
                legendText: measuredParam.name + " " + key,
                type: "line",
                markerType: "circle",
                markerBorderColor : "black",
                markerSize: 15,
                markerBorderThickness: 1,
                dataPoints: array 
            };
        }, dataPoints));
    });
    
    var makeAggregatedDataLines = R.curry(function(label, aggregationFunction, scaler, database, changedParam, measuredParam){
        var pointed = R.groupBy((item) => item[changedParam.name], R.values(database.measures));
        
        var avg = R.map(function(value){
            var clone = R.clone(value[0]);
            var rawValues = R.ap([R.prop(measuredParam.name)], value).sort();
            clone[measuredParam.name] = scaler(aggregationFunction(rawValues));
            return clone;
        }, pointed)
        
        avg = R.values(avg).map(function(item){
            return {
                x: item[changedParam.name],
                y: item[measuredParam.name],
                toolTipContent: strFormat('{0}: {1}<br/>{2}: {3}',[paramTitle(changedParam), item[changedParam.name], paramTitle(measuredParam), item[measuredParam.name]])
            }
        });
        
        return {
            showInLegend: true,
            legendText: measuredParam.name + ' ' + label,
            type: "line",
            markerType: "circle",
            markerBorderColor : "black",
            markerSize: 30,
            markerBorderThickness: 1,
            dataPoints:avg 
        };
    });
    
    var makeMedianDataLines = makeAggregatedDataLines('median', R.median);
    var makeAvgDataLines = makeAggregatedDataLines('avg', R.mean);
    
})(this.Performance={});