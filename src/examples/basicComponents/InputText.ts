import { CMP, createNewId, type TProps } from '../../Lighter/CMP';

export type TInputText = {
  id?: string;
  isPassword?: boolean;
  label?: string | TProps;
  input?: TProps;
  value?: string;
  type?: TInputType;
};

type TInputType = 'text' | 'password';

type TAttr = {
  type?: TInputType;
  value?: string;
};

export const InputText = (props?: TInputText) => {
  const id = props?.id ? props.id : createNewId();

  const label = props?.label
    ? `<span>${
        typeof props.label === 'string'
          ? props.label
          : CMP({
              tag: 'span',
              ...props.label,
            })
      }</span>`
    : '';

  const inputAttr: TAttr = {};
  if (props?.isPassword) {
    inputAttr.type = 'password';
  } else {
    inputAttr.type = 'text';
  }
  inputAttr.value = props?.value || '';

  const getHtml = () =>
    `<label for="${id}">
      ${label}
      ${CMP({ ...props?.input, tag: 'input', id, idAttr: true, attr: inputAttr })}
    </label>`;

  const inputCmp = CMP({ html: getHtml() });

  console.log('TESTING INPUT', inputCmp);

  return inputCmp;
};
