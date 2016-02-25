'use strict';

const Client = require('node-rest-client').Client;

const cache = require('./cache');
const config = require('../../config');

const rest = new Client({
  user: config.JIRA_USERNAME,
  password: config.JIRA_PASSWORD
});

const jira = {
  registerMethod(name, url) {
    rest.registerMethod(name, url, 'GET');
    jira[name] = function(args, key) {
      const start = Date.now();
      return new Promise((fulfill, reject) => {
        rest.methods[name](args, data => {
          console.log(`${new Date()} jira (${Date.now() - start}ms) ${key || name}`);
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

const validProject = function(key) {
  return typeof key === 'string' && /^[a-z]+$/i.test(key);
};

const validDate = function(date) {
  return typeof date === 'string' && /^\d\d\d\d-\d\d-\d\d$/i.test(date);
};

/**
 * Search for issues. This function will handle movedowns if necessary.
 *
 * @param {Object} args - arguments to search with
 * @param {string} key - key to use in logs
 * @param {Array<jira~Issue>} [allItems] - If provided, the retrieved issues will be appended to this array.
 * @returns {Promise.<Array<jira~Issue>>} the list of issues
 */
function search(args, key, allItems) {
  const argsCopy = Object.assign({}, args); // node-rest-client is emptying the args object, so we copy it before
  return jira.search(args, key)
    .then(data => {
      allItems = allItems || [];
      allItems.push.apply(allItems, data.issues);
      if (data.total >= 10000) {
        return Promise.reject(new Error('Too many results - not even trying'));
      } else if ((data.startAt + data.maxResults) < data.total) {
        console.log(`Received ${data.maxResults} from ${data.startAt} out of ${data.total}. Grabbing next batch.`);
        argsCopy.parameters.startAt += data.maxResults;
        return search(argsCopy, key, allItems);
      } else {
        console.log(`All results received: ${data.total}.`);
        return allItems;
      }
    });
}

/**
 * Get all projects
 *
 * @returns {Promise<Array<jira~Project>>} The list of projects
 */
exports.projects = function() {
  var projects = cache.getProjects();
  if (projects) {
    return Promise.resolve(projects);
  } else {
    return jira.projects().then(data => {
      cache.storeProjects(data);
      return data;
    });
  }
};

/**
 * Get a list of issues from jira
 *
 * @param {Object} params -
 * @param {string} params.projectKey - Key of the project ot search issues on
 * @param {string} [params.minLogDate] - Retrieve only issues with work logged on or after the provided date
 * @param {string} [params.maxLogDate] - Retrieve only issues with work logged on or before the provided date
 * @returns {Promise<Array<jira~Issue>>} An array of issues
 */
exports.issues = function(params) {
  const jqlParts = [];
  if (!validProject(params.projectKey)) {
    return Promise.reject(new Error('invalid project key'));
  }
  jqlParts.push(`project = ${params.projectKey}`);

  jqlParts.push('timespent > 0');

  if (params.minLogDate || params.maxLogDate) {
    if (!validDate(params.minLogDate) || !validDate(params.maxLogDate)) {
      return Promise.reject(new Error('invalid date query'));
    }
    jqlParts.push(`created <= "${params.maxLogDate} 23:59" AND updated >= "${params.minLogDate}"`);
  }

  const jql = jqlParts.join(' AND ');

  let issues = cache.getIssues(jql);
  if (issues) {
    return Promise.resolve(issues);
  } else {
    return search({
      parameters: {
        maxResults: 1000, // maximum supported by jira
        startAt: 0,
        jql,
        fields: 'summary,updated,parent,issuetype,customfield_10006,customfield_10007'
      }
    }, `retrieve issues for: ${jql}}`).then(issueList => {
      if (issueList) {
        issueList.forEach(cache.storeIssue);
      }
      cache.storeIssues(jql, issueList);
      return issueList;
    });
  }
};

/**
 * Retrieve an issue
 *
 * @param {string} key - the key of the issue
 * @returns {Promise<jira~Issue>} the issue
 */
exports.issue = function(key) {
  let issue = cache.getIssue(key);
  if (issue) {
    return Promise.resolve(issue);
  } else {
    return jira.issue({
      path: {
        issue: key,
        fields: 'summary,updated,parent,issuetype,customfield_10006,customfield_10007'
      }
    }, `issue:${key}`).then(data => {
      cache.storeIssue(data);
      return data;
    });
  }
};

/**
 * Retrieve the worklogs for an issue
 *
 * @param {jira~Issue} issue - The issue
 * @returns {Promise<Array<jira~Worklog>>} the list of worklogs
 */
exports.worklog = function(issue) {
  const key = issue.key;
  const worklog = cache.getWorklogs(key);
  if (worklog && worklog.date >= issue.date) {
    return Promise.resolve(worklog.logs);
  } else {
    return jira.worklog({
      path: {
        issue: key
      }
    }, `worklog:${key}`).then(data => {
      if (data.worklogs) {
        cache.storeWorklogs(key, data.worklogs);
      } else {
        console.log(`Error retrieving worklogs for issue ${key}:`, data);
        return Promise.reject(new Error(`Error retrieving worklogs for issue ${key}`));
      }
      return data.worklogs;
    });
  }
};

/**
 * Retrieve an user from jira
 * @param {string} key - the user key
 * @returns {Promise<jira~User>} The user
 */
exports.user = function(key) {
  const user = cache.getUser(key);
  if (user) {
    return Promise.resolve(user);
  } else {
    return jira.user({
      parameters: {
        key
      }
    }, `user:${key}`).then(data => {
      if (data.key) {
        cache.storeUser(data);
        return data;
      } else {
        throw new Error(`Error retrieving user ${key}: ${data.errorMessages}`);
      }
    });
  }
};

/**
 * Retrieve the list of sprints for a board
 *
 * @param {int|string} boardId - it of the board
 * @returns {Promise<Array<jira~Sprint>>} the list of sprints
 */
exports.sprints = function(boardId) {
  const sprints = cache.getSprints(boardId);
  if (sprints) {
    return Promise.resolve(sprints);
  } else {
    return jira.sprints({
      path: {
        board: boardId
      },
      parameters: {
        maxResults: 1000,
        state: 'active,closed'
      }
    }, `sprints:${boardId}}`).then(data => {
      cache.storeSprints(boardId, data);
      return data;
    });
  }
};
