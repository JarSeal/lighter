import { CMP, createNewId, type TProps } from '../../Lighter/CMP';

export type TInputText = {
  // Id attribute to be used for the "for" attribute
  // in label and for the input element (will show)
  id?: string;

  // Whether the type of the input attribute is
  // "password" or "text".
  isPassword?: boolean;

  // Label can either be a string (just text) or
  // sub component props (any component props).
  label?: string | TProps;

  // Whether the label has a wrapping element
  // or not (defined by an empty string: '').
  // Default is a span element.
  labelTag?: string;

  // Input sub component props.
  input?: TProps;

  // Input value
  value?: string;

  // Whether the input element has a disabled
  // attribute or not.
  disabled?: boolean;
};

type TInputAttr = {
  type?: 'text' | 'password';
  value?: string;
  disabled?: string;
};

export const InputText = (props?: TInputText) => {
  const id = props?.id ? props.id : createNewId();

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

  const getHtml = () =>
    `<label for="${id}">
      ${label}
      ${CMP({ ...props?.input, tag: 'input', id, idAttr: true, attr: inputAttr })}
    </label>`;

  const inputCmp = CMP({ html: getHtml() });

  console.log('TESTING INPUT', inputCmp);

  return inputCmp;
};
