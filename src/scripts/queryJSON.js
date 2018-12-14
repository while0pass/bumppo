import linearizeTree from './linearizeTree.js';

export default function getQueryJSON(viewModel) {
  let x = {
        version: '1.0',
        record_ids: viewModel.subcorpus.records.getQueryValuesForJSON(),
        //segments: viewModel.subcorpus.recordPhases.getQueryValuesForJSON(),
        conditions: {}
      },
      ltree = linearizeTree(viewModel.queryTree);
  for (let i = 0; i < ltree.length; i++) {
    let node = ltree[i],
        unitType = node.unitType(),
        nodeKey = node.serialNumber().toString();
    x.conditions[nodeKey] = {
      type: 'simple',
      is_regex: true,
      search: '.+',
      tiers: node.getTiersFromTemplate(unitType.tierTemplate)
    };
    if (unitType.subtierTemplate) {
      let subKey = nodeKey + 'p0';
      x.conditions[subKey] = {
        type: 'simple',
        is_regex: false,
        search: unitType.subtierValue,
        tiers: node.getTiersFromTemplate(unitType.subtierTemplate)
      };
      x.conditions[`${ nodeKey }.${ subKey }`] = {
        type: 'structural',
        first_condition_id: nodeKey,
        second_condition_id: subKey,
        distance_min: 0,
        distance_max: 0
      };
    }


    if (i > 0) {
      let n1 = node.parentNode,
          n2 = node,
          id1 = n1.serialNumber().toString(),
          id2 = n2.serialNumber().toString(),
          complexCond = {
            first_condition_id: id1,
            second_condition_id: id2,
            is_same_tier: (n1.unitType().channel.id === n2.unitType().channel.id),
            type: 'overlaps'
          };
      x.conditions[`${id1}.${id2}`] = complexCond;
    }
  }
  return JSON.stringify(x, null, 4);
}
