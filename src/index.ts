import { Base } from './examples/Base';

const init = () => {
  const rootElem = document.getElementById('root');
  if (!rootElem) throw new Error('Could not find root elem');
  Base({ attach: rootElem });
};

init();
