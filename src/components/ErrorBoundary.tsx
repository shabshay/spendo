import React from "react";

type ErrorBoundaryState = {
  hasError: boolean;
  error?: Error;
};

type ErrorBoundaryProps = {
  children: React.ReactNode;
};

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    const debugHint = import.meta.env.DEV && this.state.error
      ? `Debug: ${this.state.error.message}`
      : null;

    return (
      <div className="app-shell" style={{ padding: "2rem", textAlign: "center" }}>
        <h1>Something went wrong</h1>
        <p>Try reloading the page.</p>
        <button className="primary-button" type="button" onClick={this.handleReload}>
          Reload
        </button>
        {debugHint ? (
          <p style={{ marginTop: "1rem", opacity: 0.7 }}>{debugHint}</p>
        ) : null}
      </div>
    );
  }
}

export default ErrorBoundary;
