import jQuery from 'jquery';
import ko from 'knockout';

const numbersTemplate = `

  <div class="inline field bmpp-number">
    <label style="font-weight: normal">от</label>
    <input type="number" min="0"
      data-bind="value: from, attr: { step: unitsAreNotChosen() ? 20 : 1 }">
  </div>

  <div class="inline field bmpp-number">
    <label style="font-weight: normal">до</label>
    <input type="number" min="0"
      data-bind="value: to, attr: { step: unitsAreNotChosen() ? 20 : 1 }">
  </div>

`;

const template = `

  <div class="bmpp-queryDistance ui secondary segment">

    <div class="ui tiny header" data-bind="visible: $index() === 0"
      style="font-weight: normal">
      на расстоянии:
    </div>

    <div class="ui form" style="margin-bottom: -1em;">
      <div class="bmpp-queryTreeHandles bmpp-queryTreeHandles2">

        <i class="ui small disabled grey plus icon" data-bind="
          visible: $index() === relations().length - 1 && unitsAreNotChosen(),
          click: childNode.addRelation.bind(childNode)">
        </i>

        <i class="ui small icon"
          data-bind="visible: $index() !== relations().length - 1">
        </i>

        <i class="ui small disabled grey close icon"
          data-bind="visible: $index() !== 0,
            click: childNode.removeRelation.bind(childNode, relation)"></i>
      </div>

      ${ numbersTemplate }

      <div class="inline field bmpp-units"
        data-bind="visible: !canShowUnits()">миллисекунд</div>

      <div class="inline field bmpp-units" data-bind="visible: canShowUnits">
        <div class="ui inline dropdown">
          <div class="text"></div>
          <div class="menu">
            <div class="item" data-value="ms">миллисекунд</div>
            <div class="item" data-value="u">единиц</div>
          </div>
        </div>
      </div>

      <div class="inline field bmpp-points bmpp-childNodeRefPoint"
        data-bind="visible: unitsAreNotChosen">
        <div class="ui selection dropdown">
          <input type="hidden" data-bind="value: childNodeRefPoint">
          <label>между</label>
          <i class="dropdown icon"></i>
          <div class="text">
            началом
            <div class="ui circular label"
              data-bind="text: childNode.serialNumber"></div>
          </div>
          <div class="menu">
            <div class="item" data-value="begin">
              началом
              <div class="ui circular label"
                data-bind="text: childNode.serialNumber"></div>
            </div>
            <div class="item" data-value="end">
              концом
              <div class="ui circular label"
                data-bind="text: childNode.serialNumber"></div>
            </div>
          </div>
        </div>
      </div>

      <div class="inline field bmpp-points bmpp-parentNodeRefPoint"
        data-bind="visible: unitsAreNotChosen">
        <div class="ui selection dropdown">
          <input type="hidden" data-bind="value: parentNodeRefPoint">
          <label>и</label>
          <i class="dropdown icon"></i>
          <div class="text">
            началом
            <div class="ui circular label"
              data-bind="text: parentNode.serialNumber"></div>
          </div>
          <div class="menu">
            <div class="item" data-value="begin">
              началом
              <div class="ui circular label"
                data-bind="text: parentNode.serialNumber"></div>
            </div>
            <div class="item" data-value="end">
              концом
              <div class="ui circular label"
                data-bind="text: parentNode.serialNumber"></div>
            </div>
          </div>
        </div>
      </div>

    </div>

  </div>

`;

var viewModelFactory = (params, componentInfo) => {
  const charsToDelete = /[^0-9]+/g;
  let element = jQuery(componentInfo.element).next('.bmpp-queryDistance'),
      relation = params.relation,
      from = relation.from.extend(
        { numeric: { regexp: charsToDelete, isNullable: false }}),
      to = relation.to.extend({ numeric: { regexp: charsToDelete,
        isNullable: false, lessOrEqualTo: from }});

  relation.isQueryNew = params.isQueryNew;

  // Настройка взаимного поведения значений "от" и "до"
  ko.computed(function () {
    let f = from(), t = to.peek();
    if (typeof f === 'number' && typeof t === 'number' && f > t) {
      to(f);
    } else if (typeof f !== 'number') {
      from(0); // FIXME: Здесь надо учитывать атрибут min поля ввода
    }
  });
  ko.computed(function () {
    let f = from.peek(), t = to();
    if (typeof f === 'number' && typeof t === 'number' && t < f) {
      from(t);
    } else if (typeof t !== 'number') {
      to(f); // FIXME: Здесь надо учитывать атрибут min поля ввода
    }
  });

  // Настройка дропдауна единиц измерения
  let unitsElement = element.find('.bmpp-units .ui.dropdown');
  unitsElement.dropdown({
    onChange: function (value) {
      if (value !== relation.units()) { relation.units(value); }
    }
  });
  unitsElement.dropdown('set selected', relation.units());

  // Настройка дропдауна родительского узла
  let pElement = element.find('.bmpp-parentNodeRefPoint .ui.dropdown');
  pElement.dropdown({
    onChange: function (value) {
      if (value !== relation.parentNodeRefPoint()) {
        relation.parentNodeRefPoint(value);
      }
    }
  });
  pElement.dropdown('set selected', relation.parentNodeRefPoint());

  // Настройка дропдауна дочернего узла
  let cElement = element.find('.bmpp-childNodeRefPoint .ui.dropdown');
  cElement.dropdown({
    onChange: function (value) {
      if (value !== relation.childNodeRefPoint()) {
        relation.childNodeRefPoint(value);
      }
    }
  });
  cElement.dropdown('set selected', relation.childNodeRefPoint());

  let canShowUnits = ko.computed(function () {
    let pUnitType = relation.parentNode.unitType(),
        cUnitType = relation.childNode.unitType(),
        relations = params.relations();
    if (!pUnitType || !cUnitType) return false;
    if (pUnitType.id !== cUnitType.id) return false;
    if (relations.length > 1) return false;

    let a = relation.parentNode
      .getTiersFromTemplate(pUnitType.tierTemplate).sort().join('');
    let b = relation.childNode
      .getTiersFromTemplate(cUnitType.tierTemplate).sort().join('');
    if (a !== b) return false;

    return true;
  });

  let unitsAreNotChosen = ko.computed(function () {
    return relation.units() !== 'u';
  });

  ko.computed(function () {
    if (!canShowUnits() && !unitsAreNotChosen.peek()) {
      unitsElement.dropdown('set selected', 'ms');
    }
  });

  return {
    relations: params.relations,
    relation: relation,
    from: from,
    to: to,
    parentNode: relation.parentNode,
    childNode: relation.childNode,
    parentNodeRefPoint: relation.parentNodeRefPoint,
    childNodeRefPoint: relation.childNodeRefPoint,
    canShowUnits: canShowUnits,
    unitsAreNotChosen: unitsAreNotChosen,
  };
};


export default {
  viewModel: { createViewModel: viewModelFactory },
  template: template
};
