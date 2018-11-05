import jQuery from 'jquery';

const template = `

  <div class="ui checkbox" data-bind="css: { disabled: disabled }">
    <input type="checkbox" class="hidden"
      data-bind="checked: value, attr: { tabindex: tabindex }">
    <label data-bind="text: label"></label>
  </div>

`;

var viewModelFactory = (params, componentInfo) => {
  let element = jQuery(componentInfo.element),
      value = params.value,
      disabled = params.disabled;
  if (!disabled) {
    element.checkbox({
      onChange: () => { value(!value()); }
    });
  }
  return {
    label: params.label,
    tabindex: params.tabindex,
    disabled: disabled,
    value: value
  };
};

export default {
  viewModel: { createViewModel: viewModelFactory },
  template: template
};
