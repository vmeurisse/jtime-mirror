/**
 * @typedef {Object} jira~Project
 * @property {string} id - Identifier of the project. eg: `'123'`
 * @property {string} key - Key of the project. eg: `'ABC'`
 * @property {string} name - Name of the project
 */

/**
 * @typedef {Object} jira~User
 * @property {string} name - Username
 * @property {string} key -
 * @property {string} emailAddress -
 * @property {Object} avatarUrls -
 * @property {string} displayName -
 * @property {boolean} active -
 * @property {string} timeZone -
 */

/**
 * @typedef {Object} jira~Worklog
 * @property {string} comment - Comment entered by the user on the worklog
 * @property {string} created -
 * @property {int} timeSpentSeconds -
 */

/**
 * @typedef {Object} jira~Issue
 * @property {string} id - Unique id of the issue. eg. `'127'`
 * @property {string} key - Key of the issue. eg. `'ABC-123'`
 * @property {Object} fields -
 * @property {string} fields.updated -
 */

/**
 * @typedef {Object} jira~Sprint
 * @property {int} id - Id of the sprint
 * @property {string} name - Name of the sprint
 * @property {string} startDate - start date in iso format
 * @property {string} endDate - end date in iso format
 * @property {int} originBoardId - Id of the board in which the sprint was created
 */
