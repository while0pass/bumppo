import ko from 'knockout';
import { ListProperty } from './searchUnitProperties.js';

const r_sameParticipant = { // eslint-disable-line no-unused-vars
  type: 'list', name: 'Совпадение участников', id: 'sameParticipant',
  valueList: { xorValues: [
    { name: 'Да', value: true },
    { name: 'Нет', value: false },
  ]}};

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

class sameParticipant extends ListProperty {
  constructor(node1, node2) {
    super(r_sameParticipant, node2.unitType);
    this.node1 = node1;
    this.node2 = node2;
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
      new sameParticipant(this.node1, this.node2),
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
