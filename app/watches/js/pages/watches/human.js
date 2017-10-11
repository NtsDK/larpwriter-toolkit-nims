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
    
    var root = ".human-tab ";
    var state = {};

    exports.init = function() {
        listen(queryEl(root + '.applyCrater'), 'click', applyCrater);
        listen(queryEl(root + '.hearSummons'), 'click', hearSummons);
        listen(queryEl(root + '.unhearSummons'), 'click', unhearSummons);
        listen(queryEl(root + '.apply-influence'), 'click', applyInfluence);
        
        Influences.initMap('human-map', state, root);
        
        exports.content = queryEl(root);
    };
    
    exports.refresh = function() {
        DBMS.getUserProfile(function(err, userProfile){
            if(err) {Utils.handleError(err); return;}
            PermissionInformer.getEntityNamesArray('player', true, function(err, playerNames){
                if(err) {Utils.handleError(err); return;}
                DBMS.getInfluences(function(err, influences){
                    if(err) {Utils.handleError(err); return;}
                    var activeInfluences = Influences.getActiveInfluences(influences, Date.now());
                    navigator.geolocation.getCurrentPosition(function(position) {
                        ymaps.ready(() => {
                            
                            state.map.geoObjects.removeAll();
                            
                            var objects = activeInfluences.map(influence => {
                                var radius = Constants.influenceSettings[String(Math.abs(influence.power))].radius;
                                var isPositive = influence.power > 0;
                                
//                            var str = name + ' (' + fullData[name].value + ')';
                                var myCircle = new ymaps.Circle([[influence.latitude, influence.longitude], radius], { 
                                    balloonContent: 'Психополе: ' + influence.sender, power: influence.power},{});
                                return myCircle;
                            });
                            
                            var circles = ymaps.geoQuery(objects).setOptions('visible', false).addToMap(state.map);
//                            var circles = ymaps.geoQuery(objects);
//                            circles.addToMap(state.map);
                                
                            var pos;
                            if(state.customLatitude !== undefined){
                                pos = [state.customLatitude, state.customLongitude];
                            } else {
                                pos = [position.coords.latitude, position.coords.longitude];
                            }
                            var coords = ymaps.geoQuery({
                                type: 'Point',
                                coordinates: pos
                            }).addToMap(state.map);
//                            var filteredCircles = coords.intersect(circles);
//                            filteredCircles = circles.intersect(coords);
                            var mark = new ymaps.Placemark(pos);
                            var filteredCircles = circles.searchContaining(mark);
                            
                            var str = [];
                            filteredCircles.each((el) => {
                                str.push(el.properties.get("power"));
                            });
                            str = str.join(', ');
                            addEl(clearEl(queryEl(root + '.territorialInfluences')), makeText(str));
//                            filteredCircles = circles.searchInside(mark);
//                            activeInfluences.map(el => new ymaps.Placemark([el.latitude, el.longitude]));
                        });
                    });
                
                    var data = getSelect2Data(playerNames);
                    clearEl(queryEl(root + ".influence-player-select"));
                    $(root + ".influence-player-select").select2(data);
                    
                    clearEl(queryEl(root + ".summons-player-select"));
                    $(root + ".summons-player-select").select2(data);
                    
                    state.profile = userProfile;
                    updateProfilePanel();
                });
            });
        });
    };
    
    var updateProfilePanel = () => {
        addEl(clearEl(queryEl(root + '.isCraterApplied')), makeText(state.profile['Воронка'] === true ? 'Да' : 'Нет'));
        addEl(clearEl(queryEl(root + '.isHearSummons')), makeText(state.profile['Зов'] === true ? 'Да' +'('+state.profile['Зовущий']+')'  : 'Нет'));
    };
    
    var hearSummons = () => {
        var fromName = queryEl(root + ".summons-player-select").value.trim();
        DBMS.hearSummons(fromName, function(err){
            if(err) {Utils.handleError(err); return;}
            exports.refresh();
        });
    }
    var unhearSummons = () => {
        DBMS.unhearSummons(function(err){
            if(err) {Utils.handleError(err); return;}
            exports.refresh();
        });
    }
    var applyInfluence = () => {
        var fromName = queryEl(root + ".influence-player-select").value.trim();
        var power = Number(queryEl(root + ".influence-power").value);
        navigator.geolocation.getCurrentPosition(function(position) {
            DBMS.applyPersonInfluence(fromName, power, position.coords.latitude, position.coords.longitude, function(err){
                if(err) {Utils.handleError(err); return;}
                exports.refresh();
            });
        });
    }
    
    var applyCrater = () => {
        DBMS.applyCrater(function(err){
            if(err) {Utils.handleError(err); return;}
            exports.refresh();
        });
    };

})(this['Human']={});