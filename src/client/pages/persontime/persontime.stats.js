import * as bouc from '../../bouc';
import dateformat from '../../modules/dateformat';

var stats = {};

stats.show = function(colorMap) {
	let data = jtime.run.data.persontime;
	data = data.work[data.username] || [];

	let total = getTotal(data);
	let days = getDays(data);
	jtime.run.persontime.statsContainer.innerHTML = jtime.tpl.persontime.stats({
		crs: getCRs(data, colorMap),
		total: dateformat.duration(total),
		days,
		average: dateformat.duration(total / days)
	});
};

function getCRs(data, colorMap) {
	data = bouc.groupBy(data, 'epicName');
	data = bouc.toList(data, 'epicName', 'worklogs');
	data.forEach(function(item) {
		item.time = item.worklogs.reduce(function(a, b) {
			return a + b.timeSpentSeconds;
		}, 0);
		item.timeDisplay = dateformat.duration(item.time);
		item.CR = item.worklogs[0].CR;
		item.color = colorMap[item.CR];
	});
	bouc.sort(data, {key: 'epicName'});
	return data;
}

function getTotal(data) {
	let total = data.reduce(function(a, b) {
		return a + b.timeSpentSeconds;
	}, 0);
	return total;
}

function getDays(data) {
	return Object.keys(bouc.groupBy(data, 'day')).length;
}

export default stats;
