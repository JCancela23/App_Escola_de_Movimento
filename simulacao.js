// Dados simulados para o modo de demonstração (só é carregado quando a app não está ligada ao Supabase).
// Tudo o que aqui está é fictício: serve para experimentar a app com uma época quase completa.
window.EM_SIMULACAO = function (S) {
  let semente = 7;
  const rnd = () => (semente = (semente * 16807) % 2147483647) / 2147483647;
  const int = (a, b) => a + Math.floor(rnd() * (b - a + 1));
  const um = l => l[Math.floor(rnd() * l.length)];
  const hoje = hojeISO(), ep = epocaDe(hoje), ano = anoEpoca(ep);
  const inicio = ano + "-09-15";

  // ---------- pessoas ----------
  const P = (id, nome, funcao, modalidade, telefone, email) => S.pessoas[id] = { nome, funcao, modalidade: modalidade || "", telefone: telefone || "", email: email || "" };
  P("joao-cancela", "João Cancela", "Coordenador", "", "910 000 001", "joao@exemplo.pt");
  P("bruna", "Bruna", "Preparador físico", "", "910 000 002", "bruna@exemplo.pt");
  P("t-and1", "Rui Matos", "Treinador", "Andebol", "911 100 001", "rui.matos@exemplo.pt");
  P("t-and2", "Inês Faria", "Treinador", "Andebol", "911 100 002");
  P("c-and", "Paulo Lima", "Coordenador de modalidade", "Andebol", "911 100 003", "paulo.lima@exemplo.pt");
  P("t-bas1", "Hugo Reis", "Treinador", "Basquetebol", "912 200 001", "hugo.reis@exemplo.pt");
  P("t-bas2", "Sara Pinto", "Treinador", "Basquetebol", "912 200 002", "sara.pinto@exemplo.pt");
  P("t-fut1", "Nuno Costa", "Treinador", "Futsal", "913 300 001");
  P("t-fut2", "André Sousa", "Treinador", "Futsal", "913 300 002", "andre.sousa@exemplo.pt");
  P("t-vol1", "Carla Mendes", "Treinador", "Voleibol", "914 400 001", "carla.mendes@exemplo.pt");
  P("t-hoq1", "Tiago Ramos", "Treinador", "Hóquei em patins", "915 500 001");
  P("t-nat1", "Filipa Rocha", "Treinador", "Natação", "916 600 001", "filipa.rocha@exemplo.pt");
  P("t-nat2", "Miguel Teixeira", "Treinador", "Natação", "916 600 002");
  P("dir1", "Luís Ferreira", "Direção", "", "917 700 001", "luis.ferreira@exemplo.pt");

  // ---------- equipas (horário real + escalões simulados) ----------
  const EQ_ = (id, modalidade, escalao, horario, treinos, responsavel, treinadores, extra) =>
    S.equipas[id] = { modalidade, escalao, horario: horario.map(([dia, hora, local, duracao]) => ({ dia, hora, local, duracao })), treinos: treinos.map(([dia, ini, fim, local]) => ({ dia, inicio: ini, fim, local })), responsavel, treinadores, ...extra };
  EQ_("hoquei", "Hóquei em patins", "Sub-13 A", [[1, "18:20", "Sacavém", 20]], [[1, "18:40", "20:00", "Sacavém"], [3, "18:40", "20:00", "Sacavém"]], "bruna", ["t-hoq1"]);
  EQ_("andebol", "Andebol", "Minis 1", [[1, "19:00", "Col. Planalto", 20]], [[1, "19:20", "20:30", "Col. Planalto"], [4, "18:30", "19:45", "Col. Planalto"]], "bruna", ["t-and1", "c-and"]);
  EQ_("basquetebol", "Basquetebol", "Sub-12 Masculino", [[2, "18:00", "Escola Alemã", 20]], [[2, "18:20", "19:30", "Escola Alemã"], [4, "18:00", "19:15", "Escola Alemã"]], "bruna", ["t-bas1"]);
  EQ_("basquetebol-fem", "Basquetebol", "Sub-12 Feminino", [[2, "18:30", "Externato S. Vicente Paulo", 20]], [[2, "18:50", "20:00", "Externato S. Vicente Paulo"]], "bruna", ["t-bas2"]);
  EQ_("natacao", "Natação", "Cadetes", [[2, "19:00", "Estádio", 30], [5, "18:00", "Estádio", 20]], [[2, "19:30", "20:45", "Estádio"], [5, "18:20", "19:30", "Estádio"]], "bruna", ["t-nat1", "t-nat2"]);
  EQ_("triatlo", "Triatlo", "Sub-13", [[4, "18:00", "Col. João Brito", 20]], [], "bruna", [], { ativa: false });
  EQ_("voleibol", "Voleibol", "Minivoleibol", [[4, "18:30", "MD", 20]], [[4, "18:50", "20:00", "MD"]], "joao-cancela", ["t-vol1"]);
  EQ_("futsal", "Futsal", "Iniciados", [[4, "20:00", "Ed. Gageiro", 20]], [[4, "20:20", "21:30", "Ed. Gageiro"]], "joao-cancela", ["t-fut1"]);
  EQ_("futsal-inf", "Futsal", "Infantis", [[3, "18:00", "Ed. Gageiro", 15]], [[3, "18:15", "19:30", "Ed. Gageiro"]], "joao-cancela", ["t-fut2"]);
  EQ_("andebol-2", "Andebol", "Minis 2", [[3, "19:00", "Col. Planalto", 20]], [[3, "19:20", "20:30", "Col. Planalto"]], "bruna", ["t-and2", "c-and"]);

  // ---------- exercícios e material ----------
  const X = (id, nome, tema, duracao, descricao, progressao) => S.exercicios[id] = { nome, tema, duracao, descricao, progressao: progressao || "", video: "" };
  X("s1", "Saltos ao pé coxinho", "saltar", 4, "Saltar num só apoio ao longo de 10 m e trocar de pé.", "Aumentar a distância; saltar para dentro de arcos.");
  X("s2", "Saltos a pés juntos nos arcos", "saltar", 4, "Arcos em linha; saltar a pés juntos de arco em arco, aterrar suave.");
  X("s3", "Skipping baixo", "saltar", 3, "Corrida no lugar com apoios rápidos e curtos.");
  X("s4", "Salto em comprimento sem corrida", "saltar", 5, "Partida a pés juntos, braços ajudam, aterrar equilibrado.", "Medir e tentar bater a marca.");
  X("s5", "Saltos laterais sobre a linha", "saltar", 3, "Saltar de um lado para o outro da linha durante 20 s.");
  X("s6", "Barreiras baixas", "saltar", 5, "Saltar 5 barreiras baixas seguidas sem pausa.");
  X("g1", "Urso (bear crawl)", "gatinhar", 4, "Mãos e pés no chão, joelhos a um palmo do solo, avançar 10 m.", "Para trás e para os lados.");
  X("g2", "Caranguejo", "gatinhar", 4, "Barriga para cima, apoio em mãos e pés, avançar 10 m.");
  X("g3", "Gatinhar com os joelhos no chão", "gatinhar", 3, "Gatinhar cruzado (mão direita com joelho esquerdo).");
  X("g4", "Urso lateral", "gatinhar", 3, "Deslocamento lateral em posição de urso.");
  X("g5", "Urso com toque no ombro", "gatinhar", 4, "Em posição de urso parado, tocar alternadamente no ombro oposto.");
  X("g6", "Circuito de gatinhar por baixo de obstáculos", "gatinhar", 5, "Passar por baixo de cordas e barreiras sem lhes tocar.");
  X("e1", "Flexões com joelhos apoiados", "empurrar", 4, "Corpo alinhado dos joelhos à cabeça, peito ao chão e empurrar.", "Passar a flexões completas.");
  X("e2", "Empurrar o colega (sumo)", "empurrar", 4, "Pares, mãos nos ombros, empurrar o colega para fora do quadrado.");
  X("e3", "Lançamento de bola medicinal ao peito", "empurrar", 4, "Pares a 3 m, passe de peito com bola de 1 kg.");
  X("e4", "Prancha com toque de mãos", "empurrar", 3, "Em prancha alta, tocar na mão do colega à frente.");
  X("e5", "Carrinho de mão", "empurrar", 4, "Um colega segura as pernas, o outro avança 8 m com as mãos.");
  X("p1", "Puxar a corda (tração em pares)", "puxar", 4, "Pares, cada um puxa a ponta da corda até passar a linha.");
  X("p2", "Remada com elástico", "puxar", 4, "Elástico preso à frente, puxar com cotovelos junto ao corpo.");
  X("p3", "Arrastar o colega no colchão", "puxar", 4, "Um colega sentado no colchão, o outro puxa-o 5 m.");
  X("p4", "Suspensão na barra", "puxar", 3, "Ficar pendurado na barra com os ombros ativos.", "Aumentar o tempo de 10 s até 30 s.");
  X("p5", "Remada invertida na mesa", "puxar", 4, "Deitado de costas, puxar o peito até à barra baixa.");
  const M = (id, nome, quantidade, local, estado) => S.material[id] = { nome, quantidade, local, estado, notas: "" };
  M("m1", "Arcos", "20", "Saco grande", "Bom"); M("m2", "Cones", "30", "Saco grande", "Bom"); M("m3", "Sinalizadores", "40", "Saco pequeno", "Bom");
  M("m4", "Colchões", "6", "Arrecadação do pavilhão", "2 rasgados"); M("m5", "Elásticos", "12", "Saco pequeno", "Bom"); M("m6", "Bolas medicinais 1 kg", "8", "Arrecadação do pavilhão", "Bom");
  M("m7", "Escada de coordenação", "2", "Saco grande", "Bom"); M("m8", "Barreiras baixas", "10", "Arrecadação do pavilhão", "1 partida"); M("m9", "Cordas", "6", "Saco pequeno", "Bom");
  const matTema = { saltar: ["m1", "m8", "m7"], gatinhar: ["m2", "m9", "m4"], empurrar: ["m6", "m4"], puxar: ["m9", "m5", "m4"] };

  // ---------- tema de cada mês, planos semanais (aquecimento + parte principal) ----------
  const ordem = ["saltar", "gatinhar", "empurrar", "puxar"];
  const FOCOS = { saltar: "Receção dos saltos e coordenação de braços", gatinhar: "Estabilidade do tronco e coordenação cruzada", empurrar: "Força de membros superiores com o corpo alinhado", puxar: "Postura e força das costas" };
  const DOSES = ["2 x 10 m", "3 x 10 m", "3 x 8", "2 x 20 s", "3 x 30 s", "4 x 6", "2 min", "3 x 5"];
  const OBS = ["Aterrar com os joelhos fletidos", "Costas planas, olhar para o chão", "Trocar o pé de apoio a meio", "Ritmo controlado, sem pressa", "Corrigir a posição dos ombros", "Fazer em pares", ""];
  for (let i = 0; i < 10; i++) {
    const k = mesKey(new Date(ano, 8 + i, 1)), tema = ordem[i % 4];
    S.plano[k] = { tema, foco: FOCOS[tema] };
    const exT = Object.entries(S.exercicios).filter(([, x]) => x.tema === tema).map(([id]) => id);
    semanasDoMes(k).forEach((sg, w) => {
      if (S.semanas[sg]) return; // semana partilhada com o mês anterior
      if (k > mesKey(new Date(new Date(hoje).getFullYear(), new Date(hoje).getMonth() + 1, 1))) return; // só se planeia até ao mês seguinte
      const pid = "pl-" + k + "-" + (w + 1), baralho = exT.slice().sort(() => rnd() - 0.5);
      const itens = [
        ...baralho.slice(0, 2).map(id => ({ parte: "aquecimento", exercicioId: id, dose: um(["2 min", "2 x 10 m", "1 min"]), obs: "" })),
        ...baralho.slice(2, 5).map(id => ({ parte: "principal", exercicioId: id, dose: um(DOSES), obs: um(OBS) }))];
      S.planos[pid] = { nome: `${TEMAS[tema].nome} · ${MESES[+k.slice(5) - 1].slice(0, 3)} · semana ${w + 1}`, tema, itens, material: matTema[tema].slice(0, 2).map(m => ({ materialId: m, qtd: String(int(4, 12)) })), notas: w === 0 ? "Semana de introdução: explicar bem cada exercício." : "" };
      S.semanas[sg] = { planoId: pid };
    });
  }

  // ---------- alterações de horário ----------
  const A = (eq, data, dados) => S.alteracoes[eq + "_" + data] = { equipaId: eq, data, ...dados };
  const naData = (eq, de, ate, f) => previstas(de, ate).filter(p => p.equipaId === eq).forEach(p => f(p.data));
  const feriados = [ano + "-10-05", ano + "-12-01", ano + "-12-08"];
  previstas(inicio, (ano + 1) + "-06-30").forEach(p => {
    const d = p.data;
    if (feriados.includes(d)) A(p.equipaId, d, { cancelada: true, motivo: "Feriado ou férias" });
    else if (d >= ano + "-12-20" && d <= (ano + 1) + "-01-04") A(p.equipaId, d, { cancelada: true, motivo: "Feriado ou férias" });
  });
  naData("andebol", ano + "-10-12", ano + "-10-18", d => A("andebol", d, { novaHora: "18:15", novoLocal: "Pavilhão principal", motivo: "Jogo da equipa sénior" }));
  naData("basquetebol", ano + "-11-09", ano + "-11-15", d => A("basquetebol", d, { novaData: somaDias(d, 2), motivo: "Espaço ocupado" }));
  naData("hoquei", ano + "-11-23", ano + "-11-29", d => A("hoquei", d, { cancelada: true, motivo: "Jogo ou torneio" }));
  naData("futsal", ano + "-01-18", ano + "-01-24", d => A("futsal", d, { novaHora: "19:30", motivo: "Jogo da equipa sénior" }));
  naData("natacao", ano + "-02-01", ano + "-02-07", d => A("natacao", d, { novoLocal: "Piscina municipal", motivo: "Espaço ocupado" }));
  // alterações nos próximos dias, para se verem no ecrã Hoje
  const prox = previstas(somaDias(hoje, 1), somaDias(hoje, 7)).filter(p => !p.altId);
  if (prox[0]) A(prox[0].equipaId, prox[0].data, { novaHora: "17:45", novoLocal: "Ginásio 2", motivo: "Jogo da equipa sénior" });
  if (prox[2]) A(prox[2].equipaId, prox[2].data, { cancelada: true, motivo: "Treino cancelado" });
  if (prox[4]) A(prox[4].equipaId, prox[4].data, { novaData: somaDias(prox[4].data, 1), motivo: "Espaço ocupado" });
  S.planeadas[(prox[1] || {}).equipaId + "_" + (prox[1] || {}).data] = prox[1] ? { planoId: Object.keys(S.planos)[0], equipaId: prox[1].equipaId, data: prox[1].data } : undefined;
  Object.keys(S.planeadas).forEach(k => { if (!S.planeadas[k]) delete S.planeadas[k]; });

  // ---------- sessões registadas (de 15 de setembro até ontem) ----------
  const ontem = somaDias(hoje, -1), ultimas = somaDias(hoje, -10);
  const RESUMOS = ["Boa adesão", "Muito empenho dos atletas", "Rever a receção dos saltos", "Turma agitada no início", "Correu bem, repetir na próxima", ""];
  let n = 0;
  previstas(inicio, ontem).forEach(p => {
    if (p.cancelada) return;
    if (p.data >= ultimas && rnd() < 0.35) return; // algumas sessões recentes ficam por registar
    const id = "sim" + (n++), r = rnd(), eq = S.equipas[p.equipaId];
    const pl = planoDaSessao(p.equipaId, p.data), k = p.data.slice(0, 7);
    const base = { data: p.data, equipaId: p.equipaId, hora: p.hora, local: p.local, duracao: p.duracao, tema: pl?.tema || S.plano[k]?.tema || "saltar", criadoEm: n, autor: null };
    if (r < 0.1) S.sessoes[id] = { ...base, estado: "nao_dada", motivo: um(["Espaço ocupado", "Treino cancelado", "Poucos atletas", "Atraso do treino", "Falta de preparador", "Jogo ou torneio"]), nAtletas: 0, correu: null, exercicios: [], resumo: "", dadaPor: null };
    else {
      S.sessoes[id] = { ...base, estado: "dada", nAtletas: int(7, 18), correu: um([2, 3, 3, 3, 4, 4]), exercicios: [...new Set((pl?.itens || []).map(i => i.exercicioId))], itens: JSON.parse(JSON.stringify(pl?.itens || [])), resumo: um(RESUMOS), dadaPor: rnd() < 0.85 ? eq.responsavel : (eq.responsavel === "bruna" ? "joao-cancela" : "bruna") };
      if (rnd() < 0.15) S.notas[id] = { texto: um(["Dois atletas com queixas no joelho, aliviar saltos.", "Falar com o treinador sobre o atraso do início.", "Exercício do urso ainda difícil para metade da turma."]) };
    }
  });
  // uma sessão extra fora do horário (registada à mão)
  S.sessoes.simExtra = { data: ano + "-11-07", equipaId: "voleibol", estado: "dada", nAtletas: 12, correu: 4, tema: "empurrar", exercicios: ["e1", "e3"], resumo: "Sessão extra antes do torneio", dadaPor: "joao-cancela", hora: "10:00", local: "MD", duracao: 30, criadoEm: n + 1 };

  // ---------- atletas e avaliações (gatinhar e saltar) ----------
  const NOMES = ["Afonso", "Beatriz", "Carolina", "Diogo", "Duarte", "Francisco", "Gonçalo", "Inês", "Lara", "Leonor", "Martim", "Matilde", "Rodrigo", "Santiago", "Salvador", "Tomás", "Vicente", "Maria", "Benedita", "Lourenço"];
  const LETRAS = "ABCDEFGHIJLMNOPRST";
  Object.entries(S.equipas).filter(([, e]) => e.ativa !== false).forEach(([eid]) => {
    const ids = [];
    for (let i = 0; i < int(10, 15); i++) { const aid = "at-" + eid + "-" + i; S.atletas[aid] = { nome: um(NOMES) + " " + um(LETRAS) + ".", equipaId: eid }; ids.push(aid); }
    const nivel = {}; ids.forEach(a => nivel[a] = int(1, 3));
    for (let i = 0; i < 10; i++) {
      const k = mesKey(new Date(ano, 8 + i, 1)), tema = S.plano[k]?.tema;
      if (!TEMAS_AVALIADOS.includes(tema) || k + "-25" > hoje) continue;
      const res = {}; ids.forEach(a => { if (rnd() < 0.9) res[a] = Math.min(4, nivel[a] + (rnd() < 0.5 ? 1 : 0)); });
      S.avaliacoes[eid + "_" + tema + "_" + k] = { equipaId: eid, tema, mes: k, resultados: res, obs: "" };
      ids.forEach(a => { if (rnd() < 0.4) nivel[a] = Math.min(4, nivel[a] + 1); });
    }
  });

  // ---------- reuniões com tarefas ----------
  const R = (id, data, hora, tipo, local, objetivos, tarefas) => S.reunioes[id] = { data, hora, tipo, local, participantes: ["joao-cancela", "bruna"], objetivos, notas: "", tarefas: tarefas.map(([texto, responsavel, prazo, feito]) => ({ texto, responsavel, prazo, feito })) };
  R("r1", ano + "-09-10", "21:00", "online", "Teams", "Arranque da Escola do Movimento: horários e temas", [["Enviar horário aos treinadores", "joao-cancela", ano + "-09-12", true], ["Inventário do material", "bruna", ano + "-09-14", true]]);
  R("r2", ano + "-10-01", "18:00", "presencial", "Pavilhão principal", "Balanço do mês de saltar e preparar gatinhar", [["Gravar vídeos dos exercícios de gatinhar", "bruna", ano + "-10-05", true], ["Avaliação de saltar em todas as equipas", "bruna", ano + "-10-10", true]]);
  R("r3", ano + "-11-03", "21:00", "online", "Teams", "Resolver conflitos de espaço no basquetebol", [["Falar com o coordenador de basquetebol", "joao-cancela", ano + "-11-08", true]]);
  R("r4", ano + "-12-02", "18:30", "presencial", "Sede do clube", "Preparar relatório do 1.º período para a direção", [["Relatório do 1.º período", "joao-cancela", ano + "-12-15", true], ["Comprar 10 elásticos novos", "joao-cancela", ano + "-12-20", false]]);
  R("r5", (ano + 1) + "-01-07", "21:00", "online", "Teams", "Plano do 2.º período", [["Rever planos de saltar", "bruna", (ano + 1) + "-01-12", true], ["Marcar reunião com os treinadores de futsal", "joao-cancela", (ano + 1) + "-01-20", false]]);
  R("r6", (ano + 1) + "-02-04", "18:00", "presencial", "Pavilhão principal", "Avaliação de gatinhar e preparar março", [["Avaliar gatinhar em todas as equipas", "bruna", (ano + 1) + "-02-25", false]]);
  Object.keys(S.reunioes).forEach(id => { if (S.reunioes[id].data > hoje) delete S.reunioes[id]; });
  S.plano.config = { inicios: { [ep]: inicio } };
};
