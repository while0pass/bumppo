var data = [
  { id: 'voc',
    name: 'Вокальные действия',
    unitsHeader: 'Вокальные единицы',
    color: 'red',
    types: [
      { name: 'Верхний уровень сегментации',
        types: [
          { name: 'Элементарная дискурсивная единица (ЭДЕ)', abbr: 'ЭДЕ',
            id: 'u_vEDU', tierTemplate: '{ p_participants }-vLine',
            subtierTemplate: '{ p_participants }-vLineType',
            subtierValue: 'EDU' },

          { name: 'Изолированный смех', id: 'u_vLaughLine',
            tierTemplate: '{ p_participants }-vLine',
            subtierTemplate: '{ p_participants }-vLineType',
            subtierValue: 'Laugh' },

          { name: 'Изолированный кластер заполненных пауз', id: 'u_vFilledLine',
            tierTemplate: '{ p_participants }-vLine',
            subtierTemplate: '{ p_participants }-vLineType',
            subtierValue: 'Filled' },

          { name: 'Самостоятельное неречевое вокальное явление',
            id: 'u_vNonVerbalLine', tierTemplate: '{ p_participants }-vLine',
            subtierTemplate: '{ p_participants }-vLineType',
            subtierValue: 'NonVerbal' },
        ]},
      { name: 'Нижний уровень сегментации',
        types: [
          { name: 'Слово', id: 'u_vWord',
            tierTemplate: '{ p_participants }-vSegm',
            subtierTemplate: '{ p_participants }-vSType',
            subtierValue: 'Word' },

          { name: 'Cмех', id: 'u_vLaughSegm',
            tierTemplate: '{ p_participants }-vSegm',
            subtierTemplate: '{ p_participants }-vSType',
            subtierValue: 'Laugh' },

          { name: 'Заполненная пауза', id: 'u_vFilledSegm',
            tierTemplate: '{ p_participants }-vSegm',
            subtierTemplate: '{ p_participants }-vSType',
            subtierValue: 'Filled' },

          { name: 'Пауза со вдохом', id: 'u_vHPause',
            tierTemplate: '{ p_participants }-vSegm',
            subtierTemplate: '{ p_participants }-vSType',
            subtierValue: 'HPause' },

          { name: 'Неречевое вокальное действие', id: 'u_vOtherSegm',
            tierTemplate: '{ p_participants }-vSegm',
            subtierTemplate: '{ p_participants }-vSType',
            subtierValue: 'Other' },

          { name: 'Абсолютная пауза', id: 'u_v--AbsolutePause',
            tierTemplate: '{ p_participants }-vPause' },
        ]},
      { name: 'Параллельный уровень сегментации',
        types: [
          { name: 'Вокальное явление, накладывающееся на речь',
            id: 'u_vCollat', tierTemplate: '{ p_participants }-vCollat' },
        ]},
    ]},

  { id: 'ocul',
    name: 'Направление взора',
    unitsHeader: 'Единицы окуломоторного канала',
    color: 'orange',
    types: [
      { name: 'Фиксация', id: 'u_oFixation',
        tierTemplate: '{ p_participants }-oFixation' },
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
    disabled: true,
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
          { name: 'Движение', id: 'u_mMovement',
            tierTemplate: '{ p_participants }-m{ p_mHand }Movement' },

          { name: 'Неподвижность', id: 'u_mStillness',
            tierTemplate: '{ p_participants }-m{ p_mHand }Stillness' },
        ]},
      { name: 'Второй уровень сегментации',
        types: [
          { name: 'Жест', id: 'u_mGesture',
            tierTemplate: '{ p_participants }-mGesture' },

          { name: 'Адаптор', id: 'u_mAdaptor',
            tierTemplate: '{ p_participants }-mAdaptor' },

          { name: 'Смена позы', id: 'u_mPostureChange',
            tierTemplate: '{ p_participants }-mPostureChange' },
        ]},
      { name: 'Третий уровень сегментации',
        types: [
          { name: 'Мануальная поза', id: 'u_mPosture',
            tierTemplate: '{ p_participants }-mPosture' },

          { name: 'Фаза перехода', id: 'u_mPrPhase',
            tierTemplate: '{ p_participants }-mPrPhase' },

          { name: 'Двигательная цепочка', id: 'u_mMovementChain',
            tierTemplate: '{ p_participants }-mMovementChain' },

          { name: 'Жестовая цепочка', id: 'u_mGestureChain',
            tierTemplate: '{ p_participants }-mGestureChain' },
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
    this.tierTemplate = data.tierTemplate;
    this.subtierTemplate = data.subtierTemplate;
    this.subtierValue = data.subtierValue;
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
