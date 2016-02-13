import i18n from './jtime.i18n';

var dateFormatter = new Intl.DateTimeFormat(i18n.locale, {
  year: 'numeric',
  month: 'short',
  day: 'numeric'
});

Handlebars.registerHelper('formatDay', dateStr => dateFormatter.format(new Date(dateStr)));
