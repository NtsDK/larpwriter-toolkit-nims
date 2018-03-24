//// 3.4.0
//(function webpackUniversalModuleDefinition(root, factory) {
//    if(typeof exports === 'object' && typeof module === 'object')
//        module.exports = factory();
//    else if(typeof define === 'function' && define.amd)
//        define([], factory);
//    else if(typeof exports === 'object')
//        exports["JsDiff"] = factory();
//    else
//        root["JsDiff"] = factory();
//})(this, function() {
//return /******/ (function(modules) { // webpackBootstrap
///******/    // The module cache
///******/    var installedModules = {};
//
///******/    // The require function
///******/    function __webpack_require__(moduleId) {
//
///******/        // Check if module is in cache
///******/        if(installedModules[moduleId])
///******/            return installedModules[moduleId].exports;
//
///******/        // Create a new module (and put it into the cache)
///******/        var module = installedModules[moduleId] = {
///******/            exports: {},
///******/            id: moduleId,
///******/            loaded: false
///******/        };
//
///******/        // Execute the module function
///******/        modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
//
///******/        // Flag the module as loaded
///******/        module.loaded = true;
//
///******/        // Return the exports of the module
///******/        return module.exports;
///******/    }
//
//
///******/    // expose the modules object (__webpack_modules__)
///******/    __webpack_require__.m = modules;
//
///******/    // expose the module cache
///******/    __webpack_require__.c = installedModules;
//
///******/    // __webpack_public_path__
///******/    __webpack_require__.p = "";
//
///******/    // Load entry module and return exports
///******/    return __webpack_require__(0);
///******/ })
///************************************************************************/
///******/ ([
///* 0 */
///***/ (function(module, exports, __webpack_require__) {
//
//    /*istanbul ignore start*/'use strict';
//
//    Object.defineProperty(exports, "__esModule", {
//      value: true
//    });
//    exports.canonicalize = exports.convertChangesToXML = exports.convertChangesToDMP = exports.merge = exports.parsePatch = exports.applyPatches = exports.applyPatch = exports.createPatch = exports.createTwoFilesPatch = exports.structuredPatch = exports.diffArrays = exports.diffJson = exports.diffCss = exports.diffSentences = exports.diffTrimmedLines = exports.diffLines = exports.diffWordsWithSpace = exports.diffWords = exports.diffChars = exports.Diff = undefined;
//
//    /*istanbul ignore end*/var /*istanbul ignore start*/_base = __webpack_require__(1) /*istanbul ignore end*/;
//
//    /*istanbul ignore start*/var _base2 = _interopRequireDefault(_base);
//
//    /*istanbul ignore end*/var /*istanbul ignore start*/_character = __webpack_require__(2) /*istanbul ignore end*/;
//
//    var /*istanbul ignore start*/_word = __webpack_require__(3) /*istanbul ignore end*/;
//
//    var /*istanbul ignore start*/_line = __webpack_require__(5) /*istanbul ignore end*/;
//
//    var /*istanbul ignore start*/_sentence = __webpack_require__(6) /*istanbul ignore end*/;
//
//    var /*istanbul ignore start*/_css = __webpack_require__(7) /*istanbul ignore end*/;
//
//    var /*istanbul ignore start*/_json = __webpack_require__(8) /*istanbul ignore end*/;
//
//    var /*istanbul ignore start*/_array = __webpack_require__(9) /*istanbul ignore end*/;
//
//    var /*istanbul ignore start*/_apply = __webpack_require__(10) /*istanbul ignore end*/;
//
//    var /*istanbul ignore start*/_parse = __webpack_require__(11) /*istanbul ignore end*/;
//
//    var /*istanbul ignore start*/_merge = __webpack_require__(13) /*istanbul ignore end*/;
//
//    var /*istanbul ignore start*/_create = __webpack_require__(14) /*istanbul ignore end*/;
//
//    var /*istanbul ignore start*/_dmp = __webpack_require__(16) /*istanbul ignore end*/;
//
//    var /*istanbul ignore start*/_xml = __webpack_require__(17) /*istanbul ignore end*/;
//
//    /*istanbul ignore start*/function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }
//
//    /* See LICENSE file for terms of use */
//
//    /*
//     * Text diff implementation.
//     *
//     * This library supports the following APIS:
//     * JsDiff.diffChars: Character by character diff
//     * JsDiff.diffWords: Word (as defined by \b regex) diff which ignores whitespace
//     * JsDiff.diffLines: Line based diff
//     *
//     * JsDiff.diffCss: Diff targeted at CSS content
//     *
//     * These methods are based on the implementation proposed in
//     * "An O(ND) Difference Algorithm and its Variations" (Myers, 1986).
//     * http://citeseerx.ist.psu.edu/viewdoc/summary?doi=10.1.1.4.6927
//     */
//    exports. /*istanbul ignore end*/Diff = _base2['default'];
//    /*istanbul ignore start*/exports. /*istanbul ignore end*/diffChars = _character.diffChars;
//    /*istanbul ignore start*/exports. /*istanbul ignore end*/diffWords = _word.diffWords;
//    /*istanbul ignore start*/exports. /*istanbul ignore end*/diffWordsWithSpace = _word.diffWordsWithSpace;
//    /*istanbul ignore start*/exports. /*istanbul ignore end*/diffLines = _line.diffLines;
//    /*istanbul ignore start*/exports. /*istanbul ignore end*/diffTrimmedLines = _line.diffTrimmedLines;
//    /*istanbul ignore start*/exports. /*istanbul ignore end*/diffSentences = _sentence.diffSentences;
//    /*istanbul ignore start*/exports. /*istanbul ignore end*/diffCss = _css.diffCss;
//    /*istanbul ignore start*/exports. /*istanbul ignore end*/diffJson = _json.diffJson;
//    /*istanbul ignore start*/exports. /*istanbul ignore end*/diffArrays = _array.diffArrays;
//    /*istanbul ignore start*/exports. /*istanbul ignore end*/structuredPatch = _create.structuredPatch;
//    /*istanbul ignore start*/exports. /*istanbul ignore end*/createTwoFilesPatch = _create.createTwoFilesPatch;
//    /*istanbul ignore start*/exports. /*istanbul ignore end*/createPatch = _create.createPatch;
//    /*istanbul ignore start*/exports. /*istanbul ignore end*/applyPatch = _apply.applyPatch;
//    /*istanbul ignore start*/exports. /*istanbul ignore end*/applyPatches = _apply.applyPatches;
//    /*istanbul ignore start*/exports. /*istanbul ignore end*/parsePatch = _parse.parsePatch;
//    /*istanbul ignore start*/exports. /*istanbul ignore end*/merge = _merge.merge;
//    /*istanbul ignore start*/exports. /*istanbul ignore end*/convertChangesToDMP = _dmp.convertChangesToDMP;
//    /*istanbul ignore start*/exports. /*istanbul ignore end*/convertChangesToXML = _xml.convertChangesToXML;
//    /*istanbul ignore start*/exports. /*istanbul ignore end*/canonicalize = _json.canonicalize;
//    //# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9pbmRleC5qcyJdLCJuYW1lcyI6WyJEaWZmIiwiZGlmZkNoYXJzIiwiZGlmZldvcmRzIiwiZGlmZldvcmRzV2l0aFNwYWNlIiwiZGlmZkxpbmVzIiwiZGlmZlRyaW1tZWRMaW5lcyIsImRpZmZTZW50ZW5jZXMiLCJkaWZmQ3NzIiwiZGlmZkpzb24iLCJkaWZmQXJyYXlzIiwic3RydWN0dXJlZFBhdGNoIiwiY3JlYXRlVHdvRmlsZXNQYXRjaCIsImNyZWF0ZVBhdGNoIiwiYXBwbHlQYXRjaCIsImFwcGx5UGF0Y2hlcyIsInBhcnNlUGF0Y2giLCJtZXJnZSIsImNvbnZlcnRDaGFuZ2VzVG9ETVAiLCJjb252ZXJ0Q2hhbmdlc1RvWE1MIiwiY2Fub25pY2FsaXplIl0sIm1hcHBpbmdzIjoiOzs7Ozs7O3VCQWdCQTs7Ozt1QkFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFFQTs7QUFDQTs7QUFFQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFFQTs7QUFDQTs7OztBQWpDQTs7QUFFQTs7Ozs7Ozs7Ozs7Ozs7Z0NBa0NFQSxJO3lEQUVBQyxTO3lEQUNBQyxTO3lEQUNBQyxrQjt5REFDQUMsUzt5REFDQUMsZ0I7eURBQ0FDLGE7eURBRUFDLE87eURBQ0FDLFE7eURBRUFDLFU7eURBRUFDLGU7eURBQ0FDLG1CO3lEQUNBQyxXO3lEQUNBQyxVO3lEQUNBQyxZO3lEQUNBQyxVO3lEQUNBQyxLO3lEQUNBQyxtQjt5REFDQUMsbUI7eURBQ0FDLFkiLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBTZWUgTElDRU5TRSBmaWxlIGZvciB0ZXJtcyBvZiB1c2UgKi9cblxuLypcbiAqIFRleHQgZGlmZiBpbXBsZW1lbnRhdGlvbi5cbiAqXG4gKiBUaGlzIGxpYnJhcnkgc3VwcG9ydHMgdGhlIGZvbGxvd2luZyBBUElTOlxuICogSnNEaWZmLmRpZmZDaGFyczogQ2hhcmFjdGVyIGJ5IGNoYXJhY3RlciBkaWZmXG4gKiBKc0RpZmYuZGlmZldvcmRzOiBXb3JkIChhcyBkZWZpbmVkIGJ5IFxcYiByZWdleCkgZGlmZiB3aGljaCBpZ25vcmVzIHdoaXRlc3BhY2VcbiAqIEpzRGlmZi5kaWZmTGluZXM6IExpbmUgYmFzZWQgZGlmZlxuICpcbiAqIEpzRGlmZi5kaWZmQ3NzOiBEaWZmIHRhcmdldGVkIGF0IENTUyBjb250ZW50XG4gKlxuICogVGhlc2UgbWV0aG9kcyBhcmUgYmFzZWQgb24gdGhlIGltcGxlbWVudGF0aW9uIHByb3Bvc2VkIGluXG4gKiBcIkFuIE8oTkQpIERpZmZlcmVuY2UgQWxnb3JpdGhtIGFuZCBpdHMgVmFyaWF0aW9uc1wiIChNeWVycywgMTk4NikuXG4gKiBodHRwOi8vY2l0ZXNlZXJ4LmlzdC5wc3UuZWR1L3ZpZXdkb2Mvc3VtbWFyeT9kb2k9MTAuMS4xLjQuNjkyN1xuICovXG5pbXBvcnQgRGlmZiBmcm9tICcuL2RpZmYvYmFzZSc7XG5pbXBvcnQge2RpZmZDaGFyc30gZnJvbSAnLi9kaWZmL2NoYXJhY3Rlcic7XG5pbXBvcnQge2RpZmZXb3JkcywgZGlmZldvcmRzV2l0aFNwYWNlfSBmcm9tICcuL2RpZmYvd29yZCc7XG5pbXBvcnQge2RpZmZMaW5lcywgZGlmZlRyaW1tZWRMaW5lc30gZnJvbSAnLi9kaWZmL2xpbmUnO1xuaW1wb3J0IHtkaWZmU2VudGVuY2VzfSBmcm9tICcuL2RpZmYvc2VudGVuY2UnO1xuXG5pbXBvcnQge2RpZmZDc3N9IGZyb20gJy4vZGlmZi9jc3MnO1xuaW1wb3J0IHtkaWZmSnNvbiwgY2Fub25pY2FsaXplfSBmcm9tICcuL2RpZmYvanNvbic7XG5cbmltcG9ydCB7ZGlmZkFycmF5c30gZnJvbSAnLi9kaWZmL2FycmF5JztcblxuaW1wb3J0IHthcHBseVBhdGNoLCBhcHBseVBhdGNoZXN9IGZyb20gJy4vcGF0Y2gvYXBwbHknO1xuaW1wb3J0IHtwYXJzZVBhdGNofSBmcm9tICcuL3BhdGNoL3BhcnNlJztcbmltcG9ydCB7bWVyZ2V9IGZyb20gJy4vcGF0Y2gvbWVyZ2UnO1xuaW1wb3J0IHtzdHJ1Y3R1cmVkUGF0Y2gsIGNyZWF0ZVR3b0ZpbGVzUGF0Y2gsIGNyZWF0ZVBhdGNofSBmcm9tICcuL3BhdGNoL2NyZWF0ZSc7XG5cbmltcG9ydCB7Y29udmVydENoYW5nZXNUb0RNUH0gZnJvbSAnLi9jb252ZXJ0L2RtcCc7XG5pbXBvcnQge2NvbnZlcnRDaGFuZ2VzVG9YTUx9IGZyb20gJy4vY29udmVydC94bWwnO1xuXG5leHBvcnQge1xuICBEaWZmLFxuXG4gIGRpZmZDaGFycyxcbiAgZGlmZldvcmRzLFxuICBkaWZmV29yZHNXaXRoU3BhY2UsXG4gIGRpZmZMaW5lcyxcbiAgZGlmZlRyaW1tZWRMaW5lcyxcbiAgZGlmZlNlbnRlbmNlcyxcblxuICBkaWZmQ3NzLFxuICBkaWZmSnNvbixcblxuICBkaWZmQXJyYXlzLFxuXG4gIHN0cnVjdHVyZWRQYXRjaCxcbiAgY3JlYXRlVHdvRmlsZXNQYXRjaCxcbiAgY3JlYXRlUGF0Y2gsXG4gIGFwcGx5UGF0Y2gsXG4gIGFwcGx5UGF0Y2hlcyxcbiAgcGFyc2VQYXRjaCxcbiAgbWVyZ2UsXG4gIGNvbnZlcnRDaGFuZ2VzVG9ETVAsXG4gIGNvbnZlcnRDaGFuZ2VzVG9YTUwsXG4gIGNhbm9uaWNhbGl6ZVxufTtcbiJdfQ==
//
//
///***/ }),
///* 1 */
///***/ (function(module, exports) {
//
//    /*istanbul ignore start*/'use strict';
//
//    Object.defineProperty(exports, "__esModule", {
//      value: true
//    });
//    exports['default'] = /*istanbul ignore end*/Diff;
//    function Diff() {}
//
//    Diff.prototype = {
//      /*istanbul ignore start*/ /*istanbul ignore end*/diff: function diff(oldString, newString) {
//        /*istanbul ignore start*/var /*istanbul ignore end*/options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
//
//        var callback = options.callback;
//        if (typeof options === 'function') {
//          callback = options;
//          options = {};
//        }
//        this.options = options;
//
//        var self = this;
//
//        function done(value) {
//          if (callback) {
//            setTimeout(function () {
//              callback(undefined, value);
//            }, 0);
//            return true;
//          } else {
//            return value;
//          }
//        }
//
//        // Allow subclasses to massage the input prior to running
//        oldString = this.castInput(oldString);
//        newString = this.castInput(newString);
//
//        oldString = this.removeEmpty(this.tokenize(oldString));
//        newString = this.removeEmpty(this.tokenize(newString));
//
//        var newLen = newString.length,
//            oldLen = oldString.length;
//        var editLength = 1;
//        var maxEditLength = newLen + oldLen;
//        var bestPath = [{ newPos: -1, components: [] }];
//
//        // Seed editLength = 0, i.e. the content starts with the same values
//        var oldPos = this.extractCommon(bestPath[0], newString, oldString, 0);
//        if (bestPath[0].newPos + 1 >= newLen && oldPos + 1 >= oldLen) {
//          // Identity per the equality and tokenizer
//          return done([{ value: this.join(newString), count: newString.length }]);
//        }
//
//        // Main worker method. checks all permutations of a given edit length for acceptance.
//        function execEditLength() {
//          for (var diagonalPath = -1 * editLength; diagonalPath <= editLength; diagonalPath += 2) {
//            var basePath = /*istanbul ignore start*/void 0 /*istanbul ignore end*/;
//            var addPath = bestPath[diagonalPath - 1],
//                removePath = bestPath[diagonalPath + 1],
//                _oldPos = (removePath ? removePath.newPos : 0) - diagonalPath;
//            if (addPath) {
//              // No one else is going to attempt to use this value, clear it
//              bestPath[diagonalPath - 1] = undefined;
//            }
//
//            var canAdd = addPath && addPath.newPos + 1 < newLen,
//                canRemove = removePath && 0 <= _oldPos && _oldPos < oldLen;
//            if (!canAdd && !canRemove) {
//              // If this path is a terminal then prune
//              bestPath[diagonalPath] = undefined;
//              continue;
//            }
//
//            // Select the diagonal that we want to branch from. We select the prior
//            // path whose position in the new string is the farthest from the origin
//            // and does not pass the bounds of the diff graph
//            if (!canAdd || canRemove && addPath.newPos < removePath.newPos) {
//              basePath = clonePath(removePath);
//              self.pushComponent(basePath.components, undefined, true);
//            } else {
//              basePath = addPath; // No need to clone, we've pulled it from the list
//              basePath.newPos++;
//              self.pushComponent(basePath.components, true, undefined);
//            }
//
//            _oldPos = self.extractCommon(basePath, newString, oldString, diagonalPath);
//
//            // If we have hit the end of both strings, then we are done
//            if (basePath.newPos + 1 >= newLen && _oldPos + 1 >= oldLen) {
//              return done(buildValues(self, basePath.components, newString, oldString, self.useLongestToken));
//            } else {
//              // Otherwise track this path as a potential candidate and continue.
//              bestPath[diagonalPath] = basePath;
//            }
//          }
//
//          editLength++;
//        }
//
//        // Performs the length of edit iteration. Is a bit fugly as this has to support the
//        // sync and async mode which is never fun. Loops over execEditLength until a value
//        // is produced.
//        if (callback) {
//          (function exec() {
//            setTimeout(function () {
//              // This should not happen, but we want to be safe.
//              /* istanbul ignore next */
//              if (editLength > maxEditLength) {
//                return callback();
//              }
//
//              if (!execEditLength()) {
//                exec();
//              }
//            }, 0);
//          })();
//        } else {
//          while (editLength <= maxEditLength) {
//            var ret = execEditLength();
//            if (ret) {
//              return ret;
//            }
//          }
//        }
//      },
//      /*istanbul ignore start*/ /*istanbul ignore end*/pushComponent: function pushComponent(components, added, removed) {
//        var last = components[components.length - 1];
//        if (last && last.added === added && last.removed === removed) {
//          // We need to clone here as the component clone operation is just
//          // as shallow array clone
//          components[components.length - 1] = { count: last.count + 1, added: added, removed: removed };
//        } else {
//          components.push({ count: 1, added: added, removed: removed });
//        }
//      },
//      /*istanbul ignore start*/ /*istanbul ignore end*/extractCommon: function extractCommon(basePath, newString, oldString, diagonalPath) {
//        var newLen = newString.length,
//            oldLen = oldString.length,
//            newPos = basePath.newPos,
//            oldPos = newPos - diagonalPath,
//            commonCount = 0;
//        while (newPos + 1 < newLen && oldPos + 1 < oldLen && this.equals(newString[newPos + 1], oldString[oldPos + 1])) {
//          newPos++;
//          oldPos++;
//          commonCount++;
//        }
//
//        if (commonCount) {
//          basePath.components.push({ count: commonCount });
//        }
//
//        basePath.newPos = newPos;
//        return oldPos;
//      },
//      /*istanbul ignore start*/ /*istanbul ignore end*/equals: function equals(left, right) {
//        if (this.options.comparator) {
//          return this.options.comparator(left, right);
//        } else {
//          return left === right || this.options.ignoreCase && left.toLowerCase() === right.toLowerCase();
//        }
//      },
//      /*istanbul ignore start*/ /*istanbul ignore end*/removeEmpty: function removeEmpty(array) {
//        var ret = [];
//        for (var i = 0; i < array.length; i++) {
//          if (array[i]) {
//            ret.push(array[i]);
//          }
//        }
//        return ret;
//      },
//      /*istanbul ignore start*/ /*istanbul ignore end*/castInput: function castInput(value) {
//        return value;
//      },
//      /*istanbul ignore start*/ /*istanbul ignore end*/tokenize: function tokenize(value) {
//        return value.split('');
//      },
//      /*istanbul ignore start*/ /*istanbul ignore end*/join: function join(chars) {
//        return chars.join('');
//      }
//    };
//
//    function buildValues(diff, components, newString, oldString, useLongestToken) {
//      var componentPos = 0,
//          componentLen = components.length,
//          newPos = 0,
//          oldPos = 0;
//
//      for (; componentPos < componentLen; componentPos++) {
//        var component = components[componentPos];
//        if (!component.removed) {
//          if (!component.added && useLongestToken) {
//            var value = newString.slice(newPos, newPos + component.count);
//            value = value.map(function (value, i) {
//              var oldValue = oldString[oldPos + i];
//              return oldValue.length > value.length ? oldValue : value;
//            });
//
//            component.value = diff.join(value);
//          } else {
//            component.value = diff.join(newString.slice(newPos, newPos + component.count));
//          }
//          newPos += component.count;
//
//          // Common case
//          if (!component.added) {
//            oldPos += component.count;
//          }
//        } else {
//          component.value = diff.join(oldString.slice(oldPos, oldPos + component.count));
//          oldPos += component.count;
//
//          // Reverse add and remove so removes are output first to match common convention
//          // The diffing algorithm is tied to add then remove output and this is the simplest
//          // route to get the desired output with minimal overhead.
//          if (componentPos && components[componentPos - 1].added) {
//            var tmp = components[componentPos - 1];
//            components[componentPos - 1] = components[componentPos];
//            components[componentPos] = tmp;
//          }
//        }
//      }
//
//      // Special case handle for when one terminal is ignored (i.e. whitespace).
//      // For this case we merge the terminal into the prior string and drop the change.
//      // This is only available for string mode.
//      var lastComponent = components[componentLen - 1];
//      if (componentLen > 1 && typeof lastComponent.value === 'string' && (lastComponent.added || lastComponent.removed) && diff.equals('', lastComponent.value)) {
//        components[componentLen - 2].value += lastComponent.value;
//        components.pop();
//      }
//
//      return components;
//    }
//
//    function clonePath(path) {
//      return { newPos: path.newPos, components: path.components.slice(0) };
//    }
//    //# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9kaWZmL2Jhc2UuanMiXSwibmFtZXMiOlsiRGlmZiIsInByb3RvdHlwZSIsImRpZmYiLCJvbGRTdHJpbmciLCJuZXdTdHJpbmciLCJvcHRpb25zIiwiY2FsbGJhY2siLCJzZWxmIiwiZG9uZSIsInZhbHVlIiwic2V0VGltZW91dCIsInVuZGVmaW5lZCIsImNhc3RJbnB1dCIsInJlbW92ZUVtcHR5IiwidG9rZW5pemUiLCJuZXdMZW4iLCJsZW5ndGgiLCJvbGRMZW4iLCJlZGl0TGVuZ3RoIiwibWF4RWRpdExlbmd0aCIsImJlc3RQYXRoIiwibmV3UG9zIiwiY29tcG9uZW50cyIsIm9sZFBvcyIsImV4dHJhY3RDb21tb24iLCJqb2luIiwiY291bnQiLCJleGVjRWRpdExlbmd0aCIsImRpYWdvbmFsUGF0aCIsImJhc2VQYXRoIiwiYWRkUGF0aCIsInJlbW92ZVBhdGgiLCJjYW5BZGQiLCJjYW5SZW1vdmUiLCJjbG9uZVBhdGgiLCJwdXNoQ29tcG9uZW50IiwiYnVpbGRWYWx1ZXMiLCJ1c2VMb25nZXN0VG9rZW4iLCJleGVjIiwicmV0IiwiYWRkZWQiLCJyZW1vdmVkIiwibGFzdCIsInB1c2giLCJjb21tb25Db3VudCIsImVxdWFscyIsImxlZnQiLCJyaWdodCIsImNvbXBhcmF0b3IiLCJpZ25vcmVDYXNlIiwidG9Mb3dlckNhc2UiLCJhcnJheSIsImkiLCJzcGxpdCIsImNoYXJzIiwiY29tcG9uZW50UG9zIiwiY29tcG9uZW50TGVuIiwiY29tcG9uZW50Iiwic2xpY2UiLCJtYXAiLCJvbGRWYWx1ZSIsInRtcCIsImxhc3RDb21wb25lbnQiLCJwb3AiLCJwYXRoIl0sIm1hcHBpbmdzIjoiOzs7Ozs0Q0FBd0JBLEk7QUFBVCxTQUFTQSxJQUFULEdBQWdCLENBQUU7O0FBRWpDQSxLQUFLQyxTQUFMLEdBQWlCO0FBQUEsbURBQ2ZDLElBRGUsZ0JBQ1ZDLFNBRFUsRUFDQ0MsU0FERCxFQUMwQjtBQUFBLHdEQUFkQyxPQUFjLHVFQUFKLEVBQUk7O0FB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QixFQUF3QkEsU0FBU2tDLFVBQVUvQixLQUEzQyxDQUFWLENBQWxCO0FBQ0FILGdCQUFVa0MsVUFBVS9CLEtBQXBCOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFVBQUk2QixnQkFBZ0JqQyxXQUFXaUMsZUFBZSxDQUExQixFQUE2QmYsS0FBakQsRUFBd0Q7QUFDdEQsWUFBSXFCLE1BQU12QyxXQUFXaUMsZUFBZSxDQUExQixDQUFWO0FBQ0FqQyxtQkFBV2lDLGVBQWUsQ0FBMUIsSUFBK0JqQyxXQUFXaUMsWUFBWCxDQUEvQjtBQUNBakMsbUJBQVdpQyxZQUFYLElBQTJCTSxHQUEzQjtBQUNEO0FBQ0Y7QUFDRjs7QUFFRDtBQUNBO0FBQ0E7QUFDQSxNQUFJQyxnQkFBZ0J4QyxXQUFXa0MsZUFBZSxDQUExQixDQUFwQjtBQUNBLE1BQUlBLGVBQWUsQ0FBZixJQUNHLE9BQU9NLGNBQWNyRCxLQUFyQixLQUErQixRQURsQyxLQUVJcUQsY0FBY3RCLEtBQWQsSUFBdUJzQixjQUFjckIsT0FGekMsS0FHR3ZDLEtBQUsyQyxNQUFMLENBQVksRUFBWixFQUFnQmlCLGNBQWNyRCxLQUE5QixDQUhQLEVBRzZDO0FBQzNDYSxlQUFXa0MsZUFBZSxDQUExQixFQUE2Qi9DLEtBQTdCLElBQXNDcUQsY0FBY3JELEtBQXBEO0FBQ0FhLGVBQVd5QyxHQUFYO0FBQ0Q7O0FBRUQsU0FBT3pDLFVBQVA7QUFDRDs7QUFFRCxTQUFTWSxTQUFULENBQW1COEIsSUFBbkIsRUFBeUI7QUFDdkIsU0FBTyxFQUFFM0MsUUFBUTJDLEtBQUszQyxNQUFmLEVBQXVCQyxZQUFZMEMsS0FBSzFDLFVBQUwsQ0FBZ0JvQyxLQUFoQixDQUFzQixDQUF0QixDQUFuQyxFQUFQO0FBQ0QiLCJmaWxlIjoiYmFzZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIERpZmYoKSB7fVxuXG5EaWZmLnByb3RvdHlwZSA9IHtcbiAgZGlmZihvbGRTdHJpbmcsIG5ld1N0cmluZywgb3B0aW9ucyA9IHt9KSB7XG4gICAgbGV0IGNhbGxiYWNrID0gb3B0aW9ucy5jYWxsYmFjaztcbiAgICBpZiAodHlwZW9mIG9wdGlvbnMgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGNhbGxiYWNrID0gb3B0aW9ucztcbiAgICAgIG9wdGlvbnMgPSB7fTtcbiAgICB9XG4gICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucztcblxuICAgIGxldCBzZWxmID0gdGhpcztcblxuICAgIGZ1bmN0aW9uIGRvbmUodmFsdWUpIHtcbiAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkgeyBjYWxsYmFjayh1bmRlZmluZWQsIHZhbHVlKTsgfSwgMCk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIEFsbG93IHN1YmNsYXNzZXMgdG8gbWFzc2FnZSB0aGUgaW5wdXQgcHJpb3IgdG8gcnVubmluZ1xuICAgIG9sZFN0cmluZyA9IHRoaXMuY2FzdElucHV0KG9sZFN0cmluZyk7XG4gICAgbmV3U3RyaW5nID0gdGhpcy5jYXN0SW5wdXQobmV3U3RyaW5nKTtcblxuICAgIG9sZFN0cmluZyA9IHRoaXMucmVtb3ZlRW1wdHkodGhpcy50b2tlbml6ZShvbGRTdHJpbmcpKTtcbiAgICBuZXdTdHJpbmcgPSB0aGlzLnJlbW92ZUVtcHR5KHRoaXMudG9rZW5pemUobmV3U3RyaW5nKSk7XG5cbiAgICBsZXQgbmV3TGVuID0gbmV3U3RyaW5nLmxlbmd0aCwgb2xkTGVuID0gb2xkU3RyaW5nLmxlbmd0aDtcbiAgICBsZXQgZWRpdExlbmd0aCA9IDE7XG4gICAgbGV0IG1heEVkaXRMZW5ndGggPSBuZXdMZW4gKyBvbGRMZW47XG4gICAgbGV0IGJlc3RQYXRoID0gW3sgbmV3UG9zOiAtMSwgY29tcG9uZW50czogW10gfV07XG5cbiAgICAvLyBTZWVkIGVkaXRMZW5ndGggPSAwLCBpLmUuIHRoZSBjb250ZW50IHN0YXJ0cyB3aXRoIHRoZSBzYW1lIHZhbHVlc1xuICAgIGxldCBvbGRQb3MgPSB0aGlzLmV4dHJhY3RDb21tb24oYmVzdFBhdGhbMF0sIG5ld1N0cmluZywgb2xkU3RyaW5nLCAwKTtcbiAgICBpZiAoYmVzdFBhdGhbMF0ubmV3UG9zICsgMSA+PSBuZXdMZW4gJiYgb2xkUG9zICsgMSA+PSBvbGRMZW4pIHtcbiAgICAgIC8vIElkZW50aXR5IHBlciB0aGUgZXF1YWxpdHkgYW5kIHRva2VuaXplclxuICAgICAgcmV0dXJuIGRvbmUoW3t2YWx1ZTogdGhpcy5qb2luKG5ld1N0cmluZyksIGNvdW50OiBuZXdTdHJpbmcubGVuZ3RofV0pO1xuICAgIH1cblxuICAgIC8vIE1haW4gd29ya2VyIG1ldGhvZC4gY2hlY2tzIGFsbCBwZXJtdXRhdGlvbnMgb2YgYSBnaXZlbiBlZGl0IGxlbmd0aCBmb3IgYWNjZXB0YW5jZS5cbiAgICBmdW5jdGlvbiBleGVjRWRpdExlbmd0aCgpIHtcbiAgICAgIGZvciAobGV0IGRpYWdvbmFsUGF0aCA9IC0xICogZWRpdExlbmd0aDsgZGlhZ29uYWxQYXRoIDw9IGVkaXRMZW5ndGg7IGRpYWdvbmFsUGF0aCArPSAyKSB7XG4gICAgICAgIGxldCBiYXNlUGF0aDtcbiAgICAgICAgbGV0IGFkZFBhdGggPSBiZXN0UGF0aFtkaWFnb25hbFBhdGggLSAxXSxcbiAgICAgICAgICAgIHJlbW92ZVBhdGggPSBiZXN0UGF0aFtkaWFnb25hbFBhdGggKyAxXSxcbiAgICAgICAgICAgIG9sZFBvcyA9IChyZW1vdmVQYXRoID8gcmVtb3ZlUGF0aC5uZXdQb3MgOiAwKSAtIGRpYWdvbmFsUGF0aDtcbiAgICAgICAgaWYgKGFkZFBhdGgpIHtcbiAgICAgICAgICAvLyBObyBvbmUgZWxzZSBpcyBnb2luZyB0byBhdHRlbXB0IHRvIHVzZSB0aGlzIHZhbHVlLCBjbGVhciBpdFxuICAgICAgICAgIGJlc3RQYXRoW2RpYWdvbmFsUGF0aCAtIDFdID0gdW5kZWZpbmVkO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IGNhbkFkZCA9IGFkZFBhdGggJiYgYWRkUGF0aC5uZXdQb3MgKyAxIDwgbmV3TGVuLFxuICAgICAgICAgICAgY2FuUmVtb3ZlID0gcmVtb3ZlUGF0aCAmJiAwIDw9IG9sZFBvcyAmJiBvbGRQb3MgPCBvbGRMZW47XG4gICAgICAgIGlmICghY2FuQWRkICYmICFjYW5SZW1vdmUpIHtcbiAgICAgICAgICAvLyBJZiB0aGlzIHBhdGggaXMgYSB0ZXJtaW5hbCB0aGVuIHBydW5lXG4gICAgICAgICAgYmVzdFBhdGhbZGlhZ29uYWxQYXRoXSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFNlbGVjdCB0aGUgZGlhZ29uYWwgdGhhdCB3ZSB3YW50IHRvIGJyYW5jaCBmcm9tLiBXZSBzZWxlY3QgdGhlIHByaW9yXG4gICAgICAgIC8vIHBhdGggd2hvc2UgcG9zaXRpb24gaW4gdGhlIG5ldyBzdHJpbmcgaXMgdGhlIGZhcnRoZXN0IGZyb20gdGhlIG9yaWdpblxuICAgICAgICAvLyBhbmQgZG9lcyBub3QgcGFzcyB0aGUgYm91bmRzIG9mIHRoZSBkaWZmIGdyYXBoXG4gICAgICAgIGlmICghY2FuQWRkIHx8IChjYW5SZW1vdmUgJiYgYWRkUGF0aC5uZXdQb3MgPCByZW1vdmVQYXRoLm5ld1BvcykpIHtcbiAgICAgICAgICBiYXNlUGF0aCA9IGNsb25lUGF0aChyZW1vdmVQYXRoKTtcbiAgICAgICAgICBzZWxmLnB1c2hDb21wb25lbnQoYmFzZVBhdGguY29tcG9uZW50cywgdW5kZWZpbmVkLCB0cnVlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBiYXNlUGF0aCA9IGFkZFBhdGg7ICAgLy8gTm8gbmVlZCB0byBjbG9uZSwgd2UndmUgcHVsbGVkIGl0IGZyb20gdGhlIGxpc3RcbiAgICAgICAgICBiYXNlUGF0aC5uZXdQb3MrKztcbiAgICAgICAgICBzZWxmLnB1c2hDb21wb25lbnQoYmFzZVBhdGguY29tcG9uZW50cywgdHJ1ZSwgdW5kZWZpbmVkKTtcbiAgICAgICAgfVxuXG4gICAgICAgIG9sZFBvcyA9IHNlbGYuZXh0cmFjdENvbW1vbihiYXNlUGF0aCwgbmV3U3RyaW5nLCBvbGRTdHJpbmcsIGRpYWdvbmFsUGF0aCk7XG5cbiAgICAgICAgLy8gSWYgd2UgaGF2ZSBoaXQgdGhlIGVuZCBvZiBib3RoIHN0cmluZ3MsIHRoZW4gd2UgYXJlIGRvbmVcbiAgICAgICAgaWYgKGJhc2VQYXRoLm5ld1BvcyArIDEgPj0gbmV3TGVuICYmIG9sZFBvcyArIDEgPj0gb2xkTGVuKSB7XG4gICAgICAgICAgcmV0dXJuIGRvbmUoYnVpbGRWYWx1ZXMoc2VsZiwgYmFzZVBhdGguY29tcG9uZW50cywgbmV3U3RyaW5nLCBvbGRTdHJpbmcsIHNlbGYudXNlTG9uZ2VzdFRva2VuKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gT3RoZXJ3aXNlIHRyYWNrIHRoaXMgcGF0aCBhcyBhIHBvdGVudGlhbCBjYW5kaWRhdGUgYW5kIGNvbnRpbnVlLlxuICAgICAgICAgIGJlc3RQYXRoW2RpYWdvbmFsUGF0aF0gPSBiYXNlUGF0aDtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBlZGl0TGVuZ3RoKys7XG4gICAgfVxuXG4gICAgLy8gUGVyZm9ybXMgdGhlIGxlbmd0aCBvZiBlZGl0IGl0ZXJhdGlvbi4gSXMgYSBiaXQgZnVnbHkgYXMgdGhpcyBoYXMgdG8gc3VwcG9ydCB0aGVcbiAgICAvLyBzeW5jIGFuZCBhc3luYyBtb2RlIHdoaWNoIGlzIG5ldmVyIGZ1bi4gTG9vcHMgb3ZlciBleGVjRWRpdExlbmd0aCB1bnRpbCBhIHZhbHVlXG4gICAgLy8gaXMgcHJvZHVjZWQuXG4gICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICAoZnVuY3Rpb24gZXhlYygpIHtcbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAvLyBUaGlzIHNob3VsZCBub3QgaGFwcGVuLCBidXQgd2Ugd2FudCB0byBiZSBzYWZlLlxuICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICAgICAgaWYgKGVkaXRMZW5ndGggPiBtYXhFZGl0TGVuZ3RoKSB7XG4gICAgICAgICAgICByZXR1cm4gY2FsbGJhY2soKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoIWV4ZWNFZGl0TGVuZ3RoKCkpIHtcbiAgICAgICAgICAgIGV4ZWMoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0sIDApO1xuICAgICAgfSgpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgd2hpbGUgKGVkaXRMZW5ndGggPD0gbWF4RWRpdExlbmd0aCkge1xuICAgICAgICBsZXQgcmV0ID0gZXhlY0VkaXRMZW5ndGgoKTtcbiAgICAgICAgaWYgKHJldCkge1xuICAgICAgICAgIHJldHVybiByZXQ7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgcHVzaENvbXBvbmVudChjb21wb25lbnRzLCBhZGRlZCwgcmVtb3ZlZCkge1xuICAgIGxldCBsYXN0ID0gY29tcG9uZW50c1tjb21wb25lbnRzLmxlbmd0aCAtIDFdO1xuICAgIGlmIChsYXN0ICYmIGxhc3QuYWRkZWQgPT09IGFkZGVkICYmIGxhc3QucmVtb3ZlZCA9PT0gcmVtb3ZlZCkge1xuICAgICAgLy8gV2UgbmVlZCB0byBjbG9uZSBoZXJlIGFzIHRoZSBjb21wb25lbnQgY2xvbmUgb3BlcmF0aW9uIGlzIGp1c3RcbiAgICAgIC8vIGFzIHNoYWxsb3cgYXJyYXkgY2xvbmVcbiAgICAgIGNvbXBvbmVudHNbY29tcG9uZW50cy5sZW5ndGggLSAxXSA9IHtjb3VudDogbGFzdC5jb3VudCArIDEsIGFkZGVkOiBhZGRlZCwgcmVtb3ZlZDogcmVtb3ZlZCB9O1xuICAgIH0gZWxzZSB7XG4gICAgICBjb21wb25lbnRzLnB1c2goe2NvdW50OiAxLCBhZGRlZDogYWRkZWQsIHJlbW92ZWQ6IHJlbW92ZWQgfSk7XG4gICAgfVxuICB9LFxuICBleHRyYWN0Q29tbW9uKGJhc2VQYXRoLCBuZXdTdHJpbmcsIG9sZFN0cmluZywgZGlhZ29uYWxQYXRoKSB7XG4gICAgbGV0IG5ld0xlbiA9IG5ld1N0cmluZy5sZW5ndGgsXG4gICAgICAgIG9sZExlbiA9IG9sZFN0cmluZy5sZW5ndGgsXG4gICAgICAgIG5ld1BvcyA9IGJhc2VQYXRoLm5ld1BvcyxcbiAgICAgICAgb2xkUG9zID0gbmV3UG9zIC0gZGlhZ29uYWxQYXRoLFxuXG4gICAgICAgIGNvbW1vbkNvdW50ID0gMDtcbiAgICB3aGlsZSAobmV3UG9zICsgMSA8IG5ld0xlbiAmJiBvbGRQb3MgKyAxIDwgb2xkTGVuICYmIHRoaXMuZXF1YWxzKG5ld1N0cmluZ1tuZXdQb3MgKyAxXSwgb2xkU3RyaW5nW29sZFBvcyArIDFdKSkge1xuICAgICAgbmV3UG9zKys7XG4gICAgICBvbGRQb3MrKztcbiAgICAgIGNvbW1vbkNvdW50Kys7XG4gICAgfVxuXG4gICAgaWYgKGNvbW1vbkNvdW50KSB7XG4gICAgICBiYXNlUGF0aC5jb21wb25lbnRzLnB1c2goe2NvdW50OiBjb21tb25Db3VudH0pO1xuICAgIH1cblxuICAgIGJhc2VQYXRoLm5ld1BvcyA9IG5ld1BvcztcbiAgICByZXR1cm4gb2xkUG9zO1xuICB9LFxuXG4gIGVxdWFscyhsZWZ0LCByaWdodCkge1xuICAgIGlmICh0aGlzLm9wdGlvbnMuY29tcGFyYXRvcikge1xuICAgICAgcmV0dXJuIHRoaXMub3B0aW9ucy5jb21wYXJhdG9yKGxlZnQsIHJpZ2h0KTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGxlZnQgPT09IHJpZ2h0XG4gICAgICAgIHx8ICh0aGlzLm9wdGlvbnMuaWdub3JlQ2FzZSAmJiBsZWZ0LnRvTG93ZXJDYXNlKCkgPT09IHJpZ2h0LnRvTG93ZXJDYXNlKCkpO1xuICAgIH1cbiAgfSxcbiAgcmVtb3ZlRW1wdHkoYXJyYXkpIHtcbiAgICBsZXQgcmV0ID0gW107XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBhcnJheS5sZW5ndGg7IGkrKykge1xuICAgICAgaWYgKGFycmF5W2ldKSB7XG4gICAgICAgIHJldC5wdXNoKGFycmF5W2ldKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJldDtcbiAgfSxcbiAgY2FzdElucHV0KHZhbHVlKSB7XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9LFxuICB0b2tlbml6ZSh2YWx1ZSkge1xuICAgIHJldHVybiB2YWx1ZS5zcGxpdCgnJyk7XG4gIH0sXG4gIGpvaW4oY2hhcnMpIHtcbiAgICByZXR1cm4gY2hhcnMuam9pbignJyk7XG4gIH1cbn07XG5cbmZ1bmN0aW9uIGJ1aWxkVmFsdWVzKGRpZmYsIGNvbXBvbmVudHMsIG5ld1N0cmluZywgb2xkU3RyaW5nLCB1c2VMb25nZXN0VG9rZW4pIHtcbiAgbGV0IGNvbXBvbmVudFBvcyA9IDAsXG4gICAgICBjb21wb25lbnRMZW4gPSBjb21wb25lbnRzLmxlbmd0aCxcbiAgICAgIG5ld1BvcyA9IDAsXG4gICAgICBvbGRQb3MgPSAwO1xuXG4gIGZvciAoOyBjb21wb25lbnRQb3MgPCBjb21wb25lbnRMZW47IGNvbXBvbmVudFBvcysrKSB7XG4gICAgbGV0IGNvbXBvbmVudCA9IGNvbXBvbmVudHNbY29tcG9uZW50UG9zXTtcbiAgICBpZiAoIWNvbXBvbmVudC5yZW1vdmVkKSB7XG4gICAgICBpZiAoIWNvbXBvbmVudC5hZGRlZCAmJiB1c2VMb25nZXN0VG9rZW4pIHtcbiAgICAgICAgbGV0IHZhbHVlID0gbmV3U3RyaW5nLnNsaWNlKG5ld1BvcywgbmV3UG9zICsgY29tcG9uZW50LmNvdW50KTtcbiAgICAgICAgdmFsdWUgPSB2YWx1ZS5tYXAoZnVuY3Rpb24odmFsdWUsIGkpIHtcbiAgICAgICAgICBsZXQgb2xkVmFsdWUgPSBvbGRTdHJpbmdbb2xkUG9zICsgaV07XG4gICAgICAgICAgcmV0dXJuIG9sZFZhbHVlLmxlbmd0aCA+IHZhbHVlLmxlbmd0aCA/IG9sZFZhbHVlIDogdmFsdWU7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGNvbXBvbmVudC52YWx1ZSA9IGRpZmYuam9pbih2YWx1ZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb21wb25lbnQudmFsdWUgPSBkaWZmLmpvaW4obmV3U3RyaW5nLnNsaWNlKG5ld1BvcywgbmV3UG9zICsgY29tcG9uZW50LmNvdW50KSk7XG4gICAgICB9XG4gICAgICBuZXdQb3MgKz0gY29tcG9uZW50LmNvdW50O1xuXG4gICAgICAvLyBDb21tb24gY2FzZVxuICAgICAgaWYgKCFjb21wb25lbnQuYWRkZWQpIHtcbiAgICAgICAgb2xkUG9zICs9IGNvbXBvbmVudC5jb3VudDtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgY29tcG9uZW50LnZhbHVlID0gZGlmZi5qb2luKG9sZFN0cmluZy5zbGljZShvbGRQb3MsIG9sZFBvcyArIGNvbXBvbmVudC5jb3VudCkpO1xuICAgICAgb2xkUG9zICs9IGNvbXBvbmVudC5jb3VudDtcblxuICAgICAgLy8gUmV2ZXJzZSBhZGQgYW5kIHJlbW92ZSBzbyByZW1vdmVzIGFyZSBvdXRwdXQgZmlyc3QgdG8gbWF0Y2ggY29tbW9uIGNvbnZlbnRpb25cbiAgICAgIC8vIFRoZSBkaWZmaW5nIGFsZ29yaXRobSBpcyB0aWVkIHRvIGFkZCB0aGVuIHJlbW92ZSBvdXRwdXQgYW5kIHRoaXMgaXMgdGhlIHNpbXBsZXN0XG4gICAgICAvLyByb3V0ZSB0byBnZXQgdGhlIGRlc2lyZWQgb3V0cHV0IHdpdGggbWluaW1hbCBvdmVyaGVhZC5cbiAgICAgIGlmIChjb21wb25lbnRQb3MgJiYgY29tcG9uZW50c1tjb21wb25lbnRQb3MgLSAxXS5hZGRlZCkge1xuICAgICAgICBsZXQgdG1wID0gY29tcG9uZW50c1tjb21wb25lbnRQb3MgLSAxXTtcbiAgICAgICAgY29tcG9uZW50c1tjb21wb25lbnRQb3MgLSAxXSA9IGNvbXBvbmVudHNbY29tcG9uZW50UG9zXTtcbiAgICAgICAgY29tcG9uZW50c1tjb21wb25lbnRQb3NdID0gdG1wO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8vIFNwZWNpYWwgY2FzZSBoYW5kbGUgZm9yIHdoZW4gb25lIHRlcm1pbmFsIGlzIGlnbm9yZWQgKGkuZS4gd2hpdGVzcGFjZSkuXG4gIC8vIEZvciB0aGlzIGNhc2Ugd2UgbWVyZ2UgdGhlIHRlcm1pbmFsIGludG8gdGhlIHByaW9yIHN0cmluZyBhbmQgZHJvcCB0aGUgY2hhbmdlLlxuICAvLyBUaGlzIGlzIG9ubHkgYXZhaWxhYmxlIGZvciBzdHJpbmcgbW9kZS5cbiAgbGV0IGxhc3RDb21wb25lbnQgPSBjb21wb25lbnRzW2NvbXBvbmVudExlbiAtIDFdO1xuICBpZiAoY29tcG9uZW50TGVuID4gMVxuICAgICAgJiYgdHlwZW9mIGxhc3RDb21wb25lbnQudmFsdWUgPT09ICdzdHJpbmcnXG4gICAgICAmJiAobGFzdENvbXBvbmVudC5hZGRlZCB8fCBsYXN0Q29tcG9uZW50LnJlbW92ZWQpXG4gICAgICAmJiBkaWZmLmVxdWFscygnJywgbGFzdENvbXBvbmVudC52YWx1ZSkpIHtcbiAgICBjb21wb25lbnRzW2NvbXBvbmVudExlbiAtIDJdLnZhbHVlICs9IGxhc3RDb21wb25lbnQudmFsdWU7XG4gICAgY29tcG9uZW50cy5wb3AoKTtcbiAgfVxuXG4gIHJldHVybiBjb21wb25lbnRzO1xufVxuXG5mdW5jdGlvbiBjbG9uZVBhdGgocGF0aCkge1xuICByZXR1cm4geyBuZXdQb3M6IHBhdGgubmV3UG9zLCBjb21wb25lbnRzOiBwYXRoLmNvbXBvbmVudHMuc2xpY2UoMCkgfTtcbn1cbiJdfQ==
//
//
///***/ }),
///* 2 */
///***/ (function(module, exports, __webpack_require__) {
//
//    /*istanbul ignore start*/'use strict';
//
//    Object.defineProperty(exports, "__esModule", {
//      value: true
//    });
//    exports.characterDiff = undefined;
//    exports. /*istanbul ignore end*/diffChars = diffChars;
//
//    var /*istanbul ignore start*/_base = __webpack_require__(1) /*istanbul ignore end*/;
//
//    /*istanbul ignore start*/var _base2 = _interopRequireDefault(_base);
//
//    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }
//
//    /*istanbul ignore end*/var characterDiff = /*istanbul ignore start*/exports. /*istanbul ignore end*/characterDiff = new /*istanbul ignore start*/_base2['default'] /*istanbul ignore end*/();
//    function diffChars(oldStr, newStr, options) {
//      return characterDiff.diff(oldStr, newStr, options);
//    }
//    //# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9kaWZmL2NoYXJhY3Rlci5qcyJdLCJuYW1lcyI6WyJkaWZmQ2hhcnMiLCJjaGFyYWN0ZXJEaWZmIiwib2xkU3RyIiwibmV3U3RyIiwib3B0aW9ucyIsImRpZmYiXSwibWFwcGluZ3MiOiI7Ozs7OztnQ0FHZ0JBLFMsR0FBQUEsUzs7QUFIaEI7Ozs7Ozt1QkFFTyxJQUFNQyx5RkFBZ0Isd0VBQXRCO0FBQ0EsU0FBU0QsU0FBVCxDQUFtQkUsTUFBbkIsRUFBMkJDLE1BQTNCLEVBQW1DQyxPQUFuQyxFQUE0QztBQUFFLFNBQU9ILGNBQWNJLElBQWQsQ0FBbUJILE1BQW5CLEVBQTJCQyxNQUEzQixFQUFtQ0MsT0FBbkMsQ0FBUDtBQUFxRCIsImZpbGUiOiJjaGFyYWN0ZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgRGlmZiBmcm9tICcuL2Jhc2UnO1xuXG5leHBvcnQgY29uc3QgY2hhcmFjdGVyRGlmZiA9IG5ldyBEaWZmKCk7XG5leHBvcnQgZnVuY3Rpb24gZGlmZkNoYXJzKG9sZFN0ciwgbmV3U3RyLCBvcHRpb25zKSB7IHJldHVybiBjaGFyYWN0ZXJEaWZmLmRpZmYob2xkU3RyLCBuZXdTdHIsIG9wdGlvbnMpOyB9XG4iXX0=
//
//
///***/ }),
///* 3 */
///***/ (function(module, exports, __webpack_require__) {
//
//    /*istanbul ignore start*/'use strict';
//
//    Object.defineProperty(exports, "__esModule", {
//      value: true
//    });
//    exports.wordDiff = undefined;
//    exports. /*istanbul ignore end*/diffWords = diffWords;
//    /*istanbul ignore start*/exports. /*istanbul ignore end*/diffWordsWithSpace = diffWordsWithSpace;
//
//    var /*istanbul ignore start*/_base = __webpack_require__(1) /*istanbul ignore end*/;
//
//    /*istanbul ignore start*/var _base2 = _interopRequireDefault(_base);
//
//    /*istanbul ignore end*/var /*istanbul ignore start*/_params = __webpack_require__(4) /*istanbul ignore end*/;
//
//    /*istanbul ignore start*/function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }
//
//    /*istanbul ignore end*/ // Based on https://en.wikipedia.org/wiki/Latin_script_in_Unicode
//    //
//    // Ranges and exceptions:
//    // Latin-1 Supplement, 0080–00FF
//    //  - U+00D7  × Multiplication sign
//    //  - U+00F7  ÷ Division sign
//    // Latin Extended-A, 0100–017F
//    // Latin Extended-B, 0180–024F
//    // IPA Extensions, 0250–02AF
//    // Spacing Modifier Letters, 02B0–02FF
//    //  - U+02C7  ˇ &#711;  Caron
//    //  - U+02D8  ˘ &#728;  Breve
//    //  - U+02D9  ˙ &#729;  Dot Above
//    //  - U+02DA  ˚ &#730;  Ring Above
//    //  - U+02DB  ˛ &#731;  Ogonek
//    //  - U+02DC  ˜ &#732;  Small Tilde
//    //  - U+02DD  ˝ &#733;  Double Acute Accent
//    // Latin Extended Additional, 1E00–1EFF
//    var extendedWordChars = /^[A-Za-z\xC0-\u02C6\u02C8-\u02D7\u02DE-\u02FF\u1E00-\u1EFF]+$/;
//
//    var reWhitespace = /\S/;
//
//    var wordDiff = /*istanbul ignore start*/exports. /*istanbul ignore end*/wordDiff = new /*istanbul ignore start*/_base2['default'] /*istanbul ignore end*/();
//    wordDiff.equals = function (left, right) {
//      if (this.options.ignoreCase) {
//        left = left.toLowerCase();
//        right = right.toLowerCase();
//      }
//      return left === right || this.options.ignoreWhitespace && !reWhitespace.test(left) && !reWhitespace.test(right);
//    };
//    wordDiff.tokenize = function (value) {
//      var tokens = value.split(/(\s+|\b)/);
//
//      // Join the boundary splits that we do not consider to be boundaries. This is primarily the extended Latin character set.
//      for (var i = 0; i < tokens.length - 1; i++) {
//        // If we have an empty string in the next field and we have only word chars before and after, merge
//        if (!tokens[i + 1] && tokens[i + 2] && extendedWordChars.test(tokens[i]) && extendedWordChars.test(tokens[i + 2])) {
//          tokens[i] += tokens[i + 2];
//          tokens.splice(i + 1, 2);
//          i--;
//        }
//      }
//
//      return tokens;
//    };
//
//    function diffWords(oldStr, newStr, options) {
//      options = /*istanbul ignore start*/(0, _params.generateOptions) /*istanbul ignore end*/(options, { ignoreWhitespace: true });
//      return wordDiff.diff(oldStr, newStr, options);
//    }
//
//    function diffWordsWithSpace(oldStr, newStr, options) {
//      return wordDiff.diff(oldStr, newStr, options);
//    }
//    //# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9kaWZmL3dvcmQuanMiXSwibmFtZXMiOlsiZGlmZldvcmRzIiwiZGlmZldvcmRzV2l0aFNwYWNlIiwiZXh0ZW5kZWRXb3JkQ2hhcnMiLCJyZVdoaXRlc3BhY2UiLCJ3b3JkRGlmZiIsImVxdWFscyIsImxlZnQiLCJyaWdodCIsIm9wdGlvbnMiLCJpZ25vcmVDYXNlIiwidG9Mb3dlckNhc2UiLCJpZ25vcmVXaGl0ZXNwYWNlIiwidGVzdCIsInRva2VuaXplIiwidmFsdWUiLCJ0b2tlbnMiLCJzcGxpdCIsImkiLCJsZW5ndGgiLCJzcGxpY2UiLCJvbGRTdHIiLCJuZXdTdHIiLCJkaWZmIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Z0NBbURnQkEsUyxHQUFBQSxTO3lEQUtBQyxrQixHQUFBQSxrQjs7QUF4RGhCOzs7O3VCQUNBOzs7O3dCQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQU1DLG9CQUFvQiwrREFBMUI7O0FBRUEsSUFBTUMsZUFBZSxJQUFyQjs7QUFFTyxJQUFNQywrRUFBVyx3RUFBakI7QUFDUEEsU0FBU0MsTUFBVCxHQUFrQixVQUFTQyxJQUFULEVBQWVDLEtBQWYsRUFBc0I7QUFDdEMsTUFBSSxLQUFLQyxPQUFMLENBQWFDLFVBQWpCLEVBQTZCO0FBQzNCSCxXQUFPQSxLQUFLSSxXQUFMLEVBQVA7QUFDQUgsWUFBUUEsTUFBTUcsV0FBTixFQUFSO0FBQ0Q7QUFDRCxTQUFPSixTQUFTQyxLQUFULElBQW1CLEtBQUtDLE9BQUwsQ0FBYUcsZ0JBQWIsSUFBaUMsQ0FBQ1IsYUFBYVMsSUFBYixDQUFrQk4sSUFBbEIsQ0FBbEMsSUFBNkQsQ0FBQ0gsYUFBYVMsSUFBYixDQUFrQkwsS0FBbEIsQ0FBeEY7QUFDRCxDQU5EO0FBT0FILFNBQVNTLFFBQVQsR0FBb0IsVUFBU0MsS0FBVCxFQUFnQjtBQUNsQyxNQUFJQyxTQUFTRCxNQUFNRSxLQUFOLENBQVksVUFBWixDQUFiOztBQUVBO0FBQ0EsT0FBSyxJQUFJQyxJQUFJLENBQWIsRUFBZ0JBLElBQUlGLE9BQU9HLE1BQVAsR0FBZ0IsQ0FBcEMsRUFBdUNELEdBQXZDLEVBQTRDO0FBQzFDO0FBQ0EsUUFBSSxDQUFDRixPQUFPRSxJQUFJLENBQVgsQ0FBRCxJQUFrQkYsT0FBT0UsSUFBSSxDQUFYLENBQWxCLElBQ0tmLGtCQUFrQlUsSUFBbEIsQ0FBdUJHLE9BQU9FLENBQVAsQ0FBdkIsQ0FETCxJQUVLZixrQkFBa0JVLElBQWxCLENBQXVCRyxPQUFPRSxJQUFJLENBQVgsQ0FBdkIsQ0FGVCxFQUVnRDtBQUM5Q0YsYUFBT0UsQ0FBUCxLQUFhRixPQUFPRSxJQUFJLENBQVgsQ0FBYjtBQUNBRixhQUFPSSxNQUFQLENBQWNGLElBQUksQ0FBbEIsRUFBcUIsQ0FBckI7QUFDQUE7QUFDRDtBQUNGOztBQUVELFNBQU9GLE1BQVA7QUFDRCxDQWhCRDs7QUFrQk8sU0FBU2YsU0FBVCxDQUFtQm9CLE1BQW5CLEVBQTJCQyxNQUEzQixFQUFtQ2IsT0FBbkMsRUFBNEM7QUFDakRBLFlBQVUsOEVBQWdCQSxPQUFoQixFQUF5QixFQUFDRyxrQkFBa0IsSUFBbkIsRUFBekIsQ0FBVjtBQUNBLFNBQU9QLFNBQVNrQixJQUFULENBQWNGLE1BQWQsRUFBc0JDLE1BQXRCLEVBQThCYixPQUE5QixDQUFQO0FBQ0Q7O0FBRU0sU0FBU1Asa0JBQVQsQ0FBNEJtQixNQUE1QixFQUFvQ0MsTUFBcEMsRUFBNENiLE9BQTVDLEVBQXFEO0FBQzFELFNBQU9KLFNBQVNrQixJQUFULENBQWNGLE1BQWQsRUFBc0JDLE1BQXRCLEVBQThCYixPQUE5QixDQUFQO0FBQ0QiLCJmaWxlIjoid29yZC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBEaWZmIGZyb20gJy4vYmFzZSc7XG5pbXBvcnQge2dlbmVyYXRlT3B0aW9uc30gZnJvbSAnLi4vdXRpbC9wYXJhbXMnO1xuXG4vLyBCYXNlZCBvbiBodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9MYXRpbl9zY3JpcHRfaW5fVW5pY29kZVxuLy9cbi8vIFJhbmdlcyBhbmQgZXhjZXB0aW9uczpcbi8vIExhdGluLTEgU3VwcGxlbWVudCwgMDA4MOKAkzAwRkZcbi8vICAtIFUrMDBENyAgw5cgTXVsdGlwbGljYXRpb24gc2lnblxuLy8gIC0gVSswMEY3ICDDtyBEaXZpc2lvbiBzaWduXG4vLyBMYXRpbiBFeHRlbmRlZC1BLCAwMTAw4oCTMDE3RlxuLy8gTGF0aW4gRXh0ZW5kZWQtQiwgMDE4MOKAkzAyNEZcbi8vIElQQSBFeHRlbnNpb25zLCAwMjUw4oCTMDJBRlxuLy8gU3BhY2luZyBNb2RpZmllciBMZXR0ZXJzLCAwMkIw4oCTMDJGRlxuLy8gIC0gVSswMkM3ICDLhyAmIzcxMTsgIENhcm9uXG4vLyAgLSBVKzAyRDggIMuYICYjNzI4OyAgQnJldmVcbi8vICAtIFUrMDJEOSAgy5kgJiM3Mjk7ICBEb3QgQWJvdmVcbi8vICAtIFUrMDJEQSAgy5ogJiM3MzA7ICBSaW5nIEFib3ZlXG4vLyAgLSBVKzAyREIgIMubICYjNzMxOyAgT2dvbmVrXG4vLyAgLSBVKzAyREMgIMucICYjNzMyOyAgU21hbGwgVGlsZGVcbi8vICAtIFUrMDJERCAgy50gJiM3MzM7ICBEb3VibGUgQWN1dGUgQWNjZW50XG4vLyBMYXRpbiBFeHRlbmRlZCBBZGRpdGlvbmFsLCAxRTAw4oCTMUVGRlxuY29uc3QgZXh0ZW5kZWRXb3JkQ2hhcnMgPSAvXlthLXpBLVpcXHV7QzB9LVxcdXtGRn1cXHV7RDh9LVxcdXtGNn1cXHV7Rjh9LVxcdXsyQzZ9XFx1ezJDOH0tXFx1ezJEN31cXHV7MkRFfS1cXHV7MkZGfVxcdXsxRTAwfS1cXHV7MUVGRn1dKyQvdTtcblxuY29uc3QgcmVXaGl0ZXNwYWNlID0gL1xcUy87XG5cbmV4cG9ydCBjb25zdCB3b3JkRGlmZiA9IG5ldyBEaWZmKCk7XG53b3JkRGlmZi5lcXVhbHMgPSBmdW5jdGlvbihsZWZ0LCByaWdodCkge1xuICBpZiAodGhpcy5vcHRpb25zLmlnbm9yZUNhc2UpIHtcbiAgICBsZWZ0ID0gbGVmdC50b0xvd2VyQ2FzZSgpO1xuICAgIHJpZ2h0ID0gcmlnaHQudG9Mb3dlckNhc2UoKTtcbiAgfVxuICByZXR1cm4gbGVmdCA9PT0gcmlnaHQgfHwgKHRoaXMub3B0aW9ucy5pZ25vcmVXaGl0ZXNwYWNlICYmICFyZVdoaXRlc3BhY2UudGVzdChsZWZ0KSAmJiAhcmVXaGl0ZXNwYWNlLnRlc3QocmlnaHQpKTtcbn07XG53b3JkRGlmZi50b2tlbml6ZSA9IGZ1bmN0aW9uKHZhbHVlKSB7XG4gIGxldCB0b2tlbnMgPSB2YWx1ZS5zcGxpdCgvKFxccyt8XFxiKS8pO1xuXG4gIC8vIEpvaW4gdGhlIGJvdW5kYXJ5IHNwbGl0cyB0aGF0IHdlIGRvIG5vdCBjb25zaWRlciB0byBiZSBib3VuZGFyaWVzLiBUaGlzIGlzIHByaW1hcmlseSB0aGUgZXh0ZW5kZWQgTGF0aW4gY2hhcmFjdGVyIHNldC5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCB0b2tlbnMubGVuZ3RoIC0gMTsgaSsrKSB7XG4gICAgLy8gSWYgd2UgaGF2ZSBhbiBlbXB0eSBzdHJpbmcgaW4gdGhlIG5leHQgZmllbGQgYW5kIHdlIGhhdmUgb25seSB3b3JkIGNoYXJzIGJlZm9yZSBhbmQgYWZ0ZXIsIG1lcmdlXG4gICAgaWYgKCF0b2tlbnNbaSArIDFdICYmIHRva2Vuc1tpICsgMl1cbiAgICAgICAgICAmJiBleHRlbmRlZFdvcmRDaGFycy50ZXN0KHRva2Vuc1tpXSlcbiAgICAgICAgICAmJiBleHRlbmRlZFdvcmRDaGFycy50ZXN0KHRva2Vuc1tpICsgMl0pKSB7XG4gICAgICB0b2tlbnNbaV0gKz0gdG9rZW5zW2kgKyAyXTtcbiAgICAgIHRva2Vucy5zcGxpY2UoaSArIDEsIDIpO1xuICAgICAgaS0tO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0b2tlbnM7XG59O1xuXG5leHBvcnQgZnVuY3Rpb24gZGlmZldvcmRzKG9sZFN0ciwgbmV3U3RyLCBvcHRpb25zKSB7XG4gIG9wdGlvbnMgPSBnZW5lcmF0ZU9wdGlvbnMob3B0aW9ucywge2lnbm9yZVdoaXRlc3BhY2U6IHRydWV9KTtcbiAgcmV0dXJuIHdvcmREaWZmLmRpZmYob2xkU3RyLCBuZXdTdHIsIG9wdGlvbnMpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZGlmZldvcmRzV2l0aFNwYWNlKG9sZFN0ciwgbmV3U3RyLCBvcHRpb25zKSB7XG4gIHJldHVybiB3b3JkRGlmZi5kaWZmKG9sZFN0ciwgbmV3U3RyLCBvcHRpb25zKTtcbn1cbiJdfQ==
//
//
///***/ }),
///* 4 */
///***/ (function(module, exports) {
//
//    /*istanbul ignore start*/'use strict';
//
//    Object.defineProperty(exports, "__esModule", {
//      value: true
//    });
//    exports. /*istanbul ignore end*/generateOptions = generateOptions;
//    function generateOptions(options, defaults) {
//      if (typeof options === 'function') {
//        defaults.callback = options;
//      } else if (options) {
//        for (var name in options) {
//          /* istanbul ignore else */
//          if (options.hasOwnProperty(name)) {
//            defaults[name] = options[name];
//          }
//        }
//      }
//      return defaults;
//    }
//    //# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlsL3BhcmFtcy5qcyJdLCJuYW1lcyI6WyJnZW5lcmF0ZU9wdGlvbnMiLCJvcHRpb25zIiwiZGVmYXVsdHMiLCJjYWxsYmFjayIsIm5hbWUiLCJoYXNPd25Qcm9wZXJ0eSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Z0NBQWdCQSxlLEdBQUFBLGU7QUFBVCxTQUFTQSxlQUFULENBQXlCQyxPQUF6QixFQUFrQ0MsUUFBbEMsRUFBNEM7QUFDakQsTUFBSSxPQUFPRCxPQUFQLEtBQW1CLFVBQXZCLEVBQW1DO0FBQ2pDQyxhQUFTQyxRQUFULEdBQW9CRixPQUFwQjtBQUNELEdBRkQsTUFFTyxJQUFJQSxPQUFKLEVBQWE7QUFDbEIsU0FBSyxJQUFJRyxJQUFULElBQWlCSCxPQUFqQixFQUEwQjtBQUN4QjtBQUNBLFVBQUlBLFFBQVFJLGNBQVIsQ0FBdUJELElBQXZCLENBQUosRUFBa0M7QUFDaENGLGlCQUFTRSxJQUFULElBQWlCSCxRQUFRRyxJQUFSLENBQWpCO0FBQ0Q7QUFDRjtBQUNGO0FBQ0QsU0FBT0YsUUFBUDtBQUNEIiwiZmlsZSI6InBhcmFtcy5qcyIsInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBmdW5jdGlvbiBnZW5lcmF0ZU9wdGlvbnMob3B0aW9ucywgZGVmYXVsdHMpIHtcbiAgaWYgKHR5cGVvZiBvcHRpb25zID09PSAnZnVuY3Rpb24nKSB7XG4gICAgZGVmYXVsdHMuY2FsbGJhY2sgPSBvcHRpb25zO1xuICB9IGVsc2UgaWYgKG9wdGlvbnMpIHtcbiAgICBmb3IgKGxldCBuYW1lIGluIG9wdGlvbnMpIHtcbiAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBlbHNlICovXG4gICAgICBpZiAob3B0aW9ucy5oYXNPd25Qcm9wZXJ0eShuYW1lKSkge1xuICAgICAgICBkZWZhdWx0c1tuYW1lXSA9IG9wdGlvbnNbbmFtZV07XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiBkZWZhdWx0cztcbn1cbiJdfQ==
//
//
///***/ }),
///* 5 */
///***/ (function(module, exports, __webpack_require__) {
//
//    /*istanbul ignore start*/'use strict';
//
//    Object.defineProperty(exports, "__esModule", {
//      value: true
//    });
//    exports.lineDiff = undefined;
//    exports. /*istanbul ignore end*/diffLines = diffLines;
//    /*istanbul ignore start*/exports. /*istanbul ignore end*/diffTrimmedLines = diffTrimmedLines;
//
//    var /*istanbul ignore start*/_base = __webpack_require__(1) /*istanbul ignore end*/;
//
//    /*istanbul ignore start*/var _base2 = _interopRequireDefault(_base);
//
//    /*istanbul ignore end*/var /*istanbul ignore start*/_params = __webpack_require__(4) /*istanbul ignore end*/;
//
//    /*istanbul ignore start*/function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }
//
//    /*istanbul ignore end*/var lineDiff = /*istanbul ignore start*/exports. /*istanbul ignore end*/lineDiff = new /*istanbul ignore start*/_base2['default'] /*istanbul ignore end*/();
//    lineDiff.tokenize = function (value) {
//      var retLines = [],
//          linesAndNewlines = value.split(/(\n|\r\n)/);
//
//      // Ignore the final empty token that occurs if the string ends with a new line
//      if (!linesAndNewlines[linesAndNewlines.length - 1]) {
//        linesAndNewlines.pop();
//      }
//
//      // Merge the content and line separators into single tokens
//      for (var i = 0; i < linesAndNewlines.length; i++) {
//        var line = linesAndNewlines[i];
//
//        if (i % 2 && !this.options.newlineIsToken) {
//          retLines[retLines.length - 1] += line;
//        } else {
//          if (this.options.ignoreWhitespace) {
//            line = line.trim();
//          }
//          retLines.push(line);
//        }
//      }
//
//      return retLines;
//    };
//
//    function diffLines(oldStr, newStr, callback) {
//      return lineDiff.diff(oldStr, newStr, callback);
//    }
//    function diffTrimmedLines(oldStr, newStr, callback) {
//      var options = /*istanbul ignore start*/(0, _params.generateOptions) /*istanbul ignore end*/(callback, { ignoreWhitespace: true });
//      return lineDiff.diff(oldStr, newStr, options);
//    }
//    //# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9kaWZmL2xpbmUuanMiXSwibmFtZXMiOlsiZGlmZkxpbmVzIiwiZGlmZlRyaW1tZWRMaW5lcyIsImxpbmVEaWZmIiwidG9rZW5pemUiLCJ2YWx1ZSIsInJldExpbmVzIiwibGluZXNBbmROZXdsaW5lcyIsInNwbGl0IiwibGVuZ3RoIiwicG9wIiwiaSIsImxpbmUiLCJvcHRpb25zIiwibmV3bGluZUlzVG9rZW4iLCJpZ25vcmVXaGl0ZXNwYWNlIiwidHJpbSIsInB1c2giLCJvbGRTdHIiLCJuZXdTdHIiLCJjYWxsYmFjayIsImRpZmYiXSwibWFwcGluZ3MiOiI7Ozs7OztnQ0E4QmdCQSxTLEdBQUFBLFM7eURBQ0FDLGdCLEdBQUFBLGdCOztBQS9CaEI7Ozs7dUJBQ0E7Ozs7dUJBRU8sSUFBTUMsK0VBQVcsd0VBQWpCO0FBQ1BBLFNBQVNDLFFBQVQsR0FBb0IsVUFBU0MsS0FBVCxFQUFnQjtBQUNsQyxNQUFJQyxXQUFXLEVBQWY7QUFBQSxNQUNJQyxtQkFBbUJGLE1BQU1HLEtBQU4sQ0FBWSxXQUFaLENBRHZCOztBQUdBO0FBQ0EsTUFBSSxDQUFDRCxpQkFBaUJBLGlCQUFpQkUsTUFBakIsR0FBMEIsQ0FBM0MsQ0FBTCxFQUFvRDtBQUNsREYscUJBQWlCRyxHQUFqQjtBQUNEOztBQUVEO0FBQ0EsT0FBSyxJQUFJQyxJQUFJLENBQWIsRUFBZ0JBLElBQUlKLGlCQUFpQkUsTUFBckMsRUFBNkNFLEdBQTdDLEVBQWtEO0FBQ2hELFFBQUlDLE9BQU9MLGlCQUFpQkksQ0FBakIsQ0FBWDs7QUFFQSxRQUFJQSxJQUFJLENBQUosSUFBUyxDQUFDLEtBQUtFLE9BQUwsQ0FBYUMsY0FBM0IsRUFBMkM7QUFDekNSLGVBQVNBLFNBQVNHLE1BQVQsR0FBa0IsQ0FBM0IsS0FBaUNHLElBQWpDO0FBQ0QsS0FGRCxNQUVPO0FBQ0wsVUFBSSxLQUFLQyxPQUFMLENBQWFFLGdCQUFqQixFQUFtQztBQUNqQ0gsZUFBT0EsS0FBS0ksSUFBTCxFQUFQO0FBQ0Q7QUFDRFYsZUFBU1csSUFBVCxDQUFjTCxJQUFkO0FBQ0Q7QUFDRjs7QUFFRCxTQUFPTixRQUFQO0FBQ0QsQ0F4QkQ7O0FBMEJPLFNBQVNMLFNBQVQsQ0FBbUJpQixNQUFuQixFQUEyQkMsTUFBM0IsRUFBbUNDLFFBQW5DLEVBQTZDO0FBQUUsU0FBT2pCLFNBQVNrQixJQUFULENBQWNILE1BQWQsRUFBc0JDLE1BQXRCLEVBQThCQyxRQUE5QixDQUFQO0FBQWlEO0FBQ2hHLFNBQVNsQixnQkFBVCxDQUEwQmdCLE1BQTFCLEVBQWtDQyxNQUFsQyxFQUEwQ0MsUUFBMUMsRUFBb0Q7QUFDekQsTUFBSVAsVUFBVSw4RUFBZ0JPLFFBQWhCLEVBQTBCLEVBQUNMLGtCQUFrQixJQUFuQixFQUExQixDQUFkO0FBQ0EsU0FBT1osU0FBU2tCLElBQVQsQ0FBY0gsTUFBZCxFQUFzQkMsTUFBdEIsRUFBOEJOLE9BQTlCLENBQVA7QUFDRCIsImZpbGUiOiJsaW5lLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IERpZmYgZnJvbSAnLi9iYXNlJztcbmltcG9ydCB7Z2VuZXJhdGVPcHRpb25zfSBmcm9tICcuLi91dGlsL3BhcmFtcyc7XG5cbmV4cG9ydCBjb25zdCBsaW5lRGlmZiA9IG5ldyBEaWZmKCk7XG5saW5lRGlmZi50b2tlbml6ZSA9IGZ1bmN0aW9uKHZhbHVlKSB7XG4gIGxldCByZXRMaW5lcyA9IFtdLFxuICAgICAgbGluZXNBbmROZXdsaW5lcyA9IHZhbHVlLnNwbGl0KC8oXFxufFxcclxcbikvKTtcblxuICAvLyBJZ25vcmUgdGhlIGZpbmFsIGVtcHR5IHRva2VuIHRoYXQgb2NjdXJzIGlmIHRoZSBzdHJpbmcgZW5kcyB3aXRoIGEgbmV3IGxpbmVcbiAgaWYgKCFsaW5lc0FuZE5ld2xpbmVzW2xpbmVzQW5kTmV3bGluZXMubGVuZ3RoIC0gMV0pIHtcbiAgICBsaW5lc0FuZE5ld2xpbmVzLnBvcCgpO1xuICB9XG5cbiAgLy8gTWVyZ2UgdGhlIGNvbnRlbnQgYW5kIGxpbmUgc2VwYXJhdG9ycyBpbnRvIHNpbmdsZSB0b2tlbnNcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBsaW5lc0FuZE5ld2xpbmVzLmxlbmd0aDsgaSsrKSB7XG4gICAgbGV0IGxpbmUgPSBsaW5lc0FuZE5ld2xpbmVzW2ldO1xuXG4gICAgaWYgKGkgJSAyICYmICF0aGlzLm9wdGlvbnMubmV3bGluZUlzVG9rZW4pIHtcbiAgICAgIHJldExpbmVzW3JldExpbmVzLmxlbmd0aCAtIDFdICs9IGxpbmU7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICh0aGlzLm9wdGlvbnMuaWdub3JlV2hpdGVzcGFjZSkge1xuICAgICAgICBsaW5lID0gbGluZS50cmltKCk7XG4gICAgICB9XG4gICAgICByZXRMaW5lcy5wdXNoKGxpbmUpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiByZXRMaW5lcztcbn07XG5cbmV4cG9ydCBmdW5jdGlvbiBkaWZmTGluZXMob2xkU3RyLCBuZXdTdHIsIGNhbGxiYWNrKSB7IHJldHVybiBsaW5lRGlmZi5kaWZmKG9sZFN0ciwgbmV3U3RyLCBjYWxsYmFjayk7IH1cbmV4cG9ydCBmdW5jdGlvbiBkaWZmVHJpbW1lZExpbmVzKG9sZFN0ciwgbmV3U3RyLCBjYWxsYmFjaykge1xuICBsZXQgb3B0aW9ucyA9IGdlbmVyYXRlT3B0aW9ucyhjYWxsYmFjaywge2lnbm9yZVdoaXRlc3BhY2U6IHRydWV9KTtcbiAgcmV0dXJuIGxpbmVEaWZmLmRpZmYob2xkU3RyLCBuZXdTdHIsIG9wdGlvbnMpO1xufVxuIl19
//
//
///***/ }),
///* 6 */
///***/ (function(module, exports, __webpack_require__) {
//
//    /*istanbul ignore start*/'use strict';
//
//    Object.defineProperty(exports, "__esModule", {
//      value: true
//    });
//    exports.sentenceDiff = undefined;
//    exports. /*istanbul ignore end*/diffSentences = diffSentences;
//
//    var /*istanbul ignore start*/_base = __webpack_require__(1) /*istanbul ignore end*/;
//
//    /*istanbul ignore start*/var _base2 = _interopRequireDefault(_base);
//
//    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }
//
//    /*istanbul ignore end*/var sentenceDiff = /*istanbul ignore start*/exports. /*istanbul ignore end*/sentenceDiff = new /*istanbul ignore start*/_base2['default'] /*istanbul ignore end*/();
//    sentenceDiff.tokenize = function (value) {
//      return value.split(/(\S.+?[.!?])(?=\s+|$)/);
//    };
//
//    function diffSentences(oldStr, newStr, callback) {
//      return sentenceDiff.diff(oldStr, newStr, callback);
//    }
//    //# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9kaWZmL3NlbnRlbmNlLmpzIl0sIm5hbWVzIjpbImRpZmZTZW50ZW5jZXMiLCJzZW50ZW5jZURpZmYiLCJ0b2tlbml6ZSIsInZhbHVlIiwic3BsaXQiLCJvbGRTdHIiLCJuZXdTdHIiLCJjYWxsYmFjayIsImRpZmYiXSwibWFwcGluZ3MiOiI7Ozs7OztnQ0FRZ0JBLGEsR0FBQUEsYTs7QUFSaEI7Ozs7Ozt1QkFHTyxJQUFNQyx1RkFBZSx3RUFBckI7QUFDUEEsYUFBYUMsUUFBYixHQUF3QixVQUFTQyxLQUFULEVBQWdCO0FBQ3RDLFNBQU9BLE1BQU1DLEtBQU4sQ0FBWSx1QkFBWixDQUFQO0FBQ0QsQ0FGRDs7QUFJTyxTQUFTSixhQUFULENBQXVCSyxNQUF2QixFQUErQkMsTUFBL0IsRUFBdUNDLFFBQXZDLEVBQWlEO0FBQUUsU0FBT04sYUFBYU8sSUFBYixDQUFrQkgsTUFBbEIsRUFBMEJDLE1BQTFCLEVBQWtDQyxRQUFsQyxDQUFQO0FBQXFEIiwiZmlsZSI6InNlbnRlbmNlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IERpZmYgZnJvbSAnLi9iYXNlJztcblxuXG5leHBvcnQgY29uc3Qgc2VudGVuY2VEaWZmID0gbmV3IERpZmYoKTtcbnNlbnRlbmNlRGlmZi50b2tlbml6ZSA9IGZ1bmN0aW9uKHZhbHVlKSB7XG4gIHJldHVybiB2YWx1ZS5zcGxpdCgvKFxcUy4rP1suIT9dKSg/PVxccyt8JCkvKTtcbn07XG5cbmV4cG9ydCBmdW5jdGlvbiBkaWZmU2VudGVuY2VzKG9sZFN0ciwgbmV3U3RyLCBjYWxsYmFjaykgeyByZXR1cm4gc2VudGVuY2VEaWZmLmRpZmYob2xkU3RyLCBuZXdTdHIsIGNhbGxiYWNrKTsgfVxuIl19
//
//
///***/ }),
///* 7 */
///***/ (function(module, exports, __webpack_require__) {
//
//    /*istanbul ignore start*/'use strict';
//
//    Object.defineProperty(exports, "__esModule", {
//      value: true
//    });
//    exports.cssDiff = undefined;
//    exports. /*istanbul ignore end*/diffCss = diffCss;
//
//    var /*istanbul ignore start*/_base = __webpack_require__(1) /*istanbul ignore end*/;
//
//    /*istanbul ignore start*/var _base2 = _interopRequireDefault(_base);
//
//    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }
//
//    /*istanbul ignore end*/var cssDiff = /*istanbul ignore start*/exports. /*istanbul ignore end*/cssDiff = new /*istanbul ignore start*/_base2['default'] /*istanbul ignore end*/();
//    cssDiff.tokenize = function (value) {
//      return value.split(/([{}:;,]|\s+)/);
//    };
//
//    function diffCss(oldStr, newStr, callback) {
//      return cssDiff.diff(oldStr, newStr, callback);
//    }
//    //# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9kaWZmL2Nzcy5qcyJdLCJuYW1lcyI6WyJkaWZmQ3NzIiwiY3NzRGlmZiIsInRva2VuaXplIiwidmFsdWUiLCJzcGxpdCIsIm9sZFN0ciIsIm5ld1N0ciIsImNhbGxiYWNrIiwiZGlmZiJdLCJtYXBwaW5ncyI6Ijs7Ozs7O2dDQU9nQkEsTyxHQUFBQSxPOztBQVBoQjs7Ozs7O3VCQUVPLElBQU1DLDZFQUFVLHdFQUFoQjtBQUNQQSxRQUFRQyxRQUFSLEdBQW1CLFVBQVNDLEtBQVQsRUFBZ0I7QUFDakMsU0FBT0EsTUFBTUMsS0FBTixDQUFZLGVBQVosQ0FBUDtBQUNELENBRkQ7O0FBSU8sU0FBU0osT0FBVCxDQUFpQkssTUFBakIsRUFBeUJDLE1BQXpCLEVBQWlDQyxRQUFqQyxFQUEyQztBQUFFLFNBQU9OLFFBQVFPLElBQVIsQ0FBYUgsTUFBYixFQUFxQkMsTUFBckIsRUFBNkJDLFFBQTdCLENBQVA7QUFBZ0QiLCJmaWxlIjoiY3NzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IERpZmYgZnJvbSAnLi9iYXNlJztcblxuZXhwb3J0IGNvbnN0IGNzc0RpZmYgPSBuZXcgRGlmZigpO1xuY3NzRGlmZi50b2tlbml6ZSA9IGZ1bmN0aW9uKHZhbHVlKSB7XG4gIHJldHVybiB2YWx1ZS5zcGxpdCgvKFt7fTo7LF18XFxzKykvKTtcbn07XG5cbmV4cG9ydCBmdW5jdGlvbiBkaWZmQ3NzKG9sZFN0ciwgbmV3U3RyLCBjYWxsYmFjaykgeyByZXR1cm4gY3NzRGlmZi5kaWZmKG9sZFN0ciwgbmV3U3RyLCBjYWxsYmFjayk7IH1cbiJdfQ==
//
//
///***/ }),
///* 8 */
///***/ (function(module, exports, __webpack_require__) {
//
//    /*istanbul ignore start*/'use strict';
//
//    Object.defineProperty(exports, "__esModule", {
//      value: true
//    });
//    exports.jsonDiff = undefined;
//
//    var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };
//
//    exports. /*istanbul ignore end*/diffJson = diffJson;
//    /*istanbul ignore start*/exports. /*istanbul ignore end*/canonicalize = canonicalize;
//
//    var /*istanbul ignore start*/_base = __webpack_require__(1) /*istanbul ignore end*/;
//
//    /*istanbul ignore start*/var _base2 = _interopRequireDefault(_base);
//
//    /*istanbul ignore end*/var /*istanbul ignore start*/_line = __webpack_require__(5) /*istanbul ignore end*/;
//
//    /*istanbul ignore start*/function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }
//
//    /*istanbul ignore end*/var objectPrototypeToString = Object.prototype.toString;
//
//    var jsonDiff = /*istanbul ignore start*/exports. /*istanbul ignore end*/jsonDiff = new /*istanbul ignore start*/_base2['default'] /*istanbul ignore end*/();
//    // Discriminate between two lines of pretty-printed, serialized JSON where one of them has a
//    // dangling comma and the other doesn't. Turns out including the dangling comma yields the nicest output:
//    jsonDiff.useLongestToken = true;
//
//    jsonDiff.tokenize = /*istanbul ignore start*/_line.lineDiff /*istanbul ignore end*/.tokenize;
//    jsonDiff.castInput = function (value) {
//      /*istanbul ignore start*/var /*istanbul ignore end*/undefinedReplacement = this.options.undefinedReplacement;
//
//
//      return typeof value === 'string' ? value : JSON.stringify(canonicalize(value), function (k, v) {
//        if (typeof v === 'undefined') {
//          return undefinedReplacement;
//        }
//
//        return v;
//      }, '  ');
//    };
//    jsonDiff.equals = function (left, right) {
//      return (/*istanbul ignore start*/_base2['default'] /*istanbul ignore end*/.prototype.equals.call(jsonDiff, left.replace(/,([\r\n])/g, '$1'), right.replace(/,([\r\n])/g, '$1'))
//      );
//    };
//
//    function diffJson(oldObj, newObj, options) {
//      return jsonDiff.diff(oldObj, newObj, options);
//    }
//
//    // This function handles the presence of circular references by bailing out when encountering an
//    // object that is already on the "stack" of items being processed.
//    function canonicalize(obj, stack, replacementStack) {
//      stack = stack || [];
//      replacementStack = replacementStack || [];
//
//      var i = /*istanbul ignore start*/void 0 /*istanbul ignore end*/;
//
//      for (i = 0; i < stack.length; i += 1) {
//        if (stack[i] === obj) {
//          return replacementStack[i];
//        }
//      }
//
//      var canonicalizedObj = /*istanbul ignore start*/void 0 /*istanbul ignore end*/;
//
//      if ('[object Array]' === objectPrototypeToString.call(obj)) {
//        stack.push(obj);
//        canonicalizedObj = new Array(obj.length);
//        replacementStack.push(canonicalizedObj);
//        for (i = 0; i < obj.length; i += 1) {
//          canonicalizedObj[i] = canonicalize(obj[i], stack, replacementStack);
//        }
//        stack.pop();
//        replacementStack.pop();
//        return canonicalizedObj;
//      }
//
//      if (obj && obj.toJSON) {
//        obj = obj.toJSON();
//      }
//
//      if ( /*istanbul ignore start*/(typeof /*istanbul ignore end*/obj === 'undefined' ? 'undefined' : _typeof(obj)) === 'object' && obj !== null) {
//        stack.push(obj);
//        canonicalizedObj = {};
//        replacementStack.push(canonicalizedObj);
//        var sortedKeys = [],
//            key = /*istanbul ignore start*/void 0 /*istanbul ignore end*/;
//        for (key in obj) {
//          /* istanbul ignore else */
//          if (obj.hasOwnProperty(key)) {
//            sortedKeys.push(key);
//          }
//        }
//        sortedKeys.sort();
//        for (i = 0; i < sortedKeys.length; i += 1) {
//          key = sortedKeys[i];
//          canonicalizedObj[key] = canonicalize(obj[key], stack, replacementStack);
//        }
//        stack.pop();
//        replacementStack.pop();
//      } else {
//        canonicalizedObj = obj;
//      }
//      return canonicalizedObj;
//    }
//    //# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9kaWZmL2pzb24uanMiXSwibmFtZXMiOlsiZGlmZkpzb24iLCJjYW5vbmljYWxpemUiLCJvYmplY3RQcm90b3R5cGVUb1N0cmluZyIsIk9iamVjdCIsInByb3RvdHlwZSIsInRvU3RyaW5nIiwianNvbkRpZmYiLCJ1c2VMb25nZXN0VG9rZW4iLCJ0b2tlbml6ZSIsImNhc3RJbnB1dCIsInZhbHVlIiwidW5kZWZpbmVkUmVwbGFjZW1lbnQiLCJvcHRpb25zIiwiSlNPTiIsInN0cmluZ2lmeSIsImsiLCJ2IiwiZXF1YWxzIiwibGVmdCIsInJpZ2h0IiwiY2FsbCIsInJlcGxhY2UiLCJvbGRPYmoiLCJuZXdPYmoiLCJkaWZmIiwib2JqIiwic3RhY2siLCJyZXBsYWNlbWVudFN0YWNrIiwiaSIsImxlbmd0aCIsImNhbm9uaWNhbGl6ZWRPYmoiLCJwdXNoIiwiQXJyYXkiLCJwb3AiLCJ0b0pTT04iLCJzb3J0ZWRLZXlzIiwia2V5IiwiaGFzT3duUHJvcGVydHkiLCJzb3J0Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Z0NBMkJnQkEsUSxHQUFBQSxRO3lEQUlBQyxZLEdBQUFBLFk7O0FBL0JoQjs7Ozt1QkFDQTs7Ozt1QkFFQSxJQUFNQywwQkFBMEJDLE9BQU9DLFNBQVAsQ0FBaUJDLFFBQWpEOztBQUdPLElBQU1DLCtFQUFXLHdFQUFqQjtBQUNQO0FBQ0E7QUFDQUEsU0FBU0MsZUFBVCxHQUEyQixJQUEzQjs7QUFFQUQsU0FBU0UsUUFBVCxHQUFvQixnRUFBU0EsUUFBN0I7QUFDQUYsU0FBU0csU0FBVCxHQUFxQixVQUFTQyxLQUFULEVBQWdCO0FBQUEsc0RBQzVCQyxvQkFENEIsR0FDSixLQUFLQyxPQURELENBQzVCRCxvQkFENEI7OztBQUduQyxTQUFPLE9BQU9ELEtBQVAsS0FBaUIsUUFBakIsR0FBNEJBLEtBQTVCLEdBQW9DRyxLQUFLQyxTQUFMLENBQWViLGFBQWFTLEtBQWIsQ0FBZixFQUFvQyxVQUFTSyxDQUFULEVBQVlDLENBQVosRUFB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O0FBQ0QsR0FuQkQsTUFtQk87QUFDTEgsdUJBQW1CTCxHQUFuQjtBQUNEO0FBQ0QsU0FBT0ssZ0JBQVA7QUFDRCIsImZpbGUiOiJqc29uLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IERpZmYgZnJvbSAnLi9iYXNlJztcbmltcG9ydCB7bGluZURpZmZ9IGZyb20gJy4vbGluZSc7XG5cbmNvbnN0IG9iamVjdFByb3RvdHlwZVRvU3RyaW5nID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZztcblxuXG5leHBvcnQgY29uc3QganNvbkRpZmYgPSBuZXcgRGlmZigpO1xuLy8gRGlzY3JpbWluYXRlIGJldHdlZW4gdHdvIGxpbmVzIG9mIHByZXR0eS1wcmludGVkLCBzZXJpYWxpemVkIEpTT04gd2hlcmUgb25lIG9mIHRoZW0gaGFzIGFcbi8vIGRhbmdsaW5nIGNvbW1hIGFuZCB0aGUgb3RoZXIgZG9lc24ndC4gVHVybnMgb3V0IGluY2x1ZGluZyB0aGUgZGFuZ2xpbmcgY29tbWEgeWllbGRzIHRoZSBuaWNlc3Qgb3V0cHV0OlxuanNvbkRpZmYudXNlTG9uZ2VzdFRva2VuID0gdHJ1ZTtcblxuanNvbkRpZmYudG9rZW5pemUgPSBsaW5lRGlmZi50b2tlbml6ZTtcbmpzb25EaWZmLmNhc3RJbnB1dCA9IGZ1bmN0aW9uKHZhbHVlKSB7XG4gIGNvbnN0IHt1bmRlZmluZWRSZXBsYWNlbWVudH0gPSB0aGlzLm9wdGlvbnM7XG5cbiAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycgPyB2YWx1ZSA6IEpTT04uc3RyaW5naWZ5KGNhbm9uaWNhbGl6ZSh2YWx1ZSksIGZ1bmN0aW9uKGssIHYpIHtcbiAgICBpZiAodHlwZW9mIHYgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICByZXR1cm4gdW5kZWZpbmVkUmVwbGFjZW1lbnQ7XG4gICAgfVxuXG4gICAgcmV0dXJuIHY7XG4gIH0sICcgICcpO1xufTtcbmpzb25EaWZmLmVxdWFscyA9IGZ1bmN0aW9uKGxlZnQsIHJpZ2h0KSB7XG4gIHJldHVybiBEaWZmLnByb3RvdHlwZS5lcXVhbHMuY2FsbChqc29uRGlmZiwgbGVmdC5yZXBsYWNlKC8sKFtcXHJcXG5dKS9nLCAnJDEnKSwgcmlnaHQucmVwbGFjZSgvLChbXFxyXFxuXSkvZywgJyQxJykpO1xufTtcblxuZXhwb3J0IGZ1bmN0aW9uIGRpZmZKc29uKG9sZE9iaiwgbmV3T2JqLCBvcHRpb25zKSB7IHJldHVybiBqc29uRGlmZi5kaWZmKG9sZE9iaiwgbmV3T2JqLCBvcHRpb25zKTsgfVxuXG4vLyBUaGlzIGZ1bmN0aW9uIGhhbmRsZXMgdGhlIHByZXNlbmNlIG9mIGNpcmN1bGFyIHJlZmVyZW5jZXMgYnkgYmFpbGluZyBvdXQgd2hlbiBlbmNvdW50ZXJpbmcgYW5cbi8vIG9iamVjdCB0aGF0IGlzIGFscmVhZHkgb24gdGhlIFwic3RhY2tcIiBvZiBpdGVtcyBiZWluZyBwcm9jZXNzZWQuXG5leHBvcnQgZnVuY3Rpb24gY2Fub25pY2FsaXplKG9iaiwgc3RhY2ssIHJlcGxhY2VtZW50U3RhY2spIHtcbiAgc3RhY2sgPSBzdGFjayB8fCBbXTtcbiAgcmVwbGFjZW1lbnRTdGFjayA9IHJlcGxhY2VtZW50U3RhY2sgfHwgW107XG5cbiAgbGV0IGk7XG5cbiAgZm9yIChpID0gMDsgaSA8IHN0YWNrLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgaWYgKHN0YWNrW2ldID09PSBvYmopIHtcbiAgICAgIHJldHVybiByZXBsYWNlbWVudFN0YWNrW2ldO1xuICAgIH1cbiAgfVxuXG4gIGxldCBjYW5vbmljYWxpemVkT2JqO1xuXG4gIGlmICgnW29iamVjdCBBcnJheV0nID09PSBvYmplY3RQcm90b3R5cGVUb1N0cmluZy5jYWxsKG9iaikpIHtcbiAgICBzdGFjay5wdXNoKG9iaik7XG4gICAgY2Fub25pY2FsaXplZE9iaiA9IG5ldyBBcnJheShvYmoubGVuZ3RoKTtcbiAgICByZXBsYWNlbWVudFN0YWNrLnB1c2goY2Fub25pY2FsaXplZE9iaik7XG4gICAgZm9yIChpID0gMDsgaSA8IG9iai5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgY2Fub25pY2FsaXplZE9ialtpXSA9IGNhbm9uaWNhbGl6ZShvYmpbaV0sIHN0YWNrLCByZXBsYWNlbWVudFN0YWNrKTtcbiAgICB9XG4gICAgc3RhY2sucG9wKCk7XG4gICAgcmVwbGFjZW1lbnRTdGFjay5wb3AoKTtcbiAgICByZXR1cm4gY2Fub25pY2FsaXplZE9iajtcbiAgfVxuXG4gIGlmIChvYmogJiYgb2JqLnRvSlNPTikge1xuICAgIG9iaiA9IG9iai50b0pTT04oKTtcbiAgfVxuXG4gIGlmICh0eXBlb2Ygb2JqID09PSAnb2JqZWN0JyAmJiBvYmogIT09IG51bGwpIHtcbiAgICBzdGFjay5wdXNoKG9iaik7XG4gICAgY2Fub25pY2FsaXplZE9iaiA9IHt9O1xuICAgIHJlcGxhY2VtZW50U3RhY2sucHVzaChjYW5vbmljYWxpemVkT2JqKTtcbiAgICBsZXQgc29ydGVkS2V5cyA9IFtdLFxuICAgICAgICBrZXk7XG4gICAgZm9yIChrZXkgaW4gb2JqKSB7XG4gICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgZWxzZSAqL1xuICAgICAgaWYgKG9iai5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICAgIHNvcnRlZEtleXMucHVzaChrZXkpO1xuICAgICAgfVxuICAgIH1cbiAgICBzb3J0ZWRLZXlzLnNvcnQoKTtcbiAgICBmb3IgKGkgPSAwOyBpIDwgc29ydGVkS2V5cy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAga2V5ID0gc29ydGVkS2V5c1tpXTtcbiAgICAgIGNhbm9uaWNhbGl6ZWRPYmpba2V5XSA9IGNhbm9uaWNhbGl6ZShvYmpba2V5XSwgc3RhY2ssIHJlcGxhY2VtZW50U3RhY2spO1xuICAgIH1cbiAgICBzdGFjay5wb3AoKTtcbiAgICByZXBsYWNlbWVudFN0YWNrLnBvcCgpO1xuICB9IGVsc2Uge1xuICAgIGNhbm9uaWNhbGl6ZWRPYmogPSBvYmo7XG4gIH1cbiAgcmV0dXJuIGNhbm9uaWNhbGl6ZWRPYmo7XG59XG4iXX0=
//
//
///***/ }),
///* 9 */
///***/ (function(module, exports, __webpack_require__) {
//
//    /*istanbul ignore start*/'use strict';
//
//    Object.defineProperty(exports, "__esModule", {
//      value: true
//    });
//    exports.arrayDiff = undefined;
//    exports. /*istanbul ignore end*/diffArrays = diffArrays;
//
//    var /*istanbul ignore start*/_base = __webpack_require__(1) /*istanbul ignore end*/;
//
//    /*istanbul ignore start*/var _base2 = _interopRequireDefault(_base);
//
//    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }
//
//    /*istanbul ignore end*/var arrayDiff = /*istanbul ignore start*/exports. /*istanbul ignore end*/arrayDiff = new /*istanbul ignore start*/_base2['default'] /*istanbul ignore end*/();
//    arrayDiff.tokenize = arrayDiff.join = function (value) {
//      return value.slice();
//    };
//    arrayDiff.removeEmpty = function (value) {
//      return value;
//    };
//
//    function diffArrays(oldArr, newArr, callback) {
//      return arrayDiff.diff(oldArr, newArr, callback);
//    }
//    //# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9kaWZmL2FycmF5LmpzIl0sIm5hbWVzIjpbImRpZmZBcnJheXMiLCJhcnJheURpZmYiLCJ0b2tlbml6ZSIsImpvaW4iLCJ2YWx1ZSIsInNsaWNlIiwicmVtb3ZlRW1wdHkiLCJvbGRBcnIiLCJuZXdBcnIiLCJjYWxsYmFjayIsImRpZmYiXSwibWFwcGluZ3MiOiI7Ozs7OztnQ0FVZ0JBLFUsR0FBQUEsVTs7QUFWaEI7Ozs7Ozt1QkFFTyxJQUFNQyxpRkFBWSx3RUFBbEI7QUFDUEEsVUFBVUMsUUFBVixHQUFxQkQsVUFBVUUsSUFBVixHQUFpQixVQUFTQyxLQUFULEVBQWdCO0FBQ3BELFNBQU9BLE1BQU1DLEtBQU4sRUFBUDtBQUNELENBRkQ7QUFHQUosVUFBVUssV0FBVixHQUF3QixVQUFTRixLQUFULEVBQWdCO0FBQ3RDLFNBQU9BLEtBQVA7QUFDRCxDQUZEOztBQUlPLFNBQVNKLFVBQVQsQ0FBb0JPLE1BQXBCLEVBQTRCQyxNQUE1QixFQUFvQ0MsUUFBcEMsRUFBOEM7QUFBRSxTQUFPUixVQUFVUyxJQUFWLENBQWVILE1BQWYsRUFBdUJDLE1BQXZCLEVBQStCQyxRQUEvQixDQUFQO0FBQWtEIiwiZmlsZSI6ImFycmF5LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IERpZmYgZnJvbSAnLi9iYXNlJztcblxuZXhwb3J0IGNvbnN0IGFycmF5RGlmZiA9IG5ldyBEaWZmKCk7XG5hcnJheURpZmYudG9rZW5pemUgPSBhcnJheURpZmYuam9pbiA9IGZ1bmN0aW9uKHZhbHVlKSB7XG4gIHJldHVybiB2YWx1ZS5zbGljZSgpO1xufTtcbmFycmF5RGlmZi5yZW1vdmVFbXB0eSA9IGZ1bmN0aW9uKHZhbHVlKSB7XG4gIHJldHVybiB2YWx1ZTtcbn07XG5cbmV4cG9ydCBmdW5jdGlvbiBkaWZmQXJyYXlzKG9sZEFyciwgbmV3QXJyLCBjYWxsYmFjaykgeyByZXR1cm4gYXJyYXlEaWZmLmRpZmYob2xkQXJyLCBuZXdBcnIsIGNhbGxiYWNrKTsgfVxuIl19
//
//
///***/ }),
///* 10 */
///***/ (function(module, exports, __webpack_require__) {
//
//    /*istanbul ignore start*/'use strict';
//
//    Object.defineProperty(exports, "__esModule", {
//      value: true
//    });
//    exports. /*istanbul ignore end*/applyPatch = applyPatch;
//    /*istanbul ignore start*/exports. /*istanbul ignore end*/applyPatches = applyPatches;
//
//    var /*istanbul ignore start*/_parse = __webpack_require__(11) /*istanbul ignore end*/;
//
//    var /*istanbul ignore start*/_distanceIterator = __webpack_require__(12) /*istanbul ignore end*/;
//
//    /*istanbul ignore start*/var _distanceIterator2 = _interopRequireDefault(_distanceIterator);
//
//    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }
//
//    /*istanbul ignore end*/function applyPatch(source, uniDiff) {
//      /*istanbul ignore start*/var /*istanbul ignore end*/options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
//
//      if (typeof uniDiff === 'string') {
//        uniDiff = /*istanbul ignore start*/(0, _parse.parsePatch) /*istanbul ignore end*/(uniDiff);
//      }
//
//      if (Array.isArray(uniDiff)) {
//        if (uniDiff.length > 1) {
//          throw new Error('applyPatch only works with a single input.');
//        }
//
//        uniDiff = uniDiff[0];
//      }
//
//      // Apply the diff to the input
//      var lines = source.split(/\r\n|[\n\v\f\r\x85]/),
//          delimiters = source.match(/\r\n|[\n\v\f\r\x85]/g) || [],
//          hunks = uniDiff.hunks,
//          compareLine = options.compareLine || function (lineNumber, line, operation, patchContent) /*istanbul ignore start*/{
//        return (/*istanbul ignore end*/line === patchContent
//        );
//      },
//          errorCount = 0,
//          fuzzFactor = options.fuzzFactor || 0,
//          minLine = 0,
//          offset = 0,
//          removeEOFNL = /*istanbul ignore start*/void 0 /*istanbul ignore end*/,
//          addEOFNL = /*istanbul ignore start*/void 0 /*istanbul ignore end*/;
//
//      /**
//       * Checks if the hunk exactly fits on the provided location
//       */
//      function hunkFits(hunk, toPos) {
//        for (var j = 0; j < hunk.lines.length; j++) {
//          var line = hunk.lines[j],
//              operation = line[0],
//              content = line.substr(1);
//
//          if (operation === ' ' || operation === '-') {
//            // Context sanity check
//            if (!compareLine(toPos + 1, lines[toPos], operation, content)) {
//              errorCount++;
//
//              if (errorCount > fuzzFactor) {
//                return false;
//              }
//            }
//            toPos++;
//          }
//        }
//
//        return true;
//      }
//
//      // Search best fit offsets for each hunk based on the previous ones
//      for (var i = 0; i < hunks.length; i++) {
//        var hunk = hunks[i],
//            maxLine = lines.length - hunk.oldLines,
//            localOffset = 0,
//            toPos = offset + hunk.oldStart - 1;
//
//        var iterator = /*istanbul ignore start*/(0, _distanceIterator2['default']) /*istanbul ignore end*/(toPos, minLine, maxLine);
//
//        for (; localOffset !== undefined; localOffset = iterator()) {
//          if (hunkFits(hunk, toPos + localOffset)) {
//            hunk.offset = offset += localOffset;
//            break;
//          }
//        }
//
//        if (localOffset === undefined) {
//          return false;
//        }
//
//        // Set lower text limit to end of the current hunk, so next ones don't try
//        // to fit over already patched text
//        minLine = hunk.offset + hunk.oldStart + hunk.oldLines;
//      }
//
//      // Apply patch hunks
//      var diffOffset = 0;
//      for (var _i = 0; _i < hunks.length; _i++) {
//        var _hunk = hunks[_i],
//            _toPos = _hunk.oldStart + _hunk.offset + diffOffset - 1;
//        diffOffset += _hunk.newLines - _hunk.oldLines;
//
//        if (_toPos < 0) {
//          // Creating a new file
//          _toPos = 0;
//        }
//
//        for (var j = 0; j < _hunk.lines.length; j++) {
//          var line = _hunk.lines[j],
//              operation = line[0],
//              content = line.substr(1),
//              delimiter = _hunk.linedelimiters[j];
//
//          if (operation === ' ') {
//            _toPos++;
//          } else if (operation === '-') {
//            lines.splice(_toPos, 1);
//            delimiters.splice(_toPos, 1);
//            /* istanbul ignore else */
//          } else if (operation === '+') {
//            lines.splice(_toPos, 0, content);
//            delimiters.splice(_toPos, 0, delimiter);
//            _toPos++;
//          } else if (operation === '\\') {
//            var previousOperation = _hunk.lines[j - 1] ? _hunk.lines[j - 1][0] : null;
//            if (previousOperation === '+') {
//              removeEOFNL = true;
//            } else if (previousOperation === '-') {
//              addEOFNL = true;
//            }
//          }
//        }
//      }
//
//      // Handle EOFNL insertion/removal
//      if (removeEOFNL) {
//        while (!lines[lines.length - 1]) {
//          lines.pop();
//          delimiters.pop();
//        }
//      } else if (addEOFNL) {
//        lines.push('');
//        delimiters.push('\n');
//      }
//      for (var _k = 0; _k < lines.length - 1; _k++) {
//        lines[_k] = lines[_k] + delimiters[_k];
//      }
//      return lines.join('');
//    }
//
//    // Wrapper that supports multiple file patches via callbacks.
//    function applyPatches(uniDiff, options) {
//      if (typeof uniDiff === 'string') {
//        uniDiff = /*istanbul ignore start*/(0, _parse.parsePatch) /*istanbul ignore end*/(uniDiff);
//      }
//
//      var currentIndex = 0;
//      function processIndex() {
//        var index = uniDiff[currentIndex++];
//        if (!index) {
//          return options.complete();
//        }
//
//        options.loadFile(index, function (err, data) {
//          if (err) {
//            return options.complete(err);
//          }
//
//          var updatedContent = applyPatch(data, index, options);
//          options.patched(index, updatedContent, function (err) {
//            if (err) {
//              return options.complete(err);
//            }
//
//            processIndex();
//          });
//        });
//      }
//      processIndex();
//    }
//    //# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9wYXRjaC9hcHBseS5qcyJdLCJuYW1lcyI6WyJhcHBseVBhdGNoIiwiYXBwbHlQYXRjaGVzIiwic291cmNlIiwidW5pRGlmZiIsIm9wdGlvbnMiLCJBcnJheSIsImlzQXJyYXkiLCJsZW5ndGgiLCJFcnJvciIsImxpbmVzIiwic3BsaXQiLCJkZWxpbWl0ZXJzIiwibWF0Y2giLCJodW5rcyIsImNvbXBhcmVMaW5lIiwibGluZU51bWJlciIsImxpbmUiLCJvcGVyYXRpb24iLCJwYXRjaENvbnRlbnQiLCJlcnJvckNvdW50IiwiZnV6ekZhY3RvciIsIm1pbkxpbmUiLCJvZmZzZXQiLCJyZW1vdmVFT0ZOTCIsImFkZEVPRk5MIiwiaHVua0ZpdHMiLCJodW5rIiwidG9Qb3MiLCJqIiwiY29udGVudCIsInN1YnN0ciIsImkiLCJtYXhMaW5lIiwib2xkTGluZXMiLCJsb2NhbE9mZnNldCIsIm9sZFN0YXJ0IiwiaXRlcmF0b3IiLCJ1bmRlZmluZWQiLCJkaWZmT2Zmc2V0IiwibmV3TGluZXMiLCJkZWxpbWl0ZXIiLCJsaW5lZGVsaW1pdGVycyIsInNwbGljZSIsInByZXZpb3VzT3BlcmF0aW9uIiwicG9wIiwicHVzaCIsIl9rIiwiam9pbiIsImN1cnJlbnRJbmRleCIsInByb2Nlc3NJbmRleCIsImluZGV4IiwiY29tcGxldGUiLCJsb2FkRmlsZSIsImVyciIsImRhdGEiLCJ1cGRhdGVkQ29udGVudCIsInBhdGNoZWQiXSwibWFwcGluZ3MiOiI7Ozs7O2dDQUdnQkEsVSxHQUFBQSxVO3lEQW9JQUMsWSxHQUFBQSxZOztBQXZJaEI7O0FBQ0E7Ozs7Ozt1QkFFTyxTQUFTRCxVQUFULENBQW9CRSxNQUFwQixFQUE0QkMsT0FBNUIsRUFBbUQ7QUFBQSxzREFBZEMsT0FBYyx1RUFBSixFQUFJOztBQUN4RCxNQUFJLE9BQU9ELE9BQVAsS0FBbUIsUUFBdkIsRUFBaUM7QUFDL0JBLGNBQVUsd0VBQVdBLE9BQVgsQ0FBVjtBQUNEOztBQUVELE1BQUlFLE1BQU1D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LENBQVA7QUFDRDs7QUFFRCxVQUFJRSxpQkFBaUJ2RCxXQUFXc0QsSUFBWCxFQUFpQkosS0FBakIsRUFBd0I5QyxPQUF4QixDQUFyQjtBQUNBQSxjQUFRb0QsT0FBUixDQUFnQk4sS0FBaEIsRUFBdUJLLGNBQXZCLEVBQXVDLFVBQVNGLEdBQVQsRUFBYztBQUNuRCxZQUFJQSxHQUFKLEVBQVM7QUFDUCxpQkFBT2pELFFBQVErQyxRQUFSLENBQWlCRSxHQUFqQixDQUFQO0FBQ0Q7O0FBRURKO0FBQ0QsT0FORDtBQU9ELEtBYkQ7QUFjRDtBQUNEQTtBQUNEIiwiZmlsZSI6ImFwcGx5LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtwYXJzZVBhdGNofSBmcm9tICcuL3BhcnNlJztcbmltcG9ydCBkaXN0YW5jZUl0ZXJhdG9yIGZyb20gJy4uL3V0aWwvZGlzdGFuY2UtaXRlcmF0b3InO1xuXG5leHBvcnQgZnVuY3Rpb24gYXBwbHlQYXRjaChzb3VyY2UsIHVuaURpZmYsIG9wdGlvbnMgPSB7fSkge1xuICBpZiAodHlwZW9mIHVuaURpZmYgPT09ICdzdHJpbmcnKSB7XG4gICAgdW5pRGlmZiA9IHBhcnNlUGF0Y2godW5pRGlmZik7XG4gIH1cblxuICBpZiAoQXJyYXkuaXNBcnJheSh1bmlEaWZmKSkge1xuICAgIGlmICh1bmlEaWZmLmxlbmd0aCA+IDEpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignYXBwbHlQYXRjaCBvbmx5IHdvcmtzIHdpdGggYSBzaW5nbGUgaW5wdXQuJyk7XG4gICAgfVxuXG4gICAgdW5pRGlmZiA9IHVuaURpZmZbMF07XG4gIH1cblxuICAvLyBBcHBseSB0aGUgZGlmZiB0byB0aGUgaW5wdXRcbiAgbGV0IGxpbmVzID0gc291cmNlLnNwbGl0KC9cXHJcXG58W1xcblxcdlxcZlxcclxceDg1XS8pLFxuICAgICAgZGVsaW1pdGVycyA9IHNvdXJjZS5tYXRjaCgvXFxyXFxufFtcXG5cXHZcXGZcXHJcXHg4NV0vZykgfHwgW10sXG4gICAgICBodW5rcyA9IHVuaURpZmYuaHVua3MsXG5cbiAgICAgIGNvbXBhcmVMaW5lID0gb3B0aW9ucy5jb21wYXJlTGluZSB8fCAoKGxpbmVOdW1iZXIsIGxpbmUsIG9wZXJhdGlvbiwgcGF0Y2hDb250ZW50KSA9PiBsaW5lID09PSBwYXRjaENvbnRlbnQpLFxuICAgICAgZXJyb3JDb3VudCA9IDAsXG4gICAgICBmdXp6RmFjdG9yID0gb3B0aW9ucy5mdXp6RmFjdG9yIHx8IDAsXG4gICAgICBtaW5MaW5lID0gMCxcbiAgICAgIG9mZnNldCA9IDAsXG5cbiAgICAgIHJlbW92ZUVPRk5MLFxuICAgICAgYWRkRU9GTkw7XG5cbiAgLyoqXG4gICAqIENoZWNrcyBpZiB0aGUgaHVuayBleGFjdGx5IGZpdHMgb24gdGhlIHByb3ZpZGVkIGxvY2F0aW9uXG4gICAqL1xuICBmdW5jdGlvbiBodW5rRml0cyhodW5rLCB0b1Bvcykge1xuICAgIGZvciAobGV0IGogPSAwOyBqIDwgaHVuay5saW5lcy5sZW5ndGg7IGorKykge1xuICAgICAgbGV0IGxpbmUgPSBodW5rLmxpbmVzW2pdLFxuICAgICAgICAgIG9wZXJhdGlvbiA9IGxpbmVbMF0sXG4gICAgICAgICAgY29udGVudCA9IGxpbmUuc3Vic3RyKDEpO1xuXG4gICAgICBpZiAob3BlcmF0aW9uID09PSAnICcgfHwgb3BlcmF0aW9uID09PSAnLScpIHtcbiAgICAgICAgLy8gQ29udGV4dCBzYW5pdHkgY2hlY2tcbiAgICAgICAgaWYgKCFjb21wYXJlTGluZSh0b1BvcyArIDEsIGxpbmVzW3RvUG9zXSwgb3BlcmF0aW9uLCBjb250ZW50KSkge1xuICAgICAgICAgIGVycm9yQ291bnQrKztcblxuICAgICAgICAgIGlmIChlcnJvckNvdW50ID4gZnV6ekZhY3Rvcikge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB0b1BvcysrO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgLy8gU2VhcmNoIGJlc3QgZml0IG9mZnNldHMgZm9yIGVhY2ggaHVuayBiYXNlZCBvbiB0aGUgcHJldmlvdXMgb25lc1xuICBmb3IgKGxldCBpID0gMDsgaSA8IGh1bmtzLmxlbmd0aDsgaSsrKSB7XG4gICAgbGV0IGh1bmsgPSBodW5rc1tpXSxcbiAgICAgICAgbWF4TGluZSA9IGxpbmVzLmxlbmd0aCAtIGh1bmsub2xkTGluZXMsXG4gICAgICAgIGxvY2FsT2Zmc2V0ID0gMCxcbiAgICAgICAgdG9Qb3MgPSBvZmZzZXQgKyBodW5rLm9sZFN0YXJ0IC0gMTtcblxuICAgIGxldCBpdGVyYXRvciA9IGRpc3RhbmNlSXRlcmF0b3IodG9Qb3MsIG1pbkxpbmUsIG1heExpbmUpO1xuXG4gICAgZm9yICg7IGxvY2FsT2Zmc2V0ICE9PSB1bmRlZmluZWQ7IGxvY2FsT2Zmc2V0ID0gaXRlcmF0b3IoKSkge1xuICAgICAgaWYgKGh1bmtGaXRzKGh1bmssIHRvUG9zICsgbG9jYWxPZmZzZXQpKSB7XG4gICAgICAgIGh1bmsub2Zmc2V0ID0gb2Zmc2V0ICs9IGxvY2FsT2Zmc2V0O1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAobG9jYWxPZmZzZXQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIC8vIFNldCBsb3dlciB0ZXh0IGxpbWl0IHRvIGVuZCBvZiB0aGUgY3VycmVudCBodW5rLCBzbyBuZXh0IG9uZXMgZG9uJ3QgdHJ5XG4gICAgLy8gdG8gZml0IG92ZXIgYWxyZWFkeSBwYXRjaGVkIHRleHRcbiAgICBtaW5MaW5lID0gaHVuay5vZmZzZXQgKyBodW5rLm9sZFN0YXJ0ICsgaHVuay5vbGRMaW5lcztcbiAgfVxuXG4gIC8vIEFwcGx5IHBhdGNoIGh1bmtzXG4gIGxldCBkaWZmT2Zmc2V0ID0gMDtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBodW5rcy5sZW5ndGg7IGkrKykge1xuICAgIGxldCBodW5rID0gaHVua3NbaV0sXG4gICAgICAgIHRvUG9zID0gaHVuay5vbGRTdGFydCArIGh1bmsub2Zmc2V0ICsgZGlmZk9mZnNldCAtIDE7XG4gICAgZGlmZk9mZnNldCArPSBodW5rLm5ld0xpbmVzIC0gaHVuay5vbGRMaW5lcztcblxuICAgIGlmICh0b1BvcyA8IDApIHsgLy8gQ3JlYXRpbmcgYSBuZXcgZmlsZVxuICAgICAgdG9Qb3MgPSAwO1xuICAgIH1cblxuICAgIGZvciAobGV0IGogPSAwOyBqIDwgaHVuay5saW5lcy5sZW5ndGg7IGorKykge1xuICAgICAgbGV0IGxpbmUgPSBodW5rLmxpbmVzW2pdLFxuICAgICAgICAgIG9wZXJhdGlvbiA9IGxpbmVbMF0sXG4gICAgICAgICAgY29udGVudCA9IGxpbmUuc3Vic3RyKDEpLFxuICAgICAgICAgIGRlbGltaXRlciA9IGh1bmsubGluZWRlbGltaXRlcnNbal07XG5cbiAgICAgIGlmIChvcGVyYXRpb24gPT09ICcgJykge1xuICAgICAgICB0b1BvcysrO1xuICAgICAgfSBlbHNlIGlmIChvcGVyYXRpb24gPT09ICctJykge1xuICAgICAgICBsaW5lcy5zcGxpY2UodG9Qb3MsIDEpO1xuICAgICAgICBkZWxpbWl0ZXJzLnNwbGljZSh0b1BvcywgMSk7XG4gICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgZWxzZSAqL1xuICAgICAgfSBlbHNlIGlmIChvcGVyYXRpb24gPT09ICcrJykge1xuICAgICAgICBsaW5lcy5zcGxpY2UodG9Qb3MsIDAsIGNvbnRlbnQpO1xuICAgICAgICBkZWxpbWl0ZXJzLnNwbGljZSh0b1BvcywgMCwgZGVsaW1pdGVyKTtcbiAgICAgICAgdG9Qb3MrKztcbiAgICAgIH0gZWxzZSBpZiAob3BlcmF0aW9uID09PSAnXFxcXCcpIHtcbiAgICAgICAgbGV0IHByZXZpb3VzT3BlcmF0aW9uID0gaHVuay5saW5lc1tqIC0gMV0gPyBodW5rLmxpbmVzW2ogLSAxXVswXSA6IG51bGw7XG4gICAgICAgIGlmIChwcmV2aW91c09wZXJhdGlvbiA9PT0gJysnKSB7XG4gICAgICAgICAgcmVtb3ZlRU9GTkwgPSB0cnVlO1xuICAgICAgICB9IGVsc2UgaWYgKHByZXZpb3VzT3BlcmF0aW9uID09PSAnLScpIHtcbiAgICAgICAgICBhZGRFT0ZOTCA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvLyBIYW5kbGUgRU9GTkwgaW5zZXJ0aW9uL3JlbW92YWxcbiAgaWYgKHJlbW92ZUVPRk5MKSB7XG4gICAgd2hpbGUgKCFsaW5lc1tsaW5lcy5sZW5ndGggLSAxXSkge1xuICAgICAgbGluZXMucG9wKCk7XG4gICAgICBkZWxpbWl0ZXJzLnBvcCgpO1xuICAgIH1cbiAgfSBlbHNlIGlmIChhZGRFT0ZOTCkge1xuICAgIGxpbmVzLnB1c2goJycpO1xuICAgIGRlbGltaXRlcnMucHVzaCgnXFxuJyk7XG4gIH1cbiAgZm9yIChsZXQgX2sgPSAwOyBfayA8IGxpbmVzLmxlbmd0aCAtIDE7IF9rKyspIHtcbiAgICBsaW5lc1tfa10gPSBsaW5lc1tfa10gKyBkZWxpbWl0ZXJzW19rXTtcbiAgfVxuICByZXR1cm4gbGluZXMuam9pbignJyk7XG59XG5cbi8vIFdyYXBwZXIgdGhhdCBzdXBwb3J0cyBtdWx0aXBsZSBmaWxlIHBhdGNoZXMgdmlhIGNhbGxiYWNrcy5cbmV4cG9ydCBmdW5jdGlvbiBhcHBseVBhdGNoZXModW5pRGlmZiwgb3B0aW9ucykge1xuICBpZiAodHlwZW9mIHVuaURpZmYgPT09ICdzdHJpbmcnKSB7XG4gICAgdW5pRGlmZiA9IHBhcnNlUGF0Y2godW5pRGlmZik7XG4gIH1cblxuICBsZXQgY3VycmVudEluZGV4ID0gMDtcbiAgZnVuY3Rpb24gcHJvY2Vzc0luZGV4KCkge1xuICAgIGxldCBpbmRleCA9IHVuaURpZmZbY3VycmVudEluZGV4KytdO1xuICAgIGlmICghaW5kZXgpIHtcbiAgICAgIHJldHVybiBvcHRpb25zLmNvbXBsZXRlKCk7XG4gICAgfVxuXG4gICAgb3B0aW9ucy5sb2FkRmlsZShpbmRleCwgZnVuY3Rpb24oZXJyLCBkYXRhKSB7XG4gICAgICBpZiAoZXJyKSB7XG4gICAgICAgIHJldHVybiBvcHRpb25zLmNvbXBsZXRlKGVycik7XG4gICAgICB9XG5cbiAgICAgIGxldCB1cGRhdGVkQ29udGVudCA9IGFwcGx5UGF0Y2goZGF0YSwgaW5kZXgsIG9wdGlvbnMpO1xuICAgICAgb3B0aW9ucy5wYXRjaGVkKGluZGV4LCB1cGRhdGVkQ29udGVudCwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICByZXR1cm4gb3B0aW9ucy5jb21wbGV0ZShlcnIpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJvY2Vzc0luZGV4KCk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuICBwcm9jZXNzSW5kZXgoKTtcbn1cbiJdfQ==
//
//
///***/ }),
///* 11 */
///***/ (function(module, exports) {
//
//    /*istanbul ignore start*/'use strict';
//
//    Object.defineProperty(exports, "__esModule", {
//      value: true
//    });
//    exports. /*istanbul ignore end*/parsePatch = parsePatch;
//    function parsePatch(uniDiff) {
//      /*istanbul ignore start*/var /*istanbul ignore end*/options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
//
//      var diffstr = uniDiff.split(/\r\n|[\n\v\f\r\x85]/),
//          delimiters = uniDiff.match(/\r\n|[\n\v\f\r\x85]/g) || [],
//          list = [],
//          i = 0;
//
//      function parseIndex() {
//        var index = {};
//        list.push(index);
//
//        // Parse diff metadata
//        while (i < diffstr.length) {
//          var line = diffstr[i];
//
//          // File header found, end parsing diff metadata
//          if (/^(\-\-\-|\+\+\+|@@)\s/.test(line)) {
//            break;
//          }
//
//          // Diff index
//          var header = /^(?:Index:|diff(?: -r \w+)+)\s+(.+?)\s*$/.exec(line);
//          if (header) {
//            index.index = header[1];
//          }
//
//          i++;
//        }
//
//        // Parse file headers if they are defined. Unified diff requires them, but
//        // there's no technical issues to have an isolated hunk without file header
//        parseFileHeader(index);
//        parseFileHeader(index);
//
//        // Parse hunks
//        index.hunks = [];
//
//        while (i < diffstr.length) {
//          var _line = diffstr[i];
//
//          if (/^(Index:|diff|\-\-\-|\+\+\+)\s/.test(_line)) {
//            break;
//          } else if (/^@@/.test(_line)) {
//            index.hunks.push(parseHunk());
//          } else if (_line && options.strict) {
//            // Ignore unexpected content unless in strict mode
//            throw new Error('Unknown line ' + (i + 1) + ' ' + JSON.stringify(_line));
//          } else {
//            i++;
//          }
//        }
//      }
//
//      // Parses the --- and +++ headers, if none are found, no lines
//      // are consumed.
//      function parseFileHeader(index) {
//        var headerPattern = /^(---|\+\+\+)\s+([\S ]*)(?:\t(.*?)\s*)?$/;
//        var fileHeader = headerPattern.exec(diffstr[i]);
//        if (fileHeader) {
//          var keyPrefix = fileHeader[1] === '---' ? 'old' : 'new';
//          var fileName = fileHeader[2].replace(/\\\\/g, '\\');
//          if (/^".*"$/.test(fileName)) {
//            fileName = fileName.substr(1, fileName.length - 2);
//          }
//          index[keyPrefix + 'FileName'] = fileName;
//          index[keyPrefix + 'Header'] = fileHeader[3];
//
//          i++;
//        }
//      }
//
//      // Parses a hunk
//      // This assumes that we are at the start of a hunk.
//      function parseHunk() {
//        var chunkHeaderIndex = i,
//            chunkHeaderLine = diffstr[i++],
//            chunkHeader = chunkHeaderLine.split(/@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@/);
//
//        var hunk = {
//          oldStart: +chunkHeader[1],
//          oldLines: +chunkHeader[2] || 1,
//          newStart: +chunkHeader[3],
//          newLines: +chunkHeader[4] || 1,
//          lines: [],
//          linedelimiters: []
//        };
//
//        var addCount = 0,
//            removeCount = 0;
//        for (; i < diffstr.length; i++) {
//          // Lines starting with '---' could be mistaken for the "remove line" operation
//          // But they could be the header for the next file. Therefore prune such cases out.
//          if (diffstr[i].indexOf('--- ') === 0 && i + 2 < diffstr.length && diffstr[i + 1].indexOf('+++ ') === 0 && diffstr[i + 2].indexOf('@@') === 0) {
//            break;
//          }
//          var operation = diffstr[i][0];
//
//          if (operation === '+' || operation === '-' || operation === ' ' || operation === '\\') {
//            hunk.lines.push(diffstr[i]);
//            hunk.linedelimiters.push(delimiters[i] || '\n');
//
//            if (operation === '+') {
//              addCount++;
//            } else if (operation === '-') {
//              removeCount++;
//            } else if (operation === ' ') {
//              addCount++;
//              removeCount++;
//            }
//          } else {
//            break;
//          }
//        }
//
//        // Handle the empty block count case
//        if (!addCount && hunk.newLines === 1) {
//          hunk.newLines = 0;
//        }
//        if (!removeCount && hunk.oldLines === 1) {
//          hunk.oldLines = 0;
//        }
//
//        // Perform optional sanity checking
//        if (options.strict) {
//          if (addCount !== hunk.newLines) {
//            throw new Error('Added line count did not match for hunk at line ' + (chunkHeaderIndex + 1));
//          }
//          if (removeCount !== hunk.oldLines) {
//            throw new Error('Removed line count did not match for hunk at line ' + (chunkHeaderIndex + 1));
//          }
//        }
//
//        return hunk;
//      }
//
//      while (i < diffstr.length) {
//        parseIndex();
//      }
//
//      return list;
//    }
//    //# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9wYXRjaC9wYXJzZS5qcyJdLCJuYW1lcyI6WyJwYXJzZVBhdGNoIiwidW5pRGlmZiIsIm9wdGlvbnMiLCJkaWZmc3RyIiwic3BsaXQiLCJkZWxpbWl0ZXJzIiwibWF0Y2giLCJsaXN0IiwiaSIsInBhcnNlSW5kZXgiLCJpbmRleCIsInB1c2giLCJsZW5ndGgiLCJsaW5lIiwidGVzdCIsImhlYWRlciIsImV4ZWMiLCJwYXJzZUZpbGVIZWFkZXIiLCJodW5rcyIsInBhcnNlSHVuayIsInN0cmljdCIsIkVycm9yIiwiSlNPTiIsInN0cmluZ2lmeSIsImhlYWRlclBhdHRlcm4iLCJmaWxlSGVhZGVyIiwia2V5UHJlZml4IiwiZmlsZU5hbWUiLCJyZXBsYWNlIiwic3Vic3RyIiwiY2h1bmtIZWFkZXJJbmRleCIsImNodW5rSGVhZGVyTGluZSIsImNodW5rSGVhZGVyIiwiaHVuayIsIm9sZFN0YXJ0Iiwib2xkTGluZXMiLCJuZXdTdGFydCIsIm5ld0xpbmVzIiwibGluZXMiLCJsaW5lZGVsaW1pdGVycyIsImFkZENvdW50IiwicmVtb3ZlQ291bnQiLCJpbmRleE9mIiwib3BlcmF0aW9uIl0sIm1hcHBpbmdzIjoiOzs7OztnQ0FBZ0JBLFUsR0FBQUEsVTtBQUFULFNBQVNBLFVBQVQsQ0FBb0JDLE9BQXBCLEVBQTJDO0FBQUEsc0RBQWRDLE9BQWMsdUVBQUosRUFBSTs7QUFDaEQsTUFBSUMsVUFBVUYsUUFBUUcsS0FBUixDQUFjLHFCQUFkLENBQWQ7QUFBQSxNQUNJQyxhQUFhSixRQUFRSyxLQUFSLENBQWMsc0JBQWQsS0FBeUMsRUFEMUQ7QUFBQSxNQUVJQyxPQUFPLEVBRlg7QUFBQSxNQUdJQyxJQUFJLENBSFI7O0FBS0EsV0FBU0MsVUFBVCxHQUFzQjtBQUNwQixRQUFJQyxRQUFRLEVBQVo7QUFDQUgsU0FBS0ksSUFBTCxDQUFVRCxLQUFWOztBQUVBO0FBQ0EsV0FBT0YsSUFBSUwsUUFBUVMsTUFBbkIsRUFBMkI7QUFDekIsVUFBSUMsT0FBT1YsUUFBUUssQ0FBUixDQUFYOztBQUVBO0FBQ0EsVUFBSSx3QkFBd0JNLElBQXhCLENBQTZCRCxJQUE3QixDQUFKLEVBQXdDO0FBQ3RDO0FBQ0Q7O0FBRUQ7QUFDQSxVQUFJRSxTQUFVLDBDQUFELENBQTZDQyxJQUE3QyxDQUFrREgsSUFBbEQsQ0FBYjtBQUNBLFVBQUlFLE1BQUosRUFBWTtBQUNWTCxjQUFNQSxLQUFOLEdBQWNLLE9BQU8sQ0FBUCxDQUFkO0FBQ0Q7O0FBRURQO0FBQ0Q7O0FBRUQ7QUFDQTtBQUNBUyxvQkFBZ0JQLEtBQWhCO0FBQ0FPLG9CQUFnQlAsS0FBaEI7O0FBRUE7QUFDQUEsVUFBTVEsS0FBTixHQUFjLEVBQWQ7O0FBRUEsV0FBT1YsSUFBSUwsUUFBUVMsTUFBbkIsRUFBMkI7QUFDekIsVUFBSUMsUUFBT1YsUUFBUUssQ0FBUixDQUFYOztBQUVBLFVBQUksaUNBQWlDTSxJQUFqQyxDQUFzQ0QsS0FBdEMsQ0FBSixFQUFpRDtBQUMvQztBQUNELE9BRkQsTUFFTyxJQUFJLE1BQU1DLElBQU4sQ0FBV0QsS0FBWCxDQUFKLEVBQXNCO0FBQzNCSCxjQUFNUSxLQUFOLENBQVlQLElBQVosQ0FBaUJRLFdBQWpCO0FBQ0QsT0FGTSxNQUVBLElBQUlOLFNBQVFYLFFBQVFrQixNQUFwQixFQUE0QjtBQUNqQztBQUNBLGNBQU0sSUFBSUMsS0FBSixDQUFVLG1CQUFtQmIsSUFBSSxDQUF2QixJQUE0QixHQUE1QixHQUFrQ2MsS0FBS0MsU0FBTCxDQUFlVixLQUFmLENBQTVDLENBQU47QUFDRCxPQUhNLE1BR0E7QUFDTEw7QUFDRDtBQUNGO0FBQ0Y7O0FBRUQ7QUFDQTtBQUNBLFdBQVNTLGVBQVQsQ0FBeUJQLEtBQXpCLEVBQWdDO0FBQzlCLFFBQU1jLGdCQUFnQiwwQ0FBdEI7QUFDQSxRQUFNQyxhQUFhRCxjQUFjUixJQUFkLENBQW1CYixRQUFRSyxDQUFSLENBQW5CLENBQW5CO0FBQ0EsUUFBSWlCLFVBQUosRUFBZ0I7QUFDZCxVQUFJQyxZQUFZRCxXQUFXLENBQVgsTUFBa0IsS0FBbEIsR0FBMEIsS0FBMUIsR0FBa0MsS0FBbEQ7QUFDQSxVQUFJRSxXQUFXRixXQUFXLENBQVgsRUFBY0csT0FBZCxDQUFzQixPQUF0QixFQUErQixJQUEvQixDQUFmO0FBQ0EsVUFBSSxTQUFTZCxJQUFULENBQWNhLFFBQWQsQ0FBSixFQUE2QjtBQUMzQkEsbUJBQVdBLFNBQVNFLE1BQVQsQ0FBZ0IsQ0FBaEIsRUFBbUJGLFNBQVNmLE1BQVQsR0FBa0IsQ0FBckMsQ0FBWDtBQUNEO0FBQ0RGLFlBQU1nQixZQUFZLFVBQWxCLElBQWdDQyxRQUFoQztBQUNBakIsWUFBTWdCLFlBQVksUUFBbEIsSUFBOEJELFdBQVcsQ0FBWCxDQUE5Qjs7QUFFQWpCO0FBQ0Q7QUFDRjs7QUFFRDtBQUNBO0FBQ0EsV0FBU1csU0FBVCxHQUFxQjtBQUNuQixRQUFJVyxtQkFBbUJ0QixDQUF2QjtBQUFBLFFBQ0l1QixrQkFBa0I1QixRQUFRSyxHQUFSLENBRHRCO0FBQUEsUUFFSXdCLGNBQWNELGdCQUFnQjNCLEtBQWhCLENBQXNCLDRDQUF0QixDQUZsQjs7QUFJQSxRQUFJNkIsT0FBTztBQUNUQyxnQkFBVSxDQUFDRixZQUFZLENBQVosQ0FERjtBQUVURyxnQkFBVSxDQUFDSCxZQUFZLENBQVosQ0FBRCxJQUFtQixDQUZwQjtBQUdUSSxnQkFBVSxDQUFDSixZQUFZLENBQVosQ0FIRjtBQUlUSyxnQkFBVSxDQUFDTCxZQUFZLENBQVosQ0FBRCxJQUFtQixDQUpwQjtBQUtUTSxhQUFPLEVBTEU7QUFNVEMsc0JBQWdCO0FBTlAsS0FBWDs7QUFTQSxRQUFJQyxXQUFXLENBQWY7QUFBQSxRQUNJQyxjQUFjLENBRGxCO0FBRUEsV0FBT2pDLElBQUlMLFFBQVFTLE1BQW5CLEVBQTJCSixHQUEzQixFQUFnQztBQUM5QjtBQUNBO0FBQ0EsVUFBSUwsUUFBUUssQ0FBUixFQUFXa0MsT0FBWCxDQUFtQixNQUFuQixNQUErQixDQUEvQixJQUNNbEMsSUFBSSxDQUFKLEdBQVFMLFFBQVFTLE1BRHRCLElBRUtULFFBQVFLLElBQUksQ0FBWixFQUFla0MsT0FBZixDQUF1QixNQUF2QixNQUFtQyxDQUZ4QyxJQUdLdkMsUUFBUUssSUFBSSxDQUFaLEVBQWVrQyxPQUFmLENBQXVCLElBQXZCLE1BQWlDLENBSDFDLEVBRzZDO0FBQ3pDO0FBQ0g7QUFDRCxVQUFJQyxZQUFZeEMsUUFBUUssQ0FBUixFQUFXLENBQVgsQ0FBaEI7O0FBRUEsVUFBSW1DLGNBQWMsR0FBZCxJQUFxQkEsY0FBYyxHQUFuQyxJQUEwQ0EsY0FBYyxHQUF4RCxJQUErREEsY0FBYyxJQUFqRixFQUF1RjtBQUNyRlYsYUFBS0ssS0FBTCxDQUFXM0IsSUFBWCxDQUFnQlIsUUFBUUssQ0FBUixDQUFoQjtBQUNBeUIsYUFBS00sY0FBTCxDQUFvQjVCLElBQXBCLENBQXlCTixXQUFXRyxDQUFYLEtBQWlCLElBQTFDOztBQUVBLFlBQUltQyxjQUFjLEdBQWxCLEVBQXVCO0FBQ3JCSDtBQUNELFNBRkQsTUFFTyxJQUFJRyxjQUFjLEdBQWxCLEVBQXVCO0FBQzVCRjtBQUNELFNBRk0sTUFFQSxJQUFJRSxjQUFjLEdBQWxCLEVBQXVCO0FBQzVCSDtBQUNBQztBQUNEO0FBQ0YsT0FaRCxNQVlPO0FBQ0w7QUFDRDtBQUNGOztBQUVEO0FBQ0EsUUFBSSxDQUFDRCxRQUFELElBQWFQLEtBQUtJLFFBQUwsS0FBa0IsQ0FBbkMsRUFBc0M7QUFDcENKLFdBQUtJLFFBQUwsR0FBZ0IsQ0FBaEI7QUFDRDtBQUNELFFBQUksQ0FBQ0ksV0FBRCxJQUFnQlIsS0FBS0UsUUFBTCxLQUFrQixDQUF0QyxFQUF5QztBQUN2Q0YsV0FBS0UsUUFBTCxHQUFnQixDQUFoQjtBQUNEOztBQUVEO0FBQ0EsUUFBSWpDLFFBQVFrQixNQUFaLEVBQW9CO0FBQ2xCLFVBQUlvQixhQUFhUCxLQUFLSSxRQUF0QixFQUFnQztBQUM5QixjQUFNLElBQUloQixLQUFKLENBQVUsc0RBQXNEUyxtQkFBbUIsQ0FBekUsQ0FBVixDQUFOO0FBQ0Q7QUFDRCxVQUFJVyxnQkFBZ0JSLEtBQUtFLFFBQXpCLEVBQW1DO0FBQ2pDLGNBQU0sSUFBSWQsS0FBSixDQUFVLHdEQUF3RFMsbUJBQW1CLENBQTNFLENBQVYsQ0FBTjtBQUNEO0FBQ0Y7O0FBRUQsV0FBT0csSUFBUDtBQUNEOztBQUVELFNBQU96QixJQUFJTCxRQUFRUyxNQUFuQixFQUEyQjtBQUN6Qkg7QUFDRDs7QUFFRCxTQUFPRixJQUFQO0FBQ0QiLCJmaWxlIjoicGFyc2UuanMiLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgZnVuY3Rpb24gcGFyc2VQYXRjaCh1bmlEaWZmLCBvcHRpb25zID0ge30pIHtcbiAgbGV0IGRpZmZzdHIgPSB1bmlEaWZmLnNwbGl0KC9cXHJcXG58W1xcblxcdlxcZlxcclxceDg1XS8pLFxuICAgICAgZGVsaW1pdGVycyA9IHVuaURpZmYubWF0Y2goL1xcclxcbnxbXFxuXFx2XFxmXFxyXFx4ODVdL2cpIHx8IFtdLFxuICAgICAgbGlzdCA9IFtdLFxuICAgICAgaSA9IDA7XG5cbiAgZnVuY3Rpb24gcGFyc2VJbmRleCgpIHtcbiAgICBsZXQgaW5kZXggPSB7fTtcbiAgICBsaXN0LnB1c2goaW5kZXgpO1xuXG4gICAgLy8gUGFyc2UgZGlmZiBtZXRhZGF0YVxuICAgIHdoaWxlIChpIDwgZGlmZnN0ci5sZW5ndGgpIHtcbiAgICAgIGxldCBsaW5lID0gZGlmZnN0cltpXTtcblxuICAgICAgLy8gRmlsZSBoZWFkZXIgZm91bmQsIGVuZCBwYXJzaW5nIGRpZmYgbWV0YWRhdGFcbiAgICAgIGlmICgvXihcXC1cXC1cXC18XFwrXFwrXFwrfEBAKVxccy8udGVzdChsaW5lKSkge1xuICAgICAgICBicmVhaztcbiAgICAgIH1cblxuICAgICAgLy8gRGlmZiBpbmRleFxuICAgICAgbGV0IGhlYWRlciA9ICgvXig/OkluZGV4OnxkaWZmKD86IC1yIFxcdyspKylcXHMrKC4rPylcXHMqJC8pLmV4ZWMobGluZSk7XG4gICAgICBpZiAoaGVhZGVyKSB7XG4gICAgICAgIGluZGV4LmluZGV4ID0gaGVhZGVyWzFdO1xuICAgICAgfVxuXG4gICAgICBpKys7XG4gICAgfVxuXG4gICAgLy8gUGFyc2UgZmlsZSBoZWFkZXJzIGlmIHRoZXkgYXJlIGRlZmluZWQuIFVuaWZpZWQgZGlmZiByZXF1aXJlcyB0aGVtLCBidXRcbiAgICAvLyB0aGVyZSdzIG5vIHRlY2huaWNhbCBpc3N1ZXMgdG8gaGF2ZSBhbiBpc29sYXRlZCBodW5rIHdpdGhvdXQgZmlsZSBoZWFkZXJcbiAgICBwYXJzZUZpbGVIZWFkZXIoaW5kZXgpO1xuICAgIHBhcnNlRmlsZUhlYWRlcihpbmRleCk7XG5cbiAgICAvLyBQYXJzZSBodW5rc1xuICAgIGluZGV4Lmh1bmtzID0gW107XG5cbiAgICB3aGlsZSAoaSA8IGRpZmZzdHIubGVuZ3RoKSB7XG4gICAgICBsZXQgbGluZSA9IGRpZmZzdHJbaV07XG5cbiAgICAgIGlmICgvXihJbmRleDp8ZGlmZnxcXC1cXC1cXC18XFwrXFwrXFwrKVxccy8udGVzdChsaW5lKSkge1xuICAgICAgICBicmVhaztcbiAgICAgIH0gZWxzZSBpZiAoL15AQC8udGVzdChsaW5lKSkge1xuICAgICAgICBpbmRleC5odW5rcy5wdXNoKHBhcnNlSHVuaygpKTtcbiAgICAgIH0gZWxzZSBpZiAobGluZSAmJiBvcHRpb25zLnN0cmljdCkge1xuICAgICAgICAvLyBJZ25vcmUgdW5leHBlY3RlZCBjb250ZW50IHVubGVzcyBpbiBzdHJpY3QgbW9kZVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Vua25vd24gbGluZSAnICsgKGkgKyAxKSArICcgJyArIEpTT04uc3RyaW5naWZ5KGxpbmUpKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGkrKztcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvLyBQYXJzZXMgdGhlIC0tLSBhbmQgKysrIGhlYWRlcnMsIGlmIG5vbmUgYXJlIGZvdW5kLCBubyBsaW5lc1xuICAvLyBhcmUgY29uc3VtZWQuXG4gIGZ1bmN0aW9uIHBhcnNlRmlsZUhlYWRlcihpbmRleCkge1xuICAgIGNvbnN0IGhlYWRlclBhdHRlcm4gPSAvXigtLS18XFwrXFwrXFwrKVxccysoW1xcUyBdKikoPzpcXHQoLio/KVxccyopPyQvO1xuICAgIGNvbnN0IGZpbGVIZWFkZXIgPSBoZWFkZXJQYXR0ZXJuLmV4ZWMoZGlmZnN0cltpXSk7XG4gICAgaWYgKGZpbGVIZWFkZXIpIHtcbiAgICAgIGxldCBrZXlQcmVmaXggPSBmaWxlSGVhZGVyWzFdID09PSAnLS0tJyA/ICdvbGQnIDogJ25ldyc7XG4gICAgICBsZXQgZmlsZU5hbWUgPSBmaWxlSGVhZGVyWzJdLnJlcGxhY2UoL1xcXFxcXFxcL2csICdcXFxcJyk7XG4gICAgICBpZiAoL15cIi4qXCIkLy50ZXN0KGZpbGVOYW1lKSkge1xuICAgICAgICBmaWxlTmFtZSA9IGZpbGVOYW1lLnN1YnN0cigxLCBmaWxlTmFtZS5sZW5ndGggLSAyKTtcbiAgICAgIH1cbiAgICAgIGluZGV4W2tleVByZWZpeCArICdGaWxlTmFtZSddID0gZmlsZU5hbWU7XG4gICAgICBpbmRleFtrZXlQcmVmaXggKyAnSGVhZGVyJ10gPSBmaWxlSGVhZGVyWzNdO1xuXG4gICAgICBpKys7XG4gICAgfVxuICB9XG5cbiAgLy8gUGFyc2VzIGEgaHVua1xuICAvLyBUaGlzIGFzc3VtZXMgdGhhdCB3ZSBhcmUgYXQgdGhlIHN0YXJ0IG9mIGEgaHVuay5cbiAgZnVuY3Rpb24gcGFyc2VIdW5rKCkge1xuICAgIGxldCBjaHVua0hlYWRlckluZGV4ID0gaSxcbiAgICAgICAgY2h1bmtIZWFkZXJMaW5lID0gZGlmZnN0cltpKytdLFxuICAgICAgICBjaHVua0hlYWRlciA9IGNodW5rSGVhZGVyTGluZS5zcGxpdCgvQEAgLShcXGQrKSg/OiwoXFxkKykpPyBcXCsoXFxkKykoPzosKFxcZCspKT8gQEAvKTtcblxuICAgIGxldCBodW5rID0ge1xuICAgICAgb2xkU3RhcnQ6ICtjaHVua0hlYWRlclsxXSxcbiAgICAgIG9sZExpbmVzOiArY2h1bmtIZWFkZXJbMl0gfHwgMSxcbiAgICAgIG5ld1N0YXJ0OiArY2h1bmtIZWFkZXJbM10sXG4gICAgICBuZXdMaW5lczogK2NodW5rSGVhZGVyWzRdIHx8IDEsXG4gICAgICBsaW5lczogW10sXG4gICAgICBsaW5lZGVsaW1pdGVyczogW11cbiAgICB9O1xuXG4gICAgbGV0IGFkZENvdW50ID0gMCxcbiAgICAgICAgcmVtb3ZlQ291bnQgPSAwO1xuICAgIGZvciAoOyBpIDwgZGlmZnN0ci5sZW5ndGg7IGkrKykge1xuICAgICAgLy8gTGluZXMgc3RhcnRpbmcgd2l0aCAnLS0tJyBjb3VsZCBiZSBtaXN0YWtlbiBmb3IgdGhlIFwicmVtb3ZlIGxpbmVcIiBvcGVyYXRpb25cbiAgICAgIC8vIEJ1dCB0aGV5IGNvdWxkIGJlIHRoZSBoZWFkZXIgZm9yIHRoZSBuZXh0IGZpbGUuIFRoZXJlZm9yZSBwcnVuZSBzdWNoIGNhc2VzIG91dC5cbiAgICAgIGlmIChkaWZmc3RyW2ldLmluZGV4T2YoJy0tLSAnKSA9PT0gMFxuICAgICAgICAgICAgJiYgKGkgKyAyIDwgZGlmZnN0ci5sZW5ndGgpXG4gICAgICAgICAgICAmJiBkaWZmc3RyW2kgKyAxXS5pbmRleE9mKCcrKysgJykgPT09IDBcbiAgICAgICAgICAgICYmIGRpZmZzdHJbaSArIDJdLmluZGV4T2YoJ0BAJykgPT09IDApIHtcbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIGxldCBvcGVyYXRpb24gPSBkaWZmc3RyW2ldWzBdO1xuXG4gICAgICBpZiAob3BlcmF0aW9uID09PSAnKycgfHwgb3BlcmF0aW9uID09PSAnLScgfHwgb3BlcmF0aW9uID09PSAnICcgfHwgb3BlcmF0aW9uID09PSAnXFxcXCcpIHtcbiAgICAgICAgaHVuay5saW5lcy5wdXNoKGRpZmZzdHJbaV0pO1xuICAgICAgICBodW5rLmxpbmVkZWxpbWl0ZXJzLnB1c2goZGVsaW1pdGVyc1tpXSB8fCAnXFxuJyk7XG5cbiAgICAgICAgaWYgKG9wZXJhdGlvbiA9PT0gJysnKSB7XG4gICAgICAgICAgYWRkQ291bnQrKztcbiAgICAgICAgfSBlbHNlIGlmIChvcGVyYXRpb24gPT09ICctJykge1xuICAgICAgICAgIHJlbW92ZUNvdW50Kys7XG4gICAgICAgIH0gZWxzZSBpZiAob3BlcmF0aW9uID09PSAnICcpIHtcbiAgICAgICAgICBhZGRDb3VudCsrO1xuICAgICAgICAgIHJlbW92ZUNvdW50Kys7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIEhhbmRsZSB0aGUgZW1wdHkgYmxvY2sgY291bnQgY2FzZVxuICAgIGlmICghYWRkQ291bnQgJiYgaHVuay5uZXdMaW5lcyA9PT0gMSkge1xuICAgICAgaHVuay5uZXdMaW5lcyA9IDA7XG4gICAgfVxuICAgIGlmICghcmVtb3ZlQ291bnQgJiYgaHVuay5vbGRMaW5lcyA9PT0gMSkge1xuICAgICAgaHVuay5vbGRMaW5lcyA9IDA7XG4gICAgfVxuXG4gICAgLy8gUGVyZm9ybSBvcHRpb25hbCBzYW5pdHkgY2hlY2tpbmdcbiAgICBpZiAob3B0aW9ucy5zdHJpY3QpIHtcbiAgICAgIGlmIChhZGRDb3VudCAhPT0gaHVuay5uZXdMaW5lcykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0FkZGVkIGxpbmUgY291bnQgZGlkIG5vdCBtYXRjaCBmb3IgaHVuayBhdCBsaW5lICcgKyAoY2h1bmtIZWFkZXJJbmRleCArIDEpKTtcbiAgICAgIH1cbiAgICAgIGlmIChyZW1vdmVDb3VudCAhPT0gaHVuay5vbGRMaW5lcykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1JlbW92ZWQgbGluZSBjb3VudCBkaWQgbm90IG1hdGNoIGZvciBodW5rIGF0IGxpbmUgJyArIChjaHVua0hlYWRlckluZGV4ICsgMSkpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBodW5rO1xuICB9XG5cbiAgd2hpbGUgKGkgPCBkaWZmc3RyLmxlbmd0aCkge1xuICAgIHBhcnNlSW5kZXgoKTtcbiAgfVxuXG4gIHJldHVybiBsaXN0O1xufVxuIl19
//
//
///***/ }),
///* 12 */
///***/ (function(module, exports) {
//
//    /*istanbul ignore start*/"use strict";
//
//    Object.defineProperty(exports, "__esModule", {
//      value: true
//    });
//
//    exports["default"] = /*istanbul ignore end*/function (start, minLine, maxLine) {
//      var wantForward = true,
//          backwardExhausted = false,
//          forwardExhausted = false,
//          localOffset = 1;
//
//      return function iterator() {
//        if (wantForward && !forwardExhausted) {
//          if (backwardExhausted) {
//            localOffset++;
//          } else {
//            wantForward = false;
//          }
//
//          // Check if trying to fit beyond text length, and if not, check it fits
//          // after offset location (or desired location on first iteration)
//          if (start + localOffset <= maxLine) {
//            return localOffset;
//          }
//
//          forwardExhausted = true;
//        }
//
//        if (!backwardExhausted) {
//          if (!forwardExhausted) {
//            wantForward = true;
//          }
//
//          // Check if trying to fit before text beginning, and if not, check it fits
//          // before offset location
//          if (minLine <= start - localOffset) {
//            return -localOffset++;
//          }
//
//          backwardExhausted = true;
//          return iterator();
//        }
//
//        // We tried to fit hunk before text beginning and beyond text length, then
//        // hunk can't fit on the text. Return undefined
//      };
//    };
//    //# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlsL2Rpc3RhbmNlLWl0ZXJhdG9yLmpzIl0sIm5hbWVzIjpbInN0YXJ0IiwibWluTGluZSIsIm1heExpbmUiLCJ3YW50Rm9yd2FyZCIsImJhY2t3YXJkRXhoYXVzdGVkIiwiZm9yd2FyZEV4aGF1c3RlZCIsImxvY2FsT2Zmc2V0IiwiaXRlcmF0b3IiXSwibWFwcGluZ3MiOiI7Ozs7Ozs0Q0FHZSxVQUFTQSxLQUFULEVBQWdCQyxPQUFoQixFQUF5QkMsT0FBekIsRUFBa0M7QUFDL0MsTUFBSUMsY0FBYyxJQUFsQjtBQUFBLE1BQ0lDLG9CQUFvQixLQUR4QjtBQUFBLE1BRUlDLG1CQUFtQixLQUZ2QjtBQUFBLE1BR0lDLGNBQWMsQ0FIbEI7O0FBS0EsU0FBTyxTQUFTQyxRQUFULEdBQW9CO0FBQ3pCLFFBQUlKLGVBQWUsQ0FBQ0UsZ0JBQXBCLEVBQXNDO0FBQ3BDLFVBQUlELGlCQUFKLEVBQXVCO0FBQ3JCRTtBQUNELE9BRkQsTUFFTztBQUNMSCxzQkFBYyxLQUFkO0FBQ0Q7O0FBRUQ7QUFDQTtBQUNBLFVBQUlILFFBQVFNLFdBQVIsSUFBdUJKLE9BQTNCLEVBQW9DO0FBQ2xDLGVBQU9JLFdBQVA7QUFDRDs7QUFFREQseUJBQW1CLElBQW5CO0FBQ0Q7O0FBRUQsUUFBSSxDQUFDRCxpQkFBTCxFQUF3QjtBQUN0QixVQUFJLENBQUNDLGdCQUFMLEVBQXVCO0FBQ3JCRixzQkFBYyxJQUFkO0FBQ0Q7O0FBRUQ7QUFDQTtBQUNBLFVBQUlGLFdBQVdELFFBQVFNLFdBQXZCLEVBQW9DO0FBQ2xDLGVBQU8sQ0FBQ0EsYUFBUjtBQUNEOztBQUVERiwwQkFBb0IsSUFBcEI7QUFDQSxhQUFPRyxVQUFQO0FBQ0Q7O0FBRUQ7QUFDQTtBQUNELEdBbENEO0FBbUNELEMiLCJmaWxlIjoiZGlzdGFuY2UtaXRlcmF0b3IuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBJdGVyYXRvciB0aGF0IHRyYXZlcnNlcyBpbiB0aGUgcmFuZ2Ugb2YgW21pbiwgbWF4XSwgc3RlcHBpbmdcbi8vIGJ5IGRpc3RhbmNlIGZyb20gYSBnaXZlbiBzdGFydCBwb3NpdGlvbi4gSS5lLiBmb3IgWzAsIDRdLCB3aXRoXG4vLyBzdGFydCBvZiAyLCB0aGlzIHdpbGwgaXRlcmF0ZSAyLCAzLCAxLCA0LCAwLlxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oc3RhcnQsIG1pbkxpbmUsIG1heExpbmUpIHtcbiAgbGV0IHdhbnRGb3J3YXJkID0gdHJ1ZSxcbiAgICAgIGJhY2t3YXJkRXhoYXVzdGVkID0gZmFsc2UsXG4gICAgICBmb3J3YXJkRXhoYXVzdGVkID0gZmFsc2UsXG4gICAgICBsb2NhbE9mZnNldCA9IDE7XG5cbiAgcmV0dXJuIGZ1bmN0aW9uIGl0ZXJhdG9yKCkge1xuICAgIGlmICh3YW50Rm9yd2FyZCAmJiAhZm9yd2FyZEV4aGF1c3RlZCkge1xuICAgICAgaWYgKGJhY2t3YXJkRXhoYXVzdGVkKSB7XG4gICAgICAgIGxvY2FsT2Zmc2V0Kys7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB3YW50Rm9yd2FyZCA9IGZhbHNlO1xuICAgICAgfVxuXG4gICAgICAvLyBDaGVjayBpZiB0cnlpbmcgdG8gZml0IGJleW9uZCB0ZXh0IGxlbmd0aCwgYW5kIGlmIG5vdCwgY2hlY2sgaXQgZml0c1xuICAgICAgLy8gYWZ0ZXIgb2Zmc2V0IGxvY2F0aW9uIChvciBkZXNpcmVkIGxvY2F0aW9uIG9uIGZpcnN0IGl0ZXJhdGlvbilcbiAgICAgIGlmIChzdGFydCArIGxvY2FsT2Zmc2V0IDw9IG1heExpbmUpIHtcbiAgICAgICAgcmV0dXJuIGxvY2FsT2Zmc2V0O1xuICAgICAgfVxuXG4gICAgICBmb3J3YXJkRXhoYXVzdGVkID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBpZiAoIWJhY2t3YXJkRXhoYXVzdGVkKSB7XG4gICAgICBpZiAoIWZvcndhcmRFeGhhdXN0ZWQpIHtcbiAgICAgICAgd2FudEZvcndhcmQgPSB0cnVlO1xuICAgICAgfVxuXG4gICAgICAvLyBDaGVjayBpZiB0cnlpbmcgdG8gZml0IGJlZm9yZSB0ZXh0IGJlZ2lubmluZywgYW5kIGlmIG5vdCwgY2hlY2sgaXQgZml0c1xuICAgICAgLy8gYmVmb3JlIG9mZnNldCBsb2NhdGlvblxuICAgICAgaWYgKG1pbkxpbmUgPD0gc3RhcnQgLSBsb2NhbE9mZnNldCkge1xuICAgICAgICByZXR1cm4gLWxvY2FsT2Zmc2V0Kys7XG4gICAgICB9XG5cbiAgICAgIGJhY2t3YXJkRXhoYXVzdGVkID0gdHJ1ZTtcbiAgICAgIHJldHVybiBpdGVyYXRvcigpO1xuICAgIH1cblxuICAgIC8vIFdlIHRyaWVkIHRvIGZpdCBodW5rIGJlZm9yZSB0ZXh0IGJlZ2lubmluZyBhbmQgYmV5b25kIHRleHQgbGVuZ3RoLCB0aGVuXG4gICAgLy8gaHVuayBjYW4ndCBmaXQgb24gdGhlIHRleHQuIFJldHVybiB1bmRlZmluZWRcbiAgfTtcbn1cbiJdfQ==
//
//
///***/ }),
///* 13 */
///***/ (function(module, exports, __webpack_require__) {
//
//    /*istanbul ignore start*/'use strict';
//
//    Object.defineProperty(exports, "__esModule", {
//      value: true
//    });
//    exports. /*istanbul ignore end*/calcLineCount = calcLineCount;
//    /*istanbul ignore start*/exports. /*istanbul ignore end*/merge = merge;
//
//    var /*istanbul ignore start*/_create = __webpack_require__(14) /*istanbul ignore end*/;
//
//    var /*istanbul ignore start*/_parse = __webpack_require__(11) /*istanbul ignore end*/;
//
//    var /*istanbul ignore start*/_array = __webpack_require__(15) /*istanbul ignore end*/;
//
//    /*istanbul ignore start*/function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }
//
//    /*istanbul ignore end*/function calcLineCount(hunk) {
//      /*istanbul ignore start*/var _calcOldNewLineCount = /*istanbul ignore end*/calcOldNewLineCount(hunk.lines),
//          oldLines = _calcOldNewLineCount.oldLines,
//          newLines = _calcOldNewLineCount.newLines;
//
//      if (oldLines !== undefined) {
//        hunk.oldLines = oldLines;
//      } else {
//        delete hunk.oldLines;
//      }
//
//      if (newLines !== undefined) {
//        hunk.newLines = newLines;
//      } else {
//        delete hunk.newLines;
//      }
//    }
//
//    function merge(mine, theirs, base) {
//      mine = loadPatch(mine, base);
//      theirs = loadPatch(theirs, base);
//
//      var ret = {};
//
//      // For index we just let it pass through as it doesn't have any necessary meaning.
//      // Leaving sanity checks on this to the API consumer that may know more about the
//      // meaning in their own context.
//      if (mine.index || theirs.index) {
//        ret.index = mine.index || theirs.index;
//      }
//
//      if (mine.newFileName || theirs.newFileName) {
//        if (!fileNameChanged(mine)) {
//          // No header or no change in ours, use theirs (and ours if theirs does not exist)
//          ret.oldFileName = theirs.oldFileName || mine.oldFileName;
//          ret.newFileName = theirs.newFileName || mine.newFileName;
//          ret.oldHeader = theirs.oldHeader || mine.oldHeader;
//          ret.newHeader = theirs.newHeader || mine.newHeader;
//        } else if (!fileNameChanged(theirs)) {
//          // No header or no change in theirs, use ours
//          ret.oldFileName = mine.oldFileName;
//          ret.newFileName = mine.newFileName;
//          ret.oldHeader = mine.oldHeader;
//          ret.newHeader = mine.newHeader;
//        } else {
//          // Both changed... figure it out
//          ret.oldFileName = selectField(ret, mine.oldFileName, theirs.oldFileName);
//          ret.newFileName = selectField(ret, mine.newFileName, theirs.newFileName);
//          ret.oldHeader = selectField(ret, mine.oldHeader, theirs.oldHeader);
//          ret.newHeader = selectField(ret, mine.newHeader, theirs.newHeader);
//        }
//      }
//
//      ret.hunks = [];
//
//      var mineIndex = 0,
//          theirsIndex = 0,
//          mineOffset = 0,
//          theirsOffset = 0;
//
//      while (mineIndex < mine.hunks.length || theirsIndex < theirs.hunks.length) {
//        var mineCurrent = mine.hunks[mineIndex] || { oldStart: Infinity },
//            theirsCurrent = theirs.hunks[theirsIndex] || { oldStart: Infinity };
//
//        if (hunkBefore(mineCurrent, theirsCurrent)) {
//          // This patch does not overlap with any of the others, yay.
//          ret.hunks.push(cloneHunk(mineCurrent, mineOffset));
//          mineIndex++;
//          theirsOffset += mineCurrent.newLines - mineCurrent.oldLines;
//        } else if (hunkBefore(theirsCurrent, mineCurrent)) {
//          // This patch does not overlap with any of the others, yay.
//          ret.hunks.push(cloneHunk(theirsCurrent, theirsOffset));
//          theirsIndex++;
//          mineOffset += theirsCurrent.newLines - theirsCurrent.oldLines;
//        } else {
//          // Overlap, merge as best we can
//          var mergedHunk = {
//            oldStart: Math.min(mineCurrent.oldStart, theirsCurrent.oldStart),
//            oldLines: 0,
//            newStart: Math.min(mineCurrent.newStart + mineOffset, theirsCurrent.oldStart + theirsOffset),
//            newLines: 0,
//            lines: []
//          };
//          mergeLines(mergedHunk, mineCurrent.oldStart, mineCurrent.lines, theirsCurrent.oldStart, theirsCurrent.lines);
//          theirsIndex++;
//          mineIndex++;
//
//          ret.hunks.push(mergedHunk);
//        }
//      }
//
//      return ret;
//    }
//
//    function loadPatch(param, base) {
//      if (typeof param === 'string') {
//        if (/^@@/m.test(param) || /^Index:/m.test(param)) {
//          return (/*istanbul ignore start*/(0, _parse.parsePatch) /*istanbul ignore end*/(param)[0]
//          );
//        }
//
//        if (!base) {
//          throw new Error('Must provide a base reference or pass in a patch');
//        }
//        return (/*istanbul ignore start*/(0, _create.structuredPatch) /*istanbul ignore end*/(undefined, undefined, base, param)
//        );
//      }
//
//      return param;
//    }
//
//    function fileNameChanged(patch) {
//      return patch.newFileName && patch.newFileName !== patch.oldFileName;
//    }
//
//    function selectField(index, mine, theirs) {
//      if (mine === theirs) {
//        return mine;
//      } else {
//        index.conflict = true;
//        return { mine: mine, theirs: theirs };
//      }
//    }
//
//    function hunkBefore(test, check) {
//      return test.oldStart < check.oldStart && test.oldStart + test.oldLines < check.oldStart;
//    }
//
//    function cloneHunk(hunk, offset) {
//      return {
//        oldStart: hunk.oldStart, oldLines: hunk.oldLines,
//        newStart: hunk.newStart + offset, newLines: hunk.newLines,
//        lines: hunk.lines
//      };
//    }
//
//    function mergeLines(hunk, mineOffset, mineLines, theirOffset, theirLines) {
//      // This will generally result in a conflicted hunk, but there are cases where the context
//      // is the only overlap where we can successfully merge the content here.
//      var mine = { offset: mineOffset, lines: mineLines, index: 0 },
//          their = { offset: theirOffset, lines: theirLines, index: 0 };
//
//      // Handle any leading content
//      insertLeading(hunk, mine, their);
//      insertLeading(hunk, their, mine);
//
//      // Now in the overlap content. Scan through and select the best changes from each.
//      while (mine.index < mine.lines.length && their.index < their.lines.length) {
//        var mineCurrent = mine.lines[mine.index],
//            theirCurrent = their.lines[their.index];
//
//        if ((mineCurrent[0] === '-' || mineCurrent[0] === '+') && (theirCurrent[0] === '-' || theirCurrent[0] === '+')) {
//          // Both modified ...
//          mutualChange(hunk, mine, their);
//        } else if (mineCurrent[0] === '+' && theirCurrent[0] === ' ') {
//          /*istanbul ignore start*/var _hunk$lines;
//
//          /*istanbul ignore end*/ // Mine inserted
//          /*istanbul ignore start*/(_hunk$lines = /*istanbul ignore end*/hunk.lines).push. /*istanbul ignore start*/apply /*istanbul ignore end*/( /*istanbul ignore start*/_hunk$lines /*istanbul ignore end*/, /*istanbul ignore start*/_toConsumableArray( /*istanbul ignore end*/collectChange(mine)));
//        } else if (theirCurrent[0] === '+' && mineCurrent[0] === ' ') {
//          /*istanbul ignore start*/var _hunk$lines2;
//
//          /*istanbul ignore end*/ // Theirs inserted
//          /*istanbul ignore start*/(_hunk$lines2 = /*istanbul ignore end*/hunk.lines).push. /*istanbul ignore start*/apply /*istanbul ignore end*/( /*istanbul ignore start*/_hunk$lines2 /*istanbul ignore end*/, /*istanbul ignore start*/_toConsumableArray( /*istanbul ignore end*/collectChange(their)));
//        } else if (mineCurrent[0] === '-' && theirCurrent[0] === ' ') {
//          // Mine removed or edited
//          removal(hunk, mine, their);
//        } else if (theirCurrent[0] === '-' && mineCurrent[0] === ' ') {
//          // Their removed or edited
//          removal(hunk, their, mine, true);
//        } else if (mineCurrent === theirCurrent) {
//          // Context identity
//          hunk.lines.push(mineCurrent);
//          mine.index++;
//          their.index++;
//        } else {
//          // Context mismatch
//          conflict(hunk, collectChange(mine), collectChange(their));
//        }
//      }
//
//      // Now push anything that may be remaining
//      insertTrailing(hunk, mine);
//      insertTrailing(hunk, their);
//
//      calcLineCount(hunk);
//    }
//
//    function mutualChange(hunk, mine, their) {
//      var myChanges = collectChange(mine),
//          theirChanges = collectChange(their);
//
//      if (allRemoves(myChanges) && allRemoves(theirChanges)) {
//        // Special case for remove changes that are supersets of one another
//        if ( /*istanbul ignore start*/(0, _array.arrayStartsWith) /*istanbul ignore end*/(myChanges, theirChanges) && skipRemoveSuperset(their, myChanges, myChanges.length - theirChanges.length)) {
//          /*istanbul ignore start*/var _hunk$lines3;
//
//          /*istanbul ignore end*/ /*istanbul ignore start*/(_hunk$lines3 = /*istanbul ignore end*/hunk.lines).push. /*istanbul ignore start*/apply /*istanbul ignore end*/( /*istanbul ignore start*/_hunk$lines3 /*istanbul ignore end*/, /*istanbul ignore start*/_toConsumableArray( /*istanbul ignore end*/myChanges));
//          return;
//        } else if ( /*istanbul ignore start*/(0, _array.arrayStartsWith) /*istanbul ignore end*/(theirChanges, myChanges) && skipRemoveSuperset(mine, theirChanges, theirChanges.length - myChanges.length)) {
//          /*istanbul ignore start*/var _hunk$lines4;
//
//          /*istanbul ignore end*/ /*istanbul ignore start*/(_hunk$lines4 = /*istanbul ignore end*/hunk.lines).push. /*istanbul ignore start*/apply /*istanbul ignore end*/( /*istanbul ignore start*/_hunk$lines4 /*istanbul ignore end*/, /*istanbul ignore start*/_toConsumableArray( /*istanbul ignore end*/theirChanges));
//          return;
//        }
//      } else if ( /*istanbul ignore start*/(0, _array.arrayEqual) /*istanbul ignore end*/(myChanges, theirChanges)) {
//        /*istanbul ignore start*/var _hunk$lines5;
//
//        /*istanbul ignore end*/ /*istanbul ignore start*/(_hunk$lines5 = /*istanbul ignore end*/hunk.lines).push. /*istanbul ignore start*/apply /*istanbul ignore end*/( /*istanbul ignore start*/_hunk$lines5 /*istanbul ignore end*/, /*istanbul ignore start*/_toConsumableArray( /*istanbul ignore end*/myChanges));
//        return;
//      }
//
//      conflict(hunk, myChanges, theirChanges);
//    }
//
//    function removal(hunk, mine, their, swap) {
//      var myChanges = collectChange(mine),
//          theirChanges = collectContext(their, myChanges);
//      if (theirChanges.merged) {
//        /*istanbul ignore start*/var _hunk$lines6;
//
//        /*istanbul ignore end*/ /*istanbul ignore start*/(_hunk$lines6 = /*istanbul ignore end*/hunk.lines).push. /*istanbul ignore start*/apply /*istanbul ignore end*/( /*istanbul ignore start*/_hunk$lines6 /*istanbul ignore end*/, /*istanbul ignore start*/_toConsumableArray( /*istanbul ignore end*/theirChanges.merged));
//      } else {
//        conflict(hunk, swap ? theirChanges : myChanges, swap ? myChanges : theirChanges);
//      }
//    }
//
//    function conflict(hunk, mine, their) {
//      hunk.conflict = true;
//      hunk.lines.push({
//        conflict: true,
//        mine: mine,
//        theirs: their
//      });
//    }
//
//    function insertLeading(hunk, insert, their) {
//      while (insert.offset < their.offset && insert.index < insert.lines.length) {
//        var line = insert.lines[insert.index++];
//        hunk.lines.push(line);
//        insert.offset++;
//      }
//    }
//    function insertTrailing(hunk, insert) {
//      while (insert.index < insert.lines.length) {
//        var line = insert.lines[insert.index++];
//        hunk.lines.push(line);
//      }
//    }
//
//    function collectChange(state) {
//      var ret = [],
//          operation = state.lines[state.index][0];
//      while (state.index < state.lines.length) {
//        var line = state.lines[state.index];
//
//        // Group additions that are immediately after subtractions and treat them as one "atomic" modify change.
//        if (operation === '-' && line[0] === '+') {
//          operation = '+';
//        }
//
//        if (operation === line[0]) {
//          ret.push(line);
//          state.index++;
//        } else {
//          break;
//        }
//      }
//
//      return ret;
//    }
//    function collectContext(state, matchChanges) {
//      var changes = [],
//          merged = [],
//          matchIndex = 0,
//          contextChanges = false,
//          conflicted = false;
//      while (matchIndex < matchChanges.length && state.index < state.lines.length) {
//        var change = state.lines[state.index],
//            match = matchChanges[matchIndex];
//
//        // Once we've hit our add, then we are done
//        if (match[0] === '+') {
//          break;
//        }
//
//        contextChanges = contextChanges || change[0] !== ' ';
//
//        merged.push(match);
//        matchIndex++;
//
//        // Consume any additions in the other block as a conflict to attempt
//        // to pull in the remaining context after this
//        if (change[0] === '+') {
//          conflicted = true;
//
//          while (change[0] === '+') {
//            changes.push(change);
//            change = state.lines[++state.index];
//          }
//        }
//
//        if (match.substr(1) === change.substr(1)) {
//          changes.push(change);
//          state.index++;
//        } else {
//          conflicted = true;
//        }
//      }
//
//      if ((matchChanges[matchIndex] || '')[0] === '+' && contextChanges) {
//        conflicted = true;
//      }
//
//      if (conflicted) {
//        return changes;
//      }
//
//      while (matchIndex < matchChanges.length) {
//        merged.push(matchChanges[matchIndex++]);
//      }
//
//      return {
//        merged: merged,
//        changes: changes
//      };
//    }
//
//    function allRemoves(changes) {
//      return changes.reduce(function (prev, change) {
//        return prev && change[0] === '-';
//      }, true);
//    }
//    function skipRemoveSuperset(state, removeChanges, delta) {
//      for (var i = 0; i < delta; i++) {
//        var changeContent = removeChanges[removeChanges.length - delta + i].substr(1);
//        if (state.lines[state.index + i] !== ' ' + changeContent) {
//          return false;
//        }
//      }
//
//      state.index += delta;
//      return true;
//    }
//
//    function calcOldNewLineCount(lines) {
//      var oldLines = 0;
//      var newLines = 0;
//
//      lines.forEach(function (line) {
//        if (typeof line !== 'string') {
//          var myCount = calcOldNewLineCount(line.mine);
//          var theirCount = calcOldNewLineCount(line.theirs);
//
//          if (oldLines !== undefined) {
//            if (myCount.oldLines === theirCount.oldLines) {
//              oldLines += myCount.oldLines;
//            } else {
//              oldLines = undefined;
//            }
//          }
//
//          if (newLines !== undefined) {
//            if (myCount.newLines === theirCount.newLines) {
//              newLines += myCount.newLines;
//            } else {
//              newLines = undefined;
//            }
//          }
//        } else {
//          if (newLines !== undefined && (line[0] === '+' || line[0] === ' ')) {
//            newLines++;
//          }
//          if (oldLines !== undefined && (line[0] === '-' || line[0] === ' ')) {
//            oldLines++;
//          }
//        }
//      });
//
//      return { oldLines: oldLines, newLines: newLines };
//    }
//    //# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9wYXRjaC9tZXJnZS5qcyJdLCJuYW1lcyI6WyJjYWxjTGluZUNvdW50IiwibWVyZ2UiLCJodW5rIiwiY2FsY09sZE5ld0xpbmVDb3VudCIsImxpbmVzIiwib2xkTGluZXMiLCJuZXdMaW5lcyIsInVuZGVmaW5lZCIsIm1pbmUiLCJ0aGVpcnMiLCJiYXNlIiwibG9hZFBhdGNoIiwicmV0IiwiaW5kZXgiLCJuZXdGaWxlTmFtZSIsImZpbGVOYW1lQ2hhbmdlZCIsIm9sZEZpbGVOYW1lIiwib2xkSGVhZGVyIiwibmV3SGVhZGVyIiwic2VsZWN0RmllbGQiLCJodW5rcyIsIm1pbmVJbmRleCIsInRoZWlyc0luZGV4IiwibWluZU9mZnNldCIsInRoZWlyc09mZnNldCIsImxlbmd0aCIsIm1pbmVDdXJyZW50Iiwib2xkU3RhcnQiLCJJbmZpbml0eSIsInRoZWlyc0N1cnJlbnQiLCJodW5rQmVmb3JlIiwicHVzaCIsImNsb25lSHVuayIsIm1lcmdlZEh1bmsiLCJNYXRoIiwibWluIiwibmV3U3RhcnQiLCJtZXJnZUxpbmVzIiwicGFyYW0iLCJ0ZXN0IiwiRXJyb3IiLCJwYXRjaCIsImNvbmZsaWN0IiwiY2hlY2siLCJvZmZzZXQiLCJtaW5lTGluZXMiLCJ0aGVpck9mZnNldCIsInRoZWlyTGluZXMiLCJ0aGVpciIsImluc2VydExlYWRpbmciLCJ0aGVpckN1cnJlbnQiLCJtdXR1YWxDaGFuZ2UiLCJjb2xsZWN0Q2hhbmdlIiwicmVtb3ZhbCIsImluc2VydFRyYWlsaW5nIiwibXlDaGFuZ2VzIiwidGhlaXJDaGFuZ2VzIiwiYWxsUmVtb3ZlcyIsInNraXBSZW1vdmVTdXBlcnNldCIsInN3YXAiLCJjb2xsZWN0Q29udGV4dCIsIm1lcmdlZCIsImluc2VydCIsImxpbmUiLCJzdGF0ZSIsIm9wZXJhdGlvbiIsIm1hdGNoQ2hhbmdlcyIsImNoYW5nZXMiLCJtYXRjaEluZGV4IiwiY29udGV4dENoYW5nZXMiLCJjb25mbGljdGVkIiwiY2hhbmdlIiwibWF0Y2giLCJzdWJzdHIiLCJyZWR1Y2UiLCJwcmV2IiwicmVtb3ZlQ2hhbmdlcyIsImRlbHRhIiwiaSIsImNoYW5nZUNvbnRlbnQiLCJmb3JFYWNoIiwibXlDb3VudCIsInRoZWlyQ291bnQiXSwibWFwcGluZ3MiOiI7Ozs7O2dDQUtnQkEsYSxHQUFBQSxhO3lEQWdCQUMsSyxHQUFBQSxLOztBQXJCaEI7O0FBQ0E7O0FBRUE7Ozs7dUJBRU8sU0FBU0QsYUFBVCxDQUF1QkUsSUFBdkIsRUFBNkI7QUFBQSw2RUFDTEMsb0JBQW9CRCxLQUFLRSxLQUF6QixDQURLO0FBQUEsTUFDM0JDLFFBRDJCLHdCQUMzQkEsUUFEMkI7QUFBQSxNQUNqQkMsUUFEaUIsd0JBQ2pCQSxRQURpQjs7QUFHbEMsTUFBSUQsYUFBYUUsU0FBakIsRUFBNEI7QUFDMUJMLFNBQUtHLFFBQUwsR0FBZ0JBLFFBQWhCO0FBQ0QsR0FGRCxNQUVPO0FBQ0wsV0FBT0gsS0FBS0csUUFBWjtBQUNEOztBQUVELE1BQUlDLGFBQWFDLFNBQWpCLEVBQTRCO0FBQzFCTCxTQUFLSSxRQUFMLEdBQWdCQSxRQUFoQjtBQUNELEdBRkQsTUFFTztBQUNMLFdBQU9KLEtBQUtJLFFBQVo7QUFDRDtBQUNGOztBQUVNLFNBQVNMLEtBQVQsQ0FBZU8sSUFBZixFQUFxQkMsTUFBckIsRUFBNkJDLElBQTdCLEVBQW1DO0FBQ3hDRixTQUFPRyxVQUFVSCxJQUFWLEVBQWdCRSxJQUFoQixDQUFQO0FBQ0FELFdBQVNFLFVBQVVGLE1BQVYsRUFBa0JDLElBQWxCLENBQVQ7O0FBRUEsTUFBSUUsTUFBTSxFQUFWOztBQUVBO0FBQ0E7QUFDQTtBQUNBLE1BQUlKLEtBQUtLLEtBQUwsSUFBY0osT0FBT0ksS0FBekIsRUFBZ0M7QUFDOUJELFFBQUlDLEtBQUosR0FBWUwsS0FBS0ssS0FBTCxJQUFjSixPQUFPSSxLQUFqQztBQUNEOztBQUVELE1BQUlMLEtBQUtNLFdBQUwsSUFBb0JMLE9BQU9LLFdBQS9CLEVBQTRDO0FBQzFDLFFBQUksQ0FBQ0MsZ0JBQWdCUCxJQUFoQixDQUFMLEVBQTRCO0FBQzFCO0FBQ0FJLFVBQUlJLFdBQUosR0FBa0JQLE9BQU9PLFdBQVAsSUFBc0JSLEtBQUtRLFdBQTdDO0FBQ0FKLFVBQUlFLFdBQUosR0FBa0JMLE9BQU9LLFdBQVAsSUFBc0JOLEtBQUtNLFdBQTdDO0FBQ0FGLFVBQUlLLFNBQUosR0FBZ0JSLE9BQU9RLFNBQVAsSUFBb0JULEtBQUtTLFNBQXpDO0FBQ0FMLFVBQUlNLFNBQUosR0FBZ0JULE9BQU9TLFNBQVAsSUFBb0JWLEtBQUtVLFNBQXpDO0FBQ0QsS0FORCxNQU1PLElBQUksQ0FBQ0gsZ0JBQWdCTixNQUFoQixDQUFMLEVBQThCO0FBQ25DO0FBQ0FHLFVBQUlJLFdBQUosR0FBa0JSLEtBQUtRLFdBQXZCO0FBQ0FKLFVBQUlFLFdBQUosR0FBa0JOLEtBQUtNLFdBQXZCO0FBQ0FGLFVBQUlLLFNBQUosR0FBZ0JULEtBQUtTLFNBQXJCO0FBQ0FMLFVBQUlNLFNBQUosR0FBZ0JWLEtBQUtVLFNBQXJCO0FBQ0QsS0FOTSxNQU1BO0FBQ0w7QUFDQU4sVUFBSUksV0FBSixHQUFrQkcsWUFBWVAsR0FBWixFQUFpQkosS0FBS1EsV0FBdEIsRUFBbUNQLE9BQU9PLFdBQTFDLENBQWxCO0FBQ0FKLFVBQUlFLFdBQUosR0FBa0JLLFlBQVlQLEdBQVosRUFBaUJKLEtBQUtNLFdBQXRCLEVBQW1DTCxPQUFPSyxXQUExQyxDQUFsQjtBQUNBRixVQUFJSyxTQUFKLEdBQWdCRSxZQUFZUCxHQUFaLEVBQWlCSixLQUFLUyxTQUF0QixFQUFpQ1IsT0FBT1EsU0FBeEMsQ0FBaEI7QUFDQUwsVUFBSU0sU0FBSixHQUFnQkMsWUFBWVAsR0FBWixFQUFpQkosS0FBS1UsU0FBdEIsRUFBaUNULE9BQU9TLFNBQXhDLENBQWhCO0FBQ0Q7QUFDRjs7QUFFRE4sTUFBSVEsS0FBSixHQUFZLEVBQVo7O0FBRUEsTUFBSUMsWUFBWSxDQUFoQjtBQUFBLE1BQ0lDLGNBQWMsQ0FEbEI7QUFBQSxNQUVJQyxhQUFhLENBRmpCO0FBQUEsTUFHSUMsZUFBZSxDQUhuQjs7QUFLQSxTQUFPSCxZQUFZYixLQUFLWSxLQUFMLENBQVdLLE1BQXZCLElBQWlDSCxjQUFjYixPQUFPVyxLQUFQLENBQWFLLE1BQW5FLEVBQTJFO0FBQ3pFLFFBQUlDLGNBQWNsQixLQUFLWSxLQUFMLENBQVdDLFNBQVgsS0FBeUIsRUFBQ00sVUFBVUMsUUFBWCxFQUEzQztBQUFBLFFBQ0lDLGdCQUFnQnBCLE9BQU9XLEtBQVAsQ0FBYUUsV0FBYixLQUE2QixFQUFDSyxVQUFVQyxRQUFYLEVBRGpEOztBQUdBLFFBQUlFLFdBQVdKLFdBQVgsRUFBd0JHLGFBQXhCLENBQUosRUFBNEM7QUFDMUM7QUFDQWpCLFVBQUlRLEtBQUosQ0FBVVcsSUFBVixDQUFlQyxVQUFVTixXQUFWLEVBQXVCSCxVQUF2QixDQUFmO0FBQ0FGO0FBQ0FHLHNCQUFnQkUsWUFBWXBCLFFBQVosR0FBdUJvQixZQUFZckIsUUFBbkQ7QUFDRCxLQUxELE1BS08sSUFBSXlCLFdBQVdELGFBQVgsRUFBMEJILFdBQTFCLENBQUosRUFBNEM7QUFDakQ7QUFDQWQsVUFBSVEsS0FBSixDQUFVVyxJQUFWLENBQWVDLFVBQVVILGFBQVYsRUFBeUJMLFlBQXpCLENBQWY7QUFDQUY7QUFDQUMsb0JBQWNNLGNBQWN2QixRQUFkLEdBQXlCdUIsY0FBY3hCLFFBQXJEO0FBQ0QsS0FMTSxNQUtBO0FBQ0w7QUFDQSxVQUFJNEIsYUFBYTtBQUNmTixrQkFBVU8sS0FBS0MsR0FBTCxDQUFTVCxZQUFZQyxRQUFyQixFQUErQkUsY0FBY0YsUUFBN0MsQ0FESztBQUVmdEIsa0JBQVUsQ0FGSztBQUdmK0Isa0JBQVVGLEtBQUtDLEdBQUwsQ0FBU1QsWUFBWVUsUUFBWixHQUF1QmIsVUFBaEMsRUFBNENNLGNBQWNGLFFBQWQsR0FBeUJILFlBQXJFLENBSEs7QUFJZmxCLGtCQUFVLENBSks7QUFLZkYsZUFBTztBQUxRLE9BQWpCO0FBT0FpQyxpQkFBV0osVUFBWCxFQUF1QlAsWUFBWUMsUUFBbkMsRUFBNkNELFlBQVl0QixLQUF6RCxFQUFnRXlCLGNBQWNGLFFBQTlFLEVBQXdGRSxjQUFjekIsS0FBdEc7QUFDQWtCO0FBQ0FEOztBQUVBVCxVQUFJUSxLQUFKLENBQVVXLElBQVYsQ0FBZUUsVUFBZjtBQUNEO0FBQ0Y7O0FBRUQsU0FBT3JCLEdBQVA7QUFDRDs7QUFFRCxTQUFTRCxTQUFULENBQW1CMkIsS0FBbkIsRUFBMEI1QixJQUExQixFQUFnQztBQUM5QixNQUFJLE9BQU80QixLQUFQLEtBQWlCLFFBQXJCLEVBQStCO0FBQzdCLFFBQUksT0FBT0MsSUFBUCxDQUFZRCxLQUFaLEtBQXVCLFdBQVdDLElBQVgsQ0FBZ0JELEtBQWhCLENBQTNCLEVBQW9EO0FBQ2xELGFBQU8seUVBQVdBLEtBQVgsRUFBa0IsQ0FBbEI7QUFBUDtBQUNEOztBQUVELFFBQUksQ0FBQzVCLElBQUwsRUFBVztBQUNULFlBQU0sSUFBSThCLEtBQUosQ0FBVSxrREFBVixDQUFOO0FBQ0Q7QUFDRCxXQUFPLCtFQUFnQmpDLFNBQWhCLEVBQTJCQSxTQUEzQixFQUFzQ0csSUFBdEMsRUFBNEM0QixLQUE1QztBQUFQO0FBQ0Q7O0FBRUQsU0FBT0EsS0FBUDtBQUNEOztBQUVELFNBQVN2QixlQUFULENBQXlCMEIsS0FBekIsRUFBZ0M7QUFDOUIsU0FBT0EsTUFBTTNCLFdBQU4sSUFBcUIyQixNQUFNM0IsV0FBTixLQUFzQjJCLE1BQU16QixXQUF4RDtBQUNEOztBQUVELFNBQVNHLFdBQVQsQ0FBcUJOLEtBQXJCLEVBQTRCTCxJQUE1QixFQUFrQ0MsTUFBbEMsRUFBMEM7QUFDeEMsTUFBSUQsU0FBU0MsTUFBYixFQUFxQjtBQUNuQixXQUFPRCxJQUFQO0FBQ0QsR0FGRCxNQUVPO0FBQ0xLLFVBQU02QixRQUFOLEdBQWlCLElBQWpCO0FBQ0EsV0FBTyxFQUFDbEMsVUFBRCxFQUFPQyxjQUFQLEVBQVA7QUFDRDtBQUNGOztBQUVELFNBQVNxQixVQUFULENBQW9CUyxJQUFwQixFQUEwQkksS0FBMUIsRUFBaUM7QUFDL0IsU0FBT0osS0FBS1osUUFBTCxHQUFnQmdCLE1BQU1oQixRQUF0QixJQUNEWSxLQUFLWixRQUFMLEdBQWdCWSxLQUFLbEMsUUFBdEIsR0FBa0NzQyxNQUFNaEIsUUFEN0M7QUFFRDs7QUFFRCxTQUFTSyxTQUFULENBQW1COUIsSUFBbkIsRUFBeUIwQyxNQUF6QixFQUFpQztBQUMvQixTQUFPO0FBQ0xqQixjQUFVekIsS0FBS3lCLFFBRFYsRUFDb0J0QixVQUFVSCxLQUFLRyxRQURuQztBQUVMK0IsY0FBVWxDLEtBQUtrQyxRQUFMLEdBQWdCUSxNQUZyQixFQUU2QnRDLFVBQVVKLEtBQUtJLFFBRjVDO0FBR0xGLFdBQU9GLEtBQUtFO0FBSFAsR0FBUDtBQUtEOztBQUVELFNBQVNpQyxVQUFULENBQW9CbkMsSUFBcEIsRUFBMEJxQixVQUExQixFQUFzQ3NCLFNBQXRDLEVBQWlEQyxXQUFqRCxFQUE4REMsVUFBOUQsRUFBMEU7QUFDeEU7QUFDQTtBQUNBLE1BQUl2QyxPQUFPLEVBQUNvQyxRQUFRckIsVUFBVCxFQUFxQm5CLE9BQU95QyxTQUE1QixFQUF1Q2hDLE9BQU8sQ0FBOUMsRUFBWDtBQUFBLE1BQ0ltQyxRQUFRLEVBQUNKLFFBQVFFLFdBQVQsRUFBc0IxQyxPQUFPMkMsVUFBN0IsRUFBeUNsQyxPQUFPLENBQWhELEVBRFo7O0FBR0E7QUFDQW9DLGdCQUFjL0MsSUFBZCxFQUFvQk0sSUFBcEIsRUFBMEJ3QyxLQUExQjtBQUNBQyxnQkFBYy9DLElBQWQsRUFBb0I4QyxLQUFwQixFQUEyQnhDLElBQTNCOztBQUVBO0FBQ0EsU0FBT0EsS0FBS0ssS0FBTCxHQUFhTCxLQUFLSixLQUFMLENBQVdxQixNQUF4QixJQUFrQ3VCLE1BQU1uQyxLQUFOLEdBQWNtQyxNQUFNNUMsS0FBTixDQUFZcUIsTUFBbkUsRUFBMkU7QUFDekUsUUFBSUMsY0FBY2xCLEtBQUtKLEtBQUwsQ0FBV0ksS0FBS0ssS0FBaEIsQ0FBbEI7QUFBQSxRQUNJcUMsZUFBZUYsTUFBTTVDLEtBQU4sQ0FBWTRDLE1BQU1uQyxLQUFsQixDQURuQjs7QUFHQSxRQUFJLENBQUNhLFlBQVksQ0FBWixNQUFtQixHQUFuQixJQUEwQkEsWUFBWSxDQUFaLE1BQW1CLEdBQTlDLE1BQ0l3QixhQUFhLENBQWIsTUFBb0IsR0FBcEIsSUFBMkJBLGFBQWEsQ0FBYixNQUFvQixHQURuRCxDQUFKLEVBQzZEO0FBQzNEO0FBQ0FDLG1CQUFhakQsSUFBYixFQUFtQk0sSUFBbkIsRUFBeUJ3QyxLQUF6QjtBQUNELEtBSkQsTUFJTyxJQUFJdEIsWUFBWSxDQUFaLE1BQW1CLEdBQW5CLElBQTBCd0IsYUFBYSxDQUFiLE1BQW9CLEdBQWxELEVBQXVEO0FBQUE7O0FBQUEsOEJBQzVEO0FBQ0EsMEVBQUs5QyxLQUFMLEVBQVcyQixJQUFYLDRMQUFvQnFCLGNBQWM1QyxJQUFkLENBQXBCO0FBQ0QsS0FITSxNQUdBLElBQUkwQyxhQUFhLENBQWIsTUFBb0IsR0FBcEIsSUFBMkJ4QixZQUFZLENBQVosTUFBbUIsR0FBbEQsRUFBdUQ7QUFBQTs7QUFBQSw4QkFDNUQ7QUFDQSwyRUFBS3RCLEtBQUwsRUFBVzJCLElBQVgsNkxBQW9CcUIsY0FBY0osS0FBZCxDQUFwQjtBQUNELEtBSE0sTUFHQSxJQUFJdEIsWUFBWSxDQUFaLE1BQW1CLEdBQW5CLElBQTBCd0IsYUFBYSxDQUFiLE1BQW9CLEdBQWxELEVBQXVEO0FBQzVEO0FBQ0FHLGNBQVFuRCxJQUFSLEVBQWNNLElBQWQsRUFBb0J3QyxLQUFwQjtBQUNELEtBSE0sTUFHQSxJQUFJRSxhQUFhLENBQWIsTUFBb0IsR0FBcEIsSUFBMkJ4QixZQUFZLENBQVosTUFBbUIsR0FBbEQsRUFBdUQ7QUFDNUQ7QUFDQTJCLGNBQVFuRCxJQUFSLEVBQWM4QyxLQUFkLEVBQXFCeEMsSUFBckIsRUFBMkIsSUFBM0I7QUFDRCxLQUhNLE1BR0EsSUFBSWtCLGdCQUFnQndCLFlBQXBCLEVBQWtDO0FBQ3ZDO0FBQ0FoRCxXQUFLRSxLQUFMLENBQVcyQixJQUFYLENBQWdCTCxXQUFoQjtBQUNBbEIsV0FBS0ssS0FBTDtBQUNBbUMsWUFBTW5DLEtBQU47QUFDRCxLQUxNLE1BS0E7QUFDTDtBQUNBNkIsZUFBU3hDLElBQVQsRUFBZWtELGNBQWM1QyxJQUFkLENBQWYsRUFBb0M0QyxjQUFjSixLQUFkLENBQXBDO0FBQ0Q7QUFDRjs7QUFFRDtBQUNBTSxpQkFBZXBELElBQWYsRUFBcUJNLElBQXJCO0FBQ0E4QyxpQkFBZXBELElBQWYsRUFBcUI4QyxLQUFyQjs7QUFFQWhELGdCQUFjRSxJQUFkO0FBQ0Q7O0FBRUQsU0FBU2lELFlBQVQsQ0FBc0JqRCxJQUF0QixFQUE0Qk0sSUFBNUIsRUFBa0N3QyxLQUFsQyxFQUF5QztBQUN2QyxNQUFJTyxZQUFZSCxjQUFjNUMsSUFBZCxDQUFoQjtBQUFBLE1BQ0lnRCxlQUFlSixjQUFjSixLQUFkLENBRG5COztBQUdBLE1BQUlTLFdBQVdGLFNBQVgsS0FBeUJFLFdBQVdELFlBQVgsQ0FBN0IsRUFBdUQ7QUFDckQ7QUFDQSxRQUFJLDhFQUFnQkQsU0FBaEIsRUFBMkJDLFlBQTNCLEtBQ0dFLG1CQUFtQlYsS0FBbkIsRUFBMEJPLFNBQTFCLEVBQXFDQSxVQUFVOUIsTUFBVixHQUFtQitCLGFBQWEvQixNQUFyRSxDQURQLEVBQ3FGO0FBQUE7O0FBQUEsNkJBQ25GLHNFQUFLckIsS0FBTCxFQUFXMkIsSUFBWCw2TEFBb0J3QixTQUFwQjtBQUNBO0FBQ0QsS0FKRCxNQUlPLElBQUksOEVBQWdCQyxZQUFoQixFQUE4QkQsU0FBOUIsS0FDSkcsbUJBQW1CbEQsSUFBbkIsRUFBeUJnRCxZQUF6QixFQUF1Q0EsYUFBYS9CLE1BQWIsR0FBc0I4QixVQUFVOUIsTUFBdkUsQ0FEQSxFQUNnRjtBQUFBOztBQUFBLDZCQUNyRixzRUFBS3JCLEtBQUwsRUFBVzJCLElBQVgsNkxBQW9CeUIsWUFBcEI7QUFDQTtBQUNEO0FBQ0YsR0FYRCxNQVdPLElBQUkseUVBQVdELFNBQVgsRUFBc0JDLFlBQXRCLENBQUosRUFBeUM7QUFBQTs7QUFBQSwyQkFDOUMsc0VBQUtwRCxLQUFMLEVBQVcyQixJQUFYLDZMQUFvQndCLFNBQXBCO0FBQ0E7QUFDRDs7QUFFRGIsV0FBU3hDLElBQVQsRUFBZXFELFNBQWYsRUFBMEJDLFlBQTFCO0FBQ0Q7O0FBRUQsU0FBU0gsT0FBVCxDQUFpQm5ELElBQWpCLEVBQXVCTSxJQUF2QixFQUE2QndDLEtBQTdCLEVBQW9DVyxJQUFwQyxFQUEwQztBQUN4QyxNQUFJSixZQUFZSCxjQUFjNUMsSUFBZCxDQUFoQjtBQUFBLE1BQ0lnRCxlQUFlSSxlQUFlWixLQUFmLEVBQXNCTyxTQUF0QixDQURuQjtBQUVBLE1BQUlDLGFBQWFLLE1BQWpCLEVBQXlCO0FBQUE7O0FBQUEsMkJBQ3ZCLHNFQUFLekQsS0FBTCxFQUFXMkIsSUFBWCw2TEFBb0J5QixhQUFhSyxNQUFqQztBQUNELEdBRkQsTUFFTztBQUNMbkIsYUFBU3hDLElBQVQsRUFBZXlELE9BQU9ILFlBQVAsR0FBc0JELFNBQXJDLEVBQWdESSxPQUFPSixTQUFQLEdBQW1CQyxZQUFuRTtBQUNEO0FBQ0Y7O0FBRUQsU0FBU2QsUUFBVCxDQUFrQnhDLElBQWxCLEVBQXdCTSxJQUF4QixFQUE4QndDLEtBQTlCLEVBQXFDO0FBQ25DOUMsT0FBS3dDLFFBQUwsR0FBZ0IsSUFBaEI7QUFDQXhDLE9BQUtFLEtBQUwsQ0FBVzJCLElBQVgsQ0FBZ0I7QUFDZFcsY0FBVSxJQURJO0FBRWRsQyxVQUFNQSxJQUZRO0FBR2RDLFlBQVF1QztBQUhNLEdBQWhCO0FBS0Q7O0FBRUQsU0FBU0MsYUFBVCxDQUF1Qi9DLElBQXZCLEVBQTZCNEQsTUFBN0IsRUFBcUNkLEtBQXJDLEVBQTRDO0FBQzFDLFNBQU9jLE9BQU9sQixNQUFQLEdBQWdCSSxNQUFNSixNQUF0QixJQUFnQ2tCLE9BQU9qRCxLQUFQLEdBQWVpRCxPQUFPMUQsS0FBUCxDQUFhcUIsTUFBbkUsRUFBMkU7QUFDekUsUUFBSXNDLE9BQU9ELE9BQU8xRCxLQUFQLENBQWEwRCxPQUFPakQsS0FBUCxFQUFiLENBQVg7QUFDQVgsU0FBS0UsS0FBTCxDQUFXMkIsSUFBWCxDQUFnQmdDLElBQWhCO0FBQ0FELFdBQU9sQixNQUFQO0FBQ0Q7QUFDRjtBQUNELFNBQVNVLGNBQVQsQ0FBd0JwRCxJQUF4QixFQUE4QjRELE1BQTlCLEVBQXNDO0FBQ3BDLFNBQU9BLE9BQU9qRCxLQUFQLEdBQWVpRCxPQUFPMUQsS0FBUCxDQUFhcUIsTUFBbkMsRUFBMkM7QUFDekMsUUFBSXNDLE9BQU9ELE9BQU8xRCxLQUFQLENBQWEwRCxPQUFPakQsS0FBUCxFQUFiLENBQVg7QUFDQVgsU0FBS0UsS0FBTCxDQUFXMkIsSUFBWCxDQUFnQmdDLElBQWhCO0FBQ0Q7QUFDRjs7QUFFRCxTQUFTWCxhQUFULENBQXVCWSxLQUF2QixFQUE4QjtBQUM1QixNQUFJcEQsTUFBTSxFQUFWO0FBQUEsTUFDSXFELFlBQVlELE1BQU01RCxLQUFOLENBQVk0RCxNQUFNbkQsS0FBbEIsRUFBeUIsQ0FBekIsQ0FEaEI7QUFFQSxTQUFPbUQsTUFBTW5ELEtBQU4sR0FBY21ELE1BQU01RCxLQUFOLENBQVlxQixNQUFqQyxFQUF5QztBQUN2QyxRQUFJc0MsT0FBT0MsTUFBTTVELEtBQU4sQ0FBWTRELE1BQU1uRCxLQUFsQixDQUFYOztBQUVBO0FBQ0EsUUFBSW9ELGNBQWMsR0FBZCxJQUFxQkYsS0FBSyxDQUFMLE1BQVksR0FBckMsRUFBMEM7QUFDeENFLGtCQUFZLEdBQVo7QUFDRDs7QUFFRCxRQUFJQSxjQUFjRixLQUFLLENBQUwsQ0FBbEIsRUFBMkI7QUFDekJuRCxVQUFJbUIsSUFBSixDQUFTZ0MsSUFBVDtBQUNBQyxZQUFNbkQsS0FBTjtBQUNELEtBSEQsTUFHTztBQUNMO0FBQ0Q7QUFDRjs7QUFFRCxTQUFPRCxHQUFQO0FBQ0Q7QUFDRCxTQUFTZ0QsY0FBVCxDQUF3QkksS0FBeEIsRUFBK0JFLFlBQS9CLEVBQTZDO0FBQzNDLE1BQUlDLFVBQVUsRUFBZDtBQUFBLE1BQ0lOLFNBQVMsRUFEYjtBQUFBLE1BRUlPLGFBQWEsQ0FGakI7QUFBQSxNQUdJQyxpQkFBaUIsS0FIckI7QUFBQSxNQUlJQyxhQUFhLEtBSmpCO0FBS0EsU0FBT0YsYUFBYUYsYUFBYXpDLE1BQTFCLElBQ0V1QyxNQUFNbkQsS0FBTixHQUFjbUQsTUFBTTVELEtBQU4sQ0FBWXFCLE1BRG5DLEVBQzJDO0FBQ3pDLFFBQUk4QyxTQUFTUCxNQUFNNUQsS0FBTixDQUFZNEQsTUFBTW5ELEtBQWxCLENBQWI7QUFBQSxRQUNJMkQsUUFBUU4sYUFBYUUsVUFBYixDQURaOztBQUdBO0FBQ0EsUUFBSUksTUFBTSxDQUFOLE1BQWEsR0FBakIsRUFBc0I7QUFDcEI7QUFDRDs7QUFFREgscUJBQWlCQSxrQkFBa0JFLE9BQU8sQ0FBUCxNQUFjLEdBQWpEOztBQUVBVixXQUFPOUIsSUFBUCxDQUFZeUMsS0FBWjtBQUNBSjs7QUFFQTtBQUNBO0FBQ0EsUUFBSUcsT0FBTyxDQUFQLE1BQWMsR0FBbEIsRUFBdUI7QUFDckJELG1CQUFhLElBQWI7O0FBRUEsYUFBT0MsT0FBTyxDQUFQLE1BQWMsR0FBckIsRUFBMEI7QUFDeEJKLGdCQUFRcEMsSUFBUixDQUFhd0MsTUFBYjtBQUNBQSxpQkFBU1AsTUFBTTVELEtBQU4sQ0FBWSxFQUFFNEQsTUFBTW5ELEtBQXBCLENBQVQ7QUFDRDtBQUNGOztBQUVELFFBQUkyRCxNQUFNQyxNQUFOLENBQWEsQ0FBYixNQUFvQkYsT0FBT0UsTUFBUCxDQUFjLENBQWQsQ0FBeEIsRUFBMEM7QUFDeENOLGNBQVFwQyxJQUFSLENBQWF3QyxNQUFiO0FBQ0FQLFlBQU1uRCxLQUFOO0FBQ0QsS0FIRCxNQUdPO0FBQ0x5RCxtQkFBYSxJQUFiO0FBQ0Q7QUFDRjs7QUFFRCxNQUFJLENBQUNKLGFBQWFFLFVBQWIsS0FBNEIsRUFBN0IsRUFBaUMsQ0FBakMsTUFBd0MsR0FBeEMsSUFDR0MsY0FEUCxFQUN1QjtBQUNyQkMsaUJBQWEsSUFBYjtBQUNEOztBQUVELE1BQUlBLFVBQUosRUFBZ0I7QUFDZCxXQUFPSCxPQUFQO0FBQ0Q7O0FBRUQsU0FBT0MsYUFBYUYsYUFBYXpDLE1BQWpDLEVBQXlDO0FBQ3ZDb0MsV0FBTzlCLElBQVAsQ0FBWW1DLGFBQWFFLFlBQWIsQ0FBWjtBQUNEOztBQUVELFNBQU87QUFDTFAsa0JBREs7QUFFTE07QUFGSyxHQUFQO0FBSUQ7O0FBRUQsU0FBU1YsVUFBVCxDQUFvQlUsT0FBcEIsRUFBNkI7QUFDM0IsU0FBT0EsUUFBUU8sTUFBUixDQUFlLFVBQVNDLElBQVQsRUFBZUosTUFBZixFQUF1QjtBQUMzQyxXQUFPSSxRQUFRSixPQUFPLENBQVAsTUFBYyxHQUE3QjtBQUNELEdBRk0sRUFFSixJQUZJLENBQVA7QUFHRDtBQUNELFNBQVNiLGtCQUFULENBQTRCTSxLQUE1QixFQUFtQ1ksYUFBbkMsRUFBa0RDLEtBQWxELEVBQXlEO0FBQ3ZELE9BQUssSUFBSUMsSUFBSSxDQUFiLEVBQWdCQSxJQUFJRCxLQUFwQixFQUEyQkMsR0FBM0IsRUFBZ0M7QUFDOUIsUUFBSUMsZ0JBQWdCSCxjQUFjQSxjQUFjbkQsTUFBZCxHQUF1Qm9ELEtBQXZCLEdBQStCQyxDQUE3QyxFQUFnREwsTUFBaEQsQ0FBdUQsQ0FBdkQsQ0FBcEI7QUFDQSxRQUFJVCxNQUFNNUQsS0FBTixDQUFZNEQsTUFBTW5ELEtBQU4sR0FBY2lFLENBQTFCLE1BQWlDLE1BQU1DLGFBQTNDLEVBQTBEO0FBQ3hELGFBQU8sS0FBUDtBQUNEO0FBQ0Y7O0FBRURmLFFBQU1uRCxLQUFOLElBQWVnRSxLQUFmO0FBQ0EsU0FBTyxJQUFQO0FBQ0Q7O0FBRUQsU0FBUzFFLG1CQUFULENBQTZCQyxLQUE3QixFQUFvQztBQUNsQyxNQUFJQyxXQUFXLENBQWY7QUFDQSxNQUFJQyxXQUFXLENBQWY7O0FBRUFGLFFBQU00RSxPQUFOLENBQWMsVUFBU2pCLElBQVQsRUFBZTtBQUMzQixRQUFJLE9BQU9BLElBQVAsS0FBZ0IsUUFBcEIsRUFBOEI7QUFDNUIsVUFBSWtCLFVBQVU5RSxvQkFBb0I0RCxLQUFLdkQsSUFBekIsQ0FBZDtBQUNBLFVBQUkwRSxhQUFhL0Usb0JBQW9CNEQsS0FBS3RELE1BQXpCLENBQWpCOztBQUVBLFVBQUlKLGFBQWFFLFNBQWpCLEVBQTRCO0FBQzFCLFlBQUkwRSxRQUFRNUUsUUFBUixLQUFxQjZFLFdBQVc3RSxRQUFwQyxFQUE4QztBQUM1Q0Esc0JBQVk0RSxRQUFRNUUsUUFBcEI7QUFDRCxTQUZELE1BRU87QUFDTEEscUJBQVdFLFNBQVg7QUFDRDtBQUNGOztBQUVELFVBQUlELGFBQWFDLFNBQWpCLEVBQTRCO0FBQzFCLFlBQUkwRSxRQUFRM0UsUUFBUixLQUFxQjRFLFdBQVc1RSxRQUFwQyxFQUE4QztBQUM1Q0Esc0JBQVkyRSxRQUFRM0UsUUFBcEI7QUFDRCxTQUZELE1BRU87QUFDTEEscUJBQVdDLFNBQVg7QUFDRDtBQUNGO0FBQ0YsS0FuQkQsTUFtQk87QUFDTCxVQUFJRCxhQUFhQyxTQUFiLEtBQTJCd0QsS0FBSyxDQUFMLE1BQVksR0FBWixJQUFtQkEsS0FBSyxDQUFMLE1BQVksR0FBMUQsQ0FBSixFQUFvRTtBQUNsRXpEO0FBQ0Q7QUFDRCxVQUFJRCxhQUFhRSxTQUFiLEtBQTJCd0QsS0FBSyxDQUFMLE1BQVksR0FBWixJQUFtQkEsS0FBSyxDQUFMLE1BQVksR0FBMUQsQ0FBSixFQUFvRTtBQUNsRTFEO0FBQ0Q7QUFDRjtBQUNGLEdBNUJEOztBQThCQSxTQUFPLEVBQUNBLGtCQUFELEVBQVdDLGtCQUFYLEVBQVA7QUFDRCIsImZpbGUiOiJtZXJnZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7c3RydWN0dXJlZFBhdGNofSBmcm9tICcuL2NyZWF0ZSc7XG5pbXBvcnQge3BhcnNlUGF0Y2h9IGZyb20gJy4vcGFyc2UnO1xuXG5pbXBvcnQge2FycmF5RXF1YWwsIGFycmF5U3RhcnRzV2l0aH0gZnJvbSAnLi4vdXRpbC9hcnJheSc7XG5cbmV4cG9ydCBmdW5jdGlvbiBjYWxjTGluZUNvdW50KGh1bmspIHtcbiAgY29uc3Qge29sZExpbmVzLCBuZXdMaW5lc30gPSBjYWxjT2xkTmV3TGluZUNvdW50KGh1bmsubGluZXMpO1xuXG4gIGlmIChvbGRMaW5lcyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgaHVuay5vbGRMaW5lcyA9IG9sZExpbmVzO1xuICB9IGVsc2Uge1xuICAgIGRlbGV0ZSBodW5rLm9sZExpbmVzO1xuICB9XG5cbiAgaWYgKG5ld0xpbmVzICE9PSB1bmRlZmluZWQpIHtcbiAgICBodW5rLm5ld0xpbmVzID0gbmV3TGluZXM7XG4gIH0gZWxzZSB7XG4gICAgZGVsZXRlIGh1bmsubmV3TGluZXM7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1lcmdlKG1pbmUsIHRoZWlycywgYmFzZSkge1xuICBtaW5lID0gbG9hZFBhdGNoKG1pbmUsIGJhc2UpO1xuICB0aGVpcnMgPSBsb2FkUGF0Y2godGhlaXJzLCBiYXNlKTtcblxuICBsZXQgcmV0ID0ge307XG5cbiAgLy8gRm9yIGluZGV4IHdlIGp1c3QgbGV0IGl0IHBhc3MgdGhyb3VnaCBhcyBpdCBkb2Vzbid0IGhhdmUgYW55IG5lY2Vzc2FyeSBtZWFuaW5nLlxuICAvLyBMZWF2aW5nIHNhbml0eSBjaGVja3Mgb24gdGhpcyB0byB0aGUgQVBJIGNvbnN1bWVyIHRoYXQgbWF5IGtub3cgbW9yZSBhYm91dCB0aGVcbiAgLy8gbWVhbmluZyBpbiB0aGVpciBvd24gY29udGV4dC5cbiAgaWYgKG1pbmUuaW5kZXggfHwgdGhlaXJzLmluZGV4KSB7XG4gICAgcmV0LmluZGV4ID0gbWluZS5pbmRleCB8fCB0aGVpcnMuaW5kZXg7XG4gIH1cblxuICBpZiAobWluZS5uZXdGaWxlTmFtZSB8fCB0aGVpcnMubmV3RmlsZU5hbWUpIHtcbiAgICBpZiAoIWZpbGVOYW1lQ2hhbmdlZChtaW5lKSkge1xuICAgICAgLy8gTm8gaGVhZGVyIG9yIG5vIGNoYW5nZSBpbiBvdXJzLCB1c2UgdGhlaXJzIChhbmQgb3VycyBpZiB0aGVpcnMgZG9lcyBub3QgZXhpc3QpXG4gICAgICByZXQub2xkRmlsZU5hbWUgPSB0aGVpcnMub2xkRmlsZU5hbWUgfHwgbWluZS5vbGRGaWxlTmFtZTtcbiAgICAgIHJldC5uZXdGaWxlTmFtZSA9IHRoZWlycy5uZXdGaWxlTmFtZSB8fCBtaW5lLm5ld0ZpbGVOYW1lO1xuICAgICAgcmV0Lm9sZEhlYWRlciA9IHRoZWlycy5vbGRIZWFkZXIgfHwgbWluZS5vbGRIZWFkZXI7XG4gICAgICByZXQubmV3SGVhZGVyID0gdGhlaXJzLm5ld0hlYWRlciB8fCBtaW5lLm5ld0hlYWRlcjtcbiAgICB9IGVsc2UgaWYgKCFmaWxlTmFtZUNoYW5nZWQodGhlaXJzKSkge1xuICAgICAgLy8gTm8gaGVhZGVyIG9yIG5vIGNoYW5nZSBpbiB0aGVpcnMsIHVzZSBvdXJzXG4gICAgICByZXQub2xkRmlsZU5hbWUgPSBtaW5lLm9sZEZpbGVOYW1lO1xuICAgICAgcmV0Lm5ld0ZpbGVOYW1lID0gbWluZS5uZXdGaWxlTmFtZTtcbiAgICAgIHJldC5vbGRIZWFkZXIgPSBtaW5lLm9sZEhlYWRlcjtcbiAgICAgIHJldC5uZXdIZWFkZXIgPSBtaW5lLm5ld0hlYWRlcjtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gQm90aCBjaGFuZ2VkLi4uIGZpZ3VyZSBpdCBvdXRcbiAgICAgIHJldC5vbGRGaWxlTmFtZSA9IHNlbGVjdEZpZWxkKHJldCwgbWluZS5vbGRGaWxlTmFtZSwgdGhlaXJzLm9sZEZpbGVOYW1lKTtcbiAgICAgIHJldC5uZXdGaWxlTmFtZSA9IHNlbGVjdEZpZWxkKHJldCwgbWluZS5uZXdGaWxlTmFtZSwgdGhlaXJzLm5ld0ZpbGVOYW1lKTtcbiAgICAgIHJldC5vbGRIZWFkZXIgPSBzZWxlY3RGaWVsZChyZXQsIG1pbmUub2xkSGVhZGVyLCB0aGVpcnMub2xkSGVhZGVyKTtcbiAgICAgIHJldC5uZXdIZWFkZXIgPSBzZWxlY3RGaWVsZChyZXQsIG1pbmUubmV3SGVhZGVyLCB0aGVpcnMubmV3SGVhZGVyKTtcbiAgICB9XG4gIH1cblxuICByZXQuaHVua3MgPSBbXTtcblxuICBsZXQgbWluZUluZGV4ID0gMCxcbiAgICAgIHRoZWlyc0luZGV4ID0gMCxcbiAgICAgIG1pbmVPZmZzZXQgPSAwLFxuICAgICAgdGhlaXJzT2Zmc2V0ID0gMDtcblxuICB3aGlsZSAobWluZUluZGV4IDwgbWluZS5odW5rcy5sZW5ndGggfHwgdGhlaXJzSW5kZXggPCB0aGVpcnMuaHVua3MubGVuZ3RoKSB7XG4gICAgbGV0IG1pbmVDdXJyZW50ID0gbWluZS5odW5rc1ttaW5lSW5kZXhdIHx8IHtvbGRTdGFydDogSW5maW5pdHl9LFxuICAgICAgICB0aGVpcnNDdXJyZW50ID0gdGhlaXJzLmh1bmtzW3RoZWlyc0luZGV4XSB8fCB7b2xkU3RhcnQ6IEluZmluaXR5fTtcblxuICAgIGlmIChodW5rQmVmb3JlKG1pbmVDdXJyZW50LCB0aGVpcnNDdXJyZW50KSkge1xuICAgICAgLy8gVGhpcyBwYXRjaCBkb2VzIG5vdCBvdmVybGFwIHdpdGggYW55IG9mIHRoZSBvdGhlcnMsIHlheS5cbiAgICAgIHJldC5odW5rcy5wdXNoKGNsb25lSHVuayhtaW5lQ3VycmVudCwgbWluZU9mZnNldCkpO1xuICAgICAgbWluZUluZGV4Kys7XG4gICAgICB0aGVpcnNPZmZzZXQgKz0gbWluZUN1cnJlbnQubmV3TGluZXMgLSBtaW5lQ3VycmVudC5vbGRMaW5lcztcbiAgICB9IGVsc2UgaWYgKGh1bmtCZWZvcmUodGhlaXJzQ3VycmVudCwgbWluZUN1cnJlbnQpKSB7XG4gICAgICAvLyBUaGlzIHBhdGNoIGRvZXMgbm90IG92ZXJsYXAgd2l0aCBhbnkgb2YgdGhlIG90aGVycywgeWF5LlxuICAgICAgcmV0Lmh1bmtzLnB1c2goY2xvbmVIdW5rKHRoZWlyc0N1cnJlbnQsIHRoZWlyc09mZnNldCkpO1xuICAgICAgdGhlaXJzSW5kZXgrKztcbiAgICAgIG1pbmVPZmZzZXQgKz0gdGhlaXJzQ3VycmVudC5uZXdMaW5lcyAtIHRoZWlyc0N1cnJlbnQub2xkTGluZXM7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIE92ZXJsYXAsIG1lcmdlIGFzIGJlc3Qgd2UgY2FuXG4gICAgICBsZXQgbWVyZ2VkSHVuayA9IHtcbiAgICAgICAgb2xkU3RhcnQ6IE1hdGgubWluKG1pbmVDdXJyZW50Lm9sZFN0YXJ0LCB0aGVpcnNDdXJyZW50Lm9sZFN0YXJ0KSxcbiAgICAgICAgb2xkTGluZXM6IDAsXG4gICAgICAgIG5ld1N0YXJ0OiBNYXRoLm1pbihtaW5lQ3VycmVudC5uZXdTdGFydCArIG1pbmVPZmZzZXQsIHRoZWlyc0N1cnJlbnQub2xkU3RhcnQgKyB0aGVpcnNPZmZzZXQpLFxuICAgICAgICBuZXdMaW5lczogMCxcbiAgICAgICAgbGluZXM6IFtdXG4gICAgICB9O1xuICAgICAgbWVyZ2VMaW5lcyhtZXJnZWRIdW5rLCBtaW5lQ3VycmVudC5vbGRTdGFydCwgbWluZUN1cnJlbnQubGluZXMsIHRoZWlyc0N1cnJlbnQub2xkU3RhcnQsIHRoZWlyc0N1cnJlbnQubGluZXMpO1xuICAgICAgdGhlaXJzSW5kZXgrKztcbiAgICAgIG1pbmVJbmRleCsrO1xuXG4gICAgICByZXQuaHVua3MucHVzaChtZXJnZWRIdW5rKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gcmV0O1xufVxuXG5mdW5jdGlvbiBsb2FkUGF0Y2gocGFyYW0sIGJhc2UpIHtcbiAgaWYgKHR5cGVvZiBwYXJhbSA9PT0gJ3N0cmluZycpIHtcbiAgICBpZiAoL15AQC9tLnRlc3QocGFyYW0pIHx8ICgvXkluZGV4Oi9tLnRlc3QocGFyYW0pKSkge1xuICAgICAgcmV0dXJuIHBhcnNlUGF0Y2gocGFyYW0pWzBdO1xuICAgIH1cblxuICAgIGlmICghYmFzZSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdNdXN0IHByb3ZpZGUgYSBiYXNlIHJlZmVyZW5jZSBvciBwYXNzIGluIGEgcGF0Y2gnKTtcbiAgICB9XG4gICAgcmV0dXJuIHN0cnVjdHVyZWRQYXRjaCh1bmRlZmluZWQsIHVuZGVmaW5lZCwgYmFzZSwgcGFyYW0pO1xuICB9XG5cbiAgcmV0dXJuIHBhcmFtO1xufVxuXG5mdW5jdGlvbiBmaWxlTmFtZUNoYW5nZWQocGF0Y2gpIHtcbiAgcmV0dXJuIHBhdGNoLm5ld0ZpbGVOYW1lICYmIHBhdGNoLm5ld0ZpbGVOYW1lICE9PSBwYXRjaC5vbGRGaWxlTmFtZTtcbn1cblxuZnVuY3Rpb24gc2VsZWN0RmllbGQoaW5kZXgsIG1pbmUsIHRoZWlycykge1xuICBpZiAobWluZSA9PT0gdGhlaXJzKSB7XG4gICAgcmV0dXJuIG1pbmU7XG4gIH0gZWxzZSB7XG4gICAgaW5kZXguY29uZmxpY3QgPSB0cnVlO1xuICAgIHJldHVybiB7bWluZSwgdGhlaXJzfTtcbiAgfVxufVxuXG5mdW5jdGlvbiBodW5rQmVmb3JlKHRlc3QsIGNoZWNrKSB7XG4gIHJldHVybiB0ZXN0Lm9sZFN0YXJ0IDwgY2hlY2sub2xkU3RhcnRcbiAgICAmJiAodGVzdC5vbGRTdGFydCArIHRlc3Qub2xkTGluZXMpIDwgY2hlY2sub2xkU3RhcnQ7XG59XG5cbmZ1bmN0aW9uIGNsb25lSHVuayhodW5rLCBvZmZzZXQpIHtcbiAgcmV0dXJuIHtcbiAgICBvbGRTdGFydDogaHVuay5vbGRTdGFydCwgb2xkTGluZXM6IGh1bmsub2xkTGluZXMsXG4gICAgbmV3U3RhcnQ6IGh1bmsubmV3U3RhcnQgKyBvZmZzZXQsIG5ld0xpbmVzOiBodW5rLm5ld0xpbmVzLFxuICAgIGxpbmVzOiBodW5rLmxpbmVzXG4gIH07XG59XG5cbmZ1bmN0aW9uIG1lcmdlTGluZXMoaHVuaywgbWluZU9mZnNldCwgbWluZUxpbmVzLCB0aGVpck9mZnNldCwgdGhlaXJMaW5lcykge1xuICAvLyBUaGlzIHdpbGwgZ2VuZXJhbGx5IHJlc3VsdCBpbiBhIGNvbmZsaWN0ZWQgaHVuaywgYnV0IHRoZXJlIGFyZSBjYXNlcyB3aGVyZSB0aGUgY29udGV4dFxuICAvLyBpcyB0aGUgb25seSBvdmVybGFwIHdoZXJlIHdlIGNhbiBzdWNjZXNzZnVsbHkgbWVyZ2UgdGhlIGNvbnRlbnQgaGVyZS5cbiAgbGV0IG1pbmUgPSB7b2Zmc2V0OiBtaW5lT2Zmc2V0LCBsaW5lczogbWluZUxpbmVzLCBpbmRleDogMH0sXG4gICAgICB0aGVpciA9IHtvZmZzZXQ6IHRoZWlyT2Zmc2V0LCBsaW5lczogdGhlaXJMaW5lcywgaW5kZXg6IDB9O1xuXG4gIC8vIEhhbmRsZSBhbnkgbGVhZGluZyBjb250ZW50XG4gIGluc2VydExlYWRpbmcoaHVuaywgbWluZSwgdGhlaXIpO1xuICBpbnNlcnRMZWFkaW5nKGh1bmssIHRoZWlyLCBtaW5lKTtcblxuICAvLyBOb3cgaW4gdGhlIG92ZXJsYXAgY29udGVudC4gU2NhbiB0aHJvdWdoIGFuZCBzZWxlY3QgdGhlIGJlc3QgY2hhbmdlcyBmcm9tIGVhY2guXG4gIHdoaWxlIChtaW5lLmluZGV4IDwgbWluZS5saW5lcy5sZW5ndGggJiYgdGhlaXIuaW5kZXggPCB0aGVpci5saW5lcy5sZW5ndGgpIHtcbiAgICBsZXQgbWluZUN1cnJlbnQgPSBtaW5lLmxpbmVzW21pbmUuaW5kZXhdLFxuICAgICAgICB0aGVpckN1cnJlbnQgPSB0aGVpci5saW5lc1t0aGVpci5pbmRleF07XG5cbiAgICBpZiAoKG1pbmVDdXJyZW50WzBdID09PSAnLScgfHwgbWluZUN1cnJlbnRbMF0gPT09ICcrJylcbiAgICAgICAgJiYgKHRoZWlyQ3VycmVudFswXSA9PT0gJy0nIHx8IHRoZWlyQ3VycmVudFswXSA9PT0gJysnKSkge1xuICAgICAgLy8gQm90aCBtb2RpZmllZCAuLi5cbiAgICAgIG11dHVhbENoYW5nZShodW5rLCBtaW5lLCB0aGVpcik7XG4gICAgfSBlbHNlIGlmIChtaW5lQ3VycmVudFswXSA9PT0gJysnICYmIHRoZWlyQ3VycmVudFswXSA9PT0gJyAnKSB7XG4gICAgICAvLyBNaW5lIGluc2VydGVkXG4gICAgICBodW5rLmxpbmVzLnB1c2goLi4uIGNvbGxlY3RDaGFuZ2UobWluZSkpO1xuICAgIH0gZWxzZSBpZiAodGhlaXJDdXJyZW50WzBdID09PSAnKycgJiYgbWluZUN1cnJlbnRbMF0gPT09ICcgJykge1xuICAgICAgLy8gVGhlaXJzIGluc2VydGVkXG4gICAgICBodW5rLmxpbmVzLnB1c2goLi4uIGNvbGxlY3RDaGFuZ2UodGhlaXIpKTtcbiAgICB9IGVsc2UgaWYgKG1pbmVDdXJyZW50WzBdID09PSAnLScgJiYgdGhlaXJDdXJyZW50WzBdID09PSAnICcpIHtcbiAgICAgIC8vIE1pbmUgcmVtb3ZlZCBvciBlZGl0ZWRcbiAgICAgIHJlbW92YWwoaHVuaywgbWluZSwgdGhlaXIpO1xuICAgIH0gZWxzZSBpZiAodGhlaXJDdXJyZW50WzBdID09PSAnLScgJiYgbWluZUN1cnJlbnRbMF0gPT09ICcgJykge1xuICAgICAgLy8gVGhlaXIgcmVtb3ZlZCBvciBlZGl0ZWRcbiAgICAgIHJlbW92YWwoaHVuaywgdGhlaXIsIG1pbmUsIHRydWUpO1xuICAgIH0gZWxzZSBpZiAobWluZUN1cnJlbnQgPT09IHRoZWlyQ3VycmVudCkge1xuICAgICAgLy8gQ29udGV4dCBpZGVudGl0eVxuICAgICAgaHVuay5saW5lcy5wdXNoKG1pbmVDdXJyZW50KTtcbiAgICAgIG1pbmUuaW5kZXgrKztcbiAgICAgIHRoZWlyLmluZGV4Kys7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIENvbnRleHQgbWlzbWF0Y2hcbiAgICAgIGNvbmZsaWN0KGh1bmssIGNvbGxlY3RDaGFuZ2UobWluZSksIGNvbGxlY3RDaGFuZ2UodGhlaXIpKTtcbiAgICB9XG4gIH1cblxuICAvLyBOb3cgcHVzaCBhbnl0aGluZyB0aGF0IG1heSBiZSByZW1haW5pbmdcbiAgaW5zZXJ0VHJhaWxpbmcoaHVuaywgbWluZSk7XG4gIGluc2VydFRyYWlsaW5nKGh1bmssIHRoZWlyKTtcblxuICBjYWxjTGluZUNvdW50KGh1bmspO1xufVxuXG5mdW5jdGlvbiBtdXR1YWxDaGFuZ2UoaHVuaywgbWluZSwgdGhlaXIpIHtcbiAgbGV0IG15Q2hhbmdlcyA9IGNvbGxlY3RDaGFuZ2UobWluZSksXG4gICAgICB0aGVpckNoYW5nZXMgPSBjb2xsZWN0Q2hhbmdlKHRoZWlyKTtcblxuICBpZiAoYWxsUmVtb3ZlcyhteUNoYW5nZXMpICYmIGFsbFJlbW92ZXModGhlaXJDaGFuZ2VzKSkge1xuICAgIC8vIFNwZWNpYWwgY2FzZSBmb3IgcmVtb3ZlIGNoYW5nZXMgdGhhdCBhcmUgc3VwZXJzZXRzIG9mIG9uZSBhbm90aGVyXG4gICAgaWYgKGFycmF5U3RhcnRzV2l0aChteUNoYW5nZXMsIHRoZWlyQ2hhbmdlcylcbiAgICAgICAgJiYgc2tpcFJlbW92ZVN1cGVyc2V0KHRoZWlyLCBteUNoYW5nZXMsIG15Q2hhbmdlcy5sZW5ndGggLSB0aGVpckNoYW5nZXMubGVuZ3RoKSkge1xuICAgICAgaHVuay5saW5lcy5wdXNoKC4uLiBteUNoYW5nZXMpO1xuICAgICAgcmV0dXJuO1xuICAgIH0gZWxzZSBpZiAoYXJyYXlTdGFydHNXaXRoKHRoZWlyQ2hhbmdlcywgbXlDaGFuZ2VzKVxuICAgICAgICAmJiBza2lwUmVtb3ZlU3VwZXJzZXQobWluZSwgdGhlaXJDaGFuZ2VzLCB0aGVpckNoYW5nZXMubGVuZ3RoIC0gbXlDaGFuZ2VzLmxlbmd0aCkpIHtcbiAgICAgIGh1bmsubGluZXMucHVzaCguLi4gdGhlaXJDaGFuZ2VzKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gIH0gZWxzZSBpZiAoYXJyYXlFcXVhbChteUNoYW5nZXMsIHRoZWlyQ2hhbmdlcykpIHtcbiAgICBodW5rLmxpbmVzLnB1c2goLi4uIG15Q2hhbmdlcyk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgY29uZmxpY3QoaHVuaywgbXlDaGFuZ2VzLCB0aGVpckNoYW5nZXMpO1xufVxuXG5mdW5jdGlvbiByZW1vdmFsKGh1bmssIG1pbmUsIHRoZWlyLCBzd2FwKSB7XG4gIGxldCBteUNoYW5nZXMgPSBjb2xsZWN0Q2hhbmdlKG1pbmUpLFxuICAgICAgdGhlaXJDaGFuZ2VzID0gY29sbGVjdENvbnRleHQodGhlaXIsIG15Q2hhbmdlcyk7XG4gIGlmICh0aGVpckNoYW5nZXMubWVyZ2VkKSB7XG4gICAgaHVuay5saW5lcy5wdXNoKC4uLiB0aGVpckNoYW5nZXMubWVyZ2VkKTtcbiAgfSBlbHNlIHtcbiAgICBjb25mbGljdChodW5rLCBzd2FwID8gdGhlaXJDaGFuZ2VzIDogbXlDaGFuZ2VzLCBzd2FwID8gbXlDaGFuZ2VzIDogdGhlaXJDaGFuZ2VzKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBjb25mbGljdChodW5rLCBtaW5lLCB0aGVpcikge1xuICBodW5rLmNvbmZsaWN0ID0gdHJ1ZTtcbiAgaHVuay5saW5lcy5wdXNoKHtcbiAgICBjb25mbGljdDogdHJ1ZSxcbiAgICBtaW5lOiBtaW5lLFxuICAgIHRoZWlyczogdGhlaXJcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGluc2VydExlYWRpbmcoaHVuaywgaW5zZXJ0LCB0aGVpcikge1xuICB3aGlsZSAoaW5zZXJ0Lm9mZnNldCA8IHRoZWlyLm9mZnNldCAmJiBpbnNlcnQuaW5kZXggPCBpbnNlcnQubGluZXMubGVuZ3RoKSB7XG4gICAgbGV0IGxpbmUgPSBpbnNlcnQubGluZXNbaW5zZXJ0LmluZGV4KytdO1xuICAgIGh1bmsubGluZXMucHVzaChsaW5lKTtcbiAgICBpbnNlcnQub2Zmc2V0Kys7XG4gIH1cbn1cbmZ1bmN0aW9uIGluc2VydFRyYWlsaW5nKGh1bmssIGluc2VydCkge1xuICB3aGlsZSAoaW5zZXJ0LmluZGV4IDwgaW5zZXJ0LmxpbmVzLmxlbmd0aCkge1xuICAgIGxldCBsaW5lID0gaW5zZXJ0LmxpbmVzW2luc2VydC5pbmRleCsrXTtcbiAgICBodW5rLmxpbmVzLnB1c2gobGluZSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gY29sbGVjdENoYW5nZShzdGF0ZSkge1xuICBsZXQgcmV0ID0gW10sXG4gICAgICBvcGVyYXRpb24gPSBzdGF0ZS5saW5lc1tzdGF0ZS5pbmRleF1bMF07XG4gIHdoaWxlIChzdGF0ZS5pbmRleCA8IHN0YXRlLmxpbmVzLmxlbmd0aCkge1xuICAgIGxldCBsaW5lID0gc3RhdGUubGluZXNbc3RhdGUuaW5kZXhdO1xuXG4gICAgLy8gR3JvdXAgYWRkaXRpb25zIHRoYXQgYXJlIGltbWVkaWF0ZWx5IGFmdGVyIHN1YnRyYWN0aW9ucyBhbmQgdHJlYXQgdGhlbSBhcyBvbmUgXCJhdG9taWNcIiBtb2RpZnkgY2hhbmdlLlxuICAgIGlmIChvcGVyYXRpb24gPT09ICctJyAmJiBsaW5lWzBdID09PSAnKycpIHtcbiAgICAgIG9wZXJhdGlvbiA9ICcrJztcbiAgICB9XG5cbiAgICBpZiAob3BlcmF0aW9uID09PSBsaW5lWzBdKSB7XG4gICAgICByZXQucHVzaChsaW5lKTtcbiAgICAgIHN0YXRlLmluZGV4Kys7XG4gICAgfSBlbHNlIHtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiByZXQ7XG59XG5mdW5jdGlvbiBjb2xsZWN0Q29udGV4dChzdGF0ZSwgbWF0Y2hDaGFuZ2VzKSB7XG4gIGxldCBjaGFuZ2VzID0gW10sXG4gICAgICBtZXJnZWQgPSBbXSxcbiAgICAgIG1hdGNoSW5kZXggPSAwLFxuICAgICAgY29udGV4dENoYW5nZXMgPSBmYWxzZSxcbiAgICAgIGNvbmZsaWN0ZWQgPSBmYWxzZTtcbiAgd2hpbGUgKG1hdGNoSW5kZXggPCBtYXRjaENoYW5nZXMubGVuZ3RoXG4gICAgICAgICYmIHN0YXRlLmluZGV4IDwgc3RhdGUubGluZXMubGVuZ3RoKSB7XG4gICAgbGV0IGNoYW5nZSA9IHN0YXRlLmxpbmVzW3N0YXRlLmluZGV4XSxcbiAgICAgICAgbWF0Y2ggPSBtYXRjaENoYW5nZXNbbWF0Y2hJbmRleF07XG5cbiAgICAvLyBPbmNlIHdlJ3ZlIGhpdCBvdXIgYWRkLCB0aGVuIHdlIGFyZSBkb25lXG4gICAgaWYgKG1hdGNoWzBdID09PSAnKycpIHtcbiAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIGNvbnRleHRDaGFuZ2VzID0gY29udGV4dENoYW5nZXMgfHwgY2hhbmdlWzBdICE9PSAnICc7XG5cbiAgICBtZXJnZWQucHVzaChtYXRjaCk7XG4gICAgbWF0Y2hJbmRleCsrO1xuXG4gICAgLy8gQ29uc3VtZSBhbnkgYWRkaXRpb25zIGluIHRoZSBvdGhlciBibG9jayBhcyBhIGNvbmZsaWN0IHRvIGF0dGVtcHRcbiAgICAvLyB0byBwdWxsIGluIHRoZSByZW1haW5pbmcgY29udGV4dCBhZnRlciB0aGlzXG4gICAgaWYgKGNoYW5nZVswXSA9PT0gJysnKSB7XG4gICAgICBjb25mbGljdGVkID0gdHJ1ZTtcblxuICAgICAgd2hpbGUgKGNoYW5nZVswXSA9PT0gJysnKSB7XG4gICAgICAgIGNoYW5nZXMucHVzaChjaGFuZ2UpO1xuICAgICAgICBjaGFuZ2UgPSBzdGF0ZS5saW5lc1srK3N0YXRlLmluZGV4XTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAobWF0Y2guc3Vic3RyKDEpID09PSBjaGFuZ2Uuc3Vic3RyKDEpKSB7XG4gICAgICBjaGFuZ2VzLnB1c2goY2hhbmdlKTtcbiAgICAgIHN0YXRlLmluZGV4Kys7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbmZsaWN0ZWQgPSB0cnVlO1xuICAgIH1cbiAgfVxuXG4gIGlmICgobWF0Y2hDaGFuZ2VzW21hdGNoSW5kZXhdIHx8ICcnKVswXSA9PT0gJysnXG4gICAgICAmJiBjb250ZXh0Q2hhbmdlcykge1xuICAgIGNvbmZsaWN0ZWQgPSB0cnVlO1xuICB9XG5cbiAgaWYgKGNvbmZsaWN0ZWQpIHtcbiAgICByZXR1cm4gY2hhbmdlcztcbiAgfVxuXG4gIHdoaWxlIChtYXRjaEluZGV4IDwgbWF0Y2hDaGFuZ2VzLmxlbmd0aCkge1xuICAgIG1lcmdlZC5wdXNoKG1hdGNoQ2hhbmdlc1ttYXRjaEluZGV4KytdKTtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgbWVyZ2VkLFxuICAgIGNoYW5nZXNcbiAgfTtcbn1cblxuZnVuY3Rpb24gYWxsUmVtb3ZlcyhjaGFuZ2VzKSB7XG4gIHJldHVybiBjaGFuZ2VzLnJlZHVjZShmdW5jdGlvbihwcmV2LCBjaGFuZ2UpIHtcbiAgICByZXR1cm4gcHJldiAmJiBjaGFuZ2VbMF0gPT09ICctJztcbiAgfSwgdHJ1ZSk7XG59XG5mdW5jdGlvbiBza2lwUmVtb3ZlU3VwZXJzZXQoc3RhdGUsIHJlbW92ZUNoYW5nZXMsIGRlbHRhKSB7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgZGVsdGE7IGkrKykge1xuICAgIGxldCBjaGFuZ2VDb250ZW50ID0gcmVtb3ZlQ2hhbmdlc1tyZW1vdmVDaGFuZ2VzLmxlbmd0aCAtIGRlbHRhICsgaV0uc3Vic3RyKDEpO1xuICAgIGlmIChzdGF0ZS5saW5lc1tzdGF0ZS5pbmRleCArIGldICE9PSAnICcgKyBjaGFuZ2VDb250ZW50KSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgc3RhdGUuaW5kZXggKz0gZGVsdGE7XG4gIHJldHVybiB0cnVlO1xufVxuXG5mdW5jdGlvbiBjYWxjT2xkTmV3TGluZUNvdW50KGxpbmVzKSB7XG4gIGxldCBvbGRMaW5lcyA9IDA7XG4gIGxldCBuZXdMaW5lcyA9IDA7XG5cbiAgbGluZXMuZm9yRWFjaChmdW5jdGlvbihsaW5lKSB7XG4gICAgaWYgKHR5cGVvZiBsaW5lICE9PSAnc3RyaW5nJykge1xuICAgICAgbGV0IG15Q291bnQgPSBjYWxjT2xkTmV3TGluZUNvdW50KGxpbmUubWluZSk7XG4gICAgICBsZXQgdGhlaXJDb3VudCA9IGNhbGNPbGROZXdMaW5lQ291bnQobGluZS50aGVpcnMpO1xuXG4gICAgICBpZiAob2xkTGluZXMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBpZiAobXlDb3VudC5vbGRMaW5lcyA9PT0gdGhlaXJDb3VudC5vbGRMaW5lcykge1xuICAgICAgICAgIG9sZExpbmVzICs9IG15Q291bnQub2xkTGluZXM7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgb2xkTGluZXMgPSB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKG5ld0xpbmVzICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgaWYgKG15Q291bnQubmV3TGluZXMgPT09IHRoZWlyQ291bnQubmV3TGluZXMpIHtcbiAgICAgICAgICBuZXdMaW5lcyArPSBteUNvdW50Lm5ld0xpbmVzO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIG5ld0xpbmVzID0gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChuZXdMaW5lcyAhPT0gdW5kZWZpbmVkICYmIChsaW5lWzBdID09PSAnKycgfHwgbGluZVswXSA9PT0gJyAnKSkge1xuICAgICAgICBuZXdMaW5lcysrO1xuICAgICAgfVxuICAgICAgaWYgKG9sZExpbmVzICE9PSB1bmRlZmluZWQgJiYgKGxpbmVbMF0gPT09ICctJyB8fCBsaW5lWzBdID09PSAnICcpKSB7XG4gICAgICAgIG9sZExpbmVzKys7XG4gICAgICB9XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4ge29sZExpbmVzLCBuZXdMaW5lc307XG59XG4iXX0=
//
//
///***/ }),
///* 14 */
///***/ (function(module, exports, __webpack_require__) {
//
//    /*istanbul ignore start*/'use strict';
//
//    Object.defineProperty(exports, "__esModule", {
//      value: true
//    });
//    exports. /*istanbul ignore end*/structuredPatch = structuredPatch;
//    /*istanbul ignore start*/exports. /*istanbul ignore end*/createTwoFilesPatch = createTwoFilesPatch;
//    /*istanbul ignore start*/exports. /*istanbul ignore end*/createPatch = createPatch;
//
//    var /*istanbul ignore start*/_line = __webpack_require__(5) /*istanbul ignore end*/;
//
//    /*istanbul ignore start*/function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }
//
//    /*istanbul ignore end*/function structuredPatch(oldFileName, newFileName, oldStr, newStr, oldHeader, newHeader, options) {
//      if (!options) {
//        options = {};
//      }
//      if (typeof options.context === 'undefined') {
//        options.context = 4;
//      }
//
//      var diff = /*istanbul ignore start*/(0, _line.diffLines) /*istanbul ignore end*/(oldStr, newStr, options);
//      diff.push({ value: '', lines: [] }); // Append an empty value to make cleanup easier
//
//      function contextLines(lines) {
//        return lines.map(function (entry) {
//          return ' ' + entry;
//        });
//      }
//
//      var hunks = [];
//      var oldRangeStart = 0,
//          newRangeStart = 0,
//          curRange = [],
//          oldLine = 1,
//          newLine = 1;
//
//      /*istanbul ignore start*/var _loop = function _loop( /*istanbul ignore end*/i) {
//        var current = diff[i],
//            lines = current.lines || current.value.replace(/\n$/, '').split('\n');
//        current.lines = lines;
//
//        if (current.added || current.removed) {
//          /*istanbul ignore start*/var _curRange;
//
//          /*istanbul ignore end*/ // If we have previous context, start with that
//          if (!oldRangeStart) {
//            var prev = diff[i - 1];
//            oldRangeStart = oldLine;
//            newRangeStart = newLine;
//
//            if (prev) {
//              curRange = options.context > 0 ? contextLines(prev.lines.slice(-options.context)) : [];
//              oldRangeStart -= curRange.length;
//              newRangeStart -= curRange.length;
//            }
//          }
//
//          // Output our changes
//          /*istanbul ignore start*/(_curRange = /*istanbul ignore end*/curRange).push. /*istanbul ignore start*/apply /*istanbul ignore end*/( /*istanbul ignore start*/_curRange /*istanbul ignore end*/, /*istanbul ignore start*/_toConsumableArray( /*istanbul ignore end*/lines.map(function (entry) {
//            return (current.added ? '+' : '-') + entry;
//          })));
//
//          // Track the updated file position
//          if (current.added) {
//            newLine += lines.length;
//          } else {
//            oldLine += lines.length;
//          }
//        } else {
//          // Identical context lines. Track line changes
//          if (oldRangeStart) {
//            // Close out any changes that have been output (or join overlapping)
//            if (lines.length <= options.context * 2 && i < diff.length - 2) {
//              /*istanbul ignore start*/var _curRange2;
//
//              /*istanbul ignore end*/ // Overlapping
//              /*istanbul ignore start*/(_curRange2 = /*istanbul ignore end*/curRange).push. /*istanbul ignore start*/apply /*istanbul ignore end*/( /*istanbul ignore start*/_curRange2 /*istanbul ignore end*/, /*istanbul ignore start*/_toConsumableArray( /*istanbul ignore end*/contextLines(lines)));
//            } else {
//              /*istanbul ignore start*/var _curRange3;
//
//              /*istanbul ignore end*/ // end the range and output
//              var contextSize = Math.min(lines.length, options.context);
//              /*istanbul ignore start*/(_curRange3 = /*istanbul ignore end*/curRange).push. /*istanbul ignore start*/apply /*istanbul ignore end*/( /*istanbul ignore start*/_curRange3 /*istanbul ignore end*/, /*istanbul ignore start*/_toConsumableArray( /*istanbul ignore end*/contextLines(lines.slice(0, contextSize))));
//
//              var hunk = {
//                oldStart: oldRangeStart,
//                oldLines: oldLine - oldRangeStart + contextSize,
//                newStart: newRangeStart,
//                newLines: newLine - newRangeStart + contextSize,
//                lines: curRange
//              };
//              if (i >= diff.length - 2 && lines.length <= options.context) {
//                // EOF is inside this hunk
//                var oldEOFNewline = /\n$/.test(oldStr);
//                var newEOFNewline = /\n$/.test(newStr);
//                if (lines.length == 0 && !oldEOFNewline) {
//                  // special case: old has no eol and no trailing context; no-nl can end up before adds
//                  curRange.splice(hunk.oldLines, 0, '\\ No newline at end of file');
//                } else if (!oldEOFNewline || !newEOFNewline) {
//                  curRange.push('\\ No newline at end of file');
//                }
//              }
//              hunks.push(hunk);
//
//              oldRangeStart = 0;
//              newRangeStart = 0;
//              curRange = [];
//            }
//          }
//          oldLine += lines.length;
//          newLine += lines.length;
//        }
//      };
//
//      for (var i = 0; i < diff.length; i++) {
//        /*istanbul ignore start*/_loop( /*istanbul ignore end*/i);
//      }
//
//      return {
//        oldFileName: oldFileName, newFileName: newFileName,
//        oldHeader: oldHeader, newHeader: newHeader,
//        hunks: hunks
//      };
//    }
//
//    function createTwoFilesPatch(oldFileName, newFileName, oldStr, newStr, oldHeader, newHeader, options) {
//      var diff = structuredPatch(oldFileName, newFileName, oldStr, newStr, oldHeader, newHeader, options);
//
//      var ret = [];
//      if (oldFileName == newFileName) {
//        ret.push('Index: ' + oldFileName);
//      }
//      ret.push('===================================================================');
//      ret.push('--- ' + diff.oldFileName + (typeof diff.oldHeader === 'undefined' ? '' : '\t' + diff.oldHeader));
//      ret.push('+++ ' + diff.newFileName + (typeof diff.newHeader === 'undefined' ? '' : '\t' + diff.newHeader));
//
//      for (var i = 0; i < diff.hunks.length; i++) {
//        var hunk = diff.hunks[i];
//        ret.push('@@ -' + hunk.oldStart + ',' + hunk.oldLines + ' +' + hunk.newStart + ',' + hunk.newLines + ' @@');
//        ret.push.apply(ret, hunk.lines);
//      }
//
//      return ret.join('\n') + '\n';
//    }
//
//    function createPatch(fileName, oldStr, newStr, oldHeader, newHeader, options) {
//      return createTwoFilesPatch(fileName, fileName, oldStr, newStr, oldHeader, newHeader, options);
//    }
//    //# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9wYXRjaC9jcmVhdGUuanMiXSwibmFtZXMiOlsic3RydWN0dXJlZFBhdGNoIiwiY3JlYXRlVHdvRmlsZXNQYXRjaCIsImNyZWF0ZVBhdGNoIiwib2xkRmlsZU5hbWUiLCJuZXdGaWxlTmFtZSIsIm9sZFN0ciIsIm5ld1N0ciIsIm9sZEhlYWRlciIsIm5ld0hlYWRlciIsIm9wdGlvbnMiLCJjb250ZXh0IiwiZGlmZiIsInB1c2giLCJ2YWx1ZSIsImxpbmVzIiwiY29udGV4dExpbmVzIiwibWFwIiwiZW50cnkiLCJodW5rcyIsIm9sZFJhbmdlU3RhcnQiLCJuZXdSYW5nZVN0YXJ0IiwiY3VyUmFuZ2UiLCJvbGRMaW5lIiwibmV3TGluZSIsImkiLCJjdXJyZW50IiwicmVwbGFjZSIsInNwbGl0IiwiYWRkZWQiLCJyZW1vdmVkIiwicHJldiIsInNsaWNlIiwibGVuZ3RoIiwiY29udGV4dFNpemUiLCJNYXRoIiwibWluIiwiaHVuayIsIm9sZFN0YXJ0Iiwib2xkTGluZXMiLCJuZXdTdGFydCIsIm5ld0xpbmVzIiwib2xkRU9GTmV3bGluZSIsInRlc3QiLCJuZXdFT0ZOZXdsaW5lIiwic3BsaWNlIiwicmV0IiwiYXBwbHkiLCJqb2luIiwiZmlsZU5hbWUiXSwibWFwcGluZ3MiOiI7Ozs7O2dDQUVnQkEsZSxHQUFBQSxlO3lEQWlHQUMsbUIsR0FBQUEsbUI7eURBd0JBQyxXLEdBQUFBLFc7O0FBM0hoQjs7Ozt1QkFFTyxTQUFTRixlQUFULENBQXlCRyxXQUF6QixFQUFzQ0MsV0FBdEMsRUFBbURDLE1BQW5ELEVBQTJEQyxNQUEzRCxFQUFtRUMsU0FBbkUsRUFBOEVDLFNBQTlFLEVBQXlGQyxPQUF6RixFQUFrRztBQUN2RyxNQUFJLENBQUNBLE9BQUwsRUFBYztBQUNaQSxjQUFVLEVBQVY7QUFDRDtBQUNELE1BQUksT0FBT0EsUUFBUUMsT0FBZixLQUEyQixXQUEvQixFQUE0QztBQUMxQ0QsWUFBUUMsT0FBUixHQUFrQixDQUFsQjtBQUNEOztBQUVE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LFNBQS9DLEVBQTBEQyxTQUExRCxFQUFxRUMsT0FBckUsRUFBOEU7QUFDbkYsU0FBT1Isb0JBQW9CK0MsUUFBcEIsRUFBOEJBLFFBQTlCLEVBQXdDM0MsTUFBeEMsRUFBZ0RDLE1BQWhELEVBQXdEQyxTQUF4RCxFQUFtRUMsU0FBbkUsRUFBOEVDLE9BQTlFLENBQVA7QUFDRCIsImZpbGUiOiJjcmVhdGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge2RpZmZMaW5lc30gZnJvbSAnLi4vZGlmZi9saW5lJztcblxuZXhwb3J0IGZ1bmN0aW9uIHN0cnVjdHVyZWRQYXRjaChvbGRGaWxlTmFtZSwgbmV3RmlsZU5hbWUsIG9sZFN0ciwgbmV3U3RyLCBvbGRIZWFkZXIsIG5ld0hlYWRlciwgb3B0aW9ucykge1xuICBpZiAoIW9wdGlvbnMpIHtcbiAgICBvcHRpb25zID0ge307XG4gIH1cbiAgaWYgKHR5cGVvZiBvcHRpb25zLmNvbnRleHQgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgb3B0aW9ucy5jb250ZXh0ID0gNDtcbiAgfVxuXG4gIGNvbnN0IGRpZmYgPSBkaWZmTGluZXMob2xkU3RyLCBuZXdTdHIsIG9wdGlvbnMpO1xuICBkaWZmLnB1c2goe3ZhbHVlOiAnJywgbGluZXM6IFtdfSk7ICAgLy8gQXBwZW5kIGFuIGVtcHR5IHZhbHVlIHRvIG1ha2UgY2xlYW51cCBlYXNpZXJcblxuICBmdW5jdGlvbiBjb250ZXh0TGluZXMobGluZXMpIHtcbiAgICByZXR1cm4gbGluZXMubWFwKGZ1bmN0aW9uKGVudHJ5KSB7IHJldHVybiAnICcgKyBlbnRyeTsgfSk7XG4gIH1cblxuICBsZXQgaHVua3MgPSBbXTtcbiAgbGV0IG9sZFJhbmdlU3RhcnQgPSAwLCBuZXdSYW5nZVN0YXJ0ID0gMCwgY3VyUmFuZ2UgPSBbXSxcbiAgICAgIG9sZExpbmUgPSAxLCBuZXdMaW5lID0gMTtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBkaWZmLmxlbmd0aDsgaSsrKSB7XG4gICAgY29uc3QgY3VycmVudCA9IGRpZmZbaV0sXG4gICAgICAgICAgbGluZXMgPSBjdXJyZW50LmxpbmVzIHx8IGN1cnJlbnQudmFsdWUucmVwbGFjZSgvXFxuJC8sICcnKS5zcGxpdCgnXFxuJyk7XG4gICAgY3VycmVudC5saW5lcyA9IGxpbmVzO1xuXG4gICAgaWYgKGN1cnJlbnQuYWRkZWQgfHwgY3VycmVudC5yZW1vdmVkKSB7XG4gICAgICAvLyBJZiB3ZSBoYXZlIHByZXZpb3VzIGNvbnRleHQsIHN0YXJ0IHdpdGggdGhhdFxuICAgICAgaWYgKCFvbGRSYW5nZVN0YXJ0KSB7XG4gICAgICAgIGNvbnN0IHByZXYgPSBkaWZmW2kgLSAxXTtcbiAgICAgICAgb2xkUmFuZ2VTdGFydCA9IG9sZExpbmU7XG4gICAgICAgIG5ld1JhbmdlU3RhcnQgPSBuZXdMaW5lO1xuXG4gICAgICAgIGlmIChwcmV2KSB7XG4gICAgICAgICAgY3VyUmFuZ2UgPSBvcHRpb25zLmNvbnRleHQgPiAwID8gY29udGV4dExpbmVzKHByZXYubGluZXMuc2xpY2UoLW9wdGlvbnMuY29udGV4dCkpIDogW107XG4gICAgICAgICAgb2xkUmFuZ2VTdGFydCAtPSBjdXJSYW5nZS5sZW5ndGg7XG4gICAgICAgICAgbmV3UmFuZ2VTdGFydCAtPSBjdXJSYW5nZS5sZW5ndGg7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gT3V0cHV0IG91ciBjaGFuZ2VzXG4gICAgICBjdXJSYW5nZS5wdXNoKC4uLiBsaW5lcy5tYXAoZnVuY3Rpb24oZW50cnkpIHtcbiAgICAgICAgcmV0dXJuIChjdXJyZW50LmFkZGVkID8gJysnIDogJy0nKSArIGVudHJ5O1xuICAgICAgfSkpO1xuXG4gICAgICAvLyBUcmFjayB0aGUgdXBkYXRlZCBmaWxlIHBvc2l0aW9uXG4gICAgICBpZiAoY3VycmVudC5hZGRlZCkge1xuICAgICAgICBuZXdMaW5lICs9IGxpbmVzLmxlbmd0aDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG9sZExpbmUgKz0gbGluZXMubGVuZ3RoO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBJZGVudGljYWwgY29udGV4dCBsaW5lcy4gVHJhY2sgbGluZSBjaGFuZ2VzXG4gICAgICBpZiAob2xkUmFuZ2VTdGFydCkge1xuICAgICAgICAvLyBDbG9zZSBvdXQgYW55IGNoYW5nZXMgdGhhdCBoYXZlIGJlZW4gb3V0cHV0IChvciBqb2luIG92ZXJsYXBwaW5nKVxuICAgICAgICBpZiAobGluZXMubGVuZ3RoIDw9IG9wdGlvbnMuY29udGV4dCAqIDIgJiYgaSA8IGRpZmYubGVuZ3RoIC0gMikge1xuICAgICAgICAgIC8vIE92ZXJsYXBwaW5nXG4gICAgICAgICAgY3VyUmFuZ2UucHVzaCguLi4gY29udGV4dExpbmVzKGxpbmVzKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gZW5kIHRoZSByYW5nZSBhbmQgb3V0cHV0XG4gICAgICAgICAgbGV0IGNvbnRleHRTaXplID0gTWF0aC5taW4obGluZXMubGVuZ3RoLCBvcHRpb25zLmNvbnRleHQpO1xuICAgICAgICAgIGN1clJhbmdlLnB1c2goLi4uIGNvbnRleHRMaW5lcyhsaW5lcy5zbGljZSgwLCBjb250ZXh0U2l6ZSkpKTtcblxuICAgICAgICAgIGxldCBodW5rID0ge1xuICAgICAgICAgICAgb2xkU3RhcnQ6IG9sZFJhbmdlU3RhcnQsXG4gICAgICAgICAgICBvbGRMaW5lczogKG9sZExpbmUgLSBvbGRSYW5nZVN0YXJ0ICsgY29udGV4dFNpemUpLFxuICAgICAgICAgICAgbmV3U3RhcnQ6IG5ld1JhbmdlU3RhcnQsXG4gICAgICAgICAgICBuZXdMaW5lczogKG5ld0xpbmUgLSBuZXdSYW5nZVN0YXJ0ICsgY29udGV4dFNpemUpLFxuICAgICAgICAgICAgbGluZXM6IGN1clJhbmdlXG4gICAgICAgICAgfTtcbiAgICAgICAgICBpZiAoaSA+PSBkaWZmLmxlbmd0aCAtIDIgJiYgbGluZXMubGVuZ3RoIDw9IG9wdGlvbnMuY29udGV4dCkge1xuICAgICAgICAgICAgLy8gRU9GIGlzIGluc2lkZSB0aGlzIGh1bmtcbiAgICAgICAgICAgIGxldCBvbGRFT0ZOZXdsaW5lID0gKC9cXG4kLy50ZXN0KG9sZFN0cikpO1xuICAgICAgICAgICAgbGV0IG5ld0VPRk5ld2xpbmUgPSAoL1xcbiQvLnRlc3QobmV3U3RyKSk7XG4gICAgICAgICAgICBpZiAobGluZXMubGVuZ3RoID09IDAgJiYgIW9sZEVPRk5ld2xpbmUpIHtcbiAgICAgICAgICAgICAgLy8gc3BlY2lhbCBjYXNlOiBvbGQgaGFzIG5vIGVvbCBhbmQgbm8gdHJhaWxpbmcgY29udGV4dDsgbm8tbmwgY2FuIGVuZCB1cCBiZWZvcmUgYWRkc1xuICAgICAgICAgICAgICBjdXJSYW5nZS5zcGxpY2UoaHVuay5vbGRMaW5lcywgMCwgJ1xcXFwgTm8gbmV3bGluZSBhdCBlbmQgb2YgZmlsZScpO1xuICAgICAgICAgICAgfSBlbHNlIGlmICghb2xkRU9GTmV3bGluZSB8fCAhbmV3RU9GTmV3bGluZSkge1xuICAgICAgICAgICAgICBjdXJSYW5nZS5wdXNoKCdcXFxcIE5vIG5ld2xpbmUgYXQgZW5kIG9mIGZpbGUnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgaHVua3MucHVzaChodW5rKTtcblxuICAgICAgICAgIG9sZFJhbmdlU3RhcnQgPSAwO1xuICAgICAgICAgIG5ld1JhbmdlU3RhcnQgPSAwO1xuICAgICAgICAgIGN1clJhbmdlID0gW107XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIG9sZExpbmUgKz0gbGluZXMubGVuZ3RoO1xuICAgICAgbmV3TGluZSArPSBsaW5lcy5sZW5ndGg7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBvbGRGaWxlTmFtZTogb2xkRmlsZU5hbWUsIG5ld0ZpbGVOYW1lOiBuZXdGaWxlTmFtZSxcbiAgICBvbGRIZWFkZXI6IG9sZEhlYWRlciwgbmV3SGVhZGVyOiBuZXdIZWFkZXIsXG4gICAgaHVua3M6IGh1bmtzXG4gIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVUd29GaWxlc1BhdGNoKG9sZEZpbGVOYW1lLCBuZXdGaWxlTmFtZSwgb2xkU3RyLCBuZXdTdHIsIG9sZEhlYWRlciwgbmV3SGVhZGVyLCBvcHRpb25zKSB7XG4gIGNvbnN0IGRpZmYgPSBzdHJ1Y3R1cmVkUGF0Y2gob2xkRmlsZU5hbWUsIG5ld0ZpbGVOYW1lLCBvbGRTdHIsIG5ld1N0ciwgb2xkSGVhZGVyLCBuZXdIZWFkZXIsIG9wdGlvbnMpO1xuXG4gIGNvbnN0IHJldCA9IFtdO1xuICBpZiAob2xkRmlsZU5hbWUgPT0gbmV3RmlsZU5hbWUpIHtcbiAgICByZXQucHVzaCgnSW5kZXg6ICcgKyBvbGRGaWxlTmFtZSk7XG4gIH1cbiAgcmV0LnB1c2goJz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0nKTtcbiAgcmV0LnB1c2goJy0tLSAnICsgZGlmZi5vbGRGaWxlTmFtZSArICh0eXBlb2YgZGlmZi5vbGRIZWFkZXIgPT09ICd1bmRlZmluZWQnID8gJycgOiAnXFx0JyArIGRpZmYub2xkSGVhZGVyKSk7XG4gIHJldC5wdXNoKCcrKysgJyArIGRpZmYubmV3RmlsZU5hbWUgKyAodHlwZW9mIGRpZmYubmV3SGVhZGVyID09PSAndW5kZWZpbmVkJyA/ICcnIDogJ1xcdCcgKyBkaWZmLm5ld0hlYWRlcikpO1xuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgZGlmZi5odW5rcy5sZW5ndGg7IGkrKykge1xuICAgIGNvbnN0IGh1bmsgPSBkaWZmLmh1bmtzW2ldO1xuICAgIHJldC5wdXNoKFxuICAgICAgJ0BAIC0nICsgaHVuay5vbGRTdGFydCArICcsJyArIGh1bmsub2xkTGluZXNcbiAgICAgICsgJyArJyArIGh1bmsubmV3U3RhcnQgKyAnLCcgKyBodW5rLm5ld0xpbmVzXG4gICAgICArICcgQEAnXG4gICAgKTtcbiAgICByZXQucHVzaC5hcHBseShyZXQsIGh1bmsubGluZXMpO1xuICB9XG5cbiAgcmV0dXJuIHJldC5qb2luKCdcXG4nKSArICdcXG4nO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlUGF0Y2goZmlsZU5hbWUsIG9sZFN0ciwgbmV3U3RyLCBvbGRIZWFkZXIsIG5ld0hlYWRlciwgb3B0aW9ucykge1xuICByZXR1cm4gY3JlYXRlVHdvRmlsZXNQYXRjaChmaWxlTmFtZSwgZmlsZU5hbWUsIG9sZFN0ciwgbmV3U3RyLCBvbGRIZWFkZXIsIG5ld0hlYWRlciwgb3B0aW9ucyk7XG59XG4iXX0=
//
//
///***/ }),
///* 15 */
///***/ (function(module, exports) {
//
//    /*istanbul ignore start*/"use strict";
//
//    Object.defineProperty(exports, "__esModule", {
//      value: true
//    });
//    exports. /*istanbul ignore end*/arrayEqual = arrayEqual;
//    /*istanbul ignore start*/exports. /*istanbul ignore end*/arrayStartsWith = arrayStartsWith;
//    function arrayEqual(a, b) {
//      if (a.length !== b.length) {
//        return false;
//      }
//
//      return arrayStartsWith(a, b);
//    }
//
//    function arrayStartsWith(array, start) {
//      if (start.length > array.length) {
//        return false;
//      }
//
//      for (var i = 0; i < start.length; i++) {
//        if (start[i] !== array[i]) {
//          return false;
//        }
//      }
//
//      return true;
//    }
//    //# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlsL2FycmF5LmpzIl0sIm5hbWVzIjpbImFycmF5RXF1YWwiLCJhcnJheVN0YXJ0c1dpdGgiLCJhIiwiYiIsImxlbmd0aCIsImFycmF5Iiwic3RhcnQiLCJpIl0sIm1hcHBpbmdzIjoiOzs7OztnQ0FBZ0JBLFUsR0FBQUEsVTt5REFRQUMsZSxHQUFBQSxlO0FBUlQsU0FBU0QsVUFBVCxDQUFvQkUsQ0FBcEIsRUFBdUJDLENBQXZCLEVBQTBCO0FBQy9CLE1BQUlELEVBQUVFLE1BQUYsS0FBYUQsRUFBRUMsTUFBbkIsRUFBMkI7QUFDekIsV0FBTyxLQUFQO0FBQ0Q7O0FBRUQsU0FBT0gsZ0JBQWdCQyxDQUFoQixFQUFtQkMsQ0FBbkIsQ0FBUDtBQUNEOztBQUVNLFNBQVNGLGVBQVQsQ0FBeUJJLEtBQXpCLEVBQWdDQyxLQUFoQyxFQUF1QztBQUM1QyxNQUFJQSxNQUFNRixNQUFOLEdBQWVDLE1BQU1ELE1BQXpCLEVBQWlDO0FBQy9CLFdBQU8sS0FBUDtBQUNEOztBQUVELE9BQUssSUFBSUcsSUFBSSxDQUFiLEVBQWdCQSxJQUFJRCxNQUFNRixNQUExQixFQUFrQ0csR0FBbEMsRUFBdUM7QUFDckMsUUFBSUQsTUFBTUMsQ0FBTixNQUFhRixNQUFNRSxDQUFOLENBQWpCLEVBQTJCO0FBQ3pCLGFBQU8sS0FBUDtBQUNEO0FBQ0Y7O0FBRUQsU0FBTyxJQUFQO0FBQ0QiLCJmaWxlIjoiYXJyYXkuanMiLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgZnVuY3Rpb24gYXJyYXlFcXVhbChhLCBiKSB7XG4gIGlmIChhLmxlbmd0aCAhPT0gYi5sZW5ndGgpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICByZXR1cm4gYXJyYXlTdGFydHNXaXRoKGEsIGIpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYXJyYXlTdGFydHNXaXRoKGFycmF5LCBzdGFydCkge1xuICBpZiAoc3RhcnQubGVuZ3RoID4gYXJyYXkubGVuZ3RoKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBzdGFydC5sZW5ndGg7IGkrKykge1xuICAgIGlmIChzdGFydFtpXSAhPT0gYXJyYXlbaV0pIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gdHJ1ZTtcbn1cbiJdfQ==
//
//
///***/ }),
///* 16 */
///***/ (function(module, exports) {
//
//    /*istanbul ignore start*/"use strict";
//
//    Object.defineProperty(exports, "__esModule", {
//      value: true
//    });
//    exports. /*istanbul ignore end*/convertChangesToDMP = convertChangesToDMP;
//    // See: http://code.google.com/p/google-diff-match-patch/wiki/API
//    function convertChangesToDMP(changes) {
//      var ret = [],
//          change = /*istanbul ignore start*/void 0 /*istanbul ignore end*/,
//          operation = /*istanbul ignore start*/void 0 /*istanbul ignore end*/;
//      for (var i = 0; i < changes.length; i++) {
//        change = changes[i];
//        if (change.added) {
//          operation = 1;
//        } else if (change.removed) {
//          operation = -1;
//        } else {
//          operation = 0;
//        }
//
//        ret.push([operation, change.value]);
//      }
//      return ret;
//    }
//    //# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb252ZXJ0L2RtcC5qcyJdLCJuYW1lcyI6WyJjb252ZXJ0Q2hhbmdlc1RvRE1QIiwiY2hhbmdlcyIsInJldCIsImNoYW5nZSIsIm9wZXJhdGlvbiIsImkiLCJsZW5ndGgiLCJhZGRlZCIsInJlbW92ZWQiLCJwdXNoIiwidmFsdWUiXSwibWFwcGluZ3MiOiI7Ozs7O2dDQUNnQkEsbUIsR0FBQUEsbUI7QUFEaEI7QUFDTyxTQUFTQSxtQkFBVCxDQUE2QkMsT0FBN0IsRUFBc0M7QUFDM0MsTUFBSUMsTUFBTSxFQUFWO0FBQUEsTUFDSUMsd0NBREo7QUFBQSxNQUVJQywyQ0FGSjtBQUdBLE9BQUssSUFBSUMsSUFBSSxDQUFiLEVBQWdCQSxJQUFJSixRQUFRSyxNQUE1QixFQUFvQ0QsR0FBcEMsRUFBeUM7QUFDdkNGLGFBQVNGLFFBQVFJLENBQVIsQ0FBVDtBQUNBLFFBQUlGLE9BQU9JLEtBQVgsRUFBa0I7QUFDaEJILGtCQUFZLENBQVo7QUFDRCxLQUZELE1BRU8sSUFBSUQsT0FBT0ssT0FBWCxFQUFvQjtBQUN6Qkosa0JBQVksQ0FBQyxDQUFiO0FBQ0QsS0FGTSxNQUVBO0FBQ0xBLGtCQUFZLENBQVo7QUFDRDs7QUFFREYsUUFBSU8sSUFBSixDQUFTLENBQUNMLFNBQUQsRUFBWUQsT0FBT08sS0FBbkIsQ0FBVDtBQUNEO0FBQ0QsU0FBT1IsR0FBUDtBQUNEIiwiZmlsZSI6ImRtcC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIFNlZTogaHR0cDovL2NvZGUuZ29vZ2xlLmNvbS9wL2dvb2dsZS1kaWZmLW1hdGNoLXBhdGNoL3dpa2kvQVBJXG5leHBvcnQgZnVuY3Rpb24gY29udmVydENoYW5nZXNUb0RNUChjaGFuZ2VzKSB7XG4gIGxldCByZXQgPSBbXSxcbiAgICAgIGNoYW5nZSxcbiAgICAgIG9wZXJhdGlvbjtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBjaGFuZ2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgY2hhbmdlID0gY2hhbmdlc1tpXTtcbiAgICBpZiAoY2hhbmdlLmFkZGVkKSB7XG4gICAgICBvcGVyYXRpb24gPSAxO1xuICAgIH0gZWxzZSBpZiAoY2hhbmdlLnJlbW92ZWQpIHtcbiAgICAgIG9wZXJhdGlvbiA9IC0xO1xuICAgIH0gZWxzZSB7XG4gICAgICBvcGVyYXRpb24gPSAwO1xuICAgIH1cblxuICAgIHJldC5wdXNoKFtvcGVyYXRpb24sIGNoYW5nZS52YWx1ZV0pO1xuICB9XG4gIHJldHVybiByZXQ7XG59XG4iXX0=
//
//
///***/ }),
///* 17 */
///***/ (function(module, exports) {
//
//    /*istanbul ignore start*/'use strict';
//
//    Object.defineProperty(exports, "__esModule", {
//      value: true
//    });
//    exports. /*istanbul ignore end*/convertChangesToXML = convertChangesToXML;
//    function convertChangesToXML(changes) {
//      var ret = [];
//      for (var i = 0; i < changes.length; i++) {
//        var change = changes[i];
//        if (change.added) {
//          ret.push('<ins>');
//        } else if (change.removed) {
//          ret.push('<del>');
//        }
//
//        ret.push(escapeHTML(change.value));
//
//        if (change.added) {
//          ret.push('</ins>');
//        } else if (change.removed) {
//          ret.push('</del>');
//        }
//      }
//      return ret.join('');
//    }
//
//    function escapeHTML(s) {
//      var n = s;
//      n = n.replace(/&/g, '&amp;');
//      n = n.replace(/</g, '&lt;');
//      n = n.replace(/>/g, '&gt;');
//      n = n.replace(/"/g, '&quot;');
//
//      return n;
//    }
//    //# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb252ZXJ0L3htbC5qcyJdLCJuYW1lcyI6WyJjb252ZXJ0Q2hhbmdlc1RvWE1MIiwiY2hhbmdlcyIsInJldCIsImkiLCJsZW5ndGgiLCJjaGFuZ2UiLCJhZGRlZCIsInB1c2giLCJyZW1vdmVkIiwiZXNjYXBlSFRNTCIsInZhbHVlIiwiam9pbiIsInMiLCJuIiwicmVwbGFjZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Z0NBQWdCQSxtQixHQUFBQSxtQjtBQUFULFNBQVNBLG1CQUFULENBQTZCQyxPQUE3QixFQUFzQztBQUMzQyxNQUFJQyxNQUFNLEVBQVY7QUFDQSxPQUFLLElBQUlDLElBQUksQ0FBYixFQUFnQkEsSUFBSUYsUUFBUUcsTUFBNUIsRUFBb0NELEdBQXBDLEVBQXlDO0FBQ3ZDLFFBQUlFLFNBQVNKLFFBQVFFLENBQVIsQ0FBYjtBQUNBLFFBQUlFLE9BQU9DLEtBQVgsRUFBa0I7QUFDaEJKLFVBQUlLLElBQUosQ0FBUyxPQUFUO0FBQ0QsS0FGRCxNQUVPLElBQUlGLE9BQU9HLE9BQVgsRUFBb0I7QUFDekJOLFVBQUlLLElBQUosQ0FBUyxPQUFUO0FBQ0Q7O0FBRURMLFFBQUlLLElBQUosQ0FBU0UsV0FBV0osT0FBT0ssS0FBbEIsQ0FBVDs7QUFFQSxRQUFJTCxPQUFPQyxLQUFYLEVBQWtCO0FBQ2hCSixVQUFJSyxJQUFKLENBQVMsUUFBVDtBQUNELEtBRkQsTUFFTyxJQUFJRixPQUFPRyxPQUFYLEVBQW9CO0FBQ3pCTixVQUFJSyxJQUFKLENBQVMsUUFBVDtBQUNEO0FBQ0Y7QUFDRCxTQUFPTCxJQUFJUyxJQUFKLENBQVMsRUFBVCxDQUFQO0FBQ0Q7O0FBRUQsU0FBU0YsVUFBVCxDQUFvQkcsQ0FBcEIsRUFBdUI7QUFDckIsTUFBSUMsSUFBSUQsQ0FBUjtBQUNBQyxNQUFJQSxFQUFFQyxPQUFGLENBQVUsSUFBVixFQUFnQixPQUFoQixDQUFKO0FBQ0FELE1BQUlBLEVBQUVDLE9BQUYsQ0FBVSxJQUFWLEVBQWdCLE1BQWhCLENBQUo7QUFDQUQsTUFBSUEsRUFBRUMsT0FBRixDQUFVLElBQVYsRUFBZ0IsTUFBaEIsQ0FBSjtBQUNBRCxNQUFJQSxFQUFFQyxPQUFGLENBQVUsSUFBVixFQUFnQixRQUFoQixDQUFKOztBQUVBLFNBQU9ELENBQVA7QUFDRCIsImZpbGUiOiJ4bWwuanMiLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgZnVuY3Rpb24gY29udmVydENoYW5nZXNUb1hNTChjaGFuZ2VzKSB7XG4gIGxldCByZXQgPSBbXTtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBjaGFuZ2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgbGV0IGNoYW5nZSA9IGNoYW5nZXNbaV07XG4gICAgaWYgKGNoYW5nZS5hZGRlZCkge1xuICAgICAgcmV0LnB1c2goJzxpbnM+Jyk7XG4gICAgfSBlbHNlIGlmIChjaGFuZ2UucmVtb3ZlZCkge1xuICAgICAgcmV0LnB1c2goJzxkZWw+Jyk7XG4gICAgfVxuXG4gICAgcmV0LnB1c2goZXNjYXBlSFRNTChjaGFuZ2UudmFsdWUpKTtcblxuICAgIGlmIChjaGFuZ2UuYWRkZWQpIHtcbiAgICAgIHJldC5wdXNoKCc8L2lucz4nKTtcbiAgICB9IGVsc2UgaWYgKGNoYW5nZS5yZW1vdmVkKSB7XG4gICAgICByZXQucHVzaCgnPC9kZWw+Jyk7XG4gICAgfVxuICB9XG4gIHJldHVybiByZXQuam9pbignJyk7XG59XG5cbmZ1bmN0aW9uIGVzY2FwZUhUTUwocykge1xuICBsZXQgbiA9IHM7XG4gIG4gPSBuLnJlcGxhY2UoLyYvZywgJyZhbXA7Jyk7XG4gIG4gPSBuLnJlcGxhY2UoLzwvZywgJyZsdDsnKTtcbiAgbiA9IG4ucmVwbGFjZSgvPi9nLCAnJmd0OycpO1xuICBuID0gbi5yZXBsYWNlKC9cIi9nLCAnJnF1b3Q7Jyk7XG5cbiAgcmV0dXJuIG47XG59XG4iXX0=
//
//
///***/ })
///******/ ])
//});
//;