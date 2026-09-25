export interface Pegawai {
  rowNum?: number;
  NIP: string;
  Nama: string;
  Jabatan: string;
  'Unit Kerja': string;
  Pangkat: string;
  Status: string; // 'Aktif' | 'Cuti' | 'Pensiun'
  Foto?: string; // Data URL or Image URL
  TandaTangan?: string; // Data URL or Image URL
  'Tanda Tangan'?: string;
  [key: string]: unknown;
}

export interface KegiatanItem {
  id: string;
  jamMulai: string;
  menitMulai: string;
  jamSelesai: string;
  menitSelesai: string;
  uraian: string;
  buktiDukung: string;
  fotoKegiatanUrl?: string;
  keterangan: string;
}

export interface JurnalEntry {
  id: string;
  pegawaiNIP: string;
  pegawaiNama: string;
  tanggal: string; // YYYY-MM-DD
  shift: string;
  kegiatan: KegiatanItem[];
  createdAt: string;
  updatedAt: string;
}

export interface SchoolConfig {
  pemerintah: string;
  dinas: string;
  sekolah: string;
  alamat: string;
  kotaTtd: string;
  namaKepalaSekolah: string;
  nipKepalaSekolah: string;
  tandaTanganKepalaSekolah?: string;
  kopSekolahUrl?: string;
  stempelSekolahUrl?: string;
  tampilkanTtdDigital?: boolean;
  tampilkanStempelDigital?: boolean;
  gunakanKopGambar?: boolean;
}

export interface ShiftConfig {
  id: string;
  label: string;
  jamMulaiDefault: string;
  jamSelesaiDefault: string;
  kegiatanTemplate: {
    jamMulai: string;
    menitMulai: string;
    jamSelesai: string;
    menitSelesai: string;
    uraian: string;
    buktiDukung: string;
    keterangan: string;
  }[];
}
