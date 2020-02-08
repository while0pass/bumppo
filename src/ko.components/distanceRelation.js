const template = `

  <div class="bmpp-relationBanner" data-bind="html: relation.banner"></div>

  <div>

    <!-- ko if: relation.measureInMs -->
      <interval-property params="property: relation.intervalInMs">
      </interval-property>
    <!-- /ko -->
    <!-- ko ifnot: relation.measureInMs -->
      <interval-property params="property: relation.intervalInUnits">
      </interval-property>
    <!-- /ko -->

    <!-- ko if: formula.sameUnitTypeAndParticipants -->
      <list-property params="property: relation.units"
          class="bmpp-unitsRadioButtons"></list-property>
    <!-- /ko -->
    <!-- ko ifnot: formula.sameUnitTypeAndParticipants -->
      <span data-bind="text: relation.unitsFirstValueName"></span>
    <!-- /ko -->

  </div>


  <div style="margin-top: 1em">

    <list-property params="property: relation.occurrence"></list-property>

    <!-- ko if: relation.units.value() === 'ms' -->
      <list-property params="property: relation.referencePoints"
        style="margin-left: 1em"></list-property>
    <!-- /ko -->

  </div>

`;

// eslint-disable-next-line no-unused-vars
var viewModelFactory = (params, componentInfo) => {
  return { relation: params.relation, formula: params.formula };
};

export default {
  viewModel: { createViewModel: viewModelFactory },
  template: template
};
