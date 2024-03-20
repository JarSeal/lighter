import { addStylesToHead, CMP, createNewId, type TCMP, type TProps } from '../../Lighter/CMP';

export type TTooltip = {
  /* Id to be used for the "for" attribute
  in label and for the input element ID. Default is
  input_[id] that will be created for the input CMP. */
  id?: string;

  /* Tag to overwrite the default tags. Defaults are
  'button' for clicks and 'span' for hovers. */
  tag?: string;

  /* The trigger that when hovered (or clicked) will
  trigger the tooltip. Required prop. */
  trigger: string | TProps;

  /* The actual Tooltip content. Default is undefined. */
  tooltip?: string | TProps;

  /* Whether the tooltip shows on hover or not. If the
  value is true, then a javascript listener for hover is
  used. If the value is 'css', then a CSS hover is used
  (autoAlign will not work). Default is false. */
  showOnHover?: boolean | 'css';

  /* How the Tooltip should align with the trigger.
  Default is 'top-center', but if autoAlign is on,
  then the alignment could change whether the
  Tooltip has enough space to show fully or not. */
  align?:
    | 'top-right'
    | 'top-center'
    | 'top-left'
    | 'bottom-right'
    | 'bottom-center'
    | 'bottom-left';

  /* Whether to auto align if the Tooltip does not
  have enough space to show fully and will then change
  the positioning automatically. This does not work
  for  Default is true. */
  autoAlign?: boolean;

  /* Whether the tooltip is showing after init load.
  Default is false. */
  isShowing?: boolean;

  /* Tooltip minimum width (CSS value). Default is defined below. */
  width?: string;
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

const DEFAULT_WIDTH = '160px';
const ANIM_SPEED_MS = 170;

export const Tooltip = (props: TTooltip) => {
  const {
    id: idProp,
    tag,
    trigger,
    tooltip,
    showOnHover,
    align,
    autoAlign,
    isShowing,
    width,
  } = props;
  const triggerId = idProp || createNewId();
  const tooltipId = createNewId();
  let tooltipCmp: TCMP | null = null;
  let phase: 'hidden' | 'showing' | 'adding' | 'removing' = 'hidden';

  const tooltipCmpCommonProps: TProps = {
    id: tooltipId,
    idAttr: true,
    class: 'tooltip',
    style: { width: width || DEFAULT_WIDTH },
  };

  const hideTooltip = () => {
    if (!tooltipCmp) return;
    phase = 'removing';
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

  const showTooltip = (cmp: TCMP) => {
    if (!tooltip) return;
    phase = 'adding';
    let tooltipCmpCreated = false;
    if (!tooltipCmp) {
      tooltipCmp = CMP(
        typeof tooltip === 'string'
          ? {
              ...tooltipCmpCommonProps,
              text: tooltip,
            }
          : {
              ...tooltipCmpCommonProps,
              ...tooltip,
            }
      );
      tooltipCmpCreated = true;
    } else {
      tooltipCmp.updateClass(['left', 'right', 'center', 'top', 'bottom', 'hideTooltip'], 'remove');
    }

    const alignClasses = align ? align.split('-') : ['top', 'center'];
    tooltipCmp.updateClass(alignClasses, 'add');
    if (tooltipCmpCreated) cmp.add(tooltipCmp);

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
  if (showOnHover === 'css') triggerCmpProps.class.push('hoverable');
  const outerCmp = CMP(
    {
      ...(!showOnHover ? { tag: 'button' } : { tag: 'span' }),
      ...triggerCmpProps,
      ...(tooltip && !showOnHover
        ? {
            onClick: (e, cmp) => {
              const target = e.target as HTMLElement;
              if (target === outerCmp.elem && (phase === 'showing' || phase === 'adding')) {
                return hideTooltip();
              }
              showTooltip(cmp);
            },
          }
        : {}),
      ...(!showOnHover
        ? {
            onClickOutside: (e) => {
              const elem = e.target as HTMLElement;
              if (outerCmp.elem.contains(elem)) return;
              hideTooltip();
            },
          }
        : {}),
      ...(showOnHover === true
        ? { onHover: (_, cmp) => showTooltip(cmp), onHoverOutside: () => hideTooltip() }
        : {}),
      ...(tag ? { tag } : {}),
      style: { position: 'relative' },
      id: triggerId,
    },
    Tooltip,
    props
  );

  addStylesToHead('tooltip', css);

  if ((isShowing || showOnHover === 'css') && tooltip) {
    setTimeout(() => {
      showTooltip(outerCmp);
    }, 0);
  }

  return outerCmp;
};

// @TODO
// add userData to CMP (to carry values and functions that can then be used outside the CMP like in events)
// make outerCmp like this:
// <div class="tooltipWrapper tooltipShowing">
//  <button class="tooltipTrigger">Trigger</button>
//  <div class="tooltipOuter left top showTooltip">
//    <div class="tooltipInner">Actual tooltip content</div>
//  </div>
// </div>

const css = `
.tooltipTrigger {
  display: inline-block;
}
.tooltipTrigger .tooltip,
.tooltipTrigger.hoverable .tooltip {
  position: absolute;
  background-color: #fff;
  max-width: 100vw;
  border-radius: 4px;
  box-shadow: 0 3px 18px rgba(0,0,0,0.2);
  padding: 8px;
  border: 1px solid #333;
  overflow: visible;
  opacity: 0;
  pointer-events: none;
  transition: opacity ${ANIM_SPEED_MS}ms ease-out;
}
.tooltipTrigger.hoverable .tooltip {
  pointer-events: none;
}
.tooltipTrigger.hoverable:hover .tooltip,
.tooltip.showTooltip,
.tooltip.hideTooltip {
  opacity: 1;
  pointer-events: all;
}
.tooltip.hideTooltip {
  opacity: 0;
}
.tooltip:before {
  display: block;
  content: "";
  background: transparent;
  position: absolute;
  width: 1px;
  height: 1px;
  border: 8px solid transparent;
}
.tooltip.top {
  top: auto;
  bottom: 100%;
  margin-bottom: 10px;
}
.tooltip.top:before {
  top: 100%;
  bottom: auto;
  border-top-color: #333;
}
.tooltip.bottom {
  top: 100%;
  bottom: auto;
  margin-top: 10px;
}
.tooltip.bottom:before {
  top: auto;
  bottom: 100%;
  border-bottom-color: #333;
}
.tooltip.center {
  left: 50%;
  right: auto;
  transform: translateX(-50%);
}
.tooltip.center:before {
  left: 50%;
  right: auto;
  transform: translateX(-50%);
}
.tooltip.left {
  left: 50%;
  right: auto;
  transform: translateX(-16px);
}
.tooltip.left:before {
  left: 8px;
  right: auto;
}
.tooltip.right {
  left: auto;
  right: 50%;
  transform: translateX(16px);
}
.tooltip.right:before {
  left: auto;
  right: 8px;
}`;
