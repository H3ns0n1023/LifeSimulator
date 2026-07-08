import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom', // 改为 jsdom 以获得 localStorage
    include: ['tests/**/*.test.ts'],
  },
});
