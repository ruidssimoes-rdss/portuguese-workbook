#!/usr/bin/env node
/**
 * Adds proTips to vocab words that don't have them.
 * Run: node scripts/boost-pro-tips.js
 */
const fs = require('fs');
const path = require('path');

const vocabPath = path.join(__dirname, '../src/data/vocab.json');
const vocab = JSON.parse(fs.readFileSync(vocabPath, 'utf8'));

// Map: portuguese -> proTip. Only add when genuinely useful.
const proTips = {
  // colours-weather
  "vermelho": "Colour adjectives agree: 'carro vermelho' (m), 'casa vermelha' (f). In Portugal, red wine = vinho tinto.",
  "azul": "Agrees with noun: 'céu azul,' 'camisa azul' (blue is invariable — ends in consonant).",
  "verde": "Portuguese love verde — parks, countryside, 'verde' symbolises nature. 'Pôr a verde' = to criticise severely.",
  "amarelo": "Amarelo (yellow) — the -o/-a agreement: 'sol amarelo,' 'casa amarela.'",
  "branco": "Vinho branco = white wine. 'Em branco' = blank. Branco (white) agrees: branco/branca.",
  "preto": "Café preto = black coffee (no milk). Preto agrees: preto/preta.",
  "castanho": "Castanho = brown. Common for eyes: 'olhos castanhos.' Also chestnut — castanhas in autumn.",
  "cor-de-rosa": "Invariable — doesn't change for gender: 'camisa cor-de-rosa,' 'casaco cor-de-rosa.'",
  "roxo": "Roxo (purple) — 'roxo' can also mean bruised: 'joelho roxo' = bruised knee.",
  "cinzento": "O dia está cinzento = The day is grey. Portuguese use this a lot for cloudy Lisbon weather.",
  "vento": "Portugal's coast is windy — 'Está muito vento' = It's very windy. Norte (north wind) brings cold.",
  "quente": "'Está quente' = It's hot (weather). 'A água está quente' = The water is hot. Quente is invariable.",
  "nuvem": "Feminine: a nuvem, nuvens. 'O céu está cheio de nuvens' = The sky is full of clouds.",
  "neve": "Rare in Lisbon — 'Nunca neva aqui.' In Serra da Estrela they have snow. Feminine.",
  "trovoada": "Trovoada = thunderstorm. 'Há trovoada' = There's a thunderstorm. Summer storms are common.",
  "temperatura": "Ask: 'Qual é a temperatura?' Portugal uses Celsius. 25° = 'vinte e cinco graus.'",
  "previsão do tempo": "Check 'previsão do tempo' on TV or IPMA.pt. Portuguese love talking about weather.",
  "laranja": "Same word for fruit and colour. Invariable: 'camisa laranja,' 'sumo de laranja.'",
  "dourado": "Dourado = golden. 'Luz dourada' = golden light. Common for sunset descriptions.",
  "prateado": "Prateado = silver. Often for cars: 'carro prateado.'",
  "escuro": "Verde escuro = dark green. Escuro agrees: escuro/escura.",
  "claro": "Verde claro = light green. 'Claro' also means 'of course!' — don't confuse.",
  "nevoeiro": "Common in Lisbon mornings, especially near the river. 'Há muito nevoeiro' = There's a lot of fog.",
  "tempestade": "Tempestade = storm. 'Vem aí uma tempestade' = A storm is coming. Stay indoors.",
  "chuvisco": "Chuvisco = drizzle. Portuguese drizzle (brisa) is typical — light rain, no umbrella needed sometimes.",
  "granizo": "Granizo = hail. Rare but happens. 'Caiu granizo' = It hailed.",
  "primavera": "March–June. Best time to visit — flowers, mild weather. 'Na primavera' = in spring.",
  "verão": "June–September. Hot and dry. 'No verão' = in summer. Beach season.",
  "outono": "September–December. 'No outono' = in autumn. Castanhas (chestnuts) and vindima (grape harvest).",
  "inverno": "December–March. 'No inverno' = in winter. Rainy, cold, but rarely freezing in Lisbon.",
  "estação do ano": "As quatro estações = the four seasons. Primavera, verão, outono, inverno.",
  "húmido": "Portugal spells 'húmido' (with h) — Brazil uses 'úmido.' Lisbon's climate is húmido, especially near the river.",
  "está calor": "'Está calor' (impersonal) = It's hot. Don't say 'eu estou calor' — wrong. 'Tenho calor' = I'm hot.",
  "está frio": "'Está frio' = It's cold. 'Tenho frio' = I'm cold (personal). Portuguese homes can feel cold in winter.",
  "está a chover": "Present continuous: estar a + infinitive. 'Está a chover' = It's raining. Very common structure in EP.",
  "o guarda-chuva": "Essential in Lisbon! 'Leva o guarda-chuva' = Take the umbrella. Masculine: o guarda-chuva.",
  "está bom tempo": "'Está bom tempo' = The weather is nice. Perfect for 'Vamos dar um passeio?' (Shall we go for a walk?).",

  // family-daily-routine
  "mãe": "Mãe = mother. 'A minha mãe' — mãe is feminine. In Portugal, family names: mother's surname often comes last.",
  "pai": "Pai = father. Portuguese fathers traditionally had authority; modern families are more equal.",
  "pais": "Pais = parents (plural of pai in this sense). 'Os meus pais' = my parents. Don't confuse with país (country).",
  "filho / filha": "Filho/filha = son/daughter. 'Tenho um filho' = I have a son. Used for children of any age.",
  "irmão / irmã": "Irmão/irmã = brother/sister. 'Meus irmãos' can mean brothers or siblings (mixed).",
  "tio / tia": "Tio/tia = uncle/aunt. Portuguese families are often close — 'almoço de família' on Sundays.",
  "primo / prima": "Primo/prima = cousin. 'Primos em segundo grau' = second cousins.",
  "marido": "Marido = husband. 'O meu marido' — common in all contexts.",
  "namorado / namorada": "Namorado/namorada = boyfriend/girlfriend. More serious than 'amigo' — implies romantic relationship.",
  "amigo / amiga": "Amigo/amiga = friend. Portuguese value friendship deeply. 'Os meus amigos' = my friends.",
  "acordar": "Acordar = to wake up. 'Acordo às sete' = I wake up at seven. Reflexive optional in EP.",
  "levantar-se": "Levantar-se = to get up. 'Levanto-me cedo' = I get up early. The 'me' is the reflexive pronoun.",
  "tomar banho": "Tomar banho = to have a shower/bath. Never 'tomar uma ducha' (Brazilian). 'Tomei banho' = I showered.",
  "vestir-se": "Vestir-se = to get dressed. 'Visto-me depressa' = I get dressed quickly.",
  "sair de casa": "Sair de casa = to leave the house. 'Saio de casa às oito' = I leave at eight.",
  "trabalhar": "Trabalhar = to work. 'Trabalho em casa' = I work from home. Portuguese work long hours by EU standards.",
  "descansar": "Descansar = to rest. 'Preciso de descansar' = I need to rest. Sunday is often family rest day.",
  "dormir": "Dormir = to sleep. Irregular: durmo, dormes, dorme. 'Durmo oito horas' = I sleep eight hours.",
  "deitar-se": "Deitar-se = to go to bed. 'Deito-me à meia-noite' = I go to bed at midnight.",
  "limpar": "Limpar = to clean. 'Limpar a casa' = to clean the house. Saturday morning is often limpeza day.",
  "lavar": "Lavar = to wash. 'Lavar a loiça' = wash the dishes. 'Lavar a roupa' = do the laundry.",
  "arrumar": "Arrumar = to tidy. 'Arruma o teu quarto!' = Tidy your room! (parent to child).",
  "pentear-se": "Pentear-se = to comb one's hair. 'Penteio-me' = I comb my hair.",
  "barbear-se": "Barbear-se = to shave. 'Barbeio-me' = I shave. Or use 'fazer a barba.'",
  "fazer a cama": "Fazer a cama = to make the bed. 'Faço a cama todos os dias' = I make the bed every day.",
  "pôr a mesa": "Pôr a mesa = to set the table. 'Põe a mesa para o jantar' = Set the table for dinner.",
  "levantar a mesa": "Levantar a mesa = to clear the table. Often followed by 'lavar a loiça.'",
  "passar a ferro": "Passar a ferro = to iron. 'Passar a ferro a roupa' — Portuguese often iron everything, even jeans.",
  "tenho sono": "Tenho sono = I'm sleepy. Different from 'estou cansado' (tired). 'Tenho' + noun for states.",
  "o fim de semana": "Fim de semana = weekend. 'O que vais fazer no fim de semana?' — common Friday question.",
  "o feriado": "Feriado = public holiday. Portugal has ~13. Shops may be closed. 'É feriado amanhã.'",
  "dia a dia": "Dia a dia = day to day, daily. 'Vivo dia a dia' = I live day to day.",
  "enteado / enteada": "Enteado/enteada = stepson/stepdaughter. Blended families use this. 'O meu enteado' = my stepson.",

  // health-body
  "cabeça": "Cabeça = head. Feminine: a cabeça. 'Dói-me a cabeça' = My head hurts (lit. It hurts me the head).",
  "olho / olhos": "Olho (eye) → olhos (eyes). Irregular plural! 'Tenho os olhos castanhos' = I have brown eyes.",
  "nariz": "Nariz = nose. One nose, same form. 'O nariz está entupido' = My nose is blocked.",
  "boca": "Boca = mouth. Feminine. 'Abre a boca' = Open your mouth (doctor/dentist).",
  "orelha": "Orelha = ear. 'Dói-me a orelha' = My ear hurts. Orelha can also mean ear (of corn).",
  "dente": "Dente → dentes (tooth/teeth). 'Dor de dentes' = toothache. Dentista = dentist.",
  "cabelo": "Cabelo = hair (as a whole). Usually singular: 'o cabelo.' 'O cabelo está molhado.'",
  "mão / mãos": "Mão (hand) → mãos (hands). Irregular! The only -ão word that becomes -ãos.",
  "braço": "Braço → braços. 'Parti o braço' = I broke my arm. Braço = arm; abraço = hug.",
  "perna": "Perna = leg. 'Dói-me a perna' = My leg hurts. Feminine.",
  "pé / pés": "Pé (foot) → pés (feet). Irregular! 'Os pés estão frios' = My feet are cold.",
  "costas": "Costas = back. Always plural! 'Tenho dores nas costas' = I have back pain.",
  "barriga": "Barriga = belly/stomach. Informal. 'Dói-me a barriga' = My stomach hurts. Estômago is more formal.",
  "dedo": "Dedo = finger or toe. 'Dedo do pé' = toe. 'Dedo da mão' = finger. Same word for both.",
  "dor": "Dor = pain. Feminine: 'tenho muita dor.' 'Dói-me' = it hurts me — use with body parts.",
  "dor de cabeça": "Dor de cabeça = headache. 'Tenho uma dor de cabeça forte' = I have a bad headache.",
  "febre": "Febre = fever. 'Tenho febre' = I have a fever. Go to farmácia first — they can advise.",
  "gripe": "Gripe = flu. 'Apanhei uma gripe' = I caught the flu. Vaccination: 'vacina da gripe.'",
  "tosse": "Tosse = cough. 'Tenho tosse' = I have a cough. Feminine.",
  "comprimido": "Comprimido = pill/tablet. 'Tomar um comprimido' = to take a pill. De manhã/à noite = morning/evening.",
  "doente": "Doente = sick/ill. 'Estou doente' = I'm sick. Can also mean 'patient' (o doente).",
  "saudável": "Saudável = healthy. 'Vida saudável' = healthy lifestyle. Comida saudável = healthy food.",
  "cansado / cansada": "Cansado/cansada = tired. Agrees with speaker: men say cansado, women cansada.",
  "dói": "'Dói-me' = it hurts me. 'Dói-me a cabeça' = I have a headache. The 'me' is the indirect object.",
  "melhorar": "Melhorar = to get better. 'Espero que melhores em breve' = I hope you get better soon.",
  "urgências": "Urgências = A&E / ER. 'Fui às urgências' = I went to A&E. For emergencies, go to hospital.",
  "penso": "Penso = plaster/band-aid. 'Penso rápido' = sticking plaster. At the farmácia.",
  "estou doente": "'Estou doente' = I'm sick. Common excuse: 'Não vou trabalhar, estou doente.'",
  "tenho febre": "'Tenho febre' = I have a fever. Thermometer = termómetro. 38°+ is febre.",

  // nature-animals
  "flor": "Flor = flower. Feminine. 'As flores estão bonitas' = The flowers are beautiful. Portugal has stunning wildflowers.",
  "árvore": "Árvore = tree. Feminine. 'Sob a árvore' = under the tree. Portuguese love their olive trees (oliveiras).",
  "mar": "Mar = sea. Masculine: o mar. 'Vou ao mar' = I'm going to the sea. Portugal = 800+ km of coast.",
  "rio": "Rio = river. Tejo, Douro, Mondego — Portugal's main rivers. 'À beira-rio' = by the river.",
  "montanha": "Montanha = mountain. Serra da Estrela is the highest. 'Fazer uma caminhada na montanha.'",
  "campo": "Campo = countryside/field. 'Viver no campo' = to live in the countryside. Alentejo = vast campos.",
  "cão": "Cão → cães (dog/dogs). Irregular plural! Very common pet. 'O cão' = the dog.",
  "gato": "Gato = cat. Gato/gatos. 'O gato está a dormir' = The cat is sleeping. Popular pets.",
  "pássaro": "Pássaro = bird. Portugal has diverse birdlife. 'Ouço os pássaros' = I hear the birds.",
  "peixe": "Peixe = fish. Same singular/plural in some contexts. Portugal eats a lot of peixe — coastal nation.",
  "animal": "Animal → animais. Irregular plural! 'Os animais' = the animals. Zoo = jardim zoológico.",

  // numbers-time (additional)
  "sábado": "Sábado = Saturday. Masculine. 'Ao sábado' = on Saturday. Weekend starts here!",
  "domingo": "Domingo = Sunday. Traditional family day — almoço with parents/grandparents.",
  "meio-dia": "Meio-dia = noon. 'O almoço é ao meio-dia' — Portuguese lunch is often 12:30–2pm.",
  "meia-noite": "Meia-noite = midnight. 'À meia-noite' = at midnight. Feminine.",
  "feriado": "Feriado = public holiday. Shops closed, families together. 'Amanhã é feriado.'",
  "cedo": "Cedo = early. 'Acordei cedo' = I woke up early. Opposite of tarde (late).",
  "tarde": "Tarde = afternoon (noun) OR late (adverb). 'Cheguei tarde' = I arrived late. Context matters!",
  "sempre": "Sempre = always. 'Sempre' before the verb: 'Ela sempre chega tarde' = She always arrives late.",
  "nunca": "Nunca = never. 'Nunca' before verb. Double negative OK: 'Não... nunca' = never.",
  "às vezes": "Às vezes = sometimes. 'Às vezes como fora' = Sometimes I eat out. Note the 'às' (contraction).",

  // home-rooms
  "sala": "Sala = living room. 'Sala de estar' = sitting room. Central to Portuguese homes — where guests sit.",
  "varanda": "Varanda = balcony. Many Lisbon flats have one. 'Tomar café na varanda' = have coffee on the balcony.",
  "escadas": "Escadas = stairs. Feminine plural. 'Moro no 3º andar' = I live on 3rd floor — no elevator in old buildings.",
  "porta": "Porta = door. 'Bater à porta' = to knock on the door. 'Porta aberta' = open door (welcoming).",
  "janela": "Janela = window. 'Abrir a janela' = open the window. Portuguese love fresh air.",
  "fogão": "Fogão = stove. Many Portuguese cook on gas (gás). 'Cuidado com o fogão' = careful with the stove.",
  "micro-ondas": "Micro-ondas = microwave. 'Aquecer no micro-ondas' = heat in the microwave.",
  "duche": "Duche = shower. 'Tomar um duche' = to have a shower. Most Portuguese bathrooms have duche, not banheira.",
  "despertador": "Despertador = alarm clock. 'O despertador toca às sete' = The alarm goes off at seven.",
  "candeeiro": "Candeeiro = lamp. 'Acender o candeeiro' = turn on the lamp. Portuguese use candeeiros, not just ceiling lights.",
  "vizinhança": "Vizinhança = neighbourhood. Portuguese often know their neighbours — community matters.",
  "o andar": "Andar = floor/storey. 'Moro no 3º andar' = I live on the 3rd floor. Ground = rés-do-chão.",

  // work-education
  "professor / professora": "Professor/professora = teacher. University teachers are also 'professor.' Very respected profession.",
  "empresa": "Empresa = company. 'Trabalhar numa empresa' = to work for a company. PME = small/medium enterprise.",
  "reunião": "Reunião = meeting. 'Tenho uma reunião' = I have a meeting. Often long in Portugal!",
  "computador": "Computador = computer. 'Portátil' = laptop. Portuguese workplaces are increasingly digital.",
  "email": "Email = email. Pronounced 'ee-MAYL.' 'Enviei-te um email' = I sent you an email.",
  "colega": "Colega = colleague. Same for m/f! 'Os meus colegas' = my colleagues. Important in work culture.",
  "chefe": "Chefe = boss. Same for m/f. 'O meu chefe' or 'A minha chefe.' Formal hierarchy in many companies.",
  "escola": "Escola = school. Kids 6–18. 'Ir à escola' = to go to school. Public (estatal) or private (privada).",
  "universidade": "Universidade = university. Free for EU citizens in public unis. Lisbon, Porto, Coimbra are top.",
  "aula": "Aula = class/lesson. 'A aula de português' = the Portuguese class. 'Ter aulas' = to have classes.",
  "exame": "Exame = exam. 'Fazer um exame' = to sit an exam. 'Boa sorte no exame!'",
  "aluno / aluna": "Aluno/aluna = student. 'Sou aluno de português' = I'm a Portuguese student.",
  "livro": "Livro = book. 'Ler um livro' = to read a book. Livraria = bookshop (different from biblioteca).",
  "caderno": "Caderno = notebook. Students use cadernos. 'Escrever no caderno' = to write in the notebook.",
  "caneta": "Caneta = pen. 'Tens uma caneta?' = Do you have a pen? Caneta de feltro = marker.",
  "biblioteca": "Biblioteca = library. Free to use. 'Estudar na biblioteca' = to study at the library.",
  "curso": "Curso = course. 'Fiz um curso de português' = I did a Portuguese course. Curso intensivo = intensive.",
  "o patrão / a patroa": "Patrão/patroa = boss (informal). More colloquial than chefe. 'O patrão não gostou.'",
  "a folga": "Folga = day off. 'Tenho folga amanhã' = I have the day off tomorrow. 'Dia de folga.'",
  "a reforma": "Reforma = retirement. 'Estar na reforma' = to be retired. Portuguese retire around 66.",

  // shopping-money
  "dinheiro": "Dinheiro = money. 'Trocar dinheiro' = exchange money. Portugal uses euros (euros).",
  "euro": "Euro = euro. Same singular/plural in Portuguese! 'Custa dez euros.' Portugal has used euros since 2002.",
  "preço": "Preço = price. 'Qual é o preço?' = What's the price? 'Preço fixo' = fixed price.",
  "barato": "Barato = cheap. 'É barato' = It's cheap. Supermercados have 'preços baixos' (low prices).",
  "caro": "Caro = expensive. 'Lisboa está cara' = Lisbon is expensive. Renda (rent) is often 'cara.'",
  "loja": "Loja = shop. 'Loja de roupa' = clothes shop. Shops close 7–8pm, some close for lunch.",
  "supermercado": "Supermercado = supermarket. Pingo Doce, Continente, Lidl are main chains. 'Fazer compras.'",
  "multibanco": "Multibanco = Portuguese ATM network. Does MORE than cash — pay bills, top up phone, buy train tickets!",
  "factura": "Factura = invoice/receipt. 'Quer factura?' = Do you want a receipt? Always ask for 'factura com NIF' for tax.",
  "iva": "IVA = VAT. 23% standard rate in Portugal. 'Preço com IVA' = price including VAT. Often included in prices.",
  "desconto": "Desconto = discount. 'Há desconto?' = Is there a discount? 'Saldos' = sales (January, July).",

  // colloquial-slang
  "giro": "Giro = cute/cool. 'Que giro!' = How cute! Very Portuguese. Can describe people or things.",
  "porreiro": "Porreiro = cool/great. Slightly older slang. 'Está porreiro' = It's great. Lisbon/Porto usage.",
  "bora": "Bora = let's go. From 'vamos embora.' 'Bora!' = Let's go! Very informal, young people.",
  "tá": "Tá = contraction of 'está.' 'Tá bem' = Okay. 'Tá bom' = That's fine. Very informal writing/speech.",
  "não sei": "'Não sei' = I don't know. Often said with shrug. 'Sei lá' = I've no idea (more casual).",
  "se calhar": "Se calhar = maybe/perhaps. 'Se calhar vou' = Maybe I'll go. Very common in spoken EP.",
  "epá": "Epá = hey/man/dude. Filler word. 'Epá, não acredito!' = Man, I can't believe it! Very Portuguese.",
  "óptimo": "Óptimo = great/excellent. 'Óptimo!' = Great! Portugal spells with 'ó' and 'p' (ótimo in Brazil).",
  "vale": "Vale = okay/sure. 'Vale' = Okay, deal. 'Vale a pena' = It's worth it. Very useful.",
  "tranquilo": "Tranquilo = cool/no problem. 'Está tranquilo' = It's all good. Laid-back response.",
  "cena": "Cena = thing/stuff. 'Essa cena' = that thing. 'Que cena!' = What a thing! Very informal.",
  "gajo": "Gajo = guy/bloke. 'O gajo' = the guy. Informal, can be slightly derogatory. 'A gaja' = the girl.",
  "miúdo": "Miúdo = kid. 'Os miúdos' = the kids. 'Quando era miúdo' = when I was a kid. Very common.",
  "bocadinho": "Bocadinho = a little bit. 'Um bocadinho' = a little. 'Espera um bocadinho' = Wait a little.",

  // emotions-personality
  "feliz": "Feliz = happy. 'Estou feliz' = I'm happy. Feliz aniversário! = Happy birthday!",
  "triste": "Triste = sad. 'Estou triste' = I'm sad. Fado is música triste — saudade in song form.",
  "com medo": "Com medo = afraid. 'Tenho medo' = I'm afraid. 'Medo de' = afraid of.",
  "nervoso": "Nervoso = nervous. 'Estou nervoso' = I'm nervous. Agrees: nervoso/nervosa.",
  "calmo": "Calmo = calm. 'Fica calmo' = Stay calm. Portuguese value being calmo.",
  "simpático": "Simpático = nice/friendly. Essential word! 'Ele é muito simpático' = He's very nice.",
  "aborrecido": "Aborrecido = bored. 'Estou aborrecido' = I'm bored. Can also mean annoying (something aborrecido).",
  "preocupado": "Preocupado = worried. 'Estou preocupado' = I'm worried. Common state!",
  "surpreso": "Surpreso = surprised. 'Fiquei surpreso' = I was surprised. Surpreso/surpresa.",
  "zangado": "Zangado = angry. 'Estou zangado' = I'm angry. Menos forte que 'furioso.'",
  "alegre": "Alegre = cheerful/happy. 'Uma pessoa alegre' = a cheerful person. Alegre vs feliz — alegre is more outgoing.",
  "cansado": "Already in health",
  "amor": "Amor = love. 'Amor' as address = honey/darling. 'O meu amor' = my love. Central to Portuguese expression.",
  "ódio": "Ódio = hatred. 'Tenho ódio a' = I hate. Strong word. 'Detestar' is milder.",
  "saudade": "Already has",
};

let added = 0;
for (const cat of vocab.categories) {
  for (const w of cat.words) {
    const tip = proTips[w.portuguese];
    if (tip && !w.proTip) {
      w.proTip = tip;
      added++;
    }
  }
}

fs.writeFileSync(vocabPath, JSON.stringify(vocab, null, 2) + '\n', 'utf8');
console.log(`Added ${added} proTips.`);
