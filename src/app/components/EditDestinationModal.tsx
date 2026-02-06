import { useState } from 'react';
import { X, Save } from 'lucide-react';

interface EditDestinationModalProps {
  isOpen: boolean;
  onClose: () => void;
  destination: {
    id: number;
    name: string;
    entryFee: string;
    duration: string;
    accessibility: string;
    status: string;
  };
  onSave: (destinationId: number, updates: {
    name: string;
    entryFee: string;
    duration: string;
    accessibility: string;
    status: string;
  }) => void;
}

// Helper function to parse entry fee string to number
const parseEntryFee = (feeStr: string): number | null => {
  const numStr = feeStr.replace(/₱|,/g, '').trim();
  if (!numStr || numStr === 'TBD') return null;
  const num = parseFloat(numStr);
  return isNaN(num) ? null : num;
};

// Helper function to parse duration string to value and unit
const parseDuration = (durationStr: string): { value: number | null; unit: string } => {
  if (!durationStr || durationStr === 'TBD') return { value: null, unit: 'hours' };
  const match = durationStr.match(/^(\d+)\s*(hours?|days?)$/i);
  if (match) {
    const value = parseInt(match[1], 10);
    const unit = match[2].toLowerCase().startsWith('day') ? 'days' : 'hours';
    return { value, unit };
  }
  return { value: null, unit: 'hours' };
};

export function EditDestinationModal({ isOpen, onClose, destination, onSave }: EditDestinationModalProps) {
  const parsedFee = parseEntryFee(destination.entryFee);
  const parsedDuration = parseDuration(destination.duration);

  const [formData, setFormData] = useState({
    name: destination.name,
    entryFeeValue: parsedFee,
    durationValue: parsedDuration.value,
    durationUnit: parsedDuration.unit,
    accessibility: destination.accessibility,
    status: destination.status,
  });

  if (!isOpen) return null;

  const handleSave = () => {
    if (!formData.name.trim()) {
      alert('Please enter a destination name');
      return;
    }

    // Format numeric-backed fields into strings for storage
    const entryFee = formData.entryFeeValue == null ? 'TBD' : `₱${formData.entryFeeValue.toFixed(2)}`;
    const duration = formData.durationValue == null ? 'TBD' : `${formData.durationValue} ${formData.durationUnit}`;

    onSave(destination.id, {
      name: formData.name,
      entryFee,
      duration,
      accessibility: formData.accessibility,
      status: formData.status,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Edit Destination</h2>
            <p className="text-sm text-gray-600 mt-1">{destination.name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="size-5 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Destination Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Destination Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter destination name"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>

          {/* Entry Fee and Duration */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Entry Fee (₱)
              </label>
              <input
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                value={formData.entryFeeValue ?? ''}
                onChange={(e) => setFormData({ ...formData, entryFeeValue: e.target.value === '' ? null : parseFloat(e.target.value) })}
                placeholder="0.00"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Duration
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="1"
                  min="0"
                  value={formData.durationValue ?? ''}
                  onChange={(e) => setFormData({ ...formData, durationValue: e.target.value === '' ? null : parseInt(e.target.value, 10) })}
                  placeholder="e.g., 2"
                  className="w-1/2 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
                <select
                  value={formData.durationUnit}
                  onChange={(e) => setFormData({ ...formData, durationUnit: e.target.value })}
                  className="w-1/2 px-3 py-2.5 border border-gray-300 rounded-lg bg-white"
                >
                  <option value="hours">hours</option>
                  <option value="days">days</option>
                </select>
              </div>
            </div>
          </div>

          {/* Accessibility */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Accessibility <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              {['Easy Access', 'Moderate', 'Limited'].map((option) => (
                <button
                  key={option}
                  onClick={() => setFormData({ ...formData, accessibility: option })}
                  className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                    formData.accessibility === option
                      ? 'border-teal-600 bg-teal-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <span className={`text-sm font-medium ${
                    formData.accessibility === option ? 'text-teal-900' : 'text-gray-900'
                  }`}>
                    {option}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Status <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              {['Active', 'Inactive'].map((option) => (
                <button
                  key={option}
                  onClick={() => setFormData({ ...formData, status: option })}
                  className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                    formData.status === option
                      ? 'border-teal-600 bg-teal-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <span className={`text-sm font-medium ${
                    formData.status === option ? 'text-teal-900' : 'text-gray-900'
                  }`}>
                    {option}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50 sticky bottom-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium"
          >
            <Save className="size-4" />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
