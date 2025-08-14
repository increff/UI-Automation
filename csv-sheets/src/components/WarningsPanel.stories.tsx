import type { Meta, StoryObj } from '@storybook/react';
import { WarningsPanel } from './WarningsPanel';

const meta: Meta<typeof WarningsPanel> = {
  title: 'Components/WarningsPanel',
  component: WarningsPanel,
};
export default meta;

type Story = StoryObj<typeof WarningsPanel>;

export const Empty: Story = {
  args: { warnings: [], headerRowIndex: 1, skipEmptyLines: true },
};

export const WithWarnings: Story = {
  args: { warnings: ['Unterminated quote at row 42', 'Ragged row at 99'], headerRowIndex: 1, skipEmptyLines: true },
};


