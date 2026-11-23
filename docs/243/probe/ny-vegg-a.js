  // 243: veggmålene følger 240-regelen (Kenneth 23.11.2026). Teksten står midt på målelinja som før
  // BARE når den får plass i linja (boks + luft ≤ linjas lengde) og ikke treffer en tekst som alt
  // står i _dimPlaced; ellers flyttes den ut på utsiden med leder (_dimFlushMoved, samme kode som
  // kjedene), SIST i tegneomgangen (_dimDefer). Skrå vegger tegnes som før (regelen er akseparallell).
  const LUFT=FONT*0.3, pend=[];
  const _txt=(str,cx,cy,ang,col)=>{
    ctx.save();
    ctx.translate(cx,cy);ctx.rotate(ang);
    ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillStyle=BG;
    const tw=ctx.measureText(str).width;
    ctx.fillRect(-tw/2-PAD,-BOXH/2,tw+2*PAD,BOXH);
    ctx.fillStyle=col;ctx.fillText(str,0,0);
    ctx.restore();
  };
