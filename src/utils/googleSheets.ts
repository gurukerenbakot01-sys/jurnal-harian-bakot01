import * as XLSX from 'xlsx';
import { Pegawai } from '../types';

export function extractSpreadsheetId(input: string): string | null {
  const trimmed = input.trim();
  // If it's directly an alphanumeric ID (e.g. 14zK2b0vUDRPrF8ZaW0xdDay0Kf9zfd5n or similar)
  if (/^[a-zA-Z0-9_-]{25,}$/.test(trimmed)) {
    return trimmed;
  }
  // Match /spreadsheets/d/([a-zA-Z0-9_-]+)
  const match = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
  if (match && match[1]) {
    return match[1];
  }
  return null;
}

export function isAppsScriptUrl(input: string): boolean {
  return input.includes('script.google.com/macros/s/');
}

// Normalize record fields from various possible column names
export function normalizePegawaiRecord(raw: Record<string, unknown>, index: number): Pegawai {
  const keys = Object.keys(raw);
  const findVal = (...possibleNames: string[]): string => {
    for (const name of possibleNames) {
      const matchedKey = keys.find(
        (k) => k.toLowerCase().replace(/[^a-z0-9]/g, '') === name.toLowerCase().replace(/[^a-z0-9]/g, '')
      );
      if (matchedKey && raw[matchedKey] !== undefined && raw[matchedKey] !== null) {
        return String(raw[matchedKey]).trim();
      }
    }
    return '';
  };

  const nama = findVal('Nama Lengkap & Gelar', 'Nama Lengkap', 'Nama', 'NAMA') || 'Tanpa Nama';
  const nip = findVal('NIP / NI PPPK', 'NIP', 'NI PPPK', 'Nomor Induk', 'NIP/NIPPPK') || '-';
  const jabatan = findVal('Jabatan', 'JABATAN', 'Posisi') || 'Guru';
  const unit = findVal('Unit Kerja', 'UNIT KERJA', 'Unit', 'Sekolah') || 'SDN BABELAN KOTA 01';
  const pangkat = findVal('Pangkat', 'Pangkat / Gol', 'Pangkat/Gol', 'Golongan') || '-';
  const status = findVal('Status', 'STATUS', 'Status Pegawai') || 'Aktif';
  const foto = findVal('Foto', 'FOTO', 'URL Foto', 'Link Foto', 'Photo', 'Foto Pegawai') || '';
  const tandaTangan = findVal('Tanda Tangan', 'TandaTangan', 'TTD', 'Tanda Tangan Pegawai', 'Signature', 'Sign', 'TTD Pegawai') || '';

  return {
    rowNum: index + 2,
    Nama: nama,
    NIP: nip,
    Jabatan: jabatan,
    'Unit Kerja': unit,
    Pangkat: pangkat,
    Status: status,
    Foto: foto,
    TandaTangan: tandaTangan
  };
}

// Parse Google Visualization API response
export function parseGvizResponse(rawText: string): Pegawai[] {
  try {
    const startIdx = rawText.indexOf('{');
    const endIdx = rawText.lastIndexOf('}');
    if (startIdx === -1 || endIdx === -1) {
      throw new Error('Format JSON Google Visualization tidak valid.');
    }
    const jsonStr = rawText.substring(startIdx, endIdx + 1);
    const parsed = JSON.parse(jsonStr);

    if (!parsed.table || !parsed.table.cols || !parsed.table.rows) {
      throw new Error('Struktur tabel Google Sheet tidak ditemukan.');
    }

    const headers: string[] = parsed.table.cols.map((col: { label?: string; id?: string }, idx: number) => {
      return (col.label && col.label.trim()) ? col.label.trim() : (col.id || `Col_${idx}`);
    });

    const rows: Pegawai[] = [];

    parsed.table.rows.forEach((r: { c?: Array<{ v?: unknown; f?: string } | null> }, rowIdx: number) => {
      if (!r.c) return;
      const rawObj: Record<string, unknown> = {};
      let hasContent = false;

      r.c.forEach((cell, cellIdx) => {
        const h = headers[cellIdx] || `Col_${cellIdx}`;
        if (cell && cell.v !== null && cell.v !== undefined) {
          rawObj[h] = cell.f || cell.v;
          if (String(cell.v).trim() !== '') hasContent = true;
        } else {
          rawObj[h] = '';
        }
      });

      if (hasContent) {
        rows.push(normalizePegawaiRecord(rawObj, rowIdx));
      }
    });

    return rows;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Gagal memproses respons';
    throw new Error(`Kesalahan parsing Google Sheet: ${msg}`);
  }
}

// Fetch from Google Sheet via direct Sheet link or Apps Script URL
export async function fetchPegawaiFromSpreadsheet(inputUrl: string): Promise<{
  success: boolean;
  data: Pegawai[];
  message: string;
  sourceType: 'gviz' | 'apps_script' | 'csv' | 'fallback';
}> {
  const trimmed = inputUrl.trim();

  // 1. Check if it's an Apps Script Web App
  if (isAppsScriptUrl(trimmed)) {
    try {
      let targetUrl = trimmed;
      if (!targetUrl.includes('action=ambilDataPegawai')) {
        const sep = targetUrl.includes('?') ? '&' : '?';
        targetUrl = `${targetUrl}${sep}action=ambilDataPegawai&format=json`;
      }

      const res = await fetch(targetUrl, {
        method: 'GET',
        redirect: 'follow',
        headers: { Accept: 'application/json' }
      });

      const text = await res.text();

      // If returned HTML instead of JSON (common doGet error in user script)
      if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
        throw new Error(
          'Google Apps Script mengembalikan HTML bukan JSON. Periksa doGet(e) di script untuk mengembalikan ContentService.createTextOutput(JSON.stringify(ambilDataPegawai())).'
        );
      }

      const json = JSON.parse(text);
      const rawList = Array.isArray(json) ? json : Array.isArray(json.data) ? json.data : [];

      if (rawList.length === 0) {
        return {
          success: true,
          data: [],
          message: 'Sheet "Pegawai" pada spreadsheet tersebut tidak memiliki data baris pegawai.',
          sourceType: 'apps_script'
        };
      }

      const mapped = rawList.map((item: Record<string, unknown>, idx: number) => normalizePegawaiRecord(item, idx));
      return {
        success: true,
        data: mapped,
        message: `Berhasil menarik ${mapped.length} data pegawai dari Google Spreadsheet via Apps Script!`,
        sourceType: 'apps_script'
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Koneksi gagal';
      throw new Error(`Gagal memuat dari Apps Script: ${msg}`);
    }
  }

  // 2. Check if it's a direct Google Sheet URL or ID
  const sheetId = extractSpreadsheetId(trimmed);
  if (sheetId) {
    // Attempt 1: Google Visualization API (JSON)
    try {
      const gvizUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json&sheet=Pegawai`;
      const res = await fetch(gvizUrl);
      if (res.ok) {
        const text = await res.text();
        const records = parseGvizResponse(text);
        if (records.length > 0) {
          return {
            success: true,
            data: records,
            message: `Berhasil menarik ${records.length} data pegawai dari Google Spreadsheet (Sheet: Pegawai)!`,
            sourceType: 'gviz'
          };
        }
      }
    } catch {
      // Continue to CSV attempt
    }

    // Attempt 2: CSV Export of Sheet 'Pegawai'
    try {
      const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=Pegawai`;
      const res = await fetch(csvUrl);
      if (res.ok) {
        const csvText = await res.text();
        const workbook = XLSX.read(csvText, { type: 'string' });
        const sheetName = workbook.SheetNames[0];
        const rawJson: Record<string, unknown>[] = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
        if (rawJson && rawJson.length > 0) {
          const records = rawJson.map((r, i) => normalizePegawaiRecord(r, i));
          return {
            success: true,
            data: records,
            message: `Berhasil memuat ${records.length} data pegawai dari Google Spreadsheet CSV!`,
            sourceType: 'csv'
          };
        }
      }
    } catch {
      // Continue to error
    }

    throw new Error(
      'Tidak dapat membaca spreadsheet ini. Pastikan Google Spreadsheet diatur: "Anyone with the link can view" (Siapa saja yang memiliki link dapat melihat).'
    );
  }

  throw new Error('URL tidak dikenali. Masukkan URL Google Spreadsheet atau Google Apps Script Web App.');
}
