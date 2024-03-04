import { v4 as uuidv4 } from 'uuid';

let rootCMP: TCMP | null = null;
const cmps: { [key: string]: TCMP } = {};

export type TListener = (cmp: TCMP, e: Event) => void;

export type TClassAction = 'add' | 'remove' | 'replace' | 'toggle';

export type TAttr = { key: string; value: string };

export type TProps = {
  id?: string;
  idAttr?: boolean;
  attach?: Element;
  text?: string;
  tag?: string;
  html?: string;
  class?: string | string[];
  attr?: TAttr | TAttr[];
  onClick?: TListener;
  onClickOutside?: TListener;
  onHover?: TListener;
  onFocus?: TListener;
  onBlur?: TListener;
  // onCreateCmp?: (cmp) => TCMP;
  // onUpdateCmp?: (cmp) => TCMP;
  // onRemoveCmp?: (cmp) => TCMP;
  listeners?: { type: string; fn: TListener }[];
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
  update: (newProps?: TProps, callback?: (cmp: TCMP) => void) => TCMP;
  updateAttr: (newAttr: TAttr | TAttr[]) => TCMP;
  updateClass: (newClass: string | string[], action?: TClassAction) => TCMP;
  removeAttr: (attrKey: string | string[]) => TCMP;
  updateText: (newText: string) => TCMP;
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
    update: (newProps, callback) => updateCmp(cmp, newProps, callback),
    updateClass: (newClass, action) => updateCmpClass(cmp, newClass, action),
    updateAttr: (newAttr) => updateCmpAttr(cmp, newAttr),
    removeAttr: (attrKey) => removeCmpAttr(cmp, attrKey),
    updateText: (newText) => updateCmpText(cmp, newText),
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
  updateTemplateChildCmps(cmp);

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
  let attributes: TAttr[] = [];
  if (props?.attr && Array.isArray(props.attr)) {
    attributes = props.attr;
  } else if (typeof props?.attr === 'string') {
    attributes.push(props.attr);
  }
  for (let i = 0; i < attributes.length; i++) {
    elem.setAttribute(attributes[i].key, attributes[i].value);
  }
  if (props?.idAttr) elem.setAttribute('id', cmp.id);

  // Classes
  let classes: string[] = [];
  if (props?.class && Array.isArray(props.class)) {
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
  // Add "outsideClick" listener
  createOutsideClickListener(cmp);
  if (props?.onHover) {
    // Add "mousemove" listener
    const onHover = props.onHover;
    const fn = (e: Event) => onHover(cmp, e);
    listeners.mousemove = fn;
    cmp.elem.addEventListener('mousemove', fn, true);
  } else {
    if (listeners.mousemove || listeners.mousemove === null) delete listeners.mousemove;
  }
  if (props?.onFocus) {
    // Add "focus" listener
    const onFocus = props.onFocus;
    const fn = (e: Event) => onFocus(cmp, e);
    listeners.focus = fn;
    cmp.elem.addEventListener('focus', fn, true);
  } else {
    if (listeners.focus || listeners.focus === null) delete listeners.focus;
  }
  if (props?.onBlur) {
    // Add "blur" listener
    const onBlur = props.onBlur;
    const fn = (e: Event) => onBlur(cmp, e);
    listeners.blur = fn;
    cmp.elem.addEventListener('blur', fn, true);
  } else {
    if (listeners.blur || listeners.blur === null) delete listeners.blur;
  }
  if (props?.listeners) {
    // Add custom listeners
    for (let i = 0; i < props.listeners.length; i++) {
      const listenerFn = props.listeners[i].fn;
      const fn = (e: Event) => listenerFn(cmp, e);
      const type = props.listeners[i].type;
      listeners[type] = fn;
      cmp.elem.addEventListener(type, fn, true);
    }
  }
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

  if (cmp.props?.onClickOutside) removeOutsideClickListener(cmp);
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
    child.remove();
  }

  // Remove elem from dom and cmps
  removeListeners(cmp, true);
  cmp.elem.remove();
  delete cmps[cmp.id];

  return cmp;
};

const updateCmp = (cmp: TCMP, newProps?: TProps, callback?: (cmp: TCMP) => void) => {
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
  updateTemplateChildCmps(cmp);
  if (callback) callback(cmp);
  return cmp;
};

const updateTemplateChildCmps = (cmp: TCMP) => {
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

const updateCmpAttr = (cmp: TCMP, newAttr: TAttr | TAttr[]) => {
  let attributes: TAttr[] = [];
  let oldAttributes: TAttr[] = [];
  if (Array.isArray(newAttr)) {
    attributes = newAttr;
  } else {
    attributes.push(newAttr);
  }
  for (let i = 0; i < attributes.length; i++) {
    cmp.elem.setAttribute(attributes[i].key, attributes[i].value);
  }
  const attrProps = cmp.props?.attr || [];
  if (Array.isArray(attrProps)) {
    oldAttributes = attrProps;
  } else {
    oldAttributes = [attrProps];
  }
  oldAttributes = oldAttributes.filter(
    (attr) => !attributes.find((attr2) => attr.key === attr2.key)
  );
  const combinedAttributes = oldAttributes.concat(attributes);
  if (cmp.props) {
    cmp.props.attr = combinedAttributes;
  } else {
    cmp.props = { attr: combinedAttributes };
  }

  return cmp;
};

const removeCmpAttr = (cmp: TCMP, attrKey: string | string[]) => {
  let attributeKeys: string | string[] = [];
  let oldAttributes: TAttr[] = [];
  if (Array.isArray(attrKey)) {
    attributeKeys = attrKey;
  } else if (typeof attrKey === 'string') {
    attributeKeys.push(attrKey);
  }
  for (let i = 0; i < attributeKeys.length; i++) {
    cmp.elem.removeAttribute(attributeKeys[i]);
  }
  const attrProps = cmp.props?.attr || [];
  if (Array.isArray(attrProps)) {
    oldAttributes = attrProps;
  } else {
    oldAttributes = [attrProps];
  }
  oldAttributes = oldAttributes.filter((attr) => !attributeKeys.includes(attr.key));
  if (cmp.props) {
    cmp.props.attr = oldAttributes;
  } else {
    cmp.props = { attr: oldAttributes };
  }

  return cmp;
};

const updateCmpText = (cmp: TCMP, newText: string) => {
  if (!cmp.props?.text && typeof cmp.props?.text !== 'string') {
    throw new Error(
      'Cannot update text, CMP is not a text CMP. To change this to a text CMP, use the "cmp.update({ text })" function instead.'
    );
  }
  cmp.elem.textContent = newText;
  if (cmp.props) {
    cmp.props.text = newText;
  } else {
    cmp.props = { text: newText };
  }

  return cmp;
};

const onClickOutsideListener: {
  count: number;
  fns: { [key: string]: { fn: (e: Event) => void; elem: Element } };
  mainFn: (e: Event) => void;
} = {
  count: 0,
  fns: {},
  mainFn: (e: Event) => {
    const clickedElem = e.target as Element;
    const fnsKeys = Object.keys(onClickOutsideListener.fns);
    for (let i = 0; i < fnsKeys.length; i++) {
      const listener = onClickOutsideListener.fns[fnsKeys[i]];
      if (!checkMatchingParent(clickedElem, listener.elem)) listener.fn(e);
    }
  },
};

const checkMatchingParent = (elemToCheck: Element | null, elemTarget: Element): boolean => {
  if (!elemToCheck) return false;
  if (elemToCheck === elemTarget) return true;
  return checkMatchingParent(elemToCheck.parentElement, elemTarget);
};

const createOutsideClickListener = (cmp: TCMP) => {
  if (!cmp.props?.onClickOutside) {
    removeOutsideClickListener(cmp);
    return;
  }
  if (onClickOutsideListener.count === 0) {
    window.removeEventListener('click', onClickOutsideListener.mainFn);
    window.addEventListener('click', onClickOutsideListener.mainFn);
  }
  const onClickOutside = cmp.props.onClickOutside;
  onClickOutsideListener.fns[cmp.id] = { fn: (e: Event) => onClickOutside(cmp, e), elem: cmp.elem };
  onClickOutsideListener.count += 1;
};

const removeOutsideClickListener = (cmp: TCMP) => {
  if (!onClickOutsideListener.fns[cmp.id]) return;
  if (onClickOutsideListener.count === 1) {
    window.removeEventListener('click', onClickOutsideListener.mainFn);
  }
  delete onClickOutsideListener.fns[cmp.id];
  onClickOutsideListener.count -= 1;
};
