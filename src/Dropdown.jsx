import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ICON_MAP } from './icons';

const styles = {
  dropdown: {
    background: '#fff',
    border: '1px solid #f0f0f0',
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    boxShadow: '0 12px 16px -4px rgba(16,24,40,0.08), 0 4px 6px -2px rgba(16,24,40,0.03)',
    maxHeight: 280,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
    borderBottom: '1px solid #f0f0f0',
    width: '100%',
    marginTop: -2,
    borderTop: 'none',
  },
  header: {
    padding: '8px 12px',
    fontSize: 11,
    color: '#525252',
    lineHeight: '12px',
    fontWeight: 500,
    height: 24,
    fontFamily: 'geist',
    paragraphSpacing: 8,
  },
  list: {
    overflowY: 'auto',
    maxHeight: 220,
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    cursor: 'pointer',
    height: 28,
  },
  innerItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 12px 4px 8px',
    width: '100%',
    height: '100%',
  },
  itemActive: {
    background: '#F7F7FF',
  },
  fnName: {
    color: '#1570EF',
    fontSize: 12,
    lineHeight: '16px',
    fontWeight: 400,
    fontFamily: 'geist',
  },
  varName: {
    color: '#1C1C1C',
    fontSize: 12,
    lineHeight: '16px',
    fontWeight: 400,
    fontFamily: 'geist',
  },
  type: {
    fontSize: 12,
    color: '#525252',
    lineHeight: '16px',
    fontWeight: 400,
    marginLeft: 12,
    flexShrink: 0,
  },
  hint: {
    padding: '10px 12px',
    borderBottom: '1px solid #f0f0f0',
  },
  signature: {
    fontSize: 12,
    color: '#1C1C1C',
    fontFamily: "'JetBrains Mono', monospace",
    lineHeight: '16px',
    marginBottom: 2,
  },
  description: {
    fontSize: 11,
    color: '#525252',
    lineHeight: '14px',
  },
};

function getPortalContainer() {
  try {
    if (window.self !== window.top && window.top?.document?.body) {
      return window.top.document.body;
    }
  } catch (_) {}
  return document.body;
}

function computePosition(anchorEl) {
  const rect = anchorEl.getBoundingClientRect();
  let iframeEl;
  try {
    iframeEl = window.frameElement;
  } catch (_) {
    iframeEl = null;
  }

  if (iframeEl) {
    const iframeRect = iframeEl.getBoundingClientRect();
    return {
      top: iframeRect.top + rect.bottom + 4,
      left: iframeRect.left + rect.left,
      width: rect.width,
    };
  }
  return { top: rect.bottom + 4, left: rect.left, width: rect.width };
}

export default function Dropdown({
  anchorRef,
  items,
  onSelect,
  activeIndex,
  functionHint,
  visible,
  interactingRef,
}) {
  const listRef = useRef(null);
  const dropdownRef = useRef(null);
  const [portalContainer, setPortalContainer] = useState(null);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 300 });

  const onSelectRef = useRef(onSelect);
  const itemsRef = useRef(items);
  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useEffect(() => {
    setPortalContainer(getPortalContainer());
  }, []);

  useEffect(() => {
    if (!visible || !anchorRef?.current) return;

    const update = () => {
      if (anchorRef.current) setPosition(computePosition(anchorRef.current));
    };

    update();

    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    try {
      if (window.top && window.top !== window.self) {
        window.top.addEventListener('scroll', update, true);
        window.top.addEventListener('resize', update);
      }
    } catch (_) {}

    return () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
      try {
        if (window.top && window.top !== window.self) {
          window.top.removeEventListener('scroll', update, true);
          window.top.removeEventListener('resize', update);
        }
      } catch (_) {}
    };
  }, [visible, anchorRef]);

  const attachNativeListeners = useCallback(
    (el) => {
      dropdownRef.current = el;
      if (!el) return;

      el.addEventListener('mousedown', (e) => {
        if (interactingRef) interactingRef.current = true;

        const itemEl = e.target.closest('[data-item-index]');
        if (itemEl) {
          e.preventDefault();
          const idx = parseInt(itemEl.dataset.itemIndex, 10);
          const item = itemsRef.current[idx];
          if (item) onSelectRef.current(item);
        }
      });
    },
    [interactingRef],
  );

  useEffect(() => {
    if (listRef.current && activeIndex >= 0) {
      const el = listRef.current.children[activeIndex];
      if (el) el.scrollIntoView({ block: 'nearest' });
    }
  }, [activeIndex]);

  if (!visible || !portalContainer) return null;
  if (!functionHint && items.length === 0) return null;

  const posStyle = {
    position: 'fixed',
    top: position.top,
    left: position.left,
    width: position.width,
    zIndex: 99999,
  };
  console.log('items: ', items);
  const content = (
    <div ref={attachNativeListeners} style={{ ...styles.dropdown, ...posStyle }}>
      {functionHint && (
        <div style={styles.hint}>
          <div style={styles.signature}>{functionHint.signature}</div>
          <div style={styles.description}>{functionHint.description}</div>
        </div>
      )}
      {items.length > 0 && (
        <>
          <div style={styles.header}>Input variables or functions</div>
          <div style={styles.list} ref={listRef}>
            {items.map((item, i) => {
              return (
                <div
                  key={item.id || item.name}
                  data-item-index={i}
                  style={{
                    ...styles.item,
                    ...(i === activeIndex ? styles.itemActive : undefined),
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#F7F7FF';
                  }}
                  onMouseLeave={(e) => {
                    if (i !== activeIndex) e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <div
                    style={{
                      ...styles.innerItem,
                      margin: '0 4px',
                      borderTop: i === 0 ? 'none' : '1px solid #f0f0f0',
                    }}
                  >
                    <span style={item.itemType === 'function' ? styles.fnName : styles.varName}>
                      {item.itemType === 'function' ? `${item.name}()` : item.name}
                    </span>
                    <span style={styles.type}>
                      {item.itemType === 'function' ? (
                        'Function'
                      ) : (
                        <span style={{ display: 'inline-flex', gap: 4, alignItems: 'center' }}>
                          <img
                            src={ICON_MAP[item.type || 'Integer']}
                            alt={item.type || 'Integer'}
                            width={14}
                            height={14}
                          />
                          <span>{item.type || 'Integer'}</span>
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              );
              // </div>
            })}
          </div>
        </>
      )}
    </div>
  );

  return createPortal(content, portalContainer);
}
