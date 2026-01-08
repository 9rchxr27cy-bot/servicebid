
import { Invoice, CompanyDetails, User, JobRequest } from '../types';

// Helper to calculate invoice totals
export const calculateInvoiceTotals = (price: number, vatRate: number = 17) => {
  // Assuming the price agreed in chat is TTC (Total Including Tax) for B2C simplicity
  // Or HT (Excluding Tax) depending on platform logic. 
  // Let's assume price is HT for B2B standard, but B2C usually talks TTC.
  // For this generator, we treat the input price as TTC to extract VAT.
  
  const priceTTC = price;
  const priceHT = priceTTC / (1 + vatRate / 100);
  const vatAmount = priceTTC - priceHT;

  return {
    subtotalHT: parseFloat(priceHT.toFixed(2)),
    totalVAT: parseFloat(vatAmount.toFixed(2)),
    totalTTC: parseFloat(priceTTC.toFixed(2))
  };
};

export const generateInvoiceNumber = (jobId: string) => {
  const year = new Date().getFullYear();
  // Mock logic: generate a sequential-looking number based on timestamp
  const sequence = Date.now().toString().slice(-4);
  return `${year}-${sequence}`;
};

export const createInvoiceObject = (
  pro: User, 
  clientName: string, // In real app, would be Client User object
  job: JobRequest, 
  amount: number
): Invoice => {
  const totals = calculateInvoiceTotals(amount);
  
  // Default Company Details if missing (Safety fallback)
  const companyInfo: CompanyDetails = pro.companyDetails || {
    legalName: pro.name + " " + (pro.surname || ""),
    legalType: "independant",
    vatNumber: "LU99999999 (Simulated)",
    licenseNumber: "N/A",
    licenseExpiry: "",
    iban: "",
    rcsNumber: ""
  };

  return {
    id: generateInvoiceNumber(job.id),
    date: new Date().toISOString(),
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // +14 days
    issuer: {
      ...companyInfo,
      address: pro.addresses[0] ? `${pro.addresses[0].street} ${pro.addresses[0].number}, ${pro.addresses[0].postalCode} ${pro.addresses[0].locality}` : "Luxembourg"
    },
    client: {
      name: clientName,
      address: job.location // Using job location as client address for now
    },
    items: [
      {
        description: job.title || `Service: ${job.category}`,
        quantity: 1,
        unitPrice: totals.subtotalHT,
        vatRate: 17,
        total: totals.subtotalHT
      }
    ],
    subtotalHT: totals.subtotalHT,
    totalVAT: totals.totalVAT,
    totalTTC: totals.totalTTC,
    status: 'PENDING',
    language: 'FR', // Default legal language
    paymentMethod: job.paymentMethod || 'CASH'
  };
};

// Mock function to simulate PDF generation download
export const downloadInvoicePDF = (invoice: Invoice) => {
  console.log("Generating PDF for:", invoice);
  
  const paymentLabel = invoice.paymentMethod === 'CARD' ? 'Carte Bancaire' 
                     : invoice.paymentMethod === 'TRANSFER' ? 'Virement Bancaire' 
                     : 'Espèces';

  alert(`📥 Downloading PDF Invoice N° ${invoice.id}\n\nIssuer: ${invoice.issuer.legalName}\nClient: ${invoice.client.name}\nAmount: €${invoice.totalTTC}\nMethod: ${paymentLabel}`);
};

export const downloadFiscalReport = (year: number) => {
    alert(`📥 Downloading Fiscal Report (Year ${year})\n\nFormat: CSV & PDF\nIncludes all transactions, VAT collected, and platform fees for your accountant.`);
}
