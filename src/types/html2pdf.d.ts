declare module 'html2pdf.js' {
  interface Html2PdfOptions {
    filename?: string;
    enableLinks?: boolean;
    image?: { type?: 'jpeg' | 'png' | 'webp'; quality?: number };
    html2canvas?: Record<string, unknown>;
    jsPDF?: Record<string, unknown>;
    pagebreak?: {
      mode?: Array<'avoid-all' | 'css' | 'legacy'>;
      before?: string | string[];
      after?: string | string[];
      avoid?: string | string[];
    };
  }

  interface Html2PdfWorker extends PromiseLike<unknown> {
    set(options: Html2PdfOptions): Html2PdfWorker;
    from(source: HTMLElement): Html2PdfWorker;
    outputPdf(type: 'blob', options?: Record<string, unknown>): PromiseLike<Blob>;
    save(filename?: string): Html2PdfWorker;
  }

  interface Html2PdfFactory {
    (): Html2PdfWorker;
  }

  const html2pdf: Html2PdfFactory;
  export default html2pdf;
}
