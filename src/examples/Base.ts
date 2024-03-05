import { CMP, type TProps } from '../Lighter/CMP';
import { Nav } from './Nav';

export const Base = (props: TProps) => {
  const baseCmp = CMP(props);
  baseCmp.add({
    tag: 'button',
    onClick: (cmp) =>
      cmp.update({ text: 'clicked', tag: 'button' }, (cmp) => console.log('UPDATED', cmp)),
    onClickOutside: (cmp) => console.log('UUTSIDAN', cmp),
    onFocus: () => console.log('FOCUS'),
    onBlur: () => console.log('BLUR'),
    text: 'jotain',
    idAttr: true,
  });

  baseCmp.add(Nav());

  baseCmp.add({
    html: '<input type="text" />',
    onChange: () => console.log('CHANGE'),
    onInput: (_, e) => {
      const target = e.currentTarget as HTMLInputElement;
      showInputCmp.update({ text: target.value });
    },
  });
  const showInputCmp = baseCmp.add();

  for (let i = 0; i < 10; i++) {
    baseCmp.add({ text: Math.random().toString(), onClick: (cmp) => console.log(cmp.props?.text) });
  }

  return baseCmp;
};
