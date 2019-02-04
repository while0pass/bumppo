const template = `

  <div class="ui top attached segment">
    <div class="ui top attached large label">
      <header class="bmpp-propertyHeader" data-bind="text: name,
        click: onHeaderClick.bind($component),
        css: { clickable: $component.isHeaderClickable }">
      </header>
      <!-- ko if: help -->
        <i class="disabled question circle outline icon bmpp-nearLabelIcon"
          data-bind="popup: help"></i>
      <!-- /ko -->
    </div>
    <div class="ui hidden divider"></div>

    <!-- ko if: type === 'text' -->
      <text-property params="property: $component"></text-property>
    <!-- /ko -->

    <!-- ko if: type === 'interval' -->
      <interval-property params="property: $component"></interval-property>
    <!-- /ko -->

    <!-- ko if: type === 'list' -->
      <list-property params="property: $component"></list-property>
    <!-- /ko -->
  </div>

  <div class="ui bottom attached info mini message" style="margin-bottom: 1em;">
    <div class="ui grid" style="margin: 0!important; padding: 0 !important">
      <div class="ui eight wide column"
        style="margin: 0!important; padding: 0 !important">

        <!-- ko if: jsonProperties().length === 0 -->
          Свойство не будет включено в запрос
        <!-- /ko -->
        <!-- ko if: banner -->
          <em data-bind="text: name"></em>:
          <span data-bind="text: banner"></span>
        <!-- /ko -->
        <!-- ko if: !banner() && jsonProperties().length > 0 -->
          Свойству присвоено значение по умолчанию
        <!-- /ko -->

      </div>
      <div class="ui eight wide column"
        style="margin: 0!important; padding: 0 0 0 1em !important;">

        <code style="font-size: smaller;">
        <!-- ko foreach: jsonProperties -->
          <span data-bind="text: JSON.stringify(prop, null, 1)"></span>:
          <span data-bind="text: JSON.stringify(value, null, 1)"></span><!--
            ko if: $index() !== $component.jsonProperties().length - 1 -->,
            <!-- /ko -->
        <!-- /ko -->
        </code>

      </div>
    </div>
  </div>

`;

// eslint-disable-next-line no-unused-vars
var viewModelFactory = (params, componentInfo) => {
  return params.property;
};

export default {
  viewModel: { createViewModel: viewModelFactory },
  template: template
};
