import React, { useState, useEffect } from 'react';
import { useLocation } from '@docusaurus/router';
import './Collapsible.css';

export interface CollapsibleProps {
    title: string;
    children: React.ReactNode;
}

const Collapsible: React.FC<CollapsibleProps> = ({ title, children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();

    useEffect(() => {
        if (location.hash) {
            console.log('Hash changed to:', location.hash);
            const hash = location.hash.slice(1);
            console.log('Looking for element with id:', hash);
            
            const headings = document.querySelectorAll('h1, h2, h3');
            console.log('Found headings:', Array.from(headings).map(h => ({
                id: h.id,
                text: h.textContent,
                isInCollapsible: !!h.closest('.collapsible-content')
            })));

            headings.forEach(heading => {
                if (heading.id === hash && heading.closest('.collapsible-content')) {
                    console.log('Found matching heading, opening collapsible');
                    setIsOpen(true);
                    setTimeout(() => {
                        heading.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                }
            });
        }
    }, [location]);

    return (
        <div className="collapsible">
            <button className="collapsible-toggle" onClick={() => setIsOpen(!isOpen)}>
                {isOpen ? '▼' : '►'} {title}
            </button>
            <div className={`collapsible-content ${isOpen ? 'open' : ''}`}>
                {children}
            </div>
        </div>
    );
};

export default Collapsible;
