import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { motion } from 'framer-motion';
import type { FindingTimelineEntry } from '@/types/dashboard';

interface Props {
  data?: FindingTimelineEntry[];
}

/**
 * Line chart showing findings over time.
 * Receives data via props – no internal fetching.
 */
const FindingsChart: React.FC<Props> = ({ data }) => {
  if (!data || data.length === 0) {
    return <div className="text-gray-400">No findings data.</div>;
  }

  return (
    <motion.div
      className="bg-gray-800 bg-opacity-70 backdrop-blur-lg rounded-lg p-4 border border-purple-600"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2d2d2d" />
          <XAxis dataKey="date" stroke="#a0a0a0" />
          <YAxis stroke="#a0a0a0" />
          <Tooltip />
          <Line type="monotone" dataKey="count" stroke="#a855f7" strokeWidth={2} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

export default FindingsChart;
