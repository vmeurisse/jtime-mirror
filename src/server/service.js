'use strict';

var moment = require('moment-timezone');

var jira = require('./jira');
var frw = require('./frw');

/**
 * @param {Object} options - 
 * @param {string} options.projectKey - Project key to use
 * @param {string} options.minDate - minimum date in the format `yyyy-mm-dd`
 * @param {string} options.maxDate - maximum date in the format `yyyy-mm-dd`
 * @returns {Promise} A promise on an array of worklogs
 */
exports.worklog = function(options) {
	return jira.issues({
		projectKey: options.projectKey,
		minDate: options.minDate,
		maxDate: options.maxDate,
		loggedWork: true
	}).then(getAllWorklogs)
	.then(resolveUser)
	.then(filterWorklog.bind(null, options.minDate, options.maxDate))
	.then(resolveParents)
	.then(extractCRs);
};

function getAllWorklogs(issues) {
	let promises = issues.map(issue => jira.worklog(issue).then(worklog => ({
		key: issue.key,
		worklogs: worklog
	})));
	return Promise.all(promises).then(issuesWithWork => {
		var worklogs = [];
		issuesWithWork.forEach(issue => {
			worklogs.push(issue.worklogs.map(work => ({
				issue: issue.key,
				user: work.author.name,
				timeSpentSeconds: work.timeSpentSeconds,
				start: work.started,
				timeSpent: work.timeSpent
			})));
		});

		return [].concat.apply([], worklogs);
	});
}

function filterWorklog(minDate, maxDate, worklogs) {
	// We drop the timezone of both limits and jira date to make sure
	// that the date limits are using the server time zone
	
	var min = new Date(`${minDate}T00:00Z`).getTime();
	var max = new Date(`${maxDate}T23:59:59.999Z`).getTime();
	return worklogs.filter(worklog => {
		var d = worklog.localStart.split(/\D/);
		var date = Date.UTC(+d[0], --d[1], +d[2], +d[3], +d[4], +d[5], +d[6]);
		return min <= date && date <= max;
	});
}

function resolveParents(worklogs) {
	return resolveIssue(worklogs)
		.then(resolveEpic);
}

function resolveIssue(worklogs) {
	return Promise.all(worklogs.map(worklog => {
		jira.issue(worklog.issue)
		.then(issue => {
			var subtask = issue.fields.issuetype.subtask;
			var epic = issue.fields.issuetype.name === 'Epic';
			worklog.type = subtask ? 'Sub-task' : epic ? 'Epic' : 'Story';
			worklog.task = subtask ? issue.key : null;
			worklog.taskName = subtask ? issue.fields.summary : null;
			worklog.story = epic ? null : subtask ? issue.fields.parent.key : issue.key;
			worklog.storyName = epic ? null : subtask ? issue.fields.parent.fields.summary : issue.fields.summary;
		});
	})).then(() => worklogs);
}

function resolveEpic(worklogs) {
	var worklogMap = frw.groupBy(worklogs, 'story');
	var queries = [];
	for (var storyKey in worklogMap) {
		var q = jira.issue(storyKey)
		.then(story => {
			var epicKey = story.fields && story.fields.customfield_10006;
			if (epicKey) {
				worklogMap[story.key].forEach(log => {
					log.epic = epicKey;
				});
			}
		});
		queries.push(q);
	}
	return Promise.all(queries)
	.then(() => {
		queries = [];
		worklogMap = frw.groupBy(worklogs, 'epic');
		for (var epicKey in worklogMap) {
			if (epicKey !== 'undefined') {
				var query = jira.issue(epicKey)
				.then(epic => {
					worklogMap[epic.key].forEach(log => {
						log.epicSummary = epic.fields.summary;
						log.epicName = epic.fields.customfield_10007;
						log.changeRequest = epic.fields.customfield_11100;
					});
				});
				queries.push(query);
			}
		}
		return Promise.all(queries);
	}).then(() => worklogs);
}

function resolveUser(worklogs) {
	var worklogMap = frw.groupBy(worklogs, 'user');
	var queries = [];
	for (var username in worklogMap) {
		var q = jira.user(username)
		.then(function(userName, user) {
			var displayName = user && user.displayName || userName;
			var tz = user && user.timeZone || 'UTC';
			worklogMap[userName].forEach(log => {
				log.userDisplayName = displayName;
				log.userAvatar = user.avatarUrls['32x32'];
				log.localStart = moment(log.start).tz(tz).format();
			});
		}.bind(null, username));
		queries.push(q);
	}
	return Promise.all(queries).then(() => worklogs);
}

function extractCRs(worklogs) {
	worklogs.forEach(work => {
		work.CR = work.changeRequest ||
		          extractCRFromName(work.epicName) ||
		          extractCRFromName(work.epicSummary) ||
		          extractCRFromName(work.storyName) ||
		          extractCRFromName(work.taskName) ||
		          extractTagFromName(work.epicName);
	});
	return worklogs;
}

function extractCRFromName(name) {
	if (!name) return null;
	var match = name.match(/\b[01]?\d{7}\b/);
	if (match) return match[0];
}

function extractTagFromName(name) {
	if (!name) return null;
	var match = name.match(/^\[[\w]+\]/);
	if (match) return match[0];
}
