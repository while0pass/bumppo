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

  <div id="bmpp-ResultsList" class="bmpp-resultsPane_results"
    data-bind="if: resultsData.results">

    <!-- ko if: $root.debug -->
    <div style="padding: 1em; font-size: x-small; background-color: #eee;">
      <header class="ui header">JSON запроса</header>
      <code style="white-space: pre-wrap"
        data-bind="text: $root.queryJSON"></pre></code>
    </div>
    <!-- /ko -->

    <results-list params="resultsData: resultsData,
      viewModel: $root"></results-list>

    <!-- ko if: $root.debug -->
    <div style="padding: 1em; font-size: x-small; background-color: #eee;">
      <header class="ui header">JSON ответа</header>
      <code style="white-space: pre-wrap"
        data-bind="text: $root.responseJSON"></code>
    </div>
    <!-- /ko -->

    <div class="ui basic segment" style="position: absolute;
      bottom: 0; height: 3em; width: 5em">
      <div class="ui active inverted dimmer"
        data-bind="fadeVisible: $root.isLoadingNewDataPortion,
          fadeInDuration: 0, fadeOutDuration: 2000">
        <div class="ui small loader"></div>
      </div>
    </div>

  </div>

`;

function viewModelFactory(params) {
  return {
    resultsData: { results: params.resultsData },
    cinema: cinema
  };
}

export default {
  viewModel: { createViewModel: viewModelFactory },
  template: template
};
