const template = `

`;

// eslint-disable-next-line no-unused-vars
var viewModelFactory = (params, componentInfo) => {
  return params.property;
};

export default {
  viewModel: { createViewModel: viewModelFactory },
  template: template
};
