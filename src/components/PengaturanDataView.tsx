import React, { useState, useRef, useEffect } from 'react';
import {
  Users,
  Download,
  Upload,
  Search,
  Plus,
  Edit2,
  Trash2,
  Cloud,
  CheckCircle,
  RefreshCw,
  Camera,
  ExternalLink
} from 'lucide-react';
import { Pegawai } from '../types';
import { exportPegawaiToExcel, parseExcelPegawaiFile, DEFAULT_PEGAWAI } from '../utils/storage';

interface PengaturanDataViewProps {
  pegawaiList: Pegawai[];
  gasUrl: string;
  onAddPegawai: () => void;
  onEditPegawai: (p: Pegawai) => void;
  onDeletePegawai: (nip: string) => void;
  onUpdateFotoPegawai: (nip: string, photoDataUrl: string) => void;
  onUpdateTtdPegawai: (nip: string, ttdDataUrl: string) => void;
  onImportPegawaiList: (imported: Pegawai[]) => void;
  onSyncSpreadsheet: (url: string) => void;
  onOpenGasModal: () => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const PengaturanDataView: React.FC<PengaturanDataViewProps> = ({
  pegawaiList,
  gasUrl,
  onAddPegawai,
  onEditPegawai,
  onDeletePegawai,
  onUpdateFotoPegawai,
  onUpdateTtdPegawai,
  onImportPegawaiList,
  onSyncSpreadsheet,
  onOpenGasModal,
  showToast
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State for Google Spreadsheet Sync Bar
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>(
    () => new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB'
  );

  const handleTriggerSync = async () => {
    setIsSyncing(true);
    try {
      await onSyncSpreadsheet(gasUrl || '');
      setLastSyncTime(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB');
    } finally {
      setIsSyncing(false);
    }
  };

  // Filter pegawai by search term
  const filteredPegawai = pegawaiList.filter((p) => {
    const term = searchTerm.toLowerCase();
    const nama = (p.Nama || '').toLowerCase();
    const nip = (p.NIP || '').toLowerCase();
    const jabatan = (p.Jabatan || '').toLowerCase();
    const pangkat = (p.Pangkat || '').toLowerCase();
    return (
      nama.includes(term) ||
      nip.includes(term) ||
      jabatan.includes(term) ||
      pangkat.includes(term)
    );
  });

  const handleExportExcel = () => {
    exportPegawaiToExcel(pegawaiList);
    showToast('Berkas Excel Data Pegawai berhasil diekspor!', 'success');
  };

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const parsed = await parseExcelPegawaiFile(file);
      onImportPegawaiList(parsed);
      showToast(`Berhasil mengimpor ${parsed.length} pegawai dari berkas ${file.name}!`, 'success');
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Format berkas tidak valid.';
      showToast(`Gagal impor Excel: ${errMsg}`, 'error');
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handlePhotoUpload = (p: Pegawai, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      showToast('Ukuran foto maksimal 2MB.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      onUpdateFotoPegawai(p.NIP, dataUrl);
      showToast(`Foto untuk ${p.Nama} berhasil diperbarui!`, 'success');
    };
    reader.readAsDataURL(file);
  };

  const handleTtdUpload = (p: Pegawai, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      showToast('Ukuran berkas tanda tangan maksimal 2MB.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      onUpdateTtdPegawai(p.NIP, dataUrl);
      showToast(`Tanda tangan untuk ${p.Nama} berhasil diperbarui!`, 'success');
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="w-full h-full bg-slate-100 overflow-y-auto p-3 sm:p-5 lg:p-6 flex flex-col items-center space-y-5">
      {/* ==================================================================== */}
      {/* CARD MASTER DATA PEGAWAI (DITAMPILKAN LENGKAP NO 1 S.D 39)           */}
      {/* ==================================================================== */}
      <div id="section-master-pegawai" className="w-full max-w-7xl bg-white rounded-xl shadow-xs border border-gray-200 overflow-hidden flex flex-col">
        {/* Top bar */}
        <div className="p-4 sm:p-5 border-b border-gray-100 flex flex-wrap justify-between items-center gap-3 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-50 text-emerald-700 rounded-lg flex items-center justify-center text-xl border border-emerald-200 shadow-2xs">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-gray-900 leading-tight">
                  Data Pegawai
                </h2>
                <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-300">
                  {pegawaiList.length} Pegawai
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Tersinkronisasi dengan Google Spreadsheet & Google Drive Berkas.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onAddPegawai}
              className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-3.5 py-2 text-xs rounded-lg flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Pegawai</span>
            </button>

            <button
              onClick={handleExportExcel}
              className="border border-emerald-600 text-emerald-700 px-3.5 py-2 text-xs rounded-lg bg-emerald-50 hover:bg-emerald-100 font-bold transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Ekspor Excel</span>
            </button>

            <input
              type="file"
              ref={fileInputRef}
              accept=".xlsx, .xls, .csv"
              onChange={handleFileImport}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="border border-gray-300 text-gray-700 px-3.5 py-2 text-xs rounded-lg bg-white hover:bg-gray-50 font-semibold transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <Upload className="w-3.5 h-3.5 text-blue-600" />
              <span>Impor Excel</span>
            </button>

            <button
              onClick={onOpenGasModal}
              className="border border-blue-300 text-blue-700 px-3 py-2 text-xs rounded-lg bg-blue-50/70 hover:bg-blue-100 font-semibold transition-colors flex items-center gap-1.5 shadow-2xs"
              title="Hubungkan dengan Google Sheets & Drive"
            >
              <Cloud className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden sm:inline">Google Spreadsheet</span>
            </button>
          </div>
        </div>

        {/* Google Spreadsheet Active Status & Sync Bar */}
        <div className="bg-gradient-to-r from-emerald-50 via-teal-50/70 to-emerald-50 border-b border-emerald-200 p-4 transition-all">
          <div className="flex flex-wrap justify-between items-start sm:items-center gap-3">
            <div className="flex items-start sm:items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center shadow-xs flex-shrink-0 relative">
                <Cloud className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-white"></span>
                </span>
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-xs sm:text-sm font-bold text-emerald-950 flex items-center gap-1.5">
                    <span>Sumber Data: Google Spreadsheet</span>
                    <span className="text-emerald-700 font-extrabold">(Sheet: Pegawai)</span>
                  </h3>
                  <span className="bg-emerald-100 text-emerald-800 font-bold text-[11px] px-2.5 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-emerald-600" />
                    <span>{pegawaiList.length} Pegawai Tampil Aktif</span>
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-3 text-[11px] text-emerald-800/90 mt-0.5">
                  <span className="flex items-center gap-1">
                    <span className="font-semibold text-emerald-900">Status:</span>
                    <span>{gasUrl ? 'Tautan Spreadsheet Terhubung' : 'Tautan Spreadsheet Terkonfigurasi'}</span>
                  </span>
                  <span>•</span>
                  <span>Terakhir disinkronkan: <strong className="text-emerald-900">{lastSyncTime}</strong></span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                disabled={isSyncing}
                onClick={handleTriggerSync}
                className="bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 disabled:opacity-75 text-white font-bold text-xs px-3.5 py-2 rounded-lg flex items-center gap-1.5 shadow-sm transition-all"
                title="Tarik ulang data pegawai terbaru dari Google Spreadsheet"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Menarik Data...' : 'Tarik / Refresh Spreadsheet'}</span>
              </button>

              {gasUrl && gasUrl.includes('docs.google.com/spreadsheets') && (
                <a
                  href={gasUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-white hover:bg-gray-50 border border-emerald-300 text-emerald-800 text-xs px-3 py-2 rounded-lg font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
                  title="Buka Spreadsheet di tab baru"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Buka Sheet</span>
                </a>
              )}

              <button
                type="button"
                onClick={onOpenGasModal}
                className="text-xs text-emerald-700 hover:text-emerald-900 hover:underline px-2.5 py-2 font-semibold flex items-center gap-1"
                title="Lihat petunjuk teknis & kode Google Apps Script"
              >
                <span>Panduan Script</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="p-3 sm:p-4 bg-gray-50 border-b border-gray-200 flex flex-wrap justify-between items-center gap-3">
          <div className="relative w-full max-w-sm">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari nama, NIP, atau jabatan..."
              className="w-full pl-9 pr-4 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-600 bg-white shadow-2xs"
            />
          </div>

          <div className="flex items-center gap-2">
            {pegawaiList.length < 39 && (
              <button
                type="button"
                onClick={() => {
                  onImportPegawaiList(DEFAULT_PEGAWAI);
                  showToast('39 Data Pegawai SDN Babelan Kota 01 berhasil dimuat!', 'success');
                }}
                className="text-xs bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-300 font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors shadow-2xs"
                title="Muat 39 pegawai lengkap SDN Babelan Kota 01"
              >
                <Users className="w-3.5 h-3.5 text-emerald-700" />
                <span>Muat 39 Pegawai Lengkap</span>
              </button>
            )}
          </div>
        </div>

        {/* Tabel Data Pegawai (Ditampilkan Utuh Nomor 1 sampai 39 Tanpa Tertutup) */}
        <div className="overflow-x-auto w-full bg-white border-b border-gray-200">
          <table className="w-full text-xs text-left whitespace-nowrap min-w-full border-collapse">
            <thead className="text-[11px] text-gray-700 bg-gray-100/95 backdrop-blur-xs border-b border-gray-200 sticky top-0 z-10 font-bold uppercase tracking-wider shadow-2xs">
              <tr>
                <th className="px-3 py-3 border-r border-gray-200 text-center w-12">No</th>
                <th className="px-3.5 py-3 border-r border-gray-200 w-44 font-mono">NIP / NI PPPK</th>
                <th className="px-3.5 py-3 border-r border-gray-200 min-w-[190px]">Nama Lengkap & Gelar</th>
                <th className="px-3.5 py-3 border-r border-gray-200 min-w-[140px]">Jabatan</th>
                <th className="px-3.5 py-3 border-r border-gray-200 min-w-[130px]">Pangkat</th>
                <th className="px-3 py-3 border-r border-gray-200 text-center w-24">Status</th>
                <th className="px-3 py-3 border-r border-gray-200 text-center w-36">Foto Pegawai</th>
                <th className="px-3 py-3 border-r border-gray-200 text-center w-44">Tanda Tangan Pegawai</th>
                <th className="px-3 py-3 text-center w-24">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredPegawai.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center space-y-2 max-w-md mx-auto">
                      <p className="font-semibold text-gray-700 text-xs leading-relaxed">
                        {searchTerm
                          ? `Tidak ditemukan pegawai yang cocok dengan kata kunci "${searchTerm}".`
                          : 'Belum ada data pegawai. Silakan muat 39 data pegawai standar atau masukkan tautan Google Spreadsheet Anda.'}
                      </p>
                      {!searchTerm && (
                        <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              onImportPegawaiList(DEFAULT_PEGAWAI);
                              showToast('39 Data Pegawai SDN Babelan Kota 01 berhasil dimuat!', 'success');
                            }}
                            className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 shadow-xs transition-colors"
                          >
                            <Users className="w-3.5 h-3.5" />
                            <span>Tampilkan 39 Baris Pegawai Lengkap</span>
                          </button>
                          <button
                            type="button"
                            onClick={onOpenGasModal}
                            className="bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 font-semibold text-xs px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 shadow-2xs transition-colors"
                          >
                            <Cloud className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Hubungkan Google Spreadsheet</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredPegawai.map((p, index) => {
                  const fotoSrc = (p.Foto || (p['URL Foto'] as string) || '') as string;
                  const ttdSrc = (p['Tanda Tangan'] || p.TandaTangan || (p['TTD'] as string) || '') as string;

                  return (
                    <tr
                      key={p.NIP || index}
                      className={`hover:bg-emerald-50/40 transition-colors ${
                        index % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'
                      }`}
                    >
                      {/* 1. No */}
                      <td className="px-3 py-2 text-center text-gray-500 font-semibold border-r border-gray-200 text-xs">
                        {index + 1}
                      </td>

                      {/* 2. NIP */}
                      <td className="px-3.5 py-2 font-mono text-gray-700 border-r border-gray-200 text-xs font-medium">
                        {p.NIP || '-'}
                      </td>

                      {/* 3. Nama Lengkap & Gelar */}
                      <td className="px-3.5 py-2 font-bold text-gray-900 border-r border-gray-200 text-xs">
                        {p.Nama}
                      </td>

                      {/* 4. Jabatan */}
                      <td className="px-3.5 py-2 text-gray-700 border-r border-gray-200 text-xs">
                        {p.Jabatan || '-'}
                      </td>

                      {/* 5. Pangkat */}
                      <td className="px-3.5 py-2 text-gray-600 border-r border-gray-200 text-xs">
                        {p.Pangkat || '-'}
                      </td>

                      {/* 6. Status */}
                      <td className="px-3 py-2 text-center border-r border-gray-200">
                        <span
                          className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded-full ${
                            p.Status === 'Aktif'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-gray-100 text-gray-700 border border-gray-300'
                          }`}
                        >
                          {p.Status || 'Aktif'}
                        </span>
                      </td>

                      {/* 7. Foto Pegawai */}
                      <td className="px-3 py-2 border-r border-gray-200">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-9 h-11 border border-gray-300 rounded overflow-hidden bg-gray-100 flex items-center justify-center flex-shrink-0 shadow-2xs">
                            {fotoSrc ? (
                              <img
                                src={fotoSrc}
                                alt={p.Nama}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = 'none';
                                }}
                              />
                            ) : (
                              <Users className="w-4 h-4 text-gray-400" />
                            )}
                          </div>
                          <div className="flex flex-col gap-1 items-start">
                            <label className="cursor-pointer text-[10px] bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold px-1.5 py-0.5 rounded flex items-center gap-1 transition-colors">
                              <Camera className="w-2.5 h-2.5" />
                              <span>{fotoSrc ? 'Ganti' : 'Unggah'}</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handlePhotoUpload(p, e)}
                                className="hidden"
                              />
                            </label>
                            {fotoSrc && (
                              <button
                                type="button"
                                onClick={() => {
                                  if (confirm(`Hapus foto untuk ${p.Nama}?`)) {
                                    onUpdateFotoPegawai(p.NIP, '');
                                    showToast('Foto pegawai dihapus', 'info');
                                  }
                                }}
                                className="text-[10px] text-red-600 hover:text-red-800 hover:underline leading-none"
                              >
                                Hapus
                              </button>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* 8. Tanda Tangan Pegawai */}
                      <td className="px-3 py-2 border-r border-gray-200">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-14 h-9 border border-gray-300 rounded overflow-hidden bg-white flex items-center justify-center flex-shrink-0 shadow-2xs p-0.5">
                            {ttdSrc ? (
                              <img
                                src={ttdSrc}
                                alt={`TTD ${p.Nama}`}
                                className="w-full h-full object-contain"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = 'none';
                                }}
                              />
                            ) : (
                              <span className="text-[9px] text-gray-400 italic">Belum ada</span>
                            )}
                          </div>
                          <div className="flex flex-col gap-1 items-start">
                            <label className="cursor-pointer text-[10px] bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-300 font-bold px-1.5 py-0.5 rounded flex items-center gap-1 transition-colors">
                              <span>{ttdSrc ? 'Ganti' : 'Unggah'}</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleTtdUpload(p, e)}
                                className="hidden"
                              />
                            </label>
                            {ttdSrc && (
                              <button
                                type="button"
                                onClick={() => {
                                  if (confirm(`Hapus tanda tangan untuk ${p.Nama}?`)) {
                                    onUpdateTtdPegawai(p.NIP, '');
                                    showToast('Tanda tangan pegawai dihapus', 'info');
                                  }
                                }}
                                className="text-[10px] text-red-600 hover:text-red-800 hover:underline leading-none"
                              >
                                Hapus
                              </button>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* 9. Aksi */}
                      <td className="px-3 py-2 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => onEditPegawai(p)}
                            className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                            title="Edit data pegawai"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Yakin ingin menghapus pegawai ${p.Nama}?`)) {
                                onDeletePegawai(p.NIP);
                              }
                            }}
                            className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                            title="Hapus pegawai"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Master Pegawai */}
        <div className="bg-gray-50 p-3.5 text-xs text-gray-700 border-t border-gray-200 flex flex-wrap justify-between items-center px-4 gap-2">
          <div className="flex items-center gap-2">
            <span>
              Terhubung dengan Master Database <strong className="text-emerald-700 font-semibold">Sheet: Pegawai</strong>
            </span>
            <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-300">
              Menampilkan Baris 1 s.d {filteredPegawai.length} Secara Utuh
            </span>
          </div>
          <span className="text-xs text-gray-600 font-semibold">
            Total <strong>{pegawaiList.length}</strong> pegawai terdaftar di sistem
          </span>
        </div>
      </div>
    </div>
  );
};
