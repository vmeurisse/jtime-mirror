import * as bouc from '../bouc';

let dateformat = {};

const S_PER_MIN = 60;
const S_PER_HOUR = S_PER_MIN * 60;
const S_PER_DAY = S_PER_HOUR * 7;

dateformat.duration = function(sec) {
	let days = sec / S_PER_DAY | 0;
	sec = sec % S_PER_DAY;
	let hours = sec / S_PER_HOUR | 0;
	sec = sec % S_PER_HOUR;
	let minutes = sec / S_PER_MIN | 0;
	sec = sec % S_PER_MIN;
	
	let display = [];
	if (days) {
		display.push(days + 'd');
	}
	if (hours) {
		display.push(hours + 'h');
	}
	if (minutes) {
		display.push(minutes + 'm');
	}
	return display.join(' ');
};

export default dateformat;
