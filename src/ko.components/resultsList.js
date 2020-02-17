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
    <!-- ko foreach: resultsData -->

      <div class="bmpp-result" data-bind="
        event: { mouseover: $component.hoveredItem },
        css: { currentItem: $data === $component.cinema.activeDataItem() },
        style: { top: $component.resultHeight() *
          ($component.resultsShift() + $index()) }">

        <div class="bmpp-time"
          data-bind="text: match.beginTime + '–' + match.endTime"></div>
        <div class="bmpp-duration" data-bind="text: match.duration"></div>
        <div class="bmpp-unitValue" data-bind="text: match.value"></div>
        <div class="bmpp-transcription" data-bind="click: $component.showFilm">
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
      resultsShift = vM.resultsShift,
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
      ro = new ResizeObserver(onResizeReferenceResult);
  ro.observe(elem);

  function showFilm(data) {
    if (data !== cinema.activeDataItem()) {
      activeResult(data);
      vM.loadLayers(data);
    }
    vM.showResultsOnly(false);
    cinema.showFilm(data.record_id, data.filmType, data);
  }

  return {
    cinema, showFilm, hoveredItem,
    resultsData, resultsHeight, resultHeight, resultsShift, referenceResult,
    resultsSections,
  };
};

export default {
  viewModel: { createViewModel: viewModelFactory },
  template: template
};
