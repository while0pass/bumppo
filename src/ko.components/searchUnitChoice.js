import jQuery from 'jquery';
import ko from 'knockout';
import { channels, disabledChannelTooltip } from '../scripts/searchUnits.js';

const unitsTemplate = `

  <ul class="bmpp-units" data-bind="foreach: units">
    <li data-bind="click: $component.chooseUnit.bind($data),
                   css: { active: $component.node.unitType() &&
                                  $component.node.unitType().id === id }">
      <span class="unitSelectionContainer">
        <span class="unit" data-bind="text: name"></span>
      </span>
    </li>
  </ul>

`;

const unitChoiceTemplate = `

  <div>
    <!-- ko foreach: channels -->
    <button class="ui button bmpp-channelSlug"
      data-bind="css: buttonCSS, text: id,
        attr: { title: tooltip }, event: { click: activate,
        mouseover: onMouseOver, mouseout: onMouseOut }">
    </button>
    <!-- /ko -->

    <i class="disabled grey question circle outline icon"></i>
    <div class="ui basic popup hidden">
      <header class="ui header">Единицы поиска</header>
      <p>Чтобы выбрать единицу поиска, сначала укажите область разметки
      в верхнем меню, а затем нажмите на нужный вам тип единицы.</p>
    </div>
  </div>

  <!-- ko if: activeChannel -->
  <div data-bind="with: activeChannel" style="margin-top: 2em">
    <header class="ui tiny header"
      data-bind="text: unitsHeader"></header>
    <div style="column-count: 2">

      <!-- ko if: groups -->
      <ul class="bmpp-unitGroups" data-bind="foreach: groups">
        <li>
          <header data-bind="text: name"></header>
          ${unitsTemplate}
        </li>
      </ul>
      <!-- /ko -->

      <!-- ko if: units -->
      ${unitsTemplate}
      <!-- /ko -->

    </div>
  </div>
  <!-- /ko -->

`;

const chosenUnitTemplate = `
  <div>
    <!-- ko with: activeChannel -->
    <button class="ui button bmpp-channelSlug"
      data-bind="css: buttonCSS, text: id,
        attr: { title: tooltip }, event: { click: activate,
        mouseover: onMouseOver, mouseout: onMouseOut }">
    </button>
    <!-- /ko -->
    <span style="padding-left: .5em">Тип единицы:</span>
    <!-- ko with: node.unitType -->
      <strong data-bind="text: hasAbbr ? abbr : name"
        style="padding-left: .5em"></strong>
    <!-- /ko -->
    <div style="margin-top: 4em">
      <span data-bind="click: function(){ editChannel(true); }"
          class="bmpp-editUrl">
        Изменить тип единицы
      </span>
    </div>
  </div>
`;

const template = `

  <!-- ko if: editChannel -->
  ${unitChoiceTemplate}
  <!-- /ko -->

  <!-- ko if: !editChannel() -->
  ${chosenUnitTemplate}
  <!-- /ko -->

`;

var viewModelFactory = (params, componentInfo) => {
  let node = params.node,
      prechoosenUnit = node.unitType(),
      prechoosenChannel = prechoosenUnit && prechoosenUnit.channel,
      activeChannel = ko.observable(prechoosenChannel || null),
      editChannel = ko.observable(prechoosenUnit ? false : true);

  jQuery(document).ready(() => {
    jQuery(componentInfo.element).find('.icon').popup({ inline: true });
  });

  for (let channel of channels) {
    if (channel.disabled) {
      channel.tooltip = `${channel.name}\n${disabledChannelTooltip}`;
    } else {
      channel.tooltip = channel.name;
    }
    channel.isActive = ko.computed(function() {
      let aC = activeChannel();
      return aC && this.id === aC.id;
    }, channel);
    channel.isMouseOver = ko.observable(false);
    channel.onMouseOver = function() {
      this.isMouseOver(true);
    }.bind(channel);
    channel.onMouseOut = function() {
      this.isMouseOver(false);
    }.bind(channel);
    channel.activate = function() {
      activeChannel(this);
    }.bind(channel);

    channel.buttonCSS = ko.computed(function() {
      let isActive = this.isActive(),
          isMouseOver = this.isMouseOver();
      if (activeChannel()) {
        if (isActive || isMouseOver) {
          return this.color;
        } else {
          return `${this.color} basic`;
        }
      } else {
        return this.color;
      }
    }, channel);

  }

  function chooseUnit() {
    node.unitType(this);
    editChannel(false);
  }

  return {
    node: node,
    channels: channels,
    activeChannel: activeChannel,
    editChannel: editChannel,
    chooseUnit: chooseUnit
  };
};

export default {
  viewModel: { createViewModel: viewModelFactory },
  template: template
};
