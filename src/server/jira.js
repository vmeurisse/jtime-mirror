var Client = require('node-rest-client').Client;
var lru = require('lru-cache');

var config = require('../../config');

var jira = new Client({user: config.JIRA_USERNAME, password: config.JIRA_PASSWORD});

jira.registerMethod('projects', config.JIRA_URL + 'rest/api/2/project', 'GET');
jira.registerMethod('search', config.JIRA_URL + 'rest/api/2/search', 'GET');
jira.registerMethod('worklog', config.JIRA_URL + 'rest/api/2/issue/${issue}/worklog', 'GET');
jira.registerMethod('issue', config.JIRA_URL + 'rest/api/2/issue/${issue}', 'GET');
jira.registerMethod('user', config.JIRA_URL + 'rest/api/2/user', 'GET');

var validProject = function(key) {
	return typeof key === 'string' && /^[a-z]+$/i.test(key);
};

var validDate = function(date) {
	return typeof date === 'string' && /^\d\d\d\d-\d\d-\d\d$/i.test(date);
};

// issue-list
var shortCache = lru({
	max: 1000,
	maxAge: 5 * 60 * 1000 // 5min
});

// projects
var mediumCache = lru({
	max: 10000,
	maxAge: 60 * 60 * 1000 // 1d
});

// users, worklogs, issues
var longCache = lru({
	max: 10000,
	maxAge: 7 * 24 * 60 * 60 * 1000 // 1w
});


exports.projects = function() {
	return new Promise(function(fulfill, reject) {
		var projects = mediumCache.get('projects');
		if (projects) {
			fulfill(projects);
		} else {
			jira.methods.projects(function(data) {
				mediumCache.set('projects', data);
				fulfill(data);
			}).on('error', function(err) {
				reject(err);
			});
		}
	});
};

exports.issues = function(params) {
	return new Promise(function(fulfill, reject) {
		var jql = [];
		if (!validProject(params.projectKey)) {
			return cb('invalid project key');
		}
		jql.push('project = ' + params.projectKey);

		if (params.loggedWork) {
			jql.push('timespent > 0');
		}

		if (params.minDate || params.maxDate) {
			if (!validDate(params.minDate) || !validDate(params.maxDate)) {
				return cb('invalid date query');
			}
			jql.push('created <= "' + params.maxDate + '" AND updated >= "' + params.minDate + '"');
		} else {
			jql.push('sprint in openSprints()');
		}

		jql = jql.join(' AND ');
		
		var issues = shortCache.get('issues:' + jql);
		if (issues) {
			fulfill(issues);
		} else {
			console.time(jql);
			jira.methods.search({
				parameters: {
					maxResults: 1000,
					jql: jql
				}
			}, function(data) {
				console.timeEnd(jql);
				if (data.maxResults <= data.total) {
					reject(new Error('Too many results returned'));
				} else {
					if (data.issues) {
						data.issues.forEach(function (issue) {
							storeIssue(issue);
						});
					}
					shortCache.set('issues:' + jql, data.issues);
					fulfill(data.issues);
				}
			}).on('error', function(err) {
				reject(err);
			});
		}
	});
};

exports.issue = function(key) {
	return new Promise(function(fulfill, reject) {
		var issue = longCache.get('issue:' + key);
		if (issue) {
			fulfill(issue);
		} else {
			jira.methods.issue({
				path: {
					issue: key
				}
			}, function(data) {
				storeIssue(data);
				fulfill(data);
			}).on('error', function(err) {
				reject(err);
			});
		}
	});
};

var storeIssue = function(issue) {
	if (issue.fields && issue.fields.updated) {
		issue.date = new Date(issue.fields.updated);
	}
	longCache.set('issue:' + issue.key, issue);
};

exports.worklog = function(issue) {
	var key = issue.key;
	return new Promise(function(fulfill, reject) {
		var worklog = longCache.get('worklog:' + key);
		if (worklog && worklog.date >= issue.date) {
			fulfill(worklog.logs);
		} else {
			if (worklog) {
				console.log('stall worklog', issue.key, worklog.date, issue.date);
			}
			jira.methods.worklog({
				path: {
					issue: key
				}
			}, function(data) {
				longCache.set('worklog:' + key, {
					logs: data.worklogs,
					date: new Date()
				});
				fulfill(data.worklogs);
			}).on('error', reject);
		}
	});
};

exports.user = function(username) {
	return new Promise(function(fulfill, reject) {
		var cacheKey = 'user:' + username;
		var user = longCache.get(cacheKey);
		if (user) {
			fulfill(user);
		} else {
			jira.methods.user({
				parameters: {
					username: username
				}
			}, function(data) {
				longCache.set(cacheKey, data);
				fulfill(data);
			}).on('error', function(err) {
				reject(err);
			});
		}
	});
};
