import { defineConfig } from 'vite';

// Dev proxy to forward requests to the remote server and avoid hotlink/referrer blocking
export default defineConfig({
  server: {
    proxy: {
      // Local path /atmosproxy/surfabilidade will be proxied to
      // https://dev.atmosmarine.com/atmosmarine/oceanpact/surfabilidade
      '/atmosproxy/surfabilidade': {
        target: 'https://dev.atmosmarine.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/atmosproxy\/surfabilidade/, '/atmosmarine/oceanpact/surfabilidade')
      }
      ,
      '/atmosproxy/painel_surfabilidade.png': {
        target: 'https://dev.atmosmarine.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/atmosproxy\/painel_surfabilidade.png/, '/public/produtos/oceanpact_surf/painel_surfabilidade.png')
      }
    }
  }
});
