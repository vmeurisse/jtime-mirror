'use strict';

/**
 * Group a list of Objects based on the value of one of their properties.
 * ```
 *   groupBy([{a: 'one'}, {a: 'two'}], 'a') // => {'one': [{a: 'one'}], 'two': [{a: 'two'}]}
 * ```
 * @param {Array<Object>} list - The list of objects to group
 * @param {string} property - The property to group on
 * @returns {Object<string, Array<Object>>} the grouped list
 */
exports.groupBy = function(list, property) {
  const groupedList = {};
  for (let i = 0; i < list.length; i++) {
    const item = list[i];
    const value = item[property];
    if (!groupedList[value]) {
      groupedList[value] = [];
    }
    groupedList[value].push(item);
  }
  return groupedList;
};
