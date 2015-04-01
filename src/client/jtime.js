import page from 'page';

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
	layout.show();
	page('/', (ctx) => home(ctx));
	persontime.register('/projects/:project/:date');
	page.start();
}

if (document.readyState !== 'loading') start();
else document.addEventListener('DOMContentLoaded', start);


(function() {
	var l = document.createElement("script");
	l.async = true;
	l.src = 'http://' + (location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1';
	var s = document.getElementsByTagName('script')[0];
	s.parentNode.insertBefore(l, s);
})();

export default jtime;