import jQuery from 'jquery';
import ko from 'knockout';

/*
 *  type ::= interval | list | text
 *  name
 *  id
 *  help
 *  tierTemplate
 *  validChars
 *  substitute
 *  valuesSubstitute
 *  virtualKeyboard
 *
 * * * *  type == 'interval'
 *
 *  min
 *  max
 *  step
 *  units
 *  unitsBanner
 *  allowNegatives
 *  neverEmpty
 *
 *  fromStep
 *  fromPlaceholder
 *  fromBanner
 *  fromOnlyBanner
 *  fromLabel
 *
 *  toStep
 *  toPlaceholder
 *  toBanner
 *  toOnlyBanner
 *  toLabel
 *
 *  fromToBanner
 *  fromToEqualBanner
 *
 * * * *  type == 'list'
 *
 *  allIfEmpty
 *  valueList
 *  displayValues
 *  isRegEx
 *  addNameToChildNames
 *
 * * * *  type == 'text'
 *
 *  placeholder
 *
 */

/* * * * valueList props
 *
 *  orValues
 *  xorValues
 *  name
 *  value
 *  disabledInChannels
 *  editable
 *  radioButtons
 *
 */

const p_duration = {
  type: 'interval', name: 'Длительность', id: 'p_duration', step: 20,
  units: 'миллисекунд', unitsBanner: 'мс',
  fromOnlyBanner: 'не менее ##', toOnlyBanner: 'не более ##',
  fromToEqualBanner: 'ровно ##',
  help: `<header class="ui header">Интервал длительности единицы</header>
  <p>Чтобы отобрать единицы, длительность которых не меньше указанной,
  заполните только левое поле. Чтобы отобрать единицы, длительность которых
  не больше указанной, заполните только правое поле. Свойство не будет
  учитываться в запросе, если ничего не задать.</p>` };

const p_participants = {
  type: 'list', name: 'Участники', id: 'p_participants', allIfEmpty: true,
  valueList: { orValues: [
    { name: 'Рассказчик', value: 'N' },
    { name: 'Комментатор', value: 'C', disabledInChannels: ['ocul'] },
    { name: 'Пересказчик', value: 'R' }
  ]}};

const p_mGeStructure = {
  type: 'list', name: 'Фазовая структура', id: 'p_mGeStructure',
  tierTemplate: '{ p_participants }-mGeStructure',
  displayValues: true, valueList: { orValues: [
    { name: 'Мах', value: 'S' },
    { name: 'Мах, ретракция', value: 'S R' },
    { name: 'Подготовка, мах', value: 'P S' },
    { name: 'Подготовка, мах, ретракция', value: 'P S R' },
    { name: 'Подготовка-мах', value: 'P-S' },
    { name: 'Подготовка-мах, ретракция', value: 'P-S R' },
    { name: 'Другой вариант', editable: true },
  ]},
  validChars: ['P', 'R', 'S', 'H', '-', ' '],
  substitute: [
    [/[sыЫ]/g, 'S'],
    [/[pзЗ]/g, 'P'],
    [/[rкК]/g, 'R'],
    [/[hрР]/g, 'H'],
    [/\s+/g, ' '],
    [/\s*[-_]\s*/g, '-'],
  ]};

const p_mGeHandedness = {
  type: 'list', name: 'Рукость', id: 'p_mGeHandedness',
  tierTemplate: '{ p_participants }-mGeHandedness',
  valueList: { orValues: [
    { name: 'Леворучный', value: 'Lt' },
    { name: 'Праворучный', value: 'Rt' },
    { name: 'Двуручный с симметричной траекторией', value: 'Bh-sym' },
    { name: 'Двуручный с идентичной / единой траекторией', value: 'Bh-id' },
    { name: 'Двуручный с различной траекторией у разных рук', value: 'Bh-dif' },
    { name: 'Прочее', value: 'Other' },
  ]}};

const p_mGeFunction = {
  type: 'list', name: 'Функциональный тип', id: 'p_mGeFunction',
  tierTemplate: '{ p_participants }-mGeFunction', isRegEx: true,
  valueList: { orValues: [
    { name: 'Изобразительный жест', value: 'Depictive' },
    { name: 'Указательный жест', value: 'Pointing' },
    { name: 'Жестовое ударение', value: 'Beat' },
    { name: 'Прагматический / метафорический жест', addNameToChildNames: true,
      value: 'Pragmatic', xorValues: [  // NOTE: Эталонный случай ##xorparuni##:
        // На родительской галке присутствует значение, а дочерние галки
        // образуют xor-список. Дочерние галки могут быть все выключены при
        // включеной родительской.
        { name: 'Без наложения на другие типы', value: 'Other.*Pragmatic' },
        { name: 'С наложением на другие типы',
          value: '(Depictive|Pointing|Beat).*Pragmatic' },
      ]},
  ]}};

const p_mGeTags = {
  type: 'list', name: 'Дополнительные признаки', id: 'p_mGeTags',
  isRegEx: true, tierTemplate: '{ p_participants }-mGeTags',
  valueList: { orValues: [
    { name: 'Двухчастный жест («туда-обратно»)', value: 'Shuttle' },
    { name: 'Жест с многократным махом', value: 'Multi-S' },
    { name: 'Отскок в конце маха', value: 'S Rebound' },
    { name: 'Отскок в конце ретракции', value: 'R Rebound' },
    { name: 'Многократный отскок в конце маха или ретракции', value: 'Multi-Rebound' },
    { name: 'Длинная ретракция', value: 'Long R' },
    { name: 'Наложение на текущий жест фазы другого жеста',
      value: 'Overlap' },
    { name: 'Повтор предыдущего жеста', value: 'Repeat' },
    { name: 'Обрыв в основном сформированного жеста', value: 'GeBreakOff' },
    { name: 'Обрыв жеста без маховой фазы', value: 'GeFalstart' },
  ]}};

const p_vIllocPhase = {
  type: 'list', name: 'Иллокутивно-фазовое значение', id: 'p_vIllocPhase',
  tierTemplate: '{ p_participants }-vIllocPhase',
  displayValues: true, valueList: { orValues: [
    { name: 'Иллокутивное', orValues: [
      { name: 'Завершение сообщения', value: '.' },
      { name: 'Вопрос', value: '?' },
      { name: 'Директив', value: '¡' },
      { name: 'Обращение', value: '@' },
      { name: 'Полуутверждение', value: '¿' },
      { name: 'Неполнота информации', value: '…' },
      { name: 'Восклицательность', value: '!' },
    ]},
    { name: 'Фазовое', orValues: [
      { name: 'Стандартная незавершенность', value: ',' },
      { name: 'Незавершенность, восполняемая последующим контекстом', value: ':' },
      { name: 'Неполнота информации в контексте незавершенности', value: ',,,' },
      { name: 'Начальная часть сплита', value: '—' },
    ]},
    { name: 'Обрыв', addNameToChildNames: true, orValues: [
      { name: 'При самоисправлении', value: '==' },
      { name: 'При апосиопезе', value: '~' },
      { name: 'При вмешательстве собеседника', value: '≈≈' },
    ]},
  ]},
  valuesSubstitute: [
    ['.', 'Period'],
    ['?', 'Quest'],
    ['¡', 'Dir'],
    ['@', 'Appeal'],
    ['¿', 'Semi-St'],
    ['…', 'Dots-f'],
    ['!', 'Exclam'],
    [',,,', 'Dots-nf'], // NOTE: Это значение должно
    // предшествовать запятой для получения правильных значений.
    [',', 'Comma'],
    [':', 'Colon'],
    ['—', 'Split'],
    ['==', 'Fst'],
    ['~', 'Tilde'],
    ['≈≈', 'Interrupt'],
  ]
};

const p_vCombIllocPhase = {
  type: 'list', name: 'Комбинация иллокутивно-фазовых значений',
  id: 'p_vCombIllocPhase', tierTemplate: '{ p_participants }-vCombIllocPhase',
  valueList: { orValues: [
    { name: 'Не-сообщение + незавершенность', value: 'NonStNonFinal' },
    { name: 'Не-сообщение + неполнота информации', value: 'NonStDots' },
    { name: 'Не-сообщение + восклицательность', value: 'NonStExclam' },
    { name: 'Незавершенность + обрыв', value: 'NonFinalTrunc' },
    { name: 'Прочее', value: 'Other' },
  ]}};

const p_vAccentsCount = {
  type: 'interval', name: 'Число акцентов', id: 'p_vAccentsCount',
  tierTemplate: '{ p_participants }-vAccentsCount',
  fromOnlyBanner: '## и более', toOnlyBanner: '## и менее' };

const p_vMainAccentsCount = {
  type: 'interval', name: 'Число главных акцентов', id: 'p_vMainAccentsCount',
  tierTemplate: '{ p_participants }-vMainAccentsCount',
  fromOnlyBanner: '## и более', toOnlyBanner: '## и менее' };

const p_vAccentsAfterMainCount = {
  type: 'interval', name: 'Число вторичных акцентов после главного',
  id: 'p_vAccentsAfterMainCount',
  tierTemplate: '{ p_participants }-vAccentsAfterMainCount',
  fromOnlyBanner: '## и более', toOnlyBanner: '## и менее' };

const p_vWordsCount = {
  type: 'interval', name: 'Число слов', id: 'p_vWordsCount',
  tierTemplate: '{ p_participants }-vWordsCount',
  fromOnlyBanner: '## и более', toOnlyBanner: '## и менее' };

const p_vPausesCount = {
  type: 'interval', name: 'Число абсолютных пауз', id: 'p_vPausesCount',
  tierTemplate: '{ p_participants }-vPausesCount',
  fromOnlyBanner: '## и более', toOnlyBanner: '## и менее' };

const p_vFilledCount = {
  type: 'interval', name: 'Число заполненных пауз', id: 'p_vFilledCount',
  tierTemplate: '{ p_participants }-vFilledCount',
  fromOnlyBanner: '## и более', toOnlyBanner: '## и менее' };

const p_vStartFilled = {
  type: 'list', name: 'Начинается с заполненной паузы',
  id: 'p_vStartFilled', tierTemplate: '{ p_participants }-vStartFilled',
  valueList: { xorValues: [
    { name: 'Да', value: 'Yes' },
    { name: 'Нет', value: false },
  ]}};

const p_vInterruptCount = {
  type: 'interval', name: 'Число точек прерывания', id: 'p_vInterruptCount',
  tierTemplate: '{ p_participants }-vInterruptCount',
  fromOnlyBanner: '## и более', toOnlyBanner: '## и менее' };

const v_R = '/', v_F = '\\', v_L = '–', v_r = '↑', v_f = '↓', v_l = '→',
      v_RF = v_R + v_F,
      v_Rf = v_R + v_f,
      v_rF = v_r + v_F,
      v_RL = v_R + v_L,
      v_Rl = v_R + v_l,
      v_FR = v_F + v_R,
      v_Fr = v_F + v_r;

const p_vMainAccents = {
  type: 'list', name: 'Движение тона в главном акценте',
  id: 'p_vMainAccents', displayValues: true,
  tierTemplate: '{ p_participants }-vMainAccents',
  valueList: { orValues: [
    { name: 'Восходящее', value: v_R },
    { name: 'Нисходящее', value: v_F },
    { name: 'Ровное', value: v_L },
    { name: 'Восходяще-нисходящее', value: [v_RF, v_Rf, v_rF] },
    { name: 'Восходяще-ровное', value: [v_RL, v_Rl] },
    { name: 'Нисходяще-восходящее', value: [v_FR, v_Fr] },
    { name: 'Другой вариант', editable: true },
  ]},
  virtualKeyboard: true,
  validChars: [v_R, v_F, v_L, v_r, v_f, v_l],
  substitute: [
    [/[-\u2014\u2012]/g, '\u2013'],
  ],
  valuesSubstitute: [
    [v_R, 'R'],
    [v_F, 'F'],
    [v_L, 'L'],
    [v_r, 'r'],
    [v_f, 'f'],
    [v_l, 'l'],
  ],
};

const p_vParenth = {
  type: 'list', name: 'Входит в конструкцию со вставкой',
  id: 'p_vParenth', tierTemplate: '{ p_participants }-vParenth',
  valueList: { xorValues: [
    { name: 'Да', orValues: [
      { name: 'Непосредственно предшествует вставке', value: 'Enter' },
      { name: 'Первая ЭДЕ сложной вставки', value: 'Start' },
      { name: 'Последняя ЭДЕ сложной вставки', value: 'Final' },
      { name: 'Внутренняя ЭДЕ сложной вставки', value: 'Inside' },
      { name: 'Единственная ЭДЕ простой вставки', value: 'Full' },
      { name: 'Непосредственно следует за вставкой', value: 'Return' },
      { name: 'Первая ЭДЕ односторонней вставки', value: '*Start' },
    ]},
    { name: 'Нет', value: false },
  ]}};

const p_vInSplit = {
  type: 'list', name: 'Входит в конструкцию со сплитом',
  id: 'p_vInSplit', tierTemplate: '{ p_participants }-vInSplit',
  valueList: { xorValues: [
    { name: 'Да', value: 'InSplit' },
    { name: 'Нет', value: false },
  ]}};

const p_vCoConstr = {
  type: 'list', name: 'Входит в совместное построение реплик',
  id: 'p_vCoConstr', tierTemplate: '{ p_participants }-vCoConstr',
  valueList: { xorValues: [
    { name: 'Да', orValues: [
      { name: 'Достраивается другим участником', value: 'Prelim' },
      { name: 'Достраивает реплику другого участника', value: 'Final' },
      { name: 'И то, и другое', value: 'Both' },
    ]},
    { name: 'Нет', value: false },
  ]}};

const p_vCitation = {
  type: 'list', name: 'Входит в конструкцию с (полу)прямой цитацией',
  id: 'p_vCitation', tierTemplate: '{ p_participants }-vCitation',
  valueList: { xorValues: [
    { name: 'Да', orValues: [
      { name: 'Вводит чужую речь (авторская ремарка)', value: 'Frame' },
      { name: 'Первая ЭДЕ сложной цитации', value: 'Begin' },
      { name: 'Последняя ЭДЕ сложной цитации', value: 'End' },
      { name: 'Внутренняя ЭДЕ сложной цитации', value: 'Within' },
      { name: 'Единственная ЭДЕ простой цитации', value: 'Whole' },
    ]},
    { name: 'Нет', value: false },
  ]}};

const p_oInterlocutor = {
  type: 'list', name: 'Объект взгляда',
  id: 'p_oInterlocutor', displayValues: true,
  tierTemplate: '{ p_participants }-oInterlocutor',
  valueList: { orValues: [
    { name: 'Рассказчик', value: 'N' },
    { name: 'Комментатор', value: 'C' },
    { name: 'Пересказчик', value: 'R' },
    { name: 'Слушатель', value: 'L' },
    { name: 'Прочее', value: 'Other' },
  ]}
};

const p_oLocus = {
  type: 'list', name: 'Локус взгляда', id: 'p_oLocus',
  tierTemplate: '{ p_participants }-oLocus',
  valueList: { orValues: [
    { name: 'Лицо', value: 'Face' },
    { name: 'Руки', value: 'Hands' },
    { name: 'Тело', value: 'Body' },
    { name: 'Прочее', value: 'Other' },
  ]}
};

const p_mHand = {
  type: 'list', name: 'Рука', id: 'p_mHand', allIfEmpty: true,
  valueList: { orValues: [
    { name: 'Левая', value: 'Lt' },
    { name: 'Правая', value: 'Rt' },
  ]}
};

const p_mMtType = {
  type: 'list', name: 'Тип движения', id: 'p_mMtType',
  tierTemplate: '{ p_participants }-m{ p_mHand }MtType',
  valueList: { orValues: [
    { name: 'Подготовка', value: 'P' },
    { name: 'Мах', value: 'S' },
    { name: 'Ретракция', value: 'R' },
    { name: 'Независимая смена положения', value: 'PnC-In' },
    { name: 'Зависимая смена положения', value: 'PnC-Dp' },
    { name: 'Неструктурированное движение', value: 'U' },
    { name: 'Иное', value: 'Other' },
  ]}
};

const p_mStType = {
  type: 'list', name: 'Тип неподвижности', id: 'p_mStType',
  tierTemplate: '{ p_participants }-m{ p_mHand }StType',
  valueList: { orValues: [
    { name: 'Удержание', value: 'Hold' },
    { name: 'Покой', value: 'Reset' },
    { name: 'Зависание', value: 'Frozen' },
  ]}
};

const p_mStrokeHandedness = {
  type: 'list', name: 'Рукость', id: 'p_mStrokeHandedness',
  // пока отсутсвует tierTemplate
  valueList: { orValues: [
    { name: 'Левая рука', value: 'L' },
    { name: 'Правая рука', value: 'R' },
    { name: 'Обе руки', value: 'B' },
  ]}
};

const p_mStrokeLenType = {
  type: 'list', name: 'Тип длительности', id: 'p_mStrokeLenType',
  // пока отсутсвует tierTemplate
  valueList: { orValues: [
    { name: 'Короткий', value: 's' },
    { name: 'Средний', value: 'm' },
    { name: 'Длинный', value: 'l' },
  ]}
};

const p_mAdType = {
  type: 'list', name: 'Тип адаптора', id: 'p_mAdType',
  tierTemplate: '{ p_participants }-mAdType',
  valueList: { orValues: [
    { name: 'Четкий адаптор', value: 'Adaptor1' },
    { name: 'Нечеткий адаптор', value: 'Adaptor2' },
    { name: 'Комбинированный адаптор (тип 1)', value: 'Adaptor1+2' },
    { name: 'Комбинированный адаптор (тип 2)', value: 'Adaptor2+1' },
    { name: 'Другое', value: 'Other' },
  ]}
};

function createPropertyFromTemplate(propertyTemplate, propertyId) {
  let prop = JSON.parse(JSON.stringify(propertyTemplate));
  prop.id = propertyId;
  return prop;
}

const pt_InOutEDU = {
  type: 'list', name: 'Изолированность',
  tierTemplate: '{ p_participants }-vInOutEDU',
  valueList: { orValues: [
    { name: 'Внутри ЭДЕ', value: 'In' },
    { name: 'Отдельно', value: 'Out' },
  ]}
};
const p_vFInOutEDU = createPropertyFromTemplate(pt_InOutEDU, 'p_vFInOutEDU'),
      p_vHInOutEDU = createPropertyFromTemplate(pt_InOutEDU, 'p_vHInOutEDU'),
      p_vLInOutEDU = createPropertyFromTemplate(pt_InOutEDU, 'p_vLInOutEDU'),
      p_vOInOutEDU = createPropertyFromTemplate(pt_InOutEDU, 'p_vOInOutEDU'),
      p_vPauseInOutEDU = {
        type: 'list', name: 'Изолированность',
        tierTemplate: '{ p_participants }-vPauseInOutEDU',
        valueList: { orValues: [
          { name: 'Внутри ЭДЕ', value: 'In' },
          { name: 'Отдельно', value: 'Out' },
        ]}
      };

const pt_NearPause = {
  type: 'list', name: 'Соседство с абсолютными паузами',
  tierTemplate: '{ p_participants }-vNearPause',
  valueList: { orValues: [
    { name: 'Непосредственно перед паузой', value: 'Before' },
    { name: 'Непосредственно после паузы', value: 'After' },
    { name: 'Непосредственно между паузами', value: 'Between' },
    { name: 'Не соседствует с паузами', value: 'None' },
  ]}
};
const p_vFNearPause = createPropertyFromTemplate(pt_NearPause, 'p_vFNearPause'),
      p_vHNearPause = createPropertyFromTemplate(pt_NearPause, 'p_vHNearPause'),
      p_vLNearPause = createPropertyFromTemplate(pt_NearPause, 'p_vLNearPause'),
      p_vONearPause = createPropertyFromTemplate(pt_NearPause, 'p_vONearPause'),
      p_vWNearPause = createPropertyFromTemplate(pt_NearPause, 'p_vWNearPause');

const p_vFForm = {
  type: 'list', name: 'Тип заполнения', id: 'p_vFForm', isRegEx: true,
  tierTemplate: '{ p_participants }-vSForm',
  valueList: { orValues: [
    { name: 'Простое заполнение', orValues: [
      { name: 'Эканье', value: '\\(əɥ?\\)' },
      { name: 'Аканье', value: '\\(ɐɥ?\\)' },
      { name: 'Мэканье', value: '\\(ɯɥ?\\)' },
      { name: 'Гортанный скрип', value: '\\(ˀɥ?\\)' },
    ]},
    { name: 'Комбинированное заполнение', orValues: [
      { name: 'С эканьем', value: '\\((ə[ɐɯˀ]|[ɐɯˀ]ə)ɥ?\\)' },
      { name: 'С аканьем', value: '\\((ɐ[əɯˀ]|[əɯˀ]ɐ)ɥ?\\)' },
      { name: 'С мэканьем', value: '\\((ɯ[əɐˀ]|[əɐˀ]ɯ)ɥ?\\)' },
      { name: 'С гортанным скрипом', value: '\\((ˀ[əɐɯ]|[əɐɯ]ˀ)ɥ?\\)' },
    ]},
  ]}
};

const p_vOForm = {
  type: 'list', name: 'Тип действия', id: 'p_vOForm',
  tierTemplate: '{ p_participants }-vSForm',
  valueList: { orValues: [
    { name: 'Цоканье', value: '{cl}' },
    { name: 'Чмоканье', value: '{sm}' },
    { name: 'Фырканье', value: '{st}' },
    { name: 'Шмыганье', value: '{sf}' },
    { name: 'Сглатывание', value: '{gp}' },
    { name: 'Откашливание', value: '{exp}' },
    { name: 'Свист', value: '{wh}' },
    { name: 'Вздох', value: '{sg}' },
    { name: 'Кашель', value: '{cg}' },
  ]}
};

const p_vWForm = {
  type: 'text', name: 'Словарная форма', id: 'p_vWForm', placeholder: '…',
  tierTemplate: '{ p_participants }-vSForm',
};

const p_vOnom = {
  type: 'list', name: 'Идеофон', id: 'p_vOnom',
  tierTemplate: '{ p_participants }-vOnom',
  valueList: { xorValues: [
    { name: 'Да', value: 'Onom' },
    { name: 'Нет', value: false },
  ]}};

const p_vTruncated = {
  type: 'list', name: 'Оборванное слово', id: 'p_vTruncated',
  tierTemplate: '{ p_participants }-vTruncated',
  valueList: { xorValues: [
    { name: 'Да', value: 'Truncated' },
    { name: 'Нет', value: false },
  ]}};

const p_vWordNum = {
  type: 'interval', name: 'Позиция от начала ЭДЕ', id: 'p_vWordNum',
  tierTemplate: '{ p_participants }-vWordNum',
  fromOnlyBanner: '##‐я и дальше', toOnlyBanner: '##‐я и ближе',
  fromLabel: 'с', toLabel: 'по', fromToBanner: '##–##'
};

// eslint-disable-next-line no-unused-vars
const p_vWordNumReversed = {
  type: 'interval', name: 'Позиция от конца ЭДЕ', id: 'p_vWordNumReversed',
  tierTemplate: '{ p_participants }-vWordNumReversed',
  fromOnlyBanner: '##‐я и дальше', toOnlyBanner: '##‐я и ближе',
  fromLabel: 'с', toLabel: 'по', fromToBanner: '##–##'
};

const p_vInterrupt = {
  type: 'list', name: 'Точка прерывания', id: 'p_vInterrupt',
  tierTemplate: '{ p_participants }-vInterrupt',
  valueList: { xorValues: [
    { name: 'Да', orValues: [
      { name: 'При самоисправлении внутри ЭДЕ', value: 'Mild' },
      { name: 'При самоисправлении на границе ЭДЕ', value: 'Severe' },
      { name: 'При вмешательстве внутри ЭДЕ', value: 'Mild-other' },
      { name: 'При вмешательстве на границе ЭДЕ', value: 'Severe-other' },
    ]},
    { name: 'Нет', value: false },
  ]}};

const p_vAccents = {
  type: 'list', name: 'С акцентом', id: 'with_accent', displayValues: true,
  tierTemplate: '{ p_participants }-vAccents',
  valueList: { xorValues: [
    { name: 'Да', orValues: [
      { name: 'С восходящим тоном', value: v_R },
      { name: 'С нисходящим тоном', value: v_F },
      { name: 'С ровным тоном', value: v_L },
      { name: 'С восходяще-нисходящим тоном', value: [v_RF, v_Rf, v_rF] },
      { name: 'С восходяще-ровным тоном', value: [v_RL, v_Rl] },
      { name: 'С нисходяще-восходящим тоном', value: [v_FR, v_Fr] },
      { name: 'Другой вариант', editable: true },
    ]},
    { name: 'Нет', value: false },
  ]},
  virtualKeyboard: true,
  validChars: [v_R, v_F, v_L, v_r, v_f, v_l],
  substitute: [
    [/[-\u2014\u2012]/g, '\u2013'],
  ],
  valuesSubstitute: [
    [v_R, 'R'],
    [v_F, 'F'],
    [v_L, 'L'],
    [v_r, 'r'],
    [v_f, 'f'],
    [v_l, 'l'],
  ],
};

const p_vMainAccent = {
  type: 'list', name: 'С главным акцентом', id: 'p_vMainAccent',
  tierTemplate: '{ p_participants }-vMainAccent',
  valueList: { xorValues: [
    { name: 'Да', value: 'Main' },
    { name: 'Нет', value: false },
  ]}};

// eslint-disable-next-line no-unused-vars
const p_vReduction = {
  type: 'list', name: 'Редуцированное произнесение', id: 'p_vReduction',
  tierTemplate: '{ p_participants }-vReduction',
  valueList: { xorValues: [
    { name: 'Да', orValues: [
      { name: 'Всего слова', value: 'Full' },
      { name: 'Части слова', value: 'Part' },
    ]},
    { name: 'Нет', value: false },
  ]}};

// eslint-disable-next-line no-unused-vars
const p_vRegister = {
  type: 'list', name: 'Смещенный тональный регистр', id: 'p_vRegister',
  tierTemplate: '{ p_participants }-vRegister',
  valueList: { xorValues: [
    { name: 'Да', orValues: [
      { name: 'Повышенный', value: 'Hi' },
      { name: 'Сниженный', value: 'Lo' },
    ]},
    { name: 'Нет', value: false },
  ]}};

const p_vLength = {
  type: 'list', name: 'Удлиненная реализация фонем', id: 'p_vLength',
  tierTemplate: '{ p_participants }-vLength',
  valueList: { xorValues: [
    { name: 'Да', value: 'Len' },
    { name: 'Нет', value: false },
  ]}};

const p_vTempo = {
  type: 'list', name: 'Темп произнесения', id: 'p_vTempo',
  tierTemplate: '{ p_participants }-vTempo',
  valueList: { orValues: [
    { name: 'Нейтральный', value: 'Neutral' },
    { name: 'Ускоренный', value: 'Fast' },
    { name: 'Замедленный', value: 'Slow' },
  ]}
};

const p_vEmph = {
  type: 'list', name: 'Эмфатическое произнесение', id: 'p_vEmph',
  tierTemplate: '{ p_participants }-vEmph',
  valueList: { xorValues: [
    { name: 'Да', value: 'Emph' },
    { name: 'Нет', value: false },
  ]}};

const p_vStress = {
  type: 'list', name: 'Нестандартное лексическое ударение', id: 'p_vStress',
  tierTemplate: '{ p_participants }-vStress',
  valueList: { xorValues: [
    { name: 'Да', value: 'Stress' },
    { name: 'Нет', value: false },
  ]}};

const p_vStops = {
  type: 'list', name: 'Особенности произнесения начала / конца словоформы',
  id: 'p_vStops', tierTemplate: '{ p_participants }-vStops',
  valueList: { orValues: [
    { name: 'Гласный («шва»-) призвук в начале словоформы', value: 'Schw-st' },
    { name: 'Гортанная смычка («твердый приступ») в начале словоформы', value: 'Gl-st' },
    { name: 'Гласный («шва»-) призвук в конце словоформы', value: 'Schw-en' },
    { name: 'Гортанная смычка («твердый приступ») в конце словоформы', value: 'Gl-en' },
    { name: 'Губная смычка в конце словоформы', value: 'Lab-en' },
    { name: 'Придыхание в конце словоформы', value: 'Asp-en' },
  ]}
};

const p_vCollatForm = {
  type: 'list', name: 'Тип явления', id: 'p_vCollatForm',
  tierTemplate: '{ p_participants }-vCollatForm',
  valueList: { orValues: [
    { name: 'Смех', value: '{laugh}' },
    { name: 'Улыбка', value: '{smile}' },
    { name: 'Скрипучий голос', value: '{creaky}' },
  ]}
};

const commonProperties = [p_duration, p_participants];

const defaultPropertiesList = commonProperties;
const testPropertiesList = commonProperties.concat([p_vWForm, p_vWordNum,
  p_vAccentsCount, p_vInterrupt, p_vIllocPhase, p_mGeStructure, p_vAccents]);

const propertiesLists = {
  u_vEDU: commonProperties.concat([
    p_vIllocPhase, p_vWordsCount, p_vPausesCount, p_vFilledCount,
    p_vStartFilled, p_vCombIllocPhase, p_vInterruptCount, p_vAccentsCount,
    p_vMainAccentsCount, p_vAccentsAfterMainCount, p_vMainAccents, p_vParenth,
    p_vInSplit, p_vCoConstr, p_vCitation]),
  u_vWord: commonProperties.concat([p_vWForm, p_vWNearPause, p_vOnom,
    p_vTruncated, /* p_vWordNum, p_vWordNumReversed, */ p_vInterrupt, p_vAccents,
    p_vMainAccent, /* p_vReduction, p_vRegister, */ p_vLength, p_vTempo, p_vEmph,
    p_vStress, p_vStops]),
  u_vLaughSegm: commonProperties.concat([p_vLInOutEDU, p_vLNearPause]),
  u_vFilledSegm: commonProperties.concat([p_vFInOutEDU, p_vFNearPause, p_vFForm]),
  u_vHPause: commonProperties.concat([p_vHInOutEDU, p_vHNearPause]),
  u_vOtherSegm: commonProperties.concat([p_vOInOutEDU, p_vONearPause, p_vOForm]),
  u_vCollat: commonProperties.concat([p_vCollatForm]),
  u_vPause: commonProperties.concat([p_vPauseInOutEDU]),

  u_oFixation: commonProperties.concat([p_oInterlocutor, p_oLocus]),

  u_mMovement: commonProperties.concat([p_mHand, p_mMtType]),
  u_mStillness: commonProperties.concat([p_mHand, p_mStType]),
  u_mStroke: commonProperties.concat([p_mStrokeHandedness, p_mStrokeLenType]),
  u_mAdaptor: commonProperties.concat([p_mAdType]),
  u_mGesture: commonProperties.concat([p_mGeHandedness, p_mGeStructure,
    p_mGeFunction, p_mGeTags]),
};

function keepZero(...args) {
  // Вычисляет аналог выражения:  arg1 || arg2 || ... || argN,
  // но считает, что цифра ноль это тоже тру.
  for (let i = 0; i < args.length - 1; i++) {
    let arg = args[i];
    if (arg || arg === 0) return arg;
  }
  if (args.length > 0) return args.slice(-1)[0];
}

function isImportant(value) {
  return [null, undefined, ''].indexOf(value) < 0;
}

function beautifyNumber(number) {
  // Отбиваем в числе пробелами каждые три разряда, дефис заменяем на минус.
  // Если бы можно было использовать regexp lookbehind assertions (они
  // поддерживаются только в Chrome и Edge), то разбивку разрядов можно было
  // бы сделать так:
  //
  //   txt = txt.replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0');
  //
  let txt = number.toString(), parts = [],
      [sign, x] = txt[0] === '-' ? ['\u2212', txt.slice(1)] : ['', txt];

  do {
    parts.unshift(x.slice(-3));
    x = x.slice(0, -3);
  } while (x.length > 0);

  return sign + parts.join('\u00a0');
}

function injectNumber(template, value) {
  return template.replace('##', beautifyNumber(value));
}

function injectNodeNumbers(template, node1, node2) {
  if (!(/#[12]#/g).test(ko.unwrap(template))) {
    return template;
  }
  return ko.computed(function () {
    var sn1 = node1.serialNumber(),
        sn2 = node2 && node2.serialNumber(),
        text = ko.unwrap(template);
    if (sn1 !== undefined) {
      text = text.replace(/#1#/g,
        `<span class="ui circular label">${ sn1 }</span>`);
    }
    if (sn2 !== undefined) {
      text = text.replace(/#2#/g,
        `<span class="ui circular label">${ sn2 }</span>`);
    }
    return text;
  });
}

class SearchUnitProperty {
  constructor(data, node1, node2) {
    this.type = data.type;
    this.node = node1;
    this.node1 = this.node;
    this.node2 = node2;
    this.id = data.id;
    this.name = injectNodeNumbers(data.name, node1, node2);
    this.help = data.help ? injectNodeNumbers(data.help, node1, node2) : '';
    this.value = ko.observable(null);
    this.virtualKeyboard = data.virtualKeyboard || false;
    this.isRegEx = data.isRegEx || false;
    this.tierTemplate = data.tierTemplate;

    this._SearchUnitProperty_tune(data);
  }
  static createByType(data, node1, node2) {
    let map = {
          'interval': IntervalProperty,
          'text': TextProperty,
          'list': ListProperty
        },
        Property = map[data.type];
    if (Property) {
      return new Property(data, node1, node2);
    }
  }
  _SearchUnitProperty_tune(data) { // NOTE: Если использовать в качестве
    // имени просто tune, будет скрытый конфликт имен при наличии у потомка
    // метода с тем же названием и вызове у него в конструкторе super.
    if (data.valuesSubstitute) {
      this.value = this.value.extend({ autoMorphingValue: data.valuesSubstitute });
    }
    this.validChars = data.validChars;
    this.validitySusbstitutions = this.getValueSubstitutions(data);
  }
  getValueSubstitutions(data) {
    let substitutions = [];
    if (data.substitute && data.substitute.length) {
      substitutions = data.substitute;
    }
    if (data.validChars && data.validChars.length) {
      let invalidChars = `[^${ escapeRegExp(data.validChars.join('')) }]`;
      substitutions.push([new RegExp(invalidChars, 'g'), '']);
    }
    return substitutions;
  }
  makeValueValid(string) {
    for (let i = 0; i < this.validitySusbstitutions.length; i++) {
      let [ regexp, replacement ] = this.validitySusbstitutions[i];
      string = string.replace(regexp, replacement);
    }
    return string;
  }
  insertText(text, element, value) {
    element = jQuery(element)
      .parents('.bmpp-valueList', 'li').find('input[type="text"]').get(0);
    return function () {
      let pos = element.selectionStart || 0;
      value(value().slice(0, pos) + text + value().slice(pos));
      pos += text.length;
      element.selectionStart = pos;
      element.selectionEnd = pos;
      element.focus();
    };
  }
  onHeaderClick() {
    // do nothing if not implemented
  }
  get isHeaderClickable() {
    return false;
  }
  getJsonProperties() {
    return ko.computed(function () {
      let value = this.value(), props = [];
      if (isImportant(value)) {
        props.push({ prop: this.id, value: value });
      }
      return props;
    }, this);
  }
  getBanner() {
    return '';
  }
  clear() {
    this.value(null);
  }
}

class IntervalProperty extends SearchUnitProperty {
  constructor(data, node1, node2) {
    super(data, node1, node2);

    this.from = ko.observable(null);
    this.to = ko.observable(null);
    this.units = data.units || '';
    this.allowNegatives = data.allowNegatives || false;
    this.neverEmpty = data.neverEmpty || false;

    let aN = this.allowNegatives;

    this.from.min = keepZero(data.fromMin, data.min, aN ? null : 0);
    this.from.max = keepZero(data.fromMax, data.max, null);
    this.from.step = data.fromStep || data.step || 1;
    this.from.placeholder = data.fromPlaceholder || '';
    this.from.label = data.fromLabel || 'от';
    this.from.banner = data.fromBanner || 'от ##';
    this.from.onlyBanner = data.fromOnlyBanner || this.from.banner;

    this.to.min = keepZero(data.toMin, data.min, aN ? null : 0);
    this.to.max = keepZero(data.toMax, data.max, null);
    this.to.step = data.toStep || data.step || 1;
    this.to.placeholder = data.toPlaceholder || '';
    this.to.label = data.toLabel || 'до';
    this.to.banner = data.toBanner || 'до ##';
    this.to.onlyBanner = data.toOnlyBanner || this.to.banner;

    this.fromToBanner = data.fromToBanner || `${ this.from.banner } ${ this.to.banner }`;
    this.fromToEqualBanner = data.fromToEqualBanner || '##';
    this.unitsBanner = data.unitsBanner || data.units || '';

    this.tune(data);
  }
  tune(data) {
    this.validitySusbstitutions = this.getValueSubstitutions(data);
    this.tuneValue();
    this.jsonProperties = this.getJsonProperties();
    this.banner = this.getBanner();
  }
  tuneValue() {
    if (this.neverEmpty) {
      ko.computed(function () {
        let from = this.from, to = this.to;
        if (from() === null) from(Math.max(0, from.min));
        if (to() === null) to(Math.min(0, from.max));
      }, this);
    }

    // from не должно быть больше to
    ko.computed(function () {
      let from = this.from(), to = this.to.peek();
      if (isImportant(from) && isImportant(to) && from > to) {
        this.to(from);
      }
    }, this);
    // to не должно быть меньше from
    ko.computed(function () {
      let from = this.from.peek(), to = this.to();
      if (isImportant(from) && isImportant(to) && to < from) {
        this.from(to);
      }
    }, this);
    // композитное значение
    ko.computed(function () {
      let from = this.from(), to = this.to(), struct = {};
      if (!isImportant(from) && !isImportant(to)) {
        this.value(null);
      } else {
        if (isImportant(from)) struct.min = from;
        if (isImportant(to)) struct.max = to;
        this.value(struct);
      }
    }, this);
  }
  clear() {
    this.from(null);
    this.to(null);
  }
  getJsonProperties() {
    return ko.computed(function () {
      let value = this.value(), props = [];
      if (isImportant(value)) {
        if (isImportant(value.min)) {
          props.push({ prop: `${ this.id }_min`, value: value.min });
        }
        if (isImportant(value.max)) {
          props.push({ prop: `${ this.id }_max`, value: value.max });
        }
      }
      return props;
    }, this);
  }
  getValueSubstitutions(data) {
    let ss = super.getValueSubstitutions(data);
    ss.push([/\u2212/g, '-']);  // Заменить все минусы на "минусы" (дефисы)
    ss.push([/[^-\d]/g, '']);  // Удалить всё кроме цифр и знаков минуса
    ss.push([/\b-/g, '']);  // Удалить все знаки минуса внутри цифр
    return ss;
  }
  getBanner() {
    return ko.computed(function () {
      let from = this.from(), to = this.to(), banner = '';
      if (isImportant(from) && isImportant(to)) {
        if (from === to) {
          banner = injectNumber(this.fromToEqualBanner, from);
        } else {
          banner = injectNumber(injectNumber(this.fromToBanner, from), to);
        }
      }
      if (isImportant(from) && !isImportant(to)) {
        banner = injectNumber(this.from.onlyBanner, from);
      }
      if (!isImportant(from) && isImportant(to)) {
        banner = injectNumber(this.to.onlyBanner, to);
      }
      if (banner && this.unitsBanner) { banner += ' ' + this.unitsBanner; }
      return banner;
    }, this);
  }
}

class TextProperty extends SearchUnitProperty {
  constructor(data, node1, node2) {
    super(data, node1, node2);
    this.placeholder = data.placeholder || '';
    this.tune();
  }
  tune() {
    this.jsonProperties = this.getJsonProperties();
    this.banner = this.getBanner();
  }
  getBanner() {
    return ko.computed(function () {
      let value = this.value();
      return isImportant(value) ? `«${ value }»` : '';
    }, this);
  }
}

function escapeRegExp(string) {
  return string.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&');
}

function addRawValues(listItem, values) {
  let value = ko.unwrap(listItem.value);
  if (value instanceof Array) {
    values = values.filter(x => value.indexOf(x) < 0);
    values = values.concat(value);
  } else if (isImportant(value)) {
    values = values.filter(x => x !== value);
    values.push(value);
  }
  return values;
}

class ListProperty extends SearchUnitProperty {
  constructor(data, node1, node2) {
    super(data, node1, node2);
    this.allIfEmpty = data.allIfEmpty || false;
    this.displayValues = data.displayValues || false;
    this.chosenValues = ko.observableArray([]);
    this.valueList = new ValueList(data.valueList, null, this);

    this.tune();
  }
  tune() {
    this.tuneValue();
    this.jsonProperties = this.getJsonProperties();
    this.banner = this.getBanner();
  }
  tuneValue() {
    ko.computed(function () {
      let value = this.value,
          values = this.unwrapValues(this.chosenValues());

      this.node.unitType(); // Реагировать на изменение типа единицы поиска.
      // Этот вызов необходим, чтобы, если изменится тип единицы, этот
      // computed вычислился повторно. Это важно, например, для свойств
      // с параметром allIfEmpty === true. Свойство p_participants
      // чувствительно к типу канала, в окуломотрном канале часть галочек
      // деактивируется. Поэтому если пользователь изменил текущую единицу
      // с окуломотрной фиксации на вокальную ЭДЕ и при этом никакие участники
      // у него не были выбраны, что эквивалентно использованию всех, то без
      // этого вызова число выбранных участников у него осталось бы прежним,
      // т.е. меньшим нужного.
      if (this.allIfEmpty && values.length === 0) {
        values = this.getAllValues();
      }

      if (values.length > 0) {
        if (this.valueList.isXOR && values.length === 1
        && this.valueList.items.some(item => item === values[0])) {
          let vals = [];
          vals = addRawValues(values[0], vals);
          if (vals.length === 1) {
            value(vals[0]);
          } else {
            value(vals);
          }
        } else {
          let vals = [];
          values.map(item => {
            vals = addRawValues(item, vals);
          });
          value(vals);
        }
      } else {
        value(null);
      }
    }, this);
  }
  clear() {
    this.valueList.uncheckAll();
  }
  unwrapValues(values) {
    return values.map(value => ko.isObservable(value) ? value() : value);
  }
  onHeaderClick() {
    const valueList = this.valueList,
          CLICK_IS_NOT_ON_ANY_CHECKBOX = null;
    this._lastActiveCheckbox = CLICK_IS_NOT_ON_ANY_CHECKBOX;
    if (this.isHeaderClickable) {
      if (valueList.isOR) {
        valueList.invertSelection();
      } else if (valueList.isXOR) {
        valueList.rotateSelection();
      }
    }
  }
  get isHeaderClickable() {
    return this.valueList.hasNoChildList;
  }
  getBanner() {
    return ko.computed(function () {
      let banner = this.chosenValues().map(
        item => {
          let prefix = '', postfix,
              parentItem = item.list.depth > 0 && item.list.parentItem;
          while (parentItem && parentItem.addNameToChildNames) {
            let name = ko.unwrap(parentItem.name);
            prefix = name.slice(0, 1).toLowerCase() +
              name.slice(1) + ' ' + prefix;
            parentItem = parentItem.list.depth > 0 && parentItem.list.parentItem;
          }
          if (item.editable) {
            postfix = `«${ item.value() }»`;
          } else {
            let name = ko.unwrap(item.name);
            postfix = name.slice(0, 1).toLowerCase() + name.slice(1);
          }
          return prefix + postfix;
        }
      ).join('; ');
      return injectNodeNumbers(banner, this.node1, this.node2);
    }, this);
  }
  getAllValues() {
    let list = [], hasChildItems = false;
    if (this.valueList.isXOR) return list;
    this.valueList.items.forEach(item => {
      let disabled = item.disabled;
      disabled = ko.isObservable(disabled) ? disabled() : disabled;
      if (isImportant(item.value) && !disabled) {
        list.push(item);
      }
      if (item.childList) {
        hasChildItems = true;
      }
    });
    if (hasChildItems) {
      list = [];
    }
    return list;
  }
}

class ValueList {
  constructor(data, parentItem, property) {
    this.depth = parentItem === null ? 0 : parentItem.list.depth + 1;
    this.isOR = !data.xorValues;
    this.isXOR = !data.orValues;
    this.radioButtons = data.radioButtons;
    this.parentItem = parentItem;
    this.listProperty = property;
    this.items = (this.isOR ? data.orValues : data.xorValues).map(
      itemData => new ValueListItem(itemData, this)
    );

    this.tune();
  }
  tune() {
    if (this.isXOR && this.radioButtons) {
      this.checkFirst();
    }
  }
  checkAll() {
    this.items.forEach(item => {
      let childList = item.childList;
      item.checked(true);
      if (childList && childList.isOR) {
        childList.checkAll();
      } else if (childList && childList.isXOR) {
        childList.checkFirst();
      }
    });
  }
  checkFirst() {
    let item = this.items[0],
        childList = item.childList;
    item.checked(true);
    if (childList && childList.isOR) {
      childList.checkAll();
    } else if (childList && childList.isXOR) {
      childList.checkFirst();
    }
  }
  checkFirstAsIfByUser() {
    this.items[0].userChecked(true);
  }
  uncheckAll() {
    this.items.forEach(item => {
      item.checked(false);
      if (item.childList) {
        item.childList.uncheckAll();
      }
    });
  }
  uncheckAllBut(specialItem) {
    this.items.forEach(item => {
      if (item !== specialItem) {
        item.checked(false);
      }
    });
  }
  get hasNoChildList() {
    return this.items.every(item => !item.childList);
  }
  get areAllUnchecked() {
    return this.items && this.items.every(item => !item.checked());
  }
  invertSelection() {
    this.items.forEach(item => {
      item.checked(!item.checked());
    });
  }
  rotateSelection() {
    let found = false, rotated = false;
    this.items.forEach(item => {
      if (item.checked()) {
        found = true;
        item.checked(false);
      } else if (found && !rotated) {
        item.checked(true);
        rotated = true;
      }
    });
    if (!found) this.items[0].checked(true);
  }
}


function compareOnDepth(x, y, depth) {
  let a = x.getListItemOnDepth(depth),
      b = y.getListItemOnDepth(depth),
      ai = a.list.items.indexOf(a),
      bi = b.list.items.indexOf(b);
  if (ai < bi) return -1;
  if (ai > bi) return 1;
  return 0;
}

function sortTwoValueListItems(a, b) {
  let depth = 0,
      x = compareOnDepth(a, b, depth);
  while(x === 0 || a.list.depth < depth && b.list.depth < depth) {
    depth += 1;
    x = compareOnDepth(a, b, depth);
  }
  return x;
}

class ValueListItem {
  constructor(data, list) {
    this.list = list;
    this.name = injectNodeNumbers(data.name,
      list.listProperty.node1, list.listProperty.node2);
    this.icon = data.icon;
    this.checked = ko.observable(null);
    this.userChecked = this.getUserChecked();
    this.editable = data.editable || false;
    this.disabledInChannels = data.disabledInChannels;
    this.disabled = this.getDisabledInfo();
    this.value = this.editable ? this.getValidatingValue(): data.value;
    this.childList = (data.orValues || data.xorValues ?
      new ValueList(data, this, list.listProperty) : null);
    this.addNameToChildNames = data.addNameToChildNames || false;

    this.tuneXOR();
    this.tuneParentList();
    this.tuneChildList();
    this.tuneEditable();
    this.tuneCumulativeValue();
  }
  getDisabledInfo() {
    let channelIds = this.disabledInChannels;
    if (channelIds && channelIds.length > 0) {
      return ko.computed(function () {
        let unitType = this.list.listProperty.node.unitType(),
            channelId = unitType && unitType.channel.id;
        return channelId && channelIds.indexOf(channelId) > -1;
      }, this);
    } else {
      return false;
    }
  }
  getUserChecked() {
    return ko.computed({
      read: this.checked,
      write: function (newValue) {
        this.list.listProperty._lastActiveCheckbox = this;
        this.checked(newValue);
      }
    }, this);
  }
  getValidatingValue() {
    let observable = ko.observable('');
    let computed = ko.computed({
      read: observable,
      write: function (newVal) {
        let oldVal = observable(),
            newTunedVal = this.list.listProperty.makeValueValid(newVal);
        if (newTunedVal !== oldVal) {
          observable(newTunedVal);
        } else if (newVal !== oldVal) {
          observable.notifySubscribers(newTunedVal);
        }
      }
    }, this).extend({ notify: 'always' });
    return computed;
  }
  tuneXOR() {
    if (this.list.isXOR) {
      ko.computed(function () {
        let checked = this.checked();

        if (checked) {
          this.list.uncheckAllBut(this);
        }

        if (!checked && this.isChangeStraightforward
            && !this.list.parentItem
            && this.list.radioButtons) {
          this.checked(true);
        }

        // NOTE: см. ##xorparuni##
        if (!checked && this.isChangeStraightforward
            && !this.list.radioButtons
            && this.list.parentItem
            && ko.unwrap(this.list.parentItem.value)
            && this.list.areAllUnchecked) {
          this.list.listProperty.chosenValues.push(this.list.parentItem);
        }

      }, this);
    }
  }
  get isChangeStraightforward() {
    // Возвращает true, если галочка изменилась под направленным
    // непосредственно на нее действием пользователя. Если же галочка
    // устанавливается или снимается автоматически, например, при нажатии
    // на родительскую галочку, то возвращает false.
    return this.list.listProperty._lastActiveCheckbox === this;
  }
  tuneParentList() {
    if (this.list.depth > 0) {
      ko.computed(function () {
        let checked = this.checked(), list = this.list,
            parentItem = list.parentItem;
        if (this.isChangeStraightforward) {
          if (checked && !parentItem.checked.peek()) {
            parentItem.checked(true);
          } else if (!checked
              && parentItem.checked.peek()
              && list.items.every(item => !item.checked.peek())) {

            if (list.isXOR && ko.unwrap(parentItem.value)) {
              // NOTE: Случай ##xorparuni##
              parentItem.checked(true);
            } else {
              parentItem.checked(false);
            }
          }
        }
      }, this);
    }
  }
  tuneChildList() {
    if (this.childList) {
      ko.computed(function () {
        let checked = this.checked(),
            childList = this.childList,
            value = ko.unwrap(this.value);
        if (this.isChangeStraightforward) {
          if (checked && childList.isOR) {
            childList.checkAll();
          } else if (checked && childList.isXOR && !value) {
            childList.checkFirst();
          } else if (checked && childList.isXOR && value) {
            // NOTE: см. ##xorparuni##
            // pass
          } else if (!checked) {
            childList.uncheckAll();
          }
        }
      }, this);
    }
  }
  tuneEditable() {
    if (this.editable) {
      // Ставить/снимать галочку в зависимости от введенного значения
      ko.computed(function () {
        this.checked(!!this.value());
      }, this);
      // Снимать галочку и активировать поле ввода, если значение пусто
      ko.computed(function () {
        if (this.checked() && !this.value.peek()) {
          if (this.isChangeStraightforward) {
            jQuery(this.userChecked.checkboxComponent)
              .siblings('.ui.input').first()
              .find('input[type="text"]')
              .focus();
          }
          this.checked(false);
        }
      }, this);
    }
  }
  tuneCumulativeValue() {
    ko.computed(function () {
      let chosenValues = this.list.listProperty.chosenValues,
          disabled = this.disabled,
          checked = this.checked();
      disabled = ko.isObservable(disabled) ? disabled() : disabled;
      if (isImportant(this.value)) {
        chosenValues.remove(this);

        // NOTE: см. ##xorparuni##
        if (this.list.parentItem && ko.unwrap(this.list.parentItem.value)) {
          chosenValues.remove(this.list.parentItem);
        }

        if (checked && !disabled) {
          chosenValues.push(this);
          chosenValues.sort(sortTwoValueListItems);
        }
      }
    }, this);
  }
  getListItemOnDepth(depth) {
    if (depth === this.list.depth) {
      return this;
    }
    return this.list.parentItem.getListItemOnDepth(depth);
  }
}

export {
  defaultPropertiesList, testPropertiesList, propertiesLists,
  SearchUnitProperty, IntervalProperty, TextProperty, ListProperty,
  p_duration, escapeRegExp, injectNodeNumbers, beautifyNumber
};
