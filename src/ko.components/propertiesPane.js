const template = `

  <header class="ui header">Свойства поисковой единицы</header>
  <div data-bind="foreach: node() && node().unitProperties || []">
    <search-unit-property params="property: $data"></search-unit-property>
  </div>

`;

// eslint-disable-next-line no-unused-vars
var viewModelFactory = (params, componentInfo) => {
  return { node: params.node };
};

export default {
  viewModel: { createViewModel: viewModelFactory },
  template: template
};
