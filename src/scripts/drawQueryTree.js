import $ from 'jquery';
import ResizeSensor from 'css-element-queries/src/ResizeSensor';

const circRadius = 15,
      circTopOffset = 13,
      circLeftOffset = 83,
      color = '#aaa';

export class Slug {
  constructor(draw, element, text) {
    let svgCircle = draw.circle(circRadius * 2)
      .attr({ fill: 'none', stroke: color, 'stroke-width': 1 })
      .cx(circRadius).cy(circRadius);
    let svgText = draw.text(String(text))
      .attr({ fill: color }).cx(circRadius).cy(circRadius);

    this.draw = draw;
    this.element = $(element);
    this.svgText = svgText;
    this.svg = draw.group().add(svgCircle).add(svgText);

    // Настроить местоположение
    this.position();

    // FIXME: Если убрать следующий блок, то элементы, соответствующие
    // отношениям между единицами запроса, почему-то отображаются вплотную
    // к родительским единицам запроса, без отстпа.
    new ResizeSensor(this.element, () => {
      this.position();
    });
  }
  position() {
    this.svg.x(circLeftOffset).y(this.element.offset().top + circTopOffset);
  }
  changeText(text) {
    this.svgText = this.svgText.text(String(text));
  }
}

export class RelationLine {
  constructor(draw, element, relations) {
    this.draw = draw;
    this.element = $(element);

    if (relations().length > 0) {
      let relation = relations()[0],
          n1 = relation.parentNode,
          n2 = relation.childNode;

      this.n1 = n1;
      this.n2 = n2;
      this.svg = draw.path().fill('none').stroke({ color: '#aaa', width: 1 });

      new ResizeSensor(this.element, this.redrawLine.bind(this));
    }
  }

  static calculatePath(slug1, slug2, level) {
    let s1 = slug1.svg,
        s2 = slug2.svg,
        r = circRadius,
        b1 = r * 0.5,
        b2 = r * 4,
        s = r * 1,
        l = r * 1.3,
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
                ${s1.cx()-s-l*level} ${s1.cy()+r+b1+d-c}
                ${s1.cx()-s-l*level} ${s1.cy()+r+b1+d}
              V ${s2.cy()-r-b2-d}
              C ${s2.cx()-s-l*level} ${s2.cy()-r-b2-d+c}
                ${s2.cx()} ${s2.cy()-r-b2-c}
                ${s2.cx()} ${s2.cy()-r-b2}
              V ${s2.cy()-r}`;
    }
    return path;
  }

  redrawLine() {
    let slug1 = this.n1 && this.n1.svgSlug,
        slug2 = this.n2 && this.n2.svgSlug,
        level = this.n2 && this.n2.level;
    if (slug1 && slug2 && level) {
      let path = RelationLine.calculatePath(slug1, slug2, level());
      this.svg.plot(path);
    }
  }
}
