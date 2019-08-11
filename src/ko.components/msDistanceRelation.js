const template = `

  <list-property params="property: negative"></list-property>
  <list-property params="property: refPoints"></list-property>
  <interval-property params="property: interval"></interval-property>

`;

// eslint-disable-next-line no-unused-vars
var viewModelFactory = (params, componentInfo) => {
  return params.relation;
};

export default {
  viewModel: { createViewModel: viewModelFactory },
  template: template
};
