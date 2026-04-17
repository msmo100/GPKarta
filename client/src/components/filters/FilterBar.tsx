import React from 'react';
import type { Category } from '@gpkarta/shared';
import { useUiStore } from '../../store/uiStore';
import { Button } from '../common/Button';

interface FilterBarProps {
  categories: Category[];
}

export function FilterBar({ categories }: FilterBarProps) {
  const filterCategoryIds = useUiStore((s) => s.filterCategoryIds);
  const filterFrom = useUiStore((s) => s.filterFrom);
  const filterTo = useUiStore((s) => s.filterTo);
  const setFilterCategories = useUiStore((s) => s.setFilterCategories);
  const setFilterFrom = useUiStore((s) => s.setFilterFrom);
  const setFilterTo = useUiStore((s) => s.setFilterTo);
  const clearFilters = useUiStore((s) => s.clearFilters);

  const hasFilters = filterCategoryIds.length > 0 || filterFrom || filterTo;

  function toggleCategory(id: string) {
    setFilterCategories(
      filterCategoryIds.includes(id)
        ? filterCategoryIds.filter((c) => c !== id)
        : [...filterCategoryIds, id],
    );
  }

  return (
    <div style={{ padding: '10px 12px', borderBottom: '1px solid #e5e7eb' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#9ca3af' }}>
          Filter
        </span>
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} style={{ fontSize: 11, padding: '2px 6px', height: 'auto' }}>
            Rensa
          </Button>
        )}
      </div>

      {/* Category chips */}
      {categories.length > 0 && (
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 8 }}>
          {categories.map((cat) => {
            const active = filterCategoryIds.includes(cat.id);
            return (
              <button
                key={cat.id}
                onClick={() => toggleCategory(cat.id)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  padding: '3px 9px', borderRadius: 99, fontSize: 12, fontWeight: 500,
                  border: `1px solid ${active ? cat.color : '#e5e7eb'}`,
                  background: active ? cat.color + '18' : '#f9fafb',
                  color: active ? cat.color : '#374151',
                  cursor: 'pointer', transition: 'all 0.15s',
                }}
              >
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: cat.color, display: 'inline-block' }} />
                {cat.name}
              </button>
            );
          })}
        </div>
      )}

      {/* Date range */}
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <input
          type="date"
          value={filterFrom}
          onChange={(e) => setFilterFrom(e.target.value)}
          style={{ flex: 1, padding: '5px 8px', border: '1px solid #e5e7eb', borderRadius: 5, fontSize: 12 }}
          placeholder="From"
          title="From date"
        />
        <span style={{ color: '#9ca3af', fontSize: 12 }}>–</span>
        <input
          type="date"
          value={filterTo}
          onChange={(e) => setFilterTo(e.target.value)}
          style={{ flex: 1, padding: '5px 8px', border: '1px solid #e5e7eb', borderRadius: 5, fontSize: 12 }}
          placeholder="To"
          title="To date"
        />
      </div>
    </div>
  );
}
