import log from '../scripts/log.js';
import ko from 'knockout';
import { layersElementIds } from '../scripts/layers.js';
import { timelineElementIds, getTimeTag } from '../scripts/timeline.js';
import { ResizeObserver } from '@juggle/resize-observer';

const videoTemplate = `

  <div id="bmpp-video">

    <div id="bmpp-videoPlayer">
      <div id="bmpp-videoLoader" style="display: none"></div>
      <div class="bmpp-videoCurtain"></div>
    </div>

    <div id="bmpp-videoChoices" data-bind="foreach: cinema.filmTypes">
      <div data-bind="
        text: id,
        attr: { title: title },
        click: $component.showAlternativeFilm,
        css: {
          disabled: disabled || !$component.cinema.activeDataItem(),
          current: $component.cinema.activeFilmType() === id
        }"></div>
    </div>

  </div>

`;

const queryInfoTemplate = `

  <div id="bmpp-resultsInfo"><div style="max-width: 40em">

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

  </div></div>

`;

const resultsTemplate = `

  <div id="bmpp-results">

    <!-- ko if: $root.debug -->
    <div style="padding: 1em; font-size: x-small; background-color: #eee;">
      <header class="ui header">JSON запроса</header>
      <code style="white-space: pre-wrap"
        data-bind="text: $root.queryJSON"></pre></code>
    </div>
    <!-- /ko -->

    <results-list params="resultsData: resultsData, activeResult: activeResult,
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

  <div id="bmpp-layers" data-bind="visible: activeResult">

    <div id="bmpp-layersNames">
      <div id="${ layersElementIds.names }"
          data-bind="foreach: layersStruct().layers">
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
          data-bind="foreach: layersStruct().layers">
        <div class="bmpp-layer" data-bind="foreach: segments,
          css: { highlighted: $component.highlighted() === type }">
          <div class="bmpp-segment" data-bind="html: value,
            attr: { title: $component.untag(value) },
            style: { width: width, left: x },
            event: { dblclick: $component.selectionFromSegment }"></div>
        </div>
      </div>
    </div>
    <div id="bmpp-layersButtons">
      <ul>
        <li data-bind="click: zoomAll"
          title="Привести масштаб в соответствие подгруженному фрагменту">
          <i class="ui expand icon"></i>
          all
        </li>
        <li data-bind="click: zoomIn"
          title="Увеличить масштаб">in</li>
        <li data-bind="click: zoomOut"
          title="Уменьшить масштаб в рамках подгруженного фрагмента">out</li>
        <li data-bind="click: zoomSel"
          title="Привести масштаб в соответствие выделенному фрагменту"
          >sel</li>
        <li data-bind="click: selectionBak"
          title="Вернуть прежнее выделение">bak</li>
      </ul>
      <ul>
        <li data-bind="click: cinema.playOrPause.bind(cinema)"
            style="border-right: none; padding-right: 0.05em">
          <i class="ui disabled play icon"
            data-bind="class: cinema.canPlayOrPause"></i>
        </li>
        <!-- ko foreach: playTypes -->
          <li data-bind="click: setPlayType, text: label,
            css: { active: $component.cinema.playType() === playType },
            attr: { title: title }"></li>
        <!-- /ko -->
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

const loaderTemplate = `

  <div class="bmpp-wait" data-bind="visible:
      (searchStatus() || resultsError()) && isResultsPaneOn()">

    <div class="ui active inverted dimmer">

      <div class="ui text loader" style="color: #767676; font-size: smaller"
        data-bind="text: searchStatus,
          visible: !resultsError()"></div>

      <button class="ui mini basic button bmpp-cancel"
        data-bind="click: abortLastRequest, fadeVisible: canSearchBeAborted,
          visible: !resultsError()"
        >Отмена</button>

      <div class="ui negative message" data-bind="visible: resultsError">
        <i class="close icon" data-bind="click: clearErrorOrMessage"></i>
        <div class="left header">Произошла ошибка</div>
        <p data-bind="html: resultsError"></p>
      </div>

    </div>
  </div>

`;

const template = videoTemplate + queryInfoTemplate +
  resultsTemplate + layersTemplate + loaderTemplate;

function viewModelFactory(params) {
  const rAF = window.requestAnimationFrame || window.setTimeout,
        cAF = window.cancelAnimationFrame || window.clearTimeout,
        msDelta = 200,
        pxNear = 10,
        pxDelta = 15,
        maxPxPerMs = 100;

  let cinema = params.cinema,
      timeline = params.timeline,
      layersStruct = params.layersData,
      elNC = document.getElementById(layersElementIds.names),
      elLL = document.getElementById(layersElementIds.layers),
      elLC = document.getElementById(layersElementIds.canvas),
      elTL = document.getElementById(timelineElementIds.timeline),
      elTC = document.getElementById(timelineElementIds.canvas),
      elCC = document.getElementById(timelineElementIds.cursor.canvas),
      highlighted = ko.observable(),
      previousSelection = [null, null],
      // Используем литерал, так как timeline.selectionEdges еще не определен

      syncWidth = (width) => {
        let widthString = String(width) + 'px';
        elLC.style.width = widthString;
        elTC.style.width = widthString;
        elCC.setAttribute('width', width);
      },
      syncScrollLeft = scrollLeft => {
        elLL.scrollLeft = scrollLeft;
        elTL.scrollLeft = scrollLeft;
        let shiftLeft =  scrollLeft > 0 ? -scrollLeft : 0;
        elCC.style.left = shiftLeft; // Chrome
        elCC.setAttribute('style', `left:${ shiftLeft }px;`); // Firefox
      },
      syncScrollTop = scrollTop => {
        elNC.scrollTop = scrollTop;
        elLL.scrollTop = scrollTop;
      };

  let isDblClickedSegment = false,
      selectionFromSegment = segment => {
        let time = segment.time;
        isDblClickedSegment = true;
        document.body.classList.remove('no-highlight');
        previousSelection = timeline.selectionEdges();
        timeline.selectionEdges([time.start, time.end]);
        cinema.seek(time.start);
      },

      propagateScroll = () => {
        syncScrollTop(elLL.scrollTop);
        syncScrollLeft(elLL.scrollLeft);
        timeline.commitPoints(performance.now());
      },
      propagateScrollReverseNC = event => {
        // Синхронизация прокрутки панели с названиями слоев с прокруткой
        // области, где отображются сами слои.
        syncScrollTop(elLL.scrollTop - event.deltaY);
      },

      scale = event => {
        if (!event.ctrlKey) return;
        event.preventDefault();
        let duration = layersStruct().duration,
            slidingWindowX = elTL.getBoundingClientRect().left,
            slidingWindowWidth = elTL.clientWidth, // NOTE: ##cWgBCR##
            { left: canvasX, width: canvasWidth } = elTC.getBoundingClientRect(),
            cursorCanvasX = event.clientX - canvasX,
            cursorSlidingWindowX = event.clientX - slidingWindowX,
            mul = 1,
            width;
        if (event.deltaY > 0) mul = 1.1;
        else if (event.deltaY < 0) mul = 10 / 11;
        width = canvasWidth * mul;
        if (width <= slidingWindowWidth) {
          width = slidingWindowWidth;
        } else {
          if (timeline.unit() === 1) {
            if (width / duration > maxPxPerMs) {
              width = Math.floor(maxPxPerMs * duration);
              mul = width / canvasWidth;
            }
          }
        }
        // Совместное масштабирование холста со слоями и холста временной шкалы
        syncWidth(width);
        // При масштабировании закреплять холст на той точке временной шкалы,
        // которая находится под курсором
        let scrollLeft = cursorCanvasX * mul - cursorSlidingWindowX;
        syncScrollLeft(scrollLeft);
      },

      smartScroll = event => {
        if (event.ctrlKey) return;
        event.preventDefault();
        if (event.shiftKey || elLL.offsetHeight === elLL.scrollHeight) {
          syncScrollLeft(elLL.scrollLeft - event.deltaY);
        } else {
          syncScrollTop(elLL.scrollTop - event.deltaY);
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
            { left: canvasX, width: canvasWidth } = elTC.getBoundingClientRect(),
            cursorCanvasX = cursorX - windowLeft <= 0
              ? windowLeft - canvasX
              : cursorX - canvasX,
            lS = layersStruct(),
            start = lS.time.start,
            duration = lS.duration,
            timePoint = start + duration * cursorCanvasX / canvasWidth;
        syncScrollLeft(elLL.scrollLeft - pxDelta);
        timeline.selectionEdges([timePoint, timeline.selectionEdges()[1]]);
        isExpandingLeft = rAF(selectionExpandLeft(cursorX), msDelta);
      },
      selectionExpandRight = cursorX => () => {
        let windowLeft = elTL.getBoundingClientRect().left,
            windowWidth = elTL.clientWidth,
            windowRight = windowLeft + windowWidth,
            { left: canvasX, width: canvasWidth } = elTC.getBoundingClientRect(),
            // NOTE: ##cWgBCR##
            // В данном случае нельзя использовать getBoundingClientRect
            // ни для windowWidth, ни для windowRight за счет того, что
            // elTL в отличие от elTC содержит полосу прокрутки (см. CSS
            // ``overflow-y: scroll``), которую мы не хотим учитывать
            // в ширине окна и его правой координате. Поскольку elTC
            // полосы прокрутки не содержит, то у него можно брать ширину
            // с помощью getBoundingClientRect, а не только левую координату.

            cursorCanvasX = cursorX - windowRight >= 0
              ? windowRight - canvasX
              : cursorX - canvasX,
            lS = layersStruct(),
            start = lS.time.start,
            duration = lS.duration,
            timePoint = start + duration * cursorCanvasX / canvasWidth;
        syncScrollLeft(elLL.scrollLeft + pxDelta);
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
        let windowLeft = elTL.getBoundingClientRect().left,
            windowWidth = elTL.clientWidth, // NOTE: ##cWgBCR##
            windowRight = windowLeft + windowWidth, // NOTE: ##cWgBCR##
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
            lS = layersStruct(),
            start = lS.time.start,
            duration = lS.duration,
            timePoint = start + duration * cursorCanvasX / canvasWidth,
            lastTimePoint = isDragging[0];
        if (lastTimePoint > timePoint) {
          [lastTimePoint, timePoint] = [timePoint, lastTimePoint];
        }
        timeline.selectionEdges([lastTimePoint, timePoint]);
      },

      mousedown = event => {
        let lS = layersStruct(),
            start = lS.time.start,
            duration = lS.duration,
            { left: canvasX, width: canvasWidth } = elTC.getBoundingClientRect(),
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
        let lS = layersStruct(),
            start = lS.time.start,
            duration = lS.duration,
            { left: canvasX, width: canvasWidth } = elTC.getBoundingClientRect(),
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
        let windowWidth = elTL.clientWidth, // NOTE: ##cWgBCR##
            lS = layersStruct(),
            start = lS.time.start,
            duration = lS.duration,
            xDuration = endPoint - startPoint,
            xCanvasWidth = windowWidth / xDuration * duration,
            xScroll = (startPoint - start) / duration * xCanvasWidth;
        syncWidth(xCanvasWidth);
        syncScrollLeft(xScroll);
      },
      zoomIn = () => {
        let windowLeft = elTL.getBoundingClientRect().left,
            windowWidth = elTL.clientWidth, // NOTE: ##cWgBCR##
            { left: canvasLeft, width: canvasWidth } =
              elTC.getBoundingClientRect(),
            duration = layersStruct().duration,
            windowDuration = windowWidth / canvasWidth * duration,
            xDuration = windowDuration / 2,
            xStartDuration = (windowLeft - canvasLeft) / canvasWidth
              * duration + windowDuration / 4,
            xCanvasWidth = windowWidth / xDuration * duration,
            xScroll = xStartDuration / duration * xCanvasWidth;
        if (timeline.unit() === 1 && xCanvasWidth / duration > maxPxPerMs) {
          return;
          //let oldXCanvasWidth = xCanvasWidth;
          //xCanvasWidth = Math.floor(maxPxPerMs * duration);
          //xScroll = xScroll * xCanvasWidth / oldXCanvasWidth;
        }
        syncWidth(xCanvasWidth);
        syncScrollLeft(xScroll);
      },
      zoomOut = () => {
        let windowLeft = elTL.getBoundingClientRect().left,
            windowWidth = elTL.clientWidth, // NOTE: ##cWgBCR##
            { left: canvasLeft, width: canvasWidth } =
              elTC.getBoundingClientRect();
        if (canvasWidth === windowWidth) return;
        let duration = layersStruct().duration,
            windowDuration = windowWidth / canvasWidth * duration,
            xDuration = windowDuration * 2,
            xStartDuration = (windowLeft - canvasLeft) / canvasWidth
              * duration - windowDuration / 2,
            xCanvasWidth = windowWidth / xDuration * duration,
            xScroll = xStartDuration / duration * xCanvasWidth;
        if (xCanvasWidth < windowWidth) {
          xCanvasWidth = windowWidth;
          xScroll = 0;
        }
        syncWidth(xCanvasWidth);
        syncScrollLeft(xScroll);
      },
      zoomAll = () => {
        let windowWidth = elTL.clientWidth; // NOTE: ##cWgBCR##
        syncWidth(windowWidth);
      },
      selectionBak = () => {
        let x = timeline.selectionEdges();
        timeline.selectionEdges(previousSelection);
        previousSelection = x;
      };

  let setPlayType = playTypeModel => {
        cinema.playType(playTypeModel.playType);
        cinema.play();
      },
      showAlternativeFilm = data => {
        let recordId = cinema.activeRecordId(),
            dataItem = cinema.activeDataItem();
        cinema.showAlternativeFilm(recordId, data.id, dataItem);
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

  // Наблюдаем за изменениями ширины полотна для слоев
  let onResizeTimelineCanvas = entries => {
        const canvas = entries[0],
              width = canvas.contentRect.width;
        timeline.canvasWidth(width);
        syncWidth(width);
        timeline.commitPoints(performance.now());
      },
      ro1 = new ResizeObserver(onResizeTimelineCanvas);
  ro1.observe(elTC);

  // Наблюдаем за изменением ширины окна видимости временной шкалы
  let onResizeTimelineWindow = entries => {
        const win = entries[0],
              width = win.contentRect.width;
        timeline.windowWidth(width);
        if (elTC.clientWidth < width) syncWidth(width);
        timeline.commitPoints(performance.now());
      },
      ro2 = new ResizeObserver(onResizeTimelineWindow);
  ro2.observe(elTL);

  // При смене слоев сбрасываем параметры
  layersStruct.subscribe(() => {
    let { begin: start, end } = params.viewModel.activeResult().match.time,
        segment = { time: { start, end }};
    timeline.selectionEdges([null, null]);
    selectionFromSegment(segment);
    zoomSel();
    zoomOut();
  });

  function untag(html) {
    return html.replace(/<[^>]+>/g, '')
      .replace('"', '&quot;')
      .replace("'", '&apos;'); // eslint-disable-line quotes
  }

  const playTypes = [
    { label: 'win', playType: cinema.playTypes.PLAY_VISIBLE, setPlayType,
      title: 'Проигрывать фрагмент видео, умещающийся в окне слоёв' },
    { label: 'pre', playType: cinema.playTypes.PLAY_PRE_SELECTION,
      setPlayType, title: 'Проигрывать фрагмент видео до выделения' },
    { label: 'sel', playType: cinema.playTypes.PLAY_SELECTION, setPlayType,
      title: 'Проигрывать фрагмент видео, соостветствующий выделению' },
    { label: 'post', playType: cinema.playTypes.PLAY_POST_SELECTION,
      setPlayType, title: 'Проигрывать фрагмент видео после выделения' },
  ];

  timeline.afterInitDom();

  return {
    resultsData: params.resultsData,
    activeResult: params.viewModel.activeResult,
    layersStruct, cinema, selectionFromSegment, highlighted, untag,
    highlight: layer => highlighted(layer.type),
    dehighlight: layer => highlighted() === layer.type && highlighted(null),
    zoomIn, zoomOut, zoomAll, zoomSel, selectionBak,
    showAlternativeFilm, playTypes,
    searchStatus: params.viewModel.searchStatus,
    resultsError: params.viewModel.resultsError,
    isResultsPaneOn: params.viewModel.isResultsPaneOn,
    canSearchBeAborted: params.viewModel.canSearchBeAborted,
    clearErrorOrMessage: params.viewModel.clearErrorOrMessage,
    abortLastRequest: params.viewModel.abortLastRequest,
  };
}

export default {
  viewModel: { createViewModel: viewModelFactory },
  template: template
};
