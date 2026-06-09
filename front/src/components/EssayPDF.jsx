import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { COMPETENCIAS, totalColorHex, compColorHex } from '../utils/scoreColors';

const s = StyleSheet.create({
  page:       { padding: 40, fontFamily: 'Helvetica', fontSize: 11, color: '#1e293b' },
  title:      { fontSize: 20, fontWeight: 'bold', marginBottom: 4, color: '#00ae4f' },
  subtitle:   { fontSize: 10, color: '#64748b', marginBottom: 20 },
  label:      { fontSize: 9, fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase', marginBottom: 4 },
  block:      { marginBottom: 16 },
  essayText:  { lineHeight: 1.6, color: '#334155' },
  divider:    { borderBottom: '1px solid #e2e8f0', marginVertical: 16 },
  scoreBox:   { borderRadius: 8, padding: 12, alignItems: 'center', marginBottom: 16 },
  scoreNum:   { fontSize: 48, fontWeight: 'bold' },
  scoreLabel: { fontSize: 10, color: '#64748b' },
  cardBox:    { borderRadius: 6, padding: 10, marginBottom: 8 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  cardTitle:  { fontSize: 10, fontWeight: 'bold', color: '#334155' },
  cardNota:   { fontSize: 10, fontWeight: 'bold' },
  barTrack:   { height: 5, borderRadius: 3, backgroundColor: '#e2e8f0', marginBottom: 6 },
  barFill:    { height: 5, borderRadius: 3 },
  cardFeed:   { fontSize: 9, color: '#475569', lineHeight: 1.5 },
  comentario: { backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 6, padding: 10, marginTop: 8 },
});

function EssayPDF({ topic, content, nota, feedback }) {
  const dataAtual = new Date().toLocaleDateString('pt-BR');
  const totalHex = totalColorHex(nota);

  return (
    <Document>
      <Page size="A4" style={s.page}>

        <Text style={s.title}>AutoENEM — Resultado da Correção</Text>
        <Text style={s.subtitle}>Gerado em {dataAtual}</Text>

        <View style={s.block}>
          <Text style={s.label}>Tema</Text>
          <Text>{topic}</Text>
        </View>

        <View style={s.divider} />

        <View style={s.block}>
          <Text style={s.label}>Redação</Text>
          <Text style={s.essayText}>{content}</Text>
        </View>

        <View style={s.divider} />

        {/* Nota total com cor dinâmica */}
        <View wrap={false} style={[s.scoreBox, { backgroundColor: '#f8fafc', border: `2px solid ${totalHex}` }]}>
          <Text style={[s.scoreNum, { color: totalHex }]}>{nota}</Text>
          <Text style={s.scoreLabel}>de 1000 pontos</Text>
        </View>

        <Text style={[s.label, { marginBottom: 8 }]}>Análise por Competência</Text>

        {COMPETENCIAS.map((nome, i) => {
          const n = i + 1;
          const compNota = feedback[`c${n}_nota`] ?? 0;
          const compFeed = feedback[`c${n}_feedback`] ?? '';
          const colorHex = compColorHex(compNota);
          const pct = Math.round((compNota / 200) * 100);

          return (
            <View key={n} wrap={false} style={[s.cardBox, { backgroundColor: '#f8fafc', border: `1px solid ${colorHex}` }]}>
              <View style={s.cardHeader}>
                <Text style={s.cardTitle}>C{n} — {nome}</Text>
                <Text style={[s.cardNota, { color: colorHex }]}>{compNota}/200</Text>
              </View>

              {/* Barra de progresso */}
              <View style={s.barTrack}>
                <View style={[s.barFill, { width: `${pct}%`, backgroundColor: colorHex }]} />
              </View>

              <Text style={s.cardFeed}>{compFeed}</Text>
            </View>
          );
        })}

        {feedback.comentario_geral && (
          <View style={s.comentario}>
            <Text style={[s.label, { marginBottom: 4 }]}>Comentário Geral</Text>
            <Text style={s.cardFeed}>{feedback.comentario_geral}</Text>
          </View>
        )}

      </Page>
    </Document>
  );
}

export default EssayPDF;
