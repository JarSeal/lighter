import { CMP, CMPTemplate } from '../Lighter/CMP';

export const Nav = () => {
  const getHtml = () => `<ul class="myClass">
    <li>Home</li>
    <li>Components</li>
    ${CMPTemplate({
      tag: 'li',
      text: 'Change class',
      animClass: [
        { newClass: 'start', duration: 2000, action: 'replace' },
        { newClass: 'middle', duration: 2000, action: 'add' },
        { newClass: 'end', duration: 2000, action: 'replace', gotoIndex: 0 },
      ],
    })}
    ${CMPTemplate({
      tag: 'li',
      text: 'Change color',
      animStyle: [
        { newStyle: { color: 'orange' }, duration: 2000 },
        { newStyle: { color: 'red' }, duration: 2000, gotoIndex: 0 },
      ],
      style: { transition: 'color 2s linear' },
      onClick: (cmp) => {
        // cmp.remove()
        cmp.updateAnimStyle([
          { newStyle: { color: 'lime' }, duration: 2000 },
          { newStyle: { color: 'blue' }, duration: 2000, gotoIndex: 0 },
        ]);
      },
    })}
    ${CMPTemplate({
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
    ${CMPTemplate({
      tag: 'li',
      text: 'Another dynamic CMP in template',
      idAttr: true,
      onClick: (cmp) => {
        console.log('DYNAMIC22222 CLICKED!', cmp.id);
        cmp.remove();
      },
    })}
    ${CMPTemplate({
      tag: 'li',
      text: 'One more dynamic CMP in template',
      idAttr: true,
      class: ['someClass', 'otherClass'],
      onClick: (cmp) => {
        console.log('DYNAMIC333 CLICKED!', cmp.props);
        cmp.updateClass('someClass', 'toggle');
        if (cmp.props?.class?.includes('someClass')) {
          cmp.updateAttr([
            { key: 'disabled', value: 'true' },
            { key: 'data-xxx', value: '23' },
          ]);
        } else {
          cmp.removeAttr(['disabled', 'data-xxx']);
        }
      },
      listeners: [{ type: 'mousedown', fn: () => console.log('MOUSEDOWN') }],
    })}
    <li>
      <div>${CMPTemplate({
        tag: 'span',
        text: 'Deeper in hierarchy',
        onClick: () => console.log('DEEP'),
      })}</div>
    </li>
  </ul>`;

  const navCmp = CMP({ html: getHtml(), id: 'sukka', idAttr: true });

  navCmp.add({ tag: 'li', id: 'different', idAttr: true, text: 'Different' });

  // setTimeout(() => navCmp.update({ html: getHtml(), class: 'fsa' }), 2000);

  return navCmp;
};
