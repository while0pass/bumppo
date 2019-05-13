import './styles/main.css';
import log from './scripts/log.js';

import jQuery from 'jquery';
import ko from 'knockout';

import initKnockout from './scripts/init.knockout.js';
import { TreeNode } from './scripts/queryTree.js';
import getQueryJSON from './scripts/queryJSON.js';
import cinema from './scripts/cinema.js';

import { records, recordPhases, CheckboxForm } from './scripts/subcorpus.js';
import testResultsRawData from './results_data.js';

/* eslint-disable no-undef,no-constant-condition */
const searchEngineURL = (BUMPPO_ENV === 'production' ?
  'https://multidiscourse.ru:8080/search_annotations/SearchAnnotations' :
  (BUMPPO_LOCAL_SERVER ? BUMPPO_LOCAL_SERVER :
    'http://localhost:8080/search_annotations/SearchAnnotations'));
/* eslint-enable no-undef,no-constant-condition */
log('Search Engine:', searchEngineURL);

const qs = window.URLSearchParams && (new URLSearchParams(document.location.search));
window[';)'] = {
  debug: qs && qs.has('debug') || false,
  debugVideo: qs && qs.has('debugVideo') || false,
};

const QUERY_PANE = 'query',
      SUBCORPUS_PANE = 'subcorpus',
      RESULTS_PANE = 'results',
      RESOPTS_PANE = 'resopts';

function viewModel() {
  let self = this;
  this.version = 'v' + 'BUMPPO_VERSION';
  this.debug = window[';)'].debug;

  this.activePane = ko.observable();
  this.switchOnQueryPane = () => { self.activePane(QUERY_PANE); };
  this.switchOnSubcorpusPane = () => { self.activePane(SUBCORPUS_PANE); };
  this.switchOnResultsPane = () => { self.activePane(RESULTS_PANE); };
  this.switchOnResultsOptionsPane = () => { self.activePane(RESOPTS_PANE); };

  this.isQueryPaneOn = ko.computed(
    () => this.activePane() === QUERY_PANE);
  this.isSubcorpusPaneOn = ko.computed(
    () => this.activePane() === SUBCORPUS_PANE);
  this.isResultsPaneOn = ko.computed(
    () => this.activePane() === RESULTS_PANE);
  this.isResultsOptionsPaneOn = ko.computed(
    () => this.activePane() === RESOPTS_PANE);

  this.activePane.init = () => ko.computed(() => {
    var activePane = self.activePane() || QUERY_PANE;
    if ([QUERY_PANE, SUBCORPUS_PANE, RESOPTS_PANE].indexOf(activePane) > -1) {
      window.history.replaceState({}, '', `#!/${activePane}`);
      cinema.pauseAll();
    }
    if (activePane === RESOPTS_PANE) {
      if (self.canViewResults()) {
        self.activePane(RESULTS_PANE);
      } else {
        self.activePane(QUERY_PANE);
      }
      window.history.replaceState({}, '', `#!/${activePane}`);
      cinema.pauseAll();
    }
  });

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

  this.resultsRawData = ko.observable(null);
  this.subcorpus = {
    records: new CheckboxForm(records, this.isSubcorpusNew),
    recordPhases: new CheckboxForm(recordPhases, this.isSubcorpusNew)
  };
  this.subcorpusBanner = ko.computed(function () {
    let records = self.subcorpus.records,
        recordPhases = self.subcorpus.recordPhases,
        banner;
    if (self.resultsRawData() && self.resultsRawData().version === 'test') {
      return self.resultsRawData().subcorpus;
    }
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

  this.search = () => {
    if (self.canSearch()) {
      self.isSearchInProgress(true);
      cinema.clearActiveState();
      jQuery.ajax(searchEngineURL, {
        data: { data: self.queryJSON() }
      }).done(data => {
        self.isQueryNew(false);
        self.isSubcorpusNew(false);
        self.resultsRawData(data);
        self.resultsError(null);
      }).fail((jqXHR, textStatus, errorThrown) => {
        self.resultsRawData(self.debug ? testResultsRawData : null);
        self.resultsError(`Ошибка: ${ textStatus } "${ errorThrown }"`);
      }).always(() => {
        self.isSearchInProgress(false);
        self.canViewResults(true);
        self.switchOnResultsPane();
      });
    }
  };
  this.isSearchInProgress = ko.observable(false);

  this.canViewResults = ko.observable(false);
  this.resultsError = ko.observable(null);
  this.resultsNumber = ko.computed(function () {
    let R = self.resultsRawData();
    if (R && R.results instanceof Array) {
      return R.results.length;
    } else {
      return null;
    }
  });
  this.responseJSON = ko.computed(
    () => self.resultsRawData() ? JSON.stringify(self.resultsRawData(), null, 4) : ''
  );

}
const vM = new viewModel();
initKnockout(ko, vM);

vM.activePane(window.location.hash.slice(3) || QUERY_PANE);
vM.activePane.init();

jQuery('.bmpp-sidePane_menuItem').mouseover(function () {
  if (!jQuery(this).hasClass('disabled')) {
    jQuery(this).addClass('bmpp-sidePane_menuItem--hover');
  }
});
jQuery('.bmpp-sidePane_menuItem').mouseout(function () {
  jQuery(this).removeClass('bmpp-sidePane_menuItem--hover');
});

jQuery('#safetyCurtain').fadeOut();
