import jQuery from 'jquery';

const recordsHelp = `

  <p>При выборе одного или нескольких вариантов поиск будет
  вестись только по указанным записям. В&nbsp;настоящий момент
  для поиска доступны 3 записи эталонного подкорпуса 2015 года.</p>

`;

const recordsPhasesHelp = `

  <p>При выборе одного или нескольких вариантов поиск будет
  вестись только по указанным этапам: рассказу, разговору или
  пересказу.</p>

`;

const template = `

  <h1 class="ui header">Область поиска</h1>
  <div class="ui grid">
    <div class="ten wide column" data-bind="with: records">
      <div class="ui padded segment bmpp-subcorpusForm">
        <div class="ui top attached large label">
          <header data-bind="click: invertSelection">
            Записи
          </header>
          <i class="disabled question circle outline icon
                    bmpp-nearLabelIcon bmpp-recordsHelp"></i>
        </div>

        <div class="ui form" data-bind="foreach: fields">
          <div class="field">
            <bmpp-checkbox params="value: value, label: label,
              disabled: disabled, tabindex: $index,
              disabledTooltip: 'Запись пока не готова'"></bmpp-checkbox>
          </div>
        </div>

      </div>
    </div>

    <div class="six wide column" data-bind="with: recordPhases">
      <div class="ui padded segment bmpp-subcorpusForm">
        <div class="ui top attached large label">
          <header data-bind="click: invertSelection">
            Этапы записей
          </header>
          <i class="disabled question circle outline icon
             bmpp-nearLabelIcon bmpp-recordsPhasesHelp"></i>
        </div>
        <form class="ui form" data-bind="foreach: fields">
          <div class="field">
            <bmpp-checkbox params="value: value, label: label,
              tabindex: $index() + $root.subcorpus.records.fields.length">
            </bmpp-checkbox>
          </div>
        </form>

      </div>
    </div>

    <div>
      <button class="ui small button three wide column"
        data-bind="click: subcorpusClearSelection">Очистить</button>
    </div>

  </div>

`;

var viewModelFactory = (params, componentInfo) => {
  let records = params.records,
      recordPhases = params.recordPhases,
      subcorpusClearSelection = () => {
        if (!records.areAllUnchecked) {
          records.clearSelection();
        }
        if (!recordPhases.areAllUnchecked) {
          recordPhases.clearSelection();
        }
      },
      popupOpts = {
        variation: 'basic',
        delay: { show: 400, hide: 0 },
        duration: 400,
      };

  for (let { html, selector } of [
    { html: recordsHelp, selector: '.bmpp-recordsHelp' },
    { html: recordsPhasesHelp, selector: '.bmpp-recordsPhasesHelp' }
  ]) {
    popupOpts.html = html;
    jQuery(componentInfo.element).find(selector).popup(popupOpts);
  }

  return {
    records: records,
    recordPhases: recordPhases,
    subcorpusClearSelection: subcorpusClearSelection
  };
};

export default {
  viewModel: { createViewModel: viewModelFactory },
  template: template
};
