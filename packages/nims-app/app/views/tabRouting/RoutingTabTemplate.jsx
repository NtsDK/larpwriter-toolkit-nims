import React from 'react';

export const RoutingTabTemplate = function() {
  return (
    <div className="routing-tab">
      <div className="sub-tab-navigation"></div>
      <div className="sub-tab-content"></div>
    </div>
  );
};

export function getRoutingTabTemplate() {
  return <RoutingTabTemplate />;
}