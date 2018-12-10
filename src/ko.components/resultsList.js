import cinema from '../scripts/cinema.js';

const testResultsTemplate = `

  <div data-bind="foreach: results" class="bmpp-searchResult">

    <div class="ui label bmpp-recordLabel bmpp-initialRecordLabel"
      data-bind="text: 'Запись ' + record_id,
        visible: $index() === 0"></div>

    <div class="divider" data-bind="visible: $index() > 0">
      <div class="ui label bmpp-recordLabel"
        data-bind="text: 'Запись ' + record_id,
          visible: previousItem && previousItem.record_id !== record_id"></div>
    </div>

    <div class="bmpp-unitValue bmpp-context"
      data-bind="text: before_context"></div>
    <div class="bmpp-transcription bmpp-context"
      data-bind="html: before_context_transcription"></div>

    <div class="bmpp-unitValue"
      data-bind="text: value, click: $component.cinema.showFilm
        .bind($component.cinema, record_id, participant + '-vi', $data.time)
        "></div>
    <div class="bmpp-transcription"
      data-bind="html: value_transcription, click: $component.cinema.showFilm
        .bind($component.cinema, record_id, participant + '-vi', $data.time)
        "></div>

    <div class="bmpp-unitValue bmpp-context"
      data-bind="text: after_context"></div>
    <div class="bmpp-transcription bmpp-context"
      data-bind="html: after_context_transcription"></div>

  </div>

`;

const resultsTemplate = `

  <div data-bind="foreach: results" class="bmpp-searchResult">

    <div class="ui label bmpp-recordLabel bmpp-initialRecordLabel"
      data-bind="text: 'Запись ' + record_id,
        visible: $index() === 0"></div>

    <div class="divider" data-bind="visible: $index() > 0">
      <div class="ui label bmpp-recordLabel"
        data-bind="text: 'Запись ' + record_id,
          visible: previousItem && previousItem.record_id !== record_id"></div>
    </div>

    <div class="bmpp-unitValue bmpp-context"
      data-bind="text: left_context"></div>
    <div class="bmpp-transcription bmpp-context"
      data-bind="html: left_context"></div>

    <div class="bmpp-unitValue"
      data-bind="text: value, click: $root.playVideo.bind($data)"></div>
    <div class="bmpp-transcription"
      data-bind="html: value, click: $root.playVideo.bind($data)"></div>

    <div class="bmpp-unitValue bmpp-context"
      data-bind="text: right_context"></div>
    <div class="bmpp-transcription bmpp-context"
      data-bind="html: right_context"></div>

  </div>

`;

const template = `

  <div class="ui basic segment" data-bind="with: resultsData">

    <!-- ko ifnot: version === 'test' -->
      ${ resultsTemplate }
    <!-- /ko -->

    <!-- ko if: version === 'test' -->
      ${ testResultsTemplate }
    <!-- /ko -->

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
