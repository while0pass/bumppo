var data = [

  { type: 'interval', name: 'Длительность', id: 'duration',
    help: '', units: 'миллисекунд', min: 0 },

  { type: 'list', name: 'Участники', id: 'participants',
    valueList: { orValues: [
      { name: 'Рассказчик', value: 'N' },
      { name: 'Комментатор', value: 'C' },
      { name: 'Пересказчик', value: 'R' }
    ]}
  },

  { type: 'list', name: 'Совпадение участников', id: 'same_participant',
    valueList: { xorValues: [
      { name: 'Да', value: true },
      { name: 'Нет', value: false },
    ]}
  },

  { type: 'text', name: 'Словарная форма', id: 'word' },

  { type: 'interval', name: 'Позиция от начала ЭДЕ', id: 'n_from_edu',
    min: 0 },

  { type: 'list', name: 'Точка прерывания', id: 'p0',
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

  { type: 'list', name: 'Иллокутивно-фазовое значение', id: 'iphv',
    displayValues: true,
    valueList: { orValues: [
      { name: 'Иллокутивное', orValues: [
        { name: 'Завершение сообщения', value: '.' },
        { name: 'Вопрос', value: '?' },
        { name: 'Директив', value: '¡' },
        { name: 'Обращение', value: '@' },
        { name: 'Полуутверждение', value: '¿' },
        { name: 'Неполнота информации', value: '…' },
        { name: 'Восклицательность', value: '¿' },
      ]},
      { name: 'Фазовое', orValues: [
        { name: 'Стандартная незавершенность', value: ',' },
        { name: 'Незавершенность, восполняемая последующим контекстом', value: ':' },
        { name: 'Неполнота информации в контексте незавершенности', value: ',,,' },
        { name: 'Начальная часть сплита', value: '—' },
      ]},
      { name: 'Обрыв', orValues: [
        { name: 'При самоисправлении', value: '==' },
        { name: 'При апосиопезе', value: '~' },
        { name: 'При вмешательстве собеседника', value: '≈≈' },
      ]},
    ]}
  },

  { type: 'list', name: 'Фазовая структура', id: 'phs', displayValues: true,
    valueList: { orValues: [
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
      [/s/g, 'S'],
      [/[pрР]/g, 'P'],
      [/r/g, 'R'],
      [/\s+/g, ' '],
      [/ -/g, '-'],
      [/- /g, '-'],
      [/^ /g, ''],
      [/ $/g, ''],
    ]
  },

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

];

class SearchUnitProperty {
  constructor(data) {
    this.type = data.type;
    this.id = data.id;
    this.name = data.name;
    this.help = data.help || '';
    this.value = null;
  }
  createByType(data) {
    let map = {
          'interval': IntervalProperty,
          'text': TextProperty,
          'list': ListProperty
        },
        Property = map[data.type];
    if (Property) {
      return new Property(data);
    }
  }
}

class IntervalProperty extends SearchUnitProperty {
  constructor(data) {
    super(data);
    this.units = data.units || '';
    this.min = data.min;
  }
}

class TextProperty extends SearchUnitProperty {
  constructor(data) {
    super(data);
  }
}

class ListProperty extends SearchUnitProperty {
  constructor(data) {
    super(data);
    this.valueList = data.valueList;
    this.displayValues = data.displayValues || false;
    this.virtualKeyboard = data.virtualKeyboard || false;
    this.validChars = data.validChars;
    this.validitySusbstitutions = this.getValueSubstitutions(data);
  }
  getValueSubstitutions(data) {
    let substitutions = [];
    if (data.substitute && data.substitute.length) {
      substitutions = data.substitute;
    }
    if (data.validChars && data.validChars.length) {
      let invalidChars = `[^${ data.validChars.join('') }]`;
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
}

export {
  data, SearchUnitProperty,
  IntervalProperty, TextProperty, ListProperty
};
