import koQueryPaneComponent from '../ko.components/queryPane.js';
import koQueryNodeComponent from '../ko.components/queryNode.js';
import koQueryNodeRelationsComponent from '../ko.components/queryNodeRelations.js';
import koQueryNodeRelationComponent from '../ko.components/queryNodeRelation.js';
import koCheckboxComponent from '../ko.components/checkbox.js';

export default function init(ko, viewModel) {
  ko.components.register('bmpp-checkbox', koCheckboxComponent);
  ko.components.register('query-pane', koQueryPaneComponent);
  ko.components.register('query-node', koQueryNodeComponent);
  ko.components.register('query-node-relations', koQueryNodeRelationsComponent);
  ko.components.register('query-node-relation', koQueryNodeRelationComponent);
  ko.options.deferUpdates = true;
  ko.applyBindings(viewModel);
  return ko;
}
