import * as bouc from '../../bouc';
import dateformat from '../../modules/dateformat';

var stats = {};

stats.show = function(selectedWorkIndex) {
	let data = jtime.run.data.persontime;
	data = data.work[data.username] || [];

	let total = getTotal(data);
	let days = getDays(data);
	jtime.run.persontime.statsContainer.innerHTML = jtime.tpl.persontime.stats({
		crs: getCRs(data),
		total: dateformat.duration(total),
		days,
		average: dateformat.duration(total / days),
		selected: data[selectedWorkIndex],
		jiraUrl: jtime.config.jiraUrl
	});
};

function getCRs(data) {
	data = bouc.groupBy(data, 'CR');
	data = bouc.toList(data, 'CR', 'worklogs');
	data.forEach(function(cr) {
		cr.time = cr.worklogs.reduce(function(a, b) {
			return a + b.timeSpentSeconds;
		}, 0);
		cr.timeDisplay = dateformat.duration(cr.time);
	});
	bouc.sort(data, {key: 'time'}).reverse();
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
