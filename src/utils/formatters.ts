import React from 'react';
import { Shield, Target, Zap } from 'lucide-react';
import type { Difficulty, PhishingEmail } from '../types/phishing.types';

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

/** Titulo de um item em qualquer canal: assunto (email) ou o campo de titulo/texto do content_json. */
export function itemTitulo(email: PhishingEmail): string {
  if (email.assunto) return email.assunto;
  const c = email.content_json;
  if (c) {
    for (const chave of ['title', 'text', 'transcript', 'recipient', 'display_name']) {
      const v = c[chave];
      if (typeof v === 'string' && v) return v;
    }
  }
  return 'Item sem título';
}
