import { Node, mergeAttributes } from '@tiptap/core';
import { ICON_MAP } from './icons';
const PILL_STYLE = [
  'display:inline-flex',
  'box-sizing:border-box',
  'align-items:center',
  'background:#F7F7F7',
  'color:#424242',
  'border-radius:6px',
  'padding:4px 8px 4px 6px',
  'margin:0 2px',
  'font-size:12px',
  'line-height:16px',
  'white-space:nowrap',
  'vertical-align:center',
  'user-select:none',
  'min-width:20px',
  'overflow:hidden',
  'text-overflow:ellipsis',
  'height:24px',
  'gap:6px',
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
    console.log('Rendering variable node with attributes: ', HTMLAttributes);
    const type = HTMLAttributes.varType || 'String';
    return [
      'span',
      mergeAttributes(HTMLAttributes, {
        'data-variable-id': HTMLAttributes.id,
        'data-variable-type': type,
        style: PILL_STYLE,
      }),
      [
        'span',
        {
          style: `
          display:inline-flex;
          align-items:center;
          gap:4px;
        `,
        },
        [
          'img',
          {
            src: ICON_MAP[type],
            alt: type,
            width: 14,
            height: 14,
            style: 'display:block;',
          },
        ],
        [
          'span',
          {
            style: `
              margin:auto 0;
              line-height:16px;
            `

          },
          HTMLAttributes.name || HTMLAttributes.id,
        ],
      ],
    ];
  },
});

export default VariableNode;
