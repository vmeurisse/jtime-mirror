if (!Object.assign) {
  Object.assign = function(target) {
    var to = Object(target);
    for (var i = 1; i < arguments.length; i++) {
      var nextSource = arguments[i];
      if (nextSource === undefined || nextSource === null) {
        continue;
      }
      nextSource = Object(nextSource);

      var keysArray = Object.keys(Object(nextSource));
      for (var nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex++) {
        var nextKey = keysArray[nextIndex];
        to[nextKey] = nextSource[nextKey];
      }
    }
    return to;
  };
}
