import { CMP, type TAttr, type TProps, type TStyle } from '../../Lighter/CMP';

export type TTooltip = {
  /* Id to be used for the "for" attribute
  in label and for the input element ID. Default is
  input_[id] that will be created for the input CMP. */
  id?: string;

  /* Whether to add the for="id" attribute and the
  input's id attribute to the elements. Default is false. */
  idAttr?: boolean;

  // @TODO: add to other example components
  /* Root elem basic attributes. Defaults
  are undefined. */
  class?: string | string[];
  style?: TStyle;
  attr?: TAttr;

  /* The trigger that when hovered (or clicked) will
  trigger the tooltip. Required prop. */
  trigger: string | TProps;

  /* The actual Tooltip content. Required prop. */
  tooltip?: string | TProps;

  /* Whether the trigger needs to be clicked or not
  to show the Tooltip. If false, then a hover and
  a focus (it will be a button) will open the tooltip.
  Default is true. */
  showOnClick?: boolean;
};

export const Tooltip = <TTooltip>(props: TTooltip) => {
  const { id, idAttr, class: classValues, style, attr, trigger, tooltip, showOnClick } = props;
  let showTooltip = false;

  const triggerCmpProps =
    typeof trigger === 'string'
      ? {
          text: trigger,
        }
      : trigger;
  const outerCmp = CMP<TTooltip>({
    ...triggerCmpProps,
    ...(showOnClick !== false ? { tag: 'button' } : { tag: 'span' }),
    ...(showOnClick !== false
      ? {
          onClick: () => {
            console.log('TRIGGER_CLICK');
            if (showTooltip) {
              showTooltip = false;
            } else {
              showTooltip = true;
            }
          },
        }
      : {}),
    wrapper: Tooltip,
    wrapperProps: props,
  });

  return outerCmp;
};
