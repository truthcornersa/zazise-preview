/*! ZAZISE guest-gate (Pages preview) */
(function(g){"use strict";
function isGuest(){try{return!(g.ZaziseAuth&&ZaziseAuth.user);}catch(e){return true;}}
function openGate(opts){
  opts=opts||{};
  if(document.getElementById("zz-guest-gate"))return;
  var ov=document.createElement("div");
  ov.id="zz-guest-gate";
  ov.setAttribute("role","dialog");
  ov.style.cssText="position:fixed;inset:0;z-index:10002;display:flex;align-items:flex-end;justify-content:center;backdrop-filter:blur(6px);background:rgba(18,22,31,.45)";
  ov.innerHTML='<div style="background:#fff;width:100%;max-width:420px;border-radius:18px 18px 0 0;padding:22px;font-family:Inter,system-ui,sans-serif"><h2 style="margin:0 0 8px;font-size:20px">Sign in to continue</h2><p style="color:#606060;margin:0 0 12px">Static preview gate — no Afrihost API.</p><p style="margin:0 0 12px"><a href="login.html">Sign in</a> · <a href="register.html">Create account</a></p><button type="button" id="zz-gate-close" style="padding:10px 16px;border-radius:999px;border:1px solid #ccc;background:#f8f8f8;font-weight:600;cursor:pointer">Close</button></div>';
  document.body.appendChild(ov);
  function close(){ov.remove();}
  ov.querySelector("#zz-gate-close").onclick=close;
  ov.addEventListener("click",function(e){if(e.target===ov)close();});
  document.addEventListener("keydown",function esc(e){if(e.key==="Escape"){close();document.removeEventListener("keydown",esc);}});
  if(opts.blurSelector){try{document.querySelectorAll(opts.blurSelector).forEach(function(el){el.style.filter="blur(2px)";});}catch(e){}}
}
function gateGuestMenu(){/* no-op preview */}
g.ZaziseGuest={isGuest:isGuest,openGate:openGate,gateGuestMenu:gateGuestMenu};
g.ZaziseGate={show:function(){openGate({});}};
})(window);
