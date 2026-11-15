# 💳 Meus Cartões

Aplicação web leve e responsiva para gerenciamento de despesas e faturas de cartão de crédito por mês, cartão, categoria e pessoa — sem necessidade de servidor ou banco de dados externo.

---

## ✨ Funcionalidades

- **Navegação mensal:** Alterne facilmente entre meses (`‹` / `›` ou seletor de mês) com visualização automática de parcelas futuras e contas recorrentes.
- **Resumo em tempo real (KPIs):** Acompanhe o total das faturas, valor já pago, saldo em aberto e o próximo cartão a vencer.
- **Gestão de cartões:** Cadastre múltiplos cartões com dia de vencimento personalizado, acompanhe o status de pagamento de cada fatura e quite ou desfaça o pagamento de uma fatura inteira com um clique.
- **Divisão por pessoa:** Organize os gastos individualmente por pessoa (com suporte a edição rápida de nomes e adição dinâmica de novos participantes).
- **Compras parceladas e recorrentes:**
  - Lance compras parceladas informando a parcela atual e o total (ex.: `3 de 10`); as parcelas seguintes são projetadas automaticamente nos meses futuros.
  - Repita despesas fixas (como assinaturas) para os próximos meses com um único comando.
- **Filtros rápidos:** Filtre lançamentos por cartão, categoria ou status (*Pendentes* / *Pagos*).
- **Categorias e metas mensais:** Personalize categorias, defina limites mensais de gastos e acompanhe o progresso por meio de barras visuais com alerta de estouro.
- **Relatórios e exportação em PDF:** Gere relatórios detalhados do mês (geral ou filtrado por pessoa) com resumo por cartão e detalhamento de contas, prontos para impressão ou download direto em PDF.
- **Backup e restauração:** Exporte todos os seus dados em formato JSON (com cópia automática para a área de transferência) e restaure em qualquer navegador ou dispositivo.
- **Tema claro e escuro:** Alternância manual entre modo claro e escuro, além de detecção automática da preferência do sistema.

---

## 🛠️ Tecnologias Utilizadas

- **HTML5 & CSS3:** Layout responsivo com CSS Grid, Flexbox, variáveis CSS (`:root`) para temas claro/escuro e estilos dedicados para impressão (`@media print`).
- **JavaScript (Vanilla ES6+):** Lógica completa no lado do cliente, manipulação de DOM e persistência local via `localStorage`.
- **[jsPDF](https://github.com/parallax/jsPDF) (v2.5.1):** Geração dinâmica de relatórios em PDF diretamente no navegador.

---

## 📁 Estrutura do Projeto

```text
├── index.html   # Estrutura da interface e importação de dependências
├── style.css    # Estilização, temas claro/escuro, responsividade e layout de impressão
└── app.js       # Lógica de negócios, gerenciamento de estado, parcelas e geração de PDF