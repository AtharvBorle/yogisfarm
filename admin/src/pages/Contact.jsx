import React, { useState, useEffect } from 'react';
import api from '../api';
import DataTable from '../components/common/DataTable';
import GenericModal from '../components/common/GenericModal';
import toast from 'react-hot-toast';

const Contact = () => {
    const [contacts, setContacts] = useState([]);
    const [isViewOpen, setViewOpen] = useState(false);
    const [viewContact, setViewContact] = useState(null);

    const fetchContacts = async () => {
        try {
            const res = await api.get('/contacts');
            if (res.data.status) {
                setContacts(res.data.contacts);
            }
        } catch (error) {
            toast.error('Failed to load contacts');
        }
    };

    useEffect(() => {
        fetchContacts();
    }, []);

    const handleDelete = async (row) => {
        if (!window.confirm('Are you sure you want to delete this contact message?')) return;
        try {
            const res = await api.delete(`/contacts/${row.id}`);
            if (res.data.status) {
                toast.success('Contact deleted successfully');
                fetchContacts();
            } else {
                toast.error(res.data.message);
            }
        } catch (error) {
            toast.error('Failed to delete contact');
        }
    };

    const columns = [
        { header: 'ID', accessor: 'id' },
        { header: 'Name', accessor: 'name' },
        { header: 'Email ID', accessor: 'email' },
        { header: 'Phone No', accessor: 'phone' },
        { header: 'Subject', accessor: 'subject', render: (row) => <div style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.subject || '—'}</div> },
        { header: 'Message', accessor: 'message', render: (row) => <div style={{ maxWidth: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.message}</div> },
        { header: 'Created On', render: (row) => new Date(row.createdAt).toLocaleDateString() }
    ];

    const openViewModal = (row) => {
        setViewContact(row);
        setViewOpen(true);
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2>Contact Queries</h2>
            </div>
            
            <DataTable 
                columns={columns} 
                data={contacts} 
                onDelete={handleDelete} 
                onView={openViewModal}
            />

            <GenericModal isOpen={isViewOpen} title="Contact Message Details" onClose={() => setViewOpen(false)}>
                {viewContact && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <div style={{ padding: '15px', background: '#f8f9fa', borderRadius: '6px' }}>
                            <div style={{ marginBottom: '8px' }}><strong>Name:</strong> {viewContact.name}</div>
                            <div style={{ marginBottom: '8px' }}><strong>Email:</strong> {viewContact.email}</div>
                            <div><strong>Phone:</strong> {viewContact.phone || '—'}</div>
                        </div>
                        <div>
                            <h4 style={{ fontSize: '15px', marginBottom: '10px' }}>Subject:</h4>
                            <div style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '4px', background: '#fff' }}>
                                {viewContact.subject || 'N/A'}
                            </div>
                        </div>
                        <div>
                            <h4 style={{ fontSize: '15px', marginBottom: '10px' }}>Message:</h4>
                            <div style={{ padding: '15px', border: '1px solid #ddd', borderRadius: '4px', background: '#fff', whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>
                                {viewContact.message}
                            </div>
                        </div>
                    </div>
                )}
            </GenericModal>
        </div>
    );
};

export default Contact;
