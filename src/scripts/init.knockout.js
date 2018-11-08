import jQuery from 'jquery';

import QueryPane from '../ko.components/queryPane.js';
import SubcorpusPane from '../ko.components/subcorpusPane.js';
import QueryNode from '../ko.components/queryNode.js';
import QueryNodeRelations from '../ko.components/queryNodeRelations.js';
import Checkbox from '../ko.components/checkbox.js';
import SearchUnitChoice from '../ko.components/searchUnitChoice.js';

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
  ko.components.register('bmpp-checkbox', Checkbox);
  ko.components.register('query-pane', QueryPane);
  ko.components.register('subcorpus-pane', SubcorpusPane);
  ko.components.register('query-node', QueryNode);
  ko.components.register('query-node-relations', QueryNodeRelations);
  ko.components.register('search-unit-choice', SearchUnitChoice);
  ko.applyBindings(viewModel);
}
