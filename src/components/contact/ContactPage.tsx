import { useState } from 'react';
import { Send, CheckCircle, AlertCircle, CreditCard, Building2, User, Mail, MessageSquare } from 'lucide-react';

interface FormData {
  name: string;
  email: string;
  cardName: string;
  bankName: string;
  additionalInfo: string;
}

interface FormStatus {
  type: 'idle' | 'loading' | 'success' | 'error';
  message: string;
}

export function ContactPage() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    cardName: '',
    bankName: '',
    additionalInfo: '',
  });
  const [status, setStatus] = useState<FormStatus>({ type: 'idle', message: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ type: 'loading', message: '' });

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          access_key: import.meta.env.VITE_WEB3FORMS_KEY,
          subject: `Card Request: ${formData.cardName} - ${formData.bankName}`,
          from_name: 'CardCompare Contact Form',
          to: 'aayushostwal99@gmail.com',
          name: formData.name,
          email: formData.email,
          card_name: formData.cardName,
          bank_name: formData.bankName,
          additional_info: formData.additionalInfo,
          message: `
Card Request Details:
--------------------
Name: ${formData.name}
Email: ${formData.email}
Card Name: ${formData.cardName}
Bank Name: ${formData.bankName}
Additional Information: ${formData.additionalInfo || 'None provided'}
          `.trim(),
        }),
      });

      const result = await response.json();

      if (result.success) {
        setStatus({
          type: 'success',
          message: 'Thank you! Your request has been submitted. We\'ll add this card soon.',
        });
        setFormData({
          name: '',
          email: '',
          cardName: '',
          bankName: '',
          additionalInfo: '',
        });
      } else {
        throw new Error(result.message || 'Something went wrong');
      }
    } catch (error) {
      setStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to submit. Please try again.',
      });
    }
  };

  const banks = [
    'HDFC Bank',
    'ICICI Bank',
    'SBI',
    'Axis Bank',
    'Kotak Mahindra Bank',
    'American Express',
    'Yes Bank',
    'IndusInd Bank',
    'RBL Bank',
    'IDFC First Bank',
    'Standard Chartered',
    'Citibank',
    'HSBC',
    'Other',
  ];

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg mb-4">
          <CreditCard className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
          Can't Find Your Card?
        </h2>
        <p className="text-slate-600 max-w-md mx-auto">
          Let us know which credit card you'd like us to add. We'll research and include it in our comparison database.
        </p>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
        {status.type === 'success' ? (
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">Request Submitted!</h3>
            <p className="text-slate-600 mb-6">{status.message}</p>
            <button
              onClick={() => setStatus({ type: 'idle', message: '' })}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Submit another request
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Field */}
            <div>
              <label htmlFor="name" className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1.5">
                <User className="w-4 h-4 text-slate-400" />
                Your Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="John Doe"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
              />
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1.5">
                <Mail className="w-4 h-4 text-slate-400" />
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="john@example.com"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
              />
            </div>

            {/* Bank Name Field */}
            <div>
              <label htmlFor="bankName" className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1.5">
                <Building2 className="w-4 h-4 text-slate-400" />
                Bank / Card Issuer
              </label>
              <select
                id="bankName"
                name="bankName"
                value={formData.bankName}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors bg-white"
              >
                <option value="">Select a bank</option>
                {banks.map(bank => (
                  <option key={bank} value={bank}>{bank}</option>
                ))}
              </select>
            </div>

            {/* Card Name Field */}
            <div>
              <label htmlFor="cardName" className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1.5">
                <CreditCard className="w-4 h-4 text-slate-400" />
                Credit Card Name
              </label>
              <input
                type="text"
                id="cardName"
                name="cardName"
                value={formData.cardName}
                onChange={handleChange}
                required
                placeholder="e.g., HDFC Infinia, SBI Elite"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
              />
            </div>

            {/* Additional Info Field */}
            <div>
              <label htmlFor="additionalInfo" className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1.5">
                <MessageSquare className="w-4 h-4 text-slate-400" />
                Additional Information <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <textarea
                id="additionalInfo"
                name="additionalInfo"
                value={formData.additionalInfo}
                onChange={handleChange}
                rows={3}
                placeholder="Any specific features or details you'd like us to include..."
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors resize-none"
              />
            </div>

            {/* Error Message */}
            {status.type === 'error' && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {status.message}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={status.type === 'loading'}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {status.type === 'loading' ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Submit Request
                </>
              )}
            </button>
          </form>
        )}
      </div>

      {/* Info Note */}
      <p className="text-center text-sm text-slate-500 mt-6">
        We typically add new cards within 24-48 hours of receiving a request.
      </p>
    </div>
  );
}
