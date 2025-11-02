import React from 'react';
import { Shield, Target, Zap } from 'lucide-react';
import type { Difficulty } from '../types/phishing.types';

export function badgeClass(d: Difficulty): string {
  switch (d) {
    case 'facil':
      return 'badge badge-easy';
    case 'medio':
      return 'badge badge-medium';
    case 'dificil':
      return 'badge badge-hard';
    default:
      return 'badge';
  }
}

export function difficultyIcon(d: Difficulty): React.ReactElement {
  const cls = 'size-4';
  
  switch (d) {
    case 'facil':
      return React.createElement(Shield, { className: `${cls} text-green-600` });
    case 'medio':
      return React.createElement(Target, { className: `${cls} text-yellow-600` });
    case 'dificil':
      return React.createElement(Zap, { className: `${cls} text-red-600` });
    default:
      return React.createElement(Shield, { className: `${cls} text-gray-600` });
  }
}