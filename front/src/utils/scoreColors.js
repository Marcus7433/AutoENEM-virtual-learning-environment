export const COMPETENCIAS = [
  'Domínio da escrita formal da língua portuguesa',
  'Compreender a proposta e aplicar conceitos',
  'Selecionar e organizar informações',
  'Demonstrar conhecimento de mecanismos linguísticos',
  'Elaborar proposta de intervenção',
];

const COLORS = {
  green:  { text: 'text-green-500',  hex: '#22c55e', bar: 'bg-green-500',  badge: 'bg-green-100 text-green-700'  },
  blue:   { text: 'text-blue-500',   hex: '#3b82f6', bar: 'bg-blue-500',   badge: 'bg-blue-100 text-blue-700'   },
  yellow: { text: 'text-yellow-500', hex: '#eab308', bar: 'bg-yellow-500', badge: 'bg-yellow-100 text-yellow-700' },
  red:    { text: 'text-red-500',    hex: '#ef4444', bar: 'bg-red-500',    badge: 'bg-red-100 text-red-700'     },
};

function tier(pct) {
  if (pct >= 0.9) return 'green';
  if (pct >= 0.8) return 'blue';
  if (pct >= 0.7) return 'yellow';
  return 'red';
}

export const totalColor    = (n) => COLORS[tier(n / 1000)].text;
export const totalColorHex = (n) => COLORS[tier(n / 1000)].hex;

export const compColor = (n) => COLORS[tier(n / 200)].text;
export const compBadge = (n) => COLORS[tier(n / 200)].badge;
export const compBar   = (n) => COLORS[tier(n / 200)].bar;

export function getDica(nota) {
  if (nota >= 900) return 'Incrível! Você está entre os melhores candidatos do ENEM! 🏆';
  if (nota >= 800) return 'Continue praticando! A nota média do ENEM é 560 pontos. Você está acima da média! 🎉';
  if (nota >= 700) return 'Bom trabalho! A nota média do ENEM é 560 pontos. Você está acima da média!';
  if (nota >= 560) return 'Você está acima da média nacional de 560 pontos. Continue praticando para melhorar!';
  return 'A nota média do ENEM é 560 pontos. Com mais prática você chegará lá! 💪';
}
