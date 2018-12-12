import ko from 'knockout';

export var records = [
  { id: 'pears04', label: 'Pears 04', query: '04' },
  { id: 'pears22', label: 'Pears 22', query: '22' },
  { id: 'pears23', label: 'Pears 23', query: '23' },
  { id: 'pears35', label: 'Pears 35', query: '35', disabled: true },
  { id: 'pears37', label: 'Pears 37', query: '37', disabled: true },
  { id: 'pears39', label: 'Pears 39', query: '39', disabled: true }
];

export var recordPhases = [
  { id: 'narration', label: 'Рассказ', query: 'telling' },
  { id: 'dialogue', label: 'Разговор', query: 'talk' },
  { id: 'retelling', label: 'Пересказ', query: 'retelling' }
];

class CheckboxField{
  constructor(field, isSubcorpusNew) {
    this.value = ko.observable(false);
    this.id = field.id;
    this.label = field.label;
    this.disabled = Boolean(field.disabled);
    this.query = field.query;

    this.value.subscribe(() => {
      isSubcorpusNew(true);
    });
  }
}

export class CheckboxForm{
  constructor(fields, isSubcorpusNew) {
    let self = this;
    this.fields = [];

    for (let field of fields) {
      this.fields.push(new CheckboxField(field, isSubcorpusNew));
    }

    this.invertSelection = () => {
      for (let field of self.fields) {
        if (!field.disabled) field.value(!field.value());
      }
    };
    this.clearSelection = () => {
      for (let field of self.fields) {
        if (!field.disabled) field.value(false);
      }
    };
  }
  get areAllChecked() {
    return this.fields.every(field => field.disabled || field.value());
  }
  get areAllUnchecked() {
    return this.fields.every(field => field.disabled || !field.value());
  }
  getAllButDisabledQueryValues() {
    let queryValues = [];
    for (let field of this.fields) {
      if (!field.disabled) {
        queryValues.push(field.query);
      }
    }
    return queryValues;
  }
  getAllCheckedQueryValues() {
    let queryValues = [];
    for (let field of this.fields) {
      if (!field.disabled && field.value()) {
        queryValues.push(field.query);
      }
    }
    return queryValues;
  }
  getQueryValuesForJSON() {
    if (this.areAllUnchecked) return this.getAllButDisabledQueryValues();
    return this.getAllCheckedQueryValues();
  }
}
