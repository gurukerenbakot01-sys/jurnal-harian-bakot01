export const NAMA_BULAN = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export const NAMA_HARI = [
  'Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'
];

export function getTodayString(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function formatTanggalLengkap(dateStr: string): string {
  if (!dateStr) return '..........................................';
  try {
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    if (isNaN(date.getTime())) return dateStr;
    const hari = NAMA_HARI[date.getDay()];
    const bln = NAMA_BULAN[date.getMonth()];
    return `${hari}, ${d} ${bln} ${y}`;
  } catch {
    return dateStr;
  }
}

export function formatTanggalTtd(dateStr: string, kota = 'Bekasi'): string {
  if (!dateStr) return `${kota}, ......................`;
  try {
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    if (isNaN(date.getTime())) return `${kota}, ${dateStr}`;
    const bln = NAMA_BULAN[date.getMonth()];
    return `${kota}, ${d} ${bln} ${y}`;
  } catch {
    return `${kota}, ......................`;
  }
}
