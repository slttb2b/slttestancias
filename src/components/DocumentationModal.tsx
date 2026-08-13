import React, { useState } from 'react';
import { X, Terminal, Database, CreditCard, Rocket, Palette, Copy, CheckCircle2 } from 'lucide-react';

interface DocumentationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DocumentationModal: React.FC<DocumentationModalProps> = ({ isOpen, onClose }) => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyCode = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(label);
    setTimeout(() => setCopiedSection(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#132016]/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#132016] border border-[#606e60] rounded-3xl max-w-4xl w-full my-8 p-6 sm:p-8 shadow-2xl text-[#ebe5de] relative max-h-[85vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#c3ccc0] hover:text-[#ebe5de]"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-2">
          <Terminal className="w-6 h-6 text-[#ad9e92]" />
          <h2 className="text-2xl font-bold font-serif text-[#ebe5de]">
            Developer & Customization Guide
          </h2>
        </div>
        <p className="text-xs text-[#c3ccc0] mb-8 font-light">
          Complete instructions for running, customizing, connecting databases, adding payment gateways, and deploying <strong className="text-[#ebe5de]">SLTT ESTANCIAS</strong>.
        </p>

        <div className="space-y-8 text-xs text-[#c3ccc0]">
          {/* Section 1: How to Run the Project */}
          <div className="p-5 rounded-2xl bg-[#1c2a20] border border-[#606e60] space-y-3">
            <h3 className="text-sm font-bold text-[#ad9e92] flex items-center gap-2">
              <Terminal className="w-4 h-4 text-[#ad9e92]" />
              1. How to Run the Project
            </h3>
            <p className="text-[#c3ccc0] leading-relaxed">
              This project is built with React 19, TypeScript, Vite, Express, and Tailwind CSS.
            </p>
            <div className="relative bg-[#132016] p-3 rounded-xl font-mono text-[11px] text-[#ad9e92] border border-[#606e60]/60">
              <pre>{`# Install dependencies
npm install

# Run Vite dev server on port 3000
npm run dev

# Build production bundle
npm run build`}</pre>
              <button
                onClick={() => copyCode('npm install && npm run dev', 'run')}
                className="absolute top-2 right-2 text-[10px] text-[#c3ccc0] hover:text-[#ebe5de] flex items-center gap-1"
              >
                {copiedSection === 'run' ? <CheckCircle2 className="w-3 h-3 text-[#ad9e92]" /> : <Copy className="w-3 h-3" />}
                <span>{copiedSection === 'run' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Section 2: How to Change Resort Name, Logo, Colors & Pricing */}
          <div className="p-5 rounded-2xl bg-[#1c2a20] border border-[#606e60] space-y-3">
            <h3 className="text-sm font-bold text-[#ad9e92] flex items-center gap-2">
              <Palette className="w-4 h-4 text-[#ad9e92]" />
              2. How to Change Resort Name, Logo, Colors, Rooms & Prices
            </h3>
            <p className="text-[#c3ccc0] leading-relaxed">
              All resort information and default room rates are stored centrally in <code className="text-[#ad9e92] font-mono">/src/data/resortData.ts</code>. You can also edit room prices live via the Owner Admin Portal.
            </p>
            <div className="relative bg-[#132016] p-3 rounded-xl font-mono text-[11px] text-[#ad9e92] border border-[#606e60]/60">
              <pre>{`// Edit resort details in src/data/resortData.ts
export const INITIAL_RESORT_INFO = {
  name: "SLTT ESTANCIAS",
  location: "TIGBAO, MAUSWAGON LUGAIT",
  contactNumber: "09054965912",
  email: "reservations@slttestanciasresort.com",
};

// Edit room rates and images
export const INITIAL_ROOMS = [
  { id: "deluxe", name: "Deluxe Room", pricePerNight: 2500 },
  { id: "pool-villa", name: "Private Pool Villa", pricePerNight: 12000 }
];`}</pre>
            </div>
          </div>

          {/* Section 3: How to Connect a Real Database */}
          <div className="p-5 rounded-2xl bg-[#1c2a20] border border-[#606e60] space-y-3">
            <h3 className="text-sm font-bold text-[#ad9e92] flex items-center gap-2">
              <Database className="w-4 h-4 text-[#ad9e92]" />
              3. How to Connect a Real Database (Firestore or Cloud SQL)
            </h3>
            <p className="text-[#c3ccc0] leading-relaxed">
              Currently, reservations persist in <code className="text-[#ad9e92] font-mono">localStorage</code>. For production, connect Firebase Firestore or PostgreSQL.
            </p>
            <div className="relative bg-[#132016] p-3 rounded-xl font-mono text-[11px] text-[#ad9e92] border border-[#606e60]/60">
              <pre>{`// Option A: Firebase Firestore integration
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";

const db = getFirestore(app);
await addDoc(collection(db, "bookings"), newBooking);`}</pre>
            </div>
          </div>

          {/* Section 4: How to Connect a Real Payment Gateway */}
          <div className="p-5 rounded-2xl bg-[#1c2a20] border border-[#606e60] space-y-3">
            <h3 className="text-sm font-bold text-[#ad9e92] flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-[#ad9e92]" />
              4. How to Connect Real Payment Gateways (PayMongo / GCash / Maya)
            </h3>
            <p className="text-[#c3ccc0] leading-relaxed">
              To accept live GCash, Maya, or Credit Card payments in the Philippines, integrate the PayMongo API or Xendit SDK.
            </p>
            <div className="relative bg-[#132016] p-3 rounded-xl font-mono text-[11px] text-[#ad9e92] border border-[#606e60]/60">
              <pre>{`// Server API endpoint in server.ts
app.post("/api/paymongo/checkout", async (req, res) => {
  const response = await fetch("https://api.paymongo.com/v1/checkout_sessions", {
    method: "POST",
    headers: { Authorization: \`Basic \${btoa(process.env.PAYMONGO_SECRET_KEY)}\` },
    body: JSON.stringify({ data: { attributes: { amount: req.body.amount * 100 } } })
  });
  res.json(await response.json());
});`}</pre>
            </div>
          </div>

          {/* Section 5: How to Deploy Online */}
          <div className="p-5 rounded-2xl bg-[#1c2a20] border border-[#606e60] space-y-3">
            <h3 className="text-sm font-bold text-[#ad9e92] flex items-center gap-2">
              <Rocket className="w-4 h-4 text-[#ad9e92]" />
              5. How to Deploy the Website Online
            </h3>
            <p className="text-[#c3ccc0] leading-relaxed">
              You can deploy this application directly in AI Studio to Cloud Run via the Share / Deploy workflow, or export to GitHub and host on Vercel or Render.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
