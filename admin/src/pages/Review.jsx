import React, { useState, useEffect } from 'react';
import api from '../api';
import DataTable from '../components/common/DataTable';
import GenericModal from '../components/common/GenericModal';
import toast from 'react-hot-toast';

const Review = () => {
    const [reviews, setReviews] = useState([]);
    const [isModalOpen, setModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({ status: 'pending', comment: '' });
    const [currentUser, setCurrentUser] = useState('');
    const [currentProduct, setCurrentProduct] = useState('');
    const [isViewOpen, setViewOpen] = useState(false);
    const [viewReview, setViewReview] = useState(null);

    const fetchReviews = async () => {
        try {
            const res = await api.get('/reviews');
            if (res.data.status) {
                setReviews(res.data.reviews);
            }
        } catch (error) {
            toast.error('Failed to load reviews');
        }
    };

    useEffect(() => {
        fetchReviews();
    }, []);

    const openEditModal = (row) => {
        setFormData({ status: row.status, comment: row.comment || '' });
        setCurrentUser(row.user?.name || 'Unknown User');
        setCurrentProduct(row.product?.name || 'Unknown Product');
        setEditingId(row.id);
        setModalOpen(true);
    };

    const handleDelete = async (row) => {
        if (!window.confirm('Are you sure you want to delete this review?')) return;
        try {
            const res = await api.delete(`/reviews/${row.id}`);
            if (res.data.status) {
                toast.success('Review deleted successfully');
                fetchReviews();
            } else {
                toast.error(res.data.message);
            }
        } catch (error) {
            toast.error('Failed to delete review');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await api.put(`/reviews/${editingId}`, formData);
            if (res.data.status) {
                toast.success('Review updated successfully');
                setModalOpen(false);
                fetchReviews();
            } else {
                toast.error(res.data.message);
            }
        } catch (error) {
            toast.error('Failed to update review');
        }
    };

    const openViewModal = (row) => {
        setViewReview(row);
        setViewOpen(true);
    };

    const columns = [
        { header: 'ID', accessor: 'id' },
        { header: 'User', render: (row) => <div style={{ fontWeight: '500' }}>{row.user?.name || '—'}<br/><small style={{color:'#666'}}>{row.user?.phone}</small></div> },
        { header: 'Product', render: (row) => row.product?.name || '—' },
        { header: 'Rating', render: (row) => <span style={{ color: '#ffc107', fontSize: '16px' }}>{'★'.repeat(row.rating)}{'☆'.repeat(5 - row.rating)}</span> },
        { header: 'Comment', accessor: 'comment', render: (row) => <div style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.comment || '—'}</div> },
        { 
            header: 'Status', 
            render: (row) => (
                <span style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: '600',
                    background: row.status === 'active' ? '#e6f4ea' : row.status === 'pending' ? '#fff3cd' : '#fce8e6',
                    color: row.status === 'active' ? '#1a73e8' : row.status === 'pending' ? '#856404' : '#ea4335'
                }}>
                    {row.status.toUpperCase()}
                </span>
            )
        },
        { header: 'Date', render: (row) => new Date(row.createdAt).toLocaleDateString() }
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2>Review Management</h2>
            </div>
            
            <DataTable 
                columns={columns} 
                data={reviews} 
                onEdit={openEditModal} 
                onDelete={handleDelete} 
                onView={openViewModal}
            />

            <GenericModal isOpen={isViewOpen} title="Review Details" onClose={() => setViewOpen(false)}>
                {viewReview && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <div style={{ padding: '15px', background: 'var(--sidebar-hover)', borderRadius: '6px', color: 'var(--text)' }}>
                            <div style={{ marginBottom: '8px' }}><strong>User:</strong> {viewReview.user?.name || 'Unknown User'} ({viewReview.user?.phone})</div>
                            <div style={{ marginBottom: '8px' }}><strong>Product:</strong> {viewReview.product?.name || 'Unknown Product'}</div>
                            <div>
                                <strong>Date:</strong> {new Date(viewReview.createdAt).toLocaleString()}
                            </div>
                        </div>
                        <div style={{ color: 'var(--text)' }}>
                            <div style={{ marginBottom: '10px' }}>
                                <strong>Rating:</strong> <span style={{ color: '#ffc107', fontSize: '18px', marginLeft: '5px' }}>{'★'.repeat(viewReview.rating)}{'☆'.repeat(5 - viewReview.rating)}</span>
                            </div>
                            <div style={{ marginBottom: '10px' }}>
                                <strong>Status:</strong> 
                                <span style={{ padding: '3px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '600', marginLeft: '10px', background: viewReview.status === 'active' ? '#e6f4ea' : viewReview.status === 'pending' ? '#fff3cd' : '#fce8e6', color: viewReview.status === 'active' ? '#1a73e8' : viewReview.status === 'pending' ? '#856404' : '#ea4335' }}>
                                    {viewReview.status.toUpperCase()}
                                </span>
                            </div>
                        </div>
                        <div style={{ color: 'var(--text)' }}>
                            <h4 style={{ fontSize: '15px', marginBottom: '10px' }}>Comment:</h4>
                            <div style={{ padding: '15px', border: '1px solid var(--border)', borderRadius: '4px', background: 'var(--card-bg)', whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>
                                {viewReview.comment || 'No comment provided.'}
                            </div>
                        </div>
                    </div>
                )}
            </GenericModal>

            <GenericModal 
                isOpen={isModalOpen} 
                title="Moderate Review" 
                onClose={() => setModalOpen(false)}
            >
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '15px', padding: '15px', background: 'var(--sidebar-hover)', borderRadius: '6px', color: 'var(--text)' }}>
                        <div style={{ marginBottom: '8px' }}><strong>User:</strong> {currentUser}</div>
                        <div><strong>Product:</strong> {currentProduct}</div>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div className="admin-form-group">
                            <label className="admin-label">Status <span className="required">*</span></label>
                            <select 
                                value={formData.status} 
                                onChange={e => setFormData({...formData, status: e.target.value})}
                                className="admin-select"
                            >
                                <option value="pending">Pending (Hidden)</option>
                                <option value="active">Active (Visible)</option>
                                <option value="rejected">Rejected</option>
                            </select>
                        </div>
                        <div className="admin-form-group">
                            <label className="admin-label">Comment</label>
                            <textarea 
                                value={formData.comment} 
                                onChange={e => setFormData({...formData, comment: e.target.value})}
                                className="admin-input"
                                rows="4"
                            ></textarea>
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '30px', borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
                        <button type="submit" className="btn-modal-submit">Update Review</button>
                        <button type="button" onClick={() => setModalOpen(false)} className="btn-modal-close">Close</button>
                    </div>
                </form>
            </GenericModal>
        </div>
    );
};

export default Review;
