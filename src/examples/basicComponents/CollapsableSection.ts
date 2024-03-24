import { addStylesToHead, classes, CMP, type TCMP, type TProps } from '../../Lighter/CMP';

export type TCollapsableSection = {
  /** CMP ID. */
  id?: string;

  /** The Collapsable Section content.
   * Required.
   */
  content: string | TProps | TCMP;

  /** Title of the Collapsable Section
   * that is shown in the header.
   */
  title?: string | TProps;

  /** Custom icon to be used in the
   * Collapsable Section header. If no
   * icon is provided, a default CSS icon
   * is used. If icon is false, no icon
   * is rendered.
   */
  icon?: TCMP | TProps | boolean;

  /** When true, only the icon click toggles
   * the section open/closed (the header
   * cannot be then clicked). Default is false.
   */
  onlyIconClick?: boolean;

  /** Whether the Section is closed to
   * start with or not. Default is false
   * (Section is open).
   */
  isClosed?: boolean;

  // @TODO
  /** Whether the content should stay in DOM
   * when the Section is closed. Default is
   * false (content is removed when closed).
   */
  keepContentWhenClosed?: boolean;

  /** Collapsable section classes */
  class?: string | string[];

  /** Opening and closing animation speed in
   * milliseconds. Default is 230ms.
   */
  animSpeed?: number;
};

export type TCollapsableSectionControls = {
  closeSection: () => void;
  openSection: () => void;
};

const DEFAULT_ANIM_SPEED_MS = 230;
const SECTION_MAIN_CLASS = 'collapsableSection';
const SECTION_OPEN_CLASS = 'csIsOpen';
const SECTION_OPENING_CLASS = 'csIsOpening';
const SECTION_CLOSING_CLASS = 'csIsClosing';

export const CollapsableSection = (props: TCollapsableSection) => {
  const {
    id,
    content,
    title,
    icon,
    onlyIconClick,
    isClosed,
    keepContentWhenClosed,
    animSpeed: speed,
  } = props;
  const animSpeed = speed !== undefined ? speed : DEFAULT_ANIM_SPEED_MS;
  let isSectionOpen = Boolean(!isClosed);

  let contentCmp: TCMP | null = null;
  const createContent = () => {
    if ((typeof content === 'object' && 'isCmp' in content) || typeof content === 'string') {
      contentCmp = CMP({ html: () => `<div class="csContent">${content}</div>` });
    } else {
      contentCmp = CMP({ html: () => `<div class="csContent">${CMP(content)}</div>` });
    }
    outerCmp.add(contentCmp);
  };

  const closeSection = () => {
    isSectionOpen = false;
    let speed = animSpeed;
    if (contentCmp) {
      const prevContentHeight = contentCmp.elem.offsetHeight;
      contentCmp.updateStyle({
        maxHeight: null,
        overflow: null,
        height: null,
        transition: null,
      });
      const contentHeight = contentCmp.elem.offsetHeight;
      speed = prevContentHeight !== contentHeight ? animSpeed : animSpeed;
      console.log('SPEED', speed, prevContentHeight, contentHeight);
      if (prevContentHeight) {
        contentCmp.updateStyle({
          height: `${prevContentHeight}px`,
          maxHeight: `${prevContentHeight}px`,
        });
      }
      contentCmp.updateStyle({
        overflow: 'hidden',
        height: `${contentHeight}px`,
        maxHeight: `${contentHeight}px`,
        transition: `max-height ${speed}ms ease-out`,
      });
    }
    outerCmp.updateClass(SECTION_OPEN_CLASS, 'remove');
    outerCmp.updateClass(SECTION_OPENING_CLASS, 'remove');
    outerCmp.updateAnim([
      { duration: 0 },
      {
        phaseStartFn: () => {
          outerCmp.updateClass(SECTION_CLOSING_CLASS, 'add');
          if (contentCmp) contentCmp.updateStyle({ maxHeight: 0 });
        },
        duration: speed,
        phaseEndFn: (cmp) => {
          cmp.updateClass(SECTION_CLOSING_CLASS, 'remove');
          if (contentCmp) {
            contentCmp.updateStyle({
              maxHeight: null,
              overflow: null,
              height: null,
              transition: null,
            });
            if (keepContentWhenClosed) return;
            contentCmp.remove();
            contentCmp = null;
          }
        },
      },
    ]);
  };

  const openSection = () => {
    isSectionOpen = true;
    outerCmp.updateClass(SECTION_CLOSING_CLASS, 'remove');
    let contentHeight = 0;
    let speed = animSpeed;
    if (!contentCmp) createContent();
    if (contentCmp) {
      const prevContentHeight = contentCmp.elem.offsetHeight;
      outerCmp.updateClass(SECTION_OPEN_CLASS, 'add');
      contentCmp.updateStyle({
        maxHeight: null,
        overflow: null,
        height: null,
        transition: null,
      });
      contentHeight = contentCmp.elem.offsetHeight;
      outerCmp.updateClass(SECTION_OPEN_CLASS, 'remove');
      speed = prevContentHeight
        ? ((contentHeight - prevContentHeight) / contentHeight) * animSpeed
        : animSpeed;
      contentCmp.updateStyle({
        overflow: 'hidden',
        height: `${contentHeight}px`,
        maxHeight: `${prevContentHeight || 0}px`,
        transition: `max-height ${speed}ms ease-out`,
      });
    }
    outerCmp.updateAnim([
      { duration: 0 },
      {
        phaseStartFn: () => {
          outerCmp.updateClass(SECTION_OPENING_CLASS, 'add');
          if (contentCmp) contentCmp.updateStyle({ maxHeight: `${contentHeight}px` });
        },
        duration: speed,
        phaseEndFn: (cmp) => {
          cmp.updateClass(SECTION_OPEN_CLASS, 'add');
          cmp.updateClass(SECTION_OPENING_CLASS, 'remove');
          if (contentCmp)
            contentCmp.updateStyle({
              maxHeight: null,
              overflow: null,
              height: null,
              transition: null,
            });
        },
      },
    ]);
  };

  const onClick = (e: Event) => {
    e.stopPropagation();
    if (isSectionOpen) {
      closeSection();
      return;
    }
    openSection();
  };

  let iconCmp: TCMP | string = '';
  if (typeof icon === 'object' && 'isCmp' in icon) {
    iconCmp = icon;
  } else if (icon !== false) {
    iconCmp = CMP({
      tag: 'button',
      ...(icon !== true ? icon : {}),
      onClick,
    });
  }
  if (iconCmp && typeof iconCmp !== 'string') {
    iconCmp.updateClass('csToggleIcon', 'add');
    iconCmp.updateStyle({ transition: 'all 230ms ease' });
  }

  const headerCmp = CMP({
    html: () => `<header class="csHeader"${icon === false ? ' tabindex="0"' : ''}>
  ${title ? `<h4>${title}</h4>` : ''}
  ${iconCmp}
</header>`,
    ...(!onlyIconClick ? { onClick } : {}),
  });

  const outerCmp = CMP(
    {
      id,
      html: () => `<section class="${classes(
        props.class,
        SECTION_MAIN_CLASS,
        isClosed ? null : SECTION_OPEN_CLASS,
        keepContentWhenClosed ? 'keepSectionContent' : null
      ).join(' ')}">
  ${headerCmp}
</section>`,
    },
    CollapsableSection,
    props
  );

  if (!isClosed || keepContentWhenClosed) {
    createContent();
  }

  const controls: TCollapsableSectionControls = { closeSection, openSection };
  outerCmp.controls = controls;

  addStylesToHead('collapsableSection', css);

  return outerCmp;
};

const css = `
.csHeader {
  border: 1px solid #333;
  border-radius: 4px;
  padding: 8px 16px;
  position: relative;
}
.${SECTION_OPENING_CLASS} .csHeader,
.${SECTION_CLOSING_CLASS} .csHeader {
  border-radius: 4px 4px 0 0;
}
.csIsOpen .csHeader {
  border-radius: 4px 4px 0 0;
}
.csHeader h4 {
  margin: 0;
  padding-right: 32px;
}
.csToggleIcon {
  position: absolute;
  width: 20px;
  height: 20px;
  top: 50%;
  margin-top: -10px;
  right: 16px;
  border-radius: 50%;
  border: none;
  background: none;
}
.csToggleIcon:before,
.csToggleIcon:after {
  display: block;
  content: "";
  width: 2px;
  height: 8px;
  background-color: #333;
  position: absolute;
  top: 6px;
  transition: inherit;
}
.csToggleIcon:before {
  left: 6px;
  transform: rotate(-135deg);
}
.csToggleIcon:after {
  right: 6px;
  transform: rotate(135deg);
}
.${SECTION_OPEN_CLASS} .csToggleIcon:before,
.${SECTION_OPENING_CLASS} .csToggleIcon:before {
  transform: rotate(-45deg);
}
.${SECTION_OPEN_CLASS} .csToggleIcon:after,
.${SECTION_OPENING_CLASS} .csToggleIcon:after {
  transform: rotate(45deg);
}
.csContent {
  box-sizing: border-box;
  border: 1px solid #333;
  border-top: none;
  border-radius: 0 0 4px 4px;
  padding: 0;
  height: 0;
  max-height: 0;
  overflow: hidden;
  position: relative;
}
.${SECTION_OPEN_CLASS} .csContent {
  height: auto;
  max-height: none;
  overflow: visible;
}
.csContent:before {
  /* Fixes margin collapsing, if the first child
  would have a top-margin defined */
  display: block;
  content: "";
  width: 100%;
  height: 1px;
}
`;
