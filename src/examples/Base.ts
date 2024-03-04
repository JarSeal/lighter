import { CMP, type TProps } from '../Lighter/CMP';
import { Nav } from './Nav';

export const Base = (props: TProps) => {
  const baseCmp = CMP(props);
  baseCmp.add(
    CMP({
      tag: 'button',
      onClick: (cmp) => console.log('CLICK', cmp.id),
      onFocus: () => console.log('FOCUS'),
      onBlur: () => console.log('BLUR'),
      text: 'jotein',
      idAttr: true,
    })
  );
  baseCmp.add(Nav());
  return baseCmp;
};
