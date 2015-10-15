export function groupBy(list, key) {
	var map = {};
	list.forEach(function(item) {
		var value = find(item, key);
		if (!map[value]) map[value] = [];
		map[value].push(item);
	});
	return map;
}

export function defaults(base, extender) {
	for (var key in extender) {
		if (base[key] == null) {
			base[key] = extender[key];
		}
	}
	return base;
}

/**
 * Parse an url query string as an object.
 * 
 * If a key is present multiple time in the query, it will create an array.
 * 
 * Note that a key without an equal sign will be parsed as undefined while a key and an equal sign without a value
 * will produce an empty string
 * 
 * ```
 * parseQuery('a=1&a=2&key&equal=&json={a:1}') // =>
 * {
 *     a: ['1', '2'],
 *     key: unedfined,
 *     equal: '',
 *     json: '{a:1}'
 * }
 * ````
 * 
 * @param {string} querystring - The query string to parse. It should not contain the initial `?` sign
 * @return {Object} The parsed object
 */
export function parseQuery(querystring) {
	var query = {};
	if (!querystring) return query;
	var params = querystring.split('&');
	params.forEach(function(param) {
		var [key, value] = param.split('=');
		key = decodeURIComponent(key);
		value = value === undefined ? value : decodeURIComponent(value);
		if (key in query) {
			var oldValue = query[key];
			if (Array.isArray(oldValue)) {
				oldValue.push(value);
			} else {
				query[key] = [oldValue, value];
			}
		} else {
			query[key] = value;
		}
	});
	return query;
}

/**
 * Create a query string from an object.
 * 
 * Arrays are converted in multiple arguments. Object are serialized as json strings.
 * 
 * Note that an undefined value will be serialized as a key without an equal sign while an empty string will be serialized as a key followed by an equal sign
 * 
 * ```
 * serializeParams({
 *     a: [1, 2],
 *     key: unedfined,
 *     equal: '',
 *     json: {
 *         a: 1
 *     }
 * }) // => 'a=1&a=2&key&equal=&json={a:1}')
 * ````
 * 
 * @param {Object} params - The parameters to serialize
 * @return {string} The query string. Note that it doesn't contain an initial `?`.
 */
export function serializeParams(params) {
	var queryVars = [];
	for (var property in params) {
		if (Array.isArray(params[property])) {
			var list = params[property];
			for (var i = 0; i < list.length; i++) {
				queryVars.push(getEncodedParam(property, list[i]));
			}
		} else {
			queryVars.push(getEncodedParam(property, params[property]));
		}
	}
	return queryVars.join('&');
}

function getEncodedParam(key, value) {
	if (value instanceof Object) {
		value = JSON.stringify(value);
	}
	let encoded = encodeURIComponent(key);
	if (value !== undefined) {
		encoded += '=' + encodeURIComponent(value);
	}
	return encoded;
}

export function zeropad(n, w) {
	if (w == null) w = 2;
	var an = Math.abs(n);
	var digitCount = an === 0 ? 1 : 1 + Math.floor(Math.log(an) / Math.LN10);
	if (digitCount >= w) {
		return n;
	}
	var zeroString = Math.pow(10, w - digitCount).toString().substr(1);
	return n < 0 ? '-' + zeroString + an : zeroString + an;
}

/**
 * Get the values of an object as a list
 * 
 * ```
 * toList({
 *     a: 1,
 *     b: 2
 * });
 * // =>
 * [1, 2]
 * 
 * toList({
 *     a: 1,
 *     b: 2
 * }, 'key', 'value');
 * // =>
 * [{
 *     key: 'a',
 *     value: 1
 * }, {
 *     key: 'b',
 *     value: 2
 * }]
 * ```
 * 
 * @param {Object} object - The object to get the properties from
 * @param {string} [key] - If set, the key in the initial object will be stored in the list items under the provided key.
 * @param {string} [value] - If set, values will be wrapped inside a new object instead of being put directly in the list
 * @returns {Object[]} the list of values
 */
export function toList(object, key, value) {
	let list = [];
	for (let k in object) {
		let v = object[k];
		if (value) {
			v = {
				[value]: v
			};
		}
		if (key) {
			v[key] = k;
		}
		list.push(v);
	}
	return list;
}

/**
 * Get a value from an object.
 * 
 * @param {Object} object - the object to search values in
 * @param {string|string[]|function} path - The path to the value. It can be of the following types
 *                                           - `undefined`: the original object is returned
 *                                           - `function`: The function is called with the object as parameter. The return value of the function is used as value
 *                                           - `string`: The path is split at each dot (`.`) char. Note that if you call find in a loop, you might want to do the split yourself before the loop to avoid performance loss. See next case for details
 *                                           - `string[]`: Values of the array are used for deep search in the initial object. eg. `find({a:{b:2}}, 'a.b') === 2`. If any key is not found in the object, `undefined` is returned.
 * @return {*} the value
 */
export function find(object, path) {
	if (typeof path === 'undefined') {
		return object;
	}
	if (typeof path === 'function') {
		return path(object);
	}
	if (typeof path === 'string') {
		path = path.split('.');
	}
	for (let i = 0, l = path.length; i < l; ++i) {
		if (object == null) return object;
		object = object[path[i]];
	}
	return object;
}

/**
 * Sort a list according to the provided sorters
 * 
 * The initial list is sorted in place
 * 
 * @param {Array.<*>} list - The array to sort
 * @param {Object[]} sorters - The sorters to use. The sorters are used in the order they are provided for multicriteria sorting.
 * @param {string|string[]|function} [sorters.key] - Used to get the sorting value from the items of the list. See function `find` for details.
 * @returns {Array.<*>} the list
 */
export function sort(list, sorters) {
	if (!Array.isArray(list) || list.length < 2) return list;
	if (!Array.isArray(sorters)) sorters = [sorters];
	
	let length = list.length;
	let sorterLength = sorters.length;
	let i = length;
	while (i--) {
		let item = list[i];
		let values = new Array(sorterLength);
		
		let j = sorterLength;
		while (j--) {
			let sorter = sorters[j];
			let value = find(item, sorter.key);
			values[j] = value;
		}
		list[i] = {
			item,
			values
		};
	}
	
	list.sort(function (a, b) {
		for (let j = 0; j < sorterLength; ++j) {
			let va = a.values[j];
			let vb = b.values[j];
			if (va > vb) return 1;
			else if (va > vb) return -1;
		}
		return 0;
	});
	i = length;
	while (i--) {
		list[i] = list[i].item;
	}
	return list;
}

/**
 * Returns the first item in the list where the specified key has the specified value.
 * @param {Object[]} list - list of data to look in
 * @param {string} key - key to filter on
 * @param {string} value - value to look for (test is done with strict equality)
 * @returns {Object} the first matching element, undefined if none.
 */
export function getFirstItem(list, key, value) {
	var result;
	for (var i = 0, len = list.length; i < len; i++) {
		if (list[i][key] === value) {
			result = list[i];
			break;
		}
	}
	return result;
}
