import linearizeTree from './linearizeTree.js';
import { p_duration } from './searchUnitProperties.js';

export default function getQueryJSON(viewModel) {
  let stages = viewModel.subcorpus.recordPhases.getQueryValuesForJSON(),
      shouldFilterStages = stages.length > 0 && stages.length < 3,
      stagesKeyAndTier = 'Stages',
      x = {
        version: '1.0',
        record_ids: viewModel.subcorpus.records.getQueryValuesForJSON(),
        conditions: {}
      },
      ltree = linearizeTree(viewModel.queryTree);
  if (shouldFilterStages) {
    let reTemplate = stages.join('|');
    x.conditions[stagesKeyAndTier] = {
      type: 'simple',
      is_regex: true,
      search: reTemplate,
      tiers: [stagesKeyAndTier]
    };
  }
  for (let i = 0; i < ltree.length; i++) {
    let node = ltree[i],
        unitType = node.unitType(),
        unitPropertiesMap = node.unitProperties.unitPropertiesMap(),
        nodeKey = node.serialNumber().toString();
    x.conditions[nodeKey] = {
      type: 'simple',
      is_regex: true,
      search: '.+',
      tiers: node.getTiersFromTemplate(unitType.tierTemplate)
    };
    if (p_duration.id in unitPropertiesMap) {
      let duration = unitPropertiesMap[p_duration.id].value();
      if (duration && 'min' in duration) {
        x.conditions[nodeKey].duration_min = duration.min;
      }
      if (duration && 'max' in duration) {
        x.conditions[nodeKey].duration_max = duration.max;
      }
    }
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
    if (shouldFilterStages) {
      x.conditions[`${ nodeKey }.${ stagesKeyAndTier }`] = {
        type: 'overlaps',
        first_condition_id: nodeKey,
        second_condition_id: stagesKeyAndTier,
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
