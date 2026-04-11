import React from 'react';

const GenericModal = ({ isOpen, title, onClose, children }) => {
    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'var(--modal-overlay)', zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
            <div className="admin-card" style={{
                width: '700px',
                maxWidth: '95%',
                maxHeight: '90vh',
                display: 'flex',
                flexDirection: 'column'
            }}>
                {/* Header */}
                <div style={{
                    padding: '15px 25px',
                    borderBottom: '1px solid var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    <h3 style={{ margin: 0, fontSize: '18px', color: 'var(--text)' }}>{title}</h3>
                    <button onClick={onClose} style={{
                        background: 'transparent',
                        border: 'none',
                        fontSize: '24px',
                        cursor: 'pointer',
                        color: '#8b9ca8',
                        fontWeight: 'bold'
                    }}>
                        &times;
                    </button>
                </div>
                
                {/* Body */}
                <div style={{ padding: '25px', overflowY: 'auto' }}>
                    {children}
                </div>
            </div>
        </div>
    );
};

export default GenericModal;
