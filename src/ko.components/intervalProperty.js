import ko from 'knockout';

const template = `

  <div class="ui inline input bmpp-number">
    <label data-bind="text: property.from.label"></label>
    <input type="text" pattern="-?[0-9]*" inputmode="numeric"
      data-bind="attr: { placeholder: property.from.placeholder },
        value: validatableFrom">
    <div class="bmpp-numberControls">
      <i class="grey link icon sort up"
        data-bind="click: step('+', validatableFrom)"></i>
      <i class="grey link icon sort down"
        data-bind="click: step('-', validatableFrom)"></i>
    </div>
  </div>

  <div class="ui inline input bmpp-number">
    <label data-bind="text: property.to.label"></label>
    <input type="text" pattern="-?[0-9]*" inputmode="numeric"
      data-bind="attr: { placeholder: property.to.placeholder },
        value: validatableTo">
    <div class="bmpp-numberControls">
      <i class="grey link icon sort up"
        data-bind="click: step('+', validatableTo, validatableFrom)"></i>
      <i class="grey link icon sort down"
        data-bind="click: step('-', validatableTo, validatableFrom)"></i>
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
    return (typeof value === 'number') ? value.toString() : '';
  }
  function writeValue(newStrVal) {
    let oldNumVal = observable(),
        oldStrVal = readValue(),
        newValidStrVal = property.makeValueValid(newStrVal),
        newNumVal = parseInt(newValidStrVal, 10),
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
      step = function (direction, target, lessOrEqual=null) {
        return function () {
          let t = target.relatedObservable,
              le = lessOrEqual && lessOrEqual.relatedObservable(),
              value = t();
          if (value === null) {
            value = Math.max(0,
              t.min === null || t.min === undefined ? 0 : t.min,
              le === null || le === undefined ? 0 : le);
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
