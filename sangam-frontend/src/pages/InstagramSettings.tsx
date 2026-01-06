// InstagramSettings.tsx - Instagram account connection settings

import React, { useState, useEffect } from 'react';
import { getInstagramStatus, getInstagramOAuthUrl, syncInstagramMessages, disconnectInstagram, type InstagramStatus } from '../api/instagram';
import axiosInstance from '../api/axiosInstance';

const InstagramIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} viewBox="0 0 24 24">
    <defs>
      <radialGradient id="ig-grad" cx="0.3" cy="1.2" r="1.2">
        <stop offset="0" stopColor="#F58529" />
        <stop offset="0.5" stopColor="#DD2A7B" />
        <stop offset="1" stopColor="#8134AF" />
      </radialGradient>
    </defs>
    <path
      d="M12 2c-2.7 0-3 .01-4.06.06-1.06.05-1.79.24-2.43.5-.64.27-1.16.6-1.68 1.13-.53.52-.86 1.04-1.13 1.68-.26.64-.45 1.37-.5 2.43C2.01 9 2 9.3 2 12s.01 3 .06 4.06c.05 1.06.24 1.79.5 2.43.27.64.6 1.16 1.13 1.68.52.53 1.04.86 1.68 1.13.64.26 1.37.45 2.43.5C9 21.99 9.3 22 12 22s3-.01 4.06-.06c1.06-.05 1.79-.24 2.43-.5.64-.27 1.16-.6 1.68-1.13.53-.52.86-1.04 1.13-1.68.26-.64.45-1.37.5-2.43.05-1.06.06-1.37.06-4.06s-.01-3-.06-4.06c-.05-1.06-.24-1.79-.5-2.43-.27-.64-.6-1.16-1.13-1.68C17.7 3.39 17.2 3.06 16.5 2.8c-.64-.26-1.37-.45-2.43-.5C13.01 2.01 12.7 2 12 2z"
      fill="url(#ig-grad)"
    />
  </svg>
);

const InstagramSettings: React.FC = () => {
  const [status, setStatus] = useState<InstagramStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    try {
      setLoading(true);
      const statusData = await getInstagramStatus();
      setStatus(statusData);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load Instagram status');
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    try {
      setError(null);
      const { oauth_url } = await getInstagramOAuthUrl();
      // Open Instagram OAuth in new window
      window.open(oauth_url, 'Instagram Auth', 'width=600,height=700');
      
      // Poll for status change (user might complete auth in popup)
      const checkInterval = setInterval(async () => {
        try {
          const newStatus = await getInstagramStatus();
          if (newStatus.connected) {
            clearInterval(checkInterval);
            setStatus(newStatus);
            setSuccess('Instagram account connected successfully!');
            setTimeout(() => setSuccess(null), 5000);
          }
        } catch (err) {
          // Ignore errors during polling
        }
      }, 2000);
      
      // Stop polling after 5 minutes
      setTimeout(() => clearInterval(checkInterval), 300000);
    } catch (err: any) {
      setError(err.message || 'Failed to get Instagram OAuth URL');
    }
  };

  const handleSync = async () => {
    try {
      setSyncing(true);
      setError(null);
      const result = await syncInstagramMessages();
      setSuccess(`Successfully synced ${result.conversations_synced} conversations!`);
      setTimeout(() => setSuccess(null), 5000);
      await loadStatus(); // Refresh status
    } catch (err: any) {
      setError(err.message || 'Failed to sync Instagram messages');
    } finally {
      setSyncing(false);
    }
  };

  const handleDisconnect = async () => {
    if (!window.confirm('Are you sure you want to disconnect your Instagram account?')) {
      return;
    }
    
    try {
      setError(null);
      await disconnectInstagram();
      setSuccess('Instagram account disconnected successfully');
      setTimeout(() => setSuccess(null), 5000);
      await loadStatus(); // Refresh status
    } catch (err: any) {
      setError(err.message || 'Failed to disconnect Instagram');
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>Loading Instagram settings...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <InstagramIcon width={32} height={32} style={styles.icon} />
        <h2 style={styles.title}>Instagram Integration</h2>
      </div>

      {error && (
        <div style={styles.error}>
          <span style={styles.errorIcon}>⚠️</span>
          {error}
        </div>
      )}

      {success && (
        <div style={styles.success}>
          <span style={styles.successIcon}>✅</span>
          {success}
        </div>
      )}

      {status?.connected ? (
        <div style={styles.connectedCard}>
          <div style={styles.statusHeader}>
            <div style={styles.statusIndicator} />
            <span style={styles.statusText}>Connected</span>
          </div>
          
          <div style={styles.accountInfo}>
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>Account:</span>
              <span style={styles.infoValue}>
                {status.instagram_username || status.instagram_name || 'Instagram Account'}
              </span>
            </div>
            {status.connected_at && (
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Connected:</span>
                <span style={styles.infoValue}>
                  {new Date(status.connected_at).toLocaleDateString()}
                </span>
              </div>
            )}
            {status.last_sync_at && (
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Last Sync:</span>
                <span style={styles.infoValue}>
                  {new Date(status.last_sync_at).toLocaleString()}
                </span>
              </div>
            )}
          </div>

          {status.token_expired && (
            <div style={styles.warning}>
              ⚠️ Your access token has expired. Please reconnect your account.
            </div>
          )}

          <div style={styles.actions}>
            <button
              style={{ ...styles.button, ...styles.syncButton }}
              onClick={handleSync}
              disabled={syncing}
            >
              {syncing ? 'Syncing...' : '🔄 Sync Messages'}
            </button>
            <button
              style={{ ...styles.button, ...styles.disconnectButton }}
              onClick={handleDisconnect}
            >
              Disconnect
            </button>
          </div>
        </div>
      ) : (
        <div style={styles.disconnectedCard}>
          <div style={styles.disconnectedContent}>
            <InstagramIcon width={64} height={64} style={styles.largeIcon} />
            <h3 style={styles.disconnectedTitle}>Connect Your Instagram Account</h3>
            <p style={styles.disconnectedText}>
              Connect your Instagram Business account to automatically sync messages and conversations.
            </p>
            <button style={styles.connectButton} onClick={handleConnect}>
              <InstagramIcon width={20} height={20} />
              Connect Instagram
            </button>
          </div>
        </div>
      )}

      <div style={styles.helpSection}>
        <h4 style={styles.helpTitle}>How it works:</h4>
        <ul style={styles.helpList}>
          <li>Connect your Instagram Business account</li>
          <li>Messages will be synced automatically</li>
          <li>You can manually sync anytime using the "Sync Messages" button</li>
          <li>All conversations will appear in your Chats tab</li>
        </ul>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '40px 20px',
    fontFamily: 'sans-serif',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '32px',
  },
  icon: {
    color: '#E4405F',
  },
  title: {
    fontSize: '28px',
    fontWeight: 700,
    color: '#1a202c',
    margin: 0,
  },
  loading: {
    textAlign: 'center',
    padding: '40px',
    color: '#666',
    fontSize: '16px',
  },
  error: {
    background: '#fed7d7',
    border: '1px solid #fc8181',
    color: '#c53030',
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '24px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  errorIcon: {
    fontSize: '18px',
  },
  success: {
    background: '#c6f6d5',
    border: '1px solid #9ae6b4',
    color: '#22543d',
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '24px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  successIcon: {
    fontSize: '18px',
  },
  connectedCard: {
    background: 'white',
    borderRadius: '12px',
    padding: '32px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    marginBottom: '32px',
  },
  statusHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '24px',
  },
  statusIndicator: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    background: '#10b981',
  },
  statusText: {
    fontSize: '18px',
    fontWeight: 600,
    color: '#10b981',
  },
  accountInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginBottom: '24px',
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px 0',
    borderBottom: '1px solid #e2e8f0',
  },
  infoLabel: {
    fontSize: '14px',
    color: '#64748b',
    fontWeight: 500,
  },
  infoValue: {
    fontSize: '14px',
    color: '#1e293b',
    fontWeight: 600,
  },
  warning: {
    background: '#fef3c7',
    border: '1px solid #fcd34d',
    color: '#92400e',
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '24px',
  },
  actions: {
    display: 'flex',
    gap: '12px',
  },
  button: {
    padding: '12px 24px',
    borderRadius: '8px',
    border: 'none',
    fontSize: '16px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  syncButton: {
    background: 'linear-gradient(135deg, #005bb5 0%, #007bff 100%)',
    color: 'white',
    flex: 1,
  },
  disconnectButton: {
    background: '#f1f5f9',
    color: '#64748b',
  },
  disconnectedCard: {
    background: 'white',
    borderRadius: '12px',
    padding: '48px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    textAlign: 'center',
    marginBottom: '32px',
  },
  disconnectedContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
  },
  largeIcon: {
    color: '#E4405F',
    marginBottom: '8px',
  },
  disconnectedTitle: {
    fontSize: '24px',
    fontWeight: 700,
    color: '#1a202c',
    margin: 0,
  },
  disconnectedText: {
    fontSize: '16px',
    color: '#64748b',
    maxWidth: '400px',
    lineHeight: '1.6',
  },
  connectButton: {
    background: 'linear-gradient(135deg, #E4405F 0%, #C13584 100%)',
    color: 'white',
    padding: '14px 32px',
    borderRadius: '8px',
    border: 'none',
    fontSize: '16px',
    fontWeight: 600,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginTop: '8px',
    transition: 'all 0.2s',
  },
  helpSection: {
    background: '#f8fafc',
    borderRadius: '12px',
    padding: '24px',
  },
  helpTitle: {
    fontSize: '18px',
    fontWeight: 600,
    color: '#1a202c',
    margin: '0 0 16px 0',
  },
  helpList: {
    margin: 0,
    paddingLeft: '24px',
    color: '#64748b',
    lineHeight: '1.8',
  },
};

export default InstagramSettings;

