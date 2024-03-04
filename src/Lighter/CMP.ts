import { v4 as uuidv4 } from 'uuid';

let rootCMP: TCMP | null = null;
const cmps: { [key: string]: TCMP } = {};

export type TListener = (cmp: TCMP, e: Event) => void;

export type TClassAction = 'add' | 'remove' | 'replace' | 'toggle';

export type TProps = {
  id?: string;
  idAttr?: boolean;
  attach?: HTMLElement;
  text?: string;
  tag?: string;
  html?: string;
  class?: string | string[];
  // attr?: string | string[];
  onClick?: TListener;
  // onHover?: TListener;
  // onFocus?: TListener;
  // onBlur?: TListener;
  // listeners?: { type: string, fn: TListener }[]
};

export type TCMP = {
  id: string;
  children: TCMP[];
  props?: TProps;
  elem: Element;
  parentElem: Element | null;
  isTemplateCmp?: boolean;
  isRoot?: boolean;
  html: () => string;
  listeners: { [key: string]: ((e: Event) => void) | null };
  add: (child: TCMP) => TCMP;
  remove: () => TCMP;
  update: (newProps?: TProps) => TCMP;
  // updateAttr: (newAttr: string | string[]) => TCMP;
  updateClass: (newClass: string | string[], action?: TClassAction) => TCMP;
  // updateText: (newText: string) => TCMP;
};

export const CMP = (props?: TProps): TCMP => {
  if (props?.attach && rootCMP) {
    throw new Error('Root node already created');
  }
  if (props?.id && cmps[props.id]) {
    throw new Error(`Id is already in use / taken: ${props.id}`);
  }

  // Create cmp object
  const cmp: TCMP = {
    id: props?.id || uuidv4(),
    children: [],
    props,
    elem: null as unknown as Element,
    parentElem: null,
    html: () => '',
    listeners: {},
    add: (child) => addChild(cmp, child),
    remove: () => removeCmp(cmp),
    update: (newProps) => updateCmp(cmp, newProps),
    updateClass: (newClass, action) => updateCmpClass(cmp, newClass, action),
  };

  // Create new element
  const elem = createElem(cmp, props);
  cmp.elem = elem;
  cmp.html = () => getTempTemplate(cmp.id);

  // Create possible listeners
  const listeners = createListeners(cmp, props);
  cmp.listeners = listeners;

  // Check if props have attach and attach to element
  if (props?.attach) {
    props.attach.appendChild(elem);
    rootCMP = cmp;
    cmp.parentElem = props.attach;
    cmp.isRoot = true;
  }

  // Add cmp to list
  cmps[cmp.id] = cmp;

  // Check for child <cmp> tags and replace possible tempTemplates
  updateTemplateCmps(cmp);

  return cmp;
};

const getTempTemplate = (id: string) => `<cmp id="${id}"></cmp>`;

const createElem = (cmp: TCMP, props?: TProps) => {
  let elem;

  // Elem and content
  if (props?.html) {
    const template = document.createElement('template');
    template.innerHTML = props.html;
    elem = template.content.children[0];
  } else {
    elem = document.createElement(props?.tag ? props.tag : 'div');
  }
  if (props?.text) elem.textContent = props?.text;

  // Attributes
  if (props?.idAttr) elem.setAttribute('id', cmp.id);
  // @TODO: add custom attributes

  // Classes
  let classes: string[] = [];
  if (props?.class && Array.isArray(props?.class)) {
    classes = props.class;
  } else if (typeof props?.class === 'string') {
    classes = props.class.split(' ');
  }
  for (let i = 0; i < classes.length; i++) {
    elem.classList.add(classes[i].trim());
  }

  return elem;
};

const createListeners = (cmp: TCMP, props?: TProps) => {
  // Remove possiple listeners
  removeListeners(cmp);

  const listeners = cmp.listeners;

  if (props?.onClick) {
    // Add "click" listener
    const onClick = props.onClick;
    const fn = (e: Event) => onClick(cmp, e);
    listeners.click = fn;
    cmp.elem.addEventListener('click', fn, true);
  } else {
    if (listeners.click || listeners.click === null) delete listeners.click;
  }
  // @TODO: add rest of onXXX listeners
  // @TODO: add custom listeners
  return listeners;
};

const removeListeners = (cmp: TCMP, nullify?: boolean) => {
  const listeners = cmp.listeners;
  const keys = Object.keys(listeners);

  // Remove possiple listeners
  for (let i = 0; i < keys.length; i++) {
    const listener = listeners[keys[i]];
    if (listener) {
      cmp.elem.removeEventListener(keys[i], listener, true);
      if (nullify) listeners[keys[i]] = null;
    }
  }
};

const addChild = (parent: TCMP, child: TCMP) => {
  parent.children.push(child);
  parent.elem.appendChild(child.elem);
  child.parentElem = parent.elem;
  return child;
};

const removeCmp = (cmp: TCMP) => {
  // Check children
  for (let i = 0; i < cmp.children.length; i++) {
    const child = cmp.children[i];
    const id = child.id;
    child.remove();
    delete cmps[id];
  }

  // Remove elem from dom and cmps
  cmp.elem.remove();
  delete cmps[cmp.id];

  return cmp;
};

const updateCmp = (cmp: TCMP, newProps?: TProps) => {
  cmp.props = newProps;
  const elem = createElem(cmp, newProps);
  cmp.elem.replaceWith(elem);
  cmp.elem = elem;
  const listeners = createListeners(cmp, newProps);
  cmp.listeners = listeners;
  // Remove old templateCmp children and added children
  const keepAddedChildren = [];
  for (let i = 0; i < cmp.children.length; i++) {
    const child = cmp.children[i];
    if (!child.isTemplateCmp) {
      keepAddedChildren.push(child);
    }
    child.remove();
  }
  cmp.children = [];
  // Add added children
  for (let i = 0; i < keepAddedChildren.length; i++) {
    cmp.add(keepAddedChildren[i]);
  }
  updateTemplateCmps(cmp);
  return cmp;
};

const updateTemplateCmps = (cmp: TCMP) => {
  const children = cmp.elem.children;
  for (let i = 0; i < children.length; i++) {
    const id = children[i].getAttribute('id');
    if (id && children[i].outerHTML === getTempTemplate(id)) {
      const replaceWithCmp = cmps[id];
      if (!replaceWithCmp)
        throw new Error(`The replaceWithCmp not found in cmps list (in parent cmp: ${cmp.id})`);
      children[i].replaceWith(replaceWithCmp.elem);
      replaceWithCmp.isTemplateCmp = true;
      replaceWithCmp.parentElem = cmp.elem;
      cmp.children.push(replaceWithCmp);
    }
  }
};

const updateCmpClass = (
  cmp: TCMP,
  newClass: string | string[],
  action: TClassAction = 'replace'
) => {
  let classes: string[] = [];
  let oldClasses: string[] = [];
  if (Array.isArray(newClass)) {
    classes = newClass;
  } else if (typeof newClass === 'string') {
    classes = newClass.split(' ');
  }
  if (cmp.props?.class && Array.isArray(cmp.props.class)) {
    oldClasses = cmp.props.class;
  } else if (typeof cmp.props?.class === 'string') {
    oldClasses = cmp.props.class.split(' ');
  }
  if (action === 'remove') {
    // Remove
    for (let i = 0; i < classes.length; i++) {
      oldClasses = oldClasses.filter((c) => c !== classes[i].trim());
      cmp.elem.classList.remove(classes[i].trim());
    }
    if (cmp.props) {
      cmp.props.class = oldClasses.join(' ').trim();
    } else {
      cmp.props = { class: oldClasses.join(' ').trim() };
    }
  } else if (action === 'toggle') {
    // Toggle
    for (let i = 0; i < classes.length; i++) {
      oldClasses = oldClasses.filter((c) => c !== classes[i].trim());
      if (cmp.elem.classList.contains(classes[i])) {
        cmp.elem.classList.remove(classes[i].trim());
        continue;
      }
      cmp.elem.classList.add(classes[i].trim());
      oldClasses.push(classes[i].trim());
    }
    if (cmp.props) {
      cmp.props.class = oldClasses.join(' ').trim();
    } else {
      cmp.props = { class: oldClasses.join(' ').trim() };
    }
  } else {
    if (action === 'replace') {
      // Replace
      cmp.elem.removeAttribute('class');
      if (cmp.props) {
        cmp.props.class = newClass;
      } else {
        cmp.props = { class: newClass };
      }
    } else {
      // Add
      const addedClass = `${oldClasses.join(' ').trim()} ${classes.join(' ')}`.trim();
      if (cmp.props) {
        cmp.props.class = addedClass;
      } else {
        cmp.props = { class: addedClass };
      }
    }
    for (let i = 0; i < classes.length; i++) {
      cmp.elem.classList.add(classes[i].trim());
    }
  }
  return cmp;
};
