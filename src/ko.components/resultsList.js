import ko from 'knockout';

const template = `

  <div class="ui basic segment">
  <div class="bmpp-searchResults" data-bind="foreach: resultsData">

    <div class="ui label bmpp-recordLabel" data-bind="
      text: 'Запись ' + record_id,
      visible: !previousItem || previousItem
                             && previousItem.record_id !== record_id,
      css: { currentItem: $data === $component.cinema.activeDataItem(),
             hoveredItem: $data === $component.hoveredItem() }">
    </div>

    <div class="bmpp-result" data-bind="
      event: { mouseover: $component.hoveredItem },
      css: { currentItem: $data === $component.cinema.activeDataItem() }">

      <div class="bmpp-time" data-bind="text: match.beginTime + '–' +
                                              match.endTime"></div>
      <div class="bmpp-duration" data-bind="text: match.duration"></div>
      <div class="bmpp-unitValue" data-bind="text: match.value"></div>
      <div class="bmpp-transcription" data-bind="click: $component.showFilm">
        <div data-bind="html: match.transcription"></div>
      </div>

    </div>

  </div>
  </div>

`;

var viewModelFactory = function (params) {
  var vM = params.viewModel,
      activeResult = params.activeResult,
      cinema = vM.cinema,
      resultsData = params.resultsData,
      hoveredItem = ko.observable(null);

  function showFilm(data) {
    if (data !== cinema.activeDataItem()) {
      activeResult(data);
      vM.loadLayers(data);
    }
    vM.showResultsOnly(false);
    cinema.showFilm(data.record_id, data.filmType, data);
  }

  return { vM, cinema, resultsData, showFilm, hoveredItem };
};

export default {
  viewModel: { createViewModel: viewModelFactory },
  template: template
};
