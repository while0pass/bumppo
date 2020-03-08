import ko from 'knockout';
import { referenceResult as REF_RES } from '../scripts/results.js';
import { ResizeObserver } from '@juggle/resize-observer';

const template = `

  <div class="ui basic segment">
  <div class="bmpp-searchResults" data-bind="style: { height: resultsHeight }">

    <div id="bmpp-referenceResult">
      <div class="bmpp-result">
        <div class="bmpp-transcription">
          <div data-bind="html: referenceResult().match.transcription"></div>
        </div>
      </div>
    </div>

    <!-- ko foreach: resultsSections -->

      <div class="bmpp-recordLabelBumper" data-bind="style: {
        height: sectionLength * $component.resultHeight() }">

        <div class="ui label bmpp-recordLabel"
          data-bind="text: 'Запись ' + firstItem.record_id,
            css: { hoveredItem: firstItem === $component.hoveredItem(),
              currentItem: firstItem === $component.cinema.activeDataItem() }">
        </div>

      </div>

    <!-- /ko -->
    <!-- ko foreach: resultsWindow -->

      <div class="bmpp-result" data-bind="
        event: { mouseover: $component.hoveredItem, click: $component.showFilm },
        css: { currentItem: $data === $component.cinema.activeDataItem() },
        style: { top: $component.resultHeight() * ix }">

        <div class="bmpp-time"
          data-bind="text: match.beginTime + '–' + match.endTime"></div>
        <div class="bmpp-duration" data-bind="text: match.duration"></div>
        <div class="bmpp-unitValue" data-bind="text: match.value"></div>
        <div class="bmpp-transcription">
          <div data-bind="html: match.transcription"></div>
        </div>

      </div>

    <!-- /ko -->

  </div>
  </div>

`;

var viewModelFactory = function (params) {
  var vM = params.viewModel,
      activeResult = params.activeResult,
      cinema = vM.cinema,
      hoveredItem = ko.observable(null),
      resultsSections = vM.resultsSections,
      resultsWindow = vM.resultsWindow,
      resultsData = params.resultsData,
      referenceResult = ko.computed(function () {
        let rD = resultsData();
        if (rD && rD.length > 0) return rD[0];
        return REF_RES;
      });

  const borderWidth = 1;
  let elem = document.querySelector('#bmpp-referenceResult div'),
      resultHeight = ko.observable(elem.clientHeight + borderWidth),
      resultsHeight = ko.computed(function () {
        let rD = resultsData();
        rD = rD && rD.length || 0;
        return resultHeight() * rD;
      }),
      onResizeReferenceResult = () => {
        resultHeight(elem.clientHeight + borderWidth);
      },
      ro1 = new ResizeObserver(onResizeReferenceResult);
  ro1.observe(elem);

  let resultsDiv = document.getElementById('bmpp-results'),
      rerenderId = null,
      rerenderItems = () => {

        if (vM._lock_ChangeLayout) {
          if (rerenderId !== null) clearTimeout(rerenderId);
          rerenderId = setTimeout(rerenderItems, 500);
          return;
        }

        const N = vM.resultsNumber(),
              arr = resultsWindow(),
              itemHeight = resultHeight(),
              windowHeight = resultsDiv.clientHeight,
              halfHeight = windowHeight / 2,
              scrollTop = resultsDiv.scrollTop,
              shiftA = scrollTop - halfHeight,
              shiftZ = scrollTop + windowHeight + halfHeight;

        let ixA = Math.floor(shiftA / itemHeight),
            ixZ = Math.floor(shiftZ / itemHeight);
        if (ixA < 0) ixA = 0;
        if (ixZ > N - 1) ixZ = N - 1;

        if (arr.length > 0) {
          let wA = arr.slice(0, 1)[0].ix,
              wZ = arr.slice(-1)[0].ix;
          if (ixA > wZ || ixZ < wA) {
            resultsWindow(resultsData().slice(ixA, ixZ + 1));
          } else {
            if (ixA < wA) {
              resultsWindow.splice(0, 0, ...resultsData().slice(ixA, wA));
            } else if (ixA > wA) {
              resultsWindow.splice(0, ixA - wA);
            }
            if (ixZ > wZ) {
              resultsWindow.splice(resultsWindow().length, 0,
                ...resultsData().slice(wZ + 1, ixZ + 1));
            } else if (ixZ < wZ) {
              let d = wZ - ixZ;
              resultsWindow.splice(-d, d);
            }
          }
        } else {
          resultsWindow(resultsData().slice(ixA, ixZ + 1));
        }
      },
      ro2 = new ResizeObserver(rerenderItems);
  ro2.observe(resultsDiv);
  resultHeight.subscribe(rerenderItems);

  resultsData.subscribe(results => {
    let size = Math.ceil(resultsDiv.clientHeight / resultHeight()) * 2;
    resultsDiv.scrollTop = 0;
    resultsWindow(results.slice(0, size));
  });

  resultsDiv.addEventListener('scroll', rerenderItems);

  function showFilm(data) {
    const timePoint = data.match.time.begin;
    vM.showResultsOnly(false);
    cinema.preloadFilm(data.record_id, data.filmType, timePoint);
    if (data !== cinema.activeDataItem()) {
      activeResult(data);
      vM.loadLayers(data);
      // Запуск видео произойдет автоматически после отрисовки слоев
    } else {
      cinema.playType(cinema.playTypes.PLAY_SELECTION);
      cinema.showFilm(data.record_id, data.filmType, data);
    }
  }

  return {
    cinema, showFilm, hoveredItem,
    resultsWindow, resultsHeight, resultHeight, referenceResult,
    resultsSections,
  };
};

export default {
  viewModel: { createViewModel: viewModelFactory },
  template: template
};
