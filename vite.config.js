import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const [owner, repositoryName] = (process.env.GITHUB_REPOSITORY ?? '').split('/');
const isUserOrOrgPage = repositoryName?.toLowerCase() === `${owner?.toLowerCase()}.github.io`;
const githubPagesBase = process.env.GITHUB_ACTIONS && repositoryName && !isUserOrOrgPage
  ? `/${repositoryName}/`
  : '/';

export default defineConfig({
  base: process.env.VITE_BASE_PATH ?? githubPagesBase,
  plugins: [react()],
  server: {
    host: '0.0.0.0',
  },
  build: {
    chunkSizeWarningLimit: 550,
  },
});
