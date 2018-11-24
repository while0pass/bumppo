const template = `

  <ul data-bind="foreach: items" class="bmpp-valueList">
    <li>
      <bmpp-checkbox params="label: name, value: checked"></bmpp-checkbox>
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
