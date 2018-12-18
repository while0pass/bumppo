import ko from 'knockout';
import cinema from '../scripts/cinema.js';
import { Results } from '../scripts/results.js';

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

      <!-- ko if: $root.resultsError -->
      <div style="margin-bottom: .33em; color: #a00;">
        Во время выполнения запроса произошла ошибка.
      </div>
      <!-- /ko -->

      <div style="margin-bottom: .33em;">
        <em>Область поиска:</em>&#x2002;<span
          data-bind="text: $root.subcorpusBanner"></span>
      </div>

      <!-- ko if: $root.queryTree.unitType() -->
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
        <!-- ko if: childNodes().length > 0 -->
        <span style="color: grey; font-style: italic;">[…] Подробнее см.
        вкладку «Запрос».</span>
        <!-- /ko -->
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

    <!-- ko if: $root.debug -->
    <div style="padding: 1em; font-size: x-small; background-color: #eee;">
      <header class="ui header">JSON запроса</header>
      <code style="white-space: pre-wrap"
        data-bind="text: $root.queryJSON"></pre></code>
    </div>
    <!-- /ko -->

    <results-list params="resultsData: resultsData"></results-list>

    <!-- ko if: $root.debug -->
    <div style="padding: 1em; font-size: x-small; background-color: #eee;">
      <header class="ui header">JSON ответа</header>
      <code style="white-space: pre-wrap"
        data-bind="text: $root.responseJSON"></code>
    </div>
    <!-- /ko -->

  </div>

`;

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
