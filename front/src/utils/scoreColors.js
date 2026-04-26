export const COMPETENCIAS = [
  'Domínio da escrita formal da língua portuguesa',
  'Compreender a proposta e aplicar conceitos',
  'Selecionar e organizar informações',
  'Demonstrar conhecimento de mecanismos linguísticos',
  'Elaborar proposta de intervenção',
];

export function totalColor(nota) {
  if (nota >= 900) return 'text-green-500';
  if (nota >= 800) return 'text-blue-500';
  if (nota > 700) return 'text-yellow-500';
  return 'text-red-500';
}

export function compColor(nota) {
  if (nota >= 180) return 'text-green-600';
  if (nota >= 160) return 'text-blue-600';
  if (nota >= 140) return 'text-yellow-600';
  return 'text-red-600';
}

export function compBadge(nota) {
  if (nota >= 180) return 'bg-green-100 text-green-700';
  if (nota >= 160) return 'bg-blue-100 text-blue-700';
  if (nota >= 140) return 'bg-yellow-100 text-yellow-700';
  return 'bg-red-100 text-red-600';
}

export function compBar(nota) {
  if (nota >= 180) return 'bg-green-500';
  if (nota >= 160) return 'bg-blue-500';
  if (nota >= 140) return 'bg-yellow-400';
  return 'bg-red-500';
}

export function getDica(nota) {
  if (nota >= 900) return 'Incrível! Você está entre os melhores candidatos do ENEM! 🏆';
  if (nota >= 800) return 'Continue praticando! A nota média do ENEM é 560 pontos. Você está acima da média! 🎉';
  if (nota >= 700) return 'Bom trabalho! A nota média do ENEM é 560 pontos. Você está acima da média!';
  if (nota >= 560) return 'Você está acima da média nacional de 560 pontos. Continue praticando para melhorar!';
  return 'A nota média do ENEM é 560 pontos. Com mais prática você chegará lá! 💪';
}
