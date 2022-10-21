/*Copyright 2018 Timofey Rechkalov <ntsdk@yandex.ru>, Maria Sidekhmenova <matilda_@list.ru>

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
    limitations under the License. */


((callback2) => {
    function slidersAPI(LocalDBMS, opts) {
        const {
            R, Constants, Errors, addListener, dbmsUtils, CU, PC
        } = opts;

        const path = ['Sliders'];

        LocalDBMS.prototype.getSliderData = function () {
            return Promise.resolve(R.clone(R.path(path, this.database)));
        };

        LocalDBMS.prototype.moveSlider = function ({ index, pos } = {}) {
            return new Promise((resolve, reject) => {
                const model = R.path(path, this.database);
                const chain = PC.chainCheck([PC.isNumber(index), PC.isInRange(index, 0, model.length - 1),
                    PC.isNumber(pos), PC.isInRange(pos, 0, model.length)]);
                PC.precondition2(chain).then(() => {
                    if (pos > index) {
                        pos--;
                    }
                    const tmp = model[index];
                    model.splice(index, 1);
                    model.splice(pos, 0, tmp);

                    resolve();
                }).catch(reject);
            });
        };

        LocalDBMS.prototype.createSlider = function ({ name, top, bottom } = {}) {
            return new Promise((resolve, reject) => {
                const chain = PC.chainCheck([PC.isString(name), PC.isString(top), PC.isString(bottom)]);
                PC.precondition2(chain).then(() => {
                    R.path(path, this.database).push({
                        name, top, bottom, value: 0
                    });
                    resolve();
                }).catch(reject);
            });
        };

        LocalDBMS.prototype.updateSliderNaming = function ({
            index, name, top, bottom
        } = {}) {
            return new Promise((resolve, reject) => {
                const model = R.path(path, this.database);
                const chain = PC.chainCheck([PC.isNumber(index), PC.isInRange(index, 0, model.length - 1),
                    PC.isString(name), PC.isString(top), PC.isString(bottom)]);
                PC.precondition2(chain).then(() => {
                    model[index].name = name;
                    model[index].top = top;
                    model[index].bottom = bottom;
                    resolve();
                }).catch(reject);
            });
        };

        LocalDBMS.prototype.updateSliderValue = function ({ index, value } = {}) {
            return new Promise((resolve, reject) => {
                const model = R.path(path, this.database);
                const chain = PC.chainCheck([PC.isNumber(index), PC.isInRange(index, 0, model.length - 1),
                    PC.isNumber(value), PC.isInRange(value, -10, 10)]);
                PC.precondition2(chain).then(() => {
                    model[index].value = value;
                    resolve();
                }).catch(reject);
            });
        };

        LocalDBMS.prototype.removeSlider = function ({ index } = {}) {
            return new Promise((resolve, reject) => {
                const model = R.path(path, this.database);
                const chain = PC.chainCheck([PC.isNumber(index), PC.isInRange(index, 0, model.length - 1)]);
                PC.precondition2(chain).then(() => {
                    CU.removeFromArrayByIndex(model, index);
                    resolve();
                }).catch(reject);
            });
        };
    }
    callback2(slidersAPI);
})(api => (typeof exports === 'undefined' ? (this.slidersAPI = api) : (module.exports = api)));
