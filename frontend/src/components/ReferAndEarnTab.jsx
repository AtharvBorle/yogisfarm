import React, { useState, useEffect } from 'react';
import api from '../api';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { 
  Share2, 
  Copy, 
  Check, 
  ExternalLink, 
  ChevronDown, 
  ChevronUp, 
  Gift, 
  Users, 
  Headphones, 
  Info, 
  CheckCircle,
  Link as LinkIcon
} from 'lucide-react';

const ReferAndEarnTab = ({ user }) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  const fetchReferralDetails = async () => {
    setLoading(true);
    try {
      const res = await api.get('/referrals/my-referrals');
      if (res.data.status) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Error fetching referral data:', err);
      toast.error('Failed to load referral information');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReferralDetails();
  }, []);

  const referralCode = data?.referralCode || user?.referralCode || '';
  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://yogisfarms.com';
  const referralLink = data?.referralLink || `${currentOrigin}/?ref=${referralCode}`;
  const config = data?.config || {
    referrerRewardPoints: 100,
    referredRewardPoints: 50,
    conversionPoints: 100,
    conversionRupees: 10,
    minimumRedeemablePoints: 1000
  };
  const summary = data?.summary || {
    totalReferrals: 0,
    totalEarnedPoints: 0,
    referrals: []
  };

  const handleCopyLink = () => {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
      toast.success('Referral link copied to clipboard!');
    }).catch(() => {
      toast.error('Failed to copy. Please copy manually.');
    });
  };

  const handleCopyCode = () => {
    if (!referralCode) return;
    navigator.clipboard.writeText(referralCode).then(() => {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
      toast.success('Referral code copied to clipboard!');
    }).catch(() => {
      toast.error('Failed to copy. Please copy manually.');
    });
  };

  const handleShareLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join Yogi's Farms",
          text: `Join Yogi's Farms using my referral code ${referralCode} to get ${config.referredRewardPoints} bonus points on pure, natural groceries!`,
          url: referralLink
        });
      } catch (err) {
        if (err.name !== 'AbortError') {
          handleCopyLink();
        }
      }
    } else {
      handleCopyLink();
    }
  };

  const handleShareCode = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Yogi's Farms Referral Code",
          text: `Use my referral code ${referralCode} when signing up at Yogi's Farms to receive bonus reward points!`,
          url: referralLink
        });
      } catch (err) {
        if (err.name !== 'AbortError') {
          handleCopyCode();
        }
      }
    } else {
      handleCopyCode();
    }
  };

  const toggleFaq = (index) => {
    setOpenFaqIndex(prev => prev === index ? null : index);
  };

  const faqs = [
    {
      q: "My friend ordered. Why is my reward pending?",
      a: "A delivered order still needs to complete its return window. Your activity updates once it qualifies. If it stays pending, contact us with your referral code."
    },
    {
      q: "Can my friend use the code without the link?",
      a: "Yes! Your friend can simply enter your unique referral code in the referral box during signup to claim their bonus points."
    },
    {
      q: "What happens if an order is cancelled or returned?",
      a: "If a referred customer order is cancelled or returned, the points benefit associated with that specific order is not eligible."
    },
    {
      q: "Where do I apply my referral credit?",
      a: "Your earned Yogi's Points can be redeemed at checkout for an instant platform discount on your orders whenever you meet the redemption threshold."
    }
  ];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', color: '#666' }}>
        <img 
          src="/assets/imgs/theme/yogis-coin.png" 
          alt="Loading..." 
          style={{ width: '48px', height: '48px', animation: 'spin 1.5s linear infinite', margin: '0 auto 15px auto', display: 'block' }} 
        />
        <h4 style={{ fontSize: '18px', fontWeight: '600' }}>Loading Refer & Earn...</h4>
      </div>
    );
  }

  return (
    <div className="refer-and-earn-container" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* ─── Top Header Card ─── */}
      <div style={{
        background: '#f4f8f3',
        borderRadius: '14px',
        padding: '16px 20px',
        border: '1px solid #e1efe4',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img 
            src="/assets/imgs/theme/yogis-coin.png" 
            alt="Yogi's Coin" 
            style={{ width: '36px', height: '36px', objectFit: 'contain', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))' }} 
          />
          <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#046938', margin: 0, letterSpacing: '-0.3px' }}>
            Refer & Earn
          </h2>
        </div>

        <div style={{
          background: '#ffffff',
          color: '#046938',
          border: '1px solid #cce5d6',
          borderRadius: '30px',
          padding: '6px 16px',
          fontSize: '13px',
          fontWeight: '700',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
        }}>
          +{config.referrerRewardPoints} Points per successful referral
        </div>
      </div>

      {/* ─── Main Content White Card ─── */}
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #eaeaea',
        padding: '28px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
      }}>

        {/* Hero Headline & Rupee Conversion Badge */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '24px' }}>
          <div>
            <h3 style={{ fontSize: '22px', fontWeight: '800', color: '#166534', margin: '0 0 6px 0' }}>
              Good food is even better when shared.
            </h3>
            <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>
              Invite your friends to Yogi's Farms with your referral link.
            </p>
          </div>

          <div style={{
            background: '#f0fdf4',
            color: '#15803d',
            border: '1px solid #bbf7d0',
            borderRadius: '20px',
            padding: '5px 14px',
            fontSize: '13px',
            fontWeight: '700'
          }}>
            +{config.conversionPoints} Points = ₹{config.conversionRupees}
          </div>
        </div>

        {/* ─── How to Use (3 Step Cards) ─── */}
        <div style={{ marginBottom: '32px' }}>
          <h4 style={{ fontSize: '16px', fontWeight: '800', color: '#1e293b', marginBottom: '16px' }}>
            How to use
          </h4>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
            gap: '16px'
          }}>
            {/* Step 1 */}
            <div style={{
              background: '#f4f8f3',
              borderRadius: '12px',
              padding: '18px 16px',
              border: '1px solid #e5eee3',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: '#046938',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: '800'
                  }}>
                    1
                  </div>
                  <LinkIcon size={18} color="#046938" />
                </div>
                <h5 style={{ fontSize: '15px', fontWeight: '700', color: '#046938', margin: '0 0 6px 0' }}>
                  Copy your link
                </h5>
                <p style={{ fontSize: '12px', color: '#555555', margin: 0, lineHeight: '1.4' }}>
                  Use the Copy link button below to get your referral link.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div style={{
              background: '#f4f8f3',
              borderRadius: '12px',
              padding: '18px 16px',
              border: '1px solid #e5eee3',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: '#046938',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: '800'
                  }}>
                    2
                  </div>
                  <Share2 size={18} color="#046938" />
                </div>
                <h5 style={{ fontSize: '15px', fontWeight: '700', color: '#046938', margin: '0 0 6px 0' }}>
                  Share with friends
                </h5>
                <p style={{ fontSize: '12px', color: '#555555', margin: 0, lineHeight: '1.4' }}>
                  Send your link to friends through a message or social app.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div style={{
              background: '#f4f8f3',
              borderRadius: '12px',
              padding: '18px 16px',
              border: '1px solid #e5eee3',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: '#046938',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: '800'
                  }}>
                    3
                  </div>
                  <Users size={18} color="#046938" />
                </div>
                <h5 style={{ fontSize: '15px', fontWeight: '700', color: '#046938', margin: '0 0 6px 0' }}>
                  Track your referrals
                </h5>
                <p style={{ fontSize: '12px', color: '#555555', margin: 0, lineHeight: '1.4' }}>
                  Check your referral history here to see who has joined.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Action Section: Referral Link & Code ─── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '32px' }}>
          
          {/* Your Referral Link */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label style={{ fontSize: '14px', fontWeight: '700', color: '#1e293b', margin: 0 }}>
                Your referral link
              </label>
              <div style={{
                background: '#f4f8f3',
                color: '#166534',
                border: '1px solid #d4edd9',
                borderRadius: '6px',
                padding: '3px 10px',
                fontSize: '11px',
                fontWeight: '600'
              }}>
                Note : Redeem at {config.minimumRedeemablePoints} Points
              </div>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              flexWrap: 'wrap'
            }}>
              <div style={{
                flex: '1 1 280px',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                minWidth: '220px'
              }}>
                <LinkIcon size={16} color="#046938" style={{ flexShrink: 0 }} />
                <span style={{
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#046938',
                  wordBreak: 'break-all',
                  userSelect: 'all'
                }}>
                  {referralLink}
                </span>
              </div>

              <button
                type="button"
                onClick={handleCopyLink}
                style={{
                  background: '#046938',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px 20px',
                  fontSize: '14px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'background 0.2s',
                  whiteSpace: 'nowrap'
                }}
              >
                {copiedLink ? <Check size={16} /> : <Copy size={16} />}
                {copiedLink ? 'Copied' : 'Copy link'}
              </button>

              <button
                type="button"
                onClick={handleShareLink}
                style={{
                  background: '#ffffff',
                  color: '#046938',
                  border: '1px solid #046938',
                  borderRadius: '8px',
                  padding: '10px 20px',
                  fontSize: '14px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'background 0.2s',
                  whiteSpace: 'nowrap'
                }}
              >
                <Share2 size={16} /> Share
              </button>
            </div>
          </div>

          {/* Your Referral Code */}
          <div>
            <div style={{ marginBottom: '8px' }}>
              <label style={{ fontSize: '14px', fontWeight: '700', color: '#1e293b', margin: 0 }}>
                Your referral Code
              </label>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              flexWrap: 'wrap'
            }}>
              <div style={{
                flex: '1 1 280px',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                minWidth: '220px'
              }}>
                <Gift size={16} color="#046938" style={{ flexShrink: 0 }} />
                <span style={{
                  fontSize: '14px',
                  fontWeight: '800',
                  color: '#1e293b',
                  letterSpacing: '1px',
                  userSelect: 'all'
                }}>
                  {referralCode || 'GENERATING...'}
                </span>
              </div>

              <button
                type="button"
                onClick={handleCopyCode}
                style={{
                  background: '#046938',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px 20px',
                  fontSize: '14px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'background 0.2s',
                  whiteSpace: 'nowrap'
                }}
              >
                {copiedCode ? <Check size={16} /> : <Copy size={16} />}
                {copiedCode ? 'Copied' : 'Copy code'}
              </button>

              <button
                type="button"
                onClick={handleShareCode}
                style={{
                  background: '#ffffff',
                  color: '#046938',
                  border: '1px solid #046938',
                  borderRadius: '8px',
                  padding: '10px 20px',
                  fontSize: '14px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'background 0.2s',
                  whiteSpace: 'nowrap'
                }}
              >
                <Share2 size={16} /> Share
              </button>
            </div>
          </div>
        </div>

        {/* ─── Referral History Section ─── */}
        <div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
            flexWrap: 'wrap',
            gap: '10px'
          }}>
            <h4 style={{ fontSize: '16px', fontWeight: '800', color: '#1e293b', margin: 0 }}>
              Referral history
            </h4>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              color: '#64748b'
            }}>
              <span>Total :</span>
              <img 
                src="/assets/imgs/theme/yogis-coin.png" 
                alt="coin" 
                style={{ width: '18px', height: '18px', objectFit: 'contain' }} 
              />
              <strong style={{ fontSize: '16px', color: '#046938', fontWeight: '800' }}>
                {summary.totalEarnedPoints} Points
              </strong>
            </div>
          </div>

          <div style={{
            border: '1px solid #eef2f6',
            borderRadius: '10px',
            overflow: 'hidden'
          }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #eef2f6' }}>
                    <th style={{ padding: '12px 18px', fontSize: '13px', fontWeight: '700', color: '#475569' }}>Friend</th>
                    <th style={{ padding: '12px 18px', fontSize: '13px', fontWeight: '700', color: '#475569' }}>Date invited</th>
                    <th style={{ padding: '12px 18px', fontSize: '13px', fontWeight: '700', color: '#475569' }}>Status</th>
                    <th style={{ padding: '12px 18px', fontSize: '13px', fontWeight: '700', color: '#475569' }}>Earnings</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.referrals.length === 0 ? (
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'center', padding: '36px 20px', color: '#888', fontSize: '13px' }}>
                        No referrals yet. Share your link or code with friends to start earning!
                      </td>
                    </tr>
                  ) : (
                    summary.referrals.map((item, idx) => (
                      <tr key={item.id || idx} style={{ borderBottom: idx < summary.referrals.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                        <td style={{ padding: '14px 18px' }}>
                          <div style={{ fontSize: '14px', fontWeight: '700', color: '#1e293b' }}>
                            {item.maskedName || 'Friend'}
                          </div>
                          <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
                            {item.maskedEmail || item.maskedPhone || 'Member'}
                          </div>
                        </td>
                        <td style={{ padding: '14px 18px', fontSize: '13px', color: '#475569' }}>
                          {item.invitedDate ? new Date(item.invitedDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                        </td>
                        <td style={{ padding: '14px 18px' }}>
                          <span style={{
                            display: 'inline-block',
                            background: item.status === 'REWARDED' || item.status === 'Completed' ? '#dcfce7' : '#f1f5f9',
                            color: item.status === 'REWARDED' || item.status === 'Completed' ? '#15803d' : '#64748b',
                            borderRadius: '20px',
                            padding: '4px 12px',
                            fontSize: '12px',
                            fontWeight: '700'
                          }}>
                            {item.status === 'REWARDED' ? 'Joined' : (item.status || 'Joined')}
                          </span>
                        </td>
                        <td style={{ padding: '14px 18px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <img 
                              src="/assets/imgs/theme/yogis-coin.png" 
                              alt="coin" 
                              style={{ width: '16px', height: '16px', objectFit: 'contain' }} 
                            />
                            <span style={{ fontSize: '13px', fontWeight: '800', color: '#15803d' }}>
                              +{item.points || config.referrerRewardPoints} Points
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <p style={{
            fontSize: '11px',
            color: '#94a3b8',
            marginTop: '12px',
            marginBottom: 0
          }}>
            Sample link and history shown for preview. Illustrative coin amounts are shown for preview only and match the example conditions on this page.
          </p>
        </div>
      </div>

      {/* ─── Informative Yellow/Mint Banner ─── */}
      <div style={{
        background: '#ecfdf5',
        border: '1px solid #bbf7d0',
        borderRadius: '10px',
        padding: '12px 18px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        color: '#166534',
        fontSize: '12px',
        lineHeight: '1.5'
      }}>
        <Info size={18} color="#166534" style={{ flexShrink: 0 }} />
        <span>
          A clear note: all amounts, dates, balances and conditions on this screen are illustrative. This is a programme preview, not a confirmed offer. Check the live terms before sharing or placing an order.
        </span>
      </div>

      {/* ─── Two-Column Bottom Section ─── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '24px'
      }}>
        
        {/* Left Column: Terms Card */}
        <div style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #eaeaea',
          padding: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <h4 style={{ fontSize: '17px', fontWeight: '800', color: '#1e293b', margin: '0 0 4px 0' }}>
              Good to know, before you share
            </h4>
            <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 20px 0' }}>
              Simple, transparent example terms. No hidden fine print.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <CheckCircle size={16} color="#046938" style={{ marginTop: '2px', flexShrink: 0 }} />
                <div>
                  <strong style={{ fontSize: '13px', color: '#1e293b', display: 'block', marginBottom: '2px' }}>
                    For new customers
                  </strong>
                  <span style={{ fontSize: '12px', color: '#64748b', lineHeight: '1.4' }}>
                    Your friend must be new to Yogi's Farms and use your link or code before paying. One referral benefit per customer; no self-referrals.
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <CheckCircle size={16} color="#046938" style={{ marginTop: '2px', flexShrink: 0 }} />
                <div>
                  <strong style={{ fontSize: '13px', color: '#1e293b', display: 'block', marginBottom: '2px' }}>
                    A qualifying first order
                  </strong>
                  <span style={{ fontSize: '12px', color: '#64748b', lineHeight: '1.4' }}>
                    Example minimum: ₹999 in product value, excluding delivery fees. The order must be paid, delivered and not cancelled or returned.
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <CheckCircle size={16} color="#046938" style={{ marginTop: '2px', flexShrink: 0 }} />
                <div>
                  <strong style={{ fontSize: '13px', color: '#1e293b', display: 'block', marginBottom: '2px' }}>
                    When your reward is ready
                  </strong>
                  <span style={{ fontSize: '12px', color: '#64748b', lineHeight: '1.4' }}>
                    Example: ₹100 store credit becomes available after delivery plus a 14-day return window. Cancelled or returned orders do not earn credit.
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <CheckCircle size={16} color="#046938" style={{ marginTop: '2px', flexShrink: 0 }} />
                <div>
                  <strong style={{ fontSize: '13px', color: '#1e293b', display: 'block', marginBottom: '2px' }}>
                    Using your credit
                  </strong>
                  <span style={{ fontSize: '12px', color: '#64748b', lineHeight: '1.4' }}>
                    Example: credit expires in 90 days. Apply up to ₹100 on an order of ₹999 or more; no cash withdrawal or stacking with other offers.
                  </span>
                </div>
              </div>

            </div>
          </div>

          <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
            <Link 
              to="/terms" 
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '12px',
                fontWeight: '700',
                color: '#046938',
                textDecoration: 'none'
              }}
            >
              Read full referral terms <ExternalLink size={13} />
            </Link>
          </div>
        </div>

        {/* Right Column: FAQ Accordion + Contact Support */}
        <div style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #eaeaea',
          padding: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <h4 style={{ fontSize: '17px', fontWeight: '800', color: '#1e293b', margin: '0 0 4px 0' }}>
              A few things you might wonder
            </h4>
            <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 20px 0' }}>
              Help with invites, qualifying orders and rewards.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {faqs.map((faq, i) => {
                const isOpen = openFaqIndex === i;
                return (
                  <div 
                    key={i}
                    style={{
                      border: '1px solid #eef2f6',
                      borderRadius: '8px',
                      overflow: 'hidden'
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => toggleFaq(i)}
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        background: isOpen ? '#f8fafc' : '#ffffff',
                        border: 'none',
                        textAlign: 'left',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '13px',
                        fontWeight: '700',
                        color: '#1e293b'
                      }}
                    >
                      <span>{faq.q}</span>
                      <span style={{ color: '#046938', fontSize: '16px', fontWeight: 'bold' }}>
                        {isOpen ? '—' : '+'}
                      </span>
                    </button>
                    {isOpen && (
                      <div style={{
                        padding: '12px 14px',
                        background: '#ffffff',
                        borderTop: '1px solid #f1f5f9',
                        fontSize: '12px',
                        color: '#64748b',
                        lineHeight: '1.5'
                      }}>
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Need a hand banner */}
          <div style={{
            marginTop: '24px',
            background: '#f4f8f3',
            border: '1px solid #dbeef0',
            borderRadius: '10px',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Headphones size={20} color="#046938" />
              <div>
                <strong style={{ fontSize: '13px', color: '#1e293b', display: 'block' }}>
                  Need a hand? We're here.
                </strong>
                <span style={{ fontSize: '11px', color: '#64748b' }}>
                  info@yogisfarms.com
                </span>
              </div>
            </div>

            <Link
              to="/contact-us"
              style={{
                background: '#ffffff',
                color: '#1e293b',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                padding: '6px 14px',
                fontSize: '12px',
                fontWeight: '700',
                textDecoration: 'none'
              }}
            >
              Contact us
            </Link>
          </div>
        </div>

      </div>

    </div>
  );
};

export default ReferAndEarnTab;
