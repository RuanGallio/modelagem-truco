const fs = require("fs");

// Completa black box, função que faz arranjos de arrays, que função bosta, mas funciona, as vezes, definitivamente achar uma melhor em algum momento
SimpleArrange = function (a, n, m) {
  var o = a;
  if (n >= o.length) return [];
  for (
    var j, l, k, p, f, r, q = (k = 1), i = (l = o.length) + 1, j = l - n;
    --i;
    i <= j ? (q *= i) : (k *= i)
  );
  for (
    x = [new Array(n), new Array(n), new Array(n), new Array(n)],
      j = q = k,
      k = l + 1,
      i = -1;
    ++i < n;
    x[2][i] = i, x[1][i] = x[0][i] = j /= --k
  );
  for (r = new Array(q), p = -1; ++p < q; )
    for (
      r[p] = new Array(n), i = -1;
      ++i < n;
      !--x[1][i] && ((x[1][i] = x[0][i]), (x[2][i] = (x[2][i] + 1) % l)),
        r[p][i] = m ? x[3][i] : o[x[3][i]]
    )
      for (x[3][i] = x[2][i], f = 0; !f; f = !f)
        for (j = i; j; )
          if (x[3][--j] == x[2][i]) {
            x[3][i] = x[2][i] = (x[2][i] + ++f) % l;
            break;
          }
  return r;
};

// Inteiro aleatório, -1 pra caber no range de uma array
function getRandomInt(max) {
  return Math.round(Math.random() * (max - 1));
}

// Tudo que define uma carta
class Carta {
  constructor(valor, naipe, manilha) {
    this.valor = valor;
    this.naipe = naipe;
    this.manilha = manilha;
  }
  Manilhador() {
    if (this.manilha == true) {
      return maximo + this.naipe;
    } else {
      return this.valor;
    }
  }
  get value() {
    return this.Manilhador();
  }
}

// Encontra a carta com valor e naipe igual
function AcharCarta(baralho, carta) {
  return baralho.find(function (obj) {
    return obj.valor == carta.valor && obj.naipe == carta.naipe;
  });
}

// Encontra índice da carta com valor e naipe igual
function AcharIndexCarta(baralho, carta) {
  return baralho.indexOf(AcharCarta(baralho, carta));
}

// Remove a carta pedida
function removeCarta(baralho, carta) {
  baralho.splice(AcharIndexCarta(baralho, carta), 1);
}

// Verificando se é pra ser manilha
function Virou(baralho, vira) {
  for (Cartas of baralho) {
    if (Cartas.value == vira.value + 1) {
      Cartas.manilha = true;
    }
    if (vira.value == maximo && Cartas.value == 1) {
      Cartas.manilha = true;
    }
  }
}

// Isso cria um baralho
function CriarBaralho(baralho, maximo) {
  for (i = 0; i < maximo; i++) {
    for (j = 0; j < 4; j++) {
      baralho.push(new Carta(i + 1, j + 1, false));
    }
  }
}

// Isso faz uma vaza
function Vaza(CartaEu, CartaOp) {
  if (CartaEu.value > CartaOp.value) {
    return 1;
  } else if (CartaEu.value < CartaOp.value) {
    return -1;
  } else if (CartaEu.value == CartaOp.value) {
    return 0;
  }
}

// Define valor máximo e SuperMegaBaralho
// Definindo algumas outras variaveis também, bad practice mas foda-se
var win = 0,
  lose = 0,
  maximo = 10;
SuperMegaBaralho = [];

// Aqui começa a lógica dos loops
// Primeiro cria o Super baralho, onde minhas mãos vão ser tiradas
CriarBaralho(SuperMegaBaralho, maximo);

//Maior loop, deve em teoria fazer todas as 59.280 mãos minhas possíveis, loop 1
for (eu of SimpleArrange(SuperMegaBaralho, 3)) {
  // Pra cada mão possível ele vai resetar as cartas que o vira vai estar loopando, pra tirar a mão atual

  SuperBaralho = [];
  CriarBaralho(SuperBaralho, maximo);
  for (tira of eu) {
    removeCarta(SuperBaralho, tira);
  }

  // Todos os viras possiveis, loop 2
  for (vira of SuperBaralho) {
    //Limpando o baralho do loop anterior e criando um novo

    baralho = [];
    CriarBaralho(baralho, maximo);

    // Alerta o pessoal que tem que ser manilha que eles são manilha
    Virou(baralho, vira);

    // Limpar o tag das minhas cartas serem manilha, e tirar elas do baralho novo
    for (carta of eu) {
      carta.manilha = false;
      removeCarta(baralho, carta);
    }

    // Remove o vira
    removeCarta(baralho, vira);
    Virou(eu, vira);

    // Em teoria não é necessário se eu programei certo (é pra eu ter declarado mais cedo e no fim do loop), mas eu sou paranoico
    win = 0;
    lose = 0;

    // Lógica de jogo, considerei transformar isso numa função, percebi que eu sou burro demais pra isso e vai assim mesmo
    for (const oponente of SimpleArrange(baralho, 3)) {
      // resetando as variaveis entre jogos
      e = 0;
      l = 0;
      w = 0;

      // faz 3 vazas
      for (i = 0; i < 3; i++) {
        // Faz a vaza
        resultado = Vaza(eu[i], oponente[i]);

        //Verifica o resultado das vazas

        // Se ganhei a vaza, marca uma vaza ganha
        if (resultado == 1) {
          w++;
        }

        // Se perdi, marca uma vaza perdida
        if (resultado == -1) {
          l++;
        }

        // Se empatou, marca uma vaza empatada
        if (resultado == 0) {
          e++;
        }
        // Determina vencedor baseado nas vazas
        // Se eu perdi duas, marca um jogo perdido
        if (l == 2) {
          lose++;
          break;
        }

        // Se eu ganhei duas, marca um jogo ganho
        if (w == 2) {
          win++;
          break;
        }

        // Se empatou pelo menos uma vez, e eu perdi, e eu não ganhei nenhuma, marca um jogo perdido
        if (e >= 1 && l == 1 && w == 0) {
          lose++;
          break;
        }

        // Se empatou pelo menos uma vez, e eu ganhei, e não perdi nenhuma, marca um jogo ganho
        if (e >= 1 && w == 1 && l == 0) {
          win++;
          break;
        }

        //Se empatou, eu perdi uma, e eu ganhei uma, verifica quem ganhou a primeira pra marcar ponto
        if (e == 1 && w == 1 && l == 1) {
          if (Vaza(eu[0], oponente[0]) == 1) {
            win++;
            break;
          } else {
            lose++;
            break;
          }
        }

        // Se empatou trẽs vezes, verifica o naipe da última
        if (e == 3) {
          if (oponente[2].naipe > eu[2].naipe) {
            lose++;
            break;
          } else {
            win++;
            break;
          }
        }
      }
    }

    // Printar num file as coisas
    var dados =
      "\n" +
      "[" +
      vira.valor +
      "," +
      vira.naipe +
      "]; [" +
      eu[0].valor +
      "," +
      eu[0].naipe +
      "]; [" +
      eu[1].valor +
      "," +
      eu[1].naipe +
      "]; [" +
      eu[2].valor +
      "," +
      eu[2].naipe +
      "] e a porcentagem de vitória é " +
      (100 * win) / (win + lose) +
      "%";
    fs.appendFileSync("Output.txt", dados, (err) => {
      if (err) throw err;
    });
    // aqui o reset do win/lose :D
    win = 0;
    lose = 0;
  }
}
