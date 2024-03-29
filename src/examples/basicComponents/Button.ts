import { CMP, type TProps } from '../../Lighter/CMP';

export const Button = (props?: TProps) => {
  const btnCmp = CMP(
    {
      tag: 'button',
      ...props,
    },
    Button,
    props
  );
  return btnCmp;
};
