import jQuery from 'jquery';
import ko from 'knockout';
import { channels, disabledChannelTooltip } from '../scripts/searchUnits.js';

const template = `

  <i class="disabled grey question circle outline icon bmpp-nearLabelIcon"></i>
  <div class="ui basic popup hidden">
    <header class="ui header">Единицы поиска</header>
    <p>Чтобы выбрать единицу поиска, сначала укажите область разметки
    в верхнем меню, а затем нажмите на нужный вам тип единицы.</p>
  </div>

  <div data-bind="foreach: channels">
    <button class="ui button" style="width: 6em!important"
      data-bind="css: buttonCSS, text: id, attr: { title: name },
        event: { click: activate,
                 mouseover: onMouseOver, mouseout: onMouseOut }">
    </button>
  </div>

`;

var viewModelFactory = (params, componentInfo) => {
  let node = params.node,
      activeChannel = ko.observable(null);

  jQuery(document).ready(() => {
    jQuery(componentInfo.element).find('.icon').popup({ inline: true });
  });

  for (let channel of channels) {
    channel.isActive = ko.computed(function() {
      return this.id === activeChannel();
    }, channel);
    channel.isMouseOver = ko.observable(false);
    channel.onMouseOver = function() {
      this.isMouseOver(true);
    }.bind(channel);
    channel.onMouseOut = function() {
      this.isMouseOver(false);
    }.bind(channel);
    channel.activate = function() {
      activeChannel(this.id);
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
