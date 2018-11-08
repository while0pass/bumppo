import jQuery from 'jquery';
import ko from 'knockout';
import { channels } from '../scripts/searchUnits.js';

const channelsHelp = `

  <header class="ui header">Единицы поиска</header>

  <p>Чтобы выбрать единицу поиска, сначала укажите область разметки
  в верхнем меню, а затем нажмите на нужный вам тип единицы.</p>

`;

const disabledChannelHTML = `

  <div style="font-size: smaller; font-style: italic">
    Аннотация пока не готова.
  </div>

`;

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
        popup: tooltip, popupOpts: channelPopupOpts,
        popupAdditionalShowOnClick: disabled,
        event: { click: onClick, mouseover: onMouseOver,
                 mouseout: onMouseOut }">
    </button>
    <!-- /ko -->

    <i class="disabled grey question circle outline icon bmpp-channelsHelp"></i>
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
        popup: tooltip, popupOpts: channelPopupOpts">
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

class channelViewModel {
  constructor(channel, activeChannel, chooseUnit) {
    let self = this;
    this.channel = channel;
    this.isActive = ko.computed(function() {
      let aC = activeChannel();
      return aC && aC.channel && aC.channel.id === self.channel.id;
    });
    this.isMouseOver = ko.observable(false);
    this.onMouseOver = () => { self.isMouseOver(true); };
    this.onMouseOut = () => { self.isMouseOver(false); };
    this.disabled = (this.channel.disabled ||
                     self.channel.totalNumberOfUnits === 0);
    this.onClick = () => {
      if (self.disabled) {
        // popup
      } else if (self.channel.totalNumberOfUnits === 1) {
        activeChannel(self);
        chooseUnit.call(self.channel.getSingleUnit());
      } else {
        activeChannel(self);
      }
    };
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
  get tooltip() {
    if (this.disabled) return this.channel.name + disabledChannelHTML;
    return this.channel.name;
  }
  get channelPopupOpts() {
    return {
      variation: 'basic',
      delay: { show: 700, hide: 0 },
      duration: 400,
      transition: 'fade',
      onVisible: function lazyHide(popupTarget) {
        let hide = function (popupTarget) {
          jQuery(popupTarget).popup('hide');
        };
        setTimeout(hide.bind(this, popupTarget), 1700);
      }
    };
  }
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
    let cVM = new channelViewModel(channel, activeChannel, chooseUnit);
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
  let helpPopupOpts = {
    html: channelsHelp,
    variation: 'basic',
    delay: { show: 400, hide: 0 },
    duration: 400,
  };
  jQuery.initialize('.bmpp-channelsHelp', function () {
    // HACK: Действие обязательно должно быть отложенным. И ловить элемент
    // нужно по сложному пути, а не просто jQuery(this). Времени меньше
    // секунды не хватает. Возможно при усложнении компоненета и секунды
    // будет не хватать. Вероятно, тут надо использовать data-bind="event:
    // { descendantsComplete: myAction() }" и возможно даже не на этом,
    // а родительском компоненте. Событие descendantsComplete должно
    // появиться в knockoutjs v3.5.
    let popupInit = function () {
      jQuery(componentInfo.element)
        .find('.bmpp-channelsHelp').popup(helpPopupOpts);
    };
    setTimeout(popupInit, 1000);
  }, { target: componentInfo.element });

  return new viewModel(params);
};

export default {
  viewModel: { createViewModel: viewModelFactory },
  template: template
};
