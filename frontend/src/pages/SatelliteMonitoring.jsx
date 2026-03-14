import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, LayersControl, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import {
    Activity,
    Calendar,
    Info,
    AlertTriangle,
    Leaf,
    Map as MapIcon,
    MousePointer2,
    TrendingUp,
    History,
    ShieldCheck,
    Sprout,
    Droplets,
    Zap,
    ChevronRight,
    Globe,
    Waves,
    TrendingDown,
    ArrowUpRight,
    Store
} from 'lucide-react';
import { getNDVIData, getNDVITimeline, getMandiData } from '../api/api';
import { useLanguage } from '../context/LanguageContext';
import { getRecommendations, getMultilingualRecommendation } from '../utils/recommendations';

// Fix Leaflet marker icon issue
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const SatelliteMonitoring = () => {
    const { lang, t } = useLanguage();
    const [position, setPosition] = useState([20.2961, 85.8245]); // Default to Bhubaneswar, Odisha
    const [satelliteData, setSatelliteData] = useState(null);
    const [timelineData, setTimelineData] = useState([]);
    const [mandiData, setMandiData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [currentIndex, setCurrentIndex] = useState('ndvi'); // ndvi, ndwi, evi
    const [recs, setRecs] = useState(null);

    const fetchMandi = async (crop = 'Rice') => {
        try {
            const mandi = await getMandiData(crop);
            setMandiData(mandi);
        } catch (err) {
            console.error('Mandi Fetch Error:', err);
        }
    };

    useEffect(() => {
        // Initial Mandi Fetch
        fetchMandi('Rice');
        // Initial Satellite Fetch for default position
        fetchData(position[0], position[1]);
    }, []);

    const MapClickHandler = () => {
        useMapEvents({
            click: (e) => {
                const { lat, lng } = e.latlng;
                setPosition([lat, lng]);
                fetchData(lat, lng);
            },
        });
        return null;
    };

    const fetchData = async (lat, lon) => {
        setLoading(true);
        setError(null);
        try {
            const data = await getNDVIData(lat, lon);
            setSatelliteData(data);
            
            // Get Mandi Data
            fetchMandi('Rice');

            // Get AI Recommendations based on NDVI
            const rawRecs = getRecommendations(data.indices.ndvi);
            setRecs(getMultilingualRecommendation(rawRecs, lang));

            const timeline = await getNDVITimeline(lat, lon);
            setTimelineData(timeline);
        } catch (err) {
            console.error('Data Sync Error:', err);
            const msg = err.response?.data?.error || err.message || 'Satellite sync failed.';
            setError(`Satellite Error: ${msg}. Check if Earth Engine API is enabled.`);
        } finally {
            setLoading(false);
        }
    };

    const indexInfo = useMemo(() => ({
        ndvi: {
            name: lang === 'or' ? 'ଉଦ୍ଭିଦ ସୂଚକାଙ୍କ (NDVI)' : 'Vegetation Index (NDVI)',
            desc: 'Measures live green vegetation density.',
            icon: Leaf, color: 'text-emerald-500', bg: 'bg-emerald-50'
        },
        ndwi: {
            name: lang === 'or' ? 'ଜଳ ଚାପ ସୂଚକାଙ୍କ (NDWI)' : 'Water Index (NDWI)',
            desc: 'Detects plant water stress and moisture levels.',
            icon: Waves, color: 'text-blue-500', bg: 'bg-blue-50'
        },
        evi: {
            name: lang === 'or' ? 'ଉନ୍ନତ ଉଦ୍ଭିଦ ସୂଚକାଙ୍କ (EVI)' : 'Biomass Index (EVI)',
            desc: 'Accurate biomass detection in high-growth areas.',
            icon: Zap, color: 'text-purple-500', bg: 'bg-purple-50'
        }
    }), [lang]);

    const currentHealth = useMemo(() => {
        if (!satelliteData) return { label: 'Waiting', color: 'text-slate-400' };
        return { label: satelliteData.classification, color: 'text-slate-900' };
    }, [satelliteData]);

    return (
        <div className="max-w-[1600px] mx-auto p-4 md:p-8 space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            {/* Error Banner */}
            {error && (
                <div className="bg-rose-50 border border-rose-200 text-rose-600 px-8 py-4 rounded-3xl flex items-center justify-between animate-in slide-in-from-top-4">
                    <div className="flex items-center gap-4">
                        <AlertTriangle className="w-6 h-6" />
                        <div>
                            <p className="text-sm font-black uppercase tracking-widest">Connectivity Alert</p>
                            <p className="text-xs font-medium opacity-80">{error}</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => fetchData(position[0], position[1])}
                        className="px-6 py-2 bg-rose-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-700 transition-colors"
                    >
                        Retry Sync
                    </button>
                </div>
            )}

            {/* Winning Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="px-4 py-1.5 bg-green-600 text-white rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-green-900/20">
                            Govt of Odisha Partnership
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-l border-slate-200 pl-4">
                            PS ID: 25044 Special Edition
                        </span>
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-none italic">
                        Krishi<span className="text-green-600">AI</span> <span className="text-slate-300">GEO</span>
                    </h1>
                    <p className="text-xl text-slate-500 font-medium max-w-2xl">
                        Advanced Multi-Spectral Intelligence & Market Dynamics Ecosystem.
                    </p>
                </div>

                <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-4 bg-white p-3 rounded-[2rem] shadow-xl border border-slate-100">
                        <div className="p-4 bg-blue-600 rounded-[1.5rem] shadow-lg">
                            <Store className="text-white w-6 h-6" />
                        </div>
                        <div className="pr-6">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">Mandi Price ({mandiData?.crop || 'Rice'})</p>
                            <p className="text-xl font-black text-slate-800">
                                {mandiData ? `₹${mandiData.avgPrice}` : 'Updating...'}
                            </p>
                            <div className={`flex items-center gap-1 text-[10px] font-bold ${mandiData?.trend === 'up' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                {mandiData?.trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                {mandiData?.priceChange || '0%'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Left: Map & Index Switcher */}
                <div className="lg:col-span-8 space-y-6">
                    {/* Index Switcher Tabs */}
                    <div className="flex bg-slate-100 p-1.5 rounded-[2rem] w-fit">
                        {Object.keys(indexInfo).map((key) => (
                            <button
                                key={key}
                                onClick={() => setCurrentIndex(key)}
                                className={`px-8 py-3 rounded-[1.5rem] text-xs font-black uppercase tracking-widest transition-all duration-300 flex items-center gap-3 ${currentIndex === key
                                        ? 'bg-white text-slate-900 shadow-xl'
                                        : 'text-slate-400 hover:text-slate-600'
                                    }`}
                            >
                                {React.createElement(indexInfo[key].icon, { className: "w-4 h-4" })}
                                {key.toUpperCase()}
                            </button>
                        ))}
                    </div>

                    {/* Map Hub */}
                    <div className="bg-white rounded-[3.5rem] shadow-2xl border border-slate-100 overflow-hidden relative h-[650px] shadow-green-900/5 group">
                        <div className="absolute top-6 left-6 z-[1000] space-y-3">
                            <div className="bg-slate-900/90 backdrop-blur-2xl px-6 py-4 rounded-3xl shadow-2xl border border-white/10">
                                <h3 className="text-white text-sm font-black tracking-tight mb-1">{indexInfo[currentIndex].name}</h3>
                                <p className="text-slate-400 text-[10px] font-medium leading-tight max-w-[200px]">{indexInfo[currentIndex].desc}</p>
                            </div>
                        </div>

                        <div className="h-full w-full z-0">
                            <MapContainer center={position} zoom={13} scrollWheelZoom={true} className="h-full w-full" zoomControl={false}>
                                <ZoomControl position="bottomright" />
                                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                {satelliteData?.tiles[currentIndex] && (
                                    <TileLayer
                                        url={satelliteData.tiles[currentIndex]}
                                        opacity={0.8}
                                        zIndex={100}
                                        key={currentIndex} // Force re-render on index change
                                    />
                                )}
                                <Marker position={position} />
                                <MapClickHandler />
                            </MapContainer>
                        </div>

                        {/* Map Floaties */}
                        <div className="absolute bottom-8 left-8 right-8 z-[1000] flex flex-col md:flex-row justify-between items-end gap-6">
                            <div className="bg-white/80 backdrop-blur-3xl px-8 py-6 rounded-[2.5rem] border border-white/50 shadow-2xl flex items-center gap-10">
                                {currentIndex === 'ndvi' ? (
                                    <div className="flex gap-10">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Poor</span>
                                            </div>
                                            <div className="w-16 h-1 bg-rose-200 rounded-full"></div>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Growth</span>
                                            </div>
                                            <div className="w-16 h-1 bg-amber-200 rounded-full"></div>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Dense</span>
                                            </div>
                                            <div className="w-16 h-1 bg-emerald-200 rounded-full"></div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                                            <Waves className="w-4 h-4" />
                                        </div>
                                        <span className="text-xs font-black text-slate-600 uppercase tracking-widest">Moisture Saturation Overlay</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: AI Analysis & recommendations */}
                <div className="lg:col-span-4 space-y-10">
                    {/* Spectral Scorecard */}
                    <div className="bg-slate-900 p-10 rounded-[4rem] shadow-2xl relative overflow-hidden text-white">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-green-500 blur-[100px] opacity-20"></div>

                        <div className="flex items-center justify-between mb-10">
                            <div className="p-5 bg-white/10 rounded-3xl backdrop-blur-xl border border-white/10">
                                <Leaf className="w-10 h-10 text-green-400" />
                            </div>
                            <div className="text-right">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">{indexInfo[currentIndex].name}</span>
                                <h2 className="text-6xl font-black tracking-tighter mt-2 leading-none">
                                    {loading ? '--' : (satelliteData?.indices[currentIndex] || '0.0')}
                                </h2>
                            </div>
                        </div>

                        <div className="space-y-4 mb-10">
                            <div className="px-6 py-3 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-400">Class</span>
                                <span className="text-xs font-black uppercase text-green-400 tracking-widest">{currentHealth.label}</span>
                            </div>
                            <div className="px-6 py-3 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-400">Confidence</span>
                                <span className="text-xs font-black uppercase text-blue-400 tracking-widest">{(recs?.confidence * 100).toFixed(0)}% Match</span>
                            </div>
                        </div>

                        <div className="pt-8 border-t border-white/10 space-y-4">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Regional Sync</h4>
                            <div className="flex items-center gap-4">
                                <Globe className="w-5 h-5 text-slate-600" />
                                <p className="text-xs font-medium text-slate-300">Tracking across {mandiData?.topMandis?.[0] || 'Odisha'} Region</p>
                            </div>
                        </div>
                    </div>

                    {/* AI Smart Advisory Card */}
                    {recs && (
                        <div className="bg-white rounded-[3.5rem] p-10 shadow-2xl border border-slate-100 group">
                            <div className="flex items-center gap-4 mb-10">
                                <div className="p-4 bg-slate-100 rounded-2xl transition-colors group-hover:bg-green-100">
                                    <ShieldCheck className="w-6 h-6 text-green-600" />
                                </div>
                                <div>
                                    <h4 className="font-black text-xl text-slate-900 tracking-tight">{lang === 'or' ? 'AI ପରାମର୍ଶ' : 'AI Strategic Advisor'}</h4>
                                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Hyper-Local Tasking</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                {[
                                    { icon: Droplets, color: 'text-blue-500', name: lang === 'or' ? 'ଜଳ' : 'Irrigation', val: recs.irrigation },
                                    { icon: Zap, color: 'text-purple-500', name: lang === 'or' ? 'ପୋଷଣ' : 'Nutrition', val: recs.fertilizer },
                                    { icon: ShieldCheck, color: 'text-emerald-500', name: lang === 'or' ? 'ସୁରକ୍ଷା' : 'Health', val: recs.protection }
                                ].map((item, i) => (
                                    <div key={i} className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <item.icon className={`w-4 h-4 ${item.color}`} />
                                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{item.name}</span>
                                        </div>
                                        <p className="text-sm font-medium text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                            {item.val}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Market Intelligence Row */}
            <div className="bg-slate-900 p-10 md:p-12 rounded-[4rem] shadow-2xl relative overflow-hidden group">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-white/10 rounded-2xl">
                                <TrendingUp className="text-white w-6 h-6" />
                            </div>
                            <h3 className="text-white text-3xl font-black tracking-tight">{lang === 'or' ? 'ବଜାର ପରିବର୍ତ୍ତନ' : 'Market Intelligence Hub'}</h3>
                        </div>
                        <p className="text-slate-400 text-lg font-medium max-w-xl">
                            Live mandi price fluctuations and demand forecasting for small-scale Odisha farms.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full lg:w-fit">
                        {[
                            { label: 'Avg Price', val: `₹${mandiData?.avgPrice || '--'}`, unit: mandiData?.unit || 'Qtl', icon: Store, color: 'text-blue-400' },
                            { label: 'Trend', val: mandiData?.priceChange || '--', unit: 'Market', icon: TrendingUp, color: 'text-emerald-400' },
                            { label: 'Top Mandi', val: mandiData?.topMandis?.[0] || 'Syncing', unit: 'Odisha', icon: Globe, color: 'text-purple-400' },
                            { label: 'Last Sync', val: 'Realtime', unit: 'API', icon: Activity, color: 'text-orange-400' }
                        ].map((stat, i) => (
                            <div key={i} className="bg-white/5 backdrop-blur-3xl p-6 rounded-[2rem] border border-white/5 flex flex-col items-center text-center">
                                <stat.icon className={`w-8 h-8 ${stat.color} mb-4`} />
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{stat.label}</p>
                                <p className="text-xl font-black text-white leading-none mb-1">{stat.val}</p>
                                <p className="text-[9px] font-bold text-slate-500 uppercase">{stat.unit}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SatelliteMonitoring;
