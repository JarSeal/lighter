import { CMP, type TProps, createNewId } from '../../Lighter/CMP';

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
};

export const InputCheckbox = (props?: TInputCheckbox) => {
  const baseId = props?.id || createNewId();
  const inputId = `input_${baseId}`;

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
    html: () => `<input type="checkbox" />`,
  });

  const getHtml = () => `<div class="inputField inputCheckbox">
  <label${props?.idAttr ? ` for="${inputId}"` : ''}>
    ${props?.renderInputAfterLabel ? '' : inputElem}
    ${labelHtml}
    ${props?.renderInputAfterLabel ? inputElem : ''}
  </label>
</div>`;

  const inputChecboxCmp = CMP(
    {
      id: props?.id ? baseId : `input-checkbox-cmp_${baseId}`,
      idAttr: props?.idAttr,
      html: getHtml,
      class: props?.class,
    },
    InputCheckbox,
    props
  );

  // const errorCmp = inputChecboxCmp.add(CMP({ class: 'inputErrorMsg' }));

  // validate(props?.checked);

  return inputChecboxCmp;
};
