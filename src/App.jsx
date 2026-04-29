import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const campusLocations = [
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

L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow
});

function App() {
    // Loader state
    const [loading, setLoading] = useState(true);
    // Main app state
    const [selectedLocation, setSelectedLocation] = useState(campusLocations[0]);
    const [filter, setFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState('Exterior');
    const [showEventLayer, setShowEventLayer] = useState(true);
    const [tileError, setTileError] = useState(false);
    const [pins, setPins] = useState([]); // {id, lat, lng, title, course, expiresAt, shareCode}
    const [showPinModal, setShowPinModal] = useState(false);
    const [pinForm, setPinForm] = useState({ title: '', course: '', duration: 15 });
    const [sharePin, setSharePin] = useState(null); // pin to share
    // Custom route state
    const [routeMode, setRouteMode] = useState(false);
    const [customRoute, setCustomRoute] = useState([]); // [{lat, lng}]
    // Help modal
    const [showHelp, setShowHelp] = useState(false);
    const mapContainerRef = useRef(null);
    const mapRef = useRef(null);
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

    const activeUpdates = courseUpdates;

    // Loader animation: show for 1.5s, then load app
    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 1500);
        return () => clearTimeout(timer);
    }, []);

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
            const marker = markersRef.current[selectedLocation.id];
            if (marker) marker.openPopup();
        });

        return () => {
            if (mapRef.current === map) {
                mapRef.current = null;
            }
            map.remove();
        };
    }, [loading, routeMode]);
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
        if (!mapRef.current || !mapRef.current._loaded) return;
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
            if (selectedLocation.id !== origin.id) {
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
        if (filteredLocations.length === 0) return;
        if (!filteredLocations.some((location) => location.id === selectedLocation.id)) {
            setSelectedLocation(filteredLocations[0]);
        }
    }, [filteredLocations, selectedLocation.id]);

    useEffect(() => {
        if (normalizedQuery.length === 0 || filteredLocations.length === 0) return;
        if (filteredLocations[0].id !== selectedLocation.id) {
            setSelectedLocation(filteredLocations[0]);
        }
    }, [normalizedQuery, filteredLocations, selectedLocation.id]);

    // For scroll-to-map functionality
    const mapSectionRef = useRef(null);

    const handleExploreClick = () => {
        if (mapSectionRef.current) {
            mapSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

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
                shareCode
            }
        ]);
        setShowPinModal(false);
        setSharePin({ ...pinForm, lat: pinForm.lat, lng: pinForm.lng, shareCode, expiresAt });
        setPinForm({ title: '', course: '', duration: 15 });
    };
    // Share pin handler
    const handleCopyShare = (code) => {
        navigator.clipboard.writeText(window.location.href + '?pin=' + code);
        alert('Share link copied!');
    };

    // Expose copyPin for popup button
    useEffect(() => {
        window.copyPin = handleCopyShare;
        return () => { delete window.copyPin; };
    }, []);

    if (loading) {
        // Simple campus map style loader animation
        return (
            <div style={{
                minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#fff', color: '#222'
            }}>
                <svg width="120" height="120" viewBox="0 0 120 120" style={{ marginBottom: 24 }}>
                    <circle cx="60" cy="60" r="50" stroke="#222" strokeWidth="4" fill="none" opacity="0.2" />
                    <path d="M60 20 Q80 60 60 100 Q40 60 60 20 Z" fill="#222" opacity="0.12">
                        <animateTransform attributeName="transform" type="rotate" from="0 60 60" to="360 60 60" dur="1.2s" repeatCount="indefinite" />
                    </path>
                    <circle cx="60" cy="60" r="32" stroke="#222" strokeWidth="2" fill="none" opacity="0.12" />
                </svg>
                <div style={{ fontWeight: 700, fontSize: '1.2em', marginBottom: 8 }}>Loading Campus Map…</div>
                <div style={{ color: '#666', fontSize: '1em' }}>Please wait</div>
            </div>
        );
    }

    return (
        <div className="app-shell">
            <header className="hero">
                <div>
                    <h1>RSU Smart Campus Map</h1>
                    <p>Interactive campus navigation with quick updates, event highlights, and route previews.</p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button className="primary" onClick={handleExploreClick}>Explore campus</button>
                    <button className="toggle-button" title="Help" onClick={() => setShowHelp(true)}>?</button>
                </div>
            </header>

            <main className="layout" ref={mapSectionRef}>
                <section className="panel">
                    <div style={{ marginBottom: 12, display: 'flex', gap: 8 }}>
                        <button className="toggle-button" onClick={() => {
                            setShowPinModal(true);
                            setPinForm({ ...pinForm, lat: selectedLocation.latitude, lng: selectedLocation.longitude });
                        }}>Pin this location</button>
                        <button className="toggle-button" onClick={() => setRouteMode((v) => !v)} style={{ background: routeMode ? '#10b981' : undefined, color: routeMode ? '#fff' : undefined }}>{routeMode ? 'Finish Route' : 'Custom Route'}</button>
                        <button className="toggle-button" onClick={() => { setCustomRoute([]); setRouteMode(false); }}>Clear Route</button>
                        <button className="toggle-button" onClick={() => setPins([])}>Clear Pins</button>
                    </div>
                    <div className="panel-top">
                        <div>
                            <h2>Campus updates</h2>
                            <p>Live notices and event markers for students and visitors.</p>
                        </div>
                        <button className="toggle-button" onClick={() => setShowEventLayer((value) => !value)}>
                            {showEventLayer ? 'Hide event layer' : 'Show event layer'}
                        </button>
                    </div>

                    {/* Demo updates removed for clarity. Pins are now the main focus. */}
                    <div className="update-grid">
                        {pins.length === 0 && (
                            <div style={{ color: '#888', fontStyle: 'italic', padding: 8 }}>No pins yet. Pin a location to share or add a course!</div>
                        )}
                        {pins.map((pin) => (
                            <article key={pin.id} className="update-card">
                                <div className="update-badge">{pin.course || 'PIN'}</div>
                                <h3>{pin.title || 'Pinned location'}</h3>
                                <p>Lat {pin.lat.toFixed(6)}, Lng {pin.lng.toFixed(6)}</p>
                                <div className="update-meta">
                                    {pin.expiresAt && <span>Expires {new Date(pin.expiresAt).toLocaleTimeString()}</span>}
                                    <button className="toggle-button" style={{ marginLeft: 8 }} onClick={() => handleCopyShare(pin.shareCode)}>Share</button>
                                </div>
                            </article>
                        ))}
                    </div>
                    {/* Pin modal */}
                    {showPinModal && (
                        <div style={{
                            position: 'fixed', left: 0, top: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.3)', zIndex: 1000,
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <form style={{ background: '#fff', padding: 24, borderRadius: 16, minWidth: 280, maxWidth: 340 }} onSubmit={handlePinSubmit}>
                                <h3>Pin a location</h3>
                                <label style={{ display: 'block', marginBottom: 8 }}>
                                    Title (optional)
                                    <input name="title" value={pinForm.title} onChange={handlePinFormChange} style={{ width: '100%', marginTop: 4, marginBottom: 8 }} />
                                </label>
                                <label style={{ display: 'block', marginBottom: 8 }}>
                                    Course (optional)
                                    <input name="course" value={pinForm.course} onChange={handlePinFormChange} style={{ width: '100%', marginTop: 4, marginBottom: 8 }} />
                                </label>
                                <label style={{ display: 'block', marginBottom: 8 }}>
                                    Duration (minutes)
                                    <input name="duration" type="number" min="1" max="240" value={pinForm.duration} onChange={handlePinFormChange} style={{ width: '100%', marginTop: 4, marginBottom: 8 }} />
                                </label>
                                <div style={{ fontSize: '0.95em', color: '#555', marginBottom: 8 }}>
                                    Pin will expire after this duration.
                                </div>
                                <div style={{ display: 'flex', gap: 12 }}>
                                    <button className="primary" type="submit">Pin</button>
                                    <button className="toggle-button" type="button" onClick={() => setShowPinModal(false)}>Cancel</button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Share modal */}
                    {/* Help modal */}
                    {showHelp && (
                        <div style={{
                            position: 'fixed', left: 0, top: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.3)', zIndex: 2000,
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <div style={{ background: '#fff', padding: 28, borderRadius: 18, minWidth: 320, maxWidth: 420, boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}>
                                <h2>How to use the Campus Map</h2>
                                <ul style={{ fontSize: '1.05em', margin: '18px 0 18px 0', paddingLeft: 18 }}>
                                    <li><b>Explore:</b> Use the search and filter to find campus locations.</li>
                                    <li><b>Pin:</b> Click "Pin this location" or click anywhere on the map to add a pin. Add a course, title, and duration if you wish.</li>
                                    <li><b>Share:</b> After pinning, copy the share link to invite others to the same spot.</li>
                                    <li><b>Route:</b> Click "Custom Route" then click points on the map to build a walking path. Click "Finish Route" to stop adding points. "Clear Route" removes the custom path.</li>
                                    <li><b>Event Layer:</b> Toggle event markers on/off.</li>
                                    <li><b>Clear Pins:</b> Remove all pins at once.</li>
                                </ul>
                                <button className="primary" onClick={() => setShowHelp(false)}>Close</button>
                            </div>
                        </div>
                    )}
                    {sharePin && (
                        <div style={{
                            position: 'fixed', left: 0, top: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.3)', zIndex: 1000,
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <div style={{ background: '#fff', padding: 24, borderRadius: 16, minWidth: 280, maxWidth: 340 }}>
                                <h3>Share this pin</h3>
                                <div style={{ wordBreak: 'break-all', marginBottom: 12 }}>
                                    <strong>Link:</strong><br />
                                    <span>{window.location.href + '?pin=' + sharePin.shareCode}</span>
                                </div>
                                <button className="primary" onClick={() => { handleCopyShare(sharePin.shareCode); setSharePin(null); }}>Copy link & close</button>
                                <button className="toggle-button" style={{ marginLeft: 8 }} onClick={() => setSharePin(null)}>Close</button>
                            </div>
                        </div>
                    )}

                    <div className="search-row">
                        <label>
                            Search places
                            <input
                                className="search-input"
                                type="search"
                                placeholder="Search by name, category, or keyword"
                                value={searchQuery}
                                onChange={(event) => setSearchQuery(event.target.value)}
                            />
                        </label>
                        <div className="filter-row">
                            <label>
                                Category filter
                                <select value={filter} onChange={(event) => setFilter(event.target.value)}>
                                    {categories.map((category) => (
                                        <option key={category} value={category}>{category}</option>
                                    ))}
                                </select>
                            </label>
                            <span className="location-count">{filteredLocations.length} place{filteredLocations.length === 1 ? '' : 's'} shown</span>
                        </div>
                    </div>

                    <div className="location-list">
                        {filteredLocations.map((location) => (
                            <button
                                key={location.id}
                                className={location.id === selectedLocation.id ? 'location-card active' : 'location-card'}
                                onClick={() => setSelectedLocation(location)}
                            >
                                <div>
                                    <strong>{location.name}</strong>
                                    <span>{location.category}</span>
                                </div>
                                <p>{location.description}</p>
                                <p className="location-coords">Lat {location.latitude.toFixed(6)}, Lng {location.longitude.toFixed(6)}</p>
                                <img src={location.imageUrl} alt={location.name} />
                            </button>
                        ))}
                    </div>
                </section>

                <section className="preview">
                    <div className="preview-header">
                        <div>
                            <h2>{selectedLocation.name}</h2>
                            <p className="meta">Category: {selectedLocation.category}</p>
                            <p className="meta">Lat {selectedLocation.latitude.toFixed(6)} · Lng {selectedLocation.longitude.toFixed(6)}</p>
                        </div>
                        <span className="status-chip">Campus map</span>
                    </div>

                    <div className="view-toggle-row">
                        {['Exterior', 'Interior'].map((mode) => (
                            <button
                                type="button"
                                key={mode}
                                className={viewMode === mode ? 'toggle-pill active' : 'toggle-pill'}
                                onClick={() => setViewMode(mode)}
                            >
                                {mode}
                            </button>
                        ))}
                    </div>

                    <div className="preview-image">
                        <img src={viewMode === 'Interior' ? selectedLocation.insideImageUrl || selectedLocation.imageUrl : selectedLocation.imageUrl} alt={`${selectedLocation.name} ${viewMode}`} />
                    </div>

                    <p>{selectedLocation.description}</p>

                    <div className="map-view" ref={mapContainerRef}>
                        {tileError && (
                            <div className="map-fallback">
                                <div style={{ fontWeight: 700, color: '#b91c1c', marginBottom: 8 }}>Map failed to load.</div>
                                <div style={{ color: '#555' }}>Check your internet connection or try again later.<br />You can still use the location list and route preview.</div>
                            </div>
                        )}
                    </div>

                    <div className="map-info-row">
                        <div className="map-info-box">
                            <strong>Route demo</strong>
                            <p>Path from Senate Building to the selected location.</p>
                        </div>
                        <div className="map-info-box">
                            <strong>Event layer</strong>
                            <p>{showEventLayer ? 'Active' : 'Hidden'}</p>
                        </div>
                    </div>

                    <p className="map-hint">Use the campus list to jump to a location and preview a walking route.</p>
                </section>
            </main>

            {/* Pin modal */}
            {showPinModal && (
                <div style={{
                    position: 'fixed', left: 0, top: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.3)', zIndex: 1000,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <form style={{ background: '#fff', padding: 24, borderRadius: 16, minWidth: 280, maxWidth: 340 }} onSubmit={handlePinSubmit}>
                        <h3>Pin a location</h3>
                        <label style={{ display: 'block', marginBottom: 8 }}>
                            Title (optional)
                            <input name="title" value={pinForm.title} onChange={handlePinFormChange} style={{ width: '100%', marginTop: 4, marginBottom: 8 }} />
                        </label>
                        <label style={{ display: 'block', marginBottom: 8 }}>
                            Course (optional)
                            <input name="course" value={pinForm.course} onChange={handlePinFormChange} style={{ width: '100%', marginTop: 4, marginBottom: 8 }} />
                        </label>
                        <label style={{ display: 'block', marginBottom: 8 }}>
                            Duration (minutes)
                            <input name="duration" type="number" min="1" max="240" value={pinForm.duration} onChange={handlePinFormChange} style={{ width: '100%', marginTop: 4, marginBottom: 8 }} />
                        </label>
                        <div style={{ fontSize: '0.95em', color: '#555', marginBottom: 8 }}>
                            Pin will expire after this duration.
                        </div>
                        <div style={{ display: 'flex', gap: 12 }}>
                            <button className="primary" type="submit">Pin</button>
                            <button className="toggle-button" type="button" onClick={() => setShowPinModal(false)}>Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            {/* Share modal */}
            {sharePin && (
                <div style={{
                    position: 'fixed', left: 0, top: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.3)', zIndex: 1000,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <div style={{ background: '#fff', padding: 24, borderRadius: 16, minWidth: 280, maxWidth: 340 }}>
                        <h3>Share this pin</h3>
                        <div style={{ wordBreak: 'break-all', marginBottom: 12 }}>
                            <strong>Link:</strong><br />
                            <span>{window.location.href + '?pin=' + sharePin.shareCode}</span>
                        </div>
                        <button className="primary" onClick={() => { handleCopyShare(sharePin.shareCode); setSharePin(null); }}>Copy link & close</button>
                        <button className="toggle-button" style={{ marginLeft: 8 }} onClick={() => setSharePin(null)}>Close</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;
