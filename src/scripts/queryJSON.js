import linearizeTree from './linearizeTree.js';

export default function getQueryJSON(viewModel) {
  let x = {
        version: 1.0,
        record_ids: viewModel.subcorpus.records.getQueryValuesForJSON(),
        segments: viewModel.subcorpus.recordPhases.getQueryValuesForJSON(),
        conditions: {
        }
      },
      ltree = linearizeTree(viewModel.queryTree);
  for (let i = 0; i < ltree.length; i++) {
    let node = ltree[i],
        simpleCond = {
          type: 'simple',
          is_regex: true,
          search: '.+',
          duration: []
        };
    simpleCond.tiers = [node.unitType().channel.id, node.unitType().id];
    x.conditions[node.serialNumber().toString()] = simpleCond;

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
