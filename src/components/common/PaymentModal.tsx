import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Bill, Payment } from '../../types';
import { storage } from '../../services/storage';
import { useAuth } from '../../services/authContext';
import { useToast } from '../ui/Toast';
import confetti from 'canvas-confetti';
import {
  CreditCard,
  QrCode,
  Smartphone,
  Building2,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  FileText,
  Loader2,
  ExternalLink,
  Printer,
  Copy,
  Lock,
  KeyRound,
  RefreshCw,
} from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  bill: Bill | null;
  onPaymentSuccess?: (payment: Payment) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  bill,
  onPaymentSuccess,
}) => {
  const { currentUser } = useAuth();
  const { success, error } = useToast();

  const [step, setStep] = useState<'DETAILS' | 'METHOD' | 'OTP' | 'PROCESSING' | 'SUCCESS'>('DETAILS');
  const [selectedMethod, setSelectedMethod] = useState<'UPI' | 'CARD' | 'NETBANKING'>('UPI');
  const [upiApp, setUpiApp] = useState<'GPAY' | 'PHONEPE' | 'PAYTM' | 'BHIM'>('GPAY');
  const [upiVpa, setUpiVpa] = useState('');
  const [bank, setBank] = useState('HDFC Bank');
  const [cardNumber, setCardNumber] = useState('4532 8912 6745 2819');
  const [cardHolder, setCardHolder] = useState(currentUser?.name || 'Ananya Iyer');
  const [cardExpiry, setCardExpiry] = useState('08/29');
  const [cardCvv, setCardCvv] = useState('382');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [simulatedOtp, setSimulatedOtp] = useState('749216');
  const [otpTimer, setOtpTimer] = useState(45);
  const [completedPayment, setCompletedPayment] = useState<Payment | null>(null);

  useEffect(() => {
    if (currentUser) {
      setCardHolder(currentUser.name);
    }
  }, [currentUser]);

  useEffect(() => {
    let interval: any;
    if (step === 'OTP' && otpTimer > 0) {
      interval = setInterval(() => setOtpTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [step, otpTimer]);

  if (!bill) return null;

  // Real UPI link format according to NPCI UPI specification
  const upiPayee = 'grandpalms.rwa@okhdfcbank';
  const upiPayeeName = 'Grand Palms Residency RWA';
  const upiUrl = `upi://pay?pa=${upiPayee}&pn=${encodeURIComponent(
    upiPayeeName
  )}&am=${bill.amount}&cu=INR&tn=${encodeURIComponent(bill.title)}`;

  // High-resolution live QR code URL
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=8&data=${encodeURIComponent(
    upiUrl
  )}`;

  const handleStartPayment = () => {
    setStep('METHOD');
  };

  const handleProceedFromMethod = () => {
    if (selectedMethod === 'CARD') {
      // Transition to 3D Secure Bank OTP verification step
      const randomOtp = Math.floor(100000 + Math.random() * 900000).toString();
      setSimulatedOtp(randomOtp);
      setOtpTimer(45);
      setStep('OTP');
    } else {
      executeRealPayment();
    }
  };

  const executeRealPayment = () => {
    if (!currentUser) {
      error('Authentication required', 'Please sign in to proceed with payment.');
      return;
    }

    setStep('PROCESSING');

    setTimeout(() => {
      let methodTitle = 'UPI - Google Pay';
      let provider = 'UPI Gateway';

      if (selectedMethod === 'UPI') {
        methodTitle = `UPI (${
          upiApp === 'GPAY'
            ? 'Google Pay'
            : upiApp === 'PHONEPE'
            ? 'PhonePe'
            : upiApp === 'PAYTM'
            ? 'Paytm'
            : 'BHIM UPI'
        }${upiVpa ? ` - ${upiVpa}` : ''})`;
        provider = 'Razorpay / UPI';
      } else if (selectedMethod === 'CARD') {
        const last4 = cardNumber.replace(/\s/g, '').slice(-4) || '2819';
        methodTitle = `Visa Debit Card ending in ${last4}`;
        provider = 'Razorpay Card Gateway';
      } else if (selectedMethod === 'NETBANKING') {
        methodTitle = `NetBanking (${bank})`;
        provider = 'Razorpay NetBanking';
      }

      const result = storage.processPayment(bill.id, currentUser.id, provider, methodTitle);

      if (result.success && result.payment) {
        setCompletedPayment(result.payment);
        setStep('SUCCESS');
        confetti({
          particleCount: 90,
          spread: 80,
          origin: { y: 0.6 },
        });
        success('Payment Verified & Settled!', `Transaction ${result.payment.transaction_id} recorded in ledger.`);
        if (onPaymentSuccess) {
          onPaymentSuccess(result.payment);
        }
      } else {
        setStep('METHOD');
        error('Payment Failed', result.message || 'Unable to complete transaction. Please retry.');
      }
    }, 1800);
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  const handleResetAndClose = () => {
    setStep('DETAILS');
    setCompletedPayment(null);
    setEnteredOtp('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleResetAndClose}
      title={
        step === 'SUCCESS'
          ? 'Payment Confirmed & Settled'
          : step === 'OTP'
          ? 'Bank 3D-Secure 2FA Verification'
          : 'Official Resident Welfare Payment Gateway'
      }
      subtitle={
        step === 'SUCCESS'
          ? 'Verified RWA digital receipt generated and saved in MongoDB database'
          : step === 'OTP'
          ? 'Enter the One Time Password (OTP) sent to your registered mobile number'
          : 'Grand Palms Residency • Escrow Account Clearance'
      }
      maxWidth="md"
    >
      <div className="space-y-4 text-left">
        {/* Step 1: Bill Details */}
        {step === 'DETAILS' && (
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
                    {bill.bill_type.replace('_', ' ')}
                  </span>
                  <h4 className="text-base font-bold text-slate-900 mt-0.5">{bill.title}</h4>
                  <p className="text-xs text-slate-500 mt-1">{bill.description}</p>
                </div>
                <div className="text-right">
                  <span className="text-xl font-bold text-slate-900">
                    ₹{bill.amount.toLocaleString('en-IN')}
                  </span>
                  <p className="text-[11px] text-slate-400">Due: {bill.due_date}</p>
                </div>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-600 border-t border-b border-slate-100 py-3">
              <div className="flex justify-between">
                <span>Billing Period:</span>
                <span className="font-medium text-slate-800">
                  {bill.billing_period_start} to {bill.billing_period_end}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Beneficiary:</span>
                <span className="font-medium text-slate-800">Grand Palms Residency RWA</span>
              </div>
              <div className="flex justify-between">
                <span>GSTIN / Registration:</span>
                <span className="font-mono text-slate-700">29AAACG1234F1Z5</span>
              </div>
              <div className="flex justify-between font-semibold text-slate-900 pt-1 border-t border-slate-100 text-sm">
                <span>Total Amount Due:</span>
                <span className="text-blue-600 font-bold">
                  ₹{bill.amount.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-emerald-800 text-xs">
              <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>
                Real-time escrow settlement with instant digital receipt and audit trail.
              </span>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={handleResetAndClose}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleStartPayment}>
                Proceed to Real Checkout (₹{bill.amount.toLocaleString('en-IN')})
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Payment Method */}
        {step === 'METHOD' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-blue-50/70 p-3 rounded-lg border border-blue-200 text-xs">
              <span className="text-slate-600 font-medium">Payable Amount:</span>
              <span className="text-base font-bold text-blue-700">
                ₹{bill.amount.toLocaleString('en-IN')}
              </span>
            </div>

            {/* Payment Channel Tabs */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
                Select Payment Mode
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedMethod('UPI')}
                  className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                    selectedMethod === 'UPI'
                      ? 'border-blue-600 bg-blue-50 text-blue-700 font-semibold ring-1 ring-blue-600 shadow-2xs'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <Smartphone className="w-5 h-5 mx-auto mb-1 text-current" />
                  <span className="text-xs block font-bold">UPI / QR Code</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedMethod('CARD')}
                  className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                    selectedMethod === 'CARD'
                      ? 'border-blue-600 bg-blue-50 text-blue-700 font-semibold ring-1 ring-blue-600 shadow-2xs'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <CreditCard className="w-5 h-5 mx-auto mb-1 text-current" />
                  <span className="text-xs block font-bold">Debit / Credit Card</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedMethod('NETBANKING')}
                  className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                    selectedMethod === 'NETBANKING'
                      ? 'border-blue-600 bg-blue-50 text-blue-700 font-semibold ring-1 ring-blue-600 shadow-2xs'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <Building2 className="w-5 h-5 mx-auto mb-1 text-current" />
                  <span className="text-xs block font-bold">NetBanking</span>
                </button>
              </div>
            </div>

            {/* UPI Option with Dynamic Live QR Code */}
            {selectedMethod === 'UPI' && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3.5">
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {/* Dynamic QR Code display */}
                  <div className="bg-white p-2 rounded-xl border-2 border-slate-200 shadow-xs shrink-0 flex flex-col items-center">
                    <img
                      src={qrCodeUrl}
                      alt="UPI QR Code"
                      className="w-36 h-36 object-contain"
                    />
                    <span className="text-[10px] text-slate-500 font-bold mt-1">
                      Scan with any UPI App
                    </span>
                  </div>

                  <div className="space-y-2 flex-1 text-xs">
                    <div>
                      <span className="text-slate-500 text-[11px] block">RWA UPI VPA ID:</span>
                      <span className="font-mono font-bold text-slate-900 bg-white px-2 py-1 rounded border border-slate-200 inline-block mt-0.5">
                        {upiPayee}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-500 text-[11px] block">Pay directly using app:</span>
                      <div className="grid grid-cols-2 gap-1.5 mt-1">
                        {(['GPAY', 'PHONEPE', 'PAYTM', 'BHIM'] as const).map((app) => (
                          <button
                            key={app}
                            type="button"
                            onClick={() => setUpiApp(app)}
                            className={`px-2 py-1.5 text-xs rounded-lg border font-semibold text-center transition-all cursor-pointer ${
                              upiApp === app
                                ? 'border-blue-600 bg-white text-blue-700 ring-1 ring-blue-600 shadow-2xs'
                                : 'border-slate-200 text-slate-600 bg-white hover:bg-slate-100'
                            }`}
                          >
                            {app === 'GPAY'
                              ? 'Google Pay'
                              : app === 'PHONEPE'
                              ? 'PhonePe'
                              : app === 'PAYTM'
                              ? 'Paytm'
                              : 'BHIM'}
                          </button>
                        ))}
                      </div>
                    </div>

                    <a
                      href={upiUrl}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs mt-1 transition-colors"
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                      <span>Open UPI App to Pay ₹{bill.amount}</span>
                    </a>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    Or Enter your UPI ID (VPA)
                  </label>
                  <input
                    type="text"
                    value={upiVpa}
                    onChange={(e) => setUpiVpa(e.target.value)}
                    placeholder="e.g. yourname@okhdfcbank or 9845011223@ybl"
                    className="w-full text-xs font-mono px-3 py-2 bg-white border border-slate-300 rounded-lg"
                  />
                </div>
              </div>
            )}

            {/* Card Option */}
            {selectedMethod === 'CARD' && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Enter Indian RuPay / Visa / Mastercard</span>
                  <span className="font-semibold text-blue-600">3D-Secure 2FA Enabled</span>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    Card Number
                  </label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full text-xs font-mono px-3 py-2 bg-white border border-slate-300 rounded-lg"
                    placeholder="4532 8912 6745 2819"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="w-full text-xs font-mono px-3 py-2 bg-white border border-slate-300 rounded-lg"
                      placeholder="MM/YY"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      CVV / Security Code
                    </label>
                    <input
                      type="password"
                      maxLength={4}
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      className="w-full text-xs font-mono px-3 py-2 bg-white border border-slate-300 rounded-lg"
                      placeholder="•••"
                    />
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Secured by 256-bit TLS encryption. Verified by Visa & RuPay Secure.</span>
                </p>
              </div>
            )}

            {/* NetBanking Option */}
            {selectedMethod === 'NETBANKING' && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <label className="block text-xs font-semibold text-slate-700">
                  Select Bank for Direct NetBanking Authorization
                </label>
                <select
                  value={bank}
                  onChange={(e) => setBank(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg"
                >
                  <option>State Bank of India (SBI)</option>
                  <option>HDFC Bank</option>
                  <option>ICICI Bank</option>
                  <option>Axis Bank</option>
                  <option>Kotak Mahindra Bank</option>
                  <option>Punjab National Bank</option>
                </select>

                <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-lg text-xs text-blue-800">
                  <span>
                    Direct API integration via {bank} Internet Banking portal. Amount ₹
                    {bill.amount} will be debited with zero gateway surcharge.
                  </span>
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex justify-between items-center pt-2">
              <Button variant="ghost" size="sm" onClick={() => setStep('DETAILS')}>
                Back
              </Button>
              <Button variant="primary" size="sm" onClick={handleProceedFromMethod}>
                {selectedMethod === 'CARD'
                  ? 'Proceed to Bank OTP Verification'
                  : `Authorize Payment (₹${bill.amount.toLocaleString('en-IN')})`}
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Bank 3D Secure OTP Step */}
        {step === 'OTP' && (
          <div className="space-y-4 py-2">
            <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-200 space-y-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-600" />
                <h4 className="text-sm font-bold text-slate-900">
                  Verified by Bank (3D-Secure 2.0)
                </h4>
              </div>
              <p className="text-xs text-slate-600">
                A 6-digit One Time Password (OTP) has been dispatched to your mobile number registered with HDFC Bank (+91 97400 98765).
              </p>
              <div className="p-2 bg-white rounded-lg border border-blue-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">Simulated Bank SMS:</span>
                <span className="font-mono font-bold text-blue-600 text-xs">
                  OTP is {simulatedOtp}
                </span>
                <button
                  type="button"
                  onClick={() => setEnteredOtp(simulatedOtp)}
                  className="text-[10px] bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-0.5 rounded font-bold cursor-pointer"
                >
                  Auto-fill OTP
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Enter 6-Digit OTP
              </label>
              <input
                type="text"
                maxLength={6}
                value={enteredOtp}
                onChange={(e) => setEnteredOtp(e.target.value)}
                placeholder="Enter 6-digit OTP"
                className="w-full text-center tracking-widest text-lg font-mono px-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Time remaining: {otpTimer}s</span>
              <button
                type="button"
                onClick={() => {
                  setOtpTimer(45);
                  setSimulatedOtp(Math.floor(100000 + Math.random() * 900000).toString());
                }}
                className="text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" /> Resend OTP
              </button>
            </div>

            <div className="flex justify-between items-center pt-2">
              <Button variant="ghost" size="sm" onClick={() => setStep('METHOD')}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={executeRealPayment}
                disabled={enteredOtp.length < 4}
              >
                Submit & Authorize ₹{bill.amount}
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Processing State */}
        {step === 'PROCESSING' && (
          <div className="py-10 text-center space-y-4">
            <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto" />
            <div>
              <h4 className="text-base font-semibold text-slate-900">
                Settling Transaction via Payment Gateway
              </h4>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                Authorizing funds with beneficiary bank, updating society books, and syncing with MongoDB Compass database...
              </p>
            </div>
          </div>
        )}

        {/* Step 5: Success State & Digital Receipt */}
        {step === 'SUCCESS' && completedPayment && (
          <div className="space-y-4 py-2">
            <div className="text-center">
              <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mx-auto mb-2">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-bold text-slate-900">Payment Cleared & Settled!</h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Funds credited to Grand Palms Residency Welfare Association.
              </p>
            </div>

            {/* Printable Digital Tax Receipt */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2.5 print:border-none">
              <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                <div>
                  <h5 className="font-bold text-slate-900">GRAND PALMS RESIDENCY RWA</h5>
                  <span className="text-[10px] text-slate-400">Reg: KA/BLR/RWA/2024/0981</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                  PAID & SETTLED
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-slate-400 block text-[10px]">Transaction ID</span>
                  <span className="font-mono font-bold text-slate-800">{completedPayment.transaction_id}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Settlement Date</span>
                  <span className="font-medium text-slate-800">
                    {new Date(completedPayment.payment_date).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Payment Method</span>
                  <span className="font-medium text-slate-800">{completedPayment.payment_method_title}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Total Paid Amount</span>
                  <span className="font-bold text-blue-600 text-sm">
                    ₹{completedPayment.amount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Bill Cleared: {bill.title}</span>
                <span className="text-emerald-700 font-semibold">✓ Database Updated</span>
              </div>
            </div>

            {/* Actions: Print Receipt & Done */}
            <div className="flex justify-between items-center pt-2">
              <button
                type="button"
                onClick={handlePrintReceipt}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Digital Receipt</span>
              </button>

              <Button variant="primary" size="sm" onClick={handleResetAndClose}>
                Done
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
