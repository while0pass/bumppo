import ko from 'knockout';
import { beautifyNumber } from '../scripts/searchUnitProperties.js';

const template = `

  <div class="ui inline input bmpp-number">
    <label data-bind="text: property.from.label"></label>
    <input type="text" pattern="[-\\u2212]?[0-9\\s]*" inputmode="numeric"
      data-bind="attr: { placeholder: property.from.placeholder },
        value: validatableFrom">
    <div class="bmpp-numberControls">
      <i class="grey link icon sort up"
        data-bind="click: step('+', validatableFrom, '<=', validatableTo)"></i>
      <i class="grey link icon sort down"
        data-bind="click: step('-', validatableFrom, '<=', validatableTo)"></i>
    </div>
  </div>

  <div class="ui inline input bmpp-number">
    <label data-bind="text: property.to.label"></label>
    <input type="text" pattern="[-\\u2212]?[0-9\\s]*" inputmode="numeric"
      data-bind="attr: { placeholder: property.to.placeholder },
        value: validatableTo">
    <div class="bmpp-numberControls">
      <i class="grey link icon sort up"
        data-bind="click: step('+', validatableTo, '>=', validatableFrom)"></i>
      <i class="grey link icon sort down"
        data-bind="click: step('-', validatableTo, '>=', validatableFrom)"></i>
    </div>
  </div>

  <span class="bmpp-units" data-bind="text: property.units"></span>

`;

// FIXME: Переписать с ko.extenders. См. ветку ft-koExtenderNumeric, где
// не до конца срабатывают взаимные ограничения на то, чтобы from был
// меньше или равен to, и аналогчиное наоборот.
function getIntSelfValidating(observable, property) {
  function readValue() {
    let value = observable();
    return typeof value === 'number' ? beautifyNumber(value) : '';
  }
  function writeValue(newStrVal) {
    let oldNumVal = observable(),
        oldStrVal = readValue(),
        newValidStrVal = property.makeValueValid(newStrVal),
        newNumVal = parseInt(newValidStrVal, 10),
        newValidNumVal;
    if (observable.min !== null && newNumVal < observable.min) {
      newNumVal = observable.min;
    }
    if (observable.max !== null && newNumVal > observable.max) {
      newNumVal = observable.max;
    }
    newValidNumVal = isNaN(newNumVal) ? null : newNumVal;
    if (newValidNumVal !== oldNumVal) {
      observable(newValidNumVal);
    } else if (newStrVal !== oldStrVal) {
      observable.notifySubscribers(newValidNumVal);
    }
  }
  let o = ko.computed(
    { read: readValue, write: writeValue }).extend({ notify: 'always' });
  o.relatedObservable = observable;
  return o;
}

// eslint-disable-next-line no-unused-vars
var viewModelFactory = (params, componentInfo) => {
  let property = params.property,
      validatableFrom = getIntSelfValidating(property.from, property),
      validatableTo = getIntSelfValidating(property.to, property),
      step = function (direction, target, op, arg) {
        return function () {
          const LE = '<=', GE = '>=';
          let t = target.relatedObservable,
              a = arg.relatedObservable(),
              value = t();
          if (value === null) {
            if (op === GE) {
              value = Math.max(0,
                t.min === null || t.min === undefined ? 0 : t.min,
                a === null || a === undefined ? 0 : a);
            } else if (op === LE) {
              value = Math.min(0,
                t.max === null || t.max === undefined ? 0 : t.max,
                a === null || a === undefined ? 0 : a);
            }
          } else {
            if (direction === '+') value = Math.floor(value / t.step + 1) * t.step;
            if (direction === '-') value = Math.ceil(value / t.step - 1) * t.step;
          }
          if (t.min !== null && value < t.min) value = t.min;
          if (t.max !== null && value > t.max) value = t.max;
          t(value);
        };
      };
  return {
    property: property,
    step: step,
    validatableFrom: validatableFrom,
    validatableTo: validatableTo
  };
};

export default {
  viewModel: { createViewModel: viewModelFactory },
  template: template
};
