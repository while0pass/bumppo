import jQuery from 'jquery';
import { RelationLine } from '../scripts/drawQueryTree.js';

const queryDistanceHelp = `

  <header class="ui header">Условие на расстояние</header>

  <p>В качестве условий можно по отдельности указывать интервалы расстояний
  между началами (левыми границами) и концами (правыми границами) единиц.
  Например, если задать условие «от&nbsp;50 до&nbsp;100&nbsp;мс между началом
  X и началом Y», будут найдены контексты, в которых левая граница
  X располагается от 50 до 100&nbsp;мс правее левой границы Y.</p>

  <p>Если для условия указано только одно значение, ограничения с другой
  стороны не накладывается. Если не указано ни одно значение, это
  интерпретируется как интервал «от&nbsp;0 до&nbsp;0». Значения задаются
  в миллисекундах. Если X и Y являются единицам одного типа, между началом
  X и концом Y можно задать расстояние в терминах единицы данного типа.</p>

`;

const template = `

  <div class="bmpp-queryDistances ui segments"
    data-bind="css: { 'bmpp-queryDistances--toOtherElement':
                      $component.node.level() > 0 }">

    <!-- ko foreach: relations -->
      <!-- ko component: { name: 'query-node-relation', params: {
      relation: $data, relations: $component.relations,
      isQueryNew: $root.isQueryNew }} --><!-- /ko -->
    <!-- /ko -->

    <i class="ui disabled grey question circle outline icon
              bmpp-queryDistanceHelp"></i>
  </div>

`;

var viewModelFactory = (params, componentInfo) => {
  let node = params.node,
      element = componentInfo.element,
      popupOpts = {
        html: queryDistanceHelp,
        variation: 'basic fluid',
        setFluidWidth: false,
        delay: { show: 400, hide: 0 },
        duration: 400,
        lastResort: true,
        onShow: function (targetElement) {
          let popup = jQuery(targetElement).popup('get popup');
          jQuery(popup).attr('style', 'width: 35em!important');
        }
      };
  new RelationLine(params.draw, element, node);
  jQuery(element).find('.bmpp-queryDistanceHelp').popup(popupOpts);
  return { relations: node.relationsToParentNode, node: node };
};

export default {
  viewModel: { createViewModel: viewModelFactory },
  template: template
};
