import { CMP } from '../Lighter/CMP';

export const Nav = () => {
  const getHtml = () => `<ul class="myClass">
    <li>Home</li>
    <li>Components</li>
    ${CMP({
      tag: 'li',
      text: 'Dynamic CMP in template',
      idAttr: true,
      class: 'someClass',
      onClick: (cmp) => console.log('DYNAMIC CLICKED!', cmp.id),
      onHover: () => console.log('HOVER'),
    }).html()}
    ${CMP({
      tag: 'li',
      text: 'Another dynamic CMP in template',
      idAttr: true,
      onClick: (cmp) => {
        console.log('DYNAMIC22222 CLICKED!', cmp.id);
        cmp.remove();
      },
      onClickOutside: () => console.log('OUTSIDE'),
    }).html()}
    ${CMP({
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
      listeners: [{ type: 'mousedown', fn: () => console.log('MOUSDOWN') }],
    }).html()}
  </ul>`;

  const navCmp = CMP({ html: getHtml(), id: 'sukka', idAttr: true });

  navCmp.add(CMP({ tag: 'li', id: 'different', idAttr: true, text: 'Different' }));

  setTimeout(() => navCmp.update({ html: getHtml(), class: 'fsa' }), 2000);

  return navCmp;
};
