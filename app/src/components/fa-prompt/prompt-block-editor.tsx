"use client";

// Full shadcn prompt-block editor skin. State and API calls come from the
// package hook; forms are validated with Zod before create/update.
import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Download, Plus, Upload } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { usePromptBlocks, usePromptTransfer } from "@mano8/astro-prompt-m8/hooks";
import { promptExportFilename, type PromptBlockPublic } from "@mano8/astro-prompt-m8/schemas";
import { downloadPromptExport, readPromptExportFile } from "@mano8/astro-prompt-m8/react";

import { DataTable, type DataTableFilter } from "@/components/fa-prompt/data-table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export interface PromptBlockEditorLabels {
  title: string;
  subtitle: string;
  create: string;
  edit: string;
  deleteLabel: string;
  deleteTitle: string;
  deleteDescription: string;
  save: string;
  cancel: string;
  actions: string;
  name: string;
  description: string;
  content: string;
  type: string;
  dynamicLabel: string;
  publicLabel: string;
  loading: string;
  empty: string;
  error: string;
  search: string;
  allTypes: string;
  allDynamic: string;
  allPublic: string;
  columns: string;
  selected: (selected: number, total: number) => string;
  exportLabel: string;
  importLabel: string;
  importError: string;
}

const DEFAULT_LABELS: PromptBlockEditorLabels = {
  title: "Prompt blocks",
  subtitle: "Search, filter, select columns, and maintain reusable prompt blocks.",
  create: "New block",
  edit: "Edit",
  deleteLabel: "Delete",
  deleteTitle: "Delete prompt block?",
  deleteDescription: "This removes the block if no template still depends on it.",
  save: "Save",
  cancel: "Cancel",
  actions: "Actions",
  name: "Name",
  description: "Description",
  content: "Content",
  type: "Type",
  dynamicLabel: "Dynamic",
  publicLabel: "Public",
  loading: "Loading...",
  empty: "No prompt blocks.",
  error: "Could not load prompt blocks.",
  search: "Search blocks...",
  allTypes: "All types",
  allDynamic: "Dynamic + static",
  allPublic: "Public + private",
  columns: "Columns",
  selected: (selected, total) => `${selected} of ${total} selected`,
  exportLabel: "Export",
  importLabel: "Import",
  importError: "Could not import file.",
};

const blockTypes = ["role", "task", "context", "instruction", "example", "format"] as const;
const blockFormSchema = z.object({
  name: z.string().trim().min(1).max(100),
  description: z.string().trim().max(1000).optional(),
  content: z.string().min(1).max(5000).refine((value) => value.trim().length > 0),
  type: z.enum(blockTypes),
  is_dynamic: z.boolean(),
  is_public: z.boolean(),
});
type BlockFormValues = z.infer<typeof blockFormSchema>;

const emptyValues: BlockFormValues = {
  name: "",
  description: "",
  content: "",
  type: "role",
  is_dynamic: false,
  is_public: false,
};

export interface PromptBlockEditorProps {
  labels?: Partial<PromptBlockEditorLabels>;
}

function formatBool(value: boolean, yes: string, no: string) {
  return value ? yes : no;
}

export default function PromptBlockEditor({ labels }: PromptBlockEditorProps) {
  const t = { ...DEFAULT_LABELS, ...labels };
  const { data, loading, error, createMutation, updateMutation, deleteMutation, refresh } =
    usePromptBlocks();
  const { exportBlockMutation, importMutation } = usePromptTransfer();
  const [editing, setEditing] = React.useState<PromptBlockPublic | null>(null);
  const [open, setOpen] = React.useState(false);
  const [deleting, setDeleting] = React.useState<PromptBlockPublic | null>(null);
  const [transferStatus, setTransferStatus] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const form = useForm<BlockFormValues>({
    resolver: zodResolver(blockFormSchema),
    defaultValues: emptyValues,
  });

  React.useEffect(() => {
    void refresh();
  }, [refresh]);

  const startCreate = () => {
    setEditing(null);
    form.reset(emptyValues);
    setOpen(true);
  };

  const startEdit = (block: PromptBlockPublic) => {
    setEditing(block);
    form.reset({
      name: block.name,
      description: block.description ?? "",
      content: block.content,
      type: block.type,
      is_dynamic: block.is_dynamic,
      is_public: block.is_public,
    });
    setOpen(true);
  };

  const save = async (values: BlockFormValues) => {
    const body = {
      ...values,
      description: values.description?.trim() ? values.description.trim() : null,
    };
    if (editing) {
      await updateMutation.mutateAsync({ blockId: editing.id, body });
    } else {
      await createMutation.mutateAsync(body);
    }
    setOpen(false);
    setEditing(null);
  };

  const exportBlock = async (block: PromptBlockPublic) => {
    setTransferStatus(null);
    const payload = await exportBlockMutation.mutateAsync(block.id);
    downloadPromptExport(payload, promptExportFilename("block", block.slug));
  };

  const onImportFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setTransferStatus(null);
    try {
      const parsed = await readPromptExportFile(file);
      const result = await importMutation.mutateAsync(parsed);
      setTransferStatus(
        `Imported ${result.blocks.created.length} new, ${result.blocks.reused.length} reused.`,
      );
    } catch {
      setTransferStatus(t.importError);
    }
  };

  const columns = React.useMemo<ColumnDef<PromptBlockPublic>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(Boolean(value))}
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(Boolean(value))}
            aria-label="Select row"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: "name",
        header: ({ column }) => (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            {t.name}
            <ArrowUpDown className="ml-2 size-4" />
          </Button>
        ),
      },
      {
        id: "actions",
        header: t.actions,
        enableHiding: false,
        cell: ({ row }) => (
          <div className="flex min-w-32 flex-wrap gap-1.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 px-2 text-xs"
              onClick={() => void exportBlock(row.original)}
            >
              <Download className="mr-1 size-3.5" />
              {t.exportLabel}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 px-2 text-xs"
              onClick={() => startEdit(row.original)}
            >
              {t.edit}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 px-2 text-xs text-destructive hover:text-destructive"
              onClick={() => setDeleting(row.original)}
            >
              {t.deleteLabel}
            </Button>
          </div>
        ),
      },
      { accessorKey: "type", header: t.type },
      {
        accessorFn: (row) => (row.is_dynamic ? "dynamic" : "static"),
        id: "dynamic",
        header: t.dynamicLabel,
        cell: ({ row }) => (
          <Badge variant={row.original.is_dynamic ? "default" : "secondary"}>
            {formatBool(row.original.is_dynamic, "Dynamic", "Static")}
          </Badge>
        ),
      },
      {
        accessorFn: (row) => (row.is_public ? "public" : "private"),
        id: "visibility",
        header: t.publicLabel,
        cell: ({ row }) => (
          <Badge variant={row.original.is_public ? "default" : "outline"}>
            {formatBool(row.original.is_public, "Public", "Private")}
          </Badge>
        ),
      },
      {
        accessorKey: "description",
        header: t.description,
        cell: ({ row }) => (
          <p className="line-clamp-3 max-w-xl whitespace-pre-wrap text-muted-foreground">
            {row.original.description ?? ""}
          </p>
        ),
      },
      {
        accessorKey: "content",
        header: t.content,
        cell: ({ row }) => (
          <p className="line-clamp-2 max-w-xl whitespace-pre-wrap text-muted-foreground">
            {row.original.content}
          </p>
        ),
      },
    ],
    [t],
  );

  const filters: DataTableFilter[] = [
    {
      columnId: "type",
      label: t.type,
      allLabel: t.allTypes,
      options: blockTypes.map((type) => ({ label: type, value: type })),
    },
    {
      columnId: "dynamic",
      label: t.dynamicLabel,
      allLabel: t.allDynamic,
      options: [
        { label: "Dynamic", value: "dynamic" },
        { label: "Static", value: "static" },
      ],
    },
    {
      columnId: "visibility",
      label: t.publicLabel,
      allLabel: t.allPublic,
      options: [
        { label: "Public", value: "public" },
        { label: "Private", value: "private" },
      ],
    },
  ];

  return (
    <section className="not-content space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-2 pb-3">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold tracking-tight">{t.title}</h2>
          <p className="text-sm text-muted-foreground">{t.subtitle}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={importMutation.isPending}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="mr-2 size-4" />
            {t.importLabel}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={onImportFile}
          />
          <Button type="button" onClick={startCreate}>
            <Plus className="mr-2 size-4" />
            {t.create}
          </Button>
        </div>
      </div>

      {transferStatus ? (
        <p role="status" className="text-sm text-muted-foreground">
          {transferStatus}
        </p>
      ) : null}

      {loading && !data ? <p className="text-sm text-muted-foreground">{t.loading}</p> : null}
      {error && !data ? (
        <p role="alert" className="text-sm text-destructive">
          {t.error}
        </p>
      ) : null}

      <DataTable
        key="prompt-block-table-actions-v2"
        columns={columns}
        data={data?.data ?? []}
        searchColumn="name"
        searchPlaceholder={t.search}
        filters={filters}
        emptyMessage={t.empty}
        columnsLabel={t.columns}
        selectedLabel={t.selected}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? t.edit : t.create}</DialogTitle>
            <DialogDescription>{t.subtitle}</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(save)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.name}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.description}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.content}</FormLabel>
                    <FormControl>
                      <Textarea rows={6} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.type}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {blockTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="is_dynamic"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>{t.dynamicLabel}</FormLabel>
                        <FormDescription>Prompt composer can ask for runtime content.</FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="is_public"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>{t.publicLabel}</FormLabel>
                        <FormDescription>Available outside private owner scope.</FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  {t.cancel}
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {t.save}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleting !== null} onOpenChange={(next) => !next && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.deleteTitle}</AlertDialogTitle>
            <AlertDialogDescription>
              {deleting?.name}: {t.deleteDescription}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.cancel}</AlertDialogCancel>
            <AlertDialogAction
              disabled={deleteMutation.isPending}
              onClick={() => {
                if (!deleting) return;
                void deleteMutation.mutateAsync(deleting.id).finally(() => setDeleting(null));
              }}
            >
              {t.deleteLabel}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
