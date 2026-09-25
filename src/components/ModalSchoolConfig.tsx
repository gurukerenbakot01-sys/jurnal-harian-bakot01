import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Building2,
  UserCheck,
  FileSignature,
  Stamp,
  Image as ImageIcon,
  Upload,
  Trash2,
  CheckCircle2
} from 'lucide-react';
import { SchoolConfig } from '../types';

interface ModalSchoolConfigProps {
  isOpen: boolean;
  onClose: () => void;
  config: SchoolConfig;
  onSave: (config: SchoolConfig) => void;
}

export const ModalSchoolConfig: React.FC<ModalSchoolConfigProps> = ({
  isOpen,
  onClose,
  config,
  onSave
}) => {
  const [data, setData] = useState<SchoolConfig>(config);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const ttdInputRef = useRef<HTMLInputElement>(null);
  const stempelInputRef = useRef<HTMLInputElement>(null);
  const kopInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setData(config);
    setErrorMsg('');
  }, [config, isOpen]);

  if (!isOpen) return null;

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'tandaTanganKepalaSekolah' | 'stempelSekolahUrl' | 'kopSekolahUrl',
    maxSizeMb = 2
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > maxSizeMb * 1024 * 1024) {
      setErrorMsg(`Ukuran berkas melebihi ${maxSizeMb}MB. Silakan pilih gambar yang lebih kecil.`);
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      setData((prev) => ({
        ...prev,
        [field]: result,
        ...(field === 'tandaTanganKepalaSekolah' ? { tampilkanTtdDigital: true } : {}),
        ...(field === 'stempelSekolahUrl' ? { tampilkanStempelDigital: true } : {}),
        ...(field === 'kopSekolahUrl' ? { gunakanKopGambar: true } : {})
      }));
      setErrorMsg('');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = (field: 'tandaTanganKepalaSekolah' | 'stempelSekolahUrl' | 'kopSekolahUrl') => {
    setData((prev) => ({
      ...prev,
      [field]: '',
      ...(field === 'kopSekolahUrl' ? { gunakanKopGambar: false } : {})
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(data);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="bg-[#0b4e3a] text-white px-5 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <Building2 className="w-5 h-5 text-emerald-300" />
            <div>
              <h3 className="font-bold text-base leading-tight">Pengaturan Data Sekolah & Kop</h3>
              <p className="text-[11px] text-emerald-200 mt-0.5">Kelola data Kepala Sekolah, TTD, Stempel, dan Kop Surat</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[82vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
              {errorMsg}
            </div>
          )}

          {/* 1. Nama Kepala Sekolah */}
          <div className="bg-slate-50 border border-gray-200 rounded-lg p-3.5">
            <label className="block text-xs font-bold text-gray-800 mb-1.5 flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-emerald-700" />
              <span>Nama Kepala Sekolah</span>
            </label>
            <input
              type="text"
              required
              value={data.namaKepalaSekolah || ''}
              onChange={(e) => setData({ ...data, namaKepalaSekolah: e.target.value })}
              placeholder="Contoh: SAMSUDIN, S.Pd."
              className="w-full border border-gray-300 p-2.5 rounded-lg text-xs font-semibold text-gray-900 bg-white focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 shadow-2xs"
            />
          </div>

          {/* 2. NIP Kepala Sekolah */}
          <div className="bg-slate-50 border border-gray-200 rounded-lg p-3.5">
            <label className="block text-xs font-bold text-gray-800 mb-1.5 flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center justify-center">#</span>
              <span>NIP Kepala Sekolah</span>
            </label>
            <input
              type="text"
              value={data.nipKepalaSekolah || ''}
              onChange={(e) => setData({ ...data, nipKepalaSekolah: e.target.value })}
              placeholder="Contoh: 19800101 200501 1 001"
              className="w-full border border-gray-300 p-2.5 rounded-lg text-xs font-mono text-gray-800 bg-white focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 shadow-2xs"
            />
          </div>

          {/* 3. Upload TTD Kepala Sekolah */}
          <div className="bg-slate-50 border border-gray-200 rounded-lg p-3.5">
            <label className="block text-xs font-bold text-gray-800 mb-1.5 flex items-center gap-1.5">
              <FileSignature className="w-4 h-4 text-emerald-700" />
              <span>Upload TTD Kepala Sekolah</span>
            </label>
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 bg-white p-3 rounded-lg border border-gray-200">
              <div className="w-24 h-16 border border-dashed border-gray-300 rounded-lg bg-gray-50 flex items-center justify-center overflow-hidden flex-shrink-0 relative group">
                {data.tandaTanganKepalaSekolah ? (
                  <img
                    src={data.tandaTanganKepalaSekolah}
                    alt="TTD Kepala Sekolah"
                    className="w-full h-full object-contain p-1"
                  />
                ) : (
                  <FileSignature className="w-6 h-6 text-gray-300" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <input
                  type="file"
                  ref={ttdInputRef}
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'tandaTanganKepalaSekolah', 2)}
                  className="hidden"
                />
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => ttdInputRef.current?.click()}
                    className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{data.tandaTanganKepalaSekolah ? 'Ganti TTD' : 'Pilih Berkas TTD'}</span>
                  </button>
                  {data.tandaTanganKepalaSekolah && (
                    <button
                      type="button"
                      onClick={() => handleRemoveImage('tandaTanganKepalaSekolah')}
                      className="text-red-600 hover:text-red-800 hover:bg-red-50 text-xs px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Hapus</span>
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-gray-500 mt-1">
                  Format PNG transparan atau JPG, ukuran maks. 2MB.
                </p>
              </div>
            </div>
          </div>

          {/* 4. Upload Stempel Sekolah */}
          <div className="bg-slate-50 border border-gray-200 rounded-lg p-3.5">
            <label className="block text-xs font-bold text-gray-800 mb-1.5 flex items-center gap-1.5">
              <Stamp className="w-4 h-4 text-emerald-700" />
              <span>Upload Stempel Sekolah</span>
            </label>
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 bg-white p-3 rounded-lg border border-gray-200">
              <div className="w-20 h-20 border border-dashed border-gray-300 rounded-lg bg-gray-50 flex items-center justify-center overflow-hidden flex-shrink-0 relative group">
                {data.stempelSekolahUrl ? (
                  <img
                    src={data.stempelSekolahUrl}
                    alt="Stempel Sekolah"
                    className="w-full h-full object-contain p-1"
                  />
                ) : (
                  <Stamp className="w-6 h-6 text-gray-300" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <input
                  type="file"
                  ref={stempelInputRef}
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'stempelSekolahUrl', 2)}
                  className="hidden"
                />
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => stempelInputRef.current?.click()}
                    className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{data.stempelSekolahUrl ? 'Ganti Stempel' : 'Pilih Berkas Stempel'}</span>
                  </button>
                  {data.stempelSekolahUrl && (
                    <button
                      type="button"
                      onClick={() => handleRemoveImage('stempelSekolahUrl')}
                      className="text-red-600 hover:text-red-800 hover:bg-red-50 text-xs px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Hapus</span>
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-gray-500 mt-1">
                  Format PNG transparan atau JPG, ukuran maks. 2MB.
                </p>
              </div>
            </div>
          </div>

          {/* 5. Upload Kop Sekolah */}
          <div className="bg-slate-50 border border-gray-200 rounded-lg p-3.5">
            <label className="block text-xs font-bold text-gray-800 mb-1.5 flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4 text-emerald-700" />
              <span>Upload Kop Sekolah</span>
            </label>
            <div className="flex flex-col gap-3 bg-white p-3 rounded-lg border border-gray-200">
              <div className="w-full h-24 border border-dashed border-gray-300 rounded-lg bg-gray-50 flex items-center justify-center overflow-hidden relative">
                {data.kopSekolahUrl ? (
                  <img
                    src={data.kopSekolahUrl}
                    alt="Kop Sekolah"
                    className="w-full h-full object-contain p-1"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-gray-400">
                    <ImageIcon className="w-7 h-7 mb-1" />
                    <span className="text-[11px]">Belum ada gambar Kop Sekolah terpasang</span>
                  </div>
                )}
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <input
                  type="file"
                  ref={kopInputRef}
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'kopSekolahUrl', 3)}
                  className="hidden"
                />
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => kopInputRef.current?.click()}
                    className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{data.kopSekolahUrl ? 'Ganti Kop Gambar' : 'Pilih Berkas Kop Gambar'}</span>
                  </button>
                  {data.kopSekolahUrl && (
                    <button
                      type="button"
                      onClick={() => handleRemoveImage('kopSekolahUrl')}
                      className="text-red-600 hover:text-red-800 hover:bg-red-50 text-xs px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Hapus</span>
                    </button>
                  )}
                </div>
                {data.kopSekolahUrl && (
                  <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Kop Aktif untuk PDF</span>
                  </span>
                )}
              </div>
              <p className="text-[11px] text-gray-500">
                Gambar Kop Surat lengkap (banner atas) untuk lembar cetak PDF. Ukuran maks. 3MB.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-gray-200 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white rounded-lg font-bold shadow-sm transition-colors cursor-pointer"
            >
              Simpan Perubahan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
