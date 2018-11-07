import jQuery from 'jquery';
import ko from 'knockout';
import { channels } from '../scripts/searchUnits.js';

const unitTemplate = `

  <li data-bind="click: $component.chooseUnit.bind($data),
                 css: { active: $component.node.unitType() &&
                                $component.node.unitType().id === id }">
    <span class="unitSelectionContainer">
      <span class="unit" data-bind="text: name"></span>
    </span>
  </li>

`;

const unitChoiceTemplate = `

  <div>
    <!-- ko foreach: channelViewModels -->
    <button class="ui button bmpp-channelSlug"
      data-bind="css: buttonCSS, text: channel.id,
        attr: { title: channel.tooltip }, event: { click: activate,
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
      data-bind="text: channel.unitsHeader"></header>
    <div style="column-count: 2">

      <!-- ko if: channel.groups -->
      <ul class="bmpp-unitGroups" data-bind="foreach: channel.groups">
        <li>
          <header data-bind="text: name"></header>
          <ul class="bmpp-units" data-bind="foreach: units">
            ${unitTemplate}
          </ul>
        </li>
      </ul>
      <!-- /ko -->

      <!-- ko if: channel.units -->
      <ul class="bmpp-units" data-bind="foreach: channel.units">
        ${unitTemplate}
      </ul>
      <!-- /ko -->

    </div>
  </div>
  <!-- /ko -->

`;

const chosenUnitTemplate = `
  <div>
    <!-- ko with: activeChannel -->
    <button class="ui button bmpp-channelSlug"
      data-bind="css: channel.color, text: channel.id,
        attr: { title: channel.tooltip }">
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

function channelViewModel(channel, activeChannel) {
  let self = this;
  this.channel = channel;
  this.isActive = ko.computed(function() {
    let aC = activeChannel();
    return aC && aC.channel && aC.channel.id === self.channel.id;
  });
  this.isMouseOver = ko.observable(false);
  this.onMouseOver = () => { self.isMouseOver(true); };
  this.onMouseOut = () => { self.isMouseOver(false); };
  this.activate = () => { activeChannel(self); };
  this.buttonCSS = ko.computed(function() {
    let isActive = self.isActive(),
        isMouseOver = self.isMouseOver(),
        cssClasses;
    if (activeChannel()) {
      if (isActive || isMouseOver) {
        cssClasses = self.channel.color;
      } else {
        cssClasses = `${self.channel.color} basic`;
      }
    } else {
      cssClasses = self.channel.color;
    }
    return cssClasses;
  });
}

function viewModel(params) {
  let node = params.node,
      prechoosenUnit = node.unitType(),
      prechoosenChannel = prechoosenUnit && prechoosenUnit.channel,
      activeChannel = ko.observable(null),
      editChannel = ko.observable(prechoosenUnit ? false : true),
      chooseUnit = function () { node.unitType(this); editChannel(false); },
      channelViewModels = [];
  for (let channel of channels) {
    let cVM = new channelViewModel(channel, activeChannel);
    channelViewModels.push(cVM);
    if (prechoosenChannel && prechoosenChannel.id === channel.id) {
      activeChannel(cVM);
    }
  }
  this.node = node;
  this.channelViewModels = channelViewModels;
  this.activeChannel = activeChannel;
  this.editChannel = editChannel;
  this.chooseUnit = chooseUnit;
}

var viewModelFactory = (params, componentInfo) => {
  jQuery(document).ready(() => {
    jQuery(componentInfo.element).find('.icon').popup({ inline: true });
  });
  return new viewModel(params);
};

export default {
  viewModel: { createViewModel: viewModelFactory },
  template: template
};
