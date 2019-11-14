import SVG from 'svg.js';
import jQuery from 'jquery';

const svgDrawElementId = 'svgQueryTree',
      template = `

  <div class="bmpp-queryPane">
    <div class="bmpp-queryTree" id="${ svgDrawElementId }">
    </div>
    <div class="bmpp-query" data-bind="foreach: { data: linearizedQueryTree,
      afterAdd: scrollIntoView }">

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
      treeNode.svgSlug && treeNode.svgSlug.position();
    }
    for (let treeNode of linearizedTree) {
      treeNode.svgRelationLine && treeNode.svgRelationLine.redrawLine();
      treeNode.svgReferenceLine && treeNode.svgReferenceLine.redrawLine();
    }
  };

  linearizedQueryTree.subscribe(redrawTree);

  const scrollOpts = {
    behavior: 'smooth', // Сделать прокрутку, а не прыжок
    block: 'end', // Вертикально выровнять элемент по подвалу окна просмотра
  };
  let scrollIntoView = element => { // (element, index, data)
    let x = jQuery(element).nextAll('query-node');
    if (x.length > 0) {
      setTimeout(function () { x[0].scrollIntoView(scrollOpts); }, 500);
    }
  };

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

  return { linearizedQueryTree, svgDraw, scrollIntoView };
};

// KnockoutJS component
export default {
  viewModel: { createViewModel: viewModelFactory },
  template: template
};
