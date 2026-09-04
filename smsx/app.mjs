import {assets,events,properties,placements,pricesAt} from './data.mjs';
import {freshState,loadState,transact} from './engine.mjs';
import {shell,marketRows,assetDialog,betDialog,propertyDialog,adDialog,demoDialog,number,money,navItems} from './views.mjs';
import {icon} from './icons.mjs';
const root=document.querySelector('#app'),dialog=document.querySelector('#action-dialog'),toast=document.querySelector('#toast');
let storage;try{storage=localStorage;}catch{}
let state=loadState(storage),ui={view:'discover',filter:'All',search:''},modal=null,toastTimer;
function save(){try{storage?.setItem('egocorp-smsx-demo-v1',JSON.stringify(state));}catch{}}
function notify(message){toast.textContent=message;toast.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove('show'),3500);}
function render(){root.innerHTML=shell(state,ui);document.title='SMSX — '+(navItems.find(n=>n[0]===ui.view)?.[1]||'Discover');resizeEmbed();}
function navigate(view){if(!navItems.some(n=>n[0]===view))return;ui.view=view;ui.filter='All';ui.search='';dialog.close();modal=null;render();if(location.hash!=='#'+view)history.replaceState(null,'','#'+view);window.scrollTo({top:0,behavior:'instant'});requestAnimationFrame(()=>document.querySelector('#main-content')?.focus({preventScroll:true}));}
function error(message){const e=dialog.querySelector('#form-error');if(e)e.textContent=message;else notify(message);}
function commit(action,message,close=true){try{state=transact(state,action);save();render();if(close){dialog.close();modal=null;}notify(message);return true;}catch(e){error(e.message);return false;}}
function openModal(type,id,extra){
  modal={type,id,extra};
  const body=type==='asset'?assetDialog(state,assets.find(a=>a.id===id),extra||'buy'):type==='bet'?betDialog(state,events.find(e=>e.id===id),extra||'yes'):type==='property'?propertyDialog(state,properties.find(p=>p.id===id)):type==='ad'?adDialog(state,id):type==='reset'?'<h2 id="dialog-title">A fresh opening bell?</h2><p class="dialog-lead">Reset your local demo to 25,000 VirtuCoin. Your demo trades, bets, properties, and campaigns will be cleared.</p><button class="button purple full" data-confirm-reset>Reset my demo</button><button class="button outline full reset-cancel" data-close>Keep exploring</button>':demoDialog(state);
  dialog.innerHTML='<button class="dialog-close circle-button" data-close aria-label="Close dialog">'+icon('close')+'</button>'+body;
  if(!dialog.open)dialog.showModal();
  if(type==='asset')updateTrade();
}
function updateTrade(){
  const form=dialog.querySelector('#trade-form');if(!form)return;
  const q=Number(form.elements.quantity.value),prices=pricesAt(state.day),total=q*prices[form.dataset.assetId];
  dialog.querySelector('#trade-total').innerHTML=money(Number.isFinite(total)?Math.max(0,total):0,2);
  const estimate=dialog.querySelector('#swap-estimate');
  if(form.dataset.mode==='swap'){const target=form.elements.target.value,receive=Math.max(0,Math.floor(total/prices[target]));estimate.textContent='Receive '+number(receive)+' $'+target+' + '+number(Math.max(0,total-receive*prices[target]),2)+' VC change.';}
}
function updateBet(){
  const form=dialog.querySelector('#bet-form');if(!form)return;
  const event=events.find(e=>e.id===form.dataset.eventId),stake=Number(form.elements.stake.value),prob=(form.dataset.side==='yes'?event.yes:100-event.yes)/100;
  dialog.querySelector('#bet-payout').innerHTML=money(Number.isFinite(stake)?Math.max(0,stake/prob):0,2);
}
document.addEventListener('click',event=>{
  const b=event.target.closest('button,a');if(!b)return;
  const d=b.dataset;
  if(b.matches('.brand')){event.preventDefault();navigate('discover');}
  else if(d.view)navigate(d.view);
  else if(d.asset)openModal('asset',d.asset,d.mode);
  else if(d.bet)openModal('bet',d.bet,d.side);
  else if(d.property)openModal('property',d.property);
  else if(d.ad)openModal('ad',d.ad);
  else if(d.watch){const watched=state.watch.includes(d.watch);const remembered=modal;if(commit({type:'watch',asset:d.watch},watched?'Removed from watchlist.':'Added to watchlist.',false)&&remembered)openModal(remembered.type,remembered.id,remembered.extra);}
  else if(d.filter){ui.filter=d.filter;render();}
  else if(d.tradeMode)openModal('asset',d.assetId,d.tradeMode);
  else if(d.quantity){dialog.querySelector('#quantity').value=d.quantity;updateTrade();}
  else if(d.max){dialog.querySelector('#quantity').value=d.mode==='buy'?Math.floor(state.cash/pricesAt(state.day)[d.max]):state.holdings[d.max]||0;updateTrade();}
  else if(d.stake){dialog.querySelector('#stake').value=d.stake;updateBet();}
  else if(d.acquire)commit({type:d.owned==='true'?'sell-property':'property',property:d.acquire},d.owned==='true'?'Property sold. VirtuCoin returned to your balance.':'Your new address is in your portfolio.');
  else if(d.join)commit({type:'join',challenge:d.join},'You’re in. Complete the goal to claim your reward.');
  else if(d.claim)commit({type:'claim',challenge:d.claim},'Reward claimed. VirtuCoin added to your balance.');
  else if('advance'in d)commit({type:'advance'},'Demo day '+Math.min(state.day+1,6)+'. Markets updated and due events settled.');
  else if('demo'in d)openModal('demo');
  else if('reset'in d)openModal('reset');
  else if('confirmReset'in d){state=freshState();save();dialog.close();modal=null;render();notify('Fresh start. 25,000 VirtuCoin, all yours.');}
  else if('close'in d){dialog.close();modal=null;}
  else if('clearSearch'in d){ui.search='';render();document.querySelector('#market-search').focus();}
});
document.addEventListener('input',event=>{
  if(event.target.id==='quantity'||event.target.id==='swap-target')updateTrade();
  if(event.target.id==='stake')updateBet();
  if(event.target.id==='market-search'){
    const input=event.target,value=input.value,position=input.selectionStart;
    ui.search=value;
    if(ui.view!=='markets'){ui.view='markets';ui.filter='All';render();const search=document.querySelector('#market-search');search.focus();search.setSelectionRange(position,position);}
    else {const list=assets.filter(a=>(ui.filter==='All'||a.category===ui.filter||(ui.filter==='Watchlist'&&state.watch.includes(a.id)))&&(a.name+' '+a.id+' '+a.category+' '+a.world).toLowerCase().includes(value.toLowerCase()));document.querySelector('#market-results').innerHTML=marketRows(state,list);document.querySelector('.search-clear').hidden=!value;resizeEmbed();}
  }
});
document.addEventListener('change',event=>{if(event.target.id==='placement')openModal('ad',event.target.value);if(event.target.id==='swap-target')updateTrade();});
document.addEventListener('submit',event=>{
  event.preventDefault();const form=event.target;
  if(form.id==='trade-form')commit({type:form.dataset.mode,asset:form.dataset.assetId,quantity:Number(form.elements.quantity.value),target:form.elements.target?.value},'Trade complete. Your portfolio is updated.');
  if(form.id==='bet-form')commit({type:'bet',event:form.dataset.eventId,side:form.dataset.side,stake:Number(form.elements.stake.value)},'Position placed. Check it in your portfolio.');
  if(form.id==='ad-form'){const placement=form.elements.placement.value;if(commit({type:'ad',placement,name:form.elements.name.value},'Your demo campaign is booked.'))navigate(placement==='square'?'city':placement==='event'?'events':'discover');}
});
dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom){dialog.close();modal=null;}}});
dialog.addEventListener('close',()=>{modal=null;});
window.addEventListener('hashchange',()=>{const v=location.hash.slice(1);if(navItems.some(n=>n[0]===v)&&ui.view!==v)navigate(v);});
let lastHeight=0,resizeTimer;
window.addEventListener('message',event=>{
  if(window.parent===window||event.source!==window.parent||event.origin!==location.origin)return;
  const {type,top,height}=event.data||{};
  if(type!=='smsx:viewport'||!Number.isFinite(top)||!Number.isFinite(height)||top<0||height<100)return;
  dialog.style.top=(top+12)+'px';
  dialog.style.bottom='auto';
  dialog.style.margin='0 auto';
  dialog.style.maxHeight=(height-24)+'px';
  toast.style.bottom=Math.max(16,window.innerHeight-top-height+16)+'px';
});
function resizeEmbed(){if(window.parent===window)return;clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>{const height=Math.ceil(root.getBoundingClientRect().height);if(Math.abs(height-lastHeight)>2){lastHeight=height;window.parent.postMessage({type:'smsx:resize',height},location.origin);}},50);}
new ResizeObserver(resizeEmbed).observe(root);
if(window.parent!==window)window.parent.postMessage({type:'smsx:ready'},location.origin);
const initial=location.hash.slice(1);if(navItems.some(n=>n[0]===initial))ui.view=initial;
render();
