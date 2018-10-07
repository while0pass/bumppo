import './styles/main.css';

import $ from 'jquery';
import ko from 'knockout';
import page from 'page';
import videojs from 'video.js';
import SVG from 'svg.js';

import resultsData from './results_data.js';

var videoPlayer = videojs('bmpp-videoPlayer');

import debug from 'debug';
const log = debug('bumppo:log');

if (ENV !== 'production') {
  debug.enable('*');
  log('Logging is enabled!');
} else {
  debug.disable();
}

function viewModel() {
  this.queryPane = Symbol.for('query'),
  this.subcorpusPane = Symbol.for('subcorpus'),
  this.resultsPane = Symbol.for('results'),
  this.resultsOptionsPane = Symbol.for('resoptions');
  this.panes = [this.queryPane, this.subcorpusPane, this.resultsPane,
                this.resultsOptionsPane];

  this.activePane = ko.observable();

  this.switchOnQueryPane = () => { this.activePane(this.queryPane); };
  this.switchOnSubcorpusPane = () => { this.activePane(this.subcorpusPane); };
  this.switchOnResultsPane = () => { this.activePane(this.resultsPane); };
  this.switchOnResultsOptionsPane = () =>
    { this.activePane(this.resultsOptionsPane); };

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
}
const vM = new viewModel();

ko.applyBindings(vM);

// Настройка клиентской маршрутизации
const queryURL = Symbol.keyFor(vM.queryPane),
      subcorpusURL = Symbol.keyFor(vM.subcorpusPane),
      resultsURL = Symbol.keyFor(vM.resultsPane),
      resultsOptionsURL = Symbol.keyFor(vM.resultsOptionsPane);

page('/', () => { vM.activePane(vM.queryPane); });
page(`/${queryURL}`, () => { vM.activePane(vM.queryPane); });
page(`/${subcorpusURL}`, () => { vM.activePane(vM.subcorpusPane); });
page(`/${resultsURL}`, () => { vM.activePane(vM.resultsPane); });
page(`/${resultsOptionsURL}`, () => { vM.activePane(vM.resultsOptionsPane); });
page();


$('.ui.checkbox').checkbox();
videoPlayer.ready(function () {
    var volume = videoPlayer.volume();
    videoPlayer.volume(0);
    videoPlayer.currentTime(0);
    videoPlayer.pause();
    videoPlayer.volume(volume);
});

class cN {
  constructor(drawer, text, element) {
    var color = '#aaa',
      c = drawer.circle(30).attr({ fill: 'none', stroke: color,
                                   'stroke-width': 1 }).cx(15).cy(15),
      t = drawer.text(text).attr({ fill: color }).cx(15).cy(15),
      svg = drawer.group().add(c).add(t);
    this.svg = svg;
    this.element = element;
    if (element.length) {
      svg.cx(98).y(element.offset().top + 13);
    }
  }
}

function drawLine(drawer, n1, n2, level) {
  var r = 15,
      b1 = r * 0.5,
      b2 = r * 4,
      s = r * 1,
      l = r * 1.3,
      c = r * 3,
      d = r * 4.5;
  if (level === 0) {
    drawer
      .path(`M ${n1.svg.cx()} ${n1.svg.cy()+r}
             L ${n2.svg.cx()} ${n2.svg.cy()-r}`)
      .fill('none')
      .stroke({ color: '#aaa', width: 1 });
  } else {
    drawer
      .path(`

M ${n1.svg.cx()} ${n1.svg.cy()+r}
V ${n1.svg.cy()+r+b1}
C ${n1.svg.cx()} ${n1.svg.cy()+r+b1+c}
  ${n1.svg.cx()-s-l*level} ${n1.svg.cy()+r+b1+d-c}
  ${n1.svg.cx()-s-l*level} ${n1.svg.cy()+r+b1+d}
V ${n2.svg.cy()-r-b2-d}
C ${n2.svg.cx()-s-l*level} ${n2.svg.cy()-r-b2-d+c}
  ${n2.svg.cx()} ${n2.svg.cy()-r-b2-c}
  ${n2.svg.cx()} ${n2.svg.cy()-r-b2}
V ${n2.svg.cy()-r}

      `)
      .fill('none')
      .stroke({ color: '#aaa', width: 1 });
  }
}

var draw = SVG('bmpp-queryTree').size('100%', '100%'),
    n1 = new cN(draw, '1', $('.n1.bmpp-queryElement')),
    n2 = new cN(draw, '2', $('.n2.bmpp-queryElement')),
    n3 = new cN(draw, '3', $('.n3.bmpp-queryElement')),
    n4 = new cN(draw, '4', $('.n4.bmpp-queryElement')),
    n5 = new cN(draw, '5', $('.n5.bmpp-queryElement'));

drawLine(draw, n1, n2, 0);
drawLine(draw, n1, n3, 1);
drawLine(draw, n3, n4, 0);
drawLine(draw, n1, n5, 2);
