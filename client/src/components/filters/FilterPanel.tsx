import React, { useMemo, useState, useCallback } from 'react';
import type { Category, Marker } from '@gpkarta/shared';
import { useUiStore } from '../../store/uiStore';

interface FilterPanelProps {
  categories: Category[];
  markers: Marker[];
  totalCount: number;
  filteredCount: number;
  hideable?: boolean;
}

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
  { key: 'genderVictim', label: 'Gender (victim)' },
  { key: 'ageVictim', label: 'Age (victim)' },
  { key: 'genderPerpetrator', label: 'Gender (perpetrator)' },
  { key: 'punishment', label: 'Punishment type' },
  { key: 'punishmentYears', label: 'Punishment (years)' },
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

function ChipGroup({ options, active, onToggle, onOnly }: {
  options: string[]; active: string[];
  onToggle: (v: string) => void; onOnly: (v: string) => void;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {options.map((val) => {
        const on = active.includes(val);
        return (
          <div key={val} style={{ display: 'flex', alignItems: 'center', borderRadius: 6, background: on ? '#eff6ff' : 'transparent' }}>
            <button
              onClick={() => onToggle(val)}
              style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, padding: '5px 8px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
            >
              <span style={{
                width: 15, height: 15, borderRadius: 3, flexShrink: 0,
                border: `2px solid ${on ? '#2563eb' : '#d1d5db'}`,
                background: on ? '#2563eb' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {on && <span style={{ color: '#fff', fontSize: 9, fontWeight: 700 }}>✓</span>}
              </span>
              <span style={{ fontSize: 13, color: on ? '#111827' : '#374151', fontWeight: on ? 500 : 400 }}>{val}</span>
            </button>
            <button
              onClick={() => onOnly(val)}
              style={{ padding: '4px 8px', fontSize: 10, color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer' }}
              title="Show only this"
            >
              only
            </button>
          </div>
        );
      })}
    </div>
  );
}

function RangeSlider({ min, max, valueMin, valueMax, onChange }: {
  min: number; max: number; valueMin: number; valueMax: number;
  onChange: (min: number, max: number) => void;
}) {
  const isDefault = valueMin === min && valueMax === max;
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 4 }}>
        <span style={{ fontSize: 11, color: isDefault ? '#d1d5db' : '#2563eb', fontWeight: 500 }}>
          {isDefault ? 'All' : `${valueMin}–${valueMax}`}
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 10, color: '#9ca3af', width: 20 }}>Min</span>
          <input type="range" min={min} max={max} value={valueMin}
            onChange={(e) => onChange(Math.min(+e.target.value, valueMax), valueMax)}
            style={{ flex: 1, accentColor: '#2563eb' }} />
          <span style={{ fontSize: 11, color: '#374151', width: 28, textAlign: 'right' }}>{valueMin}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 10, color: '#9ca3af', width: 20 }}>Max</span>
          <input type="range" min={min} max={max} value={valueMax}
            onChange={(e) => onChange(valueMin, Math.max(+e.target.value, valueMin))}
            style={{ flex: 1, accentColor: '#2563eb' }} />
          <span style={{ fontSize: 11, color: '#374151', width: 28, textAlign: 'right' }}>{valueMax}</span>
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function FilterPanel({ categories, markers, totalCount, filteredCount, hideable = true }: FilterPanelProps) {
  const {
    filterPanelOpen, toggleFilterPanel,
    filterCategoryIds, filterFrom, filterTo,
    activeFilters, activeRanges,
    setFilterCategories, setFilterFrom, setFilterTo,
    setActiveFilter, setActiveRange,
    clearFilters,
  } = useUiStore();

  const [hiddenKeys, setHiddenKeys] = useState<Set<string>>(loadHidden);
  const [showingHidden, setShowingHidden] = useState(false);

  const hideField = useCallback((key: string) => {
    setHiddenKeys((prev) => {
      const next = new Set(prev).add(key);
      saveHidden(next);
      return next;
    });
    // Clear any active filter on this field when hiding
    setActiveFilter(key, []);
  }, [setActiveFilter]);

  const restoreAll = useCallback(() => {
    setHiddenKeys(new Set());
    saveHidden(new Set());
    setShowingHidden(false);
  }, []);

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
      <button
        onClick={toggleFilterPanel}
        style={{
          pointerEvents: 'all',
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '7px 12px',
          background: filterPanelOpen ? '#2563eb' : '#fff',
          color: filterPanelOpen ? '#fff' : '#374151',
          border: '1px solid',
          borderColor: filterPanelOpen ? '#2563eb' : '#e5e7eb',
          borderRadius: filterPanelOpen ? '8px 8px 0 0' : 8,
          cursor: 'pointer', fontSize: 13, fontWeight: 500,
          boxShadow: filterPanelOpen ? 'none' : '0 1px 5px rgba(0,0,0,0.15)',
        }}
      >
        <span style={{ fontSize: 12 }}>▼</span>
        Filter
        {activeCount > 0 && (
          <span style={{
            background: filterPanelOpen ? 'rgba(255,255,255,0.3)' : '#2563eb',
            color: '#fff', borderRadius: 99, padding: '1px 6px', fontSize: 11, fontWeight: 700,
          }}>
            {activeCount}
          </span>
        )}
      </button>

      {filterPanelOpen && (
        <div style={{
          pointerEvents: 'all', background: '#fff',
          border: '1px solid #e5e7eb', borderTop: 'none',
          borderRadius: '0 8px 8px 8px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
          width: 256, maxHeight: 'calc(100vh - 160px)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{ padding: '10px 14px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
            <span style={{ fontSize: 12, color: '#6b7280' }}>
              {hasFilters ? `${filteredCount} / ${totalCount} markers` : `${totalCount} markers`}
            </span>
            {hasFilters && (
              <button onClick={clearFilters} style={{ fontSize: 11, color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}>
                Clear all
              </button>
            )}
          </div>

          <div style={{ overflowY: 'auto', flex: 1 }}>

            {/* Category */}
            {categories.length > 0 && (
              <Section title="Category">
                <ChipGroup
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
            <Section title="Date">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 11, color: '#9ca3af', width: 28 }}>From</span>
                  <input type="date" value={filterFrom} onChange={(e) => setFilterFrom(e.target.value)}
                    style={{ flex: 1, padding: '4px 7px', border: '1px solid #e5e7eb', borderRadius: 5, fontSize: 12 }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 11, color: '#9ca3af', width: 28 }}>To</span>
                  <input type="date" value={filterTo} onChange={(e) => setFilterTo(e.target.value)}
                    style={{ flex: 1, padding: '4px 7px', border: '1px solid #e5e7eb', borderRadius: 5, fontSize: 12 }} />
                </div>
              </div>
            </Section>

            {/* Dynamic field filters */}
            {visibleFields.map((fd) => (
              <Section key={fd.key} title={fd.label} onHide={hideable ? () => hideField(fd.key) : undefined}>
                {fd.kind === 'chips' ? (
                  <ChipGroup
                    options={fd.options}
                    active={activeFilters[fd.key] ?? []}
                    onToggle={(v) => toggleChip(fd.key, v)}
                    onOnly={(v) => setActiveFilter(fd.key, [v])}
                  />
                ) : (
                  <RangeSlider
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
              <div style={{ padding: '8px 14px', borderTop: '1px solid #f3f4f6' }}>
                <button
                  onClick={() => setShowingHidden((v) => !v)}
                  style={{ fontSize: 11, color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left' }}
                >
                  {showingHidden ? '▲' : '▶'} {hiddenFields.length} hidden filter{hiddenFields.length > 1 ? 's' : ''}
                </button>
                {showingHidden && (
                  <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {hiddenFields.map((fd) => (
                      <div key={fd.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, color: '#6b7280' }}>
                        <span>{fd.label}</span>
                        <button
                          onClick={() => {
                            setHiddenKeys((prev) => {
                              const next = new Set(prev);
                              next.delete(fd.key);
                              saveHidden(next);
                              return next;
                            });
                          }}
                          style={{ fontSize: 11, color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer' }}
                        >
                          restore
                        </button>
                      </div>
                    ))}
                    <button onClick={restoreAll} style={{ marginTop: 2, fontSize: 11, color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                      Restore all
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

function Section({ title, children, onHide }: { title: string; children: React.ReactNode; onHide?: () => void }) {
  return (
    <div style={{ padding: '10px 14px', borderBottom: '1px solid #f3f4f6' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#9ca3af', margin: 0 }}>
          {title}
        </p>
        {onHide && (
          <button
            onClick={onHide}
            title="Hide this filter"
            style={{ fontSize: 13, lineHeight: 1, color: '#d1d5db', background: 'none', border: 'none', cursor: 'pointer', padding: '0 2px' }}
          >
            ×
          </button>
        )}
      </div>
      {children}
    </div>
  );
}
