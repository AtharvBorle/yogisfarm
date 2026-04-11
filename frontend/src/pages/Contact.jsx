import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import FeatureBanners from '../components/FeatureBanners';
import toast from 'react-hot-toast';

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '', email: '', phone: '', subject: '', message: '', captcha: ''
    });
    const [captchaCode, setCaptchaCode] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        // Generate random 3 digit captcha
        setCaptchaCode(Math.floor(100 + Math.random() * 900).toString());
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.name || !formData.phone || !formData.message || !formData.captcha) {
            toast.error("Please fill in all required fields");
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

    return (
        <main className="main">
            {/* Custom Green Breadcrumb Banner */}
            <div className="page-header breadcrumb-wrap" style={{ 
                margin: '20px 0', padding: '40px 0', backgroundColor: '#046938', borderRadius: '10px', position: 'relative', overflow: 'hidden', marginLeft: '15px', marginRight: '15px' 
            }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.1, backgroundImage: 'url(/assets/imgs/theme/breadcrumb-bg.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', pointerEvents: 'none' }}></div>
                <div className="container position-relative">
                    <div className="breadcrumb" style={{ display: 'flex', alignItems: 'center', color: '#fff' }}>
                        <Link to="/" style={{ color: '#fff', fontSize: '16px' }}><i className="fi-rs-home mr-5"></i>Home</Link>
                        <span style={{ margin: '0 10px' }}>›</span>
                        <span style={{ fontSize: '16px', fontWeight: 'bold' }}>Contact Us</span>
                    </div>
                </div>
            </div>

            <div className="container mt-50 mb-50">
                <div className="row">
                    <div className="col-xl-8 col-lg-10 m-auto">
                        <div className="row">
                            <div className="col-lg-7 mb-50">
                                <h6 className="text-brand mb-10" style={{ color: '#046938', fontWeight: '600' }}>Contact Form</h6>
                                <h2 className="mb-30" style={{ color: '#253D4E', fontSize: '40px', fontWeight: '700' }}>Drop Us A Line</h2>
                                
                                <form className="contact-form-style mx-auto" onSubmit={handleSubmit}>
                                    <div className="row">
                                        <div className="col-lg-6 col-md-6">
                                            <div className="input-style mb-20">
                                                <label style={{ fontSize: '13px', color: '#7E7E7E', marginBottom: '5px' }}>Full Name <span className="text-danger">*</span></label>
                                                <input name="name" value={formData.name} onChange={handleChange} placeholder="Name" type="text" style={{ padding: '15px', borderRadius: '8px', border: '1px solid #eee' }} />
                                            </div>
                                        </div>
                                        <div className="col-lg-6 col-md-6">
                                            <div className="input-style mb-20">
                                                <label style={{ fontSize: '13px', color: '#7E7E7E', marginBottom: '5px' }}>Email</label>
                                                <input name="email" value={formData.email} onChange={handleChange} placeholder="E-Mail Address" type="email" style={{ padding: '15px', borderRadius: '8px', border: '1px solid #eee' }} />
                                            </div>
                                        </div>
                                        <div className="col-lg-6 col-md-6">
                                            <div className="input-style mb-20">
                                                <label style={{ fontSize: '13px', color: '#7E7E7E', marginBottom: '5px' }}>Phone Number <span className="text-danger">*</span></label>
                                                <input name="phone" value={formData.phone} onChange={handleChange} placeholder="Mobile Number" type="text" style={{ padding: '15px', borderRadius: '8px', border: '1px solid #eee' }} />
                                            </div>
                                        </div>
                                        <div className="col-lg-6 col-md-6">
                                            <div className="input-style mb-20">
                                                <label style={{ fontSize: '13px', color: '#7E7E7E', marginBottom: '5px' }}>Subject</label>
                                                <input name="subject" value={formData.subject} onChange={handleChange} placeholder="Subject" type="text" style={{ padding: '15px', borderRadius: '8px', border: '1px solid #eee' }} />
                                            </div>
                                        </div>
                                        <div className="col-lg-12 col-md-12">
                                            <div className="textarea-style mb-30">
                                                <label style={{ fontSize: '13px', color: '#7E7E7E', marginBottom: '5px' }}>Message <span className="text-danger">*</span></label>
                                                <textarea name="message" value={formData.message} onChange={handleChange} placeholder="Message" style={{ padding: '15px', borderRadius: '8px', border: '1px solid #eee', minHeight: '150px' }}></textarea>
                                            </div>
                                        </div>
                                        
                                        <div className="col-lg-6 col-md-6 d-flex align-items-center mb-30">
                                            <div className="input-style" style={{ flex: 1, marginRight: '15px' }}>
                                                <label style={{ fontSize: '13px', color: '#7E7E7E', marginBottom: '5px' }}>Captcha <span className="text-danger">*</span></label>
                                                <input name="captcha" value={formData.captcha} onChange={handleChange} placeholder="Captcha" type="text" style={{ padding: '15px', borderRadius: '8px', border: '1px solid #eee' }} />
                                            </div>
                                            <div style={{ marginTop: '20px' }}>
                                                <span style={{ 
                                                    fontFamily: "'Segoe Script', cursive", fontSize: '32px', color: '#4B3621', 
                                                    textDecoration: 'line-through', letterSpacing: '5px', opacity: 0.8 
                                                }}>{captchaCode}</span>
                                            </div>
                                        </div>

                                        <div className="col-lg-12">
                                            <button className="submit submit-auto-width" type="submit" disabled={isSubmitting} style={{ backgroundColor: '#046938', color: '#fff', borderRadius: '5px', padding: '12px 35px' }}>
                                                {isSubmitting ? 'Sending...' : 'Submit'}
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                            
                            <div className="col-lg-5 pl-50 d-none d-lg-block">
                                <img src="/assets/imgs/page/contact-2.png" alt="Contact Yogi's Farm" style={{ width: '100%', marginTop: '50px' }} onError={e => e.target.style.display='none'} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Google Map Embed */}
            <div className="container-fluid p-0 mb-50">
                <iframe 
                    title="Yogis Farm Map"
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3783.913751070265!2d73.8055553!3d18.4875604!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc2bfec54734005%3A0xcfabcbbb715fba39!2sIngale%20Nagar%2C%20Warje%2C%20Pune%2C%20Maharashtra%20411058!5e0!3m2!1sen!2sin!4v1680123456789!5m2!1sen!2sin" 
                    width="100%" 
                    height="450" 
                    style={{ border: 0 }} 
                    allowFullScreen="" 
                    loading="lazy" 
                    referrerPolicy="no-referrer-when-downgrade">
                </iframe>
            </div>

            <FeatureBanners />
        </main>
    );
};

export default Contact;
