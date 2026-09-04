const frame=document.getElementById('smsx-frame');
function sendViewport(){
  if(!frame?.contentWindow)return;
  const rect=frame.getBoundingClientRect(),top=Math.max(0,-rect.top),bottom=Math.min(rect.height,window.innerHeight-rect.top);
  if(bottom>top)frame.contentWindow.postMessage({type:'smsx:viewport',top,height:bottom-top},location.origin);
}
window.addEventListener('message',event=>{
  if(event.origin!==location.origin||event.source!==frame?.contentWindow)return;
  const {type,height}=event.data||{};
  if(type==='smsx:resize'&&Number.isFinite(height)&&height>=100&&height<=12000){frame.style.height=Math.ceil(height)+'px';sendViewport();}
  if(type==='smsx:ready')sendViewport();
});
window.addEventListener('scroll',sendViewport,{passive:true});
window.addEventListener('resize',sendViewport);
frame?.addEventListener('load',sendViewport);
