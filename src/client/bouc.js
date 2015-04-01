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

export function parseQuery(querystring) {
	var query = {};
	if (!querystring) return query;
	var params = querystring.split('&');
	params.forEach(function(param) {
		var [key, value] = param.split('=');
		key = decodeURIComponent(key);
		value = decodeURIComponent(value);
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
	return queryVars.join("&");
}

function getEncodedParam(key,value) {
	if (value instanceof Object) {
		value = JSON.stringify(value);
	}
	return encodeURIComponent(key) + "=" + encodeURIComponent(value);
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
