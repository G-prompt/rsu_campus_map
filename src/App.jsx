import { useEffect, useRef, useState } from 'react';
import OnboardingModal from './OnboardingModal';
import './onboarding.css';
import { v4 as uuidv4 } from 'uuid';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const categories = ['All', 'Admin', 'Library', 'Faculty', 'Event', 'Health', 'Hostel', 'Landmark'];

const courseUpdates = [
    { id: 1, locationId: 3, title: 'CSC 201 relocated', description: 'Class now at ICT Center lecture hall 1.', faculty: 'Computer Science', level: '200L', courseCode: 'CSC 201', expiresAt: '2:00 PM' },
    { id: 2, locationId: 4, title: 'Guest lecture', description: 'Convocation Arena hosts business keynote.', faculty: 'Management', level: 'All Levels', courseCode: 'MGT 101', expiresAt: '5:00 PM' },
    { id: 3, locationId: 2, title: 'Library maintenance', description: 'Central Library closes early for inventory.', faculty: 'Library Services', level: 'All Students', courseCode: 'NOTICE', expiresAt: '6:00 PM' },
    { id: 4, locationId: 5, title: 'Health center outreach', description: 'Free health screening at the campus clinic.', faculty: 'Health Services', level: 'All Students', courseCode: 'HEALTH', expiresAt: '3:00 PM' }
];

const eventLocations = [
    { id: 'e1', title: 'Freshers Day', description: 'Welcome event at Convocation Arena.', latitude: 4.8220, longitude: 7.0495 },
    { id: 'e2', title: 'Exam Blitz', description: 'Study tents near ICT Center.', latitude: 4.8214, longitude: 7.0504 },
    { id: 'e3', title: 'Library Week', description: 'Study challenge at Central Library.', latitude: 4.8208, longitude: 7.0506 }
];

const escapeSvg = (text) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const createPlaceholderImage = (text) => {
    const label = escapeSvg(text || 'Campus Map');
    const svg = `<?xml version="1.0" encoding="UTF-8"?><svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500"><rect width="800" height="500" rx="32" fill="#f8fafc"/><rect x="40" y="40" width="720" height="420" rx="24" fill="#e2e8f0"/><text x="50%" y="45%" dominant-baseline="middle" text-anchor="middle" font-family="Inter, sans-serif" font-size="40" fill="#0f172a" opacity="0.9">${label}</text><text x="50%" y="60%" dominant-baseline="middle" text-anchor="middle" font-family="Inter, sans-serif" font-size="24" fill="#475569" opacity="0.75">RSU Campus Map</text></svg>`;
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

const getLocationIconText = (name) => {
    const words = name.trim().split(/\s+/).filter(Boolean);
    if (words.length <= 2) {
        return name.replace(/[^A-Za-z0-9]/g, '').slice(0, 3).toUpperCase();
    }
    return words.map((word) => word[0]).join('').slice(0, 3).toUpperCase();
};

L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow
});

function App() {
    // Loader state
    const [loading, setLoading] = useState(true);
    // Onboarding state
    const [onboarding, setOnboarding] = useState(() => {
        return !localStorage.getItem('rsu_onboarding') || !localStorage.getItem('rsu_user_profile');
    });
    const [userProfile, setUserProfile] = useState(() => {
        const saved = localStorage.getItem('rsu_user_profile');
        return saved ? JSON.parse(saved) : null;
    });
    // Unique user code
    const [userCode, setUserCode] = useState(() => {
        let code = localStorage.getItem('rsu_user_code');
        if (!code) {
            code = uuidv4().slice(0, 8).toUpperCase();
            localStorage.setItem('rsu_user_code', code);
        }
        return code;
    });
    // Main app state
    const [campusLocations, setCampusLocations] = useState(() => {
        const saved = localStorage.getItem('rsu_campus_locations');
        return saved ? JSON.parse(saved) : [
            {
                id: 1,
                name: 'Senate Building',
                category: 'Admin',
                description: 'Central administration building.',
                latitude: 4.8205,
                longitude: 7.0510,
                imageUrl: 'https://via.placeholder.com/400x250.png?text=Senate+Building+Exterior',
                insideImageUrl: 'https://via.placeholder.com/400x250.png?text=Senate+Building+Interior',
                pathCoordinates: [
                    [4.8205, 7.0510],
                    [4.8206, 7.0508],
                    [4.8207, 7.0504]
                ]
            },
            {
                id: 2,
                name: 'Central Library',
                category: 'Library',
                description: 'Main library for students and staff.',
                latitude: 4.8208,
                longitude: 7.0506,
                imageUrl: 'https://via.placeholder.com/400x250.png?text=Central+Library+Exterior',
                insideImageUrl: 'https://via.placeholder.com/400x250.png?text=Central+Library+Interior',
                pathCoordinates: [
                    [4.8205, 7.0510],
                    [4.82065, 7.05085],
                    [4.8208, 7.0506]
                ]
            },
            {
                id: 3,
                name: 'ICT Center',
                category: 'Faculty',
                description: 'ICT faculty and computer labs.',
                latitude: 4.8212,
                longitude: 7.0502,
                imageUrl: 'https://via.placeholder.com/400x250.png?text=ICT+Center+Exterior',
                insideImageUrl: 'https://via.placeholder.com/400x250.png?text=ICT+Center+Interior',
                pathCoordinates: [
                    [4.8205, 7.0510],
                    [4.8210, 7.0507],
                    [4.8212, 7.0502]
                ]
            },
            {
                id: 4,
                name: 'Convocation Arena',
                category: 'Event',
                description: 'Venue for ceremonies and large gatherings.',
                latitude: 4.8220,
                longitude: 7.0495,
                imageUrl: 'https://via.placeholder.com/400x250.png?text=Convocation+Arena+Exterior',
                insideImageUrl: 'https://via.placeholder.com/400x250.png?text=Convocation+Arena+Interior',
                pathCoordinates: [
                    [4.8205, 7.0510],
                    [4.8214, 7.0499],
                    [4.8220, 7.0495]
                ]
            },
            {
                id: 5,
                name: 'University Health Center',
                category: 'Health',
                description: 'Campus medical clinic and emergency services.',
                latitude: 4.8201,
                longitude: 7.0515,
                imageUrl: 'https://via.placeholder.com/400x250.png?text=Health+Center+Exterior',
                insideImageUrl: 'https://via.placeholder.com/400x250.png?text=Health+Center+Interior',
                pathCoordinates: [
                    [4.8205, 7.0510],
                    [4.82035, 7.05125],
                    [4.8201, 7.0515]
                ]
            },
            {
                id: 6,
                name: 'Hostel A',
                category: 'Hostel',
                description: 'Student accommodation block.',
                latitude: 4.8198,
                longitude: 7.0518,
                imageUrl: 'https://via.placeholder.com/400x250.png?text=Hostel+A+Exterior',
                insideImageUrl: 'https://via.placeholder.com/400x250.png?text=Hostel+A+Interior',
                pathCoordinates: [
                    [4.8205, 7.0510],
                    [4.8200, 7.0514],
                    [4.8198, 7.0518]
                ]
            },
            {
                id: 7,
                name: 'Faculty of Science',
                category: 'Faculty',
                description: 'Science teaching and research facilities.',
                latitude: 4.8218,
                longitude: 7.0510,
                imageUrl: 'https://via.placeholder.com/400x250.png?text=Faculty+of+Science+Exterior',
                insideImageUrl: 'https://via.placeholder.com/400x250.png?text=Faculty+of+Science+Interior',
                pathCoordinates: [
                    [4.8205, 7.0510],
                    [4.8216, 7.0510],
                    [4.8218, 7.0510]
                ]
            },
            {
                id: 8,
                name: 'Faculty of Education',
                category: 'Faculty',
                description: 'Education faculty and lecture halls.',
                latitude: 4.8215,
                longitude: 7.0498,
                imageUrl: 'https://via.placeholder.com/400x250.png?text=Faculty+of+Education+Exterior',
                insideImageUrl: 'https://via.placeholder.com/400x250.png?text=Faculty+of+Education+Interior',
                pathCoordinates: [
                    [4.8205, 7.0510],
                    [4.8210, 7.0504],
                    [4.8215, 7.0498]
                ]
            },
            {
                id: 9,
                name: 'Central Mosque',
                category: 'Landmark',
                description: 'Campus mosque for daily prayers.',
                latitude: 4.8202,
                longitude: 7.0500,
                imageUrl: 'https://via.placeholder.com/400x250.png?text=Central+Mosque+Exterior',
                insideImageUrl: 'https://via.placeholder.com/400x250.png?text=Central+Mosque+Interior',
                pathCoordinates: [
                    [4.8205, 7.0510],
                    [4.82035, 7.0506],
                    [4.8202, 7.0500]
                ]
            },
            {
                id: 10,
                name: 'Student Centre',
                category: 'Landmark',
                description: 'Student services and common gathering area.',
                latitude: 4.8207,
                longitude: 7.0512,
                imageUrl: 'https://via.placeholder.com/400x250.png?text=Student+Centre+Exterior',
                insideImageUrl: 'https://via.placeholder.com/400x250.png?text=Student+Centre+Interior',
                pathCoordinates: [
                    [4.8205, 7.0510],
                    [4.8206, 7.0511],
                    [4.8207, 7.0512]
                ]
            }
        ];
    });
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [filter, setFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState('Exterior');
    const [showEventLayer, setShowEventLayer] = useState(true);
    const [tileError, setTileError] = useState(false);
    const [pins, setPins] = useState([]); // {id, lat, lng, title, course, expiresAt, shareCode}
    const [showPinModal, setShowPinModal] = useState(false);
    const [pinForm, setPinForm] = useState({ title: '', course: '', duration: 15 });
    const currentLocation = selectedLocation || campusLocations[0] || {
        name: 'Loading...',
        category: 'Loading',
        description: 'Please wait while campus locations load.',
        imageUrl: '',
        insideImageUrl: '',
        latitude: 0,
        longitude: 0,
        pathCoordinates: []
    };
    const [sharePin, setSharePin] = useState(null); // pin to share
    // Custom route state
    const [routeMode, setRouteMode] = useState(false);
    const [customRoute, setCustomRoute] = useState([]); // [{lat, lng}]
    const [showAddLocationModal, setShowAddLocationModal] = useState(false);
    const [addLocationForm, setAddLocationForm] = useState({ name: '', category: 'Landmark', description: '', latitude: '', longitude: '' });
    const [showHelp, setShowHelp] = useState(false);
    // Map modal state
    const [showMapModal, setShowMapModal] = useState(false);
    const mapContainerRef = useRef(null); // main map
    const mapRef = useRef(null); // main map instance
    const modalMapContainerRef = useRef(null); // modal map
    const modalMapRef = useRef(null); // modal map instance
    const markersRef = useRef({});
    const eventMarkersRef = useRef({});
    const pinMarkersRef = useRef({});
    const routeRef = useRef(null);

    const normalizedQuery = searchQuery.trim().toLowerCase();
    const filteredLocations = campusLocations.filter((location) => {
        const matchesCategory = filter === 'All' || location.category === filter;
        const matchesQuery = location.name.toLowerCase().includes(normalizedQuery)
            || location.category.toLowerCase().includes(normalizedQuery)
            || location.description.toLowerCase().includes(normalizedQuery);

        return matchesCategory && (normalizedQuery.length === 0 || matchesQuery);
    });

    // Save locations to localStorage
    useEffect(() => {
        localStorage.setItem('rsu_campus_locations', JSON.stringify(campusLocations));
    }, [campusLocations]);

    // Set initial selected location
    useEffect(() => {
        if (campusLocations.length > 0 && !selectedLocation) {
            setSelectedLocation(campusLocations[0]);
        }
    }, [campusLocations, selectedLocation]);
    const activeUpdates = courseUpdates.filter(update => {
        if (!normalizedQuery) return false; // Hide by default unless searching
        const q = normalizedQuery;
        return (
            update.courseCode.toLowerCase().includes(q) ||
            update.title.toLowerCase().includes(q) ||
            update.description.toLowerCase().includes(q)
        );
    });

    // Loader animation: show for 1.5s, then load app (skip loader if onboarding)
    useEffect(() => {
        if (onboarding) {
            setLoading(false);
            return;
        }
        const timer = setTimeout(() => setLoading(false), 1500);
        return () => clearTimeout(timer);
    }, [onboarding]);

    // Main map effect
    useEffect(() => {
        if (loading) return;
        if (!mapContainerRef.current || mapRef.current) return;

        const map = L.map(mapContainerRef.current, {
            center: [4.8205, 7.0510],
            zoom: 16,
            zoomControl: true,
            attributionControl: false
        });

        const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            subdomains: ['a', 'b', 'c']
        }).addTo(map);

        tileLayer.on('tileerror', () => setTileError(true));

        campusLocations.forEach((location) => {
            const marker = L.marker([location.latitude, location.longitude])
                .bindPopup(`<strong>${location.name}</strong><br/>${location.category}`)
                .addTo(map);
            markersRef.current[location.id] = marker;
        });

        eventLocations.forEach((event) => {
            const marker = L.circleMarker([event.latitude, event.longitude], {
                radius: 8,
                color: '#f59e0b',
                fillColor: '#fde68a',
                fillOpacity: 0.8,
                weight: 2
            }).bindPopup(`<strong>${event.title}</strong><br/>${event.description}`);
            eventMarkersRef.current[event.id] = marker;
            marker.addTo(map);
        });

        // Allow pinning by clicking on map
        map.on('click', (e) => {
            if (routeMode) {
                setCustomRoute((r) => [...r, { lat: e.latlng.lat, lng: e.latlng.lng }]);
            } else {
                setShowPinModal(true);
                setPinForm((prev) => ({ ...prev, lat: e.latlng.lat, lng: e.latlng.lng }));
            }
        });

        mapRef.current = map;
        const bounds = L.latLngBounds(campusLocations.map((location) => [location.latitude, location.longitude]));
        map.fitBounds(bounds.pad(0.25));

        map.whenReady(() => {
            if (selectedLocation) {
                const marker = markersRef.current[selectedLocation.id];
                if (marker) marker.openPopup();
            }
        });

        return () => {
            if (mapRef.current === map) {
                mapRef.current = null;
            }
            map.remove();
        };
    }, [loading, routeMode]);

    // Update markers when locations change
    useEffect(() => {
        if (!mapRef.current || loading) return;
        // Remove old markers
        Object.values(markersRef.current).forEach((marker) => mapRef.current.removeLayer(marker));
        markersRef.current = {};
        // Add new markers
        campusLocations.forEach((location) => {
            const marker = L.marker([location.latitude, location.longitude])
                .bindPopup(`<strong>${location.name}</strong><br/>${location.category}`)
                .addTo(mapRef.current);
            markersRef.current[location.id] = marker;
        });
        // Update bounds
        if (campusLocations.length > 0) {
            const bounds = L.latLngBounds(campusLocations.map((location) => [location.latitude, location.longitude]));
            mapRef.current.fitBounds(bounds.pad(0.25));
        }
    }, [campusLocations, loading]);

    // Modal map effect
    useEffect(() => {
        if (!showMapModal) {
            if (modalMapRef.current) {
                modalMapRef.current.remove();
                modalMapRef.current = null;
            }
            return;
        }
        // Wait for DOM to be ready
        const timer = setTimeout(() => {
            if (!modalMapContainerRef.current || modalMapRef.current) return;

            const map = L.map(modalMapContainerRef.current, {
                center: [4.8205, 7.0510],
                zoom: 16,
                zoomControl: true,
                attributionControl: false
            });

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
                subdomains: ['a', 'b', 'c']
            }).addTo(map);

            campusLocations.forEach((location) => {
                L.marker([location.latitude, location.longitude])
                    .bindPopup(`<strong>${location.name}</strong><br/>${location.category}`)
                    .addTo(map);
            });

            eventLocations.forEach((event) => {
                L.circleMarker([event.latitude, event.longitude], {
                    radius: 8,
                    color: '#f59e0b',
                    fillColor: '#fde68a',
                    fillOpacity: 0.8,
                    weight: 2
                }).bindPopup(`<strong>${event.title}</strong><br/>${event.description}`)
                    .addTo(map);
            });

            map.whenReady(() => {
                map.invalidateSize();
                map.openPopup();
            });

            modalMapRef.current = map;
        }, 100);

        return () => {
            clearTimeout(timer);
            if (modalMapRef.current) {
                modalMapRef.current.remove();
                modalMapRef.current = null;
            }
        };
    }, [showMapModal]);
    // Render pins on map
    useEffect(() => {
        if (!mapRef.current) return;
        // Remove old pin markers
        Object.values(pinMarkersRef.current).forEach((marker) => mapRef.current.removeLayer(marker));
        pinMarkersRef.current = {};
        // Add current pins
        pins.forEach((pin) => {
            const marker = L.marker([pin.lat, pin.lng], {
                icon: L.icon({
                    iconUrl: markerIcon,
                    iconRetinaUrl: markerIcon2x,
                    shadowUrl: markerShadow,
                    iconSize: [25, 41],
                    iconAnchor: [12, 41],
                    popupAnchor: [1, -34],
                    shadowSize: [41, 41]
                })
            }).bindPopup(`<strong>${pin.title || 'Pinned location'}</strong><br/>${pin.course ? 'Course: ' + pin.course + '<br/>' : ''}${pin.expiresAt ? 'Expires: ' + new Date(pin.expiresAt).toLocaleTimeString() : ''}<br/><button onclick=\"window.copyPin('${pin.shareCode}')\">Share</button>`);
            marker.addTo(mapRef.current);
            pinMarkersRef.current[pin.id] = marker;
        });
    }, [pins]);

    // Remove expired pins
    useEffect(() => {
        if (!pins.length) return;
        const now = Date.now();
        const filtered = pins.filter((pin) => !pin.expiresAt || pin.expiresAt > now);
        if (filtered.length !== pins.length) setPins(filtered);
        // Check every 30s
        const timer = setTimeout(() => {
            const now2 = Date.now();
            setPins((pins) => pins.filter((pin) => !pin.expiresAt || pin.expiresAt > now2));
        }, 30000);
        return () => clearTimeout(timer);
    }, [pins]);

    useEffect(() => {
        if (!mapRef.current || !mapRef.current._loaded || !selectedLocation) return;
        const marker = markersRef.current[selectedLocation.id];
        if (marker) {
            marker.openPopup();
            mapRef.current.flyTo([selectedLocation.latitude, selectedLocation.longitude], 17, { animate: true, duration: 0.8 });
        }

        if (routeRef.current) {
            mapRef.current.removeLayer(routeRef.current);
            routeRef.current = null;
        }

        // Custom route
        if (customRoute.length > 1) {
            const latlngs = customRoute.map((p) => [p.lat, p.lng]);
            routeRef.current = L.polyline(latlngs, {
                color: '#10b981',
                weight: 5,
                opacity: 0.9,
                dashArray: '8,8'
            }).addTo(mapRef.current);
        } else {
            // Default route
            const origin = campusLocations[0];
            if (selectedLocation && selectedLocation.id !== origin.id) {
                const routePath = selectedLocation.pathCoordinates?.length > 1
                    ? selectedLocation.pathCoordinates
                    : [
                        [origin.latitude, origin.longitude],
                        [selectedLocation.latitude, selectedLocation.longitude]
                    ];
                routeRef.current = L.polyline(routePath, {
                    color: '#2563eb',
                    weight: 4,
                    opacity: 0.8,
                    dashArray: '12,8'
                }).addTo(mapRef.current);
            }
        }
    }, [selectedLocation, customRoute]);

    useEffect(() => {
        if (!mapRef.current) return;
        Object.values(eventMarkersRef.current).forEach((marker) => {
            if (showEventLayer) {
                marker.addTo(mapRef.current);
            } else {
                mapRef.current.removeLayer(marker);
            }
        });
    }, [showEventLayer]);

    useEffect(() => {
        if (filteredLocations.length === 0 || !selectedLocation) return;
        if (!filteredLocations.some((location) => location.id === selectedLocation.id)) {
            setSelectedLocation(filteredLocations[0]);
        }
    }, [filteredLocations, selectedLocation]);

    useEffect(() => {
        if (normalizedQuery.length === 0 || filteredLocations.length === 0 || !selectedLocation) return;
        if (filteredLocations[0].id !== selectedLocation.id) {
            setSelectedLocation(filteredLocations[0]);
        }
    }, [normalizedQuery, filteredLocations, selectedLocation]);

    // For scroll-to-map functionality
    const mapSectionRef = useRef(null);

    const openMap = () => {
        setShowMapModal(true);
    };

    const handleExploreClick = openMap;
    const handleFloatingMapClick = openMap;

    // Pin modal handlers
    const handlePinFormChange = (e) => {
        const { name, value } = e.target;
        setPinForm((f) => ({ ...f, [name]: value }));
    };
    const handlePinSubmit = (e) => {
        e.preventDefault();
        if (!pinForm.lat || !pinForm.lng) return;
        const id = 'pin-' + Date.now();
        const shareCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        const expiresAt = pinForm.duration ? Date.now() + Number(pinForm.duration) * 60000 : null;
        setPins((pins) => [
            ...pins,
            {
                id,
                lat: pinForm.lat,
                lng: pinForm.lng,
                title: pinForm.title,
                course: pinForm.course,
                expiresAt,
                shareCode,
                userCode
            }
        ]);
        setShowPinModal(false);
        setSharePin({ ...pinForm, lat: pinForm.lat, lng: pinForm.lng, shareCode, expiresAt, userCode });
        setPinForm({ title: '', course: '', duration: 15 });
        // Open map modal and focus on pin
        setShowMapModal(true);
        setTimeout(() => {
            setCustomRoute([{ lat: 4.8205, lng: 7.0510 }, { lat: pinForm.lat, lng: pinForm.lng }]);
        }, 500);
    };
    // Share pin handler
    const handleCopyShare = (code) => {
        if (navigator && navigator.clipboard) {
            navigator.clipboard.writeText(code);
        }
    };

    useEffect(() => {
        window.copyPin = (code) => {
            if (navigator && navigator.clipboard) {
                navigator.clipboard.writeText(code);
            }
        };
        return () => {
            window.copyPin = undefined;
        };
    }, []);

    return (
        <>
            {/* Onboarding Modal (first-time users) */}
            {onboarding && (
                <>
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        zIndex: 10000,
                        background: 'rgba(0,0,0,0.18)',
                        pointerEvents: 'auto',
                        backdropFilter: 'blur(2px)',
                        transition: 'background 0.3s'
                    }} />
                    <OnboardingModal onSubmit={(profile) => {
                        setUserProfile(profile);
                        setOnboarding(false);
                        localStorage.setItem('rsu_onboarding', '1');
                        localStorage.setItem('rsu_user_profile', JSON.stringify(profile));
                    }} />
                </>
            )}
            {/* Loader Animation Overlay */}
            {loading && !onboarding && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    background: 'rgba(255,255,255,0.96)',
                    zIndex: 9999,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                }}>
                    <div style={{
                        width: 80,
                        height: 80,
                        border: '8px solid var(--rsu-light-gray)',
                        borderTop: '8px solid var(--rsu-navy)',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        marginBottom: 24,
                        boxShadow: '0 4px 16px rgba(2, 11, 91, 0.1)'
                    }} />
                    <h2 style={{ color: 'var(--rsu-navy)' }}>Loading Campus Map...</h2>
                    <style>{`@keyframes spin { 0% { transform: rotate(0deg);} 100% { transform: rotate(360deg);} }`}</style>
                </div>
            )}
            <div className="app-shell" style={{ filter: (loading || onboarding) ? 'blur(2.5px)' : 'none', pointerEvents: (loading || onboarding) ? 'none' : 'auto', transition: 'filter 0.3s' }}>
                {/* Header */}
                <header className="rsu-header">
                    <div className="header-left">
                        <div className="rsu-logo">
                            <span className="logo-text">RSU</span>
                            <span className="logo-subtitle">Smart Campus</span>
                        </div>
                    </div>
                    <div className="header-center">
                        <div className="search-container">
                            <input
                                type="text"
                                placeholder="Search campus locations..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="header-search"
                            />
                        </div>
                    </div>
                    <div className="header-right">
                        <button className="header-cta" onClick={openMap} aria-label="Explore Campus Map">
                            Explore Map
                        </button>
                        {userProfile && (
                            <div className="profile-summary">
                                <span>{userProfile.faculty}</span>
                                <span>{userProfile.department}</span>
                                <span>{userProfile.level}</span>
                            </div>
                        )}
                        <button className="header-icon-btn" title="Notifications">
                            <span>🔔</span>
                        </button>
                        <button className="header-icon-btn" title="Profile" onClick={() => setOnboarding(true)}>
                            <span>👤</span>
                        </button>
                    </div>
                </header>

                {/* Floating map button */}
                <button
                    className="floating-map-btn"
                    title="Open Campus Map"
                    onClick={handleFloatingMapClick}
                    aria-label="Open Campus Map"
                >
                    🗺️
                </button>
                <div style={{ position: 'fixed', bottom: 100, right: 32, background: 'var(--rsu-white)', padding: '8px 16px', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', zIndex: 3000, fontSize: 13, color: 'var(--rsu-text)', fontWeight: 600 }}>
                    <b>Your Code:</b> {userCode}
                </div>

                {/* Pin Modal */}
                {showPinModal && (
                    <div className="map-modal-overlay" onClick={e => { if (e.target.className === 'map-modal-overlay') setShowPinModal(false); }}>
                        <div className="map-modal-content" style={{ maxWidth: 400, minWidth: 320, minHeight: 0, padding: 32 }}>
                            <button style={{ position: 'absolute', top: 18, right: 18, background: 'var(--rsu-navy)', color: 'var(--rsu-white)', border: 'none', borderRadius: '50%', width: 40, height: 40, fontSize: 22, cursor: 'pointer', zIndex: 10 }} title="Close" onClick={() => setShowPinModal(false)}>×</button>
                            <h2>Pin a Location</h2>
                            <form onSubmit={handlePinSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                <input name="title" placeholder="Title" value={pinForm.title} onChange={handlePinFormChange} required style={{ padding: 10, borderRadius: 8, border: '1px solid var(--rsu-light-gray)' }} />
                                <input name="course" placeholder="Course (optional)" value={pinForm.course} onChange={handlePinFormChange} style={{ padding: 10, borderRadius: 8, border: '1px solid var(--rsu-light-gray)' }} />
                                <input name="duration" type="number" min={1} max={120} placeholder="Duration (minutes)" value={pinForm.duration} onChange={handlePinFormChange} style={{ padding: 10, borderRadius: 8, border: '1px solid var(--rsu-light-gray)' }} />
                                <button className="primary" type="submit">Pin</button>
                            </form>
                        </div>
                    </div>
                )}

                {/* Share Modal */}
                {sharePin && (
                    <div className="map-modal-overlay" onClick={e => { if (e.target.className === 'map-modal-overlay') setSharePin(null); }}>
                        <div className="map-modal-content" style={{ maxWidth: 400, minWidth: 320, minHeight: 0, padding: 32 }}>
                            <button style={{ position: 'absolute', top: 18, right: 18, background: 'var(--rsu-navy)', color: 'var(--rsu-white)', border: 'none', borderRadius: '50%', width: 40, height: 40, fontSize: 22, cursor: 'pointer', zIndex: 10 }} title="Close" onClick={() => setSharePin(null)}>×</button>
                            <h2>Share Pin</h2>
                            <div style={{ marginBottom: 16 }}>Share code: <strong>{sharePin.shareCode}</strong></div>
                            <button className="primary" onClick={() => { navigator.clipboard.writeText(sharePin.shareCode); }}>Copy Code</button>
                        </div>
                    </div>
                )}

                {/* Add Location Modal */}
                {showAddLocationModal && (
                    <div className="map-modal-overlay" onClick={e => { if (e.target.className === 'map-modal-overlay') setShowAddLocationModal(false); }}>
                        <div className="map-modal-content" style={{ maxWidth: 400, minWidth: 320, minHeight: 0, padding: 32 }}>
                            <button style={{ position: 'absolute', top: 18, right: 18, background: 'var(--rsu-navy)', color: 'var(--rsu-white)', border: 'none', borderRadius: '50%', width: 40, height: 40, fontSize: 22, cursor: 'pointer', zIndex: 10 }} title="Close" onClick={() => setShowAddLocationModal(false)}>×</button>
                            <h2>Add New Location</h2>
                            <form onSubmit={(e) => {
                                e.preventDefault();
                                const newLocation = {
                                    id: Date.now(),
                                    name: addLocationForm.name,
                                    category: addLocationForm.category,
                                    description: addLocationForm.description,
                                    latitude: parseFloat(addLocationForm.latitude),
                                    longitude: parseFloat(addLocationForm.longitude),
                                    imageUrl: 'https://via.placeholder.com/400x250.png?text=' + encodeURIComponent(addLocationForm.name) + '+Exterior',
                                    insideImageUrl: 'https://via.placeholder.com/400x250.png?text=' + encodeURIComponent(addLocationForm.name) + '+Interior',
                                    pathCoordinates: [[4.8205, 7.0510], [parseFloat(addLocationForm.latitude), parseFloat(addLocationForm.longitude)]]
                                };
                                setCampusLocations(prev => [...prev, newLocation]);
                                setShowAddLocationModal(false);
                                setAddLocationForm({ name: '', category: 'Landmark', description: '', latitude: '', longitude: '' });
                            }} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                <input name="name" placeholder="Location Name" value={addLocationForm.name} onChange={(e) => setAddLocationForm(prev => ({ ...prev, name: e.target.value }))} required style={{ padding: 10, borderRadius: 8, border: '1px solid var(--rsu-light-gray)' }} />
                                <select name="category" value={addLocationForm.category} onChange={(e) => setAddLocationForm(prev => ({ ...prev, category: e.target.value }))} style={{ padding: 10, borderRadius: 8, border: '1px solid var(--rsu-light-gray)' }}>
                                    {categories.filter(c => c !== 'All').map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                </select>
                                <textarea name="description" placeholder="Description" value={addLocationForm.description} onChange={(e) => setAddLocationForm(prev => ({ ...prev, description: e.target.value }))} required style={{ padding: 10, borderRadius: 8, border: '1px solid var(--rsu-light-gray)', minHeight: 60 }} />
                                <input name="latitude" type="number" step="0.0001" placeholder="Latitude" value={addLocationForm.latitude} onChange={(e) => setAddLocationForm(prev => ({ ...prev, latitude: e.target.value }))} required style={{ padding: 10, borderRadius: 8, border: '1px solid var(--rsu-light-gray)' }} />
                                <input name="longitude" type="number" step="0.0001" placeholder="Longitude" value={addLocationForm.longitude} onChange={(e) => setAddLocationForm(prev => ({ ...prev, longitude: e.target.value }))} required style={{ padding: 10, borderRadius: 8, border: '1px solid var(--rsu-light-gray)' }} />
                                <button className="primary" type="submit">Add Location</button>
                            </form>
                        </div>
                    </div>
                )}

                {/* Help Modal */}
                {showHelp && (
                    <div className="map-modal-overlay" onClick={e => { if (e.target.className === 'map-modal-overlay') setShowHelp(false); }}>
                        <div className="map-modal-content" style={{ maxWidth: 500, minWidth: 320, minHeight: 0, padding: 32 }}>
                            <button style={{ position: 'absolute', top: 18, right: 18, background: 'var(--rsu-navy)', color: 'var(--rsu-white)', border: 'none', borderRadius: '50%', width: 40, height: 40, fontSize: 22, cursor: 'pointer', zIndex: 10 }} title="Close" onClick={() => setShowHelp(false)}>×</button>
                            <h2>How to Use</h2>
                            <ul style={{ lineHeight: 1.7 }}>
                                <li>Browse and search for campus locations.</li>
                                <li>Click a location to view details and map.</li>
                                <li>Pin a location by clicking on the map or using the Pin button.</li>
                                <li>Share a pin with others using the share code.</li>
                                <li>Toggle event markers and custom routes.</li>
                            </ul>
                        </div>
                    </div>
                )}

                {/* Map Modal */}
                {showMapModal && (
                    <div className="map-modal-overlay" onClick={(e) => { if (e.target.className === 'map-modal-overlay') setShowMapModal(false); }}>
                        <div className="map-modal-content">
                            <button
                                style={{
                                    position: 'absolute',
                                    top: 18,
                                    right: 18,
                                    background: 'var(--rsu-navy)',
                                    color: 'var(--rsu-white)',
                                    border: 'none',
                                    borderRadius: '50%',
                                    width: 40,
                                    height: 40,
                                    fontSize: 22,
                                    cursor: 'pointer',
                                    zIndex: 99999,
                                    transition: 'all 0.2s ease',
                                    boxShadow: '0 4px 16px rgba(2, 11, 91, 0.3)'
                                }}
                                title="Close Map"
                                onMouseEnter={(e) => e.target.style.background = 'var(--rsu-navy-dark)'}
                                onMouseLeave={(e) => e.target.style.background = 'var(--rsu-navy)'}
                                onClick={() => setShowMapModal(false)}
                            >
                                ×
                            </button>
                            <div style={{ padding: 24, width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
                                <div ref={modalMapContainerRef} style={{ width: '100%', flex: 1, borderRadius: 24, minHeight: 300 }} />
                            </div>
                        </div>
                    </div>
                )}

                {/* Main layout always visible */}
                <main className="layout">
                    <section className="panel">
                        <div className="panel-top">
                            <div>
                                <h2>Locations</h2>
                                <p>Browse all campus locations and filter by category.</p>
                            </div>
                            <div className="controls">
                                <label>
                                    Category:
                                    <select value={filter} onChange={e => setFilter(e.target.value)}>
                                        {categories.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </label>
                                <button className="toggle-button" onClick={() => setShowAddLocationModal(true)}>➕ Add Location</button>
                            </div>
                        </div>
                        <div className="search-row">
                            <input
                                className="search-input"
                                type="text"
                                placeholder="Search locations..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                            <button className="toggle-button" onClick={() => setShowPinModal(true)}>📌 Pin</button>
                            <button className={`toggle-button${showEventLayer ? ' active' : ''}`} onClick={() => setShowEventLayer(v => !v)}>{showEventLayer ? '✓ Events' : '◯ Events'}</button>
                            <button className={`toggle-button${routeMode ? ' active' : ''}`} onClick={() => setRouteMode(v => !v)}>{routeMode ? '✓ Route' : '◯ Route'}</button>
                        </div>
                        <div className="location-count">{filteredLocations.length} locations found</div>
                        <div className="location-list">
                            {[...filteredLocations, ...filteredLocations, ...filteredLocations].map((loc, index) => {
                                const iconText = getLocationIconText(loc.name);
                                return (
                                    <div
                                        key={`${loc.id}-${index}`}
                                        className={`location-card${selectedLocation?.id === loc.id ? ' active' : ''}`}
                                        onClick={() => setSelectedLocation(loc)}
                                        role="button"
                                        tabIndex={0}
                                        aria-label={`Select ${loc.name} location`}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' || e.key === ' ') {
                                                e.preventDefault();
                                                setSelectedLocation(loc);
                                            }
                                        }}
                                    >
                                        <div className="location-icon">{iconText}</div>
                                        <div className="location-card-meta">
                                            <strong>{loc.name}</strong>
                                            <span>{loc.category}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="update-grid">
                            {activeUpdates.map(update => (
                                <div className="update-card" key={update.id}>
                                    <div className="update-badge">{update.courseCode}</div>
                                    <h3>{update.title}</h3>
                                    <p>{update.description}</p>
                                    <div className="update-meta">
                                        <span>{update.faculty}</span>
                                        <span>{update.level}</span>
                                        <span>Expires: {update.expiresAt}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                    <section className="preview">
                        <div className="preview-header">
                            <h2>{currentLocation.name}</h2>
                            <span className="status-chip">{currentLocation.category}</span>
                        </div>
                        <div className="meta">{currentLocation.description}</div>
                        <div className="preview-image">
                            <img
                                src={viewMode === 'Exterior' ? currentLocation.imageUrl : currentLocation.insideImageUrl}
                                alt={currentLocation.name + ' view'}
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = createPlaceholderImage(`${currentLocation.name} ${viewMode}`);
                                }}
                            />
                        </div>
                        <div className="view-toggle-row">
                            <button
                                className={`toggle-pill${viewMode === 'Exterior' ? ' active' : ''}`}
                                onClick={() => setViewMode('Exterior')}
                            >
                                Exterior
                            </button>
                            <button
                                className={`toggle-pill${viewMode === 'Interior' ? ' active' : ''}`}
                                onClick={() => setViewMode('Interior')}
                            >
                                Interior
                            </button>
                        </div>
                        <div className="map-placeholder">
                            <div>
                                Campus map is hidden until you open it.
                            </div>
                            <button className="primary" onClick={openMap}>Explore Campus Map</button>
                        </div>
                        <div className="map-info-row">
                            <div className="map-info-box">
                                <strong>Coordinates</strong>
                                <p>Lat: {currentLocation.latitude}, Lng: {currentLocation.longitude}</p>
                            </div>
                            <div className="map-info-box">
                                <strong>Path</strong>
                                <p>{currentLocation.pathCoordinates.map(([lat, lng]) => `(${lat}, ${lng})`).join(' → ')}</p>
                            </div>
                        </div>
                    </section>
                </main>
            </div>
        </>
    );
}
export default App;
