import React from 'react';

interface GreenButtonProps {
    text: string;
    onClick: () => void;
    className?: string;
}

const GreenButton: React.FC<GreenButtonProps> = ({ text, onClick, className = '' }) => {
    return (
        <button className={`bg-green-500 text-white rounded-md p-2 mt-2 mb-2 ${className}`} onClick={onClick}>
            {text}
        </button>
    );
};

export default GreenButton;