import React from 'react';
import { Link } from 'react-router-dom';
import { CorePillars, PartnerLogos } from '../components/FeatureBanners';
import FloatingSidebar from '../components/FloatingSidebar';

const Shipping = () => {
    const sections = [
        {
            id: 1,
            title: "1. General Information",
            content: [
                "We process and ship orders on all business days, which are Monday through Friday, excluding public holidays.",
                "All orders are subject to product availability and order verification. Once an order is placed, you will receive a confirmation email."
            ]
        },
        {
            id: 2,
            title: "2. Order Processing Time",
            content: [
                "We strive to process all orders within 1-3 business days of receiving your order confirmation email.",
                "During peak seasons, festivals, or special promotions, processing times may be slightly longer. We appreciate your patience during these times."
            ]
        },
        {
            id: 3,
            title: "3. Shipping Methods & Delivery",
            content: [
                "We use trusted local and national courier services to ensure your products arrive fresh and in excellent condition.",
                "Due to the perishable nature of our products, our delivery partners are trained to handle your package with care.",
                "Once your order has been dispatched, you will receive a shipping confirmation email that includes a tracking number and a link to track your order's journey."
            ]
        },
        {
            id: 4,
            title: "4. Shipping Rates",
            content: [
                "Shipping charges for your order will be calculated and displayed at checkout. These charges are based on your location and the total weight/volume of your order.",
                "We may offer free shipping promotions from time to time on orders that meet a specific minimum value. Any such offer will be clearly advertised on our website."
            ]
        },
        {
            id: 5,
            title: "5. Estimated Delivery Times",
            content: [
                "Delivery times are an estimate and start from the moment your order is shipped, not from the time you place the order.",
                "Local Deliveries (within Pune): Estimated delivery time is 1-2 business days after dispatch.",
                "Regional Deliveries (within Maharashtra): Estimated delivery time is 2-4 business days after dispatch.",
                "National Deliveries (Rest of India): Estimated delivery time is 4-7 business days after dispatch.",
                "Please note that these are estimates. Delays can occur due to unforeseen circumstances such as weather, courier issues, or public holidays."
            ]
        },
        {
            id: 6,
            title: "6. Delivery Process",
            content: [
                "Our delivery partner will typically contact you on the day of delivery to confirm your availability.",
                "For your convenience, please ensure someone is available at the provided shipping address to receive the package, especially for perishable goods.",
                "If you are not available to receive the delivery, our courier may attempt to redeliver the next business day. After two failed delivery attempts, the order may be returned to us, and a refund will be issued for the products, minus any shipping and handling fees."
            ]
        },
        {
            id: 7,
            title: "7. Order Tracking",
            content: [
                "You can track the status of your order using the tracking number provided in your shipping confirmation email.",
                "If you have any issues with tracking your order, please contact our customer support team for assistance."
            ]
        },
        {
            id: 8,
            title: "8. Damaged or Lost Shipments",
            content: [
                "If your order arrives damaged, please document the condition of the package and its contents by taking photos and contact us immediately at info@yogisfarms.com.",
                "We will investigate any claims of lost packages with our courier partners. If an order is confirmed as lost, we will issue a full refund or send a replacement, as per your preference."
            ]
        },
        {
            id: 9,
            title: "9. Delivery Address",
            content: [
                "Please ensure your shipping address is correct and complete at the time of checkout.",
                "We cannot be held responsible for packages delivered to an incorrect address entered by the customer. A new order with a corrected address will need to be placed, and you may be responsible for the shipping charges."
            ]
        },
        {
            id: 10,
            title: "10. Contact Us",
            content: [
                "If you have any questions about your order or our shipping policy, please do not hesitate to contact our customer support team:",
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
                        <span></span> Shipping Policy
                    </div>
                </div>
            </div>

            <div className="page-content pt-50 pb-50">
                <div className="container" style={{ maxWidth: '1236px' }}>
                    <div className="mb-40">
                        <h3 style={{ color: '#0A6738', fontSize: '25px', fontWeight: 600, marginBottom: '10px' }}>YogisFarms</h3>
                        <h2 style={{ color: '#0A6738', fontSize: '25px', fontWeight: 600, marginBottom: '20px' }}>Shipping Policy</h2>
                        <p style={{ color: '#333', fontSize: '14px', fontWeight: 300, lineHeight: '24px' }}>
                            At YogisFarms, we are dedicated to delivering our farm-fresh products to your doorstep with the utmost care and efficiency. Please read our shipping policy to understand how we process and deliver your orders.
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

export default Shipping;
