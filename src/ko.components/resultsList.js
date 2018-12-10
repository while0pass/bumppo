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
      data-bind="text: value, click: $root.playVideo.bind($data)"></div>
    <div class="bmpp-transcription"
      data-bind="html: value_transcription,
        click: $root.playVideo.bind($data)"></div>

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

  <div class="ui basic segment">

    <!-- ko ifnot: version === 'test' -->
      ${ resultsTemplate }
    <!-- /ko -->

    <!-- ko if: version === 'test' -->
      ${ testResultsTemplate }
    <!-- /ko -->

  </div>

`;

const R = /[A-Za-z]+(\d+).*/g;

class Result {
  constructor(data, isTestResult=false) {
    this.record_id = this.getRecordId(data.record_id);
    this.time = data.time;
    this.participant = data.participant;
    this.value = data.value;
    this.left_context = data.left_context;
    this.right_context = data.right_context;
    this.setupIfTest(data, isTestResult);
  }
  getRecordId(raw_record_id) {
    let splits = raw_record_id.split(R);
    if (splits.length === 3) {
      return splits[1];
    }
    return 'NoID';
  }
  setupIfTest(data, isTestResult) {
    if (!isTestResult) return;
    this.value_transcription = data.value_transcription;
    this.before_context = data.before_context;
    this.before_context_transcription = data.before_context_transcription;
    this.after_context = data.after_context;
    this.after_context_transcription = data.after_context_transcription;
  }
  setPreviousItem(item) {
    this.previousItem = item;
  }
}

class Results {
  constructor(data) {
    this.version = data.version;
    this.results = this.getResults(data.results);
    this.setupIfTest(data);
  }
  getResults(list) {
    let results = list.map(item => new Result(item, this.isTestResults));
    results.forEach((item, index, array) => {
      let previousItem = index > 0 ? array[index - 1] : null;
      item.setPreviousItem(previousItem);
    });
    return results;
  }
  setupIfTest(data) {
    if (!this.isTestResults) return;
    this.subcorpus = data.subcorpus;
    this.query = data.query;
  }
  get isTestResults() {
    return this.version === 'test';
  }
}

var viewModelFactory = params => new Results(params.results());

export default {
  viewModel: { createViewModel: viewModelFactory },
  template: template
};
