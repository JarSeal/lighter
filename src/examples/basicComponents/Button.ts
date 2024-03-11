import { CMP, type TProps } from '../../Lighter/CMP';

export const Button = (props: TProps) => {
  const btnCmp = CMP({
    tag: 'button',
    ...props,
    wrapper: (props) => Button(props || {}),
    wrapperProps: props,
  });
  return btnCmp;
};
