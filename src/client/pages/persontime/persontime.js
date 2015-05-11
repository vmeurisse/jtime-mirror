import page from 'page';

import i18n from '../../jtime.i18n';
import * as bouc from '../../bouc';

var persontime = {};
export default persontime;

persontime.register = function(url) {
	page(url, (ctx) => this.show(ctx));
	//page.exit(url, (ctx) => this.destroy(ctx));
};
persontime.show = function(ctx) {
	jtime.run.persontime = {};
	let today = new Date();
	let data = {
		ctx: ctx,
		project: ctx.params.project,
		date: ctx.params.date,
		query: bouc.parseQuery(ctx.querystring),
		currentMonth: today.getFullYear() + '-' + bouc.zeropad(today.getMonth() + 1, 2)
	};
	if (!data.date) {
		data.date = data.currentMonth;
	}
	data.username = data.query.user;
	jtime.run.data.persontime = data;

	jtime.showLoader();

	fetch(`/api/worklog/${data.project}/${data.date}`)
	.then(response => response.json())
	.then(work => data.work = Array.isArray(work) ? bouc.groupBy(work, 'user') : {})
	.then(() => this.draw())
	.then(jtime.hideLoader)
	.catch(jtime.hideLoader);
};

persontime.destroy = function() {
	delete jtime.run.data.persontime;
	delete jtime.run.persontime;
};

persontime.getLink = function(month) {
	var data = jtime.run.data.persontime;
	
	var date = month !== data.currentMonth ? `/${month}` : '';
	var params = data.ctx.querystring ? `?${data.ctx.querystring}` : '';
	
	return `/projects/${data.project}${date}${params}`;
};

persontime.draw = function() {
	var data = jtime.run.data.persontime;
	
	var month = +data.date.slice(5, 7) - 1;
	var year = +data.date.slice(0, 4);
	var firstDayOfMonth = new Date(year, month, 1, 12, 0);
	data.firstDayOfMonth = firstDayOfMonth;

	var prevmonth, nextmonth;
	if (month === 0) prevmonth = (year - 1) + '-12';
	else prevmonth = year + '-' + bouc.zeropad(month, 2);
	if (month === 11) nextmonth = (year + 1) + '-01';
	else nextmonth = year + '-' + bouc.zeropad(month + 2, 2);
	
	var dateFormater = new Intl.DateTimeFormat(i18n.locale, {
		year: 'numeric',
		month: 'long'
	});
	let hasWork = data.username && data.work[data.username];
	jtime.run.container.innerHTML = jtime.tpl.persontime({
		title: dateFormater.format(firstDayOfMonth),
		hasWork,
		users: this.getUserList(),
		data,
		prevmonth: persontime.getLink(prevmonth),
		nextmonth: persontime.getLink(nextmonth)
	});
	jtime.run.persontime.tableContainer = jtime.run.container.querySelector('.jtime-persontime-table-container');
	if (hasWork) {
		this.showCalendar();
	}
};

persontime.getUserList = function() {
	var data = jtime.run.data.persontime;

	var query = bouc.defaults({}, data.query);
	
	var users = [];
	for (var username in data.work) {
		query.user = username;
		users.push({
			displayname: data.work[username][0].userDisplayName || username,
			username: username,
			url: data.ctx.pathname + '?' + bouc.serializeParams(query),
			current: data.username === username
		});
	}
	return users.sort((a, b) => a.displayname > b.displayname);
};

persontime.showCalendar = function() {
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

persontime.preprocess = function(data) {
	data.forEach(function(item) {
		item.day = item.localStart.slice(0, 10);
	});
	return bouc.groupBy(data, 'day');
};
