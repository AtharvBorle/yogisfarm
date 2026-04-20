import React, { useState, useEffect } from 'react';

const DataTable = ({ columns, data, onEdit, onDelete, onView }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // Reset to first page when data changes
    useEffect(() => {
        setCurrentPage(1);
    }, [data.length]);

    const totalPages = Math.ceil(data.length / itemsPerPage) || 1;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentData = data.slice(startIndex, startIndex + itemsPerPage);

    const handlePageChange = (page) => {
        if (page > 0 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const handleItemsPerPageChange = (e) => {
        const val = parseInt(e.target.value);
        if (val > 0) {
            setItemsPerPage(val);
            setCurrentPage(1);
        } else if (e.target.value === '') {
            setItemsPerPage('');
        }
    };

    return (
        <div className="admin-card" style={{ overflowX: 'auto', border: 'none' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', padding: '0 10px' }}>
                <div style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    Show 
                    <input 
                        type="number" 
                        min="1" 
                        value={itemsPerPage} 
                        onChange={handleItemsPerPageChange} 
                        style={{ width: '60px', padding: '4px 8px', border: '1px solid #ccc', borderRadius: '4px' }} 
                    /> 
                    entries
                </div>
                <div style={{ fontSize: '13px', color: '#666' }}>
                    Showing {data.length > 0 ? startIndex + 1 : 0} to {Math.min(startIndex + (itemsPerPage || 0), data.length)} of {data.length} entries
                </div>
            </div>
            <table className="admin-table">
                <thead>
                    <tr>
                        {columns.map((col, idx) => (
                            <th key={idx}>
                                {col.header}
                            </th>
                        ))}
                        {(onEdit || onDelete || onView) && (
                            <th style={{ width: '150px' }}>Actions</th>
                        )}
                    </tr>
                </thead>
                <tbody>
                    {currentData.length === 0 ? (
                        <tr>
                            <td colSpan={columns.length + 1} style={{ padding: '20px', textAlign: 'center', color: '#888' }}>
                                {data.length === 0 ? 'No data available.' : 'No data on this page.'}
                            </td>
                        </tr>
                    ) : (
                        currentData.map((row, rowIndex) => (
                            <tr key={rowIndex}>
                                {columns.map((col, colIndex) => (
                                    <td key={colIndex}>
                                        {col.render ? col.render(row) : row[col.accessor]}
                                    </td>
                                ))}
                                {(onEdit || onDelete || onView) && (
                                    <td>
                                        <div style={{ display: 'flex', gap: '5px' }}>
                                            {onView && (
                                                <button onClick={() => onView(row)} style={{ padding: '5px 10px', background: '#17a2b8', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>View</button>
                                            )}
                                            {onEdit && (
                                                <button onClick={() => onEdit(row)} style={{ padding: '5px 10px', background: '#3BB77E', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Edit</button>
                                            )}
                                            {onDelete && (
                                                <button onClick={() => onDelete(row)} style={{ padding: '5px 10px', background: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Delete</button>
                                            )}
                                        </div>
                                    </td>
                                )}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '15px' }}>
                    <div style={{ display: 'flex', border: '1px solid #dee2e6', borderRadius: '4px', overflow: 'hidden' }}>
                        <button 
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            style={{ padding: '6px 12px', background: currentPage === 1 ? '#f8f9fa' : '#fff', color: currentPage === 1 ? '#6c757d' : '#007bff', border: 'none', borderRight: '1px solid #dee2e6', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', fontSize: '13px' }}
                        >
                            Prev
                        </button>
                        
                        {/* Page Numbers */}
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            // Logic to show pages around current page
                            let pageNum;
                            if (totalPages <= 5) {
                                pageNum = i + 1;
                            } else if (currentPage <= 3) {
                                pageNum = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                                pageNum = totalPages - 4 + i;
                            } else {
                                pageNum = currentPage - 2 + i;
                            }
                            
                            return (
                                <button 
                                    key={pageNum}
                                    onClick={() => handlePageChange(pageNum)}
                                    style={{ 
                                        padding: '6px 12px', 
                                        background: currentPage === pageNum ? '#007bff' : '#fff', 
                                        color: currentPage === pageNum ? '#fff' : '#007bff', 
                                        border: 'none', 
                                        borderRight: '1px solid #dee2e6', 
                                        cursor: 'pointer', 
                                        fontSize: '13px',
                                        fontWeight: currentPage === pageNum ? 'bold' : 'normal'
                                    }}
                                >
                                    {pageNum}
                                </button>
                            );
                        })}
                        
                        <button 
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            style={{ padding: '6px 12px', background: currentPage === totalPages ? '#f8f9fa' : '#fff', color: currentPage === totalPages ? '#6c757d' : '#007bff', border: 'none', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', fontSize: '13px' }}
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DataTable;
