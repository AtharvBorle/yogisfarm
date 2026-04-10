import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', background: '#fce8e6', border: '1px solid #ea4335', margin: '20px', borderRadius: '8px' }}>
          <h2 style={{ color: '#ea4335' }}>Something went wrong.</h2>
          <details style={{ whiteSpace: 'pre-wrap', marginTop: '10px' }}>
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo?.componentStack}
          </details>
          <button onClick={() => window.location.reload()} style={{ marginTop: '15px', padding: '8px 15px', cursor: 'pointer' }}>Reload UI</button>
        </div>
      );
    }
    return this.props.children; 
  }
}

export default ErrorBoundary;
