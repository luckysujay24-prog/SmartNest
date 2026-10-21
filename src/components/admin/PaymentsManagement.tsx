import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input, Select } from '../ui/Input';
import { StatusBadge } from '../ui/Badge';
import { ReceiptModal } from '../common/ReceiptModal';
import { storage } from '../../services/storage';
import { Payment, Bill, User } from '../../types';
import { CreditCard, Search, Download, ExternalLink, Printer } from 'lucide-react';

export const PaymentsManagement: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Receipt Modal State
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  const refresh = () => {
    setPayments(storage.getPayments());
    setBills(storage.getBills());
    setUsers(storage.getUsers());
  };

  useEffect(() => {
    refresh();
    const unsub = storage.subscribe(refresh);
    return () => unsub();
  }, []);

  const filteredPayments = payments.filter((p) => {
    const bill = bills.find((b) => b.id === p.bill_id);
    // Privacy boundary: Admins do not reconcile private tenant-to-owner rent
    if (bill && bill.bill_type === 'RENT') return false;

    const user = users.find((u) => u.id === p.user_id);

    const matchesSearch =
      p.transaction_id.toLowerCase().includes(search.toLowerCase()) ||
      (bill?.title && bill.title.toLowerCase().includes(search.toLowerCase())) ||
      (user?.name && user.name.toLowerCase().includes(search.toLowerCase())) ||
      p.payment_provider.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = selectedStatus === 'ALL' || p.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  const handleExportCSV = () => {
    const headers = ['Transaction ID', 'Bill Title', 'Resident', 'Amount (INR)', 'Payment Method', 'Date', 'Status'];
    const rows = filteredPayments.map((p) => {
      const bill = bills.find((b) => b.id === p.bill_id);
      const user = users.find((u) => u.id === p.user_id);
      return [
        p.transaction_id,
        `"${bill?.title || 'Bill'}"`,
        `"${user?.name || 'Resident'}"`,
        p.amount,
        `"${p.payment_method_title || p.payment_provider}"`,
        p.payment_date ? new Date(p.payment_date).toLocaleDateString() : '',
        p.status,
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `smartnest_society_payments_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Society Payments & Escrow Ledger</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Auditable digital transaction log of all verified society maintenance, utility, and shared fund collections.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          leftIcon={<Download className="w-4 h-4" />}
          onClick={handleExportCSV}
        >
          Export CSV Report
        </Button>
      </div>

      {/* Filter Bar */}
      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            placeholder="Search transaction ID, resident, or bill..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
          <Select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
            <option value="ALL">All Payment Statuses</option>
            <option value="SUCCESS">Success / Settled</option>
            <option value="PENDING">Pending Settlement</option>
            <option value="FAILED">Failed / Refunded</option>
          </Select>
        </div>
      </Card>

      {/* Payments Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Transaction ID</th>
                <th className="px-4 py-3">Bill Item</th>
                <th className="px-4 py-3">Payer / Resident</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Channel / Gateway</th>
                <th className="px-4 py-3">Settlement Date</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No payment transactions recorded.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p) => {
                  const bill = bills.find((b) => b.id === p.bill_id);
                  const user = users.find((u) => u.id === p.user_id);
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-slate-800">
                        {p.transaction_id}
                      </td>

                      <td className="px-4 py-3">
                        <span className="font-semibold text-slate-900 block">{bill?.title || 'Residential Fee'}</span>
                        <span className="text-[11px] text-slate-400">Ref: {p.bill_id.slice(-8)}</span>
                      </td>

                      <td className="px-4 py-3">
                        <span className="font-medium text-slate-800">{user?.name || 'Resident'}</span>
                        <span className="text-[10px] text-slate-400 block">{user?.email}</span>
                      </td>

                      <td className="px-4 py-3 font-bold text-slate-900 text-sm">
                        ₹{p.amount.toLocaleString('en-IN')}
                      </td>

                      <td className="px-4 py-3 text-slate-700">
                        {p.payment_method_title || p.payment_provider}
                      </td>

                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                        {p.payment_date
                          ? new Date(p.payment_date).toLocaleDateString('en-IN', {
                              dateStyle: 'medium',
                            })
                          : 'Pending'}
                      </td>

                      <td className="px-4 py-3">
                        <StatusBadge status={p.status} />
                      </td>

                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => {
                            setSelectedPayment(p);
                            setIsReceiptOpen(true);
                          }}
                          className="text-xs text-blue-600 font-semibold hover:underline inline-flex items-center gap-1"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Receipt</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Printable Receipt Modal */}
      <ReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        payment={selectedPayment}
      />
    </div>
  );
};
