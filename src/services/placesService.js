/**
 * OpenStreetMap Overpass API Service
 * Documentation: https://wiki.openstreetmap.org/wiki/Overpass_API
 * 
 * Completely free, no API key required!
 * Now with Wikimedia Commons image integration
 */

const OSM_BASE = 'https://overpass-api.de/api/interpreter';
const WIKIMEDIA_COMMONS_URL = 'https://commons.wikimedia.org/wiki/Special:FilePath';

// Category mapping for OSM tags
export const OSM_CATEGORIES = {
  museum:      { tourism: 'museum' },
  park:        { leisure: 'park' },
  restaurant:  { amenity: 'restaurant' },
  cafe:        { amenity: 'cafe' },
  monument:    { historic: 'monument' },
  art:         { tourism: 'gallery' },
  shopping:    { shop: 'mall' },
  hotel:       { tourism: 'hotel' },
  nightlife:   { amenity: 'nightclub' },
  spa:         { amenity: 'spa' },
  theater:     { amenity: 'theatre' },
};

export const CATEGORY_META = {
  museum:     { icon: '🎨', label: 'Museum',      isIndoor: true,  tagVec: [0.1, 0.0, 0.9, 0.0, 0.1], placeholder: '🏛️' },
  park:       { icon: '🌿', label: 'Park',        isIndoor: false, tagVec: [0.9, 0.1, 0.0, 0.0, 0.0], placeholder: '🌳' },
  restaurant: { icon: '🍽', label: 'Restaurant',  isIndoor: true,  tagVec: [0.0, 0.9, 0.0, 0.2, 0.0], placeholder: '🍽️' },
  cafe:       { icon: '☕', label: 'Café',         isIndoor: true,  tagVec: [0.1, 0.7, 0.0, 0.0, 0.0], placeholder: '☕' },
  monument:   { icon: '🗼', label: 'Monument',    isIndoor: false, tagVec: [0.3, 0.0, 0.6, 0.0, 0.0], placeholder: '🗽' },
  art:        { icon: '🖼', label: 'Art Gallery', isIndoor: true,  tagVec: [0.1, 0.0, 0.8, 0.2, 0.0], placeholder: '🎨' },
  shopping:   { icon: '🛍', label: 'Shopping',    isIndoor: true,  tagVec: [0.0, 0.1, 0.0, 0.3, 0.9], placeholder: '🛒' },
  hotel:      { icon: '🏨', label: 'Hotel',       isIndoor: true,  tagVec: [0.0, 0.2, 0.0, 0.0, 0.1], placeholder: '🏨' },
  nightlife:  { icon: '🎵', label: 'Nightlife',   isIndoor: true,  tagVec: [0.0, 0.2, 0.0, 0.9, 0.1], placeholder: '🎉' },
  spa:        { icon: '💆', label: 'Spa',         isIndoor: true,  tagVec: [0.2, 0.0, 0.0, 0.1, 0.2], placeholder: '💧' },
  theater:    { icon: '🎭', label: 'Theater',     isIndoor: true,  tagVec: [0.0, 0.0, 0.7, 0.4, 0.0], placeholder: '🎪' },
};

// Category-based color gradients for placeholders
export const CATEGORY_COLORS = {
  museum:     'from-purple-500/20 to-pink-500/20',
  park:       'from-green-500/20 to-emerald-500/20',
  restaurant: 'from-orange-500/20 to-red-500/20',
  cafe:       'from-amber-500/20 to-yellow-500/20',
  monument:   'from-stone-500/20 to-zinc-500/20',
  art:        'from-fuchsia-500/20 to-purple-500/20',
  shopping:   'from-blue-500/20 to-cyan-500/20',
  hotel:      'from-indigo-500/20 to-violet-500/20',
  nightlife:  'from-rose-500/20 to-pink-500/20',
  spa:        'from-teal-500/20 to-emerald-500/20',
  theater:    'from-amber-500/20 to-orange-500/20',
};

// Convert lat/lon to bounding box (± radius in degrees)
function getBbox(lat, lon, radiusMeters = 3000) {
  const latOffset = radiusMeters / 111000;
  const lonOffset = radiusMeters / (111000 * Math.cos(lat * Math.PI / 180));
  
  return {
    south: lat - latOffset,
    west: lon - lonOffset,
    north: lat + latOffset,
    east: lon + lonOffset
  };
}

// Build Overpass QL query
function buildQuery(lat, lon, categories = [], radius = 3000) {
  const bbox = getBbox(lat, lon, radius);
  
  const categoriesToUse = categories.length ? categories : Object.keys(OSM_CATEGORIES);
  
  const queries = categoriesToUse.map(cat => {
    const tags = OSM_CATEGORIES[cat];
    const [key, value] = Object.entries(tags)[0];
    return `  node["${key}"="${value}"](${bbox.south},${bbox.west},${bbox.north},${bbox.east});`;
  }).join('\n');

  return `
    [out:json][timeout:25];
    (
      ${queries}
    );
    out body;
  `;
}

// Estimate crowd level based on time
function estimateCrowdLevel(hour) {
  const hourFactor = [
    0.3,0.2,0.2,0.2,0.2,0.2,0.3,0.4,0.6,0.7,0.85,0.95,
    0.95,0.9,0.8,0.8,0.9,0.95,0.9,0.75,0.6,0.5,0.4,0.3
  ][hour] || 0.5;
  
  return Math.min(1, Math.max(0, hourFactor + (Math.random() * 0.1 - 0.05)));
}

// Resolve category from OSM tags
function resolveCategory(tags) {
  for (const [cat, mapping] of Object.entries(OSM_CATEGORIES)) {
    const [key, value] = Object.entries(mapping)[0];
    if (tags[key] === value) return cat;
  }
  return 'monument';
}

// Get duration estimate by category
function getDurationEstimate(category) {
  return {
    museum: 120,
    park: 60,
    restaurant: 75,
    cafe: 30,
    monument: 45,
    art: 90,
    shopping: 90,
    nightlife: 120,
    theater: 120,
    spa: 90,
  }[category] || 60;
}

// Get price estimate
function getPriceEstimate(category) {
  const base = {
    museum: 15,
    park: 0,
    restaurant: 35,
    cafe: 10,
    monument: 0,
    art: 12,
    shopping: 50,
    nightlife: 25,
    theater: 30,
    spa: 50,
  };
  return base[category] || 10;
}

// Calculate distance between two points
function calcDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) ** 2;

  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

// Format address from OSM tags
function formatAddress(tags) {
  if (!tags) return 'Address not available';
  
  const parts = [];
  
  if (tags['addr:street'] && tags['addr:housenumber']) {
    parts.push(`${tags['addr:street']} ${tags['addr:housenumber']}`);
  } else if (tags['addr:street']) {
    parts.push(tags['addr:street']);
  }
  
  if (tags['addr:city'] || tags['addr:town'] || tags['addr:village']) {
    parts.push(tags['addr:city'] || tags['addr:town'] || tags['addr:village']);
  }
  
  if (parts.length > 0) {
    return parts.join(', ');
  }
  
  if (tags.description) return tags.description;
  if (tags['name:en']) return tags['name:en'];
  
  return 'Location in area';
}

// Extract image from OSM tags (Wikimedia Commons, etc.)
function extractImage(tags, category) {
  if (!tags) return null;
  
  // Check for Wikimedia Commons images
  const wikimediaCommons = tags['wikimedia_commons'];
  if (wikimediaCommons) {
    if (wikimediaCommons.includes('File:')) {
      const fileName = wikimediaCommons.replace('File:', '').replace(/ /g, '_');
      return {
        url: `${WIKIMEDIA_COMMONS_URL}/${encodeURIComponent(fileName)}?width=400`,
        attribution: 'Wikimedia Commons',
        license: 'CC BY-SA'
      };
    }
  }
  
  // Check for direct image links
  const image = tags['image'] || tags['photo'] || tags['image:panorama'];
  if (image && (image.startsWith('http://') || image.startsWith('https://'))) {
    return {
      url: image,
      attribution: tags['image:source'] || 'OpenStreetMap',
      license: tags['image:license'] || '© OSM contributors'
    };
  }
  
  // Check for Wikipedia images (might need additional API call)
  const wikipedia = tags['wikipedia'];
  if (wikipedia && category) {
    // Return a placeholder with Wikipedia info - actual image would need additional API call
    return {
      fromWikipedia: true,
      page: wikipedia,
      url: null,
      placeholder: true
    };
  }
  
  return null;
}

// Main search function
export async function searchNearbyPlaces(
  lat,
  lon,
  categories = [],
  radius = 3000
) {
  console.log('🔍 Searching OSM for places at:', { lat, lon, categories, radius });

  const query = buildQuery(lat, lon, categories, radius);
  
  try {
    const response = await fetch(OSM_BASE, {
      method: 'POST',
      body: query,
      headers: {
        'Content-Type': 'text/plain',
      },
    });

    if (!response.ok) {
      throw new Error(`OSM API error: ${response.status}`);
    }

    const data = await response.json();
    const hour = new Date().getHours();

    // Transform OSM data to match your existing format
    return (data.elements || [])
      .filter(element => element.tags?.name) // Filter out unnamed places
      .map(element => {
        const category = resolveCategory(element.tags || {});
        const meta = CATEGORY_META[category];
        const crowd = estimateCrowdLevel(hour);
        const image = extractImage(element.tags, category);
        
        // Create a unique ID
        const uniqueId = `${element.id}-${category}-${Date.now()}`;

        return {
          id: uniqueId,
          osmId: element.id.toString(),
          name: element.tags.name,
          category,
          icon: meta.icon,
          placeholderIcon: meta.placeholder,
          isIndoor: meta.isIndoor,
          tagVector: meta.tagVec,
          address: formatAddress(element.tags),
          lat: element.lat || lat,
          lon: element.lon || lon,
          rating: 4.0, // Default rating
          popularity: 70,
          crowdLevel: crowd,
          estimatedWaitMin: Math.round(crowd * 45),
          price: 2,
          photo: image,
          photoColor: CATEGORY_COLORS[category] || 'from-gray-500/20 to-gray-500/20',
          isOpen: true,
          durationMin: getDurationEstimate(category),
          costUsd: getPriceEstimate(category),
          distanceFromPrevM: calcDistance(
            lat,
            lon,
            element.lat || lat,
            element.lon || lon
          ),
          // Additional useful tags
          phone: element.tags.phone || element.tags['contact:phone'],
          website: element.tags.website || element.tags['contact:website'],
          openingHours: element.tags.opening_hours,
          wheelchair: element.tags.wheelchair === 'yes',
          description: element.tags.description || element.tags.note,
        };
      })
      .sort((a, b) => (b.rating || 0) - (a.rating || 0)); // Sort by rating
  } catch (error) {
    console.error('❌ OSM search failed:', error);
    throw error;
  }
}

// Get place details by ID
export async function getPlaceDetails(osmId) {
  const query = `
    [out:json];
    node(${osmId});
    out body;
  `;

  try {
    const response = await fetch(OSM_BASE, {
      method: 'POST',
      body: query,
    });

    const data = await response.json();
    const element = data.elements[0];
    
    if (!element) return null;
    
    const category = resolveCategory(element.tags || {});
    const meta = CATEGORY_META[category];
    const image = extractImage(element.tags, category);
    
    return {
      id: element.id.toString(),
      name: element.tags?.name,
      category,
      icon: meta.icon,
      address: formatAddress(element.tags),
      lat: element.lat,
      lon: element.lon,
      photo: image,
      phone: element.tags?.phone || element.tags?.['contact:phone'],
      website: element.tags?.website || element.tags?.['contact:website'],
      openingHours: element.tags?.opening_hours,
      description: element.tags?.description,
    };
  } catch (error) {
    console.error('❌ Failed to fetch place details:', error);
    return null;
  }
}

// Search for places by name
export async function searchPlacesByName(query, lat, lon, radius = 5000) {
  const bbox = getBbox(lat, lon, radius);
  
  const searchQuery = `
    [out:json][timeout:25];
    (
      node["name"~"${query}", i](${bbox.south},${bbox.west},${bbox.north},${bbox.east});
      way["name"~"${query}", i](${bbox.south},${bbox.west},${bbox.north},${bbox.east});
    );
    out body;
  `;

  try {
    const response = await fetch(OSM_BASE, {
      method: 'POST',
      body: searchQuery,
    });

    const data = await response.json();
    
    return (data.elements || [])
      .filter(element => element.tags?.name)
      .map(element => ({
        id: element.id.toString(),
        name: element.tags.name,
        type: element.type,
        lat: element.lat || (element.bounds ? (element.bounds.minlat + element.bounds.maxlat) / 2 : lat),
        lon: element.lon || (element.bounds ? (element.bounds.minlon + element.bounds.maxlon) / 2 : lon),
        category: resolveCategory(element.tags || {}),
      }));
  } catch (error) {
    console.error('❌ Place search failed:', error);
    return [];
  }
}