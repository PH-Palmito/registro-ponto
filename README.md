# ⏱ App de Registro de Ponto

Aplicativo mobile em React Native para **registro de ponto diário**, cálculo de **horas trabalhadas**, saldo **semanal e mensal**, e **edição de batidas anteriores**.

---

## 🚀 Funcionalidades

- ✅ Registro de ponto com os tipos:
  - 🟢 Entrada
  - 🍔 Saída para almoço
  - 🔄 Retorno do almoço
  - 🔴 Saída final
- 📅 Histórico diário com total de horas trabalhadas.
- 📊 Resumo mensal e semanal com saldo de horas.
- ⬅️➡️ Navegação entre meses.
- ✏️ Edição de batidas anteriores diretamente no histórico.
- 💾 Armazenamento local usando `AsyncStorage`.

---

## 🛠 Tecnologias Utilizadas

- React Native
- Expo
- TypeScript
- AsyncStorage (`@react-native-async-storage/async-storage`)
- React Native Animatable
- Ionicons

---
🗂 Estrutura do Projeto

- app/(tabs)/HistoricoScreen.tsx – Tela principal de histórico e edição de batidas.
- AsyncStorage – Armazenamento local das batidas.
- components/ – Componentes reutilizáveis (botões, cards, inputs, etc.).
  
---
📌 Como Usar

- Abra o app e registre suas batidas diárias.
- Navegue pelo histórico para conferir total de horas e saldo semanal/mensal.
- Toque em “Editar” em qualquer dia para corrigir ou ajustar horários.
- As alterações são salvas localmente e refletidas no histórico imediatamente.
---

⚠️ Observações

-A carga horária semanal padrão é 44h, mas pode ser ajustada no código.
- O cálculo de saldo semanal considera apenas a semana atual.
- O cálculo de saldo mensal considera uma média de 5 dias por semana.
 ---
## ⚡ Instalação

1. Clone o repositório:
```bash
git clone
cd registro-ponto
npm install
# ou
yarn install


