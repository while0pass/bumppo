import jQuery from 'jquery';

const template = `

  <div class="ui checkbox" data-bind="css: { disabled: disabled }">
    <input type="checkbox" class="hidden"
      data-bind="checked: value, attr: { tabindex: tabindex }">
    <label data-bind="text: label"></label>
  </div>

`;

var viewModelFactory = (params, componentInfo) => {
  let element = componentInfo.element,
      value = params.value,
      disabled = params.disabled,
      checkboxOpts = {
        onChange: () => { value(!value()); }
      },
      popupOpts = {
        content: params.disabledTooltip,
        variation: 'basic',
        position: 'right center',
        transition: 'fade',
        delay: {
          show: 500,
          hide: 0
        },
        duration: 400,
        onVisible: function lazyHide(popupTarget) {
          let hide = function (popupTarget) {
            jQuery(popupTarget).popup('hide');
          };
          setTimeout(hide.bind(this, popupTarget), 2000);
        }
      };

  if (disabled) {
    jQuery(element).popup(popupOpts);
  } else {
    jQuery(element).checkbox(checkboxOpts);
  }

  return {
    disabled: disabled,
    label: params.label,
    tabindex: params.tabindex,
    value: value
  };
};

export default {
  viewModel: { createViewModel: viewModelFactory },
  template: template
};
