const template = `

  <bmpp-value-list params="valueList: valueList"></bmpp-value-list>

`;

// eslint-disable-next-line no-unused-vars
var viewModelFactory = (params, componentInfo) => {
  return params.property;
};

export default {
  viewModel: { createViewModel: viewModelFactory },
  template: template
};
