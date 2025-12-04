import TabsUnderline from './TabsUnderline';
import TabsPill from './TabsPill';
import type { TabsProps, BaseTabsProps } from './types';

export const Tabs = <TId extends string = string>({ 
  variant = 'underline', 
  ...props 
}: TabsProps<TId>) => {
  // 使用型別斷言確保泛型正確傳遞
  const baseProps = props as BaseTabsProps<TId>;
  
  switch (variant) {
    case 'pill':
      return <TabsPill {...baseProps} />;
    case 'underline':
    default:
      return <TabsUnderline {...baseProps} />;
  }
};
