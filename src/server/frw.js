'use strict';

exports.groupBy = function(list, property) {
	var groupedList = {};
	for (var i = 0; i < list.length; i++) {
		var item = list[i];
		var value = item[property];
		if (!groupedList[value]) {
			groupedList[value] = [];
		}
		groupedList[value].push(item);
	}
	return groupedList;
};
