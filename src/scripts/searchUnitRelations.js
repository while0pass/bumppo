import ko from 'knockout';
import { ListProperty, IntervalProperty } from './searchUnitProperties.js';

const r_sameParticipant = {
  type: 'list', name: 'Совпадение участников', id: 'sameParticipant',
  help: 'Участники единиц #1# и #2# совпадают.',
  valueList: { xorValues: [
    { name: 'Да', value: true },
    { name: 'Нет', value: false },
  ]}};

const rp_occurrence = {
  type: 'list', name: 'Встречаемость', id: 'occurence',
  valueList: { radioButtons: true, xorValues: [
    { name: 'встречаются', value: true },
    { name: 'не встречаются', value: false },
  ]}};

const MILLISECONDS = 'ms',
      UNITS = 'units';

const rp_units = {
  type: 'list', name: 'Единицы измерения', id: 'units',
  valueList: { radioButtons: true, xorValues: [
    { name: 'миллисекунд', value: MILLISECONDS },
    { name: 'единиц', value: UNITS },
  ]}};

const END_BGN = 'begin_2_end_1',
      BGN_END = 'end_2_begin_1',
      BGN_BGN = 'begin_2_begin_1',
      END_END = 'end_2_end_1';

const rp_referencePoints = {
  type: 'list', name: 'Точки отсчета', id: 'refPoints',
  valueList: { radioButtons: true, xorValues: [
    { name: 'От конца #1# до начала #2#', icon: 'align center', value: END_BGN },
    { name: 'От начала #1# до конца #2#', icon: 'align justify', value: BGN_END },
    { name: 'От начала #1# до начала #2#', icon: 'align left', value: BGN_BGN },
    { name: 'От конца #1# до конца #2#', icon: 'align right', value: END_END },
  ]}};

const rp_msDistance = {
  type: 'interval', name: 'Расстояние в мс',
  step: 20, allowNegatives: true, neverEmpty: true };

const rp_unitsDistance = {
  type: 'interval', name: 'Расстояние в единицах',
  step: 1, allowNegatives: true, neverEmpty: true };

class NodesRelation {
  constructor(parentNode, childNode) {
    this.parentNode = parentNode;
    this.childNode = childNode;

    this.from = ko.observable(0);
    this.to = ko.observable(0);

    this.units = ko.observable('ms');
    this.parentNodeRefPoint = ko.observable('end');
    this.childNodeRefPoint = ko.observable('begin');

    this.tune();
  }
  tune() {
    this.oldValues = {};
    // Активация кнопки поиска при изменении значений в полях
    ko.computed(function () {
      let from = this.from(), to = this.to(), units = this.units(),
          pNRefPoint = this.parentNodeRefPoint(),
          cNRefPoint = this.childNodeRefPoint(),
          oldValues = this.oldValues;
      if (from !== oldValues.from || to !== oldValues.to ||
        units !== oldValues.units || pNRefPoint !== oldValues.pNRefPoint ||
        cNRefPoint !== oldValues.cNRefPoint) {
        this.isQueryNew && this.isQueryNew(true);
      }
      this.oldValues.from = from;
      this.oldValues.to = to;
      this.oldValues.units = units;
      this.oldValues.pNRefPoint = pNRefPoint;
      this.oldValues.cNRefPoint = cNRefPoint;
    }, this);
  }
}

class AndGroup {
  constructor(relations) {
    this.terms = ko.observableArray(relations);
  }
}

class OrGroup {
  constructor(relations) {
    this.terms = ko.observableArray(relations);
  }
}

class Distance {
  constructor(node1, node2) {
    this.node1 = node1;
    this.node2 = node2;
    this.type = 'distance';
    this.name = 'Расстояние';
    this.help = '';

    this.units = new ListProperty(rp_units, node1, node2);
    this.intervalInMs = new IntervalProperty(rp_msDistance, node1, node2);
    this.intervalInUnits = new IntervalProperty(rp_unitsDistance, node1, node2);
    this.referencePoints = new ListProperty(rp_referencePoints, node1, node2);
    this.occurrence = new ListProperty(rp_occurrence, node1, node2);

    this.onHeaderClick = undefined;
    this.refPoints = undefined;
    this.unitsFirstValueName = rp_units.valueList.xorValues[0].name;
    this.sameTypeNodes = ko.computed(function () {
      return this.node1.unitType() === this.node2.unitType();
    }, this);
    this.sameTypeNodes.subscribe(function (value) {
      if (!value) {
        this.units.valueList.checkFirstAsIfByUser();  // (*)

        // TODO: Если между единицами задано более одного условия на расстояние
        // и присутствует хотя бы одно условие, где расстояние задано в мс, то
        // вместо (*) все расстояния в единицах (но не миллисекундах) надо
        // удалить и оставить только расстояния в мс. Если же ни одного
        // расстояния в мс не задано, то удалить все расстояния, кроме одного,
        // где выставить в качестве единиц миллисекунды.

      }
    }, this);
    this.measureInMs = ko.computed(function () {
      return this.units.value() === MILLISECONDS;
    }, this);
  }
}

class NodesRelationGroup {
  constructor(node1, node2) {
    this.node1 = node1;
    this.node2 = node2;
    this.relations = this.getRelations();
  }
  getRelations() {
    const defaultRelations = [
      new ListProperty(r_sameParticipant, this.node1, this.node2),
      new Distance(this.node1, this.node2),
    ];
    return defaultRelations;
  }
  resetToDefault() {
    // let old_relations = this.relations;
    this.relations = this.getRelations();
    //# remove old_relations
  }
}

export { NodesRelation, NodesRelationGroup, AndGroup, OrGroup };
