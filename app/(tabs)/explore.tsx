import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Registro = {
  id: string;
  entrada: string;
  saida: string | null;
  total?: string;
};

export default function HistoricoScreen() {
  const [registros, setRegistros] = useState<Registro[]>([]);
  const [totalMes, setTotalMes] = useState<string>('');
  const [mesAtual, setMesAtual] = useState<number>(new Date().getMonth());
  const [anoAtual, setAnoAtual] = useState<number>(new Date().getFullYear());

  useEffect(() => {
    carregarRegistros();
  }, [mesAtual, anoAtual]);

  const carregarRegistros = async () => {
    try {
      const dados = await AsyncStorage.getItem('registros');
      if (dados) {
        const lista: Registro[] = JSON.parse(dados);
        filtrarPorMes(lista, mesAtual, anoAtual);
      }
    } catch (err) {
      console.log('Erro ao carregar registros:', err);
    }
  };

  const filtrarPorMes = (lista: Registro[], mes: number, ano: number) => {
    const filtrados = lista.filter(reg => {
      const entrada = new Date(reg.entrada);
      return entrada.getMonth() === mes && entrada.getFullYear() === ano;
    });

    setRegistros(filtrados);
    calcularResumoMes(filtrados);
  };

  const calcularResumoMes = (lista: Registro[]) => {
    let totalMinutos = 0;

    lista.forEach(reg => {
      if (reg.saida) {
        const entrada = new Date(reg.entrada);
        const saida = new Date(reg.saida);
        const diffMs = saida.getTime() - entrada.getTime();
        totalMinutos += Math.floor(diffMs / (1000 * 60));
      }
    });

    const horas = Math.floor(totalMinutos / 60);
    const minutos = totalMinutos % 60;
    setTotalMes(`${horas}h ${minutos}min`);
  };

  const mudarMes = (delta: number) => {
    let novoMes = mesAtual + delta;
    let novoAno = anoAtual;

    if (novoMes < 0) {
      novoMes = 11;
      novoAno--;
    } else if (novoMes > 11) {
      novoMes = 0;
      novoAno++;
    }

    setMesAtual(novoMes);
    setAnoAtual(novoAno);
  };

  const renderItem = ({ item }: { item: Registro }) => (
    <View style={styles.item}>
      <Text style={styles.data}>
        {new Date(item.entrada).toLocaleDateString('pt-BR')}
      </Text>
      <Text>Entrada: {new Date(item.entrada).toLocaleTimeString('pt-BR')}</Text>
      <Text>Saída: {item.saida ? new Date(item.saida).toLocaleTimeString('pt-BR') : '--'}</Text>
      <Text>Total: {item.total || '--'}</Text>
    </View>
  );

  const nomeMes = new Date(anoAtual, mesAtual).toLocaleString('pt-BR', { month: 'long' });

  return (
    <View style={styles.container}>
      {/* Navegação de meses */}
      <View style={styles.mesNav}>
        <TouchableOpacity onPress={() => mudarMes(-1)}>
          <Text style={styles.navBotao}>◀</Text>
        </TouchableOpacity>
        <Text style={styles.mesTitulo}>
          {nomeMes.charAt(0).toUpperCase() + nomeMes.slice(1)} {anoAtual}
        </Text>
        <TouchableOpacity onPress={() => mudarMes(1)}>
          <Text style={styles.navBotao}>▶</Text>
        </TouchableOpacity>
      </View>

      {/* Lista */}
      <FlatList
        data={registros}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.lista}
      />

      {/* Resumo */}
      <View style={styles.resumo}>
        <Text style={styles.resumoTexto}>Total do mês: {totalMes}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  mesNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    marginTop: 0,
  },
  navBotao: { fontSize: 24, fontWeight: 'bold' },
  mesTitulo: { fontSize: 20, fontWeight: 'bold' },
  lista: { paddingBottom: 40 },
  item: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#ccc' },
  data: { fontWeight: 'bold', marginBottom: 5 },
  resumo: { paddingVertical: 15, borderTopWidth: 2, borderTopColor: '#000', marginTop: 10 },
  resumoTexto: { fontSize: 18, fontWeight: 'bold' },
});
