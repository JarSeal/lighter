import { v4 as uuidv4 } from 'uuid';

let rootCMP;

export type TCMPProps = {
  attach?: HTMLElement;
  text?: string;
  tag?: string;
  html?: string;
  onClick?: (e: Event, cmp: TCMP) => void;
};

export type TCMP = {
  id: string;
  children: TCMP[];
  props: TCMPProps;
  elem: HTMLElement;
  parentElem: HTMLElement;
  isCMP: boolean;
  listeners: { [key: string]: { fn: (e: Event, cmp: TCMP) => void; remove: () => void } };
  add: (child: TCMP) => TCMP;
  update: (newProps: TCMPProps) => TCMP;
};

export const CMP = (props?: TCMPProps): TCMP => {
  if (props?.attach && rootCMP) {
    throw new Error('Root node already created');
  }

  let cmp: TCMP;

  // Create new element
  const elem = createElem(props);

  // Create cmp object
  cmp = {
    isCMP: true,
    id: uuidv4(),
    children: [],
    props,
    elem,
    parentElem: null,
    listeners: emptyListeners,
    add: (child) => addChild(cmp, child),
    update: (newProps) => updateCmp(cmp, newProps),
  };

  // Create possible listeners
  const listeners = createListeners(props, cmp);
  cmp.listeners = listeners;

  // Check if props have attach and attach to element
  if (props?.attach) {
    props.attach.appendChild(elem);
    rootCMP = cmp;
    cmp.parentElem = props.attach;
  }

  return cmp;
};

const createElem = (props: TCMPProps) => {
  let elem;
  if (props?.html) {
    const template = document.createElement('template');
    template.innerHTML = props.html;
    elem = template.content.children[0];
  } else {
    elem = document.createElement(props?.tag ? props.tag : 'div');
  }
  if (props?.text) elem.textContent = props?.text;
  return elem;
};

const emptyListeners = { click: { fn: null, remove: null } };

const createListeners = (props: TCMPProps, cmp: TCMP) => {
  const listeners = cmp.listeners;
  if (props?.onClick) {
    if (listeners.click.remove) listeners.click.remove();
    const fn = (e: Event) => props.onClick(e, cmp);
    listeners.click.fn = fn;
    listeners.click.remove = () => {
      cmp.elem.removeEventListener('click', fn, true);
      listeners.click.fn = null;
      listeners.click.remove = null;
    };
    cmp.elem.addEventListener('click', fn, true);
  }
  return listeners;
};

const addChild = (parent: TCMP, child: TCMP) => {
  parent.children.push(child);
  parent.elem.appendChild(child.elem);
  child.parentElem = parent.elem;
  return child;
};

const updateCmp = (cmp: TCMP, newProps: TCMPProps) => {
  cmp.props = newProps;
  const elem = createElem(newProps);
  cmp.elem.replaceWith(elem);
  cmp.elem = elem;
  const listeners = createListeners(newProps, cmp);
  cmp.listeners = listeners;
  return cmp;
};
