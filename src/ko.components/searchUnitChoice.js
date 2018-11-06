import jQuery from 'jquery';
import ko from 'knockout';
import { channels, disabledChannelTooltip } from '../scripts/searchUnits.js';

const template = `

  <i class="disabled grey question circle outline icon
    bmpp-nearLabelIcon"></i>
  <div class="ui basic popup hidden">
    <header class="ui header">Единицы поиска</header>

    <p>Чтобы выбрать единицу поиск, сначала укажите область разметки
    в верхнем меню, а затем нажмите на нужный вам тип единицы.</p>
  </div>

  <div data-bind="foreach: channels">
    <button class="ui button" data-bind="css: color, text: id"></button>
  </div>

`;

var viewModelFactory = (params, componentInfo) => {
  let node = params.node;
  jQuery(document).ready(() => {
    jQuery(componentInfo.element).find('.icon').popup({ inline: true });
  });
  return {
    node: node,
    channels: channels,
    activeChannel: ko.observable(null)
  };
};

export default {
  viewModel: { createViewModel: viewModelFactory },
  template: template
};
