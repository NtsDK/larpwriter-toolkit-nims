/* eslint-disable react/prefer-stateless-function */
import React, { Component } from 'react';

import {
  BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie
} from 'recharts';

import '../CommonChart/CommonChart.css';
import './PieChart.css';

const CustomPieTooltip = ({
  active, payload, label
}) => {
  if (active) {
    if (payload[0].value === 0) {
      return null;
    }
    return (
      <div className="custom-tooltip">
        <p className="intro">
          {payload[0].payload.tooltipLabel || payload[0].payload.label}
        </p>
      </div>
    );
  }

  return null;
};

export default function (props) {
  const { data, t } = props;
  return (
    <div className="common-chart pie-chart">
      <ResponsiveContainer>
        <PieChart>
          <Pie dataKey="value" data={data} innerRadius={30} outerRadius={55}>
            {
              data.map((entry, index) => <Cell fill={Constants.colorPalette[index % Constants.colorPalette.length].color.background} />)
            }
          </Pie>
          <Tooltip content={<CustomPieTooltip />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
