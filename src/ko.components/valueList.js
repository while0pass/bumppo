import jQuery from 'jquery';

const template = `

  <ul data-bind="foreach: valueList.items" class="bmpp-valueList">
    <li>
      <bmpp-checkbox params="label: name,
        value: userChecked, disabled: disabled"></bmpp-checkbox>

      <!-- ko if: editable -->
        <div class="ui mini input bmpp-editableListItem">

          <input type="text"
            data-bind="value: value, valueUpdate: 'input',
              inlinePopup: $component.virtualKeyboardPopupOpts">

          <!-- ko if: $component.listProperty.virtualKeyboard -->
          <div class="ui basic popup hidden">
            <!-- ko foreach: $component.listProperty.validChars -->
              <button class="ui mini button" data-bind="text: $data,
                click: $component.listProperty.insertText($data, $element,
                  $parent.value)"></button>
            <!-- /ko -->
          </div>
          <!-- /ko -->

        </div>
      <!-- /ko -->

      <!-- ko if: $component.listProperty.displayValues &&
                  [true, false, null, undefined].indexOf(value) < 0 &&
                  !editable -->
        <!-- ko if: value instanceof Array -->
          (<!-- ko foreach: value --><span data-bind="if: $index() > 0">,
            </span><span data-bind="text: $data" class="bmpp-listItemValue">
            </span><!-- /ko -->)
        <!-- /ko -->
        <!-- ko ifnot: value instanceof Array -->
          (<span data-bind="text: value" class="bmpp-listItemValue"></span>)
        <!-- /ko -->
      <!-- /ko -->

      <!-- ko if: childList -->
        <bmpp-value-list params="valueList: childList"></bmpp-value-list>
      <!-- /ko -->

    </li>
  </ul>

`;

var viewModelFactory = (params, componentInfo) => {
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
  jQuery(componentInfo.element)
    .find('.bmpp-editableListItem input[type="text"]').popup(popupOpts);
  return {
    virtualKeyboardPopupOpts: popupOpts,
    listProperty: params.valueList.listProperty,
    valueList: params.valueList
  };
};

export default {
  viewModel: { createViewModel: viewModelFactory },
  template: template
};
