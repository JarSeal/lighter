import {
  CMP,
  type TProps,
  createNewId,
  TCMP,
  TListener,
  TListenerCreator,
} from '../../Lighter/CMP';

export type TInputCheckbox = {
  /** Id to be used for the "for" attribute
   * in label and for the input element ID. Default is
   * input_[id] that will be created for the input CMP. */
  id?: string;

  /** Whether to add the for="id" attribute and the
   * input's id attribute to the elements. Default is false. */
  idAttr?: boolean;

  /** Whether the checkbox is checked or not. Default is false. */
  checked?: boolean;

  /** Label can either be a string (just text) or
   * sub component props. Default is undefined. */
  label?: string | TProps;

  /** Whether the label has a wrapping element
   * or not (defined by an empty string: '').
   * Default is 'span'. */
  labelTag?: string;

  /** Whether the input element has a disabled
   * attribute or not. Default is false. */
  disabled?: boolean;

  /** Input Text classes */
  class?: string | string[];

  /** Whether the input elem should be rendered after
   * the label text. Default is false (will be
   * rendered before the text).
   */
  renderInputAfterLabel?: boolean;

  /** Runs the validationFn for every change event
   * and on the component initialization. Returns either
   * a message string, CMP props, or null. If not null,
   * an error class is added to the main (label) component
   * and creates the error CMP with the message
   * (with an empty string, only the class is added).
   * Default is undefined. */
  validationFn?: (value: boolean | undefined, cmp: TCMP) => string | TProps | null;

  /** The input fields change listener. Default is undefined. */
  onChange?: TListener;

  /** The input field focus listener. Default is undefined. */
  onFocus?: TListener;

  /** The input field blur listener. Default is undefined. */
  onBlur?: TListener;

  /** Input field's listeners. Default is undefined. */
  listeners?: TListenerCreator[];
};

export const InputCheckbox = (props?: TInputCheckbox) => {
  const baseId = props?.id || createNewId();
  const inputId = `input_${baseId}`;
  const listeners = props?.listeners || [];

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

  const inputElem = CMP({
    id: inputId,
    idAttr: props?.idAttr,
    html: () => `<input type="checkbox"${props?.checked ? ' checked="true"' : ''} />`,
  });

  const getHtml = () => `<div class="inputField inputCheckbox">
  <label${props?.idAttr ? ` for="${inputId}"` : ''}>
    ${(!props?.renderInputAfterLabel && inputElem) || ''}
    ${labelHtml}
    ${(props?.renderInputAfterLabel && inputElem) || ''}
  </label>
</div>`;

  const inputChecboxCmp = CMP(
    {
      id: props?.id ? baseId : `input-checkbox-cmp_${baseId}`,
      idAttr: props?.idAttr,
      html: getHtml,
      class: props?.class,
      onChange: (e) => {
        const checked = (e.target as HTMLInputElement).checked;
        if (props) props.checked = checked;
        if (props?.validationFn) validate(checked);
        props?.onChange && props.onChange(e, inputChecboxCmp);
      },
      onFocus: (e) => {
        inputChecboxCmp.updateClass('inputHasFocus', 'add');
        props?.onFocus && props.onFocus(e, inputChecboxCmp);
      },
      onBlur: (e) => {
        inputChecboxCmp.updateClass('inputHasFocus', 'remove');
        props?.onBlur && props.onBlur(e, inputChecboxCmp);
      },
      ...(listeners.length ? { listeners } : {}),
    },
    InputCheckbox,
    props
  );

  // Validation
  const validate = (checked?: boolean) => {
    const ERROR_CLASS = 'inputHasError';
    if (props?.validationFn) {
      const validationResult = props.validationFn(checked, inputChecboxCmp);
      errorCmp.removeChildren();
      if (validationResult) {
        inputChecboxCmp.updateClass(ERROR_CLASS, 'add');
        errorCmp.add(
          CMP(
            typeof validationResult === 'string'
              ? { tag: 'span', text: validationResult }
              : validationResult
          )
        );
      } else if (validationResult === '') {
        inputChecboxCmp.updateClass(ERROR_CLASS, 'add');
      } else {
        inputChecboxCmp.updateClass(ERROR_CLASS, 'remove');
      }
    }
  };

  const errorCmp = inputChecboxCmp.add(CMP({ class: 'inputErrorMsg' }));

  validate(props?.checked);

  return inputChecboxCmp;
};
