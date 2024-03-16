import { CMP, createNewId, type TProps } from '../../Lighter/CMP';

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

  /* The actual Tooltip content. Required prop. */
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
};

export const Tooltip = (props: TTooltip) => {
  const { id: idProp, tag, trigger, tooltip, showOnClick } = props;
  let showTooltip = false;
  const id = idProp || createNewId();

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
      // @TODO: add hover listener
      ...(!showOnClick ? {} : {}),
    },
    Tooltip,
    props
  );

  return outerCmp;
};
