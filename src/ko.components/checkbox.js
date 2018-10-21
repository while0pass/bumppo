import $ from 'jquery';

const template = `

  <div class="ui checkbox">
    <input type="checkbox" class="hidden"
      data-bind="checked: value, attr: { tabindex: tabindex }">
    <label data-bind="text: label"></label>
  </div>

`;

var viewModelFactory = (params, componentInfo) => {
  let element = $(componentInfo.element),
      value = params.value;
  element.checkbox({
    onChange: () => { value(!value()); },
  });
  return {
    element: element,
    label: params.label,
    tabindex: params.tabindex,
    value: value
  };
};

export default {
  viewModel: { createViewModel: viewModelFactory },
  template: template
};
