/* ══ SOM ══ */
/* Tudo sintetizado no Web Audio: nenhum arquivo de áudio no projeto.
   As receitas seguem a acústica real de cada material — bola de resina
   fenólica tem parciais inarmônicos acima de 3 kHz e decai em ~20 ms;
   borracha da tabela come os agudos; a caçapa não tem variação de tom
   nenhuma, é queda + batidas na rede + o gabinete ressoando. */
var Som=(function(){
  var ctx=null,mst=null,busS=null,busM=null,ruido=null,env=null,envG=null,
      ligado=true,ultimo={};
  try{ligado=localStorage.getItem("sinuca.som")!=="0";}catch(e){}

  function iniciar(externo,soEfeitos){
    if(ctx&&!externo){if(ctx.state==="suspended")ctx.resume();return ctx;}
    var AC=window.AudioContext||window.webkitAudioContext;
    if(!externo&&!AC)return null;
    try{ctx=externo||new AC();}catch(e){return null;}
    mst=ctx.createGain();mst.gain.value=ligado?0.85:0;mst.connect(ctx.destination);

    var n=Math.floor(ctx.sampleRate*2),b=ctx.createBuffer(1,n,ctx.sampleRate),d=b.getChannelData(0);
    for(var i=0;i<n;i++)d[i]=Math.random()*2-1;
    ruido=b;

    /* reverberação curta de salão: é ela que dá o "clac...c" do bar */
    var rn=Math.floor(ctx.sampleRate*0.85),ir=ctx.createBuffer(2,rn,ctx.sampleRate);
    for(var ch=0;ch<2;ch++){
      var g2=ir.getChannelData(ch);
      for(var j=0;j<rn;j++){
        var u=j/rn;
        g2[j]=(Math.random()*2-1)*Math.pow(1-u,3.4)*(j<ctx.sampleRate*0.008?0.35:1);
      }
    }
    env=ctx.createConvolver();env.buffer=ir;
    envG=ctx.createGain();envG.gain.value=0.42;env.connect(envG);envG.connect(mst);

    busS=ctx.createGain();busS.gain.value=0.9;busS.connect(mst);
    var envio=ctx.createGain();envio.gain.value=0.30;busS.connect(envio);envio.connect(env);

    /* a música sai de um alto-falante ruim do outro lado do salão */
    busM=ctx.createGain();busM.gain.value=0.62;
    var hp=ctx.createBiquadFilter();hp.type="highpass";hp.frequency.value=300;hp.Q.value=0.7;
    var lp=ctx.createBiquadFilter();lp.type="lowpass";lp.frequency.value=3300;lp.Q.value=0.6;
    var med=ctx.createBiquadFilter();med.type="peaking";med.frequency.value=950;
    med.Q.value=0.9;med.gain.value=5;
    busM.connect(hp);hp.connect(lp);lp.connect(med);med.connect(mst);
    var envioM=ctx.createGain();envioM.gain.value=0.24;med.connect(envioM);envioM.connect(env);

    if(soEfeitos)return ctx;
    ambiente();
    prox=ctx.currentTime+0.15;
    if(!timer)timer=setInterval(agenda,110);
    return ctx;
  }
  function pode(k,ms){var t=Date.now();
    if(ultimo[k]&&t-ultimo[k]<ms)return false; ultimo[k]=t; return true;}
  function agora(){return ctx.currentTime+0.001;}

  /* ── tijolos ── */
  /* ataque quase instantâneo (0,6 ms): é o que faz soar percussivo e não "apitado" */
  function pling(f,dur,vol,t0,tipo,alvo){
    if(vol<0.0006)return;
    var o=ctx.createOscillator(),g=ctx.createGain();
    o.type=tipo||"sine";o.frequency.setValueAtTime(f,t0);
    g.gain.setValueAtTime(0,t0);
    g.gain.linearRampToValueAtTime(vol,t0+0.0006);
    g.gain.exponentialRampToValueAtTime(0.0001,t0+dur);
    o.connect(g);g.connect(alvo||busS);o.start(t0);o.stop(t0+dur+0.01);
  }
  function tom(f,dur,vol,tipo,t0,alvo){          /* usado pela música: ataque suave */
    var o=ctx.createOscillator(),g=ctx.createGain();
    o.type=tipo||"sine";o.frequency.setValueAtTime(f,t0);
    g.gain.setValueAtTime(0.0001,t0);
    g.gain.exponentialRampToValueAtTime(Math.max(vol,0.0002),t0+0.012);
    g.gain.exponentialRampToValueAtTime(0.0001,t0+dur);
    o.connect(g);g.connect(alvo||busS);o.start(t0);o.stop(t0+dur+0.02);
  }
  function batida(freq,q,dur,vol,t0,tipo,alvo){
    if(vol<0.0006)return;
    var src=ctx.createBufferSource();src.buffer=ruido;
    src.playbackRate.value=0.8+Math.random()*0.4;
    var f=ctx.createBiquadFilter();f.type=tipo||"bandpass";
    f.frequency.setValueAtTime(freq,t0);f.Q.value=q;
    var g=ctx.createGain();
    g.gain.setValueAtTime(vol,t0);
    g.gain.exponentialRampToValueAtTime(0.0001,t0+dur);
    src.connect(f);f.connect(g);g.connect(alvo||busS);
    src.start(t0,Math.random()*1.5);src.stop(t0+dur+0.02);
  }

  /* ── bola contra bola: resina fenólica ──
     Parciais inarmônicos altos, decaimento curtíssimo, e o brilho cresce
     com a força — pancada fraca excita menos modos agudos. */
  var MODOS=[[3380,0.022,1.00],[4870,0.016,0.70],[6790,0.011,0.44],[9250,0.008,0.24]];
  function bolas(v){
    if(!ctx||!pode("b",20))return;
    var a=Math.min(1,v/3.0); if(a<0.035)return;
    var t=agora(),br=0.30+0.70*a,det=0.93+Math.random()*0.14;
    /* Passa-alta obrigatório: senoides que partem juntas da fase zero somam
       uma subida comum que vira um baque grave inexistente na bola real.
       O jitter de partida desalinha as fases; o filtro varre o resto. */
    var hp=ctx.createBiquadFilter();hp.type="highpass";
    hp.frequency.setValueAtTime(1500,t);hp.Q.value=0.6;hp.connect(busS);
    for(var i=0;i<MODOS.length;i++)
      pling(MODOS[i][0]*det,MODOS[i][1],0.34*a*MODOS[i][2]*(i?Math.pow(br,1.4):1),
            t+Math.random()*0.00045,"sine",hp);
    batida(6200,0.7,0.0035,0.26*a*br,t,"highpass",hp);
  }
  /* ── tabela: a borracha come o agudo, sobra um "poc" abafado ── */
  function tabela(v){
    if(!ctx||!pode("t",26))return;
    var a=Math.min(1,v/3.0); if(a<0.06)return;
    var t=agora();
    pling(208,0.048,0.22*a,t,"sine");
    pling(347,0.030,0.11*a,t,"triangle");
    batida(680,0.8,0.030,0.14*a,t,"lowpass");
    batida(2600,0.5,0.018,0.035*a,t,"highpass");      /* raspar do pano */
  }
  /* ── taco: couro abafa o estalo; depois o corpo do objeto ressoa ── */
  var CORPO={taco:[300,0.105,"triangle"],garrafa:[2050,0.170,"sine"],
             cadeira:[147,0.140,"triangle"],vassoura:[418,0.095,"triangle"],
             guardachuva:[760,0.075,"sine"]};
  function tacada(p,id){
    if(!ctx)return;
    var t=agora(),a=0.35+0.60*p,C=CORPO[id]||CORPO.taco;
    batida(1450,0.9,0.006,0.40*a,t,"bandpass");
    pling(880,0.024,0.24*a,t,"triangle");
    pling(1560,0.013,0.11*a,t,"sine");
    pling(C[0],C[1],0.15*a,t+0.002,C[2]);
  }
  /* ── caçapa: sem variação de tom nenhuma.
     Cai, o gabinete ressoa grave, e a bola bate na rede quatro vezes. ── */
  function cacapa(branca){
    if(!ctx)return;
    var t=agora();
    batida(880,0.6,0.026,0.22,t,"lowpass");            /* sai do pano */
    pling(78,0.34,0.19,t,"sine");                      /* madeira do gabinete */
    pling(117,0.21,0.10,t,"sine");
    [[0.072,0.28],[0.181,0.17],[0.298,0.095],[0.412,0.05]].forEach(function(q,i){
      var tt=t+q[0];
      batida(430-i*62,1.0,0.045,q[1],tt,"lowpass");
      pling(152-i*17,0.055,q[1]*0.55,tt,"sine");
      batida(3500,0.5,0.075,q[1]*0.15,tt,"highpass");  /* fiapo da rede */
    });
    if(branca){                                        /* a branca volta rolando */
      var src=ctx.createBufferSource();src.buffer=ruido;
      src.playbackRate.value=0.28;
      var f=ctx.createBiquadFilter();f.type="lowpass";f.frequency.value=330;f.Q.value=1.4;
      var g=ctx.createGain();
      g.gain.setValueAtTime(0.0001,t+0.42);
      g.gain.exponentialRampToValueAtTime(0.085,t+0.55);
      g.gain.exponentialRampToValueAtTime(0.0001,t+1.15);
      src.connect(f);f.connect(g);g.connect(busS);
      src.start(t+0.42,Math.random());src.stop(t+1.2);
      pling(62,0.40,0.10,t+0.44,"sine");
    }
  }
  var MAT_SOM={bota:"borracha",tenis:"pano",chinelo:"pano",copo:"vidro",
               lata:"metal",laranja:"macio",cinzeiro:"vidro",pedra:"pedra",livro:"papel"};
  function queda(id,v,naMesa){
    if(!ctx||!pode("q"+id,45))return;
    var a=Math.min(1,0.25+v/5),t=agora(),m=MAT_SOM[id]||"borracha";
    if(naMesa)a*=0.85;
    if(m==="vidro"){
      var hv=ctx.createBiquadFilter();hv.type="highpass";
      hv.frequency.setValueAtTime(900,t);hv.Q.value=0.6;hv.connect(busS);
      batida(3400,1.6,0.006,0.22*a,t,"highpass",hv);
      pling(2380+Math.random()*640,0.180,0.17*a,t,"sine",hv);
      pling(3960+Math.random()*900,0.095,0.09*a,t+0.0003,"sine",hv);
      pling(5700,0.055,0.05*a,t+0.0006,"sine",hv);
    }else if(m==="metal"){
      var hm=ctx.createBiquadFilter();hm.type="highpass";
      hm.frequency.setValueAtTime(420,t);hm.Q.value=0.6;hm.connect(busS);
      batida(2600,0.8,0.006,0.16*a,t,"highpass",hm);
      pling(842+Math.random()*120,0.30,0.15*a,t,"triangle",hm);
      pling(1390,0.20,0.08*a,t+0.0003,"sine",hm);
      pling(2270,0.12,0.04*a,t+0.0006,"sine",hm);
    }else if(m==="pedra"){
      batida(1300,1.1,0.007,0.26*a,t,"bandpass");
      pling(196,0.070,0.24*a,t,"sine");
      pling(430,0.038,0.10*a,t,"triangle");
    }else if(m==="papel"){
      batida(760,0.5,0.070,0.24*a,t,"lowpass");
      pling(124,0.055,0.11*a,t,"sine");
    }else if(m==="macio"){
      batida(300,0.7,0.075,0.17*a,t,"lowpass");
      pling(102,0.080,0.12*a,t,"sine");
    }else if(m==="pano"){
      batida(470,0.6,0.062,0.19*a,t,"lowpass");
      pling(133,0.070,0.10*a,t,"sine");
    }else{
      batida(230,0.8,0.100,0.26*a,t,"lowpass");
      pling(94,0.115,0.21*a,t,"sine");
    }
  }
  function pegar(){ if(!ctx)return; var t=agora();
    batida(1150,0.9,0.030,0.13,t,"bandpass"); pling(540,0.045,0.06,t,"triangle"); }
  function raiva(){ if(!ctx)return; var t=agora();
    batida(760,0.5,0.150,0.22,t,"lowpass");
    pling(214,0.190,0.13,t,"sawtooth");
    pling(176,0.250,0.09,t+0.05,"sawtooth"); }

  /* ── ambiente ── */
  function ambiente(){
    var src=ctx.createBufferSource();src.buffer=ruido;src.loop=true;
    var f=ctx.createBiquadFilter();f.type="lowpass";f.frequency.value=420;f.Q.value=0.4;
    var g=ctx.createGain();g.gain.value=0.020;
    src.connect(f);f.connect(g);g.connect(mst);src.start();
    var h=ctx.createOscillator(),hg=ctx.createGain();
    h.type="sine";h.frequency.value=118;hg.gain.value=0.006;
    h.connect(hg);hg.connect(mst);h.start();
    (function clink(){
      setTimeout(function(){
        if(ctx&&ligado){var t=agora();
          pling(1900+Math.random()*900,0.14,0.022,t,"sine");
          pling(2600+Math.random()*800,0.08,0.013,t+0.02,"sine");}
        clink();},5000+Math.random()*14000);
    })();
  }

  /* ── música de bar: shuffle lento, contrabaixo andando,
     tudo passando por um alto-falante velho do outro lado do salão ── */
  var BPM=84,SEG=60/BPM,prox=0,pos=0,timer=null;
  var MIDI=function(m){return 440*Math.pow(2,(m-69)/12);};
  /* giro I-VI-ii-V, um compasso cada — cadência genérica de boteco */
  var GIRO=[
   {r:48,acorde:[60,64,67,69],anda:[48,52,55,57]},   /* C6  */
   {r:45,acorde:[61,64,67,69],anda:[45,49,52,54]},   /* A7  */
   {r:50,acorde:[60,65,69,72],anda:[50,53,57,55]},   /* Dm7 */
   {r:43,acorde:[59,62,65,67],anda:[43,47,50,47]}    /* G7  */
  ];
  function agenda(){
    if(!ctx||ctx.state!=="running")return;
    while(prox<ctx.currentTime+0.35){
      passo(pos,prox);
      prox+=(pos%2===0)?SEG*(2/3):SEG*(1/3);   /* suingue: colcheia em tercina */
      pos=(pos+1)%32;
    }
  }
  function passo(i,t){
    var comp=Math.floor(i/8),ac=GIRO[comp%4],batidaN=Math.floor((i%8)/2),oitavo=i%2;
    if(oitavo===0){                                    /* contrabaixo andando */
      var nb=ac.anda[batidaN];
      tom(MIDI(nb),0.42,0.10,"triangle",t,busM);
      tom(MIDI(nb-12),0.46,0.055,"sine",t,busM);
    }
    if(oitavo===0&&(batidaN===0||batidaN===2)){        /* acorde com trêmolo leve */
      ac.acorde.forEach(function(m,k){
        var o=ctx.createOscillator(),g=ctx.createGain(),lfo=ctx.createOscillator(),lg=ctx.createGain();
        o.type=k%2?"sine":"triangle";
        o.frequency.value=MIDI(m+(batidaN===2?0:0))*(1+(Math.random()-0.5)*0.003);
        g.gain.setValueAtTime(0.0001,t);
        g.gain.exponentialRampToValueAtTime(0.042,t+0.03);
        g.gain.exponentialRampToValueAtTime(0.0001,t+1.25);
        lfo.type="sine";lfo.frequency.value=5.2;lg.gain.value=0.010;
        lfo.connect(lg);lg.connect(g.gain);
        o.connect(g);g.connect(busM);
        o.start(t);o.stop(t+1.3);lfo.start(t);lfo.stop(t+1.3);
      });
    }
    if(oitavo===0)                                     /* vassourinha: pulso */
      batida(3400,0.4,0.085,batidaN%2?0.055:0.030,t,"highpass",busM);
    else                                               /* e o arrasto do suingue */
      batida(4600,0.5,0.045,0.022,t,"highpass",busM);
    if(batidaN%2===1&&oitavo===0)                      /* caixa surda em 2 e 4 */
      pling(196,0.055,0.030,t,"triangle",busM);
  }

  function alternar(){
    ligado=!ligado;
    if(ctx)mst.gain.setTargetAtTime(ligado?0.85:0,ctx.currentTime,0.02);
    try{localStorage.setItem("sinuca.som",ligado?"1":"0");}catch(e){}
    return ligado;
  }
  return {iniciar:iniciar,alternar:alternar,ativo:function(){return ligado;},
          bolas:bolas,tabela:tabela,tacada:tacada,cacapa:cacapa,queda:queda,
          pegar:pegar,raiva:raiva};
})();
