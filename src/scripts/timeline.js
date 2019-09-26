import log from './log.js';
import ko from 'knockout';

const MS_IN_S = 1000,
      S_IN_MIN = 60,
      MIN_IN_H = 60,
      H_IN_D = 24;

const MS = 1,
      CS = 10 * MS,
      DS = 100 * MS,
      S = MS_IN_S * MS,
      DAS = 10 * S,
      MIN = S_IN_MIN * S,
      DAMIN = 10 * MIN,
      H = MIN_IN_H * MIN,
      DAH = 10 * H,
      D = H_IN_D * H;

const UNITS = [MS, CS, DS, S, DAS, MIN, DAMIN, H, DAH, D];

const tickStroke = { width: 1, color: '#aaa' },
      timeTagOpts = {
        'fill': '#aaa',
        'font-family': 'PT Sans',
        'font-size': '0.7em',
        'text-anchor': 'middle',
      };

if (!String.prototype.padStart) {
  String.prototype.padStart = function padStart(targetLength, padString) {
    if (this.length >= targetLength) return this;
    else return padString.repeat(targetLength - this.length) + this;
  };
}

function getTimeTag(timePoint, unitScale) {
  let sign = timePoint >= 0 ? 1 : -1,
      time = timePoint >= 0 ? timePoint : -timePoint,
      ms = time % MS_IN_S,
      s = Math.floor(time / S % S_IN_MIN),
      min = Math.floor(time / MIN % MIN_IN_H),
      h = Math.floor(time / H % H_IN_D);

  h = h > 0 ? String(h).padStart(2, '0') : '';
  min = String(min).padStart(2, '0');
  s = String(s).padStart(2, '0');
  ms = String(ms).padStart(3, '0');

  let timeTag = sign < 0 ? '-' : '';
  if (h) timeTag += h + ':';
  timeTag += min + ':';
  timeTag += s;
  if (unitScale < S) timeTag += '.' + ms;
  return timeTag;
}

class TimePoint {
  constructor(point, timeline) {
    this.point = point;
    this.timeline = timeline;
    this.svg = timeline.svgDraw.line(0, 0, 0, 0).stroke(tickStroke);

    //this.prv
    //this.nxt

    this.tune();
  }
  getRedrawOpts() {
    const unitScale = this.timeline.unitScale(),
          isFullUnit = this.point % unitScale === 0,
          isHalfUnit = !isFullUnit && this.point % (unitScale / 2) === 0,
          ls = this.timeline.layersStruct,
          x = String((this.point - ls.time.start) / ls.duration * 100) + '%',
          y1 = 0,
          y2 = isFullUnit ? 10 : isHalfUnit ? 15 : 7;
    return [[x, y1, x, y2], isFullUnit];
  }
  redraw(coords, showTag) {
    this.svg.plot(...coords);
    if (showTag && !this.svgText) {

      let timeTag = getTimeTag(this.point, this.timeline.unitScale());
      this.svgText = this.timeline.svgDraw.text(timeTag)
        .attr(timeTagOpts).attr({ x: coords[0], y: 20 });

    } else if (showTag && this.svgText) {

      let timeTag = getTimeTag(this.point, this.timeline.unitScale());
      this.svgText.text(timeTag);

    } else if (!showTag && this.svgText) {

      this.svgText.remove();
      delete this.svgText;

    }
  }
  smartDispose() {
    if (this.prv !== undefined && this.nxt !== undefined) {
      this.prv.nxt = this.nxt;
      this.nxt.prv = this.prv;
    }
    delete this.prv;
    delete this.nxt;
    this.svg.remove();
  }
  tune() {
    ko.computed(function () {
      let [coords, showTag] = this.getRedrawOpts();
      this.redraw(coords, showTag);
    }, this);
  }
}

class TimeLine {
  constructor(svgDraw, layersStruct) {
    this.svgDraw = svgDraw;
    this.layersStruct = layersStruct;
    this.canvas = document.getElementById('bmpp-layersCanvas');

    this.canvasWidth = ko.observable(this.canvas.clientWidth);
    this.unitScale = this.getUnitScale();
    this.dUnitScale = this.getDUnitScale();
    this.dUnitStart = this.getStartShift();
    this.dUnitEnd = this.getEndShift();

    this.edgePoints = this.getPoints();

    this.tune();
  }
  getStartShift() {
    return ko.computed(function () {
      let start = this.layersStruct.time.start,
          dUnitScale = this.dUnitScale();
      return start + dUnitScale - start % dUnitScale;
    }, this);
  }
  getEndShift() {
    return ko.computed(function () {
      let end = this.layersStruct.time.end;
      return end - end % this.dUnitScale();
    }, this);
  }
  getPoints() {
    return ko.computed(function () {
      const dUnitScale = this.dUnitScale(),
            dUnitStart = this.dUnitStart.peek(),
            dUnitEnd = this.dUnitEnd.peek();
      if (!this.edgePoints) { // Если шкала ещё не создана
        let a = new TimePoint(dUnitStart, this),
            firstPoint = a;
        while (dUnitEnd - a.point > 1e-1) {
          let b = new TimePoint(a.point + dUnitScale, this);
          a.nxt = b;
          b.prv = a;
          a = b;
        }
        return [firstPoint, a];
      } else { // Если шкала уже имеется
        // Наcтроить начальный видимый штрих
        let [firstPoint, lastPoint] = this.edgePoints.peek();
        let a = firstPoint;
        while (a.nxt !== undefined) {
          let b = a.nxt;
          if (Math.abs(a.point - dUnitStart) < 1e-1) {
            break;
          } else if (a.point < dUnitStart) {
            a.smartDispose();
            a = b;
          } else if (a.point > dUnitStart) {
            let c = new TimePoint(dUnitStart, this);
            c.nxt = a;
            a.prv = c;
            a = c;
            break;
          }
          log(2);
        }
        firstPoint = a;
        // Настроить конечный видимый штрих
        a = lastPoint;
        while (a.prv !== undefined) {
          let b = a.prv;
          if (Math.abs(a.point - dUnitEnd) < 1e-1) {
            break;
          } else if (a.point > dUnitEnd) {
            a.smartDispose();
            a = b;
          } else if (a.point < dUnitEnd) {
            let c = new TimePoint(dUnitEnd, this);
            c.prv = a;
            a.nxt = c;
            a = c;
            break;
          }
          log(3);
        }
        lastPoint = a;
        // Настроить все промежуточные штрихи
        a = firstPoint;
        while (a.nxt !== undefined) {
          let b = a.nxt,
              delta = b.point - a.point;
          if (Math.abs(delta - dUnitScale) < 1e-1) {
            a = b;
          } else if (delta < dUnitScale) {
            b.smartDispose();
          } else if (delta > dUnitScale) {
            let c = new TimePoint(a.point + dUnitScale, this);
            a.nxt = c;
            c.nxt = b;
            b.prv = c;
            c.prv = a;
            a = c;
          }
          log(4);
        }
        return [firstPoint, lastPoint];
      }
    }, this);
  }
  getUnitScale() {
    return ko.computed(function () {
      const referenceWidth = 300,
            durationPerReferenceWidth = this.layersStruct.duration
              * referenceWidth / this.canvasWidth();
      for (let i = 0; i < UNITS.length - 1; i++) {
        if (durationPerReferenceWidth < UNITS[i + 1]) {
          return UNITS[i];
        }
      }
      return UNITS.slice(-1)[0];
    }, this);
  }
  getDUnitScale() {
    return ko.computed(function () {
      return this.unitScale() / 10;
    }, this);
  }
  tune() {
    // Наблюдаем за изменениями ширины полотна для слоев
    let canvasWidth = this.canvasWidth,
        callback = entries => {
          const canvas = entries[0],
                box = canvas.contentBoxSize || canvas.contentRect;
          canvasWidth(box.width);
        },
        ro = new ResizeObserver(callback);
    ro.observe(this.canvas);
  }
}

export { TimeLine, getTimeTag };
