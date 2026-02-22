// ═══════════════════════════════════════════════════
// CIPLE Mock Exams — Data & Types
// ═══════════════════════════════════════════════════

// === Question Types ===

export interface MultipleChoiceQuestion {
  id: string;
  type: "multiple-choice";
  instruction: string;
  instructionEn: string;
  stimulus: string;
  stimulusContext?: string;
  question: string;
  questionEn?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  explanationEn: string;
  points: number;
}

export interface MatchingQuestion {
  id: string;
  type: "matching";
  instruction: string;
  instructionEn: string;
  pairs: {
    left: string;
    right: string;
  }[];
  points: number;
}

export interface WritingTask {
  id: string;
  type: "writing";
  instruction: string;
  instructionEn: string;
  scenario: string;
  scenarioEn: string;
  minWords: number;
  maxWords: number;
  hints?: string[];
  hintsEn?: string[];
  sampleResponse: string;
  sampleResponseEn: string;
  keyPhrases: string[];
  points: number;
}

export interface ListeningQuestion {
  id: string;
  type: "listening";
  instruction: string;
  instructionEn: string;
  audioText: string;
  audioSpeed?: "slow" | "normal";
  playLimit: number;
  question: string;
  questionEn?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  explanationEn: string;
  points: number;
}

export interface SpeakingPrompt {
  id: string;
  type: "speaking";
  part: 1 | 2 | 3;
  instruction: string;
  instructionEn: string;
  prompt: string;
  promptEn: string;
  guidance: string[];
  guidanceEn: string[];
  sampleResponse: string;
  sampleResponseEn: string;
  keyElements: string[];
  minWords: number;
  points: number;
}

// === Section Types ===

export interface ReadingWritingSection {
  id: string;
  type: "reading-writing";
  title: string;
  titleEn: string;
  weight: number;
  timeMinutes: number;
  parts: {
    reading: (MultipleChoiceQuestion | MatchingQuestion)[];
    writing: WritingTask[];
  };
}

export interface ListeningSection {
  id: string;
  type: "listening";
  title: string;
  titleEn: string;
  weight: number;
  timeMinutes: number;
  questions: ListeningQuestion[];
}

export interface SpeakingSection {
  id: string;
  type: "speaking";
  title: string;
  titleEn: string;
  weight: number;
  timeMinutes: number;
  prompts: SpeakingPrompt[];
}

// === Exam Type ===

export interface MockExam {
  id: string;
  title: string;
  titlePt: string;
  month: string;
  monthPt: string;
  difficulty: 1 | 2 | 3;
  description: string;
  descriptionPt: string;
  available: boolean;
  sections: [ReadingWritingSection, ListeningSection, SpeakingSection];
  totalPoints: number;
  passingScore: number;
}

// ═══════════════════════════════════════════════════
// Exam 1: "Primeiro Passo" (First Step) — March 2026
// ═══════════════════════════════════════════════════

const exam01: MockExam = {
  id: "exam-01",
  title: "Mock Exam 1 — First Step",
  titlePt: "Exame Simulado 1 — Primeiro Passo",
  month: "March 2026",
  monthPt: "Março 2026",
  difficulty: 1,
  description:
    "Everyday basics — introducing yourself, ordering at a café, reading simple signs, understanding basic directions.",
  descriptionPt:
    "O essencial do dia a dia — apresentar-se, pedir num café, ler avisos simples, perceber direções básicas.",
  available: true,
  totalPoints: 210,
  passingScore: 55,
  sections: [
    // ──────────────────────────────────────────────
    // Section 1: Reading & Writing (45% — 75 min)
    // ──────────────────────────────────────────────
    {
      id: "s1-reading-writing",
      type: "reading-writing",
      title: "Compreensão da Leitura e Produção e Interação Escritas",
      titleEn: "Reading Comprehension & Written Production",
      weight: 0.45,
      timeMinutes: 75,
      parts: {
        reading: [
          // Q1: Shop notice
          {
            id: "rw-q1",
            type: "multiple-choice",
            instruction: "Leia o texto e escolha a resposta correta.",
            instructionEn: "Read the text and choose the correct answer.",
            stimulus:
              "FECHADO AO DOMINGO E FERIADOS. Horário: Segunda a Sábado, 9h00–18h00",
            stimulusContext: "Aviso na porta de uma loja",
            question: "Quando é que a loja está fechada?",
            questionEn: "When is the shop closed?",
            options: [
              "Ao sábado",
              "Ao domingo e feriados",
              "À segunda-feira",
              "Todos os dias",
            ],
            correctIndex: 1,
            explanation:
              "O aviso diz claramente 'Fechado ao domingo e feriados'. A loja está aberta de segunda a sábado.",
            explanationEn:
              "The notice clearly says 'Closed on Sundays and holidays'. The shop is open Monday to Saturday.",
            points: 10,
          },
          // Q2: No smoking notice
          {
            id: "rw-q2",
            type: "multiple-choice",
            instruction: "Leia o texto e escolha a resposta correta.",
            instructionEn: "Read the text and choose the correct answer.",
            stimulus:
              "PROIBIDO FUMAR. Obrigado pela compreensão. — A Gerência",
            stimulusContext: "Aviso num restaurante",
            question: "O que é que este aviso significa?",
            questionEn: "What does this notice mean?",
            options: [
              "É permitido fumar na esplanada",
              "Não se pode fumar neste local",
              "Só se pode fumar depois das refeições",
              "Fumar é permitido com autorização",
            ],
            correctIndex: 1,
            explanation:
              "'Proibido fumar' significa que não é permitido fumar. 'A Gerência' refere-se à administração do restaurante.",
            explanationEn:
              "'Proibido fumar' means smoking is not allowed. 'A Gerência' refers to the restaurant management.",
            points: 10,
          },
          // Q3: Winter sales
          {
            id: "rw-q3",
            type: "multiple-choice",
            instruction: "Leia o texto e escolha a resposta correta.",
            instructionEn: "Read the text and choose the correct answer.",
            stimulus:
              "Saldos de inverno! Até 50% de desconto em roupa e calçado. Só até dia 28 de fevereiro.",
            stimulusContext: "Cartaz numa montra",
            question: "O que é que esta loja está a oferecer?",
            questionEn: "What is this shop offering?",
            options: [
              "Roupa nova de verão",
              "Descontos em roupa e sapatos",
              "Produtos grátis",
              "Um concurso com prémios",
            ],
            correctIndex: 1,
            explanation:
              "'Saldos' significa promoções/descontos. 'Calçado' é outra palavra para sapatos. O desconto pode chegar a 50%.",
            explanationEn:
              "'Saldos' means sales/discounts. 'Calçado' is another word for shoes. The discount can reach 50%.",
            points: 10,
          },
          // Q4: Restaurant menu
          {
            id: "rw-q4",
            type: "multiple-choice",
            instruction: "Leia o texto e escolha a resposta correta.",
            instructionEn: "Read the text and choose the correct answer.",
            stimulus:
              "EMENTA DO DIA — Sopa: Caldo verde €3,50 | Prato do dia: Bacalhau à Brás com salada €8,90 | Sobremesa: Pudim flan €3,00 | Café: €0,70 | Menu completo (sopa + prato + sobremesa + café): €13,50",
            stimulusContext: "Ementa num restaurante",
            question: "Quanto custa o menu completo?",
            questionEn: "How much does the full menu cost?",
            options: ["€8,90", "€13,50", "€16,10", "€3,50"],
            correctIndex: 1,
            explanation:
              "O menu completo inclui sopa, prato, sobremesa e café por €13,50. Se comprasse tudo separado, custaria €16,10.",
            explanationEn:
              "The full menu includes soup, main course, dessert and coffee for €13.50. Bought separately it would cost €16.10.",
            points: 10,
          },
          // Q5: Matching — Signs to locations
          {
            id: "rw-q5",
            type: "matching",
            instruction:
              "Associe os avisos aos locais onde os pode encontrar.",
            instructionEn:
              "Match the notices to where you'd find them.",
            pairs: [
              {
                left: "Saída de emergência",
                right: "Num edifício público",
              },
              {
                left: "Cuidado, piso molhado",
                right: "Num supermercado",
              },
              {
                left: "Não pisar a relva",
                right: "Num jardim público",
              },
              { left: "Ocupado / Livre", right: "Na casa de banho" },
              {
                left: "É favor não incomodar",
                right: "Num hotel",
              },
            ],
            points: 10,
          },
          // Q6: Text message
          {
            id: "rw-q6",
            type: "multiple-choice",
            instruction: "Leia o texto e escolha a resposta correta.",
            instructionEn: "Read the text and choose the correct answer.",
            stimulus:
              "Olá Ana! Chego a Lisboa amanhã às 14h. Podes ir buscar-me ao aeroporto? Se não puderes, apanho o metro. Até amanhã! Beijinhos, Sofia",
            stimulusContext: "Mensagem de telemóvel",
            question: "O que é que a Sofia pede à Ana?",
            questionEn: "What does Sofia ask Ana?",
            options: [
              "Para lhe telefonar amanhã",
              "Para ir buscá-la ao aeroporto",
              "Para reservar um hotel",
              "Para comprar bilhetes de metro",
            ],
            correctIndex: 1,
            explanation:
              "A Sofia pergunta 'Podes ir buscar-me ao aeroporto?' — ela pede boleia. Se a Ana não puder, a Sofia apanha o metro como alternativa.",
            explanationEn:
              "Sofia asks 'Can you pick me up at the airport?' — she's asking for a ride. If Ana can't, Sofia will take the metro instead.",
            points: 10,
          },
        ],
        writing: [
          // Writing Task 1: Postcard
          {
            id: "rw-w1",
            type: "writing",
            instruction: "Escreva um texto seguindo as indicações.",
            instructionEn: "Write a text following the instructions.",
            scenario:
              "Está de férias em Lisboa. Escreva um postal a um amigo / uma amiga.",
            scenarioEn:
              "You're on holiday in Lisbon. Write a postcard to a friend.",
            minWords: 30,
            maxWords: 60,
            hints: [
              "Diga onde está e com quem",
              "Fale do tempo",
              "Diga o que já fez ou vai fazer",
              "Despeça-se",
            ],
            hintsEn: [
              "Say where you are and who with",
              "Mention the weather",
              "Say what you've done or will do",
              "Say goodbye",
            ],
            sampleResponse:
              "Olá Pedro! Estou em Lisboa com a minha família. O tempo está ótimo, muito sol e calor. Ontem visitámos o Castelo de São Jorge e comemos pastéis de nata deliciosos! Amanhã vamos à praia. Está a ser muito divertido. Um abraço grande, Maria",
            sampleResponseEn:
              "Hi Pedro! I'm in Lisbon with my family. The weather is great, very sunny and warm. Yesterday we visited São Jorge Castle and ate delicious pastéis de nata! Tomorrow we're going to the beach. It's been a lot of fun. A big hug, Maria",
            keyPhrases: [
              "Lisboa",
              "estou",
              "tempo",
              "abraço|beijinhos|até|adeus",
            ],
            points: 20,
          },
          // Writing Task 2: Email to school
          {
            id: "rw-w2",
            type: "writing",
            instruction: "Escreva um texto seguindo as indicações.",
            instructionEn: "Write a text following the instructions.",
            scenario:
              "Quer inscrever-se num curso de português. Escreva um email para a escola a pedir informações.",
            scenarioEn:
              "You want to enrol in a Portuguese course. Write an email to the school asking for information.",
            minWords: 30,
            maxWords: 80,
            hints: [
              "Apresente-se brevemente",
              "Diga que curso lhe interessa",
              "Pergunte sobre o horário e o preço",
              "Agradeça e despeça-se",
            ],
            hintsEn: [
              "Briefly introduce yourself",
              "Say which course interests you",
              "Ask about schedule and price",
              "Thank them and say goodbye",
            ],
            sampleResponse:
              "Bom dia, O meu nome é Thomas e sou inglês. Estou interessado no curso de português para estrangeiros, nível A2. Gostaria de saber o horário das aulas e o preço do curso. Também queria saber quando é que o próximo curso começa. Agradeço a atenção e fico a aguardar a sua resposta. Com os melhores cumprimentos, Thomas",
            sampleResponseEn:
              "Good morning, My name is Thomas and I'm English. I'm interested in the Portuguese for foreigners course, level A2. I'd like to know the class schedule and the course price. I'd also like to know when the next course starts. Thank you for your attention and I look forward to your reply. Best regards, Thomas",
            keyPhrases: [
              "bom dia|boa tarde",
              "nome|chamo",
              "curso|português",
              "horário|horas|quando",
              "preço|custo|quanto",
              "obrigado|agradeço|cumprimentos",
            ],
            points: 20,
          },
        ],
      },
    },
    // ──────────────────────────────────────────────
    // Section 2: Listening (30% — 30 min)
    // ──────────────────────────────────────────────
    {
      id: "s2-listening",
      type: "listening",
      title: "Compreensão do Oral",
      titleEn: "Oral Comprehension",
      weight: 0.3,
      timeMinutes: 30,
      questions: [
        // Q1: Personal introduction
        {
          id: "li-q1",
          type: "listening",
          instruction: "Oiça o áudio e escolha a resposta correta.",
          instructionEn: "Listen to the audio and choose the correct answer.",
          audioText:
            "Olá, o meu nome é Miguel. Tenho trinta e dois anos e sou de Coimbra. Trabalho como professor de matemática numa escola secundária.",
          audioSpeed: "slow",
          playLimit: 2,
          question: "Qual é a profissão do Miguel?",
          questionEn: "What is Miguel's profession?",
          options: ["Médico", "Professor", "Engenheiro", "Estudante"],
          correctIndex: 1,
          explanation:
            "O Miguel diz 'Trabalho como professor de matemática', portanto a sua profissão é professor.",
          explanationEn:
            "Miguel says 'I work as a maths teacher', so his profession is teacher.",
          points: 7,
        },
        // Q2: At a café
        {
          id: "li-q2",
          type: "listening",
          instruction: "Oiça o áudio e escolha a resposta correta.",
          instructionEn: "Listen to the audio and choose the correct answer.",
          audioText:
            "Boa tarde. Queria um café e um pastel de nata, se faz favor. E a minha amiga quer um chá verde e uma torrada.",
          audioSpeed: "slow",
          playLimit: 2,
          question: "O que é que a amiga quer?",
          questionEn: "What does the friend want?",
          options: [
            "Um café e um pastel de nata",
            "Um chá verde e uma torrada",
            "Dois cafés",
            "Um sumo e um bolo",
          ],
          correctIndex: 1,
          explanation:
            "O áudio diz 'a minha amiga quer um chá verde e uma torrada'. O café e o pastel de nata são para a pessoa que fala.",
          explanationEn:
            "The audio says 'my friend wants a green tea and a toast'. The coffee and pastel de nata are for the speaker.",
          points: 7,
        },
        // Q3: Asking for directions
        {
          id: "li-q3",
          type: "listening",
          instruction: "Oiça o áudio e escolha a resposta correta.",
          instructionEn: "Listen to the audio and choose the correct answer.",
          audioText:
            "Desculpe, sabe onde fica a estação de comboios? Fica no fim desta rua, depois vire à esquerda. É logo ali, não pode errar.",
          audioSpeed: "slow",
          playLimit: 2,
          question: "Para onde é que a pessoa quer ir?",
          questionEn: "Where does the person want to go?",
          options: [
            "Ao aeroporto",
            "À estação de comboios",
            "Ao hospital",
            "Ao centro comercial",
          ],
          correctIndex: 1,
          explanation:
            "A pessoa pergunta 'sabe onde fica a estação de comboios?' — quer ir à estação de comboios.",
          explanationEn:
            "The person asks 'do you know where the train station is?' — they want to go to the train station.",
          points: 7,
        },
        // Q4: Weather
        {
          id: "li-q4",
          type: "listening",
          instruction: "Oiça o áudio e escolha a resposta correta.",
          instructionEn: "Listen to the audio and choose the correct answer.",
          audioText:
            "A previsão para amanhã é de chuva durante a manhã, mas à tarde o tempo vai melhorar. As temperaturas vão estar entre os quinze e os vinte graus.",
          audioSpeed: "slow",
          playLimit: 2,
          question: "Como vai estar o tempo de manhã?",
          questionEn: "What will the weather be like in the morning?",
          options: ["Sol", "Chuva", "Neve", "Nevoeiro"],
          correctIndex: 1,
          explanation:
            "A previsão diz 'chuva durante a manhã'. À tarde o tempo melhora.",
          explanationEn:
            "The forecast says 'rain during the morning'. In the afternoon the weather improves.",
          points: 7,
        },
        // Q5: Phone message
        {
          id: "li-q5",
          type: "listening",
          instruction: "Oiça o áudio e escolha a resposta correta.",
          instructionEn: "Listen to the audio and choose the correct answer.",
          audioText:
            "Olá Joana, fala o Rui. Estou a ligar para confirmar o jantar de sexta-feira. Somos cinco pessoas, reservei mesa para as oito e meia no restaurante da Baixa. Liga-me quando ouvires esta mensagem.",
          audioSpeed: "slow",
          playLimit: 2,
          question: "Para quantas pessoas é a reserva?",
          questionEn: "How many people is the reservation for?",
          options: ["Três", "Quatro", "Cinco", "Seis"],
          correctIndex: 2,
          explanation:
            "O Rui diz 'Somos cinco pessoas' e reservou mesa para cinco.",
          explanationEn:
            "Rui says 'We are five people' and reserved a table for five.",
          points: 8,
        },
        // Q6: At a shop
        {
          id: "li-q6",
          type: "listening",
          instruction: "Oiça o áudio e escolha a resposta correta.",
          instructionEn: "Listen to the audio and choose the correct answer.",
          audioText:
            "Esta camisola custa trinta e cinco euros, mas hoje temos vinte por cento de desconto. Fica a vinte e oito euros. Quer experimentar?",
          audioSpeed: "slow",
          playLimit: 2,
          question: "Quanto custa a camisola com desconto?",
          questionEn: "How much does the sweater cost with the discount?",
          options: ["€20,00", "€28,00", "€35,00", "€40,00"],
          correctIndex: 1,
          explanation:
            "A camisola original custa €35, mas com 20% de desconto fica a €28.",
          explanationEn:
            "The sweater originally costs €35, but with 20% discount it's €28.",
          points: 8,
        },
        // Q7: At the doctor
        {
          id: "li-q7",
          type: "listening",
          instruction: "Oiça o áudio e escolha a resposta correta.",
          instructionEn: "Listen to the audio and choose the correct answer.",
          audioText:
            "Então, o que é que se passa? Dói-me muito a garganta e tenho febre desde ontem. Também me dói a cabeça. Vou receitar-lhe um medicamento. Tome um comprimido de manhã e outro à noite, depois das refeições.",
          audioSpeed: "slow",
          playLimit: 2,
          question: "Quando é que o paciente deve tomar o medicamento?",
          questionEn: "When should the patient take the medication?",
          options: [
            "Só de manhã",
            "Antes das refeições",
            "De manhã e à noite, depois de comer",
            "Três vezes por dia",
          ],
          correctIndex: 2,
          explanation:
            "O médico diz 'Tome um comprimido de manhã e outro à noite, depois das refeições' — duas vezes por dia, após comer.",
          explanationEn:
            "The doctor says 'Take one pill in the morning and another at night, after meals' — twice a day, after eating.",
          points: 8,
        },
        // Q8: Travel plans
        {
          id: "li-q8",
          type: "listening",
          instruction: "Oiça o áudio e escolha a resposta correta.",
          instructionEn: "Listen to the audio and choose the correct answer.",
          audioText:
            "No próximo fim de semana vou ao Porto com a minha namorada. Vamos de comboio, sai às nove da manhã e chega às onze e meia. Temos hotel reservado perto da Ribeira.",
          audioSpeed: "slow",
          playLimit: 2,
          question: "Como é que eles vão viajar?",
          questionEn: "How will they travel?",
          options: [
            "De carro",
            "De avião",
            "De comboio",
            "De autocarro",
          ],
          correctIndex: 2,
          explanation:
            "O áudio diz 'Vamos de comboio' — eles vão de comboio para o Porto.",
          explanationEn:
            "The audio says 'We're going by train' — they're travelling by train to Porto.",
          points: 8,
        },
      ],
    },
    // ──────────────────────────────────────────────
    // Section 3: Speaking / Oral Production (25% — 15 min)
    // ──────────────────────────────────────────────
    {
      id: "s3-speaking",
      type: "speaking",
      title: "Produção e Interação Orais",
      titleEn: "Oral Production",
      weight: 0.25,
      timeMinutes: 15,
      prompts: [
        // Part 1: Identificação Pessoal — Prompt 1
        {
          id: "sp-p1",
          type: "speaking",
          part: 1,
          instruction: "Identificação Pessoal",
          instructionEn: "Personal Identification",
          prompt:
            "Bom dia! Como se chama? De onde é? Fale-me um pouco sobre si.",
          promptEn:
            "Good morning! What's your name? Where are you from? Tell me a bit about yourself.",
          guidance: [
            "Diga o seu nome",
            "Diga de onde é / a sua nacionalidade",
            "Diga a sua idade",
            "Fale da sua profissão ou estudos",
          ],
          guidanceEn: [
            "Say your name",
            "Say where you're from / nationality",
            "Say your age",
            "Talk about your job or studies",
          ],
          sampleResponse:
            "Bom dia! Chamo-me Sarah e sou inglesa, de Londres. Tenho vinte e oito anos. Trabalho como designer gráfica numa empresa de tecnologia. Estou a aprender português porque o meu namorado é português.",
          sampleResponseEn:
            "Good morning! My name is Sarah and I'm English, from London. I'm twenty-eight years old. I work as a graphic designer at a technology company. I'm learning Portuguese because my boyfriend is Portuguese.",
          keyElements: [
            "chamo|nome",
            "sou|venho",
            "anos|idade",
            "trabalho|estudo|profissão",
          ],
          minWords: 25,
          points: 8,
        },
        // Part 1: Identificação Pessoal — Prompt 2
        {
          id: "sp-p2",
          type: "speaking",
          part: 1,
          instruction: "Identificação Pessoal",
          instructionEn: "Personal Identification",
          prompt:
            "O que gosta de fazer nos tempos livres? Tem algum passatempo?",
          promptEn:
            "What do you like to do in your free time? Do you have any hobbies?",
          guidance: [
            "Mencione 2-3 atividades que gosta de fazer",
            "Diga com que frequência as faz",
            "Explique porque gosta dessas atividades",
          ],
          guidanceEn: [
            "Mention 2-3 activities you enjoy",
            "Say how often you do them",
            "Explain why you enjoy them",
          ],
          sampleResponse:
            "Nos tempos livres gosto muito de cozinhar e de ler. Ao fim de semana costumo experimentar receitas novas, especialmente comida portuguesa. Também gosto de passear ao ar livre, principalmente quando o tempo está bom.",
          sampleResponseEn:
            "In my free time I really like cooking and reading. At the weekend I usually try new recipes, especially Portuguese food. I also like walking outdoors, mainly when the weather is nice.",
          keyElements: [
            "gosto|adoro|prefiro",
            "tempo|livre|semana|fim",
          ],
          minWords: 20,
          points: 8,
        },
        // Part 2: Simulação — Prompt 3
        {
          id: "sp-p3",
          type: "speaking",
          part: 2,
          instruction: "Imagine que está num restaurante em Portugal.",
          instructionEn: "Imagine you're at a restaurant in Portugal.",
          prompt:
            "Boa tarde, bem-vindo! Já sabe o que vai querer?",
          promptEn:
            "Good afternoon, welcome! Do you know what you'd like to order?",
          guidance: [
            "Cumprimente o empregado",
            "Peça uma bebida",
            "Peça comida (entrada e/ou prato principal)",
            "Pergunte algo sobre a ementa se quiser",
          ],
          guidanceEn: [
            "Greet the waiter",
            "Order a drink",
            "Order food (starter and/or main)",
            "Ask something about the menu if you want",
          ],
          sampleResponse:
            "Boa tarde! Queria uma água com gás e o prato do dia, por favor. O que é a sopa de hoje? E também gostaria de uma salada para começar, se faz favor.",
          sampleResponseEn:
            "Good afternoon! I'd like a sparkling water and the dish of the day, please. What's today's soup? And I'd also like a salad to start, please.",
          keyElements: [
            "queria|quero|gostaria",
            "favor|obrigado",
          ],
          minWords: 15,
          points: 9,
        },
        // Part 2: Simulação — Prompt 4
        {
          id: "sp-p4",
          type: "speaking",
          part: 2,
          instruction: "Ainda no restaurante. O empregado traz a conta.",
          instructionEn: "Still at the restaurant. The waiter brings the bill.",
          prompt:
            "Aqui tem a conta. São dezassete euros e cinquenta. Como quer pagar?",
          promptEn:
            "Here's the bill. That's seventeen euros fifty. How would you like to pay?",
          guidance: [
            "Diga como quer pagar (dinheiro/cartão)",
            "Pode pedir um recibo",
            "Agradeça e despeça-se",
          ],
          guidanceEn: [
            "Say how you want to pay (cash/card)",
            "You can ask for a receipt",
            "Thank them and say goodbye",
          ],
          sampleResponse:
            "Posso pagar com cartão? E pode dar-me o recibo, se faz favor? A comida estava deliciosa, muito obrigada! Até à próxima.",
          sampleResponseEn:
            "Can I pay by card? And can you give me the receipt, please? The food was delicious, thank you very much! Until next time.",
          keyElements: [
            "pagar|cartão|dinheiro",
            "obrigado|obrigada",
          ],
          minWords: 10,
          points: 8,
        },
        // Part 3: Conversa sobre um tema — Prompt 5
        {
          id: "sp-p5",
          type: "speaking",
          part: 3,
          instruction: "Conversa sobre um tema",
          instructionEn: "Discussion on a topic",
          prompt:
            "Gosta de viajar? Fale-me de uma viagem que fez ou que gostaria de fazer.",
          promptEn:
            "Do you like travelling? Tell me about a trip you took or would like to take.",
          guidance: [
            "Diga se gosta de viajar",
            "Descreva uma viagem (para onde, com quem, quando)",
            "Diga o que fez / quer fazer nessa viagem",
            "Diga o que mais gostou ou espera gostar",
          ],
          guidanceEn: [
            "Say if you like travelling",
            "Describe a trip (where, with whom, when)",
            "Say what you did / want to do",
            "Say what you enjoyed most or hope to enjoy",
          ],
          sampleResponse:
            "Sim, adoro viajar! No ano passado fui a Lisboa com a minha família. Ficámos lá uma semana. Visitámos o Castelo de São Jorge, a Torre de Belém e o bairro de Alfama. A comida era fantástica, especialmente o bacalhau e os pastéis de nata. Gostei muito e quero voltar.",
          sampleResponseEn:
            "Yes, I love travelling! Last year I went to Lisbon with my family. We stayed there for a week. We visited São Jorge Castle, Belém Tower and the Alfama neighbourhood. The food was fantastic, especially the bacalhau and pastéis de nata. I really enjoyed it and I want to go back.",
          keyElements: [
            "viagem|viajar|fui|ir",
            "gosto|adoro|gostei",
          ],
          minWords: 30,
          points: 9,
        },
        // Part 3: Conversa sobre um tema — Prompt 6
        {
          id: "sp-p6",
          type: "speaking",
          part: 3,
          instruction: "Conversa sobre um tema",
          instructionEn: "Discussion on a topic",
          prompt:
            "O que acha de aprender línguas? Porque é que está a aprender português?",
          promptEn:
            "What do you think about learning languages? Why are you learning Portuguese?",
          guidance: [
            "Dê a sua opinião sobre aprender línguas",
            "Explique porque está a aprender português",
            "Fale das dificuldades ou das coisas que gosta na língua",
            "Diga os seus objetivos",
          ],
          guidanceEn: [
            "Give your opinion on learning languages",
            "Explain why you're learning Portuguese",
            "Talk about difficulties or things you like about the language",
            "State your goals",
          ],
          sampleResponse:
            "Acho que aprender línguas é muito importante. Estou a aprender português porque o meu namorado é português e quero falar com a família dele. No início era difícil, mas agora já consigo entender muitas coisas. A pronúncia ainda é difícil para mim, mas gosto muito da língua. O meu objetivo é fazer o exame CIPLE este ano.",
          sampleResponseEn:
            "I think learning languages is very important. I'm learning Portuguese because my boyfriend is Portuguese and I want to talk to his family. At first it was difficult, but now I can already understand many things. Pronunciation is still difficult for me, but I really like the language. My goal is to take the CIPLE exam this year.",
          keyElements: [
            "português|língua",
            "aprender|estudo|aprendo",
            "porque|razão",
          ],
          minWords: 30,
          points: 8,
        },
      ],
    },
  ],
};

// ═══════════════════════════════════════════════════
// Exams 2-12: Locked placeholders
// ═══════════════════════════════════════════════════

const placeholderSection = (
  id: string
): [ReadingWritingSection, ListeningSection, SpeakingSection] => [
  {
    id: `${id}-s1`,
    type: "reading-writing",
    title: "Compreensão da Leitura e Produção e Interação Escritas",
    titleEn: "Reading Comprehension & Written Production",
    weight: 0.45,
    timeMinutes: 75,
    parts: { reading: [], writing: [] },
  },
  {
    id: `${id}-s2`,
    type: "listening",
    title: "Compreensão do Oral",
    titleEn: "Oral Comprehension",
    weight: 0.3,
    timeMinutes: 30,
    questions: [],
  },
  {
    id: `${id}-s3`,
    type: "speaking",
    title: "Produção e Interação Orais",
    titleEn: "Oral Production",
    weight: 0.25,
    timeMinutes: 15,
    prompts: [],
  },
];

const monthData: {
  month: string;
  monthPt: string;
  difficulty: 1 | 2 | 3;
}[] = [
  { month: "April 2026", monthPt: "Abril 2026", difficulty: 1 },
  { month: "May 2026", monthPt: "Maio 2026", difficulty: 1 },
  { month: "June 2026", monthPt: "Junho 2026", difficulty: 1 },
  { month: "July 2026", monthPt: "Julho 2026", difficulty: 2 },
  { month: "August 2026", monthPt: "Agosto 2026", difficulty: 2 },
  { month: "September 2026", monthPt: "Setembro 2026", difficulty: 2 },
  { month: "October 2026", monthPt: "Outubro 2026", difficulty: 2 },
  { month: "November 2026", monthPt: "Novembro 2026", difficulty: 3 },
  { month: "December 2026", monthPt: "Dezembro 2026", difficulty: 3 },
  { month: "January 2027", monthPt: "Janeiro 2027", difficulty: 3 },
  { month: "February 2027", monthPt: "Fevereiro 2027", difficulty: 3 },
];

const placeholderExams: MockExam[] = monthData.map((m, i) => {
  const num = i + 2;
  const id = `exam-${String(num).padStart(2, "0")}`;
  return {
    id,
    title: `Mock Exam ${num}`,
    titlePt: `Exame Simulado ${num}`,
    month: m.month,
    monthPt: m.monthPt,
    difficulty: m.difficulty,
    description: "Coming soon.",
    descriptionPt: "Em breve.",
    available: false,
    sections: placeholderSection(id),
    totalPoints: 210,
    passingScore: 55,
  };
});

// ═══════════════════════════════════════════════════
// Public API
// ═══════════════════════════════════════════════════

const allExams: MockExam[] = [exam01, ...placeholderExams];

export function getExam(id: string): MockExam | undefined {
  return allExams.find((e) => e.id === id);
}

export function getAllExams(): MockExam[] {
  return allExams;
}

// ═══════════════════════════════════════════════════
// Scoring Utilities
// ═══════════════════════════════════════════════════

/** Strip accents for loose comparison */
function stripAccents(str: string): string {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

/** Check how many key phrases are found in a text (case-insensitive, accent-insensitive) */
export function countKeyPhraseMatches(
  text: string,
  keyPhrases: string[]
): number {
  const normalized = stripAccents(text.toLowerCase());
  return keyPhrases.filter((phrase) => {
    const alternatives = phrase.split("|");
    return alternatives.some((alt) =>
      normalized.includes(stripAccents(alt.toLowerCase()))
    );
  }).length;
}

/** Count words in a text */
export function countWords(text: string): number {
  return text
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0).length;
}

/** Score a writing task or speaking prompt */
export function scoreWrittenResponse(
  text: string,
  minWords: number,
  keyPhrases: string[],
  maxPoints: number
): number {
  const wordCount = countWords(text);
  if (wordCount < minWords) return 0;

  const matched = countKeyPhraseMatches(text, keyPhrases);
  const matchRatio = keyPhrases.length > 0 ? matched / keyPhrases.length : 1;

  if (matchRatio >= 0.8) return maxPoints;
  if (matchRatio >= 0.5) return Math.round(maxPoints * 0.75);
  return Math.round(maxPoints * 0.5);
}

/** Get CIPLE classification from percentage score */
export function getClassification(percentage: number): {
  label: string;
  labelPt: string;
  tier: "muito-bom" | "bom" | "suficiente" | "not-yet";
} {
  if (percentage >= 85)
    return { label: "Muito Bom", labelPt: "Muito Bom", tier: "muito-bom" };
  if (percentage >= 70)
    return { label: "Bom", labelPt: "Bom", tier: "bom" };
  if (percentage >= 55)
    return {
      label: "Suficiente",
      labelPt: "Suficiente",
      tier: "suficiente",
    };
  return { label: "Not yet", labelPt: "Ainda não", tier: "not-yet" };
}
