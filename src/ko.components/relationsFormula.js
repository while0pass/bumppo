import { RelationLine } from '../scripts/drawQueryTree.js';

const template = `

  <!-- ko if: node1 -->
  <div class="bmpp-relationsFormula1"
    data-bind="css: { 'bmpp-relationsFormula2': $component.node.level() > 0 }">

    <!-- ko foreach: relationsFormula.chosenRelations -->
      <div>

        <!-- ko if: $index() === 0 --><span class="bmpp-bannerPropname"
        data-bind="html: name"></span><span class="bmpp-bannerText"
        >:&#x2002;</span><!-- /ko --><!-- ko ifnot: $index() === 0 --><span
        class="bmpp-bannerPropname" data-bind="html: name"
        ></span><span class="bmpp-bannerText">:&#x2002;</span><!-- /ko --><span
        data-bind="html: banner" class="bmpp-bannerPropvalue"></span><span
        class="bmpp-bannerText">.</span>

      </div>
    <!-- /ko -->

    <div class="bmpp-relationsEdit">
      <span data-bind="click: $root.queryPaneView.editNodeRelations"
        class="bmpp-editUrl">Изменить отношения между единицами</span>
    </div>

  </div>
  <!-- /ko -->

`;

var viewModelFactory = (params, componentInfo) => {
  let node = params.node,
      node1 = node.parentNode,
      node2 = node,
      relationsFormula = node1 ? node1.getRelationFormula(node2) : [],
      element = componentInfo.element;
  new RelationLine(params.draw, element, node);
  return { node, node1, node2, relationsFormula };
};

export default {
  viewModel: { createViewModel: viewModelFactory },
  template: template
};
