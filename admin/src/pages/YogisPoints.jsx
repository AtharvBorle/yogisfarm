import React, { useState, useEffect } from 'react';
import api from '../api';
import toast from 'react-hot-toast';
import { 
  Coins, 
  Award, 
  Settings, 
  TrendingUp, 
  Users, 
  ArrowUpRight, 
  ArrowDownRight, 
  Clock, 
  Gift, 
  Save, 
  PlusCircle, 
  Search,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import GenericModal from '../components/common/GenericModal';

const YogisPoints = () => {
  const [config, setConfig] = useState({
    enabled: false,
    pointsPerOrder: 10,
    conversionPoints: 100,
    conversionRupees: 100,
    minimumRedeemablePoints: 100,
    minimumCartValue: 500,
    expiryEnabled: true,
    expiryValue: 1,
    expiryUnit: 'years',
    welcomeBonusEnabled: false,
    welcomeBonusPoints: 100
  });

  const [stats, setStats] = useState({
    totalAccounts: 0,
    totalActivePoints: 0,
    totalRedeemedPoints: 0,
    totalEarnedPoints: 0,
    totalBonusPoints: 0
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Transactions state
  const [transactions, setTransactions] = useState([]);
  const [txLoading, setTxLoading] = useState(false);
  const [txType, setTxType] = useState('');
  const [txSearch, setTxSearch] = useState('');
  const [txPage, setTxPage] = useState(1);
  const [txPagination, setTxPagination] = useState({ total: 0, totalPages: 1 });

  // Manual Adjustment Modal state
  const [isAdjustOpen, setIsAdjustOpen] = useState(false);
  const [adjustForm, setAdjustForm] = useState({ userId: '', points: '', description: '' });
  const [adjustSubmitting, setAdjustSubmitting] = useState(false);

  const fetchConfigAndStats = async () => {
    try {
      const res = await api.get('/admin/yogis-points/config');
      if (res.data.status) {
        setConfig(res.data.config);
        if (res.data.stats) setStats(res.data.stats);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load Yogis Points configuration');
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async (page = 1) => {
    setTxLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', 15);
      if (txType) params.append('type', txType);
      if (txSearch) params.append('search', txSearch);

      const res = await api.get(`/admin/yogis-points/transactions?${params.toString()}`);
      if (res.data.status) {
        setTransactions(res.data.transactions);
        if (res.data.pagination) {
          setTxPagination(res.data.pagination);
          setTxPage(res.data.pagination.page);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setTxLoading(false);
    }
  };

  useEffect(() => {
    fetchConfigAndStats();
  }, []);

  useEffect(() => {
    fetchTransactions(1);
  }, [txType]);

  const handleSaveConfig = async (e) => {
    if (e) e.preventDefault();
    if (config.conversionPoints <= 0 || config.conversionRupees <= 0) {
      toast.error('Conversion points and rupees must be greater than 0');
      return;
    }
    if (config.pointsPerOrder < 0) {
      toast.error('Points per order cannot be negative');
      return;
    }
    if (config.minimumRedeemablePoints < 0) {
      toast.error('Minimum redeemable points cannot be negative');
      return;
    }
    if (config.minimumCartValue < 0) {
      toast.error('Minimum cart value cannot be negative');
      return;
    }

    setSaving(true);
    try {
      const res = await api.put('/admin/yogis-points/config', config);
      if (res.data.status) {
        toast.success(res.data.message || 'Settings saved successfully');
        setConfig(res.data.config);
        fetchConfigAndStats();
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

  const handleManualAdjust = async (e) => {
    e.preventDefault();
    if (!adjustForm.userId || !adjustForm.points) {
      toast.error('Customer User ID and Points are required');
      return;
    }
    const pts = parseInt(adjustForm.points, 10);
    if (isNaN(pts) || pts === 0) {
      toast.error('Points must be a non-zero integer (+ for credit, - for debit)');
      return;
    }

    setAdjustSubmitting(true);
    try {
      const res = await api.post('/admin/yogis-points/adjust', adjustForm);
      if (res.data.status) {
        toast.success(res.data.message || 'Points adjusted successfully');
        setIsAdjustOpen(false);
        setAdjustForm({ userId: '', points: '', description: '' });
        fetchConfigAndStats();
        fetchTransactions(1);
      } else {
        toast.error(res.data.message || 'Adjustment failed');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to adjust points');
    } finally {
      setAdjustSubmitting(false);
    }
  };

  const getTypeBadge = (type) => {
    switch (type) {
      case 'ORDER_EARN':
        return { label: 'Order Earned', bg: '#e6f4ea', color: '#137333' };
      case 'WELCOME_BONUS':
        return { label: 'Welcome Bonus', bg: '#e8f0fe', color: '#1a73e8' };
      case 'REDEEM':
        return { label: 'Redeemed', bg: '#fce8e6', color: '#c5221f' };
      case 'EXPIRY':
        return { label: 'Expired', bg: '#f1f3f4', color: '#5f6368' };
      case 'REFUND_REVERSAL':
        return { label: 'Reversal / Refund', bg: '#fef7e0', color: '#b06000' };
      case 'ADMIN_ADJUSTMENT':
        return { label: 'Admin Adjustment', bg: '#f3e8fd', color: '#9334e6' };
      default:
        return { label: type, bg: '#f1f3f4', color: '#333' };
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', color: '#666' }}>
        <Coins size={36} style={{ animation: 'spin 1.5s linear infinite', margin: '0 auto 15px auto', display: 'block' }} />
        <h3>Loading Yogis Points settings...</h3>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h2 style={{ fontSize: '26px', fontWeight: '800', color: 'var(--text)', margin: '0 0 5px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Coins size={28} color="#046938" /> Yogis Points Loyalty Program
          </h2>
          <p style={{ color: '#7E7E7E', margin: 0, fontSize: '14px' }}>
            Configure earning rules, dynamic rupee conversions, FEFO expiry, and manage customer reward points.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            type="button" 
            onClick={() => setIsAdjustOpen(true)}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px', 
              padding: '10px 18px', 
              background: '#fff', 
              color: '#046938', 
              border: '1px solid #046938', 
              borderRadius: '6px', 
              fontWeight: '600', 
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            <PlusCircle size={16} /> Manual Adjust
          </button>
          <button 
            type="button" 
            onClick={handleSaveConfig} 
            disabled={saving}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px', 
              padding: '10px 22px', 
              background: '#046938', 
              color: '#fff', 
              border: 'none', 
              borderRadius: '6px', 
              fontWeight: '600', 
              cursor: saving ? 'wait' : 'pointer',
              fontSize: '14px'
            }}
          >
            <Save size={16} /> {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '15px', marginBottom: '30px' }}>
        <div style={{ background: '#fff', border: '1px solid #e6e6e6', borderRadius: '10px', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ width: '45px', height: '45px', borderRadius: '10px', background: '#e6f4ea', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#046938' }}>
            <Users size={22} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#7E7E7E', fontWeight: '600', textTransform: 'uppercase' }}>Enrolled Accounts</div>
            <div style={{ fontSize: '22px', fontWeight: '800', color: '#253D4E' }}>{stats.totalAccounts}</div>
          </div>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e6e6e6', borderRadius: '10px', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ width: '45px', height: '45px', borderRadius: '10px', background: '#e8f0fe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1a73e8' }}>
            <Coins size={22} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#7E7E7E', fontWeight: '600', textTransform: 'uppercase' }}>Active Points</div>
            <div style={{ fontSize: '22px', fontWeight: '800', color: '#253D4E' }}>{stats.totalActivePoints.toLocaleString()}</div>
          </div>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e6e6e6', borderRadius: '10px', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ width: '45px', height: '45px', borderRadius: '10px', background: '#fce8e6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c5221f' }}>
            <ArrowDownRight size={22} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#7E7E7E', fontWeight: '600', textTransform: 'uppercase' }}>Points Redeemed</div>
            <div style={{ fontSize: '22px', fontWeight: '800', color: '#253D4E' }}>{stats.totalRedeemedPoints.toLocaleString()}</div>
          </div>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e6e6e6', borderRadius: '10px', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ width: '45px', height: '45px', borderRadius: '10px', background: '#fef7e0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#b06000' }}>
            <Gift size={22} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#7E7E7E', fontWeight: '600', textTransform: 'uppercase' }}>Bonus Issued</div>
            <div style={{ fontSize: '22px', fontWeight: '800', color: '#253D4E' }}>{stats.totalBonusPoints.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Main Configuration Card */}
      <div style={{ background: '#fff', border: '1px solid #e6e6e6', borderRadius: '12px', padding: '30px', marginBottom: '35px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
        
        {/* Global Toggle Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '25px', borderBottom: '1px solid #eee', marginBottom: '25px' }}>
          <div>
            <div style={{ fontSize: '18px', fontWeight: '700', color: '#253D4E' }}>Yogis Points Global Toggle</div>
            <div style={{ fontSize: '13px', color: '#7E7E7E', marginTop: '2px' }}>
              When OFF, customer points features, checkout redemption, earning, and UI are completely disabled. Existing data is safely preserved.
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontWeight: '700', color: config.enabled ? '#046938' : '#888', fontSize: '15px' }}>
              {config.enabled ? 'FEATURE ENABLED' : 'FEATURE DISABLED'}
            </span>
            <label style={{ position: 'relative', display: 'inline-block', width: '56px', height: '30px', margin: 0, cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={config.enabled} 
                onChange={(e) => setConfig({ ...config, enabled: e.target.checked })} 
                style={{ opacity: 0, width: 0, height: 0 }} 
              />
              <span style={{ 
                position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, 
                backgroundColor: config.enabled ? '#046938' : '#ccc', 
                transition: '0.3s', borderRadius: '30px' 
              }}>
                <span style={{ 
                  position: 'absolute', content: '""', height: '22px', width: '22px', left: config.enabled ? '28px' : '4px', bottom: '4px', 
                  backgroundColor: 'white', transition: '0.3s', borderRadius: '50%' 
                }} />
              </span>
            </label>
          </div>
        </div>

        <form onSubmit={handleSaveConfig}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px' }}>
            
            {/* Section 1: Earning */}
            <div style={{ background: '#fdfdfd', border: '1px solid #f0f0f0', borderRadius: '8px', padding: '20px' }}>
              <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#253D4E', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <TrendingUp size={18} color="#046938" /> 1. Earning Rules
              </h4>
              <p style={{ fontSize: '13px', color: '#7E7E7E', marginBottom: '15px' }}>
                Every eligible completed order gives the configured number of Yogis Points once it reaches <strong>Delivered</strong> status.
              </p>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#333', marginBottom: '6px' }}>
                  Points earned per order
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input 
                    type="number" 
                    min="0"
                    step="1"
                    value={config.pointsPerOrder}
                    onChange={(e) => setConfig({ ...config, pointsPerOrder: parseInt(e.target.value, 10) || 0 })}
                    style={{ 
                      width: '120px', 
                      padding: '10px 14px', 
                      border: '1px solid #ccc', 
                      borderRadius: '6px', 
                      fontSize: '15px', 
                      fontWeight: '700', 
                      color: '#046938' 
                    }} 
                  />
                  <span style={{ fontSize: '14px', color: '#666', fontWeight: '500' }}>Points per completed order</span>
                </div>
              </div>
            </div>

            {/* Section 2: Points Conversion */}
            <div style={{ background: '#fdfdfd', border: '1px solid #f0f0f0', borderRadius: '8px', padding: '20px' }}>
              <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#253D4E', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Coins size={18} color="#046938" /> 2. Points Conversion Rate
              </h4>
              <p style={{ fontSize: '13px', color: '#7E7E7E', marginBottom: '15px' }}>
                Both values are editable. The backend dynamically calculates the rupee discount from this ratio.
              </p>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#333', marginBottom: '6px' }}>
                  Conversion Ratio
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <input 
                    type="number" 
                    min="1"
                    step="1"
                    value={config.conversionPoints}
                    onChange={(e) => setConfig({ ...config, conversionPoints: parseInt(e.target.value, 10) || 1 })}
                    style={{ width: '90px', padding: '10px 12px', border: '1px solid #ccc', borderRadius: '6px', fontSize: '15px', fontWeight: '700', textAlign: 'center' }} 
                  />
                  <span style={{ fontWeight: '600', color: '#444' }}>Points</span>
                  <span style={{ fontWeight: '700', color: '#046938', margin: '0 5px', fontSize: '18px' }}>=</span>
                  <span style={{ fontWeight: '700', color: '#333' }}>₹</span>
                  <input 
                    type="number" 
                    min="0.01"
                    step="0.01"
                    value={config.conversionRupees}
                    onChange={(e) => setConfig({ ...config, conversionRupees: parseFloat(e.target.value) || 0 })}
                    style={{ width: '100px', padding: '10px 12px', border: '1px solid #ccc', borderRadius: '6px', fontSize: '15px', fontWeight: '700', textAlign: 'center' }} 
                  />
                </div>
                <div style={{ fontSize: '12px', color: '#046938', marginTop: '8px', fontWeight: '600' }}>
                  Current effective rate: 1 Point = ₹{(config.conversionRupees / config.conversionPoints).toFixed(2)}
                </div>
              </div>
            </div>

            {/* Section 3: Redemption Settings */}
            <div style={{ background: '#fdfdfd', border: '1px solid #f0f0f0', borderRadius: '8px', padding: '20px' }}>
              <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#253D4E', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle size={18} color="#046938" /> 3. Redemption Requirements
              </h4>
              <p style={{ fontSize: '13px', color: '#7E7E7E', marginBottom: '15px' }}>
                A customer can redeem points only when both conditions are satisfied at checkout.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#333', marginBottom: '6px' }}>
                    Min Points Required
                  </label>
                  <input 
                    type="number" 
                    min="0"
                    step="1"
                    value={config.minimumRedeemablePoints}
                    onChange={(e) => setConfig({ ...config, minimumRedeemablePoints: parseInt(e.target.value, 10) || 0 })}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #ccc', borderRadius: '6px', fontSize: '14px', fontWeight: '600' }} 
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#333', marginBottom: '6px' }}>
                    Min Cart Value (₹)
                  </label>
                  <input 
                    type="number" 
                    min="0"
                    step="1"
                    value={config.minimumCartValue}
                    onChange={(e) => setConfig({ ...config, minimumCartValue: parseFloat(e.target.value) || 0 })}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #ccc', borderRadius: '6px', fontSize: '14px', fontWeight: '600' }} 
                  />
                </div>
              </div>
            </div>

            {/* Section 4: Points Expiry & FEFO */}
            <div style={{ background: '#fdfdfd', border: '1px solid #f0f0f0', borderRadius: '8px', padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#253D4E', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Clock size={18} color="#046938" /> 4. Points Expiry & FEFO
                </h4>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>
                  <input 
                    type="checkbox" 
                    checked={config.expiryEnabled} 
                    onChange={(e) => setConfig({ ...config, expiryEnabled: e.target.checked })} 
                  />
                  Expiry Active
                </label>
              </div>
              <p style={{ fontSize: '13px', color: '#7E7E7E', marginBottom: '15px' }}>
                Each batch expires independently. When redeemed, points are consumed via <strong>First Expiring, First Out (FEFO)</strong>.
              </p>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#333', marginBottom: '6px' }}>
                  Points Expiry Duration
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input 
                    type="number" 
                    min="1"
                    step="1"
                    disabled={!config.expiryEnabled}
                    value={config.expiryValue}
                    onChange={(e) => setConfig({ ...config, expiryValue: parseInt(e.target.value, 10) || 1 })}
                    style={{ width: '90px', padding: '10px 12px', border: '1px solid #ccc', borderRadius: '6px', fontSize: '14px', fontWeight: '600' }} 
                  />
                  <select 
                    value={config.expiryUnit}
                    disabled={!config.expiryEnabled}
                    onChange={(e) => setConfig({ ...config, expiryUnit: e.target.value })}
                    style={{ padding: '10px 14px', border: '1px solid #ccc', borderRadius: '6px', fontSize: '14px', fontWeight: '600', background: '#fff' }}
                  >
                    <option value="days">Days</option>
                    <option value="months">Months</option>
                    <option value="years">Years</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 5: Welcome Bonus */}
            <div style={{ background: '#fdfdfd', border: '1px solid #f0f0f0', borderRadius: '8px', padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#253D4E', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Gift size={18} color="#046938" /> 5. Welcome Bonus
                </h4>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>
                  <input 
                    type="checkbox" 
                    checked={config.welcomeBonusEnabled} 
                    onChange={(e) => setConfig({ ...config, welcomeBonusEnabled: e.target.checked })} 
                  />
                  Enable Bonus
                </label>
              </div>
              <p style={{ fontSize: '13px', color: '#7E7E7E', marginBottom: '15px' }}>
                New customers receive these points on verification/registration. Guaranteed at most once per account.
              </p>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#333', marginBottom: '6px' }}>
                  Welcome Bonus Points
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input 
                    type="number" 
                    min="0"
                    step="1"
                    disabled={!config.welcomeBonusEnabled}
                    value={config.welcomeBonusPoints}
                    onChange={(e) => setConfig({ ...config, welcomeBonusPoints: parseInt(e.target.value, 10) || 0 })}
                    style={{ width: '120px', padding: '10px 12px', border: '1px solid #ccc', borderRadius: '6px', fontSize: '15px', fontWeight: '700', color: '#046938' }} 
                  />
                  <span style={{ fontSize: '13px', color: '#666' }}>Points on signup</span>
                </div>
              </div>
            </div>

          </div>

          <div style={{ marginTop: '25px', textAlign: 'right' }}>
            <button 
              type="submit" 
              disabled={saving}
              style={{ 
                padding: '12px 30px', 
                background: '#046938', 
                color: '#fff', 
                border: 'none', 
                borderRadius: '6px', 
                fontSize: '15px', 
                fontWeight: '700', 
                cursor: saving ? 'wait' : 'pointer' 
              }}
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>

      {/* Transaction History & Audit Ledger */}
      <div style={{ background: '#fff', border: '1px solid #e6e6e6', borderRadius: '12px', padding: '25px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#253D4E', margin: '0 0 4px 0' }}>
              Points Transaction Ledger
            </h3>
            <p style={{ color: '#7E7E7E', margin: 0, fontSize: '13px' }}>
              Complete auditable trail of all points credits, debits, expiry events, and order redemptions.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <select 
              value={txType} 
              onChange={(e) => setTxType(e.target.value)}
              style={{ padding: '8px 12px', border: '1px solid #ccc', borderRadius: '6px', fontSize: '13px', background: '#fff' }}
            >
              <option value="">All Transaction Types</option>
              <option value="ORDER_EARN">ORDER_EARN</option>
              <option value="REDEEM">REDEEM</option>
              <option value="WELCOME_BONUS">WELCOME_BONUS</option>
              <option value="EXPIRY">EXPIRY</option>
              <option value="REFUND_REVERSAL">REFUND_REVERSAL</option>
              <option value="ADMIN_ADJUSTMENT">ADMIN_ADJUSTMENT</option>
            </select>

            <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #ccc', borderRadius: '6px', padding: '0 8px', background: '#fff' }}>
              <Search size={16} color="#888" />
              <input 
                type="text" 
                placeholder="Search name, phone, order..." 
                value={txSearch} 
                onChange={(e) => setTxSearch(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') fetchTransactions(1); }}
                style={{ border: 'none', outline: 'none', padding: '8px', fontSize: '13px', width: '180px' }} 
              />
            </div>
            <button 
              type="button" 
              onClick={() => fetchTransactions(1)}
              style={{ padding: '8px 14px', background: '#253D4E', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '13px', cursor: 'pointer' }}
            >
              Filter
            </button>
          </div>
        </div>

        {/* Transactions Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #eee' }}>
                <th style={{ padding: '12px 10px', textAlign: 'left', fontWeight: '700', color: '#444' }}>Date</th>
                <th style={{ padding: '12px 10px', textAlign: 'left', fontWeight: '700', color: '#444' }}>Customer</th>
                <th style={{ padding: '12px 10px', textAlign: 'left', fontWeight: '700', color: '#444' }}>Type</th>
                <th style={{ padding: '12px 10px', textAlign: 'right', fontWeight: '700', color: '#444' }}>Points</th>
                <th style={{ padding: '12px 10px', textAlign: 'right', fontWeight: '700', color: '#444' }}>Balance After</th>
                <th style={{ padding: '12px 10px', textAlign: 'left', fontWeight: '700', color: '#444' }}>Order / Reference</th>
                <th style={{ padding: '12px 10px', textAlign: 'left', fontWeight: '700', color: '#444' }}>Expiry Date</th>
              </tr>
            </thead>
            <tbody>
              {txLoading ? (
                <tr>
                  <td colSpan="7" style={{ padding: '30px', textAlign: 'center', color: '#888' }}>
                    Loading transactions...
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ padding: '30px', textAlign: 'center', color: '#888' }}>
                    No points transactions recorded yet.
                  </td>
                </tr>
              ) : (
                transactions.map((t) => {
                  const badge = getTypeBadge(t.type);
                  const isPositive = t.points > 0;
                  return (
                    <tr key={t.id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '12px 10px', whiteSpace: 'nowrap', color: '#555' }}>
                        {new Date(t.createdAt).toLocaleString('en-IN', {
                          day: '2-digit', month: 'short', year: 'numeric',
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </td>
                      <td style={{ padding: '12px 10px' }}>
                        <div style={{ fontWeight: '600', color: '#253D4E' }}>{t.user?.name || 'Customer'}</div>
                        <div style={{ fontSize: '11px', color: '#888' }}>{t.user?.phone || 'No phone'}</div>
                      </td>
                      <td style={{ padding: '12px 10px' }}>
                        <span style={{ 
                          padding: '4px 8px', 
                          borderRadius: '12px', 
                          fontSize: '11px', 
                          fontWeight: '600',
                          background: badge.bg, 
                          color: badge.color 
                        }}>
                          {badge.label}
                        </span>
                      </td>
                      <td style={{ 
                        padding: '12px 10px', 
                        textAlign: 'right', 
                        fontWeight: '700', 
                        fontSize: '14px',
                        color: isPositive ? '#137333' : '#c5221f' 
                      }}>
                        {isPositive ? `+${t.points}` : t.points}
                      </td>
                      <td style={{ padding: '12px 10px', textAlign: 'right', fontWeight: '600', color: '#253D4E' }}>
                        {t.balanceAfter}
                      </td>
                      <td style={{ padding: '12px 10px' }}>
                        {t.order ? (
                          <a href={`/orders/detail/${t.order.orderNumber}`} style={{ color: '#046938', fontWeight: '600', textDecoration: 'none' }}>
                            #{t.order.orderNumber}
                          </a>
                        ) : (
                          <span style={{ color: '#666' }}>{t.description || '—'}</span>
                        )}
                      </td>
                      <td style={{ padding: '12px 10px', color: '#777', fontSize: '12px' }}>
                        {t.expiresAt ? new Date(t.expiresAt).toLocaleDateString('en-IN') : 'No Expiry'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {txPagination.totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '8px', marginTop: '20px' }}>
            <button 
              disabled={txPage <= 1} 
              onClick={() => fetchTransactions(txPage - 1)}
              style={{ padding: '6px 12px', border: '1px solid #ccc', borderRadius: '4px', background: '#fff', cursor: txPage <= 1 ? 'not-allowed' : 'pointer' }}
            >
              Previous
            </button>
            <span style={{ fontSize: '13px', color: '#666' }}>Page {txPage} of {txPagination.totalPages}</span>
            <button 
              disabled={txPage >= txPagination.totalPages} 
              onClick={() => fetchTransactions(txPage + 1)}
              style={{ padding: '6px 12px', border: '1px solid #ccc', borderRadius: '4px', background: '#fff', cursor: txPage >= txPagination.totalPages ? 'not-allowed' : 'pointer' }}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Manual Adjustment Modal */}
      <GenericModal 
        isOpen={isAdjustOpen} 
        title="Manual Points Adjustment" 
        onClose={() => setIsAdjustOpen(false)}
        size="md"
      >
        <form onSubmit={handleManualAdjust} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <p style={{ fontSize: '13px', color: '#666', margin: 0 }}>
            Manually add or deduct Yogis Points for a customer. Every adjustment is recorded in the transaction ledger.
          </p>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '5px' }}>
              Customer User ID *
            </label>
            <input 
              type="number" 
              required
              placeholder="e.g. 1" 
              value={adjustForm.userId} 
              onChange={(e) => setAdjustForm({ ...adjustForm, userId: e.target.value })}
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #ccc', borderRadius: '6px', fontSize: '14px' }} 
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '5px' }}>
              Points (+ to credit, - to deduct) *
            </label>
            <input 
              type="number" 
              step="1"
              required
              placeholder="e.g. 50 or -50" 
              value={adjustForm.points} 
              onChange={(e) => setAdjustForm({ ...adjustForm, points: e.target.value })}
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #ccc', borderRadius: '6px', fontSize: '14px' }} 
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '5px' }}>
              Reason / Audit Description *
            </label>
            <textarea 
              required
              placeholder="e.g. Loyalty compensation, VIP reward bonus, etc." 
              value={adjustForm.description} 
              onChange={(e) => setAdjustForm({ ...adjustForm, description: e.target.value })}
              style={{ width: '100%', minHeight: '70px', padding: '10px 12px', border: '1px solid #ccc', borderRadius: '6px', fontSize: '14px' }} 
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button 
              type="button" 
              onClick={() => setIsAdjustOpen(false)}
              style={{ padding: '9px 18px', border: '1px solid #ccc', borderRadius: '6px', background: '#fff', cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={adjustSubmitting}
              style={{ padding: '9px 20px', background: '#046938', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: adjustSubmitting ? 'wait' : 'pointer' }}
            >
              {adjustSubmitting ? 'Processing...' : 'Apply Adjustment'}
            </button>
          </div>
        </form>
      </GenericModal>
    </div>
  );
};

export default YogisPoints;
