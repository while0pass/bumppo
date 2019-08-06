import log from '../scripts/log.js';
const template = `

  <header class="ui header">

    Отношения между

    <!-- ko with: node1.unitType -->

      <button class="ui button bmpp-channelSlug"
        data-bind="css: channel.color, text: channel.id">
      </button>

      <span class="bmpp-unitTypeAndGroup">
        <!-- ko if: group -->
          <span data-bind="textLowercaseFirstChar: group.name"
            class="bmpp-unitTypeGroup"></span>
        <!-- /ko -->
        <span class="bmpp-unitType"
        data-bind="css: { 'bmpp-unitTypeWithGroup': group }">
          Тип единицы:
          <strong data-bind="text: hasAbbr ? abbr : name"
            style="padding-left: .5em;"></strong>
        </span>
      </span>

    <!-- /ko -->

    и

    <!-- ko with: node2.unitType -->

      <button class="ui button bmpp-channelSlug"
        data-bind="css: channel.color, text: channel.id">
      </button>

      <span class="bmpp-unitTypeAndGroup">
        <!-- ko if: group -->
          <span data-bind="textLowercaseFirstChar: group.name"
            class="bmpp-unitTypeGroup"></span>
        <!-- /ko -->
        <span class="bmpp-unitType"
        data-bind="css: { 'bmpp-unitTypeWithGroup': group }">
          Тип единицы:
          <strong data-bind="text: hasAbbr ? abbr : name"
            style="padding-left: .5em;"></strong>
        </span>
      </span>

    <!-- /ko -->
  </header>

  <!-- ko if: node1() && node2() -->
  <div data-bind="foreach: node2().getRelationGroup(node1())">
    <search-unit-relation params="relation: $data"></search-unit-relation>
  </div>
  <!-- /ko -->

`;

// eslint-disable-next-line no-unused-vars
var viewModelFactory = (params, componentInfo) => {
  log(0, params);
  log(1, params.node1());
  log(2, params.node2());
  log(3, params.node2().getRelationGroup);
  return { node1: params.node1, node2: params.node2 };
};

export default {
  viewModel: { createViewModel: viewModelFactory },
  template: template
};
