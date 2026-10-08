import React, { useState, useEffect } from 'react';
import api from '../api';
import toast from 'react-hot-toast';
import { 
  Share2, 
  Coins, 
  Users, 
  Gift, 
  Save, 
  Search, 
  CheckCircle, 
  AlertCircle,
  ArrowRight,
  TrendingUp,
  Award
} from 'lucide-react';
import { Link } from 'react-router-dom';

const ReferAndEarn = () => {
  const [config, setConfig] = useState({
    pointsEnabled: false,
    referralEnabled: false,
    referrerRewardPoints: 100,
    referredRewardPoints: 50,
    conversionPoints: 100,
    conversionRupees: 10
  });

  const [stats, setStats] = useState({
    totalReferrals: 0,
    totalReferrerPoints: 0,
    totalReferredPoints: 0,
    totalPointsIssued: 0
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // History state
  const [referrals, setReferrals] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });

  const fetchConfig = async () => {
    try {
      const res = await api.get('/refer-and-earn/config');
      if (res.data.status) {
        setConfig(res.data.config);
        if (res.data.stats) setStats(res.data.stats);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load Refer & Earn configuration');
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async (pageNum = 1, currentLimit = limit) => {
    setHistoryLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', pageNum);
      params.append('limit', currentLimit);
      if (search) params.append('search', search);

      const res = await api.get(`/refer-and-earn/history?${params.toString()}`);
      if (res.data.status) {
        setReferrals(res.data.referrals);
        if (res.data.pagination) {
          setPagination(res.data.pagination);
          setPage(res.data.pagination.page);
        }
        if (res.data.metrics) {
          setStats(res.data.metrics);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
    fetchHistory(1);
  }, []);

  const handleSaveConfig = async (e) => {
    if (e) e.preventDefault();

    if (config.referralEnabled && !config.pointsEnabled) {
      toast.error('Cannot enable Refer & Earn when Yogis Points is disabled. Enable Yogis Points first.');
      return;
    }

    if (config.referrerRewardPoints < 0 || config.referredRewardPoints < 0) {
      toast.error('Reward points cannot be negative');
      return;
    }

    setSaving(true);
    try {
      const res = await api.put('/refer-and-earn/config', {
        referralEnabled: config.referralEnabled,
        referrerRewardPoints: parseInt(config.referrerRewardPoints, 10) || 0,
        referredRewardPoints: parseInt(config.referredRewardPoints, 10) || 0
      });
      if (res.data.status) {
        toast.success(res.data.message || 'Settings saved successfully');
        setConfig(res.data.config);
        fetchHistory(1);
      } else {
        toast.error(res.data.message || 'Failed to update configuration');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Error updating settings');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = () => {
    if (!config.pointsEnabled && !config.referralEnabled) {
      toast.error('Cannot enable Refer & Earn while Yogis Points is disabled.');
      return;
    }
    setConfig(prev => ({ ...prev, referralEnabled: !prev.referralEnabled }));
  };

  const pointsToRupees = (points) => {
    if (!points || !config.conversionPoints || !config.conversionRupees) return '₹0.00';
    const val = (points * config.conversionRupees) / config.conversionPoints;
    return `₹${val.toFixed(2)}`;
  };

  if (loading) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', color: '#666' }}>
        <Share2 size={36} style={{ animation: 'spin 1.5s linear infinite', margin: '0 auto 15px auto', display: 'block' }} />
        <h3>Loading Refer & Earn settings...</h3>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h2 style={{ fontSize: '26px', fontWeight: '800', color: 'var(--text)', margin: '0 0 5px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Share2 size={28} color="#046938" /> Refer & Earn Program
          </h2>
          <p style={{ color: '#7E7E7E', margin: 0, fontSize: '14px' }}>
            Manage customer referral incentives, reward distribution, and monitor friend referral signups.
          </p>
        </div>
        <div>
          <button 
            type="button" 
            onClick={handleSaveConfig} 
            disabled={saving}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              padding: '10px 22px', 
              background: '#046938', 
              color: '#fff', 
              border: 'none', 
              borderRadius: '8px', 
              fontWeight: '600', 
              cursor: saving ? 'not-allowed' : 'pointer' 
            }}
          >
            <Save size={18} /> {saving ? 'Saving...' : 'Save Configuration'}
          </button>
        </div>
      </div>

      {/* Yogis Points Dependency Warning Banner */}
      {!config.pointsEnabled && (
        <div style={{ 
          background: '#fff3cd', 
          border: '1px solid #ffeeba', 
          borderRadius: '10px', 
          padding: '16px 20px', 
          marginBottom: '25px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#856404' }}>
            <AlertCircle size={24} color="#856404" />
            <div>
              <strong>Yogis Points is currently OFF.</strong>
              <div style={{ fontSize: '13px', marginTop: '2px' }}>
                Refer & Earn depends on Yogis Points and cannot be enabled while Yogis Points is disabled.
              </div>
            </div>
          </div>
          <Link 
            to="/yogis-points" 
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '6px', 
              background: '#856404', 
              color: '#fff', 
              padding: '8px 16px', 
              borderRadius: '6px', 
              textDecoration: 'none', 
              fontSize: '13px', 
              fontWeight: '600' 
            }}
          >
            Go to Yogis Points <ArrowRight size={14} />
          </Link>
        </div>
      )}

      {/* Overview Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #eaeaea', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#7E7E7E', marginBottom: '10px' }}>
            <span style={{ fontSize: '14px', fontWeight: '500' }}>Total Referrals</span>
            <Users size={20} color="#046938" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: '800', color: '#333' }}>
            {stats.totalReferrals.toLocaleString()}
          </div>
          <span style={{ fontSize: '12px', color: '#999' }}>Successful referral signups</span>
        </div>

        <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #eaeaea', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#7E7E7E', marginBottom: '10px' }}>
            <span style={{ fontSize: '14px', fontWeight: '500' }}>Referrer Points Awarded</span>
            <Award size={20} color="#2b825b" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: '800', color: '#2b825b' }}>
            {stats.totalReferrerPoints.toLocaleString()} <span style={{ fontSize: '14px', fontWeight: 'normal' }}>pts</span>
          </div>
          <span style={{ fontSize: '12px', color: '#999' }}>Credited to referrers</span>
        </div>

        <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #eaeaea', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#7E7E7E', marginBottom: '10px' }}>
            <span style={{ fontSize: '14px', fontWeight: '500' }}>Friend Points Awarded</span>
            <Gift size={20} color="#e07a5f" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: '800', color: '#e07a5f' }}>
            {stats.totalReferredPoints.toLocaleString()} <span style={{ fontSize: '14px', fontWeight: 'normal' }}>pts</span>
          </div>
          <span style={{ fontSize: '12px', color: '#999' }}>Credited to referred signups</span>
        </div>

        <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #eaeaea', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#7E7E7E', marginBottom: '10px' }}>
            <span style={{ fontSize: '14px', fontWeight: '500' }}>Total Referral Points</span>
            <Coins size={20} color="#f59e0b" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: '800', color: '#f59e0b' }}>
            {stats.totalPointsIssued.toLocaleString()} <span style={{ fontSize: '14px', fontWeight: 'normal' }}>pts</span>
          </div>
          <span style={{ fontSize: '12px', color: '#999' }}>All referral bonus issued</span>
        </div>
      </div>

      {/* Main Settings Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '25px', marginBottom: '35px' }}>
        
        {/* Program Status Card */}
        <div style={{ background: '#fff', borderRadius: '12px', padding: '25px', border: '1px solid #eaeaea' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '15px', color: '#333', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Share2 size={20} color="#046938" /> Master Program Status
          </h3>
          <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px' }}>
            Toggle the entire Refer & Earn program on or off. When disabled, customers cannot view referral links, codes, or earn referral rewards.
          </p>

          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            padding: '16px 20px', 
            background: config.referralEnabled ? '#F2F9F6' : '#f9f9f9', 
            borderRadius: '10px',
            border: `1px solid ${config.referralEnabled ? '#a3d9bc' : '#e0e0e0'}`
          }}>
            <div>
              <div style={{ fontWeight: '700', fontSize: '16px', color: config.referralEnabled ? '#046938' : '#666' }}>
                Refer & Earn Program: {config.referralEnabled ? 'ACTIVE (ON)' : 'DISABLED (OFF)'}
              </div>
              <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>
                {config.referralEnabled 
                  ? 'Referral links active & reward bonus awarded on signup' 
                  : 'Customer referral UI hidden & bonuses paused'}
              </div>
            </div>

            <label style={{ position: 'relative', display: 'inline-block', width: '50px', height: '26px' }}>
              <input 
                type="checkbox" 
                checked={config.referralEnabled} 
                onChange={handleToggle}
                disabled={!config.pointsEnabled}
                style={{ opacity: 0, width: 0, height: 0 }} 
              />
              <span style={{ 
                position: 'absolute', 
                cursor: !config.pointsEnabled ? 'not-allowed' : 'pointer', 
                top: 0, left: 0, right: 0, bottom: 0, 
                backgroundColor: config.referralEnabled ? '#046938' : '#ccc', 
                borderRadius: '34px', 
                transition: '0.4s',
                opacity: !config.pointsEnabled ? 0.6 : 1
              }}>
                <span style={{ 
                  position: 'absolute', 
                  content: '""', 
                  height: '20px', 
                  width: '20px', 
                  left: config.referralEnabled ? '26px' : '4px', 
                  bottom: '3px', 
                  backgroundColor: 'white', 
                  borderRadius: '50%', 
                  transition: '0.4s' 
                }} />
              </span>
            </label>
          </div>

          <div style={{ marginTop: '20px', padding: '12px 16px', background: '#f8fafc', borderRadius: '8px', fontSize: '13px', color: '#64748b' }}>
            <strong>Note:</strong> If the admin turns Yogis Points OFF, Refer & Earn is automatically disabled to guarantee loyalty consistency.
          </div>
        </div>

        {/* Reward Rules Configuration Card */}
        <div style={{ background: '#fff', borderRadius: '12px', padding: '25px', border: '1px solid #eaeaea' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '15px', color: '#333', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Gift size={20} color="#046938" /> Reward Points Configuration
          </h3>
          <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px' }}>
            Set the number of Yogis Points awarded immediately upon new customer registration.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#333', marginBottom: '6px' }}>
                Referrer Reward (Points given to existing customer)
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input 
                  type="number" 
                  min="0"
                  step="1"
                  value={config.referrerRewardPoints} 
                  onChange={(e) => setConfig({ ...config, referrerRewardPoints: e.target.value })}
                  style={{ 
                    flex: 1, 
                    padding: '10px 14px', 
                    borderRadius: '8px', 
                    border: '1px solid #ccc', 
                    fontSize: '15px', 
                    fontWeight: '600',
                    outline: 'none'
                  }} 
                />
                <span style={{ fontSize: '14px', fontWeight: '600', color: '#666', minWidth: '60px' }}>Points</span>
              </div>
              <div style={{ fontSize: '12px', color: '#046938', marginTop: '5px', fontWeight: '500' }}>
                ≈ {pointsToRupees(config.referrerRewardPoints)} discount value
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#333', marginBottom: '6px' }}>
                Referred Customer Reward (Points given to new friend)
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input 
                  type="number" 
                  min="0"
                  step="1"
                  value={config.referredRewardPoints} 
                  onChange={(e) => setConfig({ ...config, referredRewardPoints: e.target.value })}
                  style={{ 
                    flex: 1, 
                    padding: '10px 14px', 
                    borderRadius: '8px', 
                    border: '1px solid #ccc', 
                    fontSize: '15px', 
                    fontWeight: '600',
                    outline: 'none'
                  }} 
                />
                <span style={{ fontSize: '14px', fontWeight: '600', color: '#666', minWidth: '60px' }}>Points</span>
              </div>
              <div style={{ fontSize: '12px', color: '#046938', marginTop: '5px', fontWeight: '500' }}>
                ≈ {pointsToRupees(config.referredRewardPoints)} discount value
              </div>
            </div>
          </div>

          <div style={{ marginTop: '20px', padding: '12px 16px', background: '#f0fdf4', borderRadius: '8px', fontSize: '13px', color: '#166534', border: '1px solid #bbf7d0' }}>
            <strong>Instant Grant:</strong> Rewards are credited immediately upon new user account completion without requiring any order or purchase.
          </div>
        </div>

      </div>

      {/* Referral History Section */}
      <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #eaeaea', padding: '25px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', margin: '0 0 5px 0', color: '#333', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={20} color="#046938" /> Referral Signups History
            </h3>
            <span style={{ color: '#7E7E7E', fontSize: '13px' }}>
              Showing {referrals.length} of {pagination.total} referral relationships
            </span>
          </div>

          {/* Search Bar */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div style={{ position: 'relative', width: '280px' }}>
              <Search size={16} color="#999" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="text" 
                placeholder="Search code, name, phone..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') fetchHistory(1); }}
                style={{ 
                  width: '100%', 
                  padding: '9px 12px 9px 36px', 
                  borderRadius: '8px', 
                  border: '1px solid #ddd', 
                  fontSize: '13px',
                  outline: 'none'
                }}
              />
            </div>
            <button 
              type="button" 
              onClick={() => fetchHistory(1)}
              style={{ 
                padding: '9px 16px', 
                background: '#f1f3f4', 
                border: 'none', 
                borderRadius: '8px', 
                fontWeight: '600', 
                fontSize: '13px', 
                cursor: 'pointer' 
              }}
            >
              Filter
            </button>
          </div>
        </div>

        {/* Entries Selector Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', padding: '0 4px', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text)' }}>
            Show 
            <select 
              value={limit} 
              onChange={(e) => {
                const newLimit = parseInt(e.target.value, 10);
                setLimit(newLimit);
                fetchHistory(1, newLimit);
              }}
              style={{ padding: '4px 8px', border: '1px solid var(--border, #ddd)', borderRadius: '4px', background: 'var(--card-bg, #fff)', color: 'var(--text, #333)', fontSize: '13px' }}
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select> 
            entries
          </div>
          <div style={{ fontSize: '13px', color: '#666' }}>
            Showing {pagination.total > 0 ? (page - 1) * limit + 1 : 0} to {Math.min(page * limit, pagination.total)} of {pagination.total} entries
          </div>
        </div>

        {/* History Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #f0f0f0', color: '#666', background: '#fafafa' }}>
                <th style={{ padding: '12px 14px' }}>Referrer</th>
                <th style={{ padding: '12px 14px' }}>Referral Code</th>
                <th style={{ padding: '12px 14px' }}>Referred Friend</th>
                <th style={{ padding: '12px 14px' }}>Status</th>
                <th style={{ padding: '12px 14px' }}>Referrer Bonus</th>
                <th style={{ padding: '12px 14px' }}>Friend Bonus</th>
                <th style={{ padding: '12px 14px' }}>Signed Up Date</th>
              </tr>
            </thead>
            <tbody>
              {historyLoading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                    Loading referral records...
                  </td>
                </tr>
              ) : referrals.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                    No referral signups found.
                  </td>
                </tr>
              ) : (
                referrals.map((item) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={{ padding: '14px' }}>
                      <div style={{ fontWeight: '600', color: '#333' }}>
                        {item.referrer?.name || 'Customer'}
                      </div>
                      <div style={{ fontSize: '12px', color: '#888' }}>
                        {item.referrer?.phone || 'No phone'}
                      </div>
                    </td>
                    <td style={{ padding: '14px' }}>
                      <span style={{ 
                        fontFamily: 'monospace', 
                        fontWeight: '700', 
                        fontSize: '13px', 
                        background: '#f1f5f9', 
                        color: '#0f172a',
                        padding: '4px 8px', 
                        borderRadius: '6px',
                        border: '1px solid #e2e8f0'
                      }}>
                        {item.referralCode}
                      </span>
                    </td>
                    <td style={{ padding: '14px' }}>
                      <div style={{ fontWeight: '600', color: '#333' }}>
                        {item.referred?.name || 'New Customer'}
                      </div>
                      <div style={{ fontSize: '12px', color: '#888' }}>
                        {item.referred?.phone || item.referred?.email || 'N/A'}
                      </div>
                    </td>
                    <td style={{ padding: '14px' }}>
                      <span style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '4px',
                        padding: '4px 10px', 
                        borderRadius: '20px', 
                        fontSize: '12px', 
                        fontWeight: '700', 
                        background: item.status === 'REWARDED' ? '#dcfce7' : '#fef9c3', 
                        color: item.status === 'REWARDED' ? '#15803d' : '#854d0e'
                      }}>
                        <CheckCircle size={13} /> {item.status}
                      </span>
                    </td>
                    <td style={{ padding: '14px', fontWeight: '700', color: '#046938' }}>
                      +{item.referrerRewardPoints} pts
                    </td>
                    <td style={{ padding: '14px', fontWeight: '700', color: '#2b825b' }}>
                      +{item.referredRewardPoints} pts
                    </td>
                    <td style={{ padding: '14px', color: '#666', fontSize: '13px' }}>
                      {item.signedUpAt ? new Date(item.signedUpAt).toLocaleString() : new Date(item.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {pagination.totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ fontSize: '13px', color: '#666' }}>
              Showing {pagination.total > 0 ? (page - 1) * limit + 1 : 0} to {Math.min(page * limit, pagination.total)} of {pagination.total} entries
            </div>
            <div style={{ display: 'flex', border: '1px solid #dee2e6', borderRadius: '4px', overflow: 'hidden' }}>
              <button 
                type="button" 
                disabled={page <= 1} 
                onClick={() => fetchHistory(page - 1, limit)}
                style={{ padding: '6px 14px', background: page <= 1 ? '#f8f9fa' : '#fff', color: page <= 1 ? '#6c757d' : '#046938', border: 'none', borderRight: '1px solid #dee2e6', cursor: page <= 1 ? 'not-allowed' : 'pointer', fontSize: '13px', fontWeight: '500' }}
              >
                Prev
              </button>
              
              {/* Numbered Page Buttons */}
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                let pageNum;
                if (pagination.totalPages <= 5) {
                  pageNum = i + 1;
                } else if (page <= 3) {
                  pageNum = i + 1;
                } else if (page >= pagination.totalPages - 2) {
                  pageNum = pagination.totalPages - 4 + i;
                } else {
                  pageNum = page - 2 + i;
                }
                
                return (
                  <button 
                    key={pageNum}
                    type="button"
                    onClick={() => fetchHistory(pageNum, limit)}
                    style={{ 
                      padding: '6px 12px', 
                      background: page === pageNum ? '#046938' : '#fff', 
                      color: page === pageNum ? '#fff' : '#046938', 
                      border: 'none', 
                      borderRight: '1px solid #dee2e6', 
                      cursor: 'pointer', 
                      fontSize: '13px',
                      fontWeight: page === pageNum ? 'bold' : 'normal'
                    }}
                  >
                    {pageNum}
                  </button>
                );
              })}
              
              <button 
                type="button" 
                disabled={page >= pagination.totalPages} 
                onClick={() => fetchHistory(page + 1, limit)}
                style={{ padding: '6px 14px', background: page >= pagination.totalPages ? '#f8f9fa' : '#fff', color: page >= pagination.totalPages ? '#6c757d' : '#046938', border: 'none', cursor: page >= pagination.totalPages ? 'not-allowed' : 'pointer', fontSize: '13px', fontWeight: '500' }}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReferAndEarn;
