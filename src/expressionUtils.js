import FORMULAS from './formulas';

const VAR_REGEX = /\{\{\s*(\S+?)\s*\}\}/g;
const FORMULA_NAMES = new Set(FORMULAS.map((f) => f.name));

/**
 * Serialize TipTap JSON doc → expression string.
 * Variables become {{ varId }}, everything else is plain text.
 */
export function serializeExpression(doc) {
  if (!doc?.content) return { expression: '', variableIds: [] };
  let result = '';
  const idSet = new Set();
  for (const block of doc.content) {
    if (block.content) {
      for (const node of block.content) {
        if (node.type === 'variable') {
          result += `{{ ${node.attrs.id} }}`;
          idSet.add(node.attrs.id);
        } else if (node.type === 'text') {
          result += node.text;
        }
      }
    }
  }
  return { expression: result, variableIds: [...idSet] };
}

/**
 * Deserialize expression string → TipTap JSON doc.
 * Replaces {{ varId }} with variable nodes, highlights formula names in text.
 */
export function deserializeExpression(expression, variables) {
  if (!expression) {
    return { type: 'doc', content: [{ type: 'paragraph' }] };
  }

  const varMap = new Map();
  if (variables) {
    for (const v of variables) {
      varMap.set(v.id, v);
    }
  }

  const content = [];
  let lastIndex = 0;

  VAR_REGEX.lastIndex = 0;
  let match;
  while ((match = VAR_REGEX.exec(expression)) !== null) {
    if (match.index > lastIndex) {
      content.push({ type: 'text', text: expression.slice(lastIndex, match.index) });
    }
    const varId = match[1];
    const variable = varMap.get(varId);
    content.push({
      type: 'variable',
      attrs: {
        id: varId,
        name: variable?.name ?? varId,
        varType: variable?.type ?? 'String',
      },
    });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < expression.length) {
    content.push({ type: 'text', text: expression.slice(lastIndex) });
  }

  return {
    type: 'doc',
    content: [{ type: 'paragraph', content: content.length > 0 ? content : undefined }],
  };
}

/**
 * Get the current word being typed before the cursor for autocomplete.
 * Returns { word, range } or null.
 */
export function getQueryBeforeCursor(editor) {
  const { state } = editor;
  const { from } = state.selection;
  const textBefore = state.doc.textBetween(
    Math.max(0, from - 50),
    from,
    '\0',
  );

  const match = textBefore.match(/([a-zA-Z_]\w*)$/);
  if (!match) return null;

  const word = match[1];
  return {
    word,
    from: from - word.length,
    to: from,
  };
}

/**
 * Detect if cursor is inside a function call's parentheses.
 * Returns the formula object or null.
 */
export function detectFunctionContext(editor) {
  const { state } = editor;
  const { from } = state.selection;
  const textBefore = state.doc.textBetween(0, from, '\0', ' ');

  let depth = 0;
  for (let i = textBefore.length - 1; i >= 0; i--) {
    const ch = textBefore[i];
    if (ch === ')') depth++;
    else if (ch === '(') {
      if (depth === 0) {
        const before = textBefore.slice(0, i).trimEnd();
        const fnMatch = before.match(/([A-Z_]+)$/);
        if (fnMatch) {
          const name = fnMatch[1];
          return FORMULAS.find((f) => f.name === name) || null;
        }
        return null;
      }
      depth--;
    }
  }
  return null;
}

/**
 * Parse expression tokens for readonly rendering.
 * Returns array of { type: 'text' | 'variable' | 'function', value, ... }
 */
export function parseExpressionTokens(expression, variables) {
  if (!expression) return [];

  const varMap = new Map();
  if (variables) {
    for (const v of variables) {
      varMap.set(v.id, v);
    }
  }

  const tokens = [];
  let lastIndex = 0;

  VAR_REGEX.lastIndex = 0;
  let match;
  while ((match = VAR_REGEX.exec(expression)) !== null) {
    if (match.index > lastIndex) {
      tokenizeText(expression.slice(lastIndex, match.index), tokens);
    }
    const varId = match[1];
    const variable = varMap.get(varId);
    tokens.push({
      type: 'variable',
      id: varId,
      name: variable?.name ?? varId,
      varType: variable?.type ?? 'String',
    });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < expression.length) {
    tokenizeText(expression.slice(lastIndex), tokens);
  }

  return tokens;
}

function tokenizeText(text, tokens) {
  const fnRegex = /\b([A-Z_]{2,})\s*(?=\()/g;
  let last = 0;
  let m;
  while ((m = fnRegex.exec(text)) !== null) {
    if (m.index > last) {
      tokens.push({ type: 'text', value: text.slice(last, m.index) });
    }
    tokens.push({
      type: FORMULA_NAMES.has(m[1]) ? 'function' : 'text',
      value: m[1],
    });
    last = m.index + m[1].length;
  }
  if (last < text.length) {
    tokens.push({ type: 'text', value: text.slice(last) });
  }
}
