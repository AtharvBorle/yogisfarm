import React from 'react';
import { Link } from 'react-router-dom';
import { CorePillars, PartnerLogos } from '../components/FeatureBanners';
import FloatingSidebar from '../components/FloatingSidebar';

const ReturnPolicy = () => {
    const sections = [
        {
            id: 1,
            title: "1. General Policy",
            content: [
                "This policy applies to all purchases made through the YogisFarms website (www.yogisfarms.com).",
                "All requests for returns, refunds, or cancellations must be made in accordance with the terms outlined below.",
                "We reserve the right to amend this policy at any time. The most current version will always be available on our website."
            ]
        },
        {
            id: 2,
            title: "2. Returns Policy",
            content: [
                "Due to the perishable nature of our products, we have a strict no-return policy.",
                "We cannot accept returns for products once they have been delivered."
            ]
        },
        {
            id: 3,
            title: "3. Cancellations",
            content: [
                "Order Cancellation by Customer: You may cancel your order free of charge if you do so within 2 hours of placing the order. To cancel, please contact our customer support team immediately at info@yogisfarms.com. Please provide your order number for a faster process.",
                "Cancellation after 2 hours: We begin processing your order immediately to ensure timely delivery of fresh products. Therefore, cancellations requested more than 2 hours after the order is placed may not be possible. If the order has already been dispatched, it cannot be canceled.",
                "Order Cancellation by YogisFarms: We reserve the right to cancel any order for reasons including, but not limited to, product unavailability, errors in pricing or product information, or issues with payment verification. In such cases, a full refund will be processed to the original payment method."
            ]
        },
        {
            id: 4,
            title: "4. Refunds",
            content: [
                "We offer refunds only in the following specific circumstances:",
                "Damaged or Defective Products: If you receive a product that is damaged, spoiled, or defective, please contact us within 24 hours of delivery. You must provide clear photos of the damaged item and a brief description of the issue. After verification, we will offer a full refund or a replacement of the product, based on your preference and product availability.",
                "Wrong Product Delivered: If you receive a product different from what you ordered, please notify us within 24 hours of delivery. Please provide a photo of the incorrect item. We will arrange for the correct product to be delivered to you or issue a full refund.",
                "Product Unavailability (Post-Order): In the rare event that a product you ordered is no longer available after your order has been placed, we will contact you to offer a suitable replacement or a full refund for that specific item.",
                "Canceled Orders: If your order is successfully canceled within the 2-hour window, a full refund will be processed."
            ]
        },
        {
            id: 5,
            title: "5. Refund Processing",
            content: [
                "Once your refund request is approved, we will initiate a refund to your original payment method.",
                "Refunds typically take 5-7 business days to reflect in your account, depending on your bank or payment provider.",
                "YogisFarms is not responsible for any delays in the refund process caused by the bank or payment gateway."
            ]
        },
        {
            id: 6,
            title: "6. How to Request a Refund",
            content: [
                "To request a refund, please follow these steps:",
                "Contact our customer support team at info@yogisfarms.com.",
                "Provide your order number.",
                "Explain the reason for the refund request (e.g., damaged product, wrong item).",
                "Attach clear photos of the item in question.",
                "Our team will review your request and get back to you within 2-3 business days."
            ]
        },
        {
            id: 7,
            title: "7. Non-Refundable Items",
            content: [
                "Items returned without prior approval from YogisFarms.",
                "Products that have been used, consumed, or tampered with.",
                "Products damaged due to mishandling by the customer.",
                "Products for which a complaint is raised after the 24-hour window from the time of delivery."
            ]
        },
        {
            id: 8,
            title: "8. Contact Us",
            content: [
                "For any questions or concerns regarding our Returns, Refunds, and Cancellation policy, please contact our customer support team:",
                "Email: info@yogisfarms.com"
            ]
        }
    ];

    return (
        <main className="main" style={{ fontFamily: 'Poppins, sans-serif' }}>
            {/* Standard Breadcrumb */}
            <div className="page-header breadcrumb-wrap" style={{ margin: '0' }}>
                <div className="container">
                    <div className="breadcrumb">
                        <Link to="/" rel="nofollow"><i className="fi-rs-home mr-5"></i>Home</Link>
                        <span></span> Page
                        <span></span> Return Policy
                    </div>
                </div>
            </div>

            <div className="page-content pt-50 pb-50">
                <div className="container" style={{ maxWidth: '1236px' }}>
                    <div className="mb-40">
                        <h3 style={{ color: '#0A6738', fontSize: '25px', fontWeight: 600, marginBottom: '10px' }}>YogisFarms</h3>
                        <h2 style={{ color: '#0A6738', fontSize: '25px', fontWeight: 600, marginBottom: '20px' }}>Return, Refund And Cancellation Policy</h2>
                        <p style={{ color: '#333', fontSize: '14px', fontWeight: 300, lineHeight: '24px' }}>
                            At YogisFarms, we are committed to providing you with the freshest and highest quality products. Your satisfaction is our top priority. Please read our policy carefully to understand your options for returns, refunds, and cancellations.
                        </p>
                    </div>

                    <div className="row">
                        {sections.map(section => (
                            <div key={section.id} className="col-lg-4 col-md-6 mb-40">
                                <h4 style={{ color: '#0A6738', fontSize: '20px', fontWeight: 600, marginBottom: '15px' }}>{section.title}</h4>
                                <ul style={{ listStyleType: 'disc', paddingLeft: '18px', margin: 0 }}>
                                    {section.content.map((item, index) => (
                                        <li key={index} style={{ color: '#000', fontSize: '12px', fontWeight: 300, lineHeight: '22px', marginBottom: '8px' }}>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Core Pillars */}
            <CorePillars />

            {/* Partner Logos */}
            <PartnerLogos />

            <FloatingSidebar />
        </main>
    );
};

export default ReturnPolicy;
