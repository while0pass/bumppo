import ko from 'knockout';
import { defaultPropertiesList, propertiesLists,
  SearchUnitProperty } from './searchUnitProperties.js';
import { NodesRelationsFormula } from './searchUnitRelations.js';
import linearizeTree from './linearizeTree.js';
import log from './log.js';

export class TreeNode {
  constructor(parentNode=null) {
    this.id = window.performance.now();
    this.parentNode = parentNode;
    this.childNodes = ko.observableArray([]);
    this.proxyChildNodes = [];

    this.depth = ko.observable(parentNode && (parentNode.depth() + 1) || 0);
    this.level = ko.observable(0);
    this.serialNumber = ko.observable(0);
    this.unitType = ko.observable(null);  // см. searchUnits
    this.unitProperties = ko.observableArray([]);
    this.isEditStateForUnitType = ko.observable(true);
    this.linear6n = parentNode ? parentNode.linear6n : this.getLinear6n();
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
    for (let proxyChildNode of this.proxyChildNodes) {
      proxyChildNode.seppuku();
    }

    for (let childNode of this.childNodes()) {
      childNode.seppuku();
    }
    this.childNodes.removeAll();

    if (this.parentNode) {
      this.parentNode.childNodes.remove(this);
    }

    this.relationsFormula.seppuku();
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
  getLinear6n() {
    return ko.computed(function () {
      let tree = linearizeTree(this);
      for (let node of tree) {
        node.childNodes && node.childNodes();
      }
      return tree;
    }, this);
  }
  getReferenceOptions() {
    return ko.computed(() => {
      let node1 = this,
          noCoincide = (x, y) => x != y,
          noProxy = x => !x.isProxy,
          isNotChild = (x, y) => !y.childNodes || y.childNodes.peek()
            .every(child => x !== (child.isProxy ? child.node() : child)),
          isNotProxyChild = (x, y) => !y.proxyChildNodes || y.proxyChildNodes
            .every(proxyChild => x !== proxyChild.parentNode),
          isNotParent = (x, y) => !y.parentNode || x !== y.parentNode,
          noAdjacentNodes = node2 =>
            noCoincide(node1, node2)
            && noProxy(node2)
            && isNotParent(node1, node2)
            && isNotChild(node1, node2)
            && isNotProxyChild(node1, node2),
          refOpts = this.linear6n().filter(noAdjacentNodes);

      node1.serialNumber() && log('Node', node1.serialNumber(), '-->',
        refOpts.map(x => x.serialNumber().toString()).join(', '));

      return refOpts;
    }, this).extend({ rateLimit: 500 });
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
    proxiedNode.subscribe(this.nodeDisposal, this, 'beforeChange');
    proxiedNode.subscribe(this.nodeAdd, this, 'change');
    proxiedNode(node);
    return proxiedNode;
  }
  nodeDisposal(node) {
    if (node) {
      let ix = node.proxyChildNodes.indexOf(this);
      if (ix > -1) {
        node.proxyChildNodes.splice(ix, 1);
      }
    }
  }
  nodeAdd(node) {
    if (node) {
      let ix = node.proxyChildNodes.indexOf(this);
      if (ix === -1) {
        node.proxyChildNodes.push(this);
      }
    }
  }
  dispose() {
    let node = this.node();
    this.nodeDisposal(node);
  }
  seppuku() {
    this.dispose();
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
