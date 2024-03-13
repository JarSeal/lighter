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

export let defaultDecimalCorrectionFactor: number | false = 14;
export const setDefaultDecimalCorrectionFactor = (factor: number | false) =>
  (defaultDecimalCorrectionFactor = factor);

export let defaultNumberLocale: NumberLocaleConfig | false = {
  thousandSeparator: ' ',
  decimalSeparator: ',',
};
export const setDefaultNumberLocale = (config: NumberLocaleConfig | false) =>
  (defaultNumberLocale = config);

export const setNumberToLocaleString = (
  value: string | number,
  numberLocale?: NumberLocaleConfig | false,
  placeholder?: string
) => {
  const valueString = String(value).trim();
  const locale = numberLocale !== undefined ? numberLocale : defaultNumberLocale;
  if (locale === false) return valueString;
  let parts;
  const hasPeriod = Boolean(valueString.includes('.'));
  if (hasPeriod) {
    parts = valueString.split('.');
  } else {
    parts = valueString.split(',');
  }
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, locale.thousandSeparator);
  const returnString = parts.join(locale.decimalSeparator);
  if (returnString === '') return placeholder || '';
  return returnString;
};

export const applyDecimalCorrection = (value: number, decimalCorrectionFactor?: number | false) => {
  const factor =
    decimalCorrectionFactor !== undefined
      ? decimalCorrectionFactor
      : defaultDecimalCorrectionFactor;
  if (factor === false) return value;
  return Number(value.toFixed(factor));
};

export const roundToFactor = (
  value: number,
  roundToFactor: number,
  roundingFunction?: 'round' | 'floor' | 'ceil'
) => {
  if (!roundingFunction) roundingFunction = 'round';
  if (roundToFactor < 0) {
    const pow = Math.pow(10, Math.abs(roundToFactor));
    value = 0.01 / pow + value;
    return Math[roundingFunction](value * pow) / pow;
  }
  const pow = Math.pow(10, roundToFactor);
  return Math[roundingFunction](value / pow) * pow;
};

export type TInputNumber = {
  /* Id to be used for the "for" attribute
  in label and for the input element ID. Default is
  input_[id] that will be created for the input CMP. */
  id?: string;

  /* Whether to add the for="id" attribute and the
  input's id attribute to the elements. Default is
  undefined. */
  idAttr?: boolean;

  /* Label can either be a string (just text) or
  sub component props (any component props).
  Default is undefined. */
  label?: string | TProps;

  /* Whether the label has a wrapping element
  or not (defined by an empty string: '').
  Default is 'span'. */
  labelTag?: string;

  /* Input sub component props (usually not needed).
  Default is undefined. */
  input?: TProps;

  /* Input value. Default is undefined. */
  value?: number | null | string;

  /* Unit to show. Default is undefined; */
  unit?: string | TProps;

  /* Step value for using arrow keys and up/down buttons.
  Default is 1. */
  step?: number;

  /* Step value for using arrow keys and up/down buttons
  with the shift key. Default is undefined. */
  stepShift?: number;

  /* Round to step value. This means that the number
  returned will only be a step value number.
  Requires step to be defined. To work correctly, the minValue
  and the maxValue should be dividable by the step. Default is false. */
  roundToStep?: boolean;

  /* Rounds the value to the Math.pow(10, roundToFactor).
  So then a value of 5 with a roundToFactor of 1 would
  be 10 and 4 would be 0. Default is undefined (no rounding). */
  roundToFactor?: number;

  /* Determines what rounding function to use when
  roundToFactor or roundToStep is used. Default is 'round'. */
  roundingFunction?: 'round' | 'floor' | 'ceil';

  /* Precision decimals count (0-100). This is used 
  to show the full precision value (even if 2.0000)
  in the input and readOnly, but also rounds values
  like 3.33333-> to specific precision. Default
  is undefined. */
  precision?: number;

  /* If the float given has more than this number of decimals,
  then it will be rounded to this correction value. This
  is to prevent Javascript float problems like
  0.2 * 0.2 = 0.04000000000000001. This also means that it
  is the max decimals that a number can have. If set to false,
  then no correction or rounding is done. Default is
  the defaultDecimalCorrectionFactor and it can be set with
  the setDefaultDecimalCorrectionFactor util. */
  decimalCorrectionFactor?: number | false;

  /* Show read-only value? This value will be shown when
  the input field does not have focus and then is
  hidden when the input field has focus. This read-only
  value can then be formatted according to locale config.
  Default id false. */
  showReadOnlyValue?: boolean;

  /* Locale number representation, meaning that
  how does a number look with the thousand
  and decimal separators. Set to false to disable
  locale parsing. Requires showReadOnlyValue to be
  true to have effect. Default is
  the defaultNumberLocale and it can be set with
  the setDefaultNumberLocale util. */
  toLocale?: NumberLocaleConfig | false;

  /* Hide input number arrow buttons or not. Default is false. */
  hideInputArrows?: boolean;

  /* Minimun value for the input field. Must be
  greater than the possible maxValue. Default is
  undefined. */
  minValue?: number;

  /* Maximum value for the input field. Must be
  less than the possible minValue. Default is
  undefined */
  maxValue?: number;

  /* Whether the field can be empty or not.
  If false and the minValue is provided,
  then a null/undefined value will default
  to minValue, otherwise 0. If it can and it
  is empty, then a null value is returned.
  Default is true. */
  canBeEmpty?: boolean;

  /* Placeholder text for empty input field. Default is
  undefined. */
  placeholder?: string;

  /* Whether the input element has a disabled
  attribute or not. Default is false. */
  disabled?: boolean;

  /* The input field change listener. Default
  is undefined, but the field already uses an
  onChange listener. */
  onChange?: TListener;

  /* The input field input listener. Default
  is undefined, but the field already uses an
  onInput listener. */
  onInput?: TListener;

  /* The input field focus listener. Default
  is undefined. */
  onFocus?: TListener;

  /* The input field blur listener. Default
  is undefined, but the field already uses an
  onBlur listener */
  onBlur?: TListener;

  /* Input field's listeners. Default is undefined. */
  listeners?: TListenerCreator[];

  /* Whether the input should have focus on create
  or update. Default is false. */
  focus?: boolean;

  /* Whether to lose the focus of the input field
  on Enter/Esc key press. Default is false. */
  blurOnEnter?: boolean;
  blurOnEsc?: boolean;

  /* Whether to set focus to the next/prev input elem
  in DOM on Enter key press. It can be given
  the ID of the next/prev elem. Default is undefined. */
  focusToNextOnEnter?: string;
  focusToPrevOnShiftEnter?: string;

  /* Runs the validationFn for every input and change event
  and on the component initialization. Returns either
  a message string, CMP props, or null. If not null,
  an error class is added to the main (label) component
  and creates the error CMP with the message
  (with an empty string, only the class is added).
  Default is undefined. */
  validationFn?: (value: number | undefined | null | string, cmp: TCMP) => string | TProps | null;

  /* Whether to select all input content on focus or not.
  Can also be set to 'end' which means that the caret
  will be placed at the end of the value. Default is
  undefined. */
  selectTextOnFocus?: boolean | 'start' | 'end';
};

type TInputAttr = {
  type: 'number';
  value?: number | null | string;
  disabled?: string;
  step?: number;
  placeholder?: string;
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
  const LABEL_CLASS = 'inputLabel';
  let labelStartTag = `<span class="${LABEL_CLASS}">`;
  let labelEndTag = '</span>';
  if (props?.labelTag !== undefined) {
    if (props.labelTag === '') {
      labelStartTag = '';
      labelEndTag = '';
    } else {
      labelStartTag = `<${props.labelTag} class="${LABEL_CLASS}">`;
      labelEndTag = `</${props.labelTag}>`;
    }
  }
  const labelHtml = props?.label
    ? `${labelStartTag}${
        typeof props.label === 'string'
          ? props.label
          : CMP({
              tag: 'span',
              class: LABEL_CLASS,
              ...props.label,
            })
      }${labelEndTag}`
    : '';

  const setPrecisionAndRounding = (value: number) => {
    let val = value;
    if (props?.roundToFactor !== undefined) {
      val = roundToFactor(val, props.roundToFactor, props?.roundingFunction);
    } else if (props?.roundToStep && props?.step !== undefined) {
      const remainder = val % props.step;
      if (remainder !== 0) {
        const roundingFunction = props?.roundingFunction || 'round';
        const roundedMultiplier = Math[roundingFunction](remainder / props.step);
        val = val - remainder + roundedMultiplier * props.step;
        if (props?.minValue !== undefined && val < props.minValue) val = props.minValue;
        if (props?.maxValue !== undefined && val > props.maxValue) val = props.maxValue;
      }
    }
    val = applyDecimalCorrection(val, props?.decimalCorrectionFactor);
    if (props?.precision === undefined) return val;
    return val.toFixed(props.precision);
  };

  const setValue = (value?: null | number | string) => {
    let val = Number(value);
    // Default for canBeEmpty is true
    if (props?.canBeEmpty === false && ((!val && val !== 0) || isNaN(val))) {
      return setPrecisionAndRounding(props?.minValue || 0);
    }
    if (isNaN(val) || value === '') {
      return '';
    }
    if (props?.maxValue !== undefined && val > props.maxValue) {
      val = props.maxValue;
    } else if (props?.minValue !== undefined && val < props.minValue) {
      val = props.minValue;
    }
    return setPrecisionAndRounding(val);
  };

  // Input attributes
  const inputAttr: TInputAttr = { type: 'number' };
  if (!props) props = {};
  props.value = setValue(props?.value);
  inputAttr.value = props?.value;
  if (props?.disabled) inputAttr.disabled = 'true';
  if (props?.step !== undefined) inputAttr.step = props.step;
  if (props?.placeholder) inputAttr.placeholder = props.placeholder;

  // Validation
  const validate = (value?: number | null | string) => {
    const ERROR_CLASS = 'inputHasError';
    if (props?.validationFn) {
      const validationResult = props.validationFn(value, inputNumberCmp);
      errorCmp.removeChildren();
      if (validationResult) {
        inputNumberCmp.updateClass(ERROR_CLASS);
        errorCmp.add(
          CMP(
            typeof validationResult === 'string'
              ? { tag: 'span', text: validationResult }
              : validationResult
          )
        );
      } else if (validationResult === '') {
        inputNumberCmp.updateClass(ERROR_CLASS);
      } else {
        inputNumberCmp.updateClass(ERROR_CLASS, 'remove');
      }
    }
  };

  // Enter key press and disable shiftPressed
  let listeners = props?.listeners || [];
  let shiftPressed = false;
  if (
    props?.blurOnEnter ||
    props?.blurOnEsc ||
    props?.focusToNextOnEnter ||
    props?.focusToPrevOnShiftEnter ||
    props?.stepShift !== undefined
  ) {
    const existingKeyup = listeners.find((l) => l.type === 'keyup');
    listeners = listeners.filter((l) => l.type !== 'keyup');
    listeners.push({
      type: 'keyup',
      fn: (cmp, e) => {
        const event = e as KeyboardEvent;
        shiftPressed = event.shiftKey;
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

  // Shift step
  if (props?.stepShift !== undefined) {
    const existingKeydown = listeners.find((l) => l.type === 'keydown');
    listeners = listeners.filter((l) => l.type !== 'keydown');
    listeners.push({
      type: 'keydown',
      fn: (cmp, e) => {
        const event = e as KeyboardEvent;
        shiftPressed = event.shiftKey;
        if (existingKeydown?.fn) existingKeydown.fn(cmp, e);
      },
    });
  }

  const inputCmp = CMP({
    ...props?.input,
    tag: 'input',
    class: 'inputNumberElem',
    id: inputId,
    idAttr: props?.idAttr || props?.hideInputArrows,
    attr: inputAttr,
    ...(props?.showReadOnlyValue ? { style: { opacity: 0 } } : {}),
    focus: props?.focus,
    onInput: (_, e) => {
      let value = Number((e.currentTarget as HTMLInputElement).value);
      const oldValue = Number(inputNumberCmp.props?.wrapperProps?.value || 0);
      if (props?.step && props?.stepShift && shiftPressed) {
        const additionCheck = setValue(oldValue + props.step);
        const substractionCheck = setValue(oldValue - props.step);
        if (additionCheck === value) {
          value = Number(setValue(oldValue + props.stepShift));
          (e.target as HTMLInputElement).value = String(value);
          (e.currentTarget as HTMLInputElement).value = String(value);
        } else if (substractionCheck === value) {
          value = Number(setValue(oldValue - props.stepShift));
          (e.target as HTMLInputElement).value = String(value);
          (e.currentTarget as HTMLInputElement).value = String(value);
        }
      }
      readOnlyValueCmp &&
        readOnlyValueCmp.update({
          ...readOnlyValueCmp.props,
          text: setNumberToLocaleString(setValue(value), props?.toLocale, props?.placeholder),
        });
      if (props?.validationFn) validate(value);
      props?.onInput && props.onInput(inputNumberCmp, e);
      if (inputNumberCmp.props?.wrapperProps) {
        inputNumberCmp.props.wrapperProps.value = value;
      }
      inputCmp.updateAttr({ value });
      if (props?.step && props?.stepShift && shiftPressed) {
        (inputCmp.elem as HTMLInputElement).value = String(value);
      }
    },
    onChange: (_, e) => {
      const value = setValue((e.currentTarget as HTMLInputElement).value);
      readOnlyValueCmp &&
        readOnlyValueCmp.update({
          ...readOnlyValueCmp.props,
          text: setNumberToLocaleString(setValue(value), props?.toLocale, props?.placeholder),
        });
      if (props?.validationFn) validate(value);
      props?.onChange && props.onChange(inputNumberCmp, e);
      if (inputNumberCmp.props?.wrapperProps) {
        inputNumberCmp.props.wrapperProps.value = value;
      }
      inputCmp.updateAttr({ value });
      (inputCmp.elem as HTMLInputElement).value = String(value);
    },
    onBlur: (_, e) => {
      shiftPressed = false;
      inputNumberCmp.updateClass('inputHasFocus', 'remove');
      const value = setValue((e.currentTarget as HTMLInputElement).value);
      if (readOnlyValueCmp) {
        inputCmp.updateStyle({ opacity: 0 });
        readOnlyValueCmp
          .update({
            ...readOnlyValueCmp.props,
            text: setNumberToLocaleString(setValue(value), props?.toLocale, props?.placeholder),
          })
          .updateStyle({ display: 'block' })
          .updateClass(
            'inputNumberReadOnlyPlaceholder',
            setNumberToLocaleString(setValue(props?.value), props?.toLocale) === ''
              ? 'add'
              : 'remove'
          );
      }
      props?.onBlur && props.onBlur(inputNumberCmp, e);
      inputCmp.updateAttr({ value });
      (inputCmp.elem as HTMLInputElement).value = String(value);
    },
    onFocus: (_, e) => {
      inputNumberCmp.updateClass('inputHasFocus', 'add');
      if (props?.selectTextOnFocus === true) {
        const elem = e.currentTarget as HTMLInputElement;
        elem.type = 'text';
        elem.setSelectionRange(0, elem.value.length);
        elem.type = 'number';
      } else if (props?.selectTextOnFocus === 'start') {
        const elem = e.currentTarget as HTMLInputElement;
        elem.type = 'text';
        elem.setSelectionRange(0, 0);
        elem.type = 'number';
      } else if (props?.selectTextOnFocus === 'end') {
        const elem = e.currentTarget as HTMLInputElement;
        elem.type = 'text';
        elem.setSelectionRange(elem.value.length, elem.value.length);
        elem.type = 'number';
      }
      if (readOnlyValueCmp) {
        inputCmp.updateStyle({ opacity: 1 });
        readOnlyValueCmp.updateStyle({ display: 'none' });
      }
      props?.onFocus && props.onFocus(inputNumberCmp, e);
    },
    ...(listeners.length ? { listeners } : {}),
  });

  const readOnlyValueCmp = props?.showReadOnlyValue
    ? CMP({
        text: setNumberToLocaleString(setValue(props?.value), props?.toLocale, props?.placeholder),
        class: [
          'inputNumberReadOnly',
          ...(setNumberToLocaleString(setValue(props?.value), props?.toLocale) === ''
            ? ['inputNumberReadOnlyPlaceholder']
            : []),
        ],
        style: { position: 'absolute', top: 0, left: 0, width: '100%' },
        onClick: () => (inputCmp.elem as HTMLInputElement)?.focus(),
      })
    : '';

  const unitCmp = props?.unit
    ? CMP(
        typeof props.unit === 'string'
          ? { text: props.unit, class: 'inputUnit' }
          : { ...props.unit, class: 'inputUnit' }
      )
    : '';

  const getHtml = () =>
    `<label class="inputField inputNumber"${props?.idAttr ? ` for="${inputId}"` : ''}>
      ${labelHtml}
      <div class="inputValueOuter"${props?.unit ? ' style="display: flex;"' : ''}>
        <div class="inputValueInner"${
          props?.showReadOnlyValue ? ' style="position: relative;"' : ''
        }>
          ${inputCmp}
          ${readOnlyValueCmp}
        </div>
        ${unitCmp}
      </div>
    </label>`;

  const inputNumberCmp = CMP({
    id: props?.id || `input-number-cmp_${createNewId()}`,
    idAttr: props?.idAttr,
    html: getHtml,
    wrapper: (props?: TInputNumber) => InputNumber(props),
    wrapperProps: props,
  });

  const errorCmp = inputNumberCmp.add(CMP({ class: 'inputErrorMsg' }));

  if (props?.hideInputArrows) {
    inputNumberCmp.add(
      CMP({
        html: `<style type="text/css">
  input#${inputId}::-webkit-outer-spin-button,
  input#${inputId}::-webkit-inner-spin-button {
    display: none;
    -webkit-appearance: none;
  }
  input#${inputId} {
    -moz-appearance: textfield;
  }
</style>`,
      })
    );
  }

  validate(props?.value);

  return inputNumberCmp;
};
