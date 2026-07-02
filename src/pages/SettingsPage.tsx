import { useRef, useState } from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { clearAllData, downloadJSON, exportAllData, importDataBundle } from '../utils/export';
import { useToast } from '../utils/useToast';
import { todayISODate } from '../utils/dates';

export function SettingsPage() {
  const fileInput = useRef<HTMLInputElement>(null);
  const { message, showToast } = useToast();
  const [confirmingClear, setConfirmingClear] = useState(false);

  async function handleExport() {
    const bundle = await exportAllData();
    downloadJSON(bundle, `endo-tracker-export-${todayISODate()}.json`);
    showToast('Export downloaded');
  }

  async function handleImportFile(file: File) {
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      await importDataBundle(parsed);
      showToast('Data imported');
    } catch (err) {
      window.alert(err instanceof Error ? err.message : 'Import failed.');
    }
  }

  async function handleClear() {
    await clearAllData();
    setConfirmingClear(false);
    showToast('All data cleared');
  }

  return (
    <>
      <PageHeader eyebrow="Settings" title="Settings & data" />

      <div className="card">
        <h2>Your data, on your device</h2>
        <p className="text-muted text-sm">
          Everything you log stays in this browser's local storage — nothing is sent to a server. Use export
          regularly to back up your data, since clearing browser data or uninstalling the app will delete it.
        </p>
      </div>

      <div className="card">
        <h2>Export</h2>
        <p className="text-muted text-sm" style={{ marginBottom: 12 }}>
          Download all your daily logs, cycle history, blood tests, appointments and medications as a single
          structured JSON file. This is also the format that will feed the future AI health-coach features.
        </p>
        <button type="button" className="btn btn-primary btn-block" onClick={handleExport}>
          Export all data
        </button>
      </div>

      <div className="card">
        <h2>Import</h2>
        <p className="text-muted text-sm" style={{ marginBottom: 12 }}>
          Restore from a previously exported file. This replaces all data currently in the app.
        </p>
        <input
          ref={fileInput}
          type="file"
          accept="application/json"
          style={{ display: 'none' }}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleImportFile(file);
            e.target.value = '';
          }}
        />
        <button type="button" className="btn btn-block" onClick={() => fileInput.current?.click()}>
          Import from file
        </button>
      </div>

      <div className="card">
        <h2>Clear all data</h2>
        <p className="text-muted text-sm" style={{ marginBottom: 12 }}>
          Permanently deletes everything stored in this app. Export a backup first if you might need it.
        </p>
        {confirmingClear ? (
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" className="btn btn-danger btn-block" onClick={handleClear}>
              Yes, delete everything
            </button>
            <button type="button" className="btn" onClick={() => setConfirmingClear(false)}>
              Cancel
            </button>
          </div>
        ) : (
          <button type="button" className="btn btn-danger btn-block" onClick={() => setConfirmingClear(true)}>
            Clear all data
          </button>
        )}
      </div>

      <div className="card">
        <h2>What's next: the health brain</h2>
        <p className="text-muted text-sm">
          The daily symptoms, cycle days, blood tests, appointments and medications you log here are being kept in
          a consistent, structured format on purpose. The plan is to build an AI layer on top that can read this
          history (via the export above, or directly on-device) to help spot patterns and trends over time, and
          act as a health coach and advocate — for example preparing a summary before a specialist appointment.
        </p>
      </div>

      {message && <div className="toast">{message}</div>}
    </>
  );
}
