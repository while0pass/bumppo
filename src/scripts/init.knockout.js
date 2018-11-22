import jQuery from 'jquery';

import Checkbox from '../ko.components/checkbox.js';
import IntervalProperty from '../ko.components/intervalProperty.js';
import ListProperty from '../ko.components/listProperty.js';
import PropertiesPane from '../ko.components/propertiesPane.js';
import QueryNode from '../ko.components/queryNode.js';
import QueryNodeRelations from '../ko.components/queryNodeRelations.js';
import QueryPane from '../ko.components/queryPane.js';
import SearchUnitChoice from '../ko.components/searchUnitChoice.js';
import SearchUnitProperty from '../ko.components/searchUnitProperty.js';
import SubcorpusPane from '../ko.components/subcorpusPane.js';
import TextProperty from '../ko.components/textProperty.js';

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
  ko.components.register('text-property', TextProperty);
  ko.components.register('interval-property', IntervalProperty);
  ko.components.register('list-property', ListProperty);
  ko.components.register('search-unit-property', SearchUnitProperty);
  ko.components.register('properties-pane', PropertiesPane);
  ko.components.register('bmpp-checkbox', Checkbox);
  ko.components.register('query-pane', QueryPane);
  ko.components.register('subcorpus-pane', SubcorpusPane);
  ko.components.register('query-node', QueryNode);
  ko.components.register('query-node-relations', QueryNodeRelations);
  ko.components.register('search-unit-choice', SearchUnitChoice);
  ko.applyBindings(viewModel);
}
