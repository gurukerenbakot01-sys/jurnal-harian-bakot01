import React, { useState, useEffect } from 'react';
import { X, Upload, User, Award, Briefcase, Building } from 'lucide-react';
import { Pegawai } from '../types';

interface ModalPegawaiProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (pegawai: Pegawai) => void;
  initialData?: Pegawai | null;
  defaultUnitKerja: string;
}

export const ModalPegawai: React.FC<ModalPegawaiProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  defaultUnitKerja
}) => {
  const [formData, setFormData] = useState<Pegawai>({
    Nama: '',
    NIP: '',
    Jabatan: 'Guru Kelas',
    'Unit Kerja': defaultUnitKerja,
    Pangkat: 'Penata Muda - III/a',
    Status: 'Aktif',
    Foto: '',
    TandaTangan: ''
  });

  const [previewFoto, setPreviewFoto] = useState<string>('');
  const [previewTtd, setPreviewTtd] = useState<string>('');

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      setPreviewFoto(initialData.Foto || '');
      setPreviewTtd(initialData.TandaTangan || '');
    } else {
      setFormData({
        Nama: '',
        NIP: '',
        Jabatan: 'Guru Kelas',
        'Unit Kerja': defaultUnitKerja,
        Pangkat: 'Penata Muda - III/a',
        Status: 'Aktif',
        Foto: '',
        TandaTangan: ''
      });
      setPreviewFoto('');
      setPreviewTtd('');
    }
  }, [initialData, defaultUnitKerja, isOpen]);

  if (!isOpen) return null;

  const handleFotoFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('Ukuran foto maksimal 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setPreviewFoto(dataUrl);
      setFormData((prev) => ({ ...prev, Foto: dataUrl }));
    };
    reader.readAsDataURL(file);
  };

  const handleTtdFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('Ukuran tanda tangan maksimal 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setPreviewTtd(dataUrl);
      setFormData((prev) => ({ ...prev, TandaTangan: dataUrl }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.Nama.trim()) {
      alert('Nama pegawai wajib diisi.');
      return;
    }
    if (!formData.NIP.trim()) {
      alert('NIP / NI PPPK wajib diisi.');
      return;
    }
    onSave({
      ...formData,
      Foto: previewFoto,
      TandaTangan: previewTtd
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-[#0b4e3a] text-white px-5 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-emerald-300" />
            <h3 className="font-bold text-base">
              {initialData ? 'Edit Data Pegawai' : 'Tambah Pegawai Baru'}
            </h3>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white p-1 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Photo Section */}
          <div className="flex items-center gap-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="w-20 h-24 border border-gray-300 bg-white flex flex-col items-center justify-center rounded overflow-hidden shadow-xs flex-shrink-0 relative">
              {previewFoto ? (
                <img
                  src={previewFoto}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center text-gray-400 text-xs p-1">
                  <User className="w-7 h-7 mx-auto mb-1 text-gray-300" />
                  <span>Foto 3x4</span>
                </div>
              )}
            </div>
            <div className="flex-1 space-y-2">
              <label className="block text-xs font-semibold text-gray-700">Foto Paspegawai</label>
              <div className="flex items-center gap-2">
                <label className="cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-3 py-1.5 rounded font-medium flex items-center gap-1.5 shadow-sm transition-colors">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Pilih Berkas</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFotoFile}
                    className="hidden"
                  />
                </label>
                {previewFoto && (
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewFoto('');
                      setFormData((p) => ({ ...p, Foto: '' }));
                    }}
                    className="text-xs text-red-600 hover:underline"
                  >
                    Hapus Foto
                  </button>
                )}
              </div>
              <p className="text-[11px] text-gray-400 leading-tight">
                Format: JPG, PNG. Disarankan rasio foto 3:4.
              </p>
            </div>
          </div>

          {/* Signature Section */}
          <div className="flex items-center gap-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="w-24 h-16 border border-gray-300 bg-white flex flex-col items-center justify-center rounded overflow-hidden shadow-xs flex-shrink-0 relative">
              {previewTtd ? (
                <img
                  src={previewTtd}
                  alt="Preview TTD"
                  className="max-h-full max-w-full object-contain filter contrast-125"
                />
              ) : (
                <div className="text-center text-gray-400 text-[10px] p-1">
                  <span>Tanda Tangan</span>
                </div>
              )}
            </div>
            <div className="flex-1 space-y-2">
              <label className="block text-xs font-semibold text-gray-700">Tanda Tangan Pegawai</label>
              <div className="flex items-center gap-2">
                <label className="cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-3 py-1.5 rounded font-medium flex items-center gap-1.5 shadow-sm transition-colors">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Pilih Berkas TTD</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleTtdFile}
                    className="hidden"
                  />
                </label>
                {previewTtd && (
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewTtd('');
                      setFormData((p) => ({ ...p, TandaTangan: '' }));
                    }}
                    className="text-xs text-red-600 hover:underline"
                  >
                    Hapus TTD
                  </button>
                )}
              </div>
              <p className="text-[11px] text-gray-400 leading-tight">
                Format: PNG transparan atau JPG untuk lembar cetak jurnal.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Nama Lengkap & Gelar <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: SAMSUDIN atau Ahmad Subagja, S.Pd."
              value={formData.Nama}
              onChange={(e) => setFormData({ ...formData, Nama: e.target.value })}
              className="w-full border border-gray-300 p-2 rounded-md text-sm focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              NIP / NI PPPK <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: 198102022023211008 atau -"
              value={formData.NIP}
              onChange={(e) => setFormData({ ...formData, NIP: e.target.value })}
              className="w-full border border-gray-300 p-2 rounded-md text-sm focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1">
                <Briefcase className="w-3.5 h-3.5 text-gray-500" /> Jabatan
              </label>
              <input
                type="text"
                placeholder="Guru Kelas / TU / PJOK"
                value={formData.Jabatan}
                onChange={(e) => setFormData({ ...formData, Jabatan: e.target.value })}
                className="w-full border border-gray-300 p-2 rounded-md text-sm focus:outline-none focus:border-emerald-600"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-gray-500" /> Pangkat / Golongan
              </label>
              <input
                type="text"
                placeholder="Penata Muda - III/a"
                value={formData.Pangkat}
                onChange={(e) => setFormData({ ...formData, Pangkat: e.target.value })}
                className="w-full border border-gray-300 p-2 rounded-md text-sm focus:outline-none focus:border-emerald-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1">
                <Building className="w-3.5 h-3.5 text-gray-500" /> Unit Kerja
              </label>
              <input
                type="text"
                value={formData['Unit Kerja']}
                onChange={(e) => setFormData({ ...formData, 'Unit Kerja': e.target.value })}
                className="w-full border border-gray-300 p-2 rounded-md text-sm focus:outline-none focus:border-emerald-600"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Status Kepegawaian</label>
              <select
                value={formData.Status}
                onChange={(e) => setFormData({ ...formData, Status: e.target.value })}
                className="w-full border border-gray-300 p-2 rounded-md text-sm focus:outline-none focus:border-emerald-600 bg-white"
              >
                <option value="Aktif">Aktif</option>
                <option value="Cuti">Cuti</option>
                <option value="Tugas Belajar">Tugas Belajar</option>
                <option value="Mutasi">Mutasi</option>
                <option value="Purna Bakti">Purna Bakti / Pensiun</option>
              </select>
            </div>
          </div>

          <div className="pt-3 border-t flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md font-medium"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm bg-emerald-700 hover:bg-emerald-800 text-white rounded-md font-bold shadow transition-colors"
            >
              Simpan Data
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
