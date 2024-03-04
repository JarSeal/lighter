import { CMP, type TCMPProps } from '../Lighter/CMP';
import { Nav } from './Nav';

export const Base = (props: TCMPProps) => {
  const baseCmp = CMP(props);
  baseCmp.add(Nav());
  return baseCmp;
};
