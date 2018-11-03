import $ from 'jquery';

const template = `

  <div class="ui checkbox" data-bind="css: { disabled: disabled }">
    <input type="checkbox" class="hidden"
      data-bind="checked: value, attr: { tabindex: tabindex },
        css: { disabled: disabled }">
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
    disabled: params.disabled,
    value: value
  };
};

export default {
  viewModel: { createViewModel: viewModelFactory },
  template: template
};
