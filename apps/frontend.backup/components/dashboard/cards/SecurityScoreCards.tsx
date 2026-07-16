import React from 'react';
import { motion } from 'framer-motion';
import type { SecurityScore } from '@/types/dashboard';

interface Props {
  data?: SecurityScore[];
}

/**
 * Reusable card grid displaying various security scores.
 * The component receives an array of `SecurityScore` objects via props.
 * No data fetching is performed here – the parent supplies the data.
 */
const SecurityScoreCards: React.FC<Props> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="text-gray-400">No security scores available.</div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {data.map((score) => (
        <motion.div
          key={score.name}
          className="bg-gray-800 bg-opacity-70 backdrop-blur-lg rounded-lg p-4 border border-purple-600"
          whileHover={{ scale: 1.02 }}
        >
          <h3 className="text-sm font-medium text-gray-300 mb-2">
            {score.name}
          </h3>
          <div className="text-2xl font-bold text-purple-400">
            {score.score}%
          </div>
          {score.change && (
            <p className="mt-2 text-xs text-gray-400">{score.change}</p>
          )}
        </motion.div>
      ))}
    </div>
  );
};

export default SecurityScoreCards;
