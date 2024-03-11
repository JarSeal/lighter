import {
  CMP,
  createNewId,
  type TListenerCreator,
  type TListener,
  type TProps,
  type TCMP,
  getCmpById,
} from '../../Lighter/CMP';

export type TInputText = {
  // Id attribute to be used for the "for" attribute
  // in label and for the input element ID (will show in DOM).
  id?: string;

  // Whether to add the for="id" attribute and the
  // input's id attribute to the elements.
  idAttr?: boolean;

  // Whether the type of the input attribute is
  // "password" or "text".
  isPassword?: boolean;

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
  value?: string;

  // Whether the input element has a disabled
  // attribute or not.
  disabled?: boolean;

  // The input fields change listener.
  onChange?: TListener;

  // The input fields input listener.
  onInput?: TListener;

  // Input field's listeners.
  listeners?: TListenerCreator[];

  // Whether the input should have focus.
  focus?: boolean;

  // Maximum length forced by the component.
  maxLength?: number;

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
  validationFn?: (value: string | undefined, cmp: TCMP) => string | TProps | null;

  // @TODO
  // Regex pattern for the input field.
  pattern?: string;

  // Placeholder text for empty input field.
  placeholder?: string;
};

type TInputAttr = {
  type?: 'text' | 'password';
  value?: string;
  disabled?: string;
  maxlength?: number;
  placeholder?: string;
};

export const InputText = (props?: TInputText) => {
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
  if (props?.isPassword) {
    inputAttr.type = 'password';
  } else {
    inputAttr.type = 'text';
  }
  inputAttr.value = props?.value || '';
  if (props?.disabled) inputAttr.disabled = 'true';
  if (props?.maxLength) inputAttr.maxlength = props.maxLength;
  if (props?.placeholder) inputAttr.placeholder = props.placeholder;

  // Validation
  const validate = (value?: string) => {
    if (props?.validationFn) {
      const validationResult = props.validationFn(value, inputTextCmp);
      errorCmp.removeChildren();
      if (validationResult) {
        inputTextCmp.updateClass('hasError');
        errorCmp.add(
          CMP(
            typeof validationResult === 'string'
              ? { tag: 'span', text: validationResult }
              : validationResult
          )
        );
      } else if (validationResult === '') {
        inputTextCmp.updateClass('hasError');
      } else {
        inputTextCmp.updateClass('hasError', 'remove');
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
                  const value = (e.target as HTMLInputElement).value;
                  validate(value);
                }
                props.onChange && props.onChange(inputTextCmp, e);
              },
            }
          : {}),
        onInput: (_, e) => {
          const value = (e.target as HTMLInputElement).value;
          if (props?.validationFn) {
            validate(value);
          }
          props?.onInput && props.onInput(inputTextCmp, e);
          if (inputTextCmp.props?.wrapperProps) {
            inputTextCmp.props.wrapperProps.value = value;
          }
        },
        ...(listeners.length ? { listeners } : {}),
      })}
    </label>`;

  const inputTextCmp = CMP({
    id: props?.id || `input-text-cmp_${createNewId()}`,
    idAttr: props?.idAttr,
    html: getHtml,
    wrapper: (props?: TInputText) => InputText(props),
    wrapperProps: props,
  });

  const errorCmp = inputTextCmp.add(CMP({ class: 'errorMsg' }));

  validate(props?.value);

  return inputTextCmp;
};
