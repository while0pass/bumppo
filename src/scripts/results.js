import { getTimeTag, MS } from './timeline.js';
import { LAYER_PARENT_MAP } from './layers.js';

const R = /^[^\d]*(\d+).*$/g;

function translateTierValue(tier, match) {
  let value = tier in match.tiers ? match.tiers[tier].trim() : '',
      text = tier in tier2val && value ? tier2val[tier](value) : value;
  return text;
}

function defaultTemplate(tiers, match) {
  // Для всех переданных имен слоев, находим значения, "переводим" их и
  // объединяем через точку с запятой.
  return tiers.map(tier => translateTierValue(tier, match)).join('; ');
}

function vLineTemplate(tiers, match) {
  const [html, htmlTranslit, translation] = tiers.map(
    tier => translateTierValue(tier, match));
  if (html) return html;
  if (htmlTranslit && translation) return `
    ${ htmlTranslit } <span class="bmpp-translation">‘${ translation }’</span>
  `;
  return htmlTranslit;
}

function vSegmTemplate(tiers, match) {
  const [html, htmlTranslit, gloss] = tiers.map(
    tier => translateTierValue(tier, match));
  if (html) return html;
  if (htmlTranslit && gloss) return `
    ${ htmlTranslit } <span class="bmpp-gloss">${ gloss }</span>
  `;
  return htmlTranslit;
}

const tierMap = {
  'N-vLine': {
    tiers: ['N-vLineHTML', 'N-vLineHTMLTranslit', 'N-vLineTranslation'],
    template: vLineTemplate },
  'C-vLine': {
    tiers: ['C-vLineHTML', 'C-vLineHTMLTranslit', 'C-vLineTranslation'],
    template: vLineTemplate },
  'R-vLine': {
    tiers: ['R-vLineHTML', 'R-vLineHTMLTranslit', 'R-vLineTranslation'],
    template: vLineTemplate },

  'N-vSegm': {
    tiers: ['N-vSegmHTML', 'N-vSegmHTMLTranslit', 'N-vSegmGlossing'],
    template: vSegmTemplate },
  'C-vSegm': {
    tiers: ['C-vSegmHTML', 'C-vSegmHTMLTranslit', 'C-vSegmGlossing'],
    template: vSegmTemplate },
  'R-vSegm': {
    tiers: ['R-vSegmHTML', 'R-vSegmHTMLTranslit', 'R-vSegmGlossing'],
    template: vSegmTemplate },

  'N-vPause': { tiers: ['N-vPauseHTML'] },
  'C-vPause': { tiers: ['C-vPauseHTML'] },
  'R-vPause': { tiers: ['R-vPauseHTML'] },

  'N-vCollat': { tiers: ['N-vCollatForm'] },
  'C-vCollat': { tiers: ['C-vCollatForm'] },
  'R-vCollat': { tiers: ['R-vCollatForm'] },

  'N-mRtMovement': { tiers: ['N-mRtMtType'] },
  'N-mLtMovement': { tiers: ['N-mLtMtType'] },
  'C-mRtMovement': { tiers: ['C-mRtMtType'] },
  'C-mLtMovement': { tiers: ['C-mLtMtType'] },
  'R-mRtMovement': { tiers: ['R-mRtMtType'] },
  'R-mLtMovement': { tiers: ['R-mLtMtType'] },

  'N-mRtStillness': { tiers: ['N-mRtStType'] },
  'N-mLtStillness': { tiers: ['N-mLtStType'] },
  'C-mRtStillness': { tiers: ['C-mRtStType'] },
  'C-mLtStillness': { tiers: ['C-mLtStType'] },
  'R-mRtStillness': { tiers: ['R-mRtStType'] },
  'R-mLtStillness': { tiers: ['R-mLtStType'] },

  'N-mGesture': { tiers: ['N-mGeStructure'] },
  'C-mGesture': { tiers: ['C-mGeStructure'] },
  'R-mGesture': { tiers: ['R-mGeStructure'] },

  'N-mAdaptor': { tiers: ['N-mAdType'] },
  'C-mAdaptor': { tiers: ['C-mAdType'] },
  'R-mAdaptor': { tiers: ['R-mAdType'] },

  'N-oFixation': { tiers: ['N-oInterlocutor'] },
  'C-oFixation': { tiers: ['C-oInterlocutor'] },
  'R-oFixation': { tiers: ['R-oInterlocutor'] },
};

function m_func(title, map, separator=', ') {
  return function(value) {
    let text = value.trim();
    if (!text) return text;
    text = text.split(/\s*,\s*/g).map(x => x in map? map[x]: x);
    text = text.join(separator);
    if (title) {
      text = `<i>${ title }:</i> ${ text }`;
    }
    return text;
  };
}

const m_vCollatForm = m_func('', {
  '{laugh}': 'смех',
  '{smile}': 'улыбка',
  '{creaky}': 'скрипучий голос',
});

const m_mMtType = m_func('', {  // Тип движения
  'P': 'подготовка',
  'S': 'мах',
  'R': 'ретракция',
  'PnC-In': 'независимая смена положения',
  'PnC-Dp': 'зависимая смена положения',
  'U': 'неструктурированное движение',
  'Other': 'иное движение',
});

const m_mStType = m_func('', {  // Тип неподвижности
  'Hold': 'удержание',
  'Rest': 'покой',
  'Frozen': 'зависание',
});

const m_mGeHandedness = m_func('Рукость', {
  'Lt': 'леворучный',
  'Rt': 'праворучный',
  'Bh-sym': 'двуручный с симетричной траекторией',
  'Bh-id': 'двуручный с идентичной / единой траекторией',
  'Bh-dif': 'двуручный с различной траекторией у разных рук',
  'Other': 'прочее',
});

const m_mGeStructure = m_func('фазовая структура', {
  'S': 'мах',
  'S R': 'мах, ретракция',
  'P S': 'подготовка, мах',
  'P S R': 'подготовка, мах, ретракция',
  'P-S': 'подготовка-мах',
  'P-S R': 'подготовка-мах, ретракция',
}, '; ');

const m_mGeFunction = m_func('функциональный тип', {
  'Depictive': 'изобразительный жест',
  'Pointing': 'указательный жест',
  'Beat': 'жестовое ударение',
  'Other': 'другое',
  'Pragmatic': 'прагматический / метафорический жест',
});

const m_mGeTags = m_func('дополнительные признаки', {
  'Shuttle': 'двуручный жест («туда-обратно»)',
  'Multi-S': 'жест с многократным махом',
  'S Rebound': 'отскок в конце маха',
  'R Rebound': 'отскок в конце ретракции',
  'Multi Rebound': 'многократный отскок в конце маха',
  'Long R': 'длинная ретракция',
  'Lt P Overlap': 'наложение на текущий жест фазы другого жеста (Lt P)',
  'Lt S Overlap': 'наложение на текущий жест фазы другого жеста (Lt S)',
  'Lt H Overlap': 'наложение на текущий жест фазы другого жеста (Lt H)',
  'Lt R Overlap': 'наложение на текущий жест фазы другого жеста (Lt R)',
  'Rt P Overlap': 'наложение на текущий жест фазы другого жеста (Rt P)',
  'Rt S Overlap': 'наложение на текущий жест фазы другого жеста (Rt S)',
  'Rt H Overlap': 'наложение на текущий жест фазы другого жеста (Rt H)',
  'Rt R Overlap': 'наложение на текущий жест фазы другого жеста (Rt R)',
  'Repeat': 'повтор предыдущего жеста',
  'GeBreakOff': 'обрыв в основном сформированного жеста',
  'GeFalstart': 'обрыв жеста без маховой фазы',
});

const m_mAdType = m_func('', {  // Тип адаптора
  'Adaptor1': 'Четкий адаптор',
  'Adaptor2': 'Нечеткий адаптор',
  'Adaptor1+2': 'Комбинированный адаптор (тип 1)',
  'Adaptor2+1': 'Комбинированный адаптор (тип 2)',
  'Other': 'Другое',
});

const m_oInterlocutor = m_func('Объект взгляда', {
  'N': 'рассказчик',
  'C': 'комментатор',
  'R': 'пересказчик',
  'L': 'слушатель',
  'Other': 'прочее',
});

const m_oLocus = m_func('локус взгляда', {
  'Face': 'лицо',
  'Hands': 'руки',
  'Body': 'тело',
  'Other': 'прочее',
});


const tier2val = {
  'N-vCollatForm': m_vCollatForm,
  'C-vCollatForm': m_vCollatForm,
  'R-vCollatForm': m_vCollatForm,

  'N-mRtMtType': m_mMtType,
  'N-mLtMtType': m_mMtType,
  'C-mRtMtType': m_mMtType,
  'C-mLtMtType': m_mMtType,
  'R-mRtMtType': m_mMtType,
  'R-mLtMtType': m_mMtType,

  'N-mRtStType': m_mStType,
  'N-mLtStType': m_mStType,
  'C-mRtStType': m_mStType,
  'C-mLtStType': m_mStType,
  'R-mRtStType': m_mStType,
  'R-mLtStType': m_mStType,

  'N-mGeHandedness': m_mGeHandedness,
  'C-mGeHandedness': m_mGeHandedness,
  'R-mGeHandedness': m_mGeHandedness,

  'N-mGeStructure': m_mGeStructure,
  'C-mGeStructure': m_mGeStructure,
  'R-mGeStructure': m_mGeStructure,

  'N-mGeFunction': m_mGeFunction,
  'C-mGeFunction': m_mGeFunction,
  'R-mGeFunction': m_mGeFunction,

  'N-mGeTags': m_mGeTags,
  'C-mGeTags': m_mGeTags,
  'R-mGeTags': m_mGeTags,

  'N-mAdType': m_mAdType,
  'C-mAdType': m_mAdType,
  'R-mAdType': m_mAdType,

  'N-oInterlocutor': m_oInterlocutor,
  'C-oInterlocutor': m_oInterlocutor,
  'R-oInterlocutor': m_oInterlocutor,

  'N-oLocus': m_oLocus,
  'C-oLocus': m_oLocus,
  'R-oLocus': m_oLocus,
};

class Match {
  constructor(data, result) {
    this.result = result;
    this.time = data.time;
    this.value = data.value;
    this.tier = data.tier;
    this.tiers = data.show_tiers;
    this.transcription = this.getTranscription();
  }
  get beginTime() {
    if (!this._begin) this._begin = getTimeTag(this.time.begin, MS);
    return this._begin;
  }
  get endTime() {
    if (!this._end) this._end = getTimeTag(this.time.end, MS);
    return this._end;
  }
  get duration() {
    return ((this.time.end - this.time.begin) / 1000).toFixed(2);
  }
  getTranscription() {
    let showTiers = [], templateFunc;
    if (this.tier in tierMap) {
      ({ tiers: showTiers, template: templateFunc } = tierMap[this.tier]);
    } else if (LAYER_PARENT_MAP[this.tier] in tierMap) {
      const parentTier = LAYER_PARENT_MAP[this.tier];
      ({ tiers: showTiers, template: templateFunc } = tierMap[parentTier]);
    }
    templateFunc = templateFunc === undefined ? defaultTemplate : templateFunc;
    return templateFunc(showTiers, this);
  }
}

class Result {
  constructor(data) {
    // NOTE: удалить после миграции на новую версию API результатов
    if (Array.isArray(data)) { data = data[0]; }

    this._data = data;

    this.record_id = this.getRecordId(data && data.record_id || '');
    this.match = new Match(data, this),
    this.participant = data.participant || data.tier && data.tier[0] || '';
    this.filmType = this.getFilmType();

    this.ix = null; // Номер результата в выборке, нумерация с 0
    this.record_ix = null; // То же, но в рамках одной записи, а не всей выборки
  }
  getRecordId(raw_record_id) {
    let splits = raw_record_id.split(R);
    if (splits.length === 3) {
      return splits[1];
    }
    return 'NoID';
  }
  getFilmType() {
    let filmType = this.match.tier.slice(-10) === '-oFixation' ? 'ey' : 'vi';
    return `${ this.participant }-${ filmType }`;
  }
  forJSON() {
    return this._data;
  }
}


const referenceResultData = {
  show_tiers: { 'C-vLineHTML':
    '\\собирает (0.18) (ə 0.63) груши себе в (ˀ 0.36) /ф<u>а</u>ртук,' },
  value: 'C-vE009',
  c_1: {
    id: 'C-vE009',
    value: 'C-vE009',
    time: { begin: 232020, end: 235340 }
  },
  tier: 'C-vLine',
  c_2: {
    tier: 'R_oFixation',
    id: 'R-oF0233',
    value: 'R-oF0233',
    time: { end: 235420 }
  },
  c_1p0: {
    tier: 'C_vLineType',
    id: 'C-vE009',
    value: 'EDU',
    time: { begin: 235340, end: 235340 }
  },
  time: { begin: 232020, end: 235340 },
  record_id: '22',
  is_main: true
};
const referenceResult = new Result(referenceResultData);


function getResults(dataItems) {
  let results = dataItems.map(item => new Result(item)),
      sections = [],
      record_ix = 0;
  results.forEach((item, index, array) => {
    item.ix = index;
    item.record_ix = record_ix;
    record_ix += 1;

    if (index === 0 || item.record_id !== array[index - 1].record_id) {
      var prevSection = sections.length > 0 ? sections.slice(-1)[0] : null,
          nextSection = {
            firstItem: item,
            firstIndex: index,
            sectionLength: 1,
          };
      sections.push(nextSection);
      if (prevSection !== null) {
        prevSection.sectionLength = index - prevSection.firstIndex;
      }
      record_ix = 0;
    }
    if (index === array.length - 1) {
      let lastSection = sections.slice(-1)[0];
      lastSection.sectionLength = index + 1 - lastSection.firstIndex;
    }
  });
  return [results, sections];
}

export { Result, getResults, referenceResult };
