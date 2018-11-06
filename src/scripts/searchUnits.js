var data = [
  { id: 'voc',
    name: 'Вокальный канал',
    color: 'red',
    types: [
      { name: 'Верхний уровень сегментации',
        types: [
          { name: 'Элементарная дискурсивная единица (ЭДЕ)', id: 'u_vEDU' },
          { name: 'Изолированный смех', id: 'u_vLaughLine'},
          { name: 'Изолированный кластер заполненных пауз', id: 'u_vFilledLine' },
          { name: 'Самостоятельное неречевое вокальное явление', id: 'u_vNonVerbalLine' },
        ]},
      { name: 'Нижний уровень сегментации',
        types: [
          { name: 'Слово', id: 'u_vWord' },
          { name: 'Cмех', id: 'u_vLaughSegm'},
          { name: 'Заполненная пауза', id: 'u_vFilledSegm' },
          { name: 'Пауза со вдохом', id: 'u_vHPause' },
          { name: 'Неречевое вокальное действие', id: 'u_vOtherSegm' },
          { name: 'Абсолютная пауза', id: 'u_v--AbsolutePause' },
        ]},
      { name: 'Параллельный уровень сегментации',
        types: [
          { name: 'Вокальное явление, наклаюывающееся на речь', id: 'u_vCollat' },
        ]},
    ]},

  { id: 'ocul',
    name: 'Окуломоторный канал',
    color: 'orange',
    types: [
      { name: 'Фиксация', id: 'u_oFixation' },
    ]},

  { id: 'facial',
    name: 'Мимика',
    color: 'yellow',
    disabled: true,
    types: []},

  { id: 'ceph',
    name: 'Жесты головы',
    color: 'green',
    types: [
      { name: 'Базовый уровень сегментации',
        types: [
          { name: 'Движение', id: 'u_c1' },
          { name: 'Неподвижность', id: 'u_c2' },
        ]},
      { name: 'Дополнительный уровень сегментации',
        types: [
          { name: 'Жест', id: 'u_c3' },
          { name: 'Адаптор', id: 'u_c4' },
          { name: 'Смена позы', id: 'u_c5' },
        ]},
    ]},

  { id: 'manu',
    name: 'Жесты рук',
    color: 'teal',
    types: [
      { name: 'Первый уровень сегментации',
        types: [
          { name: 'Движение', id: 'u_m1' },
          { name: 'Неподвижность', id: 'u_m2' },
        ]},
      { name: 'Второй уровень сегментации',
        types: [
          { name: 'Жест', id: 'u_m3' },
          { name: 'Адаптор', id: 'u_m4' },
          { name: 'Смена позы', id: 'u_m5' },
        ]},
      { name: 'Третий уровень сегментации',
        types: [
          { name: 'Мануальная поза', id: 'u_m6' },
          { name: 'Фаза перехода', id: 'u_m7' },
          { name: 'Двигательная цепочка', id: 'u_m8' },
          { name: 'Жестовая цепочка', id: 'u_m9' },
        ]},
    ]},

  { id: 'torso',
    name: 'Движения тела',
    color: 'blue',
    disabled: true,
    types: []},

  { id: 'prox',
    name: 'Проксемика',
    color: 'violet',
    disabled: true,
    types: []},
];

class Unit {
  constructor(data, channel, group=null) {
    this.id = data.id;
    this.name = data.name;
    this.channel = channel;
    this.group = group;
  }
}

class UnitGroup {
  constructor(data, channel) {
    this.name = data.name;
    this.channel = channel;
    this.units = [];

    this.populateUnits(data);
  }
  populateUnits(data) {
    for (let x of data.types) {
      this.units.push(new Unit(x, this.channel, this));
    }
  }
}

class Channel {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.color = data.color;
    this.groups = [];
    this.units = [];

    this.populateGroupsAndUnits(data);
  }
  populateGroupsAndUnits(data) {
    for (let x of data.types) {
      if (x.types) {
        this.groups.push(new UnitGroup(x, this));
      } else {
        this.units.push(new Unit(x, this));
      }
    }
  }
}

let disabledChannelTooltip = 'Аннотация пока не готова',
    channels = [];

for (let x of data) {
  channels.push(new Channel(x));
}

export { channels, disabledChannelTooltip };
