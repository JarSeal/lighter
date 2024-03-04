import { CMP, type TProps } from '../Lighter/CMP';
import { Nav } from './Nav';

export const Base = (props: TProps) => {
  const baseCmp = CMP(props);
  baseCmp.add(
    CMP({
      tag: 'button',
      onClick: (cmp) =>
        cmp.update({ text: 'clicked', tag: 'button' }, (cmp) => console.log('UPDATED', cmp)),
      onClickOutside: (cmp) => console.log('UUTSIDAN', cmp),
      onFocus: () => console.log('FOCUS'),
      onBlur: () => console.log('BLUR'),
      text: 'jotein',
      idAttr: true,
    })
  );
  baseCmp.add(Nav());
  baseCmp.add(
    CMP({
      html: '<input type="text" />',
      listeners: [{ type: 'input', fn: () => console.log('INPUT') }],
    })
  );
  return baseCmp;
};
