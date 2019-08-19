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

  <span data-bind="visible: nodeProxy.parentNode.refOpts().length > 0,
    click: showOptions" class="bmpp-editUrl">Выбрать другой узел</span>

`;

const choseRefTemplate = `

  Выберите узел, на который хотите сослаться:
  <!-- ko foreach: options -->
    <span class="ui circular label" data-bind="text: serialNumber,
      click: $component.choseRef"></span>
  <!-- /ko -->

`;

const template = `

  <!-- ko if: isProxyBound -->${ chosenRefTemplate }<!-- /ko -->
  <!-- ko ifnot: isProxyBound -->${ choseRefTemplate }<!-- /ko -->

`;

function compareBySerialNumber(a, b) {
  let sn1 = a.serialNumber(),
      sn2 = b.serialNumber();
  if (sn1 < sn2) return -1;
  if (sn1 > sn2) return 1;
  return 0;
}

var viewModelFactory = params => {
  let nodeProxy = params.node,
      node = nodeProxy,  // Это имя требуется для импортированных шаблонов
      isProxyBound = nodeProxy.node,
      options = ko.computed(function () {
        let ref = nodeProxy.node.peek(),
            options = nodeProxy.parentNode.refOpts();
        if (ref && options.indexOf(ref) === -1) {
          options = options.concat(ref);
        }
        options.sort(compareBySerialNumber);
        return options;
      }),
      showOptions = () => nodeProxy.node(null),
      choseRef = $data => nodeProxy.node($data);
  return {
    choseRef,
    isProxyBound,
    node,
    nodeProxy,
    options,
    showOptions,
  };
};

export default {
  viewModel: { createViewModel: viewModelFactory },
  template: template
};
