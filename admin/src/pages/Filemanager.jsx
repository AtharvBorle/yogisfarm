import React from 'react';
import FileManagerComponent from '../components/common/FileManager';

const Filemanager = () => {
    return (
        <div style={{ height: 'calc(100vh - 120px)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2>File Manager</h2>
            </div>
            
            <div style={{ height: '100%', background: 'var(--card-bg)', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', overflow: 'hidden', border: '1px solid var(--border)' }}>
                <FileManagerComponent />
            </div>
        </div>
    );
};

export default Filemanager;
