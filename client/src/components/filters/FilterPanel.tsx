import React, { useMemo, useState, useCallback } from 'react';
import type { Category, Marker } from '@gpkarta/shared';
import { useUiStore } from '../../store/uiStore';

interface FilterPanelProps {
  categories: Category[];
  markers: Marker[];
  totalCount: number;
  filteredCount: number;
  hideable?: boolean;
  showThemeToggle?: boolean;
  initialHiddenKeys?: string[];
  onHiddenKeysChange?: (keys: string[]) => void;
}

// ── Theme ─────────────────────────────────────────────────────────────────────

interface Theme {
  bg: string;
  border: string;
  sectionBorder: string;
  text: string;
  muted: string;
  accent: string;
  activeBg: string;
  checkBorder: string;
  inputBg: string;
  inputBorder: string;
  buttonBg: string;
  buttonText: string;
  buttonBorder: string;
}

const LIGHT: Theme = {
  bg: '#fff',
  border: '#e5e7eb',
  sectionBorder: '#f3f4f6',
  text: '#374151',
  muted: '#9ca3af',
  accent: '#2563eb',
  activeBg: '#eff6ff',
  checkBorder: '#d1d5db',
  inputBg: '#fff',
  inputBorder: '#e5e7eb',
  buttonBg: '#fff',
  buttonText: '#374151',
  buttonBorder: '#e5e7eb',
};

const DARK: Theme = {
  bg: '#1e2433',
  border: '#2d3748',
  sectionBorder: '#2d3748',
  text: '#e2e8f0',
  muted: '#718096',
  accent: '#63b3ed',
  activeBg: 'rgba(99,179,237,0.12)',
  checkBorder: '#4a5568',
  inputBg: '#2d3748',
  inputBorder: '#4a5568',
  buttonBg: '#1e2433',
  buttonText: '#e2e8f0',
  buttonBorder: '#2d3748',
};

// ── Persistence helpers ───────────────────────────────────────────────────────

const LS_KEY = 'gpkarta:hidden-filters';

function loadHidden(): Set<string> {
  try { return new Set(JSON.parse(localStorage.getItem(LS_KEY) ?? '[]')); } catch { return new Set(); }
}

function saveHidden(keys: Set<string>) {
  localStorage.setItem(LS_KEY, JSON.stringify([...keys]));
}

// ── Field descriptor ──────────────────────────────────────────────────────────

type FieldDescriptor =
  | { kind: 'chips'; key: string; label: string; options: string[] }
  | { kind: 'range'; key: string; label: string; min: number; max: number };

const NAMED_FIELDS: Array<{ key: string; label: string }> = [
  { key: 'region', label: 'Region' },
  { key: 'genderVictim', label: 'Kön (offer)' },
  { key: 'ageVictim', label: 'Ålder (offer)' },
  { key: 'genderPerpetrator', label: 'Kön (gärningsman)' },
  { key: 'punishment', label: 'Påföljd' },
  { key: 'punishmentYears', label: 'Påföljd (år)' },
];

function prettyLabel(key: string) {
  return key.replace(/_/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2').replace(/\b\w/g, (c) => c.toUpperCase());
}

function buildFieldDescriptors(markers: Marker[]): FieldDescriptor[] {
  const descriptors: FieldDescriptor[] = [];

  for (const { key, label } of NAMED_FIELDS) {
    const values = markers.map((m) => (m as any)[key]).filter((v) => v != null);
    if (!values.length) continue;
    if (values.every((v) => typeof v === 'number')) {
      const nums = values as number[];
      descriptors.push({ kind: 'range', key, label, min: Math.floor(Math.min(...nums)), max: Math.ceil(Math.max(...nums)) });
    } else {
      const opts = [...new Set(values.map(String))].sort();
      if (opts.length) descriptors.push({ kind: 'chips', key, label, options: opts });
    }
  }

  const customKeys = new Set<string>();
  for (const m of markers) {
    if (m.customFields) Object.keys(m.customFields).forEach((k) => customKeys.add(k));
  }

  for (const key of [...customKeys].sort()) {
    const values = markers.map((m) => m.customFields?.[key]).filter((v) => v != null);
    if (!values.length) continue;
    if (values.every((v) => typeof v === 'number')) {
      const nums = values as number[];
      descriptors.push({ kind: 'range', key: `cf:${key}`, label: prettyLabel(key), min: Math.floor(Math.min(...nums)), max: Math.ceil(Math.max(...nums)) });
    } else {
      const opts = [...new Set(values.map(String))].sort();
      if (opts.length) descriptors.push({ kind: 'chips', key: `cf:${key}`, label: prettyLabel(key), options: opts });
    }
  }

  return descriptors;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function ChipGroup({ options, active, onToggle, onOnly, theme }: {
  options: string[]; active: string[];
  onToggle: (v: string) => void; onOnly: (v: string) => void;
  theme: Theme;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {options.map((val) => {
        const on = active.includes(val);
        return (
          <div key={val} style={{ display: 'flex', alignItems: 'center', borderRadius: 6, background: on ? theme.activeBg : 'transparent' }}>
            <button
              onClick={() => onToggle(val)}
              style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, padding: '5px 8px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
            >
              <span style={{
                width: 15, height: 15, borderRadius: 3, flexShrink: 0,
                border: `2px solid ${on ? theme.accent : theme.checkBorder}`,
                background: on ? theme.accent : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {on && <span style={{ color: '#fff', fontSize: 9, fontWeight: 700 }}>✓</span>}
              </span>
              <span style={{ fontSize: 13, color: theme.text, fontWeight: on ? 500 : 400 }}>{val}</span>
            </button>
            <button
              onClick={() => onOnly(val)}
              style={{ padding: '4px 8px', fontSize: 10, color: theme.muted, background: 'none', border: 'none', cursor: 'pointer' }}
              title="Visa bara detta"
            >
              bara
            </button>
          </div>
        );
      })}
    </div>
  );
}

function RangeSlider({ min, max, valueMin, valueMax, onChange, theme }: {
  min: number; max: number; valueMin: number; valueMax: number;
  onChange: (min: number, max: number) => void;
  theme: Theme;
}) {
  const isDefault = valueMin === min && valueMax === max;
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 4 }}>
        <span style={{ fontSize: 11, color: isDefault ? theme.checkBorder : theme.accent, fontWeight: 500 }}>
          {isDefault ? 'Alla' : `${valueMin}–${valueMax}`}
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 10, color: theme.muted, width: 20 }}>Min</span>
          <input type="range" min={min} max={max} value={valueMin}
            onChange={(e) => onChange(Math.min(+e.target.value, valueMax), valueMax)}
            style={{ flex: 1, accentColor: theme.accent }} />
          <span style={{ fontSize: 11, color: theme.text, width: 28, textAlign: 'right' }}>{valueMin}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 10, color: theme.muted, width: 20 }}>Max</span>
          <input type="range" min={min} max={max} value={valueMax}
            onChange={(e) => onChange(valueMin, Math.max(+e.target.value, valueMin))}
            style={{ flex: 1, accentColor: theme.accent }} />
          <span style={{ fontSize: 11, color: theme.text, width: 28, textAlign: 'right' }}>{valueMax}</span>
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function FilterPanel({ categories, markers, totalCount, filteredCount, hideable = true, showThemeToggle = false, initialHiddenKeys, onHiddenKeysChange }: FilterPanelProps) {
  const {
    filterPanelOpen, toggleFilterPanel,
    filterCategoryIds, filterFrom, filterTo,
    activeFilters, activeRanges,
    setFilterCategories, setFilterFrom, setFilterTo,
    setActiveFilter, setActiveRange,
    clearFilters,
    filterDarkMode, toggleFilterDarkMode,
  } = useUiStore();

  const theme = filterDarkMode ? DARK : LIGHT;

  const [hiddenKeys, setHiddenKeys] = useState<Set<string>>(() =>
    initialHiddenKeys !== undefined ? new Set(initialHiddenKeys) : loadHidden()
  );
  const [showingHidden, setShowingHidden] = useState(false);

  const persistHidden = useCallback((next: Set<string>) => {
    if (initialHiddenKeys === undefined) saveHidden(next);
    onHiddenKeysChange?.([...next]);
  }, [initialHiddenKeys, onHiddenKeysChange]);

  const hideField = useCallback((key: string) => {
    setHiddenKeys((prev) => {
      const next = new Set(prev).add(key);
      persistHidden(next);
      return next;
    });
    setActiveFilter(key, []);
  }, [setActiveFilter, persistHidden]);

  const restoreAll = useCallback(() => {
    const next = new Set<string>();
    persistHidden(next);
    setHiddenKeys(next);
    setShowingHidden(false);
  }, [persistHidden]);

  const fieldDescriptors = useMemo(() => buildFieldDescriptors(markers), [markers]);
  const visibleFields = fieldDescriptors.filter((fd) => !hiddenKeys.has(fd.key));
  const hiddenFields = fieldDescriptors.filter((fd) => hiddenKeys.has(fd.key));

  const hasFilters = filterCategoryIds.length > 0 || filterFrom || filterTo ||
    Object.values(activeFilters).some((v) => v.length > 0) ||
    Object.keys(activeRanges).length > 0;

  const activeCount = [
    filterCategoryIds.length > 0,
    filterFrom || filterTo,
    ...Object.values(activeFilters).map((v) => v.length > 0),
    ...Object.keys(activeRanges).map(() => true),
  ].filter(Boolean).length;

  function toggleChip(key: string, val: string) {
    const cur = activeFilters[key] ?? [];
    setActiveFilter(key, cur.includes(val) ? cur.filter((v) => v !== val) : [...cur, val]);
  }

  return (
    <div style={{ position: 'absolute', top: 10, left: 50, zIndex: 400, display: 'flex', flexDirection: 'column', pointerEvents: 'none' }}>
      <div style={{ display: 'flex', gap: 4, pointerEvents: 'all' }}>
        <button
          onClick={toggleFilterPanel}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '7px 12px',
            background: filterPanelOpen ? theme.accent : theme.buttonBg,
            color: filterPanelOpen ? '#fff' : theme.buttonText,
            border: '1px solid',
            borderColor: filterPanelOpen ? theme.accent : theme.buttonBorder,
            borderRadius: filterPanelOpen ? '8px 8px 0 0' : 8,
            cursor: 'pointer', fontSize: 13, fontWeight: 500,
            boxShadow: filterPanelOpen ? 'none' : '0 1px 5px rgba(0,0,0,0.15)',
          }}
        >
          <span style={{ fontSize: 12 }}>▼</span>
          Filter
          {activeCount > 0 && (
            <span style={{
              background: filterPanelOpen ? 'rgba(255,255,255,0.3)' : theme.accent,
              color: '#fff', borderRadius: 99, padding: '1px 6px', fontSize: 11, fontWeight: 700,
            }}>
              {activeCount}
            </span>
          )}
        </button>

        {showThemeToggle && <button
          onClick={toggleFilterDarkMode}
          title={filterDarkMode ? 'Ljust läge' : 'Mörkt läge'}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 32, height: 32,
            background: theme.buttonBg,
            color: theme.buttonText,
            border: `1px solid ${theme.buttonBorder}`,
            borderRadius: 8,
            cursor: 'pointer', fontSize: 15,
            boxShadow: '0 1px 5px rgba(0,0,0,0.15)',
          }}
        >
          {filterDarkMode ? '☀️' : '🌙'}
        </button>}
      </div>

      {filterPanelOpen && (
        <div style={{
          pointerEvents: 'all', background: theme.bg,
          border: `1px solid ${theme.border}`, borderTop: 'none',
          borderRadius: '0 8px 8px 8px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
          width: 256, maxHeight: 'calc(100vh - 160px)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{ padding: '10px 14px', borderBottom: `1px solid ${theme.sectionBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
            <span style={{ fontSize: 12, color: theme.muted }}>
              {hasFilters ? `${filteredCount} / ${totalCount} markeringar` : `${totalCount} markeringar`}
            </span>
            {hasFilters && (
              <button onClick={clearFilters} style={{ fontSize: 11, color: theme.accent, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}>
                Rensa alla
              </button>
            )}
          </div>

          <div style={{ overflowY: 'auto', flex: 1 }}>

            {/* Category */}
            {categories.length > 0 && (
              <Section title="Kategori" theme={theme}>
                <ChipGroup
                  theme={theme}
                  options={categories.map((c) => c.name)}
                  active={categories.filter((c) => filterCategoryIds.includes(c.id)).map((c) => c.name)}
                  onToggle={(name) => {
                    const cat = categories.find((c) => c.name === name)!;
                    const cur = filterCategoryIds;
                    setFilterCategories(cur.includes(cat.id) ? cur.filter((id) => id !== cat.id) : [...cur, cat.id]);
                  }}
                  onOnly={(name) => setFilterCategories([categories.find((c) => c.name === name)!.id])}
                />
              </Section>
            )}

            {/* Date */}
            <Section title="Datum" theme={theme}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 11, color: theme.muted, width: 28 }}>Från</span>
                  <input type="date" value={filterFrom} onChange={(e) => setFilterFrom(e.target.value)}
                    style={{ flex: 1, padding: '4px 7px', border: `1px solid ${theme.inputBorder}`, borderRadius: 5, fontSize: 12, background: theme.inputBg, color: theme.text }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 11, color: theme.muted, width: 28 }}>Till</span>
                  <input type="date" value={filterTo} onChange={(e) => setFilterTo(e.target.value)}
                    style={{ flex: 1, padding: '4px 7px', border: `1px solid ${theme.inputBorder}`, borderRadius: 5, fontSize: 12, background: theme.inputBg, color: theme.text }} />
                </div>
              </div>
            </Section>

            {/* Dynamic field filters */}
            {visibleFields.map((fd) => (
              <Section key={fd.key} title={fd.label} theme={theme} onHide={hideable ? () => hideField(fd.key) : undefined}>
                {fd.kind === 'chips' ? (
                  <ChipGroup
                    theme={theme}
                    options={fd.options}
                    active={activeFilters[fd.key] ?? []}
                    onToggle={(v) => toggleChip(fd.key, v)}
                    onOnly={(v) => setActiveFilter(fd.key, [v])}
                  />
                ) : (
                  <RangeSlider
                    theme={theme}
                    min={fd.min} max={fd.max}
                    valueMin={activeRanges[fd.key]?.[0] ?? fd.min}
                    valueMax={activeRanges[fd.key]?.[1] ?? fd.max}
                    onChange={(min, max) => setActiveRange(fd.key, [min, max])}
                  />
                )}
              </Section>
            ))}

            {/* Hidden fields footer */}
            {hideable && hiddenFields.length > 0 && (
              <div style={{ padding: '8px 14px', borderTop: `1px solid ${theme.sectionBorder}` }}>
                <button
                  onClick={() => setShowingHidden((v) => !v)}
                  style={{ fontSize: 11, color: theme.muted, background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left' }}
                >
                  {showingHidden ? '▲' : '▶'} {hiddenFields.length} dolt{hiddenFields.length > 1 ? 'a' : ''} filter
                </button>
                {showingHidden && (
                  <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {hiddenFields.map((fd) => (
                      <div key={fd.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, color: theme.muted }}>
                        <span>{fd.label}</span>
                        <button
                          onClick={() => {
                            setHiddenKeys((prev) => {
                              const next = new Set(prev);
                              next.delete(fd.key);
                              persistHidden(next);
                              return next;
                            });
                          }}
                          style={{ fontSize: 11, color: theme.accent, background: 'none', border: 'none', cursor: 'pointer' }}
                        >
                          återställ
                        </button>
                      </div>
                    ))}
                    <button onClick={restoreAll} style={{ marginTop: 2, fontSize: 11, color: theme.muted, background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                      Återställ alla
                    </button>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}

function Section({ title, children, onHide, theme }: { title: string; children: React.ReactNode; onHide?: () => void; theme: Theme }) {
  return (
    <div style={{ padding: '10px 14px', borderBottom: `1px solid ${theme.sectionBorder}` }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: theme.muted, margin: 0 }}>
          {title}
        </p>
        {onHide && (
          <button
            onClick={onHide}
            title="Dölj detta filter"
            style={{ fontSize: 13, lineHeight: 1, color: theme.checkBorder, background: 'none', border: 'none', cursor: 'pointer', padding: '0 2px' }}
          >
            ×
          </button>
        )}
      </div>
      {children}
    </div>
  );
}
