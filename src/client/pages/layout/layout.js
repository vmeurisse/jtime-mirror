var layout = {};

layout.show = function() {
  var line = [0, 1, 2, 3];
  document.body.innerHTML = jtime.tpl.layout({
    conway: [line, line, line, line]
  });
  jtime.run.container = $$('main')[0];
  jtime.run.layout = {};
  jtime.run.layout.loader = $('jtime-loader');
};

layout.showLoader = function() {
  jtime.run.layout.loader.style.display = 'block';
};

layout.hideLoader = function() {
  jtime.run.layout.loader.style.display = 'none';
};

export default layout;
