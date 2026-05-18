import React from 'react';
import { Link } from 'react-router-dom';
import { CorePillars, PartnerLogos } from '../components/FeatureBanners';
import FloatingSidebar from '../components/FloatingSidebar';

const Privacy = () => {
    const sections = [
        {
            id: 1,
            title: "1. Information We Collect",
            content: "We may collect the following types of information:\na. Personal Information\nName, Email address, Billing and shipping addresses, Phone number, Payment information (via secure third-party payment processors)\nb. Non-Personal Information\nIP address, Browser type, Device type, Pages visited and time spent on the site"
        },
        {
            id: 2,
            title: "2. How We Use Your Information",
            content: "We use the collected information to:\nProcess orders and transactions\nSend order confirmations and shipping updates\nImprove our website and customer experience\nSend marketing emails (with your consent)\nPrevent fraud and enhance security\nComply with legal obligations"
        },
        {
            id: 3,
            title: "3. Sharing Your Information",
            content: "We do not sell your personal information. We may share your data with:\nPayment gateways (e.g., Stripe, PayPal) to process payments\nShipping carriers (e.g., FedEx, UPS) to deliver orders\nService providers (e.g., email marketing platforms, analytics tools)\nLegal authorities, if required by law"
        },
        {
            id: 4,
            title: "4. Cookies & Tracking Technologies",
            content: "We use cookies and similar tracking technologies to:\nRemember your preferences\nTrack website performance\nAnalyze visitor behavior\nYou can control or disable cookies through your browser settings."
        },
        {
            id: 5,
            title: "5. Data Security",
            content: "We implement industry-standard security measures to protect your personal data. However, no method of transmission over the Internet is 100% secure."
        },
        {
            id: 6,
            title: "6. Your Rights",
            content: "Depending on your location, you may have rights to:\nAccess, update, or delete your personal data\nObject to or restrict our processing of your data\nWithdraw consent (e.g., unsubscribe from marketing emails)\nTo exercise these rights, contact us at info@yogisfarms.com."
        },
        {
            id: 7,
            title: "7. Third-Party Links",
            content: "Our site may contain links to third-party websites. We are not responsible for their privacy practices."
        },
        {
            id: 8,
            title: "8. Children’s Privacy",
            content: "We do not knowingly collect information from children under 13 (or relevant age in your jurisdiction). If we learn we have collected such data, we will delete it promptly."
        },
        {
            id: 9,
            title: "9. Changes to This Policy",
            content: "We may update this Privacy Policy from time to time. Changes will be posted on this page with the updated effective date."
        },
        {
            id: 10,
            title: "10. Contact Us",
            content: "If you have questions or concerns about this policy, contact us at:\nYogisFarms\nEmail: info@yogisfarms.com"
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
                        <span></span> Privacy Policy
                    </div>
                </div>
            </div>

            <div className="page-content pt-50 pb-50">
                <div className="container" style={{ maxWidth: '1236px' }}>
                    <div className="mb-40">
                        <h3 style={{ color: '#0A6738', fontSize: '25px', fontWeight: 600, marginBottom: '20px' }}>Privacy Policy</h3>
                        <p style={{ color: '#333', fontSize: '14px', fontWeight: 300, lineHeight: '24px' }}>
                            Welcome to YogisFarms (“we,” “us,” or “our”). We value your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your data when you visit our website www.yogisfarms.com, make a purchase, or interact with us in any way.
                        </p>
                    </div>

                    <div className="row">
                        {sections.map(section => (
                            <div key={section.id} className="col-lg-4 col-md-6 mb-40">
                                <h4 style={{ color: '#0A6738', fontSize: '20px', fontWeight: 600, marginBottom: '15px' }}>{section.title}</h4>
                                <p style={{ color: '#000', fontSize: '12px', fontWeight: 300, lineHeight: '22px', whiteSpace: 'pre-line' }}>
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

export default Privacy;
