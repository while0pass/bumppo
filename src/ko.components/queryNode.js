import jQuery from 'jquery';
import { Slug } from '../scripts/drawQueryTree.js';

const template = `

  <div class="bmpp-queryElement ui segment"
    data-bind="css: { 'bmpp-negativeNode': node.negative }">

    <div class="bmpp-queryTreeHandles">

      <i class="ui disabled green down arrow icon bmpp-addPositiveUnit"
        data-bind="click: node.addChild.bind(node, false),
          visible: !node.negative() && node.unitType() !== null"></i>

      <i class="ui disabled red down arrow icon bmpp-addNegativeUnit"
        data-bind="click: node.addChild.bind(node, true),
          visible: !node.negative() && node.unitType() !== null"></i>

      <i class="ui disabled grey close icon"
        title="Удалить единицу поиска со всеми зависимостями"
        data-bind="visible: node.depth() > 0,
          click: node.seppuku.bind(node)"></i>
    </div>

    <div class="ui top attached basic red label"
      data-bind="visible: node.negative">
      НЕТ
      <i class="disabled grey question circle outline icon
        bmpp-nearLabelIcon bmpp-negativeUnitHelp"></i>
      <div class="ui basic popup hidden">
        <header class="ui header">Отрицательное условие</header>

        <p>При отрицательном условии ищутся контексты, в которых
        <strong>нет</strong> единиц, обладающих указанными свойствами,
        и располагающихся на указанном расстоянии.</p>

        <p>Отрицательное условие всегда является терминальным: к ветке запроса,
        заканчивающейся этой единицей, нельзя добавить еще одну единицу.</p>
      </div>
    </div>

    <search-unit-choice params="node: node"></search-unit-choice>

  </div>

`;

var viewModelFactory = (params, componentInfo) => {
  let node = params.node,
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
    addUnitPopupOpts.content = 'Добавить единицу поиска';
    x.find('.bmpp-addPositiveUnit').popup(addUnitPopupOpts);
    addUnitPopupOpts.content = 'Добавить отрицательную единицу поиска';
    x.find('.bmpp-addNegativeUnit').popup(addUnitPopupOpts);
    x.find('.bmpp-negativeUnitHelp').popup({ inline: true });
  });
  return { node: node };
};

export default {
  viewModel: { createViewModel: viewModelFactory },
  template: template
};
