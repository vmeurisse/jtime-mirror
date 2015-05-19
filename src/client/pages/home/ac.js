class AC {
	/**
	 * @param {Object} config - Options
	 * @param {Element} config.dom - The input to create the autocomplete on
	 * @param {function} config.datasource - the datasource to use. The method get as parameter the query string and should return a promise to an array of suggestions
	 * @param {function} config.template - the template used to display data. 
	 * @param {function} config.onselect - called when the user select a suggestion
	 */
	constructor(config) {
		this.data = {};
		
		Object.assign(this.data, config);
		
		this.data.dom.oninput = this.oninput.bind(this);
		this.data.dom.onkeydown = this.onkeydown.bind(this);
		
		this.data.domResults = document.createElement('div');
		this.data.domResults.className = 'acResult';
		this.data.domResults.onclick = this.onclick.bind(this);
		this.data.domResults.onmouseover = this.onmouseover.bind(this);
		
		this.display();
		this.data.dom.parentNode.appendChild(this.data.domResults);
	}
	
	/**
	 * Called when user is typing text in the input
	 * @param {Event} e - the event
	 * @private
	 */
	oninput() {
		this.data.datasource(this.data.dom.value)
			.then(suggestions => this.display(suggestions));
	}
	
	/**
	 * Keyboard support for the list
	 * @param {Event} e - the event
	 * @private
	 */
	onkeydown(e) {
		let handled = false;
		switch (e.keyCode) {
			case 38: //Up
				handled = true;
				this.shiftActive(-1);
				break;
			case 40: //Down
				handled = true;
				this.shiftActive(+1);
				break;
			case 27: //Escape
				handled = true;
				this.display();
				break;
			case 13: //Enter
				handled = true;
				this.select(this.data.active);
				break;
		}
		if (handled) {
			e.preventDefault();
		}
	}
	
	/**
	 * Display and store the suggestion list
	 * @param {Array} suggestions - the suggestions to display
	 * @private
	 */
	display(suggestions) {
		if (suggestions && suggestions.length > 0) {
			this.data.domResults.innerHTML = this.data.template(suggestions);
			this.data.domResults.style.display = 'block';
			this.data.suggestions = suggestions;
			this.data.domList = this.data.domResults.querySelectorAll('[data-ac-index]');
			delete this.data.active;
			this.activate(0, true);
		} else {
			this.data.domResults.style.display = 'none';
			this.data.domResults.innerHTML = '';
			delete this.data.suggestions;
			delete this.data.active;
			delete this.data.domList;
		}
	}
	
	/**
	 * Activate a new suggestion based on current active one
	 * @param {integer} offset - the number of positions between the curent active suggestion and the new one
	 * @private
	 */
	shiftActive(offset) {
		if (Number.isInteger(this.data.active)) {
			let newSelection = this.data.active + offset;
			if (newSelection < 0) newSelection = 0;
			if (newSelection >= this.data.suggestions.length) newSelection = this.data.suggestions.length - 1;
			this.activate(newSelection, true);
		}
	}
	
	/**
	 * Activate a suggestion based on index
	 * @param {integer} index - The index of the suggestion to activate
	 * @param {boolean} autoScroll - If `true` the list will be srolled so that the suggestion is visible
	 * @private
	 */
	activate(index, autoScroll) {
		if (index === this.data.active) return;
		
		if (Number.isInteger(this.data.active)) {
			this.data.domList[this.data.active].classList.remove('active');
		}
		let newActive = this.data.domList[index];
		newActive.classList.add('active');
		if (autoScroll) this.autoScroll(newActive);
		this.data.active = index;
	}
	
	/**
	 * Make sure the provided displayed suggestion is visible and scroll the list if needed
	 * @param {Element} activeElement - The suggestion to show
	 * @private
	 */
	autoScroll(activeElement) {
		let domResults = this.data.domResults;
		let scrollRect = domResults.getBoundingClientRect();
		let marginTop = domResults.clientTop;
		let marginBottom = scrollRect.height - domResults.clientHeight - domResults.clientTop;
		let activeRect = activeElement.getBoundingClientRect();
		if (activeRect.top < scrollRect.top + marginTop + activeRect.height) {
			domResults.scrollTop -= scrollRect.top + marginTop + activeRect.height - activeRect.top;
		} else if (activeRect.bottom > scrollRect.bottom - marginBottom - activeRect.height) {
			domResults.scrollTop += activeRect.bottom - scrollRect.bottom + marginBottom + activeRect.height;
		}
	}
	
	/**
	 * Select a suggestion and call the callbacks
	 * @param {integer} index - the index of the selection to select
	 * @private
	 */
	select(index) {
		let item = this.data.suggestions && this.data.suggestions[index];
		if (item) {
			this.data.onselect(item);
			this.display();
		}
	}
	
	/**
	 * Handle the click on a suggestion: select it
	 * @param {Event} e - the mouse event
	 * @private
	 */
	onclick(e) {
		let index = e && e.target && +e.target.dataset.acIndex;
		this.select(index);
	}
	
	/**
	 * Handle mouse over a suggestion: activate it
	 * @param {Event} e - the mouse event
	 * @private
	 */
	onmouseover(e) {
		let index = e && e.target && +e.target.dataset.acIndex;
		if (Number.isInteger(index)) {
			this.activate(index);
		}
	}
}

export default AC;
