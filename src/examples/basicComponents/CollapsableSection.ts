import { classes, CMP, type TCMP, type TProps } from '../../Lighter/CMP';

export type TCollapsableSection = {
  /** CMP ID. */
  id?: string;

  // @TODO
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

  // @TODO
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
  const SECTION_OPEN_CLASS = 'sectionIsOpen';
  const { id, content, title, icon, isClosed, keepContentWhenHidden } = props;

  let isSectionOpen = Boolean(!isClosed);

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
    console.log('TOGGLE SECTION', isSectionOpen);
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
      class: classes(icon !== true ? icon?.class : null, 'sectionToggleIcon'),
      onClick,
    });
  }

  const headerCmp = CMP({
    html: () => `<header class="cSectionHeader"${icon === false ? ' tabindex="0"' : ''}>
  ${title ? `<h4>${title}</h4>` : ''}
  ${iconCmp}
</header>`,
    onClick,
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

  let contentCmp: TCMP | null = null;
  const createContent = () => {
    if (typeof content === 'object' && 'isCmp' in content) {
      contentCmp = content;
    } else if (typeof content === 'string') {
      contentCmp = CMP({ text: content });
    } else {
      contentCmp = CMP(content);
    }
    outerCmp.add(contentCmp);
  };

  if (!isClosed || keepContentWhenHidden) {
    createContent();
  }

  const controls: TCollapsableSectionControls = { closeSection, openSection };
  outerCmp.controls = controls;

  return outerCmp;
};
