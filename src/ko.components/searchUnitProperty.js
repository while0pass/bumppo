import log from '../scripts/log.js';

const template = `

  <div class="ui segment bmpp-propertyForm">
    <div class="ui top attached large label">
      <header data-bind="text: property.name"></header>
      <i class="disabled question circle outline icon bmpp-nearLabelIcon"></i>
    </div>
    <div class="ui hidden divider"></div>

    <!-- ko if: property.type === 'text' -->
    <text-property params="property: property"></text-property>
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
