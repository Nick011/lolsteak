import type { Preview } from '@storybook/nextjs-vite'
import '../src/app/globals.css'

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: 'soft-glow',
      values: [
        {
          name: 'soft-glow',
          value: 'rgb(15, 10, 31)',
        },
        {
          name: 'soft-glow-surface',
          value: 'rgb(26, 16, 48)',
        },
        {
          name: 'white',
          value: '#ffffff',
        },
      ],
    },
  },
}

export default preview
