import ko from 'knockout';

var data = [

  { type: 'interval', name: 'Длительность', id: 'duration',
    help: '', units: 'миллисекунд', step: 20 },

  { type: 'list', name: 'Участники', id: 'participants',
    valueList: { orValues: [
      { name: 'Рассказчик', value: 'N' },
      { name: 'Комментатор', value: 'C', disableOn: ['ocul'] },
      { name: 'Пересказчик', value: 'R' }
    ]}
  },

  { type: 'list', name: 'Совпадение участников', id: 'same_participant',
    valueList: { xorValues: [
      { name: 'Да', value: true },
      { name: 'Нет', value: false },
    ]}
  },

  { type: 'text', name: 'Словарная форма', id: 'word',
    placeholder: '…'},

  { type: 'interval', name: 'Позиция от начала ЭДЕ', id: 'n_from_edu' },

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

function keepZero(...args) {
  // Вычисляет аналог выражения:  arg1 || arg2 || ... || argN,
  // но считает, что цифра ноль это тоже тру.
  for (let i = 0; i < args.length - 1; i++) {
    let arg = args[i];
    if (arg || arg === 0) return arg;
  }
  if (args.length > 0) return args.slice(-1)[0];
}

class SearchUnitProperty {
  constructor(data) {
    this.type = data.type;
    this.id = data.id;
    this.name = data.name;
    this.help = data.help || '';
    this.value = ko.observable(null);

    this.virtualKeyboard = data.virtualKeyboard || false;
    this.validChars = data.validChars;
    this.validitySusbstitutions = this.getValueSubstitutions(data);
  }
  static createByType(data) {
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
}

class IntervalProperty extends SearchUnitProperty {
  constructor(data) {
    super(data);

    this.from = ko.observable(null);
    this.to = ko.observable(null);
    this.units = data.units || '';

    this.from.min = keepZero(data.fromMin, data.min, 0);
    this.from.max = keepZero(data.fromMax, data.max, null);
    this.from.step = data.fromStep || data.step || 1;
    this.from.placeholder = data.fromPlaceholder || '';

    this.to.min = keepZero(data.toMin, data.min, 0);
    this.to.max = keepZero(data.toMax, data.max, null);
    this.to.step = data.toStep || data.step || 1;
    this.to.placeholder = data.toPlaceholder || '';

    this.validitySusbstitutions = this.getValueSubstitutions(data);

    ko.computed(function () {
      let interval = [this.from(), this.to()];
      interval = interval.filter(x => x !== null);
      this.value(interval.length > 0 ? interval : null);
    }, this);
  }
  getValueSubstitutions(data) {
    let ss = super.getValueSubstitutions(data);
    ss.push([/[^\d]/g, '']);
    return ss;
  }
}

class TextProperty extends SearchUnitProperty {
  constructor(data) {
    super(data);
    this.placeholder = data.placeholder || '';
  }
}

function escapeRegExp(string) {
  return string.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&');
}

class ListProperty extends SearchUnitProperty {
  constructor(data) {
    super(data);
    this.valueList = new ValueList(data.valueList, this.value);
    this.displayValues = data.displayValues || false;
  }
}

class ValueList {
  constructor(data, value) {
    this.isTop = !data.name;
    this.isOR = !data.xorValues;
    this.isXOR = !data.orValues;
    this.values = ko.observableArray([]);
    this.items = (this.isOR ? data.orValues : data.xorValues).map(
      itemData => new ValueListItem(itemData, this)
    );
    ko.computed(function () {
      let values = this.values();
      if (this.isTop) {
        if (values.length > 0) {
          value(this.isOR ? values : values[0]);
        } else {
          value(null);
        }
      } else {
        if (values.length > 0) {
          this.clearMyValuesFrom(value);
          value.concat(this.isOR ? values : values.slice(0, 1));
        } else {
          value.removeAll(values);
        }
      }
    }, this);
  }
  setValue(value) {
    this.items.forEach(item => {
      if (item.value !== value) {
        this.values.remove(item.value);
        item.checked(false);
        item.childValueList && item.childValueList.setValue(value);
      } else {
        this.values.push(value);
        item.checked(true);
      }
    });
  }
  clearMyValuesFrom(observableArray) {
    this.items.forEach(item => {
      observableArray.remove(item.value);
    });
  }
}

class ValueListItem {
  constructor(data, parentValueList) {
    this.name = data.name;
    this.value = data.value;
    this.checked = ko.observable(null);

    ko.computed(function () {
      let checked = this.checked(),
          value = this.value;
      if (checked && parentValueList.isOR) {
        parentValueList.values.push(value);
      } else if (checked && parentValueList.isXOR) {
        parentValueList.setValue(value);
      } else {
        parentValueList.values.remove(value);
      }
    }, this);

    this.childValueList = null;
    if (data.orValues || data.xorValues) {
      this.childValueList = new ValueList(data, parentValueList.values);
    }
  }
}

export {
  data, SearchUnitProperty,
  IntervalProperty, TextProperty, ListProperty
};
