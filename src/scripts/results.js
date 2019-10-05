import { getTimeTag, MS } from './timeline.js';

const R = /^[^\d]*(\d+).*$/g;

const tierMap = {
  'N-vLine': ['N-vLineHTML'],
  'C-vLine': ['C-vLineHTML'],
  'R-vLine': ['R-vLineHTML'],

  'N-vSegm': ['N-vSegmHTML'],
  'C-vSegm': ['C-vSegmHTML'],
  'R-vSegm': ['R-vSegmHTML'],

  'N-vPause': ['N-vPauseHTML'],
  'C-vPause': ['C-vPauseHTML'],
  'R-vPause': ['R-vPauseHTML'],

  'N-vCollat': ['N-vCollatForm'],
  'C-vCollat': ['C-vCollatForm'],
  'R-vCollat': ['R-vCollatForm'],

  'N-mRtMovement': ['N-mRtMtType'],
  'N-mLtMovement': ['N-mLtMtType'],
  'C-mRtMovement': ['C-mRtMtType'],
  'C-mLtMovement': ['C-mLtMtType'],
  'R-mRtMovement': ['R-mRtMtType'],
  'R-mLtMovement': ['R-mLtMtType'],

  'N-mRtStillness': ['N-mRtStType'],
  'N-mLtStillness': ['N-mLtStType'],
  'C-mRtStillness': ['C-mRtStType'],
  'C-mLtStillness': ['C-mLtStType'],
  'R-mRtStillness': ['R-mRtStType'],
  'R-mLtStillness': ['R-mLtStType'],

  'N-mGesture': ['N-mGeHandedness', 'N-mGeStructure', 'N-mGeFunction', 'N-mGeTags'],
  'C-mGesture': ['C-mGeHandedness', 'C-mGeStructure', 'C-mGeFunction', 'C-mGeTags'],
  'R-mGesture': ['R-mGeHandedness', 'R-mGeStructure', 'R-mGeFunction', 'R-mGeTags'],

  'N-mAdaptor': ['N-mAdType'],
  'C-mAdaptor': ['C-mAdType'],
  'R-mAdaptor': ['R-mAdType'],

  'N-oFixation': ['N-oInterlocutor', 'N-oLocus'],
  'C-oFixation': ['C-oInterlocutor', 'C-oLocus'],
  'R-oFixation': ['R-oInterlocutor', 'R-oLocus'],
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
  'Reset': 'покой',
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
    let transcription = '', self = this,
        showTiers = this.tier in tierMap ? tierMap[this.tier] : [];
    showTiers.forEach((tier, i) => {
      let annotation = tier in self.tiers ? self.tiers[tier].trim() : '',
          text = tier in tier2val ? tier2val[tier](annotation) : annotation;
      if (text) {
        if (i > 0) transcription += '; ';
        transcription += text;
      }
    });
    return transcription;
  }
}

export class Result {
  constructor(data) {
    // NOTE: удалить после миграции на новую версию API результатов
    if (Array.isArray(data)) {
      data = data[0];
    }

    this.record_id = this.getRecordId(data && data.record_id || '');
    this.match = new Match(data, this),
    this.participant = data.participant || data.tier && data.tier[0] || '';
    this.filmType = this.getFilmType();

    this.setup();
  }
  getRecordId(raw_record_id) {
    let splits = raw_record_id.split(R);
    if (splits.length === 3) {
      return splits[1];
    }
    return 'NoID';
  }
  setup() {
    this.previousItem = null;
  }
  setPreviousItem(item) {
    this.previousItem = item;
  }
  getFilmType() {
    let filmType = this.match.tier.slice(-10) === '-oFixation' ? 'ey' : 'vi';
    return `${ this.participant }-${ filmType }`;
  }
}


export function getResults(list) {
  let results = list.map(item => new Result(item));
  results.forEach((item, index, array) => {
    let previousItem = index > 0 ? array[index - 1] : null;
    item.setPreviousItem(previousItem);
  });
  return results;
}

export function concatResults(oldOnesKoObservable, newOnes) {
  let n = oldOnesKoObservable().length;
  if (n > 0) {
    let previousItem = oldOnesKoObservable()[n - 1];
    newOnes[0].setPreviousItem(previousItem);
  }
  oldOnesKoObservable.splice(n, 0, ...newOnes);
}
