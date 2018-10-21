import $ from 'jquery';

const template = `

  <div class="ui checkbox">
    <input type="checkbox" class="hidden"
      data-bind="checked: value, attr: { tabindex: tabindex }">
    <label data-bind="text: label"></label>
  </div>

`;

var viewModelFactory = (params, componentInfo) => {
  let element = $(componentInfo.element);
  element.checkbox({
    onChecked: () => { params.value(true); },
    onUnchecked: () => { params.value(false); }
  });
  return {
    element: element,
    label: params.label,
    tabindex: params.tabindex,
    value: params.value
  };
};

export default {
  viewModel: { createViewModel: viewModelFactory },
  template: template
};
