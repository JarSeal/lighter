import {
  CMP,
  createNewId,
  type TListenerCreator,
  type TListener,
  type TProps,
  type TCMP,
  getCmpById,
} from '../../Lighter/CMP';

export type NumberLocaleConfig = {
  thousandSeparator: string;
  decimalSeparator: string;
};

export type TInputNumber = {
  // Id attribute to be used for the "for" attribute
  // in label and for the input element ID (will show in DOM).
  id?: string;

  // Whether to add the for="id" attribute and the
  // input's id attribute to the elements.
  idAttr?: boolean;

  // Label can either be a string (just text) or
  // sub component props (any component props).
  label?: string | TProps;

  // Whether the label has a wrapping element
  // or not (defined by an empty string: '').
  // Default is 'span'.
  labelTag?: string;

  // Input sub component props.
  input?: TProps;

  // Input value.
  value?: number | null | string;

  // Step value for using arrow keys and up/down buttons.
  step?: number;

  // @TODO
  // Step value for using arrow keys and up/down buttons
  // but when the shift is pressed.
  stepShift?: number;

  // @TODO
  // Maximum precision decimals accepted before
  // the value is rounded.
  maxPrecision?: number;

  // @TODO
  // Normalize precision to every value, so that
  // the values are always on the same precision.
  normalizePrecision?: boolean;

  // @TODO
  // Locale number representation, meaning that
  // how does a number look with the thousand
  // and decimal separators.
  numberLocaleConfig?: NumberLocaleConfig;

  // @TODO
  // Minimun value for the input field. Must be
  // greater than the possible maxValue.
  minValue?: number;

  // @TODO
  // Maximum value for the input field. Must be
  // less than the possible minValue.
  maxValue?: number;

  // Whether the field can be empty or not.
  // If false and the minValue is provided,
  // then a null/undefined value will default
  // to minValue, otherwise 0. If it can and it
  // is empty, then a null value is returned.
  canBeEmpty?: boolean;

  // Whether the input element has a disabled
  // attribute or not.
  disabled?: boolean;

  // The input field change listener.
  onChange?: TListener;

  // The input field input listener.
  onInput?: TListener;

  // @TODO
  // The input field focus listener.
  onFocus?: TListener;

  // Input field's listeners.
  listeners?: TListenerCreator[];

  // Whether the input should have focus.
  focus?: boolean;

  // Whether to lose the focus of the input field
  // on Enter/Esc key press. Default false.
  blurOnEnter?: boolean;
  blurOnEsc?: boolean;

  // Whether to set focus to the next/prev input elem
  // in DOM on Enter key press. It can be given
  // the ID of the next/prev elem. Default undefined.
  focusToNextOnEnter?: string;
  focusToPrevOnShiftEnter?: string;

  // Runs the validationFn for every input and change event
  // and on the component initialization. Returns either
  // a message string, CMP props, or null. If not null,
  // an error class is added to the main (label) component
  // and creates the error CMP with the message
  // (with an empty string, only the class is added).
  validationFn?: (value: number | undefined | null | string, cmp: TCMP) => string | TProps | null;

  // @TODO
  // Regex pattern for the input field.
  pattern?: string;

  // @TODO
  // Placeholder text for empty input field.
  placeholder?: string;
};

type TInputAttr = {
  type: 'number';
  value?: number | null | string;
  disabled?: string;
  step?: number;
};

export const numberLocaleConfig: NumberLocaleConfig = {
  thousandSeparator: ' ',
  decimalSeparator: '.',
};

export const InputNumber = (props?: TInputNumber) => {
  const inputId = `input_${createNewId()}`;

  if (
    props?.maxValue !== undefined &&
    props?.minValue !== undefined &&
    props?.maxValue < props?.minValue
  ) {
    throw new Error(
      `Max value (maxValue) cannot be greater than the min value (minValue). InputNumber CMP inputId: '${inputId}'.`
    );
  }

  // Label
  let labelStartTag = '<span>';
  let labelEndTag = '</span>';
  if (props?.labelTag !== undefined) {
    if (props.labelTag === '') {
      labelStartTag = '';
      labelEndTag = '';
    } else {
      labelStartTag = `<${props.labelTag}>`;
      labelEndTag = `</${props.labelTag}>`;
    }
  }
  const label = props?.label
    ? `${labelStartTag}${
        typeof props.label === 'string'
          ? props.label
          : CMP({
              tag: 'span',
              ...props.label,
            })
      }${labelEndTag}`
    : '';

  const setValue = (value?: null | number | string) => {
    let val = Number(value);
    // Default is canBeEmpty is true
    if (props?.canBeEmpty === false && (!val || isNaN(val))) {
      return props?.minValue || 0;
    }
    if (isNaN(val) || value === '') {
      return '';
    }
    if (props?.maxValue !== undefined && val > props.maxValue) {
      val = props.maxValue;
    } else if (props?.minValue !== undefined && val < props.minValue) {
      val = props.minValue;
    }
    return val;
  };

  // Input attributes
  const inputAttr: TInputAttr = { type: 'number' };
  inputAttr.value = setValue(props?.value);
  if (props?.disabled) inputAttr.disabled = 'true';
  if (props?.step !== undefined) inputAttr.step = props.step;

  // Validation
  const validate = (value?: number | null | string) => {
    if (props?.validationFn) {
      const validationResult = props.validationFn(value, inputNumberCmp);
      errorCmp.removeChildren();
      if (validationResult) {
        inputNumberCmp.updateClass('hasError');
        errorCmp.add(
          CMP(
            typeof validationResult === 'string'
              ? { tag: 'span', text: validationResult }
              : validationResult
          )
        );
      } else if (validationResult === '') {
        inputNumberCmp.updateClass('hasError');
      } else {
        inputNumberCmp.updateClass('hasError', 'remove');
      }
    }
  };

  // Enter key press
  let listeners = props?.listeners || [];
  if (
    props?.blurOnEnter ||
    props?.blurOnEsc ||
    props?.focusToNextOnEnter ||
    props?.focusToPrevOnShiftEnter
  ) {
    const existingKeyup = listeners.find((l) => l.type === 'keyup');
    listeners = listeners.filter((l) => l.type !== 'keyup');
    listeners.push({
      type: 'keyup',
      fn: (cmp, e) => {
        const event = e as KeyboardEvent;
        if (event.code === 'Enter') {
          if (props?.blurOnEnter) cmp.elem.blur();
          if (props?.focusToNextOnEnter && !event.shiftKey) {
            const nextCmp = getCmpById(props.focusToNextOnEnter);
            if (nextCmp) nextCmp.elem.focus();
          }
          if (props?.focusToPrevOnShiftEnter && event.shiftKey) {
            const prevCmp = getCmpById(props.focusToPrevOnShiftEnter);
            if (prevCmp) prevCmp.elem.focus();
          }
        }
        if (event.code === 'Escape') {
          if (props?.blurOnEsc) cmp.elem.blur();
        }
        if (existingKeyup?.fn) existingKeyup.fn(cmp, e);
      },
    });
  }

  const getHtml = () =>
    `<label${props?.idAttr ? ` for="${inputId}"` : ''}>
      ${label}
      ${CMP({
        ...props?.input,
        tag: 'input',
        id: inputId,
        idAttr: props?.idAttr,
        attr: inputAttr,
        focus: props?.focus,
        onChange: (_, e) => {
          const value = setValue((e.currentTarget as HTMLInputElement).value);
          console.log('Change', value, (e.currentTarget as HTMLInputElement).value);
          if (props?.validationFn) validate(value);
          props?.onChange && props.onChange(inputNumberCmp, e);
          if (inputNumberCmp.props?.wrapperProps) {
            inputNumberCmp.props.wrapperProps.value = value;
          }
          const inputCpm = getCmpById(inputId);
          if (inputCpm) {
            inputCpm.updateAttr({ value });
            (inputCpm.elem as HTMLInputElement).value = String(value);
          }
        },
        onBlur: (_, e) => {
          const value = setValue((e.currentTarget as HTMLInputElement).value);
          console.log('Blur', value, (e.currentTarget as HTMLInputElement)?.value);
          const inputCpm = getCmpById(inputId);
          if (inputCpm) {
            inputCpm.updateAttr({ value });
            (inputCpm.elem as HTMLInputElement).value = String(value);
          }
        },
        onInput: (_, e) => {
          const value = Number((e.currentTarget as HTMLInputElement).value);
          console.log('Input', value, (e.currentTarget as HTMLInputElement)?.value);
          if (props?.validationFn) validate(value);
          props?.onInput && props.onInput(inputNumberCmp, e);
          if (inputNumberCmp.props?.wrapperProps) {
            inputNumberCmp.props.wrapperProps.value = value;
          }
          const inputCpm = getCmpById(inputId);
          if (inputCpm) inputCpm.updateAttr({ value });
        },
        ...(listeners.length ? { listeners } : {}),
      })}
    </label>`;

  const inputNumberCmp = CMP({
    id: props?.id || `input-number-cmp_${createNewId()}`,
    idAttr: props?.idAttr,
    html: getHtml,
    wrapper: (props?: TInputNumber) => InputNumber(props),
    wrapperProps: props,
  });

  const errorCmp = inputNumberCmp.add(CMP({ class: 'errorMsg' }));

  validate(props?.value);

  return inputNumberCmp;
};
