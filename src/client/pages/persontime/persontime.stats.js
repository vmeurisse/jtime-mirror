import * as bouc from '../../bouc';
import dateformat from '../../modules/dateformat';

export function showStats(colorMap, selectedWorkIndex) {
  let data = jtime.run.data.persontime;
  data = data.work[data.username] || [];

  let total = getTotal(data);
  let days = getDays(data);
  jtime.run.persontime.statsContainer.innerHTML = jtime.tpl.persontime.stats({
    crs: getCRs(data, colorMap),
    total: dateformat.duration(total),
    days,
    average: dateformat.duration(total / days),
    selected: data[selectedWorkIndex],
    jiraUrl: jtime.config.jiraUrl
  });
  jtime.run.persontime.statsContainer.onmouseover = highlightWork;
  jtime.run.persontime.statsContainer.onmouseout = highlightWork;
}

function getCRs(data, colorMap) {
  data = bouc.groupBy(data, 'epicName');
  data = bouc.toList(data, 'epicName', 'worklogs');
  data.forEach(item => {
    item.time = getTotal(item.worklogs);
    item.timeDisplay = dateformat.duration(item.time);
    item.CR = item.worklogs[0].CR;
    item.color = colorMap[item.CR];
    item.epic = item.worklogs[0].epic;
    if (item.epicName === 'undefined') item.epicName = 'No Epic';
  });
  bouc.sort(data, { key: 'epicName' });
  return data;
}

function getTotal(data) {
  return data.reduce((a, b) => a + b.timeSpentSeconds, 0);
}

function getDays(data) {
  return Object.keys(bouc.groupBy(data, 'day')).length;
}

function highlightWork(e) {
  let epic = e.target.getAttribute('data-epic');
  if (epic == null) return;

  let dimmed = (e.type === 'mouseover');
  let items = jtime.run.persontime.tableContainer.querySelectorAll('.item');
  for (let i = 0; i < items.length; i++) {
    let item = items[i];
    if (item.getAttribute('data-epic') !== epic) {
      item.classList.toggle('dimmed', dimmed);
    }
  }

  let control = jtime.run.persontime.statsContainer.querySelector(`dd[data-epic="${epic}"]`);
  if (control) {
    control.classList.toggle('highlighted', dimmed);
  }
}
