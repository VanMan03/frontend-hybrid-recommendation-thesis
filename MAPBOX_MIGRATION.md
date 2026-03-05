# Mapbox Migration Guide

## Overview
This document outlines the migration from OpenRoute/Leaflet to Mapbox GL JS for the destination location selection feature in the admin frontend.

## Changes Made

### 1. Dependencies
- Added `mapbox-gl` and `@types/mapbox-gl` to package.json
- Added Mapbox CSS import to `src/styles/index.css`

### 2. LocationMap Component (`src/app/components/LocationMap.tsx`)
- Replaced Leaflet with Mapbox GL JS
- Maintained the same component interface for backward compatibility
- Added interactive features:
  - Click to place marker
  - Drag marker to adjust location
  - Navigation controls for interactive maps
  - Fullscreen control
- Uses environment variable `VITE_MAPBOX_ACCESS_TOKEN` for authentication

### 3. AddDestinationModal Component (`src/app/components/AddDestinationModal.tsx`)
- Updated geocoding to use Mapbox Geocoding API
- Added location search functionality with autocomplete
- Maintains same payload structure for backend compatibility

### 4. New Features
- **Search by Location Name**: Users can now search for locations by name using Mapbox Geocoding API
- **Better UX**: Improved map interactions with smooth animations and better controls
- **Draggable Markers**: Admins can drag markers to fine-tune location placement

## Environment Setup

1. Create a `.env` file in the project root (if it doesn't exist)
2. Add your Mapbox access token:
   ```
   VITE_MAPBOX_ACCESS_TOKEN=your_actual_mapbox_token_here
   ```

3. Get your Mapbox access token from: https://account.mapbox.com/access-tokens/

**Important**: The application will throw an error if the Mapbox access token is not properly configured in the `.env` file.

## Payload Compatibility

The migration maintains full compatibility with the existing backend payload structure:

```typescript
{
  latitude: number;
  longitude: number;
  location: {
    latitude: number;
    longitude: number;
    resolvedAddress: string; // Now from Mapbox Geocoding API
  };
}
```

## Features Implemented

✅ **Interactive Mapbox GL JS Map**
- Click to place marker
- Drag marker to adjust location
- Navigation and fullscreen controls

✅ **Location Search**
- Search by location name
- Autocomplete dropdown
- Select from search results

✅ **Address Resolution**
- Automatic reverse geocoding using Mapbox API
- Display resolved address from Mapbox

✅ **Backend Compatibility**
- Same payload structure maintained
- No backend changes required

## Usage

1. **Click on Map**: Click anywhere on the map to place a marker
2. **Drag Marker**: Drag the marker to fine-tune the location
3. **Search Location**: Use the search input to find locations by name
4. **Address Resolution**: Address is automatically resolved and displayed

## Browser Support

Mapbox GL JS supports all modern browsers:
- Chrome 76+
- Firefox 72+
- Safari 13.1+
- Edge 79+

## Performance Considerations

- Mapbox GL JS is GPU-accelerated for better performance
- Vector tiles provide better performance compared to raster tiles
- Search results are limited to 5 results to reduce API usage

## API Usage

The implementation uses Mapbox APIs:
- **Mapbox GL JS**: For map rendering
- **Geocoding API**: For forward and reverse geocoding

Note: Mapbox API usage is subject to Mapbox's pricing and usage limits.
