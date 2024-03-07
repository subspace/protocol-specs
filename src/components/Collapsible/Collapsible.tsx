import React, { useRef, useState, useEffect } from 'react';
import './Collapsible.css';

export interface CollapsibleProps {
    title: string;
    children: React.ReactNode;
}

const Collapsible: React.FC<CollapsibleProps> = ({ title, children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const contentRef = useRef<HTMLDivElement>(null);
    const [maxHeight, setMaxHeight] = useState<string>('0px');

    useEffect(() => {
        if (isOpen && contentRef.current) {
            setMaxHeight(`${contentRef.current.scrollHeight}px`);
        } else {
            setMaxHeight('0px');
        }
    }, [isOpen]);

    return (
        <div className="collapsible">
            <button className="collapsible-toggle" onClick={() => setIsOpen(!isOpen)}>
                {isOpen ? '▼' : '►'} {title}
            </button>
            <div
                className="collapsible-content"
                ref={contentRef}
                style={{ maxHeight: maxHeight }}
            >
                {children}
            </div>
        </div>
    );
};

export default Collapsible;
