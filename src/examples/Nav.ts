import { CMP, CMPTemplate } from '../Lighter/CMP';

export const Nav = () => {
  const getHtml = () => `<ul class="myClass">
    <li>Home</li>
    <li>Components</li>
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
  </ul>`;

  const navCmp = CMP({ html: getHtml(), id: 'sukka', idAttr: true });

  navCmp.add({ tag: 'li', id: 'different', idAttr: true, text: 'Different' });

  setTimeout(() => navCmp.update({ html: getHtml(), class: 'fsa' }), 2000);

  return navCmp;
};
