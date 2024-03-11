import { CMP, createNewId, TCMP, type TListener, type TProps } from '../../Lighter/CMP';

export type TInputText = {
  // Id attribute to be used for the "for" attribute
  // in label and for the input element ID (will show)
  id?: string;

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

  // The input fields change listener
  onChange?: TListener;

  // The input fields input listener
  onInput?: TListener;

  // @TODO
  // Whether to lose the focus of the input field
  // on Enter key press. Default false.
  blurOnEnter?: boolean;

  // @TODO
  // Whether to set focus to the next input elem
  // in DOM on Enter key press. It can be given
  // a boolean or the ID of the next elem. Default false.
  focusToNextOnEnter?: boolean | string;

  // @TODO
  // Shows an error msg for the input and adds
  // an error class to the CMP. If msg is undefined,
  // null, or an empty string, then only the error
  // class is added.
  showError?: (msg?: string | TProps | null) => void;

  // @TODO
  // Removes the error class and the possible error msg.
  removeError?: () => void;
};

type TInputAttr = {
  type?: 'text' | 'password';
  value?: string;
  disabled?: string;
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
              id: 'WRAP',
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
    `<label for="${inputId}">
      ${label}
      ${CMP({
        ...props?.input,
        tag: 'input',
        id: inputId,
        idAttr: true,
        attr: inputAttr,
        ...{ onChange: (_, e) => props?.onChange && props.onChange(inputTextCmp, e) },
        ...{ onInput: (_, e) => props?.onInput && props.onInput(inputTextCmp, e) },
      })}
    </label>`;

  const inputTextCmp = CMP({
    id: 'input-text-cmp',
    idAttr: true,
    html: getHtml,
    wrapper: (props?: TInputText) => InputText(props),
    wrapperProps: props,
  });

  return inputTextCmp;
};
