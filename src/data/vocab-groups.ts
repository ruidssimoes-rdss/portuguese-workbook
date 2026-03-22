/**
 * Vocab grouping configuration.
 *
 * Each category can optionally have groups defined.
 * Words are assigned to groups by matching their `portuguese` field.
 * Words that don't match any group go into "Other".
 * Categories without a config here show as a flat list (no grouping).
 */

interface VocabGroup {
  label: string;
  labelPt?: string;
  /** Words whose `portuguese` field (lowercased, article-stripped) matches one of these */
  words: string[];
}

function normalizeForGroupMatch(word: string): string {
  return word
    .toLowerCase()
    .replace(/^(o |a |os |as )/, "")
    .trim();
}

function wordMatchesGroup(word: string, groupWords: string[]): boolean {
  const normalized = normalizeForGroupMatch(word);
  return groupWords.some((gw) => {
    const normalizedGroup = normalizeForGroupMatch(gw);
    return normalized === normalizedGroup || normalized.startsWith(normalizedGroup);
  });
}

export const vocabGroups: Record<string, VocabGroup[]> = {
  "numbers-time": [
    {
      label: "Cardinal numbers",
      labelPt: "Números cardinais",
      words: [
        "um / uma", "dois / duas", "três", "quatro", "cinco", "seis",
        "sete", "oito", "nove", "dez", "onze", "doze", "treze", "catorze",
        "quinze", "dezasseis", "dezassete", "dezoito", "dezanove", "vinte",
        "trinta", "quarenta", "cinquenta", "sessenta", "setenta", "oitenta",
        "noventa", "cem", "mil",
      ],
    },
    {
      label: "Ordinal numbers",
      labelPt: "Números ordinais",
      words: ["primeiro", "segundo", "terceiro", "último"],
    },
    {
      label: "Months",
      labelPt: "Meses",
      words: [
        "janeiro", "fevereiro", "março", "abril", "maio", "junho",
        "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
      ],
    },
    {
      label: "Days of the week",
      labelPt: "Dias da semana",
      words: [
        "segunda-feira", "terça-feira", "quarta-feira", "quinta-feira",
        "sexta-feira", "sábado", "domingo", "fim de semana",
      ],
    },
    {
      label: "Time of day",
      labelPt: "Horas do dia",
      words: [
        "manhã", "tarde", "noite", "madrugada", "meio-dia", "meia-noite",
        "hora", "minuto", "segundo", "meia hora", "um quarto de hora", "relógio",
      ],
    },
    {
      label: "Time expressions",
      labelPt: "Expressões de tempo",
      words: [
        "hoje", "amanhã", "ontem", "agora", "depois", "antes",
        "sempre", "nunca", "às vezes", "cedo", "entretanto", "antigamente",
        "uma vez", "duas vezes", "anteontem", "depois de amanhã",
        "quinzena", "século", "feriado", "que horas são?",
        "semana", "mês", "ano",
      ],
    },
  ],

  "food-drink": [
    {
      label: "Drinks",
      labelPt: "Bebidas",
      words: [
        "água", "café", "chá", "leite", "sumo", "cerveja", "vinho", "imperial",
      ],
    },
    {
      label: "Meals",
      labelPt: "Refeições",
      words: [
        "pequeno-almoço", "almoço", "jantar", "lanche", "sobremesa",
      ],
    },
    {
      label: "Meat & fish",
      labelPt: "Carne e peixe",
      words: [
        "carne", "frango", "peixe", "bacalhau", "marisco", "presunto", "fiambre",
      ],
    },
    {
      label: "Fruit & vegetables",
      labelPt: "Frutas e legumes",
      words: [
        "fruta", "maçã", "laranja", "tomate", "cebola", "alho", "legumes",
        "feijão", "grão", "batata", "salada",
      ],
    },
    {
      label: "Basics & condiments",
      labelPt: "Básicos e condimentos",
      words: [
        "pão", "queijo", "arroz", "ovo", "massa", "azeite", "sal", "açúcar",
        "manteiga", "sopa", "cereal", "iogurte", "bolo",
      ],
    },
    {
      label: "At the restaurant",
      labelPt: "No restaurante",
      words: [
        "restaurante", "ementa", "a ementa", "conta", "a conta", "garfo", "faca",
        "colher", "prato", "copo", "garrafa", "guardanapo", "a gorjeta",
        "uma mesa para dois", "o prato do dia", "para levar",
      ],
    },
    {
      label: "Cooking & taste",
      labelPt: "Cozinha e sabor",
      words: [
        "cozinhar", "ferver", "assar", "fritar", "receita", "delicioso",
        "picante", "salgado", "doce", "amargo", "grelhado", "petisco",
        "padaria", "cervejaria",
      ],
    },
    {
      label: "Phrases",
      labelPt: "Frases úteis",
      words: [
        "tenho fome", "tenho sede", "sem glúten", "vegetariano / vegetariana",
        "pastel de nata",
      ],
    },
    {
      label: "Fruits",
      labelPt: "Frutas",
      words: [
        "banana", "morango", "uva", "pêra", "limão", "pêssego", "melão",
        "melancia", "ananás", "cereja", "ameixa", "figo", "manga", "framboesa",
      ],
    },
    {
      label: "Vegetables",
      labelPt: "Legumes",
      words: [
        "cenoura", "pepino", "pimento", "couve", "alface", "espinafre",
        "brócolos", "cogumelo", "ervilha", "milho", "abóbora",
      ],
    },
    {
      label: "Seafood",
      labelPt: "Mariscos e peixes",
      words: [
        "sardinha", "camarão", "lula", "polvo", "mexilhão", "amêijoa",
        "atum", "salmão", "borrego", "peru", "pato",
      ],
    },
    {
      label: "Portuguese dishes",
      labelPt: "Pratos portugueses",
      words: [
        "francesinha", "caldo verde", "cozido à portuguesa",
        "pastéis de bacalhau", "bifana", "prego", "tremoço",
      ],
    },
    {
      label: "Dairy & baking",
      labelPt: "Laticínios e panificação",
      words: ["nata", "farinha", "fermento"],
    },
    {
      label: "Herbs & condiments",
      labelPt: "Ervas e condimentos",
      words: [
        "canela", "salsa", "coentros", "louro", "colorau",
        "molho", "mostarda", "maionese",
      ],
    },
    {
      label: "Wines & spirits",
      labelPt: "Vinhos e licores",
      words: ["ginjinha", "vinho do porto", "aguardente"],
    },
  ],

  "home-rooms": [
    {
      label: "Rooms & spaces",
      labelPt: "Divisões e espaços",
      words: [
        "casa", "apartamento", "cozinha", "sala", "quarto", "casa de banho",
        "varanda", "jardim", "garagem", "escadas", "sótão", "cave", "andar", "o andar",
      ],
    },
    {
      label: "Furniture",
      labelPt: "Mobília",
      words: [
        "cama", "mesa", "cadeira", "sofá", "armário", "espelho", "estante",
        "mesinha de cabeceira", "prateleira", "tapete",
      ],
    },
    {
      label: "Kitchen items",
      labelPt: "Utensílios de cozinha",
      words: [
        "panela", "frigideira", "forno", "micro-ondas", "lava-loiça",
        "frigorífico", "fogão", "máquina de lavar", "talheres",
        "toalha de mesa", "avental", "gaveta",
      ],
    },
    {
      label: "Bathroom",
      labelPt: "Casa de banho",
      words: [
        "toalha", "sabonete", "champô", "escova de dentes", "pasta de dentes",
        "duche", "banheira", "lavatório", "secador de cabelo",
      ],
    },
    {
      label: "Bedroom",
      labelPt: "Quarto",
      words: [
        "almofada", "cobertor", "lençol", "colchão", "candeeiro",
        "cortina", "despertador", "comando",
      ],
    },
    {
      label: "House features",
      labelPt: "Características da casa",
      words: [
        "porta", "janela", "chave", "a chave", "luz", "televisão", "telemóvel",
        "aspirador", "renda", "mudança", "vizinhança", "o vizinho / a vizinha",
        "a renda / o aluguer", "mudar de casa", "quadro", "lareira",
        "chão", "teto", "parede", "interruptor", "tomada", "vassoura",
        "lixo", "campainha",
      ],
    },
  ],

  "travel-directions": [
    {
      label: "Transport",
      labelPt: "Transportes",
      words: [
        "aeroporto", "avião", "comboio", "autocarro", "metro", "táxi",
        "carro", "bicicleta", "barco", "eléctrico", "autoestrada",
      ],
    },
    {
      label: "Tickets & travel",
      labelPt: "Bilhetes e viagem",
      words: [
        "bilhete", "o bilhete", "ida e volta", "partida", "chegada", "atraso",
        "o horário", "a paragem", "passaporte", "bagagem", "viagem", "férias",
        "reserva", "portagem",
      ],
    },
    {
      label: "Directions",
      labelPt: "Direções",
      words: [
        "rua", "avenida", "praça", "esquina", "direita", "esquerda",
        "em frente", "perto", "longe", "aqui", "ali", "mapa",
        "rotunda", "cruzamento", "semáforo", "passadeira",
      ],
    },
    {
      label: "Places",
      labelPt: "Lugares",
      words: [
        "hotel", "quarto", "recepção", "praia", "museu", "igreja",
        "castelo", "jardim", "mercado", "farmácia", "hospital", "banco",
        "correios", "supermercado",
      ],
    },
    {
      label: "Useful phrases",
      labelPt: "Frases úteis",
      words: [
        "estou perdido / estou perdida", "pode ajudar-me?", "quanto custa?",
        "onde fica...?", "a que horas...?", "é longe?", "perdido", "ajuda",
        "emergência", "saudade", "estrangeiro", "alfândega", "embaixada",
        "fronteira", "câmbio", "peão", "carta de condução", "gasolina",
        "parque de estacionamento", "condutor / condutora", "passageiro / passageira",
        "estação",
      ],
    },
  ],

  "health-body": [
    {
      label: "Head & face",
      labelPt: "Cabeça e rosto",
      words: [
        "cabeça", "olho / olhos", "nariz", "boca", "orelha", "dente", "cabelo", "pescoço",
      ],
    },
    {
      label: "Body",
      labelPt: "Corpo",
      words: [
        "mão / mãos", "braço", "perna", "pé / pés", "costas", "peito",
        "barriga", "dedo", "ombro", "joelho", "coração", "estômago", "pulmão / pulmões",
        "sangue", "pele",
      ],
    },
    {
      label: "Symptoms & illness",
      labelPt: "Sintomas e doenças",
      words: [
        "dor", "dor de cabeça", "a dor de cabeça", "dor de garganta",
        "dor de costas", "a dor de barriga", "febre", "constipação",
        "gripe", "tosse", "alergia", "doente", "dói",
      ],
    },
    {
      label: "Medical",
      labelPt: "Médico",
      words: [
        "receita médica", "comprimido", "medicamento", "consulta",
        "urgência", "urgências", "a urgência", "análise", "vacina",
        "operação", "a receita", "receita", "penso", "o seguro de saúde",
      ],
    },
    {
      label: "State & feelings",
      labelPt: "Estado e sensações",
      words: [
        "saudável", "cansado / cansada", "melhorar", "alérgico / alérgica",
        "exercício", "dieta", "bem-estar",
      ],
    },
    {
      label: "Phrases",
      labelPt: "Frases úteis",
      words: [
        "estou doente", "dói-me aqui", "tenho febre",
        "estou constipado / constipada",
      ],
    },
  ],

  "countries-nationalities": [
    {
      label: "Countries",
      labelPt: "Países",
      words: [
        "portugal", "espanha", "frança", "alemanha", "inglaterra", "itália",
        "brasil", "estados unidos", "china", "japão", "angola", "moçambique",
        "cabo verde", "marrocos", "holanda", "irlanda", "canadá", "suíça",
      ],
    },
    {
      label: "Nationalities",
      labelPt: "Nacionalidades",
      words: [
        "português", "espanhol", "francês", "alemão", "inglês", "italiano",
        "brasileiro", "americano", "chinês", "japonês", "angolano",
        "cabo-verdiano", "irlandês", "canadiano", "holandês",
      ],
    },
    {
      label: "Geography & languages",
      labelPt: "Geografia e línguas",
      words: [
        "país", "continente", "europa", "áfrica", "ásia", "américa",
        "nacionalidade", "língua", "idioma", "sotaque", "visto",
      ],
    },
  ],

  "hobbies-leisure": [
    {
      label: "Sports",
      labelPt: "Desportos",
      words: [
        "desporto", "futebol", "natação", "surf", "corrida", "caminhada",
        "ciclismo", "ginástica", "ioga", "equipa", "jogo", "treino",
        "competição", "campeonato", "golo", "resultado", "ginásio", "piscina", "estádio",
      ],
    },
    {
      label: "Arts & entertainment",
      labelPt: "Artes e entretenimento",
      words: [
        "música", "canção", "instrumento", "guitarra", "piano", "concerto",
        "espetáculo", "exposição", "filme", "cinema", "série", "documentário",
        "romance", "poesia", "revista", "jornal", "pintura", "desenho", "escultura",
      ],
    },
    {
      label: "Activities",
      labelPt: "Atividades",
      words: [
        "jogar", "dançar", "cantar", "nadar", "correr", "ler", "escrever",
        "pintar", "desenhar", "pescar", "surfar", "acampar", "jardinar",
      ],
    },
  ],

  "holidays-celebrations": [
    {
      label: "Holidays",
      labelPt: "Feriados",
      words: [
        "natal", "véspera de natal", "ano novo", "páscoa", "carnaval",
        "santos populares", "dia de portugal", "dia dos namorados",
        "dia da mãe", "dia do pai",
      ],
    },
    {
      label: "Celebrations",
      labelPt: "Celebrações",
      words: [
        "aniversário", "festa", "presente", "prenda", "convidar",
        "celebrar", "festejar", "brindar",
      ],
    },
    {
      label: "Party items",
      labelPt: "Itens de festa",
      words: [
        "bolo de aniversário", "vela", "balão", "decoração", "fogo de artifício",
      ],
    },
    {
      label: "Life events",
      labelPt: "Eventos de vida",
      words: ["noivo / noiva", "batizado", "cerimónia"],
    },
    {
      label: "Portuguese traditions",
      labelPt: "Tradições portuguesas",
      words: ["tradição", "costume", "sardinha", "manjerico", "arraial"],
    },
  ],
};

/**
 * Get word groups for a category.
 * Returns null if no grouping config exists (category renders as flat list).
 */
export function getWordGroups(
  categoryId: string,
  words: any[]
): { label: string; labelPt?: string; words: any[] }[] | null {
  const config = vocabGroups[categoryId];
  if (!config) return null;

  const groups: { label: string; labelPt?: string; words: any[] }[] = [];
  const assigned = new Set<number>();

  for (const group of config) {
    const matching = words.filter((w, i) => {
      if (assigned.has(i)) return false;
      if (wordMatchesGroup(w.portuguese, group.words)) {
        assigned.add(i);
        return true;
      }
      return false;
    });

    if (matching.length > 0) {
      groups.push({ label: group.label, labelPt: group.labelPt, words: matching });
    }
  }

  // Unmatched words go into "Other"
  const unmatched = words.filter((_, i) => !assigned.has(i));
  if (unmatched.length > 0) {
    groups.push({ label: "Other", labelPt: "Outros", words: unmatched });
  }

  return groups;
}
