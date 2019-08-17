import ko from 'knockout';
import { defaultPropertiesList, propertiesLists,
  SearchUnitProperty } from './searchUnitProperties.js';
import { NodesRelationFormula } from './searchUnitRelations.js';

export class TreeNode {
  constructor(parentNode=null) {
    this.id = window.performance.now();
    this.parentNode = parentNode;
    this.childNodes = ko.observableArray([]);
    this.relationFormulas = {};

    this.depth = ko.observable(parentNode && (parentNode.depth() + 1) || 0);
    this.level = ko.observable(0);
    this.serialNumber = ko.observable(0);
    this.unitType = ko.observable(null);  // см. searchUnits
    this.unitProperties = ko.observableArray([]);
    this.isEditStateForUnitType = ko.observable(true);

    this.tuneRelations();
    this.tuneUnitProperties();
  }
  tuneRelations() {
    if (this.parentNode !== null) {
      this.addRelationFormula();
    }
  }
  tuneUnitProperties() {
    let self = this,
        unitProperties = self.unitProperties;
    self.unitType.subscribe(unitType => {
      if (unitType === null) {
        unitProperties([]);
      } else {
        // Сохраняем все свойства прежнего типа. Разбираемся, какой новый тип
        // и канал пользователь выбрал.
        let oldUnitTypeProperties = unitProperties(),
            newUnitTypeProperties = [];
        // По типу поисковой единицы или/и каналу вытягиваем перечень
        // свойств нового типа.
        let unitTypePropertiesData = propertiesLists[unitType.id]
          || defaultPropertiesList;

        // Создаем свойства нового типа, совпадающие свойства переиспользуем
        // или создаем на основе соответствующего свойства прежнего типа
        for (let i = 0; i < unitTypePropertiesData.length; i++) {
          let newPropertyData = unitTypePropertiesData[i],
              oldProperty = oldUnitTypeProperties.find(
                prop => prop.id === newPropertyData.id
              );
          if (oldProperty) {
            newUnitTypeProperties.push(oldProperty);
          } else {
            let newProperty = SearchUnitProperty
              .createByType(newPropertyData, self);
            newUnitTypeProperties.push(newProperty);
          }
        }
        unitProperties(newUnitTypeProperties);
      }
    });
    this.chosenUnitProperties = ko.computed(
      () => unitProperties().filter(prop => ko.unwrap(prop.banner))
    );
    unitProperties.unitPropertiesMap = ko.computed(function () {
      let propsMap = {};
      unitProperties().forEach(prop => { propsMap[prop.id] = prop; });
      return propsMap;
    });
  }
  addChild() {
    var child = new TreeNode(this);
    this.childNodes.push(child);
  }
  addRelationFormula() {
    const node1 = this.parentNode,
          node2 = this,
          rf = new NodesRelationFormula(node1, node2);
    node1.relationFormulas[node2.id] = rf;
    node2.relationFormulas[node1.id] = rf;
  }
  getRelationFormula(node) {
    return this.relationFormulas[node.id];
  }
  removeRelationFormula(node) {
    delete node.relationFormulas[this.id];
    delete this.relationFormulas[node.id];
  }
  resetAllRelations(node) {
    const rf = this.getRelationFormula(node);
    rf.resetToDefault();
  }
  areRelationsChanged(node) {
    let rf = this.getRelationFormula(node),
        before = rf.$oldRelationsSummary || '',
        after = rf.chosenRelations()
          .map(rel => ko.unwrap(rel.banner)).join('');
    this.$oldRelationsSummary = after;
    return after !== before;
  }
  seppuku() {
    for (let childNode of this.childNodes()) {
      childNode.seppuku();
    }
    this.removeRelationFormula(this.parentNode);
    this.childNodes.removeAll();
    if (this.parentNode) {
      this.parentNode.childNodes.remove(this);
    }
  }
  clearAllProperties() {
    this.chosenUnitProperties().forEach(prop => prop.clear());
  }
  arePropertiesChanged() {
    let before = this.$oldPropsSummary || '',
        after = this.chosenUnitProperties()
          .map(prop => ko.unwrap(prop.banner)).join('');
    this.$oldPropsSummary = after;
    return after !== before;
  }
  getTiersFromTemplate(template) {
    if (template.indexOf('{') < 0) return [template];

    let tiers = [], idMap = {};
    const unitPropertiesMap = this.unitProperties.unitPropertiesMap(),
          reTrim = /^\{\s*|\s*\}$/g,
          reFields = /\{\s*[^{}]+\s*\}/g,
          reProp = x => new RegExp(`\\{\\s*${ x }\\s*\\}`, 'g'),
          propsIds = template.match(reFields).map(x => x.replace(reTrim, ''));
    propsIds.forEach(id => {
      idMap[id] = unitPropertiesMap[id].value() || [];
    });

    let lens = propsIds.map(id => idMap[id].length),
        index = propsIds.map(() => 0),
        N = lens.reduce((a, b) => a * b);

    for (let n = 0; n < N; n++) {
      let tier = template;
      for (let i = 0; i < propsIds.length; i++) {
        tier = tier.replace(reProp(propsIds[i]), idMap[propsIds[i]][index[i]]);
      }
      tiers.push(tier);
      index = index.map((x, i, arr) => {
        if (i > 0) {
          return arr[i - 1] === 0 ? (x + 1) % lens[i] : x;
        } else {
          return (x + 1) % lens[i];
        }
      });
    }
    tiers = tiers.sort();
    return tiers;
  }
  getTiersFromListOfTemplates(listOfTemplates) {
    var tiers = [], self = this;
    listOfTemplates.forEach(template => {
      tiers = tiers.concat(self.getTiersFromTemplate(template));
    });
    return tiers;
  }
}
