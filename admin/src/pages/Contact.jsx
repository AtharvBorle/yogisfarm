import React, { useState, useEffect } from 'react';
import api from '../api';
import DataTable from '../components/common/DataTable';
import toast from 'react-hot-toast';

const Contact = () => {
    const [contacts, setContacts] = useState([]);

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
        { header: 'Subject', accessor: 'subject' },
        { header: 'Message', accessor: 'message' },
        { header: 'Created On', render: (row) => new Date(row.createdAt).toLocaleDateString() }
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2>Contact Queries</h2>
            </div>
            
            <DataTable 
                columns={columns} 
                data={contacts} 
                onDelete={handleDelete} 
            />
        </div>
    );
};

export default Contact;
