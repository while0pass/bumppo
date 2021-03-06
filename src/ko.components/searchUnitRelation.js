import { DISTANCE_RELATION_TYPE,
  AND_TYPE } from '../scripts/searchUnitRelations.js';

const headerTemplate = `

  <header class="bmpp-relationHeader" data-bind="html: relation.name,
    click: relation.onHeaderClick && relation.onHeaderClick.bind(relation),
    css: { clickable: relation.isHeaderClickable }">
  </header>
  <!-- ko if: relation.help -->
    <i class="disabled question circle outline icon bmpp-nearLabelIcon"
      data-bind="popup: relation.help"></i>
  <!-- /ko -->

`;

const template = `

  <!-- ko ifnot: isFormula -->
  <div class="ui segment bmpp-relation">

    <div class="ui top attached large label">
      ${ headerTemplate }
    </div>
    <div class="ui hidden divider"></div>

    <!-- ko if: relation.type === 'list' -->
      <list-relation params="relation: relation"></list-relation>
    <!-- /ko -->

  </div>
  <!-- /ko -->

  <!-- ko if: isFormula -->
  <div class="ui segments bmpp-relation"
    data-bind="foreach: relation.relationsOrConnectives">

    <div class="ui segment"
      data-bind="css: { 'bmpp-relationItem': $index() > 0 }">

      <!-- ko if: $index() === 0 -->
        <div class="ui top attached large label"
        data-bind="with: $data, as: 'relation'">
          ${ headerTemplate }
        </div>
        <div class="ui hidden divider"></div>
      <!-- /ko -->

      <!-- ko if: type === $component.DISTANCE_RELATION_TYPE -->
        <distance-relation params="relation: $data,
          formula: $component.relationsFormula"></distance-relation>
      <!-- /ko -->

      <button class="ui small basic icon button bmpp-removeButton"
        data-bind="click: $$removeRelation,
          css: { 'bmpp-removeButton1': $index() === 0 },
          visible: $index() > 0 ||
                 $component.relation.relationsOrConnectives().length > 1">
        <i class="ui close icon"></i>
      </button>

      <button class="blue ui mini icon button bmpp-addButton"
        data-bind="click: $$addRelation, visible: $index() + 1 ===
            $component.relation.relationsOrConnectives().length">
        <i class="ui plus icon"></i>
      </button>

    </div>

  </div>
  <!-- /ko -->

`;

// eslint-disable-next-line no-unused-vars
var viewModelFactory = (params, componentInfo) => {
  let relation = params.relation,
      relationsFormula = params.formula;
  return {
    DISTANCE_RELATION_TYPE,
    isFormula: relation.type === AND_TYPE,
    relation, relationsFormula,
  };
};

export default {
  viewModel: { createViewModel: viewModelFactory },
  template: template
};
