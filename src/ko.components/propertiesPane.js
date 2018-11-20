const template = `

  <div class="bmpp-paddedPane">
    <header class="ui header">Свойства поисковой единицы</header>
    <div>
      <button class="ui small button"
        data-bind="click: $root.queryPaneView.finishEditingNodeProperties"
        >ОК</button>
      <button class="ui small button">Очистить</button>
      <button class="ui small button"
        data-bind="click: $root.queryPaneView.finishEditingNodeProperties"
        >Отмена</button>
    </div>
  </div>

`;

// eslint-disable-next-line no-unused-vars
var viewModelFactory = (params, componentInfo) => {
  return {};
};

export default {
  viewModel: { createViewModel: viewModelFactory },
  template: template
};
