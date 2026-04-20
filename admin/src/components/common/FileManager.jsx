import React, { useState, useEffect, useRef } from 'react';
import api, { getAssetUrl } from '../../api';
import toast from 'react-hot-toast';

import { Folder } from 'react-feather';

const FileManager = ({ onSelect, onClose }) => {
    const [currentPath, setCurrentPath] = useState('');
    const [folders, setFolders] = useState([]);
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef(null);

    const loadFiles = async (path = '') => {
        setLoading(true);
        try {
            const res = await api.get(`/files?path=${encodeURIComponent(path)}`);
            if (res.data.status) {
                setFolders(res.data.folders);
                setFiles(res.data.files);
                setCurrentPath(res.data.currentPath);
            }
        } catch (error) {
            toast.error('Failed to load file manager');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadFiles('');
    }, []);

    const handleUpload = async (e) => {
        const selectedFiles = e.target.files;
        if (!selectedFiles.length) return;

        const formData = new FormData();
        // Send the current path so files go into the correct subfolder
        formData.append('uploadPath', currentPath);
        Array.from(selectedFiles).forEach(file => {
            formData.append('files', file);
        });

        const loadingToast = toast.loading('Uploading...');
        try {
            const res = await api.post('/files/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (res.data.status) {
                toast.success('Files uploaded', { id: loadingToast });
                loadFiles(currentPath);
            } else {
                toast.error(res.data.message, { id: loadingToast });
            }
        } catch (error) {
            toast.error('Upload failed', { id: loadingToast });
        }
        // Reset file input so same file can be re-selected
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const createFolder = async () => {
        const name = prompt('Enter new folder name:');
        if (!name) return;
        try {
            const res = await api.post('/files/folder', { name, parentPath: currentPath });
            if (res.data.status) {
                toast.success('Folder created');
                loadFiles(currentPath);
            } else {
                toast.error(res.data.message);
            }
        } catch (error) {
            toast.error('Failed to create folder');
        }
    };

    const deleteFolder = async (folderName, e) => {
        e.stopPropagation();
        if (!window.confirm(`Delete folder "${folderName}" and all its contents?`)) return;
        try {
            const folderPath = currentPath ? `${currentPath}/${folderName}` : folderName;
            const res = await api.delete('/files/folder', { data: { folderPath } });
            if (res.data.status) {
                toast.success('Folder deleted');
                loadFiles(currentPath);
            }
        } catch (error) {
            toast.error('Delete folder failed');
        }
    };

    const deleteFile = async (filePath, e) => {
        e.stopPropagation();
        if (!window.confirm('Delete this file permanently?')) return;
        try {
            const res = await api.delete('/files', { data: { filePath } });
            if (res.data.status) {
                toast.success('Deleted');
                loadFiles(currentPath);
            }
        } catch (error) {
            toast.error('Delete failed');
        }
    };

    const navigateUp = () => {
        if (!currentPath) return;
        const parts = currentPath.split('/');
        parts.pop();
        loadFiles(parts.join('/'));
    };

    const btnStyle = { position: 'absolute', top: -5, right: -5, background: 'red', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', fontSize: '10px', lineHeight: '20px', textAlign: 'center', padding: 0 };

    return (
        <div style={{ padding: '10px', height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Toolbar */}
            <div className="admin-card" style={{ display: 'flex', gap: '10px', marginBottom: '15px', padding: '10px' }}>
                <button onClick={() => fileInputRef.current.click()} style={{ padding: '6px 12px', background: '#17a2b8', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                    Upload Files
                </button>
                <input type="file" multiple ref={fileInputRef} style={{ display: 'none' }} onChange={handleUpload} />
                
                <button onClick={createFolder} className="btn-modal-close" style={{ padding: '6px 12px' }}>
                    New Folder
                </button>
            </div>

            {/* Path */}
            <div style={{ marginBottom: '10px', fontSize: '14px', color: 'var(--text)' }}>
                Location: <strong>/uploads/{currentPath}</strong>
            </div>

            {/* Grid */}
            <div style={{ flex: 1, overflowY: 'auto', border: '1px solid var(--border)', padding: '15px', display: 'flex', flexWrap: 'wrap', gap: '15px', alignContent: 'flex-start' }}>
                {loading ? <div style={{ width: '100%', textAlign: 'center' }}>Loading...</div> : (
                    <>
                        {currentPath && (
                            <div onClick={navigateUp} style={{ width: '100px', cursor: 'pointer', textAlign: 'center' }}>
                                <div style={{ fontSize: '40px', color: '#ffc107' }}><Folder /></div>
                                <div style={{ fontSize: '12px' }}>.. (Up)</div>
                            </div>
                        )}
                        
                        {folders.map(folder => (
                            <div key={folder} onClick={() => loadFiles(currentPath ? `${currentPath}/${folder}` : folder)} style={{ width: '100px', cursor: 'pointer', textAlign: 'center', position: 'relative' }}>
                                <div style={{ fontSize: '40px', color: '#ffc107' }}><Folder /></div>
                                <div style={{ fontSize: '12px', wordBreak: 'break-all' }}>{folder}</div>
                                <button 
                                    onClick={(e) => deleteFolder(folder, e)} 
                                    style={btnStyle}>
                                    X
                                </button>
                            </div>
                        ))}

                        {files.map(file => (
                            <div key={file.name} style={{ width: '100px', cursor: 'pointer', textAlign: 'center', position: 'relative' }} title={file.name}>
                                <div 
                                    onClick={() => {
                                        if (onSelect) {
                                            onSelect(file.path);
                                            onClose && onClose();
                                        }
                                    }}
                                    style={{ 
                                        height: '80px', 
                                        background: `url(${getAssetUrl(file.path)}) center/cover`, 
                                        border: '1px solid #ddd',
                                        borderRadius: '4px',
                                        marginBottom: '5px'
                                    }} 
                                />
                                <div style={{ fontSize: '10px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{file.name}</div>
                                <button 
                                    onClick={(e) => deleteFile(file.path, e)} 
                                    style={btnStyle}>
                                    X
                                </button>
                            </div>
                        ))}

                        {folders.length === 0 && files.length === 0 && (
                            <div style={{ width: '100%', textAlign: 'center', color: '#999', marginTop: '20px' }}>No files found in this directory.</div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default FileManager;
