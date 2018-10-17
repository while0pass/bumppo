import { Slug } from '../scripts/drawQueryTree.js';

const template = `

  <div class="bmpp-queryElement ui segment">
    <div class="bmpp-queryTreeHandles">

      <i class="ui disabled green down arrow icon"
        data-bind="click: node.addChild.bind(node)"></i>

      <i class="ui disabled red down arrow icon"
        data-bind="click: node.addChild.bind(node)"></i>

      <i class="ui disabled grey close icon"
        data-bind="visible: node.depth() > 0,
          click: node.seppuku.bind(node)"></i>

    </div>
  </div>

`;

var viewModelFactory = (params, componentInfo) => {
  let node = params.node;
  new Slug(params.draw, componentInfo.element, node);
  return { node: node };
};

export default {
  viewModel: { createViewModel: viewModelFactory },
  template: template
};
