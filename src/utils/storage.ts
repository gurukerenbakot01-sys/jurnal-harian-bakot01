import * as XLSX from 'xlsx';
import { Pegawai, JurnalEntry, SchoolConfig } from '../types';

export const DEFAULT_PEGAWAI: Pegawai[] = [
  {
    rowNum: 2,
    NIP: '196805121991031005',
    Nama: 'Dr. H. Samsudin, M.Pd.',
    Jabatan: 'Kepala Sekolah',
    'Unit Kerja': 'SDN BABELAN KOTA 01',
    Pangkat: 'Pembina Utama Muda - IV/c',
    Status: 'Aktif'
  },
  {
    rowNum: 3,
    NIP: '197008141993082001',
    Nama: 'Hj. Siti Rohmah, S.Pd.SD.',
    Jabatan: 'Guru Kelas 1A',
    'Unit Kerja': 'SDN BABELAN KOTA 01',
    Pangkat: 'Pembina - IV/a',
    Status: 'Aktif'
  },
  {
    rowNum: 4,
    NIP: '197502181999031004',
    Nama: 'Ahmad Fauzi, S.Pd.',
    Jabatan: 'Guru Kelas 1B',
    'Unit Kerja': 'SDN BABELAN KOTA 01',
    Pangkat: 'Penata Tk.I - III/d',
    Status: 'Aktif'
  },
  {
    rowNum: 5,
    NIP: '198203252006042018',
    Nama: 'Nur Aini, S.Pd.',
    Jabatan: 'Guru Kelas 1C',
    'Unit Kerja': 'SDN BABELAN KOTA 01',
    Pangkat: 'Penata - III/c',
    Status: 'Aktif'
  },
  {
    rowNum: 6,
    NIP: '198607102009021003',
    Nama: 'Dedi Suryadi, S.Pd.',
    Jabatan: 'Guru Kelas 2A',
    'Unit Kerja': 'SDN BABELAN KOTA 01',
    Pangkat: 'Penata Muda Tk.I - III/b',
    Status: 'Aktif'
  },
  {
    rowNum: 7,
    NIP: '197411051998022002',
    Nama: 'Sri Wahyuni, S.Pd.SD.',
    Jabatan: 'Guru Kelas 2B',
    'Unit Kerja': 'SDN BABELAN KOTA 01',
    Pangkat: 'Penata - III/c',
    Status: 'Aktif'
  },
  {
    rowNum: 8,
    NIP: '199004122015032007',
    Nama: 'Rina Marlina, S.Pd.',
    Jabatan: 'Guru Kelas 2C',
    'Unit Kerja': 'SDN BABELAN KOTA 01',
    Pangkat: 'Penata Muda - III/a',
    Status: 'Aktif'
  },
  {
    rowNum: 9,
    NIP: '197309191997031006',
    Nama: 'Endang Sukandar, S.Pd.',
    Jabatan: 'Guru Kelas 3A',
    'Unit Kerja': 'SDN BABELAN KOTA 01',
    Pangkat: 'Penata Tk.I - III/d',
    Status: 'Aktif'
  },
  {
    rowNum: 10,
    NIP: '199201202022212015',
    Nama: 'Yuliana Sari, S.Pd.',
    Jabatan: 'Guru Kelas 3B',
    'Unit Kerja': 'SDN BABELAN KOTA 01',
    Pangkat: 'Ahli Pertama - IX (PPPK)',
    Status: 'Aktif'
  },
  {
    rowNum: 11,
    NIP: '199106152019031008',
    Nama: 'Muhammad Rizki, S.Pd.',
    Jabatan: 'Guru Kelas 3C',
    'Unit Kerja': 'SDN BABELAN KOTA 01',
    Pangkat: 'Penata Muda - III/a',
    Status: 'Aktif'
  },
  {
    rowNum: 12,
    NIP: '196912081992032004',
    Nama: 'Hj. Neneng Hasanah, S.Pd.',
    Jabatan: 'Guru Kelas 4A',
    'Unit Kerja': 'SDN BABELAN KOTA 01',
    Pangkat: 'Pembina - IV/a',
    Status: 'Aktif'
  },
  {
    rowNum: 13,
    NIP: '198004172008011009',
    Nama: 'Agus Setiawan, S.Pd.',
    Jabatan: 'Guru Kelas 4B',
    'Unit Kerja': 'SDN BABELAN KOTA 01',
    Pangkat: 'Penata - III/c',
    Status: 'Aktif'
  },
  {
    rowNum: 14,
    NIP: '199307222022212022',
    Nama: 'Dewi Kartika, S.Pd.',
    Jabatan: 'Guru Kelas 4C',
    'Unit Kerja': 'SDN BABELAN KOTA 01',
    Pangkat: 'Ahli Pertama - IX (PPPK)',
    Status: 'Aktif'
  },
  {
    rowNum: 15,
    NIP: '197609302002121003',
    Nama: 'Hendra Gunawan, S.Pd.',
    Jabatan: 'Guru Kelas 5A',
    'Unit Kerja': 'SDN BABELAN KOTA 01',
    Pangkat: 'Penata Tk.I - III/d',
    Status: 'Aktif'
  },
  {
    rowNum: 16,
    NIP: '198710152010012011',
    Nama: 'Siti Nurhaliza, S.Pd.',
    Jabatan: 'Guru Kelas 5B',
    'Unit Kerja': 'SDN BABELAN KOTA 01',
    Pangkat: 'Penata Muda Tk.I - III/b',
    Status: 'Aktif'
  },
  {
    rowNum: 17,
    NIP: '199402112023211019',
    Nama: 'Budi Santoso, S.Pd.',
    Jabatan: 'Guru Kelas 5C',
    'Unit Kerja': 'SDN BABELAN KOTA 01',
    Pangkat: 'Ahli Pertama - IX (PPPK)',
    Status: 'Aktif'
  },
  {
    rowNum: 18,
    NIP: '196703141988031005',
    Nama: 'Drs. Maman Suratman',
    Jabatan: 'Guru Kelas 6A',
    'Unit Kerja': 'SDN BABELAN KOTA 01',
    Pangkat: 'Pembina Tk.I - IV/b',
    Status: 'Aktif'
  },
  {
    rowNum: 19,
    NIP: '197905202005012014',
    Nama: 'Eka Ratnasari, S.Pd.',
    Jabatan: 'Guru Kelas 6B',
    'Unit Kerja': 'SDN BABELAN KOTA 01',
    Pangkat: 'Penata - III/c',
    Status: 'Aktif'
  },
  {
    rowNum: 20,
    NIP: '199011282022211016',
    Nama: 'Wawan Hermawan, S.Pd.',
    Jabatan: 'Guru Kelas 6C',
    'Unit Kerja': 'SDN BABELAN KOTA 01',
    Pangkat: 'Ahli Pertama - IX (PPPK)',
    Status: 'Aktif'
  },
  {
    rowNum: 21,
    NIP: '197104051996031003',
    Nama: 'H. Mansyur, S.Pd.I.',
    Jabatan: 'Guru Pendidikan Agama Islam',
    'Unit Kerja': 'SDN BABELAN KOTA 01',
    Pangkat: 'Pembina - IV/a',
    Status: 'Aktif'
  },
  {
    rowNum: 22,
    NIP: '198108192007011012',
    Nama: 'Ust. Abdul Hadi, S.Pd.I.',
    Jabatan: 'Guru Pendidikan Agama Islam',
    'Unit Kerja': 'SDN BABELAN KOTA 01',
    Pangkat: 'Penata - III/c',
    Status: 'Aktif'
  },
  {
    rowNum: 23,
    NIP: '199505182023212025',
    Nama: 'Fatimah Zahra, S.Pd.I.',
    Jabatan: 'Guru Pendidikan Agama Islam',
    'Unit Kerja': 'SDN BABELAN KOTA 01',
    Pangkat: 'Ahli Pertama - IX (PPPK)',
    Status: 'Aktif'
  },
  {
    rowNum: 24,
    NIP: '197706242003121004',
    Nama: 'Junaedi, S.Pd.',
    Jabatan: 'Guru PJOK',
    'Unit Kerja': 'SDN BABELAN KOTA 01',
    Pangkat: 'Penata Tk.I - III/d',
    Status: 'Aktif'
  },
  {
    rowNum: 25,
    NIP: '198312022008011007',
    Nama: 'Supriyadi, S.Pd.',
    Jabatan: 'Guru PJOK',
    'Unit Kerja': 'SDN BABELAN KOTA 01',
    Pangkat: 'Penata - III/c',
    Status: 'Aktif'
  },
  {
    rowNum: 26,
    NIP: '199408162022211020',
    Nama: 'Dicky Kurniawan, S.Pd.',
    Jabatan: 'Guru PJOK',
    'Unit Kerja': 'SDN BABELAN KOTA 01',
    Pangkat: 'Ahli Pertama - IX (PPPK)',
    Status: 'Aktif'
  },
  {
    rowNum: 27,
    NIP: '199209142022212018',
    Nama: 'Ratna Juwita, S.Pd.',
    Jabatan: 'Guru Bahasa Inggris',
    'Unit Kerja': 'SDN BABELAN KOTA 01',
    Pangkat: 'Ahli Pertama - IX (PPPK)',
    Status: 'Aktif'
  },
  {
    rowNum: 28,
    NIP: '199303102019032014',
    Nama: 'Nurul Hidayati, S.Pd.',
    Jabatan: 'Guru Seni Budaya & Prakarya',
    'Unit Kerja': 'SDN BABELAN KOTA 01',
    Pangkat: 'Penata Muda - III/a',
    Status: 'Aktif'
  },
  {
    rowNum: 29,
    NIP: '199105262022211017',
    Nama: 'Ilham Maulana, S.Kom.',
    Jabatan: 'Operator Sekolah & Dapodik',
    'Unit Kerja': 'SDN BABELAN KOTA 01',
    Pangkat: 'Ahli Pertama - IX (PPPK)',
    Status: 'Aktif'
  },
  {
    rowNum: 30,
    NIP: '198103152006041009',
    Nama: 'Asep Saepudin, S.AP.',
    Jabatan: 'Kepala Tenaga Administrasi',
    'Unit Kerja': 'SDN BABELAN KOTA 01',
    Pangkat: 'Penata - III/c',
    Status: 'Aktif'
  },
  {
    rowNum: 31,
    NIP: '198509122009012008',
    Nama: 'Ani Sumarni, A.Md.',
    Jabatan: 'Pengadministrasi Kepegawaian',
    'Unit Kerja': 'SDN BABELAN KOTA 01',
    Pangkat: 'Pengatur - II/c',
    Status: 'Aktif'
  },
  {
    rowNum: 32,
    NIP: '199312102022212024',
    Nama: 'Maya Safitri, S.E.',
    Jabatan: 'Pengadministrasi Keuangan & BOS',
    'Unit Kerja': 'SDN BABELAN KOTA 01',
    Pangkat: 'Ahli Pertama - IX (PPPK)',
    Status: 'Aktif'
  },
  {
    rowNum: 33,
    NIP: '198902142010011006',
    Nama: 'Dani Ramdani',
    Jabatan: 'Pengadministrasi Umum & Arsip',
    'Unit Kerja': 'SDN BABELAN KOTA 01',
    Pangkat: 'Pengatur Muda - II/a',
    Status: 'Aktif'
  },
  {
    rowNum: 34,
    NIP: '199507082023212030',
    Nama: 'Fitri Handayani, S.I.Pust.',
    Jabatan: 'Pengelola Perpustakaan',
    'Unit Kerja': 'SDN BABELAN KOTA 01',
    Pangkat: 'Ahli Pertama - IX (PPPK)',
    Status: 'Aktif'
  },
  {
    rowNum: 35,
    NIP: '199008222022211025',
    Nama: 'Tatang Sutisna',
    Jabatan: 'Pengelola Laboratorium & Komputer',
    'Unit Kerja': 'SDN BABELAN KOTA 01',
    Pangkat: 'Terampil - VII (PPPK)',
    Status: 'Aktif'
  },
  {
    rowNum: 36,
    NIP: '198601052024011002',
    Nama: 'Ujang Suherman',
    Jabatan: 'Petugas Keamanan Sekolah',
    'Unit Kerja': 'SDN BABELAN KOTA 01',
    Pangkat: 'Petugas Keamanan',
    Status: 'Aktif'
  },
  {
    rowNum: 37,
    NIP: '198804182024011003',
    Nama: 'Sukarna',
    Jabatan: 'Petugas Keamanan Sekolah',
    'Unit Kerja': 'SDN BABELAN KOTA 01',
    Pangkat: 'Petugas Keamanan',
    Status: 'Aktif'
  },
  {
    rowNum: 38,
    NIP: '198403122024011001',
    Nama: 'Hasan Basri',
    Jabatan: 'Petugas Kebersihan Lingkungan',
    'Unit Kerja': 'SDN BABELAN KOTA 01',
    Pangkat: 'Petugas Kebersihan',
    Status: 'Aktif'
  },
  {
    rowNum: 39,
    NIP: '198711092024011004',
    Nama: 'Rahmat Hidayat',
    Jabatan: 'Petugas Kebersihan & Penjaga Malam',
    'Unit Kerja': 'SDN BABELAN KOTA 01',
    Pangkat: 'Petugas Kebersihan',
    Status: 'Aktif'
  }
];

export const DEFAULT_SCHOOL_CONFIG: SchoolConfig = {
  pemerintah: 'PEMERINTAH KABUPATEN BEKASI',
  dinas: 'DINAS PENDIDIKAN',
  sekolah: 'SDN BABELAN KOTA 01',
  alamat: 'Komplek Perkantoran Pemkab Bekasi, Cikarang Pusat',
  kotaTtd: 'Bekasi',
  namaKepalaSekolah: 'Dr. H. Samsudin, M.Pd.',
  nipKepalaSekolah: '196805121991031005',
  tandaTanganKepalaSekolah: '',
  kopSekolahUrl: '',
  stempelSekolahUrl: '',
  tampilkanTtdDigital: true,
  tampilkanStempelDigital: true,
  gunakanKopGambar: false
};

const STORAGE_KEY_PEGAWAI = 'sikawan_data_pegawai_live_v4';
const STORAGE_KEY_JURNAL = 'sikawan_data_jurnal_clean_v2';
const STORAGE_KEY_SCHOOL = 'sikawan_school_config_v1';
const STORAGE_KEY_GAS_URL = 'sikawan_gas_api_url_v1';

export function loadPegawaiList(): Pegawai[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PEGAWAI);
    if (!raw) {
      savePegawaiList(DEFAULT_PEGAWAI);
      return DEFAULT_PEGAWAI;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    // If empty or non-array, seed with 39 default teachers
    savePegawaiList(DEFAULT_PEGAWAI);
    return DEFAULT_PEGAWAI;
  } catch {
    return DEFAULT_PEGAWAI;
  }
}

export function savePegawaiList(list: Pegawai[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_PEGAWAI, JSON.stringify(list));
  } catch (e) {
    console.error('Failed to save pegawai to localStorage', e);
  }
}

export function clearAllPegawai(): void {
  savePegawaiList([]);
}

export function loadSchoolConfig(): SchoolConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SCHOOL);
    if (!raw) return DEFAULT_SCHOOL_CONFIG;
    return { ...DEFAULT_SCHOOL_CONFIG, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SCHOOL_CONFIG;
  }
}

export function saveSchoolConfig(config: SchoolConfig): void {
  localStorage.setItem(STORAGE_KEY_SCHOOL, JSON.stringify(config));
}

export function loadGasUrl(): string {
  return localStorage.getItem(STORAGE_KEY_GAS_URL) || '';
}

export function saveGasUrl(url: string): void {
  localStorage.setItem(STORAGE_KEY_GAS_URL, url.trim());
}

export function loadJurnalList(): JurnalEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_JURNAL);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveJurnalEntry(entry: JurnalEntry): void {
  try {
    const current = loadJurnalList();
    const existingIndex = current.findIndex(
      (j) => j.pegawaiNIP === entry.pegawaiNIP && j.tanggal === entry.tanggal
    );
    if (existingIndex >= 0) {
      current[existingIndex] = { ...entry, updatedAt: new Date().toISOString() };
    } else {
      current.push(entry);
    }
    localStorage.setItem(STORAGE_KEY_JURNAL, JSON.stringify(current));
  } catch (e) {
    console.error('Failed to save jurnal entry', e);
  }
}

export function deleteJurnalEntry(id: string): void {
  const current = loadJurnalList().filter((j) => j.id !== id);
  localStorage.setItem(STORAGE_KEY_JURNAL, JSON.stringify(current));
}

// Export Pegawai to Excel (.xlsx)
export function exportPegawaiToExcel(pegawaiList: Pegawai[]): void {
  const data = pegawaiList.map((p, idx) => ({
    No: idx + 1,
    'NIP / NI PPPK': p.NIP,
    'Nama Lengkap & Gelar': p.Nama,
    Jabatan: p.Jabatan,
    'Unit Kerja': p['Unit Kerja'],
    Pangkat: p.Pangkat,
    Status: p.Status,
    'URL Foto': p.Foto || '',
    'Tanda Tangan': p.TandaTangan || ''
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Pegawai');

  // Auto column widths
  worksheet['!cols'] = [
    { wch: 6 },
    { wch: 22 },
    { wch: 30 },
    { wch: 25 },
    { wch: 24 },
    { wch: 20 },
    { wch: 12 },
    { wch: 35 },
    { wch: 35 }
  ];

  XLSX.writeFile(workbook, `Master_Pegawai_SDN_Babelan_Kota_01_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

// Export Rekap Jurnal to Excel (.xlsx)
export function exportRekapToExcel(
  bulanNama: string,
  tahun: string,
  pegawaiNama: string,
  entries: JurnalEntry[]
): void {
  const rows: Array<{
    No: number;
    Tanggal: string;
    Pegawai: string;
    NIP: string;
    Waktu: string;
    'Uraian Kegiatan': string;
    'Bukti Dukung': string;
    Ket: string;
  }> = [];

  let count = 1;
  entries.forEach((ent) => {
    ent.kegiatan.forEach((k) => {
      rows.push({
        No: count++,
        Tanggal: ent.tanggal,
        Pegawai: ent.pegawaiNama,
        NIP: ent.pegawaiNIP,
        Waktu: `${k.jamMulai}.${k.menitMulai} - ${k.jamSelesai}.${k.menitSelesai} WIB`,
        'Uraian Kegiatan': k.uraian,
        'Bukti Dukung': k.fotoKegiatanUrl ? (k.buktiDukung || 'Foto Kegiatan Terlampir') : (k.buktiDukung || '-'),
        Ket: k.keterangan
      });
    });
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Rekap_Jurnal');

  worksheet['!cols'] = [
    { wch: 6 },
    { wch: 14 },
    { wch: 28 },
    { wch: 22 },
    { wch: 20 },
    { wch: 45 },
    { wch: 22 },
    { wch: 18 }
  ];

  const filenameSafe = `Rekap_Jurnal_${bulanNama}_${tahun}_${pegawaiNama.replace(/[^a-zA-Z0-9]/g, '_')}.xlsx`;
  XLSX.writeFile(workbook, filenameSafe);
}

// Import Pegawai from Excel/CSV file
export async function parseExcelPegawaiFile(file: File): Promise<Pegawai[]> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const rawRows: Record<string, unknown>[] = XLSX.utils.sheet_to_json(worksheet);

  if (!rawRows || rawRows.length === 0) {
    throw new Error('Berkas Excel kosong atau format tidak sesuai.');
  }

  return rawRows.map((row, index) => {
    // Accommodate multiple header variations
    const nama = String(
      row['Nama Lengkap & Gelar'] ||
      row['Nama'] ||
      row['NAMA'] ||
      row['Nama Pegawai'] ||
      'Pegawai Baru'
    ).trim();

    const nip = String(
      row['NIP / NI PPPK'] ||
      row['NIP'] ||
      row['NI PPPK'] ||
      row['Nomor Induk'] ||
      '-'
    ).trim();

    const jabatan = String(
      row['Jabatan'] ||
      row['JABATAN'] ||
      'Guru'
    ).trim();

    const unit = String(
      row['Unit Kerja'] ||
      row['UNIT KERJA'] ||
      'SDN BABELAN KOTA 01'
    ).trim();

    const pangkat = String(
      row['Pangkat'] ||
      row['Pangkat / Gol'] ||
      row['PANGKAT'] ||
      '-'
    ).trim();

    const status = String(
      row['Status'] ||
      row['STATUS'] ||
      'Aktif'
    ).trim();

    const foto = String(
      row['URL Foto'] ||
      row['Foto'] ||
      row['FOTO'] ||
      ''
    ).trim();

    const tandaTangan = String(
      row['Tanda Tangan'] ||
      row['TandaTangan'] ||
      row['TTD'] ||
      row['Tanda Tangan Pegawai'] ||
      row['Signature'] ||
      ''
    ).trim();

    return {
      rowNum: index + 2,
      Nama: nama,
      NIP: nip,
      Jabatan: jabatan,
      'Unit Kerja': unit,
      Pangkat: pangkat,
      Status: status || 'Aktif',
      Foto: foto,
      TandaTangan: tandaTangan
    };
  });
}
