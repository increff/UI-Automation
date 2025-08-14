import type { Meta, StoryObj } from '@storybook/react';
import { GridView } from './GridView';

const meta: Meta<typeof GridView> = {
  title: 'Components/GridView',
  component: GridView,
};
export default meta;

type Story = StoryObj<typeof GridView>;

export const SmallDataset: Story = {
  args: {
    headers: ['A', 'B', 'C'],
    rows: [
      ['1', '2', '3'],
      ['4', '5', '6'],
      ['7', '8', '9'],
    ],
    performanceMode: false,
  },
};

export const PerformanceMode: Story = {
  args: {
    headers: Array.from({ length: 10 }, (_, i) => `C${i}`),
    rows: Array.from({ length: 50 }, () => Array.from({ length: 10 }, () => 'x')),
    performanceMode: true,
  },
};


