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

"use strict";

(function(exports){
    
    var root = ".analyst-tab ";
    var state = {};

    exports.init = function() {
        
        listen(queryEl(root+'.show-craters'), "change", exports.refresh);
        listen(queryEl(root+'.show-summons'), "change", exports.refresh);
        listen(queryEl(root+'.show-personal-influences'), "change", exports.refresh);
        listen(queryEl(root+'.show-territorial-influences'), "change", exports.refresh);
        Influences.initMap('analyst-map', state, root);
        exports.content = queryEl(root);
    };
    
    exports.refresh = function() {
        DBMS.getAnalystInfluences(function(err, personalInfluences){
            if(err) {Utils.handleError(err); return;}
            DBMS.getInfluences(function(err, influences){
                if(err) {Utils.handleError(err); return;}
                DBMS.getCraters(function(err, craters){
                    if(err) {Utils.handleError(err); return;}
                    DBMS.getSummons(function(err, summons){
                        if(err) {Utils.handleError(err); return;}
                        craters.sort(CommonUtils.charOrdAFactoryBase('desc', a => new Date(a['Время наложения воронки'])));
                        personalInfluences.sort(CommonUtils.charOrdAFactoryBase('desc', a => new Date(a.time)));
                        
                        addEls(clearEl(queryEl(root + '.craters-table tbody')),craters.map((el,i) => {
                            return addEls(makeEl('tr'),
                                    [addEl(makeEl('td'), makeText(i+1)),
                                     addEl(makeEl('td'), makeText(el['Время наложения воронки'])),
                                        addEl(makeEl('td'), makeText(el['Масса воронки'])),
                                        addEl(makeEl('td'), makeText(el['Плотность воронки'])),
                                        addEl(makeEl('td'), makeText(el['Широта воронки'])),
                                        addEl(makeEl('td'), makeText(el['Долгота воронки'])),
                                        ]);
                        }));
                        addEls(clearEl(queryEl(root + '.summons-table tbody')),summons.map((el,i) => {
                            return addEls(makeEl('tr'),
                                    [addEl(makeEl('td'), makeText(i+1)),
                                        addEl(makeEl('td'), makeText(el['Время наложения зова'])),
                                        addEl(makeEl('td'), makeText(el.psychofield)),
                                        addEl(makeEl('td'), makeText(el['Широта зова'])),
                                        addEl(makeEl('td'), makeText(el['Долгота зова'])),
                                        ]);
                        }));
                        
//                        'Широта зова','Широта зова','Зовущий','Время наложения зова'])).map(el => {
//                            if(players[el['Зовущий']] !== undefined){
//                                el.psychofield
                                
                                
                        addEls(clearEl(queryEl(root + '.influence-table tbody')),personalInfluences.map((el,i) => {
                            return addEls(makeEl('tr'),
                                    [addEl(makeEl('td'), makeText(i+1)),
                                        addEl(makeEl('td'), makeText(el.time)),
    //                                    addEl(makeEl('td'), makeText(el.player)),
                                        addEl(makeEl('td'), makeText(el.psychofield)),
                                        addEl(makeEl('td'), makeText(el.latitude)),
                                        addEl(makeEl('td'), makeText(el.longitude)),
                                        addEl(makeEl('td'), makeText(el.power))]);
                        }));
                        var now = Date.now();
                        var activeInfluences = Influences.getActiveInfluences(influences, now);
                        Influences.fillMap(activeInfluences, state, () => {
                            if(queryEl(root+'.show-personal-influences').checked){
                                personalInfluences.map((influence,i) => {
                                    var myCircle = new ymaps.Placemark([influence.latitude, influence.longitude], { 
                                        balloonContent: 'Психополе: ' + influence.psychofield,
                                        iconContent:'Вз' + (i+1)
                                    }, {
                                        preset: 'islands#blueStretchyIcon',
                                    });
                                    state.map.geoObjects.add(myCircle);
                                });
                            }
                            if(queryEl(root+'.show-summons').checked){
                                summons.map((summon,i) => {
                                    var myCircle = new ymaps.Placemark([summon['Широта зова'], summon['Долгота зова']], { 
                                        balloonContent: 'Психополе: ' + summon.psychofield,
                                        iconContent:'З' + (i+1)
                                    }, {
                                        preset: 'islands#greenStretchyIcon',
                                    });
                                    state.map.geoObjects.add(myCircle);
                                });
                            }
                            if(queryEl(root+'.show-craters').checked){
                                craters.map((crater,i) => {
                                    var myCircle = new ymaps.Placemark([crater['Широта воронки'], crater['Долгота воронки']], { 
        //                                balloonContent: 'Психополе: ' + influence.psychofield,
        //                                hintContent: '23232', 
        //                                balloonContent: '23232',
                                        iconContent:'Вр' + (i+1)
                                    }, {
                                        preset: 'islands#redStretchyIcon',
                                    });
                                    state.map.geoObjects.add(myCircle);
                                })
                            }
    //                        state.map.geoObjects.add(res);
                        }, queryEl(root+'.show-territorial-influences').checked);
                    });
                });
            });
        });
    };
    
})(this['Analyst']={});