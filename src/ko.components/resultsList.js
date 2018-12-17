import cinema from '../scripts/cinema.js';

const tiersDataTemplate = `

  <!-- ko if: $index() > 0 -->;<!-- /ko -->
  <span data-bind="text: $data[0]">
  </span>=<span data-bind="text: $data[1]"></span>

`;

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
    <div class="bmpp-time bmpp-context"
      data-bind="text: before.beginTime + '–' + before.endTime"></div>
    <div class="bmpp-time bmpp-context" data-bind="text: before.duration"></div>
    <div class="bmpp-unitValue bmpp-context"
      data-bind="text: before.value"></div>
    <div class="bmpp-transcription bmpp-context"
      data-bind="foreach: Object.entries(before.additionalTiers)">
      ${ tiersDataTemplate }
    </div>
    <!-- /ko -->

    <div class="bmpp-time bmpp-context"
      data-bind="text: match.beginTime + '–' + match.endTime"></div>
    <div class="bmpp-time bmpp-context" data-bind="text: match.duration"></div>
    <div class="bmpp-unitValue"
      data-bind="text: match.value, click: $component.cinema.showFilm
        .bind($component.cinema, record_id, participant + '-vi', $data)
        "></div>
    <div class="bmpp-transcription"
      data-bind="foreach: Object.entries(match.additionalTiers),
        click: $component.cinema.showFilm.bind($component.cinema,
          record_id, participant + '-vi', $data)">
      ${ tiersDataTemplate }
    </div>

    <!-- ko if: after -->
    <div class="bmpp-time bmpp-context"
      data-bind="text: after.beginTime + '–' + after.endTime"></div>
    <div class="bmpp-time bmpp-context" data-bind="text: after.duration"></div>
    <div class="bmpp-unitValue bmpp-context"
      data-bind="text: after.value"></div>
    <div class="bmpp-transcription bmpp-context"
      data-bind="foreach: Object.entries(after.additionalTiers)">
      ${ tiersDataTemplate }
    </div>
    <!-- /ko -->

  </div>

`;

const template = `

  <div class="ui basic segment" data-bind="with: resultsData">
    ${ resultsTemplate }
  </div>

`;

var viewModelFactory = function (params) {
  return {
    resultsData: params.resultsData,
    cinema: cinema
  };
};

export default {
  viewModel: { createViewModel: viewModelFactory },
  template: template
};
