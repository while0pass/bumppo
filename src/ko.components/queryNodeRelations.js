import jQuery from 'jquery';
import { RelationLine } from '../scripts/drawQueryTree.js';

const template = `

  <div class="bmpp-queryDistances ui segments"
    data-bind="css: { 'bmpp-queryDistances--toOtherElement':
                      $component.node.level() > 0 }">

    <!-- ko foreach: relations -->
    <div class="bmpp-queryDistance ui secondary segment">

      <div class="ui tiny header" data-bind="visible: $index() === 0">
        на расстоянии:
      </div>

      <div class="ui form" style="margin-bottom: -1em;">
        <div class="bmpp-queryTreeHandles bmpp-queryTreeHandles2">
          <i class="ui small disabled grey plus icon"
            data-bind="visible: $index() === $component.relations().length - 1,
                       click: $component.node.addRelation.bind($component.node)">
          </i>

          <i class="ui small icon"
            data-bind="visible: $index() !== $component.relations().length - 1">
          </i>

          <i class="ui small disabled grey close icon"
            data-bind="visible: $index() > 0,
                       click: $component.node.removeRelation
                              .bind($component.node, $data)"></i>
        </div>

        <div class="inline field bmpp-number">
          <label>от</label>
          <input type="number" step="50" min="0" placeholder="0">
        </div>

        <div class="inline field bmpp-number">
          <label>до</label>
          <input type="number" step="50" min="0" placeholder="0">
        </div>

        <div class="inline field bmpp-units">
          <div class="ui inline dropdown">
            <div class="default text">миллисекунд</div>
            <div class="menu">
              <div class="item" data-value="ms">миллисекунд</div>
              <div class="item" data-value="u">единиц</div>
            </div>
          </div>
        </div>

        <div class="inline field bmpp-points">
          <div class="ui selection dropdown">
            <input type="hidden" name="pp">
            <label>между</label>
            <i class="dropdown icon"></i>
            <div class="default text">
              началом
              <div class="ui circular label"
                data-bind="text: $data.childNode.serialNumber"></div>
            </div>
            <div class="menu">
              <div class="item" data-value="s">
                началом
                <div class="ui circular label"
                  data-bind="text: $data.childNode.serialNumber"></div>
              </div>
              <div class="item" data-value="e">
                концом
                <div class="ui circular label"
                  data-bind="text: $data.childNode.serialNumber"></div>
              </div>
            </div>
          </div>
        </div>

        <div class="inline field bmpp-points">
          <div class="ui selection dropdown">
            <input type="hidden" name="cp">
            <label>и</label>
            <i class="dropdown icon"></i>
            <div class="default text">
              началом
              <div class="ui circular label"
                data-bind="text: $data.parentNode.serialNumber"></div>
            </div>
            <div class="menu">
              <div class="item" data-value="s">
                началом
                <div class="ui circular label"
                  data-bind="text: $data.parentNode.serialNumber"></div>
              </div>
              <div class="item" data-value="e">
                концом
                <div class="ui circular label"
                  data-bind="text: $data.parentNode.serialNumber"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
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
  let node = params.node;
  new RelationLine(params.draw, componentInfo.element, node);
  jQuery(document).ready(() => {
    jQuery(componentInfo.element)
      .find('.ui.dropdown').dropdown();
    jQuery(componentInfo.element)
      .find('.question.icon').popup({ inline: true });
  });
  return { relations: node.relationsToParentNode, node: node };
};

export default {
  viewModel: { createViewModel: viewModelFactory },
  template: template
};
