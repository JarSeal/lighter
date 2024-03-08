import { Base } from './examples/Base';

document.addEventListener('DOMContentLoaded', () => {
  const rootElem = document.getElementById('root');
  rootElem && Base({ attach: rootElem, id: 'root', idAttr: true });
});
