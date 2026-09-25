import React, { useState, useEffect } from 'react';
import {
  Clock,
  User,
  Calendar,
  Layers,
  Plus,
  Trash2,
  BookmarkCheck,
  Printer,
  FileDown,
  Sparkles,
  FileCheck,
  Upload,
  Image as ImageIcon,
  Camera
} from 'lucide-react';
import { Pegawai, KegiatanItem, SchoolConfig, JurnalEntry } from '../types';
import { getTodayString, formatTanggalLengkap, formatTanggalTtd } from '../utils/date';

const compressImage = (file: File, maxWidth = 800, quality = 0.8): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
};

interface JurnalHarianViewProps {
  pegawaiList: Pegawai[];
  schoolConfig: SchoolConfig;
  onSaveJurnal: (pegawai: Pegawai, tanggal: string, shift: string, kegiatan: KegiatanItem[]) => void;
  onPrint: () => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  initialEntry?: JurnalEntry | null;
}

const SHIFT_PRESETS: Record<string, { label: string; items: Omit<KegiatanItem, 'id'>[] }> = {
  pagi: {
    label: 'Guru: Shift Pagi (06.30 - 14.00)',
    items: [
      {
        jamMulai: '06',
        menitMulai: '30',
        jamSelesai: '07',
        menitSelesai: '00',
        uraian: 'Pembiasaan pagi, menyambut siswa di gerbang (5S: Senyum, Salam, Sapa, Sopan, Santun), doa bersama dan lagu Indonesia Raya.',
        buktiDukung: 'Dokumentasi foto gerbang',
        keterangan: 'Terlaksana'
      },
      {
        jamMulai: '07',
        menitMulai: '00',
        jamSelesai: '09',
        menitSelesai: '30',
        uraian: 'Melaksanakan Kegiatan Belajar Mengajar (KBM) Tatap Muka di kelas sesuai dengan Modul Ajar Kurikulum Merdeka.',
        buktiDukung: 'Daftar hadir & jurnal kelas',
        keterangan: 'Terlaksana'
      },
      {
        jamMulai: '09',
        menitMulai: '30',
        jamSelesai: '10',
        menitSelesai: '00',
        uraian: 'Pendampingan istirahat peserta didik, pengawasan lingkungan sekolah dan pembiasaan jajan sehat.',
        buktiDukung: 'Catatan pemantauan',
        keterangan: 'Terlaksana'
      },
      {
        jamMulai: '10',
        menitMulai: '00',
        jamSelesai: '12',
        menitSelesai: '00',
        uraian: 'Melanjutkan kegiatan pembelajaran sesi kedua, pendampingan asesmen formatif dan diskusi kelompok siswa.',
        buktiDukung: 'Hasil lembar kerja siswa',
        keterangan: 'Terlaksana'
      },
      {
        jamMulai: '12',
        menitMulai: '00',
        jamSelesai: '12',
        menitSelesai: '30',
        uraian: 'Istirahat, Sholat Dzuhur berjamaah di musholla sekolah, dan makan siang.',
        buktiDukung: 'Presensi',
        keterangan: 'Terlaksana'
      },
      {
        jamMulai: '12',
        menitMulai: '30',
        jamSelesai: '14',
        menitSelesai: '00',
        uraian: 'Pengolahan asesmen nilai siswa, penyusunan administrasi guru dan persiapan bahan ajar untuk pertemuan selanjutnya.',
        buktiDukung: 'Buku nilai / RPP',
        keterangan: 'Terlaksana'
      }
    ]
  },
  siang: {
    label: 'Guru: Shift Siang (10.00 - 17.30)',
    items: [
      {
        jamMulai: '10',
        menitMulai: '00',
        jamSelesai: '11',
        menitSelesai: '30',
        uraian: 'Persiapan administrasi perangkat pembelajaran, koordinasi materi dengan rekan sejawat dan pemeriksaan tugas siswa.',
        buktiDukung: 'Modul ajar',
        keterangan: 'Terlaksana'
      },
      {
        jamMulai: '11',
        menitMulai: '30',
        jamSelesai: '12',
        menitSelesai: '30',
        uraian: 'Penyambutan siswa shift siang, pembiasaan karakter dan Sholat Dzuhur berjamaah.',
        buktiDukung: 'Foto kegiatan',
        keterangan: 'Terlaksana'
      },
      {
        jamMulai: '12',
        menitMulai: '30',
        jamSelesai: '15',
        menitSelesai: '00',
        uraian: 'Pelaksanaan KBM tatap muka kelas siang, penyampaian materi kurikulum dan asesmen formatif.',
        buktiDukung: 'Daftar hadir siswa',
        keterangan: 'Terlaksana'
      },
      {
        jamMulai: '15',
        menitMulai: '00',
        jamSelesai: '15',
        menitSelesai: '30',
        uraian: 'Istirahat dan Sholat Ashar berjamaah bersama peserta didik.',
        buktiDukung: 'Dokumentasi',
        keterangan: 'Terlaksana'
      },
      {
        jamMulai: '15',
        menitMulai: '30',
        jamSelesai: '17',
        menitSelesai: '00',
        uraian: 'Melanjutkan pembelajaran sesi akhir, literasi numerasi, dan refleksi pembelajaran.',
        buktiDukung: 'Catatan refleksi',
        keterangan: 'Terlaksana'
      },
      {
        jamMulai: '17',
        menitMulai: '00',
        jamSelesai: '17',
        menitSelesai: '30',
        uraian: 'Pengawasan kepulangan siswa serta pemeriksaan kebersihan dan kerapihan ruang kelas.',
        buktiDukung: 'Buku piket',
        keterangan: 'Terlaksana'
      }
    ]
  },
  tendik: {
    label: 'Tendik: Shift Pagi (07.00 - 15.30)',
    items: [
      {
        jamMulai: '07',
        menitMulai: '00',
        jamSelesai: '08',
        menitSelesai: '00',
        uraian: 'Membuka layanan operasional Tata Usaha, pemeriksaan sarana prasarana sekolah dan presensi kehadiran pegawai.',
        buktiDukung: 'Daftar hadir / buku tamu',
        keterangan: 'Terlaksana'
      },
      {
        jamMulai: '08',
        menitMulai: '00',
        jamSelesai: '10',
        menitSelesai: '00',
        uraian: 'Pengarsipan surat masuk dan keluar, pengetikan disposisi surat dinas serta pengelolaan administrasi umum.',
        buktiDukung: 'Buku register surat',
        keterangan: 'Terlaksana'
      },
      {
        jamMulai: '10',
        menitMulai: '00',
        jamSelesai: '12',
        menitSelesai: '00',
        uraian: 'Pelayanan administrasi kesiswaan (mutasi masuk/keluar, legalisir ijazah dan surat keterangan siswa aktif).',
        buktiDukung: 'Buku ekspedisi surat',
        keterangan: 'Terlaksana'
      },
      {
        jamMulai: '12',
        menitMulai: '00',
        jamSelesai: '13',
        menitSelesai: '00',
        uraian: 'Istirahat dan Sholat Dzuhur berjamaah di musholla sekolah.',
        buktiDukung: 'Presensi',
        keterangan: 'Terlaksana'
      },
      {
        jamMulai: '13',
        menitMulai: '00',
        jamSelesai: '14',
        menitSelesai: '30',
        uraian: 'Pembaruan data pada sistem Dapodik, rekapitulasi data kepegawaian dan inventarisasi aset sekolah.',
        buktiDukung: 'Screenshot sistem / berkas',
        keterangan: 'Terlaksana'
      },
      {
        jamMulai: '14',
        menitMulai: '30',
        jamSelesai: '15',
        menitSelesai: '30',
        uraian: 'Pemeriksaan keamanan lingkungan dan kelistrikan kantor sebelum penutupan operasional harian.',
        buktiDukung: 'Checklist harian',
        keterangan: 'Terlaksana'
      }
    ]
  }
};

export const JurnalHarianView: React.FC<JurnalHarianViewProps> = ({
  pegawaiList,
  schoolConfig,
  onSaveJurnal,
  onPrint,
  showToast,
  initialEntry
}) => {
  const [selectedShift, setSelectedShift] = useState<string>('pagi');
  const [selectedPegawaiIndex, setSelectedPegawaiIndex] = useState<number>(0);
  const [tanggal, setTanggal] = useState<string>(getTodayString());
  const [kegiatanList, setKegiatanList] = useState<KegiatanItem[]>([
    {
      id: 'keg-1',
      jamMulai: '06',
      menitMulai: '30',
      jamSelesai: '07',
      menitSelesai: '00',
      uraian: 'Pembiasaan pagi dan menyambut siswa di pintu gerbang.',
      buktiDukung: 'Foto Kegiatan',
      keterangan: 'Terlaksana'
    }
  ]);

  // Load entry if selected from Rekap Bulanan
  useEffect(() => {
    if (initialEntry) {
      setTanggal(initialEntry.tanggal);
      setSelectedShift(initialEntry.shift || 'pagi');
      setKegiatanList(initialEntry.kegiatan || []);
      const idx = pegawaiList.findIndex((p) => p.NIP === initialEntry.pegawaiNIP);
      if (idx >= 0) {
        setSelectedPegawaiIndex(idx);
      }
    }
  }, [initialEntry, pegawaiList]);

  // Selected Pegawai
  const currentPegawai = pegawaiList[selectedPegawaiIndex] || pegawaiList[0] || null;

  // Nama file PDF: "Jurnal Harian_Nama Pegawai_NIP.pdf"
  const safeNama = (currentPegawai?.Nama || 'Nama Pegawai').replace(/[\\/:*?"<>|]/g, '').trim();
  const safeNip = (currentPegawai?.NIP && currentPegawai.NIP !== '-' ? currentPegawai.NIP : 'NIP').replace(/[\\/:*?"<>|]/g, '').trim();
  const dynamicPdfFileName = `Jurnal Harian_${safeNama}_${safeNip}.pdf`;

  // Auto select preset activities when applying template
  const handleApplyPreset = (shiftKey = selectedShift) => {
    const preset = SHIFT_PRESETS[shiftKey];
    if (preset) {
      const newItems: KegiatanItem[] = preset.items.map((item, i) => ({
        ...item,
        id: `keg-preset-${Date.now()}-${i}`
      }));
      setKegiatanList(newItems);
      showToast(`Template kegiatan untuk ${preset.label} berhasil diterapkan!`, 'success');
    }
  };

  const handleAddKegiatan = () => {
    const lastItem = kegiatanList[kegiatanList.length - 1];
    let nextJamMulai = '08';
    let nextMenitMulai = '00';
    let nextJamSelesai = '09';
    let nextMenitSelesai = '00';

    if (lastItem) {
      nextJamMulai = lastItem.jamSelesai;
      nextMenitMulai = lastItem.menitSelesai;
      const nextHourNum = Math.min(18, parseInt(nextJamMulai, 10) + 1);
      nextJamSelesai = String(nextHourNum).padStart(2, '0');
      nextMenitSelesai = nextMenitMulai;
    }

    const newItem: KegiatanItem = {
      id: `keg-${Date.now()}`,
      jamMulai: nextJamMulai,
      menitMulai: nextMenitMulai,
      jamSelesai: nextJamSelesai,
      menitSelesai: nextMenitSelesai,
      uraian: '',
      buktiDukung: 'Foto Kegiatan',
      keterangan: 'Terlaksana'
    };
    setKegiatanList([...kegiatanList, newItem]);
  };

  const handleUpdateKegiatan = (id: string, field: keyof KegiatanItem, val: string) => {
    setKegiatanList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: val } : item))
    );
  };

  const handleDeleteKegiatan = (id: string) => {
    if (kegiatanList.length <= 1) {
      showToast('Minimal harus ada 1 kegiatan.', 'error');
      return;
    }
    setKegiatanList((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSaveToRekap = () => {
    if (!currentPegawai) {
      showToast('Silakan pilih pegawai terlebih dahulu.', 'error');
      return;
    }
    if (kegiatanList.length === 0) {
      showToast('Tidak ada kegiatan untuk disimpan.', 'error');
      return;
    }
    onSaveJurnal(currentPegawai, tanggal, selectedShift, kegiatanList);
    showToast(`Jurnal ${currentPegawai.Nama} tanggal ${tanggal} tersimpan di Rekap!`, 'success');
  };

  // Generate hour options
  const jamOptions = Array.from({ length: 14 }, (_, i) => {
    const val = String(i + 6).padStart(2, '0');
    return val;
  });

  const menitOptions = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'];

  return (
    <div className="w-full h-full flex flex-col md:flex-row overflow-hidden">
      {/* SIDEBAR INPUT JURNAL */}
      <div className="w-full md:w-[380px] lg:w-[420px] bg-gray-50 border-r border-gray-200 overflow-y-auto p-4 flex-shrink-0 space-y-4 print:hidden">
        {/* Shift Selection */}
        <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-3.5 shadow-xs">
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-emerald-900 text-xs font-bold flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-emerald-700" /> Pilih Shift Kerja
            </label>
            <button
              onClick={() => handleApplyPreset()}
              className="text-[11px] bg-emerald-700 hover:bg-emerald-800 text-white font-semibold px-2 py-0.5 rounded shadow-xs transition-colors flex items-center gap-1"
              title="Isi kegiatan otomatis sesuai standar shift ini"
            >
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span>Terapkan Template</span>
            </button>
          </div>
          <select
            value={selectedShift}
            onChange={(e) => {
              const val = e.target.value;
              setSelectedShift(val);
            }}
            className="w-full border border-emerald-300 p-2 rounded-lg text-xs font-medium text-gray-800 bg-white shadow-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="pagi">Guru: Shift Pagi (06.30 - 14.00)</option>
            <option value="siang">Guru: Shift Siang (10.00 - 17.30)</option>
            <option value="tendik">Tendik: Shift Pagi (07.00 - 15.30)</option>
          </select>
        </div>

        {/* Pegawai Selection */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5 shadow-xs">
          <label className="block text-blue-900 text-xs font-bold mb-1.5 flex items-center gap-1.5">
            <User className="w-4 h-4 text-blue-700" /> Pilih Pegawai
          </label>
          <select
            value={pegawaiList.length === 0 ? '' : selectedPegawaiIndex}
            onChange={(e) => setSelectedPegawaiIndex(Number(e.target.value))}
            disabled={pegawaiList.length === 0}
            className="w-full border border-blue-300 p-2 rounded-lg text-xs font-medium text-gray-800 bg-white shadow-xs focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-400"
          >
            {pegawaiList.length === 0 ? (
              <option value="">-- Belum ada pegawai (Tambah di Data Pegawai) --</option>
            ) : (
              pegawaiList.map((p, idx) => (
                <option key={p.NIP + idx} value={idx}>
                  {p.Nama}
                </option>
              ))
            )}
          </select>
          {currentPegawai ? (
            <div className="mt-2 text-[11px] text-blue-800/80 flex items-center justify-between">
              <span>NIP: {currentPegawai.NIP}</span>
              <span className="bg-blue-100 px-1.5 py-0.5 rounded font-semibold text-blue-700">
                {currentPegawai.Status}
              </span>
            </div>
          ) : (
            <p className="mt-2 text-[11px] text-blue-700/70 italic">
              Buka tab <strong>Data Pegawai</strong> untuk menambah atau mengimpor data pegawai.
            </p>
          )}
        </div>

        {/* Tanggal Selection */}
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-3.5 shadow-xs">
          <div className="flex justify-between items-center mb-1.5 text-amber-900 text-xs font-bold">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-amber-700" /> Hari / Tanggal
            </span>
            <button
              onClick={() => setTanggal(getTodayString())}
              className="bg-amber-200 hover:bg-amber-300 text-amber-900 font-semibold px-2 py-0.5 rounded text-[11px] shadow-xs transition-colors"
            >
              Hari Ini
            </button>
          </div>
          <input
            type="date"
            value={tanggal}
            onChange={(e) => setTanggal(e.target.value)}
            className="w-full border border-amber-300 p-2 rounded-lg text-xs font-medium text-gray-800 bg-white shadow-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>

        {/* List Kegiatan Form */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm space-y-3">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-[#0b4e3a] font-bold text-sm flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-emerald-600" /> Kegiatan Hari Ini
              </span>
              <p className="text-[11px] text-gray-400 italic">
                Uraian, jam pelaksanaan, bukti dan keterangan.
              </p>
            </div>
            <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
              {kegiatanList.length} Kegiatan
            </span>
          </div>

          <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
            {kegiatanList.map((k, index) => (
              <div
                key={k.id}
                className="p-3 bg-gray-50 border border-gray-200 rounded-lg space-y-2 hover:border-emerald-300 transition-colors shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-700">
                    Kegiatan #{index + 1}
                  </span>
                  <button
                    onClick={() => handleDeleteKegiatan(k.id)}
                    className="text-red-500 hover:text-red-700 text-xs flex items-center gap-1 transition-colors p-1"
                    title="Hapus baris kegiatan ini"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Time selection */}
                <div className="flex gap-2 items-center text-xs text-gray-600">
                  <div className="flex items-center gap-1">
                    <select
                      value={k.jamMulai}
                      onChange={(e) => handleUpdateKegiatan(k.id, 'jamMulai', e.target.value)}
                      className="border border-gray-300 bg-white p-1 rounded text-xs"
                    >
                      {jamOptions.map((h) => (
                        <option key={`jm-${h}`} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                    <span>:</span>
                    <select
                      value={k.menitMulai}
                      onChange={(e) => handleUpdateKegiatan(k.id, 'menitMulai', e.target.value)}
                      className="border border-gray-300 bg-white p-1 rounded text-xs"
                    >
                      {menitOptions.map((m) => (
                        <option key={`mm-${m}`} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>
                  <span className="font-semibold text-gray-400">s/d</span>
                  <div className="flex items-center gap-1">
                    <select
                      value={k.jamSelesai}
                      onChange={(e) => handleUpdateKegiatan(k.id, 'jamSelesai', e.target.value)}
                      className="border border-gray-300 bg-white p-1 rounded text-xs"
                    >
                      {jamOptions.map((h) => (
                        <option key={`js-${h}`} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                    <span>:</span>
                    <select
                      value={k.menitSelesai}
                      onChange={(e) => handleUpdateKegiatan(k.id, 'menitSelesai', e.target.value)}
                      className="border border-gray-300 bg-white p-1 rounded text-xs"
                    >
                      {menitOptions.map((m) => (
                        <option key={`ms-${m}`} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>
                  <span className="text-[10px] text-gray-400">WIB</span>
                </div>

                <textarea
                  rows={2}
                  value={k.uraian}
                  placeholder="Uraian kegiatan hari ini..."
                  onChange={(e) => handleUpdateKegiatan(k.id, 'uraian', e.target.value)}
                  className="w-full border border-gray-300 bg-white p-2 rounded text-xs text-gray-800 focus:outline-none focus:border-emerald-600"
                />

                <div className="space-y-2 pt-2 border-t border-gray-100">
                  {/* Foto Kegiatan */}
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Camera className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Foto Kegiatan</span>
                      </span>
                      {k.fotoKegiatanUrl && (
                        <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                          Foto Terpasang
                        </span>
                      )}
                    </label>

                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        id={`foto-kegiatan-${k.id}`}
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            try {
                              const compressed = await compressImage(file);
                              handleUpdateKegiatan(k.id, 'fotoKegiatanUrl', compressed);
                              if (!k.buktiDukung) {
                                handleUpdateKegiatan(k.id, 'buktiDukung', 'Foto Kegiatan');
                              }
                              showToast('Foto kegiatan berhasil diunggah.', 'success');
                            } catch {
                              showToast('Gagal memproses foto kegiatan.', 'error');
                            }
                          }
                        }}
                      />
                      <label
                        htmlFor={`foto-kegiatan-${k.id}`}
                        className="bg-emerald-50 hover:bg-emerald-100 active:bg-emerald-200 text-emerald-800 border border-emerald-300 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>{k.fotoKegiatanUrl ? 'Ganti Foto' : 'Foto Kegiatan'}</span>
                      </label>

                      {k.fotoKegiatanUrl && (
                        <div className="flex items-center gap-2">
                          <img
                            src={k.fotoKegiatanUrl}
                            alt="Pratinjau Foto Kegiatan"
                            className="w-8 h-8 object-cover rounded-md border border-emerald-400 shadow-2xs"
                          />
                          <button
                            type="button"
                            onClick={() => handleUpdateKegiatan(k.id, 'fotoKegiatanUrl', '')}
                            className="text-red-500 hover:text-red-700 text-xs p-1 hover:bg-red-50 rounded cursor-pointer transition-colors"
                            title="Hapus foto kegiatan"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Ket */}
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">
                      Ket
                    </label>
                    <input
                      type="text"
                      placeholder="Ket (mis: Terlaksana)"
                      value={k.keterangan || ''}
                      onChange={(e) => handleUpdateKegiatan(k.id, 'keterangan', e.target.value)}
                      className="w-full border border-gray-300 bg-white p-2 rounded-lg text-xs focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handleAddKegiatan}
            className="w-full border-2 border-dashed border-gray-300 text-emerald-800 bg-emerald-50/40 hover:bg-emerald-50 py-2.5 rounded-lg text-xs font-bold transition-all flex justify-center items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Baris Kegiatan Baru</span>
          </button>
        </div>

        {/* Action Button: Save to Rekap */}
        <div className="pt-1">
          <button
            onClick={handleSaveToRekap}
            className="w-full bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white font-bold py-2.5 px-3 rounded-lg text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
          >
            <BookmarkCheck className="w-4 h-4 text-emerald-300" />
            <span>Simpan ke Rekap</span>
          </button>
        </div>
      </div>

      {/* PAPER PREVIEW (FOLIO 210 x 330 mm) */}
      <div className="flex-1 bg-slate-200 overflow-y-auto p-4 sm:p-6 flex flex-col items-center print:bg-white print:p-0 print:overflow-visible">
        {/* Top Info Bar */}
        <div className="w-full max-w-[215mm] flex justify-between items-center mb-3 text-xs text-gray-700 font-semibold print:hidden">
          <div className="flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-emerald-700" />
            <span>LEMBAR KERJA</span>
            <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[11px] border border-emerald-300 font-normal">
              Ukuran Kertas F4 (215 x 330 mm) - 1 Lembar
            </span>
          </div>
          <div className="text-gray-500 font-normal">
            Status: <span className="font-semibold text-emerald-700">{currentPegawai?.Status || 'Aktif'}</span>
          </div>
        </div>

        {/* Paper Container (Ukuran F4: 215 x 330 mm) */}
        <div
          id="paper-to-print"
          data-filename={dynamicPdfFileName}
          style={{ maxWidth: '215mm', minHeight: '330mm' }}
          className="paper-preview bg-white w-full shadow-lg rounded-sm p-7 sm:p-9 font-serif-official text-black text-[12.5px] leading-normal print:shadow-none print:border-none print:max-w-none print:w-full print:p-0 flex flex-col justify-between"
        >
          <div className="flex-1">
          {/* KOP RESMI */}
          {schoolConfig.gunakanKopGambar && schoolConfig.kopSekolahUrl ? (
            <div className="mb-4 text-center">
              <img
                src={schoolConfig.kopSekolahUrl}
                alt="Kop Resmi Sekolah"
                className="w-full max-h-36 object-contain mx-auto"
              />
            </div>
          ) : (
            <div className="text-center font-bold text-sm leading-snug tracking-wide uppercase mb-4">
              <p>{schoolConfig.pemerintah}</p>
              <p>{schoolConfig.dinas}</p>
              <p className="text-base sm:text-lg font-extrabold mt-0.5">{schoolConfig.sekolah}</p>
              <p className="text-xs font-normal normal-case mt-1 text-gray-800">
                {schoolConfig.alamat}
              </p>
            </div>
          )}

          {/* JUDUL */}
          <div className="text-center font-bold mb-5">
            <span className="text-base tracking-wider uppercase underline">
              JURNAL KERJA HARIAN
            </span>
          </div>

          {/* DATA PEGAWAI & FOTO 3X4 */}
          <div className="flex justify-between items-start mb-5">
            <table className="w-3/4 text-[13px]">
              <tbody>
                <tr>
                  <td className="w-36 py-0.5 font-bold">Nama</td>
                  <td>: {currentPegawai?.Nama || '..........................................'}</td>
                </tr>
                <tr>
                  <td className="py-0.5 font-bold">NIP / NI PPPK</td>
                  <td>: {currentPegawai?.NIP || '..........................................'}</td>
                </tr>
                <tr>
                  <td className="py-0.5 font-bold">Jabatan</td>
                  <td>: {currentPegawai?.Jabatan || '..........................................'}</td>
                </tr>
                <tr>
                  <td className="py-0.5 font-bold">Unit Kerja</td>
                  <td>: {currentPegawai?.['Unit Kerja'] || schoolConfig.sekolah}</td>
                </tr>
                <tr>
                  <td className="py-0.5 font-bold">Pangkat / Gol</td>
                  <td>: {currentPegawai?.Pangkat || '..........................................'}</td>
                </tr>
                <tr>
                  <td className="py-0.5 font-bold">Status Pegawai</td>
                  <td>: {currentPegawai?.Status || '..........................................'}</td>
                </tr>
                <tr>
                  <td className="py-0.5 font-bold">Hari / Tanggal</td>
                  <td>
                    : <span className="font-bold">{formatTanggalLengkap(tanggal)}</span>
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Foto 3 x 4 Box */}
            <div className="border border-black w-24 h-32 flex flex-col items-center justify-center text-gray-500 text-xs overflow-hidden bg-gray-50 flex-shrink-0 mr-2 shadow-2xs print:border-black">
              {currentPegawai?.Foto ? (
                <img
                  src={currentPegawai.Foto}
                  alt={currentPegawai.Nama}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center leading-tight">
                  <span className="font-bold text-gray-600 block">FOTO</span>
                  <span className="text-[11px] text-gray-400">3 x 4</span>
                </div>
              )}
            </div>
          </div>

          {/* TABEL KEGIATAN */}
          <table className="w-full border-collapse border border-black text-center mb-10 text-[12.5px] table-fixed">
            <colgroup>
              <col style={{ width: '6%' }} />
              <col style={{ width: '19%' }} />
              <col style={{ width: '41%' }} />
              <col style={{ width: '22%' }} />
              <col style={{ width: '12%' }} />
            </colgroup>
            <thead>
              <tr className="bg-gray-100 print:bg-transparent">
                <th className="border border-black py-2 px-1 text-center">No</th>
                <th className="border border-black py-2 px-1 text-center">Waktu</th>
                <th className="border border-black py-2 px-2 text-center">Kegiatan</th>
                <th className="border border-black py-2 px-1 text-center">Bukti Dukung</th>
                <th className="border border-black py-2 px-1 text-center">Ket</th>
              </tr>
            </thead>
            <tbody>
              {kegiatanList.length === 0 ? (
                <tr>
                  <td colSpan={5} className="border border-black py-4 text-gray-400 italic">
                    Belum ada kegiatan ditambahkan.
                  </td>
                </tr>
              ) : (
                kegiatanList.map((item, idx) => (
                  <tr key={item.id}>
                    <td className="border border-black py-2 px-1 align-top text-center break-words">
                      {idx + 1}
                    </td>
                    <td className="border border-black py-2 px-1 align-top text-center text-xs break-words">
                      {item.jamMulai}.{item.menitMulai} - {item.jamSelesai}.{item.menitSelesai} WIB
                    </td>
                    <td className="border border-black py-2 px-2 text-left align-top leading-relaxed break-words">
                      {item.uraian || '-'}
                    </td>
                    <td className="border border-black py-2 px-1.5 align-top text-xs break-words text-center">
                      {item.fotoKegiatanUrl ? (
                        <div className="flex flex-col items-center justify-center gap-1">
                          <img
                            src={item.fotoKegiatanUrl}
                            alt="Bukti Dukung"
                            className="max-h-24 max-w-full object-contain rounded-xs border border-gray-300 print:border-black mx-auto"
                          />
                          {item.buktiDukung && item.buktiDukung !== 'Foto Kegiatan' && (
                            <span className="text-[10px] text-gray-700 print:text-black leading-tight">
                              {item.buktiDukung}
                            </span>
                          )}
                        </div>
                      ) : (
                        item.buktiDukung || '-'
                      )}
                    </td>
                    <td className="border border-black py-2 px-1.5 align-top text-xs break-words text-center">
                      {item.keterangan || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* TANDA TANGAN */}
          <div className="flex justify-between px-6 sm:px-10 text-center text-[13px] pt-4 break-inside-avoid">
            <div>
              <p className="mb-0.5">Mengetahui,</p>
              <p className="font-bold mb-0">Kepala Sekolah</p>

              {/* Area Tanda Tangan & Stempel Digital (Jarak Spasi 20mm) */}
              <div
                style={{ height: '20mm' }}
                className="w-56 mx-auto relative flex items-end justify-center"
              >
                {/* Stempel Sekolah (43x43mm) */}
                {schoolConfig.stempelSekolahUrl && schoolConfig.tampilkanStempelDigital !== false && (
                  <img
                    src={schoolConfig.stempelSekolahUrl}
                    alt="Stempel Sekolah"
                    style={{ width: '43mm', height: '43mm', minWidth: '43mm', minHeight: '43mm', top: '-10mm' }}
                    className="object-contain absolute -left-4 opacity-85 pointer-events-none mix-blend-multiply z-20 filter contrast-125"
                  />
                )}

                {/* Tanda Tangan Kepala Sekolah (Dibesarkan & Menempel Nama) */}
                {schoolConfig.tandaTanganKepalaSekolah && schoolConfig.tampilkanTtdDigital !== false ? (
                  <img
                    src={schoolConfig.tandaTanganKepalaSekolah}
                    alt="Tanda Tangan Kepala Sekolah"
                    className="absolute -bottom-1.5 max-h-[85px] max-w-[220px] object-contain filter contrast-125 z-10 pointer-events-none scale-115 origin-bottom"
                  />
                ) : (
                  <div className="w-full h-full" />
                )}
              </div>

              <div className="w-56 mx-auto text-center">
                <p className="leading-tight">
                  <span className="underline underline-offset-[2px] font-bold uppercase decoration-black">
                    {schoolConfig.namaKepalaSekolah}
                  </span>
                </p>
                <p className="mt-1 text-xs font-medium">
                  NIP. {schoolConfig.nipKepalaSekolah}
                </p>
              </div>
            </div>
            <div>
              <p className="mb-0.5">{formatTanggalTtd(tanggal, schoolConfig.kotaTtd)}</p>
              <p className="font-bold mb-0">Pegawai Yang Bersangkutan,</p>
              
              {/* Area Tanda Tangan Pegawai (Jarak Spasi 20mm sejajar) */}
              <div
                style={{ height: '20mm' }}
                className="w-56 mx-auto relative flex items-end justify-center"
              >
                {currentPegawai?.TandaTangan ? (
                  <img
                    src={currentPegawai.TandaTangan}
                    alt={`Tanda Tangan ${currentPegawai.Nama}`}
                    className="absolute -bottom-1.5 max-h-[85px] max-w-[220px] object-contain filter contrast-125 z-10 pointer-events-none scale-115 origin-bottom"
                  />
                ) : (
                  <div className="w-full h-full" />
                )}
              </div>

              <div className="w-56 mx-auto text-center">
                <p className="leading-tight">
                  <span className="underline underline-offset-[2px] font-bold uppercase decoration-black">
                    {currentPegawai?.Nama || '........................................'}
                  </span>
                </p>
                <p className="mt-1 text-xs font-medium">
                  NIP. {currentPegawai?.NIP || '......................'}
                </p>
              </div>
            </div>
          </div>
          </div>

          {/* FOOTER LEMBAR KERJA F4 */}
          <div className="mt-6 pt-2 border-t border-black flex justify-between items-center text-[10.5px] text-gray-800 font-sans tracking-tight break-inside-avoid">
            <span className="font-semibold">
              Jurnal Harian_{currentPegawai?.Nama || 'Nama Pegawai'}_{currentPegawai?.NIP && currentPegawai.NIP !== '-' ? currentPegawai.NIP : 'NIP'}
            </span>
            <span className="font-semibold">
              Dicetak oleh_{schoolConfig.sekolah || 'SDN Babelan kota 01'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
