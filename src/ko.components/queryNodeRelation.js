import jQuery from 'jquery';

const template = `

    <div class="bmpp-queryDistance ui secondary segment">

      <div class="ui tiny header" data-bind="visible: isFirst">
        на расстоянии:
      </div>

      <div class="ui form" style="margin-bottom: -1em;">
        <div class="bmpp-queryTreeHandles bmpp-queryTreeHandles2">
          <i class="ui small disabled grey plus icon"
            data-bind="visible: isLast,
                       click: relation.childNode.addRelation
                                .bind(relation.childNode)">
          </i>

          <i class="ui small icon"
            data-bind="visible: !isLast()">
          </i>

          <i class="ui small disabled grey close icon"
            data-bind="visible: !isFirst(),
                       click: relation.childNode.removeRelation
                                .bind(relation.childNode, relation)"></i>
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
                data-bind="text: relation.childNode.serialNumber"></div>
            </div>
            <div class="menu">
              <div class="item" data-value="s">
                началом
                <div class="ui circular label"
                  data-bind="text: relation.childNode.serialNumber"></div>
              </div>
              <div class="item" data-value="e">
                концом
                <div class="ui circular label"
                  data-bind="text: relation.childNode.serialNumber"></div>
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
                data-bind="text: relation.parentNode.serialNumber"></div>
            </div>
            <div class="menu">
              <div class="item" data-value="s">
                началом
                <div class="ui circular label"
                  data-bind="text: relation.parentNode.serialNumber"></div>
              </div>
              <div class="item" data-value="e">
                концом
                <div class="ui circular label"
                  data-bind="text: relation.parentNode.serialNumber"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>

`;

var activateUI = (element) => {
  jQuery(document).ready(() => {
    jQuery(element)
      .find('.ui.dropdown').dropdown();
    jQuery(element)
      .find('.question.icon').popup({ inline: true });
  });
};

var viewModelFactory = (params, componentInfo) => {
  activateUI(componentInfo.element);
  return {
    relation: params.relation,
    isFirst: params.isFirst,
    isLast: params.isLast
  };
};

export default {
  viewModel: { createViewModel: viewModelFactory },
  template: template
};
