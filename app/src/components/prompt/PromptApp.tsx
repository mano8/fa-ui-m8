// src/components/prompt/PromptApp.tsx
// Route-driven prompt-engine island. Mirrors MediaApp so all prompt pages
// share the auth/prompt providers while Starlight owns the page routes.
import { useEffect, useState } from "react";
import {
  AdminPromptPanel,
  PromptComposer,
} from "@mano8/astro-prompt-m8/react";
import PromptBlockEditor from "../fa-prompt/prompt-block-editor";
import PromptTemplateEditor from "../fa-prompt/prompt-template-editor";
import { LoginForm } from "../auth/LoginForm";
import { useAuth } from "../../hooks/auth/useAuth";
import { useUser } from "../../hooks/auth/useUser";
import { getTranslations } from "../../content/i18n/app";
import { localeFromPath } from "../../lib/locale";
import { PluginProviders } from "../app/PluginProviders";

export type PromptView = "blocks" | "templates" | "composer" | "admin" | "maintenance";
const PROMPT_ROUTE_EVENT = "fa-ui-m8:prompt-route";

function promptViewFromPath(pathname: string): PromptView | null {
  const path = pathname.replace(/\/$/, "");
  if (/^\/(en|es|fr)\/prompt\/?$/.test(path)) return "templates";
  if (/^\/(en|es|fr)\/prompt\/blocks$/.test(path)) return "blocks";
  if (/^\/(en|es|fr)\/prompt\/composer$/.test(path)) return "composer";
  if (/^\/(en|es|fr)\/prompt\/admin$/.test(path)) return "admin";
  if (/^\/(en|es|fr)\/prompt\/maintenance$/.test(path)) return "maintenance";
  return null;
}

function LoadingState() {
  return (
    <div className="flex min-h-[360px] items-center justify-center">
      <div className="size-8 animate-spin rounded-full border-2 border-muted border-b-primary" />
    </div>
  );
}

function blockEditorLabels(t: ReturnType<typeof getTranslations>) {
  return {
    ...t.prompt.blocks,
    deleteLabel: t.prompt.blocks.delete,
    deleteTitle: t.prompt.blocks.confirmDelete,
    deleteDescription: t.prompt.blocks.confirmDelete,
    allTypes: "All types",
    allDynamic: `${t.prompt.blocks.dynamicYes} + ${t.prompt.blocks.dynamicNo}`,
    allPublic: `${t.prompt.blocks.publicYes} + ${t.prompt.blocks.publicNo}`,
    columns: "Columns",
    search: t.prompt.blocks.name,
    selected: (selected: number, total: number) => `${selected} / ${total}`,
  };
}

function templateEditorLabels(t: ReturnType<typeof getTranslations>) {
  return {
    ...t.prompt.templates,
    type: t.prompt.blocks.type,
    deleteLabel: t.prompt.templates.delete,
    deleteTitle: t.prompt.templates.confirmDelete,
    deleteDescription: t.prompt.templates.confirmDelete,
    composeTitle: t.prompt.templates.composeLabel,
    composeResult: t.prompt.templates.composed,
    searchTemplates: t.prompt.templates.name,
    searchBlocks: t.prompt.blocks.name,
    allPublic: `${t.prompt.blocks.publicYes} + ${t.prompt.blocks.publicNo}`,
    allDynamic: `${t.prompt.blocks.dynamicYes} + ${t.prompt.blocks.dynamicNo}`,
    allTypes: "All types",
    columns: "Columns",
    selected: (selected: number, total: number) => `${selected} / ${total}`,
  };
}

function AppShellContent({ view }: { view: PromptView }) {
  const { status } = useAuth();
  const { isSuperuser } = useUser();
  const locale =
    typeof window === "undefined" ? "en" : localeFromPath(window.location.pathname);
  const t = getTranslations(locale);
  const activeView: PromptView =
    !isSuperuser && (view === "admin" || view === "maintenance") ? "templates" : view;

  if (status === "loading") return <LoadingState />;

  if (status === "unauthenticated") {
    return (
      <div className="fa-auth-login-centered">
        <p className="mb-6 text-center text-sm text-muted-foreground">
          {t.prompt.signInPrompt}
        </p>
        <LoginForm
          errorMessage={t.auth.login.invalidCredentials}
          loginTitle={t.auth.login.title}
          loginDescription={t.auth.login.description}
          userLabel={t.auth.login.username}
          usernamePlaceholder={t.auth.login.usernamePlaceholder}
          passwordLabel={t.auth.login.password}
          signInButtonText={t.auth.login.submit}
          signinWithGoogleButtonText={t.auth.login.google}
          signinLabel={t.auth.login.signingIn}
          orText={t.auth.login.or}
          googleUnavailableText={t.auth.login.googleUnavailable}
        />
      </div>
    );
  }

  return (
    <div className="not-content w-full max-w-none space-y-6">
      <div className="space-y-2 border-b pb-3 mb-3">
        <h1 className="text-2xl font-semibold tracking-normal text-foreground md:text-3xl">
          {t.prompt.title}
        </h1>
        <p className="text-sm text-muted-foreground">{t.prompt.description}</p>
      </div>

      <div className="space-y-4 pb-3">
        {activeView === "blocks" ? (
          <PromptBlockEditor labels={blockEditorLabels(t)} />
        ) : null}
        {activeView === "templates" ? (
          <PromptTemplateEditor labels={templateEditorLabels(t)} />
        ) : null}
        {activeView === "composer" ? (
          <PromptComposer labels={t.prompt.composer} />
        ) : null}
        {activeView === "admin" && isSuperuser ? (
          <AdminPromptPanel labels={t.prompt.admin} />
        ) : null}
        {activeView === "maintenance" && isSuperuser ? (
          <div className="not-content space-y-4">
            <PromptBlockEditor labels={blockEditorLabels(t)} />
            <PromptTemplateEditor labels={templateEditorLabels(t)} />
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default function PromptApp({ view = "templates" }: { view?: PromptView }) {
  const [currentView, setCurrentView] = useState<PromptView>(() =>
    typeof window === "undefined"
      ? view
      : (promptViewFromPath(window.location.pathname) ?? view)
  );

  useEffect(() => {
    const syncFromLocation = () => {
      const nextView = promptViewFromPath(window.location.pathname);
      if (nextView) setCurrentView(nextView);
    };
    const onPromptRoute = (event: Event) => {
      const nextView = (event as CustomEvent<{ view?: PromptView }>).detail?.view;
      if (nextView) setCurrentView(nextView);
    };

    window.addEventListener("popstate", syncFromLocation);
    window.addEventListener(PROMPT_ROUTE_EVENT, onPromptRoute);
    syncFromLocation();
    return () => {
      window.removeEventListener("popstate", syncFromLocation);
      window.removeEventListener(PROMPT_ROUTE_EVENT, onPromptRoute);
    };
  }, []);

  return (
    <PluginProviders prompt>
      <AppShellContent view={currentView} />
    </PluginProviders>
  );
}
