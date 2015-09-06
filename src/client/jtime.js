/*global $:true, $$:true, jtime: true*/
import 'es6';

import page from 'page';

import ie from './pages/ie/ie';
import layout from './pages/layout/layout';
import home from './pages/home/home';
import persontime from './pages/persontime/persontime';


window.page = page;

$ = document.getElementById.bind(document);
$$ = document.querySelectorAll.bind(document);

jtime = window.jtime || {};
jtime.run = {
	data: {}
};

jtime.showLoader = () => layout.showLoader();
jtime.hideLoader = () => layout.hideLoader();

function start () {
	if (ie.check()) {
		layout.show();
		home.register('/');
		persontime.register('/projects/:project/:date');
		persontime.register('/projects/:project');
		page.start();
	}
}

let ready = new Promise(function(fullfil) {
	if (document.readyState === 'complete') fullfil();
	else document.addEventListener('DOMContentLoaded', fullfil);
});

let conf = fetch('/api/config').then(res => res.json()).then(c => jtime.config = c);

Promise.all([ready, conf]).then(start);

if (location.search.match(/livereload/)) {
	(function() {
		var l = document.createElement('script');
		l.async = true;
		l.src = 'http://' + (location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1';
		var s = document.getElementsByTagName('script')[0];
		s.parentNode.insertBefore(l, s);
	})();
}

export default jtime;
