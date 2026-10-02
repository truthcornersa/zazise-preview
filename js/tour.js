/*! ZAZISE tour (Pages preview) */
(function(g){"use strict";
function startTour(){
  if(document.getElementById("zz-tour"))return;
  var steps=[
    {t:"Welcome",d:"This is the GitHub Pages preview — interactions run locally."},
    {t:"Language bar",d:"Use SA language pills; collapse the bar with the chevron."},
    {t:"Menu",d:"Open the hamburger to toggle menu-open animations."},
    {t:"Guest gate",d:"Some actions show a blur/sign-in popup for guests."}
  ];
  var i=0;
  var ov=document.createElement("div");
  ov.id="zz-tour";
  ov.style.cssText="position:fixed;inset:0;z-index:10003;background:rgba(18,22,31,.55);display:flex;align-items:center;justify-content:center;padding:16px";
  function paint(){
    var s=steps[i];
    ov.innerHTML='<div style="background:#fff;max-width:360px;width:100%;border-radius:16px;padding:22px;font-family:Inter,system-ui,sans-serif"><div style="font-size:12px;color:#606060;margin-bottom:6px">Tour '+(i+1)+'/'+steps.length+'</div><h2 style="margin:0 0 8px;font-size:20px">'+s.t+'</h2><p style="color:#606060;margin:0 0 16px">'+s.d+'</p><div style="display:flex;gap:8px;justify-content:flex-end"><button type="button" id="zz-tour-skip" style="padding:8px 14px;border-radius:999px;border:1px solid #ccc;background:#f8f8f8;cursor:pointer">Skip</button><button type="button" id="zz-tour-next" style="padding:8px 14px;border-radius:999px;border:0;background:#E2AE41;font-weight:700;cursor:pointer">'+(i===steps.length-1?"Done":"Next")+'</button></div></div>';
    ov.querySelector("#zz-tour-skip").onclick=function(){ov.remove();};
    ov.querySelector("#zz-tour-next").onclick=function(){if(i>=steps.length-1)ov.remove();else{i++;paint();}};
  }
  paint();
  document.body.appendChild(ov);
}
g.ZaziseTour={start:startTour};
g.startTour=startTour;
})(window);
