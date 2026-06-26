import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { CorePillars, PartnerLogos } from '../components/FeatureBanners';
import FloatingSidebar from '../components/FloatingSidebar';
import toast from 'react-hot-toast';
import { Phone, Mail, MapPin } from 'lucide-react';
import useSEO from '../hooks/useSEO';

const Contact = () => {
    useSEO('contact');
    const [formData, setFormData] = useState({
        name: '', email: '', phone: '', subject: '', message: '', captcha: ''
    });
    const [captchaCode, setCaptchaCode] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        setCaptchaCode(Math.floor(100 + Math.random() * 900).toString());
    }, []);

    const handleChange = (e) => {
        if (e.target.name === 'phone') {
            const val = e.target.value.replace(/\D/g, '');
            if (val.length <= 10) {
                setFormData({ ...formData, phone: val });
            }
            return;
        }
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.name || !formData.email || !formData.phone || !formData.subject || !formData.message || !formData.captcha) {
            toast.error("Please fill in all required fields");
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            toast.error("Please enter a valid email address");
            return;
        }

        const phoneRegex = /^\d{10}$/;
        if (!phoneRegex.test(formData.phone)) {
            toast.error("Phone number must be exactly 10 digits");
            return;
        }

        const subjectWords = formData.subject.trim().split(/\s+/).filter(Boolean);
        if (subjectWords.length > 20) {
            toast.error("Subject cannot exceed 20 words");
            return;
        }

        if (formData.message.length > 200) {
            toast.error("Message cannot exceed 200 characters");
            return;
        }

        if (formData.captcha !== captchaCode) {
            toast.error("Captcha mismatch. Please try again.");
            setCaptchaCode(Math.floor(100 + Math.random() * 900).toString());
            setFormData({ ...formData, captcha: '' });
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await api.post('/contact', formData);
            if (res.data.status) {
                toast.success(res.data.message || "Message sent successfully!");
                setFormData({ name: '', email: '', phone: '', subject: '', message: '', captcha: '' });
                setCaptchaCode(Math.floor(100 + Math.random() * 900).toString());
            } else {
                toast.error(res.data.message || "Failed to send message");
            }
        } catch (error) {
            console.error(error);
            toast.error("An error occurred");
        } finally {
            setIsSubmitting(false);
        }
    };

    const subjectWords = formData.subject.trim().split(/\s+/).filter(Boolean);

    return (
        <main className="main" style={{ fontFamily: 'Poppins, sans-serif' }}>
            {/* Standard Breadcrumb */}
            <div className="page-header breadcrumb-wrap" style={{ margin: '0' }}>
                <div className="container">
                    <div className="breadcrumb">
                        <Link to="/" rel="nofollow"><i className="fi-rs-home mr-5"></i>Home</Link>
                        <span></span> Contact Us
                    </div>
                </div>
            </div>

            <div className="page-content pt-50 pb-50">
                <div className="container" style={{ maxWidth: '1236px', paddingLeft: '15px', paddingRight: '15px' }}>
                    <div className="row">
                        {/* Left Column: Contact Information */}
                        <div className="col-lg-6 mb-40">
                            <h3 style={{ color: '#0A6738', fontSize: '25px', fontWeight: 600, marginBottom: '20px' }}>Contact Information</h3>
                            <p style={{ color: '#333', fontSize: '14px', fontWeight: 300, lineHeight: '24px', marginBottom: '35px' }}>
                                We help you find direction, remove friction, and keep your business moving forward—strategically and confidently.
                            </p>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                    <div style={{ width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Phone size={24} color="#000" />
                                    </div>
                                    <span style={{ fontSize: '20px', color: '#000', fontWeight: 400 }}>+91 7030911999</span>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                    <div style={{ width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Mail size={24} color="#000" />
                                    </div>
                                    <span style={{ fontSize: '20px', color: '#000', fontWeight: 400 }}>info@yogisfarms.com</span>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px' }}>
                                    <div style={{ width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <MapPin size={24} color="#000" />
                                    </div>
                                    <span style={{ fontSize: '20px', color: '#000', fontWeight: 400, lineHeight: '1.4', textTransform: 'none' }}>
                                        S.No 18, Saikrupa Bunglow,<br />
                                        Sudarshan Park society,<br />
                                        Ingale Nagar, Warje, Pune 411058
                                    </span>
                                </div>
                            </div>

                            <div style={{ marginTop: '40px', borderRadius: '12px', overflow: 'hidden', width: '100%', maxWidth: '501px', height: '226px' }}>
                                <iframe 
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3167.4854637225867!2d73.80859398931439!3d18.48150936170284!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc2bf0009c1bf1d%3A0xcad2b23eeb80c3c3!2sYogi&#39;s%20farm!5e0!3m2!1sen!2sin!4v1778935721305!5m2!1sen!2sin" 
                                    width="100%" 
                                    height="100%" 
                                    style={{ border: 0 }} 
                                    allowFullScreen="" 
                                    loading="lazy" 
                                    referrerPolicy="no-referrer-when-downgrade"
                                    title="Yogis Farm Location"
                                ></iframe>
                            </div>
                        </div>

                        {/* Right Column: Send Us A Message Form */}
                        <div className="col-lg-6">
                            <h3 style={{ color: '#0A6738', fontSize: '25px', fontWeight: 600, marginBottom: '20px' }}>Send Us A Message</h3>
                            <p style={{ color: '#333', fontSize: '14px', fontWeight: 300, lineHeight: '24px', marginBottom: '35px' }}>
                                Fill up the form and our team will get back to you within 24 hours.
                            </p>

                            <form onSubmit={handleSubmit}>
                                <div className="row">
                                    <div className="col-md-6 mb-20">
                                        <input 
                                            name="name" 
                                            value={formData.name} 
                                            onChange={handleChange} 
                                            placeholder="Full Name *" 
                                            style={{ width: '100%', height: '57px', borderRadius: '11px', border: '1px solid #000', padding: '0 20px', fontSize: '14px' }} 
                                        />
                                    </div>
                                    <div className="col-md-6 mb-20">
                                        <input 
                                            name="email" 
                                            value={formData.email} 
                                            onChange={handleChange} 
                                            placeholder="Email Address *" 
                                            style={{ width: '100%', height: '57px', borderRadius: '11px', border: '1px solid #000', padding: '0 20px', fontSize: '14px' }} 
                                        />
                                    </div>
                                    <div className="col-md-6 mb-20">
                                        <input 
                                            name="phone" 
                                            value={formData.phone} 
                                            onChange={handleChange} 
                                            placeholder="Phone Number *" 
                                            style={{ width: '100%', height: '57px', borderRadius: '11px', border: '1px solid #000', padding: '0 20px', fontSize: '14px' }} 
                                        />
                                    </div>
                                    <div className="col-md-6 mb-20">
                                        <input 
                                            name="subject" 
                                            value={formData.subject} 
                                            onChange={handleChange} 
                                            placeholder="Subject *" 
                                            style={{ width: '100%', height: '57px', borderRadius: '11px', border: '1px solid #000', padding: '0 20px', fontSize: '14px' }} 
                                        />
                                        <div style={{ fontSize: '11px', color: subjectWords.length > 20 ? '#ff0000' : '#777', textAlign: 'right', marginTop: '4px', paddingRight: '5px' }}>
                                            {subjectWords.length}/20 words
                                        </div>
                                    </div>
                                    <div className="col-12 mb-20">
                                        <textarea 
                                            name="message" 
                                            value={formData.message} 
                                            onChange={handleChange} 
                                            placeholder="Message *" 
                                            maxLength="200"
                                            style={{ width: '100%', height: '134px', borderRadius: '11px', border: '1px solid #000', padding: '20px', fontSize: '14px', resize: 'none' }}
                                        ></textarea>
                                        <div style={{ fontSize: '11px', color: formData.message.length >= 200 ? '#ff0000' : '#777', textAlign: 'right', marginTop: '4px', paddingRight: '5px' }}>
                                            {formData.message.length}/200 characters
                                        </div>
                                    </div>
                                    <div className="col-md-6 mb-30">
                                        <input 
                                            name="captcha" 
                                            value={formData.captcha} 
                                            onChange={handleChange} 
                                            placeholder="Captcha *" 
                                            style={{ width: '100%', height: '57px', borderRadius: '11px', border: '1px solid #000', padding: '0 20px', fontSize: '14px' }} 
                                        />
                                    </div>
                                    <div className="col-md-6 mb-30 d-flex align-items-center">
                                        <div style={{ width: '186px', height: '57px', borderRadius: '11px', border: '1px solid #9B9B9B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 600, fontStyle: 'italic', color: '#000', letterSpacing: '8px', background: '#f9f9f9', userSelect: 'none', WebkitUserSelect: 'none', MozUserSelect: 'none', msUserSelect: 'none' }} onCopy={(e) => e.preventDefault()} onCut={(e) => e.preventDefault()}>
                                            {captchaCode}
                                        </div>
                                    </div>
                                    <div className="col-12">
                                        <button 
                                            type="submit" 
                                            disabled={isSubmitting}
                                            style={{ width: '100%', height: '49px', borderRadius: '12px', background: '#FF0000', color: '#fff', fontSize: '16px', fontWeight: 600, border: 'none', cursor: 'pointer', transition: '0.3s' }}
                                        >
                                            {isSubmitting ? 'Sending...' : 'Send Message'}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
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

export default Contact;

