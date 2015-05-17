var AC = function(config) {
	this.dom = config.dom;
	this.datasource = config.datasource;
	this.config = config;
	
	this.oninput = this.oninput.bind(this);
	this.dom.oninput = this.oninput;
	
	this.domResults = document.createElement('div');
	this.domResults.className = 'acResult';
	this.domResults.onclick = this.onclick.bind(this);
	this.display();
	this.dom.parentNode.appendChild(this.domResults);
};

AC.prototype.oninput = function() {
	this.datasource(this.dom.value)
		.then(result => this.display(result));
};

AC.prototype.display = function(result) {
	if (result && result.length > 0) {
		this.domResults.innerHTML = jtime.tpl.ac(result);
		this.domResults.style.display = 'block';
		this.data = result;
	} else {
		this.domResults.style.display = 'none';
		this.domResults.innerHTML = '';
		delete this.data;
	}
};

AC.prototype.onclick = function(e) {
	let index = e && e.target && +e.target.dataset.acIndex;
	let item = this.data && this.data[index];
	if (item) {
		this.config.onselect(item);
	}
};

export default AC;
