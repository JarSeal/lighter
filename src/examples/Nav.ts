import { CMP } from '../Lighter/CMP';

export const Nav = () => {
  const getHtml = () => `<ul>
    <li>Home</li>
    <li>Components</li>
    ${CMP({
      tag: 'li',
      text: 'Dynamic CMP in template',
      idAttr: true,
      onClick: (cmp) => console.log('DYNAMIC CLICKED!', cmp.id),
    }).html()}
    ${CMP({
      tag: 'li',
      text: 'Another dynamic CMP in template',
      idAttr: true,
      onClick: (cmp) => {
        console.log('DYNAMIC22222 CLICKED!', cmp.id);
        cmp.remove();
      },
    }).html()}
    ${CMP({
      tag: 'li',
      text: 'One more dynamic CMP in template',
      idAttr: true,
      onClick: (cmp) => console.log('DYNAMIC333 CLICKED!', cmp.id),
    }).html()}
  </ul>`;

  const navCmp = CMP({ html: getHtml(), id: 'sukka', idAttr: true });

  navCmp.add(CMP({ tag: 'li', id: 'different', idAttr: true, text: 'Different' }));

  setTimeout(() => navCmp.update({ html: getHtml() }), 2000);

  return navCmp;
};
