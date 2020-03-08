import jQuery from 'jquery';
import ko from 'knockout';

import { init as initKnockout, preinit as preinitKnockout  }
  from './scripts/init.knockout.js';
import { TreeNode } from './scripts/queryTree.js';
import { getQueryJSON, getLayersQueryJSON } from './scripts/queryJSON.js';
import Cinema from './scripts/cinema.js';
import { getHRef, hrefs } from './scripts/routing.js';
import { getResults } from './scripts/results.js';
import { LayersStruct, resOptsAdditionalTierTypes } from './scripts/layers.js';
import { TimeLine } from './scripts/timeline.js';
import { records, recordPhases, CheckboxForm } from './scripts/subcorpus.js';


preinitKnockout(ko);

const qs = window.URLSearchParams
  && (new URLSearchParams(document.location.search));
window[';)'] = {
  debug: qs && qs.has('debug') || false,
  stub: qs && qs.has('stub') || false,
};

const worker = new Worker('js/worker.js');

function viewModel() {
  let self = this;
  function switchTo(href) {
    return function () {
      self.clientHRef(href);
      self.cinema.pauseAll();
      self.abortLastRequest();
    };
  }

  this.version = 'v' + '$_CONFIG.BUMPPO_VERSION';
  this.debug = window[';)'].debug;

  this.clientHRef = ko.observable(getHRef(window.location.hash))
    .extend({ clientRouting: self });
  this.switchOnQueryPane = switchTo(hrefs.QUERY_PANE);
  this.switchOnSubcorpusPane = switchTo(hrefs.SUBCORPUS_PANE);
  this.switchOnResultsPane = () => { self.clientHRef(hrefs.RESULTS_PANE); };
  this.switchOnResOptsPane = switchTo(hrefs.RESOPTS_PANE);

  this.isQueryPaneOn = ko.computed(
    () => this.clientHRef() === hrefs.QUERY_PANE);
  this.isSubcorpusPaneOn = ko.computed(
    () => this.clientHRef() === hrefs.SUBCORPUS_PANE);
  this.isResultsPaneOn = ko.computed(
    () => this.clientHRef() === hrefs.RESULTS_PANE);
  this.isResOptsPaneOn = ko.computed(
    () => this.clientHRef() === hrefs.RESOPTS_PANE);
  self.isResOptsPaneOn.subscribe(on => {
    if (!self.activeResult()) return;
    const slug = self.resOptsAdditionalTierTypes.value().join('');
    if (on) {
      self._lastResOpts = slug;
    } else {
      if (slug !== self._lastResOpts) self.loadLayers.reload();
    }
  });

  this.queryPaneView = ko.observable(null);
  this.queryPaneView.isTreeVisible = ko.computed(
    () => self.queryPaneView() === null
  );
  this.queryPaneView.editNodeProperties = function ($data) {
    self.queryPaneView($data.node);
  };
  this.queryPaneView.editNodeRelations = function ($data) {
    self.queryPaneView([$data.node1, $data.node2]);
  };
  this.queryPaneView.finishEditingNodeProperties = function () {
    let node = self.queryPaneView();
    if (node.arePropertiesChanged()) {
      self.isQueryNew(true);
    }
    self.queryPaneView(null);
  };
  this.queryPaneView.finishEditingNodeRelations = function () {
    let node2 = self.queryPaneView.relationsNode2();
    if (node2.areRelationsChanged()) {
      self.isQueryNew(true);
    }
    self.queryPaneView(null);
  };
  this.queryPaneView.arePropertiesVisible = ko.computed(
    () => self.queryPaneView() instanceof TreeNode
  );
  this.queryPaneView.areRelationsVisible = ko.computed(
    () => self.queryPaneView() instanceof Array
  );
  this.queryPaneView.propertiesNode = ko.computed(function () {
    if (self.queryPaneView.arePropertiesVisible()) {
      return self.queryPaneView.peek();
    }
  });
  this.queryPaneView.relationsNode1 = ko.computed(function () {
    if (self.queryPaneView.areRelationsVisible()) {
      return self.queryPaneView()[0];
    }
    return null;
  });
  this.queryPaneView.relationsNode2 = ko.computed(function () {
    if (self.queryPaneView.areRelationsVisible()) {
      return self.queryPaneView()[1];
    }
    return null;
  });
  this.queryPaneView.resetRelations = () => {
    let node2 = self.queryPaneView.relationsNode2();
    node2.resetRelationsFormula();
  };

  this.queryPartsNonReadiness = ko.observableArray([
    self.queryPaneView.arePropertiesVisible,
    self.queryPaneView.areRelationsVisible,
  ]);
  this.isQueryReady = ko.computed(function () {
    for (let isQueryPartNotReady of self.queryPartsNonReadiness()) {
      if (isQueryPartNotReady()) { return false; }
    }
    if (!self.queryTree || !self.queryTree.unitType()) { return false; }
    return true;
  }).extend({ rateLimit: 50 });
  this.isQueryNew = ko.observable(true);
  this.isSubcorpusNew = ko.observable(false);

  this.resultsData = ko.observable([]);
  this.resultsWindow = ko.observableArray([]);
  this.resultsSections = ko.observableArray([]);
  this.resultsNumber = ko.observable(null);
  this.resOptsAdditionalTierTypes = resOptsAdditionalTierTypes;
  this.layersData = ko.observable(new LayersStruct());
  this.showResultsOnly = ko.observable(true);
  // Показывать только результаты без слоев.
  self._lock_ChangeLayout = false;
  self.showResultsOnly.subscribe(function (value) {
    if (!value) {
      self._lock_ChangeLayout = true;
      const func = () => {
        const block = value ? 'nearest' : 'center',
              opts = { behavior: 'auto', block },
              element = document.querySelector('.currentItem');
        if (element !== null) element.scrollIntoView(opts);
        self._lock_ChangeLayout = false;
      };
      setTimeout(func, 500);  // ##sivto##
    }
  });

  this.timeline = new TimeLine(this.layersData);
  this.cinema = new Cinema(this.timeline);
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
  this.linearizedQueryTree = this.queryTree.linear6n;

  this.isSearchAborted = ko.observable(false);
  this.canSearch = ko.computed(function () {
    let isQueryReady = self.isQueryReady(),
        isQueryNew = self.isQueryNew(),
        isSubcorpusNew = self.isSubcorpusNew(),
        isSearchAborted = self.isSearchAborted();
    if (isQueryReady && (isQueryNew || isSubcorpusNew || isSearchAborted)) {
      return true;
    } else {
      return false;
    }
  });

  this.lastQueryJSON = '';
  this.queryJSON = ko.computed(function () {
    if (self.canSearch()) {
      self.lastQueryJSON = getQueryJSON(self, self.linearizedQueryTree());
    }
    return self.lastQueryJSON;
  }).extend({ rateLimit: 500 });

  this.search = () => {
    if (self.canSearch()) {
      self.searchStatus('Формирование запроса');
      self.canSearchBeAborted(true);
      self.isSearchAborted(false);
      self.cinema.clearActiveState();
      let data = { type: 'results', query: self.queryJSON() };
      worker.postMessage(['query', data]);
    }
  };
  this.canSearchBeAborted = ko.observable(false);
  this.searchStatus = ko.observable('');
  this.abortLastRequest = () => {
    if (self.searchStatus()) {
      self.searchStatus('Отмена запроса');
    }
    worker.postMessage(['abort', null]);
  };
  this.loadLayers = (item, time=null, state=null) => {
    self.searchStatus('Формирование запроса');
    let query = 'stub',
        tiers = [],
        $ = self.resultsData();
    if (!window[';)'].stub
    || item.match.value !== $[0].match.value
    || item.record_id !== $[0].record_id) {
      ({ query, tiers, time } =
        getLayersQueryJSON(item, self.linearizedQueryTree(), time));
    }
    const data = { type: 'layers', query, tiers, time, state };
    worker.postMessage(['query', data]);
  };

  this.canViewResults = ko.observable(false);
  this.resultsError = ko.observable(null);
  this.resultsMessage = ko.observable(null);
  this.activeResult = ko.observable(null);
  this.showResults = () => {
    if (self.canViewResults()) {
      if (self.isResultsPaneOn()) {
        self.showResultsOnly(true);
      } else {
        self.switchOnResultsPane();
      }
    }
  };
  if (self.debug) {
    this.responseJSON = ko.computed(
      () => self.resultsData()
        ? JSON.stringify(self.resultsData().map(x => x.forJSON()), null, 4)
        : ''
    );
  }
  this.clearErrorOrMessage = () => {
    self.searchStatus(null);
    self.resultsError(null);
    self.resultsMessage(null);
  };

}
const vM = new viewModel();
initKnockout(ko, vM);

if (window[';)'].stub) worker.postMessage(['stub', true]);
worker.onmessage = message => {
  let [ messageType, data ] = message.data;
  // Получена начальная часть результатов
  if (messageType === 'results') {
    vM.cinema && vM.cinema.deactivateAll();
    vM.showResultsOnly(true);
    vM.isQueryNew(false);
    vM.isSubcorpusNew(false);
    vM.activeResult(null);
    vM.resultsNumber(data.total);
    let [resultsData, resultsSections] = getResults(data.results);
    vM.resultsSections(resultsSections);
    vM.resultsData(resultsData);
    if (data.total > 0) {
      vM.clearErrorOrMessage();
      vM.canViewResults(true);
      vM.switchOnResultsPane();
    } else {
      vM.resultsMessage('Не найдено ни одного совпадения');
    }

  } else if (messageType === 'layers') {
    const lS = new LayersStruct(
      vM.activeResult(),
      data.data, data.tiers,
      data.time, data.state
    );
    vM.layersData(lS);
    vM.clearErrorOrMessage();
    if (data.state === null) {
      const cinema = vM.cinema,
            aR = vM.activeResult();
      cinema.playType(cinema.playTypes.PLAY_SELECTION);
      cinema.showFilm(aR.record_id, aR.filmType, aR);
    }

  } else if (messageType === 'status') {
    vM.searchStatus(data);

  } else if (messageType === 'error') {
    vM.resultsError(data);

  } else if (messageType === 'noabort') {
    vM.canSearchBeAborted(false);

  } else if (messageType === 'aborted') {
    vM.isSearchAborted(true);
    vM.clearErrorOrMessage();

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
