import React, { useState } from 'react';
import './Collapsible.css';

export interface CollapsibleProps {
    title: string;
    children: React.ReactNode;
}

const Collapsible: React.FC<CollapsibleProps> = ({ title, children }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="collapsible">
            <button className="collapsible-toggle" onClick={() => setIsOpen(!isOpen)}>
                {isOpen ? '▼' : '►'} {title}
            </button>
            <div
                className={`collapsible-content ${isOpen ? 'open' : ''}`}
            >
                {isOpen && children} 
            </div>
        </div>
    );
};

export default Collapsible;
