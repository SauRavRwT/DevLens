import { defineConfig } from "vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";

// Simple plugin to inject the Content Security Policy meta tag in production builds
const cspPlugin = () => {
  return {
    name: "html-csp-injection",
    transformIndexHtml(html, ctx) {
      if (ctx.bundle) {
        const cspMeta = `<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' https://avatars.githubusercontent.com https://github.com data:; connect-src 'self' https://api.github.com https://generativelanguage.googleapis.com;" />`;
        return html.replace("<head>", `<head>\n  ${cspMeta}`);
      }
      return html;
    },
  };
};

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), babel({ presets: [reactCompilerPreset()] }), cspPlugin()],
  base: "/DevLens/",
});
