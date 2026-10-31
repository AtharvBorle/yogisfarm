import React from 'react';
import { MapPin, AlertCircle } from 'react-feather';
import { PUNE_DELIVERY_MESSAGE_PARAGRAPH_1, PUNE_DELIVERY_MESSAGE_PARAGRAPH_2 } from '../utils/deliveryLocation';

const PuneDeliveryNotice = ({ onAddAddress, style = {}, compact = false }) => {
    return (
        <div
            style={{
                backgroundColor: '#FFFBE6',
                border: '1.5px solid #FFE58F',
                borderRadius: '10px',
                padding: compact ? '14px 18px' : '20px 24px',
                boxShadow: '0 2px 8px rgba(250, 173, 20, 0.08)',
                ...style
            }}
        >
            <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                <div
                    style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        backgroundColor: '#FFF1B8',
                        color: '#D46B08',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                    }}
                >
                    <MapPin size={20} />
                </div>
                <div style={{ flex: 1 }}>
                    <div
                        style={{
                            fontWeight: '700',
                            color: '#AD4E00',
                            fontSize: compact ? '14px' : '16px',
                            marginBottom: '6px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}
                    >
                        Delivery Services Notice
                    </div>
                    <p
                        style={{
                            margin: 0,
                            color: '#595959',
                            fontSize: compact ? '13px' : '14px',
                            lineHeight: '1.6'
                        }}
                    >
                        {PUNE_DELIVERY_MESSAGE_PARAGRAPH_1}
                    </p>
                    <p
                        style={{
                            margin: '10px 0 0 0',
                            color: '#262626',
                            fontWeight: '600',
                            fontSize: compact ? '13px' : '14px',
                            lineHeight: '1.6'
                        }}
                    >
                        {PUNE_DELIVERY_MESSAGE_PARAGRAPH_2}
                    </p>

                    {onAddAddress && (
                        <div style={{ marginTop: '14px' }}>
                            <button
                                type="button"
                                onClick={onAddAddress}
                                style={{
                                    backgroundColor: '#046938',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '6px',
                                    padding: '8px 18px',
                                    fontWeight: '600',
                                    fontSize: '13px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                + Add a Pune Delivery Address
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PuneDeliveryNotice;
