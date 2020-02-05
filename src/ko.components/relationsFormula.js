import ko from 'knockout';
import { RelationLine, ReferenceLine } from '../scripts/drawQueryTree.js';

const template = `

  <!-- ko if: node1 -->
  <div class="bmpp-relationsFormula1 bmpp-container"
    data-bind="css: { 'bmpp-relationsFormula2': $component.node2.level() > 0 }">

    <!-- ko if: isProxyBound -->
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
    <!-- /ko -->

  </div>
  <!-- /ko -->

`;

var viewModelFactory = (params, componentInfo) => {
  const nodeOrProxy = params.node,
        node1 = nodeOrProxy.parentNode,
        node2 = nodeOrProxy,
        isProxyBound = !nodeOrProxy.isProxy || nodeOrProxy.node,
        relationsFormula = node1 ? nodeOrProxy.relationsFormula : [],
        element = componentInfo.element;
  node1 && new RelationLine(params.draw, element, node2);
  if (!node2.isProxy) {
    new ReferenceLine(params.draw, element, node2);
    ko.computed(function () {
      node2.proxyChildNodes();
      node2.svgReferenceLine.redrawLine();
    }).extend({ rateLimit: { method: 'notifyWhenChangesStop', timeout: 400 } });
  }
  return { node1, node2, relationsFormula, isProxyBound };
};

export default {
  viewModel: { createViewModel: viewModelFactory },
  template: template
};
