const template = `

  <div class="ui small input">
    <input type="text" data-bind="value: value,
      attr: { placeholder: placeholder }">
  </div>

`;

// eslint-disable-next-line no-unused-vars
var viewModelFactory = (params, componentInfo) => {
  return params.property;
};

export default {
  viewModel: { createViewModel: viewModelFactory },
  template: template
};
