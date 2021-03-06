'use strict';

const path = require('path');
const express = require('express');

const config = require('../../config');
const jira = require('./jira');
const service = require('./service');

const app = express();

const root = path.join(__dirname, '..', '..', 'build');
app.use(express.static(root));

function handleError(res, error) {
  console.log('Error', error);
  console.log(error.stack);
  res.json({
    error: `${error}`
  });
}

app.get(['/projects/:project', '/projects/:project/:date', '/projects/:project/boards/:board'], (req, res) => {
  res.sendFile('index.html', {
    root
  });
});

app.get('/api/projects', (req, res) => {
  jira.projects().then(projects => {
    res.json(projects);
  }).catch(handleError.bind(null, res));
});

app.get('/api/config', (req, res) => {
  res.json({
    jiraUrl: config.JIRA_URL
  });
});

app.get(['/api/worklog/:projectKey/:date', '/api/worklog/:projectKey/:minDate/:maxDate'], (req, res) => {
  let minDate,
      maxDate;
  if (req.params.minDate) {
    minDate = req.params.minDate;
    maxDate = req.params.maxDate;
  } else {
    const lastDayOfMonth = new Date(+req.params.date.slice(0, 4), +req.params.date.slice(5, 7), 0, 12, 0).getDate();
    minDate = `${req.params.date}-01`;
    maxDate = `${req.params.date}-${lastDayOfMonth}`;
  }
  service.worklog({
    projectKey: req.params.projectKey,
    minDate,
    maxDate
  }).then(log => {
    res.json(log);
  }).catch(handleError.bind(null, res));
});

app.get('/api/boards/:boardId/sprints', (req, res) => {
  jira.sprints(req.params.boardId).then(sprints => {
    res.json(sprints);
  }).catch(handleError.bind(null, res));
});

app.listen(config.SERVER_PORT, () => {
  console.log(`Server started on port ${config.SERVER_PORT}`);
});
