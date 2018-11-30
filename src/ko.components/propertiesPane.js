const template = `

  <!-- ko with: node -->

  <header class="ui header">Свойства поисковой единицы:
    <!-- ko with: unitType -->
      <!--
      <button class="ui button bmpp-channelSlug"
        data-bind="css: channel.color, text: channel.id">
      </button>
      -->
      <span data-bind="text: hasAbbr ? abbr : name"
        style="padding-left: .5em"></span>
    <!-- /ko -->
  </header>

  <div data-bind="foreach: unitProperties">
    <search-unit-property params="property: $data"></search-unit-property>
  </div>

  <!-- /ko -->

`;

// eslint-disable-next-line no-unused-vars
var viewModelFactory = (params, componentInfo) => {
  return { node: params.node };
};

export default {
  viewModel: { createViewModel: viewModelFactory },
  template: template
};
