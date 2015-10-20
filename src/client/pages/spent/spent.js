import page from 'page';

import * as bouc from '../../bouc';
import sr from './sr';

var spent = {};
export default spent;

spent.register = function(url) {
	Handlebars.registerPartial('spent-report', jtime.tpl.spent.report);
	page(url, (ctx) => this.show(ctx));
	//page.exit(url, (ctx) => this.destroy(ctx));
};

spent.show = function(ctx) {
	jtime.run.spent = {
		select: this.select.bind(this)
	};
	let data = {
		ctx: ctx,
		project: ctx.params.project,
		board: ctx.params.board
	};
	jtime.run.data.spent = data;
	jtime.showLoader();
	
	fetch(`/api/boards/${data.board}/sprints`)
		.then(response => response.json())
		.then(result => this.draw(data, result))
		.then(jtime.hideLoader)
		.catch(jtime.hideLoader);
};

spent.destroy = function() {
	delete jtime.run.data.spent;
	delete jtime.run.spent;
};

spent.draw = function(data, result) {
	data.result = result;
	bouc.sort(result.values, {key: 'startDate'}).reverse();
	jtime.run.container.innerHTML = jtime.tpl.spent({
		data: data,
		sprints: result.values
	});
};

spent.select = function(button, sprintId) {
	var current = jtime.run.container.querySelector('.jtime-spent-controls .button.selected');
	if (current) {
		current.classList.remove('selected');
	}
	if (button !== current) {
		button.classList.add('selected');
		
		jtime.showLoader();
		var data = jtime.run.data.spent;
		data.sprintId = sprintId;
		data.sprint = bouc.getFirstItem(data.result.values, 'id', sprintId);
		sr.run(data.project, data.sprint)
			.then(report => spent.drawReport(report, data.sprint))
			.then(jtime.hideLoader)
			.catch(jtime.hideLoader);
	} else {
		spent.drawReport();
	}
};

spent.drawReport = function(report, sprint) {
	report = report || {};
	var reportContainer = jtime.run.container.querySelector('.jtime-spent-report');
	reportContainer.innerHTML = jtime.tpl.spent.report({
		sprint: sprint,
		productive: report.productive || '-',
		noise: report.noise || '-',
		off: report.off || '-',
		unknown: report.unknown || '-'
	});
};
