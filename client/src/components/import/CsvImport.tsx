import React, { useRef, useState } from 'react';
import type { Category, MarkerShape, MarkerSize } from '@gpkarta/shared';
import { apiClient } from '../../api/client';
import { useMapStore } from '../../store/mapStore';
import { Button } from '../common/Button';
import { Select } from '../common/FormField';

// ── CSV parsing ──────────────────────────────────────────────────────────────

function parseCSV(text: string): { headers: string[]; rows: string[][] } {
  const clean = text.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  if (!clean.trim()) return { headers: [], rows: [] };

  const firstNewline = clean.indexOf('\n');
  const firstLine = firstNewline === -1 ? clean : clean.slice(0, firstNewline);
  const commas = (firstLine.match(/,/g) ?? []).length;
  const semis  = (firstLine.match(/;/g) ?? []).length;
  const tabs   = (firstLine.match(/\t/g) ?? []).length;
  const delim  = tabs > commas && tabs > semis ? '\t'
               : semis > commas               ? ';'
               : ',';

  const records: string[][] = [];
  let cur = '';
  let inQuote = false;
  let row: string[] = [];

  for (let i = 0; i < clean.length; i++) {
    const ch = clean[i];
    if (ch === '"') {
      if (inQuote && clean[i + 1] === '"') { cur += '"'; i++; }
      else inQuote = !inQuote;
    } else if (ch === delim && !inQuote) {
      row.push(cur.trim()); cur = '';
    } else if (ch === '\n' && !inQuote) {
      row.push(cur.trim()); cur = '';
      if (row.some((f) => f !== '')) records.push(row);
      row = [];
    } else {
      cur += ch;
    }
  }
  row.push(cur.trim());
  if (row.some((f) => f !== '')) records.push(row);

  if (records.length < 2) return { headers: [], rows: [] };

  const headers = records[0].map((h) => h.toLowerCase().trim());
  const rows = records.slice(1);
  return { headers, rows };
}

// Common CSV column names → our fields
const FIELD_ALIASES: Record<string, string> = {
  lat: 'lat', latitude: 'lat',
  lng: 'lng', lon: 'lng', longitude: 'lng',
  title: 'title', name: 'title', label: 'title',
  description: 'description', desc: 'description', notes: 'description', note: 'description',
  date: 'date', time: 'date', datetime: 'date', timestamp: 'date',
  category: 'category', type: 'category', kind: 'category',
  image: 'imageUrl', image_url: 'imageUrl', foto: 'imageUrl',
  gender_victim: 'genderVictim', gender_offer: 'genderVictim',
  age_victim: 'ageVictim', age_offer: 'ageVictim',
  gender_perpetrator: 'genderPerpetrator', gender_gärningsman: 'genderPerpetrator',
  punishment: 'punishment', straff: 'punishment',
  punishment_years: 'punishmentYears', straff_år: 'punishmentYears',
  region: 'region',
};

// Fields that are handled as named marker properties (not stored in customFields)
const KNOWN_FIELDS = new Set(Object.values(FIELD_ALIASES));

// Common GIS/shapefile artifact columns that are never useful as filters
const IMPORT_BLOCKLIST = new Set([
  'admin_units', 'admin units', 'admin_unit', 'admin unit',
  'objectid', 'object_id', 'fid', 'gid', 'globalid', 'global_id',
  'shape_area', 'shape_leng', 'shape_length', 'shape_len',
  'geom', 'geometry', 'wkt', 'wkb',
  'uuid', 'guid',
  'created_user', 'created_date', 'last_edited_user', 'last_edited_date',
  'st_area(shape)', 'st_length(shape)',
]);

function autoMap(headers: string[]): Record<string, string> {
  const mapping: Record<string, string> = {};
  for (const h of headers) {
    const field = FIELD_ALIASES[h];
    if (field && !Object.values(mapping).includes(field)) mapping[h] = field;
    else if (IMPORT_BLOCKLIST.has(h)) mapping[h] = '(ignore)';
    else mapping[h] = '(custom field)';
  }
  return mapping;
}

// ── Types ────────────────────────────────────────────────────────────────────

interface PreviewRow {
  title: string;
  lat: number;
  lng: number;
  description?: string;
  date?: string;
  categoryName?: string;
  imageUrl?: string;
  genderVictim?: string;
  ageVictim?: number;
  genderPerpetrator?: string;
  punishment?: string;
  punishmentYears?: number;
  region?: string;
  customFields?: Record<string, string | number | null>;
  valid: boolean;
  error?: string;
}

const KNOWN_TARGET_FIELDS = ['title', 'lat', 'lng', 'description', 'date', 'category', 'imageUrl', 'genderVictim', 'ageVictim', 'genderPerpetrator', 'punishment', 'punishmentYears', 'region'];
const TARGET_FIELDS = [...KNOWN_TARGET_FIELDS, '(custom field)', '(ignore)'];

// ── Component ────────────────────────────────────────────────────────────────

interface CsvImportProps {
  mapId: string;
  categories: Category[];
  onDone: () => void;
}

export function CsvImport({ mapId, categories, onDone }: CsvImportProps) {
  const addMarker = useMapStore((s) => s.addMarker);
  const inputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<'upload' | 'map' | 'preview' | 'importing'>('upload');
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<string[][]>([]);
  const [colMap, setColMap] = useState<Record<string, string>>({});
  const [preview, setPreview] = useState<PreviewRow[]>([]);
  const [error, setError] = useState('');
  const [importResult, setImportResult] = useState<{ ok: number; failed: number } | null>(null);

  // ── Step 1: upload ──
  function handleFile(file: File) {
    setError('');
    function process(text: string) {
      const { headers, rows } = parseCSV(text);
      if (!headers.length) { setError('Could not parse CSV — make sure the file has a header row.'); return; }
      setHeaders(headers);
      setRows(rows);
      setColMap(autoMap(headers));
      setStep('map');
    }
    const r1 = new FileReader();
    r1.onload = (e) => {
      const text = e.target?.result as string;
      if (text.includes('\uFFFD')) {
        const r2 = new FileReader();
        r2.onload = (e2) => process(e2.target?.result as string);
        r2.readAsText(file, 'windows-1252');
      } else {
        process(text);
      }
    };
    r1.readAsText(file, 'utf-8');
  }

  // ── Step 2: column mapping → build preview ──
  function buildPreview() {
    const mapped: PreviewRow[] = rows.slice(0, 500).map((row) => {
      const get = (field: string) => {
        const col = Object.entries(colMap).find(([, f]) => f === field)?.[0];
        return col !== undefined ? (row[headers.indexOf(col)] ?? '').trim() : '';
      };

      const latStr = get('lat');
      const lngStr = get('lng');
      const lat = parseFloat(latStr.replace(',', '.'));
      const lng = parseFloat(lngStr.replace(',', '.'));
      const title = get('title') || `Row ${rows.indexOf(row) + 2}`;

      if (!latStr || !lngStr || isNaN(lat) || isNaN(lng)) {
        return { title, lat: 0, lng: 0, valid: false, error: `Bad lat/lng: got "${latStr}" / "${lngStr}"` };
      }
      if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        return { title, lat, lng, valid: false, error: `Coords out of range: ${lat}, ${lng}` };
      }

      const dateStr = get('date');
      let date: string | undefined;
      if (dateStr) {
        const d = new Date(dateStr);
        date = isNaN(d.getTime()) ? undefined : d.toISOString();
      }

      // Collect custom fields: columns mapped to '(custom field)'
      const customFields: Record<string, string | number | null> = {};
      for (const [col, target] of Object.entries(colMap)) {
        if (target !== '(custom field)') continue;
        const val = (row[headers.indexOf(col)] ?? '').trim();
        if (!val) continue;
        const num = parseFloat(val.replace(',', '.'));
        customFields[col] = isNaN(num) ? val : num;
      }

      const ageStr = get('ageVictim');
      const pyStr = get('punishmentYears');
      return {
        title,
        lat,
        lng,
        description: get('description') || undefined,
        date,
        categoryName: get('category') || undefined,
        imageUrl: get('imageUrl') || undefined,
        genderVictim: get('genderVictim') || undefined,
        ageVictim: ageStr ? (parseFloat(ageStr.replace(',', '.')) || undefined) : undefined,
        genderPerpetrator: get('genderPerpetrator') || undefined,
        punishment: get('punishment') || undefined,
        punishmentYears: pyStr ? (parseFloat(pyStr.replace(',', '.')) || undefined) : undefined,
        region: get('region') || undefined,
        customFields: Object.keys(customFields).length > 0 ? customFields : undefined,
        valid: true,
      };
    });

    setPreview(mapped);
    setStep('preview');
  }

  // ── Step 3: import ──
  async function handleImport() {
    setStep('importing');

    const catMap: Record<string, string> = {};
    for (const cat of categories) catMap[cat.name.toLowerCase()] = cat.id;

    const missingNames = [
      ...new Set(
        preview
          .filter((r) => r.valid && r.categoryName)
          .map((r) => r.categoryName!.trim())
          .filter((n) => !catMap[n.toLowerCase()]),
      ),
    ];

    for (const name of missingNames) {
      try {
        const res = await apiClient.post<{ data: Category }>(`/maps/${mapId}/categories`, {
          name,
          color: randomColor(),
        });
        const cat = res.data.data;
        catMap[name.toLowerCase()] = cat.id;
        useMapStore.getState().addCategory(cat);
      } catch { /* skip */ }
    }

    const validRows = preview.filter((r) => r.valid);
    const payload = validRows.map((r) => ({
      title: r.title,
      lat: r.lat,
      lng: r.lng,
      description: r.description,
      date: r.date,
      categoryId: r.categoryName ? catMap[r.categoryName.toLowerCase()] : undefined,
      shape: 'pin' as MarkerShape,
      markerSize: 'md' as MarkerSize,
      imageUrl: r.imageUrl,
      genderVictim: r.genderVictim,
      ageVictim: r.ageVictim,
      genderPerpetrator: r.genderPerpetrator,
      punishment: r.punishment,
      punishmentYears: r.punishmentYears,
      region: r.region,
      customFields: r.customFields,
    }));

    try {
      const res = await apiClient.post<{ data: any[] }>(
        `/maps/${mapId}/markers/bulk`,
        { markers: payload },
      );
      res.data.data.forEach((m) => addMarker(m));
      setImportResult({ ok: res.data.data.length, failed: preview.length - validRows.length });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Import failed');
      setStep('preview');
    }
  }

  const validCount = preview.filter((r) => r.valid).length;
  const invalidCount = preview.length - validCount;
  const customColCount = Object.values(colMap).filter((v) => v === '(custom field)').length;

  // ── Render ──
  if (importResult) {
    return (
      <div style={{ textAlign: 'center', padding: '24px 0' }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>✓</div>
        <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>Import complete</p>
        <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 20 }}>
          {importResult.ok} markers added
          {importResult.failed > 0 && `, ${importResult.failed} skipped (invalid)`}
        </p>
        <Button onClick={onDone}>Done</Button>
      </div>
    );
  }

  return (
    <div>
      {/* Progress steps */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 20, fontSize: 12 }}>
        {(['upload', 'map', 'preview'] as const).map((s, i) => (
          <React.Fragment key={s}>
            {i > 0 && <span style={{ color: '#d1d5db', margin: '0 6px', alignSelf: 'center' }}>›</span>}
            <span style={{
              fontWeight: step === s ? 600 : 400,
              color: step === s ? '#2563eb' : ['upload','map','preview'].indexOf(step) > i ? '#16a34a' : '#9ca3af',
            }}>
              {i + 1}. {s.charAt(0).toUpperCase() + s.slice(1)}
            </span>
          </React.Fragment>
        ))}
      </div>

      {error && <p style={{ color: '#dc2626', fontSize: 13, marginBottom: 12 }}>{error}</p>}

      {/* ── Step 1: Upload ── */}
      {step === 'upload' && (
        <div>
          <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 16, lineHeight: 1.6 }}>
            Upload a CSV file with at least <strong>lat</strong> and <strong>lng</strong> columns.
            Optional columns: <code>title</code>, <code>description</code>, <code>date</code>, <code>category</code>.
            Any extra columns become filterable custom fields automatically.
          </p>

          <div
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
            style={{
              border: '2px dashed #d1d5db', borderRadius: 10, padding: '40px 24px',
              textAlign: 'center', cursor: 'pointer', background: '#f9fafb',
              transition: 'border-color 0.15s',
            }}
          >
            <div style={{ fontSize: 32, marginBottom: 8 }}>📄</div>
            <p style={{ fontWeight: 600, marginBottom: 4 }}>Click to choose a CSV file</p>
            <p style={{ fontSize: 12, color: '#9ca3af' }}>or drag and drop here</p>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept=".csv,text/csv"
            style={{ display: 'none' }}
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
          />

          <div style={{ marginTop: 16, background: '#f0f9ff', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: '#0369a1' }}>
            <strong>Expected format:</strong><br />
            <code>lat,lng,title,description,date,category,weapon_type</code><br />
            <code>57.708,11.974,"My location","Some notes",2024-03-15,Incidents,knife</code><br />
            <span style={{ marginTop: 4, display: 'block' }}>Extra columns like <code>weapon_type</code> become smart filters automatically.</span>
          </div>
        </div>
      )}

      {/* ── Step 2: Map columns ── */}
      {step === 'map' && (
        <div>
          <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 14 }}>
            Map your CSV columns to marker fields. <strong>lat</strong> and <strong>lng</strong> are required.
            Columns set to <strong>(custom field)</strong> will be saved and appear as smart filters.
          </p>
          {customColCount > 0 && (
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 6, padding: '7px 12px', fontSize: 12, color: '#15803d', marginBottom: 12 }}>
              {customColCount} column{customColCount > 1 ? 's' : ''} will be saved as custom fields and become filterable.
            </div>
          )}
          <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                  <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600, color: '#374151' }}>CSV column</th>
                  <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600, color: '#374151' }}>Sample value</th>
                  <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600, color: '#374151' }}>Maps to</th>
                </tr>
              </thead>
              <tbody>
                {headers.map((h, i) => (
                  <tr key={h} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '8px 12px', fontFamily: 'monospace', color: '#374151' }}>{h}</td>
                    <td style={{ padding: '8px 12px', color: '#9ca3af', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {rows[0]?.[i] ?? '—'}
                    </td>
                    <td style={{ padding: '6px 12px' }}>
                      <Select
                        value={colMap[h] ?? ''}
                        onChange={(e) => setColMap((m) => ({ ...m, [h]: e.target.value }))}
                        style={{ fontSize: 12, padding: '4px 8px', height: 30 }}
                      >
                        {TARGET_FIELDS.map((f) => (
                          <option key={f} value={f}>{f}</option>
                        ))}
                      </Select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
            <Button variant="secondary" onClick={() => setStep('upload')}>Back</Button>
            <Button
              onClick={buildPreview}
              disabled={!Object.values(colMap).includes('lat') || !Object.values(colMap).includes('lng')}
            >
              Preview →
            </Button>
          </div>
        </div>
      )}

      {/* ── Step 3: Preview ── */}
      {step === 'preview' && (
        <div>
          <div style={{ display: 'flex', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
            <Pill color="#16a34a">{validCount} ready to import</Pill>
            {invalidCount > 0 && <Pill color="#dc2626">{invalidCount} will be skipped</Pill>}
            {preview.length > 500 && <Pill color="#d97706">Showing first 500 rows</Pill>}
            {customColCount > 0 && <Pill color="#7c3aed">{customColCount} custom field{customColCount > 1 ? 's' : ''}</Pill>}
          </div>

          <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden', maxHeight: 320, overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead style={{ position: 'sticky', top: 0, background: '#f9fafb', zIndex: 1 }}>
                <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <th style={th}>Status</th>
                  <th style={th}>Title</th>
                  <th style={th}>Lat</th>
                  <th style={th}>Lng</th>
                  <th style={th}>Category</th>
                  <th style={th}>Date</th>
                  {customColCount > 0 && <th style={th}>Custom fields</th>}
                </tr>
              </thead>
              <tbody>
                {preview.map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f9fafb', background: row.valid ? 'transparent' : '#fff5f5' }}>
                    <td style={{ ...td, textAlign: 'center' }}>
                      {row.valid ? '✓' : <span title={row.error} style={{ color: '#dc2626', cursor: 'help' }}>✕</span>}
                    </td>
                    <td style={{ ...td, maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.title}</td>
                    <td style={td}>{row.valid ? row.lat.toFixed(4) : '—'}</td>
                    <td style={td}>{row.valid ? row.lng.toFixed(4) : '—'}</td>
                    <td style={td}>{row.categoryName ?? '—'}</td>
                    <td style={td}>{row.date ? new Date(row.date).toLocaleDateString() : '—'}</td>
                    {customColCount > 0 && (
                      <td style={{ ...td, color: '#7c3aed', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {row.customFields ? Object.entries(row.customFields).map(([k, v]) => `${k}: ${v}`).join(', ') : '—'}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
            <Button variant="secondary" onClick={() => setStep('map')}>Back</Button>
            <Button onClick={handleImport} disabled={validCount === 0}>
              Import {validCount} marker{validCount !== 1 ? 's' : ''}
            </Button>
          </div>
        </div>
      )}

      {step === 'importing' && (
        <div style={{ textAlign: 'center', padding: '32px 0' }}>
          <div style={{ width: 32, height: 32, border: '3px solid #e5e7eb', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 0.7s linear infinite', margin: '0 auto 12px' }} />
          <p style={{ fontSize: 13, color: '#6b7280' }}>Importing {validCount} markers…</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}
    </div>
  );
}

const th: React.CSSProperties = { padding: '8px 10px', textAlign: 'left', fontWeight: 600, color: '#374151', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.04em' };
const td: React.CSSProperties = { padding: '7px 10px', color: '#374151' };

function Pill({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '3px 10px', borderRadius: 99, fontSize: 12, fontWeight: 500,
      background: color + '18', color, border: `1px solid ${color}40`,
    }}>
      {children}
    </span>
  );
}

const COLORS = ['#2563eb','#dc2626','#16a34a','#d97706','#7c3aed','#db2777','#0891b2'];
let colorIdx = 0;
function randomColor() { return COLORS[colorIdx++ % COLORS.length]; }
