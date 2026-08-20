import { Crepe, CrepeFeature } from "@milkdown/crepe";
import { editorViewCtx, parserCtx } from "@milkdown/core";
import { EditorView } from "@codemirror/view";
import { uploadConfig } from "@milkdown/plugin-upload";
import { missingNodeInSchema } from "@milkdown/exception";
import { compressImageFile } from "./image-compress";

// Import individual common CSS pieces; skip latex.css (pulls in KaTeX fonts)
// and feature CSS for disabled features.
import "@milkdown/crepe/theme/common/prosemirror.css";
import "@milkdown/crepe/theme/common/reset.css";
import "@milkdown/crepe/theme/common/cursor.css";
import "@milkdown/crepe/theme/common/block-edit.css";
import "@milkdown/crepe/theme/common/code-mirror.css";
import "@milkdown/crepe/theme/common/link-tooltip.css";
import "@milkdown/crepe/theme/common/list-item.css";
import "@milkdown/crepe/theme/common/placeholder.css";
import "@milkdown/crepe/theme/common/toolbar.css";
import "@milkdown/crepe/theme/common/table.css";
import "@milkdown/crepe/theme/common/diff.css";
import "./styles.css";

export interface EditorHandle {
  replaceContent: (markdown: string) => boolean;
  getMarkdown: () => string;
  setReadonly: (readonly: boolean) => void;
  destroy: () => void;
}

export interface CreateOptions {
  root: HTMLElement;
  initialValue: string;
  onChange?: (markdown: string) => void;
  readOnly?: boolean;
}

export async function create(options: CreateOptions): Promise<EditorHandle> {
  const { root, initialValue, onChange, readOnly } = options;

  let suppressNextChange = false;
  let destroyed = false;

  root.classList.add("mdp-editor-wrapper");

  const crepe = new Crepe({
    root,
    defaultValue: initialValue,
    features: {
      [CrepeFeature.ImageBlock]: false,
      [CrepeFeature.Latex]: false,
      [CrepeFeature.TopBar]: false,
      [CrepeFeature.AI]: false,
    },
    featureConfigs: {
      [CrepeFeature.Placeholder]: {
        text: "Type / for commands…",
        mode: "block",
      },
      [CrepeFeature.CodeMirror]: {
        // Typora-style code blocks: soft-wrap long lines instead of
        // horizontal scrolling. Line numbers/active-line chrome from
        // basicSetup are hidden in styles.css.
        extensions: [EditorView.lineWrapping],
      },
    },
  });

  crepe.editor.config((ctx) => {
    ctx.update(uploadConfig.key, (prev) => ({
      ...prev,
      uploader: async (files, schema) => {
        const imageNode = schema.nodes.image;
        if (!imageNode) throw missingNodeInSchema("image");
        const imgs: File[] = [];
        for (let i = 0; i < files.length; i++) {
          const f = files.item(i);
          if (f && f.type.startsWith("image/")) imgs.push(f);
        }
        const compressed = await Promise.all(imgs.map(compressImageFile));
        return compressed
          .map(({ alt, dataUrl }) => imageNode.createAndFill({ src: dataUrl, alt }))
          .filter((node): node is NonNullable<typeof node> => node !== null);
      },
    }));
  });

  crepe.on((listener) => {
    listener.markdownUpdated((_ctx, markdown) => {
      if (destroyed) return;
      if (suppressNextChange) {
        suppressNextChange = false;
        return;
      }
      onChange?.(markdown);
    });
  });

  if (readOnly) crepe.setReadonly(true);

  await crepe.create();

  return {
    replaceContent(markdown: string): boolean {
      try {
        suppressNextChange = true;
        crepe.editor.action((ctx) => {
          const view = ctx.get(editorViewCtx);
          const parser = ctx.get(parserCtx);
          const doc = parser(markdown);
          if (!doc) return;
          const tr = view.state.tr.replaceWith(
            0,
            view.state.doc.content.size,
            doc.content
          );
          view.dispatch(tr);
        });
        return true;
      } catch {
        suppressNextChange = false;
        return false;
      }
    },
    getMarkdown(): string {
      return crepe.getMarkdown();
    },
    setReadonly(value: boolean): void {
      crepe.setReadonly(value);
    },
    destroy(): void {
      destroyed = true;
      root.classList.remove("mdp-editor-wrapper");
      void crepe.destroy();
    },
  };
}
