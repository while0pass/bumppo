import jQuery from 'jquery';
import ko from 'knockout';
import { channels, disabledChannelTooltip } from '../scripts/searchUnits.js';

const units_template = `

  <ul class="bmpp-units" data-bind="foreach: units">
    <li data-bind="click: function() { $component.node.unitType($data); },
                   css: { active: $component.node.unitType() &&
                                  $component.node.unitType().id === id }">
      <span class="unitSelectionContainer">
        <span class="unit" data-bind="text: name"></span>
      </span>
    </li>
  </ul>

`;

const template = `

  <i class="disabled grey question circle outline icon bmpp-nearLabelIcon"></i>
  <div class="ui basic popup hidden">
    <header class="ui header">Единицы поиска</header>
    <p>Чтобы выбрать единицу поиска, сначала укажите область разметки
    в верхнем меню, а затем нажмите на нужный вам тип единицы.</p>
  </div>

  <div data-bind="foreach: channels">
    <button class="ui button" style="width: 6em!important"
      data-bind="css: buttonCSS, text: id,
        attr: { title: tooltip }, event: { click: activate,
        mouseover: onMouseOver, mouseout: onMouseOut }">
    </button>
  </div>

  <!-- ko if: activeChannel -->
  <div data-bind="with: activeChannel" style="margin-top: 1em">
    <header class="ui tiny header"
      data-bind="text: unitsHeader"></header>
    <div style="column-count: 2">

      <!-- ko if: groups -->
      <ul class="bmpp-unitGroups" data-bind="foreach: groups">
        <li>
          <header data-bind="text: name"></header>
          ${units_template}
        </li>
      </ul>
      <!-- /ko -->

      <!-- ko if: units -->
      ${units_template}
      <!-- /ko -->

    </div>
  </div>
  <!-- /ko -->

`;

var viewModelFactory = (params, componentInfo) => {
  let node = params.node,
      activeChannel = ko.observable(null);

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

  return {
    node: node,
    channels: channels,
    activeChannel: activeChannel
  };
};

export default {
  viewModel: { createViewModel: viewModelFactory },
  template: template
};
