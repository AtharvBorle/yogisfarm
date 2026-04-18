import React from 'react';

const DataTable = ({ columns, data, onEdit, onDelete, onView }) => {
    return (
        <div className="admin-card" style={{ overflowX: 'auto', border: 'none' }}>
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
                    {data.length === 0 ? (
                        <tr>
                            <td colSpan={columns.length + 1} style={{ padding: '20px', textAlign: 'center', color: '#888' }}>
                                No data available.
                            </td>
                        </tr>
                    ) : (
                        data.map((row, rowIndex) => (
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
        </div>
    );
};

export default DataTable;
