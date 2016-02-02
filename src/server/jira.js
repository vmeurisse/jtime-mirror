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
			return new Promise((fulfill, reject) => {
				rest.methods[name](args, data => {
					console.log(`${new Date()} jira (${new Date() - start}ms) ${key || name}`);
					fulfill(data);
				}).on('error', reject);
			});
		};
	}
};

jira.registerMethod('projects', `${config.JIRA_URL}rest/api/2/project`);
jira.registerMethod('search', `${config.JIRA_URL}rest/api/2/search`);
jira.registerMethod('worklog', `${config.JIRA_URL}rest/api/2/issue/\${issue}/worklog`);
jira.registerMethod('issue', `${config.JIRA_URL}rest/api/2/issue/\${issue}`);
jira.registerMethod('user', `${config.JIRA_URL}rest/api/2/user`);
jira.registerMethod('sprints', `${config.JIRA_URL}rest/agile/1.0/board/\${board}/sprint`);

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
	max: 50000,
	maxAge: 7 * 24 * 60 * 60 * 1000 // 1w
});

function storeIssue(issue) {
	if (issue.fields && issue.fields.updated) {
		issue.date = new Date(issue.fields.updated);
	}
	longCache.set(`issue:${issue.key}`, issue);
}

function moveDown(args, key, allItems) {
	var argsCopy = Object.assign({}, args); // node-rest-client is emptying the args object, so we copy it before
	return jira.search(args, key)
		.then(data => {
			allItems = allItems || [];
			allItems.push.apply(allItems, data.issues);
			if (data.total >= 10000) {
				return Promise.reject(new Error('Too many results - not even trying'));
			} else if ((data.startAt + data.maxResults) < data.total) {
				console.log(`Received ${data.maxResults} from ${data.startAt} out of ${data.total}. Grabbing next batch.`);
				argsCopy.parameters.startAt += data.maxResults;
				return moveDown(argsCopy, key, allItems);
			} else {
				console.log(`All results received: ${data.total}.`);
				return allItems;
			}
		});
}

exports.projects = function() {
	var projects = mediumCache.get('projects');
	if (projects) {
		return Promise.resolve(projects);
	} else {
		return jira.projects().then(data => {
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
	jql.push(`project = ${params.projectKey}`);

	if (params.loggedWork) {
		jql.push('timespent > 0');
	}

	if (params.minDate || params.maxDate) {
		if (!validDate(params.minDate) || !validDate(params.maxDate)) {
			return Promise.reject(new Error('invalid date query'));
		}
		jql.push(`created <= "${params.maxDate} 23:59" AND updated >= "${params.minDate}"`);
	} else {
		jql.push('sprint in openSprints()');
	}

	jql = jql.join(' AND ');
	
	var cacheKey = `issues:${jql}`;
	var issues = shortCache.get(cacheKey);
	if (issues) {
		return Promise.resolve(issues);
	} else {
		return moveDown({
			parameters: {
				maxResults: 1000,
				startAt: 0,
				jql: jql,
				fields: 'summary,updated,parent,issuetype,customfield_10006,customfield_10007'
			}
		}, cacheKey).then(issueList => {
			if (issueList) {
				issueList.forEach(storeIssue);
			}
			shortCache.set(cacheKey, issueList);
			return issueList;
		});
	}
};

exports.issue = function(key) {
	var cacheKey = `issue:${key}`;
	var issue = longCache.get(cacheKey);
	if (issue) {
		return Promise.resolve(issue);
	} else {
		return jira.issue({
			path: {
				issue: key,
				fields: 'summary,updated,parent,issuetype,customfield_10006,customfield_10007'
			}
		}, cacheKey).then(data => {
			storeIssue(data);
			return data;
		});
	}
};

exports.worklog = function(issue) {
	var key = issue.key;
	var cacheKey = `worklog:${key}`;
	var worklog = longCache.get(cacheKey);
	if (worklog && worklog.date >= issue.date) {
		return Promise.resolve(worklog.logs);
	} else {
		return jira.worklog({
			path: {
				issue: key
			}
		}, cacheKey).then(data => {
			if (data.worklogs) {
				longCache.set(cacheKey, {
					logs: data.worklogs,
					date: new Date()
				});
			} else {
				console.log(`Error retrieving worklogs for issue ${key}:`, data);
				return Promise.reject(new Error(`Error retrieving worklogs for issue ${key}`));
			}
			return data.worklogs;
		});
	}
};

exports.user = function(username) {
	var cacheKey = `user:${username}`;
	var user = longCache.get(cacheKey);
	if (user) {
		return Promise.resolve(user);
	} else {
		return jira.user({
			parameters: {
				username: username
			}
		}, cacheKey).then(data => {
			longCache.set(cacheKey, data);
			return data;
		});
	}
};

exports.sprints = function(boardId) {
	var cacheKey = `sprints:${boardId}`;
	var sprints = mediumCache.get(cacheKey);
	if (sprints) {
		return Promise.resolve(sprints);
	} else {
		return jira.sprints({
			path: {
				board: boardId
			},
			parameters: {
				state: 'active,closed'
			}
		}, cacheKey).then(data => {
			mediumCache.set(cacheKey, data);
			return data;
		});
	}
};
