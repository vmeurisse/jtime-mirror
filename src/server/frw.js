exports.groupBy = function(list, property, sorted) {
    var groupedList = {};
    var keys = [];
    for (var i = 0; i < list.length; i++) {
        var item = list[i];
        var value = item[property];
        if (!groupedList[value]) {
            keys.push(value);
            groupedList[value] = [];
        }
        groupedList[value].push(item);
    }
    if (sorted) {
        keys.sort();
        groupedList._keys = keys;
    }
    return groupedList;
};

