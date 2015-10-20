import page from 'page';

import i18n from '../../jtime.i18n';
import * as bouc from '../../bouc';

import {showStats} from './persontime.stats';
import table from './persontime.table';

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
	jtime.run.persontime.statsContainer = jtime.run.container.querySelector('.jtime-persontime-stats-container');
	if (hasWork) {
		var colorMap = table.showCalendar();
		showStats(colorMap);
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

