"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

// --- CUSTOM SVG LOGOS FOR HIGH FIDELITY ---

const SSLCommerzLogo = () => (
  <svg viewBox="0 0 100 100" className="w-12 h-12">
    <circle cx="50" cy="50" r="45" fill="none" stroke="#f1f5f9" strokeWidth="2" />
    <defs>
      <linearGradient id="blueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#0d4a94" />
        <stop offset="100%" stopColor="#1e3a8a" />
      </linearGradient>
      <linearGradient id="orangeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ea580c" />
        <stop offset="100%" stopColor="#f97316" />
      </linearGradient>
    </defs>
    <path d="M50,15 A35,35 0 0,0 15,50 A35,35 0 0,0 50,85 A15,15 0 0,1 35,50 A15,15 0 0,1 50,15 Z" fill="url(#blueGrad)" />
    <path d="M50,15 A35,35 0 0,1 85,50 A35,35 0 0,1 50,85 A15,15 0 0,0 65,50 A15,15 0 0,0 50,15 Z" fill="url(#orangeGrad)" />
    <circle cx="50" cy="50" r="8" fill="#ffffff" />
  </svg>
);

// Mobile Banking SVGs
const BKashLogo = () => (
  <svg viewBox="0 0 120 40" className="h-6 w-20">
    <path d="M15,10 C18,8 24,12 25,18 C26,24 20,28 15,30 C12,31 8,28 10,22 C11,16 12,12 15,10 Z" fill="#E2136E" />
    <path d="M18,15 C20,14 23,16 23,19 C23,22 19,24 16,25" fill="#FFFFFF" />
    <text x="35" y="28" fill="#E2136E" className="font-sans font-black text-lg tracking-tight">bKash</text>
  </svg>
);

const RocketLogo = () => (
  <svg viewBox="0 0 120 40" className="h-6 w-20">
    <path d="M12,28 L15,22 L20,12 L22,6 L24,12 L29,22 L32,28 L22,25 Z" fill="#8C3494" />
    <path d="M22,25 L18,34 L22,30 L26,34 Z" fill="#F37021" />
    <text x="38" y="28" fill="#8C3494" className="font-sans font-black text-lg tracking-tight">rocket</text>
  </svg>
);

const NagadLogo = () => (
  <svg viewBox="0 0 120 40" className="h-6 w-20">
    <path d="M10,25 C10,12 28,10 28,22 C28,34 10,30 10,25 Z" fill="#F7941D" />
    <path d="M20,25 C20,18 28,18 28,24 C28,30 20,28 20,25 Z" fill="#E2136E" />
    <text x="35" y="28" fill="#F7941D" className="font-sans font-black text-base italic tracking-tight">নগদ</text>
  </svg>
);

const CellFinLogo = () => (
  <svg viewBox="0 0 120 40" className="h-6 w-20">
    <rect x="5" y="5" width="22" height="30" rx="4" fill="#0066B3" />
    <circle cx="16" cy="20" r="6" fill="#FFFFFF" />
    <circle cx="16" cy="20" r="3" fill="#F7941D" />
    <text x="32" y="25" fill="#333333" className="font-sans font-bold text-sm tracking-tighter">CellFin</text>
  </svg>
);

const UpayLogo = () => (
  <svg viewBox="0 0 120 40" className="h-6 w-20">
    <text x="15" y="26" fill="#0066B3" className="font-sans font-black text-xl tracking-tighter">u</text>
    <text x="27" y="26" fill="#F7941D" className="font-sans font-black text-xl tracking-tighter">pay</text>
    <path d="M15,30 L45,30" stroke="#F7941D" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

const MYCashLogo = () => (
  <svg viewBox="0 0 120 40" className="h-6 w-20">
    <rect x="5" y="8" width="25" height="24" rx="4" fill="#008000" />
    <text x="17" y="24" fill="#FFFFFF" textAnchor="middle" className="font-sans font-bold text-[9px]">MY</text>
    <text x="34" y="26" fill="#008000" className="font-sans font-black text-sm italic">Cash</text>
  </svg>
);

const ABBLogo = () => (
  <svg viewBox="0 0 120 40" className="h-6 w-20">
    <rect x="5" y="5" width="30" height="30" rx="3" fill="#A82024" />
    <text x="20" y="26" fill="#FFFFFF" textAnchor="middle" className="font-sans font-black text-lg">AB</text>
    <text x="38" y="26" fill="#333333" className="font-sans font-black text-base ml-1">Bank</text>
  </svg>
);

const TapLogo = () => (
  <svg viewBox="0 0 120 40" className="h-6 w-20">
    <circle cx="20" cy="20" r="14" fill="#E2136E" />
    <text x="20" y="26" fill="#FFFFFF" textAnchor="middle" className="font-sans font-black text-sm italic">tap</text>
  </svg>
);

const OkWalletLogo = () => (
  <svg viewBox="0 0 120 40" className="h-6 w-20">
    <circle cx="16" cy="20" r="12" fill="#0066B3" />
    <text x="16" y="25" fill="#FFFFFF" textAnchor="middle" className="font-sans font-black text-[10px]">OK</text>
    <text x="32" y="26" fill="#333333" className="font-sans font-bold text-xs">wallet</text>
  </svg>
);

const DmoneyLogo = () => (
  <svg viewBox="0 0 120 40" className="h-6 w-20">
    <text x="10" y="28" fill="#107C41" className="font-sans font-black text-2xl italic tracking-tighter">D</text>
    <text x="28" y="25" fill="#333333" className="font-sans font-semibold text-xs">money</text>
  </svg>
);

const IslamicWalletLogo = () => (
  <svg viewBox="0 0 120 40" className="h-6 w-20">
    <path d="M15,8 L25,18 L15,28 L5,18 Z" fill="#0F753A" />
    <text x="30" y="20" fill="#0F753A" className="font-sans font-bold text-[9px] uppercase leading-none">Islamic</text>
    <text x="30" y="29" fill="#333333" className="font-sans text-[9px] leading-none">Wallet</text>
  </svg>
);

const JustPayLogo = () => (
  <svg viewBox="0 0 120 40" className="h-6 w-20">
    <text x="10" y="26" fill="#1D70B8" className="font-sans font-black text-base tracking-tighter">Just</text>
    <text x="42" y="26" fill="#F47B20" className="font-sans font-black text-base tracking-tighter">Pay</text>
  </svg>
);

// Net Banking SVGs
const CitytouchLogo = () => (
  <svg viewBox="0 0 120 40" className="h-6 w-20">
    <circle cx="16" cy="20" r="12" fill="#E2136E" />
    <path d="M12,24 C16,14 20,24 24,24" stroke="#FFFFFF" strokeWidth="2" fill="none" />
    <text x="32" y="25" fill="#333333" className="font-sans font-bold text-[10px] tracking-tighter">citytouch</text>
  </svg>
);

const MTBLogo = () => (
  <svg viewBox="0 0 120 40" className="h-6 w-20">
    <text x="10" y="26" fill="#0C4C94" className="font-sans font-black text-lg italic">MTB</text>
  </svg>
);

const BankAsiaLogo = () => (
  <svg viewBox="0 0 120 40" className="h-6 w-20">
    <rect x="5" y="10" width="24" height="20" fill="#0D4A94" />
    <text x="17" y="24" fill="#FFFFFF" textAnchor="middle" className="font-sans font-bold text-[9px]">BA</text>
    <text x="32" y="25" fill="#0D4A94" className="font-sans font-bold text-[10px]">Bank Asia</text>
  </svg>
);

const SBILogo = () => (
  <svg viewBox="0 0 120 40" className="h-6 w-20">
    <circle cx="16" cy="20" r="10" fill="#00a5ec" />
    <circle cx="16" cy="20" r="3.5" fill="#FFFFFF" />
    <rect x="14.5" y="20" width="3" height="10" fill="#FFFFFF" />
    <text x="32" y="25" fill="#333333" className="font-sans font-black text-xs">SBI</text>
  </svg>
);

const DhakaBankLogo = () => (
  <svg viewBox="0 0 120 40" className="h-6 w-20">
    <ellipse cx="18" cy="20" rx="12" ry="8" fill="#1D70B8" />
    <text x="34" y="24" fill="#1D70B8" className="font-sans font-bold text-[8px] uppercase leading-none">Dhaka Bank</text>
  </svg>
);

const SonaliBankLogo = () => (
  <svg viewBox="0 0 120 40" className="h-6 w-20">
    <circle cx="16" cy="20" r="10" fill="#D4AF37" />
    <text x="30" y="25" fill="#333333" className="font-sans font-bold text-[10px]">Sonali Bank</text>
  </svg>
);

const EBLSkyLogo = () => (
  <svg viewBox="0 0 120 40" className="h-6 w-20">
    <text x="10" y="25" fill="#1D70B8" className="font-sans font-black text-xs italic">EBL SKY</text>
  </svg>
);

const PrimeBankLogo = () => (
  <svg viewBox="0 0 120 40" className="h-6 w-20">
    <polygon points="5,20 15,12 25,20 15,28" fill="#1D70B8" />
    <text x="30" y="25" fill="#1D70B8" className="font-sans font-bold text-[10px]">Prime Bank</text>
  </svg>
);

const TapNPayLogo = () => (
  <svg viewBox="0 0 120 40" className="h-6 w-20">
    <rect x="5" y="10" width="20" height="20" rx="4" fill="#666666" />
    <text x="28" y="25" fill="#333333" className="font-sans font-bold text-[9px]">Tap 'n Pay</text>
  </svg>
);

const IPayLogo = () => (
  <svg viewBox="0 0 120 40" className="h-6 w-20">
    <circle cx="15" cy="20" r="9" fill="#30B750" />
    <text x="28" y="25" fill="#333333" className="font-sans font-bold text-xs">iPay</text>
  </svg>
);

const FSIBLLogo = () => (
  <svg viewBox="0 0 120 40" className="h-6 w-20">
    <rect x="5" y="10" width="20" height="20" rx="2" fill="#0F753A" />
    <text x="28" y="25" fill="#333333" className="font-sans font-bold text-[9px]">FSIBL</text>
  </svg>
);

const ModhumotiBankLogo = () => (
  <svg viewBox="0 0 120 40" className="h-6 w-20">
    <circle cx="15" cy="20" r="9" fill="#006400" />
    <text x="28" y="25" fill="#333333" className="font-sans font-bold text-[8px]">Modhumoti</text>
  </svg>
);

const WooriBankLogo = () => (
  <svg viewBox="0 0 120 40" className="h-6 w-20">
    <circle cx="15" cy="20" r="9" fill="#0A3B78" />
    <text x="28" y="25" fill="#333333" className="font-sans font-bold text-[8px]">Woori Bank</text>
  </svg>
);

export default function SSLCommerzMockPage() {
  const params = useParams();
  const router = useRouter();
  const { orderId } = params;

  const [activeTab, setActiveTab] = useState<'cards' | 'mobile' | 'net'>('cards');
  const [selectedMethod, setSelectedMethod] = useState<string>('card');
  const [submitting, setSubmitting] = useState(false);
  const [amount, setAmount] = useState('10,000.00'); // Fallback matching screenshot
  const [eventTitle, setEventTitle] = useState('');

  // Fetch actual order details
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    
    if (!token || token === "undefined" || token === "null" || !userStr || userStr === "undefined" || userStr === "null") {
      router.push("/login");
      return;
    }

    const fetchOrder = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/orders/${orderId}`);
        if (res.ok) {
          const data = await res.json();
          const amt = parseFloat(data.total_amount).toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          });
          setAmount(amt);
          if (data.event?.title) {
            setEventTitle(data.event.title);
          }
        }
      } catch (err) {
        console.error("Error fetching order details:", err);
      }
    };
    if (orderId) {
      fetchOrder();
    }
  }, [orderId, router]);

  const handlePay = async () => {
    if (!selectedMethod) {
      alert("Please select a payment method.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`http://localhost:5000/api/orders/${orderId}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentMethod: selectedMethod })
      });

      if (res.ok) {
        // Redirect to success Attendee Dashboard
        router.push('/dashboard/attendee');
      } else {
        alert('Payment failed');
        setSubmitting(false);
      }
    } catch (err) {
      console.error(err);
      alert('Payment error');
      setSubmitting(false);
    }
  };

  // Mobile grid options
  const mobileProviders = [
    { id: 'bkash', logo: BKashLogo },
    { id: 'rocket', logo: RocketLogo },
    { id: 'nagad', logo: NagadLogo },
    { id: 'cellfin', logo: CellFinLogo },
    { id: 'rocket_dbbl', logo: RocketLogo }, // Mock DBBL Mobile
    { id: 'mycash', logo: MYCashLogo },
    { id: 'upay', logo: UpayLogo },
    { id: 'ab_mobile', logo: ABBLogo },
    { id: 'tap', logo: TapLogo },
    { id: 'okwallet', logo: OkWalletLogo },
    { id: 'dmoney', logo: DmoneyLogo },
    { id: 'islamicwallet', logo: IslamicWalletLogo },
    { id: 'justpay', logo: JustPayLogo },
  ];

  // Net banking grid options
  const netProviders = [
    { id: 'ab_bank', logo: ABBLogo },
    { id: 'citytouch', logo: CitytouchLogo },
    { id: 'mtb', logo: MTBLogo },
    { id: 'bank_asia', logo: BankAsiaLogo },
    { id: 'sbi', logo: SBILogo },
    { id: 'dhaka_bank', logo: DhakaBankLogo },
    { id: 'sonali_bank', logo: SonaliBankLogo },
    { id: 'ebl_sky', logo: EBLSkyLogo },
    { id: 'prime_bank', logo: PrimeBankLogo },
    { id: 'tap_n_pay', logo: TapNPayLogo },
    { id: 'ipay', logo: IPayLogo },
    { id: 'fsibl', logo: FSIBLLogo },
    { id: 'modhumoti', logo: ModhumotiBankLogo },
    { id: 'woori', logo: WooriBankLogo },
  ];

  return (
    <div className="min-h-screen bg-[#dce4ec] flex flex-col items-center justify-center p-4 font-sans select-none">
      
      {/* Outer Card Modal container */}
      <div className="w-full max-w-[390px] bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-200 relative pt-10 flex flex-col justify-between min-h-[580px]">
        
        {/* Floating Top Logo Circle */}
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-20 bg-white rounded-full shadow-lg flex items-center justify-center border border-gray-150 z-20">
          <SSLCommerzLogo />
        </div>

        {/* Action icons in upper corners */}
        {activeTab !== 'cards' && (
          <button 
            onClick={() => {
              setActiveTab('cards');
              setSelectedMethod('card');
            }} 
            className="absolute top-3.5 left-4 text-gray-400 hover:text-gray-700 transition cursor-pointer"
            aria-label="Back"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
        )}

        <div className="absolute top-3.5 right-4 flex items-center gap-3.5 text-gray-400">
          {/* Translate Language Icon */}
          <button className="hover:text-gray-700 transition cursor-pointer" aria-label="Translate">
            <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 21l5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 016-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138A48.245 48.245 0 0012 12m-2.25 6H3.75" />
            </svg>
          </button>
          
          {/* Close cancel button */}
          <button onClick={() => router.back()} className="hover:text-gray-700 transition cursor-pointer" aria-label="Close">
            <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Merchant Info Section */}
        <div className="text-center px-4 mt-6">
          <h2 className="text-base font-bold text-gray-700 tracking-wide">Demo Merchant</h2>
          {eventTitle && (
            <p className="text-[10px] text-gray-400 font-medium truncate mt-0.5 max-w-[280px] mx-auto">
              Event: {eventTitle}
            </p>
          )}
        </div>

        {/* Action icons row (Support, FAQ, Offers, Login) */}
        <div className="grid grid-cols-4 gap-1 text-center py-3.5 px-4 mt-2">
          <div className="group cursor-pointer">
            <div className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center mx-auto text-gray-400 group-hover:bg-gray-50 group-hover:text-gray-600 transition duration-150">
              <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.5 12a8.5 8.5 0 1117 0v2.5a2.5 2.5 0 01-2.5 2.5h-1.5a1.5 1.5 0 01-1.5-1.5v-3a1.5 1.5 0 011.5-1.5h1.5a1.5 1.5 0 011.5 1.5M3.5 12a1.5 1.5 0 011.5-1.5h1.5A1.5 1.5 0 018 12v3a1.5 1.5 0 01-1.5 1.5H5a1.5 1.5 0 01-1.5-1.5V12z" />
              </svg>
            </div>
            <span className="text-[9px] font-bold text-gray-400 group-hover:text-gray-600 mt-1 block">Support</span>
          </div>

          <div className="group cursor-pointer">
            <div className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center mx-auto text-gray-400 group-hover:bg-gray-50 group-hover:text-gray-600 transition duration-150">
              <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M12 17h.008v.008H12V17z" />
              </svg>
            </div>
            <span className="text-[9px] font-bold text-gray-400 group-hover:text-gray-600 mt-1 block">FAQ</span>
          </div>

          <div className="group cursor-pointer">
            <div className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center mx-auto text-gray-400 group-hover:bg-gray-50 group-hover:text-gray-600 transition duration-150">
              <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h17.25c.621 0 1.125-.504 1.125-1.125V8.625c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
              </svg>
            </div>
            <span className="text-[9px] font-bold text-gray-400 group-hover:text-gray-600 mt-1 block">Offers</span>
          </div>

          <div className="group cursor-pointer">
            <div className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center mx-auto text-gray-400 group-hover:bg-gray-50 group-hover:text-gray-600 transition duration-150">
              <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
              </svg>
            </div>
            <span className="text-[9px] font-bold text-gray-400 group-hover:text-gray-600 mt-1 block">Login</span>
          </div>
        </div>

        {/* Tab Selection Header Bar */}
        <div className="flex w-full divide-x divide-[#2069bf] h-[38px]">
          <button 
            onClick={() => {
              setActiveTab('cards');
              setSelectedMethod('card');
            }} 
            className={`flex-1 flex items-center justify-center text-[10px] font-bold tracking-wider uppercase transition-colors duration-150 cursor-pointer ${activeTab === 'cards' ? 'bg-[#0d4a94] text-white' : 'bg-[#165ba7] text-[#b3d1ff] hover:bg-[#1a64b5] hover:text-white'}`}
          >
            CARDS
          </button>
          <button 
            onClick={() => {
              setActiveTab('mobile');
              setSelectedMethod('');
            }} 
            className={`flex-1 flex items-center justify-center text-[10px] font-bold tracking-wider uppercase transition-colors duration-150 cursor-pointer ${activeTab === 'mobile' ? 'bg-[#0d4a94] text-white' : 'bg-[#185ca9] text-[#b3d1ff] hover:bg-[#1a64b5] hover:text-white'}`}
          >
            MOBILE BANKING
          </button>
          <button 
            onClick={() => {
              setActiveTab('net');
              setSelectedMethod('');
            }} 
            className={`flex-1 flex items-center justify-center text-[10px] font-bold tracking-wider uppercase transition-colors duration-150 cursor-pointer ${activeTab === 'net' ? 'bg-[#0d4a94] text-white' : 'bg-[#185ca9] text-[#b3d1ff] hover:bg-[#1a64b5] hover:text-white'}`}
          >
            NET BANKING
          </button>
        </div>

        {/* Inner Content Area */}
        <div className="flex-1 bg-white p-4 flex flex-col justify-start">
          
          {/* TAB 1: CARDS */}
          {activeTab === 'cards' && (
            <div className="flex flex-col h-full justify-between">
              <div>
                {/* Brand Logos Row */}
                <div className="flex items-center gap-2 mb-3.5 text-[9px] font-semibold text-gray-400">
                  <span className="font-bold text-[#1a3b8b] text-[10px]">VISA</span>
                  <span className="flex items-center gap-0.5">
                    <span className="w-2 h-2 rounded-full bg-[#EB001B] inline-block"></span>
                    <span className="w-2 h-2 rounded-full bg-[#F79E1B] -ml-1 inline-block"></span>
                  </span>
                  <span className="px-1 bg-[#007cc3] text-white font-bold text-[7px] rounded-sm tracking-tight leading-normal">AMEX</span>
                  <span className="font-bold text-[#0c6b3e] text-[9.5px] italic">Nexus</span>
                  <span className="text-[#185ca9] hover:underline cursor-pointer ml-auto text-[9.5px] font-bold">Other Cards</span>
                </div>

                {/* Form Fields */}
                <div className="space-y-3">
                  {/* Card Number & EMI */}
                  <div className="flex border border-gray-300 rounded overflow-hidden h-[34px] focus-within:ring-1 focus-within:ring-[#185ca9] focus-within:border-[#185ca9]">
                    <input 
                      type="text" 
                      placeholder="Enter Card Number" 
                      defaultValue="4242 4242 4242 4242"
                      className="w-2/3 px-3 text-xs focus:outline-none placeholder-gray-300 text-gray-700 font-medium" 
                    />
                    <div className="w-1/3 bg-gray-50 border-l border-gray-300 text-gray-400 text-[10px] font-bold flex items-center justify-between px-2 cursor-not-allowed select-none">
                      <span>Avail EMI</span>
                      <svg className="w-3 h-3 text-gray-300" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                      </svg>
                    </div>
                  </div>

                  {/* MM/YY & CVC */}
                  <div className="grid grid-cols-2 gap-3">
                    <input 
                      type="text" 
                      placeholder="MM/YY" 
                      defaultValue="12/29"
                      className="border border-gray-300 rounded px-3 h-[34px] text-xs focus:outline-none focus:ring-1 focus:ring-[#185ca9] focus:border-[#185ca9] placeholder-gray-300 text-gray-700 w-full font-medium" 
                    />
                    <div className="flex border border-gray-300 rounded overflow-hidden h-[34px] focus-within:ring-1 focus-within:ring-[#185ca9] focus-within:border-[#185ca9] w-full">
                      <input 
                        type="password" 
                        placeholder="CVC/CVV" 
                        maxLength={4}
                        defaultValue="123"
                        className="w-full px-3 text-xs focus:outline-none placeholder-gray-300 text-gray-700 font-medium" 
                      />
                      <div className="flex items-center pr-2 bg-white select-none">
                        <div className="w-5 h-3.5 bg-gray-200 rounded-sm relative border border-gray-300">
                          <div className="absolute top-1 left-0 right-0 h-1 bg-gray-600"></div>
                          <div className="absolute bottom-0.5 right-0.5 w-1 h-1 rounded-full bg-red-400"></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Holder Name */}
                  <input 
                    type="text" 
                    placeholder="Card Holder Name" 
                    defaultValue="John Doe"
                    className="w-full border border-gray-300 rounded px-3 h-[34px] text-xs focus:outline-none focus:ring-1 focus:ring-[#185ca9] focus:border-[#185ca9] placeholder-gray-300 text-gray-700 font-medium" 
                  />
                </div>
              </div>

              {/* Checkbox and Agreement */}
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs text-gray-600 mb-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      defaultChecked={true}
                      className="w-3.5 h-3.5 rounded border-gray-300 text-[#185ca9] focus:ring-[#185ca9]" 
                    />
                    <span className="text-[10px] text-gray-500 font-medium">Save card & remember me</span>
                  </label>
                  <div className="text-orange-500 font-bold border border-orange-300 rounded-full w-4 h-4 flex items-center justify-center text-[10px] cursor-pointer hover:bg-orange-50 transition">
                    ?
                  </div>
                </div>

                <div className="text-[9.5px] text-gray-400 bg-gray-50 p-2.5 rounded border border-gray-150 leading-relaxed">
                  By checking this box you agree to our <span className="font-bold text-gray-500 cursor-pointer hover:underline">Terms of Service</span> which is limited to facilitating your payment to <span className="font-bold text-gray-500">Demo Merchant</span>.
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MOBILE BANKING */}
          {activeTab === 'mobile' && (
            <div className="grid grid-cols-3 border border-gray-150 rounded bg-gray-50 divide-x divide-y divide-gray-100 overflow-hidden">
              {mobileProviders.map((prov, index) => {
                const LogoComponent = prov.logo;
                const isSelected = selectedMethod === prov.id;
                return (
                  <button 
                    key={`${prov.id}-${index}`}
                    onClick={() => setSelectedMethod(prov.id)}
                    className={`h-[56px] flex items-center justify-center bg-white cursor-pointer hover:bg-gray-50 transition-all select-none focus:outline-none ${isSelected ? 'ring-2 ring-[#0d4a94] z-10 bg-blue-50/10' : ''}`}
                  >
                    <LogoComponent />
                  </button>
                );
              })}
              {/* Optional Empty cell placeholders to balance grid */}
              <div className="h-[56px] bg-white"></div>
              <div className="h-[56px] bg-white"></div>
            </div>
          )}

          {/* TAB 3: NET BANKING */}
          {activeTab === 'net' && (
            <div className="grid grid-cols-3 border border-gray-150 rounded bg-gray-50 divide-x divide-y divide-gray-100 overflow-hidden">
              {netProviders.map((prov, index) => {
                const LogoComponent = prov.logo;
                const isSelected = selectedMethod === prov.id;
                return (
                  <button 
                    key={`${prov.id}-${index}`}
                    onClick={() => setSelectedMethod(prov.id)}
                    className={`h-[56px] flex items-center justify-center bg-white cursor-pointer hover:bg-gray-50 transition-all select-none focus:outline-none ${isSelected ? 'ring-2 ring-[#0d4a94] z-10 bg-blue-50/10' : ''}`}
                  >
                    <LogoComponent />
                  </button>
                );
              })}
              {/* Empty cell to fill 3x5 grid */}
              <div className="h-[56px] bg-white"></div>
            </div>
          )}

        </div>

        {/* PAY Bottom Sticky Footer Button */}
        <button 
          onClick={handlePay}
          disabled={submitting || !selectedMethod}
          className={`w-full h-[52px] flex items-center justify-center font-bold text-xs tracking-wider uppercase border-t border-gray-200 transition-all cursor-pointer ${
            !selectedMethod 
              ? 'bg-[#eaeff5] text-gray-300 cursor-not-allowed'
              : 'bg-[#dce4ec] text-[#55697a] hover:bg-[#cbd4de] hover:text-[#384956]'
          }`}
        >
          {submitting ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4.5 w-4.5 text-gray-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              PROCESSING...
            </span>
          ) : (
            <span className="flex items-center justify-center">
              {/* Touch/Tapping Pointer Hand SVG */}
              <svg className="w-5 h-5 text-[#55697a] mr-1.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.011 12H18a3 3 0 003-3V6a3 3 0 00-3-3H6.002a3 3 0 00-3 3v3a3 3 0 003 3h3.011M12 12v9m0 0l-3-3m3 3l3-3" />
              </svg>
              PAY {amount} BDT
            </span>
          )}
        </button>

      </div>

      {/* SSLCommerz Brand Tag below the modal */}
      <button 
        onClick={() => window.open("https://sslcommerz.com", "_blank")}
        className="bg-[#002f6c] hover:bg-[#00224d] text-white font-bold tracking-widest text-[9.5px] uppercase py-1.5 px-6 rounded-md shadow-md mt-5 transition-all cursor-pointer flex items-center justify-center h-8"
      >
        sslcommerz
      </button>
      
    </div>
  );
}
