import ko from 'knockout';

export class treeNode {
  constructor(parentNode=null) {
    this.parentNode = parentNode;
    this.childNodes = ko.observableArray([]);
    this.relationsToParentNode = ko.observableArray([]);

    this.depth = ko.observable(parentNode && (parentNode.depth() + 1) || 0);
    this.level = ko.observable(0);
    this.serialNumber = ko.observable(0);

    if (parentNode !== null) {
      this.addRelation();
    }
  }
  addChild() {
    var child = new treeNode(this);
    this.childNodes.push(child);
  }
  addRelation() {
    this.relationsToParentNode.push(new nodesRelation(this.parentNode, this));
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
}

export class nodesRelation {
  constructor(parentNode, childNode) {
    this.parentNode = parentNode;
    this.childNode = childNode;
  }
}
