import cinema from '../scripts/cinema.js';

const resultsTemplate = `

  <div data-bind="foreach: results" class="bmpp-searchResult">

    <div class="ui label bmpp-recordLabel bmpp-initialRecordLabel"
      data-bind="text: 'Запись ' + record_id,
        visible: $index() === 0"></div>

    <div class="divider" data-bind="visible: $index() > 0">
      <div class="ui label bmpp-recordLabel"
        data-bind="text: 'Запись ' + record_id, css: { transparent:
          previousItem && previousItem.record_id === record_id }"></div>
    </div>

    <!-- ko if: before -->
    <div class="bmpp-time"
      data-bind="text: before.beginTime + '–' + before.endTime"></div>
    <div class="bmpp-duration" data-bind="text: before.duration"></div>
    <div class="bmpp-unitValue bmpp-context"
      data-bind="text: before.value"></div>
    <div class="bmpp-transcription bmpp-context"
      data-bind="html: before.transcription"></div>
    <!-- /ko -->

    <div class="bmpp-time"
      data-bind="text: match.beginTime + '–' + match.endTime"></div>
    <div class="bmpp-duration" data-bind="text: match.duration"></div>
    <div class="bmpp-unitValue"
      data-bind="text: match.value, click: $component.cinema.showFilm
        .bind($component.cinema, record_id, filmType, $data)
        "></div>
    <div class="bmpp-transcription"
      data-bind="html: match.transcription,
        click: $component.cinema.showFilm.bind($component.cinema,
          record_id, filmType, $data)">
    </div>

    <!-- ko if: after -->
    <div class="bmpp-time"
      data-bind="text: after.beginTime + '–' + after.endTime"></div>
    <div class="bmpp-duration" data-bind="text: after.duration"></div>
    <div class="bmpp-unitValue bmpp-context"
      data-bind="text: after.value"></div>
    <div class="bmpp-transcription bmpp-context"
      data-bind="html: after.transcription"></div>
    <!-- /ko -->

  </div>

`;

const template = `

  <div class="ui basic segment" data-bind="with: resultsData">

    ${ resultsTemplate }

    <div id="bmpp-ResultsEndMarker" class="ui basic segment"
      style="height: 5em"></div>

  </div>

`;

var viewModelFactory = function (params) {
  var vM = params.viewModel,
      resultsData = params.resultsData,
      observer;

  function callback() {
    if (!vM.isLoadingNewDataPortion()) {
      vM.loadNewDataPortion();
      if (vM.resultsNumber() <= resultsData.results().length) {
        observer.disconnect();
        vM.isLoadingNewDataPortion(false);
      }
    }
  }

  function bindLazyLoad () {
    var area = document.getElementById('bmpp-ResultsList'),
        target = document.getElementById('bmpp-ResultsEndMarker'),
        options = {
          root: area,
          rootMargin: '0px',
          threshold: 0
        };
    observer = new IntersectionObserver(callback, options);
    observer.observe(target);
  }

  if (vM.resultsNumber() > resultsData.results().length) {
    setTimeout(bindLazyLoad, 5000);
  }

  return {
    cinema: cinema,
    resultsData: params.resultsData
  };
};
viewModelFactory.prototype.dispose = function () {
  this.observer.disconnect && this.observer.disconnect();
};

export default {
  viewModel: { createViewModel: viewModelFactory },
  template: template
};
