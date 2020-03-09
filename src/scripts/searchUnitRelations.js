import ko from 'knockout';
import { ListProperty, IntervalProperty,
  injectNodeNumbers } from './searchUnitProperties.js';

const SAME_PARTICIPANT_RELATION_ID = Symbol('sameParticipant');

const r_sameParticipant = {
  type: 'list', name: 'Совпадение участников', id: SAME_PARTICIPANT_RELATION_ID,
  help: 'Участники единиц #1# и #2# совпадают.',
  valueList: { xorValues: [
    { name: 'Участники #1# и #2# совпадают', value: true },
    { name: 'Не совпадают', value: false },
  ]}};

const rp_occurrence = {
  type: 'list', name: 'Встречаемость', id: 'occurrence',
  valueList: { radioButtons: true, xorValues: [
    { name: 'должны встречаться', value: true },
    { name: 'не должны встречаться', value: false },
  ]}};

const MILLISECONDS = 'ms',
      UNITS = 'units';

const rp_units = {
  type: 'list', name: 'Единицы измерения', id: 'units',
  valueList: { radioButtons: true, xorValues: [
    { name: 'миллисекунд', value: MILLISECONDS },
    { name: 'единиц', value: UNITS },
  ]}};

const END_BGN = 'begin_2_end_1',
      BGN_END = 'end_2_begin_1',
      BGN_BGN = 'begin_2_begin_1',
      END_END = 'end_2_end_1';

const rp_referencePoints = {
  type: 'list', name: 'Точки отсчета', id: 'refPoints',
  valueList: { radioButtons: true, xorValues: [
    { name: 'от конца #1# до начала #2#', icon: 'align center',
      value: END_BGN, title: 'От конца первой единицы до начала второй' },
    { name: 'от начала #1# до конца #2#', icon: 'align justify',
      value: BGN_END, title: 'От начала первой единицы до конца второй' },
    { name: 'от начала #1# до начала #2#', icon: 'align left',
      value: BGN_BGN , title: 'От начала первой единицы до начала второй' },
    { name: 'от конца #1# до конца #2#', icon: 'align right',
      value: END_END, title: 'От конца первой единицы до конца второй' },
  ]}};

const rp_msDistance = {
  type: 'interval', name: 'Расстояние в мс', unitsBanner: 'мс',
  step: 20, allowNegatives: true, neverEmpty: true };

const rp_unitsDistance = {
  type: 'interval', name: 'Расстояние в единицах', unitsBanner: 'ед.',
  step: 1, allowNegatives: true, neverEmpty: true };

const AND_TYPE = Symbol('and');

class Connective {
  constructor(Relation, ...args) {
    this.type = AND_TYPE;
    this.name = (new Relation(...args)).name;
    this.Relation = Relation;
    this.args = args;
    this.relationsOrConnectives = ko.observableArray([ this.addRelation() ]);
    this.banner = this.getBanner();
  }
  addRelation() {
    let relation = new this.Relation(...this.args);
    relation = this.tuneRelation(relation);
    if (this.relationsOrConnectives) {
      this.relationsOrConnectives.push(relation);
    } else {
      return relation;
    }
  }
  tuneRelation(relation) {
    relation.$connective = this;
    relation.$$addRelation = $data => $data.$connective.addRelation();
    relation.$$removeRelation = $data => $data.$connective.removeRelation($data);
    return relation;
  }
  removeRelation(relation) {
    this.relationsOrConnectives.remove(relation);
  }
  getBanner() {
    return ko.computed(() => {
      return this.relationsOrConnectives()
        .map(rel => ko.unwrap(rel.banner)).join('.\u2002');
    }, this);
  }
  do(func) {
    this.relationsOrConnectives().forEach(item => {
      if (item instanceof this.Relation) func(item);
      if (item instanceof Connective) item.do(func);
    });
  }
}


const DISTANCE_RELATION_TYPE = Symbol('distance'),
      distanceHelp = `

  <header class="ui header">Условие на расстояние</header>

  <p>В качестве условий можно по отдельности указывать интервалы расстояний
  между началами (левыми границами) и концами (правыми границами) единиц.
  Например, если задать условие «от&nbsp;50 до&nbsp;100&nbsp;мс между началом
  X и началом Y», будут найдены контексты, в которых левая граница
  X располагается от 50 до 100&nbsp;мс правее левой границы Y.</p>

  <p>Если для условия указано только одно значение, ограничения с другой
  стороны не накладывается. Если не указано ни одно значение, это
  интерпретируется как интервал «от&nbsp;0 до&nbsp;0». Значения задаются
  в миллисекундах. Если X и Y являются единицам одного типа, между началом
  X и концом Y можно задать расстояние в терминах единицы данного типа.</p>

  <p>Расстояние можно указывать в отрицательных единицах.</p>

`;

class Distance {
  constructor(node1, node2) {
    this.node1 = node1;
    this.node2 = node2;
    this.type = DISTANCE_RELATION_TYPE;
    this.name = 'Расстояние';
    this.help = distanceHelp;

    this.units = new ListProperty(rp_units, node1, node2);
    this.intervalInMs = new IntervalProperty(rp_msDistance, node1, node2);
    this.intervalInUnits = new IntervalProperty(rp_unitsDistance, node1, node2);
    this.referencePoints = new ListProperty(rp_referencePoints, node1, node2);
    this.occurrence = new ListProperty(rp_occurrence, node1, node2);

    this.onHeaderClick = undefined;
    this.refPoints = undefined;
    this.unitsFirstValueName = rp_units.valueList.xorValues[0].name;
    this.measureInMs = this.getMeasureInMsIndicator();
    this.banner = this.getBanner();
  }
  getMeasureInMsIndicator() {
    return ko.computed(function () {
      return this.units.value() === MILLISECONDS;
    }, this);
  }
  getBanner() {
    const REF_POINTS = rp_referencePoints.valueList.xorValues.reduce(
      (obj, x) => { obj[x.value] = x.name; return obj; }, {});
    let banner = ko.computed(function () {
      let measureInMs = this.measureInMs(),
          msDistance = ko.unwrap(this.intervalInMs.banner),
          unitsDistance = ko.unwrap(this.intervalInUnits.banner),
          distance = measureInMs ? msDistance : unitsDistance,
          referencePoints = REF_POINTS[this.referencePoints.value()],
          _arr = this.occurrence.chosenValues(),
          occurrence = _arr.length > 0 ? _arr[0].name : '',
          banner = measureInMs ? `

            Единицы типа #2# ${ occurrence }
            на расстоянии ${ distance } ${ referencePoints }

          ` : `

            Единицы типа #2# ${ occurrence }
            на удалении ${ distance } от #1#

          `;
      return banner;
    }, this);
    return injectNodeNumbers(banner, this.node1, this.node2);
  }
}


class NodesRelationsFormula {
  constructor(node1, node2) {
    this.node1 = node1;
    this.node2 = node2;

    let [relations, relationsMap] = this.getRelations();
    this.relations = ko.observableArray(relations);
    this.relationsMap = relationsMap;
    this.visibleRelations = this.getVisibleRelations();
    this.chosenRelations = this.getChosenRelations();

    this.sameUnitType = this.getSameUnitTypeIndicator();
    this.sameParticipants = this.getSameParticipantsIndicator();
    this.sameUnitTypeAndParticipants = this.getSameUTPIndicator();
  }
  getRelations() {
    const defaultRelations = [
      { relation: new ListProperty(r_sameParticipant, this.node1, this.node2),
        check: this.showSameParticipantsRelation(this) },
      { relation: new Connective(Distance, this.node1, this.node2),
        check: () => true },
    ];
    const relationsMap = {};
    defaultRelations.forEach(item => {
      let key = item.relation.id || item.relation.type;
      relationsMap[key] = item.relation;
    });
    return [defaultRelations, relationsMap];
  }
  resetToDefault() {
    let [relations, relationsMap] = this.getRelations();
    this.relations(relations);
    this.relationsMap = relationsMap;
  }
  getVisibleRelations() {
    return ko.computed(function () {
      return this.relations && this.relations()
        .filter(item => item.check())
        .map(item => item.relation);
    }, this);
  }
  getChosenRelations() {
    return ko.computed(function () {
      return this.visibleRelations && this.visibleRelations()
        .filter(rel => ko.unwrap(rel.banner));
    }, this);
  }
  seppuku() {
    this.sameUnitTypeAndParticipants.dispose();
    this.sameParticipants.dispose();
    this.sameUnitType.dispose();
    this.chosenRelations.dispose();
    this.visibleRelations.dispose();
    delete this.relationsMap;
    delete this.relations;
    delete this.node2;
    delete this.node1;
  }
  getSameUnitTypeIndicator() {
    return ko.computed(function () {
      let n1 = this.node1,
          n2 = this.node2;
      return n2.unitType && n1.unitType() === n2.unitType();
    }, this);
  }
  showSameParticipantsRelation(self) {
    return function () {
      let n2 = self.node2;
      if (!n2.unitType || n2.unitType() === null) return false;
      let p1 = self.node1.getParticipants(),
          p2 = n2.getParticipants();
      if (p1.length === 1 && p2.length === p1.length) return false;
      for (let p of p1) if (p2.indexOf(p) > -1) return true;
      return false;
    };
  }
  getSameParticipantsIndicator() {
    let x = ko.computed(function () {
      let n2 = this.node2;
      if (!n2.unitType || n2.unitType() === null) return false;
      let p1 = this.node1.getParticipants(),
          p2 = n2.getParticipants();
      if (p1.length === 1 && p2.length === p1.length) {
        return p1[0] === p2[0];
      }
      let intersection = false;
      for (let p of p1) {
        if (p2.indexOf(p) > -1) {
          intersection = true;
          break;
        }
      }
      let val = this.relationsMap[SAME_PARTICIPANT_RELATION_ID].value();
      return intersection && val;
    }, this);
    return x;
  }
  getSameUTPIndicator() {
    let x = ko.computed(function () {
      return this.sameUnitType() && this.sameParticipants();
    }, this);
    x.subscribe(function (value) {
      if (!value) {
        let func = relation => relation.units.valueList.checkFirstAsIfByUser();
        this.relationsMap[AND_TYPE].do(func);
      }
    }, this);
    return x;
  }
}

export { NodesRelationsFormula, Connective,
  SAME_PARTICIPANT_RELATION_ID,
  DISTANCE_RELATION_TYPE, AND_TYPE };
