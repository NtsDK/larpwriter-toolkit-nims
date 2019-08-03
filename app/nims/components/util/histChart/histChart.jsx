/* eslint-disable react/prefer-stateless-function */
import React, { Component } from 'react';

import {
  BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie
} from 'recharts';

import '../CommonChart/CommonChart.css';
import './HistChart.css';

const CustomHistTooltip = ({
  active, payload, label, tooltipKey, t
}) => {
  if (active) {
    if (payload[0].value === 0) {
      return null;
    }
    return (
      <div className="custom-tooltip">
        <p className="intro">
          {tooltipKey({
            label: payload[0].payload.tooltipLabel || payload[0].payload.label,
            value: payload[0].value
          })}
        </p>
        <p className="desc">{payload[0].payload.tip}</p>
      </div>
    );
  }

  return null;
};

export default function (props) {
  const {
    data, t, hideXAxis, tooltipKey
  } = props;
  return (
    <div className="common-chart hist-chart">
      <ResponsiveContainer>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          {!hideXAxis ? <XAxis dataKey="label" /> : ''}
          <YAxis width={30} interval="preserveStartEnd" />
          <Tooltip content={<CustomHistTooltip tooltipKey={tooltipKey} t={t} />} />
          <Bar dataKey="value" fill="#7be141" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
