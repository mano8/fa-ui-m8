// @ts-check
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import tailwindcss from "@tailwindcss/vite";
import react from '@astrojs/react';
import faAuth from '@mano8/astro-auth-m8';
import { loadEnv } from 'vite';
import { buildSecurityConfig } from './src/lib/csp.ts';
import { translations } from './src/content/i18n/app/index.ts';

const upstreamMarkdownWarning =
	"[astro] `markdown.remarkPlugins`, `markdown.rehypePlugins`, and `markdown.remarkRehype` are deprecated. Pass them to `unified({...})` from `@astrojs/markdown-remark` directly instead.";
const warn = console.warn.bind(console);
console.warn = (...args) => {
	if (args[0] === upstreamMarkdownWarning) return;
	warn(...args);
};

const env = loadEnv(process.env.NODE_ENV === 'production' ? 'production' : 'development', process.cwd(), '');
const require = createRequire(import.meta.url);

/** @param {string} key */
function publicEnv(key) {
	return Object.hasOwn(process.env, key) ? process.env[key] : env[key];
}

/** @param {string | undefined} value */
function publicMediaEnabled(value) {
	const normalized = value?.trim().toLowerCase();
	return Boolean(normalized && !['0', 'false', 'off', 'none'].includes(normalized));
}

const mediaApiBase = publicEnv('PUBLIC_MEDIA_API_BASE');
const mediaV1Base = publicEnv('PUBLIC_MEDIA_V1_BASE');

/** @param {string} specifier */
function packageInstalled(specifier) {
	try {
		require.resolve(specifier);
		return true;
	} catch {
		return false;
	}
}

const mediaPackageInstalled = packageInstalled('@mano8/astro-media-m8');
const mediaRequested = publicMediaEnabled(mediaApiBase);
const mediaPluginEnabled = mediaRequested && mediaPackageInstalled;

if (mediaRequested && !mediaPackageInstalled) {
	console.warn(
		'PUBLIC_MEDIA_API_BASE is set but @mano8/astro-media-m8 is not installed; media UI/routes are disabled.',
	);
}

/** @param {string} file */
const mediaStub = (file) => fileURLToPath(new URL(`./src/lib/media-stubs/${file}`, import.meta.url));
const disabledMediaAliases = mediaPluginEnabled
	? []
	: [
			{ find: '@mano8/astro-media-m8/api', replacement: mediaStub('api.ts') },
			{ find: '@mano8/astro-media-m8/auth-adapter', replacement: mediaStub('auth-adapter.ts') },
			{ find: '@mano8/astro-media-m8/hooks', replacement: mediaStub('hooks.ts') },
			{ find: '@mano8/astro-media-m8/list-params', replacement: mediaStub('list-params.ts') },
			{ find: '@mano8/astro-media-m8/react', replacement: mediaStub('react.tsx') },
			{ find: '@mano8/astro-media-m8/schemas', replacement: mediaStub('schemas.ts') },
		];

// Deployment contract: `astro-auth-m8` is the one required plugin; every other
// plugin is opt-in per *deployment* = (package installed) + (its PUBLIC_* env
// set). Media is therefore wired only when PUBLIC_MEDIA_API_BASE is present, and
// loaded via dynamic import so the build never requires the package when media
// is disabled (a static `import` would break any auth-only configuration). The
// canonical operator-facing prefix is PUBLIC_MEDIA_* (see app/.env.example); the
// integration re-exposes those internally as PUBLIC_FA_MEDIA_* at build time.
//
// Media plugin is wired AFTER faAuth (below): its auth adapter is backed by
// fa-auth-m8 tokens. Headless to match the auth setup — Starlight owns routing,
// so media UI is mounted through React islands wrapped in MediaProvider.
const mediaIntegrations = [];
if (mediaPluginEnabled) {
	const { default: faMedia } = await import('@mano8/astro-media-m8');
	mediaIntegrations.push(
		faMedia({
			apiBase: mediaApiBase,
			v1Base: mediaV1Base ?? '/v1',
			mode: 'headless',
			auth: { provider: 'fa-auth-astro' },
			locales: ['en', 'es', 'fr'],
			defaultLocale: 'en',
		}),
	);
}
const mediaSidebarItems = mediaPluginEnabled
	? [
			{
				label: translations.en.nav.media,
				collapsed: true,
				translations: {
					es: translations.es.nav.media,
					fr: translations.fr.nav.media,
				},
				items: [
					{
						label: translations.en.media.tabs.library,
						link: '/media/',
						translations: {
							es: translations.es.media.tabs.library,
							fr: translations.fr.media.tabs.library,
						},
					},
					{
						label: translations.en.media.tabs.upload,
						link: '/media/upload',
						translations: {
							es: translations.es.media.tabs.upload,
							fr: translations.fr.media.tabs.upload,
						},
					},
					{
						label: translations.en.media.tabs.presets,
						link: '/media/presets',
						translations: {
							es: translations.es.media.tabs.presets,
							fr: translations.fr.media.tabs.presets,
						},
					},
					{
						label: translations.en.media.tabs.admin,
						link: '/media/admin',
						translations: {
							es: translations.es.media.tabs.admin,
							fr: translations.fr.media.tabs.admin,
						},
					},
					{
						label: translations.en.media.tabs.maintenance,
						link: '/media/maintenance',
						translations: {
							es: translations.es.media.tabs.maintenance,
							fr: translations.fr.media.tabs.maintenance,
						},
					},
				],
			},
		]
	: [];
// https://astro.build/config
export default defineConfig({
	site: env.PUBLIC_SITE_URL ?? 'http://localhost:4321',
	// Production CSP for the static UI (plan item 8.1). Build-time only — a no-op
	// under `astro dev`; takes effect in `build`/`preview`. See src/lib/csp.ts.
	security: buildSecurityConfig(),
	vite: {
		cacheDir: process.env.VITE_CACHE_DIR ?? '.astro/vite',
		define: {
			'import.meta.env.PUBLIC_FA_MEDIA_ENABLED': JSON.stringify(mediaPluginEnabled),
			...(mediaPluginEnabled
				? {}
				: {
						'import.meta.env.PUBLIC_FA_MEDIA_API_BASE': JSON.stringify(''),
						'import.meta.env.PUBLIC_FA_MEDIA_V1_BASE': JSON.stringify('/v1'),
						'import.meta.env.PUBLIC_FA_MEDIA_LEGACY_BASE': JSON.stringify(''),
						'import.meta.env.PUBLIC_FA_MEDIA_ADMIN_ROLE': JSON.stringify('is_superuser'),
					}),
		},
		plugins: [tailwindcss()],
		resolve: {
			alias: disabledMediaAliases,
			dedupe: [
				'react',
				'react-dom',
				'@tanstack/react-query',
				'@mano8/astro-auth-m8',
				'@mano8/astro-media-m8',
			],
		},
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
				Sidebar: './src/components/starlight/Sidebar.astro',
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
				...mediaSidebarItems,
			],
		}),
		react(),
		faAuth({
			apiBase: env.PUBLIC_AUTH_API_BASE ?? '/user',
			mode: 'headless',
			locales: ['en', 'es', 'fr'],
			defaultLocale: 'en',
		}),
		// Opt-in media plugin: empty unless PUBLIC_MEDIA_API_BASE is set (see the
		// mediaIntegrations block above). Stays last so it wires after faAuth.
		...mediaIntegrations,
	],
});
