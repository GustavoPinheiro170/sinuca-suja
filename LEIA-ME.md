# Sinuca Suja

Sinuca 3D num bar caindo aos pedaços. Qualquer objeto do cenário vira taco, o jogo
descobre sozinho qual extremidade dele é a ponta, e os dois lados jogam tralha na mesa.

## O que foi usado

| | |
|---|---|
| **React 18** | só o HUD. Sem JSX — `React.createElement`, apelidado de `h` |
| **Three.js r128** | render 3D, build UMD clássica |
| **Web Audio** | todo o som, sintetizado. Nenhum arquivo de áudio |
| **Nada mais** | sem engine de jogo, sem bundler, sem npm, sem passo de build |

Física, geometria, modelos 3D, texturas, animação dos personagens, IA do adversário e
o áudio são código próprio. **Não existe um único arquivo de imagem nem de som no
projeto** — texturas são desenhadas em Canvas 2D e o áudio é gerado em osciladores e
ruído filtrado, tudo em tempo de execução.

Abrir o `index.html` no navegador é tudo. Para editar, qualquer editor de texto serve.

## Arquivos

    index.html          carrega as bibliotecas e os scripts na ordem
    estilo.css          todo o HUD
    build.mjs           gera dist/index.html num arquivo só (Node puro, sem deps)
    src/01-base.js      medidas da mesa, cores das bolas
    src/02-texturas.js  feltro, madeira, parede, piso, rede, granito — em canvas
    src/03-materiais.js materiais PBR
    src/04-objetos.js   os cinco objetos-taco, a ANÁLISE DA PONTA, e a tralha
    src/05-gente.js     Seu Waldir e o bêbado: corpo, animação e reação de raiva
    src/06-cena.js      bar, mesa, caçapas de rede, luzes, câmera orbital
    src/07-som.js       efeitos, ambiente e música — tudo sintetizado
    src/08-estado.js    início de partida, equipar taco, posições no bar
    src/09-fisica.js    colisões, caçapas, regras de pares/ímpares, IA do adversário
    src/10-loop.js      render loop, previsão de trajetória, mouse e toque
    src/11-ui.js        HUD em React e arranque

Carregados como scripts comuns, em ordem, compartilhando o escopo global. Sem módulos
ES, sem imports. Dá para abrir o console do navegador e inspecionar o jogo rodando:
`G` é o estado da partida, `OBJECTS` são os tacos, `junkPool` a tralha, `NPCS` as
pessoas, `Som` o áudio.

## A parte interessante do código

**`analyze()` em `src/04-objetos.js`** é o coração do jogo. Cada objeto é declarado só
como uma lista de peças com geometria — nenhuma marcada como "ponta". O algoritmo:

1. Gera uma nuvem de pontos com massa e espessura local.
2. Acha o eixo principal por iteração de potência sobre a matriz de covariância.
3. Projeta tudo nesse eixo: **ponta = o extremo de menor seção transversal**.
4. Varre 72 direções ao redor do eixo medindo a extensão do corpo em cada uma. A mais
   fina aponta para o pano — é por isso que a cadeira gira sozinha para não arrastar
   as outras pernas no feltro.
5. Deriva as estatísticas: espessura da ponta vira **precisão**, massa e comprimento
   viram **potência**, esbeltez menos dispersão vira **controle**.

Acrescente um objeto à lista `OBJECTS` e ele ganha ponta, inclinação e estatísticas
automaticamente. Basta descrever a geometria.

**Som** (`src/07-som.js`): dois tijolos — `pling()` para osciladores com ataque de
0,6 ms e `batida()` para ruído filtrado — e cada efeito é uma receita acústica.

Bola contra bola são quatro parciais **inarmônicos** em 3,4 / 4,9 / 6,8 / 9,2 kHz com
decaimento de 8 a 22 ms, mais um transiente de contato: é a assinatura da resina
fenólica. O brilho cresce com a força, porque pancada fraca excita menos modos agudos.

Atenção a uma armadilha: senoides que partem juntas da fase zero somam uma subida
comum que vira um baque grave inexistente na bola real. Medido, o pico espectral caía
em 110 Hz mesmo com todos os parciais acima de 3 kHz. Por isso o estalo passa por um
passa-alta em 1,5 kHz e cada parcial parte com um jitter de fase. Depois da correção o
pico foi para 3,5 kHz.

A tabela come os agudos (borracha), a caçapa não tem variação de tom nenhuma — é a
queda, o gabinete ressoando em 78 Hz e quatro batidas decrescentes na rede — e cada
tralha soa conforme o material: vidro tine, metal ressoa, pedra bate seco.

Tudo passa por uma reverberação curta de salão sintetizada em ruído decrescente. A
música é um shuffle lento e original de 84 BPM com contrabaixo andando, filtrada como
se saísse de um alto-falante ruim do outro lado do bar.

`Som.iniciar(ctx, true)` aceita um `OfflineAudioContext` injetado — foi assim que medi
pico, duração e espectro de cada efeito, já que navegador headless não gera áudio
mensurável ao vivo.

**Física** (`src/09-fisica.js`): as bolas rolam em 2D no plano da mesa, colisão
elástica de massas iguais, restituição 0,86 nas tabelas, atrito de 0,55 m/s². A tralha
arremessada é corpo rígido simples em 3D; ao assentar, o código descobre qual eixo
local está para cima e usa a meia-extensão correspondente como altura de repouso.

## Publicar

Renomeie para `index.html` (já está) e suba a pasta em qualquer hospedagem estática:
itch.io (pede .zip), GitHub Pages, Netlify, Cloudflare Pages. Ou rode `node build.mjs`
e suba só o `dist/index.html`.

Para rodar offline, ponha `react.production.min.js`, `react-dom.production.min.js` e
`three.min.js` numa pasta `lib/`, aponte os `<script>` do `index.html` para lá e rode
`node build.mjs --offline`.

## Controles

- **Mirar**: mover o mouse
- **Força**: pressionar sobre a mesa e puxar para trás; soltar bate. Clique seco cancela
- **Câmera**: botão direito gira, roda dá zoom (no celular: dois dedos)
- **Trocar de taco**: clicar no objeto no cenário
- **Arremessar**: na vez do adversário, clicar numa tralha, mirar e clicar de novo
- **Tirar tralha do pano**: clicar nela na sua vez — custa a vez
- **Som**: botão ♪ no canto superior direito
- **Esc**: larga o objeto que está na mão
