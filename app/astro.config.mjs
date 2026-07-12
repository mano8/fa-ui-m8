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

const authApiBase = publicEnv('PUBLIC_AUTH_API_BASE');
const siteUrl = publicEnv('PUBLIC_SITE_URL');
const mediaApiBase = publicEnv('PUBLIC_MEDIA_API_BASE');
const mediaV1Base = publicEnv('PUBLIC_MEDIA_V1_BASE');
const mediaStorageOrigin = publicEnv('PUBLIC_MEDIA_STORAGE_ORIGIN');
const promptApiBase = publicEnv('PUBLIC_PROMPT_API_BASE');
const promptApiPrefix = publicEnv('PUBLIC_PROMPT_API_PREFIX');
const repartoApiBase = publicEnv('PUBLIC_REPARTO_API_BASE');
const repartoApiPrefix = publicEnv('PUBLIC_REPARTO_API_PREFIX');
const securityEnv = {
	PUBLIC_SITE_URL: siteUrl,
	PUBLIC_AUTH_API_BASE: authApiBase,
	PUBLIC_MEDIA_API_BASE: mediaApiBase,
	PUBLIC_MEDIA_V1_BASE: mediaV1Base,
	PUBLIC_MEDIA_STORAGE_ORIGIN: mediaStorageOrigin,
	PUBLIC_PROMPT_API_BASE: promptApiBase,
	PUBLIC_REPARTO_API_BASE: repartoApiBase,
};

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

const promptPackageInstalled = packageInstalled('@mano8/astro-prompt-m8');
const promptRequested = publicMediaEnabled(promptApiBase);
const promptPluginEnabled = promptRequested && promptPackageInstalled;

if (promptRequested && !promptPackageInstalled) {
	console.warn(
		'PUBLIC_PROMPT_API_BASE is set but @mano8/astro-prompt-m8 is not installed; prompt UI/routes are disabled.',
	);
}

const repartoPackageInstalled = packageInstalled('@mano8/astro-reparto-m8');
const repartoRequested = publicMediaEnabled(repartoApiBase);
const repartoPluginEnabled = repartoRequested && repartoPackageInstalled;

if (repartoRequested && !repartoPackageInstalled) {
	console.warn(
		'PUBLIC_REPARTO_API_BASE is set but @mano8/astro-reparto-m8 is not installed; reparto UI/routes are disabled.',
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

/** @param {string} file */
const promptStub = (file) => fileURLToPath(new URL(`./src/lib/prompt-stubs/${file}`, import.meta.url));
const disabledPromptAliases = promptPluginEnabled
	? []
	: [
			{ find: '@mano8/astro-prompt-m8/api', replacement: promptStub('api.ts') },
			{ find: '@mano8/astro-prompt-m8/auth-adapter', replacement: promptStub('auth-adapter.ts') },
			{ find: '@mano8/astro-prompt-m8/hooks', replacement: promptStub('hooks.ts') },
			{ find: '@mano8/astro-prompt-m8/list-params', replacement: promptStub('list-params.ts') },
			{ find: '@mano8/astro-prompt-m8/react', replacement: promptStub('react.tsx') },
			{ find: '@mano8/astro-prompt-m8/schemas', replacement: promptStub('schemas.ts') },
		];

/** @param {string} file */
const repartoStub = (file) => fileURLToPath(new URL(`./src/lib/reparto-stubs/${file}`, import.meta.url));
const disabledRepartoAliases = repartoPluginEnabled
	? []
	: [
			{ find: '@mano8/astro-reparto-m8/api', replacement: repartoStub('api.ts') },
			{ find: '@mano8/astro-reparto-m8/auth-adapter', replacement: repartoStub('auth-adapter.ts') },
			{ find: '@mano8/astro-reparto-m8/client', replacement: repartoStub('client.ts') },
			{ find: '@mano8/astro-reparto-m8/compatibility', replacement: repartoStub('compatibility.ts') },
			{ find: '@mano8/astro-reparto-m8/default-ui', replacement: repartoStub('default-ui.tsx') },
			{ find: '@mano8/astro-reparto-m8/react', replacement: repartoStub('react.tsx') },
			{ find: '@mano8/astro-reparto-m8/routes', replacement: repartoStub('routes.ts') },
			{ find: '@mano8/astro-reparto-m8/schemas', replacement: repartoStub('schemas.ts') },
			{ find: '@mano8/astro-reparto-m8/ui', replacement: repartoStub('ui.ts') },
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

// Opt-in prompt plugin: same pattern as media. Loaded via dynamic import so the
// build never requires the package when prompts are disabled. Wired AFTER faAuth
// (below): its auth adapter is backed by fa-auth-m8 tokens. Starlight owns
// routing; prompt UI is mounted through React islands wrapped in PromptProvider.
const promptIntegrations = [];
if (promptPluginEnabled) {
	const { default: faPrompt } = await import('@mano8/astro-prompt-m8');
	promptIntegrations.push(
		faPrompt({
			apiBase: promptApiBase,
			apiPrefix: promptApiPrefix ?? '/fastapi',
			mode: 'headless',
			auth: { provider: 'fa-auth-astro' },
			locales: ['en', 'es', 'fr'],
			defaultLocale: 'en',
		}),
	);
}
const promptSidebarItems = promptPluginEnabled
	? [
			{
				label: translations.en.nav.prompt,
				collapsed: true,
				translations: {
					es: translations.es.nav.prompt,
					fr: translations.fr.nav.prompt,
				},
				items: [
					{
						label: translations.en.prompt.tabs.templates,
						link: '/prompt/',
						translations: {
							es: translations.es.prompt.tabs.templates,
							fr: translations.fr.prompt.tabs.templates,
						},
					},
					{
						label: translations.en.prompt.tabs.blocks,
						link: '/prompt/blocks',
						translations: {
							es: translations.es.prompt.tabs.blocks,
							fr: translations.fr.prompt.tabs.blocks,
						},
					},
					{
						label: translations.en.prompt.tabs.composer,
						link: '/prompt/composer',
						translations: {
							es: translations.es.prompt.tabs.composer,
							fr: translations.fr.prompt.tabs.composer,
						},
					},
					{
						label: translations.en.prompt.tabs.admin,
						link: '/prompt/admin',
						translations: {
							es: translations.es.prompt.tabs.admin,
							fr: translations.fr.prompt.tabs.admin,
						},
					},
				],
			},
		]
	: [];

/**
 * @param {Record<string, unknown>} dictionary
 * @param {string} key
 */
function repartoMessage(dictionary, key) {
	/** @type {unknown} */
	let value = dictionary;
	for (const segment of key.split('.')) {
		if (!value || typeof value !== 'object') return key;
		value = /** @type {Record<string, unknown>} */ (value)[segment];
	}
	return typeof value === 'string' ? value : key;
}

/**
 * @param {{ labelKey: string, href?: string }} entry
 * @param {{ en: Record<string, unknown>, es: Record<string, unknown>, fr: Record<string, unknown> }} dictionaries
 */
function repartoSidebarEntry(entry, dictionaries) {
	return {
		label: repartoMessage(dictionaries.en, entry.labelKey),
		link: entry.href,
		translations: {
			es: repartoMessage(dictionaries.es, entry.labelKey),
			fr: repartoMessage(dictionaries.fr, entry.labelKey),
		},
	};
}

/**
 * @param {{ labelKey: string, entries: Array<{ labelKey: string, href?: string }> }} group
 * @param {{ en: Record<string, unknown>, es: Record<string, unknown>, fr: Record<string, unknown> }} dictionaries
 */
function repartoSidebarGroup(group, dictionaries) {
	return {
		label: repartoMessage(dictionaries.en, group.labelKey),
		collapsed: true,
		translations: {
			es: repartoMessage(dictionaries.es, group.labelKey),
			fr: repartoMessage(dictionaries.fr, group.labelKey),
		},
		items: group.entries.map((entry) => repartoSidebarEntry(entry, dictionaries)),
	};
}

// Opt-in reparto plugin: same optional deployment contract as media/prompt.
// It stays package-owned; fa-ui-m8 only mounts starter routes and sidebar groups.
const repartoIntegrations = [];
/** @type {any[]} */
let repartoSidebarItems = [];
if (repartoPluginEnabled) {
	const repartoModule = await import('@mano8/astro-reparto-m8');
	const repartoI18n = await import('@mano8/astro-reparto-m8/i18n');
	const repartoRoutes = repartoModule.buildRepartoRoutes();
	const repartoNav = repartoModule.buildRepartoNav(
		repartoRoutes,
		repartoModule.DEFAULT_REPARTO_NAV,
	);
	const repartoDictionaries = {
		en: repartoI18n.getRepartoDictionary('en'),
		es: repartoI18n.getRepartoDictionary('es'),
		fr: repartoI18n.getRepartoDictionary('fr'),
	};

	repartoIntegrations.push(
		repartoModule.default({
			apiBase: repartoApiBase,
			apiPrefix: repartoApiPrefix ?? '',
			mode: 'starter',
			auth: { provider: 'fa-auth-astro', loginPath: '/auth/login' },
			locales: ['en', 'es', 'fr'],
			defaultLocale: 'en',
		}),
	);

	repartoSidebarItems = [
		{
			label: 'Reparto Docente',
			collapsed: true,
			translations: {
				es: 'Reparto docente',
				fr: 'Repartition docente',
			},
			items: [
				repartoSidebarGroup(repartoNav.setup, repartoDictionaries),
				repartoSidebarGroup(repartoNav.process, repartoDictionaries),
			],
		},
	];
}
// https://astro.build/config
export default defineConfig({
	site: siteUrl ?? 'http://localhost:4321',
	server: {
		host: true,
		port: 4321,
	},
	// Production CSP for the static UI (plan item 8.1). Build-time only — a no-op
	// under `astro dev`; takes effect in `build`/`preview`. See src/lib/csp.ts.
	security: buildSecurityConfig(securityEnv),
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
			'import.meta.env.PUBLIC_FA_PROMPT_ENABLED': JSON.stringify(promptPluginEnabled),
			...(promptPluginEnabled
				? {}
				: {
						'import.meta.env.PUBLIC_FA_PROMPT_API_BASE': JSON.stringify(''),
						'import.meta.env.PUBLIC_FA_PROMPT_API_PREFIX': JSON.stringify('/fastapi'),
						'import.meta.env.PUBLIC_FA_PROMPT_ADMIN_ROLE': JSON.stringify('is_superuser'),
					}),
			'import.meta.env.PUBLIC_FA_REPARTO_ENABLED': JSON.stringify(repartoPluginEnabled),
			...(repartoPluginEnabled
				? {}
				: {
						'import.meta.env.PUBLIC_FA_REPARTO_API_BASE': JSON.stringify(''),
						'import.meta.env.PUBLIC_FA_REPARTO_API_PREFIX': JSON.stringify(''),
					}),
		},
		plugins: [tailwindcss()],
		resolve: {
			alias: [...disabledMediaAliases, ...disabledPromptAliases, ...disabledRepartoAliases],
			dedupe: [
				'react',
				'react-dom',
				'@tanstack/react-query',
				'@mano8/astro-auth-m8',
				'@mano8/astro-media-m8',
				'@mano8/astro-prompt-m8',
				'@mano8/astro-reparto-m8',
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
			...promptSidebarItems,
			...repartoSidebarItems,
		],
	}),
		react(),
		faAuth({
			apiBase: authApiBase ?? '/user',
			mode: 'headless',
			locales: ['en', 'es', 'fr'],
			defaultLocale: 'en',
		}),
		// Opt-in media plugin: empty unless PUBLIC_MEDIA_API_BASE is set (see the
		// mediaIntegrations block above). Stays last so it wires after faAuth.
		...mediaIntegrations,
		// Opt-in prompt plugin: same pattern as media. Stays after faAuth + media
		// so its auth adapter is wired against fa-auth-m8 tokens.
		...promptIntegrations,
		// Opt-in reparto plugin: starter routes are mounted only when requested
		// and installed, and it stays after faAuth for the shared auth adapter.
		...repartoIntegrations,
	],
});
