import ko from 'knockout';

const template = `

  <div class="ui inline input bmpp-number">
    <label>от</label>
    <input type="text" pattern="-?[0-9]*" inputmode="numeric"
      data-bind="attr: { placeholder: property.from.placeholder },
        value: validatableFrom, valueUpdate: 'input',">
    <div class="bmpp-numberControls">
      <i class="grey link icon sort up"
        data-bind="click: step(validatableFrom, '+')"></i>
      <i class="grey link icon sort down"
        data-bind="click: step(validatableFrom, '-')"></i>
    </div>
  </div>

  <div class="ui inline input bmpp-number">
    <label>до</label>
    <input type="text" pattern="-?[0-9]*" inputmode="numeric"
      data-bind="attr: { placeholder: property.to.placeholder },
        value: validatableTo, valueUpdate: 'input',">
    <div class="bmpp-numberControls">
      <i class="grey link icon sort up"
        data-bind="click: step(validatableTo, '+')"></i>
      <i class="grey link icon sort down"
        data-bind="click: step(validatableTo, '-')"></i>
    </div>
  </div>

  <span class="bmpp-units" data-bind="text: property.units"></span>

`;

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
      step = function (observable, direction) {
        return function () {
          let ro = observable.relatedObservable,
              value = ro();
          if (value === null) value = ro.min > 0 ? ro.min : 0;
          if (direction === '+') value = Math.floor(value / ro.step + 1) * ro.step;
          if (direction === '-') value = Math.ceil(value / ro.step - 1) * ro.step;
          if (value < ro.min) value = ro.min;
          if (ro.max !== null && value > ro.max) value = ro.max;
          ro(value);
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
