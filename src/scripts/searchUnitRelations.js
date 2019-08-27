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
    { name: 'встречаются', value: true },
    { name: 'не встречаются', value: false },
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
    { name: 'от конца #1# до начала #2#', icon: 'align center', value: END_BGN },
    { name: 'от начала #1# до конца #2#', icon: 'align justify', value: BGN_END },
    { name: 'от начала #1# до начала #2#', icon: 'align left', value: BGN_BGN },
    { name: 'от конца #1# до конца #2#', icon: 'align right', value: END_END },
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
    this.sameTypeNodes = this.getSameNodeTypeIndicator();
    this.measureInMs = this.getMeasureInMsIndicator();
    this.banner = this.getBanner();
  }
  getSameNodeTypeIndicator() {
    let x = ko.computed(function () {
      let node1 = this.node1,
          node2 = this.node2;
      return node2.unitType && node1.unitType() === node2.unitType();
    }, this);
    x.subscribe(function (value) {
      if (!value) {
        this.units.valueList.checkFirstAsIfByUser();  // (*)

        // TODO: Если между единицами задано более одного условия на расстояние
        // и присутствует хотя бы одно условие, где расстояние задано в мс, то
        // вместо (*) все расстояния в единицах (но не миллисекундах) надо
        // удалить и оставить только расстояния в мс. Если же ни одного
        // расстояния в мс не задано, то удалить все расстояния, кроме одного,
        // где выставить в качестве единиц миллисекунды.

      }
    }, this);
    return x;
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
          occurrence = this.occurrence.value() ? 'встречаются' : 'не встречаются',
          banner = `

            Такие #1#, что на расстоянии ${ distance } ${ referencePoints }
            ${ occurrence } #2#

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
    this.relations = ko.observableArray(this.getRelations());
    this.chosenRelations = this.getChosenRelations();
  }
  getRelations() {
    const defaultRelations = [
      new ListProperty(r_sameParticipant, this.node1, this.node2),
      new Connective(Distance, this.node1, this.node2),
    ];
    return defaultRelations;
  }
  resetToDefault() {
    this.relations(this.getRelations());
  }
  getChosenRelations() {
    return ko.computed(function () {
      return this.relations && this.relations().filter(
        prop => ko.unwrap(prop.banner));
    }, this);
  }
  seppuku() {
    delete this.node1;
    delete this.node2;
    delete this.chosenRelations;
    delete this.relations;
  }
}

export { NodesRelationsFormula, Connective,
  SAME_PARTICIPANT_RELATION_ID,
  DISTANCE_RELATION_TYPE, AND_TYPE };
