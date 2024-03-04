import { CMP } from '../Lighter/CMP';

const html = `<ul>
  <li>Home</li>
  <li>Components</li>
</ul>`;

export const Nav = () => {
  const navCmp = CMP({
    html,
    onClick: (_, cmp) => {
      console.log('TADAA', cmp);
      cmp.update({
        ...cmp.props,
        html: '<span>Updated!</span>',
        onClick: () => console.log('NEWLISTENER'),
      });
    },
  });
  return navCmp;
};
