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
  keepContentWhenHidden?: boolean;

  /** Collapsable section classes */
  class?: string | string[];
};

export type TCollapsableSectionControls = {
  closeSection: () => void;
  openSection: () => void;
};

export const CollapsableSection = (props: TCollapsableSection) => {
  const SECTION_OPEN_CLASS = 'csIsOpen';
  const { id, content, title, icon, onlyIconClick, isClosed, keepContentWhenHidden } = props;

  let isSectionOpen = Boolean(!isClosed);

  let contentCmp: TCMP | null = null;
  const createContent = () => {
    if (typeof content === 'object' && 'isCmp' in content) {
      contentCmp = content;
    } else if (typeof content === 'string') {
      contentCmp = CMP({ text: content });
    } else {
      contentCmp = CMP(content);
    }
    contentCmp.updateClass('csContent', 'add');
    outerCmp.add(contentCmp);
  };

  const closeSection = () => {
    // @TODO: add animation
    outerCmp.updateClass(SECTION_OPEN_CLASS, 'remove');
    isSectionOpen = false;
    if (keepContentWhenHidden) return;
    if (contentCmp) contentCmp.remove();
    contentCmp = null;
  };

  const openSection = () => {
    if (!contentCmp) createContent();
    outerCmp.updateClass(SECTION_OPEN_CLASS, 'add');
    isSectionOpen = true;
    // @TODO: add animation
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
  if (iconCmp && typeof iconCmp !== 'string') iconCmp.updateClass('csToggleIcon', 'add');

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
        'collapsableSection',
        isClosed ? null : SECTION_OPEN_CLASS,
        keepContentWhenHidden ? 'keepSectionContent' : null
      ).join(' ')}">
  ${headerCmp}
</section>`,
    },
    CollapsableSection,
    props
  );

  if (!isClosed || keepContentWhenHidden) {
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
}
.csToggleIcon:before {
  left: 6px;
  transform: rotate(45deg);
}
.csToggleIcon:after {
  right: 6px;
  transform: rotate(-45deg);
}
.csIsOpen .csToggleIcon:before {
  transform: rotate(-45deg);
}
.csIsOpen .csToggleIcon:after {
  transform: rotate(45deg);
}
.csContent {
  border: 1px solid #333;
  border-top: none;
  border-radius: 0 0 4px 4px;
  padding: 16px;
}
`;
