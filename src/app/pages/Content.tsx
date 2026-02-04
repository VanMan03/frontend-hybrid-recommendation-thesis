import { Save, Edit } from 'lucide-react';

type ContentItem = {
  id: number;
  destination: string;
  description: string;
  culturalNotes: string;
  sustainabilityReminder: string;
};

const contentManagement: ContentItem[] = [];

export function Content() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Content Management</h1>
        <p className="text-gray-600 mt-1">Edit destination descriptions, cultural notes, and sustainability reminders</p>
      </div>

      {/* Content Forms */}
      <div className="space-y-6">
        {contentManagement.map((content) => (
          <div key={content.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">{content.destination}</h2>
              <button className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors">
                <Save className="size-4" />
                Save Changes
              </button>
            </div>

            <div className="space-y-6">
              {/* Description */}
              <div>
                <label className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-700">Destination Description</span>
                  <button className="p-1 hover:bg-gray-100 rounded">
                    <Edit className="size-4 text-gray-500" />
                  </button>
                </label>
                <textarea
                  defaultValue={content.description}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                />
              </div>

              {/* Cultural Notes */}
              <div>
                <label className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-700">Cultural Notes</span>
                  <button className="p-1 hover:bg-gray-100 rounded">
                    <Edit className="size-4 text-gray-500" />
                  </button>
                </label>
                <textarea
                  defaultValue={content.culturalNotes}
                  rows={2}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none bg-blue-50 border-blue-200"
                />
                <p className="mt-1 text-xs text-gray-600">Important cultural information for visitors</p>
              </div>

              {/* Sustainability Reminder */}
              <div>
                <label className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-700">Sustainability Reminder</span>
                  <button className="p-1 hover:bg-gray-100 rounded">
                    <Edit className="size-4 text-gray-500" />
                  </button>
                </label>
                <textarea
                  defaultValue={content.sustainabilityReminder}
                  rows={2}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none bg-green-50 border-green-200"
                />
                <p className="mt-1 text-xs text-gray-600">Environmental and sustainability guidelines</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Help Section */}
      <div className="bg-gradient-to-br from-teal-50 to-blue-50 rounded-xl border border-teal-200 p-6">
        <h3 className="font-bold text-gray-900 mb-2">Content Guidelines</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>• Keep descriptions concise and informative (100-200 words recommended)</li>
          <li>• Cultural notes should highlight important local customs and etiquette</li>
          <li>• Sustainability reminders should promote responsible tourism practices</li>
          <li>• All content should be written in a welcoming and respectful tone</li>
          <li>• Review content regularly to ensure accuracy and relevance</li>
        </ul>
      </div>
    </div>
  );
}
