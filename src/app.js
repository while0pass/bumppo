import './styles/main.css';
import './scripts/log.js';

import $ from 'jquery';
import ko from 'knockout';
import page from 'page';
import videojs from 'video.js';

import initKnockout from './scripts/init.knockout.js';
import { treeNode } from './scripts/queryTree.js';

import { records, recordPhases, CheckboxForm } from './scripts/subcorpus.js';
import resultsData from './results_data.js';

var videoPlayer = videojs('bmpp-videoPlayer');

function viewModel() {
  let self = this;

  this.queryPane = Symbol.for('query'),
  this.subcorpusPane = Symbol.for('subcorpus'),
  this.resultsPane = Symbol.for('results'),
  this.resultsOptionsPane = Symbol.for('resoptions');
  this.panes = [this.queryPane, this.subcorpusPane, this.resultsPane,
                this.resultsOptionsPane];

  this.activePane = ko.observable();
  this.queryTreeInited = false;

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

  this.results = resultsData;
  this.playVideo = function (result) {
    videoPlayer.currentTime(result.start);
    videoPlayer.play();
  };

  this.queryTree = new treeNode();

  this.subcorpus = {
    records: new CheckboxForm(records),
    recordPhases: new CheckboxForm(recordPhases)
  };
  this.subcorpusClearSelection = () => {
    self.subcorpus.records.clearSelection();
    self.subcorpus.recordPhases.clearSelection();
  };
}
const vM = new viewModel();
ko = initKnockout(ko, vM);

// Настройка клиентской маршрутизации
const queryURL = Symbol.keyFor(vM.queryPane),
      subcorpusURL = Symbol.keyFor(vM.subcorpusPane),
      resultsURL = Symbol.keyFor(vM.resultsPane),
      resultsOptionsURL = Symbol.keyFor(vM.resultsOptionsPane);

page.base('/bumppo-ghpages/BUMPPO_VERSION');
page('/', () => { vM.activePane(vM.queryPane); });
page(`/${queryURL}`, () => { vM.activePane(vM.queryPane); });
page(`/${subcorpusURL}`, () => { vM.activePane(vM.subcorpusPane); });
page(`/${resultsURL}`, () => { vM.activePane(vM.resultsPane); });
page(`/${resultsOptionsURL}`, () => { vM.activePane(vM.resultsOptionsPane); });
page({ hashbang: true });


$('.question.icon').popup({ inline: true });

videoPlayer.ready(function () {
  var volume = videoPlayer.volume();
  videoPlayer.volume(0);
  videoPlayer.currentTime(0);
  videoPlayer.pause();
  videoPlayer.volume(volume);
});
