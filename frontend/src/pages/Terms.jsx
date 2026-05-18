import React from 'react';
import { Link } from 'react-router-dom';
import { CorePillars, PartnerLogos } from '../components/FeatureBanners';
import FloatingSidebar from '../components/FloatingSidebar';

const Terms = () => {
    const sections = [
        {
            id: 1,
            title: "1. General",
            content: "These Terms govern your use of our Site and services. If you do not agree with any part of these Terms, you must not use our Site. We reserve the right to change these Terms at any time. Any updates will be posted on this page with the revised effective date."
        },
        {
            id: 2,
            title: "2. Eligibility",
            content: "You must be at least 18 years old (or the age of majority in your jurisdiction) to make purchases on our Site. By using our Site, you confirm that you meet this requirement."
        },
        {
            id: 3,
            title: "3. Products and Pricing",
            content: "All products listed on our Site are subject to availability. We reserve the right to change product pricing, descriptions, and availability without notice. Prices are listed in [Rupees] and may or may not include taxes or shipping fees."
        },
        {
            id: 4,
            title: "4. Orders",
            content: "Once you place an order, you will receive a confirmation email. This does not guarantee acceptance of your order. We reserve the right to cancel or refuse any order at our discretion. Orders may be declined for reasons including product unavailability, payment issues, or suspicion of fraud."
        },
        {
            id: 5,
            title: "5. Payment",
            content: "We accept payments via Online, UPI etc. All transactions are secure and encrypted using industry-standard technologies. You agree to provide accurate billing and contact information."
        },
        {
            id: 6,
            title: "6. Shipping and Delivery",
            content: "Shipping times and fees are detailed on our Shipping Policy page. We are not responsible for delays due to carrier errors, customs, or force majeure. Risk of loss passes to you upon delivery."
        },
        {
            id: 7,
            title: "7. Returns and Refunds",
            content: "Please refer to our Return Policy page for details on returns, exchanges, and refunds. Items must be returned in original condition within [Number of Days] days of delivery."
        },
        {
            id: 8,
            title: "8. User Accounts",
            content: "You may create an account to track orders and manage preferences. You are responsible for maintaining the confidentiality of your login credentials. We reserve the right to suspend or terminate accounts that violate our Terms."
        },
        {
            id: 9,
            title: "9. Intellectual Property",
            content: "All content on the Site (text, images, logos, product descriptions, etc.) is the property of YogisFarms and protected by intellectual property laws. You may not use our content without written permission."
        },
        {
            id: 10,
            title: "10. Limitation of Liability",
            content: "To the fullest extent permitted by law, YogisFarms shall not be liable for any indirect, incidental, or consequential damages arising from your use of the Site or purchase of our products."
        },
        {
            id: 11,
            title: "11. Indemnification",
            content: "You agree to indemnify and hold harmless YogisFarms, its affiliates, and staff from any claims or liabilities arising from your use of the Site or violation of these Terms."
        },
        {
            id: 12,
            title: "12. Governing Law",
            content: "These Terms shall be governed by and construed in accordance with the laws of [Your State/Country]. Any disputes will be resolved in the courts of Pune."
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
                        <span></span> Terms and Conditions
                    </div>
                </div>
            </div>

            <div className="page-content pt-50 pb-50">
                <div className="container" style={{ maxWidth: '1236px' }}>
                    <div className="mb-40">
                        <h3 style={{ color: '#0A6738', fontSize: '25px', fontWeight: 600, marginBottom: '20px' }}>Terms And Conditions</h3>
                        <p style={{ color: '#333', fontSize: '14px', fontWeight: 300, lineHeight: '24px' }}>
                            Welcome to YogisFarms. By accessing or using our website www.yogisfarms.com (“Site”), placing an order, or using our services, you agree to the following Terms and Conditions. Please read them carefully.
                        </p>
                    </div>

                    <div className="row">
                        {sections.map(section => (
                            <div key={section.id} className="col-lg-4 col-md-6 mb-40">
                                <h4 style={{ color: '#0A6738', fontSize: '20px', fontWeight: 600, marginBottom: '15px' }}>{section.title}</h4>
                                <p style={{ color: '#000', fontSize: '12px', fontWeight: 300, lineHeight: '24px' }}>
                                    {section.content}
                                </p>
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

export default Terms;
