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
      }
      // Сохраняем все свойства прежнего типа. Разбираемся, какой новый тип
      // и канал пользователь выбрал.
      let oldUnitTypeProperties = unitProperties(),
          newUnitTypeProperties = [];
      //    unitTypeId = unitType.id,
      //    unitTypeChannel = unitType.channel;
      //
      // По типу поисковой единицы или/и каналу вытягиваем перечень
      // свойств нового типа.
      let unitTypePropertiesData = propertiesLists[unitType.id] || defaultPropertiesList;

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
    });
    this.chosenUnitProperties = ko.computed(
      () => this.unitProperties().filter(prop => ko.unwrap(prop.banner))
    );
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
    this.parentNode.childNodes.remove(this);
  }
  clearAllProperties() {
    this.chosenUnitProperties().forEach(prop => prop.clear());
  }
}

export class NodesRelation {
  constructor(parentNode, childNode) {
    this.parentNode = parentNode;
    this.childNode = childNode;
  }
}
