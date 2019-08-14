import ko from 'knockout';
import SVG from 'svg.js';
import linearizeTree from '../scripts/linearizeTree.js';

const svgDrawElementId = 'svgQueryTree',
      template = `

  <div class="bmpp-queryPane">
    <div class="bmpp-queryTree" id="${ svgDrawElementId }">
    </div>
    <div class="bmpp-query" data-bind="foreach: linearizedQueryTree">

      <relations-formula params="node: $data, draw: $component.svgDraw"
        data-bind="visible: $data.parentNode">
      </relations-formula>

      <query-node params="node: $data, draw: $component.svgDraw"></query-node>

    </div>
  </div>

`;

// eslint-disable-next-line no-unused-vars
var viewModelFactory = (params, componentInfo) => {

  var redrawTree = (linearizedTree) => {
    for (let treeNode of linearizedTree) {
      if (treeNode.svgSlug) {
        treeNode.svgSlug.position();
      }
    }
    for (let treeNode of linearizedTree.slice(1)) {
      if (treeNode.svgRelationLine) {
        treeNode.svgRelationLine.redrawLine();
      }
    }
  };

  var linearizedQueryTree = ko.computed(() => {
    let tree = linearizeTree(params.queryTree, []);
    for (let node of tree) {
      node.childNodes();
    }
    return tree;
  });
  linearizedQueryTree.subscribe(redrawTree);

  var domObserver = new MutationObserver(function() {
    if (redrawTree.timeoutID !== undefined) {
      clearTimeout(redrawTree.timeoutID);
    }
    redrawTree.timeoutID = setTimeout(() => {
      redrawTree(linearizedQueryTree());
    }, 30);
    return true;
  });
  domObserver.observe(componentInfo.element, { childList: true, subtree: true,
    attributes: false, characterData: false, attributeOldValue: false,
    characterDataOldValue: false });

  let viewModel = {
    linearizedQueryTree: linearizedQueryTree,
    svgDraw: SVG(svgDrawElementId).size('100%', '100%')
  };

  return viewModel;
};

// KnockoutJS component
export default {
  viewModel: { createViewModel: viewModelFactory },
  template: template
};
