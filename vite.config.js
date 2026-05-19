import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

const manifestIcons = [
  {
    src: "pwa-192.png",
    sizes: "192x192",
    type: "image/png",
  },
  {
    src: "pwa-512.png",
    sizes: "512x512",
    type: "image/png",
  },
];

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [["babel-plugin-react-compiler"]],
      },
    }),
    VitePWA({
      registerType: "autoUpdate",
      workbox: {
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
      },
      manifest: {
        name: "UniON",
        short_name: "UniON",
        icons: manifestIcons,
      },
    }),
  ],
});
