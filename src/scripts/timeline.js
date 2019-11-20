import ko from 'knockout';

const timelineElementIds = {
  timeline: 'bmpp-timeline',
  canvas: 'bmpp-timelineCanvas',
  ticks1: 'bmpp-timelineTicks1',
  ticks2: 'bmpp-timelineTicks2',
  cursor: {
    cursor: 'bmpp-cursor',
    canvas: 'bmpp-cursorSVG',
    window: 'bmpp-cursorAndSelection',
    selection: 'bmpp-selection',
  },
};

const MS_IN_S = 1000,
      S_IN_MIN = 60,
      MIN_IN_H = 60,
      H_IN_D = 24;

const MS = 1,
      MS2 = 2,
      MS5 = 5,
      CS = 10,
      MS25 = 25,
      MS50 = 50,
      DS = 100,
      MS250 = 250,
      MS500 = 500,

      S = MS_IN_S * MS,
      S2 = 2 * S,
      S5 = 5 * S,
      DAS = 10 * S,
      S15 = 15 * S,
      S30 = 30 * S,

      MIN = S_IN_MIN * S,
      MIN2 = 2 * MIN,
      MIN5 = 5 * MIN,
      DAMIN = 10 * MIN,
      MIN15 = 15 * MIN,
      MIN30 = 30 * MIN,

      H = MIN_IN_H * MIN,
      H2 = 2 * H,
      H6 = 6 * H,
      H12 = 12 * H,

      D = H_IN_D * H;

const UNITS = [
  MS, MS2, MS5, CS, MS25, MS50, DS, MS250, MS500,
  S, S2, S5, DAS, S15, S30,
  MIN, MIN2, MIN5, DAMIN, MIN15, MIN30,
  H, H2, H6, H12, D
];

const tagEveryDivisionLine = (function () {
  let map = {};
  map[MS] = false;
  for (let i = 1; i < UNITS.length; i++) {
    map[UNITS[i]] = UNITS[i] % UNITS[i - 1] !== 0;
  }
  return map;
})();

if (!String.prototype.padStart) {
  String.prototype.padStart = function padStart(targetLength, padString) {
    if (this.length >= targetLength) return this;
    else return padString.repeat(targetLength - this.length) + this;
  };
}

function getTimeTag(timePoint, unit) {
  let sign = timePoint >= 0 ? 1 : -1,
      time = timePoint >= 0 ? timePoint : -timePoint,
      ms = Math.floor(time % MS_IN_S),
      s = Math.floor(time / S % S_IN_MIN),
      min = Math.floor(time / MIN % MIN_IN_H),
      h = Math.floor(time / H % H_IN_D),
      timeTag = sign < 0 ? '-' : '';
  if (h > 0) timeTag += String(h).padStart(2, '0') + ':';
  timeTag += String(min).padStart(2, '0') + ':';
  timeTag += String(s).padStart(2, '0');
  if (unit < S) {
    let cropNum;
    if (unit % 10 !== 0) cropNum = undefined;
    else if (unit % 10 === 0 && unit % 100 !== 0) cropNum = -1;
    else if (unit % 10 === 0 && unit % 100 === 0) cropNum = -2;
    timeTag += '.' + String(ms).padStart(3, '0').slice(0, cropNum);
  }
  return timeTag;
}

class TimePoint {
  constructor(point, timeline) {
    this.point = point;
    this.timeline = timeline;
    this.el = this.createTimeTag(point, timeline);

    //this.prv
    //this.nxt
  }
  getXPercentage(point, timeline) {
    let ls = timeline.layersStruct();
    return (point - ls.time.start) / ls.duration * 100;
  }
  createTimeTag(point, timeline) {
    let xPercentage = this.getXPercentage(point, timeline),
        widthPercentage = 5,
        timeTag = getTimeTag(point, timeline.unit()),
        el = document.createElement('div'),
        canvas = document.getElementById(timelineElementIds.canvas);
    el.className = 'bmpp-timeTag';
    el.style.width = String(widthPercentage) + '%';
    el.style.left = String(xPercentage - widthPercentage / 2) + '%';
    el.appendChild(document.createTextNode(timeTag));
    canvas.appendChild(el);
    return el;
  }
  smartDispose() {
    if (this.prv !== undefined && this.nxt !== undefined) {
      this.prv.nxt = this.nxt;
      this.nxt.prv = this.prv;
    } else if (this.prv !== undefined) {
      delete this.prv.nxt;
    } else if (this.nxt !== undefined) {
      delete this.nxt.prv;
    }
    delete this.prv;
    delete this.nxt;

    this.el.remove();
    delete this.el;
    delete this.point;
    delete this.timeline;
  }
}

class TimeLine {
  constructor(layersStruct) {
    this.layersStruct = ko.computed(() => layersStruct());
    // Вторая часть инициализации afterInitDom будет произведена из шаблона
    // при появлении нужных DOM-элементов.
  }
  afterInitDom() {
    this.canvasWidth = ko.observable(0);
    this.windowWidth = ko.observable(0);
    this.unit = this.getUnit();
    this.dUnit = this.getDUnit();
    this.commitPoints = ko.observable(0);
    [ this.firstPoint, this.lastPoint ] = this.recreatePoints();
    this.selectionEdges = ko.observable([null, null]);

    this.tune();
    this.constructor.prototype.afterInitDom = () => {};  // Для контроля
    // идемпотентности операции. Повторные попытки инициализации не будут
    // ничего менять.
  }
  getWindowStart() {
    let w = document.getElementById(timelineElementIds.timeline),
        layersStruct = this.layersStruct(),
        start = layersStruct.time.start,
        duration = layersStruct.duration;
    return start + duration * w.scrollLeft / this.canvasWidth();
  }
  getWindowEnd() {
    let w = document.getElementById(timelineElementIds.timeline),
        layersStruct = this.layersStruct(),
        start = layersStruct.time.start,
        duration = layersStruct.duration;
    return start + duration
      * (w.scrollLeft + this.windowWidth()) / this.canvasWidth();
  }
  getUnitStartShift() {
    let windowStart = this.getWindowStart(),
        unit = this.unit();
    return windowStart + unit - windowStart % unit;
  }
  getUnitEndShift() {
    let windowEnd = this.getWindowEnd();
    return windowEnd - windowEnd % this.unit();
  }
  removePointsFrom(firstPoint) {
    let a = firstPoint;
    while (a) {
      let b = a.nxt;
      a.smartDispose();
      a = b;
    }
  }
  recreatePoints() {
    const oldFirstPoint = this.firstPoint;

    const unit = this.unit(),
          unitStart = this.getUnitStartShift(),
          unitEnd = this.getUnitEndShift();

    let a = new TimePoint(unitStart, this),
        firstPoint = a, lastPoint;

    while (unitEnd - a.point > 1e-1) {
      let b = new TimePoint(a.point + unit, this);
      a.nxt = b;
      b.prv = a;
      a = b;
    }
    lastPoint = a;
    [ this.firstPoint, this.lastPoint ] = [firstPoint, lastPoint];

    this.removePointsFrom(oldFirstPoint);

    return [firstPoint, lastPoint];
  }
  recalcFirstPoint() {
    const unitStart = this.getUnitStartShift();
    let a = this.firstPoint;
    while (a.nxt !== undefined) {
      let b = a.nxt;
      if (Math.abs(a.point - unitStart) < 1e-1) {
        break;
      } else if (a.point < unitStart) {
        a.smartDispose();
        a = b;
      } else if (a.point > unitStart) {
        let c = new TimePoint(unitStart, this);
        c.nxt = a;
        a.prv = c;
        a = c;
        break;
      }
    }
    this.firstPoint = a;
  }
  recalcLastPoint() {
    const unitEnd = this.getUnitEndShift();
    let a = this.lastPoint;
    while (a.prv !== undefined) {
      let b = a.prv;
      if (Math.abs(a.point - unitEnd) < 1e-1) {
        break;
      } else if (a.point > unitEnd) {
        a.smartDispose();
        a = b;
      } else if (a.point < unitEnd) {
        let c = new TimePoint(unitEnd, this);
        c.prv = a;
        a.nxt = c;
        a = c;
        break;
      }
    }
    this.lastPoint = a;
  }
  recalcMidPoints() {
    const unit = this.unit();
    let a = this.firstPoint;

    debugger; // eslint-disable-line

    while (a.nxt !== undefined) {
      let b = a.nxt,
          delta = b.point - a.point;
      if (Math.abs(delta - unit) < 1e-1) {
        a = b;
      } else if (delta < unit) {
        b.smartDispose();
      } else if (delta > unit) {
        let c = new TimePoint(a.point + unit, this);
        a.nxt = c;
        c.nxt = b;
        b.prv = c;
        c.prv = a;
        a = c;
      }
    }
  }
  recalcPoints() {
    this.recreatePoints();
    /*
    this.recalcFirstPoint();
    this.recalcLastPoint();
    this.recalcMidPoints();
    */
  }
  getUnit() {
    return ko.computed(function () {
      const layersStruct = this.layersStruct(),
            charPxWidth = 5,
            padPxWidth = charPxWidth * 4,
            end = layersStruct.time.end,
            canvasDuration = layersStruct.duration,
            canvasPxWidth = this.canvasWidth();
      for (let i = 0; i < UNITS.length; i++) {
        let unitDuration = UNITS[i],
            tagPxWidth = getTimeTag(end, unitDuration).length * charPxWidth,
            referencePxWidth = tagPxWidth + padPxWidth,
            unitPxWidth = canvasPxWidth * unitDuration / canvasDuration;
        if (referencePxWidth < unitPxWidth) return unitDuration;
      }
      return UNITS.slice(-1)[0];
    }, this);
  }
  getDUnit() {
    return ko.computed(function () {
      return this.unit() / 10;
    }, this);
  }
  recalcTicks() {
    let layersStruct = this.layersStruct(),
        minorTicks = document.getElementById(timelineElementIds.ticks1),
        majorTicks = document.getElementById(timelineElementIds.ticks2),
        canvasWidth = this.canvasWidth(),

        unit = this.unit(),
        dUnit = this.dUnit(),
        everyDivLine = tagEveryDivisionLine[unit],
        refMinorUnit = everyDivLine ? dUnit * 2 : dUnit,
        refMajorUnit = refMinorUnit * 5,

        start = layersStruct.time.start,
        duration = layersStruct.duration,

        unitShift = (start % refMajorUnit - refMajorUnit) / duration,
        unitShiftString = String(unitShift * canvasWidth) + 'px',
        minorDivUnitPx = refMinorUnit / duration * canvasWidth,
        majorDivUnitPx = minorDivUnitPx * 5;

    minorTicks.style.strokeDasharray = `1px ${ minorDivUnitPx - 1 }px`;
    majorTicks.style.strokeDasharray = `1px ${ majorDivUnitPx - 1 }px`;
    minorTicks.style.strokeDashoffset = unitShiftString;
    majorTicks.style.strokeDashoffset = unitShiftString;
  }
  tune() {
    // Перерисовываем шкалу и метки при масштабировании или прокрутке
    this.commitPoints.extend({ rateLimit: 50 }).subscribe(function () {
      this.recalcTicks();
      this.recalcPoints();
    }, this);

    // Перерисовываем выделение
    ko.computed(function () {
      let [start, end] = this.selectionEdges(),
          element = document
            .getElementById(timelineElementIds.cursor.selection);
      if (start === null && end !== null) start = end;
      if (start !== null && end === null) end = start;
      if (start === null && end === null) {
        element.setAttribute('x', -100);
        element.setAttribute('width', 0);
        return;
      }
      if (start > end) [start, end] = [end, start];
      let layersStruct = this.layersStruct(),
          xStart = layersStruct.time.start,
          xDuration = layersStruct.duration,
          posStart = (start - xStart) / xDuration * 100,
          posEnd = (end - xStart) / xDuration * 100;
      element.setAttribute('x', String(posStart) + '%');
      element.setAttribute('width', String(posEnd - posStart) + '%');
    }, this);

  }
}

export { TimeLine, getTimeTag, timelineElementIds, MS };
