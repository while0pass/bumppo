import ko from 'knockout';
import { defaultPropertiesList, propertiesLists,
  SearchUnitProperty, p_participants } from './searchUnitProperties.js';
import { NodesRelationsFormula } from './searchUnitRelations.js';
import { tierMapForPrimaryResults, resolveTierTemplate } from './layers.js';
import linearizeTree from './linearizeTree.js';
import log from './log.js';

export class TreeNode {
  constructor(parentNode=null) {
    this.id = window.performance.now();
    this.parentNode = parentNode;
    this.childNodes = ko.observableArray([]);
    this.proxyChildNodes = ko.observableArray([]);

    this.depth = ko.observable(parentNode && (parentNode.depth() + 1) || 0);
    this.level = ko.observable(0);
    this.serialNumber = ko.observable(0);
    this.unitType = ko.observable(null);  // см. searchUnits
    this.unitProperties = ko.observableArray([]);
    this.isEditStateForUnitType = ko.observable(true);
    this.linear6n = parentNode ? parentNode.linear6n : this.getLinear6n();
    this.refOrigins = parentNode ? parentNode.refOrigins : this.getRefOrigins();
    this.refOpts = this.getReferenceOptions();

    this.tuneUnitProperties();
    this.relationsFormula = this.getRelationsFormula();
  }
  getRelationsFormula() {
    if (this.parentNode !== null) {
      return new NodesRelationsFormula(this.parentNode, this);
    }
    return null;
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
  addChildProxy() {
    var refOpts = this.refOpts(),
        proxyFor = refOpts.length === 1 ? refOpts[0] : null,
        child = new TreeNodeProxy(this, proxyFor);
    this.childNodes.push(child);
  }
  resetRelationsFormula() {
    this.relationsFormula.resetToDefault();
  }
  areRelationsChanged() {
    let rf = this.relationsFormula,
        before = rf.$oldRelationsSummary || '',
        after = rf.chosenRelations()
          .map(rel => ko.unwrap(rel.banner)).join('');
    this.$oldRelationsSummary = after;
    return after !== before;
  }
  seppuku() {
    for (let proxyChildNode of this.proxyChildNodes().slice()) {
      proxyChildNode.seppuku();
    }

    for (let childNode of this.childNodes().slice()) {
      childNode.seppuku();
    }

    if (this.parentNode) {
      this.parentNode.childNodes.remove(this);
    }

    this.relationsFormula && this.relationsFormula.seppuku();
    this.unitType(null);
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
    return resolveTierTemplate(template, this.unitProperties).tierStrings;
  }
  getTiersFromListOfTemplates(listOfTemplates) {
    var tiers = [], self = this;
    listOfTemplates.forEach(template => {
      tiers = tiers.concat(self.getTiersFromTemplate(template));
    });
    return tiers;
  }
  getTiersForPrimaryResults() {
    let tiers = [],
        tierTemplate = this.unitType().tierTemplate;
    if (tierTemplate in tierMapForPrimaryResults) {
      const listOfTemplates = tierMapForPrimaryResults[tierTemplate];
      tiers = this.getTiersFromListOfTemplates(listOfTemplates);
    }
    return tiers;
  }
  getLinear6n() {
    return ko.computed(function () {
      let tree = linearizeTree(this);
      for (let node of tree) {
        node.childNodes && node.childNodes();
      }
      return tree;
    }, this);
  }
  getRefOrigins() {
    return ko.computed(function () {
      return this.linear6n().filter(
        x => !x.isProxy && x.proxyChildNodes().length > 0);
    }, this);
  }
  getReferenceOptions() {
    return ko.computed(() => {
      let node1 = this,
          noCoincide = (x, y) => x != y,
          isNotProxy = x => !x.isProxy,
          isNotChild = (x, y) => !y.childNodes || y.childNodes.peek()
            .every(child => x !== (child.isProxy ? child.node.peek() : child)),
          isNotProxyChild = (x, y) => !y.proxyChildNodes ||
            y.proxyChildNodes.peek()
              .every(proxyChild => x !== proxyChild.parentNode),
          isNotParent = (x, y) => !y.parentNode || x !== y.parentNode,
          noAdjacentNodes = node2 =>
            noCoincide(node1, node2)
            && isNotProxy(node2)
            && isNotParent(node1, node2)
            && isNotChild(node1, node2)
            && isNotProxyChild(node1, node2),
          refOpts = this.linear6n().filter(noAdjacentNodes);

      node1.serialNumber.peek() && log('Node', node1.serialNumber.peek(), '-->',
        refOpts.map(x => x.serialNumber.peek().toString()).join(', '));

      return refOpts;
    }, this).extend({ rateLimit: 400 });
  }
  getParticipants() {
    let x = this.unitProperties.unitPropertiesMap();
    return x[p_participants.id].value();
  }
}


export class TreeNodeProxy {
  constructor(parentNode, node=null) {
    this.parentNode = parentNode;
    this.node = this.trackNode(node);
    this.depth = ko.observable(parentNode && (parentNode.depth() + 1) || 0);
    this.level = ko.observable(0);
    this.relationsFormula = new NodesRelationsFormula(parentNode, this);
  }
  trackNode(node) {
    let proxiedNode = ko.observable();
    proxiedNode.subscribe(this.nodeUnlink, this, 'beforeChange');
    proxiedNode.subscribe(this.nodeLink, this, 'change');
    proxiedNode(node);
    return proxiedNode;
  }
  nodeUnlink(node) {
    node && node.proxyChildNodes.remove(this);
  }
  nodeLink(node) {
    if (node) {
      let ix = node.proxyChildNodes.indexOf(this);
      if (ix === -1) {
        node.proxyChildNodes.push(this);
      }
    }
  }
  seppuku() {
    this.nodeUnlink(this.node());
    this.parentNode.childNodes.remove(this);
    this.relationsFormula.seppuku();
  }
}

TreeNode.prototype.isProxy = false;
TreeNodeProxy.prototype.isProxy = true;

// Проксирование свойств и методов TreeNode в TreeNodeProxy
const PROXIED_PROPS = [
  'areRelationsChanged',
  'chosenUnitProperties',
  'getParticipants',
  'serialNumber',
  'unitType',
  'unitProperties',
];

for (let prop of PROXIED_PROPS) {
  Object.defineProperty(TreeNodeProxy.prototype, prop, {
    get: function () {
      let node = this.node();
      return node && node[prop] || undefined;
    }
  });
}
