'use strict';

/**
 * @class lru-cache
 */
/**
 * @method lru-cache.set
 */
/**
 *
 * @type {lru-cache}
 */
const LRUCache = require('lru-cache');

// issue-list
const shortCache = new LRUCache({
  max: 1000,
  maxAge: 5 * 60 * 1000 // 5 minutes
});

// projects
const mediumCache = new LRUCache({
  max: 10000,
  maxAge: 60 * 60 * 1000 // 1 day
});

// users, worklogs, issues
const longCache = new LRUCache({
  max: 50000,
  maxAge: 7 * 24 * 60 * 60 * 1000 // 1 week
});

/**
 * Store the list of projects
 *
 * @param {Array<jira~Project>} projects - the list of projects to store
 */
exports.storeProjects = function(projects) {
  mediumCache.set('projects', projects);
};

/**
 * Get the list of projects form the cache
 *
 * @returns {Array<jira~Project>} the cached projects
 */
exports.getProjects = function() {
  return mediumCache.get('projects');
};

/**
 * Store an user in cache
 *
 * @param {jira~User} user - the user to store
 */
exports.storeUser = function(user) {
  mediumCache.set(`user:${user.key}`, user);
};

/**
 * Get an user from the cache
 *
 * @param {string} userKey - the key of the user
 * @returns {jira~User} the user
 */
exports.getUser = function(userKey) {
  return mediumCache.get(`user:${userKey}`);
};

/**
 * Store an issue in the cache
 *
 * @param {jira~Issue} issue - the issue to store
 */
exports.storeIssue = function(issue) {
  if (issue.fields && issue.fields.updated) {
    issue.date = new Date(issue.fields.updated);
  }
  longCache.set(`issue:${issue.key}`, issue);
};

/**
 * Get an issue from the cache
 *
 * @param {string} key - The key of the issue. ed: `"ABC-123"`
 * @returns {jira~Issue} the cached issue
 */
exports.getIssue = function(key) {
  return longCache.get(`issue:${key}`);
};

/**
 * Store a list of issues in the cache.
 *
 * @param {string} jql - the query used to retrieve the issues
 * @param {Array<jira~Issue>} issues - the issues to cache
 */
exports.storeIssues = function(jql, issues) {
  shortCache.set(`issues:${jql}`, issues);
};

/**
 * Get a list of issues from the cache
 *
 * @param {string} jql - the same value as used when storing issues
 * @returns {Array<jira~Issue>} the cached issues
 */
exports.getIssues = function(jql) {
  return shortCache.get(`issues:${jql}`);
};

/**
 * Store the list of sprints of a board
 *
 * @param {string|int} boardId - the id of the sprint
 * @param {Array<jira~Sprint>} sprints - the list of sprints to store
 */
exports.storeSprints = function(boardId, sprints) {
  mediumCache.set(`sprints:${boardId}`, sprints);
};

/**
 * Get the list of sprint of a board
 *
 * @param {string|int} boardId - the id of the sprint
 * @returns {Array<jira~Sprint>} the list of sprints
 */
exports.getSprints = function(boardId) {
  return mediumCache.get(`sprints:${boardId}`);
};

/**
 * Store the list of worklogs for an issue
 *
 * @param {string} issueKey - the key of the issue
 * @param {Array<jira~Worklog>} worklogs - the list of worklogs to store
 */
exports.storeWorklogs = function(issueKey, worklogs) {
  longCache.set(`worklogs:${issueKey}`, {
    logs: worklogs,
    date: new Date()
  });
};

/**
 * Get the list of worklogs for an issue
 *
 * @param {string} issueKey - the key of the issue
 * @returns {{logs: Array<jira~Worklog>, date: Date}} the list of worklogs
 */
exports.getWorklogs = function(issueKey) {
  return longCache.get(`worklogs:${issueKey}`);
};
