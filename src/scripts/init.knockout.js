import jQuery from 'jquery';
import { escapeRegExp } from './searchUnitProperties.js';

import Checkbox from '../ko.components/checkbox.js';
import IntervalProperty from '../ko.components/intervalProperty.js';
import ListProperty from '../ko.components/listProperty.js';
import PropertiesPane from '../ko.components/propertiesPane.js';
import QueryNode from '../ko.components/queryNode.js';
import QueryNodeRelation from '../ko.components/queryNodeRelation.js';
import QueryNodeRelations from '../ko.components/queryNodeRelations.js';
import QueryPane from '../ko.components/queryPane.js';
import ResultsList from '../ko.components/resultsList.js';
import ResultsPane from '../ko.components/resultsPane.js';
import SearchUnitChoice from '../ko.components/searchUnitChoice.js';
import SearchUnitProperty from '../ko.components/searchUnitProperty.js';
import SubcorpusPane from '../ko.components/subcorpusPane.js';
import TextProperty from '../ko.components/textProperty.js';
import ValueList from '../ko.components/valueList.js';

export default function init(ko, viewModel) {
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
    function writeValue(value) {
      let le = opts.lessOrEqualTo && opts.lessOrEqualTo(),
          oldNumVal = target(),
          oldStrVal = typeof oldNumVal === 'number' ? oldNumVal.toString() : '',
          newValidStrVal = (typeof value === 'string' ?
            value : typeof value === 'number' ?
              value.toString() : '').replace(opts.regexp || /^$/, ''),
          newNumVal = parseInt(newValidStrVal, 10),
          newValidNumVal = isNaN(newNumVal) ?
            (opts.isNullable ?
              null : Math.max(
                le !== undefined && le !== null ? le : 0,
                opts.min !== undefined && opts.min !== null ? opts.min : 0,
                0)
            ) : newNumVal;
      if (newValidNumVal !== oldNumVal) {
        target(newValidNumVal);
      } else if (value !== oldStrVal) {
        target.notifySubscribers(newValidNumVal);
      }
    }
    let result = ko.computed({
      read: target,
      write: writeValue
    }).extend({ notify: 'always' });
    result(target());
    return result;
  };

  ko.components.register('text-property', TextProperty);
  ko.components.register('interval-property', IntervalProperty);
  ko.components.register('bmpp-value-list', ValueList);
  ko.components.register('list-property', ListProperty);
  ko.components.register('search-unit-property', SearchUnitProperty);
  ko.components.register('properties-pane', PropertiesPane);
  ko.components.register('bmpp-checkbox', Checkbox);
  ko.components.register('query-pane', QueryPane);
  ko.components.register('subcorpus-pane', SubcorpusPane);
  ko.components.register('query-node', QueryNode);
  ko.components.register('query-node-relation', QueryNodeRelation);
  ko.components.register('query-node-relations', QueryNodeRelations);
  ko.components.register('search-unit-choice', SearchUnitChoice);
  ko.components.register('results-list', ResultsList);
  ko.components.register('results-pane', ResultsPane);
  ko.applyBindings(viewModel);
}
