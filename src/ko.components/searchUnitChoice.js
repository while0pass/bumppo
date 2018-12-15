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

  <li data-bind="click: $component.iHaveChosenUnitType.bind($data),
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

    <i class="disabled grey question circle outline icon bmpp-channelsHelp"
      data-bind="popup: channelsHelp.html, popupOpts: channelsHelp.opts"></i>
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

    <!-- ko with: node.unitType -->
    <span class="bmpp-unitTypeAndGroup">
      <!-- ko if: group -->
        <span data-bind="textLowercaseFirstChar: group.name"
          class="bmpp-unitTypeGroup"></span>
      <!-- /ko -->
      <span class="bmpp-unitType"
      data-bind="css: { 'bmpp-unitTypeWithGroup': group }">
        Тип единицы:
        <strong data-bind="text: hasAbbr ? abbr : name"
          style="padding-left: .5em;"></strong>
      </span>
    </span>
    <!-- /ko -->

    <!-- ko if: node.chosenUnitProperties().length > 0 -->
    <div data-bind="foreach: node.chosenUnitProperties"
      style="margin: 1.5em 0 2.5em 0"
      ><!-- ko if: $index() === 0 --><span class="bmpp-bannerPropname"
      data-bind="text: name"></span><span class="bmpp-bannerText"
      >:&#x2002;</span><!-- /ko --><!-- ko ifnot: $index() === 0 --><span
      class="bmpp-bannerPropname" data-bind="textLowercaseFirstChar: name"
      ></span><span class="bmpp-bannerText">:&#x2002;</span><!-- /ko --><span
      data-bind="text: banner" class="bmpp-bannerPropvalue"></span><span
      class="bmpp-bannerText" data-bind="text: $index() &lt; $parent.node.
      chosenUnitProperties().length - 1 ? ';&#x2002;' : '.'"></span
    ></div>
    <!-- /ko -->

    <div style="position: absolute; bottom: 0.8em">
      <span data-bind="click: goEditUnitType" class="bmpp-editUrl">
        Изменить тип единицы
      </span>
      <span data-bind="click: goEditUnitProperties" class="bmpp-editUrl"
        style="margin-left: 1em">
        <span data-bind="text: isAnyUnitPropertySet() ? 'Изменить' : 'Задать'">
        </span> свойства единицы
      </span>
    </div>

    <span data-bind="click: node.seppuku.bind(node),
                     visible: node.depth() === 0 && node.unitType()"
      style="position: absolute; right: 1.5em; bottom: 1.1em; color: #a00;
      border-bottom-color: #a00; line-height: 1em;"
      class="bmpp-editUrl">
      Очистить запрос
    </span>
  </div>
`;

const template = `

  <!-- ko if: node.isEditStateForUnitType -->
  ${unitChoiceTemplate}
  <!-- /ko -->

  <!-- ko ifnot: node.isEditStateForUnitType -->
  ${chosenUnitTemplate}
  <!-- /ko -->

`;

class channelViewModel {
  constructor(channel, activeChannel, iHaveChosenUnitType) {
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
        // Показать popup. NOTE: Это действие реализовано через свойство
        // popupAdditionalShowOnClick пользовательского нокаут-байндинга popup.
      } else if (self.channel.totalNumberOfUnits === 1) {
        activeChannel(self);
        iHaveChosenUnitType.call(self.channel.getSingleUnit());
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

class viewModel {
  constructor(params) {
    let node = params.node,
        prechoosenUnit = node.unitType(),
        prechoosenChannel = prechoosenUnit && prechoosenUnit.channel,
        activeChannel = ko.observable(null),
        queryPartsNonReadiness = params.queryPartsNonReadiness,
        goEditUnitType = function () {
          node.isEditStateForUnitType(true);
        },
        goEditUnitProperties = function () {
          params.editNodeProperties(node);
        },
        iHaveChosenUnitType = function () {
          node.unitType(this);
          node.isEditStateForUnitType(false);
          params.isQueryNew(true);
        },
        iHaveChosenUnitProperties = function () {
          params.finishEditingNodeProperties();
          params.isQueryNew(true);
        },
        isAnyUnitPropertySet = ko.computed(
          () => node.unitProperties().some(prop => prop.value() !== null)
        ).extend({ rateLimit: 500 }),
        channelViewModels = [],
        channelHelpPopupOpts = {
          variation: 'basic',
          delay: { show: 400, hide: 0 },
          duration: 400,
        };

    queryPartsNonReadiness.push(node.isEditStateForUnitType);

    for (let channel of channels) {
      let cVM = new channelViewModel(channel, activeChannel, iHaveChosenUnitType);
      channelViewModels.push(cVM);
      if (prechoosenChannel && prechoosenChannel.id === channel.id) {
        activeChannel(cVM);
      }
    }

    if (!prechoosenUnit) {
      goEditUnitType();
    }

    ko.computed(function () {
      if (node.unitType() === null) {
        activeChannel(null);
        node.isEditStateForUnitType(true);
      }
    });

    this.node = node;
    this.channelViewModels = channelViewModels;
    this.channelsHelp = { html: channelsHelp, opts: channelHelpPopupOpts };
    this.activeChannel = activeChannel;
    this.queryPartsNonReadiness = queryPartsNonReadiness;
    this.goEditUnitType = goEditUnitType;
    this.goEditUnitProperties = goEditUnitProperties;
    this.iHaveChosenUnitType = iHaveChosenUnitType;
    this.iHaveChosenUnitProperties = iHaveChosenUnitProperties;
    this.isAnyUnitPropertySet = isAnyUnitPropertySet;
  }
  dispose() {
    this.queryPartsNonReadiness.remove(this.node.isEditStateForUnitType);
  }
}

export default {
  viewModel: viewModel,
  template: template
};
