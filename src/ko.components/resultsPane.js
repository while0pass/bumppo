import log from '../scripts/log.js';
import ko from 'knockout';
import { LayersStruct, layersElementIds } from '../scripts/layers.js';
import { TimeLine, timelineElementIds, getTimeTag } from '../scripts/timeline.js';

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
          css: { sublayer: parent },
          event: { mouseover: $component.highlight,
                   mouseout: $component.dehighlight }"></div>
      </div>
    </div>

    <div id="${ timelineElementIds.timeline }">
      <div id="${ timelineElementIds.canvas }">
        <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
          <line id="${ timelineElementIds.ticks1 }" x1="0" x2="100%"
                                                    y1="0.2rem" y2="0.2rem"/>
          <line id="${ timelineElementIds.ticks2 }" x1="0" x2="100%"
                                                    y1="0.35rem" y2="0.35rem"/>
        </svg>
      </div>
    </div>

    <div id="${ layersElementIds.layers }">
      <div id="${ layersElementIds.canvas }"
          data-bind="foreach: layersStruct.layers">
        <div class="bmpp-layer" data-bind="foreach: segments,
          css: { highlighted: $component.highlighted() === type }">
          <div class="bmpp-segment" data-bind="html: value,
            style: { width: width, left: x },
            event: { dblclick: $component.selectionFromSegment }"></div>
        </div>
      </div>
    </div>
    <div id="bmpp-layersButtons">
      <ul>
        <li data-bind="click: zoomAll">all</li
        ><li data-bind="click: zoomIn">in</li
        ><li data-bind="click: zoomOut">out</li
        ><li data-bind="click: zoomSel">sel</li
        ><li data-bind="click: selectionBak">bak</li>
      </ul>
    </div>

    <div id="${ timelineElementIds.cursor.window }">
      <svg id="${ timelineElementIds.cursor.canvas }"
          width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <rect id="${ timelineElementIds.cursor.selection }"
          x="-100" y="-5%" width="0" height="105%" />
        <line id="${ timelineElementIds.cursor.cursor }"
          x1="-100" x2="-100" y1="0%" y2="100%" />
      </svg>
    </div>

  </div>

`;

const template = videoTemplate +
  queryInfoTemplate + resultsTemplate + layersTemplate;

function viewModelFactory(params) {
  const rAF = window.requestAnimationFrame || window.setTimeout,
        cAF = window.cancelAnimationFrame || window.clearTimeout,
        msDelta = 200,
        pxNear = 10,
        pxDelta = 15,
        maxPxPerMs = 100;

  let cinema = params.cinema,
      layersStruct = new LayersStruct(params.layersData()),
      elNC = document.getElementById(layersElementIds.names),
      elLL = document.getElementById(layersElementIds.layers),
      elLC = document.getElementById(layersElementIds.canvas),
      elTL = document.getElementById(timelineElementIds.timeline),
      elTC = document.getElementById(timelineElementIds.canvas),
      elCC = document.getElementById(timelineElementIds.cursor.canvas),
      timeline = new TimeLine(elLC, layersStruct),
      highlighted = ko.observable(),
      previousSelection = timeline.selectionEdges(),

      isDblClickedSegment = false,
      selectionFromSegment = segment => {
        let time = segment.time;
        isDblClickedSegment = true;
        document.body.classList.remove('no-highlight');
        previousSelection = timeline.selectionEdges();
        timeline.selectionEdges([time.start, time.end]);
        cinema.seek(time.start);
      },

      propagateScroll = () => {
        elNC.scrollTop = elLL.scrollTop;
        elTL.scrollLeft = elLL.scrollLeft;
        elCC.style.left = elLL.scrollLeft > 0 ? -elLL.scrollLeft : 0;
        timeline.commitPoints(performance.now());
      },
      propagateScrollReverseNC = event => {
        // Синхронизация прокрутки панели с названиями слоев с прокруткой
        // области, где отображются сами слои.
        elNC.scrollTop = elLL.scrollTop -= event.deltaY;
      },

      scale = event => {
        if (!event.ctrlKey) return;
        event.preventDefault();
        let canvasWidth = elTC.clientWidth,
            duration = layersStruct.duration,
            slidingWindowX = elTL.getBoundingClientRect().left,
            canvasX = elTC.getBoundingClientRect().left,
            cursorCanvasX = event.clientX - canvasX,
            cursorSlidingWindowX = event.clientX - slidingWindowX,
            mul = 1, width;
        if (event.deltaY > 0) mul = 1.1;
        else if (event.deltaY < 0) mul = 10 / 11;
        width = canvasWidth * mul;
        if (width <= elTL.clientWidth) {
          width = '100%';
        } else {
          if (timeline.unit() === 1) {
            if (width / duration > maxPxPerMs) {
              width = Math.floor(maxPxPerMs * duration);
              mul = width / canvasWidth;
            }
          }
          width = `${ width }px`;
        }
        // Совместное масштабирование холста со слоями и холста временной шкалы
        elLC.style.width = width;
        elTC.style.width = width;
        // При масштабировании закреплять холст на той точке временной шкалы,
        // которая находится под курсором
        let scrollLeft = cursorCanvasX * mul - cursorSlidingWindowX;
        elTL.scrollLeft = elLL.scrollLeft = scrollLeft;
        elCC.style.left = scrollLeft > 0 ? -scrollLeft : 0;
      },

      smartScroll = event => {
        if (event.ctrlKey) return;
        event.preventDefault();
        if (event.shiftKey || elLL.offsetHeight === elLL.scrollHeight) {
          elLL.scrollLeft -= event.deltaY;
          elCC.style.left = elLL.scrollLeft > 0 ? -elLL.scrollLeft : 0;
        } else {
          elLL.scrollTop -= event.deltaY;
        }
      },

      isDragging = null,
      isExpandingLeft = null,
      isExpandingRight = null,
      mouseUpWait = null,

      endExpandingLeft = () => {
        if (isExpandingLeft !== null) {
          cAF(isExpandingLeft);
          isExpandingLeft = null;
        }
      },
      endExpandingRight = () => {
        if (isExpandingRight !== null) {
          cAF(isExpandingRight);
          isExpandingRight = null;
        }
      },
      selectionExpandLeft = cursorX => () => {
        let windowLeft = elTL.getBoundingClientRect().left,
            canvasX = elTC.getBoundingClientRect().left,
            cursorCanvasX = cursorX - windowLeft <= 0
              ? windowLeft - canvasX
              : cursorX - canvasX,
            canvasWidth = elTC.clientWidth,
            start = layersStruct.time.start,
            duration = layersStruct.duration,
            timePoint;
        elLL.scrollLeft -= pxDelta;
        timePoint = start + duration * cursorCanvasX / canvasWidth,
        timeline.selectionEdges([timePoint, timeline.selectionEdges()[1]]);
        isExpandingLeft = rAF(selectionExpandLeft(cursorX), msDelta);
      },
      selectionExpandRight = cursorX => () => {
        let windowRight = elTL.getBoundingClientRect().right,
            canvasX = elTC.getBoundingClientRect().left,
            cursorCanvasX = cursorX - windowRight >= 0
              ? windowRight - canvasX
              : cursorX - canvasX,
            canvasWidth = elTC.clientWidth,
            start = layersStruct.time.start,
            duration = layersStruct.duration,
            timePoint;
        elLL.scrollLeft += pxDelta;
        timePoint = start + duration * cursorCanvasX / canvasWidth,
        timeline.selectionEdges([timeline.selectionEdges()[0], timePoint]);
        isExpandingRight = rAF(selectionExpandRight(cursorX), msDelta);
      },

      mouseup = event => {
        let canvasX = elTC.getBoundingClientRect().left,
            cursorCanvasX = event.clientX - canvasX,
            [lastTimePoint, lastCursorCanvasX, prevSelEdges] = isDragging;
        if (lastCursorCanvasX === cursorCanvasX) {
          if (event.target.classList.contains('bmpp-segment')) {
            clearTimeout(mouseUpWait);
            mouseUpWait = setTimeout(
              cinema.seek.bind(cinema, lastTimePoint), 250);
          } else {
            cinema.seek(lastTimePoint);
          }
        }
        document.body.removeEventListener('mousemove', mousemove);
        document.body.removeEventListener('mouseup', mouseup);
        previousSelection = prevSelEdges;
        isDragging = null;
        document.body.classList.remove('no-highlight');
        endExpandingLeft();
        endExpandingRight();
      },

      mousemove = event => {
        let { left: windowLeft, right: windowRight } =
              elTL.getBoundingClientRect(),
            cursorX = event.clientX,
            cursorWindowLeft = cursorX - windowLeft,
            cursorWindowRight = cursorX - windowRight,
            canvasX = elTC.getBoundingClientRect().left,
            cursorCanvasX;
        endExpandingLeft();
        endExpandingRight();
        if (cursorWindowLeft < pxNear) {
          cursorCanvasX = cursorWindowLeft <= 0
            ? windowLeft - canvasX
            : cursorX - canvasX;
          isExpandingLeft = rAF(selectionExpandLeft(cursorX), msDelta);
        } else if (cursorWindowRight > -pxNear) {
          cursorCanvasX = cursorWindowRight >= 0
            ? windowRight - canvasX
            : cursorX - canvasX;
          isExpandingRight = rAF(selectionExpandRight(cursorX), msDelta);
        } else {
          cursorCanvasX = cursorX - canvasX;
        }

        let canvasWidth = elTC.clientWidth,
            start = layersStruct.time.start,
            duration = layersStruct.duration,
            timePoint = start + duration * cursorCanvasX / canvasWidth,
            lastTimePoint = isDragging[0];
        if (lastTimePoint > timePoint) {
          [lastTimePoint, timePoint] = [timePoint, lastTimePoint];
        }
        timeline.selectionEdges([lastTimePoint, timePoint]);
      },

      mousedown = event => {
        let canvasWidth = elTC.clientWidth,
            start = layersStruct.time.start,
            duration = layersStruct.duration,
            canvasX = elTC.getBoundingClientRect().left,
            cursorCanvasX = event.clientX - canvasX,
            timePoint = start + duration * cursorCanvasX / canvasWidth;
        log('cursor under', getTimeTag(timePoint, 1));
        isDragging = [timePoint, cursorCanvasX, timeline.selectionEdges()];
        document.body.classList.add('no-highlight');
        document.body.addEventListener('mousemove', mousemove);
        document.body.addEventListener('mouseup', mouseup);
      },

      dblclick = event => {
        if (isDblClickedSegment
              && event.target.classList.contains('bmpp-segment')) {
          clearTimeout(mouseUpWait);
          isDblClickedSegment = false;
          return;
        }
        let canvasWidth = elTC.clientWidth,
            start = layersStruct.time.start,
            duration = layersStruct.duration,
            canvasX = elTC.getBoundingClientRect().left,
            cursorCanvasX = event.clientX - canvasX,
            timePoint = start + duration * cursorCanvasX / canvasWidth;
        log('cursor under', getTimeTag(timePoint, 1));
        previousSelection = timeline.selectionEdges();
        timeline.selectionEdges([null, null]);
        cinema.seek(timePoint);
      };

  let zoomSel = () => {
        let [startPoint, endPoint] = timeline.selectionEdges();
        if (startPoint === null || endPoint === null) return;
        let windowWidth = elTL.getBoundingClientRect().width,
            start = layersStruct.time.start,
            duration = layersStruct.duration,
            xDuration = endPoint - startPoint,
            xCanvasWidth = windowWidth / xDuration * duration,
            xScroll = (startPoint - start) / duration * xCanvasWidth,
            xCanvasWidthString = String(xCanvasWidth) + 'px';
        elLC.style.width = xCanvasWidthString;
        elTC.style.width = xCanvasWidthString;
        elTL.scrollLeft = elLL.scrollLeft = xScroll;
        elCC.style.left = xScroll > 0 ? -xScroll : 0;
      },
      zoomIn = () => {
        let { left: windowLeft, width: windowWidth } =
              elTL.getBoundingClientRect(),
            canvasWidth = elTC.clientWidth,
            duration = layersStruct.duration,
            canvasX = elTC.getBoundingClientRect().left,
            windowDuration = windowWidth / canvasWidth * duration,
            xDuration = windowDuration / 2,
            xStartDuration = (windowLeft - canvasX) / canvasWidth * duration
              + windowDuration / 4,
            xCanvasWidth = windowWidth / xDuration * duration,
            xScroll = xStartDuration / duration * xCanvasWidth,
            xCanvasWidthString;
        if (timeline.unit() === 1 && xCanvasWidth / duration > maxPxPerMs) {
          return;
          //let oldXCanvasWidth = xCanvasWidth;
          //xCanvasWidth = Math.floor(maxPxPerMs * duration);
          //xScroll = xScroll * xCanvasWidth / oldXCanvasWidth;
        }
        xCanvasWidthString = String(xCanvasWidth) + 'px';
        elLC.style.width = xCanvasWidthString;
        elTC.style.width = xCanvasWidthString;
        elTL.scrollLeft = elLL.scrollLeft = xScroll;
        elCC.style.left = xScroll > 0 ? -xScroll : 0;
      },
      zoomOut = () => {
        let { left: windowLeft, width: windowWidth } =
              elTL.getBoundingClientRect(),
            canvasWidth = elTC.clientWidth;
        if (canvasWidth === windowWidth) return;
        let canvasX = elTC.getBoundingClientRect().left,
            duration = layersStruct.duration,
            windowDuration = windowWidth / canvasWidth * duration,
            xDuration = windowDuration * 2,
            xStartDuration = (windowLeft - canvasX) / canvasWidth * duration
              - windowDuration / 2,
            xCanvasWidth = windowWidth / xDuration * duration,
            xScroll = xStartDuration / duration * xCanvasWidth,
            xCanvasWidthString = String(xCanvasWidth) + 'px';
        if (xCanvasWidth < windowWidth) {
          xCanvasWidthString = '100%';
          xScroll = 0;
        }
        elLC.style.width = xCanvasWidthString;
        elTC.style.width = xCanvasWidthString;
        elTL.scrollLeft = elLL.scrollLeft = xScroll;
        elCC.style.left = xScroll > 0 ? -xScroll : 0;
      },
      zoomAll = () => {
        elLC.style.width = '100%';
        elTC.style.width = '100%';
      },
      selectionBak = () => {
        let x = timeline.selectionEdges();
        timeline.selectionEdges(previousSelection);
        previousSelection = x;
      };

  elLL.addEventListener('scroll', propagateScroll);
  elLL.addEventListener('wheel', scale, true);
  elLL.addEventListener('wheel', smartScroll);
  elLL.addEventListener('mousedown', mousedown);
  elLL.addEventListener('dblclick', dblclick);

  elNC.addEventListener('wheel', propagateScrollReverseNC);

  elTL.addEventListener('wheel', scale, true);
  elTL.addEventListener('wheel', smartScroll);
  elTL.addEventListener('mousedown', mousedown);
  elTL.addEventListener('dblclick', dblclick);

  cinema.timeline(timeline);
  return {
    resultsData: { results: params.resultsData },
    layersStruct, cinema, selectionFromSegment, highlighted,
    highlight: layer => highlighted(layer.type),
    dehighlight: layer => highlighted() === layer.type && highlighted(null),
    zoomIn, zoomOut, zoomAll, zoomSel, selectionBak
  };
}

export default {
  viewModel: { createViewModel: viewModelFactory },
  template: template
};
