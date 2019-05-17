import log from './scripts/log.js';
import jQuery from 'jquery';
import ko from 'knockout';

import { init as initKnockout, preinit as preinitKnockout  }
  from './scripts/init.knockout.js';
import { TreeNode } from './scripts/queryTree.js';
import getQueryJSON from './scripts/queryJSON.js';
import cinema from './scripts/cinema.js';
import { getHRef, hrefs } from './scripts/routing.js';
import { concatResults, getResults } from './scripts/results.js';
import { records, recordPhases, CheckboxForm } from './scripts/subcorpus.js';

preinitKnockout(ko);

const qs = window.URLSearchParams && (new URLSearchParams(document.location.search));
window[';)'] = {
  debug: qs && qs.has('debug') || false,
  debugVideo: qs && qs.has('debugVideo') || false,
};

const worker = new Worker('js/worker.js');

function viewModel() {
  let self = this;
  this.version = 'v' + '$_CONFIG.BUMPPO_VERSION';
  this.debug = window[';)'].debug;

  this.clientHRef = ko.observable(getHRef(window.location.hash))
    .extend({ clientRouting: self });
  this.switchOnQueryPane = () => { self.clientHRef(hrefs.QUERY_PANE); };
  this.switchOnSubcorpusPane = () => { self.clientHRef(hrefs.SUBCORPUS_PANE); };
  this.switchOnResultsPane = () => { self.clientHRef(hrefs.RESULTS_PANE); };
  this.switchOnResultsOptionsPane = () => { self.clientHRef(hrefs.RESOPTS_PANE); };

  this.isQueryPaneOn = ko.computed(
    () => this.clientHRef() === hrefs.QUERY_PANE);
  this.isSubcorpusPaneOn = ko.computed(
    () => this.clientHRef() === hrefs.SUBCORPUS_PANE);
  this.isResultsPaneOn = ko.computed(
    () => this.clientHRef() === hrefs.RESULTS_PANE);
  this.isResultsOptionsPaneOn = ko.computed(
    () => this.clientHRef() === hrefs.RESOPTS_PANE);

  this.queryPaneView = ko.observable(null);
  this.queryPaneView.isTreeVisible = ko.computed(
    () => self.queryPaneView() === null
  );
  this.queryPaneView.editNodeProperties = function (node) {
    self.queryPaneView(node);
  };
  this.queryPaneView.finishEditingNodeProperties = function () {
    let node = self.queryPaneView();
    if (node.arePropertiesChanged()) {
      self.isQueryNew(true);
    }
    self.queryPaneView(null);
  };
  this.queryPaneView.arePropertiesVisible = ko.computed(
    () => self.queryPaneView() instanceof TreeNode
  );
  this.queryPaneView.propertiesNode = ko.computed(function () {
    if (self.queryPaneView.arePropertiesVisible()) {
      return self.queryPaneView.peek();
    }
  });

  this.queryPartsNonReadiness = ko.observableArray(
    [this.queryPaneView.arePropertiesVisible]);
  this.isQueryReady = ko.computed(function () {
    for (let isQueryPartNotReady of self.queryPartsNonReadiness()) {
      if (isQueryPartNotReady()) { return false; }
    }
    if (!self.queryTree || !self.queryTree.unitType()) { return false; }
    return true;
  }).extend({ rateLimit: 50 });
  this.isQueryNew = ko.observable(true);
  this.isSubcorpusNew = ko.observable(false);

  this.resultsData = ko.observableArray([]);
  this.subcorpus = {
    records: new CheckboxForm(records, this.isSubcorpusNew),
    recordPhases: new CheckboxForm(recordPhases, this.isSubcorpusNew)
  };
  this.subcorpusBanner = ko.computed(function () {
    let records = self.subcorpus.records,
        recordPhases = self.subcorpus.recordPhases,
        banner;
    if (records.areAllUnchecked || records.areAllChecked) {
      banner = 'все записи; ';
    } else {
      let list = records.fields
        .filter(field => !field.disabled && field.value())
        .map(field => field.query);
      if (list.length === 1) {
        banner = `запись ${ list[0] }; `;
      } else {
        banner = `записи ${ list.join(', ') }; `;
      }
    }
    if (recordPhases.areAllUnchecked || recordPhases.areAllChecked) {
      banner += 'все этапы.';
    } else {
      let list = recordPhases.fields
        .filter(field => !field.disabled && field.value())
        .map(field => field.label);
      if (list.length === 1) {
        banner += `этап ${ list[0] }.`;
      } else {
        banner += `этапы ${ list.join(', ') }.`;
      }
    }
    return banner;
  }, this);

  this.queryTree = new TreeNode();

  this.canSearch = ko.computed(function () {
    let isQueryReady = self.isQueryReady(),
        isQueryNew = self.isQueryNew(),
        isSubcorpusNew = self.isSubcorpusNew();
    if (isQueryReady && (isQueryNew || isSubcorpusNew)) {
      return true;
    } else {
      return false;
    }
  });

  this.lastQueryJSON = '';
  this.queryJSON = ko.computed(function () {
    if (self.canSearch()) {
      self.lastQueryJSON = getQueryJSON(self);
    }
    return self.lastQueryJSON;
  }).extend({ rateLimit: 500 });

  this.cinema = cinema;
  this.search = () => {
    if (self.canSearch()) {
      self.searchStatus('Формирование запроса');
      self.isSearchInProgress(true);
      self.canSearchBeAborted(true);
      self.cinema.clearActiveState();
      worker.postMessage(['query', self.queryJSON()]);
    }
  };
  this.isSearchInProgress = ko.observable(false);
  this.canSearchBeAborted = ko.observable(true);
  this.searchStatus = ko.observable('');
  this.abortLastRequest = () => {
    self.isSearchInProgress(false);
    worker.postMessage(['abort', null]);
  };
  this.isLoadingNewDataPortion = ko.observable(false);
  this.loadNewDataPortion = () => {
    self.isLoadingNewDataPortion(true);
    worker.postMessage(['results1', null]);
  };

  this.canViewResults = ko.observable(false);
  this.resultsError = ko.observable(null);
  this.resultsNumber = ko.observable(null);
  this.responseJSON = ko.pureComputed(
    () => self.resultsData() ? JSON.stringify(self.resultsData(), null, 4) : ''
  );

}
const vM = new viewModel();
initKnockout(ko, vM);

worker.onmessage = message => {
  let [ messageType, data ] = message.data;
  if (messageType === 'results0') {
    vM.isQueryNew(false);
    vM.isSubcorpusNew(false);
    vM.resultsNumber(data.total);
    vM.resultsData(getResults(data.results));
    vM.resultsError(null);
    vM.isSearchInProgress(false);
    vM.canViewResults(true);
    vM.switchOnResultsPane();
  } else if (messageType === 'results1') {
    if (data && data.length) {
      concatResults(vM.resultsData, getResults(data));
    }
    vM.isLoadingNewDataPortion(false);
    log(`Got ${ vM.resultsData().length } / ${ vM.resultsNumber() } results`);
  } else if (messageType === 'status') {
    vM.searchStatus(data);
  } else if (messageType === 'error') {
    vM.resultsError(data);
  } else if (messageType === 'noabort') {
    vM.canSearchBeAborted(false);
  }
};

jQuery('.bmpp-sidePane_menuItem').mouseover(function () {
  if (!jQuery(this).hasClass('disabled')) {
    jQuery(this).addClass('bmpp-sidePane_menuItem--hover');
  }
});
jQuery('.bmpp-sidePane_menuItem').mouseout(function () {
  jQuery(this).removeClass('bmpp-sidePane_menuItem--hover');
});

jQuery('#safetyCurtain').fadeOut();
