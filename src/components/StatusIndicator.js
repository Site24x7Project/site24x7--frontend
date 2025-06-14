import React from 'react';

const StatusIndicator = ({ status }) => {
  const getStatusConfig = () => {
    switch(status) {
      case 0: return { label: 'Down', className: 'status-down' };
      case 1: return { label: 'Up', className: 'status-up' };
      case 2: return { label: 'Trouble', className: 'status-trouble' };
      case 10: return { label: 'Config Error', className: 'status-error' };
      default: return { label: 'Unknown', className: 'status-unknown' };
    }
  };

  const { label, className } = getStatusConfig();

  return (
    <div className={`status-indicator ${className}`}>
      <span>{label}</span>
    </div>
  );
};

export default StatusIndicator;