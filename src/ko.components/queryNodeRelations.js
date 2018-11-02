import jQuery from 'jquery';
import { RelationLine } from '../scripts/drawQueryTree.js';

const template = `

  <div class="bmpp-queryDistances ui segments"
    data-bind="css: { 'bmpp-queryDistances--toOtherElement':
                      $component.node.level() > 0 }">

    <!-- ko foreach: relations -->
    <query-node-relation params="relation: $data,
      isFirst: $index() === 0,
      isLast: $index() === $component.relations().length - 1">
    </query-node-relation>
    <!-- /ko -->

    <i class="ui disabled grey question circle outline icon
              bmpp-queryDistanceHelp"></i>

    <div class="ui basic popup hidden">
      <header class="ui header">Условие на расстояние</header>

      <p>В качестве условий можно по отдельности указывать интервалы
      расстояний между началами (левыми границами) и концами (правыми
      границами) единиц. Например, если задать условие «от&nbsp;−50
      до&nbsp;100&nbsp;мс между началом X и началом Y», будут найдены
      контексты, в которых левая граница X располагается не левее, чем
      в&nbsp;50&nbsp;мс, и не правее, чем в&nbsp;100&nbsp;мс, от левой
      границы Y.</p>

      <p>Если для условия указано только одно значение, ограничения
      с другой стороны не накладывается. Если не указано ни одно
      значение, это интерпретируется как интервал «от 0 до 0».
      Значения задаются в миллисекундах. Если X и Y являются единицам
      одного типа, между началом X и концом Y можно задать расстояние
      в терминах единицы данного типа.</p>
    </div>

  </div>

`;

var viewModelFactory = (params, componentInfo) => {
  let node = params.node,
      element = componentInfo.element;
  new RelationLine(params.draw, element, node);
  jQuery(document).ready(() => {
    jQuery(element)
      .find('.question.icon').popup({ inline: true });
  });
  return { relations: node.relationsToParentNode, node: node };
};

export default {
  viewModel: { createViewModel: viewModelFactory },
  template: template
};
