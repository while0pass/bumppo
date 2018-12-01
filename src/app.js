import './styles/main.css';
import log from './scripts/log.js';

import jQuery from 'jquery';
import ko from 'knockout';
import page from 'page';
import videojs from 'video.js';

import initKnockout from './scripts/init.knockout.js';
import { TreeNode } from './scripts/queryTree.js';
import getQueryJSON from './scripts/queryJSON.js';

import { records, recordPhases, CheckboxForm } from './scripts/subcorpus.js';
import resultsData from './results_data.js';

var videoPlayer = videojs('bmpp-videoPlayer');
/* eslint-disable no-undef */
const searchEngineURL = (BUMPPO_ENV === 'production' ?
        'http://multidiscourse.ru:8080/search_annotations/SearchAnnotations' :
        (BUMPPO_LOCAL_SERVER ? BUMPPO_LOCAL_SERVER :
          'http://localhost:8080/search_annotations/SearchAnnotations')),
      baseURL = (BUMPPO_ENV === 'production' ?
        (BUMPPO_HOSTING ? '/bumppo-ghpages/BUMPPO_VERSION' : '/search/') : '');
/* eslint-enable no-undef */
log('Search Engine:', searchEngineURL);

function viewModel() {
  let self = this;

  this.queryPane = Symbol.for('query'),
  this.subcorpusPane = Symbol.for('subcorpus'),
  this.resultsPane = Symbol.for('results'),
  this.resultsOptionsPane = Symbol.for('resoptions');
  this.panes = [this.queryPane, this.subcorpusPane, this.resultsPane,
                this.resultsOptionsPane];

  this.activePane = ko.observable();
  this.switchOnQueryPane = () => { self.activePane(self.queryPane); };
  this.switchOnSubcorpusPane = () => { self.activePane(self.subcorpusPane); };
  this.switchOnResultsPane = () => { self.activePane(self.resultsPane); };
  this.switchOnResultsOptionsPane = () => {
    self.activePane(self.resultsOptionsPane); };

  this.isQueryPaneOn = ko.computed(
    () => this.activePane() === self.queryPane);
  this.isSubcorpusPaneOn = ko.computed(
    () => this.activePane() === self.subcorpusPane);
  this.isResultsPaneOn = ko.computed(
    () => this.activePane() === self.resultsPane);
  this.isResultsOptionsPaneOn = ko.computed(
    () => this.activePane() === self.resultsOptionsPane);

  ko.computed(() => {
    var activePane = self.activePane();
    if (activePane) {
      page(`/${Symbol.keyFor(activePane)}`);
      videoPlayer.pause();
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

  this.subcorpus = {
    records: new CheckboxForm(records, this.isSubcorpusNew),
    recordPhases: new CheckboxForm(recordPhases, this.isSubcorpusNew)
  };

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
      jQuery.ajax(searchEngineURL, {
        data: { data: self.queryJSON() }
      }).done(data => {
        self.isQueryNew(false);
        self.isSubcorpusNew(false);
        self.results(data);
        self.resultsError(null);
      }).fail((jqXHR, textStatus, errorThrown) => {
        self.results(resultsData);
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
  this.results = ko.observable(null);
  this.resultsError = ko.observable(null);
  this.responseJSON = ko.computed(
    () => self.results() ? JSON.stringify(self.results(), null, 4) : ''
  );
  this.playVideo = function (result) {
    let { begin, end } = result.time,
        pauseFunction = function () {
          if (videoPlayer.currentTime() >= end - 1e-2) {
            videoPlayer.off('timeupdate', self._pauseFunction);
            delete self._pauseFunction
            videoPlayer.pause();
          }
        };
    begin /= 1000;
    end /= 1000;
    videoPlayer.currentTime(begin);
    if (self._pauseFunction !== undefined) {
      videoPlayer.off('timeupdate', self._pauseFunction);
    }
    self._pauseFunction = pauseFunction;
    videoPlayer.on('timeupdate', self._pauseFunction);
    videoPlayer.play();
  };

}
const vM = new viewModel();
initKnockout(ko, vM);

// Настройка клиентской маршрутизации
const queryURL = Symbol.keyFor(vM.queryPane),
      subcorpusURL = Symbol.keyFor(vM.subcorpusPane),
      resultsURL = Symbol.keyFor(vM.resultsPane),
      resultsOptionsURL = Symbol.keyFor(vM.resultsOptionsPane);

page.base(baseURL);
page('/', () => { vM.activePane(vM.queryPane); });
page(`/${queryURL}`, () => { vM.activePane(vM.queryPane); });
page(`/${subcorpusURL}`, () => { vM.activePane(vM.subcorpusPane); });
page(`/${resultsURL}`, () => {
  if (vM.canViewResults()) {
    vM.activePane(vM.resultsPane);
  } else {
    vM.activePane(vM.queryPane);
  }
});
page(`/${resultsOptionsURL}`, () => { vM.activePane(vM.resultsOptionsPane); });
page({ hashbang: true });

jQuery('.bmpp-sidePane_menuItem').mouseover(function () {
  if (!jQuery(this).hasClass('disabled')) {
    jQuery(this).addClass('bmpp-sidePane_menuItem--hover');
  }
});
jQuery('.bmpp-sidePane_menuItem').mouseout(function () {
  jQuery(this).removeClass('bmpp-sidePane_menuItem--hover');
});

videoPlayer.ready(function () {
  var volume = videoPlayer.volume();
  videoPlayer.volume(0);
  videoPlayer.currentTime(0);
  videoPlayer.pause();
  videoPlayer.volume(volume);
});

jQuery('#safetyCurtain').fadeOut();
