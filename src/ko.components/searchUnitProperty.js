const template = `

  <div class="ui top attached segment">
    <div class="ui top attached large label">
      <header data-bind="text: property.name"></header>
      <i class="disabled question circle outline icon bmpp-nearLabelIcon"></i>
    </div>
    <div class="ui hidden divider"></div>

    <!-- ko if: property.type === 'text' -->
      <text-property params="property: property"></text-property>
    <!-- /ko -->

    <!-- ko if: property.type === 'interval' -->
      <interval-property params="property: property"></interval-property>
    <!-- /ko -->

    <!-- ko if: property.type === 'list' -->
      <list-property params="property: property"></list-property>
    <!-- /ko -->
  </div>

  <div class="ui bottom attached info mini message" style="margin-bottom: 1em;">
    <span data-bind="text: property.id"></span>:
    <span data-bind="text: JSON.stringify(property.value(), null, 1)"></span>

    <!-- ko if: property.type === 'list' -->
      <div data-bind="text: JSON.stringify(property._values(), null, 1)"></div>
    <!-- /ko -->

  </div>

`;

// eslint-disable-next-line no-unused-vars
var viewModelFactory = (params, componentInfo) => {
  return { property: params.property };
};

export default {
  viewModel: { createViewModel: viewModelFactory },
  template: template
};
