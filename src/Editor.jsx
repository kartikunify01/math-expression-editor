import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import VariableNode from './VariableNode';
import FunctionHighlight from './FunctionHighlight';
import Dropdown from './Dropdown';
import FORMULAS from './formulas';
import {
  serializeExpression,
  deserializeExpression,
  getQueryBeforeCursor,
  detectFunctionContext,
} from './expressionUtils';

const S = {
  wrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    border: '1px solid #f0f0f0',
    borderColor: '#f0f0f0',
    borderRadius: 8,
    background: '#fff',
    padding: '5px 8px',
    height: 36,
    boxSizing: 'border-box',
    overflow: 'hidden',
  },
  wrapperFocused: {
    borderColor: '#b19fef',
  },
  placeholder: {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    left: 8,
    right: 8,
    color: '#0000004d',
    fontSize: 14,
    fontStyle: 'normal',
    fontWeight: 400,
    lineHeight: '20px',
    pointerEvents: 'none',
    fontFamily: 'inherit',
  },
  editorContainer: {
    flex: 1,
    minWidth: 0,
    overflowX: 'auto',
    overflowY: 'hidden',
  },
};

const EDITOR_ATTR_STYLE =
  'outline:none;border:none;box-shadow:none;width:100%;min-height:20px;white-space:nowrap;font-size:14px;color:#1C1C1C;line-height:20px;font-weight:400;font-family:inherit;';

export default function Editor({ expression, variables, onChange, placeholder = '' }) {
  const containerRef = useRef(null);
  const [focused, setFocused] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [query, setQuery] = useState(null);
  const [functionHint, setFunctionHint] = useState(null);
  const suppressRef = useRef(false);
  const stateRef = useRef({});
  const interactingRef = useRef(false);

  const initialContent = useMemo(
    () => deserializeExpression(expression, variables),
    [],
  );

  const updateAutocomplete = useCallback((ed) => {
    const fnCtx = detectFunctionContext(ed);
    setFunctionHint(fnCtx);
    const q = getQueryBeforeCursor(ed);
    setQuery(q);
    setDropdownVisible(Boolean(q?.word || fnCtx));
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        blockquote: false,
        bulletList: false,
        orderedList: false,
        codeBlock: false,
        horizontalRule: false,
        listItem: false,
      }),
      VariableNode,
      FunctionHighlight,
    ],
    content: initialContent,
    editorProps: {
      attributes: { style: EDITOR_ATTR_STYLE },
    },
    onUpdate: ({ editor: ed }) => {
      if (suppressRef.current) return;
      updateAutocomplete(ed);
    },
    onSelectionUpdate: ({ editor: ed }) => {
      if (suppressRef.current) return;
      updateAutocomplete(ed);
    },
    onBlur: ({ editor: ed }) => {
      setFocused(false);
      const { expression: expr, variableIds } = serializeExpression(ed.getJSON());
      onChange?.(expr, variableIds);
      setTimeout(() => {
        if (interactingRef.current) {
          interactingRef.current = false;
          return;
        }
        setDropdownVisible(false);
      }, 200);
    },
    onFocus: ({ editor: ed }) => {
      setFocused(true);
      updateAutocomplete(ed);
    },
  });

  const variableItems = useMemo(
    () => (variables || []).map((v) => ({ ...v, itemType: 'variable' })),
    [variables],
  );

  const formulaItems = useMemo(
    () => FORMULAS.map((f) => ({ ...f, itemType: 'function' })),
    [],
  );

  const allItems = useMemo(
    () => [...variableItems, ...formulaItems],
    [variableItems, formulaItems],
  );

  const filteredItems = useMemo(() => {
    if (!query?.word) return allItems;
    const q = query.word.toLowerCase();
    return allItems.filter((item) => item.name.toLowerCase().includes(q));
  }, [query, allItems]);

  useEffect(() => {
    setActiveIndex(0);
  }, [filteredItems.length]);

  const handleSelect = useCallback(
    (item) => {
      if (!editor) return;
      const currentQuery = stateRef.current.query;

      suppressRef.current = true;

      if (item.itemType === 'variable') {
        const chain = editor.chain().focus();
        if (currentQuery) chain.deleteRange({ from: currentQuery.from, to: currentQuery.to });
        chain
          .insertContent({
            type: 'variable',
            attrs: { id: item.id, name: item.name, varType: item.type },
          })
          .insertContent(' ')
          .run();
      } else {
        const chain = editor.chain().focus();
        if (currentQuery) chain.deleteRange({ from: currentQuery.from, to: currentQuery.to });
        chain.insertContent(`${item.name}()`).run();
        const pos = editor.state.selection.from - 1;
        editor.commands.setTextSelection(pos);
      }

      suppressRef.current = false;

      setDropdownVisible(false);
      setQuery(null);

      setTimeout(() => updateAutocomplete(editor), 0);
    },
    [editor, onChange, updateAutocomplete],
  );

  useEffect(() => {
    stateRef.current = { dropdownVisible, filteredItems, activeIndex, handleSelect, query };
  });

  useEffect(() => {
    if (!editor) return;
    const dom = editor.view.dom;

    const handler = (event) => {
      const { dropdownVisible: visible, filteredItems: items, activeIndex: idx, handleSelect: select } =
        stateRef.current;

      if (event.key === 'Enter') {
        event.preventDefault();
        if (visible && items?.length > 0) select(items[idx] || items[0]);
        return;
      }
      if (!visible) return;

      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setActiveIndex((prev) => Math.min(prev + 1, (items?.length || 1) - 1));
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        setActiveIndex((prev) => Math.max(prev - 1, 0));
      } else if (event.key === 'Tab') {
        if (items?.length > 0) {
          event.preventDefault();
          select(items[idx] || items[0]);
        }
      } else if (event.key === 'Escape') {
        event.preventDefault();
        setDropdownVisible(false);
      }
    };

    dom.addEventListener('keydown', handler, true);
    return () => dom.removeEventListener('keydown', handler, true);
  }, [editor]);

  if (!editor) return null;

  const wrapperStyle = focused
    ? { ...S.wrapper, ...S.wrapperFocused }
    : S.wrapper;

  const isEmpty = editor.isEmpty;

  return (
    <div style={wrapperStyle} ref={containerRef}>
      {isEmpty && <div style={S.placeholder}>{placeholder}</div>}
      <div style={S.editorContainer}>
        <EditorContent editor={editor} />
      </div>
      <Dropdown
        anchorRef={containerRef}
        items={query?.word ? filteredItems : []}
        activeIndex={activeIndex}
        onSelect={handleSelect}
        functionHint={query?.word ? null : functionHint}
        visible={dropdownVisible}
        interactingRef={interactingRef}
      />
    </div>
  );
}
