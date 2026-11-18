import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Unhandled error captured by ErrorBoundary:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '24px',
          fontFamily: 'Inter, sans-serif',
          textAlign: 'center',
          backgroundColor: '#f8fafc',
          color: '#0f172a'
        }}>
          <h2 style={{ fontSize: '1.4rem', marginBottom: '8px' }}>Something went wrong</h2>
          <p style={{ color: '#64748b', maxWidth: '400px', marginBottom: '20px', fontSize: '0.9rem' }}>
            An unexpected error occurred while running the venue application. Please reload to restore state.
          </p>
          <button
            onClick={this.handleReload}
            style={{
              backgroundColor: '#3b82f6',
              color: '#ffffff',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '8px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Reload Application
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
