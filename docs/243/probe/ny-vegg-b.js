    const tw=ctx.measureText(_lbl).width, bw=tw+2*PAD;
    const mx=(ox1+ox2)/2,my=(oy1+oy2)/2;
    const fb=_dimBoxRot(mx,my,drawAng,bw,BOXH);
    const _aV=Math.abs(Math.cos(wallAng))<0.02,_aH=!_aV&&Math.abs(Math.sin(wallAng))<0.02;
    if(!(_aV||_aH)||(bw+LUFT<=Math.hypot(ox2-ox1,oy2-oy1)&&!_dimHitsBox(fb,LUFT/2))){
      _txt(_lbl,mx,my,drawAng,col);
      // 240: veggmålets tekst og linje er opptatt plass for kjedetekstene
      _dimPlaced.boxes.push(fb);
    } else {
      const sg=_aV?(nx<0?-1:1):(ny<0?-1:1), ln=_aV?mx:my;
      pend.push({str:_lbl,col,mx,my,isVert:_aV,sign:sg,bw,chain:(_aV?'v':'h')+sg+'|'+Math.round(ln),line:ln,ang:drawAng,rid:_pdfCap?_pdfCap.rid:undefined});
    }
