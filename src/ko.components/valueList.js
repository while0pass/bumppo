const template = `

  <ul data-bind="foreach: items" class="bmpp-valueList">
    <li>
      <bmpp-checkbox params="label: name, value: checked"></bmpp-checkbox>
      <!-- ko if: $component.listProperty.displayValues &&
                  [true, false, null, undefined].indexOf(value) < 0 -->
        <!-- ko if: value instanceof Array -->
          (<!-- ko foreach: value --><span data-bind="if: $index() > 0">,
            </span><span data-bind="text: $data" class="bmpp-listItemValue">
            </span><!-- /ko -->)
        <!-- /ko -->
        <!-- ko ifnot: value instanceof Array -->
          (<span data-bind="text: value" class="bmpp-listItemValue"></span>)
        <!-- /ko -->
      <!-- /ko -->
      <!-- ko if: childValueList -->
        <bmpp-value-list params="valueList: childValueList"></bmpp-value-list>
      <!-- /ko -->
    </li>
  </ul>

`;

// eslint-disable-next-line no-unused-vars
var viewModelFactory = (params, componentInfo) => {
  return params.valueList;
};

export default {
  viewModel: { createViewModel: viewModelFactory },
  template: template
};
