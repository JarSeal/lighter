import {
  CMP,
  createNewId,
  type TListenerCreator,
  type TListener,
  type TProps,
  type TCMP,
  getCmpById,
} from '../../Lighter/CMP';

export type TInputNumber = {
  // Id attribute to be used for the "for" attribute
  // in label and for the input element ID (will show)
  id?: string;

  // Whether to add the for="id" attribute and the
  // input's id attribute to the elements
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

  // Input value
  value?: number;

  // Whether the input element has a disabled
  // attribute or not.
  disabled?: boolean;

  // The input fields change listener
  onChange?: TListener;

  // The input fields input listener
  onInput?: TListener;

  // Input field's listeners
  listeners?: TListenerCreator[];

  // Whether the input should have focus
  focus?: boolean;

  // Maximum length forced by the component
  // maxLength?: number;

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
  validationFn?: (value: number | undefined, cmp: TCMP) => string | TProps | null;
};

type TInputAttr = {
  value?: number;
  disabled?: string;
};

export const InputNumber = (props?: TInputNumber) => {
  const inputId = `input_${createNewId()}`;

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

  // Input attributes
  const inputAttr: TInputAttr = {};
  inputAttr.value = props?.value || 0;
  if (props?.disabled) inputAttr.disabled = 'true';

  // Validation
  const validate = (value?: number) => {
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
        ...(props?.onChange || props?.validationFn
          ? {
              onChange: (_, e) => {
                if (props.validationFn) {
                  const value = Number((e.target as HTMLInputElement).value);
                  validate(value);
                }
                props.onChange && props.onChange(inputNumberCmp, e);
              },
            }
          : {}),
        onInput: (_, e) => {
          const value = Number((e.target as HTMLInputElement).value);
          if (props?.validationFn) {
            validate(value);
          }
          props?.onInput && props.onInput(inputNumberCmp, e);
          if (inputNumberCmp.props?.wrapperProps) {
            inputNumberCmp.props.wrapperProps.value = value;
          }
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
