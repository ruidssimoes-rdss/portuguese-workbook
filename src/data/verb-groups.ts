/**
 * Verb grouping config for the conjugations index page.
 * Groups verbs by conjugation type and theme for navigability.
 */

interface VerbGroup {
  label: string;
  labelPt?: string;
  verbs: string[]; // UPPERCASE verb keys
}

export const verbGroups: VerbGroup[] = [
  // ── REGULAR -AR ──────────────────────────
  {
    label: "Regular -AR: Daily life",
    labelPt: "Regular -AR: Vida diária",
    verbs: [
      "FALAR", "MORAR", "TRABALHAR", "ESTUDAR", "CHAMAR", "AJUDAR",
      "COMPRAR", "PAGAR", "GOSTAR", "ESPERAR", "ACORDAR",
      "LEVANTAR", "DEITAR", "LAVAR", "LIMPAR", "COZINHAR",
      "TOMAR", "USAR", "PASSAR", "MUDAR", "PRECISAR", "LIGAR",
      "FUNCIONAR", "ARRANJAR",
    ],
  },
  {
    label: "Regular -AR: Movement & action",
    labelPt: "Regular -AR: Movimento e ação",
    verbs: [
      "ANDAR", "VOLTAR", "ENTRAR", "COMEÇAR", "ACABAR",
      "NADAR", "DANÇAR", "CANTAR", "JOGAR", "BRINCAR",
      "ATRAVESSAR", "CAMINHAR", "EMPURRAR", "PUXAR",
      "CORTAR", "ESTACIONAR", "LEVAR", "SENTAR", "TOCAR",
    ],
  },
  {
    label: "Regular -AR: Communication",
    labelPt: "Regular -AR: Comunicação",
    verbs: [
      "PERGUNTAR", "RESPONDER", "EXPLICAR", "CONTAR", "MOSTRAR",
      "CONCORDAR", "DISCORDAR", "AVISAR", "INFORMAR",
      "CUMPRIMENTAR", "GRITAR", "SUSSURRAR", "ENVIAR",
    ],
  },
  {
    label: "Regular -AR: Thinking & feeling",
    labelPt: "Regular -AR: Pensamento e emoção",
    verbs: [
      "PENSAR", "ACREDITAR", "IMAGINAR", "SONHAR", "LEMBRAR",
      "AMAR", "CHORAR", "PREOCUPAR", "ZANGAR", "ASSUSTAR",
      "ACHAR", "DUVIDAR", "QUEIXAR",
    ],
  },
  {
    label: "Regular -AR: Social & relationships",
    labelPt: "Regular -AR: Social e relações",
    verbs: [
      "CONVIDAR", "VISITAR", "CASAR", "NAMORAR", "ABRAÇAR",
      "BEIJAR", "ENCONTRAR", "EXPERIMENTAR",
    ],
  },
  {
    label: "Regular -AR: Shopping & money",
    labelPt: "Regular -AR: Compras e dinheiro",
    verbs: [
      "VENDER", "GASTAR", "POUPAR", "EMPRESTAR", "TROCAR",
      "LUCRAR",
    ],
  },
  {
    label: "Regular -AR: Cooking & food",
    labelPt: "Regular -AR: Culinária",
    verbs: [
      "FRITAR", "ASSAR", "MISTURAR", "PROVAR",
    ],
  },
  {
    label: "Regular -AR: Work & professional",
    labelPt: "Regular -AR: Trabalho e profissão",
    verbs: [
      "CONTRATAR", "ORGANIZAR", "LIDERAR", "DECLARAR",
      "ARGUMENTAR", "APRESENTAR", "AFIRMAR",
      "REPRESENTAR", "NEGOCIAR", "FORMAR",
    ],
  },
  {
    label: "Regular -AR: Travel & places",
    labelPt: "Regular -AR: Viagens e lugares",
    verbs: [
      "VIAJAR", "FICAR", "CHEGAR", "PASSEAR",
    ],
  },
  {
    label: "Regular -AR: Judgement & opinion",
    labelPt: "Regular -AR: Avaliação e opinião",
    verbs: [
      "AVALIAR", "RECOMENDAR", "ACONSELHAR", "CRITICAR",
      "COMPARAR", "CONSIDERAR", "JULGAR", "ANALISAR",
      "INVESTIGAR", "OLHAR", "CONFIRMAR",
    ],
  },
  {
    label: "Regular -AR: B1 abstract",
    labelPt: "Regular -AR: B1 abstrato",
    verbs: [
      "HESITAR", "SUPERAR", "FALHAR", "FRACASSAR", "INVENTAR",
      "ATACAR", "ESCAPAR", "ADMIRAR", "RESPEITAR",
      "DESPREZAR", "INVEJAR", "PERDOAR", "CULPAR", "ACUSAR",
      "TOLERAR", "VOTAR", "GOVERNAR", "AUTORIZAR",
      "TRANSFORMAR", "ADAPTAR", "AJUSTAR", "MODIFICAR",
      "PIORAR", "AUMENTAR", "NEGAR", "CONFIAR",
      "SUPORTAR", "DESENRASCAR",
    ],
  },
  {
    label: "Regular -AR: Actions & creation",
    labelPt: "Regular -AR: Ações e criação",
    verbs: [
      "CRIAR", "TRATAR", "REALIZAR", "MARCAR", "COLOCAR",
      "CONTINUAR", "PROCURAR", "GANHAR", "TENTAR",
      "TORNAR", "EVITAR", "ACEITAR", "INFLUENCIAR",
      "RECUSAR", "APROVEITAR", "ENGANAR", "ROUBAR",
      "ENSINAR", "FECHAR", "MELHORAR", "DEIXAR",
      "DEMORAR", "APANHAR", "PRETENDER", "QUEBRAR",
      "REPARAR", "PINTAR", "DESENHAR", "CALÇAR",
      "ALCANÇAR", "PLANEAR", "CHATEAR",
    ],
  },

  // ── REGULAR -ER ──────────────────────────
  {
    label: "Regular -ER: Daily & physical",
    labelPt: "Regular -ER: Diário e físico",
    verbs: [
      "COMER", "BEBER", "VIVER", "CORRER", "ESCREVER",
      "FERVER", "NASCER", "MORRER",
    ],
  },
  {
    label: "Regular -ER: Understanding & thought",
    labelPt: "Regular -ER: Compreensão e pensamento",
    verbs: [
      "APRENDER", "PERCEBER", "COMPREENDER", "CONHECER",
      "RECONHECER", "CONVENCER", "ARREPENDER",
      "PRETENDER", "DEPENDER", "DEVER",
    ],
  },
  {
    label: "Regular -ER: Actions & processes",
    labelPt: "Regular -ER: Ações e processos",
    verbs: [
      "ESCOLHER", "RECEBER", "ACONTECER", "PARECER",
      "APARECER", "OCORRER", "RESOLVER", "DESENVOLVER",
      "ENVOLVER", "DEVOLVER", "PROMETER", "SURPREENDER",
      "PROMOVER", "DEBATER", "DEFENDER", "SOBREVIVER",
      "SOFRER", "CONVERTER",
    ],
  },

  // ── REGULAR -IR ──────────────────────────
  {
    label: "Regular -IR",
    labelPt: "Regular -IR",
    verbs: [
      "PARTIR", "ABRIR", "DECIDIR", "ASSISTIR", "DISCUTIR",
      "EXISTIR", "INCLUIR", "PERMITIR", "SERVIR",
      "PRODUZIR", "SURGIR", "GARANTIR", "CONSTITUIR",
      "PROIBIR", "INSISTIR", "DISTINGUIR", "DIVERTIR",
      "DEMITIR", "INVESTIR", "DEMOLIR", "RESISTIR", "CURTIR",
    ],
  },

  // ── IRREGULAR ────────────────────────────
  {
    label: "Irregular: Essential",
    labelPt: "Irregular: Essenciais",
    verbs: [
      "SER", "ESTAR", "TER", "IR", "FAZER",
      "PODER", "QUERER", "DEVER", "HAVER",
      "DAR", "DIZER", "VER", "SABER", "VIR", "PÔR",
    ],
  },
  {
    label: "Irregular -IR: Stem changes",
    labelPt: "Irregular -IR: Mudanças de radical",
    verbs: [
      "SAIR", "DORMIR", "SENTIR", "OUVIR", "SEGUIR",
      "CONSEGUIR", "PREFERIR", "FUGIR", "DESPIR", "MENTIR",
      "SUGERIR", "VESTIR", "PEDIR", "SUBIR", "CAIR",
      "DESPEDIR", "GERIR", "SORRIR", "RIR", "DESCER",
    ],
  },
  {
    label: "Irregular -IR: -uir & -uzir",
    labelPt: "Irregular -IR: -uir e -uzir",
    verbs: [
      "CONSTRUIR", "DESTRUIR", "DIMINUIR",
      "TRADUZIR", "REDUZIR", "CONDUZIR", "EXIGIR",
      "ATINGIR", "DESCOBRIR", "TRAIR",
    ],
  },
  {
    label: "Irregular -ER: Spelling changes",
    labelPt: "Irregular -ER: Mudanças ortográficas",
    verbs: [
      "LER", "CONHECER", "ACONTECER", "PARECER", "PERTENCER",
      "OFERECER", "ESQUECER", "CRESCER",
      "PROTEGER", "ELEGER", "OBEDECER", "DESOBEDECER",
      "MANTER", "PERDER", "TRAZER", "DESCREVER",
    ],
  },
  {
    label: "Irregular: Special",
    labelPt: "Irregular: Especiais",
    verbs: [
      "PROPOR",
    ],
  },
  {
    label: "Impersonal",
    labelPt: "Impessoais",
    verbs: ["CHOVER", "NEVAR"],
  },
];

/**
 * Get the group label for a verb key.
 */
export function getVerbGroup(verbKey: string): string {
  for (const group of verbGroups) {
    if (group.verbs.includes(verbKey.toUpperCase())) {
      return group.label;
    }
  }
  return "Other";
}

/**
 * Group a list of verb keys into sections, preserving group order.
 * Unmatched verbs go into "Other".
 */
export function getGroupedVerbs(
  verbKeys: string[]
): { label: string; labelPt?: string; verbs: string[] }[] {
  const groups: { label: string; labelPt?: string; verbs: string[] }[] = [];
  const assigned = new Set<string>();
  const keySet = new Set(verbKeys.map((v) => v.toUpperCase()));

  for (const group of verbGroups) {
    const matching = group.verbs.filter((v) => {
      if (assigned.has(v)) return false;
      if (keySet.has(v)) {
        assigned.add(v);
        return true;
      }
      return false;
    });
    if (matching.length > 0) {
      groups.push({ label: group.label, labelPt: group.labelPt, verbs: matching });
    }
  }

  // Unmatched
  const unmatched = verbKeys.filter((v) => !assigned.has(v.toUpperCase()));
  if (unmatched.length > 0) {
    groups.push({ label: "Other", labelPt: "Outros", verbs: unmatched.map((v) => v.toUpperCase()) });
  }

  return groups;
}
