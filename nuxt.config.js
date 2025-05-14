import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
    compatibilityDate: "2024-11-01",
    devtools: { enabled: true },
    css: ['~/assets/css/styles.css'],
    modules: [
        '@nuxt/ui'
    ],
    vite: {
        plugins: [
            tailwindcss(),
        ],
    },
});