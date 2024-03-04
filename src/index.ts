import { Base } from './examples/base';

const init = () => {
  const rootElem = document.getElementById('root');
  Base({ attach: rootElem });
};

init();
