/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react({
      // Also apply JSX transform to plain .js files that contain JSX
      include: ['**/*.{jsx,js}'],
    }),
  ],
  server: {
    port: 3000,
  },
  build: {
    outDir: 'build',
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.js'],
    include: ['src/**/*.test.{js,jsx}'],
    // Apply the React transform to test files
    transformMode: {
      web: [/\.[jt]sx?$/],
    },
  },
});
