import jQuery from 'jquery';
import { Slug } from '../scripts/drawQueryTree.js';

const template = `

  <div class="bmpp-queryElement ui segment">

    <div class="bmpp-queryTreeHandles">

      <i class="ui disabled green down arrow icon bmpp-addUnit"
        data-bind="click: node.addChild.bind(node, false),
          visible: node.unitType() !== null"></i>

      <i class="ui disabled grey close icon"
        title="Удалить единицу поиска со всеми зависимостями"
        data-bind="visible: node.depth() > 0,
          click: function () {
                   node.seppuku();
                   $root.isQueryNew(true);
                 }"></i>
    </div>

    <search-unit-choice params="node: node,
      queryPartsNonReadiness: $root.queryPartsNonReadiness,
      editNodeProperties: $root.queryPaneView.editNodeProperties,
      finishEditingNodeProperties: $root.queryPaneView.finishEditingNodeProperties,
      isQueryNew: $root.isQueryNew">
    </search-unit-choice>

  </div>

`;

var viewModelFactory = (params, componentInfo) => {
  let node = params.node,
      addUnitPopupOpts = {
        content: 'Добавить единицу поиска',
        variation: 'basic',
        position: 'bottom right',
        transition: 'fade',
        delay: {
          show: 1000,
          hide: 0
        },
        duration: 400,
        onVisible: function lazyHide(popupTarget) {
          let hide = function (popupTarget) {
            jQuery(popupTarget).popup('hide');
          };
          setTimeout(hide.bind(this, popupTarget), 1700);
        }
      };

  new Slug(params.draw, componentInfo.element, node);

  jQuery(document).ready(() => {
    let x = jQuery(componentInfo.element);
    x.find('.bmpp-addUnit').popup(addUnitPopupOpts);
  });
  return { node: node };
};

export default {
  viewModel: { createViewModel: viewModelFactory },
  template: template
};
