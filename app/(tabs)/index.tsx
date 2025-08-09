import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Registro = {
  id: string;
  entrada: string;
  saida: string | null;
  total?: string;
};

export default function IndexScreen() {
  const [registroAtual, setRegistroAtual] = useState<Registro | null>(null);

  useEffect(() => {
    carregarRegistroDoDia();
  }, []);

  const carregarRegistroDoDia = async () => {
    try {
      const dados = await AsyncStorage.getItem('registros');
      if (dados) {
        const registros: Registro[] = JSON.parse(dados);
        const hoje = new Date().toDateString();
        const encontrado = registros.find(r => new Date(r.entrada).toDateString() === hoje);
        if (encontrado) {
          setRegistroAtual(encontrado);
        }
      }
    } catch (err) {
      console.log('Erro ao carregar registro do dia:', err);
    }
  };

  const salvarRegistro = async (novo: Registro) => {
    try {
      const dados = await AsyncStorage.getItem('registros');
      let registros: Registro[] = dados ? JSON.parse(dados) : [];
      const index = registros.findIndex(r => r.id === novo.id);
      if (index >= 0) {
        registros[index] = novo;
      } else {
        registros.unshift(novo);
      }
      await AsyncStorage.setItem('registros', JSON.stringify(registros));
    } catch (err) {
      console.log('Erro ao salvar registro:', err);
    }
  };

  const calcularHoras = (entrada: string, saida: string) => {
    const inicio = new Date(entrada);
    const fim = new Date(saida);
    const diffMs = fim.getTime() - inicio.getTime();
    const diffHoras = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMin = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${diffHoras}h ${diffMin}min`;
  };

  const baterEntrada = () => {
    const agora = new Date().toISOString();
    const novoRegistro: Registro = {
      id: Date.now().toString(),
      entrada: agora,
      saida: null,
    };
    setRegistroAtual(novoRegistro);
    salvarRegistro(novoRegistro);
  };

  const baterSaida = () => {
    if (!registroAtual) return;
    const agora = new Date().toISOString();
    const total = calcularHoras(registroAtual.entrada, agora);
    const atualizado = { ...registroAtual, saida: agora, total };
    setRegistroAtual(atualizado);
    salvarRegistro(atualizado);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Registro de Ponto</Text>

      <TouchableOpacity
        style={[
          styles.btn,
          registroAtual && !registroAtual.saida ? styles.btnSaida : styles.btnEntrada,
        ]}
        onPress={registroAtual && !registroAtual.saida ? baterSaida : baterEntrada}
      >
        <Text style={styles.btnTexto}>
          {registroAtual && !registroAtual.saida ? 'Bater Saída' : 'Bater Entrada'}
        </Text>
      </TouchableOpacity>

      {registroAtual && registroAtual.total && (
        <Text style={styles.total}>Total hoje: {registroAtual.total}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 40,
  },
  btn: {
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderRadius: 8,
  },
  btnEntrada: {
    backgroundColor: '#2927B4',
  },
  btnSaida: {
    backgroundColor: '#B42727',
  },
  btnTexto: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  total: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: 'bold',
  },
});
