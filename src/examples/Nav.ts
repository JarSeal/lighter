import { CMP, getCmpById } from '../Lighter/CMP';
import { Button } from './basicComponents/Button';

export const Nav = () => {
  const getHtml = () => `<ul class="myClass">
    <li>Home</li>
    <li>Components</li>
    ${CMP({
      tag: 'li',
      text: 'Change class',
      anim: [
        { class: 'start', duration: 2000, classAction: 'replace' },
        { class: 'middle', duration: 2000, classAction: 'add' },
        { class: 'end', duration: 2000, classAction: 'replace', gotoIndex: 0 },
      ],
    })}
    ${CMP({
      tag: 'li',
      text: 'Change color',
      anim: [
        { style: { color: 'orange' }, duration: 2000 },
        { style: { color: 'red' }, duration: 2000, gotoIndex: 0 },
      ],
      style: { transition: 'color 0.7s linear' },
      onClick: (cmp) => {
        cmp.updateAnim([
          { style: { color: 'lime' }, duration: 2000 },
          { style: { color: 'blue' }, duration: 2000, gotoIndex: 0 },
        ]);
      },
    })}
    ${CMP({
      tag: 'li',
      text: 'Dynamic CMP in template',
      idAttr: true,
      style: { color: 'lime' },
      class: 'someClass',
      onClick: (cmp) => {
        console.log('DYNAMIC CLICKED!', cmp.id);
        if (cmp.elem.style.color === 'red') {
          cmp.updateStyle({ color: 'blue' });
        } else {
          cmp.updateStyle({ color: 'red' });
        }
      },
    })}
    ${CMP({
      tag: 'li',
      text: 'Another dynamic CMP in template',
      idAttr: true,
      onClick: (cmp) => {
        console.log('DYNAMIC22222 CLICKED!', cmp.id);
        cmp.remove();
      },
    })}
    ${CMP({
      tag: 'li',
      text: 'One more dynamic CMP in template',
      idAttr: true,
      class: ['someClass', 'otherClass'],
      onClick: (cmp) => {
        console.log('DYNAMIC333 CLICKED!', cmp.props);
        cmp.updateClass('someClass', 'toggle');
        if (cmp.props?.class?.includes('someClass')) {
          cmp.updateAttr({
            disabled: 'true',
            'data-xxx': '23',
          });
        } else {
          cmp.removeAttr(['disabled', 'data-xxx']);
        }
      },
      listeners: [{ type: 'mousedown', fn: () => console.log('MOUSEDOWN') }],
    })}
    <li>
      <div>${Button({
        text: 'Deeper in hierarchy',
        onClick: () => {
          const inputTextCmp = getCmpById('text-input');
          console.log('DEEP', inputTextCmp?.focus());
        },
      })}</div>
    </li>
  </ul>`;

  const navCmp = CMP({ html: getHtml, id: 'sukka', idAttr: true });

  navCmp.add({ tag: 'li', id: 'different', idAttr: true, text: 'Different' });

  setTimeout(() => {
    navCmp.updateAnim([
      { class: 'start', duration: 1000 },
      { class: 'middle', duration: 2000, classAction: 'add' },
      { class: 'END', duration: 3000 },
    ]);
  }, 2000);

  return navCmp;
};
