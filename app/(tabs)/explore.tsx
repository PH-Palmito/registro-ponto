import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';

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
  const [animacaoLista, setAnimacaoLista] = useState<'fadeInRight' | 'fadeInLeft'>('fadeInRight');

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
    const negativo = horas < 0;
    const horasAbs = Math.abs(horas);
    const h = Math.floor(horasAbs);
    const m = Math.round((horasAbs - h) * 60);
    return `${negativo ? '-' : ''}${h}h ${m}min`;
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

  const totalHorasMes = () => {
    return diasDoMes.reduce((acc, dia) => acc + calcularTotalHorasDia(dia.batidas), 0);
  };

  const diasTrabalhadosMes = () => {
    return diasDoMes.filter(dia => calcularTotalHorasDia(dia.batidas) > 0).length;
  };

  const saldoSemanal = () => {
    const totalHoras = totalHorasMes();
    const cargaHorariaSemanal = 44; // ajuste conforme necessário
    return totalHoras - cargaHorariaSemanal;
  };

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

  const trocarMes = (direcao: 'anterior' | 'proximo') => {
    const indiceAtual = mesesDisponiveis.indexOf(mesSelecionado);
    const novoIndice = direcao === 'proximo' ? indiceAtual - 1 : indiceAtual + 1;
    if (novoIndice >= 0 && novoIndice < mesesDisponiveis.length) {
      setAnimacaoLista(direcao === 'proximo' ? 'fadeInRight' : 'fadeInLeft');
      setMesSelecionado(mesesDisponiveis[novoIndice]);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Histórico</Text>

      {/* Resumo Mensal */}
      <View style={styles.resumoBox}>
        <Ionicons name="calendar" size={24} color="#fff" style={{ marginRight: 8 }} />
        <Text style={styles.resumoTexto}>
          {formatarMesAno(mesSelecionado)} • {diasTrabalhadosMes()} dias
          {"\n"}Total: {formatarHoras(totalHorasMes())}
          {"\n"}Saldo: {formatarHoras(saldoSemanal())}
        </Text>
      </View>

      {/* Navegação entre meses */}
      <View style={styles.navegacaoMes}>
        <TouchableOpacity onPress={() => trocarMes('anterior')}>
          <Ionicons name="chevron-back" size={28} color="#2927B4" />
        </TouchableOpacity>
        <Text style={styles.mesSelecionado}>{formatarMesAno(mesSelecionado)}</Text>
        <TouchableOpacity onPress={() => trocarMes('proximo')}>
          <Ionicons name="chevron-forward" size={28} color="#2927B4" />
        </TouchableOpacity>
      </View>

      {/* Lista de dias */}
      <Animatable.View animation={animacaoLista} duration={400}>
        <FlatList
          data={diasDoMes}
          keyExtractor={item => item.data}
          renderItem={renderDia}
        />
      </Animatable.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  titulo: { fontSize: 28, fontWeight: 'bold', marginBottom: 15 },
  resumoBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#2927B4', padding: 12, borderRadius: 8, marginBottom: 15 },
  resumoTexto: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  navegacaoMes: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 15 },
  mesSelecionado: { fontSize: 18, fontWeight: 'bold', color: '#2927B4', marginHorizontal: 10 },
  card: { backgroundColor: '#f8f9fa', padding: 15, borderRadius: 8, marginBottom: 10, elevation: 2 },
  data: { fontSize: 18, fontWeight: 'bold', marginBottom: 5 },
  linhaBatida: { flexDirection: 'row', alignItems: 'center', marginBottom: 3 },
  total: { marginTop: 8, fontWeight: 'bold', color: '#2c3e50' }
});
