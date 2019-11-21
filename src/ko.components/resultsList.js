const template = `

  <div class="ui basic segment">

    <div class="bmpp-searchResults" data-bind="
        foreach: { data: resultsData, afterRender: checkYetOtherData }">

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

  </div>

`;

var viewModelFactory = function (params) {
  var vM = params.viewModel,
      activeResult = params.activeResult,
      cinema = vM.cinema,
      resultsData = params.resultsData,
      timeout = null;

  function showFilm(data) {
    if (data !== cinema.activeDataItem()) {
      activeResult(data);
      vM.loadLayers(data);
    }
    vM.showResultsOnly(false);
    cinema.showFilm(data.record_id, data.filmType, data);
  }

  function checkResults1() {
    vM.checkResults1();
  }

  function checkYetOtherData() {
    clearTimeout(timeout);
    timeout = setTimeout(checkResults1, 2000);
  }

  return { checkYetOtherData, cinema, resultsData, showFilm };
};

export default {
  viewModel: { createViewModel: viewModelFactory },
  template: template
};
