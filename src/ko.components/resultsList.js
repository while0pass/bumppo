const resultsTemplate = `

  <div data-bind="foreach: results" class="bmpp-searchResults">

    <div class="divider" data-bind="visible: previousItem"></div>

    <div class="bmpp-time"
      data-bind="text: match.beginTime + '–' + match.endTime"></div>

    <div class="bmpp-duration" data-bind="text: match.duration"></div>

    <div class="bmpp-unitValue" data-bind="text: match.value"></div>

    <div class="bmpp-transcription"
      data-bind="html: match.transcription, click: $component.showFilm,
        css: { currentItem: $data === $component.cinema.activeDataItem() }">
    </div>

    <div class="ui label bmpp-recordLabel"
      data-bind="text: 'Запись ' + record_id,
        visible: !previousItem
              || previousItem && previousItem.record_id !== record_id">
    </div>

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
      cinema = vM.cinema,
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
    var area = document.getElementById('bmpp-results'),
        target = document.getElementById('bmpp-ResultsEndMarker'),
        options = {
          root: area,
          rootMargin: '0px',
          threshold: 0
        };
    observer = new IntersectionObserver(callback, options);
    observer.observe(target);
  }

  function showFilm(data) {
    vM.showResultsOnly(false);
    cinema.showFilm(data.record_id, data.filmType, data);
  }

  if (vM.resultsNumber() > resultsData.results().length) {
    setTimeout(bindLazyLoad, 5000);
  }

  return { cinema, resultsData, showFilm };
};
viewModelFactory.prototype.dispose = function () {
  this.observer.disconnect && this.observer.disconnect();
};

export default {
  viewModel: { createViewModel: viewModelFactory },
  template: template
};
