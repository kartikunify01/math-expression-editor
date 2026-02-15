import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import FORMULAS from './formulas';

const FORMULA_NAMES = new Set(FORMULAS.map((f) => f.name));
const FN_REGEX = /\b([A-Z_]{2,})\s*(?=\()/g;

const fnHighlightKey = new PluginKey('functionHighlight');

const FunctionHighlight = Extension.create({
  name: 'functionHighlight',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: fnHighlightKey,
        state: {
          init(_, { doc }) {
            return buildDecorations(doc);
          },
          apply(tr, oldSet) {
            if (tr.docChanged) return buildDecorations(tr.doc);
            return oldSet;
          },
        },
        props: {
          decorations(state) {
            return this.getState(state);
          },
        },
      }),
    ];
  },
});

function buildDecorations(doc) {
  const decorations = [];

  doc.descendants((node, pos) => {
    if (!node.isText) return;

    FN_REGEX.lastIndex = 0;
    let match;
    while ((match = FN_REGEX.exec(node.text)) !== null) {
      const name = match[1];
      if (FORMULA_NAMES.has(name)) {
        const from = pos + match.index;
        const to = from + name.length;
        decorations.push(
          Decoration.inline(from, to, {
            style: "color:#1570EF;font-size:12px;line-height:16px;font-weight:500;font-family:'JetBrains Mono',monospace",
          }),
        );
      }
    }
  });

  return DecorationSet.create(doc, decorations);
}

export default FunctionHighlight;
