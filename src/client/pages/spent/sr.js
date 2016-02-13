import * as bouc from '../../bouc';

/**
 * Data Retrieval and Analysis
 */

var sr = {};
export default sr;

// return the total time spent (in days) on all tasks of the provided workLog array
sr.sumTime = function(workLog) {
  var sum = 0;
  for (var i = 0; i < workLog.length; i++) {
    sum += workLog[i].timeSpentSeconds;
  }
  return sum / (7 * 3600); // convert to days
};

sr.getMonthId = function(year, month) {
  return `${year}-${bouc.zeropad(month + 1, 2)}`;
};

sr.getMonths = function(start, end) {
  var months = [];
  end = new Date(end);
  end = sr.getMonthId(end.getFullYear(), end.getMonth());
  start = new Date(start);
  var year = start.getFullYear();
  var month = start.getMonth();
  do {
    var date = sr.getMonthId(year, month);
    months.push(date);
    month++;
    if (month === 12) {
      month = 0;
      year++;
    }
  } while (date < end);
  return months;
};

sr.grab = function(project, date) {
  return fetch(`/api/worklog/${project}/${date}`)
    .then(response => response.json());
};

sr.grabMultiple = function(project, dates) {
  return Promise.all(dates.map(item => sr.grab(project, item)))
    .then(works => Array.prototype.concat.apply([], works));
};

sr.filter = function(work, start, end) {
  return work.filter(item => {
    var itemDate = new Date(item.localStart);
    return (itemDate >= start) && (itemDate <= end);
  });
};

sr.aggregateByTask = function(work) {
  var grouped = bouc.groupBy(work, 'task');
  var report = {};
  for (var id in grouped) {
    var list = grouped[id];
    report[id] = {
      'task': id,
      'taskName': list[0].taskName,
      'timeSpentDays': sr.sumTime(list),
      'issues': list
    };
  }
  return report;
};

sr.aggregateByStory = function(work) {
  var grouped = bouc.groupBy(work, 'story');
  var report = {};
  for (var id in grouped) {
    var list = grouped[id];
    report[id] = {
      'story': id,
      'storyName': list[0].storyName,
      'timeSpentDays': sr.sumTime(list),
      'issues': sr.aggregateByTask(list)
    };
  }
  return report;
};

sr.aggregateByEpic = function(work) {
  var grouped = bouc.groupBy(work, 'epic');
  var report = {};
  for (var id in grouped) {
    var list = grouped[id];
    report[id] = {
      'epic': id,
      'epicName': list[0].epicName,
      'timeSpentDays': sr.sumTime(list),
      'issues': sr.aggregateByStory(list)
    };
  }
  console.log('Sprint spent: ', report);
  return report;
};

sr.analyze = function(work) {
  return sr.aggregateByEpic(work);
};

sr.isNoise = function(epicData) {
  return (epicData.epicName && epicData.epicName.startsWith('[NOISE]'));
};

sr.isOff = function(epicData) {
  return (epicData.epicName && epicData.epicName.startsWith('[OFF]'));
};

sr.report = function(epicReport) {
  var report = {};
  var totalProductive = 0;
  var totalNoise = 0;
  var totalOff = 0;
  for (var epic in epicReport) {
    var epicData = epicReport[epic];
    if (epic === 'undefined') {
      report.unknown = `${epicData.timeSpentDays.toFixed(2)}d`;
      console.log('Unknown spent: ', epicData);
    } else if (sr.isNoise(epicData)) {
      totalNoise += epicData.timeSpentDays;
    } else if (sr.isOff(epicData)) {
      totalOff += epicData.timeSpentDays;
    } else {
      totalProductive += epicData.timeSpentDays;
    }
  }
  report.productive = `${totalProductive.toFixed(2)}d`;
  report.noise = `${totalNoise.toFixed(2)}d`;
  report.off = `${totalOff.toFixed(2)}d`;
  return report;
};

sr.run = function(project, sprint) {
  console.log('Sprint: ', sprint.name);
  return sr.grabMultiple(project, sr.getMonths(sprint.startDate, sprint.endDate))
    .then(work => sr.filter(work, new Date(sprint.startDate), new Date(sprint.endDate)))
    .then(sr.analyze)
    .then(sr.report);
};
