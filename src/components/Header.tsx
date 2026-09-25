import React from 'react';
import {
  FileText,
  PieChart,
  Users,
  Settings,
  Printer,
  Shield,
  MessageCircle,
  Building2,
  RefreshCw,
  FileDown,
  Loader2
} from 'lucide-react';

interface HeaderProps {
  currentTab: 'jurnal' | 'rekap' | 'pegawai';
  onTabChange: (tab: 'jurnal' | 'rekap' | 'pegawai') => void;
  onPrint: () => void;
  isExportingPdf?: boolean;
  onOpenSchoolModal: () => void;
  onRefreshData: () => void;
  schoolName: string;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onTabChange,
  onPrint,
  isExportingPdf = false,
  onOpenSchoolModal,
  onRefreshData,
  schoolName
}) => {
  return (
    <div className="w-full flex-shrink-0 z-30 shadow-md">
      {/* Top Banner */}
      <header className="bg-[#0b4e3a] text-white px-3 sm:px-5 py-2.5 flex flex-wrap sm:flex-nowrap justify-between items-center gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-full border-2 border-emerald-400 bg-emerald-900/60 flex items-center justify-center shadow-inner flex-shrink-0">
            <Shield className="w-5 h-5 text-emerald-200" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold leading-tight tracking-wide">
                Informasi Jurnal Sikawan Harian
              </h1>
              <span className="hidden md:inline-block bg-emerald-800/80 text-emerald-200 text-[11px] px-2 py-0.5 rounded border border-emerald-600/40">
                {schoolName}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-3 text-xs text-emerald-100/90 mt-0.5">
              <span>
                Aplikasi ini dibuat oleh : <strong className="text-amber-300 font-semibold">SAMSUDIN</strong>
              </span>
              <a
                href="https://wa.me/628561240622"
                target="_blank"
                rel="noreferrer"
                className="text-emerald-300 hover:text-white flex items-center gap-1 transition-colors"
                title="Hubungi Samsudin via WhatsApp"
              >
                <MessageCircle className="w-3.5 h-3.5 fill-emerald-400/20" /> WA : 08561240622
              </a>
            </div>
          </div>
        </div>

        {/* Header Right Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenSchoolModal}
            className="hidden lg:flex items-center gap-1.5 bg-emerald-800/80 hover:bg-emerald-700 text-xs px-3 py-1.5 rounded-md border border-emerald-600 transition-colors shadow-sm"
            title="Ubah Nama Sekolah, Alamat Kop & Kepala Sekolah"
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Data Sekolah</span>
          </button>
          <button
            onClick={onRefreshData}
            className="flex items-center gap-1.5 bg-emerald-800/80 hover:bg-emerald-700 text-xs px-2.5 py-1.5 rounded-md border border-emerald-600 transition-colors shadow-sm"
            title="Segarkan data pegawai & simpanan"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button
            onClick={onPrint}
            disabled={isExportingPdf}
            className="bg-red-600 hover:bg-red-700 active:bg-red-800 disabled:opacity-60 text-white font-semibold text-xs sm:text-sm px-3.5 py-1.5 rounded-md flex items-center gap-1.5 transition-colors shadow cursor-pointer disabled:cursor-not-allowed"
            title="Simpan dokumen lembar kerja ke file PDF"
          >
            {isExportingPdf ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <FileDown className="w-4 h-4" />
            )}
            <span>{isExportingPdf ? 'Memproses PDF...' : 'Simpan PDF'}</span>
          </button>
        </div>
      </header>

      {/* Tabs Navigation */}
      <nav id="main-tabs" className="bg-white px-4 sm:px-6 border-b border-gray-200 flex gap-6 text-sm text-gray-600 font-medium">
        <button
          onClick={() => onTabChange('jurnal')}
          className={`py-3 flex items-center gap-2 border-b-2 cursor-pointer transition-all ${
            currentTab === 'jurnal'
              ? 'border-emerald-600 text-emerald-700 font-bold'
              : 'border-transparent hover:text-emerald-600'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Jurnal Harian</span>
        </button>
        <button
          onClick={() => onTabChange('rekap')}
          className={`py-3 flex items-center gap-2 border-b-2 cursor-pointer transition-all whitespace-nowrap ${
            currentTab === 'rekap'
              ? 'border-emerald-600 text-emerald-700 font-bold'
              : 'border-transparent hover:text-emerald-600'
          }`}
        >
          <PieChart className="w-4 h-4" />
          <span>Rekap Bulanan</span>
        </button>
        <button
          onClick={() => onTabChange('pegawai')}
          className={`py-3 flex items-center gap-2 border-b-2 cursor-pointer transition-all whitespace-nowrap ${
            currentTab === 'pegawai'
              ? 'border-emerald-600 text-emerald-700 font-bold'
              : 'border-transparent hover:text-emerald-600'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Data Pegawai</span>
        </button>
        <button
          type="button"
          onClick={onOpenSchoolModal}
          className="py-3 flex items-center gap-2 border-b-2 border-transparent hover:text-emerald-600 cursor-pointer transition-all whitespace-nowrap"
          title="Ubah identitas sekolah, kepala sekolah, dan kop surat"
        >
          <Building2 className="w-4 h-4" />
          <span>Data Sekolah</span>
        </button>
      </nav>
    </div>
  );
};
