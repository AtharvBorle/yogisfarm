import React, { useState, useEffect } from 'react';
import GenericModal from './GenericModal';
import { GripVertical } from 'lucide-react';

const ReorderModal = ({ isOpen, onClose, data, onSave, itemLabelKey = 'name' }) => {
    const [items, setItems] = useState([]);
    const [draggedStartIdx, setDraggedStartIdx] = useState(null);

    useEffect(() => {
        // Deep copy the original data array strictly mapping ID and label
        if (data && isOpen) {
            setItems(data.map(item => ({ id: item.id, label: item[itemLabelKey] || `Item ID: ${item.id}` })));
        }
    }, [data, isOpen, itemLabelKey]);

    const handleDragStart = (e, index) => {
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/html", e.target);
        setDraggedStartIdx(index);
    };

    const handleDragOver = (e, index) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";

        if (draggedStartIdx === index) return;

        const updatedItems = [...items];
        const draggedItem = updatedItems[draggedStartIdx];

        updatedItems.splice(draggedStartIdx, 1);
        updatedItems.splice(index, 0, draggedItem);

        setDraggedStartIdx(index);
        setItems(updatedItems);
    };

    const handleDragEnd = () => {
        setDraggedStartIdx(null);
    };

    const handleSubmit = () => {
        const orderIds = items.map(item => item.id);
        onSave(orderIds);
    };

    return (
        <GenericModal isOpen={isOpen} title="Reorder Items" onClose={onClose}>
            <div style={{ marginBottom: '15px', color: '#666', fontSize: '14px' }}>
                Drag and drop the items below to arrange them exactly how you want them displayed.
            </div>
            
            <div 
                style={{ 
                    maxHeight: '400px', 
                    overflowY: 'auto', 
                    border: '1px solid #eee', 
                    borderRadius: '5px', 
                    padding: '10px',
                    backgroundColor: '#fafafa'
                }}
            >
                {items.length === 0 ? (
                    <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>No items to reorder</div>
                ) : (
                    items.map((item, index) => (
                        <div
                            key={item.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, index)}
                            onDragOver={(e) => handleDragOver(e, index)}
                            onDragEnd={handleDragEnd}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                padding: '12px 15px',
                                margin: '0 0 8px 0',
                                backgroundColor: '#fff',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                cursor: 'grab',
                                boxShadow: draggedStartIdx === index ? '0 5px 15px rgba(0,0,0,0.1)' : 'none',
                                opacity: draggedStartIdx === index ? 0.5 : 1,
                                transition: 'background-color 0.2s',
                            }}
                        >
                            <GripVertical size={18} color="#aaa" style={{ marginRight: '15px' }} />
                            <span style={{ fontWeight: '500', color: '#333' }}>{item.label}</span>
                        </div>
                    ))
                )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button 
                    onClick={handleSubmit} 
                    className="btn-modal-submit"
                    style={{ backgroundColor: '#046938', color: '#fff' }}
                >
                    Save Changes
                </button>
                <button onClick={onClose} className="btn-modal-close">Close</button>
            </div>
        </GenericModal>
    );
};

export default ReorderModal;
