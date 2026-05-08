import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import DataTable from '../components/common/DataTable';
import GenericModal from '../components/common/GenericModal';
import toast from 'react-hot-toast';
import { Truck, Printer, Search, Download } from 'react-feather';

const TakeAction = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('takeAction'); // 'takeAction', 'readyToShip', 'status'
    const [statusType, setStatusType] = useState('deliveryBoy'); // 'deliveryBoy' or 'courier'
    
    const [orders, setOrders] = useState([]);
    const [deliveryBoys, setDeliveryBoys] = useState([]);
    const [couriers, setCouriers] = useState([]);
    
    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [pincode, setPincode] = useState('');
    
    // Selection
    const [selectedOrderIds, setSelectedOrderIds] = useState([]);
    
    // Modals
    const [viewProductsModal, setViewProductsModal] = useState({ open: false, items: [] });
    const [deliveryOptionModal, setDeliveryOptionModal] = useState({ open: false });
    
    // Delivery Assignment State
    const [deliveryOptionType, setDeliveryOptionType] = useState('delivery_boy');
    const [selectedDeliveryBoyId, setSelectedDeliveryBoyId] = useState('');
    const [selectedCourierPartnerId, setSelectedCourierPartnerId] = useState('');
    const [trackingId, setTrackingId] = useState('');
    const [isAssigning, setIsAssigning] = useState(false);

    const fetchOrders = async () => {
        try {
            // Fetch all orders for now, filtering will happen client-side or we can add API query params
            // For simplicity in UI logic and exact filtering, we fetch orders and filter. 
            // In a huge system, this should be server-side.
            const res = await api.get('/orders');
            if (res.data.status) {
                setOrders(res.data.orders);
            }
        } catch (err) {
            toast.error('Failed to load orders');
        }
    };

    const fetchDeliveryOptions = async () => {
        try {
            const [dbRes, cpRes] = await Promise.all([
                api.get('/delivery-boys'),
                api.get('/courier-partners')
            ]);
            if (dbRes.data.status) setDeliveryBoys(dbRes.data.deliveryBoys);
            if (cpRes.data.status) setCouriers(cpRes.data.courierPartners);
        } catch (err) { }
    };

    useEffect(() => {
        fetchOrders();
        fetchDeliveryOptions();
    }, []);

    // Clear selection when tab changes
    useEffect(() => {
        setSelectedOrderIds([]);
        setSearchQuery('');
        setPincode('');
    }, [activeTab]);

    const handleSelectAll = (e, filteredOrders) => {
        if (e.target.checked) {
            setSelectedOrderIds(filteredOrders.map(o => o.id));
        } else {
            setSelectedOrderIds([]);
        }
    };

    const handleSelectRow = (e, id) => {
        if (e.target.checked) {
            setSelectedOrderIds(prev => [...prev, id]);
        } else {
            setSelectedOrderIds(prev => prev.filter(orderId => orderId !== id));
        }
    };

    const handlePrintLabels = async () => {
        if (selectedOrderIds.length === 0) return;
        try {
            const res = await api.post('/orders/print-labels', { orderIds: selectedOrderIds });
            if (res.data.status) {
                toast.success('Labels generated successfully!');
                fetchOrders(); // Refresh data
                
                // Trigger download for each (or combined)
                // We'll open multiple tabs or a combined endpoint if it existed.
                // Since frontend html2pdf relies on rendering, we can't easily bulk generate 1 pdf natively without a custom combined page.
                // We will open a print window for the selected orders. 
                // For a single PDF containing all, we need a special print page.
                const orderNumbers = selectedOrderIds.map(id => orders.find(o => o.id === id)?.orderNumber).filter(Boolean);
                const idsParam = orderNumbers.join(',');
                window.open(`/admin/orders/bulk-invoice?orderNumbers=${idsParam}`, '_blank');
                
                setSelectedOrderIds([]);
            } else {
                toast.error(res.data.message);
            }
        } catch (err) {
            toast.error('Error generating labels');
        }
    };

    const handleAssignPartner = async (e) => {
        e.preventDefault();
        if (selectedOrderIds.length === 0) return;
        
        if (deliveryOptionType === 'delivery_boy' && !selectedDeliveryBoyId) return toast.error('Select a delivery boy');
        if (deliveryOptionType === 'courier' && (!selectedCourierPartnerId || !trackingId)) return toast.error('Select courier and enter tracking ID');

        setIsAssigning(true);
        try {
            // We need to bulk assign. We can do it by firing multiple requests or a bulk API. 
            // We'll fire sequentially for simplicity if bulk API doesn't exist, but bulk is better.
            const payload = {
                orderIds: selectedOrderIds,
                deliveryType: deliveryOptionType,
                deliveryBoyId: deliveryOptionType === 'delivery_boy' ? parseInt(selectedDeliveryBoyId) : null,
                courierPartnerId: deliveryOptionType === 'courier' ? parseInt(selectedCourierPartnerId) : null,
                trackingId: deliveryOptionType === 'courier' ? trackingId : null
            };

            // Using existing route one by one since we don't have bulk assign API yet
            const promises = selectedOrderIds.map(id => api.put(`/orders/${id}/assign`, {
                deliveryType: deliveryOptionType,
                deliveryBoyId: deliveryOptionType === 'delivery_boy' ? parseInt(selectedDeliveryBoyId) : null,
                courierPartnerId: deliveryOptionType === 'courier' ? parseInt(selectedCourierPartnerId) : null,
                trackingId: deliveryOptionType === 'courier' ? trackingId : null
            }));
            
            await Promise.all(promises);
            
            toast.success('Delivery partner assigned to selected orders');
            setDeliveryOptionModal({ open: false });
            setSelectedOrderIds([]);
            fetchOrders();
        } catch (err) {
            toast.error('Failed to assign delivery partner');
        } finally {
            setIsAssigning(false);
        }
    };

    // Filter Logic
    let filteredOrders = orders.filter(order => {
        // Date filter
        if (startDate && new Date(order.createdAt) < new Date(startDate)) return false;
        if (endDate && new Date(order.createdAt) > new Date(endDate + 'T23:59:59')) return false;
        
        // Search & Pincode
        if (pincode && !order.addressPincode?.includes(pincode)) return false;
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            const matches = order.orderNumber?.toLowerCase().includes(q) || 
                            order.user?.name?.toLowerCase().includes(q) || 
                            order.addressText?.toLowerCase().includes(q);
            if (!matches) return false;
        }

        // Tab logic
        if (activeTab === 'takeAction') {
            return !order.labelPrintedAt && (order.orderStatus === 'placed' || order.orderStatus === 'confirmed' || order.orderStatus === 'pending');
        }
        if (activeTab === 'readyToShip') {
            return order.labelPrintedAt && !order.deliveryBoyId && !order.courierPartnerId && order.orderStatus !== 'cancelled';
        }
        if (activeTab === 'status') {
            const hasPartner = order.deliveryBoyId || order.courierPartnerId;
            if (!hasPartner) return false;
            
            if (statusType === 'deliveryBoy') return !!order.deliveryBoyId;
            if (statusType === 'courier') return !!order.courierPartnerId;
            return true;
        }
        return false;
    });

    const formatDateTime = (d) => {
        const dt = new Date(d);
        return dt.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' }) + ' ' +
            dt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }).toUpperCase();
    };

    const columns = [
        {
            header: (
                <input 
                    type="checkbox" 
                    checked={filteredOrders.length > 0 && selectedOrderIds.length === filteredOrders.length}
                    onChange={(e) => handleSelectAll(e, filteredOrders)}
                    style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                />
            ),
            render: (row) => (
                <input 
                    type="checkbox" 
                    checked={selectedOrderIds.includes(row.id)}
                    onChange={(e) => handleSelectRow(e, row.id)}
                    style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                />
            )
        },
        {
            header: 'ORDER ID',
            render: (row) => <span style={{ color: '#046938', fontWeight: '600', cursor: 'pointer' }} onClick={() => navigate(`/orders/detail/${row.orderNumber}`)}>{row.orderNumber}</span>
        },
        {
            header: 'DATE',
            render: (row) => <span style={{ fontSize: '12px', color: '#555' }}>{formatDateTime(row.createdAt)}</span>
        },
        {
            header: 'CUSTOMER',
            render: (row) => (
                <div>
                    <div style={{ fontWeight: '500' }}>{row.user?.name || 'N/A'}</div>
                    <span style={{ fontSize: '11px', color: '#888' }}>{row.addressCity}, PIN: {row.addressPincode}</span>
                </div>
            )
        },
        {
            header: 'PRODUCTS',
            render: (row) => (
                <button 
                    onClick={() => setViewProductsModal({ open: true, items: row.items || [] })}
                    style={{ padding: '4px 10px', background: '#e8f5e9', color: '#046938', border: '1px solid #c8e6c9', borderRadius: '4px', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}>
                    View Products ({row.items?.length || 0})
                </button>
            )
        },
        { header: 'AMOUNT', render: (row) => <strong>₹{Number(row.total).toFixed(0)}</strong> }
    ];

    if (activeTab === 'status') {
        columns.push({
            header: 'ASSIGNED TO',
            render: (row) => (
                <span style={{ fontSize: '12px', padding: '3px 10px', borderRadius: '4px', fontWeight: '600', background: row.deliveryType === 'courier' ? '#e3f2fd' : '#e8f5e9', color: row.deliveryType === 'courier' ? '#007bff' : '#28a745' }}>
                    {row.deliveryType === 'courier' ? row.courierPartner?.name : row.deliveryBoy?.name}
                </span>
            )
        });
        columns.push({
            header: 'STATUS',
            render: (row) => (
                <span style={{ padding: '4px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: '600', background: '#17a2b8', color: '#fff' }}>
                    {row.orderStatus}
                </span>
            )
        });
    }

    const radioStyle = (active) => ({
        padding: '10px 20px',
        background: active ? '#046938' : '#fff',
        color: active ? '#fff' : '#555',
        border: '1px solid #046938',
        cursor: 'pointer',
        fontWeight: '600',
        fontSize: '14px',
        flex: 1,
        textAlign: 'center',
        transition: 'all 0.2s'
    });

    const inputStyle = { padding: '8px', border: '1px solid var(--border)', borderRadius: '4px', boxSizing: 'border-box', minWidth: '150px', background: 'var(--card-bg)', color: 'var(--text)', fontSize: '13px' };

    return (
        <div>
            <h2 style={{ color: 'var(--text)', marginBottom: '20px' }}>Take Action</h2>

            {/* Top Radio Buttons */}
            <div style={{ display: 'flex', borderRadius: '8px', overflow: 'hidden', marginBottom: '25px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                <div style={radioStyle(activeTab === 'takeAction')} onClick={() => setActiveTab('takeAction')}>Take Action (New)</div>
                <div style={radioStyle(activeTab === 'readyToShip')} onClick={() => setActiveTab('readyToShip')}>Ready to Ship</div>
                <div style={radioStyle(activeTab === 'status')} onClick={() => setActiveTab('status')}>Status</div>
            </div>

            {/* Sub-toggles for Status tab */}
            {activeTab === 'status' && (
                <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: 'var(--text)', fontWeight: '500' }}>
                        <input type="radio" checked={statusType === 'deliveryBoy'} onChange={() => setStatusType('deliveryBoy')} /> Delivery Boy
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: 'var(--text)', fontWeight: '500' }}>
                        <input type="radio" checked={statusType === 'courier'} onChange={() => setStatusType('courier')} /> Courier Partner
                    </label>
                </div>
            )}

            {/* Filters */}
            <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', padding: '15px', background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '8px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                <div>
                    <label style={{ fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '4px', color: 'var(--text)' }}>Start Date</label>
                    <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={inputStyle} />
                </div>
                <div>
                    <label style={{ fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '4px', color: 'var(--text)' }}>End Date</label>
                    <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={inputStyle} />
                </div>
                <div>
                    <label style={{ fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '4px', color: 'var(--text)' }}>Pincode</label>
                    <input type="text" placeholder="Search pincode" value={pincode} onChange={e => setPincode(e.target.value)} style={inputStyle} />
                </div>
                <div style={{ flex: 1, minWidth: '200px' }}>
                    <label style={{ fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '4px', color: 'var(--text)' }}>Search</label>
                    <div style={{ position: 'relative' }}>
                        <Search size={14} style={{ position: 'absolute', left: '10px', top: '10px', color: '#999' }} />
                        <input type="text" placeholder="Order ID, Customer Name, Address" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={{ ...inputStyle, paddingLeft: '32px', width: '100%' }} />
                    </div>
                </div>
            </div>

            {/* Action Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <div style={{ fontSize: '14px', color: 'var(--text)', fontWeight: '500' }}>
                    {selectedOrderIds.length} order(s) selected
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    {activeTab === 'takeAction' && (
                        <button 
                            disabled={selectedOrderIds.length === 0}
                            onClick={handlePrintLabels}
                            style={{ padding: '8px 20px', background: selectedOrderIds.length > 0 ? '#007bff' : '#ccc', color: '#fff', border: 'none', borderRadius: '6px', cursor: selectedOrderIds.length > 0 ? 'pointer' : 'not-allowed', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Printer size={16} /> Print Labels & Generate Invoice
                        </button>
                    )}
                    {activeTab === 'readyToShip' && (
                        <>
                            <button 
                                disabled={selectedOrderIds.length === 0}
                                onClick={() => {
                                    const orderNumbers = selectedOrderIds.map(id => orders.find(o => o.id === id)?.orderNumber).filter(Boolean);
                                    window.open(`/admin/orders/bulk-invoice?orderNumbers=${orderNumbers.join(',')}`, '_blank');
                                }}
                                style={{ padding: '8px 20px', background: selectedOrderIds.length > 0 ? '#17a2b8' : '#ccc', color: '#fff', border: 'none', borderRadius: '6px', cursor: selectedOrderIds.length > 0 ? 'pointer' : 'not-allowed', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Download size={16} /> Download Generated Labels
                            </button>
                            <button 
                                disabled={selectedOrderIds.length === 0}
                                onClick={() => setDeliveryOptionModal({ open: true })}
                                style={{ padding: '8px 20px', background: selectedOrderIds.length > 0 ? '#28a745' : '#ccc', color: '#fff', border: 'none', borderRadius: '6px', cursor: selectedOrderIds.length > 0 ? 'pointer' : 'not-allowed', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Truck size={16} /> Assign Partner
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Table */}
            <DataTable columns={columns} data={filteredOrders} />

            {/* View Products Modal */}
            <GenericModal isOpen={viewProductsModal.open} title="Products Ordered" onClose={() => setViewProductsModal({ open: false, items: [] })}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #ddd' }}>
                            <th style={{ padding: '10px', textAlign: 'left', fontSize: '13px' }}>Product</th>
                            <th style={{ padding: '10px', textAlign: 'left', fontSize: '13px' }}>Variant</th>
                            <th style={{ padding: '10px', textAlign: 'center', fontSize: '13px' }}>Qty</th>
                            <th style={{ padding: '10px', textAlign: 'right', fontSize: '13px' }}>Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        {viewProductsModal.items.map((item, idx) => (
                            <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                                <td style={{ padding: '10px', fontSize: '13px', fontWeight: '500' }}>{item.name}</td>
                                <td style={{ padding: '10px', fontSize: '13px', color: '#666' }}>{item.variant || 'Default'}</td>
                                <td style={{ padding: '10px', fontSize: '13px', textAlign: 'center' }}>{item.quantity}</td>
                                <td style={{ padding: '10px', fontSize: '13px', textAlign: 'right' }}>₹{Number(item.price).toFixed(0)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </GenericModal>

            {/* Delivery Option Modal (Bulk) */}
            <GenericModal isOpen={deliveryOptionModal.open} title="Assign Delivery Partner (Bulk)" onClose={() => setDeliveryOptionModal({ open: false })}>
                <form onSubmit={handleAssignPartner} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ background: '#e8f5e9', color: '#046938', padding: '10px', borderRadius: '6px', fontSize: '13px', fontWeight: '600' }}>
                        Assigning partner for {selectedOrderIds.length} order(s).
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px', border: `2px solid ${deliveryOptionType === 'delivery_boy' ? '#046938' : '#ddd'}`, borderRadius: '8px', cursor: 'pointer' }}>
                            <input type="radio" name="delivery_type" checked={deliveryOptionType === 'delivery_boy'} onChange={() => setDeliveryOptionType('delivery_boy')} />
                            <span style={{ fontWeight: '600' }}>Local Delivery Boy</span>
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px', border: `2px solid ${deliveryOptionType === 'courier' ? '#046938' : '#ddd'}`, borderRadius: '8px', cursor: 'pointer' }}>
                            <input type="radio" name="delivery_type" checked={deliveryOptionType === 'courier'} onChange={() => setDeliveryOptionType('courier')} />
                            <span style={{ fontWeight: '600' }}>Courier Partner</span>
                        </label>
                    </div>

                    {deliveryOptionType === 'delivery_boy' && (
                        <div>
                            <label style={{ fontSize: '13px', fontWeight: '600', marginBottom: '5px', display: 'block' }}>Select Delivery Boy</label>
                            <select value={selectedDeliveryBoyId} onChange={e => setSelectedDeliveryBoyId(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }} required>
                                <option value="">-- Select --</option>
                                {deliveryBoys.map(db => <option key={db.id} value={db.id}>{db.name} ({db.phone})</option>)}
                            </select>
                        </div>
                    )}

                    {deliveryOptionType === 'courier' && (
                        <>
                            <div>
                                <label style={{ fontSize: '13px', fontWeight: '600', marginBottom: '5px', display: 'block' }}>Select Courier Partner</label>
                                <select value={selectedCourierPartnerId} onChange={e => setSelectedCourierPartnerId(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }} required>
                                    <option value="">-- Select --</option>
                                    {couriers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label style={{ fontSize: '13px', fontWeight: '600', marginBottom: '5px', display: 'block' }}>Tracking ID / Link</label>
                                <input type="text" value={trackingId} onChange={e => setTrackingId(e.target.value)} placeholder="Enter tracking ID or URL" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd', boxSizing: 'border-box' }} required />
                            </div>
                        </>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                        <button type="button" onClick={() => setDeliveryOptionModal({ open: false })} style={{ padding: '10px 20px', background: '#f8f9fa', border: '1px solid #ddd', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
                        <button type="submit" disabled={isAssigning} style={{ padding: '10px 20px', background: '#046938', color: '#fff', border: 'none', borderRadius: '6px', cursor: isAssigning ? 'not-allowed' : 'pointer', fontWeight: '600' }}>
                            {isAssigning ? 'Assigning...' : 'Assign Deliveries'}
                        </button>
                    </div>
                </form>
            </GenericModal>
        </div>
    );
};

export default TakeAction;
