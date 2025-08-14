import type { Meta, StoryObj } from '@storybook/react';
import { Toolbar } from './Toolbar';

const meta: Meta<typeof Toolbar> = {
  title: 'Components/Toolbar',
  component: Toolbar,
};
export default meta;

type Story = StoryObj<typeof Toolbar>;

export const Default: Story = {
  args: {
    search: '',
    onSearchChange: () => {},
    editMode: false,
    onToggleEdit: () => {},
  },
};


