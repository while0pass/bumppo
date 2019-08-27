import jQuery from 'jquery';
import ko from 'knockout';

const circRadius = 15,
      circTopOffset = 18,
      circLeftOffset = 83,
      color = '#aaa';

export class Slug {
  constructor(draw, element, treeNode) {
    let text = treeNode.serialNumber && treeNode.serialNumber() || '?',
        svgCircle = this.drawCircle(draw),
        svgText = this.drawText(draw, text);

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
    if (this.treeNode.isProxy) {
      ko.computed(function () {
        let node = this.treeNode.node(),
            text = !node ? '?' : node.serialNumber();
        this.changeText(text);
      }, this);
    } else {
      this.treeNode.serialNumber.subscribe(value => this.changeText(value));
    }
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

const AFTER_BEGIN = Symbol(1),
      AFTER_BEGIN_NOCHILD = Symbol(2),
      AFTER_END = Symbol(3),
      AFTER_END_MID = Symbol(4),
      BEFORE_BEGIN = Symbol(5),
      BEFORE_END = Symbol(6),
      BEFORE_END_MID = Symbol(7);

export class ReferenceLine {
  constructor(draw, element, treeNode) {
    this.draw = draw;
    this.element = element;
    this.treeNode = treeNode;
    this.svg = this.drawLine(draw, this.treeNode);

    this.fineTune();
  }

  fineTune() {
    ko.utils.domNodeDisposal.addDisposeCallback(this.element, () => {
      this.dispose();
    });
    this.treeNode.svgReferenceLine = this;
  }

  sortRefs() {
    this.treeNode.proxyChildNodes.sort((a, b) => {
      let A = a.svgSlug && a.svgSlug.svg && a.svgSlug.svg.cy(),
          B = b.svgSlug && b.svgSlug.svg && b.svgSlug.svg.cy();
      if (A < B) return -1;
      if (A > B) return 1;
      return 0;
    });
  }
  getPathEdge(svg, level, kind) {
    let r = circRadius,
        ax = Math.cos(Math.PI * 3/7),
        ay = Math.sin(Math.PI * 3/7),
        l1 = (level < 3) ? level : 2,
        l2 = (level < 3) ? 0 : level - 2,
        dx = 1.66*r + 1.33*r*l1 + 0.5*r*l2,
        dy1 = 1.66*r,
        dy2 = level > 0 ? 4*r : 3*r;

    if (AFTER_BEGIN === kind) {
      return `M ${svg.cx()-r*ax} ${svg.cy()+r*ay}
              L ${svg.cx()-1.3*r*ax} ${svg.cy()+1.3*r*ay}
              C ${svg.cx()-2.5*r*ax} ${svg.cy()+2.5*r*ay}
                ${svg.cx()-dx} ${svg.cy()+2*r}
                ${svg.cx()-dx} ${svg.cy()+4*r}`;

    } else if (AFTER_BEGIN_NOCHILD === kind) {
      return `M ${svg.cx()} ${svg.cy()+r}
              V ${svg.cy()+1.5*r}
              C ${svg.cx()} ${svg.cy()+5*r}
                ${svg.cx()-dx} ${svg.cy()+3*r}
                ${svg.cx()-dx} ${svg.cy()+6.5*r}`;

    } else if (AFTER_END === kind) {
      return `V ${svg.cy()+dy1}
              C ${svg.cx()-dx} ${svg.cy()+dy2}
                ${svg.cx()} ${svg.cy()+dy2}
                ${svg.cx()} ${svg.cy()+dy1}
              V ${svg.cy()+r}`;

    } else if (AFTER_END_MID === kind) {
      return `M ${svg.cx()} ${svg.cy()+r}
              C ${svg.cx()} ${svg.cy()+dy2}
                ${svg.cx()-dx-0.33*r} ${svg.cy()+dy2}
                ${svg.cx()-dx} ${svg.cy()}`;

    } else if (BEFORE_BEGIN === kind) {
      return `M ${svg.cx()-r*ax} ${svg.cy()-r*ay}
              L ${svg.cx()-1.3*r*ax} ${svg.cy()-1.3*r*ay}
              C ${svg.cx()-2.5*r*ax} ${svg.cy()-2.5*r*ay}
                ${svg.cx()-dx} ${svg.cy()-2*r}
                ${svg.cx()-dx} ${svg.cy()-4*r}`;

    } else if (BEFORE_END === kind) {
      return `V ${svg.cy()+6.5*r}
              C ${svg.cx()-dx} ${svg.cy()+3*r}
                ${svg.cx()} ${svg.cy()+5*r}
                ${svg.cx()} ${svg.cy()+dy1}
              V ${svg.cy()+r}`;

    } else if (BEFORE_END_MID === kind) {
      return `M ${svg.cx()-dx} ${svg.cy()+6.5*r}
              C ${svg.cx()-dx} ${svg.cy()+3*r}
                ${svg.cx()} ${svg.cy()+5*r}
                ${svg.cx()} ${svg.cy()+dy1}
              V ${svg.cy()+r}`;
    }
  }
  calculatePath(treeNode) {
    let s1 = treeNode.svgSlug.svg,
        level = treeNode.refOrigins().indexOf(treeNode),
        before = [],
        after = [],
        path = '';

    treeNode.proxyChildNodes()
      .filter(x => x.svgSlug)
      .map(x => x.svgSlug.svg)
      .forEach(x => {
        if (x.cy() < s1.cy()) {
          before.push(x);
        }
        if (x.cy() > s1.cy()) {
          after.push(x);
        }
      });

    if (before.length > 0) {
      let s2 = before[0],
          mids = before.slice(1);
      path += this.getPathEdge(s1, level, BEFORE_BEGIN);
      path += this.getPathEdge(s2, level, BEFORE_END);
      mids.forEach(s => {
        path += this.getPathEdge(s, level, BEFORE_END_MID);
      });
    }

    if (after.length > 0) {
      let s2 = after.slice(-1)[0],
          mids = after.slice(0, -1);
      if (treeNode.childNodes().length > 0) {
        path += this.getPathEdge(s1, level, AFTER_BEGIN);
      } else {
        path += this.getPathEdge(s1, level, AFTER_BEGIN_NOCHILD);
      }
      path += this.getPathEdge(s2, level, AFTER_END);
      mids.forEach(s => {
        path += this.getPathEdge(s, level, AFTER_END_MID);
      });
    }
    return path;
  }
  getPath() {
    let path = '',
        treeNode = this.treeNode;
    if (treeNode.proxyChildNodes().length > 0) {
      this.sortRefs();
      path = this.calculatePath(treeNode);
    }
    return path;
  }
  drawLine(draw) {
    const strokeOpts = { color: '#ccc', width: 1, dasharray: '5 4' };
    return draw.path('').fill('none').stroke(strokeOpts);
  }
  redrawLine() {
    this.svg.plot(this.getPath());
  }

  dispose(){
    this.svg.remove();
  }
}
