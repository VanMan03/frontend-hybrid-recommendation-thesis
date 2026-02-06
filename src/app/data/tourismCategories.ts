// DOT Tourism Product Portfolios of the Philippines

export const tourismCategories = {
  'Nature Tourism': [
    'Eco-Tours',
    'Wilderness Trekking',
    'Volcanic Sites',
    'Caves & Canyons',
  ],
  'Cultural Tourism': [
    'Heritage Tours',
    'Food Tourism',
    'Festival & Events',
    'Arts & Crafts',
  ],
  'Sun and Beach Tourism': [
    'Island Hopping',
    'Beach & Resorts',
    'Surfing & Skimboarding',
    'Coastal Relaxation',
  ],
  'Cruise and Nautical Tourism': [
    'Luxury Cruises',
    'Yachting & Sailing',
    'Ferry Travel',
    'Water Taxi',
  ],
  'Leisure and Entertainment Tourism': [
    'Theme Parks',
    'Nightlife & Bars',
    'Shopping & Retail',
    'Casinos',
  ],
  'Diving and Marine Sports Tourism': [
    'Scuba Diving',
    'Snorkeling',
    'Wreck Diving',
    'Freediving',
  ],
  'Health, Wellness, and Retirement Tourism': [
    'Spa & Retreats',
    'Medical Tourism',
    'Retirement Villages',
    'Beauty & Anti-Aging',
  ],
  'MICE and Events Tourism': [
    'Conventions',
    'Corporate Meetings',
    'Incentives & Team Building',
    'Exhibition',
  ],
  'Education Tourism': [
    'Study Tours',
    'Historical Site Learning',
    'Culinary School',
    'Language Immersion',
  ],
};

export type MainCategory = keyof typeof tourismCategories;
export type SubCategory = typeof tourismCategories[MainCategory][number];

export const getCategoryColor = (category: MainCategory): string => {
  const colors: Record<MainCategory, string> = {
    'Nature Tourism': 'bg-green-100 text-green-700',
    'Cultural Tourism': 'bg-purple-100 text-purple-700',
    'Sun and Beach Tourism': 'bg-blue-100 text-blue-700',
    'Cruise and Nautical Tourism': 'bg-cyan-100 text-cyan-700',
    'Leisure and Entertainment Tourism': 'bg-pink-100 text-pink-700',
    'Diving and Marine Sports Tourism': 'bg-teal-100 text-teal-700',
    'Health, Wellness, and Retirement Tourism': 'bg-emerald-100 text-emerald-700',
    'MICE and Events Tourism': 'bg-indigo-100 text-indigo-700',
    'Education Tourism': 'bg-amber-100 text-amber-700',
  };
  return colors[category] || 'bg-gray-100 text-gray-700';
};
