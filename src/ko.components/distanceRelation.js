const template = `

  <div class="bmpp-relationBanner" data-bind="html: banner"></div>

  <div>

    <!-- ko if: measureInMs -->
      <interval-property params="property: intervalInMs"></interval-property>
    <!-- /ko -->
    <!-- ko ifnot: measureInMs -->
      <interval-property params="property: intervalInUnits"></interval-property>
    <!-- /ko -->

    <!-- ko if: sameTypeNodes -->
      <list-property params="property: units"
          class="bmpp-unitsRadioButtons"></list-property>
    <!-- /ko -->
    <!-- ko ifnot: sameTypeNodes -->
      <span data-bind="text: unitsFirstValueName"></span>
    <!-- /ko -->

  </div>


  <div style="margin-top: 1em">

    <list-property params="property: occurrence"></list-property>

    <!-- ko if: units.value() === 'ms' -->
      <list-property params="property: referencePoints"
        style="margin-left: 1em"></list-property>
    <!-- /ko -->

  </div>

`;

// eslint-disable-next-line no-unused-vars
var viewModelFactory = (params, componentInfo) => {
  return params.relation;
};

export default {
  viewModel: { createViewModel: viewModelFactory },
  template: template
};
