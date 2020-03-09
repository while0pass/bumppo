import jQuery from 'jquery';
import ko from 'knockout';

const template = `

  <div class="ui checkbox" data-bind="css: { disabled: disabled }">
    <input type="checkbox" class="hidden"
      data-bind="checked: ko.unwrap(disabled) ? false : value,
        attr: { tabindex: tabindex }">
    <label data-bind="html: label"></label>
  </div>

`;

var viewModelFactory = (params, componentInfo) => {
  let element = componentInfo.element,
      value = params.value,
      disabled = params.disabled,
      disabledTooltip = params.disabledTooltip,
      checkboxOpts = {
        onChange: () => { value(!value()); }
      },
      popupOpts = {
        content: disabledTooltip,
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
          setTimeout(hide.bind(this, popupTarget), 1700);
        }
      };

  value.checkboxComponent = element;
  if (ko.unwrap(disabled)) {
    if (disabledTooltip) jQuery(element).popup(popupOpts);
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
