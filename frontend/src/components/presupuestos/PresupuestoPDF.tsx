import React from 'react';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { formatCurrency, formatDate } from '../../utils/helpers';

// Initialize pdfMake with the default fonts
(pdfMake as any).vfs = (pdfFonts as any).pdfMake.vfs;

interface PresupuestoPDFProps {
  presupuesto: any;
}

const PresupuestoPDF: React.FC<PresupuestoPDFProps> = ({ presupuesto }) => {
  const generatePDF = () => {
    const docDefinition: any = {
      content: [
        { text: 'T&G PUBLIEVENTOS, C.A.', style: 'header' },
        { text: 'RIF: J-40000000-0', style: 'subheader' },
        { text: 'PRESUPUESTO DE UNIFORMES', style: 'title' },
        { text: `Fecha: ${formatDate(presupuesto.createdAt)}`, alignment: 'right' },
        { text: `Cliente: ${presupuesto.cliente?.nombre || 'N/A'}`, style: 'clientInfo' },
        { text: `Email: ${presupuesto.cliente?.email || 'N/A'}`, style: 'clientInfo' },
        { text: '\n' },
        {
          table: {
            headerRows: 1,
            widths: ['*', 'auto', 'auto', 'auto'],
            body: [
              [
                { text: 'Descripción', style: 'tableHeader' },
                { text: 'Cant.', style: 'tableHeader' },
                { text: 'Precio Unit.', style: 'tableHeader' },
                { text: 'Subtotal', style: 'tableHeader' }
              ],
              ...presupuesto.items.map((item: any) => [
                `${item.disenoModelo?.nombre || 'N/A'} - ${item.tela?.nombre || 'N/A'}`,
                item.cantidad,
                formatCurrency(item.precioUnitario),
                formatCurrency(item.subtotal)
              ])
            ]
          }
        },
        { text: '\n' },
        { text: `TOTAL: ${formatCurrency(presupuesto.total)}`, style: 'total' },
        { text: '\n' },
        { text: 'Condiciones:', style: 'subheader' },
        { text: `Validez: ${presupuesto.validezDias || 15} días` },
        { text: `Forma de Pago: ${presupuesto.condicionesPago || 'N/A'}` },
        { text: '\n' },
        { text: 'Notas:', style: 'subheader' },
        { text: presupuesto.notas || 'Sin observaciones adicionales.' }
      ],
      styles: {
        header: { fontSize: 18, bold: true, color: '#1e40af' },
        subheader: { fontSize: 14, bold: true, margin: [0, 10, 0, 5] },
        title: { fontSize: 22, bold: true, alignment: 'center', margin: [0, 20, 0, 20] },
        clientInfo: { fontSize: 12, margin: [0, 2, 0, 2] },
        tableHeader: { bold: true, fontSize: 13, color: 'black' },
        total: { fontSize: 16, bold: true, alignment: 'right' }
      }
    };

    pdfMake.createPdf(docDefinition).download(`Presupuesto_${presupuesto.cliente?.nombre || 'SinNombre'}.pdf`);
  };

  return (
    <button
      onClick={generatePDF}
      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold py-2 rounded-md transition-colors flex items-center justify-center space-x-1"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
      <span>PDF</span>
    </button>
  );
};

export default PresupuestoPDF;
