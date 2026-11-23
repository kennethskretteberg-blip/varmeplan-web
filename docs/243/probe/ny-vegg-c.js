  // 243: veggmål som ikke fikk plass — på utsiden av målelinja med leder, etter alt annet.
  { const _flush=()=>_dimFlushMoved(pend,{FONT,BOXH,LUFT,LWX:P?P.ext:0.5,pdf:!!P,wall:true,
      base:(sign,RG)=>Math.max(TICK,BOXH/2)+RG+BOXH/2,
      label:(it,cx,cy)=>_txt(it.str,cx,cy,it.ang,it.col)});
    if(_dimDefer) _dimDefer.push(_flush); else _flush(); }
