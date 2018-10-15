import ko from 'knockout';

export class treeNode {
  constructor(parentNode=null) {
    this.parentNode = parentNode;
    this.childNodes = ko.observableArray([]);
    this.relationsToParentNode = ko.observableArray([]);

    if (parentNode !== null) {
      this.addRelation();
    }

    this.depth = ko.observable(parentNode && parentNode.depth() + 1 || 0);
    this.level = ko.observable(0);
    this.serialNumber = ko.observable(0);

    this.svgSlug = null;
    this.svgRelationLine = null;
  }
  addChild() {
    var child = new treeNode(this);
    this.childNodes.push(child);
  }
  addRelation() {
    this.relationsToParentNode.push(new nodesRelation(this.parentNode, this));
  }
  seppuku() {
    for (let childNode of this.childNodes()) {
      childNode.seppuku();
    }
    this.relationsToParentNode.removeAll();
    this.childNodes.removeAll();
    this.parentNode.childNodes.remove(this);
  }
  redraw() {
    if (this.svgSlug) {
      this.svgSlug.position();
    }
    for (let childNode of this.childNodes()) {
      childNode.redraw();
    }
    if (this.svgRelationLine) {
      this.svgRelationLine.redrawLine();
    }
  }
}

export class nodesRelation {
  constructor(parentNode, childNode) {
    this.parentNode = parentNode;
    this.childNode = childNode;
  }
}
