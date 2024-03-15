import { CMP, getCmpById, type TProps } from '../Lighter/CMP';
import { Button } from './basicComponents/Button';
import { InputDropdown } from './basicComponents/InputDropdown';
import { InputNumber, TInputNumber } from './basicComponents/InputNumber';
import { InputText } from './basicComponents/InputText';
import { Nav } from './Nav';

export const Base = (props?: TProps) => {
  const baseCmp = CMP(props, Base, props);

  baseCmp.add(
    Button({
      text: 'Refresh',
      onClick: () => baseCmp.update(),
    })
  );

  baseCmp.add(
    Button({
      id: 'clickidi-button',
      onClick: (_, cmp) => {
        cmp.update({ text: 'clicked', tag: 'button', onClickOutside: undefined }, (cmp) =>
          console.log('UPDATED', cmp)
        );
        nav.update();
      },
      // onClickOutside: (cmp) => console.log('UUTSIDAN', cmp),
      onFocus: () => console.log('FOCUS'),
      onBlur: () => console.log('BLUR'),
      text: 'jotain',
      idAttr: true,
    })
  );

  const nav = baseCmp.add(Nav());

  baseCmp.add({
    id: 'text-input',
    html: '<input type="text" />',
    onChange: () => console.log('CHANGE'),
    onInput: (e) => {
      const target = e.currentTarget as HTMLInputElement;
      showInputCmp.update({ text: target.value });
    },
  });
  const showInputCmp = baseCmp.add();

  baseCmp.add(
    InputText({
      id: 'input-text',
      idAttr: true,
      labelTag: '',
      label: {
        html: () =>
          `<span>My input label and ${CMP({
            text: 'CMP',
            id: 'TUUT',
            idAttr: true,
          })}</span>`,
      },
      placeholder: 'Put something here',
      value: 'error',
      // onChange: (cmp, e) => {
      //   const target = e.target as HTMLInputElement;
      //   if (target?.value !== 'reset') {
      //     const newCmp = cmp.update({ value: target?.value });
      //     console.log('onChange2', newCmp.props?.wrapperProps?.value);
      //   }
      // },
      // onInput: (_, e) => {
      //   const target = e.target as HTMLInputElement;
      //   console.log('onInput', target?.value);
      //   if (target?.value === 'reset') {
      //     baseCmp.update();
      //   }
      // },
      validationFn: (value) => {
        if (value === 'error') return 'Hei hei hei!';
        if (value === 'button') {
          return {
            id: 'testTemplate',
            html: () => `${Button({ text: 'Here is a button' })}`,
          };
        }
        if (!value) return { html: '<button>Required</button>' };
        if (value.length > 12) return 'Quite long';
        return null;
      },
      // blurOnEnter: true,
      blurOnEsc: true,
      focusToNextOnEnter: 'input-number',
      focusToPrevOnShiftEnter: 'text-input',
      maxLength: 16,
      selectTextOnFocus: 'start',
      multiline: true,
      charCountMax: 10,
    })
  );

  const inputNumberCmp = InputNumber({
    id: 'input-number',
    value: '',
    minValue: 0,
    maxValue: 8000000,
    unit: '€',
    label: 'Number input',
    placeholder: 'Number',
    showReadOnlyValue: true,
    hideInputArrows: true,
    // toLocale: false,
    canBeEmpty: true,
    blurOnEsc: true,
    focusToNextOnEnter: 'text-input',
    focusToPrevOnShiftEnter: 'input-text',
    step: 0.001,
    stepShift: 0.01,
    input: { style: { width: '120px' } },
    // roundToStep: true,
    // decimalCorrectionFactor: 4,
    roundToFactor: -3,
    // roundingFunction: 'ceil',
    // precision: 0,
    // toLocale: false,
    selectTextOnFocus: 'end',
    validationFn: (value) => {
      if (value === 1.1) return 'Not allowed';
      return null;
    },
  });
  baseCmp.add(inputNumberCmp);

  baseCmp.add(
    Button({
      text: 'Reset number',
      onClick: () => {
        inputNumberCmp.update<TInputNumber>({ value: 0 });
        // console.log(inputNumberCmp.getWrapperProps());
        inputNumberCmp.updateStyle({ background: 'red' });
        inputNumberCmp.updateAttr({ disabled: true });
        inputNumberCmp.updateClass('tadaa');
      },
    })
  );

  baseCmp.add(
    InputDropdown({
      label: 'Dropdown',
      value: '2',
      options: [
        { value: '', label: 'Select', class: 'inputEmptySelection' },
        { value: '1', label: 'Selection 1' },
        { value: '2', label: 'Selection 2' },
        { value: '3', label: 'Selection 3', class: 'SOMECLASS' },
        {
          label: 'Group',
          options: [
            { value: '3.5', label: 'Selection 3.5' },
            { value: '3.7', label: 'Selection 3.7' },
          ],
        },
        { value: '4', label: 'Selection 4', disabled: true },
        { value: '5', label: 'Selection 5' },
      ],
      onChange: (e) => {
        const value = (e.currentTarget as HTMLSelectElement).value;
        console.log('Dropdown selection', value);
      },
      validationFn: (value) => {
        if (value === '') return 'Required';
        return null;
      },
      // icon: { text: 'A', style: { background: 'blue' } },
    })
  );

  for (let i = 0; i < 10; i++) {
    baseCmp.add({
      text: Math.random().toString() /* onClick: (cmp) => console.log(cmp.props?.text) */,
    });
  }

  baseCmp.add({
    style: { background: 'grey', minHeight: '100vh' },
    onClick: () => {
      const scrollTestCmp = getCmpById('scroll-test');
      scrollTestCmp?.scrollIntoView({ behavior: 'smooth' });
    },
  });

  baseCmp.add({
    id: 'scroll-test',
    text: 'HERE IS THE SCROLL TO COMPONENT',
    // onCreateCmp: (cmp) => cmp.scrollIntoView({ behavior: 'smooth' }, 1000),
  });

  baseCmp.add({
    style: { background: 'grey', minHeight: '1800px' },
    onClick: () => {
      const scrollTestCmp = getCmpById('scroll-test');
      scrollTestCmp?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    },
  });

  return baseCmp;
};
