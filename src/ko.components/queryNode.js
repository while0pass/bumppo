import $ from 'jquery';

import { Slug } from '../scripts/drawQueryTree.js';

const template = `

  <div class="bmpp-queryElement ui segment"></div>

`;

var viewModelFactory = (params, componentInfo) => {
  let node = params.node,
      element = $(componentInfo.element),
      slug = new Slug(params.draw, element, node.serialNumber());
  node.svgSlug = slug;
  if (node.svgRelationLine) {
    node.svgRelationLine.redrawLine();
  }
  return { node: node };
};

export default {
  viewModel: { createViewModel: viewModelFactory },
  template: template
};
