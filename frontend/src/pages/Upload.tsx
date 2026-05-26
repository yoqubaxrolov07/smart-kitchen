import { useState, useRef } from 'react';
import { Upload as UploadIcon, FileSpreadsheet, CheckCircle, AlertCircle, X } from 'lucide-react';
import { uploadCSV } from '../api/client';

export default function Upload() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files[0]) setFile(e.dataTransfer.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError('');
    try {
      const res = await uploadCSV(file);
      setResult(res.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <UploadIcon className="text-blue-500" />
          Upload Dataset
        </h1>
        <p className="text-gray-500 mt-1">Upload your restaurant data (CSV/XLSX) — must match required columns</p>
      </div>

      {/* Required Format */}
      <div className="card bg-blue-50 border-blue-100">
        <h3 className="font-semibold text-blue-900 mb-2">📖 Required CSV Columns</h3>
        <code className="text-xs bg-white p-3 rounded block text-blue-800 break-all">
          date, food_item, meals_served, temp_c, is_holiday, day_of_week, waste_kg, checkout_price, base_price, emailer_for_promotion, homepage_featured
        </code>
      </div>

      {/* Upload Zone */}
      <div
        className={`card border-2 border-dashed transition-all ${
          dragActive ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-gray-300'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="text-center py-12">
          {file ? (
            <div className="space-y-4">
              <FileSpreadsheet size={48} className="mx-auto text-emerald-500" />
              <div>
                <p className="font-semibold text-lg">{file.name}</p>
                <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
              <div className="flex gap-3 justify-center">
                <button onClick={handleUpload} disabled={loading} className="btn-primary">
                  {loading ? 'Processing...' : 'Upload & Analyze'}
                </button>
                <button onClick={() => { setFile(null); setResult(null); }} className="px-4 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <X size={18} />
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <UploadIcon size={48} className="mx-auto text-gray-300" />
              <div>
                <p className="font-medium text-lg">Drag and drop your CSV file here</p>
                <p className="text-sm text-gray-400">or click to browse</p>
              </div>
              <button onClick={() => inputRef.current?.click()} className="btn-secondary">
                Choose File
              </button>
            </div>
          )}
          <input
            ref={inputRef}
            type="file"
            accept=".csv,.xlsx"
            className="hidden"
            onChange={e => e.target.files?.[0] && setFile(e.target.files[0])}
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="card bg-red-50 border-red-200 flex items-center gap-3">
          <AlertCircle className="text-red-500" />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-6">
          {/* Status */}
          {result.columns_match ? (
            <div className="card bg-emerald-50 border-emerald-200">
              <div className="flex items-center gap-3">
                <CheckCircle className="text-emerald-500" size={24} />
                <div>
                  <p className="font-semibold text-emerald-800">Upload Successful — Dataset Replaced</p>
                  <p className="text-sm text-emerald-600">
                    {result.original_rows} rows loaded. Dashboard and AI Predict now use this data.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="card bg-yellow-50 border-yellow-200">
              <div className="flex items-start gap-3">
                <AlertCircle className="text-yellow-500 flex-shrink-0 mt-0.5" size={24} />
                <div>
                  <p className="font-semibold text-yellow-800">Columns do not match — Dataset NOT replaced</p>
                  <p className="text-sm text-yellow-700 mt-1">
                    Missing required columns: <strong>{result.missing_required_columns?.join(', ')}</strong>
                  </p>
                  <p className="text-sm text-yellow-700 mt-1">
                    The cleaning report below is shown, but the main dataset and dashboard remain unchanged.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Cleaning Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card text-center">
              <p className="text-sm text-gray-500">Duplicates Found</p>
              <p className="text-3xl font-bold text-orange-500">{result.duplicates_found}</p>
              <p className="text-xs text-gray-400">Removed: {result.duplicates_removed}</p>
            </div>
            <div className="card text-center">
              <p className="text-sm text-gray-500">Missing Values</p>
              <p className="text-3xl font-bold text-red-500">{result.total_missing_cells}</p>
              <p className="text-xs text-gray-400">Imputed with median/mode</p>
            </div>
            <div className="card text-center">
              <p className="text-sm text-gray-500">Clean Rows</p>
              <p className="text-3xl font-bold text-emerald-500">{result.cleaned_rows}</p>
              <p className="text-xs text-gray-400">Ready for training</p>
            </div>
          </div>

          {/* Detected Columns */}
          <div className="card">
            <h3 className="font-semibold text-lg mb-4">Detected Columns</h3>
            <div className="flex flex-wrap gap-2">
              {result.columns.map((col: string) => (
                <span key={col} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                  {col}
                </span>
              ))}
            </div>
          </div>

          {/* Missing per column */}
          {Object.keys(result.missing_values).length > 0 && (
            <div className="card">
              <h3 className="font-semibold text-lg mb-4">Missing Values by Column</h3>
              <div className="space-y-2">
                {Object.entries(result.missing_values).map(([col, count]: [string, any]) => (
                  <div key={col} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="font-medium text-sm">{col}</span>
                    <span className="text-sm text-orange-600 font-medium">{count} missing</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
