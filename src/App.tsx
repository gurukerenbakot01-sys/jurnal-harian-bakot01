import React, { useState, useEffect } from 'react';
import { Pegawai, JurnalEntry, SchoolConfig, KegiatanItem } from './types';
import {
  loadPegawaiList,
  savePegawaiList,
  loadSchoolConfig,
  saveSchoolConfig,
  loadGasUrl,
  saveGasUrl,
  loadJurnalList,
  saveJurnalEntry,
  deleteJurnalEntry,
  DEFAULT_PEGAWAI
} from './utils/storage';
import { fetchPegawaiFromSpreadsheet } from './utils/googleSheets';
import { exportPaperToPdf } from './utils/pdfExport';
import { Header } from './components/Header';
import { Toast, ToastState } from './components/Toast';
import { JurnalHarianView } from './components/JurnalHarianView';
import { RekapBulananView } from './components/RekapBulananView';
import { PengaturanDataView } from './components/PengaturanDataView';
import { ModalPegawai } from './components/ModalPegawai';
import { ModalSchoolConfig } from './components/ModalSchoolConfig';
import { ModalGasSync } from './components/ModalGasSync';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'jurnal' | 'rekap' | 'pegawai'>('jurnal');
  const [pegawaiList, setPegawaiList] = useState<Pegawai[]>(() => loadPegawaiList());
  const [jurnalList, setJurnalList] = useState<JurnalEntry[]>(() => loadJurnalList());
  const [schoolConfig, setSchoolConfig] = useState<SchoolConfig>(() => loadSchoolConfig());
  const [gasUrl, setGasUrl] = useState<string>(() => loadGasUrl());

  // Modals state
  const [isModalPegawaiOpen, setIsModalPegawaiOpen] = useState(false);
  const [editingPegawai, setEditingPegawai] = useState<Pegawai | null>(null);
  const [isModalSchoolOpen, setIsModalSchoolOpen] = useState(false);
  const [isModalGasOpen, setIsModalGasOpen] = useState(false);

  // Toast state
  const [toast, setToast] = useState<ToastState>({
    show: false,
    message: '',
    type: 'success'
  });

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast((prev) => (prev.message === message ? { ...prev, show: false } : prev));
    }, 3500);
  };

  // Clear any legacy dummy sample data on mount to ensure clean slate
  useEffect(() => {
    try {
      localStorage.removeItem('sikawan_data_pegawai_v1');
      localStorage.removeItem('sikawan_data_jurnal_v1');
      localStorage.removeItem('sikawan_data_pegawai_sheet_v3');
    } catch {
      // ignore
    }
  }, []);

  // Handlers for Pegawai
  const handleSavePegawai = (pegawai: Pegawai) => {
    let updated: Pegawai[];
    const existingIndex = pegawaiList.findIndex((p) => p.NIP === pegawai.NIP);
    if (existingIndex >= 0) {
      updated = [...pegawaiList];
      updated[existingIndex] = pegawai;
      showToast(`Data pegawai ${pegawai.Nama} berhasil diperbarui!`, 'success');
    } else {
      updated = [...pegawaiList, { ...pegawai, rowNum: pegawaiList.length + 2 }];
      showToast(`Pegawai baru ${pegawai.Nama} berhasil ditambahkan!`, 'success');
    }
    setPegawaiList(updated);
    savePegawaiList(updated);
  };

  const handleDeletePegawai = (nip: string) => {
    const updated = pegawaiList.filter((p) => p.NIP !== nip);
    setPegawaiList(updated);
    savePegawaiList(updated);
  };

  const handleUpdateFotoPegawai = (nip: string, photoDataUrl: string) => {
    const updated = pegawaiList.map((p) => (p.NIP === nip ? { ...p, Foto: photoDataUrl } : p));
    setPegawaiList(updated);
    savePegawaiList(updated);
  };

  const handleUpdateTtdPegawai = (nip: string, ttdDataUrl: string) => {
    const updated = pegawaiList.map((p) => (p.NIP === nip ? { ...p, TandaTangan: ttdDataUrl } : p));
    setPegawaiList(updated);
    savePegawaiList(updated);
  };

  const handleImportPegawaiList = (imported: Pegawai[]) => {
    // Merge or replace preserving already uploaded Foto and TandaTangan
    const nipMap = new Map<string, Pegawai>();
    pegawaiList.forEach((p) => nipMap.set(p.NIP, p));
    imported.forEach((p) => {
      const existing = nipMap.get(p.NIP);
      if (existing) {
        nipMap.set(p.NIP, {
          ...p,
          Foto: p.Foto || existing.Foto || '',
          TandaTangan: p.TandaTangan || existing.TandaTangan || ''
        });
      } else {
        nipMap.set(p.NIP, p);
      }
    });
    const merged = Array.from(nipMap.values());
    setPegawaiList(merged);
    savePegawaiList(merged);
  };

  const handleClearAllPegawai = () => {
    setPegawaiList([]);
    savePegawaiList([]);
    showToast('Seluruh data pegawai berhasil dikosongkan.', 'info');
  };

  // Handlers for Jurnal
  const handleSaveJurnal = (
    pegawai: Pegawai,
    tanggal: string,
    shift: string,
    kegiatan: KegiatanItem[]
  ) => {
    const newEntry: JurnalEntry = {
      id: `jurnal-${pegawai.NIP}-${tanggal}`,
      pegawaiNIP: pegawai.NIP,
      pegawaiNama: pegawai.Nama,
      tanggal,
      shift,
      kegiatan,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    saveJurnalEntry(newEntry);
    setJurnalList(loadJurnalList());
  };

  const handleDeleteJurnal = (id: string) => {
    deleteJurnalEntry(id);
    setJurnalList(loadJurnalList());
  };

  const [selectedJurnalForView, setSelectedJurnalForView] = useState<JurnalEntry | null>(null);

  const handleSelectJurnalForPrint = (jurnal: JurnalEntry) => {
    setSelectedJurnalForView(jurnal);
    // Switch to jurnal tab
    setCurrentTab('jurnal');
    showToast(`Memuat jurnal ${jurnal.pegawaiNama}. Klik "Simpan PDF" di bilah atas untuk mengunduh.`, 'info');
  };

  // Handlers for School Config
  const handleSaveSchoolConfig = (newConfig: SchoolConfig) => {
    setSchoolConfig(newConfig);
    saveSchoolConfig(newConfig);
    showToast('Identitas sekolah & kop surat berhasil disimpan!', 'success');
  };

  // Handlers for GAS Sync
  const handleSaveGasUrl = (url: string) => {
    setGasUrl(url);
    saveGasUrl(url);
    showToast('URL Google Spreadsheet / Apps Script disimpan.', 'success');
  };

  const handleTestGasSync = async (url: string) => {
    const targetUrl = url || gasUrl;
    if (!targetUrl || !targetUrl.trim()) {
      showToast('Silakan masukkan Link Google Spreadsheet atau URL Apps Script terlebih dahulu.', 'info');
      setIsModalGasOpen(true);
      return;
    }
    try {
      showToast('Menghubungkan & menarik data dari Google Spreadsheet...', 'info');
      const result = await fetchPegawaiFromSpreadsheet(targetUrl);
      if (result.success && result.data.length > 0) {
        handleImportPegawaiList(result.data);
        showToast(result.message, 'success');
      } else {
        showToast('Tidak ada data pegawai yang dapat dibaca dari spreadsheet tersebut.', 'info');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Koneksi gagal';
      showToast(`Gagal: ${msg}`, 'error');
    }
  };

  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const handleSavePdf = async () => {
    if (isExportingPdf) return;

    // Pastikan berada di tab jurnal agar elemen lembar kerja ter-render
    if (currentTab !== 'jurnal') {
      setCurrentTab('jurnal');
      showToast('Beralih ke tab Jurnal Harian...', 'info');
      await new Promise((r) => setTimeout(r, 400));
    }

    setIsExportingPdf(true);
    showToast('Sedang memproses dan mengunduh file PDF...', 'info');

    try {
      const paperEl = document.getElementById('paper-to-print');
      const filename = paperEl?.getAttribute('data-filename') || undefined;

      await exportPaperToPdf({
        fileName: filename,
        onSuccess: () => {
          showToast('File PDF berhasil disimpan dan diunduh!', 'success');
        },
        onError: (err) => {
          console.error('Direct PDF export error:', err);
          showToast(`Gagal memproses PDF: ${err.message}`, 'error');
        }
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal memproses simpan PDF.';
      showToast(msg, 'error');
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-gray-100 text-gray-800">
      {/* Toast Notification */}
      <Toast toast={toast} onClose={() => setToast((prev) => ({ ...prev, show: false }))} />

      {/* Header & Tabs */}
      <Header
        currentTab={currentTab}
        onTabChange={(tab) => setCurrentTab(tab)}
        onPrint={handleSavePdf}
        isExportingPdf={isExportingPdf}
        onOpenSchoolModal={() => setIsModalSchoolOpen(true)}
        onRefreshData={() => {
          setPegawaiList(loadPegawaiList());
          setJurnalList(loadJurnalList());
          setSchoolConfig(loadSchoolConfig());
          showToast('Data aplikasi disegarkan!', 'info');
        }}
        schoolName={schoolConfig.sekolah}
      />

      {/* Main Content Views */}
      <main className="flex-1 flex overflow-hidden relative">
        {currentTab === 'jurnal' && (
          <JurnalHarianView
            pegawaiList={pegawaiList}
            schoolConfig={schoolConfig}
            onSaveJurnal={handleSaveJurnal}
            onPrint={handleSavePdf}
            showToast={showToast}
            initialEntry={selectedJurnalForView}
          />
        )}

        {currentTab === 'rekap' && (
          <RekapBulananView
            pegawaiList={pegawaiList}
            jurnalList={jurnalList}
            schoolConfig={schoolConfig}
            onDeleteJurnal={handleDeleteJurnal}
            onSelectJurnalForPrint={handleSelectJurnalForPrint}
            onSwitchToJurnal={() => setCurrentTab('jurnal')}
            showToast={showToast}
          />
        )}

        {currentTab === 'pegawai' && (
          <PengaturanDataView
            pegawaiList={pegawaiList}
            gasUrl={gasUrl}
            onAddPegawai={() => {
              setEditingPegawai(null);
              setIsModalPegawaiOpen(true);
            }}
            onEditPegawai={(p) => {
              setEditingPegawai(p);
              setIsModalPegawaiOpen(true);
            }}
            onDeletePegawai={handleDeletePegawai}
            onUpdateFotoPegawai={handleUpdateFotoPegawai}
            onUpdateTtdPegawai={handleUpdateTtdPegawai}
            onImportPegawaiList={handleImportPegawaiList}
            onSyncSpreadsheet={handleTestGasSync}
            onOpenGasModal={() => setIsModalGasOpen(true)}
            showToast={showToast}
          />
        )}
      </main>

      {/* Modals */}
      <ModalPegawai
        isOpen={isModalPegawaiOpen}
        onClose={() => setIsModalPegawaiOpen(false)}
        onSave={handleSavePegawai}
        initialData={editingPegawai}
        defaultUnitKerja={schoolConfig.sekolah}
      />

      <ModalSchoolConfig
        isOpen={isModalSchoolOpen}
        onClose={() => setIsModalSchoolOpen(false)}
        config={schoolConfig}
        onSave={handleSaveSchoolConfig}
      />

      <ModalGasSync
        isOpen={isModalGasOpen}
        onClose={() => setIsModalGasOpen(false)}
        gasUrl={gasUrl}
        onSaveGasUrl={handleSaveGasUrl}
        onTestSync={handleTestGasSync}
      />
    </div>
  );
}
