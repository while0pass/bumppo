import jQuery from 'jquery';
import ko from 'knockout';

const DURATION = {
  type: 'interval', name: 'Длительность', id: 'duration', step: 20,
  units: 'миллисекунд', unitsBanner: 'мс',
  fromOnlyBanner: 'не менее ##', toOnlyBanner: 'не более ##',
  fromToEqualBanner: 'ровно ##',
  help: `<header class="ui header">Интервал длительности единицы</header>
  <p>Чтобы отобрать единицы, длительность которых не меньше указанной,
  заполните только левое поле. Чтобы отобрать единицы, длительность которых
  не больше указанной, заполните только правое поле. Свойство не будет
  учитываться в запросе, если ничего не задать.</p>` };

const PARTICIPANTS = {
  type: 'list', name: 'Участники', id: 'participants',
  valueList: { orValues: [
    { name: 'Рассказчик', value: 'N' },
    { name: 'Комментатор', value: 'C', disabledInChannels: ['ocul'] },
    { name: 'Пересказчик', value: 'R' }
  ]}};

const SAME_PARTICIPANT = {
  type: 'list', name: 'Совпадение участников', id: 'same_participant',
  valueList: { xorValues: [
    { name: 'Да', value: true },
    { name: 'Нет', value: false },
  ]}};

const PHASE_STRUCTURE = {
  type: 'list', name: 'Фазовая структура', id: 'phase_structure',
  displayValues: true, valueList: { orValues: [
    { name: 'Мах', value: 'S' },
    { name: 'Мах, ретракция', value: 'S R' },
    { name: 'Подготовка, мах', value: 'P S' },
    { name: 'Подготовка, мах, ретракция', value: 'P S R' },
    { name: 'Подготовка-мах', value: 'P-S' },
    { name: 'Подготовка-мах, ретракция', value: 'P-S R' },
    { name: 'Другой вариант', editable: true },
  ]},
  validChars: ['P', 'R', 'S', '-', ' '],
  substitute: [
    [/[sыЫ]/g, 'S'],
    [/[pрРзЗ]/g, 'P'],
    [/[rкК]/g, 'R'],
    [/\s+/g, ' '],
    [/\s*[-_]\s*/g, '-'],
  ]};

const HANDEDNESS = {
  type: 'list', name: 'Рукость', id: 'handedness',
  valueList: { orValues: [
    { name: 'Леворучный', value: 'l' },
    { name: 'Праворучный', value: 'r' },
    { name: 'Двуручный с симетричной траекторией', value: 'bs' },
    { name: 'Двуручный с идентичной / единой траекторией', value: 'bi' },
    { name: 'Двуручный с различной траекторией у разных рук', value: 'bd' },
    { name: 'Прочее', value: 'o' },
  ]}};

const FUNCTIONAL_TYPE = {
  type: 'list', name: 'Функциональный тип', id: 'gesture_func_type',
  valueList: { orValues: [
    { name: 'Изобразительный жест', value: 'ic' },
    { name: 'Указательный жест', value: 'ix' },
    { name: 'Жестовое ударение', value: 'a' },
    { name: 'Другое', value: 'o' },
    { name: 'Прагматический / метафорический жест', value: 'pm' },
  ]}};

const GESTURE_OPTIONS = {
  type: 'list', name: 'Дополнительные признаки', id: 'gesture_opts',
  valueList: { orValues: [
    { name: 'Двуручный жест («туда-обратно»)', value: 'ww' },
    { name: 'Жест с многократным махом', value: 'ms' },
    { name: 'Отскок в конце маха', value: 'sb' },
    { name: 'Отскок в конце ретракции', value: 'rb' },
    { name: 'Многократный отскок в конце маха', value: 'smb' },
    { name: 'Длинная ретракция', value: 'lr' },
    { name: 'Наложение на текущий жест фазы другого жеста', value: 'gi' },
    { name: 'Повтор предыдущего жеста', value: 'gr' },
    { name: 'Обрыв в основном сформированного жеста', value: 'z' },
    { name: 'Обрыв жеста без маховой фазы', value: 'zz' },
  ]}};

const ILLOCUTIONARY_PHASE = {
  type: 'list', name: 'Иллокутивно-фазовое значение', id: 'illocutionary_phase',
  displayValues: true, valueList: { orValues: [
    { name: 'Иллокутивное', orValues: [
      { name: 'Завершение сообщения', value: '.' },
      { name: 'Вопрос', value: '?' },
      { name: 'Директив', value: '¡' },
      { name: 'Обращение', value: '@' },
      { name: 'Полуутверждение', value: '¿' },
      { name: 'Неполнота информации', value: '…' },
      { name: 'Восклицательность', value: '!' },
    ]},
    { name: 'Фазовое', orValues: [
      { name: 'Стандартная незавершенность', value: ',' },
      { name: 'Незавершенность, восполняемая последующим контекстом', value: ':' },
      { name: 'Неполнота информации в контексте незавершенности', value: ',,,' },
      { name: 'Начальная часть сплита', value: '—' },
    ]},
    { name: 'Обрыв', addNameToChildNames: true, orValues: [
      { name: 'При самоисправлении', value: '==' },
      { name: 'При апосиопезе', value: '~' },
      { name: 'При вмешательстве собеседника', value: '≈≈' },
    ]},
  ]}};

const ILLOCUTIONARY_PHASE_COMBINATION = {
  type: 'list', name: 'Комбинация иллокутивно-фазовых значений',
  id: 'illocutionary_phase_combination',
  valueList: { orValues: [
    { name: 'Не-сообщение + незавершенность', value: 'i1' },
    { name: 'Не-сообщение + неполнота информации', value: 'i2' },
    { name: 'Не-сообщение + восклицательность', value: 'i3' },
    { name: 'Незавершенность + обрыв', value: 'i4' },
    { name: 'Прочее', value: 'i5' },
  ]}};

const ACCENTS_N = {
  type: 'interval', name: 'Число акцентов', id: 'accents_n',
  fromOnlyBanner: '## и более', toOnlyBanner: '## и менее' };

const PRIMARY_ACCENTS_N = {
  type: 'interval', name: 'Число главных акцентов', id: 'primary_accents_n',
  fromOnlyBanner: '## и более', toOnlyBanner: '## и менее' };

const SECONDARY_ACCENTS_N = {
  type: 'interval', name: 'Число вторичных акцентов после главного',
  id: 'secondary_accents_n',
  fromOnlyBanner: '## и более', toOnlyBanner: '## и менее' };

const WORDS_N = {
  type: 'interval', name: 'Число слов', id: 'words_n',
  fromOnlyBanner: '## и более', toOnlyBanner: '## и менее' };

const ABSOLUTE_PAUSES_N = {
  type: 'interval', name: 'Число абсолютных пауз', id: 'abs_pauses_n',
  fromOnlyBanner: '## и более', toOnlyBanner: '## и менее' };

const FILLED_PAUSES_N = {
  type: 'interval', name: 'Число заполненных пауз', id: 'filled_pauses_n',
  fromOnlyBanner: '## и более', toOnlyBanner: '## и менее' };

const STARTSWITH_FILLED_PAUSE = {
  type: 'list', name: 'Начинается с заполненной паузы',
  id: 'startswith_filled_pause',
  valueList: { xorValues: [
    { name: 'Да', value: true },
    { name: 'Нет', value: false },
  ]}};

const INTERRUPTION_POINTS_N = {
  type: 'interval', name: 'Число точек прерывания', id: 'ip_n',
  fromOnlyBanner: '## и более', toOnlyBanner: '## и менее' };

const TONE_MOVEMENT = {
  type: 'list', name: 'Движение тона в главном акценте',
  id: 'accent_movement', displayValues: true,
  valueList: { orValues: [
    { name: 'Восходящее', value: '/' },
    { name: 'Нисходящее', value: '\\' },
    { name: 'Ровное', value: '–' },
    { name: 'Восходяще-нисходящее', value: ['/\\', '/↓', '↑\\'] },
    { name: 'Восходяще-ровное', value: ['/–', '/→'] },
    { name: 'Нисходяще-восходящее', value: ['\\/', '\\↑'] },
    { name: 'Другой вариант', editable: true },
  ]},
  virtualKeyboard: true,
  validChars: ['/', '\\', '–', '↑', '↓', '→'],
  substitute: [
    [/[-\u2014\u2012]/g, '\u2013'],
  ]};

const WITHIN_INSERTION = {
  type: 'list', name: 'Входит в конструкцию со вставкой',
  id: 'within_ins',
  valueList: { xorValues: [
    { name: 'Да', orValues: [
      { name: 'Непосредственно предшествует вставке', value: 'wi1' },
      { name: 'Первая ЭДЕ сложной вставки', value: 'wi2' },
      { name: 'Последняя ЭДЕ сложной вставки', value: 'wi3' },
      { name: 'Внутренняя ЭДЕ сложной вставки', value: 'wi4' },
      { name: 'Единственная ЭДЕ простой вставки', value: 'wi5' },
      { name: 'Непосредственно следует за вставкой', value: 'wi6' },
      { name: 'Первая ЭДЕ односторонней вставки', value: 'wi7' },
    ]},
    { name: 'Нет', value: false },
  ]}};

const WITHIN_SPLIT = {
  type: 'list', name: 'Входит в конструкцию со сплитом',
  id: 'within_split',
  valueList: { xorValues: [
    { name: 'Да', value: true },
    { name: 'Нет', value: false },
  ]}};

const WITHIN_MUTUAL_VERBALISATION = {
  type: 'list', name: 'Входит в совместное построение реплик',
  id: 'within_muverb',
  valueList: { xorValues: [
    { name: 'Да', orValues: [
      { name: 'Достраивается другим участником', value: 'wi1' },
      { name: 'Достраивает реплику другого участника', value: 'wi2' },
      { name: 'И то, и другое', value: 'wi3' },
    ]},
    { name: 'Нет', value: false },
  ]}};

const WITHIN_CITAION = {
  type: 'list', name: 'Входит в конструкцию с (полу)прямой цитацией',
  id: 'within_cit',
  valueList: { xorValues: [
    { name: 'Да', orValues: [
      { name: 'Вводит чужую речь (авторская ремарка)', value: 'wc1' },
      { name: 'Первая ЭДЕ сложной цитации', value: 'wc2' },
      { name: 'Последняя ЭДЕ сложной цитации', value: 'wc3' },
      { name: 'Внутренняя ЭДЕ сложной цитации', value: 'wc4' },
      { name: 'Единственная ЭДЕ простой цитации', value: 'wc5' },
    ]},
    { name: 'Нет', value: false },
  ]}};

const MUTUAL_PROPERTIES = [ DURATION, PARTICIPANTS, SAME_PARTICIPANT ];

const defaultPropertiesList = MUTUAL_PROPERTIES.concat([

  { type: 'text', name: 'Словарная форма', id: 'word',
    placeholder: '…'},

  { type: 'interval', name: 'Позиция от начала ЭДЕ', id: 'position_within_edu',
    fromOnlyBanner: '##‐я и дальше', toOnlyBanner: '##‐я и ближе',
    fromLabel: 'с', toLabel: 'по', fromToBanner: '##–##' },

  ACCENTS_N,

  { type: 'list', name: 'Точка прерывания', id: 'termination_point',
    valueList: { xorValues: [
      { name: 'Да', orValues: [
        { name: 'При самоисправлении внутри ЭДЕ', value: 'vx1' },
        { name: 'При самоисправлении на границе ЭДЕ', value: 'vx2' },
        { name: 'При вмешательстве внутри ЭДЕ', value: 'vx3' },
        { name: 'При вмешательстве на границе ЭДЕ', value: 'vx4' },
      ]},
      { name: 'Нет', value: false },
    ]}
  },

  ILLOCUTIONARY_PHASE,
  PHASE_STRUCTURE,

  { type: 'list', name: 'С акцентом', id: 'with_accent', displayValues: true,
    valueList: { xorValues: [
      { name: 'Да', orValues: [
        { name: 'С восходящим тоном', value: '/' },
        { name: 'С нисходящим тоном', value: '\\' },
        { name: 'С ровным тоном', value: '–' },
        { name: 'С восходяще-нисходящим тоном', value: ['/\\', '/↓', '↑\\'] },
        { name: 'С восходяще-ровным тоном', value: ['/–', '/→'] },
        { name: 'С нисходяще-восходящим тоном', value: ['\\/', '\\↑'] },
        { name: 'Другой вариант', editable: true },
      ]},
      { name: 'Нет', value: false },
    ]},
    virtualKeyboard: true,
    validChars: ['/', '\\', '–', '↑', '↓', '→'],
    substitute: [
      [/[-\u2014\u2012]/g, '\u2013'],
    ]
  },

]);

const propertiesLists = {
  u_mGesture: MUTUAL_PROPERTIES.concat([HANDEDNESS, PHASE_STRUCTURE, FUNCTIONAL_TYPE, GESTURE_OPTIONS]),
  u_vEDU: MUTUAL_PROPERTIES.concat([ILLOCUTIONARY_PHASE, WORDS_N, ABSOLUTE_PAUSES_N, FILLED_PAUSES_N, STARTSWITH_FILLED_PAUSE, ILLOCUTIONARY_PHASE_COMBINATION, INTERRUPTION_POINTS_N, ACCENTS_N, PRIMARY_ACCENTS_N, SECONDARY_ACCENTS_N, TONE_MOVEMENT, WITHIN_INSERTION, WITHIN_SPLIT, WITHIN_MUTUAL_VERBALISATION, WITHIN_CITAION]),
};

function keepZero(...args) {
  // Вычисляет аналог выражения:  arg1 || arg2 || ... || argN,
  // но считает, что цифра ноль это тоже тру.
  for (let i = 0; i < args.length - 1; i++) {
    let arg = args[i];
    if (arg || arg === 0) return arg;
  }
  if (args.length > 0) return args.slice(-1)[0];
}

function isImportant(value) {
  return [null, undefined, ''].indexOf(value) < 0;
}

function injectValue(template, value) {
  return template.replace('##', value.toString());
}

class SearchUnitProperty {
  constructor(data, unitType) {
    this.type = data.type;
    this.unitType = ko.observable(unitType);
    this.id = data.id;
    this.name = data.name;
    this.help = data.help || '';
    this.value = ko.observable(null);

    this.virtualKeyboard = data.virtualKeyboard || false;
    this.validChars = data.validChars;
    this.validitySusbstitutions = this.getValueSubstitutions(data);
  }
  static createByType(data, unitType) {
    let map = {
          'interval': IntervalProperty,
          'text': TextProperty,
          'list': ListProperty
        },
        Property = map[data.type];
    if (Property) {
      return new Property(data, unitType);
    }
  }
  changeUnitType(unitType) {
    this.unitType(unitType);
  }
  getValueSubstitutions(data) {
    let substitutions = [];
    if (data.substitute && data.substitute.length) {
      substitutions = data.substitute;
    }
    if (data.validChars && data.validChars.length) {
      let invalidChars = `[^${ escapeRegExp(data.validChars.join('')) }]`;
      substitutions.push([new RegExp(invalidChars, 'g'), '']);
    }
    return substitutions;
  }
  makeValueValid(string) {
    for (let i = 0; i < this.validitySusbstitutions.length; i++) {
      let [ regexp, replacement ] = this.validitySusbstitutions[i];
      string = string.replace(regexp, replacement);
    }
    return string;
  }
  insertText(text, element, value) {
    element = jQuery(element)
      .parents('.bmpp-valueList', 'li').find('input[type="text"]').get(0);
    return function () {
      let pos = element.selectionStart || 0;
      value(value().slice(0, pos) + text + value().slice(pos));
      pos += text.length;
      element.selectionStart = pos;
      element.selectionEnd = pos;
      element.focus();
    };
  }
  onHeaderClick() {
    // do nothing if not implemented
  }
  get isHeaderClickable() {
    return false;
  }
  getJsonProperties() {
    return ko.computed(function () {
      let value = this.value(), props = [];
      if (isImportant(value)) {
        props.push({ prop: this.id, value: value });
      }
      return props;
    }, this);
  }
  getBanner() {
    return '';
  }
}

class IntervalProperty extends SearchUnitProperty {
  constructor(data, unitType) {
    super(data, unitType);

    this.from = ko.observable(null);
    this.to = ko.observable(null);
    this.units = data.units || '';

    this.from.min = keepZero(data.fromMin, data.min, 0);
    this.from.max = keepZero(data.fromMax, data.max, null);
    this.from.step = data.fromStep || data.step || 1;
    this.from.placeholder = data.fromPlaceholder || '';
    this.from.label = data.fromLabel || 'от';
    this.from.banner = data.fromBanner || 'от ##';
    this.from.onlyBanner = data.fromOnlyBanner || this.from.banner;

    this.to.min = keepZero(data.toMin, data.min, 0);
    this.to.max = keepZero(data.toMax, data.max, null);
    this.to.step = data.toStep || data.step || 1;
    this.to.placeholder = data.toPlaceholder || '';
    this.to.label = data.toLabel || 'до';
    this.to.banner = data.toBanner || 'до ##';
    this.to.onlyBanner = data.toOnlyBanner || this.to.banner;

    this.fromToBanner = data.fromToBanner || `${ this.from.banner } ${ this.to.banner }`;
    this.fromToEqualBanner = data.fromToEqualBanner || '##';
    this.unitsBanner = data.unitsBanner || data.units || '';

    this.tune(data);
  }
  tune(data) {
    this.validitySusbstitutions = this.getValueSubstitutions(data);
    this.tuneValue();
    this.jsonProperties = this.getJsonProperties();
    this.banner = this.getBanner();
  }
  tuneValue() {
    // from не должно быть больше to
    ko.computed(function () {
      let from = this.from(), to = this.to.peek();
      if (isImportant(from) && isImportant(to) && from > to) { this.from(to); }
    }, this);
    // to не должно быть меньше from
    ko.computed(function () {
      let from = this.from.peek(), to = this.to();
      if (isImportant(from) && isImportant(to) && to < from) { this.to(from); }
    }, this);
    // композитное значение
    ko.computed(function () {
      let from = this.from(), to = this.to(), struct = {};
      if (!isImportant(from) && !isImportant(to)) {
        this.value(null);
      } else {
        if (isImportant(from)) struct.min = from;
        if (isImportant(to)) struct.max = to;
        this.value(struct);
      }
    }, this);
  }
  getJsonProperties() {
    return ko.computed(function () {
      let value = this.value(), props = [];
      if (isImportant(value)) {
        if (isImportant(value.min)) {
          props.push({ prop: `${ this.id }_min`, value: value.min });
        }
        if (isImportant(value.max)) {
          props.push({ prop: `${ this.id }_max`, value: value.max });
        }
      }
      return props;
    }, this);
  }
  getValueSubstitutions(data) {
    let ss = super.getValueSubstitutions(data);
    ss.push([/[^\d]/g, '']);
    return ss;
  }
  getBanner() {
    return ko.computed(function () {
      let from = this.from(), to = this.to(), banner = '';
      if (isImportant(from) && isImportant(to)) {
        if (from === to) {
          banner = injectValue(this.fromToEqualBanner, from);
        } else {
          banner = injectValue(injectValue(this.fromToBanner, from), to);
        }
      }
      if (isImportant(from) && !isImportant(to)) {
        banner = injectValue(this.from.onlyBanner, from);
      }
      if (!isImportant(from) && isImportant(to)) {
        banner = injectValue(this.to.onlyBanner, to);
      }
      if (banner && this.unitsBanner) { banner += ' ' + this.unitsBanner; }
      return banner;
    }, this);
  }
}

class TextProperty extends SearchUnitProperty {
  constructor(data, unitType) {
    super(data, unitType);
    this.placeholder = data.placeholder || '';
    this.tune();
  }
  tune() {
    this.jsonProperties = this.getJsonProperties();
    this.banner = this.getBanner();
  }
  getBanner() {
    return ko.computed(function () {
      let value = this.value();
      return isImportant(value) ? `«${ value }»` : '';
    }, this);
  }
}

function escapeRegExp(string) {
  return string.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&');
}

function addChosenAttr(attr, listItem, values) {
  let value = ko.unwrap(listItem[attr]);
  if (value instanceof Array) {
    values = values.filter(x => value.indexOf(x) < 0);
    values = values.concat(value);
  } else if (isImportant(value)) {
    values = values.filter(x => x !== value);
    values.push(value);
  }
  return values;
}

class ListProperty extends SearchUnitProperty {
  constructor(data, unitType) {
    super(data, unitType);
    this.displayValues = data.displayValues || false;
    this.chosenValues = ko.observableArray([]);
    this.valueList = new ValueList(data.valueList, null, this);

    this.tune();
  }
  tune() {
    this.tuneValue();
    this.jsonProperties = this.getJsonProperties();
    this.banner = this.getBanner();
  }
  tuneValue() {
    ko.computed(function () {
      let value = this.value,
          values = this.unwrapValues(this.chosenValues());
      if (values.length > 0) {
        if (this.valueList.isXOR && values.length === 1
        && this.valueList.items.some(item => item === values[0])) {
          let vals = [];
          vals = addChosenAttr('value', values[0], vals);
          if (vals.length === 1) {
            value(vals[0]);
          } else {
            value(vals);
          }
        } else {
          let vals = [];
          values.map(item => {
            vals = addChosenAttr('value', item, vals);
          });
          value(vals);
        }
      } else {
        value(null);
      }
    }, this);
  }
  unwrapValues(values) {
    return values.map(value => ko.isObservable(value) ? value() : value);
  }
  onHeaderClick() {
    let valueList = this.valueList,
        CLICK_IS_NOT_ON_CHECKBOX_LIST = -1;
    this._lastActiveDepth = CLICK_IS_NOT_ON_CHECKBOX_LIST;
    if (this.isHeaderClickable) {
      if (valueList.isOR) {
        valueList.invertSelection();
      } else if (valueList.isXOR) {
        valueList.rotateSelection();
      }
    }
  }
  get isHeaderClickable() {
    return this.valueList.hasNoChildList;
  }
  getBanner() {
    return ko.computed(function () {
      return this.chosenValues().map(
        item => {
          let prefix = '', postfix,
              parentItem = item.list.depth > 0 && item.list.parentItem;
          while (parentItem && parentItem.addNameToChildNames) {
            prefix = parentItem.name.slice(0, 1).toLowerCase() +
              parentItem.name.slice(1) + ' ' + prefix;
            parentItem = parentItem.list.depth > 0 && parentItem.list.parentItem;
          }
          if (item.editable) {
            postfix = `«${ item.value() }»`;
          } else {
            postfix = item.name.slice(0, 1).toLowerCase() + item.name.slice(1);
          }
          return prefix + postfix;
        }
      ).join('; ');
    }, this);
  }
}

class ValueList {
  constructor(data, parentItem, property) {
    this.depth = parentItem === null ? 0 : parentItem.list.depth + 1;
    this.isOR = !data.xorValues;
    this.isXOR = !data.orValues;
    this.parentItem = parentItem;
    this.listProperty = property;
    this.items = (this.isOR ? data.orValues : data.xorValues).map(
      itemData => new ValueListItem(itemData, this)
    );
  }
  checkAll() {
    this.items.forEach(item => {
      let childList = item.childList;
      item.checked(true);
      if (childList && childList.isOR) {
        childList.checkAll();
      } else if (childList && childList.isXOR) {
        childList.checkFirst();
      }
    });
  }
  checkFirst() {
    let item = this.items[0],
        childList = item.childList;
    item.checked(true);
    if (childList && childList.isOR) {
      childList.checkAll();
    } else if (childList && childList.isXOR) {
      childList.checkFirst();
    }
  }
  uncheckAll() {
    this.items.forEach(item => {
      item.checked(false);
      if (item.childList) {
        item.childList.uncheckAll();
      }
    });
  }
  uncheckAllBut(specialItem) {
    this.items.forEach(item => {
      if (item !== specialItem) {
        item.checked(false);
      }
    });
  }
  get hasNoChildList() {
    return this.items.every(item => !item.childList);
  }
  invertSelection() {
    this.items.forEach(item => {
      item.checked(!item.checked());
    });
  }
  rotateSelection() {
    let found = false, rotated = false;
    this.items.forEach(item => {
      if (item.checked()) {
        found = true;
        item.checked(false);
      } else if (found && !rotated) {
        item.checked(true);
        rotated = true;
      }
    });
    if (!found) this.items[0].checked(true);
  }
}


function compareOnDepth(x, y, depth) {
  let a = x.getListItemOnDepth(depth),
      b = y.getListItemOnDepth(depth),
      ai = a.list.items.indexOf(a),
      bi = b.list.items.indexOf(b);
  if (ai < bi) return -1;
  if (ai > bi) return 1;
  return 0;
}

function sortTwoValueListItems(a, b) {
  let depth = 0,
      x = compareOnDepth(a, b, depth);
  while(x === 0 || a.list.depth < depth && b.list.depth < depth) {
    depth += 1;
    x = compareOnDepth(a, b, depth);
  }
  return x;
}

class ValueListItem {
  constructor(data, list) {
    this.list = list;
    this.name = data.name;
    this.checked = ko.observable(null);
    this.userChecked = this.getUserChecked();
    this.editable = data.editable || false;
    this.disabledInChannels = data.disabledInChannels;
    this.disabled = this.getDisabledInfo();
    this.value = this.editable ? this.getValidatingValue(): data.value;
    this.childList = (data.orValues || data.xorValues ?
      new ValueList(data, this, list.listProperty) : null);
    this.addNameToChildNames = data.addNameToChildNames || false;

    this.tuneXOR();
    this.tuneParentList();
    this.tuneChildList();
    this.tuneEditable();
    this.tuneCumulativeValue();
  }
  getDisabledInfo() {
    let channelIds = this.disabledInChannels;
    if (channelIds && channelIds.length > 0) {
      return ko.computed(function () {
        let channelId = this.list.listProperty.unitType().channel.id;
        return channelIds.indexOf(channelId) > -1;
      }, this);
    } else {
      return false;
    }
  }
  getUserChecked() {
    return ko.computed({
      read: this.checked,
      write: function (newValue) {
        this.list.listProperty._lastActiveDepth = this.list.depth;
        this.checked(newValue);
      }
    }, this);
  }
  getValidatingValue() {
    let observable = ko.observable('');
    let computed = ko.computed({
      read: observable,
      write: function (newVal) {
        let oldVal = observable(),
            newTunedVal = this.list.listProperty.makeValueValid(newVal);
        if (newTunedVal !== oldVal) {
          observable(newTunedVal);
        } else if (newVal !== oldVal) {
          observable.notifySubscribers(newTunedVal);
        }
      }
    }, this).extend({ notify: 'always' });
    return computed;
  }
  tuneXOR() {
    if (this.list.isXOR) {
      ko.computed(function () {
        if (this.checked()) {
          this.list.uncheckAllBut(this);
        }
      }, this);
    }
  }
  get isChangeStraightforward() {
    // Возвращает true, если галочка изменилась под направленным
    // непосредственно на нее действием пользователя. Если же галочка
    // устанавливается или снимается автоматически, например, при нажатии
    // на родительскую галочку, то возвращает false.
    return this.list.listProperty._lastActiveDepth === this.list.depth;
  }
  tuneParentList() {
    if (this.list.depth > 0) {
      ko.computed(function () {
        let checked = this.checked(), list = this.list,
            parentItem = list.parentItem;
        if (this.isChangeStraightforward) {
          if (checked && !parentItem.checked.peek()) {
            parentItem.checked(true);
          } else if (!checked
              && parentItem.checked.peek()
              && list.items.every(item => !item.checked.peek())) {
            parentItem.checked(false);
          }
        }
      }, this);
    }
  }
  tuneChildList() {
    if (this.childList) {
      ko.computed(function () {
        let checked = this.checked(),
            childList = this.childList;
        if (this.isChangeStraightforward) {
          if (checked && childList.isOR) {
            childList.checkAll();
          } else if (checked && childList.isXOR) {
            childList.checkFirst();
          } else if (!checked) {
            childList.uncheckAll();
          }
        }
      }, this);
    }
  }
  tuneEditable() {
    if (this.editable) {
      // Ставить/снимать галочку в зависимости от введенного значения
      ko.computed(function () {
        this.checked(!!this.value());
      }, this);
      // Снимать галочку и активировать поле ввода, если значение пусто
      ko.computed(function () {
        if (this.checked() && !this.value.peek()) {
          if (this.isChangeStraightforward) {
            jQuery(this.userChecked.checkboxComponent)
              .siblings('.ui.input').first()
              .find('input[type="text"]')
              .focus();
          }
          this.checked(false);
        }
      }, this);
    }
  }
  tuneCumulativeValue() {
    ko.computed(function () {
      let chosenValues = this.list.listProperty.chosenValues,
          disabled = this.disabled,
          checked = this.checked();
      disabled = ko.isObservable(disabled) ? disabled() : disabled;
      if (isImportant(this.value)) {
        chosenValues.remove(this);
        if (checked && !disabled) {
          chosenValues.push(this);
          chosenValues.sort(sortTwoValueListItems);
        }
      }
    }, this);
  }
  getListItemOnDepth(depth) {
    if (depth === this.list.depth) {
      return this;
    }
    return this.list.parentItem.getListItemOnDepth(depth);
  }
}

export {
  defaultPropertiesList, propertiesLists, SearchUnitProperty,
  IntervalProperty, TextProperty, ListProperty
};
