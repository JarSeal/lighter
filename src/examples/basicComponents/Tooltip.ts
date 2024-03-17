import { CMP, createNewId, TCMP, type TProps } from '../../Lighter/CMP';

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

  /* Whether the trigger needs to be clicked or not
  to show the Tooltip. If false, then a hover and
  a focus (it will be a button) will open the tooltip.
  Default is true. */
  showOnClick?: boolean;

  // @TODO
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

  // @TODO
  /* Whether to auto align if the Tooltip does not
  have enough space to show fully. Default is true. */
  autoAlign?: boolean;

  // @TODO
  /* Whether the tooltip is showing after init load.
  Default is false. */
  isShowing?: boolean;

  // @TODO
  /* Tooltip minimum width (CSS value). Default is 200px. */
  minWidth?: string;
};

export const checkIfFullyVisible = (elem: HTMLElement) => {
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

export const Tooltip = (props: TTooltip) => {
  const { id: idProp, tag, trigger, tooltip, showOnClick, align, isShowing, minWidth } = props;
  const triggerId = idProp || createNewId();
  const tooltipId = createNewId();
  let tooltipCmp: TCMP | null = null;

  const tooltipCmpCommonProps = {
    id: tooltipId,
    idAttr: true,
    class: 'tooltip',
  };

  const hideTooltip = () => {
    if (tooltipCmp) {
      tooltipCmp.remove();
      tooltipCmp = null;
    }
  };

  const showTooltip = (cmp: TCMP) => {
    if (tooltipCmp) {
      tooltipCmp.remove();
    }
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
    const alignClasses = align ? align.split('-') : ['top', 'center'];
    tooltipCmp.updateClass(alignClasses, 'add');
    cmp.add(tooltipCmp);
    const elemVisibility = checkIfFullyVisible(tooltipCmp.elem);
    if (!elemVisibility.isFullyInView) {
      if (!elemVisibility.isLeftInView) {
        tooltipCmp.updateClass(alignClasses[1], 'remove');
        alignClasses[1] = 'left';
      } else if (!elemVisibility.isRightInView) {
        tooltipCmp.updateClass(alignClasses[1], 'remove');
        alignClasses[1] = 'right';
      }
      if (!elemVisibility.isTopInView) {
        tooltipCmp.updateClass(alignClasses[0], 'remove');
        alignClasses[0] = 'bottom';
      } else if (!elemVisibility.isBottomInView) {
        tooltipCmp.updateClass(alignClasses[0], 'remove');
        alignClasses[0] = 'top';
      }
      tooltipCmp.updateClass(alignClasses, 'add');
    }
  };

  const triggerCmpProps =
    typeof trigger === 'string'
      ? {
          text: trigger,
        }
      : trigger;
  const outerCmp = CMP(
    {
      ...(showOnClick !== false ? { tag: 'button' } : { tag: 'span' }),
      ...triggerCmpProps,
      class:
        typeof triggerCmpProps.class === 'string'
          ? [triggerCmpProps.class, 'tooltipTrigger']
          : [...(triggerCmpProps.class ? triggerCmpProps.class : []), 'tooltipTrigger'],
      ...(tooltip && showOnClick !== false ? { onClick: (_, cmp) => showTooltip(cmp) } : {}),
      ...(showOnClick !== false ? { onClickOutside: () => hideTooltip() } : {}),
      // @TODO: add hover listener
      ...(!showOnClick ? {} : {}),
      ...(tag ? { tag } : {}),
      style: { position: 'relative' },
      id: triggerId,
    },
    Tooltip,
    props
  );
  outerCmp.add(
    CMP({
      html: `<style type="text/css">
  .tooltip {
    position: absolute;
    background-color: #fff;
    border-radius: 4px;
    max-width: 100vw;
    min-width: ${minWidth || '160px'};
    box-shadow: 0 3px 18px rgba(0,0,0,0.2);
    padding: 8px;
    border: 1px solid #333;
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
  }
</style>`,
    })
  );

  if (isShowing) showTooltip(outerCmp);

  return outerCmp;
};
