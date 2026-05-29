import React, { useState, useEffect } from 'react';
import api from '../api';
import DataTable from '../components/common/DataTable';
import GenericModal from '../components/common/GenericModal';
import toast from 'react-hot-toast';

const Tax = () => {
    const [activeTab, setActiveTab] = useState('tax'); // 'tax' or 'hsn'

    const [taxes, setTaxes] = useState([]);
    const [hsns, setHsns] = useState([]);

    const [isTaxModalOpen, setTaxModalOpen] = useState(false);
    const [editingTaxId, setEditingTaxId] = useState(null);
    const [taxFormData, setTaxFormData] = useState({ name: '', tax: 0, status: 'active' });

    const [isHsnModalOpen, setHsnModalOpen] = useState(false);
    const [editingHsnId, setEditingHsnId] = useState(null);
    const [hsnFormData, setHsnFormData] = useState({ hsnCode: '', keywords: '' });

    const fetchData = async () => {
        try {
            if (activeTab === 'tax') {
                const res = await api.get('/taxes');
                if (res.data.status) setTaxes(res.data.taxes);
            } else {
                const res = await api.get('/hsns');
                if (res.data.status) setHsns(res.data.hsns);
            }
        } catch (error) {
            toast.error(`Failed to load ${activeTab}`);
        }
    };

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    // --- TAX CRUD ---
    const openAddTaxModal = () => {
        setTaxFormData({ name: '', tax: 0, status: 'active' });
        setEditingTaxId(null);
        setTaxModalOpen(true);
    };

    const openEditTaxModal = (row) => {
        setTaxFormData({ name: row.name, tax: row.tax, status: row.status });
        setEditingTaxId(row.id);
        setTaxModalOpen(true);
    };

    const handleTaxDelete = async (row) => {
        if (!window.confirm('Are you sure you want to delete this tax?')) return;
        try {
            const res = await api.delete(`/taxes/${row.id}`);
            if (res.data.status) {
                toast.success('Tax deleted successfully');
                fetchData();
            } else {
                toast.error(res.data.message);
            }
        } catch (error) {
            toast.error('Failed to delete tax');
        }
    };

    const handleTaxSubmit = async (e) => {
        e.preventDefault();
        try {
            let res;
            if (editingTaxId) res = await api.put(`/taxes/${editingTaxId}`, taxFormData);
            else res = await api.post('/taxes', taxFormData);
            
            if (res.data.status) {
                toast.success(`Tax ${editingTaxId ? 'updated' : 'added'} successfully`);
                setTaxModalOpen(false);
                fetchData();
            } else {
                toast.error(res.data.message);
            }
        } catch (error) {
            toast.error(`Failed to ${editingTaxId ? 'update' : 'add'} tax`);
        }
    };

    // --- HSN CRUD ---
    const openAddHsnModal = () => {
        setHsnFormData({ hsnCode: '', keywords: '' });
        setEditingHsnId(null);
        setHsnModalOpen(true);
    };

    const openEditHsnModal = (row) => {
        setHsnFormData({ hsnCode: row.hsnCode, keywords: row.keywords || '' });
        setEditingHsnId(row.id);
        setHsnModalOpen(true);
    };

    const handleHsnDelete = async (row) => {
        if (!window.confirm('Are you sure you want to delete this HSN?')) return;
        try {
            const res = await api.delete(`/hsns/${row.id}`);
            if (res.data.status) {
                toast.success('HSN deleted successfully');
                fetchData();
            } else {
                toast.error(res.data.message);
            }
        } catch (error) {
            toast.error('Failed to delete HSN');
        }
    };

    const handleHsnSubmit = async (e) => {
        e.preventDefault();
        try {
            let res;
            if (editingHsnId) res = await api.put(`/hsns/${editingHsnId}`, hsnFormData);
            else res = await api.post('/hsns', hsnFormData);
            
            if (res.data.status) {
                toast.success(`HSN ${editingHsnId ? 'updated' : 'added'} successfully`);
                setHsnModalOpen(false);
                fetchData();
            } else {
                toast.error(res.data.message);
            }
        } catch (error) {
            toast.error(`Failed to ${editingHsnId ? 'update' : 'add'} HSN`);
        }
    };

    const taxColumns = [
        { header: 'ID', accessor: 'id' },
        { header: 'Name', accessor: 'name' },
        { header: 'Tax %', render: (row) => `${row.tax}%` },
        { 
            header: 'Status', 
            render: (row) => (
                <span style={{
                    padding: '4px 8px', borderRadius: '12px', fontSize: '12px',
                    background: row.status === 'active' ? '#e6f4ea' : '#fce8e6',
                    color: row.status === 'active' ? '#1a73e8' : '#ea4335'
                }}>
                    {row.status}
                </span>
            )
        },
        { header: 'Created On', render: (row) => new Date(row.createdAt).toLocaleDateString() }
    ];

    const hsnColumns = [
        { header: 'ID', accessor: 'id' },
        { header: 'HSN Code', accessor: 'hsnCode' },
        { header: 'Keywords', accessor: 'keywords' },
        { header: 'Created On', render: (row) => new Date(row.createdAt).toLocaleDateString() }
    ];

    return (
        <div>
            <div style={{ display: 'flex', gap: '20px', borderBottom: '1px solid var(--border)', marginBottom: '20px' }}>
                <button 
                    onClick={() => setActiveTab('tax')}
                    style={{ background: 'none', border: 'none', padding: '10px 0', fontSize: '16px', fontWeight: '600', color: activeTab === 'tax' ? 'var(--accent)' : 'var(--text)', borderBottom: activeTab === 'tax' ? '2px solid var(--accent)' : '2px solid transparent', cursor: 'pointer' }}>
                    GST Rates
                </button>
                <button 
                    onClick={() => setActiveTab('hsn')}
                    style={{ background: 'none', border: 'none', padding: '10px 0', fontSize: '16px', fontWeight: '600', color: activeTab === 'hsn' ? 'var(--accent)' : 'var(--text)', borderBottom: activeTab === 'hsn' ? '2px solid var(--accent)' : '2px solid transparent', cursor: 'pointer' }}>
                    HSN Codes
                </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2>{activeTab === 'tax' ? 'Tax Management' : 'HSN Management'}</h2>
                <button onClick={activeTab === 'tax' ? openAddTaxModal : openAddHsnModal} className="btn-add-new">
                    + Add New
                </button>
            </div>
            
            {activeTab === 'tax' ? (
                <DataTable columns={taxColumns} data={taxes} onEdit={openEditTaxModal} onDelete={handleTaxDelete} />
            ) : (
                <DataTable columns={hsnColumns} data={hsns} onEdit={openEditHsnModal} onDelete={handleHsnDelete} />
            )}

            {/* TAX MODAL */}
            <GenericModal isOpen={isTaxModalOpen} title={editingTaxId ? "Update Tax" : "Add New Tax"} onClose={() => setTaxModalOpen(false)}>
                <form onSubmit={handleTaxSubmit}>
                    <div className="modal-row-3">
                        <div className="admin-form-group">
                            <label className="admin-label">Name <span className="required">*</span></label>
                            <input type="text" value={taxFormData.name} onChange={e => setTaxFormData({...taxFormData, name: e.target.value})} required className="admin-input" placeholder="e.g., GST 5%" />
                        </div>
                        <div className="admin-form-group">
                            <label className="admin-label">Tax (%) <span className="required">*</span></label>
                            <input type="number" step="0.01" value={taxFormData.tax} onChange={e => setTaxFormData({...taxFormData, tax: parseFloat(e.target.value)})} required className="admin-input" placeholder="e.g., 5" />
                        </div>
                        <div className="admin-form-group">
                            <label className="admin-label">Status <span className="required">*</span></label>
                            <select value={taxFormData.status} onChange={e => setTaxFormData({...taxFormData, status: e.target.value})} className="admin-select">
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '30px', borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
                        <button type="submit" className="btn-modal-submit">Submit</button>
                        <button type="button" onClick={() => setTaxModalOpen(false)} className="btn-modal-close">Close</button>
                    </div>
                </form>
            </GenericModal>

            {/* HSN MODAL */}
            <GenericModal isOpen={isHsnModalOpen} title={editingHsnId ? "Update HSN" : "Add New HSN"} onClose={() => setHsnModalOpen(false)}>
                <form onSubmit={handleHsnSubmit}>
                    <div className="modal-row-2">
                        <div className="admin-form-group">
                            <label className="admin-label">HSN Code <span className="required">*</span></label>
                            <input type="text" value={hsnFormData.hsnCode} onChange={e => setHsnFormData({...hsnFormData, hsnCode: e.target.value})} required className="admin-input" placeholder="e.g., 1001" />
                        </div>
                        <div className="admin-form-group">
                            <label className="admin-label">Keywords</label>
                            <input type="text" value={hsnFormData.keywords} onChange={e => setHsnFormData({...hsnFormData, keywords: e.target.value})} className="admin-input" placeholder="e.g., apple, fruit" />
                            <small style={{ color: 'var(--text-muted)' }}>Comma separated keywords for easy search</small>
                        </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '30px', borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
                        <button type="submit" className="btn-modal-submit">Submit</button>
                        <button type="button" onClick={() => setHsnModalOpen(false)} className="btn-modal-close">Close</button>
                    </div>
                </form>
            </GenericModal>

        </div>
    );
};

export default Tax;
