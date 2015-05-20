export function groupBy(list, key) {
	var map = {};
	list.forEach(function(item) {
		var value = item[key];
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
	var an = Math.abs(n);
	var digitCount = 1 + Math.floor(Math.log(an) / Math.LN10);
	if (digitCount >= w) {
		return n;
	}
	var zeroString = Math.pow(10, w - digitCount).toString().substr(1);
	return n < 0 ? '-' + zeroString + an : zeroString + an;
}
