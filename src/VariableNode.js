import { Node, mergeAttributes } from '@tiptap/core';

const PILL_STYLE = [
  'display:inline-flex',
  'align-items:center',
  'background:#F7F7F7',
  'color:#424242',
  'border-radius:6px',
  'padding:4px 8px 4px 6px',
  'margin:0 2px',
  'font-size:12px',
  'font-weight:500',
  'line-height:16px',
  'white-space:nowrap',
  'vertical-align:baseline',
  'user-select:none',
].join(';');

const VariableNode = Node.create({
  name: 'variable',
  group: 'inline',
  inline: true,
  atom: true,
  selectable: true,
  draggable: false,

  addAttributes() {
    return {
      id: { default: null },
      name: { default: null },
      varType: { default: 'String' },
    };
  },

  parseHTML() {
    return [{ tag: 'span[data-variable-id]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(HTMLAttributes, {
        'data-variable-id': HTMLAttributes.id,
        'data-variable-type': HTMLAttributes.varType,
        style: PILL_STYLE,
      }),
      HTMLAttributes.name || HTMLAttributes.id,
    ];
  },
});

export default VariableNode;
