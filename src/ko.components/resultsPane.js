/* eslint-disable
 */

//import ko from 'knockout';
import log from '../scripts/log.js';
//import SVG from 'svg.js';
//import jQuery from 'jquery';
import cinema from '../scripts/cinema.js';
import { LayersStruct } from '../scripts/layers.js';

const videoTemplate = `

  <div id="bmpp-video">

    <div id="bmpp-videoPlayer">
      <div id="bmpp-videoLoader" style="display: none"></div>
      <div class="bmpp-videoCurtain"></div>
    </div>

    <div id="bmpp-videoChoices" data-bind="foreach: cinema.filmTypes">
      <div data-bind="
        text: id,
        css: {
          disabled: disabled || !$component.cinema.activeDataItem(),
          current: $component.cinema.activeFilmType() === id
        },
        click: $component.cinema.showFilm.bind(
          $component.cinema, $component.cinema.activeRecordId(),
          id, $component.cinema.activeDataItem())
        "></div>
    </div>

  </div>

`;

const queryInfoTemplate = `

  <div id="bmpp-resultsInfo">

    <div style="margin-bottom: .33em;">
      <em>Область поиска:</em>&#x2002;<span
        data-bind="text: $root.subcorpusBanner"></span>
    </div>

    <!-- ko if: $root.queryTree.unitType() -->
    <div style="margin-bottom: .33em;" data-bind="with: $root.queryTree">
      <em>Условие поиска:</em>&#x2002;<span data-bind="text:
      unitType().hasAbbr ? unitType().abbr : unitType().name"></span
      ><!-- ko if: chosenUnitProperties().length > 0 -->, со следующими
      свойствами: <span data-bind="foreach: chosenUnitProperties"
      ><!-- ko if: $index() === 0 --><span
      data-bind="textLowercaseFirstChar: name"></span><span
      >:&#x2002;</span><!-- /ko --><!-- ko ifnot: $index() === 0 --><span
      data-bind="textLowercaseFirstChar: name"></span><span
      >:&#x2002;</span><!-- /ko --><span data-bind="html: banner"></span
      ><span data-bind="text:
      $index() &lt; $root.queryTree.chosenUnitProperties().length - 1 ?
      ';&#x2002;' : '.'"></span></span><!-- /ko --><!-- ko if:
      chosenUnitProperties().length === 0 -->.<!-- /ko -->
      <!-- ko if: childNodes().length > 0 -->
      <span style="color: grey; font-style: italic;">[…] Подробнее см.
      вкладку «Запрос».</span>
      <!-- /ko -->
    </div>
    <!-- /ko -->

    <div data-bind="if: $root.resultsNumber() !== null">
      <em>Всего найдено:</em>&#x2002;<span
        data-bind="text: $root.resultsNumber"></span>
      <!-- ko if: $root.resultsNumber() % 100 - $root.resultsNumber() % 10 === 10
        || [5, 6, 7, 8, 9, 0].indexOf($root.resultsNumber() % 10) > 0 -->
        совпадений.
      <!-- /ko -->
      <!-- ko if: $root.resultsNumber() % 100 - $root.resultsNumber() % 10 !== 10
        && $root.resultsNumber() % 10 === 1 -->
        совпадение.
      <!-- /ko -->
      <!-- ko if: $root.resultsNumber() % 100 - $root.resultsNumber() % 10 !== 10
        && [2, 3, 4].indexOf($root.resultsNumber() % 10) > 0 -->
        совпадения.
      <!-- /ko -->
    </div>

  </div>

`;

const resultsTemplate = `

  <div id="bmpp-results" data-bind="if: resultsData.results">

    <!-- ko if: $root.debug -->
    <div style="padding: 1em; font-size: x-small; background-color: #eee;">
      <header class="ui header">JSON запроса</header>
      <code style="white-space: pre-wrap"
        data-bind="text: $root.queryJSON"></pre></code>
    </div>
    <!-- /ko -->

    <results-list params="resultsData: resultsData,
      viewModel: $root"></results-list>

    <!-- ko if: $root.debug -->
    <div style="padding: 1em; font-size: x-small; background-color: #eee;">
      <header class="ui header">JSON ответа</header>
      <code style="white-space: pre-wrap"
        data-bind="text: $root.responseJSON"></code>
    </div>
    <!-- /ko -->

    <div class="ui basic segment" style="position: absolute;
      bottom: 0; height: 3em; width: 5em">
      <div class="ui active inverted dimmer"
        data-bind="fadeVisible: $root.isLoadingNewDataPortion,
          fadeInDuration: 0, fadeOutDuration: 2000">
        <div class="ui small loader"></div>
      </div>
    </div>

  </div>

`;

const svgDrawElementId = 'bmpp-timeline',
      layersTemplate = `

  <div id="bmpp-layers">

    <div id="bmpp-layersNames">
      <div id="bmpp-lNContainer" data-bind="foreach: layersStruct.layers">
        <div class="bmpp-layerName" data-bind="text: type,
          css: { sublayer: parent }"></div>
      </div>
    </div>

    <div id="${ svgDrawElementId }"></div>

    <div id="bmpp-layersLayers">
      <div id="bmpp-layersCanvas" data-bind="foreach: layersStruct.layers">
        <div class="bmpp-layer" data-bind="foreach: segments">
          <div class="bmpp-segment" data-bind="html: value,
            style: { width: width, left: x }"></div>
        </div>
      </div>
    </div>

    <div id="bmpp-layersButtons"></div>

  </div>

`;

const MS_IN_S = 1000,
      S_IN_MIN = 60,
      MIN_IN_H = 60,
      H_IN_D = 24;

const MS = 1,
      CS = 10 * MS,
      DS = 100 * MS,
      S = MS_IN_S * MS,
      DAS = 10 * S,
      MIN = S_IN_MIN * S,
      DAMIN = 10 * MIN,
      H = MIN_IN_H * MIN,
      DAH = 10 * H,
      D = H_IN_D * H;

if (!String.prototype.padStart) {
  String.prototype.padStart = function padStart(targetLength, padString) {
    if (this.length >= targetLength) {
      return String(this);
    } else {
      return padString.repeat(targetLength - padString.length) + String(this);
    }
  };
}

function getTimeTag(timePoint, unitScale) {
  let sign = timePoint >= 0 ? 1 : -1,
      time = timePoint >= 0 ? timePoint : -timePoint,
      ms = time % MS_IN_S,
      s = Math.floor(time / S % S_IN_MIN),
      min = Math.floor(time / MIN % MIN_IN_H),
      h = Math.floor(time / H % H_IN_D);

  h = h > 0 ? String(h).padStart(2, '0') : '';
  min = String(min).padStart(2, '0');
  s = String(s).padStart(2, '0');
  ms = String(ms).padStart(3, '0');

  let timeTag = sign < 0 ? '-' : '';
  if (h) timeTag += h + ':';
  timeTag += min + ':';
  timeTag += s;
  if (unitScale < S) timeTag += '.' + ms;
  return timeTag;
}

function makeTimeline(svgDraw, layersStruct) {
  const { start, end } = layersStruct.time,
        duration = end - start,
        width = document.getElementById('bmpp-layersCanvas').clientWidth,
        referenceWidth = 300,
        durationPerReferenceWidth = duration * referenceWidth / width;

  log('whole time:', start, end, duration);

  const units = [MS, CS, DS, S, DAS, MIN, DAMIN, H, DAH, D];

  const unitScale = (function () {
    for (let i = 0; i < units.length - 1; i++) {
      if (durationPerReferenceWidth < units[i + 1]) { return units[i]; }
    }
  })();

  const dUnitScale = unitScale / 10;

  log('scale:', unitScale, dUnitScale);

  const dUnitStartShift = -start % unitScale,
        ticksN = (Math.floor(duration / unitScale) + 2) * 10 + 1;

  log('shift in dUnits:', dUnitStartShift);
  log('N ticks:', ticksN);

  const tickStroke = { width: 1, color: '#aaa' },
        timePointOpts = {
          'fill': '#aaa',
          'font-family': 'PT Sans',
          'font-size': '0.7em',
          'text-anchor': 'middle',
        };

  for (let i = 0; i < ticksN; i++) {
    let isFullUnit = i % 10 === 0,
        isHalfUnit = i % 5 === 0 && !isFullUnit,
        tickHeight = isFullUnit ? 10 : isHalfUnit ? 15 : 7,
        timeShift = dUnitStartShift + i * dUnitScale,
        x = `${ timeShift / duration * 100 }%`;
    svgDraw.line(x, 0, x, tickHeight).stroke(tickStroke);
    if (isFullUnit) {
      let timePoint = start + timeShift,
          timeTag = getTimeTag(timePoint, unitScale);
      svgDraw.text(timeTag).attr(timePointOpts).attr({ x: x, y: 20 });
    }
  }
}

const template = videoTemplate +
  queryInfoTemplate + resultsTemplate + layersTemplate;

function viewModelFactory(params) {
  let svgDraw = SVG(svgDrawElementId).size('100%', '100%'),
      layersStruct = new LayersStruct(params.layersData()),
      elNC = document.getElementById('bmpp-lNContainer'),
      elLL = document.getElementById('bmpp-layersLayers'),
      propagateScroll = function () { elNC.scrollTop = elLL.scrollTop; },
      propagateScrollReverse = function (event) {
        event.preventDefault();
        elNC.scrollTop = elLL.scrollTop -= event.wheelDelta;
      };
  makeTimeline(svgDraw, layersStruct);
  elLL.addEventListener('scroll', propagateScroll);
  elNC.addEventListener('wheel', propagateScrollReverse);
  return {
    resultsData: { results: params.resultsData },
    layersStruct, cinema
  };
}

export default {
  viewModel: { createViewModel: viewModelFactory },
  template: template
};
