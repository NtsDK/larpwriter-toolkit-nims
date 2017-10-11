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
    
    var state = {};
    var root = '.influences-tab ';
    

    exports.initMap = (id, state, root) => {
        ymaps.ready(() => {
            state.map = new ymaps.Map (id, {
                center: [55.1565, 61.4577],   
                zoom: 10
            });
            
            state.map.events.add('click', function (e) {
                var coords = e.get('coords');
                var latitude = queryEl(root + '.latitude');
                var longitude = queryEl(root + '.longitude');
                if(longitude){
                    latitude.value = coords[0].toPrecision(6);
                    longitude.value = coords[1].toPrecision(6);
                }
                state.customLatitude = coords[0].toPrecision(6);
                state.customLongitude = coords[1].toPrecision(6);
            });
            
            state.map.behaviors.enable('scrollZoom');
        })
    }


    exports.init = function() {
        state.preDate = queryEl(root + ".time");
        
        var opts = {
            lang : L10n.getLang(),
            mask : true,
//            onChangeDateTime : updatePreGameDate
        };
    
        jQuery(state.preDate).datetimepicker(opts);
        
        listen(queryEl(root + ".create-entity-button"), "click", createInfluence);
        
        exports.initMap('map', state, root);
        
        exports.content = queryEl(root);
    };
    
    var text2span = text => addEl(makeEl('td'), addEl(makeEl('span'),makeText(text)));
    var makeDelBtn = (el)=>{
        var btn = addEl(makeEl('button'), makeText('Удалить'));
        listen(btn, 'click', () => {
            Utils.confirm('Вы уверены, что хотите удалить воздействие?', () => {
                DBMS.removeInfluence(JSON.stringify(el), function(err){
                    if(err) {Utils.handleError(err); return;}
                    exports.refresh();
                })
            })
        })
        return btn;
    }
    
    exports.getActiveInfluences = (influences, now) => influences.filter(influence => {
        var time = Constants.influenceSettings[String(Math.abs(influence.power))].time;
        var expirationDate = new Date(new Date(influence.time).getTime() + time * 1000*60*60); 
        return now < expirationDate;
    });
    
    exports.refresh = function() {
        DBMS.getInfluences(function(err, influences){
            if(err) {Utils.handleError(err); return;}
            influences.sort(CommonUtils.charOrdAFactoryBase('desc', a => new Date(a.time)));
            var now = Date.now();
            var activeInfluences = exports.getActiveInfluences(influences, now);
            var expiredInfluences = influences.filter(influence => {
                var time = Constants.influenceSettings[String(Math.abs(influence.power))].time;
                var expirationDate = new Date(new Date(influence.time).getTime() + time * 1000*60*60); 
                return now >= expirationDate;
            });
            
            var influence2dom = el => {
                return addEls(makeEl('tr'), [text2span(el.time),text2span(el.sender),text2span(el.latitude),
                    text2span(el.longitude),text2span(el.power), addEl(makeEl('td'),makeDelBtn(el))]);
            };
            
            addEls(clearEl(queryEl(root + '.influence-table tbody')), activeInfluences.map(influence2dom));
            addEls(clearEl(queryEl(root + '.expired-influence-table tbody')), expiredInfluences.map(influence2dom));
            
            exports.fillMap(activeInfluences, state);
        });
    };
    
    exports.fillMap = (activeInfluences, state, callback) => {
        ymaps.ready(() => {
            state.map.geoObjects.removeAll();
           
            activeInfluences.forEach(influence => {
                var radius = Constants.influenceSettings[String(Math.abs(influence.power))].radius;
                var isPositive = influence.power > 0;
                
//            var str = name + ' (' + fullData[name].value + ')';
                var myCircle = new ymaps.Circle([[influence.latitude, influence.longitude], radius], { 
                    balloonContent: 'Психополе: ' + influence.sender,
//                var myPlacemark = new ymaps.Placemark([influence.latitude, influence.longitude], { 
//                hintContent: str, 
//                balloonContent: str,
//                iconContent: fullData[name].value
                }, {
//                preset: 'twirl#whiteStretchyIcon',"#FA0A10", background: "#FB7E81"
                    fillColor: isPositive ? "#7BE14177" : "#FB7E8177",
                    strokeColor: isPositive ? "#41A906" : "#FA0A10",
                    strokeOpacity: 0.8,
                    strokeWidth: 4
                });
                //myPlacemark.setData(33);
                
                state.map.geoObjects.add(myCircle);
                if(callback)callback();
            })
        });
    }
    
    var createInfluence = () => {
        var time = new Date(jQuery(state.preDate).val()).toString();
        var sender = queryEl(root + '.sender');
        var latitude = queryEl(root + '.latitude');
        var longitude = queryEl(root + '.longitude');
        var power = queryEl(root + '.power');
        
        DBMS.createInfluence(time, sender.value, Number(latitude.value), Number(longitude.value), Number(power.value), function(err){
            if(err) {Utils.handleError(err); return;}
            sender.value = '';
            latitude.value = '';
            longitude.value = '';
            power.value = '';
            exports.refresh();
        });
    };

})(this['Influences']={});