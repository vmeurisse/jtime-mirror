import * as bouc from '../../bouc';

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
	var colorMap = {};
	
	for (var w = 0; w < nbWeeks; w++) {
		var days = [];
		for (var d = 0; d < 7; d++) {
			var date = cur.toISOString().slice(0, 10);
			var works = worklogs[date] || [];
			var totalDay = 0;
			works.forEach(function(work) {
				work.CR = work.CR || 'No CR';
				if (work.CR in colorMap) {
					work.color = colorMap[work.CR];
				} else {
					work.color = nextColor;
					colorMap[work.CR] = nextColor;
					if (nextColor !== 9) nextColor++;
				}
				work.height = Math.max(10, work.timeSpentSeconds * 80 / (7 * 3600) - 5); //-5 to account margin
				work.fontSize = Math.min(16, work.height / 1.2);
				
				var title = [`spent: ${work.timeSpent} (${(work.timeSpentSeconds / (7 * 3600) * 100).toFixed(0)}%)`];
				if (work.task) title.push(`${work.task} - ${work.taskName}`);
				if (work.story) title.push(`${work.story} - ${work.storyName}`);
				if (work.epic) title.push(`${work.epic} - ${work.epicSummary}`);
				if (work.epicName !== work.epicSummary) title.push(`${work.epic} - ${work.epicName}`);
				
				work.title = title.join('\n');
				totalDay += work.timeSpentSeconds;
			});
			var inmonth = cur.getMonth() === month;
			days.push({
				date: inmonth ? cur.getDate() : null,
				works: works,
				invalid: inmonth && totalDay !== 7 * 3600
			});
			cur.setTime(cur.getTime() + 86400000);
		}
		weeks.push(days);
	}
	jtime.run.persontime.tableContainer.innerHTML = jtime.tpl.persontime.table({
		weeks: weeks
	});
};

table.preprocess = function(data) {
	data.forEach(function(item) {
		item.day = item.localStart.slice(0, 10);
	});
	return bouc.groupBy(data, 'day');
};

export default table;
