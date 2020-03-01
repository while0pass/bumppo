//import log from './log.js';

const layersElementIds = {
  layers: 'bmpp-layersLayers',
  canvas: 'bmpp-layersCanvas',
  names: 'bmpp-lNContainer',
};

const LAYERS_HIERARCHY = [

  { name: 'N-vLine',
    children: [
      'N-vLineType',
      'N-vHTML',
      'N-vIllocPhase',
      'N-vCombIllocPhase',
      'N-vParenth',
      'N-vInSplit',
      'N-vCitation',
      'N-vCoConstr',
      'N-vWordsCount',
      'N-vPausesCount',
      'N-vFilledCount',
      'N-vStartFilled',
      'N-vAccentsCount',
      'N-vMainAccentsCount',
      'N-vMainAccents',
      'N-vAccentsAfterMainCount',
      'N-vInterruptCount',
      'N-vLineVerbatim',
      'N-vComments',
      'N-vLineHTML',
    ]},

  { name: 'R-vLine',
    children: [
      'R-vLineType',
      'R-vHTML',
      'R-vIllocPhase',
      'R-vCombIllocPhase',
      'R-vParenth',
      'R-vInSplit',
      'R-vCitation',
      'R-vCoConstr',
      'R-vWordsCount',
      'R-vPausesCount',
      'R-vFilledCount',
      'R-vStartFilled',
      'R-vAccentsCount',
      'R-vMainAccentsCount',
      'R-vMainAccents',
      'R-vAccentsAfterMainCount',
      'R-vInterruptCount',
      'R-vLineVerbatim',
      'R-vComments',
      'R-vLineHTML',
    ]},

  { name: 'C-vLine',
    children: [
      'C-vLineType',
      'C-vHTML',
      'C-vIllocPhase',
      'C-vCombIllocPhase',
      'C-vParenth',
      'C-vInSplit',
      'C-vCitation',
      'C-vCoConstr',
      'C-vWordsCount',
      'C-vPausesCount',
      'C-vFilledCount',
      'C-vStartFilled',
      'C-vAccentsCount',
      'C-vMainAccentsCount',
      'C-vMainAccents',
      'C-vAccentsAfterMainCount',
      'C-vInterruptCount',
      'C-vLineVerbatim',
      'C-vComments',
      'C-vLineHTML',
    ]},

  { name: 'N-vCollat', children: ['N-vCollatForm'] },
  { name: 'R-vCollat', children: ['R-vCollatForm'] },
  { name: 'C-vCollat', children: ['C-vCollatForm'] },


  { name: 'N-oFixation', children: ['N-oInterlocutor', 'N-oLocus'] },
  { name: 'R-oFixation', children: ['R-oInterlocutor', 'R-oLocus'] },


  { name: 'N-mLtMovement', children: ['N-mLtMtType'] },
  { name: 'N-mRtMovement', children: ['N-mRtMtType'] },
  { name: 'N-mLtStillness', children: ['N-mLtStType'] },
  { name: 'N-mRtStillness', children: ['N-mRtStType'] },
  { name: 'N-mPosture', children: ['N-mPrPhase'] },
  { name: 'N-mPostureChange' },
  { name: 'N-mPostureAccommodator' },
  { name: 'N-mGesture',
    children: [
      'N-mGeHandedness',
      'N-mGeStucture',
      'N-mGeTags',
      'N-mGeFunction',
    ]},
  { name: 'N-mAdaptor', children: ['N-mAdType'] },
  { name: 'N-mGestureChain' },
  { name: 'N-mMovementChain' },
  { name: 'N-mComments' },


  { name: 'R-mLtMovement', children: ['R-mLtMtType'] },
  { name: 'R-mRtMovement', children: ['R-mRtMtType'] },
  { name: 'R-mLtStillness', children: ['R-mLtStType'] },
  { name: 'R-mRtStillness', children: ['R-mRtStType'] },
  { name: 'R-mPosture', children: ['R-mPrPhase'] },
  { name: 'R-mPostureChange' },
  { name: 'R-mPostureAccommodator' },
  { name: 'R-mGesture',
    children: [
      'R-mGeHandedness',
      'R-mGeStucture',
      'R-mGeTags',
      'R-mGeFunction',
    ]},
  { name: 'R-mAdaptor', children: ['R-mAdType'] },
  { name: 'R-mGestureChain' },
  { name: 'R-mMovementChain' },
  { name: 'R-mComments' },


  { name: 'C-mLtMovement', children: ['C-mLtMtType'] },
  { name: 'C-mRtMovement', children: ['C-mRtMtType'] },
  { name: 'C-mLtStillness', children: ['C-mLtStType'] },
  { name: 'C-mRtStillness', children: ['C-mRtStType'] },
  { name: 'C-mPosture', children: ['C-mPrPhase'] },
  { name: 'C-mPostureChange' },
  { name: 'C-mPostureAccommodator' },
  { name: 'C-mGesture',
    children: [
      'C-mGeHandedness',
      'C-mGeStucture',
      'C-mGeTags',
      'C-mGeFunction',
    ]},
  { name: 'C-mAdaptor', children: ['C-mAdType'] },
  { name: 'C-mGestureChain' },
  { name: 'C-mMovementChain' },
  { name: 'C-mComments' },


  { name: 'N-vPause', children: ['N-vPauseInOutEDU', 'N-vPauseHTML'] },
  { name: 'R-vPause', children: ['R-vPauseInOutEDU', 'R-vPauseHTML'] },
  { name: 'C-vPause', children: ['C-vPauseInOutEDU', 'C-vPauseHTML'] },


  { name: 'N-vSegm',
    children: [
      'N-vTempo',
      'N-vReduction',
      'N-vLength',
      'N-vInterrupt',
      'N-vEmph',
      'N-vRegister',
      'N-vStops',
      'N-vStress',
      'N-vPhon',
      'N-vNearPause',
      'N-vInOutEDU',
      'N-vOnom',
      'N-vTruncated',
      'N-vWordNum',
      'N-vWordNumReversed',
      'N-vMainAccent',
      'N-vSType',
      'N-vSForm',
      'N-vAccents',
      'N-vSegmHTML',
    ]},

  { name: 'R-vSegm',
    children: [
      'R-vTempo',
      'R-vReduction',
      'R-vLength',
      'R-vInterrupt',
      'R-vEmph',
      'R-vRegister',
      'R-vStops',
      'R-vStress',
      'R-vPhon',
      'R-vNearPause',
      'R-vInOutEDU',
      'R-vOnom',
      'R-vTruncated',
      'R-vWordNum',
      'R-vWordNumReversed',
      'R-vMainAccent',
      'R-vSType',
      'R-vSForm',
      'R-vAccents',
      'R-vSegmHTML',
    ]},

  { name: 'C-vSegm',
    children: [
      'C-vTempo',
      'C-vReduction',
      'C-vLength',
      'C-vInterrupt',
      'C-vEmph',
      'C-vRegister',
      'C-vStops',
      'C-vStress',
      'C-vPhon',
      'C-vNearPause',
      'C-vInOutEDU',
      'C-vOnom',
      'C-vTruncated',
      'C-vWordNum',
      'C-vWordNumReversed',
      'C-vMainAccent',
      'C-vSType',
      'C-vSForm',
      'C-vAccents',
      'C-vSegmHTML',
    ]},
];

const [LAYERS, LAYER_CHILDREN_MAP, LAYER_PARENT_MAP] = (function () {
  let layers = [],
      childrenMap = {},
      parentMap = {};
  LAYERS_HIERARCHY.forEach(topLayer => {
    layers.push(topLayer.name);
    if (topLayer.children) {
      childrenMap[topLayer.name] = topLayer.children;
      topLayer.children.forEach(layer => {
        layers.push(layer);
        parentMap[layer] = topLayer.name;
      });
    }
  });
  return [layers, childrenMap, parentMap];
})();

const LAYER_ORDER_MAP = (function () {
  let orderMap = {};
  LAYERS.forEach((layerName, ix) => { orderMap[layerName] = ix; });
  return orderMap;
})();

const COOKED_LAYERS = {};


class Layer {
  constructor(layersStruct, parent, layerType) {
    this.struct = layersStruct;
    this.parent = parent;
    this.type = layerType;
    this.segments = this.getAndRegisterSegments();
    this.children = this.getChildren();
  }
  getAndRegisterSegments() {
    let segments = this.struct._data[this.type];
    return segments.map(
      x => {
        let seg = new Segment(this, x);
        if (seg.time) { this.struct._timeBoundSegRegister[seg.value] = seg; }
        return seg;
      });
  }
  getChildren() {
    let children = LAYER_CHILDREN_MAP[this.type],
        availableList = this.struct._availableList;
    COOKED_LAYERS[this.type] = this;
    if (children instanceof Array) {
      return children
        .filter(layerType => availableList.indexOf(layerType) > -1)
        .map(layerType => new Layer(this.struct, this, layerType));
    }
    return [];
  }
}

class Segment {
  constructor(layer, data) {
    this.layer = layer;
    this.value = data.value;
    this.time = null;
    this.parent = null;

    this.tune(data);
  }
  tune(data) {
    this.defineParent(data.parent);
    this.defineTime(data.time);
    this.redefineOverallTime();
  }
  defineTime(time) {
    if (time) {
      this.time = time;
    } else {
      Object.defineProperty(this, 'time', {
        get: function () {
          let parent = this.parent;
          if (parent instanceof Segment) {
            Object.defineProperty(this, 'time', { value: parent.time });
            return parent.time;
          }
          return null;
        },
        configurable: true,
        enumerable: true,
      });
    }
  }
  defineParent(parentValue) {
    if (parentValue) {
      let register = this.layer.struct._timeBoundSegRegister;
      if (Object.prototype.hasOwnProperty.call(register, parentValue)) {
        this.parent = register[parentValue];
      } else {
        Object.defineProperty(this, 'parent', {
          get: function () {
            if (Object.prototype.hasOwnProperty.call(register, parentValue)) {
              let segment = register[parentValue];
              Object.defineProperty(this, 'parent', { value: segment });
              return segment;
            }
            return parentValue;
          },
          configurable: true,
          enumerable: true,
        });
      }
    }
  }
  redefineOverallTime() {
    if (this.time) {
      let overallTime = this.layer.struct.time,
          timeIsNotDefined = !Object.prototype
            .hasOwnProperty.call(overallTime, 'start');
      if (timeIsNotDefined || this.time.start < overallTime.start) {
        overallTime.start = this.time.start;
      }
      if (timeIsNotDefined || this.time.end > overallTime.end) {
        overallTime.end = this.time.end;
      }
    }
  }
  get x() {
    let t = this.layer.struct.time,
        d = t.end - t.start;
    let value = (this.time.start - t.start) / d * 100;
    return `${ value }%`;
  }
  get width() {
    let t = this.layer.struct.time,
        d = t.end - t.start,
        value = (this.time.end - this.time.start) / d * 100;
    return `${ value }%`;
  }
}

function sortFunction(a, b) {
  let A = LAYER_ORDER_MAP[a],
      B = LAYER_ORDER_MAP[b];
  if (A < B) return -1;
  if (A > B) return 1;
  return 0;
}

class LayersStruct {
  constructor(data) {
    this._data = data || {};
    this._timeBoundSegRegister = {};
    this._availableList = this.getAvailableLayersList();

    this.time = {};
    this.layers = this.getLayersFromData(this._availableList);
  }
  getAvailableLayersList() {
    let layersList = Object.getOwnPropertyNames(this._data);
    layersList = layersList.filter(layerName => LAYERS.indexOf(layerName) > -1);
    layersList.sort(sortFunction);
    return layersList;
  }
  getLayersFromData(availableList) {
    if (availableList.length === 0) this.time = { start: 0, end: 0 };
    return availableList.map(layerType => {
      if (layerType in LAYER_PARENT_MAP) {
        return COOKED_LAYERS[layerType];
      } else {
        return new Layer(this, null, layerType);
      }
    });
  }
  get duration() {
    if (!this._duration) this._duration = this.time.end - this.time.start;
    return this._duration;
  }
}

const layersDirectory = [];

export { LayersStruct, layersDirectory, layersElementIds, LAYER_PARENT_MAP };
