const template = `

  <header class="ui header" style="display: grid;
    grid-template: 't1 n1' 't2 n2' auto / auto 1fr">

    <span style="grid-area: t1">
      Отношения между
    </span>

    <span style="grid-area: n1; margin-bottom: 0.5em" data-bind="if: node1">

      <span class="ui circular label" style="margin-top: 0; margin-right: .7em;"
        data-bind="text: node1().serialNumber"></span>

      <!-- ko with: node1().unitType -->

        <button class="ui mini button bmpp-channelSlug"
          data-bind="css: channel.color, text: channel.id">
        </button>

        <span class="bmpp-unitTypeAndGroup">
          <!-- ko if: group -->
            <span data-bind="textLowercaseFirstChar: group.name"
              class="bmpp-unitTypeGroup"></span>
          <!-- /ko -->
          <span class="bmpp-unitType"
            data-bind="css: { 'bmpp-unitTypeWithGroup': group },
              text: hasAbbr ? abbr : name">
          </span>
        </span>

      <!-- /ko -->

    </span>

    <span style="grid-area: t2; text-align: right">
      и
    </span>

    <span style="grid-area: n2" data-bind="if: node2">

      <span class="ui circular label" style="margin-top: 0; margin-right: .7em;"
        data-bind="text: node2().serialNumber"></span>

      <span data-bind="ifnot: node2().unitType"
            style="font-weight: normal; font-size: smaller">
        Тип единицы ещё не выбран
      <span>

      <!-- ko with: node2().unitType -->

        <button class="ui mini button bmpp-channelSlug"
          data-bind="css: channel.color, text: channel.id">
        </button>

        <span class="bmpp-unitTypeAndGroup">
          <!-- ko if: group -->
            <span data-bind="textLowercaseFirstChar: group.name"
              class="bmpp-unitTypeGroup"></span>
          <!-- /ko -->
          <span class="bmpp-unitType"
          data-bind="css: { 'bmpp-unitTypeWithGroup': group },
            text: hasAbbr ? abbr : name">
          </span>
        </span>

      <!-- /ko -->

    </span>

  </header>

  <!-- ko if: node1() && node2() -->
  <div data-bind="foreach: node2().getRelationGroup(node1())">
    <search-unit-relation params="relation: $data"></search-unit-relation>
  </div>
  <!-- /ko -->

`;

// eslint-disable-next-line no-unused-vars
var viewModelFactory = (params, componentInfo) => {
  return { node1: params.node1, node2: params.node2 };
};

export default {
  viewModel: { createViewModel: viewModelFactory },
  template: template
};
