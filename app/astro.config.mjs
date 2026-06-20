// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import tailwindcss from "@tailwindcss/vite";
import react from '@astrojs/react';
import faAuth from '@fa-m8/astro-auth-m8';
import faMedia from '@fa-m8/astro-media-m8';

const upstreamMarkdownWarning =
	"[astro] `markdown.remarkPlugins`, `markdown.rehypePlugins`, and `markdown.remarkRehype` are deprecated. Pass them to `unified({...})` from `@astrojs/markdown-remark` directly instead.";
const warn = console.warn.bind(console);
console.warn = (...args) => {
	if (args[0] === upstreamMarkdownWarning) return;
	warn(...args);
};

// https://astro.build/config
export default defineConfig({
	site: process.env.PUBLIC_SITE_URL ?? 'http://localhost:4321',
	vite: {
		plugins: [tailwindcss()],
		optimizeDeps: {
			include: [
				'class-variance-authority',
				'clsx',
				'lucide-react',
				'radix-ui',
				'tailwind-merge',
				'zod',
			],
		},
	},
	integrations: [
		starlight({
			title: {
				en: 'My Docs',
				es: 'Mis Documentos',
				fr: 'Ma documentation'
			},
			customCss: [
				// Relative path to your custom CSS file
				'./src/styles/global.css',
			],
			social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/mano8' }],
			components: {
				// Add an auth entry point (Account / Sign in) to the top bar.
				SocialIcons: './src/components/starlight/AuthNav.astro',
			},
			disable404Route: true,
			// Set English as the default language for this site.
      		defaultLocale: 'en',
			locales: {
				// English docs in `src/content/docs/en/`
				en: {
					label: 'English',
					lang: 'en',
				},
				fr: {
					label: 'Français',
					lang: 'fr',
				},
				es: {
					label: 'Español',
					lang: 'es',
				},
			},
			sidebar: [
				{ 
					label: 'Home',
					link: '/',
					translations: {
						'es': 'Inicio',
						'fr': 'Accueil',
					},
				},
				
				{
					label: 'Docs',
					collapsed: true,
					items: [
						{
							label: 'Docker',
							collapsed: true,
							items: [
								{
									label: 'Configuration',
									slug: 'docker/config',
									translations: {
										'es': 'Configuracion',
										'fr': 'Configuration',
									},
								},
								{
									label: 'Compose ',
									slug: 'docker/compose'
								},
								{
									label: 'CheatSheets',
									translations: {
										'es': 'Chuletas',
										'fr': 'CheatSheets',
									},
									slug: 'docker/cheatsheet'
								},
							],
						},
						{
							label: 'Linux',
							collapsed: true,
							items: [
								{
									label: 'File System',
									collapsed: true,
									translations: {
										'es': 'Systema de ficheros',
										'fr': 'Systeme de fichiers',
									},
									items: [
										{ label: 'CheatSheet', slug: 'linux/files' },
										{ label: 'Archives', slug: 'linux/files/archive' },
										{ label: 'Permissions', slug: 'linux/files/file_permission' },
										{ label: 'File System', slug: 'linux/files/file_system' },
									]
								},
								{
									label: 'Network',
									collapsed: true,
									translations: {
										'es': 'Redes',
										'fr': 'Network',
									},
									items: [
										{ label: 'CheatSheet', slug: 'linux/network' }
									]
								},
								{
									label: 'System',
									collapsed: true,
									translations: {
										'es': 'Systema',
										'fr': 'Systeme',
									},
									items: [
										{ label: 'CheatSheet', slug: 'linux/system' },
										{ label: 'LVM', slug: 'linux/system/lvm' },
										{ label: 'Packets', slug: 'linux/system/packets' },
										{ label: 'User Groups', slug: 'linux/system/user_groups' }
									]
								},
							],
						},
						/*{
							label: 'Tools',
							collapsed: true,
							translations: {
								'es': 'Herramientas',
								'fr': 'Outils',
							},
							items: [
								{
									label: 'Online',
									collapsed: true,
									translations: {
										'es': 'En linea',
										'fr': 'En ligne',
									},
									items: [
										{ label: 'Encoding', slug: 'tools/online/encoding' },
										{ label: 'Dns', slug: 'tools/online/dns' },
										{ label: 'Regex', slug: 'tools/online/regex' },
										{ label: 'Security', slug: 'tools/online/security' },
									],
								},
								{
									label: 'Local',
									collapsed: true,
									translations: {
										'es': 'Local',
										'fr': 'Local',
									},
									items: [
										{ label: 'Handy', slug: 'tools/local/handy' },
									],
								},
							],
						},*/
					],
				},
				{
					label: 'Reference',
					items: [{ autogenerate: { directory: 'reference' } }],
				},
			],
		}),
		react(),
		faAuth({
			apiBase: process.env.PUBLIC_AUTH_API_BASE ?? '/user',
			mode: 'headless',
			locales: ['en', 'es', 'fr'],
			defaultLocale: 'en',
		}),
		// media plugin must be listed AFTER faAuth: its auth adapter is backed by
		// fa-auth-m8 tokens. Headless to match the auth setup — Starlight owns routing,
		// so media UI is mounted through React islands wrapped in MediaProvider.
		faMedia({
			apiBase: process.env.PUBLIC_MEDIA_API_BASE ?? '/media',
			v1Base: process.env.PUBLIC_MEDIA_V1_BASE ?? '/v1',
			mode: 'headless',
			auth: { provider: 'fa-auth-astro' },
			locales: ['en', 'es', 'fr'],
			defaultLocale: 'en',
		})
	],
});
