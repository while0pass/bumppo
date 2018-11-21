import log from '../scripts/log.js';

const template = `

  <div class="ui padded segment bmpp-propertyForm">
    <div class="ui top attached large label">
      <header data-bind="text: property.name"></header>
      <i class="disabled question circle outline icon bmpp-nearLabelIcon"></i>
    </div>

    <!--
    <div class="ui form" data-bind="foreach: fields">
      <div class="field">
        <bmpp-checkbox params="value: value, label: label,
          disabled: disabled, tabindex: $index,
          disabledTooltip: 'Запись пока не готова'"></bmpp-checkbox>
      </div>
    </div>
    -->

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
