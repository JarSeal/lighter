import { CMP, getCmpById, type TProps } from '../Lighter/CMP';
import { Button } from './Button';
import { Nav } from './Nav';

export const Base = (props: TProps) => {
  const baseCmp = CMP(props);
  baseCmp.add(
    Button({
      onClick: (cmp) =>
        cmp.update({ text: 'clicked', tag: 'button' }, (cmp) => console.log('UPDATED', cmp)),
      onClickOutside: (cmp) => console.log('UUTSIDAN', cmp),
      onFocus: () => console.log('FOCUS'),
      onBlur: () => console.log('BLUR'),
      text: 'jotain',
      idAttr: true,
    })
  );

  baseCmp.add(Nav());

  baseCmp.add({
    id: 'text-input',
    html: '<input type="text" />',
    onChange: () => console.log('CHANGE'),
    onInput: (_, e) => {
      const target = e.currentTarget as HTMLInputElement;
      showInputCmp.update({ text: target.value });
    },
    onFocus: () => console.log('FOCUS'),
  });
  const showInputCmp = baseCmp.add();

  for (let i = 0; i < 10; i++) {
    baseCmp.add({ text: Math.random().toString(), onClick: (cmp) => console.log(cmp.props?.text) });
  }

  baseCmp.add({
    style: { background: 'grey', minHeight: '100vh' },
    onClick: () => {
      const scrollTestCmp = getCmpById('scroll-test');
      scrollTestCmp?.scrollIntoView({ behavior: 'smooth' });
    },
  });

  baseCmp.add({
    id: 'scroll-test',
    text: 'HERE IS THE SCROLL TO COMPONENT',
    onCreateCmp: (cmp) => cmp.scrollIntoView({ behavior: 'smooth' }),
  });

  baseCmp.add({
    style: { background: 'grey', minHeight: '1800px' },
    onClick: () => {
      const scrollTestCmp = getCmpById('scroll-test');
      scrollTestCmp?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    },
  });

  // setTimeout(() => {
  //   baseCmp.add({ scrollIntoView: { behavior: 'smooth' } });
  // }, 2000);

  return baseCmp;
};
