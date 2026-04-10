import React from 'react';

const GenericModal = ({ isOpen, title, onClose, children }) => {
    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)', zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
            <div style={{
                background: '#fff',
                width: '600px',
                maxWidth: '90%',
                maxHeight: '90vh',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                display: 'flex',
                flexDirection: 'column'
            }}>
                {/* Header */}
                <div style={{
                    padding: '15px 20px',
                    borderBottom: '1px solid #eee',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    <h3 style={{ margin: 0, fontSize: '18px' }}>{title}</h3>
                    <button onClick={onClose} style={{
                        background: 'transparent',
                        border: 'none',
                        fontSize: '20px',
                        cursor: 'pointer',
                        color: '#dc3545'
                    }}>
                        &times;
                    </button>
                </div>
                
                {/* Body */}
                <div style={{ padding: '20px', overflowY: 'auto' }}>
                    {children}
                </div>
            </div>
        </div>
    );
};

export default GenericModal;
