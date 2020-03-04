import { p_duration, TextProperty, IntervalProperty,
  ListProperty } from './searchUnitProperties.js';
import { SAME_PARTICIPANT_RELATION_ID,
  DISTANCE_RELATION_TYPE, Connective } from './searchUnitRelations.js';
import { LAYER_PARENT_MAP, resOptsAdditionalTierTypes,
  resolveTierTemplate } from './layers.js';

function escapeRegExpELAN(string) {
  return string.replace(/[-.*+^?{}()|[\]\\]/g, '\\$&');
}

function getQueryJSON(viewModel) {
  let stages = viewModel.subcorpus.recordPhases.getQueryValuesForJSON(),
      ltree = viewModel.linearizedQueryTree(),
      shouldFilterStages = stages.length > 0 && stages.length < 3,
      stagesKeyAndTier = 'Stage',
      query = {
        version: '2.0',
        record_ids: viewModel.subcorpus.records.getQueryValuesForJSON(),
        conditions: {}
      },
      showTiers = [];

  if (shouldFilterStages) {
    let reTemplate = stages.join('|');
    query.conditions[stagesKeyAndTier] = {
      type: 'simple',
      is_regex: true,
      search: reTemplate,
      tiers: [stagesKeyAndTier]
    };
  }

  for (let nodeIndex = 0; nodeIndex < ltree.length; nodeIndex++) {

    // Единица поиска, соответствующая узлу дерева запроса
    let nodeOrProxy = ltree[nodeIndex];

    if (!nodeOrProxy.isProxy) {
      let node = nodeOrProxy,
          nodeKey = node.serialNumber().toString(),
          unitPropertiesMap = node.unitProperties.unitPropertiesMap(),
          unitType = node.unitType();

      query.conditions[nodeKey] = {
        type: 'simple',
        is_regex: true,
        search: '.+',
        tiers: node.getTiersFromTemplate(unitType.tierTemplate)
      };

      // Длительность единицы поиска
      if (p_duration.id in unitPropertiesMap) {
        let duration = unitPropertiesMap[p_duration.id].value();
        if (duration && 'min' in duration) {
          query.conditions[nodeKey].duration_min = duration.min;
        }
        if (duration && 'max' in duration) {
          query.conditions[nodeKey].duration_max = duration.max;
        }
      }

      // Случай, если тип единицы надо проверять в подслое
      if (unitType.subtierTemplate) {
        // Поскольку указывать родительский слой нет необходимости, заменяем
        // его сразу на дочерний.
        query.conditions[nodeKey] = {
          type: 'simple',
          is_regex: false,
          search: unitType.subtierValue,
          tiers: node.getTiersFromTemplate(unitType.subtierTemplate)
        };
      }

      // Выбранные свойства единицы
      let propIndex = 1;
      node.chosenUnitProperties().forEach(prop => {
        if (!prop.tierTemplate) return;
        let propKey = `${ nodeKey }p${ propIndex }`,
            value = prop.value(),
            tiers = node.getTiersFromTemplate(prop.tierTemplate);
        if (prop instanceof TextProperty) {
          query.conditions[propKey] = {
            type: 'simple',
            is_regex: true,
            search: value
          };
        } else if (prop instanceof ListProperty) {
          if (value instanceof Array) {
            let v = value.filter(a => typeof a === 'string')
              .map(a => prop.isRegEx ? a : escapeRegExpELAN(a)).join('|');
            if (prop.isFullMatch) {
              v = `\\A(${ v })\\Z`;  /* NOTE: В ELAN для совпадения по началу
              и концу строки используется регулярные выражения \A и \Z
              вместо крышки (^) и доллара ($). */
            }
            query.conditions[propKey] = {
              type: 'simple',
              is_regex: true,
              search: v
            };
          } else if (typeof value === 'string') {
            query.conditions[propKey] = {
              type: 'simple',
              is_regex: prop.isRegEx,
              search: value
            };
          } else if (value === false) { // Поиск нулевых интервалов
            query.conditions[propKey] = {
              type: 'simple',
              is_regex: true,
              search: '.*'
            };
          }
        } else if (prop instanceof IntervalProperty) {
          query.conditions[propKey] = {
            type: 'simple_number'
          };
          if ('min' in value) query.conditions[propKey].min_value = value.min;
          if ('max' in value) query.conditions[propKey].max_value = value.max;
        }
        query.conditions[propKey].tiers = tiers;

        let relationType = (prop instanceof ListProperty && value === false ?
          'non_structural' : 'structural'); /* Выбор non_structural
                                               для нулевых интервалов */
        query.conditions[`${ nodeKey }:${ propKey }`] = {
          type: relationType,
          first_condition_id: nodeKey,
          second_condition_id: propKey,
          distance_min: 0,
          distance_max: 0
        };
        propIndex += 1;
      });

      // Дополнительное ограничение по стадиям записи (рассказ, разговор,
      // пересказ).
      if (shouldFilterStages) {
        query.conditions[`${ nodeKey }.${ stagesKeyAndTier }`] = {
          type: 'overlaps',
          first_condition_id: nodeKey,
          second_condition_id: stagesKeyAndTier,
        };
      }

      // Подбор дополнительных слоев для разных типов корневой единицы
      if (nodeIndex === 0) {
        showTiers = showTiers.concat(node.getTiersForPrimaryResults());
      }

      // Запрос на вывод в ответе дополнительных слоев
      if (showTiers.length > 0) {
        showTiers = Array.from(new Set(showTiers)).sort();
        query.show_tiers = showTiers;
      }

    } // ENDIF !nodeOrProxy.isProxy

    // Ограничения на расстояние между единицами поиска,
    // на совпадение участников.
    if (nodeIndex > 0 && (!nodeOrProxy.isProxy || nodeOrProxy.node())) {
      let n1 = nodeOrProxy.parentNode,
          n2 = nodeOrProxy,
          id1 = n1.serialNumber().toString(),
          id2 = n2.serialNumber().toString(),
          acc = 0,
          relationsOrConnectives = nodeOrProxy
            .relationsFormula.chosenRelations();

      for (let roc of relationsOrConnectives) {
        let relations = roc instanceof Connective ?
          roc.relationsOrConnectives() : [roc];
        relations.forEach((relation, ix) => {

          let complexCond = {
            first_condition_id: id1,
            second_condition_id: id2,
          };

          if (relation.id === SAME_PARTICIPANT_RELATION_ID) {

            complexCond.type = 'same_participant';
            if (!relation.value()) {
              complexCond.negative = true;
            }

          } else if (relation.type === DISTANCE_RELATION_TYPE) {

            let interval, type;
            if (relation.measureInMs()) {
              type = relation.referencePoints.value();
              interval = relation.intervalInMs;
            } else {
              type = 'structural';
              interval = relation.intervalInUnits;
            }
            complexCond.type = type;
            complexCond.distance_min = interval.from();
            complexCond.distance_max = interval.to();

            if (!relation.occurrence.value()) {
              complexCond.negative = true;
            }

          }

          query.conditions[`${ id1 }:${ id2 }:r${ acc + ix + 1 }`] = complexCond;

        });
        acc += relations.length;
      }
    }
  }
  return JSON.stringify(query, null, 4);
}

function getLayersQueryJSON(data, linear6n) {
  const halfDuration = (data.match.time.end - data.match.time.begin),
        end = data.match.time.end + halfDuration;
  let begin = data.match.time.begin - halfDuration;
  if (begin < 0) begin = 0;

  // Собираем всех участников, присутствующих в результате
  let participants = new Set(),
      byParticipants = x => participants.has(x.slice(0, 1)),
      addParticipant = x => participants.add(x.slice(0, 1)),
      participantAwareTier = x => typeof x === 'string' && x.match(/^[NRC]-/);
  if (data._data.show_tiers !== undefined) {
    Object.keys(data._data.show_tiers)
      .filter(participantAwareTier)
      .forEach(addParticipant);
  }
  if (participantAwareTier(data._data.tier)) addParticipant(data._data.tier);
  Object.values(data._data)
    .map(x => x.tier)
    .filter(participantAwareTier)
    .forEach(addParticipant);
  if (participants.size === 0) participants.add(data.participant);

  // Обязательные слои отфильтровываем по участникам
  let tiers = resOptsAdditionalTierTypes.value().filter(byParticipants);

  // Добавляем слои на основе дерева запроса
  linear6n.forEach(node => {
    let {tierTemplate, subtierTemplate} = node.unitType();
    tiers = tiers.concat(
      resolveTierTemplate(tierTemplate)
        .tierStrings.filter(byParticipants)
    );
    if (subtierTemplate) {
      tiers = tiers.concat(
        resolveTierTemplate(subtierTemplate)
          .tierStrings.filter(byParticipants)
      );
    }
    node.chosenUnitProperties().forEach(prop => {
      if (prop.tierTemplate) {
        tiers = tiers.concat(
          resolveTierTemplate(prop.tierTemplate)
            .tierStrings.filter(byParticipants)
        );
      }
    });
  });

  // Добавляем все родительские слои и устраняем повторы
  tiers = tiers.reduce((a, b) => {
    if (a.indexOf(b) < 0) a.push(b);
    let parent = b in LAYER_PARENT_MAP ? LAYER_PARENT_MAP[b] : null;
    if (parent !== null && a.indexOf(parent) < 0) a.push(parent);
    return a;
  }, []);

  const query = {
    record_id: data.record_id,
    time: { begin: begin, end: end },
    type: 'overlaps',
    tiers: tiers,
  };
  return JSON.stringify(query, null, 4);
}

export { getQueryJSON, getLayersQueryJSON };
