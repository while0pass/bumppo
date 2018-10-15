import SVG from 'svg.js';
import linearizeTree from '../scripts/linearizeTree.js';

const svgDrawElementId = 'svgQueryTree',
      template = `

  <div class="bmpp-queryPane">
    <div class="bmpp-queryTree" id="${ svgDrawElementId }">
    </div>
    <div class="bmpp-query" data-bind="foreach: linearizedQueryTree">
      <query-node-relations params="node: $data, draw: $parent.svgDraw"
        data-bind="visible: $data.parentNode">
      </query-node-relations>
      <query-node params="node: $data, draw: $parent.svgDraw"></query-node>
    </div>
  </div>

`;

// eslint-disable-next-line no-unused-vars
var viewModelFactory = (params, componentInfo) => {
  var viewModel = {
    queryTree: params.queryTree,
    linearizedQueryTree: linearizeTree(params.queryTree, []),
    svgDraw: SVG(svgDrawElementId).size('100%', '100%')
  };
  return viewModel;
};

// KnockoutJS component
export default {
  viewModel: { createViewModel: viewModelFactory },
  template: template
};
