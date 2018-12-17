import ko from 'knockout';
import { defaultPropertiesList, propertiesLists, SearchUnitProperty } from './searchUnitProperties.js';

export class TreeNode {
  constructor(parentNode=null, negative=false) {
    this.parentNode = parentNode;
    this.childNodes = ko.observableArray([]);
    this.relationsToParentNode = ko.observableArray([]);

    this.depth = ko.observable(parentNode && (parentNode.depth() + 1) || 0);
    this.level = ko.observable(0);
    this.serialNumber = ko.observable(0);
    this.negative = ko.observable(negative);
    this.unitType = ko.observable(null);
    this.unitProperties = ko.observableArray([]);
    this.isEditStateForUnitType = ko.observable(true);

    this.tuneRelations();
    this.tuneUnitProperties();
  }
  tuneRelations() {
    if (this.parentNode !== null) {
      this.addRelation();
    }
  }
  tuneUnitProperties() {
    let unitProperties = this.unitProperties;
    this.unitType.subscribe(unitType => {
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
            oldProperty.changeUnitType(unitType);
            newUnitTypeProperties.push(oldProperty);
          } else {
            let newProperty = SearchUnitProperty
              .createByType(newPropertyData, unitType);
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
  addChild(negative=false) {
    var child = new TreeNode(this, negative);
    this.childNodes.push(child);
  }
  addRelation() {
    this.relationsToParentNode.push(new NodesRelation(this.parentNode, this));
  }
  removeRelation(relation) {
    this.relationsToParentNode.remove(relation);
  }
  seppuku() {
    for (let childNode of this.childNodes()) {
      childNode.seppuku();
    }
    this.relationsToParentNode.removeAll();
    this.childNodes.removeAll();
    this.unitType(null);
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
}

export class NodesRelation {
  constructor(parentNode, childNode) {
    this.parentNode = parentNode;
    this.childNode = childNode;

    this.from = ko.observable(0);
    this.to = ko.observable(0);

    this.units = ko.observable('ms');
    this.parentNodeRefPoint = ko.observable('end');
    this.childNodeRefPoint = ko.observable('begin');
  }
}
