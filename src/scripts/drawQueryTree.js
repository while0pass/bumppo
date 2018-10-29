import jQuery from 'jquery';
import ko from 'knockout';

const circRadius = 15,
      circTopOffset = 13,
      circLeftOffset = 83,
      color = '#aaa';

export class Slug {
  constructor(draw, element, treeNode) {
    let svgCircle = this.drawCircle(draw);
    let svgText = this.drawText(draw, treeNode.serialNumber());

    this.draw = draw;
    this.element = element;
    this.treeNode = treeNode;
    this.svgText = svgText;
    this.svg = draw.group().add(svgCircle).add(svgText);

    this.fineTune();
  }
  drawCircle(draw) {
    let circle = draw.circle(circRadius * 2)
      .attr({ fill: 'none', stroke: color, 'stroke-width': 1 })
      .cx(circRadius).cy(circRadius);
    return circle;
  }
  drawText(draw, text) {
    let t = draw.text(String(text)).attr({ fill: color })
      .cx(circRadius).cy(circRadius);
    return t;
  }
  fineTune() {
    this.position();
    this.treeNode.serialNumber.subscribe((value) => {
      this.changeText(value);
    });
    ko.utils.domNodeDisposal.addDisposeCallback(this.element, () => {
      this.dispose();
    });
    this.treeNode.svgSlug = this;
  }
  position() {
    let x = circLeftOffset,
        y1 = jQuery(this.element).offset().top,
        y2 = jQuery(this.element).parent().offset().top,
        y = Math.abs(y1 - y2) + circTopOffset;
    this.svg.x(x).y(y);
  }
  changeText(text) {
    this.svgText = this.svgText.text(String(text));
  }
  dispose(){
    this.svg.remove();
    this.svgText.remove();
  }
}

export class RelationLine {
  constructor(draw, element, treeNode) {
    this.draw = draw;
    this.element = element;
    this.treeNode = treeNode;
    this.svg = this.drawLine(draw, treeNode);

    this.fineTune();
  }

  fineTune() {
    ko.utils.domNodeDisposal.addDisposeCallback(this.element, () => {
      this.dispose();
    });
    this.treeNode.svgRelationLine = this;
  }

  static calculatePath(slug1, slug2, level, relationsElementHeight) {
    let s1 = slug1.svg,
        s2 = slug2.svg,
        r = circRadius,
        b1 = r * 0.5,
        b2 = relationsElementHeight - r * 3,
        s = r * 1,
        m1 = r * 1.3,
        m2 = r * 0.5,
        l1 = (level < 3) ? level : 2,
        l2 = (level < 3) ? 0 : level - 2,
        c = r * 3,
        d = r * 4.5,
        path;

    if (level === 0) {
      path = `M ${s1.cx()} ${s1.cy()+r}
              L ${s2.cx()} ${s2.cy()-r}`;
    } else {
      path = `M ${s1.cx()} ${s1.cy()+r}
              V ${s1.cy()+r+b1}
              C ${s1.cx()} ${s1.cy()+r+b1+c}
                ${s1.cx()-s-m1*l1-m2*l2} ${s1.cy()+r+b1+d-c}
                ${s1.cx()-s-m1*l1-m2*l2} ${s1.cy()+r+b1+d}
              V ${s2.cy()-r-b2-d}
              C ${s2.cx()-s-m1*l1-m2*l2} ${s2.cy()-r-b2-d+c}
                ${s2.cx()} ${s2.cy()-r-b2-c}
                ${s2.cx()} ${s2.cy()-r-b2}
              V ${s2.cy()-r}`;
    }
    return path;
  }
  drawLine(draw, treeNode) {
    let path = '';
    if (treeNode.parentNode) {
      let parentSlug = treeNode.parentNode.svgSlug.svg;
      path = `M ${parentSlug.cx()} ${parentSlug.cy()+circRadius}
              L ${parentSlug.cx()} ${parentSlug.cy()+circRadius}`;
    }
    return draw.path(path).fill('none').stroke({ color: '#aaa', width: 1 });
  }
  redrawLine() {
    let slug1 = this.treeNode.parentNode && this.treeNode.parentNode.svgSlug,
        slug2 = this.treeNode.svgSlug,
        level = this.treeNode.level,
        rh = jQuery(this.element).height();
    if (slug1 && slug2 && level) {
      let path = RelationLine.calculatePath(slug1, slug2, level(), rh);
      this.svg.plot(path);
    }
  }

  dispose(){
    this.svg.remove();
  }
}
