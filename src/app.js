import './styles/main.css';
import './scripts/log.js';

import $ from 'jquery';
import ko from 'knockout';
import page from 'page';
import videojs from 'video.js';

import initKnockout from './scripts/init.knockout.js';
import { treeNode } from './scripts/queryTree.js';

import resultsData from './results_data.js';

var videoPlayer = videojs('bmpp-videoPlayer');
var records = [
  { id: 'pears04',
    label: 'Pears 04' },
  { id: 'pears22',
    label: 'Pears 22' },
  { id: 'pears23',
    label: 'Pears 23' },
  { id: 'pears35',
    label: 'Pears 35' },
  { id: 'pears37',
    label: 'Pears 37',
    disabled: true },
  { id: 'pears39',
    label: 'Pears 39',
    disabled: true }];

var recordPhases = [
  { id: 'narration',
    label: 'Рассказ' },
  { id: 'dialogue',
    label: 'Разговор' },
  { id: 'retelling',
    label: 'Пересказ' }];

function CheckboxField(field) {
  this.value = ko.observable(false);
  this.id = field.id;
  this.label = field.label;
  this.disabled = field.disabled;
}

function CheckboxForm(fields) {
  let self = this;
  this.fields = [];

  for (let field of fields) {
    this.fields.push(new CheckboxField(field));
  }

  this.invertSelection = () => {
    for (let field of self.fields) {
      if (!field.disabled) field.value(!field.value());
    }
  };
  this.clearSelection = () => {
    for (let field of self.fields) {
      if (!field.disabled) field.value(false);
    }
  };
}

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
