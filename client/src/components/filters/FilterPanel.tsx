import React, { useMemo } from 'react';
import type { Category, Marker } from '@gpkarta/shared';
import { useUiStore } from '../../store/uiStore';

interface FilterPanelProps {
  categories: Category[];
  markers: Marker[];
  totalCount: number;
  filteredCount: number;
}

// ── Reusable sub-components ───────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
      letterSpacing: '0.07em', color: '#9ca3af', marginBottom: 8,
    }}>
      {children}
    </p>
  );
}

function ChipGroup({
  options, active, onToggle, onOnly,
}: {
  options: string[];
  active: string[];
  onToggle: (v: string) => void;
  onOnly: (v: string) => void;
}) {
  if (!options.length) return <p style={{ fontSize: 12, color: '#d1d5db' }}>Inga data</p>;
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

function RangeSlider({
  label, min, max, valueMin, valueMax, onChange,
}: {
  label: string; min: number; max: number;
  valueMin: number; valueMax: number;
  onChange: (min: number, max: number) => void;
}) {
  const isDefault = valueMin === min && valueMax === max;
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <SectionLabel>{label}</SectionLabel>
        <span style={{ fontSize: 11, color: isDefault ? '#d1d5db' : '#2563eb', fontWeight: 500 }}>
          {isDefault ? 'Alla' : `${valueMin}–${valueMax}`}
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 10, color: '#9ca3af', width: 20 }}>Min</span>
          <input
            type="range" min={min} max={max} value={valueMin}
            onChange={(e) => onChange(Math.min(+e.target.value, valueMax), valueMax)}
            style={{ flex: 1, accentColor: '#2563eb' }}
          />
          <span style={{ fontSize: 11, color: '#374151', width: 24, textAlign: 'right' }}>{valueMin}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 10, color: '#9ca3af', width: 20 }}>Max</span>
          <input
            type="range" min={min} max={max} value={valueMax}
            onChange={(e) => onChange(valueMin, Math.max(+e.target.value, valueMin))}
            style={{ flex: 1, accentColor: '#2563eb' }}
          />
          <span style={{ fontSize: 11, color: '#374151', width: 24, textAlign: 'right' }}>{valueMax}</span>
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function FilterPanel({ categories, markers, totalCount, filteredCount }: FilterPanelProps) {
  const {
    filterPanelOpen, toggleFilterPanel,
    filterCategoryIds, filterFrom, filterTo,
    filterGenderVictim, filterAgeMin, filterAgeMax,
    filterGenderPerpetrator, filterPunishment,
    filterPunishmentYearsMin, filterPunishmentYearsMax,
    setFilterCategories, setFilterFrom, setFilterTo,
    setFilterGenderVictim, setFilterAge,
    setFilterGenderPerpetrator, setFilterPunishment, setFilterPunishmentYears,
    clearFilters,
  } = useUiStore();

  // Derive unique option lists from the actual marker data
  const genderVictimOptions = useMemo(() =>
    [...new Set(markers.map((m) => m.genderVictim).filter(Boolean) as string[])].sort(), [markers]);
  const genderPerpOptions = useMemo(() =>
    [...new Set(markers.map((m) => m.genderPerpetrator).filter(Boolean) as string[])].sort(), [markers]);
  const punishmentOptions = useMemo(() =>
    [...new Set(markers.map((m) => m.punishment).filter(Boolean) as string[])].sort(), [markers]);

  const hasFilters = filterCategoryIds.length > 0 || filterFrom || filterTo ||
    filterGenderVictim.length > 0 || filterGenderPerpetrator.length > 0 ||
    filterPunishment.length > 0 ||
    filterAgeMin > 0 || filterAgeMax < 100 ||
    filterPunishmentYearsMin > 0 || filterPunishmentYearsMax < 100;

  const activeCount = [
    filterCategoryIds.length > 0,
    filterFrom || filterTo,
    filterGenderVictim.length > 0,
    filterGenderPerpetrator.length > 0,
    filterPunishment.length > 0,
    filterAgeMin > 0 || filterAgeMax < 100,
    filterPunishmentYearsMin > 0 || filterPunishmentYearsMax < 100,
  ].filter(Boolean).length;

  function toggleChip(current: string[], val: string, set: (v: string[]) => void) {
    set(current.includes(val) ? current.filter((v) => v !== val) : [...current, val]);
  }

  return (
    <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 400, display: 'flex', flexDirection: 'column', pointerEvents: 'none' }}>
      {/* Toggle button */}
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
        Filtrera
        {activeCount > 0 && (
          <span style={{
            background: filterPanelOpen ? 'rgba(255,255,255,0.3)' : '#2563eb',
            color: '#fff', borderRadius: 99, padding: '1px 6px',
            fontSize: 11, fontWeight: 700,
          }}>
            {activeCount}
          </span>
        )}
      </button>

      {/* Panel */}
      {filterPanelOpen && (
        <div style={{
          pointerEvents: 'all',
          background: '#fff',
          border: '1px solid #e5e7eb', borderTop: 'none',
          borderRadius: '0 8px 8px 8px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
          width: 256,
          maxHeight: 'calc(100vh - 160px)',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{ padding: '10px 14px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
            <span style={{ fontSize: 12, color: '#6b7280' }}>
              {hasFilters ? `${filteredCount} / ${totalCount} markörer` : `${totalCount} markörer`}
            </span>
            {hasFilters && (
              <button onClick={clearFilters} style={{ fontSize: 11, color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}>
                Rensa alla
              </button>
            )}
          </div>

          <div style={{ overflowY: 'auto', flex: 1 }}>

            {/* Category / Typ */}
            {categories.length > 0 && (
              <Section title="Typ">
                <ChipGroup
                  options={categories.map((c) => c.name)}
                  active={categories.filter((c) => filterCategoryIds.includes(c.id)).map((c) => c.name)}
                  onToggle={(name) => {
                    const cat = categories.find((c) => c.name === name)!;
                    toggleChip(filterCategoryIds, cat.id, setFilterCategories);
                  }}
                  onOnly={(name) => {
                    const cat = categories.find((c) => c.name === name)!;
                    setFilterCategories([cat.id]);
                  }}
                />
              </Section>
            )}

            {/* Date */}
            <Section title="Datum">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 11, color: '#9ca3af', width: 28 }}>Från</span>
                  <input type="date" value={filterFrom} onChange={(e) => setFilterFrom(e.target.value)}
                    style={{ flex: 1, padding: '4px 7px', border: '1px solid #e5e7eb', borderRadius: 5, fontSize: 12 }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 11, color: '#9ca3af', width: 28 }}>Till</span>
                  <input type="date" value={filterTo} onChange={(e) => setFilterTo(e.target.value)}
                    style={{ flex: 1, padding: '4px 7px', border: '1px solid #e5e7eb', borderRadius: 5, fontSize: 12 }} />
                </div>
              </div>
            </Section>

            {/* Offrets kön */}
            {genderVictimOptions.length > 0 && (
              <Section title="Offrets kön">
                <ChipGroup
                  options={genderVictimOptions}
                  active={filterGenderVictim}
                  onToggle={(v) => toggleChip(filterGenderVictim, v, setFilterGenderVictim)}
                  onOnly={(v) => setFilterGenderVictim([v])}
                />
              </Section>
            )}

            {/* Offrets ålder */}
            {markers.some((m) => m.ageVictim != null) && (
              <Section title="Offrets ålder">
                <RangeSlider
                  label="" min={0} max={100}
                  valueMin={filterAgeMin} valueMax={filterAgeMax}
                  onChange={setFilterAge}
                />
              </Section>
            )}

            {/* Gärningsmans kön */}
            {genderPerpOptions.length > 0 && (
              <Section title="Gärningsmans kön">
                <ChipGroup
                  options={genderPerpOptions}
                  active={filterGenderPerpetrator}
                  onToggle={(v) => toggleChip(filterGenderPerpetrator, v, setFilterGenderPerpetrator)}
                  onOnly={(v) => setFilterGenderPerpetrator([v])}
                />
              </Section>
            )}

            {/* Straff typ */}
            {punishmentOptions.length > 0 && (
              <Section title="Straff typ">
                <ChipGroup
                  options={punishmentOptions}
                  active={filterPunishment}
                  onToggle={(v) => toggleChip(filterPunishment, v, setFilterPunishment)}
                  onOnly={(v) => setFilterPunishment([v])}
                />
              </Section>
            )}

            {/* Straff längd */}
            {markers.some((m) => m.punishmentYears != null) && (
              <Section title="Straff längd (år)">
                <RangeSlider
                  label="" min={0} max={100}
                  valueMin={filterPunishmentYearsMin} valueMax={filterPunishmentYearsMax}
                  onChange={setFilterPunishmentYears}
                />
              </Section>
            )}

          </div>
        </div>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ padding: '10px 14px', borderBottom: '1px solid #f3f4f6' }}>
      <SectionLabel>{title}</SectionLabel>
      {children}
    </div>
  );
}
