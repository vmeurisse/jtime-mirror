var express = require('express');

var config = require('../../config');
var jira = require('./jira');
var service = require('./service');

var app = express();

var root = __dirname + '/../../build';
app.use(express.static(root));

app.get(['/projects/:project/:date'], function(req, res) {
	res.sendFile('index.html', {
		root: root
	});
});

app.all('/api/projects', function(req, res) {
	jira.projects().then(function(projects) {
		res.json(projects);
	}).catch(handleError.bind(null, res));
});

app.all('/api/worklog/:projectKey/:date', function(req, res) {
	var lastDayOfMonth = new Date(+req.params.date.slice(0, 4), +req.params.date.slice(5, 7), 0).getDate();
	service.worklog({
		projectKey: req.params.projectKey,
		minDate: req.params.date + '-01',
		maxDate: req.params.date + '-' + lastDayOfMonth
	}).then(function(log) {
		res.json(log);
	}).catch(handleError.bind(null, res));
});

handleError = function(res, error) {
	console.log('Error', error);
	console.log(error.stack);
	res.json({
		error: '' + error
	});
};

app.listen(config.SERVER_PORT, function() {
	console.log('Server started on port ' + config.SERVER_PORT);
});

