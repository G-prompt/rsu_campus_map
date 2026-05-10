import React, { useState } from 'react';

const faculties = [
    {
        name: 'Engineering', departments: [
            'Computer Engineering',
            'Petroleum Engineering',
            'Agricultural Engineering',
            'Civil Engineering',
            'Chemical/Petrochemical Engineering',
            'Electrical Engineering',
            'Mechanical Engineering'
        ]
    },
    { name: 'Science', departments: ['Computer Science', 'Biological Sciences', 'Chemistry'] },
    { name: 'Management Sciences', departments: ['Accounting', 'Banking & Finance', 'Marketing'] },
    { name: 'Law', departments: ['Law'] },
    { name: 'Education', departments: ['Educational Foundations', 'Curriculum Studies'] },
    { name: 'Agriculture', departments: ['Crop Science', 'Animal Science'] },
    { name: 'Environmental Sciences', departments: ['Architecture', 'Urban & Regional Planning'] },
    { name: 'Humanities', departments: ['English', 'History', 'Philosophy'] },
    { name: 'Social Sciences', departments: ['Economics', 'Political Science', 'Psychology'] },
    { name: 'Medicine', departments: ['Medicine', 'Nursing'] },
    // Add all RSU faculties and departments here
];

const levels = [
    '100L', '200L', '300L', '400L', '500L', 'Postgraduate'
];

export default function OnboardingModal({ onSubmit }) {
    const [faculty, setFaculty] = useState('');
    const [department, setDepartment] = useState('');
    const [level, setLevel] = useState('');
    const [show, setShow] = useState(true);

    const selectedFaculty = faculties.find(f => f.name === faculty);
    const departments = selectedFaculty ? selectedFaculty.departments : [];

    const handleSubmit = (e) => {
        e.preventDefault();
        if (faculty && department && level) {
            setShow(false);
            setTimeout(() => onSubmit({ faculty, department, level }), 350);
        }
    };

    if (!show) return null;

    return (
        <div className="onboarding-modal-overlay">
            <div className="onboarding-modal-card">
                <form onSubmit={handleSubmit} className="onboarding-form">
                    <h2>Welcome to RSU Campus Map</h2>
                    <p className="subtitle">Let’s personalize your experience</p>
                    <label>
                        Faculty
                        <select value={faculty} onChange={e => { setFaculty(e.target.value); setDepartment(''); }} required>
                            <option value="" disabled>Select Faculty</option>
                            {faculties.map(f => <option key={f.name} value={f.name}>{f.name}</option>)}
                        </select>
                    </label>
                    <label>
                        Department
                        <select value={department} onChange={e => setDepartment(e.target.value)} required disabled={!faculty}>
                            <option value="" disabled>Select Department</option>
                            {departments.map(dep => <option key={dep} value={dep}>{dep}</option>)}
                        </select>
                    </label>
                    <label>
                        Level
                        <select value={level} onChange={e => setLevel(e.target.value)} required>
                            <option value="" disabled>Select Level</option>
                            {levels.map(lvl => <option key={lvl} value={lvl}>{lvl}</option>)}
                        </select>
                    </label>
                    <button type="submit" className="onboarding-cta">Continue</button>
                </form>
            </div>
        </div>
    );
}
