import { RelationLine } from '../scripts/drawQueryTree.js';

const template = `

  <div class="bmpp-queryDistances ui segments" data-bind="foreach: relations,
    css: { 'bmpp-queryDistances--toOtherElement': $component.node.level() > 0 }">

    <div class="bmpp-queryDistance ui secondary segment">
      <div class="bmpp-queryTreeHandles">

        <i class="ui small disabled grey plus icon"
          data-bind="visible: $index() === $component.relations().length - 1,
            click: $component.node.addRelation.bind($component.node)"></i>

        <i class="ui small icon"
          data-bind="visible: $index() !== $component.relations().length - 1">
        </i>

        <i class="ui small disabled grey close icon"
          data-bind="visible: $index() > 0,
          click: $component.node.removeRelation.bind($component.node, $data)">
        </i>

      </div>
    </div>

  </div>

`;

var viewModelFactory = (params, componentInfo) => {
  let node = params.node;
  new RelationLine(params.draw, componentInfo.element, node);
  return { relations: node.relationsToParentNode, node: node };
};

export default {
  viewModel: { createViewModel: viewModelFactory },
  template: template
};
