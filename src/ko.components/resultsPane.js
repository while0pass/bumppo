/* eslint-disable
 */

//import ko from 'knockout';
import log from '../scripts/log.js';
//import SVG from 'svg.js';
//import jQuery from 'jquery';
import cinema from '../scripts/cinema.js';
import { LayersStruct, layersElementIds } from '../scripts/layers.js';
import { TimeLine, timelineElementIds } from '../scripts/timeline.js';

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

const layersTemplate = `

  <div id="bmpp-layers">

    <div id="bmpp-layersNames">
      <div id="${ layersElementIds.names }" data-bind="foreach: layersStruct.layers">
        <div class="bmpp-layerName" data-bind="text: type,
          css: { sublayer: parent }"></div>
      </div>
    </div>

    <div id="${ timelineElementIds.timeline }">
      <div id="${ timelineElementIds.canvas }">
        <div id="${ timelineElementIds.ticks1 }"></div>
        <div id="${ timelineElementIds.ticks2 }"></div>
      </div>
    </div>

    <div id="${ layersElementIds.layers }">
      <div id="${ layersElementIds.canvas }" data-bind="foreach: layersStruct.layers">
        <div class="bmpp-layer" data-bind="foreach: segments">
          <div class="bmpp-segment" data-bind="html: value,
            style: { width: width, left: x }"></div>
        </div>
      </div>
    </div>

    <div id="bmpp-layersButtons"></div>

  </div>

`;

const template = videoTemplate +
  queryInfoTemplate + resultsTemplate + layersTemplate;

function viewModelFactory(params) {
  let layersStruct = new LayersStruct(params.layersData()),
      elNC = document.getElementById(layersElementIds.names),
      elLL = document.getElementById(layersElementIds.layers),
      elLC = document.getElementById(layersElementIds.canvas),
      elTL = document.getElementById(timelineElementIds.timeline),
      elTC = document.getElementById(timelineElementIds.canvas),
      timeline = new TimeLine(elLC, layersStruct),
      propagateScroll = () => {
        elNC.scrollTop = elLL.scrollTop;
        elTL.scrollLeft = elLL.scrollLeft;
        timeline.commitPoints(performance.now());
      },
      propagateScrollReverseNC = event => {
        // Синхронизация прокрутки панели с названиями слоев с прокруткой
        // области, где отображются сами слои.
        elNC.scrollTop = elLL.scrollTop -= event.wheelDelta;
      },
      propagateScrollReverseTL = event => {
        elTL.scrollLeft = elLL.scrollLeft -= event.wheelDelta;
      },
      scale = event => {
        if (!event.ctrlKey) return;
        event.preventDefault();
        let width = elLC.clientWidth;
        if (event.wheelDelta > 0) {
          width *= 1.1;
        } else if (event.wheelDelta < 0) {
          width *= 10 / 11;
        }
        if (width <= elTL.clientWidth) {
          width = '100%';
        } else {
          width = `${ width }px`;
        }
        // Совместное масштабирование ширины областей со слоями
        // и со временной шкалой.
        elLC.style.width = width;
        elTC.style.width = width;
      },
      smartScroll = event => {
        if (event.ctrlKey) return;
        if (event.shiftKey || elLC.clientHeight === elLL.clientHeight) {
          elLL.scrollLeft -= event.wheelDelta;
        } else {
          elLL.scrollTop -= event.wheelDelta;
        }
      };


  elLL.addEventListener('scroll', propagateScroll);
  elLL.addEventListener('wheel', scale, true);
  elLL.addEventListener('wheel', smartScroll);

  elNC.addEventListener('wheel', propagateScrollReverseNC);

  elTL.addEventListener('wheel', scale, true);
  elTL.addEventListener('wheel', propagateScrollReverseTL);

  return {
    resultsData: { results: params.resultsData },
    layersStruct, cinema
  };
}

export default {
  viewModel: { createViewModel: viewModelFactory },
  template: template
};
