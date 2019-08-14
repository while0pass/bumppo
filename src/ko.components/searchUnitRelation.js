import { DISTANCE_RELATION_TYPE } from '../scripts/searchUnitRelations.js';

const template = `

  <div class="ui segment" style="margin-bottom: 1em">
    <div class="ui top attached large label">
      <header class="bmpp-relationHeader" data-bind="html: relation.name,
        click: relation.onHeaderClick && relation.onHeaderClick.bind(relation),
        css: { clickable: relation.isHeaderClickable }">
      </header>
      <!-- ko if: relation.help -->
        <i class="disabled question circle outline icon bmpp-nearLabelIcon"
          data-bind="popup: relation.help"></i>
      <!-- /ko -->
    </div>
    <div class="ui hidden divider"></div>

    <!-- ko if: relation.type === 'list' -->
      <list-relation params="relation: relation"></list-relation>
    <!-- /ko -->

    <!-- ko if: relation.type === DISTANCE_RELATION_TYPE -->
      <distance-relation params="relation: relation"></distance-relation>
    <!-- /ko -->
  </div>

`;

// eslint-disable-next-line no-unused-vars
var viewModelFactory = (params, componentInfo) => {
  return { relation: params.relation, DISTANCE_RELATION_TYPE };
};

export default {
  viewModel: { createViewModel: viewModelFactory },
  template: template
};
