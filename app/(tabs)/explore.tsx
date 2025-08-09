import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

type BatidaTipo = 'entrada' | 'saida_almoco' | 'retorno_almoco' | 'saida_final';

type Batida = {
  id: string;
  tipo: BatidaTipo;
  timestamp: string;
};

type Dia = {
  data: string;
  batidas: Batida[];
};

export default function HistoricoScreen() {
  const [dias, setDias] = useState<Dia[]>([]);
  const [mesSelecionado, setMesSelecionado] = useState<string>('');
  const [mesesDisponiveis, setMesesDisponiveis] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      const dados = await AsyncStorage.getItem('dias');
      if (dados) {
        const parsed: Dia[] = JSON.parse(dados);

        const ordenados = parsed.sort((a, b) => (a.data < b.data ? 1 : -1));
        setDias(ordenados);

        const meses = Array.from(
          new Set(
            ordenados.map(d => {
              const date = new Date(d.data);
              return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            })
          )
        );

        setMesesDisponiveis(meses);

        const hoje = new Date();
        const mesAtual = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}`;
        setMesSelecionado(mesAtual);
      }
    })();
  }, []);

  const formatarMesAno = (mesAno: string) => {
    const [ano, mes] = mesAno.split('-');
    const nomesMeses = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return `${nomesMeses[parseInt(mes) - 1]} ${ano}`;
  };

  const calcularTotalHorasDia = (batidas: Batida[]): number => {
    const getBatida = (tipo: BatidaTipo) => batidas.find(b => b.tipo === tipo);
    const e = getBatida('entrada');
    const sAlmoco = getBatida('saida_almoco');
    const rAlmoco = getBatida('retorno_almoco');
    const sFinal = getBatida('saida_final');
    if (!e || !sAlmoco || !rAlmoco || !sFinal) return 0;
    const tEntrada = new Date(e.timestamp).getTime();
    const tSaidaAlmoco = new Date(sAlmoco.timestamp).getTime();
    const tRetornoAlmoco = new Date(rAlmoco.timestamp).getTime();
    const tSaidaFinal = new Date(sFinal.timestamp).getTime();
    if (tSaidaAlmoco < tEntrada || tRetornoAlmoco < tSaidaAlmoco || tSaidaFinal < tRetornoAlmoco) return 0;
    return (tSaidaFinal - tEntrada - (tRetornoAlmoco - tSaidaAlmoco)) / (1000 * 60 * 60);
  };

  const formatarHoras = (horas: number) => {
    const h = Math.floor(horas);
    const m = Math.round((horas - h) * 60);
    return `${h}h ${m}min`;
  };

  const icones: Record<BatidaTipo, { nome: keyof typeof Ionicons.glyphMap; cor: string }> = {
    entrada: { nome: 'log-in', cor: '#2ecc71' },
    saida_almoco: { nome: 'fast-food', cor: '#f1c40f' },
    retorno_almoco: { nome: 'return-up-forward', cor: '#3498db' },
    saida_final: { nome: 'log-out', cor: '#e74c3c' }
  };

  const diasDoMes = dias.filter(d => {
    const date = new Date(d.data);
    const mesAno = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    return mesAno === mesSelecionado;
  });

  const renderDia = ({ item }: { item: Dia }) => (
    <View style={styles.card}>
      <Text style={styles.data}>{item.data}</Text>
      {item.batidas.map(b => (
        <View key={b.id} style={styles.linhaBatida}>
          <Ionicons name={icones[b.tipo].nome} size={18} color={icones[b.tipo].cor} style={{ marginRight: 5 }} />
          <Text>{b.tipo.replace('_', ' ').toUpperCase()} - {b.timestamp.slice(11, 16)}</Text>
        </View>
      ))}
      <Text style={styles.total}>⏱ Total: {formatarHoras(calcularTotalHorasDia(item.batidas))}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Histórico</Text>

      <View style={styles.mesesContainer}>
        {mesesDisponiveis.map(mes => (
          <TouchableOpacity
            key={mes}
            style={[styles.botaoMes, mesSelecionado === mes && styles.botaoMesAtivo]}
            onPress={() => setMesSelecionado(mes)}
          >
            <Text style={mesSelecionado === mes ? styles.textoMesAtivo : styles.textoMes}>
              {formatarMesAno(mes)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={diasDoMes}
        keyExtractor={item => item.data}
        renderItem={renderDia}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  titulo: { fontSize: 28, fontWeight: 'bold', marginBottom: 15 },
  mesesContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 },
  botaoMes: { padding: 8, borderRadius: 5, backgroundColor: '#eee', marginRight: 5, marginBottom: 5 },
  botaoMesAtivo: { backgroundColor: '#2927B4' },
  textoMes: { color: '#000' },
  textoMesAtivo: { color: '#fff', fontWeight: 'bold' },
  card: { backgroundColor: '#f8f9fa', padding: 15, borderRadius: 8, marginBottom: 10, elevation: 2 },
  data: { fontSize: 18, fontWeight: 'bold', marginBottom: 5 },
  linhaBatida: { flexDirection: 'row', alignItems: 'center', marginBottom: 3 },
  total: { marginTop: 8, fontWeight: 'bold', color: '#2c3e50' }
});
