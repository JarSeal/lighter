import {
  addStylesToHead,
  classes,
  CMP,
  createNewId,
  type TCMP,
  type TProps,
} from '../../Lighter/CMP';

export type TTooltip = {
  /** CMP ID. */
  id?: string;

  /** The trigger that when hovered (or clicked) will
   * trigger the tooltip. Required prop. */
  trigger: string | TProps;

  /** The actual Tooltip content. Default is undefined. */
  tooltip?: string | TProps | TCMP;

  /** Wrapper props */
  wrapper?: TProps;

  /** Whether the tooltip shows on hover or not. If the
   * value is true, then a CSS hover is used
   * (autoAlign will not then work). Default is false. */
  showOnHover?: boolean;

  /** Whether outside click is disabled or not.
   * Default is false. */
  disableOutsideClick?: boolean;

  /** Whether the tooltip has a close button or not.
   * Possible values are 'left', 'right', and
   * undefined | null | boolean. This will not be rendered
   * if the showOnHover is enabled. Default is undefined.
   */
  tooltipCloseButton?: 'left' | 'right' | null | boolean;

  /** How the Tooltip should align with the trigger.
   * Default is 'top-center', but if autoAlign is on,
   * then the alignment could change whether the
   * Tooltip has enough space to show fully or not. */
  align?:
    | 'top-right'
    | 'top-center'
    | 'top-left'
    | 'bottom-right'
    | 'bottom-center'
    | 'bottom-left';

  /** Whether to auto align if the Tooltip does not
   * have enough space to show fully and will then change
   * the positioning automatically. This does not work
   * for  Default is true. */
  autoAlign?: boolean;

  /** Whether the tooltip is showing after init load.
   * Default is false. */
  isShowing?: boolean;

  /** Tooltip minimum width (CSS value).
   * Default can be set with setDefaultTooltipWidth util
   * (160px). */
  width?: string;

  /** Tooltip classes */
  class?: string | string[];
};

export const checkIfElemFullyInView = (elem: HTMLElement) => {
  const rect = elem.getBoundingClientRect();
  const viewBottom = window.innerHeight || document.documentElement.clientHeight;
  const viewRight = window.innerWidth || document.documentElement.clientWidth;
  const isTopInView = rect.top >= 0,
    isLeftInView = rect.left >= 0,
    isBottomInView = rect.bottom <= viewBottom,
    isRightInView = rect.right <= viewRight;
  return {
    isFullyInView: isTopInView && isLeftInView && isBottomInView && isRightInView,
    isTopInView,
    isLeftInView,
    isBottomInView,
    isRightInView,
  };
};

export const setDefaultTooltipWidth = (width: string) => (defaultWidth = width);
let defaultWidth: null | string = '160px';
const DEFAULT_BG_COLOR = '#fff';
const ANIM_SPEED_MS = 170;

export const Tooltip = (props: TTooltip) => {
  const {
    id: idProp,
    trigger,
    tooltip,
    wrapper,
    showOnHover,
    disableOutsideClick,
    tooltipCloseButton,
    align,
    autoAlign,
    isShowing,
    width,
  } = props;
  const outerCmpId = idProp || createNewId();
  const triggerId = outerCmpId + '-trigger';
  const tooltipId = createNewId();
  let tooltipCmp: TCMP | null = null;
  let phase: 'hidden' | 'showing' | 'adding' | 'removing' = 'hidden';
  let tooltipShowing = false;

  const tooltipCmpCommonProps: TProps = {
    id: tooltipId,
    idAttr: true,
    style: { width: width || defaultWidth },
  };

  const hideTooltip = () => {
    if (!tooltipCmp) return;
    phase = 'removing';
    tooltipShowing = false;
    tooltipCmp.updateAnim([
      { duration: 100, class: 'hideTooltip', classAction: 'add' },
      {
        duration: ANIM_SPEED_MS,
        class: 'showTooltip',
        classAction: 'remove',
        phaseEndFn: (cmp) => {
          cmp.remove();
          tooltipCmp = null;
          phase = 'hidden';
        },
      },
    ]);
    outerCmp.updateClass('tooltipShowing', 'remove');
  };

  const showTooltip = () => {
    if (!tooltip) return;
    phase = 'adding';
    tooltipShowing = true;
    let tooltipCmpCreated = false;
    const closeButton =
      tooltipCloseButton && !showOnHover
        ? CMP({
            html: `<button class="tooltipClose ${
              tooltipCloseButton === 'left' ? 'left' : 'right'
            }"></button>`,
            onClick: () => hideTooltip(),
          })
        : '';
    if (!tooltipCmp) {
      tooltipCmp = CMP(
        typeof tooltip === 'string'
          ? {
              ...tooltipCmpCommonProps,
              html: () =>
                `<div class="tooltipOuter"><div class="tooltipInner${
                  tooltipCloseButton ? ' hasCloseButton' : ''
                }">${closeButton}${tooltip}</div></div>`,
            }
          : {
              ...tooltipCmpCommonProps,
              html: () =>
                `<div class="tooltipOuter"><div class="tooltipInner${
                  tooltipCloseButton ? ' hasCloseButton' : ''
                }">${closeButton}${
                  tooltip && 'isCmp' in tooltip ? tooltip : CMP(tooltip)
                }</div></div>`,
            }
      );
      tooltipCmpCreated = true;
    } else {
      tooltipCmp.updateClass(['left', 'right', 'center', 'top', 'bottom', 'hideTooltip'], 'remove');
    }

    const alignClasses = align ? align.split('-') : ['top', 'center'];
    tooltipCmp.updateClass(alignClasses, 'add');
    if (tooltipCmpCreated) outerCmp.add(tooltipCmp);

    if (autoAlign !== false) {
      const elemVisibility = checkIfElemFullyInView(tooltipCmp.elem);
      if (!elemVisibility.isFullyInView) {
        if (!elemVisibility.isLeftInView) {
          tooltipCmp.updateClass(['right', 'center'], 'remove');
          alignClasses[1] = 'left';
        } else if (!elemVisibility.isRightInView) {
          tooltipCmp.updateClass(['left', 'center'], 'remove');
          alignClasses[1] = 'right';
        }
        if (!elemVisibility.isTopInView) {
          tooltipCmp.updateClass('top', 'remove');
          alignClasses[0] = 'bottom';
        } else if (!elemVisibility.isBottomInView) {
          tooltipCmp.updateClass('bottom', 'remove');
          alignClasses[0] = 'top';
        }
        tooltipCmp.updateClass(alignClasses, 'add');
      }
    }

    tooltipCmp.updateAnim([
      {
        duration: ANIM_SPEED_MS,
        class: 'showTooltip',
        classAction: 'add',
        phaseEndFn: () => {
          phase = 'showing';
        },
      },
    ]);
    outerCmp.updateClass('tooltipShowing', 'add');
  };

  const triggerCmpProps =
    typeof trigger === 'string'
      ? {
          text: trigger,
        }
      : trigger;
  triggerCmpProps.class =
    typeof triggerCmpProps.class === 'string'
      ? [triggerCmpProps.class, 'tooltipTrigger']
      : [...(triggerCmpProps.class ? triggerCmpProps.class : []), 'tooltipTrigger'];
  const triggerCmp = CMP(
    {
      tag: showOnHover ? 'span' : 'button',
      ...triggerCmpProps,
      ...(tooltip && !showOnHover
        ? {
            onClick: (e) => {
              const target = e.target as HTMLElement;
              if (target === triggerCmp.elem && (phase === 'showing' || phase === 'adding')) {
                return hideTooltip();
              }
              showTooltip();
            },
          }
        : {}),
      ...(!showOnHover && !disableOutsideClick
        ? {
            onClickOutside: (e) => {
              const elem = e.target as HTMLElement;
              if (outerCmp.elem.contains(elem)) return;
              if (phase === 'showing') hideTooltip();
            },
          }
        : {}),
      id: triggerId,
    },
    Tooltip,
    props
  );

  let outerClasses = classes(props.class);
  if (wrapper?.class) {
    outerClasses = typeof wrapper.class === 'string' ? [wrapper.class] : wrapper.class;
    if (showOnHover) outerClasses.push('hoverable');
  } else if (showOnHover) {
    outerClasses.push('hoverable');
  }
  const outerCmp = CMP({
    ...wrapper,
    html: () =>
      `<span class="tooltipWrapper"${showOnHover ? ` tabindex="0"` : ''}>${triggerCmp}</span>`,
    class: outerClasses,
    id: outerCmpId,
  });

  addStylesToHead('tooltip', css);

  if ((isShowing || showOnHover) && tooltip) {
    tooltipShowing = true;
    setTimeout(() => {
      showTooltip();
    }, 0);
  }

  if (!showOnHover) {
    outerCmp.controls = {
      showTooltip,
      hideTooltip,
      isShowing: tooltipShowing,
    } as TooltipControls;
  }

  return outerCmp;
};

export type TooltipControls = {
  showTooltip: () => void;
  hideTooltip: () => void;
  isShowing: boolean;
};

// @TODO
// add controls to CMP (to carry values and functions that can then be used outside the CMP like in events)

const css = `
.tooltipWrapper {
  position: relative;
  display: inline-block;
}
.tooltipWrapper > .tooltipOuter,
.tooltipWrapper.hoverable > .tooltipOuter {
  position: absolute;
  max-width: 100vw;
  overflow: visible;
  opacity: 0;
  pointer-events: none;
  transition: opacity ${ANIM_SPEED_MS}ms ease-out;
  z-index: 50;
}
.tooltipWrapper.hoverable > .tooltipOuter {
  pointer-events: none;
}
.tooltipWrapper.hoverable:hover > .tooltipOuter,
.tooltipWrapper.hoverable:focus > .tooltipOuter,
.tooltipOuter.showTooltip,
.tooltipOuter.hideTooltip {
  opacity: 1;
  pointer-events: all;
}
.tooltipOuter.hideTooltip {
  opacity: 0;
}
.tooltipOuter > .tooltipInner {
  background-color: ${DEFAULT_BG_COLOR};
  border-radius: 4px;
  box-shadow: 0 3px 18px rgba(0,0,0,0.2);
  padding: 8px;
  border: 1px solid #333;
}
.tooltipOuter > .tooltipInner:before {
  display: block;
  content: "";
  background: transparent;
  position: absolute;
  width: 1px;
  height: 1px;
  border: 8px solid transparent;
}
.tooltipOuter > .tooltipInner:after {
  display: block;
  content: "";
  background: transparent;
  position: absolute;
  width: 1px;
  height: 1px;
  border: 8px solid transparent;
}
.tooltipOuter.top {
  top: auto;
  bottom: 100%;
}
.tooltipOuter.top > .tooltipInner {
  margin-bottom: 10px;
}
.tooltipOuter.top > .tooltipInner:before {
  top: 100%;
  bottom: auto;
  border-top-color: #333;
  margin-top: -10px;
}
.tooltipOuter.top > .tooltipInner:after {
  top: 100%;
  bottom: auto;
  border-top-color: ${DEFAULT_BG_COLOR};
  margin-top: -11px;
}
.tooltipOuter.bottom {
  top: 100%;
  bottom: auto;
}
.tooltipOuter.bottom > .tooltipInner {
  margin-top: 10px;
}
.tooltipOuter.bottom > .tooltipInner:before {
  top: auto;
  bottom: 100%;
  border-bottom-color: #333;
  margin-bottom: -10px;
}
.tooltipOuter.bottom > .tooltipInner:after {
  top: auto;
  bottom: 100%;
  border-bottom-color: ${DEFAULT_BG_COLOR};
  margin-bottom: -11px;
}
.tooltipOuter.center {
  left: 50%;
  right: auto;
  transform: translateX(-50%);
}
.tooltipOuter.center > .tooltipInner:before,
.tooltipOuter.center > .tooltipInner:after {
  left: 50%;
  right: auto;
  transform: translateX(-50%);
}
.tooltipOuter.left {
  left: 50%;
  right: auto;
  transform: translateX(-16px);
}
.tooltipOuter.left > .tooltipInner:before,
.tooltipOuter.left > .tooltipInner:after {
  left: 8px;
  right: auto;
}
.tooltipOuter.right {
  left: auto;
  right: 50%;
  transform: translateX(16px);
}
.tooltipOuter.right > .tooltipInner:before,
.tooltipOuter.right > .tooltipInner:after {
  left: auto;
  right: 8px;
}
.tooltipOuter > .tooltipInner.hasCloseButton {
  padding-top: 20px;
}
.tooltipClose {
  width: 16px;
  height: 16px;
  border: none;
  outline: none;
  background: transparent;
  border-radius: 0;
  position: absolute;
  top: 13px;
}
.tooltipClose.right {
  right: 3px;
}
.tooltipClose.left {
  left: 3px;
}
.tooltipClose:before,
.tooltipClose:after {
  display: block;
  content: "";
  position: absolute;
  left: 50%;
  top: 2px;
  width: 1px;
  height: 12px;
  background-color: #333;
}
.tooltipClose:before {
  transform: rotate(45deg);
}
.tooltipClose:after {
  transform: rotate(-45deg);
}`;
