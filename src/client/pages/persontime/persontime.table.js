import * as bouc from '../../bouc';
import {showStats} from './persontime.stats';

var colorMap;

var table = {};

table.showCalendar = function() {
	var data = jtime.run.data.persontime;
	var firstDayOfMonth = data.firstDayOfMonth;
	var worklogs = this.preprocess(data.work[data.username] || []);

	var month = firstDayOfMonth.getMonth();
	var lastDayOfMonth = new Date(firstDayOfMonth.getFullYear(), firstDayOfMonth.getMonth() + 1, 0, 12, 0);
	
	var minDate = new Date(firstDayOfMonth.getTime() - ((firstDayOfMonth.getDay() + 6) % 7) * 86400000);
	var maxDate = new Date(lastDayOfMonth.getTime() + ((7 - lastDayOfMonth.getDay()) % 7) * 86400000);
	
	var nbWeeks = Math.round((maxDate.getTime() - minDate.getTime()) / 86400000 / 7);
	
	var cur = minDate;
	var weeks = [];
	
	var nextColor = 0;
	colorMap = {};
	
	for (var w = 0; w < nbWeeks; w++) {
		var days = [];
		for (var d = 0; d < 7; d++) {
			var date = cur.toISOString().slice(0, 10);
			var works = worklogs[date] || [];
			var totalDay = 0;
			works.forEach(work => {
				work.CR = work.CR || 'No CR';
				if (work.CR in colorMap) {
					work.color = colorMap[work.CR];
				} else {
					work.color = nextColor;
					colorMap[work.CR] = nextColor;
					if (nextColor !== 9) nextColor++;
				}
				work.height = Math.max(10, work.timeSpentDays * 80 - 5); //-5 to account margin
				work.fontSize = Math.min(16, work.height / 1.2);
				work.title = `spent: ${work.timeSpent} (${work.timeSpentRatio})`;
				totalDay += work.timeSpentSeconds;
			});
			var inmonth = cur.getMonth() === month;
			days.push({
				date: inmonth ? cur.getDate() : null,
				works: works,
				invalid: inmonth && totalDay !== 7 * 3600,
				total: `${(totalDay / (7 * 3600) * 100).toFixed(0)}%`
			});
			cur.setTime(cur.getTime() + 86400000);
		}
		weeks.push(days);
	}
	jtime.run.persontime.tableContainer.innerHTML = jtime.tpl.persontime.table({
		weeks: weeks
	});

	jtime.run.persontime.tableContainer.onclick = selectWork;

	return colorMap;
};

table.preprocess = function(data) {
	data.forEach((item, index) => {
		item.index = index;
		item.timeSpentDays = item.timeSpentSeconds / (7 * 3600);
		item.timeSpentRatio = `${(item.timeSpentDays * 100).toFixed(0)}%`;
		item.day = item.localStart.slice(0, 10);
	});
	return bouc.groupBy(data, 'day');
};

function selectWork(e) {
	let index = e.target.getAttribute('data-index');
	if (index) showStats(colorMap, +index);
}

export default table;
