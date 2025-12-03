import TabsUnderline from './TabsUnderline';
import TabsPill from './TabsPill';
import type { TabsProps } from './types';

export const Tabs = ({ variant = 'underline', ...props }: TabsProps) => {
  switch (variant) {
    case 'pill':
      return <TabsPill {...props} />;
    case 'underline':
    default:
      return <TabsUnderline {...props} />;
  }
};
