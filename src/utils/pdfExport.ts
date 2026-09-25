import jsPDF from 'jspdf';
import html2canvas from 'html2canvas-pro';

interface ExportPdfOptions {
  fileName?: string;
  onStart?: () => void;
  onSuccess?: () => void;
  onError?: (err: Error) => void;
}

/**
 * Universal file download helper that works reliably on:
 * - Mobile Android (Chrome, Samsung Internet, Firefox)
 * - iOS / iPadOS (Safari, Chrome)
 * - Desktop Windows, Mac, Linux (Chrome, Edge, Firefox, Safari)
 */
function downloadBlob(blob: Blob, fileName: string, pdf: jsPDF): void {
  // Check for msSaveBlob support (IE / Edge legacy)
  const nav = window.navigator as unknown as { msSaveOrOpenBlob?: (b: Blob, d: string) => boolean };
  if (typeof nav.msSaveOrOpenBlob === 'function') {
    nav.msSaveOrOpenBlob(blob, fileName);
    return;
  }

  try {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.setAttribute('download', fileName);
    link.style.display = 'none';
    document.body.appendChild(link);

    link.click();

    setTimeout(() => {
      try {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } catch {
        // ignore cleanup error
      }
    }, 2000);
  } catch (err) {
    console.warn('Standard blob download failed, falling back to pdf.save:', err);
    // Direct jsPDF save fallback
    pdf.save(fileName);
  }
}

/**
 * Exports the #paper-to-print element as a high-quality Folio/F4 PDF.
 * Uses html2canvas-pro for full Tailwind CSS v4 (oklch) compatibility.
 */
export async function exportPaperToPdf(options?: ExportPdfOptions): Promise<boolean> {
  // 1. Polling cari elemen lembar kerja (berguna saat baru berpindah tab)
  let paperEl = document.getElementById('paper-to-print');
  if (!paperEl) {
    for (let i = 0; i < 15; i++) {
      await new Promise((r) => setTimeout(r, 100));
      paperEl = document.getElementById('paper-to-print');
      if (paperEl) break;
    }
  }

  if (!paperEl) {
    const notFoundError = new Error('Lembar kerja belum siap. Silakan buka tab Jurnal Harian terlebih dahulu.');
    options?.onError?.(notFoundError);
    return false;
  }

  options?.onStart?.();

  try {
    // 2. Render high-res canvas dengan html2canvas-pro (Mendukung Tailwind CSS v4 oklch & OKLab)
    const canvas = await html2canvas(paperEl, {
      scale: 2,
      useCORS: true,
      allowTaint: false,
      backgroundColor: '#ffffff',
      logging: false,
      windowWidth: 1000, // Menjamin kalkulasi lebar kertas penuh (F4) bahkan di layar ponsel
      onclone: (clonedDoc) => {
        const clonedPaper = clonedDoc.getElementById('paper-to-print');
        if (clonedPaper) {
          clonedPaper.style.width = '215mm';
          clonedPaper.style.maxWidth = '215mm';
          clonedPaper.style.transform = 'none';

          // Pastikan gambar eksternal tidak mentaint canvas
          const imgs = clonedPaper.getElementsByTagName('img');
          for (let i = 0; i < imgs.length; i++) {
            const img = imgs[i];
            if (img.src && !img.src.startsWith('data:')) {
              img.crossOrigin = 'anonymous';
            }
          }
        }
      }
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.95);

    // 3. Konfigurasi Dokumen Ukuran F4 / Folio Resmi: 215 mm x 330 mm
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [215, 330]
    });

    const pageWidth = 215;
    const pageHeight = 330;
    const marginX = 5; // Margin samping 5mm
    const marginY = 5; // Margin atas-bawah 5mm
    const printableWidth = pageWidth - (marginX * 2); // 205mm
    const printableHeight = pageHeight - (marginY * 2); // 320mm

    // Hitung tinggi proporsional bila dicetak selebar area cetak
    const fullWidthHeight = (canvas.height * printableWidth) / canvas.width;

    if (fullWidthHeight <= printableHeight) {
      // Pas 1 lembar F4 secara alami
      pdf.addImage(imgData, 'JPEG', marginX, marginY, printableWidth, fullWidthHeight, undefined, 'FAST');
    } else if (fullWidthHeight <= printableHeight * 1.5) {
      // Skala proporsional agar SELALU pas persis 1 lembar F4
      const scaleToFit = printableHeight / fullWidthHeight;
      const fitWidth = printableWidth * scaleToFit;
      const fitHeight = printableHeight;
      const xOffset = marginX + (printableWidth - fitWidth) / 2;
      pdf.addImage(imgData, 'JPEG', xOffset, marginY, fitWidth, fitHeight, undefined, 'FAST');
    } else {
      // Multi-page jika kegiatan luar biasa banyak
      let remainingHeight = fullWidthHeight;
      let position = marginY;

      while (remainingHeight > 0) {
        pdf.addImage(imgData, 'JPEG', marginX, position, printableWidth, fullWidthHeight, undefined, 'FAST');
        remainingHeight -= printableHeight;
        if (remainingHeight > 0) {
          pdf.addPage([215, 330], 'portrait');
          position -= printableHeight;
        }
      }
    }

    // 4. Nama file PDF: "Jurnal Harian_Nama Pegawai_NIP.pdf"
    let outputName = options?.fileName || paperEl.getAttribute('data-filename') || 'Jurnal Harian.pdf';
    if (!outputName.toLowerCase().endsWith('.pdf')) {
      outputName += '.pdf';
    }

    // 5. Unduh file langsung ke perangkat pengguna
    const blob = pdf.output('blob');
    downloadBlob(blob, outputName, pdf);

    options?.onSuccess?.();
    return true;
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error('Gagal memproses file PDF.');
    console.error('exportPaperToPdf error:', error);
    options?.onError?.(error);
    return false;
  }
}
