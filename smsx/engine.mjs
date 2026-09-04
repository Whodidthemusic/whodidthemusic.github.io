import {assets,events,properties,challenges,placements,pricesAt} from './data.mjs';
export const STARTING_CASH=25000;
const cents=n=>Math.round(n*100)/100;
export function freshState(){return {version:1,cash:STARTING_CASH,day:0,holdings:{},watch:[],bets:[],property:[],joined:[],claimed:[],campaigns:[],trades:[],history:[STARTING_CASH]};}
export function portfolioValue(s){const prices=pricesAt(s.day);return cents(s.cash+Object.entries(s.holdings).reduce((n,[id,q])=>n+prices[id]*q,0)+s.property.reduce((n,id)=>n+properties.find(p=>p.id===id).price,0)+s.bets.filter(b=>b.status==='open').reduce((n,b)=>n+b.stake,0));}
export function challengeProgress(s,c){return c.kind==='trades'?Math.min(c.target,s.trades.length):c.kind==='property'?Math.min(c.target,s.property.length):Math.min(1,assets.filter(a=>a.category==='Fashion'&&s.holdings[a.id]>0).length);}
function need(ok,message){if(!ok)throw Error(message);}
function affordable(s,cost){need(Number.isFinite(cost)&&cost>0,'Enter a valid amount.');need(s.cash+0.001>=cost,'You need more VirtuCoin for this move.');}
export function transact(previous,action){
  const s=structuredClone(previous), price=pricesAt(s.day);
  if(['buy','sell','swap'].includes(action.type)){
    const a=assets.find(a=>a.id===action.asset),q=Number(action.quantity);
    need(a,'Choose a listed market.');need(Number.isInteger(q)&&q>0&&q<=1000000,'Enter a whole number of shares, at least 1.');
    const total=cents(q*price[a.id]);
    if(action.type==='buy'){affordable(s,total);s.cash=cents(s.cash-total);s.holdings[a.id]=(s.holdings[a.id]||0)+q;}
    else{
      need((s.holdings[a.id]||0)>=q,'You do not own that many shares.');
      if(action.type==='sell'){s.holdings[a.id]-=q;s.cash=cents(s.cash+total);}
      else{
        const target=assets.find(a=>a.id===action.target);
        need(target&&target.id!==a.id,'Choose a different market to trade into.');
        const receiving=Math.floor(total/price[target.id]);
        need(receiving>=1,'Trade more shares to receive at least 1 share of the new asset.');
        s.holdings[a.id]-=q;s.holdings[target.id]=(s.holdings[target.id]||0)+receiving;s.cash=cents(s.cash+total-cents(receiving*price[target.id]));
      }
    }
    s.trades.unshift({id:s.trades.length+1,type:action.type,asset:a.id,quantity:q,total,day:s.day,target:action.target||null});
  } else if(action.type==='bet'){
    const event=events.find(e=>e.id===action.event),stake=cents(Number(action.stake));
    need(event&&s.day<event.closes,'This event has already settled.');
    need(action.side==='yes'||action.side==='no','Choose Yes or No.');
    need(stake>=10,'The minimum demo stake is 10 VC.');affordable(s,stake);
    const probability=(action.side==='yes'?event.yes:100-event.yes)/100;
    s.cash=cents(s.cash-stake);s.bets.push({id:s.bets.length+1,event:event.id,side:action.side,stake,payout:cents(stake/probability),status:'open'});
  } else if(action.type==='property'){
    const property=properties.find(p=>p.id===action.property);
    need(property,'Choose a property.');need(!s.property.includes(property.id),'You already own this property.');affordable(s,property.price);
    s.cash=cents(s.cash-property.price);s.property.push(property.id);
  } else if(action.type==='sell-property'){
    const property=properties.find(p=>p.id===action.property);need(property&&s.property.includes(property.id),'You do not own this property.');
    s.cash=cents(s.cash+property.price);s.property=s.property.filter(id=>id!==property.id);
  } else if(action.type==='watch'){
    need(assets.some(a=>a.id===action.asset),'Unknown market.');s.watch=s.watch.includes(action.asset)?s.watch.filter(a=>a!==action.asset):s.watch.concat(action.asset);
  } else if(action.type==='join'){
    need(challenges.some(c=>c.id===action.challenge),'Unknown challenge.');need(!s.joined.includes(action.challenge),'You have already joined.');s.joined.push(action.challenge);
  } else if(action.type==='claim'){
    const c=challenges.find(c=>c.id===action.challenge);
    need(c&&s.joined.includes(c.id),'Join the challenge first.');need(!s.claimed.includes(c.id),'This reward has already been claimed.');
    need(challengeProgress(s,c)>=c.target,'Complete the challenge before claiming.');s.cash=cents(s.cash+c.reward);s.claimed.push(c.id);
  } else if(action.type==='ad'){
    const p=placements.find(p=>p.id===action.placement);
    need(p,'Choose a placement.');need(!s.campaigns.some(c=>c.placement===p.id&&c.ends>s.day),'You already have a booking here.');
    const name=String(action.name||'').trim();need(name.length>=2&&name.length<=40,'Use a campaign name between 2 and 40 characters.');affordable(s,p.cost);
    s.cash=cents(s.cash-p.cost);s.campaigns.push({name,placement:p.id,cost:p.cost,ends:s.day+3});
  } else if(action.type==='advance'){
    need(s.day<6,'This demo season is complete. Reset your demo to play again.');s.day++;
    for(const b of s.bets){const e=events.find(e=>e.id===b.event);if(b.status==='open'&&s.day>=e.closes){const won=(b.side==='yes')===e.outcome;b.status=won?'won':'lost';if(won)s.cash=cents(s.cash+b.payout);}}
  } else throw Error('Unknown action.');
  need(Number.isFinite(s.cash)&&s.cash>=0,'That move could not be completed.');
  s.history.push(portfolioValue(s));if(s.history.length>40)s.history.shift();
  return s;
}
export function loadState(storage){
  try{
    const s=JSON.parse(storage.getItem('egocorp-smsx-demo-v1'));
    if(!s||s.version!==1||!Number.isFinite(s.cash)||s.cash<0||s.cash>1e9||!Number.isInteger(s.day)||s.day<0||s.day>6)return freshState();
    const validIds=new Set(assets.map(a=>a.id));
    if(!s.holdings||Object.entries(s.holdings).some(([id,n])=>!validIds.has(id)||!Number.isInteger(n)||n<0||n>1e6))return freshState();
    for(const key of ['watch','bets','property','joined','claimed','campaigns','trades','history'])if(!Array.isArray(s[key])||s[key].length>10000)return freshState();
    if(s.property.some(id=>!properties.some(p=>p.id===id))||s.bets.some(b=>!events.some(e=>e.id===b.event)||!Number.isFinite(b.stake)||b.stake<0||!Number.isFinite(b.payout)||b.payout<0||!['open','won','lost'].includes(b.status))||s.history.some(n=>!Number.isFinite(n)))return freshState();
    return s;
  }catch{return freshState();}
}
