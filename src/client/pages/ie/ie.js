var ie = {};

ie.check = function() {
  if (navigator.userAgent.indexOf('MSIE') !== -1 || navigator.appVersion.indexOf('Trident/') > 0) {
    document.body.innerHTML = jtime.tpl.ie();
    return false;
  }
  return true;
};

export default ie;
