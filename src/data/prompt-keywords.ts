import type { PromptValidationConfig } from "@/lib/validate-response";

export const promptKeywords: Record<string, PromptValidationConfig> = {
  // ==========================================
  // GREETINGS
  // ==========================================

  "morning-1": {
    sets: [
      { keywords: ["estou", "bem"], optional: ["e", "tu"] },
      { keywords: ["tudo", "bem"], optional: ["e", "tu", "contigo"] },
      { keywords: ["estou", "otimo"] },
      { keywords: ["estou", "otima"] },
      { keywords: ["mais", "ou", "menos"] },
      { keywords: ["assim", "assim"] },
      { keywords: ["estou", "cansado"] },
      { keywords: ["estou", "cansada"] },
      { keywords: ["estou", "contente"] },
      { keywords: ["estou", "feliz"] },
      { keywords: ["estou", "doente"] },
      { keywords: ["estou", "mal"] },
      { keywords: ["bom", "dia"] },
      { keywords: ["bem", "obrigado"] },
      { keywords: ["bem", "obrigada"] },
      { keywords: ["nao", "estou", "bem"] },
      { keywords: ["estou", "mais"] },
      { keywords: ["tudo", "otimo"] },
      { keywords: ["tudo", "tranquilo"] },
    ],
    minMatches: 1,
    minWords: 2,
  },

  "morning-2": {
    sets: [
      { keywords: ["dormi", "bem"], optional: ["muito"] },
      { keywords: ["sim", "dormi"] },
      { keywords: ["nao", "dormi"] },
      { keywords: ["dormi", "muito"] },
      { keywords: ["dormi", "mal"] },
      { keywords: ["mais", "ou", "menos"] },
      { keywords: ["sim", "muito", "bem"] },
    ],
    minMatches: 1,
    minWords: 2,
  },

  "afternoon-1": {
    sets: [
      { keywords: ["tudo", "bem"], optional: ["e", "contigo"] },
      { keywords: ["sim", "tudo"] },
      { keywords: ["esta", "tudo"] },
      { keywords: ["tudo", "otimo"] },
      { keywords: ["tudo", "tranquilo"] },
      { keywords: ["mais", "ou", "menos"] },
      { keywords: ["boa", "tarde"] },
    ],
    minMatches: 1,
    minWords: 2,
  },

  "afternoon-2": {
    sets: [
      { keywords: ["vou"], optional: ["estudar", "trabalhar", "descansar", "passear", "cozinhar", "correr", "ler"] },
      { keywords: ["nao", "sei"] },
      { keywords: ["nada", "especial"] },
      { keywords: ["trabalhar"] },
      { keywords: ["estudar"] },
      { keywords: ["descansar"] },
      { keywords: ["ficar", "em", "casa"] },
      { keywords: ["vou", "sair"] },
      { keywords: ["tenho", "que"] },
      { keywords: ["preciso", "de"] },
    ],
    minMatches: 1,
    minWords: 2,
  },

  "evening-1": {
    sets: [
      { keywords: ["correu", "bem"], optional: ["muito"] },
      { keywords: ["correu", "mal"] },
      { keywords: ["correu", "muito"] },
      { keywords: ["foi", "bom"] },
      { keywords: ["foi", "um", "bom"] },
      { keywords: ["o", "meu", "dia"] },
      { keywords: ["mais", "ou", "menos"] },
      { keywords: ["foi", "cansativo"] },
      { keywords: ["tive", "um", "bom"] },
      { keywords: ["dia", "longo"] },
      { keywords: ["dia", "ocupado"] },
    ],
    minMatches: 1,
    minWords: 2,
  },

  "evening-2": {
    sets: [
      { keywords: ["ja", "jantei"] },
      { keywords: ["sim", "jantei"] },
      { keywords: ["ainda", "nao"] },
      { keywords: ["nao", "jantei"] },
      { keywords: ["vou", "jantar"] },
      { keywords: ["nao", "tenho", "fome"] },
      { keywords: ["tenho", "fome"] },
      { keywords: ["sim", "obrigado"] },
      { keywords: ["sim", "obrigada"] },
      { keywords: ["estou", "a", "jantar"] },
    ],
    minMatches: 1,
    minWords: 2,
  },

  "anytime-1": {
    sets: [
      { keywords: ["estou", "bem"], optional: ["e", "tu"] },
      { keywords: ["tudo", "bem"], optional: ["e", "tu"] },
      { keywords: ["estou", "otimo"] },
      { keywords: ["estou", "otima"] },
      { keywords: ["mais", "ou", "menos"] },
      { keywords: ["assim", "assim"] },
      { keywords: ["estou", "cansado"] },
      { keywords: ["estou", "cansada"] },
      { keywords: ["estou", "contente"] },
      { keywords: ["estou", "feliz"] },
      { keywords: ["bem", "obrigado"] },
      { keywords: ["ola"] },
      { keywords: ["tudo", "otimo"] },
      { keywords: ["tudo", "tranquilo"] },
    ],
    minMatches: 1,
    minWords: 1,
  },

  "anytime-2": {
    sets: [
      { keywords: ["tudo", "bem"] },
      { keywords: ["tudo", "otimo"] },
      { keywords: ["vai", "tudo"] },
      { keywords: ["tudo", "tranquilo"] },
      { keywords: ["sim", "tudo"] },
      { keywords: ["mais", "ou", "menos"] },
      { keywords: ["vai", "bem"] },
    ],
    minMatches: 1,
    minWords: 2,
  },

  // ==========================================
  // PERSONAL
  // ==========================================

  "personal-1": {
    sets: [
      { keywords: ["chamo"] },
      { keywords: ["nome", "e"] },
      { keywords: ["sou", "o"] },
      { keywords: ["sou", "a"] },
      { keywords: ["eu", "sou"] },
    ],
    minMatches: 1,
    minWords: 2,
  },

  "personal-2": {
    sets: [
      { keywords: ["sou", "de"] },
      { keywords: ["sou", "do"] },
      { keywords: ["sou", "da"] },
      { keywords: ["venho", "de"] },
      { keywords: ["sou", "portugues"] },
      { keywords: ["sou", "portuguesa"] },
      { keywords: ["moro", "em"] },
      { keywords: ["vivo", "em"] },
      { keywords: ["nasci", "em"] },
      { keywords: ["sou", "de", "portugal"] },
    ],
    minMatches: 1,
    minWords: 2,
  },

  "personal-3": {
    sets: [
      { keywords: ["tenho"], optional: ["anos"] },
      { keywords: ["anos"] },
    ],
    minMatches: 1,
    minWords: 2,
  },

  "personal-4": {
    sets: [
      { keywords: ["trabalho"] },
      { keywords: ["estudo"] },
      { keywords: ["sou", "estudante"] },
      { keywords: ["sou", "professor"] },
      { keywords: ["sou", "professora"] },
      { keywords: ["sou", "programador"] },
      { keywords: ["sou", "programadora"] },
      { keywords: ["sou", "medico"] },
      { keywords: ["sou", "medica"] },
      { keywords: ["sou", "engenheiro"] },
      { keywords: ["sou", "engenheira"] },
      { keywords: ["trabalho", "como"] },
      { keywords: ["trabalho", "em"] },
      { keywords: ["trabalho", "e", "estudo"] },
      { keywords: ["estou", "desempregado"] },
      { keywords: ["estou", "desempregada"] },
      { keywords: ["estou", "reformado"] },
      { keywords: ["estou", "reformada"] },
    ],
    minMatches: 1,
    minWords: 1,
  },

  "personal-5": {
    sets: [
      { keywords: ["tenho"] },
      { keywords: ["nao", "tenho"] },
      { keywords: ["sim", "tenho"] },
      { keywords: ["irmao"] },
      { keywords: ["irma"] },
      { keywords: ["irmaos"] },
      { keywords: ["filho", "unico"] },
      { keywords: ["filha", "unica"] },
      { keywords: ["nao", "nao"] },
    ],
    minMatches: 1,
    minWords: 2,
  },

  "personal-6": {
    sets: [
      { keywords: ["moro", "em"] },
      { keywords: ["moro", "no"] },
      { keywords: ["moro", "na"] },
      { keywords: ["vivo", "em"] },
      { keywords: ["vivo", "no"] },
      { keywords: ["vivo", "na"] },
      { keywords: ["moro", "perto"] },
      { keywords: ["moro", "num"] },
    ],
    minMatches: 1,
    minWords: 2,
  },

  // ==========================================
  // SITUATIONAL
  // ==========================================

  "situation-1": {
    sets: [
      { keywords: ["quero"] },
      { keywords: ["cafe"] },
      { keywords: ["cha"] },
      { keywords: ["agua"] },
      { keywords: ["imperial"] },
      { keywords: ["galao"] },
      { keywords: ["sumo"] },
      { keywords: ["cerveja"] },
      { keywords: ["meia", "leite"] },
      { keywords: ["por", "favor"] },
      { keywords: ["bica"] },
      { keywords: ["um", "cafe"] },
      { keywords: ["uma", "agua"] },
    ],
    minMatches: 1,
    minWords: 1,
  },

  "situation-2": {
    sets: [
      { keywords: ["onde", "fica"] },
      { keywords: ["onde", "e"] },
      { keywords: ["onde", "esta"] },
      { keywords: ["como", "chego"] },
      { keywords: ["desculpe"] },
      { keywords: ["pode", "dizer"] },
      { keywords: ["estacao"] },
      { keywords: ["pode", "ajudar"] },
    ],
    minMatches: 1,
    minWords: 2,
  },

  "situation-3": {
    sets: [
      { keywords: ["conta"] },
      { keywords: ["por", "favor"] },
      { keywords: ["pode", "trazer"] },
      { keywords: ["se", "faz", "favor"] },
      { keywords: ["quero", "pagar"] },
      { keywords: ["desculpe"] },
    ],
    minMatches: 1,
    minWords: 2,
  },

  "situation-4": {
    sets: [
      { keywords: ["quanto", "custa"] },
      { keywords: ["quanto", "e"] },
      { keywords: ["qual", "preco"] },
      { keywords: ["quanto", "custa", "isto"] },
      { keywords: ["quanto", "custa", "isso"] },
      { keywords: ["desculpe", "quanto"] },
    ],
    minMatches: 1,
    minWords: 2,
  },

  "situation-5": {
    sets: [
      { keywords: ["sim"] },
      { keywords: ["nao"] },
      { keywords: ["obrigado"] },
      { keywords: ["obrigada"] },
      { keywords: ["por", "favor"] },
      { keywords: ["com", "gosto"] },
      { keywords: ["estou", "cheio"] },
      { keywords: ["estou", "cheia"] },
      { keywords: ["quero"] },
      { keywords: ["nao", "quero"] },
    ],
    minMatches: 1,
    minWords: 1,
  },

  "situation-6": {
    sets: [
      { keywords: ["onde", "esta"] },
      { keywords: ["onde", "fica"] },
      { keywords: ["onde", "posso"] },
      { keywords: ["leite"] },
      { keywords: ["desculpe"] },
      { keywords: ["pode", "ajudar"] },
      { keywords: ["tem"] },
    ],
    minMatches: 1,
    minWords: 2,
  },

  "situation-7": {
    sets: [
      { keywords: ["telemovel"] },
      { keywords: ["avariou"] },
      { keywords: ["nao", "funciona"] },
      { keywords: ["partiu"] },
      { keywords: ["ecra"] },
      { keywords: ["preciso", "reparar"] },
      { keywords: ["reclamacao"] },
      { keywords: ["boa", "tarde"] },
      { keywords: ["problema"] },
    ],
    minMatches: 1,
    minWords: 2,
  },

  "situation-8": {
    sets: [
      { keywords: ["queres", "jantar"] },
      { keywords: ["vamos", "jantar"] },
      { keywords: ["jantar", "comigo"] },
      { keywords: ["queres", "ir"] },
      { keywords: ["queres", "vir"] },
      { keywords: ["estas", "livre"] },
      { keywords: ["convidar"] },
    ],
    minMatches: 1,
    minWords: 2,
  },

  // ==========================================
  // OPINION
  // ==========================================

  "opinion-1": {
    sets: [
      { keywords: ["gosto"] },
      { keywords: ["adoro"] },
      { keywords: ["sim"] },
      { keywords: ["nao"] },
      { keywords: ["muito", "bonito"] },
      { keywords: ["comida"] },
      { keywords: ["clima"] },
      { keywords: ["caro"] },
      { keywords: ["gosto", "de", "portugal"] },
      { keywords: ["gosto", "de", "viver"] },
      { keywords: ["mais", "ou", "menos"] },
    ],
    minMatches: 1,
    minWords: 2,
  },

  "opinion-2": {
    sets: [
      { keywords: ["favorito", "e"] },
      { keywords: ["favorito"] },
      { keywords: ["gosto", "de"] },
      { keywords: ["adoro"] },
      { keywords: ["bacalhau"] },
      { keywords: ["francesinha"] },
      { keywords: ["marisco"] },
      { keywords: ["cozido"] },
      { keywords: ["pasteis", "nata"] },
      { keywords: ["prato"] },
      { keywords: ["prefiro"] },
    ],
    minMatches: 1,
    minWords: 2,
  },

  "opinion-3": {
    sets: [
      { keywords: ["gosto", "de"] },
      { keywords: ["adoro"] },
      { keywords: ["ler"] },
      { keywords: ["cozinhar"] },
      { keywords: ["passear"] },
      { keywords: ["musica"] },
      { keywords: ["correr"] },
      { keywords: ["filmes"] },
      { keywords: ["futebol"] },
      { keywords: ["viajar"] },
      { keywords: ["amigos"] },
      { keywords: ["jogar"] },
      { keywords: ["nadar"] },
      { keywords: ["desenhar"] },
      { keywords: ["pintar"] },
      { keywords: ["dancar"] },
    ],
    minMatches: 1,
    minWords: 2,
  },

  "opinion-4": {
    sets: [
      { keywords: ["esta", "sol"] },
      { keywords: ["esta", "chover"] },
      { keywords: ["esta", "frio"] },
      { keywords: ["esta", "calor"] },
      { keywords: ["bom", "tempo"] },
      { keywords: ["mau", "tempo"] },
      { keywords: ["nublado"] },
      { keywords: ["vento"] },
      { keywords: ["esta", "a", "chover"] },
      { keywords: ["chuva"] },
      { keywords: ["esta", "bonito"] },
      { keywords: ["esta", "quente"] },
    ],
    minMatches: 1,
    minWords: 2,
  },

  "opinion-5": {
    sets: [
      { keywords: ["prefiro"] },
      { keywords: ["praia"] },
      { keywords: ["montanha"] },
      { keywords: ["gosto", "mais"] },
      { keywords: ["adoro"] },
      { keywords: ["gosto", "dos", "dois"] },
      { keywords: ["depende"] },
    ],
    minMatches: 1,
    minWords: 2,
  },

  "opinion-6": {
    sets: [
      { keywords: ["dificil"] },
      { keywords: ["facil"] },
      { keywords: ["sim"] },
      { keywords: ["nao"] },
      { keywords: ["mais", "ou", "menos"] },
      { keywords: ["estou", "aprender"] },
      { keywords: ["gramatica"] },
      { keywords: ["pronuncia"] },
      { keywords: ["bonito"] },
      { keywords: ["gosto"] },
      { keywords: ["tao"] },
      { keywords: ["um", "pouco"] },
    ],
    minMatches: 1,
    minWords: 2,
  },
};
