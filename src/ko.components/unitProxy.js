import ko from 'knockout';
import { unitTypeTemplate, unitPropsTemplate } from './searchUnitChoice.js';

const chosenRefTemplate = `

  <!-- ko if: nodeProxy.unitType -->

    <button class="ui grey button bmpp-channelSlug"
      data-bind="text: nodeProxy.unitType().channel.id"></button>

    ${ unitTypeTemplate }
    ${ unitPropsTemplate }

  <!-- /ko -->
  <!-- ko ifnot: nodeProxy.unitType -->

    Тип единицы <span class="ui circular label"
    data-bind="text: nodeProxy.serialNumber"></span> ещё не выбран

  <!-- /ko -->

  <span data-bind="visible: canChoose, click: showOptions"
    style="position: absolute; bottom: 0.8em; left: 1em"
    class="bmpp-editUrl">Выбрать другой узел</span>

`;

const choseRefTemplate = `

  Выберите узел, на который хотите сослаться:
  <!-- ko foreach: options -->
    <span class="ui grey circular label" data-bind="text: serialNumber,
      click: $component.chooseRef"></span>
  <!-- /ko -->

`;

const template = `

  <!-- ko if: isProxyUnbound -->${ choseRefTemplate }<!-- /ko -->
  <!-- ko ifnot: isProxyUnbound -->${ chosenRefTemplate }<!-- /ko -->

`;

function compareBySerialNumber(a, b) {
  let sn1 = a.serialNumber(),
      sn2 = b.serialNumber();
  if (sn1 < sn2) return -1;
  if (sn1 > sn2) return 1;
  return 0;
}

class viewModel {
  constructor(params) {
    this.nodeProxy = params.node;
    this.node = this.nodeProxy;  // Требуется для импортированных шаблонов
    this.isProxyUnbound = this.getUnboundCheck();
    this.canChoose = this.getCanChoose();
    this.options = this.getOptions();
    this.showOptions = () => this.nodeProxy.node(null);
    this.chooseRef = $data => this.nodeProxy.node($data);
    this.queryPartsNonReadiness = params.queryPartsNonReadiness;

    this.queryPartsNonReadiness.push(this.isProxyUnbound);
  }
  getUnboundCheck() {
    return ko.computed(() => !this.nodeProxy.node());
  }
  getCanChoose() {
    let nodeProxy = this.nodeProxy;
    return ko.computed(() => nodeProxy.parentNode.refOpts().length > 0);
  }
  getOptions() {
    return ko.computed(function () {
      let ref = this.nodeProxy.node.peek(),
          options = this.nodeProxy.parentNode.refOpts();
      if (ref && options.indexOf(ref) === -1) {
        options = options.concat(ref);
      }
      options.sort(compareBySerialNumber);
      return options;
    }, this);
  }
  dispose() {
    this.queryPartsNonReadiness.remove(this.isProxyUnbound);
  }
}

export default { viewModel: viewModel, template: template };
