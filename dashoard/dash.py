import streamlit as st
import pandas as pd
import plotly.express as px

# --- Configurações da página ---
st.set_page_config(
    page_title="Dashboard de Redações",
    layout="wide",
    initial_sidebar_state="expanded",
)

# --- Estilo customizado ---
st.markdown("""
<style>
/* Fundo da aplicação */
.stApp { background-color: white; }

/* Container dos KPIs */
.kpi-container {
    display: flex;
    justify-content: flex-start;
    gap: 10px;
    margin-bottom: 20px;
}

/* KPIs */
.kpi-card {
    background-color: white;
    border: 2px solid #4285F4;
    border-radius: 12px;
    padding: 6px;
    flex: 1;
    max-width: 200px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
}
.kpi-card h2, .kpi-card h3 { margin: 2px 0; color: #4285F4; }
.kpi-card h2 { font-size: 32px; }
.kpi-card h3 { font-size: 18px; }

/* Títulos dos gráficos */
.plotly-graph-div .main-svg text.title {
    fill: #4285F4 !important;
    font-size: 22px !important;
}

/* Botão Limpar filtros */
.stButton>button {
    background-color: #4285F4;
    color: white;
    border: none;
    border-radius: 8px;
    padding: 6px 12px;
    font-weight: bold;
    cursor: pointer;
}
.stButton>button:hover { background-color: #357ae8; }

/* --- Customização dos filtros Streamlit --- */
.stMultiSelect, .stSelectbox {
    border: 2px solid #4285F4 !important;
    border-radius: 8px;
}
.stMultiSelect:focus-within, .stSelectbox:focus-within {
    border: 2px solid #4285F4 !important;
    box-shadow: none !important;
}
.stMultiSelect div[role="option"][aria-selected="true"] {
    background-color: #4285F4 !important;
    color: white !important;
}
.stMultiSelect div[role="option"]:hover {
    background-color: #4285F4 !important;
    color: white !important;
}

/* --- Títulos dos filtros (Ano e Região) em azul, negrito e deslocados --- */
[data-testid="stSidebar"] label {
    color: #4285F4 !important;
    font-weight: 700 !important; /* garante negrito */
    margin-left: 10px;
}

/* Header "Filtros" da sidebar em azul e negrito */
[data-testid="stSidebar"] h2 {
    color: #4285F4 !important;
    font-weight: 700 !important;
    margin-left: 10px; /* leve deslocamento à direita */
}
</style>
""", unsafe_allow_html=True)

# --- Carregar dados ---
df = pd.read_csv("dados.csv")
df.columns = [col.strip() for col in df.columns]

# --- Sidebar com filtros ---
st.sidebar.header("Filtros")
anos = df['Ano_Enviado'].sort_values().unique()
regioes = df['Regiao'].sort_values().unique()

ano_selecionado = st.sidebar.multiselect("Ano", options=anos)
regiao_selecionada = st.sidebar.multiselect("Região", options=regioes)

if st.sidebar.button("Limpar filtros"):
    ano_selecionado = []
    regiao_selecionada = []

# --- Filtrar dados ---
df_filtrado = df.copy()
if ano_selecionado:
    df_filtrado = df_filtrado[df_filtrado['Ano_Enviado'].isin(ano_selecionado)]
if regiao_selecionada:
    df_filtrado = df_filtrado[df_filtrado['Regiao'].isin(regiao_selecionada)]

# --- KPIs ---
num_redacoes = len(df_filtrado)
num_redacoes_zero = (df_filtrado['Nota_Total'] == 0).sum()
media_geral = round(df_filtrado['Nota_Total'].mean(), 2) if num_redacoes > 0 else 0

# --- KPIs HTML ---
kpi_html = f"""
<div class='kpi-container'>
    <div class='kpi-card'>
        <h3>Total de Redações Enviadas</h3>
        <h2>{num_redacoes}</h2>
    </div>
    <div class='kpi-card'>
        <h3>Redações com Nota 0</h3>
        <h2>{num_redacoes_zero}</h2>
    </div>
    <div class='kpi-card'>
        <h3>Média Geral das Notas</h3>
        <h2>{media_geral:.2f}</h2>
    </div>
</div>
"""
st.markdown(kpi_html, unsafe_allow_html=True)

# --- Gráfico de médias por competência ---
competencias = ['C1', 'C2', 'C3', 'C4', 'C5']
media_competencias = df_filtrado[competencias].mean().reset_index()
media_competencias.columns = ['Competência', 'Média']
media_competencias['Média'] = media_competencias['Média'].round(2)

fig1 = px.bar(
    media_competencias,
    x='Competência',
    y='Média',
    text='Média',
    color_discrete_sequence=['#4285F4'],
    title="Média das Notas por Competência",
    height=500
)
fig1.update_traces(texttemplate='%{text:.2f}', textposition='outside')
fig1.update_layout(
    plot_bgcolor='white',
    title_font_color='#4285F4',
    title_font_size=22,
    yaxis=dict(title='Média', title_font=dict(size=18, color='#4285F4', weight='bold')),
    xaxis=dict(title='Competência', title_font=dict(size=18, color='#4285F4', weight='bold'))
)

# --- Gráfico de notas por região ---
media_regiao = df_filtrado.groupby('Regiao')['Nota_Total'].mean().reset_index()
media_regiao['Nota_Total'] = media_regiao['Nota_Total'].round(2)

fig2 = px.bar(
    media_regiao,
    x='Regiao',
    y='Nota_Total',
    text='Nota_Total',
    color_discrete_sequence=['#4285F4'],
    title="Média das Notas por Região",
    height=500
)
fig2.update_traces(texttemplate='%{text:.2f}', textposition='outside')
fig2.update_layout(
    plot_bgcolor='white',
    title_font_color='#4285F4',
    title_font_size=22,
    yaxis=dict(title='Média', title_font=dict(size=18, color='#4285F4', weight='bold')),
    xaxis=dict(title='Região', title_font=dict(size=18, color='#4285F4', weight='bold'))
)

# --- Exibir gráficos ---
st.plotly_chart(fig1, use_container_width=True, config={'displayModeBar': False})
st.plotly_chart(fig2, use_container_width=True, config={'displayModeBar': False})
