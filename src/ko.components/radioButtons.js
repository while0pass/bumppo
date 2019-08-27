//import jQuery from 'jquery';

const template = `

  <div class="ui small basic buttons" data-bind="foreach: valueList.items">
    <button class="ui button"
      data-bind="css: { active: userChecked, icon: $data.icon },
                 event: { click: function () { userChecked(true); } }">

      <!-- ko ifnot: $data.icon -->
        <span data-bind="html: name"></span>
      <!-- /ko -->

      <!-- ko if: $data.icon -->
        <i class="ui icon" data-bind="class: icon"></i>
      <!-- /ko -->

    </button>
  </div>

`;

// eslint-disable-next-line no-unused-vars
var viewModelFactory = (params, componentInfo) => {
  /*
  let popupOpts = {
    on: 'focus',
    inline: true,
    position: 'bottom left',
    variation: 'basic fluid',
    preserve: true,
    closable: false,
    hideOnScroll: false,
    delay: { show: 50, hide: 300 },
    duration: 300,
    lastResort: true
  };
  jQuery(componentInfo.element);
    .find('.bmpp-editableListItem input[type="text"]').popup(popupOpts);
  */
  return params;
};

export default {
  viewModel: { createViewModel: viewModelFactory },
  template: template
};
