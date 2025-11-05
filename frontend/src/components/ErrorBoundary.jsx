import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error, info) {
        // eslint-disable-next-line no-console
        console.error('ErrorBoundary caught:', error, info);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: 20, maxWidth: 600, margin: '40px auto', background: '#fff', borderRadius: 12, boxShadow: '0 10px 30px rgba(0,0,0,.1)', textAlign: 'center' }}>
                    <h2 style={{ marginTop: 0 }}>Something went wrong</h2>
                    <p>Please refresh the page or navigate back.</p>
                </div>
            );
        }
        return this.props.children;
    }
}

export default ErrorBoundary;


