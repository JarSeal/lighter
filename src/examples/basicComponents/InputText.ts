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
  /* Id to be used for the "for" attribute
  in label and for the input element ID. Default is
  input_[id] that will be created for the input CMP. */
  id?: string;

  /* Whether to add the for="id" attribute and the
  input's id attribute to the elements. Default is false. */
  idAttr?: boolean;

  /* Whether the type of the input attribute is
  "password" or "text". Default is 'text'. */
  isPassword?: boolean;

  /* Label can either be a string (just text) or
  sub component props (any component props). 
  Default is undefined. */
  label?: string | TProps;

  /* Whether the label has a wrapping element
  or not (defined by an empty string: '').
  Default is 'span'. */
  labelTag?: string;

  /* Input/textarea sub component props (usually not needed).
  Default is undefined. */
  input?: TProps;

  /* Input value string. Default is undefined. */
  value?: string;

  /* Placeholder text for empty input field. Default
  is undefined. */
  placeholder?: string;

  /* Whether the input element has a disabled
  attribute or not. Default is false. */
  disabled?: boolean;

  /* The input fields change listener. Default is undefined. */
  onChange?: TListener;

  /* The input fields input listener. Default is undefined. */
  onInput?: TListener;

  /* The input field focus listener. Default is undefined. */
  onFocus?: TListener;

  /* The input field blur listener. Default is undefined. */
  onBlur?: TListener;

  /* Input field's listeners. Default is undefined. */
  listeners?: TListenerCreator[];

  /* Whether the input should have focus on create or
  update. Default is false. */
  focus?: boolean;

  /* Maximum length forced by the component. Default
  is undefined. */
  maxLength?: number;

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
  validationFn?: (value: string | undefined, cmp: TCMP) => string | TProps | null;

  /* Whether to select all input content on focus or not.
  Can also be set to 'end' which means that the caret
  will be placed at the end of the value. Default is
  undefined. */
  selectTextOnFocus?: boolean | 'start' | 'end';

  /* Whether the input field is multiline or not. For
  single line an input tag type of 'text' or 'password'
  is used and for multiline a textarea tag is used.
  Default is false. */
  multiline?: boolean;

  // @TODO
  /* Defines the character counter's maximum character
  count. When set, will show the actual character
  count in relation to the max value (24/130).
  Default is undefined (no character counter). */
  charCountMax?: number;

  // @TODO
  /* Regex pattern for the input field. For example,
  the regex could force only numbers to this field.
  Default is undefined. */
  regex?: string;
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

  // Input attributes
  const inputAttr: TInputAttr = {};
  if (!props?.multiline) {
    if (props?.isPassword) {
      inputAttr.type = 'password';
    } else {
      inputAttr.type = 'text';
    }
    inputAttr.value = props?.value || '';
  }
  if (props?.disabled) inputAttr.disabled = 'true';
  if (props?.maxLength) inputAttr.maxlength = props.maxLength;
  if (props?.placeholder) inputAttr.placeholder = props.placeholder;

  // Validation
  const validate = (value?: string) => {
    const ERROR_CLASS = 'inputHasError';
    if (props?.validationFn) {
      const validationResult = props.validationFn(value, inputTextCmp);
      errorCmp.removeChildren();
      if (validationResult) {
        inputTextCmp.updateClass(ERROR_CLASS, 'add');
        errorCmp.add(
          CMP(
            typeof validationResult === 'string'
              ? { tag: 'span', text: validationResult }
              : validationResult
          )
        );
      } else if (validationResult === '') {
        inputTextCmp.updateClass(ERROR_CLASS, 'add');
      } else {
        inputTextCmp.updateClass(ERROR_CLASS, 'remove');
      }
    }
  };

  // Enter and Esc key presses
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
        if (!props?.multiline && event.code === 'Enter') {
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
    `<label class="inputField inputText${
      props?.multiline ? ' inputTextMulti' : ' inputTextSingle'
    }"${props?.idAttr ? ` for="${inputId}"` : ''}>
      ${labelHtml}
      <div class="inputValueOuter">
        ${CMP({
          ...props?.input,
          tag: props?.multiline ? 'textarea' : 'input',
          ...(props?.multiline ? { text: props?.value || '' } : {}),
          id: inputId,
          idAttr: props?.idAttr,
          attr: inputAttr,
          class: 'inputTextElem',
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
          onFocus: (_, e) => {
            inputTextCmp.updateClass('inputHasFocus', 'add');
            if (props?.selectTextOnFocus === true) {
              (e.currentTarget as HTMLInputElement).setSelectionRange(
                0,
                (e.currentTarget as HTMLInputElement).value.length
              );
            } else if (props?.selectTextOnFocus === 'start') {
              (e.currentTarget as HTMLInputElement).setSelectionRange(0, 0);
            } else if (props?.selectTextOnFocus === 'end') {
              const valueLength = (e.currentTarget as HTMLInputElement).value.length;
              (e.currentTarget as HTMLInputElement).setSelectionRange(valueLength, valueLength);
            }
            props?.onFocus && props.onFocus(inputTextCmp, e);
          },
          onBlur: (_, e) => {
            inputTextCmp.updateClass('inputHasFocus', 'remove');
            props?.onBlur && props.onBlur(inputTextCmp, e);
          },
          ...(listeners.length ? { listeners } : {}),
        })}
      </div>
    </label>`;

  const inputTextCmp = CMP({
    id: props?.id || `input-text-cmp_${createNewId()}`,
    idAttr: props?.idAttr,
    html: getHtml,
    wrapper: (props?: TInputText) => InputText(props),
    wrapperProps: props,
  });

  const errorCmp = inputTextCmp.add(CMP({ class: 'inputErrorMsg' }));

  validate(props?.value);

  return inputTextCmp;
};
