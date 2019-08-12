const template = `

  <div>

    <!-- ko if: units.value() === 'ms' -->
      <interval-property params="property: intervalInMs"></interval-property>
    <!-- /ko -->
    <!-- ko ifnot: units.value() === 'ms' -->
      <interval-property params="property: intervalInUnits"></interval-property>
    <!-- /ko -->

    <list-property params="property: units"></list-property>

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
