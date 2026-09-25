import React, { useState, useMemo } from 'react';
import {
  PieChart,
  Search,
  Download,
  Calendar,
  User,
  Eye,
  Trash2,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  Layers
} from 'lucide-react';
import { Pegawai, JurnalEntry, SchoolConfig } from '../types';
import { NAMA_BULAN, formatTanggalLengkap } from '../utils/date';
import { exportRekapToExcel } from '../utils/storage';

interface RekapBulananViewProps {
  pegawaiList: Pegawai[];
  jurnalList: JurnalEntry[];
  schoolConfig: SchoolConfig;
  onDeleteJurnal: (id: string) => void;
  onSelectJurnalForPrint: (jurnal: JurnalEntry) => void;
  onSwitchToJurnal: () => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const RekapBulananView: React.FC<RekapBulananViewProps> = ({
  pegawaiList,
  jurnalList,
  schoolConfig,
  onDeleteJurnal,
  onSelectJurnalForPrint,
  onSwitchToJurnal,
  showToast
}) => {
  const currentMonthStr = String(new Date().getMonth() + 1).padStart(2, '0');
  const currentYearStr = String(new Date().getFullYear());

  const [filterBulan, setFilterBulan] = useState<string>(currentMonthStr);
  const [filterTahun, setFilterTahun] = useState<string>(currentYearStr);
  const [filterPegawai, setFilterPegawai] = useState<string>('semua');
  const [selectedDetail, setSelectedDetail] = useState<JurnalEntry | null>(null);

  // Filter entries
  const filteredEntries = useMemo(() => {
    return jurnalList.filter((entry) => {
      if (!entry.tanggal) return false;
      const [y, m] = entry.tanggal.split('-');
      if (y !== filterTahun || m !== filterBulan) return false;
      if (filterPegawai !== 'semua' && entry.pegawaiNIP !== filterPegawai) return false;
      return true;
    }).sort((a, b) => b.tanggal.localeCompare(a.tanggal));
  }, [jurnalList, filterBulan, filterTahun, filterPegawai]);

  // Statistics
  const totalHari = new Set(filteredEntries.map((e) => e.tanggal)).size;
  const totalKegiatan = filteredEntries.reduce((acc, curr) => acc + curr.kegiatan.length, 0);

  const namaBulanTerpilih = NAMA_BULAN[parseInt(filterBulan, 10) - 1] || 'Bulan';
  const selectedPegawaiObj = pegawaiList.find((p) => p.NIP === filterPegawai);
  const labelPegawai = selectedPegawaiObj ? selectedPegawaiObj.Nama : 'Semua Pegawai';

  const handleExportExcel = () => {
    if (filteredEntries.length === 0) {
      showToast('Tidak ada data jurnal pada periode ini untuk diekspor.', 'error');
      return;
    }
    exportRekapToExcel(namaBulanTerpilih, filterTahun, labelPegawai, filteredEntries);
    showToast('Rekapitulasi bulanan berhasil diekspor ke Excel!', 'success');
  };

  return (
    <div className="w-full h-full bg-slate-100 overflow-y-auto p-4 sm:p-6 flex flex-col items-center">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 w-full max-w-7xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-gray-100 bg-emerald-50/70 flex flex-wrap justify-between items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-lg flex items-center justify-center text-xl shadow-xs">
              <PieChart className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-gray-900 leading-tight">
                Rekapitulasi Jurnal Bulanan
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Monitoring jurnal harian kerja guru dan tenaga kependidikan {schoolConfig.sekolah}.
              </p>
            </div>
          </div>

          {filteredEntries.length > 0 && (
            <button
              onClick={handleExportExcel}
              className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs px-3.5 py-2 rounded-lg flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Ekspor Rekap Excel (.xlsx)</span>
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="p-4 sm:p-6 bg-white border-b border-gray-100">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-gray-400" /> Pilih Bulan
              </label>
              <select
                value={filterBulan}
                onChange={(e) => setFilterBulan(e.target.value)}
                className="w-full border border-gray-300 p-2 rounded-lg text-xs font-medium focus:outline-none focus:border-emerald-600 bg-white shadow-2xs"
              >
                {NAMA_BULAN.map((bln, idx) => {
                  const val = String(idx + 1).padStart(2, '0');
                  return (
                    <option key={val} value={val}>
                      {bln}
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-gray-400" /> Pilih Tahun
              </label>
              <select
                value={filterTahun}
                onChange={(e) => setFilterTahun(e.target.value)}
                className="w-full border border-gray-300 p-2 rounded-lg text-xs font-medium focus:outline-none focus:border-emerald-600 bg-white shadow-2xs"
              >
                <option value="2024">2024</option>
                <option value="2025">2025</option>
                <option value="2026">2026</option>
                <option value="2027">2027</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-gray-400" /> Pilih Pegawai
              </label>
              <select
                value={filterPegawai}
                onChange={(e) => setFilterPegawai(e.target.value)}
                className="w-full border border-gray-300 p-2 rounded-lg text-xs font-medium focus:outline-none focus:border-emerald-600 bg-white shadow-2xs"
              >
                <option value="semua">-- Semua Pegawai ({pegawaiList.length}) --</option>
                {pegawaiList.map((p) => (
                  <option key={p.NIP} value={p.NIP}>
                    {p.Nama}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={() => {
                  showToast(
                    `Menampilkan data untuk ${namaBulanTerpilih} ${filterTahun}: ${filteredEntries.length} entri ditemukan.`,
                    'info'
                  );
                }}
                className="w-full bg-emerald-700 text-white font-bold py-2 rounded-lg hover:bg-emerald-800 transition-colors flex items-center justify-center gap-1.5 text-xs shadow-xs"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Terapkan Filter</span>
              </button>
            </div>
          </div>

          {/* Metric Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-gray-100">
            <div className="bg-emerald-50/80 p-3 rounded-lg border border-emerald-200">
              <span className="text-[11px] font-semibold text-emerald-800">Total Jurnal</span>
              <div className="text-xl font-extrabold text-emerald-900 mt-0.5">
                {filteredEntries.length}
              </div>
            </div>
            <div className="bg-blue-50/80 p-3 rounded-lg border border-blue-200">
              <span className="text-[11px] font-semibold text-blue-800">Hari Kerja Tercatat</span>
              <div className="text-xl font-extrabold text-blue-900 mt-0.5">{totalHari} Hari</div>
            </div>
            <div className="bg-amber-50/80 p-3 rounded-lg border border-amber-200">
              <span className="text-[11px] font-semibold text-amber-800">Total Uraian Kegiatan</span>
              <div className="text-xl font-extrabold text-amber-900 mt-0.5">
                {totalKegiatan} Kegiatan
              </div>
            </div>
            <div className="bg-purple-50/80 p-3 rounded-lg border border-purple-200">
              <span className="text-[11px] font-semibold text-purple-800">Rata-rata/Jurnal</span>
              <div className="text-xl font-extrabold text-purple-900 mt-0.5">
                {filteredEntries.length > 0
                  ? (totalKegiatan / filteredEntries.length).toFixed(1)
                  : '0'}{' '}
                Item
              </div>
            </div>
          </div>
        </div>

        {/* Content Table or Empty State */}
        <div className="p-4 sm:p-6">
          {filteredEntries.length === 0 ? (
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-10 text-center bg-gray-50 flex flex-col items-center justify-center space-y-3">
              <FileSpreadsheet className="w-12 h-12 text-gray-300" />
              <div>
                <p className="text-gray-700 font-bold text-sm">
                  Belum ada jurnal tersimpan untuk periode {namaBulanTerpilih} {filterTahun}.
                </p>
                <p className="text-gray-400 text-xs mt-1 max-w-md mx-auto">
                  Silakan buka tab "Jurnal Harian", isi kegiatan pegawai, lalu klik tombol "Simpan ke Rekap".
                </p>
              </div>
              <button
                onClick={onSwitchToJurnal}
                className="mt-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-4 py-2 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
              >
                <Layers className="w-4 h-4" />
                <span>Buat Jurnal Harian Sekarang</span>
              </button>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between text-[11px] text-gray-500 mb-2 px-1">
                <span>Total <strong>{filteredEntries.length}</strong> catatan jurnal ditemukan</span>
                <span className="text-emerald-700 font-medium">⇄ Geser ke samping jika tabel terpotong</span>
              </div>
              <div className="border border-gray-200 rounded-lg overflow-x-auto shadow-2xs">
                <table className="w-full text-xs text-left min-w-[780px]">
                  <thead className="bg-gray-100 text-gray-700 border-b border-gray-200 font-bold whitespace-nowrap">
                    <tr>
                      <th className="py-2.5 px-3 text-center w-10">No</th>
                      <th className="py-2.5 px-3">Tanggal</th>
                      <th className="py-2.5 px-3">Nama Pegawai</th>
                      <th className="py-2.5 px-3">NIP</th>
                      <th className="py-2.5 px-3">Shift</th>
                      <th className="py-2.5 px-3 text-center">Kegiatan</th>
                      <th className="py-2.5 px-3 text-center w-40">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredEntries.map((item, idx) => (
                      <tr key={item.id} className="hover:bg-emerald-50/50 transition-colors">
                        <td className="py-2 px-3 text-center text-gray-500 font-medium whitespace-nowrap">{idx + 1}</td>
                        <td className="py-2 px-3 font-semibold text-gray-800 whitespace-nowrap">
                          {formatTanggalLengkap(item.tanggal)}
                        </td>
                        <td className="py-2 px-3 font-bold text-gray-900 whitespace-nowrap">{item.pegawaiNama}</td>
                        <td className="py-2 px-3 text-gray-600 font-mono text-[11px] whitespace-nowrap">
                          {item.pegawaiNIP}
                        </td>
                        <td className="py-2 px-3 capitalize whitespace-nowrap">
                          <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-[11px]">
                            {item.shift}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-center whitespace-nowrap">
                          <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold text-[11px]">
                            {item.kegiatan.length} Kegiatan
                          </span>
                        </td>
                        <td className="py-2 px-3 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => setSelectedDetail(item)}
                              className="bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 px-2 py-1 rounded text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                              title="Lihat rincian kegiatan"
                            >
                              <Eye className="w-3 h-3" />
                              <span>Lihat</span>
                            </button>
                            <button
                              onClick={() => onSelectJurnalForPrint(item)}
                              className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-1 rounded text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                              title="Muat jurnal ini ke lembar kerja untuk diunduh sebagai PDF"
                            >
                              <Download className="w-3 h-3 text-emerald-600" />
                              <span>Unduh file</span>
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Hapus jurnal ${item.pegawaiNama} pada ${item.tanggal}?`)) {
                                  onDeleteJurnal(item.id);
                                  showToast('Jurnal berhasil dihapus dari rekap.', 'info');
                                }
                              }}
                              className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded transition-colors cursor-pointer"
                              title="Hapus data jurnal ini"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODAL DETAIL JURNAL */}
      {selectedDetail && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in-95">
            <div className="bg-[#0b4e3a] text-white px-5 py-3.5 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-sm">
                  Detail Jurnal — {selectedDetail.pegawaiNama}
                </h3>
                <p className="text-xs text-emerald-200">
                  {formatTanggalLengkap(selectedDetail.tanggal)} (Shift {selectedDetail.shift})
                </p>
              </div>
              <button
                onClick={() => setSelectedDetail(null)}
                className="text-white/80 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-5 max-h-[70vh] overflow-y-auto space-y-3">
              <div className="border border-gray-200 rounded-lg overflow-x-auto">
                <table className="w-full text-xs text-left min-w-[500px]">
                  <thead className="bg-gray-50 border-b border-gray-200 text-gray-700 font-bold">
                    <tr>
                      <th className="py-2 px-3 w-8 text-center">No</th>
                      <th className="py-2 px-3 w-28">Waktu</th>
                      <th className="py-2 px-3">Uraian Kegiatan</th>
                      <th className="py-2 px-3 w-32">Bukti Dukung</th>
                      <th className="py-2 px-3 w-24">Ket</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {selectedDetail.kegiatan.map((k, i) => (
                      <tr key={i}>
                        <td className="py-2 px-3 text-center text-gray-500">{i + 1}</td>
                        <td className="py-2 px-3 font-mono text-[11px] whitespace-nowrap">
                          {k.jamMulai}.{k.menitMulai} - {k.jamSelesai}.{k.menitSelesai}
                        </td>
                        <td className="py-2 px-3">{k.uraian}</td>
                        <td className="py-2 px-3 text-gray-600 text-center">
                          {k.fotoKegiatanUrl ? (
                            <img
                              src={k.fotoKegiatanUrl}
                              alt="Bukti Foto"
                              className="w-12 h-12 object-cover rounded mx-auto border border-gray-200"
                            />
                          ) : (
                            k.buktiDukung || '-'
                          )}
                        </td>
                        <td className="py-2 px-3">{k.keterangan || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="p-4 bg-gray-50 border-t flex justify-between items-center">
              <button
                onClick={() => {
                  onSelectJurnalForPrint(selectedDetail);
                  setSelectedDetail(null);
                }}
                className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs px-4 py-2 rounded-lg font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Buka di Lembar Kerja & Unduh File</span>
              </button>
              <button
                onClick={() => setSelectedDetail(null)}
                className="text-xs text-gray-600 hover:bg-gray-200 px-3 py-1.5 rounded font-medium"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
