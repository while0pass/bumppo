import ko from 'knockout';

const template = `

  <div class="bmpp-resultsPane_video">

    <div id="bmpp-videoPlayer">
      <div class="bmpp-videoCurtain">
        <div class="bmpp-videoLoader" style="display: none;"></div>
      </div>
    </div>

    <div class="bmpp-videoChoices">
      <div class="disabled">N-eyf</div>
      <div class="current">N-vi</div>
      <div>N-ey</div>
      <div>C-vi</div>
      <div>R-vi</div>
      <div>R-ey</div>
      <div>W-vi</div>
    </div>

    <div class="bmpp-resultsInfo">

      <!-- ko if: resultsData() && resultsData().version === 'test' -->
      <div style="margin-bottom: .33em; color: #a00;">
        NB: Отображаются результаты условной выдачи!
      </div>
      <!-- /ko -->

      <div style="margin-bottom: .33em;">
        <em>Область поиска:</em>&#x2002;<span
          data-bind="text: $root.subcorpusBanner"></span>
      </div>

      <!-- ko if: resultsData() && resultsData().version === 'test' -->
      <div style="margin-bottom: .33em;">
        <em>Условие поиска:</em>&#x2002;<span
        data-bind="text: resultsData().query"></span>
      </div>
      <!-- /ko -->
      <!-- ko if: resultsData() && resultsData().version !== 'test'
        && $root.queryTree.unitType() -->
      <div style="margin-bottom: .33em;" data-bind="with: $root.queryTree">
        <em>Условие поиска:</em>&#x2002;<span data-bind="text:
        unitType().hasAbbr ? unitType().abbr : unitType().name"></span
        ><!-- ko if: $root.chosenUnitProperties().length > 0 -->, со следующими
        свойствами: <span data-bind="foreach: $root.chosenUnitProperties"
        ><!-- ko if: $index() === 0 --><span
        data-bind="textLowercaseFirstChar: name"></span><span
        >:&#x2002;</span><!-- /ko --><!-- ko ifnot: $index() === 0 --><span
        data-bind="textLowercaseFirstChar: name"></span><span
        >:&#x2002;</span><!-- /ko --><span data-bind="text: banner"></span
        ><span data-bind="text:
        $index() &lt; $root.chosenUnitProperties().length - 1 ?
        ';&#x2002;' : '.'"></span></span><!-- /ko --><!-- ko if:
        $root.chosenUnitProperties().length === 0 -->.<!-- /ko -->
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

    </div>

  </div>

  <div class="bmpp-resultsPane_results" data-bind="if: resultsData">
    <div data-bind="text: JSON.stringify(resultsData, null, 2)">
    </div>
    <results-list params="resultsData: resultsData"></results-list>

    <div style="padding: 1em; background-color: #eee">
      <header class="ui header">JSON ответа</header>
      <code style="white-space: pre-wrap"
        data-bind="text: $root.responseJSON"></code>
    </div>

    <div style="padding: 1em">
      <header class="ui header">JSON запроса</header>
      <code style="white-space: pre-wrap"
        data-bind="text: $root.queryJSON"></pre></code>
    </div>

    <div style="padding: 1em; color: white; background-color: #a00;"
         data-bind="visible: $root.resultsError">
      <code style="white-space: pre-wrap"
         data-bind="text: $root.resultsError"></code>
    </div>

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

    this.setup();
    this.setupIfTest(data, isTestResult);
  }
  getRecordId(raw_record_id) {
    let splits = raw_record_id.split(R);
    if (splits.length === 3) {
      return splits[1];
    }
    return 'NoID';
  }
  setup() {
    this.previousItem = null;
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

function viewModelFactory(params) {
  let oldData = null,
      oldResults = null,
      resultsData = ko.computed(function () {
        let newData = params.resultsRawData();
        if (newData !== null && newData !== oldData) {
          let newResults = new Results(newData);
          oldData = newData;
          oldResults = newResults;
        } else if (newData === null && newData !== oldData) {
          oldData = null;
          oldResults = null;
        }
        return oldResults;
      });
  return { resultsData: resultsData };
}
viewModelFactory.prototype.dispose = function () {
  this.resultsData.dispose();
};

export default {
  viewModel: { createViewModel: viewModelFactory },
  template: template
};
