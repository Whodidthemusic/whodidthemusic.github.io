import test from 'node:test';
import assert from 'node:assert/strict';
import {freshState,transact,portfolioValue,loadState} from '../smsx/engine.mjs';
import {assets,properties,pricesAt} from '../smsx/data.mjs';
import {avatar,content,assetDialog,propertyDialog,propertyImage} from '../smsx/views.mjs';
import {existsSync,readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';

test('every lot has distinct artwork shared by its card and purchase dialog',()=>{
  const state=freshState(),html=content(state,{view:'city',filter:'All',search:''}),hashes=[];
  for(const p of properties){
    const image=propertyImage(p),file=new URL('../smsx/assets/lots/'+p.id+'.png',import.meta.url);
    assert.ok(html.includes(image),p.id+' card');assert.ok(propertyDialog(state,p).includes(image),p.id+' dialog');
    assert.ok(existsSync(file),p.id+' image file');
    hashes.push(createHash('sha256').update(readFileSync(file)).digest('hex'));
  }
  assert.equal(new Set(hashes).size,6);
});

test('renamed ticker preserves saved holdings, watchlist and trade history',()=>{
  const old={...freshState(),holdings:{KWO:10},watch:['KWO'],trades:[{asset:'KWO',target:'KWO',quantity:10,total:31.1,day:0,type:'buy'}]};
  const s=loadState({getItem:()=>JSON.stringify(old)});
  assert.deepEqual(s.holdings,{TEK:10});assert.deepEqual(s.watch,['TEK']);
  assert.equal(s.trades[0].asset,'TEK');assert.equal(s.trades[0].target,'TEK');
  assert.equal(portfolioValue(s),25031.1);
  assert.equal(transact(s,{type:'sell',asset:'TEK',quantity:10}).cash,25031.1);
  assert.deepEqual(loadState({getItem:()=>JSON.stringify(s)}),s);
});

test('public SMSX surfaces omit the removed name and use the supplied Auris portrait',()=>{
  const state=freshState(),auris=assets.find(a=>a.id==='AURA');
  const pages=['discover','markets','events','portfolio','city','challenges'].map(view=>content(state,{view,filter:'All',search:''}));
  const html=pages.join('')+assets.map(a=>assetDialog(state,a)).join('');
  assert.doesNotMatch(html,/kw[oō]/i);
  assert.match(avatar(auris),/assets\/auris\.jpg/);
  assert.match(pages[2],/class="event-portrait" src="\.\/assets\/auris\.jpg"/);
  assert.match(assetDialog(state,auris),/assets\/auris\.jpg/);
});
test('buy and sell conserve value and reject invalid or unaffordable trades',()=>{
  const opening=freshState(),buy=transact(opening,{type:'buy',asset:'AURA',quantity:10});
  assert.equal(opening.cash,25000);assert.equal(buy.cash,24871.6);assert.equal(buy.holdings.AURA,10);assert.equal(portfolioValue(buy),25000);
  const sold=transact(buy,{type:'sell',asset:'AURA',quantity:10});assert.equal(sold.cash,25000);
  for(const q of [-1,0,1.5,Infinity,1000000])assert.throws(()=>transact(opening,{type:'buy',asset:'AURA',quantity:q}));
  assert.throws(()=>transact(buy,{type:'sell',asset:'AURA',quantity:11}));assert.throws(()=>transact(opening,{type:'buy',asset:'INVALID',quantity:1}));
});
test('share swaps conserve total value and return unspent change',()=>{
  let s=transact(freshState(),{type:'buy',asset:'AURA',quantity:100});
  s=transact(s,{type:'swap',asset:'AURA',quantity:50,target:'CLIME'});
  assert.equal(s.holdings.AURA,50);assert.equal(s.holdings.CLIME,Math.floor(642/8.63));assert.equal(portfolioValue(s),25000);
  assert.throws(()=>transact(s,{type:'swap',asset:'AURA',quantity:1,target:'AURA'}));
});
test('bets remain open until due, then settle exactly once with fixed outcomes',()=>{
  let s=transact(freshState(),{type:'bet',event:'nano',side:'no',stake:100});
  assert.equal(portfolioValue(s),25000);s=transact(s,{type:'advance'});assert.equal(s.bets[0].status,'open');
  s=transact(s,{type:'advance'});assert.equal(s.bets[0].status,'won');assert.equal(s.cash,25072.41);
  s=transact(s,{type:'advance'});assert.equal(s.cash,25072.41);assert.throws(()=>transact(s,{type:'bet',event:'nano',side:'yes',stake:100}));
});
test('a losing event loses only its stake',()=>{
  let s=transact(freshState(),{type:'bet',event:'nano',side:'yes',stake:100});
  s=transact(transact(s,{type:'advance'}),{type:'advance'});
  assert.equal(s.bets[0].status,'lost');assert.equal(portfolioValue(s),24900);
});
test('property ownership is unique and acquisition and sale conserve value',()=>{
  let s=transact(freshState(),{type:'property',property:'prime'});assert.equal(s.cash,20200);assert.equal(portfolioValue(s),25000);
  assert.throws(()=>transact(s,{type:'property',property:'prime'}));s=transact(s,{type:'sell-property',property:'prime'});assert.equal(s.cash,25000);assert.deepEqual(s.property,[]);
});
test('challenge rewards require progress and can only be claimed once',()=>{
  let s=transact(freshState(),{type:'join',challenge:'frontrow'});
  assert.throws(()=>transact(s,{type:'claim',challenge:'frontrow'}));
  s=transact(s,{type:'buy',asset:'CHRM',quantity:1});s=transact(s,{type:'claim',challenge:'frontrow'});
  assert.equal(portfolioValue(s),25300);assert.throws(()=>transact(s,{type:'claim',challenge:'frontrow'}));
});
test('ad booking is a demo expense with a bounded name and one active slot',()=>{
  const s=transact(freshState(),{type:'ad',placement:'discover',name:'My Chrome Drop'});
  assert.equal(s.cash,24550);assert.equal(portfolioValue(s),24550);assert.equal(s.campaigns[0].ends,3);
  assert.throws(()=>transact(s,{type:'ad',placement:'discover',name:'Second'}));assert.throws(()=>transact(freshState(),{type:'ad',placement:'square',name:'x'}));
});
test('market progression revalues holdings and the demo ends at day six',()=>{
  let s=transact(freshState(),{type:'buy',asset:'AURA',quantity:10});
  s=transact(s,{type:'advance'});assert.equal(portfolioValue(s),Math.round((s.cash+10*pricesAt(1).AURA)*100)/100);
  while(s.day<6)s=transact(s,{type:'advance'});assert.throws(()=>transact(s,{type:'advance'}));
});
test('storage failures and malformed saved data recover to a fresh demo',()=>{
  for(const raw of ['',null,'{','{}',JSON.stringify({...freshState(),cash:-1}),JSON.stringify({...freshState(),property:['bad']})])assert.deepEqual(loadState({getItem:()=>raw}),freshState());
  assert.deepEqual(loadState({getItem:()=>{throw Error();}}),freshState());
  const s=transact(freshState(),{type:'buy',asset:'AURA',quantity:4});assert.deepEqual(loadState({getItem:()=>JSON.stringify(s)}),s);
});
