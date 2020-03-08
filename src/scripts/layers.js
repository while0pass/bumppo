import { getSubstitutedPropertyValues,
  ListProperty } from './searchUnitProperties.js';

const layersElementIds = {
  layers: 'bmpp-layersLayers',
  canvas: 'bmpp-layersCanvas',
  names: 'bmpp-lNContainer',
};

const tierMapForPrimaryResults = {
  '{ p_participants }-vLine': [
    '{ p_participants }-vLineHTML', // RU
    //'{ p_participants }-vLineHTMLTranslit', // EN
    //'{ p_participants }-vLineTranslate', // EN
  ],
  '{ p_participants }-vSegm': [
    '{ p_participants }-vSegmHTML', // RU
    //'{ p_participants }-vSegmHTMLTranslit', // EN
    //'{ p_participants }-vSegmGlossing', // EN
  ],
  '{ p_participants }-vPause': [ '{ p_participants }-vPauseHTML' ],
  '{ p_participants }-vCollat': [ '{ p_participants }-vCollatForm' ],
  '{ p_participants }-m{ p_mHand }Movement': [
    '{ p_participants }-m{ p_mHand }MtType'
  ],
  '{ p_participants }-m{ p_mHand }Stillness': [
    '{ p_participants }-m{ p_mHand }StType'
  ],
  '{ p_participants }-mGesture': [ '{ p_participants }-mGeStructure' ],
  '{ p_participants }-mAdaptor': [ '{ p_participants }-mAdType' ],
  '{ p_participants }-oFixation': [ '{ p_participants }-oInterlocutor' ],
};

const LAYER_TEMPLATES_HIERARCHY = [

  { channel: 'voc', tierTemplates: [

    { template: '{ p_participants }-vLine',
      children: [
        '{ p_participants }-vLineType',
        '{ p_participants }-vLineHTML', // RU
        //'{ p_participants }-vLineHTMLTranslit', // EN
        //'{ p_participants }-vLineTranslate', // EN
        '{ p_participants }-vLineVerbatim',
        '{ p_participants }-vIllocPhase',
        '{ p_participants }-vCombIllocPhase',
        '{ p_participants }-vParenth',
        '{ p_participants }-vInSplit',
        '{ p_participants }-vCitation',
        '{ p_participants }-vCoConstr',
        '{ p_participants }-vComments',
        '{ p_participants }-vWordsCount',
        '{ p_participants }-vPausesCount',
        '{ p_participants }-vFilledCount',
        '{ p_participants }-vStartFilled',
        '{ p_participants }-vAccentsCount',
        '{ p_participants }-vMainAccentsCount',
        '{ p_participants }-vMainAccents',
        '{ p_participants }-vAccentsAfterMainCount',
        '{ p_participants }-vInterruptCount',
      ]},
    { template: '{ p_participants }-vSegm',
      children: [
        '{ p_participants }-vSType',
        '{ p_participants }-vSegmHTML', // RU
        //'{ p_participants }-vSegmHTMLTranslit', // EN
        //'{ p_participants }-vSegmGlossing', // EN
        '{ p_participants }-vSForm',
        '{ p_participants }-vNearPause',
        '{ p_participants }-vInOutEDU',
        '{ p_participants }-vOnom',
        '{ p_participants }-vTruncated',
        '{ p_participants }-vPhon',
        '{ p_participants }-vAccents',
        '{ p_participants }-vMainAccent',
        '{ p_participants }-vInterrupt',
        '{ p_participants }-vTempo',
        '{ p_participants }-vReduction',
        '{ p_participants }-vLength',
        '{ p_participants }-vEmph',
        '{ p_participants }-vRegister',
        '{ p_participants }-vStops',
        '{ p_participants }-vStress',
        '{ p_participants }-vWordNum',
        '{ p_participants }-vWordNumReversed',
      ]},
    { template: '{ p_participants }-vPause',
      children: [
        '{ p_participants }-vPauseHTML',
        '{ p_participants }-vPauseInOutEDU',
      ] },
    { template: '{ p_participants }-vCollat',
      children: [
        '{ p_participants }-vCollatForm',
      ] },

  ]},

  { channel: 'ocul', tierTemplates: [

    { template: '{ p_participants }-oFixation',
      children: [
        '{ p_participants }-oInterlocutor',
        '{ p_participants }-oLocus',
      ] },

  ]},

  { channel: 'manu', tierTemplates: [

    { template: '{ p_participants }-m{ p_mHand }Movement',
      children: [
        '{ p_participants }-m{ p_mHand }MtType',
      ] },
    { template: '{ p_participants }-m{ p_mHand }Stillness',
      children: [
        '{ p_participants }-m{ p_mHand }StType',
      ] },
    { template: '{ p_participants }-mGesture',
      children: [
        '{ p_participants }-mGeHandedness',
        '{ p_participants }-mGeStucture',
        '{ p_participants }-mGeTags',
        '{ p_participants }-mGeFunction',
      ]},
    { template: '{ p_participants }-mAdaptor',
      children: [
        '{ p_participants }-mAdType',
      ] },
    { template: '{ p_participants }-mPostureChange' },
    { template: '{ p_participants }-mPostureAccommodator' },
    { template: '{ p_participants }-mPosture',
      children: [
        '{ p_participants }-mPrPhase',
      ] },
    { template: '{ p_participants }-mGestureChain' },
    { template: '{ p_participants }-mMovementChain' },
    { template: '{ p_participants }-mComments' },

  ]}
];

const {LAYERS, LAYER_CHILDREN_MAP, LAYER_PARENT_MAP,
  sortFunction, resOptsAdditionalTierTypes} = (function () {

  const values = {
    p_participants: getSubstitutedPropertyValues('p_participants'),
    p_mHand: getSubstitutedPropertyValues('p_mHand'),
  };

  let layers = [],
      valueList = { orValues: [] },
      childrenMap = {},
      parentMap = {},
      orderMap = {};

  LAYER_TEMPLATES_HIERARCHY.forEach((channel, ix0) => {
    channel.tierTemplates.forEach((parent, ix1) => {

      const template = parent.template,
            layerType = tierTemplateToType(template),
            { tierObjects: parentTierObjects,
              tierStrings: parentTierStrings,
              tierMap: parentTierMap } = resolveTierTemplate(template),
            item = {
              id: layerType,
              name: layerType,
              value: parentTierStrings,
              template,
            };
      valueList.orValues.push(item);
      layers = layers.concat(parentTierStrings);

      parentTierObjects.forEach(tierObject => {
        let sortKey =
          String(values.p_participants.indexOf(tierObject.p_participants)) +
          String(ix0) +
          String(ix1).padStart(3, '0');
        if (tierObject.p_mHand) {
          sortKey += String(values.p_mHand.indexOf(tierObject.p_mHand) + 1);
        }
        orderMap[tierObject] = sortKey;
        childrenMap[tierObject] = [];
      });

      if (parent.children) {
        const parentItem = item;
        parentItem.orValues = [];
        parent.children.forEach((layerTemplate, ix2) => {
          const layerType = tierTemplateToType(layerTemplate),
                { tierObjects, tierStrings } =
                  resolveTierTemplate(layerTemplate),
                item = {
                  id: layerType,
                  name: layerType,
                  value: tierStrings,
                  template: layerTemplate
                };
          parentItem.orValues.push(item);
          layers = layers.concat(tierStrings);

          tierObjects.forEach(tierObject => {
            const parentKey = [tierObject.p_participants, tierObject.p_mHand],
                  parentLayer = parentTierMap[parentKey],
                  sortKey =
                    String(values.p_participants.indexOf(
                      tierObject.p_participants)) +
                    String(ix0) +
                    String(ix1).padStart(3, '0') +
                    String(values.p_mHand.indexOf(tierObject.p_mHand) + 1) +
                    // Свойство p_mHand используется не вовсех шаблонах слоев,
                    // поэтому при поиске по индексу может возникать -1.
                    // Но так как сортировать мы будем на основе символов,
                    // а не чисел, избавляемся от возможных отрицательных
                    // чисел, прибавляя единицу.
                    String(ix2).padStart(3, '0');
            orderMap[tierObject] = sortKey;
            parentMap[tierObject] = parentLayer;
            childrenMap[parentLayer].push(tierObject.toString());
          });
        });
      }

    });
  });
  layers.sort(sortFunction);

  function sortFunction(a, b) {
    let A = orderMap[a],
        B = orderMap[b];
    if (A < B) return -1;
    if (A > B) return 1;
    return 0;
  }

  const resOptsData = { type: 'list', id: 'results_opts',
    name: 'Обязательные для отображения типы слоев',
    help: `Типы слоев, которые будут отображаться для всех найденных
      результатов независимо от того, участвуют данные типы слоев
      в запросе или нет.`,
    valueList
  };

  let resOptsAdditionalTierTypes = new ListProperty(resOptsData);
  Object.defineProperty(resOptsAdditionalTierTypes, 'isHeaderClickable', {
    value: true,
    writable: false,
  });
  resOptsAdditionalTierTypes.onHeaderClick = function () {
    let self = resOptsAdditionalTierTypes,
        values = self.chosenValues(),
        n = values.length,
        areAllChecked = self.valueList.areAllChecked();
    if (areAllChecked) {
      self.valueList.uncheckAll();
    } else if (n > 0) {
      self.$$lastValues = values.slice();
      self.valueList.checkAll();
    } else {
      self.$$lastValues.forEach(item => item.userChecked(true));
    }
  };
  resOptsAdditionalTierTypes.reset = function () {
    const defaults = [
      'vLine',
      'vLineHTML', // RU
      //'vLineHTMLTranslit', // EN
      //'vLineTranslate', // EN
      'vSegm',
      'vSegmHTML', // RU
      //'vSegmHTMLTranslit', // EN
      //'vSegmGlossing', // EN
    ];
    resOptsAdditionalTierTypes.valueList.resetToValuesByIds(defaults);
  };
  resOptsAdditionalTierTypes.reset();

  return {
    LAYERS: layers,
    LAYER_CHILDREN_MAP: childrenMap,
    LAYER_PARENT_MAP: parentMap,
    sortFunction, resOptsAdditionalTierTypes
  };
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
    let segments = this.struct._data[this.type] || [];
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
    this.matched = layer.struct._activeResult.match.value === data.value;

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
    let overallTime = this.layer.struct.time;
    if (this.time && !overallTime.predefined) {
      let timeIsNotDefined = !Object.prototype
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

function tierTemplateToType(template) {
  return template.replace(/\{[^{}]+\}|-/g, '');
}

function resolveTierTemplate(template, unitProperties, channel) {
  if (template.indexOf('{') < 0) return [template];

  let tierObjects = [], idMap = {};
  const reTrim = /^\{\s*|\s*\}$/g,
        reFields = /\{\s*[^{}]+\s*\}/g,
        reProp = x => new RegExp(`\\{\\s*${ x }\\s*\\}`, 'g'),
        propsIds = template.match(reFields).map(x => x.replace(reTrim, ''));

  propsIds.forEach(id => {
    idMap[id] = getSubstitutedPropertyValues(id, unitProperties, channel);
  });

  let lens = propsIds.map(id => idMap[id].length),
      index = propsIds.map(() => 0), // Array(propsIds.length).fill(0),
      N = lens.reduce((a, b) => a * b);

  for (let n = 0; n < N; n++) {
    let tier = template, tierProps = {} ;
    for (let i = 0; i < propsIds.length; i++) {
      const prop = propsIds[i],
            propVal = idMap[prop][index[i]];
      tier = tier.replace(reProp(prop), propVal);
      tierProps[prop] = propVal;
    }
    tier = Object.assign(new String(tier), tierProps);
    tierObjects.push(tier);
    index = index.map((x, i, arr) => {
      if (i > 0) {
        return arr[i - 1] === 0 ? (x + 1) % lens[i] : x;
      } else {
        return (x + 1) % lens[i];
      }
    });
  }
  tierObjects = tierObjects.sort(sortFunction);
  let tierStrings = [],
      tierMap = {};
  tierObjects.forEach(function (tier) {
    const tierString = tier.toString();
    tierMap[[tier.p_participants, tier.p_mHand]] = tierString;
    tierStrings.push(tierString);
  });
  return { tierObjects, tierStrings, tierMap };
}

class LayersStruct {
  constructor(activeResult, data, tiers, time, state) {
    this._activeResult = activeResult || {};
    this._data = data || {};
    this._timeBoundSegRegister = {};
    this._availableList = this.getAvailableLayersList(tiers, this._data);

    this.time = this.getTime(time);
    this.layers = this.getLayersFromData(this._availableList);
    if (state) this.previousState = state;
  }
  getTime(time) {
    if (time && typeof time.start === 'number') {
      return { ...time, predefined: true };
    }
    return {};
  }
  getAvailableLayersList(tiers, data) {
    let layersList = tiers instanceof Array && tiers.length > 0
      ? tiers
      : Object.getOwnPropertyNames(data);
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

export { LayersStruct, layersElementIds, LAYER_PARENT_MAP,
  resolveTierTemplate, resOptsAdditionalTierTypes, tierMapForPrimaryResults };
