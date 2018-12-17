import ko from 'knockout';
import cinema from '../scripts/cinema.js';

const template = `

  <div class="bmpp-resultsPane_video">

    <div id="bmpp-videoPlayer">
      <div class="bmpp-videoCurtain">
        <div class="bmpp-videoLoader" style="display: none;"></div>
      </div>
    </div>

    <div class="bmpp-videoChoices" data-bind="foreach: cinema.filmTypes">
      <div data-bind="
        text: id,
        css: {
          disabled: disabled || !$component.cinema.activeDataItem(),
          current: $component.cinema.activeFilmType() === id
        },
        click: $component.cinema.showFilm.bind(
          $component.cinema, $component.cinema.activeRecordId(),
          id, $component.cinema.activeDataItem())
        "></div>
    </div>

    <div class="bmpp-resultsInfo">

      <!-- ko if: resultsData() && resultsData().version === 'test' -->
      <div style="margin-bottom: .33em; color: #a00;">
        NB: Сервер поиска недоступен. Отображаются результаты условной выдачи!
      </div>
      <!-- /ko -->

      <div style="margin-bottom: .33em;">
        <em>Область поиска:</em>&#x2002;<span
          data-bind="text: $root.subcorpusBanner"></span>
      </div>

      <!-- ko if: resultsData() && $root.queryTree.unitType() -->
      <div style="margin-bottom: .33em;" data-bind="with: $root.queryTree">
        <em>Условие поиска:</em>&#x2002;<span data-bind="text:
        unitType().hasAbbr ? unitType().abbr : unitType().name"></span
        ><!-- ko if: chosenUnitProperties().length > 0 -->, со следующими
        свойствами: <span data-bind="foreach: chosenUnitProperties"
        ><!-- ko if: $index() === 0 --><span
        data-bind="textLowercaseFirstChar: name"></span><span
        >:&#x2002;</span><!-- /ko --><!-- ko ifnot: $index() === 0 --><span
        data-bind="textLowercaseFirstChar: name"></span><span
        >:&#x2002;</span><!-- /ko --><span data-bind="text: banner"></span
        ><span data-bind="text:
        $index() &lt; $root.queryTree.chosenUnitProperties().length - 1 ?
        ';&#x2002;' : '.'"></span></span><!-- /ko --><!-- ko if:
        chosenUnitProperties().length === 0 -->.<!-- /ko -->
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

    <results-list params="resultsData: resultsData"></results-list>

    <div style="padding: 1em; background-color: #eee; font-size: x-small;">
      <header class="ui header">JSON ответа</header>
      <code style="white-space: pre-wrap"
        data-bind="text: $root.responseJSON"></code>
    </div>

    <div style="padding: 1em; font-size: x-small;">
      <header class="ui header">JSON запроса</header>
      <code style="white-space: pre-wrap"
        data-bind="text: $root.queryJSON"></pre></code>
    </div>

  </div>

`;

const R = /^[^\d]*(\d+).*$/g;

class ContextOrMatch {
  constructor(data) {
    this.time = data.time;
    this.value = data.value;
    this.additionalTiers = data.show_tiers;
  }
  get beginTime() {
    return (this.time.begin / 1000).toFixed(2);
  }
  get endTime() {
    return (this.time.end / 1000).toFixed(2);
  }
  get duration() {
    return ((this.time.end - this.time.begin) / 1000).toFixed(2);
  }
}

class Result {
  constructor(data) {
    [this.before, this.match, this.after] = this.getMatchAndContext(data);
    this.record_id = this.getRecordId(data[0] && data[0].record_id || '');
    this.participant = data[0] && data[0].participant || '';
    this.tier = data[0] && data[0].tier;

    this.setup();
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
  setPreviousItem(item) {
    this.previousItem = item;
  }
  getMatchAndContext(data) {
    let before = null, match = null, after = null;
    if (data instanceof Array) {
      if (data.length === 3) {
        if (data[1].is_main) {
          [before, match, after] = data;
        } else if (data[0].is_main) {
          [match, before, after] = data;
        } else if (data[2].is_main) {
          [before, after, match] = data;
        }
      } else if (data.length === 2) {
        if (data[1].is_main) {
          [before, match] = data;
        } else if (data[0].is_main) {
          [match, after] = data;
        }
      } else if (data.length === 1) {
        match = data[0];
      }
    }
    return [
      before && new ContextOrMatch(before),
      new ContextOrMatch(match),
      after && new ContextOrMatch(after)
    ];
  }
}

class Results {
  constructor(data) {
    this.version = data.version;
    this.results = this.getResults(data.results);
  }
  getResults(list) {
    let results = list.map(item => new Result(item));
    results.forEach((item, index, array) => {
      let previousItem = index > 0 ? array[index - 1] : null;
      item.setPreviousItem(previousItem);
    });
    return results;
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
  return {
    resultsData: resultsData,
    cinema: cinema
  };
}
viewModelFactory.prototype.dispose = function () {
  this.resultsData.dispose();
};

export default {
  viewModel: { createViewModel: viewModelFactory },
  template: template
};
