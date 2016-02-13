export default {
  locale: window.Intl ? (new Intl.NumberFormat()).resolvedOptions() : null
};
