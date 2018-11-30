var data = [
  { id: 'voc',
    name: 'Вокальные действия',
    unitsHeader: 'Вокальные единицы',
    color: 'red',
    types: [
      { name: 'Верхний уровень сегментации',
        types: [
          { name: 'Элементарная дискурсивная единица (ЭДЕ)', abbr: 'ЭДЕ', id: 'u_vEDU' },
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
          { name: 'Вокальное явление, накладывающееся на речь', id: 'u_vCollat' },
        ]},
    ]},

  { id: 'ocul',
    name: 'Направление взора',
    unitsHeader: 'Единицы окуломоторного канала',
    color: 'orange',
    types: [
      { name: 'Фиксация', id: 'u_oFixation' },
    ]},

  { id: 'facial',
    name: 'Мимика',
    unitsHeader: 'Единицы канала мимики',
    color: 'yellow',
    disabled: true,
    types: []},

  { id: 'ceph',
    name: 'Жесты головы',
    unitsHeader: 'Единицы цефалической жестикуляции',
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
    unitsHeader: 'Единицы мануальной жестикуляции',
    color: 'teal',
    types: [
      { name: 'Первый уровень сегментации',
        types: [
          { name: 'Движение', id: 'u_mMovement', tiers: ['-mLtMovement', '-mRtMovement'] },
          { name: 'Неподвижность', id: 'u_mStillness', tiers: ['-mLtStillness', '-mRtStillness'] },
        ]},
      { name: 'Второй уровень сегментации',
        types: [
          { name: 'Жест', id: 'u_mGesture', tiers: ['-mGesture'] },
          { name: 'Адаптор', id: 'u_mAdaptor', tiers: ['-mAdaptor'] },
          { name: 'Смена позы', id: 'u_mPostureAccomodator', tiers: ['-mPostureAccomodator'] },
        ]},
      { name: 'Третий уровень сегментации',
        types: [
          { name: 'Мануальная поза', id: 'u_mPosture', tiers: ['-mPosture'] },
          { name: 'Фаза перехода', id: 'u_mPostureChange', tiers: ['-mPostureChange'] },
          { name: 'Двигательная цепочка', id: 'u_mMovementChain', tiers: ['-mMovementChain'] },
          { name: 'Жестовая цепочка', id: 'u_mGestureChain', tiers: ['-mGestureChain'] },
        ]},
    ]},

  { id: 'torso',
    name: 'Движения тела',
    unitsHeader: 'Единицы жестикуляции тела',
    color: 'blue',
    disabled: true,
    types: []},

  { id: 'prox',
    name: 'Проксемика',
    unitsHeader: 'Единицы проксемики',
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
    this.hasAbbr = Boolean(data.abbr);
    this.abbr = data.abbr || '';

    if (data.tiers) {
      this.tiers = data.tiers;
    }
  }
}

class UnitGroup {
  constructor(data, channel) {
    this.name = data.name;
    this.channel = channel;
    this.units = [];
    this.totalNumberOfUnits = 0;

    this.populateUnits(data);
  }
  populateUnits(data) {
    for (let x of data.types) {
      this.units.push(new Unit(x, this.channel, this));
      this.totalNumberOfUnits += 1;
    }
  }
}

class Channel {
  constructor(data) {
    this.id = data.id;
    this.name = data.name || '';
    this.unitsHeader = data.unitsHeader || '';
    this.color = data.color;
    this.disabled = data.disabled;

    this.groups = [];
    this.units = [];
    this.totalNumberOfUnits = 0;

    this.populateGroupsAndUnits(data);
  }
  populateGroupsAndUnits(data) {
    for (let x of data.types) {
      if (x.types) {
        let unitGroup = new UnitGroup(x, this);
        this.groups.push(unitGroup);
        this.totalNumberOfUnits += unitGroup.totalNumberOfUnits;
      } else {
        this.units.push(new Unit(x, this));
        this.totalNumberOfUnits += 1;
      }
    }
  }
  getSingleUnit() {
    if (this.totalNumberOfUnits === 1) {
      let x = this.units.slice()
        .concat(...this.groups.map(g => g.units.slice()));
      if (x.length > 0) return x[0];
    }
    return null;
  }
}

let channels = [];

for (let x of data) {
  channels.push(new Channel(x));
}

export { channels };
