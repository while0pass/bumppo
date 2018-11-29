const template = `

  <div class="ui top attached segment">
    <div class="ui top attached large label">
      <header class="bmpp-propertyHeader" data-bind="text: property.name,
        click: property.onHeaderClick.bind(property),
        css: { clickable: property.isHeaderClickable }">
      </header>
      <!-- ko if: property.help -->
        <i class="disabled question circle outline icon bmpp-nearLabelIcon"
          data-bind="popup: property.help"></i>
      <!-- /ko -->
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
    <!-- ko if: property.jsonProperties().length === 0 -->
      Свойство не будет включено в запрос
    <!-- /ko -->
    <code>
    <!-- ko foreach: property.jsonProperties -->
      <span data-bind="text: JSON.stringify(prop, null, 1)"></span>:
      <span data-bind="text: JSON.stringify(value, null, 1)"></span><!--
        ko if: $index() !== $component.property.jsonProperties().length - 1 -->,
        <!-- /ko -->
    <!-- /ko -->
    </code>
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
