import { unitTypeTemplate, unitPropsTemplate } from './searchUnitChoice.js';

const template = `

  <!-- ko if: node.unitType -->

    <button class="ui grey button bmpp-channelSlug"
      data-bind="text: node.unitType().channel.id"></button>

    ${ unitTypeTemplate }

    ${ unitPropsTemplate }

  <!-- /ko -->

`;

var viewModelFactory = params => {
  let node = params.node;
  return { node };
};

export default {
  viewModel: { createViewModel: viewModelFactory },
  template: template
};
