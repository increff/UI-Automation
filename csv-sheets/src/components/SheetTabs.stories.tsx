import type { Meta, StoryObj } from '@storybook/react';
import { SheetTabs } from './SheetTabs';

const meta: Meta<typeof SheetTabs> = {
  title: 'Components/SheetTabs',
  component: SheetTabs,
};
export default meta;

type Story = StoryObj<typeof SheetTabs>;

export const FewTabs: Story = {
  args: {
    tabs: [
      { id: '1', name: 'Sheet 1' },
      { id: '2', name: 'Sheet 2', dirty: true },
    ],
    activeId: '1',
  },
};

export const ManyTabs: Story = {
  args: {
    tabs: Array.from({ length: 12 }, (_, i) => ({ id: String(i), name: `Sheet ${i + 1}` })),
    activeId: '5',
  },
};


