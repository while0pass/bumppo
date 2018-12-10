import './styles/main.css';
import log from './scripts/log.js';

import jQuery from 'jquery';
import ko from 'knockout';
import page from 'page';

import initKnockout from './scripts/init.knockout.js';
import { TreeNode } from './scripts/queryTree.js';
import getQueryJSON from './scripts/queryJSON.js';
import videoPlayer from './scripts/init.plyr.js';

import { records, recordPhases, CheckboxForm } from './scripts/subcorpus.js';
import resultsData from './results_data.js';

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
  this.subcorpusBanner = ko.computed(function () {
    let records = self.subcorpus.records,
        recordPhases = self.subcorpus.recordPhases,
        banner;
    if (self.results && self.results() && self.results().version === 'test') {
      return self.results().subcorpus;
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
  this.resultsNumber = ko.computed(function () {
    let R = self.results();
    if (R && R.results instanceof Array) {
      return R.results.length;
    } else {
      return null;
    }
  });
  this.responseJSON = ko.computed(
    () => self.results() ? JSON.stringify(self.results(), null, 4) : ''
  );
  this.playVideo = function (result) {
    let { begin, end } = result.time;
    const logoHideTime = 0.8,
          logoFirstHideTime = 2,
          pauseFunction =
    event => {
      let p = event.detail.plyr;
      if (p.currentTime >= end - 1e-2) {
        p.muted = false;
        p.off('timeupdate', p._pauseFunction);
        delete p._pauseFunction;
        p.pause();
      } else if (p.currentTime >= begin - 1e-1) {
        delete p.$hidden;
        p.muted = false;
        jQuery(event.srcElement).find('.bmpp-videoLoader').hide();
        jQuery(event.srcElement).find('.bmpp-videoCurtain').hide();
      }
    };
    jQuery(videoPlayer.elements.container).find('.bmpp-seeking').show();
    begin /= 1000;
    end /= 1000;
    videoPlayer.$hidden = true;
    if (videoPlayer._nonFirstPlay) {
      videoPlayer.currentTime = begin - logoHideTime;
    } else {
      videoPlayer.currentTime = begin - logoFirstHideTime;
      videoPlayer._nonFirstPlay = true;
    }
    if (videoPlayer._pauseFunction !== undefined) {
      videoPlayer.off('timeupdate', videoPlayer._pauseFunction);
    }
    videoPlayer._pauseFunction = pauseFunction;
    videoPlayer.on('timeupdate', videoPlayer._pauseFunction);
    videoPlayer.muted = true;
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

videoPlayer.on('ready', event => {
  let p = event.detail.plyr;
  jQuery(event.srcElement).find('.bmpp-videoCurtain').show();
  jQuery(event.srcElement).find('.bmpp-videoLoader').hide();
  p.rewind(10);
  p.play();
});
videoPlayer.on('pause', event => {
  jQuery(event.srcElement).find('.bmpp-videoCurtain').show();
  jQuery(event.srcElement).find('.bmpp-videoLoader').hide();
});
videoPlayer.on('seeking', event => {
  jQuery(event.srcElement).find('.bmpp-videoCurtain').show();
  jQuery(event.srcElement).find('.bmpp-videoLoader').show();
});
videoPlayer.on('seeked', event => {
  let p = event.detail.plyr;
  if (!p.$hidden) {
    jQuery(event.srcElement).find('.bmpp-videoLoader').hide();
    jQuery(event.srcElement).find('.bmpp-videoCurtain').hide();
  }
});

jQuery('#safetyCurtain').fadeOut();
