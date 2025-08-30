import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const InteractiveMap = ({ data, selectedState, onDistrictClick }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  // State coordinates (approximate centers)
  const stateCoordinates = {
    'Maharashtra': [19.7515, 75.7139],
    'Karnataka': [15.3173, 75.7139],
    'Tamil Nadu': [11.1271, 78.6569],
    'Gujarat': [22.2587, 71.1924],
    'Uttar Pradesh': [26.8467, 80.9462],
    'Madhya Pradesh': [22.9734, 78.6569],
    'Rajasthan': [27.0238, 74.2179],
    'Andhra Pradesh': [15.9129, 79.7400],
    'Telangana': [18.1124, 79.0193],
    'West Bengal': [22.9868, 87.8550],
    'Bihar': [25.0961, 85.3131],
    'Odisha': [20.9517, 85.0985],
    'Punjab': [31.1471, 75.3412],
    'Haryana': [29.0588, 76.0856],
    'Jharkhand': [23.6102, 85.2799],
    'Chhattisgarh': [21.2787, 81.8661],
    'Assam': [26.2006, 92.9376],
    'Kerala': [10.8505, 76.2711],
    'Uttarakhand': [30.0668, 79.0193],
    'Himachal Pradesh': [31.1048, 77.1734],
    'Tripura': [23.9408, 91.9882],
    'Meghalaya': [25.4670, 91.3662],
    'Manipur': [24.6637, 93.9063],
    'Nagaland': [26.1584, 94.5624],
    'Goa': [15.2993, 74.1240],
    'Arunachal Pradesh': [28.2180, 94.7278],
    'Mizoram': [23.1645, 92.9376],
    'Sikkim': [27.5330, 88.5122],
    'Delhi': [28.7041, 77.1025],
    'Jammu and Kashmir': [33.7782, 76.5762],
    'Ladakh': [34.1526, 77.5771],
    'Chandigarh': [30.7333, 76.7794],
    'Puducherry': [11.9416, 79.8083],
    'Dadra and Nagar Haveli': [20.1809, 72.8311],
    'Daman and Diu': [20.3974, 72.8328],
    'Lakshadweep': [10.5667, 72.6417],
    'Andaman and Nicobar Islands': [11.7401, 92.6586]
  };

  // Initialize Leaflet map
  useEffect(() => {
    if (mapRef.current && !mapInstanceRef.current) {
      try {
        // Initialize the map
        const map = L.map(mapRef.current, {
          center: [20.5937, 78.9629], // India center
          zoom: 5,
          zoomControl: true,
          attributionControl: true
        });
        
        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        // Force a resize to ensure proper rendering
        setTimeout(() => {
          map.invalidateSize();
        }, 100);

        mapInstanceRef.current = map;
      } catch (error) {
        console.error('Error initializing Leaflet map:', error);
      }
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update map markers when data changes
  useEffect(() => {
    if (mapInstanceRef.current && data && data.length > 0) {
      // Clear existing markers
      mapInstanceRef.current.eachLayer((layer) => {
        if (layer instanceof L.CircleMarker) {
          mapInstanceRef.current.removeLayer(layer);
        }
      });

      // Add new markers
      data.forEach((item) => {
        const coords = stateCoordinates[item.district] || [20.5937, 78.9629];
        
        const marker = L.circleMarker(coords, {
          radius: getStateRadius(item.production),
          fillColor: getStateColor(item.production),
          color: getStateColor(item.production),
          weight: 2,
          opacity: 0.8,
          fillOpacity: 0.6
        }).addTo(mapInstanceRef.current);

        // Add popup
        marker.bindPopup(`
          <div style="text-align: center; min-width: 200px;">
            <h3 style="margin: 0 0 10px 0; color: #333;">${item.district}</h3>
            <div style="font-size: 18px; font-weight: bold; color: #2563eb; margin-bottom: 5px;">
              ${formatNumber(item.production)} tons
            </div>
            <div style="font-size: 12px; color: #888;">
              Yield: ${(item.yield || 0).toFixed(2)} tons/ha
            </div>
          </div>
        `);

        // Add click event
        marker.on('click', () => {
          if (onDistrictClick) {
            onDistrictClick(item.district);
          }
        });

        // Add hover effects
        marker.on('mouseover', function() {
          this.setStyle({
            fillOpacity: 0.8,
            weight: 3
          });
        });

        marker.on('mouseout', function() {
          this.setStyle({
            fillOpacity: 0.6,
            weight: 2
          });
        });
      });
    }
  }, [data, onDistrictClick]);

  const getStateColor = (production) => {
    if (production > 5000) return '#dc2626'; // red-600
    if (production > 3000) return '#ea580c'; // orange-600
    if (production > 1000) return '#ca8a04'; // yellow-600
    if (production > 500) return '#16a34a'; // green-600
    return '#6b7280'; // gray-500
  };

  const getStateRadius = (production) => {
    if (production > 5000) return 15;
    if (production > 3000) return 12;
    if (production > 1000) return 10;
    if (production > 500) return 8;
    return 6;
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-IN').format(Math.round(num));
  };

  return (
    <div className="relative">
      {/* Leaflet Map Container */}
      <div 
        ref={mapRef} 
        className="h-96 w-full rounded-lg overflow-hidden border border-gray-200 bg-gray-100"
        style={{ zIndex: 1, minHeight: '384px' }}
      >
        {/* Loading indicator */}
        <div className="flex items-center justify-center h-full text-gray-500">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-2"></div>
            <p>Loading interactive map...</p>
          </div>
        </div>
      </div>
      
      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4 justify-center">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#dc2626' }}></div>
          <span className="text-sm text-gray-600">High Production (&gt;5000 tons)</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#ea580c' }}></div>
          <span className="text-sm text-gray-600">Medium-High (3000-5000 tons)</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#ca8a04' }}></div>
          <span className="text-sm text-gray-600">Medium (1000-3000 tons)</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#16a34a' }}></div>
          <span className="text-sm text-gray-600">Low-Medium (500-1000 tons)</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#6b7280' }}></div>
          <span className="text-sm text-gray-600">Low (&lt;500 tons)</span>
        </div>
      </div>
    </div>
  );
};

export default InteractiveMap;
