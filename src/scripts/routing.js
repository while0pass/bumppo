import cinema from './cinema.js';

const hrefs = {
  QUERY_PANE: 'query',
  SUBCORPUS_PANE: 'subcorpus',
  RESULTS_PANE: 'results',
  RESOPTS_PANE: 'resopts'
};

function navigate(href) {
  window.history.replaceState({}, '', makeHash(href));
  cinema.pauseAll();
}

function route(href, canViewResults) {
  href = href || hrefs.QUERY_PANE;
  if ([hrefs.QUERY_PANE, hrefs.SUBCORPUS_PANE,
    hrefs.RESOPTS_PANE, hrefs.RESULTS_PANE].indexOf(href) > -1) {
    if (href === hrefs.RESULTS_PANE && !canViewResults) {
      return hrefs.QUERY_PANE;
    }
  } else {
    return hrefs.QUERY_PANE;
  }
  return href;
}

function makeHash(href) {
  return `#!/${href}`;
}

function getHRef(hash) {
  return hash.slice(3);
}

export { getHRef, hrefs, navigate, route };
