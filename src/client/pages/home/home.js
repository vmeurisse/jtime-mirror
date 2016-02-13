import page from 'page';
import AC from './ac';
var home = {};

home.register = function(url) {
  page(url, (ctx) => this.show(ctx));
//  page.exit(url, (ctx) => this.destroy(ctx));
};

home.show = function() {
  jtime.run.container.innerHTML = jtime.tpl.home();

  jtime.run.home = {};
  jtime.run.data.home = {};

  var input = jtime.run.container.querySelector('input');
  jtime.run.home.ac = new AC({
    dom: input,
    datasource: home.acQuery.bind(home),
    onselect: item => page(`/projects/${item.key}`),
    template: jtime.tpl.ac
  });
  input.focus();
};

home.acQuery = function(query) {
  if (query.length < 2) return Promise.resolve(null);
  return home.getAcData()
    .then(data => {
      query = query.toLocaleLowerCase();
      return data.filter(project =>
        project.name.toLocaleLowerCase().indexOf(query) >= 0 || project.key.toLocaleLowerCase().indexOf(query) >= 0
      );
    });
};

home.getAcData = function() {
  if (jtime.run.data.home.projects) return Promise.resolve(jtime.run.data.home.projects);
  if (!jtime.run.home.getAcData) {
    jtime.run.home.getAcData = fetch('/api/projects')
        .then(response => response.json())
        .then(data => {
          jtime.run.data.home.projects = data;
          delete jtime.run.home.getAcData;
          return data;
        })
        .catch(() => {
          delete jtime.run.home.getAcData;
        });
  }
  return jtime.run.home.getAcData;
};

home.destroy = function() {
  // jtime.run.home.ac.destroy();
};

export default home;
