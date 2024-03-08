import { v4 as uuidv4 } from 'uuid';

let rootCMP: TCMP | null = null;
const cmps: { [key: string]: TCMP } = {};

export type TListener = (cmp: TCMP, e: Event) => void;

export type TClassAction = 'add' | 'remove' | 'replace' | 'toggle';

export type TAnimClass = {
  class: string | string[];
  duration: number;
  gotoIndex?: number;
  action?: TClassAction;
};

export type TStyle = { [key: string]: string | number | null };

export type TAnimStyle = {
  style: TStyle;
  duration: number;
  gotoIndex?: number;
};

export type TAttr = { [key: string]: unknown };

export type TAnimState = {
  setState: (key: string, value: unknown) => void;
  removeState: (key: string) => void;
  state: { [key: string]: unknown };
};

export type TAnimChain = {
  duration: number;
  gotoIndex?: number | ((cmp: TCMP, animState?: TAnimState) => number);
  style?: TStyle;
  class?: string | string[];
  classAction?: TClassAction;
  phaseStartFn?: (cmp: TCMP, animState: TAnimState) => void | number;
  phaseEndFn?: (cmp: TCMP, animState: TAnimState) => void | number;
};

export type TSettings = {
  sanitizer?: ((html: string) => string) | null;
  sanitizeAll?: boolean;
  doCheckIsInDom?: boolean;
  replaceRootDom?: boolean;
};

export type TProps = {
  id?: string;
  idAttr?: boolean;
  attach?: HTMLElement;
  text?: string;
  tag?: string;
  html?: string | ((cmp: TCMP) => string);
  sanitize?: boolean;
  class?: string | string[];
  attr?: TAttr;
  style?: TStyle;
  anim?: TAnimChain[];
  onClick?: TListener;
  onClickOutside?: TListener;
  onHover?: TListener;
  onFocus?: TListener;
  onBlur?: TListener;
  onInput?: TListener;
  onChange?: TListener;
  onCreateCmp?: (cmp: TCMP) => void;
  onRemoveCmp?: (cmp: TCMP) => void;
  listeners?: { type: string; fn: TListener }[];
  focus?: boolean;
};

export type TCMP = {
  id: string;
  children: TCMP[];
  props?: TProps;
  elem: HTMLElement;
  parent: TCMP | null;
  parentElem: HTMLElement | null;
  isTemplateCmp?: boolean;
  isRoot?: boolean;
  isCmp: boolean;
  listeners: { [key: string]: ((e: Event) => void) | null };
  timers: { [key: string]: { fn: unknown; curIndex?: number; animState?: TAnimState } };
  add: (child?: TCMP | TProps) => TCMP;
  remove: () => TCMP;
  update: (newProps?: TProps, callback?: (cmp: TCMP) => void) => TCMP;
  updateClass: (newClass: string | string[], action?: TClassAction) => TCMP;
  updateAttr: (newAttr: TAttr) => TCMP;
  removeAttr: (attrKey: string | string[]) => TCMP;
  updateStyle: (newStyle: TStyle) => TCMP;
  updateText: (newText: string) => TCMP;
  updateAnim: (animChain: TAnimChain[]) => TCMP;
  focus: (focusValueToProps?: boolean) => TCMP;
  blur: (focusValueToProps?: boolean) => TCMP;
  scrollIntoView: (params?: boolean | ScrollIntoViewOptions, timeout?: number) => TCMP;

  // @SUGGESTION:
  // removeListener: (key: string) => TCMP;
  // removeTimer: (key: string) => TCMP;
  // getChildCmpById: (id: string) => TCMP;
  // getParentCmpById: (id: string) => TCMP;
};

const globalSettings: TSettings = {
  sanitizer: null,
  sanitizeAll: false,
  doCheckIsInDom: false,
  replaceRootDom: true,
};

export const CMP = (props?: TProps, settings?: TSettings): TCMP => {
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
    elem: null as unknown as HTMLElement,
    parent: null,
    parentElem: null,
    isCmp: true,
    listeners: {},
    timers: {},
    add: (child) => addChildCmp(cmp, child),
    remove: () => removeCmp(cmp),
    update: (newProps, callback) => updateCmp(cmp, newProps, callback),
    updateClass: (newClass, action) => updateCmpClass(cmp, newClass, action),
    updateAttr: (newAttr) => updateCmpAttr(cmp, newAttr),
    removeAttr: (attrKey) => removeCmpAttr(cmp, attrKey),
    updateStyle: (newStyle: TStyle) => updateCmpStyle(cmp, newStyle),
    updateText: (newText) => updateCmpText(cmp, newText),
    updateAnim: (animChain: TAnimChain[]) => updateCmpAnim(cmp, animChain),
    focus: (focusValueToProps) => focusCmp(cmp, focusValueToProps),
    blur: (focusValueToProps) => blurCmp(cmp, focusValueToProps),
    scrollIntoView: (params, timeout) => scrollCmpIntoView(cmp, params, timeout),
  };

  // Create new element
  const elem = createElem(cmp, props);
  cmp.elem = elem;

  // Create possible listeners
  const listeners = createListeners(cmp, props);
  cmp.listeners = listeners;

  // Check if props have attach and attach to element
  if (props?.attach) {
    if (settings?.sanitizer) globalSettings.sanitizer = settings.sanitizer;
    if (settings?.sanitizeAll) globalSettings.sanitizeAll = settings.sanitizeAll;
    if (settings?.doCheckIsInDom !== undefined)
      globalSettings.doCheckIsInDom = settings.doCheckIsInDom;
    if (settings?.replaceRootDom !== undefined)
      globalSettings.replaceRootDom = settings.replaceRootDom;
    if (globalSettings.replaceRootDom) {
      props.attach.replaceWith(elem);
    } else {
      props.attach.appendChild(elem);
    }
    rootCMP = cmp;
    cmp.parentElem = elem.parentElement;
    cmp.parent = null;
    cmp.isRoot = true;
    runAnims(cmp);
  }

  // Add cmp to list
  cmps[cmp.id] = cmp;

  // Check for child <cmp> tags and replace possible tempTemplates
  addTemplateChildCmp(cmp);

  // Overwrite toString method
  cmp.toString = () => getTempTemplate(cmp.id);

  // @TODO: Add onInit()

  return cmp;
};

const addChildCmp = (parent: TCMP, child?: TCMP | TProps) => {
  let cmp;
  if (!child) {
    cmp = CMP();
  } else if (!('isCmp' in child)) {
    cmp = CMP(child);
  } else {
    cmp = child;
  }

  parent.children.push(cmp);
  parent.elem.appendChild(cmp.elem);
  cmp.parent = parent;
  cmp.parentElem = parent.elem;
  if (cmp.props?.focus) focusCmp(cmp);
  runAnims(cmp);
  if (cmp.props?.onCreateCmp) cmp.props.onCreateCmp(cmp);
  return cmp;
};

const addTemplateChildCmp = (cmp: TCMP) => {
  const childCmpElems = cmp.elem.querySelectorAll('cmp');
  for (let i = 0; i < childCmpElems.length; i++) {
    const id = childCmpElems[i].getAttribute('id');
    if (id && childCmpElems[i].outerHTML === getTempTemplate(id)) {
      const replaceWithCmp = cmps[id];
      if (!replaceWithCmp)
        throw new Error(`The replaceWithCmp not found in cmps list (in parent cmp: ${cmp.id})`);
      childCmpElems[i].replaceWith(replaceWithCmp.elem);
      replaceWithCmp.isTemplateCmp = true;
      replaceWithCmp.parent = cmp;
      replaceWithCmp.parentElem = cmp.elem;
      if (replaceWithCmp.props?.focus) focusCmp(replaceWithCmp);
      cmp.children.push(replaceWithCmp);
      runAnims(replaceWithCmp);
      if (cmp.props?.onCreateCmp) cmp.props.onCreateCmp(cmp);
    }
  }
};

export const getCmpById = (id: string): TCMP | null => cmps[id] || null;

export const createNewId = () => uuidv4();

const getTempTemplate = (id: string) => `<cmp id="${id}"></cmp>`;

const createElem = (cmp: TCMP, props?: TProps) => {
  let elem;

  // Elem and content
  if (props?.html) {
    const template = document.createElement('template');
    const rawHtml = typeof props.html === 'string' ? props.html : props.html(cmp);
    template.innerHTML =
      (props.sanitize || globalSettings.sanitizeAll) && globalSettings.sanitizer
        ? globalSettings.sanitizer(rawHtml)
        : rawHtml;
    elem = template.content.children[0] as HTMLElement;
    setPropsValue(cmp, { tag: elem.tagName.toLowerCase() });
  } else {
    elem = document.createElement(props?.tag ? props.tag : 'div') as HTMLElement;
  }
  if (props?.text) elem.textContent = props?.text;

  const attrKeys = props?.attr ? Object.keys(props.attr) : [];
  const attributes = props?.attr || {};
  for (let i = 0; i < attrKeys.length; i++) {
    const value = attributes[attrKeys[i]];
    elem.setAttribute(attrKeys[i], String(value));
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

  // Styles
  if (props?.style) {
    const styleProps = Object.keys(props.style);
    for (let i = 0; i < styleProps.length; i++) {
      const prop = styleProps[i];
      const value = props.style[styleProps[i]];
      if (prop && value !== null) {
        // @TODO: test if null values remove the rule?
        elem.style[prop as unknown as number] = String(value);
      } else if (value === null) {
        elem.style.removeProperty(prop);
      }
    }
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
  if (props?.onInput) {
    // Add "input" listener
    const onInput = props.onInput;
    const fn = (e: Event) => onInput(cmp, e);
    listeners.input = fn;
    cmp.elem.addEventListener('input', fn, true);
  } else {
    if (listeners.input || listeners.input === null) delete listeners.input;
  }
  if (props?.onChange) {
    // Add "change" listener
    const onChange = props.onChange;
    const fn = (e: Event) => onChange(cmp, e);
    listeners.change = fn;
    cmp.elem.addEventListener('change', fn, true);
  } else {
    if (listeners.change || listeners.change === null) delete listeners.change;
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

const removeCmp = (cmp: TCMP) => {
  // Check children
  for (let i = 0; i < cmp.children.length; i++) {
    const child = cmp.children[i];
    child.remove();
  }

  // Remove elem from dom and cmps
  removeListeners(cmp, true);
  removeAnims(cmp);
  cmp.elem.remove();
  delete cmps[cmp.id];

  if (cmp.props?.onRemoveCmp) cmp.props.onRemoveCmp(cmp);

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
  if (cmp.props?.focus) focusCmp(cmp);
  addTemplateChildCmp(cmp);
  runAnims(cmp);
  if (cmp.props?.onCreateCmp) cmp.props.onCreateCmp(cmp);
  if (callback) callback(cmp);
  return cmp;
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
  } else {
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
    setPropsValue(cmp, { class: oldClasses.join(' ').trim().split(' ') });
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
    setPropsValue(cmp, { class: oldClasses.join(' ').trim().split(' ') });
  } else {
    if (action === 'replace') {
      // Replace
      cmp.elem.removeAttribute('class');
      setPropsValue(cmp, { class: classes });
    } else {
      // Add
      const addedClass = `${oldClasses.join(' ').trim()} ${classes.join(' ')}`.trim();
      setPropsValue(cmp, { class: addedClass.split(' ') });
    }
    for (let i = 0; i < classes.length; i++) {
      cmp.elem.classList.add(classes[i].trim());
    }
  }

  return cmp;
};

const updateCmpAttr = (cmp: TCMP, newAttr: TAttr) => {
  const attrKeys = Object.keys(newAttr);
  for (let i = 0; i < attrKeys.length; i++) {
    const value = newAttr[attrKeys[i]];
    cmp.elem.setAttribute(attrKeys[i], String(value));
    if (cmp.props?.attr) {
      cmp.props.attr[attrKeys[i]] = String(value);
    }
  }

  return cmp;
};

const removeCmpAttr = (cmp: TCMP, attrKey: string | string[]) => {
  let attributeKeys: string | string[] = [];
  const attrProps = cmp.props?.attr;
  if (Array.isArray(attrKey)) {
    attributeKeys = attrKey;
  } else if (typeof attrKey === 'string') {
    attributeKeys.push(attrKey);
  }
  for (let i = 0; i < attributeKeys.length; i++) {
    cmp.elem.removeAttribute(attributeKeys[i]);
    if (attrProps) delete attrProps[attributeKeys[i]];
  }
  setPropsValue(cmp, { attr: attrProps });

  return cmp;
};

const updateCmpStyle = (cmp: TCMP, newStyle: TStyle) => {
  const styleProps = Object.keys(newStyle);
  for (let i = 0; i < styleProps.length; i++) {
    const prop = styleProps[i];
    const value = newStyle[styleProps[i]];
    if (prop && value !== null) {
      // @TODO: test if null values remove the rule?
      cmp.elem.style[prop as unknown as number] = String(value);
    } else if (value === null) {
      cmp.elem.style.removeProperty(prop);
    }
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
  setPropsValue(cmp, { text: newText });

  return cmp;
};

const updateCmpAnim = (cmp: TCMP, animChain: TAnimChain[]) => {
  removeAnim(cmp, 'cmpAnim');

  if (!animChain?.length) {
    delete cmp.timers.cmpAnim;
    return cmp;
  }

  const animState: TAnimState = {
    setState: (key, value) => (animState.state[key] = value),
    removeState: (key) => delete animState.state[key],
    state: {},
  };

  cmp.timers.cmpAnim = { fn: null, curIndex: 0, animState };

  const timerFn = () => {
    const curIndex = cmp.timers.cmpAnim.curIndex || 0;
    const curAnim = animChain[curIndex];

    let nextIndex: null | number = null;

    // Check previous anim phaseEndFn
    const prevAnim = animChain[curIndex - 1];
    if (prevAnim?.phaseEndFn) {
      const phaseEndResult = cmp.timers.cmpAnim.animState
        ? prevAnim.phaseEndFn(cmp, cmp.timers.cmpAnim.animState)
        : null;
      nextIndex = typeof phaseEndResult === 'number' ? phaseEndResult : null;
      if (nextIndex !== null) {
        cmp.timers.cmpAnim.curIndex = nextIndex;
        timerFn();
      }
    }

    // Check if we are at the end of the chain
    if (curIndex >= animChain.length) {
      return;
    }

    // Check current anim phaseStartFn
    if (curAnim?.phaseStartFn) {
      const phaseStartResult = cmp.timers.cmpAnim.animState
        ? curAnim.phaseStartFn(cmp, cmp.timers.cmpAnim.animState)
        : null;
      nextIndex = typeof phaseStartResult === 'number' ? phaseStartResult : null;
    }

    if (curAnim.class) {
      updateCmpClass(cmp, curAnim.class, curAnim.classAction);
    }

    if (curAnim.style) {
      updateCmpStyle(cmp, curAnim.style);
    }

    cmp.timers.cmpAnim.fn = setTimeout(timerFn, curAnim.duration);

    if (curAnim.gotoIndex !== undefined) {
      cmp.timers.cmpAnim.curIndex =
        typeof curAnim.gotoIndex === 'number'
          ? curAnim.gotoIndex
          : curAnim.gotoIndex(cmp, cmp.timers.cmpAnim.animState);
      return;
    }
    cmp.timers.cmpAnim.curIndex =
      nextIndex !== null ? nextIndex : (cmp.timers.cmpAnim.curIndex || 0) + 1;
  };
  timerFn();

  return cmp;
};

const focusCmp = (cmp: TCMP, focusValueToProps?: boolean) => {
  cmp.elem.focus();
  if (focusValueToProps !== undefined) {
    setPropsValue(cmp, { focus: focusValueToProps });
  }
  return cmp;
};

const blurCmp = (cmp: TCMP, focusValueToProps?: boolean) => {
  cmp.elem.blur();
  if (focusValueToProps !== undefined) {
    setPropsValue(cmp, { focus: focusValueToProps });
  }
  return cmp;
};

const scrollCmpIntoView = (
  cmp: TCMP,
  params?: boolean | ScrollIntoViewOptions,
  timeout?: number
) => {
  if (timeout !== undefined) {
    if (cmp.timers.scrollIntoView)
      clearTimeout(cmp.timers.scrollIntoView.fn as NodeJS.Timeout | undefined);
    const timer = setTimeout(() => {
      cmp.elem.scrollIntoView(params);
      if (cmp.timers.scrollIntoView)
        clearTimeout(cmp.timers.scrollIntoView.fn as NodeJS.Timeout | undefined);
    }, timeout);
    cmp.timers.scrollIntoView = { fn: timer };
  } else {
    cmp.elem.scrollIntoView(params);
  }
  return cmp;
};

const onClickOutsideListener: {
  count: number;
  fns: { [key: string]: { fn: (e: Event) => void; elem: HTMLElement } };
  mainFn: (e: Event) => void;
} = {
  count: 0,
  fns: {},
  mainFn: (e: Event) => {
    const clickedElem = e.target as HTMLElement;
    const fnsKeys = Object.keys(onClickOutsideListener.fns);
    for (let i = 0; i < fnsKeys.length; i++) {
      const listener = onClickOutsideListener.fns[fnsKeys[i]];
      if (!checkMatchingParent(clickedElem, listener.elem)) listener.fn(e);
    }
  },
};

const checkMatchingParent = (elemToCheck: HTMLElement | null, elemTarget: HTMLElement): boolean => {
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

const runAnims = (cmp: TCMP) => {
  if (cmp.props?.anim) updateCmpAnim(cmp, cmp.props?.anim);
};

const removeAnim = (cmp: TCMP, animKey: string) => {
  clearTimeout(cmp.timers[animKey]?.fn as NodeJS.Timeout | undefined);
  delete cmp.timers[animKey];
};

const removeAnims = (cmp: TCMP) => {
  const timerKeys = Object.keys(cmp.timers);
  for (let i = 0; i < timerKeys.length; i++) {
    removeAnim(cmp, timerKeys[i]);
  }
};

const setPropsValue = (cmp: TCMP, props: Partial<TProps>) =>
  (cmp.props = { ...cmp.props, ...props });
