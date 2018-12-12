import jQuery from 'jquery';
import ko from 'knockout';

const DURATION = {
  type: 'interval', name: 'Длительность', id: 'duration', step: 20,
  units: 'миллисекунд', unitsBanner: 'мс',
  fromOnlyBanner: 'не менее ##', toOnlyBanner: 'не более ##',
  fromToEqualBanner: 'ровно ##',
  help: `<header class="ui header">Интервал длительности единицы</header>
  <p>Чтобы отобрать единицы, длительность которых не меньше указанной,
  заполните только левое поле. Чтобы отобрать единицы, длительность которых
  не больше указанной, заполните только правое поле. Свойство не будет
  учитываться в запросе, если ничего не задать.</p>` };

const PARTICIPANTS = {
  type: 'list', name: 'Участники', id: 'participants',
  valueList: { orValues: [
    { name: 'Рассказчик', value: 'N' },
    { name: 'Комментатор', value: 'C', disabledInChannels: ['ocul'] },
    { name: 'Пересказчик', value: 'R' }
  ]}};

const SAME_PARTICIPANT = {
  type: 'list', name: 'Совпадение участников', id: 'same_participant',
  valueList: { xorValues: [
    { name: 'Да', value: true },
    { name: 'Нет', value: false },
  ]}};

const p_mGeStructure = {
  type: 'list', name: 'Фазовая структура', id: 'p_mGeStructure',
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
  valueList: { orValues: [
    { name: 'Леворучный', value: 'Lt' },
    { name: 'Праворучный', value: 'Rt' },
    { name: 'Двуручный с симетричной траекторией', value: 'Bh-sym' },
    { name: 'Двуручный с идентичной / единой траекторией', value: 'Bh-id' },
    { name: 'Двуручный с различной траекторией у разных рук', value: 'Bh-dif' },
    { name: 'Прочее', value: 'Other' },
  ]}};

const p_mGeFunction = {
  type: 'list', name: 'Функциональный тип', id: 'p_mGeFunction',
  valueList: { orValues: [
    { name: 'Изобразительный жест', value: 'Depictive' },
    { name: 'Указательный жест', value: 'Pointing' },
    { name: 'Жестовое ударение', value: 'Beat' },
    { name: 'Другое', value: 'Other' },
    { name: 'Прагматический / метафорический жест', value: 'Pragmatic' },
  ]}};

const p_mGeTags = {
  type: 'list', name: 'Дополнительные признаки', id: 'p_mGeTags',
  valueList: { orValues: [
    { name: 'Двуручный жест («туда-обратно»)', value: 'Shuttle' },
    { name: 'Жест с многократным махом', value: 'Multi-S' },
    { name: 'Отскок в конце маха', value: 'S Rebound' },
    { name: 'Отскок в конце ретракции', value: 'R Rebound' },
    { name: 'Многократный отскок в конце маха', value: 'Multi Rebound' },
    { name: 'Длинная ретракция', value: 'Long R' },
    { name: 'Наложение на текущий жест фазы другого жеста', value: '(Lt|Rt) [PSHR] Overlap' },
    { name: 'Повтор предыдущего жеста', value: 'Repeat' },
    { name: 'Обрыв в основном сформированного жеста', value: 'GeBreakOff' },
    { name: 'Обрыв жеста без маховой фазы', value: 'GeFalstart' },
  ]}};

const p_vIllocPhase = {
  type: 'list', name: 'Иллокутивно-фазовое значение', id: 'p_vIllocPhase',
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
  ]}};

const p_vCombIllocPhase = {
  type: 'list', name: 'Комбинация иллокутивно-фазовых значений',
  id: 'p_vCombIllocPhase',
  valueList: { orValues: [
    { name: 'Не-сообщение + незавершенность', value: 'NonStNonFinal' },
    { name: 'Не-сообщение + неполнота информации', value: 'NonStDots' },
    { name: 'Не-сообщение + восклицательность', value: 'NonStExclam' },
    { name: 'Незавершенность + обрыв', value: 'NonFinalTrunc' },
    { name: 'Прочее', value: 'Other' },
  ]}};

const p_vAccentsCount = {
  type: 'interval', name: 'Число акцентов', id: 'p_vAccentsCount',
  fromOnlyBanner: '## и более', toOnlyBanner: '## и менее' };

const p_vMainAccentsCount = {
  type: 'interval', name: 'Число главных акцентов', id: 'p_vMainAccentsCount',
  fromOnlyBanner: '## и более', toOnlyBanner: '## и менее' };

const p_vAccentsAfterMainCount = {
  type: 'interval', name: 'Число вторичных акцентов после главного',
  id: 'p_vAccentsAfterMainCount',
  fromOnlyBanner: '## и более', toOnlyBanner: '## и менее' };

const p_vWordsCount = {
  type: 'interval', name: 'Число слов', id: 'p_vWordsCount',
  fromOnlyBanner: '## и более', toOnlyBanner: '## и менее' };

const p_vPausesCount = {
  type: 'interval', name: 'Число абсолютных пауз', id: 'p_vPausesCount',
  fromOnlyBanner: '## и более', toOnlyBanner: '## и менее' };

const p_vFilledCount = {
  type: 'interval', name: 'Число заполненных пауз', id: 'p_vFilledCount',
  fromOnlyBanner: '## и более', toOnlyBanner: '## и менее' };

const p_vStartFilled = {
  type: 'list', name: 'Начинается с заполненной паузы',
  id: 'p_vStartFilled',
  valueList: { xorValues: [
    { name: 'Да', value: 'Yes' },
    { name: 'Нет', value: false },
  ]}};

const p_vInterruptCount = {
  type: 'interval', name: 'Число точек прерывания', id: 'p_vInterruptCount',
  fromOnlyBanner: '## и более', toOnlyBanner: '## и менее' };

const p_vMainAccents = {
  type: 'list', name: 'Движение тона в главном акценте',
  id: 'p_vMainAccents', displayValues: true,
  valueList: { orValues: [
    { name: 'Восходящее', value: '/' },
    { name: 'Нисходящее', value: '\\' },
    { name: 'Ровное', value: '–' },
    { name: 'Восходяще-нисходящее', value: ['/\\', '/↓', '↑\\'] },
    { name: 'Восходяще-ровное', value: ['/–', '/→'] },
    { name: 'Нисходяще-восходящее', value: ['\\/', '\\↑'] },
    { name: 'Другой вариант', editable: true },
  ]},
  virtualKeyboard: true,
  validChars: ['/', '\\', '–', '↑', '↓', '→'],
  substitute: [
    [/[-\u2014\u2012]/g, '\u2013'],
  ]};

const p_vParenth = {
  type: 'list', name: 'Входит в конструкцию со вставкой',
  id: 'p_vParenth',
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
  id: 'p_vInSplit',
  valueList: { xorValues: [
    { name: 'Да', value: 'InSplit' },
    { name: 'Нет', value: false },
  ]}};

const p_vCoConstr = {
  type: 'list', name: 'Входит в совместное построение реплик',
  id: 'p_vCoConstr',
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
  id: 'p_vCitation',
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
  valueList: { orValues: [
    { name: 'Лицо', value: 'Face' },
    { name: 'Руки', value: 'Hands' },
    { name: 'Тело', value: 'Body' },
    { name: 'Прочее', value: 'Other' },
  ]}
};

const p_mHand = {
  type: 'list', name: 'Рука', id: 'p_mHand',
  valueList: { orValues: [
    { name: 'Левая', value: 'Lt' },
    { name: 'Правая', value: 'Rt' },
  ]}
};

const p_mMtType = {
  type: 'list', name: 'Тип движения', id: 'p_mMtType',
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
  valueList: { orValues: [
    { name: 'Удержание', value: 'Hold' },
    { name: 'Покой', value: 'Reset' },
    { name: 'Зависание', value: 'Frozen' },
  ]}
};

const p_mStrokeHandedness = {
  type: 'list', name: 'Рукость', id: 'p_mStrokeHandedness',
  valueList: { orValues: [
    { name: 'Левая рука', value: 'L' },
    { name: 'Правая рука', value: 'R' },
    { name: 'Обе руки', value: 'B' },
  ]}
};

const p_mStrokeLenType = {
  type: 'list', name: 'Тип длительности', id: 'p_mStrokeLenType',
  valueList: { orValues: [
    { name: 'Короткий', value: 's' },
    { name: 'Средний', value: 'm' },
    { name: 'Длинный', value: 'l' },
  ]}
};

const p_mAdType = {
  type: 'list', name: 'Тип адаптора', id: 'p_mAdType',
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
  valueList: { orValues: [
    { name: 'Внутри ЭДЕ', value: 'In' },
    { name: 'Отдельно', value: 'Out' },
  ]}
};
const p_vHInOutEDU = createPropertyFromTemplate(pt_InOutEDU, 'p_vHInOutEDU'),
      p_vLInOutEDU = createPropertyFromTemplate(pt_InOutEDU, 'p_vLInOutEDU'),
      p_vOInOutEDU = createPropertyFromTemplate(pt_InOutEDU, 'p_vOInOutEDU');

const pt_NearPause = {
  type: 'list', name: 'Соседство с изолированными паузами',
  valueList: { orValues: [
    { name: 'Непосредственно перед паузой', value: 'Before' },
    { name: 'Непосредственно после паузы', value: 'After' },
    { name: 'Непосредственно между паузами', value: 'Between' },
    { name: 'Не соседствует с паузами', value: false },
  ]}
};
const p_vHNearPause = createPropertyFromTemplate(pt_NearPause, 'p_vHNearPause'),
      p_vLNearPause = createPropertyFromTemplate(pt_NearPause, 'p_vLNearPause'),
      p_vONearPause = createPropertyFromTemplate(pt_NearPause, 'p_vONearPause'),
      p_vWNearPause = createPropertyFromTemplate(pt_NearPause, 'p_vWNearPause');

const p_vOForm = {
  type: 'list', name: 'Тип действия', id: 'p_vOForm',
  valueList: { orValues: [
    { name: 'Цоканье', value: 'f1' },
    { name: 'Чмоканье', value: 'f2' },
    { name: 'Фырканье', value: 'f3' },
    { name: 'Шмыганье', value: 'f4' },
    { name: 'Сглатывание', value: 'f5' },
    { name: 'Откашливание', value: 'f6' },
    { name: 'Свист', value: 'f7' },
    { name: 'Вздох', value: 'f8' },
    { name: 'Кашель', value: 'f9' },
  ]}
};

const p_vWForm = {
  type: 'text', name: 'Словарная форма', id: 'p_vWForm', placeholder: '…',
};

const p_vOnom = {
  type: 'list', name: 'Идеофон', id: 'p_vOnom',
  valueList: { xorValues: [
    { name: 'Да', value: 'Onom' },
    { name: 'Нет', value: false },
  ]}};

const p_vTruncated = {
  type: 'list', name: 'Оборванное слово', id: 'p_vTruncated',
  valueList: { xorValues: [
    { name: 'Да', value: 'Truncated' },
    { name: 'Нет', value: false },
  ]}};

const p_vWordNum = {
  type: 'interval', name: 'Позиция от начала ЭДЕ', id: 'p_vWordNum',
  fromOnlyBanner: '##‐я и дальше', toOnlyBanner: '##‐я и ближе',
  fromLabel: 'с', toLabel: 'по', fromToBanner: '##–##'
};

const p_vWordNumReversed = {
  type: 'interval', name: 'Позиция от конца ЭДЕ', id: 'p_vWordNumReversed',
  fromOnlyBanner: '##‐я и дальше', toOnlyBanner: '##‐я и ближе',
  fromLabel: 'с', toLabel: 'по', fromToBanner: '##–##'
};

const p_vInterrupt = {
  type: 'list', name: 'Точка прерывания', id: 'p_vInterrupt',
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
  valueList: { xorValues: [
    { name: 'Да', orValues: [
      { name: 'С восходящим тоном', value: '/' },
      { name: 'С нисходящим тоном', value: '\\' },
      { name: 'С ровным тоном', value: '–' },
      { name: 'С восходяще-нисходящим тоном', value: ['/\\', '/↓', '↑\\'] },
      { name: 'С восходяще-ровным тоном', value: ['/–', '/→'] },
      { name: 'С нисходяще-восходящим тоном', value: ['\\/', '\\↑'] },
      { name: 'Другой вариант', editable: true },
    ]},
    { name: 'Нет', value: false },
  ]},
  virtualKeyboard: true,
  validChars: ['/', '\\', '–', '↑', '↓', '→'],
  substitute: [
    [/[-\u2014\u2012]/g, '\u2013'],
  ]
};

const p_vMainAccent = {
  type: 'list', name: 'С главным акцентом', id: 'p_vMainAccent',
  valueList: { xorValues: [
    { name: 'Да', value: 'Main' },
    { name: 'Нет', value: false },
  ]}};

const p_vReduction = {
  type: 'list', name: 'Редуцированное произнесение', id: 'p_vReduction',
  valueList: { xorValues: [
    { name: 'Да', orValues: [
      { name: 'Всего слова', value: 'Full' },
      { name: 'Части слова', value: 'Part' },
    ]},
    { name: 'Нет', value: false },
  ]}};

const p_vRegister = {
  type: 'list', name: 'Смещенный тональный регистр', id: 'p_vRegister',
  valueList: { xorValues: [
    { name: 'Да', orValues: [
      { name: 'Повышенный', value: 'Hi' },
      { name: 'Сниженный', value: 'Lo' },
    ]},
    { name: 'Нет', value: false },
  ]}};

const p_vLength = {
  type: 'list', name: 'Удлиненная реализация фонем', id: 'p_vLength',
  valueList: { xorValues: [
    { name: 'Да', value: 'Len' },
    { name: 'Нет', value: false },
  ]}};

const p_vTempo = {
  type: 'list', name: 'Темп произнесения', id: 'p_vTempo',
  valueList: { orValues: [
    { name: 'Нейтральный', value: false },
    { name: 'Ускоренный', value: 'Fast' },
    { name: 'Замедленный', value: 'Slow' },
  ]}
};

const p_vEmph = {
  type: 'list', name: 'Эмфатическое произнесение', id: 'p_vEmph',
  valueList: { xorValues: [
    { name: 'Да', value: 'Emph' },
    { name: 'Нет', value: false },
  ]}};

const p_vStress = {
  type: 'list', name: 'Нестандартное лексическое ударение', id: 'p_vStress',
  valueList: { xorValues: [
    { name: 'Да', value: 'Stress' },
    { name: 'Нет', value: false },
  ]}};

const p_vStops = {
  type: 'list', name: 'Особенности произнесения начала / конца словоформы',
  id: 'p_vStops',
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
  valueList: { orValues: [
    { name: 'Смех', value: '{laugh}' },
    { name: 'Улыбка', value: '{smile}' },
    { name: 'Скрипучий голос', value: '{creaky}' },
  ]}
};

const commonProperties = [DURATION, PARTICIPANTS, SAME_PARTICIPANT];

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
    p_vTruncated, p_vWordNum, p_vWordNumReversed, p_vInterrupt, p_vAccents,
    p_vMainAccent, p_vReduction, p_vRegister, p_vLength, p_vTempo, p_vEmph,
    p_vStress, p_vStops]),
  u_vLaughSegm: commonProperties.concat([p_vLInOutEDU, p_vLNearPause]),
  u_vHPause: commonProperties.concat([p_vHInOutEDU, p_vHNearPause]),
  u_vOtherSegm: commonProperties.concat([p_vOInOutEDU, p_vONearPause, p_vOForm]),
  u_vCollat: commonProperties.concat([p_vCollatForm]),

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

function injectValue(template, value) {
  return template.replace('##', value.toString());
}

class SearchUnitProperty {
  constructor(data, unitType) {
    this.type = data.type;
    this.unitType = ko.observable(unitType);
    this.id = data.id;
    this.name = data.name;
    this.help = data.help || '';
    this.value = ko.observable(null);

    this.virtualKeyboard = data.virtualKeyboard || false;
    this.validChars = data.validChars;
    this.validitySusbstitutions = this.getValueSubstitutions(data);
  }
  static createByType(data, unitType) {
    let map = {
          'interval': IntervalProperty,
          'text': TextProperty,
          'list': ListProperty
        },
        Property = map[data.type];
    if (Property) {
      return new Property(data, unitType);
    }
  }
  changeUnitType(unitType) {
    this.unitType(unitType);
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
  constructor(data, unitType) {
    super(data, unitType);

    this.from = ko.observable(null);
    this.to = ko.observable(null);
    this.units = data.units || '';

    this.from.min = keepZero(data.fromMin, data.min, 0);
    this.from.max = keepZero(data.fromMax, data.max, null);
    this.from.step = data.fromStep || data.step || 1;
    this.from.placeholder = data.fromPlaceholder || '';
    this.from.label = data.fromLabel || 'от';
    this.from.banner = data.fromBanner || 'от ##';
    this.from.onlyBanner = data.fromOnlyBanner || this.from.banner;

    this.to.min = keepZero(data.toMin, data.min, 0);
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
    // from не должно быть больше to
    ko.computed(function () {
      let from = this.from(), to = this.to.peek();
      if (isImportant(from) && isImportant(to) && from > to) { this.from(to); }
    }, this);
    // to не должно быть меньше from
    ko.computed(function () {
      let from = this.from.peek(), to = this.to();
      if (isImportant(from) && isImportant(to) && to < from) { this.to(from); }
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
    ss.push([/[^\d]/g, '']);
    return ss;
  }
  getBanner() {
    return ko.computed(function () {
      let from = this.from(), to = this.to(), banner = '';
      if (isImportant(from) && isImportant(to)) {
        if (from === to) {
          banner = injectValue(this.fromToEqualBanner, from);
        } else {
          banner = injectValue(injectValue(this.fromToBanner, from), to);
        }
      }
      if (isImportant(from) && !isImportant(to)) {
        banner = injectValue(this.from.onlyBanner, from);
      }
      if (!isImportant(from) && isImportant(to)) {
        banner = injectValue(this.to.onlyBanner, to);
      }
      if (banner && this.unitsBanner) { banner += ' ' + this.unitsBanner; }
      return banner;
    }, this);
  }
}

class TextProperty extends SearchUnitProperty {
  constructor(data, unitType) {
    super(data, unitType);
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
  constructor(data, unitType) {
    super(data, unitType);
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
    let valueList = this.valueList,
        CLICK_IS_NOT_ON_CHECKBOX_LIST = -1;
    this._lastActiveDepth = CLICK_IS_NOT_ON_CHECKBOX_LIST;
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
      return this.chosenValues().map(
        item => {
          let prefix = '', postfix,
              parentItem = item.list.depth > 0 && item.list.parentItem;
          while (parentItem && parentItem.addNameToChildNames) {
            prefix = parentItem.name.slice(0, 1).toLowerCase() +
              parentItem.name.slice(1) + ' ' + prefix;
            parentItem = parentItem.list.depth > 0 && parentItem.list.parentItem;
          }
          if (item.editable) {
            postfix = `«${ item.value() }»`;
          } else {
            postfix = item.name.slice(0, 1).toLowerCase() + item.name.slice(1);
          }
          return prefix + postfix;
        }
      ).join('; ');
    }, this);
  }
}

class ValueList {
  constructor(data, parentItem, property) {
    this.depth = parentItem === null ? 0 : parentItem.list.depth + 1;
    this.isOR = !data.xorValues;
    this.isXOR = !data.orValues;
    this.parentItem = parentItem;
    this.listProperty = property;
    this.items = (this.isOR ? data.orValues : data.xorValues).map(
      itemData => new ValueListItem(itemData, this)
    );
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
    this.name = data.name;
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
        let channelId = this.list.listProperty.unitType().channel.id;
        return channelIds.indexOf(channelId) > -1;
      }, this);
    } else {
      return false;
    }
  }
  getUserChecked() {
    return ko.computed({
      read: this.checked,
      write: function (newValue) {
        this.list.listProperty._lastActiveDepth = this.list.depth;
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
        if (this.checked()) {
          this.list.uncheckAllBut(this);
        }
      }, this);
    }
  }
  get isChangeStraightforward() {
    // Возвращает true, если галочка изменилась под направленным
    // непосредственно на нее действием пользователя. Если же галочка
    // устанавливается или снимается автоматически, например, при нажатии
    // на родительскую галочку, то возвращает false.
    return this.list.listProperty._lastActiveDepth === this.list.depth;
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
            parentItem.checked(false);
          }
        }
      }, this);
    }
  }
  tuneChildList() {
    if (this.childList) {
      ko.computed(function () {
        let checked = this.checked(),
            childList = this.childList;
        if (this.isChangeStraightforward) {
          if (checked && childList.isOR) {
            childList.checkAll();
          } else if (checked && childList.isXOR) {
            childList.checkFirst();
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
  SearchUnitProperty, IntervalProperty, TextProperty, ListProperty
};
