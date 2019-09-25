import log from './log.js';

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

function makeTimeline(svgDraw, layersStruct) {
  const { start, end } = layersStruct.time,
        duration = end - start,
        width = document.getElementById('bmpp-layersCanvas').clientWidth,
        referenceWidth = 300,
        durationPerReferenceWidth = duration * referenceWidth / width;

  log('whole time:', start, end, duration);

  const units = [MS, CS, DS, S, DAS, MIN, DAMIN, H, DAH, D];

  const unitScale = (function () {
    for (let i = 0; i < units.length - 1; i++) {
      if (durationPerReferenceWidth < units[i + 1]) { return units[i]; }
    }
  })();

  const dUnitScale = unitScale / 10;

  log('scale:', unitScale, dUnitScale);

  const dUnitStartShift = -start % unitScale,
        ticksN = (Math.floor(duration / unitScale) + 2) * 10 + 1;

  log('shift in dUnits:', dUnitStartShift);
  log('N ticks:', ticksN);

  const tickStroke = { width: 1, color: '#aaa' },
        timePointOpts = {
          'fill': '#aaa',
          'font-family': 'PT Sans',
          'font-size': '0.7em',
          'text-anchor': 'middle',
        };

  for (let i = 0; i < ticksN; i++) {
    let isFullUnit = i % 10 === 0,
        isHalfUnit = i % 5 === 0 && !isFullUnit,
        tickHeight = isFullUnit ? 10 : isHalfUnit ? 15 : 7,
        timeShift = dUnitStartShift + i * dUnitScale,
        x = `${ timeShift / duration * 100 }%`;
    svgDraw.line(x, 0, x, tickHeight).stroke(tickStroke);
    if (isFullUnit) {
      let timePoint = start + timeShift,
          timeTag = getTimeTag(timePoint, unitScale);
      svgDraw.text(timeTag).attr(timePointOpts).attr({ x: x, y: 20 });
    }
  }
}

export { makeTimeline, getTimeTag };
