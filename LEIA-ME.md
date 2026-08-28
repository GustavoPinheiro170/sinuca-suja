# Sinuca Suja

Sinuca 3D num bar caindo aos pedaços. Qualquer objeto do cenário vira taco, o jogo
descobre sozinho qual extremidade dele é a ponta, e os dois lados jogam tralha na mesa.

## O que foi usado

| | |
|---|---|
| **React 18** | só o HUD (placar, cartões, barra de força). Sem JSX — chamadas diretas a `React.createElement`, apelidado de `h` |
| **Three.js r128** | render 3D, build UMD clássica |
| **Nada mais** | sem engine de jogo, sem bundler, sem npm, sem passo de build |

Não há framework de jogo. Física, geometria, modelos 3D, texturas, animação dos
personagens e a IA do adversário são código próprio. As texturas são **desenhadas em
tempo de execução** com Canvas 2D — não existe um único arquivo de imagem no projeto.

Abrir o `index.html` no navegador é tudo. Para editar, use qualquer editor de texto.

## Arquivos

    index.html          carrega as bibliotecas e os scripts na ordem
    estilo.css          todo o HUD
    src/01-base.js      medidas da mesa, cores das bolas
    src/02-texturas.js  feltro, madeira, parede, piso, rede, granito — tudo em canvas
    src/03-materiais.js materiais PBR
    src/04-objetos.js   os cinco objetos-taco, a ANÁLISE DA PONTA, e a tralha
    src/05-gente.js     Seu Waldir e o bêbado: corpo, animação e reação de raiva
    src/06-cena.js      bar, mesa, caçapas de rede, luzes, câmera orbital
    src/07-estado.js    início de partida, equipar taco, posições no bar
    src/08-fisica.js    colisões, caçapas, regras de pares/ímpares, IA do adversário
    src/09-loop.js      render loop, previsão de trajetória, mouse e toque
    src/10-ui.js        HUD em React e arranque

Os arquivos de `src/` são carregados como scripts comuns, em ordem, e compartilham o
escopo global. Não há módulos ES nem imports. Isso significa que você pode abrir o
console do navegador e inspecionar o jogo rodando: `G` é o estado da partida,
`OBJECTS` são os tacos, `junkPool` é a tralha, `NPCS` são as pessoas.

Também incluí `sinuca-suja-arquivo-unico.html`, que é o jogo inteiro num arquivo só —
mais prático para publicar, menos prático para editar.

## A parte interessante do código

**`analyze()` em `src/04-objetos.js`** é o coração do jogo. Cada objeto é declarado
apenas como uma lista de peças com geometria — nenhuma delas marcada como "ponta". O
algoritmo descobre:

1. Gera uma nuvem de pontos com massa e espessura local a partir das peças.
2. Acha o eixo principal por iteração de potência sobre a matriz de covariância.
3. Projeta tudo nesse eixo e compara os dois extremos: **ponta = o de menor seção**.
4. Varre 72 direções ao redor do eixo medindo a extensão do corpo em cada uma
   (função de suporte perpendicular). A direção mais fina é a que aponta para o pano —
   é por isso que a cadeira gira sozinha para não arrastar as outras pernas no feltro.
5. Deriva as três estatísticas de jogo: espessura da ponta vira **precisão**, massa e
   comprimento viram **potência**, esbeltez menos dispersão fora do eixo vira **controle**.

Se você acrescentar um objeto novo à lista `OBJECTS`, ele ganha ponta, inclinação e
estatísticas automaticamente. É só descrever a geometria.

**Física** (`src/08-fisica.js`): as bolas rolam em 2D no plano da mesa (é o correto
para sinuca), com colisão elástica de massas iguais, restituição 0,86 nas tabelas e
atrito de rolamento de 0,55 m/s². A tralha arremessada usa corpo rígido simples em 3D
com velocidade angular nos três eixos; ao assentar, o código descobre qual eixo local
está para cima e usa a meia-extensão correspondente como altura de repouso — por isso
uma bota tombada descansa mais baixa do que uma bota em pé.

**Trajetória** (`src/09-loop.js`): `firstHit()` é um teste de raio contra círculos que
devolve o primeiro alvo. A linha amarela sai do centro da bola atingida na direção
centro-a-centro; a linha clara é a tangente perpendicular, que é para onde a branca
desvia depois do contato.

## Publicar

Renomeie para `index.html` (já está) e suba a pasta inteira em qualquer hospedagem
estática: itch.io (pede um .zip), GitHub Pages, Netlify, Cloudflare Pages.

As bibliotecas vêm do cdnjs em tempo de execução, então o jogo precisa de internet.
Para rodar offline, baixe `react.production.min.js`, `react-dom.production.min.js` e
`three.min.js`, ponha numa pasta `lib/` e troque os três `<script src>` do `index.html`.

## Controles

- **Mirar**: mover o mouse
- **Força**: pressionar sobre a mesa e puxar para trás; soltar bate. Clique seco cancela
- **Câmera**: botão direito gira, roda dá zoom (no celular: dois dedos)
- **Trocar de taco**: clicar no objeto no cenário
- **Arremessar**: na vez do adversário, clicar numa tralha, mirar e clicar de novo
- **Tirar tralha do pano**: clicar nela na sua vez — custa a vez
- **Esc**: larga o objeto que está na mão
