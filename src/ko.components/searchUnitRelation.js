const template = `

  <div class="ui top attached segment">
    <div class="ui top attached large label">
      <header class="bmpp-relationHeader" data-bind="text: name,
        click: onHeaderClick.bind($component),
        css: { clickable: $component.isHeaderClickable }">
      </header>
      <!-- ko if: help -->
        <i class="disabled question circle outline icon bmpp-nearLabelIcon"
          data-bind="popup: help"></i>
      <!-- /ko -->
    </div>
    <div class="ui hidden divider"></div>

    <!-- ko if: type === 'list' -->
      <list-relation params="relation: $component"></list-relation>
    <!-- /ko -->
  </div>

`;

// eslint-disable-next-line no-unused-vars
var viewModelFactory = (params, componentInfo) => {
  return params.relation;
};

export default {
  viewModel: { createViewModel: viewModelFactory },
  template: template
};
