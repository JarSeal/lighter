import { CMP, getCmpById, type TProps } from '../Lighter/CMP';
import { Button } from './basicComponents/Button';
import { InputText } from './basicComponents/InputText';
import { Nav } from './Nav';

export const Base = (props?: TProps) => {
  const baseCmp = CMP({ ...props, wrapper: (props) => Base(props), wrapperProps: props });
  baseCmp.add(
    Button({
      onClick: (cmp) => {
        cmp.update({ text: 'clicked', tag: 'button', onClickOutside: undefined }, (cmp) =>
          console.log('UPDATED', cmp)
        );
        nav.update();
      },
      onClickOutside: (cmp) => console.log('UUTSIDAN', cmp),
      onFocus: () => console.log('FOCUS'),
      onBlur: () => console.log('BLUR'),
      text: 'jotain',
      idAttr: true,
    })
  );

  const nav = baseCmp.add(Nav());

  baseCmp.add({
    id: 'text-input',
    html: '<input type="text" />',
    onChange: () => console.log('CHANGE'),
    onInput: (_, e) => {
      const target = e.currentTarget as HTMLInputElement;
      showInputCmp.update({ text: target.value });
    },
  });
  const showInputCmp = baseCmp.add();

  const labelHtml = () =>
    `<span>My input label and ${CMP({
      text: 'CMP',
      id: 'TUUT',
      idAttr: true,
    })}</span>`;
  const inputTextCmp = baseCmp.add(
    InputText({
      labelTag: '',
      label: {
        html: labelHtml,
      },
      value: 'test',
      onChange: (cmp, e) => {
        const target = e.target as HTMLInputElement;
        if (target?.value !== 'reset') {
          const newCmp = cmp.update({ value: target?.value });
          console.log('onChange2', newCmp.props?.wrapperProps?.value);
        }
      },
      onInput: (cmp, e) => {
        const target = e.target as HTMLInputElement;
        const newCmp = cmp.update({ value: target?.value, focus: true });
        console.log('onInput', target?.value, newCmp.props?.wrapperProps);
        if (target?.value === 'reset') {
          baseCmp.update();
        }
      },
    })
  );

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
    // onCreateCmp: (cmp) => cmp.scrollIntoView({ behavior: 'smooth' }, 1000),
  });

  baseCmp.add({
    style: { background: 'grey', minHeight: '1800px' },
    onClick: () => {
      const scrollTestCmp = getCmpById('scroll-test');
      scrollTestCmp?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    },
  });

  return baseCmp;
};
