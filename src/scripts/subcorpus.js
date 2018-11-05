import ko from 'knockout';

export var records = [
  { id: 'pears04',
    label: 'Pears 04' },
  { id: 'pears22',
    label: 'Pears 22' },
  { id: 'pears23',
    label: 'Pears 23' },
  { id: 'pears35',
    label: 'Pears 35' },
  { id: 'pears37',
    label: 'Pears 37',
    disabled: true },
  { id: 'pears39',
    label: 'Pears 39',
    disabled: true }
];

export var recordPhases = [
  { id: 'narration',
    label: 'Рассказ' },
  { id: 'dialogue',
    label: 'Разговор' },
  { id: 'retelling',
    label: 'Пересказ' }
];

class CheckboxField{
  constructor(field) {
    this.value = ko.observable(false);
    this.id = field.id;
    this.label = field.label;
    this.disabled = field.disabled;
  }
}

export class CheckboxForm{
  constructor(fields) {
    let self = this;
    this.fields = [];

    for (let field of fields) {
      this.fields.push(new CheckboxField(field));
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
}
