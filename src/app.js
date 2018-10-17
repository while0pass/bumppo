import './styles/main.css';
import './scripts/log.js';

import $ from 'jquery';
import ko from 'knockout';
import page from 'page';
import videojs from 'video.js';

import { treeNode } from './scripts/queryTree.js';
import koQueryPaneComponent from './ko.components/queryPane.js';
import koQueryNodeComponent from './ko.components/queryNode.js';
import koQueryNodeRelationsComponent from './ko.components/queryNodeRelations.js';

import resultsData from './results_data.js';

var videoPlayer = videojs('bmpp-videoPlayer');

function viewModel() {
  this.queryPane = Symbol.for('query'),
  this.subcorpusPane = Symbol.for('subcorpus'),
  this.resultsPane = Symbol.for('results'),
  this.resultsOptionsPane = Symbol.for('resoptions');
  this.panes = [this.queryPane, this.subcorpusPane, this.resultsPane,
                this.resultsOptionsPane];

  this.activePane = ko.observable();
  this.queryTreeInited = false;

  this.switchOnQueryPane = () => { this.activePane(this.queryPane); };
  this.switchOnSubcorpusPane = () => { this.activePane(this.subcorpusPane); };
  this.switchOnResultsPane = () => { this.activePane(this.resultsPane); };
  this.switchOnResultsOptionsPane = () => {
    this.activePane(this.resultsOptionsPane); };

  this.isQueryPaneOn = ko.computed(
    () => this.activePane() === this.queryPane);
  this.isSubcorpusPaneOn = ko.computed(
    () => this.activePane() === this.subcorpusPane);
  this.isResultsPaneOn = ko.computed(
    () => this.activePane() === this.resultsPane);
  this.isResultsOptionsPaneOn = ko.computed(
    () => this.activePane() === this.resultsOptionsPane);

  ko.computed(() => {
    var activePane = this.activePane();
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

  let tree = new treeNode();
  tree.addChild();
  tree.addChild();
  tree.addChild();
  tree.addChild();
  tree.childNodes()[1].addChild();
  tree.childNodes()[1].addChild();
  tree.childNodes()[1].addChild();
  tree.childNodes()[1].addChild();
  tree.childNodes()[1].addRelation();
  tree.childNodes()[3].addRelation();
  tree.childNodes()[3].addRelation();

  this.queryTree = tree;
}
const vM = new viewModel();

ko.components.register('query-pane', koQueryPaneComponent);
ko.components.register('query-node', koQueryNodeComponent);
ko.components.register('query-node-relations', koQueryNodeRelationsComponent);
ko.options.deferUpdates = true;
ko.applyBindings(vM);

// Настройка клиентской маршрутизации
const queryURL = Symbol.keyFor(vM.queryPane),
      subcorpusURL = Symbol.keyFor(vM.subcorpusPane),
      resultsURL = Symbol.keyFor(vM.resultsPane),
      resultsOptionsURL = Symbol.keyFor(vM.resultsOptionsPane);

page.base('/bumppo-ghpages/2');
page('/', () => { vM.activePane(vM.queryPane); });
page(`/${queryURL}`, () => { vM.activePane(vM.queryPane); });
page(`/${subcorpusURL}`, () => { vM.activePane(vM.subcorpusPane); });
page(`/${resultsURL}`, () => { vM.activePane(vM.resultsPane); });
page(`/${resultsOptionsURL}`, () => { vM.activePane(vM.resultsOptionsPane); });
page({ hashbang: true });


$('.ui.checkbox').checkbox();
videoPlayer.ready(function () {
  var volume = videoPlayer.volume();
  videoPlayer.volume(0);
  videoPlayer.currentTime(0);
  videoPlayer.pause();
  videoPlayer.volume(volume);
});
