"use client";

import * as React from "react";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { RequireRole } from "@fa-m8/astro-auth-m8/react";
import { useUsers } from "@fa-m8/astro-auth-m8/hooks";
import {
  AuthProviderTypeSchema,
  RoleTypeSchema,
  UserCreateSchema,
  UserUpdateSchema,
  type AuthProviderType,
  type RoleType,
  type UserPublic,
} from "@fa-m8/astro-auth-m8/schemas";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export interface AdminUsersPanelLabels {
  title: string;
  description: string;
  updateScope: string;
  invalidCreate: string;
  invalidUpdate: string;
  created: string;
  updated: string;
  deleted: string;
  createFailed: string;
  updateFailed: string;
  deleteFailed: string;
  email: string;
  fullName: string;
  avatar: string;
  avatarPlaceholder: string;
  password: string;
  passwordPlaceholder: string;
  passwordUnsupported: string;
  create: string;
  addUser: string;
  editUser: string;
  deleteUser: string;
  role: string;
  emailVerified: string;
  superuser: string;
  users: string;
  refresh: string;
  loading: string;
  user: string;
  provider: string;
  providerPassword: string;
  providerGoogle: string;
  actions: string;
  active: string;
  inactive: string;
  save: string;
  delete: string;
  edit: string;
  cancel: string;
  confirmDelete: string;
  deletePrompt: string;
  empty: string;
  search: string;
  searchPlaceholder: string;
  allRoles: string;
  allProviders: string;
  status: string;
  details: string;
  noFullName: string;
}

const DEFAULT_LABELS: AdminUsersPanelLabels = {
  title: "Admin users",
  description: "Superuser-only user management.",
  updateScope:
    "User updates support email, full name, avatar, password, and role. Provider, account status, and verification flags are managed by the auth service.",
  invalidCreate: "Invalid user payload.",
  invalidUpdate: "Invalid update payload.",
  created: "User created.",
  updated: "User updated.",
  deleted: "User deleted.",
  createFailed: "Failed to create user.",
  updateFailed: "Failed to update user.",
  deleteFailed: "Failed to delete user.",
  email: "Email",
  fullName: "Full name",
  avatar: "Avatar URL",
  avatarPlaceholder: "https://example.com/avatar.png",
  password: "Password",
  passwordPlaceholder: "Leave blank to keep current password",
  passwordUnsupported: "Password disabled for Google users",
  create: "Create",
  addUser: "Add user",
  editUser: "Edit user",
  deleteUser: "Delete user",
  role: "Role",
  emailVerified: "Email verified",
  superuser: "Superuser",
  users: "users",
  refresh: "Refresh",
  loading: "Loading users...",
  user: "User",
  provider: "Provider",
  providerPassword: "Password",
  providerGoogle: "Google",
  actions: "Actions",
  active: "Active",
  inactive: "Inactive",
  save: "Save",
  delete: "Delete",
  edit: "Edit",
  cancel: "Cancel",
  confirmDelete: "Yes, delete user",
  deletePrompt: "Are you sure you want to delete this user?",
  empty: "No users match the current filters.",
  search: "Search",
  searchPlaceholder: "Search by email or full name",
  allRoles: "All roles",
  allProviders: "All providers",
  status: "Status",
  details: "Details",
  noFullName: "No full name",
};

type AdminPage =
  | { name: "list" }
  | { name: "add" }
  | { name: "edit"; userId: string }
  | { name: "delete"; userId: string };

type SortKey = "email" | "full_name" | "role" | "provider" | "status";
type SortDirection = "asc" | "desc";

function formString(formData: FormData, key: string): string | undefined {
  const value = formData.get(key);
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

const inputClassName =
  "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 md:text-sm dark:bg-input/30";

const badgeClassName =
  "inline-flex min-h-6 items-center rounded-md border bg-muted/40 px-2 py-0.5 text-xs font-medium";

function providerLabel(t: AdminUsersPanelLabels, provider: AuthProviderType) {
  return provider === "google" ? t.providerGoogle : t.providerPassword;
}

function userStatus(t: AdminUsersPanelLabels, user: UserPublic) {
  return [
    user.is_active ? t.active : t.inactive,
    user.email_verified ? t.emailVerified : null,
    user.is_superuser ? t.superuser : null,
  ].filter(Boolean).join(" - ");
}

function compareText(left: string | null | undefined, right: string | null | undefined) {
  return (left ?? "").localeCompare(right ?? "", undefined, { sensitivity: "base" });
}

function sortUsers(users: UserPublic[], key: SortKey, direction: SortDirection) {
  const multiplier = direction === "asc" ? 1 : -1;
  return [...users].sort((left, right) => {
    if (key === "status") {
      return compareText(String(left.is_active), String(right.is_active)) * multiplier;
    }
    return compareText(left[key], right[key]) * multiplier;
  });
}

function SortButton({
  active,
  direction,
  label,
  onClick,
}: {
  active: boolean;
  direction: SortDirection;
  label: string;
  onClick: () => void;
}) {
  const Icon = active ? (direction === "asc" ? ArrowUp : ArrowDown) : ArrowUpDown;
  return (
    <button
      type="button"
      className="inline-flex items-center gap-1 font-medium text-foreground hover:text-primary"
      onClick={onClick}
    >
      {label}
      <Icon className="size-3.5" />
    </button>
  );
}

function UserDetails({ t, user }: { t: AdminUsersPanelLabels; user: UserPublic }) {
  return (
    <dl className="grid gap-3 rounded-md border p-4 text-sm sm:grid-cols-2">
      <div>
        <dt className="text-muted-foreground">{t.email}</dt>
        <dd className="break-all font-medium text-foreground">{user.email}</dd>
      </div>
      <div>
        <dt className="text-muted-foreground">{t.fullName}</dt>
        <dd>{user.full_name || t.noFullName}</dd>
      </div>
      <div>
        <dt className="text-muted-foreground">{t.role}</dt>
        <dd className="capitalize">{user.role}</dd>
      </div>
      <div>
        <dt className="text-muted-foreground">{t.provider}</dt>
        <dd>{providerLabel(t, user.provider)}</dd>
      </div>
      <div>
        <dt className="text-muted-foreground">{t.status}</dt>
        <dd>{userStatus(t, user)}</dd>
      </div>
      <div>
        <dt className="text-muted-foreground">{t.avatar}</dt>
        <dd className="break-all">{user.avatar || "-"}</dd>
      </div>
    </dl>
  );
}

function FormGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-3 md:grid-cols-2">{children}</div>;
}

function adminBaseFromPath(pathname: string) {
  const match = pathname.match(/^\/(en|es|fr)\/user\/account\/admin/);
  return match ? `/${match[1]}/user/account/admin` : "/en/user/account/admin";
}

function adminPageFromLocation(): AdminPage {
  if (typeof window === "undefined") return { name: "list" };

  const path = window.location.pathname.replace(/\/$/, "");
  const search = new URLSearchParams(window.location.search);
  const userId = search.get("id") ?? "";

  if (/^\/(en|es|fr)\/user\/account\/admin\/users\/new$/.test(path)) return { name: "add" };
  if (/^\/(en|es|fr)\/user\/account\/admin\/users\/edit$/.test(path) && userId) {
    return { name: "edit", userId };
  }
  if (/^\/(en|es|fr)\/user\/account\/admin\/users\/delete$/.test(path) && userId) {
    return { name: "delete", userId };
  }

  return { name: "list" };
}

function hrefForAdminPage(nextPage: AdminPage) {
  const base = typeof window === "undefined" ? "/en/user/account/admin" : adminBaseFromPath(window.location.pathname);
  if (nextPage.name === "add") return `${base}/users/new`;
  if (nextPage.name === "edit") return `${base}/users/edit?id=${encodeURIComponent(nextPage.userId)}`;
  if (nextPage.name === "delete") return `${base}/users/delete?id=${encodeURIComponent(nextPage.userId)}`;
  return base;
}

function AdminUsersPanelInner({ t }: { t: AdminUsersPanelLabels }) {
  const { users: usersData, loading, error, reload, create, update, remove } = useUsers(false);
  const users = usersData?.data ?? [];
  const count = usersData?.count ?? 0;
  const errorText = error instanceof Error ? error.message : error ? String(error) : null;
  const [message, setMessage] = React.useState<string | null>(null);
  const [page, setPage] = React.useState<AdminPage>(() => adminPageFromLocation());
  const [query, setQuery] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState<RoleType | "all">("all");
  const [providerFilter, setProviderFilter] = React.useState<AuthProviderType | "all">("all");
  const [sortKey, setSortKey] = React.useState<SortKey>("email");
  const [sortDirection, setSortDirection] = React.useState<SortDirection>("asc");

  React.useEffect(() => {
    reload().catch(() => {});
  }, [reload]);

  React.useEffect(() => {
    const sync = () => setPage(adminPageFromLocation());
    window.addEventListener("popstate", sync);
    window.addEventListener("fa-ui-m8:account-route", sync);
    sync();
    return () => {
      window.removeEventListener("popstate", sync);
      window.removeEventListener("fa-ui-m8:account-route", sync);
    };
  }, []);

  const navigate = React.useCallback((nextPage: AdminPage) => {
    setMessage(null);
    setPage(nextPage);
    const href = hrefForAdminPage(nextPage);
    window.history.pushState({}, "", href);
    window.dispatchEvent(new CustomEvent("fa-ui-m8:account-route", { detail: { view: "admin" } }));
  }, []);

  const filteredUsers = React.useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    const filtered = users.filter((user) => {
      const matchesQuery = normalizedQuery.length === 0
        || user.email.toLocaleLowerCase().includes(normalizedQuery)
        || (user.full_name ?? "").toLocaleLowerCase().includes(normalizedQuery);
      const matchesRole = roleFilter === "all" || user.role === roleFilter;
      const matchesProvider = providerFilter === "all" || user.provider === providerFilter;
      return matchesQuery && matchesRole && matchesProvider;
    });
    return sortUsers(filtered, sortKey, sortDirection);
  }, [providerFilter, query, roleFilter, sortDirection, sortKey, users]);

  const selectedUser = page.name === "edit" || page.name === "delete"
    ? users.find((user) => user.id === page.userId) ?? null
    : null;

  const updateSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection((current) => current === "asc" ? "desc" : "asc");
      return;
    }
    setSortKey(key);
    setSortDirection("asc");
  };

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const role = formString(formData, "role");
    const parsed = UserCreateSchema.safeParse({
      email: formString(formData, "email"),
      password: formString(formData, "password"),
      full_name: formString(formData, "full_name"),
      avatar: formString(formData, "avatar"),
      provider: "password",
      role: role ? RoleTypeSchema.parse(role) : "user",
      is_active: formData.get("is_active") === "on",
      is_superuser: formData.get("is_superuser") === "on",
    });

    if (!parsed.success) {
      setMessage(parsed.error.issues[0]?.message ?? t.invalidCreate);
      return;
    }

    try {
      await create(parsed.data);
      await reload();
      form.reset();
      setMessage(t.created);
      navigate({ name: "list" });
    } catch (err) {
      setMessage(err instanceof Error ? err.message : t.createFailed);
    }
  };

  const handleUpdate = async (event: React.FormEvent<HTMLFormElement>, id: string) => {
    event.preventDefault();
    setMessage(null);

    const formData = new FormData(event.currentTarget);
    const parsed = UserUpdateSchema.safeParse({
      email: formString(formData, "email"),
      full_name: formString(formData, "full_name"),
      avatar: formString(formData, "avatar"),
      password: formString(formData, "password"),
      role: formString(formData, "role"),
    });

    if (!parsed.success) {
      setMessage(parsed.error.issues[0]?.message ?? t.invalidUpdate);
      return;
    }

    try {
      await update(id, parsed.data);
      await reload();
      setMessage(t.updated);
      navigate({ name: "list" });
    } catch (err) {
      setMessage(err instanceof Error ? err.message : t.updateFailed);
    }
  };

  const handleDelete = async (id: string) => {
    setMessage(null);
    try {
      await remove(id);
      await reload();
      setMessage(t.deleted);
      navigate({ name: "list" });
    } catch (err) {
      setMessage(err instanceof Error ? err.message : t.deleteFailed);
    }
  };

  const renderHeaderActions = (
    <div className="flex flex-col gap-2 sm:flex-row md:justify-end">
      <Button type="button" size="sm" variant="outline" onClick={() => reload()}>
        <RefreshCw />
        {t.refresh}
      </Button>
      <Button asChild type="button" size="sm">
        <a
          href={hrefForAdminPage({ name: "add" })}
          onClick={(event) => {
            event.preventDefault();
            navigate({ name: "add" });
          }}
        >
          <Plus />
          {t.addUser}
        </a>
      </Button>
    </div>
  );

  return (
    <Card className="not-content pb-3">
      <CardHeader className="gap-4 pb-3 md:flex-row md:items-start md:justify-between">
        <div className="space-y-1.5">
          <CardTitle>{t.title}</CardTitle>
          <CardDescription>{t.description}</CardDescription>
        </div>
        {page.name === "list" ? renderHeaderActions : null}
      </CardHeader>
      <CardContent className="space-y-5 pb-3">
        {(message || errorText) && (
          <p className="rounded-md border p-3 text-sm">{message ?? errorText}</p>
        )}

        {page.name === "add" ? (
          <form onSubmit={handleCreate} className="space-y-5 pb-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-base font-semibold">{t.addUser}</h3>
                <p className="text-sm text-muted-foreground">{t.updateScope}</p>
              </div>
              <Button asChild type="button" variant="outline">
                <a
                  href={hrefForAdminPage({ name: "list" })}
                  onClick={(event) => {
                    event.preventDefault();
                    navigate({ name: "list" });
                  }}
                >
                  {t.cancel}
                </a>
              </Button>
            </div>
            <FormGrid>
              <div className="space-y-1.5">
                <Label htmlFor="admin-create-email">{t.email}</Label>
                <Input id="admin-create-email" name="email" type="email" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="admin-create-name">{t.fullName}</Label>
                <Input id="admin-create-name" name="full_name" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="admin-create-avatar">{t.avatar}</Label>
                <Input id="admin-create-avatar" name="avatar" type="url" placeholder={t.avatarPlaceholder} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="admin-create-password">{t.password}</Label>
                <Input id="admin-create-password" name="password" type="password" minLength={8} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="admin-create-role">{t.role}</Label>
                <select id="admin-create-role" name="role" defaultValue="user" className={inputClassName}>
                  {RoleTypeSchema.options.map((role) => <option key={role} value={role}>{role}</option>)}
                </select>
              </div>
              <label className="flex min-h-8 items-center gap-2 rounded-md border border-input px-3 py-2 text-sm">
                <input name="is_active" type="checkbox" defaultChecked className="size-4" />
                {t.active}
              </label>
              <label className="flex min-h-8 items-center gap-2 rounded-md border border-input px-3 py-2 text-sm">
                <input name="is_superuser" type="checkbox" className="size-4" />
                {t.superuser}
              </label>
            </FormGrid>
            <Button type="submit">{t.create}</Button>
          </form>
        ) : null}

        {page.name === "edit" && selectedUser ? (
          <form onSubmit={(event) => handleUpdate(event, selectedUser.id)} className="space-y-5 pb-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-base font-semibold">{t.editUser}</h3>
                <p className="break-all text-sm text-muted-foreground">{selectedUser.email}</p>
              </div>
              <Button asChild type="button" variant="outline">
                <a
                  href={hrefForAdminPage({ name: "list" })}
                  onClick={(event) => {
                    event.preventDefault();
                    navigate({ name: "list" });
                  }}
                >
                  {t.cancel}
                </a>
              </Button>
            </div>
            <FormGrid>
              <div className="space-y-1.5">
                <Label htmlFor="admin-edit-email">{t.email}</Label>
                <Input id="admin-edit-email" name="email" type="email" defaultValue={selectedUser.email} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="admin-edit-name">{t.fullName}</Label>
                <Input id="admin-edit-name" name="full_name" defaultValue={selectedUser.full_name ?? ""} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="admin-edit-avatar">{t.avatar}</Label>
                <Input id="admin-edit-avatar" name="avatar" type="url" defaultValue={selectedUser.avatar ?? ""} placeholder={t.avatarPlaceholder} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="admin-edit-password">{t.password}</Label>
                <Input
                  id="admin-edit-password"
                  name="password"
                  type="password"
                  placeholder={selectedUser.provider === "password" ? t.passwordPlaceholder : t.passwordUnsupported}
                  disabled={selectedUser.provider === "google"}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="admin-edit-role">{t.role}</Label>
                <select id="admin-edit-role" name="role" defaultValue={selectedUser.role} className={inputClassName}>
                  {RoleTypeSchema.options.map((role) => <option key={role} value={role}>{role}</option>)}
                </select>
              </div>
              <UserDetails t={t} user={selectedUser} />
            </FormGrid>
            <Button type="submit">{t.save}</Button>
          </form>
        ) : null}

        {page.name === "delete" && selectedUser ? (
          <div className="space-y-5 pb-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-base font-semibold">{t.deleteUser}</h3>
                <p className="text-sm text-muted-foreground">{t.deletePrompt}</p>
              </div>
              <Button asChild type="button" variant="outline">
                <a
                  href={hrefForAdminPage({ name: "list" })}
                  onClick={(event) => {
                    event.preventDefault();
                    navigate({ name: "list" });
                  }}
                >
                  {t.cancel}
                </a>
              </Button>
            </div>
            <UserDetails t={t} user={selectedUser} />
            <Button type="button" variant="destructive" onClick={() => handleDelete(selectedUser.id)}>
              <Trash2 />
              {t.confirmDelete}
            </Button>
          </div>
        ) : null}

        {page.name === "list" ? (
          <div className="space-y-4 pb-3">
            <div className="grid gap-3 pb-3 lg:grid-cols-[minmax(14rem,1fr)_12rem_12rem_auto] lg:items-end">
              <div className="space-y-1.5">
                <Label htmlFor="admin-users-search">{t.search}</Label>
                <Input
                  id="admin-users-search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={t.searchPlaceholder}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="admin-users-role">{t.role}</Label>
                <select
                  id="admin-users-role"
                  value={roleFilter}
                  onChange={(event) => setRoleFilter(event.target.value as RoleType | "all")}
                  className={inputClassName}
                >
                  <option value="all">{t.allRoles}</option>
                  {RoleTypeSchema.options.map((role) => <option key={role} value={role}>{role}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="admin-users-provider">{t.provider}</Label>
                <select
                  id="admin-users-provider"
                  value={providerFilter}
                  onChange={(event) => setProviderFilter(event.target.value as AuthProviderType | "all")}
                  className={inputClassName}
                >
                  <option value="all">{t.allProviders}</option>
                  {AuthProviderTypeSchema.options.map((provider) => (
                    <option key={provider} value={provider}>{providerLabel(t, provider)}</option>
                  ))}
                </select>
              </div>
              <p className="text-sm text-muted-foreground lg:pb-1">{filteredUsers.length} / {count} {t.users}</p>
            </div>

            {loading && users.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t.loading}</p>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader className="bg-muted/40">
                    <TableRow>
                      <TableHead>
                        <SortButton active={sortKey === "email"} direction={sortDirection} label={t.email} onClick={() => updateSort("email")} />
                      </TableHead>
                      <TableHead>
                        <SortButton active={sortKey === "full_name"} direction={sortDirection} label={t.fullName} onClick={() => updateSort("full_name")} />
                      </TableHead>
                      <TableHead>
                        <SortButton active={sortKey === "role"} direction={sortDirection} label={t.role} onClick={() => updateSort("role")} />
                      </TableHead>
                      <TableHead>
                        <SortButton active={sortKey === "provider"} direction={sortDirection} label={t.provider} onClick={() => updateSort("provider")} />
                      </TableHead>
                      <TableHead>
                        <SortButton active={sortKey === "status"} direction={sortDirection} label={t.status} onClick={() => updateSort("status")} />
                      </TableHead>
                      <TableHead className="text-right">{t.actions}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.length > 0 ? filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="min-w-56 whitespace-normal">
                          <span className="break-all font-medium">{user.email}</span>
                        </TableCell>
                        <TableCell className="min-w-40 whitespace-normal">{user.full_name || t.noFullName}</TableCell>
                        <TableCell><span className={badgeClassName}>{user.role}</span></TableCell>
                        <TableCell><span className={badgeClassName}>{providerLabel(t, user.provider)}</span></TableCell>
                        <TableCell className="min-w-44 whitespace-normal text-muted-foreground">{userStatus(t, user)}</TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-2">
                            <Button asChild size="sm" variant="outline">
                              <a
                                href={hrefForAdminPage({ name: "edit", userId: user.id })}
                                onClick={(event) => {
                                  event.preventDefault();
                                  navigate({ name: "edit", userId: user.id });
                                }}
                              >
                                <Pencil />
                                {t.edit}
                              </a>
                            </Button>
                            <Button asChild size="sm" variant="destructive">
                              <a
                                href={hrefForAdminPage({ name: "delete", userId: user.id })}
                                onClick={(event) => {
                                  event.preventDefault();
                                  navigate({ name: "delete", userId: user.id });
                                }}
                              >
                                <Trash2 />
                                {t.delete}
                              </a>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )) : (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                          {t.empty}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

export function AdminUsersPanel({ labels }: { labels?: Partial<AdminUsersPanelLabels> }) {
  const t = { ...DEFAULT_LABELS, ...labels };
  return (
    <RequireRole superuser>
      <AdminUsersPanelInner t={t} />
    </RequireRole>
  );
}
