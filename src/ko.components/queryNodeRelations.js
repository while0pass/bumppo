import $ from 'jquery';

import { RelationLine } from '../scripts/drawQueryTree.js';

const template = `

  <!-- ko foreach: relations -->
    <div class="bmpp-queryDistance ui secondary segment"></div>
  <!-- /ko -->

`;

var viewModelFactory = (params, componentInfo) => {
  let node = params.node,
      element = $(componentInfo.element),
      relations = node.relationsToParentNode,
      relationLine = new RelationLine(params.draw, element, relations);
  node.svgRelationLine = relationLine;
  return { relations: relations };
};

export default {
  viewModel: { createViewModel: viewModelFactory },
  template: template
};
