import QueryPane from '../ko.components/queryPane.js';
import QueryNode from '../ko.components/queryNode.js';
import QueryNodeRelations from '../ko.components/queryNodeRelations.js';
import QueryNodeRelation from '../ko.components/queryNodeRelation.js';
import Checkbox from '../ko.components/checkbox.js';
import SearchUnitChoice from '../ko.components/searchUnitChoice.js';

export default function init(ko, viewModel) {
  ko.components.register('bmpp-checkbox', Checkbox);
  ko.components.register('query-pane', QueryPane);
  ko.components.register('query-node', QueryNode);
  ko.components.register('query-node-relations', QueryNodeRelations);
  ko.components.register('query-node-relation', QueryNodeRelation);
  ko.components.register('search-unit-choice', SearchUnitChoice);
  ko.options.deferUpdates = true;
  ko.applyBindings(viewModel);
  return ko;
}
