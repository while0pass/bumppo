import SVG from 'svg.js';

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

  let linearizedQueryTree = params.linearizedQueryTree,
      svgDraw = SVG(svgDrawElementId).size('100%', '100%');

  let redrawTree = (linearizedTree) => {
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

  linearizedQueryTree.subscribe(redrawTree);

  let domObserver = new MutationObserver(function() {
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

  return { linearizedQueryTree, svgDraw };
};

// KnockoutJS component
export default {
  viewModel: { createViewModel: viewModelFactory },
  template: template
};
