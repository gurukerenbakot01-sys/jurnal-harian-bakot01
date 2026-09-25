import React, { useState } from 'react';
import { X, Cloud, Copy, Check, ExternalLink, HelpCircle } from 'lucide-react';

interface ModalGasSyncProps {
  isOpen: boolean;
  onClose: () => void;
  gasUrl: string;
  onSaveGasUrl: (url: string) => void;
  onTestSync: (url: string) => void;
}

export const ModalGasSync: React.FC<ModalGasSyncProps> = ({
  isOpen,
  onClose,
  gasUrl,
  onSaveGasUrl,
  onTestSync
}) => {
  const [url, setUrl] = useState(gasUrl);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const gasScriptCode = `// Ganti dengan ID Folder Google Drive Anda
const FOLDER_FOTO_ID = '14zK2b0vUDRPrF8ZaW0xdDay0Kf9zfd5n';

function doGet(e) {
  // Mengembalikan data JSON Pegawai untuk aplikasi Sikawan
  return ContentService.createTextOutput(JSON.stringify(ambilDataPegawai()))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const postData = JSON.parse(e.postData.contents);
    if (postData.action === 'uploadFoto') {
      const res = unggahBerkasDrive(postData.fileData, postData.fileName, postData.rowNum, 'Foto');
      return ContentService.createTextOutput(JSON.stringify(res))
        .setMimeType(ContentService.MimeType.JSON);
    }
    if (postData.action === 'uploadTandaTangan') {
      const res = unggahBerkasDrive(postData.fileData, postData.fileName, postData.rowNum, 'Tanda Tangan');
      return ContentService.createTextOutput(JSON.stringify(res))
        .setMimeType(ContentService.MimeType.JSON);
    }
    return ContentService.createTextOutput(JSON.stringify({ status: 'ok' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch(err) {
    return ContentService.createTextOutput(JSON.stringify({ error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function ambilDataPegawai() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('Pegawai');
    if (!sheet) return { data: [], message: 'Sheet Pegawai belum dibuat' };

    const values = sheet.getDataRange().getValues();
    if (values.length <= 1) return { data: [] };

    const headers = values[0];
    const result = [];
    for (let i = 1; i < values.length; i++) {
      let row = values[i];
      if (!row[0] && !row[1]) continue;
      let obj = { rowNum: i + 1 };
      for (let j = 0; j < headers.length; j++) {
        obj[headers[j]] = row[j] !== undefined ? row[j] : '';
      }
      result.push(obj);
    }
    return { data: result };
  } catch (err) {
    return { error: err.message };
  }
}

function unggahBerkasDrive(fileData, fileName, rowNum, targetColumn) {
  try {
    const folder = DriveApp.getFolderById(FOLDER_FOTO_ID);
    const contentType = fileData.substring(5, fileData.indexOf(';base64'));
    const bytes = Utilities.base64Decode(fileData.substr(fileData.indexOf('base64,') + 7));
    const blob = Utilities.newBlob(bytes, contentType, fileName);

    const file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    const fileUrl = "https://lh3.googleusercontent.com/d/" + file.getId();

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('Pegawai');
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    let colIndex = headers.indexOf(targetColumn);
    if (colIndex === -1) {
      colIndex = headers.length;
      sheet.getRange(1, colIndex + 1).setValue(targetColumn);
    }
    sheet.getRange(rowNum, colIndex + 1).setValue(fileUrl);

    return { success: true, url: fileUrl };
  } catch (err) {
    return { success: false, error: err.message };
  }
}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(gasScriptCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSave = () => {
    onSaveGasUrl(url);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-[#0b4e3a] text-white px-5 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Cloud className="w-5 h-5 text-emerald-300" />
            <h3 className="font-bold text-base">Sinkronisasi Google Sheets & Google Drive</h3>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white p-1 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3.5 text-xs text-emerald-800 space-y-2">
            <div className="font-bold flex items-center gap-1.5 text-sm text-emerald-900">
              <HelpCircle className="w-4 h-4 text-emerald-700" />
              Dukungan 2 Jalur Koneksi Google Spreadsheet:
            </div>
            <div className="space-y-1.5 text-[11.5px] leading-relaxed">
              <p>
                <strong>Cara 1 (Langsung & Tanpa Script):</strong> Cukup tempelkan link Google Spreadsheet Anda (contoh: <code className="bg-emerald-100 px-1 py-0.5 rounded text-emerald-900 font-mono">https://docs.google.com/spreadsheets/d/...</code>) dengan izin <em>"Siapa saja yang memiliki link dapat melihat"</em>. Sistem akan langsung membaca Sheet <strong>"Pegawai"</strong> secara otomatis!
              </p>
              <p>
                <strong>Cara 2 (Apps Script Web App):</strong> Jika menggunakan Apps Script untuk upload foto ke Google Drive (ID: <code className="bg-emerald-100 px-1 py-0.5 rounded font-mono">14zK2b0vUDRPrF8ZaW0xdDay0Kf9zfd5n</code>), gunakan kode yang telah diperbaiki di bawah agar tidak terjadi error respons HTML.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Link Google Spreadsheet ATAU URL Apps Script Web App
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="https://docs.google.com/spreadsheets/d/... atau https://script.google.com/macros/s/.../exec"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="flex-1 border border-gray-300 p-2 rounded-md text-xs font-mono focus:outline-none focus:border-emerald-600"
              />
              <button
                type="button"
                onClick={() => onTestSync(url)}
                className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs px-3.5 py-2 rounded-md font-bold transition-colors whitespace-nowrap flex items-center gap-1 shadow-xs"
              >
                <Cloud className="w-3.5 h-3.5" />
                <span>Tarik Data Spreadsheet</span>
              </button>
            </div>
            <p className="text-[11px] text-gray-500 mt-1">
              Data yang ditarik akan langsung mengisi dan memperbarui Data Pegawai secara otomatis.
            </p>
          </div>

          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-100 px-3 py-2 flex justify-between items-center border-b border-gray-200">
              <span className="text-xs font-bold text-gray-700 font-mono">Code.gs (Google Apps Script)</span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-xs text-emerald-700 hover:text-emerald-900 font-semibold bg-white px-2.5 py-1 rounded border border-gray-300 shadow-xs"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Tersalin!' : 'Salin Kode'}</span>
              </button>
            </div>
            <pre className="p-3 text-[11px] font-mono bg-gray-50 text-gray-800 overflow-x-auto max-h-48 leading-relaxed">
              {gasScriptCode}
            </pre>
          </div>

          <div className="pt-2 flex justify-between items-center border-t">
            <a
              href="https://script.google.com"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-emerald-700 hover:underline flex items-center gap-1 font-semibold"
            >
              Buka Google Apps Script <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs text-gray-600 hover:bg-gray-100 rounded-md font-medium"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-4 py-2 text-xs bg-emerald-700 hover:bg-emerald-800 text-white rounded-md font-bold shadow"
              >
                Simpan Konfigurasi
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
