import log from './log.js';
import linearizeTree from './linearizeTree.js';
import { p_duration, TextProperty, IntervalProperty,
  ListProperty } from './searchUnitProperties.js';

function escapeRegExpELAN(string) {
  return string.replace(/[-.*+^?{}()|[\]\\]/g, '\\$&');
}

export default function getQueryJSON(viewModel) {
  let stages = viewModel.subcorpus.recordPhases.getQueryValuesForJSON(),
      shouldFilterStages = stages.length > 0 && stages.length < 3,
      stagesKeyAndTier = 'Stage',
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

  for (let nodeIndex = 0; nodeIndex < ltree.length; nodeIndex++) {
    let node = ltree[nodeIndex],
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

    let propIndex = 1;
    node.chosenUnitProperties().forEach(prop => {
      if (!prop.tierTemplate) return;
      let propKey = `${ nodeKey }p${ propIndex }`,
          value = prop.value(),
          tiers = node.getTiersFromTemplate(prop.tierTemplate);
      log(propKey, value, tiers);
      if (prop instanceof TextProperty) {
        x.conditions[propKey] = {
          type: 'simple',
          is_regex: true,
          search: value
        };
      } else if (prop instanceof ListProperty) {
        if (!(value instanceof Array)) return;
        x.conditions[propKey] = {
          type: 'simple',
          is_regex: true,
          search: value
            .filter(a => typeof a === 'string')
            .map(a => prop.isRegEx ? a : escapeRegExpELAN(a)).join('|')
        };
      } else if (prop instanceof IntervalProperty) {
        x.conditions[propKey] = {
          type: 'simple_number'
        };
        if ('min' in value) x.conditions[propKey].min_value = value.min;
        if ('max' in value) x.conditions[propKey].max_value = value.max;
      }
      x.conditions[propKey].tiers = tiers;
      x.conditions[`${ nodeKey }.${ propKey }`] = {
        type: 'structural',
        first_condition_id: nodeKey,
        second_condition_id: propKey,
        distance_min: 0,
        distance_max: 0
      };
      propIndex += 1;
    });

    if (shouldFilterStages) {
      x.conditions[`${ nodeKey }.${ stagesKeyAndTier }`] = {
        type: 'overlaps',
        first_condition_id: nodeKey,
        second_condition_id: stagesKeyAndTier,
      };
    }

    if (nodeIndex > 0) {
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
