import {
  CMP,
  createNewId,
  type TListenerCreator,
  type TListener,
  type TProps,
  type TCMP,
  getCmpById,
} from '../../Lighter/CMP';

export type DropdownBasicOption = {
  label: string;
  value: string;
  class?: string | string[];
  disabled?: boolean;
};

export type DropdownOption =
  | {
      label: string;
      options: DropdownBasicOption[];
      class?: string | string[];
      disabled?: boolean;
    }
  | DropdownBasicOption;

export type TInputDropdown = {
  /* Id to be used for the "for" attribute
  in label and for the input element ID. Default is
  input_[id] that will be created for the input CMP. */
  id?: string;

  /* Whether to add the for="id" attribute and the
  input's id attribute to the elements. Default is false. */
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

  /* Input value string. Default is undefined. */
  value?: string;

  // @TODO
  /* Options for the dropdown. Must have the
  label shown in the UI and the value of the
  selected option. Can also have class and style
  props. Default is undefined (no options). */
  options?: DropdownOption[];

  /* Whether the input element has a disabled
  attribute or not. Default is false. */
  disabled?: boolean;

  /* The input fields change listener. Default is undefined. */
  onChange?: TListener;

  /* The input field focus listener. Default is undefined. */
  onFocus?: TListener;

  /* The input field blur listener. Default is undefined. */
  onBlur?: TListener;

  /* Input field's listeners. Default is undefined. */
  listeners?: TListenerCreator[];

  /* Whether the input should have focus on create or
  update. Default is false. */
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

  /* Runs the validationFn for every change event
  and on the component initialization. Returns either
  a message string, CMP props, or null. If not null,
  an error class is added to the main (label) component
  and creates the error CMP with the message
  (with an empty string, only the class is added).
  Default is undefined. */
  validationFn?: (value: string | undefined, cmp: TCMP) => string | TProps | null;

  /* A custom icon (CMP) to show on top of the
  dropdown "down arrow" icon. Default is undefined. */
  icon?: TProps;
};

type TInputAttr = {
  type?: 'text' | 'password';
  value?: string;
  disabled?: string;
  maxlength?: number;
};

export const InputDropdown = (props?: TInputDropdown) => {
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
  if (props?.disabled) inputAttr.disabled = 'true';

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
      fn: (e, cmp) => {
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
        if (existingKeyup?.fn) existingKeyup.fn(e, cmp);
      },
    });
  }

  const SELECTED_CLASS = 'optionSelected';
  const getClassAttrString = (opt: DropdownOption) => {
    if ('value' in opt && !opt.class === undefined) return '';
    const classValues =
      opt.class === undefined ? [] : typeof opt.class === 'string' ? [opt.class] : opt.class;
    if ('value' in opt && opt.value === props?.value) {
      classValues.push(SELECTED_CLASS);
    }
    return `class="${classValues.join(' ')}"`;
  };

  const getAttrString = (opt: DropdownOption) => {
    let attributes = '';
    if ('value' in opt && opt.value === props?.value) attributes += ' selected="true"';
    if (opt.disabled) attributes += ' disabled="true"';
    return attributes;
  };

  const getSelectHtml = () =>
    `<select>${
      props?.options
        ? props.options.map((opt) => {
            if ('value' in opt) {
              return `<option value="${opt.value}"${getClassAttrString(opt)}${getAttrString(opt)}>${
                opt.label
              }</option>`;
            } else if ('options' in opt) {
              return `<optgroup label="${opt.label}"${getClassAttrString(opt)}${getAttrString(
                opt
              )}>${opt.options.map(
                (groupOpt) =>
                  `<option value="${groupOpt.value}"${getClassAttrString(groupOpt)}${getAttrString(
                    groupOpt
                  )}>${groupOpt.label}</option>`
              )}</optgroup>`;
            }
          })
        : ''
    }</select>`;

  const iconCmp = props?.icon
    ? CMP({
        ...props.icon,
        style: {
          ...props.icon.style,
          position: 'absolute',
          top: '1px',
          right: '1px',
          height: 'calc(100% - 2px)',
          pointerEvents: 'none',
          padding: '0 2px',
        },
      })
    : '';

  const selectCmp = CMP({
    ...props?.input,
    id: inputId,
    idAttr: props?.idAttr,
    attr: inputAttr,
    html: getSelectHtml(),
    class: 'inputDropdownElem',
    focus: props?.focus,
    onChange: (e) => {
      const value = (e.target as HTMLInputElement).value;
      if (props) props.value = value;
      const options = selectCmp.elem.children;
      for (let i = 0; i < options.length; i++) {
        const option = options[i] as HTMLOptionElement;
        option.classList.remove(SELECTED_CLASS);
        option.removeAttribute('selected');
        if (value === option.value) {
          option.classList.add(SELECTED_CLASS);
          option.setAttribute('selected', 'true');
        }
        const optionChildren = option.children;
        for (let j = 0; j < optionChildren.length; j++) {
          const subOption = optionChildren[j] as HTMLOptionElement;
          subOption.classList.remove(SELECTED_CLASS);
          subOption.removeAttribute('selected');
          if (value === subOption.value) {
            subOption.classList.add(SELECTED_CLASS);
            subOption.setAttribute('selected', 'true');
          }
        }
      }
      if (props?.validationFn) validate(value);
      props?.onChange && props.onChange(e, inputTextCmp);
    },
    onFocus: (e) => {
      inputTextCmp.updateClass('inputHasFocus', 'add');
      props?.onFocus && props.onFocus(e, inputTextCmp);
    },
    onBlur: (e) => {
      inputTextCmp.updateClass('inputHasFocus', 'remove');
      props?.onBlur && props.onBlur(e, inputTextCmp);
    },
    ...(listeners.length ? { listeners } : {}),
  });

  const getHtml = () =>
    `<label class="inputField inputDropdown"${props?.idAttr ? ` for="${inputId}"` : ''}>
      ${labelHtml}
      <div class="inputValueOuter"${
        props?.icon ? ' style="position: relative; display: inline-block;"' : ''
      }>
        ${selectCmp}
        ${iconCmp}
      </div>
    </label>`;

  const inputTextCmp = CMP(
    {
      id: props?.id || `input-text-cmp_${createNewId()}`,
      idAttr: props?.idAttr,
      html: getHtml,
    },
    InputDropdown,
    props
  );

  const errorCmp = inputTextCmp.add(CMP({ class: 'inputErrorMsg' }));

  validate(props?.value);

  return inputTextCmp;
};
