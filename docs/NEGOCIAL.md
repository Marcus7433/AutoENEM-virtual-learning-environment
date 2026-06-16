# Documentação Negocial — AutoENEM

> Centro Universitário de Brasília — CEUB  
---

## Sumário

1. [Problema e Oportunidade](#1-problema-e-oportunidade)
2. [Público-Alvo](#2-público-alvo)
3. [Proposta de Valor](#3-proposta-de-valor)
4. [Benefícios da Solução](#4-benefícios-da-solução)
5. [Contexto de Uso](#5-contexto-de-uso)
6. [Considerações Finais](#6-considerações-finais)

---

## 1. Problema e Oportunidade

A redação é uma das partes mais importantes e decisivas do ENEM. Para obter uma boa pontuação, o estudante precisa dominar cinco competências distintas: norma-padrão da língua portuguesa, compreensão do tema com repertório sociocultural, organização argumentativa, coesão textual e elaboração de uma proposta de intervenção. Cada competência é avaliada individualmente em uma escala de 0 a 200 pontos, totalizando até 1000 pontos.

O problema é que, na prática, receber correções frequentes, detalhadas e acessíveis é difícil para a maioria dos estudantes. As alternativas existentes impõem barreiras significativas:

| Alternativa atual | Barreira |
|---|---|
| Professor particular ou cursinho | Custo elevado, horário fixo, acesso limitado |
| Correção por professor da escola | Demanda alta, feedback demorado e genérico |
| Plataformas pagas (Redação Nota 1000, etc.) | Assinatura mensal, interface fechada |
| Autoavaliação | Sem critérios objetivos, sem referência externa |

Estudantes de escolas públicas, participantes de cursinhos populares e quem estuda de forma autônoma são os mais prejudicados: praticam menos por falta de retorno e chegam ao exame sem conseguir identificar onde erram. Isso contribui diretamente para a desigualdade nos resultados do ENEM.

A oportunidade identificada é usar inteligência artificial para automatizar a correção com base nos critérios oficiais, eliminando a dependência de um corretor humano e tornando o feedback imediato, gratuito e disponível a qualquer hora.

---

## 2. Público-Alvo

### Perfil primário — estudantes em preparação para o ENEM

- Alunos do 3º ano do ensino médio
- Vestibulandos em ano de retomada
- Participantes de cursinhos populares e pré-vestibulares comunitários
- Estudantes que se preparam de forma independente (EAD, YouTube, apostilas)

O perfil mais beneficiado é o do estudante que **não tem acesso constante a um corretor**, seja por restrição financeira, localização geográfica ou rotina de trabalho que limita o tempo disponível.

### Perfil secundário — educadores e instituições

- Professores que desejam acompanhar a evolução individual de alunos de forma mais sistemática
- Coordenadores pedagógicos de escolas e cursinhos que precisam de dados agregados de desempenho em redação

---

## 3. Proposta de Valor

> **AutoENEM entrega correção de redação nos critérios do ENEM em segundos, com feedback por competência, histórico de progresso e transcrição de texto manuscrito — sem custo e sem precisar de um professor disponível.**

### O que diferencia o AutoENEM das alternativas

| Característica | AutoENEM | Plataformas pagas | Corretor humano |
|---|---|---|---|
| Custo ao usuário | Gratuito | Assinatura mensal | Por redação ou hora |
| Tempo de retorno | Segundos | Minutos a horas | Dias |
| Disponibilidade | 24/7 | 24/7 | Horário comercial |
| Feedback por competência | Sim (C1–C5) | Depende do plano | Sim |
| Histórico e gráficos | Sim | Parcial | Não |
| Envio de foto manuscrita | Sim (Com Gemini) | Raro | Sim |
| Nota alinhada à escala real | Sim (0–1000, múltiplos de 40) | Parcial | Sim |

### Posicionamento

O AutoENEM não compete diretamente com cursinhos ou professores particulares — ele serve como **ferramenta de prática contínua entre aulas**. O estudante treina mais vezes, recebe feedback imediato e chega às sessões com professor já sabendo onde precisa melhorar.

---

## 4. Benefícios da Solução

### Educacional

- O aluno compreende os critérios avaliativos do ENEM ao ver o feedback estruturado por competência após cada redação
- Identificação de padrões de erro ao longo do tempo (ex: C4 — coesão textual — consistentemente abaixo da média)
- Incentivo à prática frequente: sem custo por envio e sem espera, o aluno envia mais redações
- Transcrição de redações manuscritas permite que o aluno treine em papel (formato real do exame) e ainda receba feedback digital

### Social

- Reduz a desigualdade de acesso a correções de qualidade entre estudantes de diferentes condições socioeconômicas
- Não exige dispositivo de alto desempenho — funciona em qualquer navegador moderno
- Estudante pode usar a câmera do celular para enviar a foto da redação manuscrita

### Operacional

- Correção acontece em segundos, sem agendamento ou fila de espera
- O histórico organizado permite que professor ou coordenador acompanhe o progresso do aluno ao longo do tempo
- Gráficos de evolução mensal por competência dão visibilidade sobre o desenvolvimento real

### Tecnológico

- Pipeline de IA híbrido: modelo BERT local calibra a nota, LLM Groq gera o feedback qualitativo, Gemini transcreve imagens
- Autenticação segura com suporte a Google e GitHub além de email/senha
- Dados armazenados de forma persistente e segura no Supabase (PostgreSQL)

---

## 5. Contexto de Uso

### Fluxo típico do estudante

```
1. Acessa a plataforma e cria uma conta (ou entra com Google/GitHub)
        ↓
2. Escreve a redação diretamente na plataforma OU tira uma foto da versão manuscrita
        ↓
3. Informa o tema da redação e envia para correção
        ↓
4. Recebe em segundos:
   - Nota geral (0–1000, escala real do ENEM)
   - Pontuação individual por competência (C1 a C5)
   - Feedback textual citando trechos reais da redação
   - Indicação de fuga ao tema (se houver)
        ↓
5. Consulta o histórico de redações anteriores com filtros por data e nota
        ↓
6. Acessa "Meu Progresso" para visualizar gráficos de evolução mensal
   geral e por competência, identificando tendências de melhora ou queda
```

### Cenários de uso representativos

**Cenário 1 — Estudante autônomo**  
Lucas, 17 anos, estuda para o ENEM em casa usando material gratuito. Não tem dinheiro para cursinho. Escreve uma redação por semana, fotografa com o celular e envia para o AutoENEM. Usa o feedback para corrigir os erros antes de escrever a próxima. Em dois meses, percebe pelo gráfico de progresso que sua nota em C5 (proposta de intervenção) subiu de 80 para 160.

**Cenário 2 — Aluno de escola pública**  
Mariana, 18 anos, tem aula de redação uma vez por semana. O professor corrige no máximo uma redação por mês por aluno. Ela usa o AutoENEM para receber feedback nos outros dias, chegando às aulas com dúvidas específicas sobre as competências em que ainda erra.

**Cenário 3 — Cursinho popular**  
Um coordenador pedagógico incentiva os alunos a usarem o AutoENEM para praticar entre as aulas presenciais. Os alunos chegam às aulas com mais redações feitas e com consciência sobre seus pontos fracos, tornando o tempo de aula mais produtivo.

### Contexto técnico de uso

- **Dispositivo:** computador, notebook ou celular com navegador moderno
- **Conectividade:** requer internet (processamento acontece nos servidores)
- **Entrada:** texto digitado ou foto da redação manuscrita (PNG, JPG, WEBP — até 16MB)
- **Saída:** nota numérica, feedback textual por competência, gráficos de evolução
- **Autenticação:** email/senha, Google OAuth ou GitHub OAuth

---

## 6. Considerações Finais

O AutoENEM atende a uma demanda real e bem definida: estudantes que precisam praticar redação com frequência, mas não têm acesso fácil a correções detalhadas e acessíveis. A solução é funcional, acessível e alinhada ao critério oficial do ENEM, sem exigir custo do usuário final.

Do ponto de vista social, a plataforma tem potencial para reduzir parte da desigualdade na preparação para o exame ao colocar nas mãos de estudantes vulneráveis uma ferramenta que antes só estava disponível para quem podia pagar.

### Oportunidades de evolução futura

- Sugestões personalizadas de conteúdo de estudo com base nos erros recorrentes de cada competência
- Acompanhamento por professor com visão consolidada da turma
- Relatórios exportáveis em PDF para uso pedagógico
- Expansão para outros tipos de produção textual além da dissertação-argumentativa
- Modo offline com sincronização posterior para regiões com conectividade limitada

---

*Documentação técnica complementar: [`FRONTEND.md`](./FRONTEND.md) · [`SERVER.md`](./SERVER.md) · [`API_PYTHON.md`](./API_PYTHON.md) · [`touse.md`](./touse.md)*
