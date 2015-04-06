'use strict';

var Client = require('node-rest-client').Client;
var lru = require('lru-cache');

var config = require('../../config');

var rest = new Client({user: config.JIRA_USERNAME, password: config.JIRA_PASSWORD});

var jira = {
	registerMethod: function(name, url) {
		rest.registerMethod(name, url, 'GET');
		jira[name] = function(args, key) {
			var start = new Date();
			return new Promise(function(fulfill, reject) {
				rest.methods[name](args, function(data) {
					console.log(new Date() + ' jira (' + (new Date() - start) + 'ms) ' + (key || name));
					fulfill(data);
				}).on('error', function(err) {
					reject(err);
				});
			});
		};
	}
};

jira.registerMethod('projects', config.JIRA_URL + 'rest/api/2/project');
jira.registerMethod('search', config.JIRA_URL + 'rest/api/2/search');
jira.registerMethod('worklog', config.JIRA_URL + 'rest/api/2/issue/${issue}/worklog');
jira.registerMethod('issue', config.JIRA_URL + 'rest/api/2/issue/${issue}');
jira.registerMethod('user', config.JIRA_URL + 'rest/api/2/user');

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

function storeIssue(issue) {
	if (issue.fields && issue.fields.updated) {
		issue.date = new Date(issue.fields.updated);
	}
	longCache.set('issue:' + issue.key, issue);
}

exports.projects = function() {
	var projects = mediumCache.get('projects');
	if (projects) {
		return Promise.resolve(projects);
	} else {
		return jira.projects().then(function(data) {
			mediumCache.set('projects', data);
			return data;
		});
	}
};

exports.issues = function(params) {
	var jql = [];
	if (!validProject(params.projectKey)) {
		return Promise.reject(new Error('invalid project key'));
	}
	jql.push('project = ' + params.projectKey);

	if (params.loggedWork) {
		jql.push('timespent > 0');
	}

	if (params.minDate || params.maxDate) {
		if (!validDate(params.minDate) || !validDate(params.maxDate)) {
			return Promise.reject(new Error('invalid date query'));
		}
		jql.push('created <= "' + params.maxDate + '" AND updated >= "' + params.minDate + '"');
	} else {
		jql.push('sprint in openSprints()');
	}

	jql = jql.join(' AND ');
	
	var cacheKey = 'issues:' + jql;
	var issues = shortCache.get(cacheKey);
	if (issues) {
		return Promise.resolve(issues);
	} else {
		return jira.search({
			parameters: {
				maxResults: 1000,
				jql: jql,
				fields: 'summary,updated,parent,issuetype,customfield_10006,customfield_10007'
			}
		}, cacheKey).then(function(data) {
			if (data.maxResults <= data.total) {
				return Promise.reject(new Error('Too many results returned'));
			} else {
				if (data.issues) {
					data.issues.forEach(function (issue) {
						storeIssue(issue);
					});
				}
				shortCache.set(cacheKey, data.issues);
				return data.issues;
			}
		});
	}
};

exports.issue = function(key) {
	var cacheKey = 'issue:' + key;
	var issue = longCache.get(cacheKey);
	if (issue) {
		return Promise.resolve(issue);
	} else {
		return jira.issue({
			path: {
				issue: key,
				fields: 'summary,updated,parent,issuetype,customfield_10006,customfield_10007'
			}
		}, cacheKey).then(function(data) {
			storeIssue(data);
			return data;
		});
	}
};

exports.worklog = function(issue) {
	var key = issue.key;
	var cacheKey = 'worklog:' + key;
	var worklog = longCache.get(cacheKey);
	if (worklog && worklog.date >= issue.date) {
		return Promise.resolve(worklog.logs);
	} else {
		return jira.worklog({
			path: {
				issue: key
			}
		}, cacheKey).then(function(data) {
			longCache.set(cacheKey, {
				logs: data.worklogs,
				date: new Date()
			});
			return data.worklogs;
		});
	}
};

exports.user = function(username) {
	var cacheKey = 'user:' + username;
	var user = longCache.get(cacheKey);
	if (user) {
		return Promise.resolve(user);
	} else {
		return jira.user({
			parameters: {
				username: username
			}
		}, cacheKey).then(function(data) {
			longCache.set(cacheKey, data);
			return data;
		});
	}
};
