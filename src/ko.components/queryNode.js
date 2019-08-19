import ko from 'knockout';
import jQuery from 'jquery';
import { Slug } from '../scripts/drawQueryTree.js';

const nodeTemplate = `

  <search-unit-choice params="node: node,
    queryPartsNonReadiness: $root.queryPartsNonReadiness,
    isQueryNew: $root.isQueryNew">
  </search-unit-choice>

  <button class="ui tiny basic icon button bmpp-removeButton"
    data-content="Удалить единицу поиска со всеми зависимостями"
    data-bind="visible: node.depth() > 0,
      click: function () { node.seppuku(); $root.isQueryNew(true); }">
    <i class="ui close icon"></i>
  </button>

  <button class="ui mini basic icon button bmpp-addButton bmpp-addUnit"
      data-content="Добавить единицу поиска"
      data-bind="click: node.addChild.bind(node, false),
                 visible: node.unitType() !== null">
    <i class="ui plus icon"></i>
  </button>

  <button class="ui mini basic icon button bmpp-addButton bmpp-addUnit"
      style="right: 4.5em"
      data-content="Добавить ссылку на другую единицу поиска"
      data-bind="click: node.addChildProxy.bind(node, false),
        visible: node.unitType() !== null && node.refOpts().length > 0">
    <i class="ui linkify icon"></i>
  </button>

`;

const nodeProxyTemplate = `

  <unit-proxy params="node: node"></unit-proxy>

  <button class="ui tiny basic icon button bmpp-removeButton"
    data-content="Удалить ссылку на единицу поиска"
    data-bind="visible: node.depth() > 0,
      click: function () { node.seppuku(); $root.isQueryNew(true); }">
    <i class="ui close icon"></i>
  </button>

`;

const template = `

  <!-- ko ifnot: node.isProxy -->
    <div class="bmpp-queryElement ui segment">
      ${ nodeTemplate }
    </div>
  <!-- /ko -->

  <!-- ko if: node.isProxy -->
    <div class="bmpp-queryElement bmpp-compact ui tertiary segment"
      data-bind="css: { 'bmpp-compact': noProxyOptions }">
      ${ nodeProxyTemplate }
    </div>
  <!-- /ko -->

`;

var viewModelFactory = (params, componentInfo) => {
  let node = params.node,
      noProxyOptions = ko.computed(() => node.isProxy &&
        node.parentNode.refOpts().length === 0),
      addUnitPopupOpts = {
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
  return { node, noProxyOptions };
};

export default {
  viewModel: { createViewModel: viewModelFactory },
  template: template
};
