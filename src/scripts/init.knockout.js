import jQuery from 'jquery';
import { escapeRegExp } from './searchUnitProperties.js';
import { route, navigate } from './routing.js';
import { getTimeTag, timeTagToMs } from './timeline.js';

import Checkbox from '../ko.components/checkbox.js';
import IntervalProperty from '../ko.components/intervalProperty.js';
import ListProperty from '../ko.components/listProperty.js';
import ListRelation from '../ko.components/listRelation.js';
import DistanceRelation from '../ko.components/distanceRelation.js';
import PropertiesPane from '../ko.components/propertiesPane.js';
import QueryNode from '../ko.components/queryNode.js';
import RelationsFormula from '../ko.components/relationsFormula.js';
import QueryPane from '../ko.components/queryPane.js';
import RadioButtons from '../ko.components/radioButtons.js';
import RelationsPane from '../ko.components/relationsPane.js';
import ResultsList from '../ko.components/resultsList.js';
import ResultsPane from '../ko.components/resultsPane.js';
import SearchUnitChoice from '../ko.components/searchUnitChoice.js';
import SearchUnitProperty from '../ko.components/searchUnitProperty.js';
import SearchUnitRelation from '../ko.components/searchUnitRelation.js';
import SubcorpusPane from '../ko.components/subcorpusPane.js';
import TextProperty from '../ko.components/textProperty.js';
import UnitProxy from '../ko.components/unitProxy.js';
import ValueList from '../ko.components/valueList.js';

export function preinit(ko) {
  ko.bindingHandlers.fadeVisible = {
    init: function(element, valueAccessor) {
      var value = valueAccessor();
      jQuery(element).toggle(ko.unwrap(value));
    },
    update: function(element, valueAccessor, allBindings) {
      var value = valueAccessor(),
          fadeInDuration = allBindings.get('fadeInDuration') || 400,
          fadeOutDuration = allBindings.get('fadeOutDuration') || 400;
      if (ko.unwrap(value)) {
        jQuery(element).fadeIn(fadeInDuration);
      } else {
        jQuery(element).fadeOut(fadeOutDuration);
      }
    }
  };
  ko.extenders.clientRouting = function (target, viewModel) {
    function writeValue(newHRef) {
      let oldHRef = target(),
          canViewResults = viewModel.canViewResults ?
            viewModel.canViewResults() : false,
          redirectedHRef = route(newHRef, canViewResults);
      if (redirectedHRef !== oldHRef) {
        target(redirectedHRef);
      } else if (newHRef !== oldHRef) {
        target.notifySubscribers(newHRef);
      }
    }
    let routedHRef = ko.computed({ read: target, write: writeValue })
      .extend({ notify: 'always' });
    routedHRef.subscribe(navigate);
    routedHRef(target());
    return routedHRef;
  };
}

export function init(ko, viewModel) {
  ko.bindingHandlers.popup = {
    init: function(element, valueAccessor, allBindings) {
      let content = ko.unwrap(valueAccessor()),
          opts = allBindings.get('popupOpts') || {};
      opts.html = content;
      jQuery(element).popup(opts);

      // Дополнительное отображение всплывающего окна по щелчку
      if (ko.unwrap(allBindings.get('popupAdditionalShowOnClick'))) {
        jQuery(element).click(function () {
          jQuery(element).popup('show');
        });
      }
    }
  };
  ko.bindingHandlers.inlinePopup = {
    init: function(element, valueAccessor) {
      let opts = ko.unwrap(valueAccessor()) || { inline: true };
      jQuery(element).popup(opts);
    }
  };
  ko.bindingHandlers.textLowercaseFirstChar = {
    update: function (element, valueAccessor) {
      let text = ko.unwrap(valueAccessor());
      jQuery(element).text(text.slice(0, 1).toLowerCase() + text.slice(1));
    }
  };

  ko.extenders.autoMorphingValue = function(target, substitutions) {
    let makeSubstitutions = string => {
      for (let i = 0; i < substitutions.length; i++) {
        let [ regexp, replacement ] = substitutions[i];
        if (typeof regexp === 'string') {
          regexp = new RegExp(escapeRegExp(regexp), 'g');
        }
        string = string.replace(regexp, replacement);
      }
      return string;
    };
    let result = ko.computed({
      read: target,
      write: function (newValue) {
        let current = target();
        if (typeof newValue === 'string') {
          let valueToWrite = makeSubstitutions(newValue);
          if (valueToWrite !== current) {
            target(valueToWrite);
          } else if (newValue !== current) {
            target.notifySubscribers(valueToWrite);
          }
        } else if (newValue instanceof Array) {
          let valueToWrite = newValue.slice();
          for (let i = 0; i < newValue.length; i++) {
            let item = newValue[i];
            if (typeof item === 'string') {
              valueToWrite[i] = makeSubstitutions(item);
            }
          }
          if (!(current instanceof Array)) {
            target(valueToWrite);
          } else if (JSON.stringify(valueToWrite) !== JSON.stringify(current)) {
            target(valueToWrite);
          } else if (JSON.stringify(newValue) !== JSON.stringify(current)) {
            target.notifySubscribers(valueToWrite);
          }
        } else if (newValue !== current) {
          target(newValue);
        }
      }
    }).extend({ notify: 'always' });

    result(target());
    return result;
  };
  ko.extenders.numeric = function (target, opts) {
    const dd = opts.maxDecimalDigits || 0,
          I = x => x,
          charDeleter = opts.regexp ? x => x.replace(opts.regexp, '') : I,
          { forward, backward } = opts.modifier || { forward: I, backward: I },
          numberfy = x => parseFloat(parseFloat(x).toFixed(dd)),
          defaultVal = typeof opts.default === 'number' ? opts.default : 0,
          maxVal = opts.max,
          minVal = typeof opts.min === 'number' ? opts.min : 0;
    function writeValue(value) {
      const oldVal = target(),
            oldNumVal = oldVal === null ? null : numberfy(forward(oldVal)),
            oldStrVal = typeof oldNumVal === 'number'
              ? oldNumVal.toString() : '',
            newValidStrVal = charDeleter(typeof value === 'string'
              ? value
              : typeof value === 'number'
                ? value.toString()
                : ''),
            newNumVal = numberfy(newValidStrVal);
      let newValidNumVal, finalValue;
      if (isNaN(newNumVal)) {
        newValidNumVal = opts.isNullable ? null : Math.max(defaultVal, minVal);
      } else {
        newValidNumVal = Math.max(newNumVal, minVal);
        if (typeof maxVal === 'number') {
          newValidNumVal = Math.min(newValidNumVal, maxVal);
        }
      }
      if (newValidNumVal === null) finalValue = null;
      else finalValue = backward(newValidNumVal);
      if (newValidNumVal !== oldNumVal) {
        target(finalValue);
      } else if (value !== oldStrVal) {
        target.notifySubscribers(finalValue);
      }
    }
    function readValue() {
      const value = target();
      if (value === null) return null;
      else return numberfy(forward(value));
    }
    const result = ko.computed({ read: readValue, write: writeValue })
      .extend({ notify: 'always' });
    result(readValue());
    return result;
  };
  ko.extenders.timePoint = function (target) {
    function writeValue(value) {
      const oldValue = target(),
            oldTag = getTimeTag(oldValue || 0, 1),
            processedValue = value.replace(/[^\d.:]/g, ''),
            finalValue = timeTagToMs(processedValue);
      if (finalValue === null) {
        target.notifySubscribers(oldValue);
      } else if (getTimeTag(finalValue, 1) !== oldTag) {
        target(finalValue);
      } else if (value !== processedValue) {
        target.notifySubscribers(finalValue);
      }
    }
    function readValue() {
      return getTimeTag(target() || 0, 1);
    }
    const result = ko.computed({ read: readValue, write: writeValue })
      .extend({ notify: 'always' });
    result(readValue());
    return result;
  };

  ko.components.register('text-property', TextProperty);
  ko.components.register('interval-property', IntervalProperty);
  ko.components.register('bmpp-value-list', ValueList);
  ko.components.register('list-property', ListProperty);
  ko.components.register('search-unit-property', SearchUnitProperty);
  ko.components.register('properties-pane', PropertiesPane);
  ko.components.register('radio-buttons', RadioButtons);
  ko.components.register('list-relation', ListRelation);
  ko.components.register('distance-relation', DistanceRelation);
  ko.components.register('search-unit-relation', SearchUnitRelation);
  ko.components.register('relations-pane', RelationsPane);
  ko.components.register('bmpp-checkbox', Checkbox);
  ko.components.register('query-pane', QueryPane);
  ko.components.register('subcorpus-pane', SubcorpusPane);
  ko.components.register('query-node', QueryNode);
  ko.components.register('relations-formula', RelationsFormula);
  ko.components.register('search-unit-choice', SearchUnitChoice);
  ko.components.register('unit-proxy', UnitProxy);
  ko.components.register('results-list', ResultsList);
  ko.components.register('results-pane', ResultsPane);
  ko.applyBindings(viewModel);
}
