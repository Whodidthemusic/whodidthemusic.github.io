export const assets = [
  {id:'AURA',name:'Auris Veil',category:'Influencers',price:12.84,change:8.24,avatar:0,volume:'842K',audience:'2.8M',attention:92,world:'Fame Farm',description:'The face of Valleywood. Fashion, identity, and a fanbase that moves with every new look.'},
  {id:'CLIME',name:'ClimeCore',category:'Trends',price:8.63,change:5.61,avatar:1,volume:'615K',audience:'8.6M',attention:96,world:'Fame Farm',description:'Virtu City’s most contagious challenge. Every clip adds to the conversation.'},
  {id:'NANOQ',name:'NanoQ',category:'Brands',price:5.27,change:-2.31,avatar:2,volume:'293K',audience:'940K',attention:68,world:'Fame Farm',description:'Personal robotics with a very public following. Product launches meet culture.'},
  {id:'CHRM',name:'Chrome Label',category:'Fashion',price:15.92,change:3.74,avatar:3,volume:'410K',audience:'1.4M',attention:86,world:'Fame Farm',description:'Reflective streetwear, limited drops, and front-row access to the Chrome Carpet.'},
  {id:'KWO',name:'Tekspiracy',category:'Influencers',price:3.11,change:-1.08,avatar:4,volume:'128K',audience:'620K',attention:77,world:'Fame Farm',description:'Kwō’s underground stream. An audience that looks beneath the surface.'},
  {id:'GALA',name:'Meta Gala',category:'Events',price:24.60,change:6.82,avatar:3,volume:'528K',audience:'3.1M',attention:94,world:'Fame Farm',description:'The Museum of Vision’s biggest night: fashion, art, culture, and the unexpected.'},
  {id:'VRTEX',name:'Vortex',category:'Brands',price:18.45,change:-3.24,avatar:2,volume:'332K',audience:'1.8M',attention:63,world:'Fame Farm',description:'A platform stock from the SMSX floor. Public attention is its most valuable currency.'},
  {id:'GRWM',name:'#GetReadyWithMe',category:'Trends',price:6.28,change:11.42,avatar:5,volume:'782K',audience:'12.4M',attention:98,world:'Reality mirror',description:'The everyday ritual that became a cultural format. A fictional index inspired by real-world social culture.'},
  {id:'STRT',name:'Streetwear Index',category:'Fashion',price:32.14,change:4.62,avatar:3,volume:'954K',audience:'18.2M',attention:89,world:'Reality mirror',description:'Sneaker drops, new silhouettes, and the return of archive pieces. A simulated basket of streetwear attention.'},
  {id:'NEON',name:'Neon FM',category:'Music',price:9.72,change:7.16,avatar:1,volume:'321K',audience:'2.2M',attention:85,world:'Fame Farm',description:'Tomorrow’s sound from the city’s independent artists. New tracks, new tastemakers.'},
  {id:'EDIT',name:'The Edit Economy',category:'Trends',price:4.86,change:9.30,avatar:4,volume:'467K',audience:'6.8M',attention:91,world:'Reality mirror',description:'Fan edits, remixes, and the creators who give a moment a second life. Simulated culture data.'},
  {id:'RESET',name:'RESET Wellness',category:'Brands',price:11.32,change:-1.72,avatar:5,volume:'184K',audience:'870K',attention:60,world:'Fame Farm',description:'Virtu City’s polished wellness brand. A whole new you, one campaign at a time.'}
];
export const events = [
  {id:'clime10',title:'Will #ClimeCore hit 10M?',category:'Challenges',yes:68,asset:'CLIME',closes:3,outcome:true,detail:'Total challenge views reach 10 million by the end of demo day 3.',image:'clime'},
  {id:'gala',title:'Will chrome own the Meta Gala?',category:'Fashion',yes:74,asset:'GALA',closes:4,outcome:true,detail:'Chrome looks appear in more than half of the Gala’s top 20 demo posts.',image:'gala'},
  {id:'nano',title:'Will NanoQ sell out its first drop?',category:'Brands',yes:42,asset:'NANOQ',closes:2,outcome:false,detail:'The NanoQ companion drop sells all 5,000 units by demo day 2.',image:'nano'},
  {id:'auris',title:'Will Auris reach 3M followers?',category:'Influencers',yes:81,asset:'AURA',closes:5,outcome:true,detail:'Auris Veil crosses 3 million followers by the end of demo day 5.',image:'auris'},
  {id:'street',title:'Will archive fashion take the lead?',category:'Reality mirror',yes:57,asset:'STRT',closes:3,outcome:false,detail:'Archive-fashion attention outpaces new-drop attention in our simulated culture index.',image:'shoes'},
  {id:'neon',title:'Will Neon FM discover a breakout?',category:'Music',yes:63,asset:'NEON',closes:4,outcome:true,detail:'An independent release reaches the city’s top 10 before demo day 4 closes.',image:'music'}
];
export const properties = [
  {id:'prime',name:'Prime Square',district:'Prime Square',kind:'Flagship storefront',price:4800,traffic:'42K',size:'120 m²',yield:0,description:'The city’s most visible corner. Your flagship, your audience, your address.'},
  {id:'billboard',name:'The Skyline Board',district:'Prime Square',kind:'Digital billboard',price:2400,traffic:'86K',size:'24 × 12 m',yield:0,description:'A high-visibility billboard above Virtu City’s busiest walkway.'},
  {id:'valley',name:'Chrome Corner',district:'Valleywood',kind:'Fashion pop-up',price:3600,traffic:'31K',size:'80 m²',yield:0,description:'A fashion address steps away from the Chrome Carpet.'},
  {id:'venue',name:'The Afterglow',district:'Valleywood',kind:'Event venue',price:6500,traffic:'19K',size:'400 capacity',yield:0,description:'Drops, shows, and after-parties. Make a moment the whole city sees.'},
  {id:'terminal',name:'Terminal Studio 04',district:'The Terminal',kind:'Creator studio',price:1800,traffic:'12K',size:'60 m²',yield:0,description:'A home for independent creators, livestreams, and experiments.'},
  {id:'nimbus',name:'Nimbus Observatory',district:'Prime Square',kind:'Premium brand suite',price:8200,traffic:'58K',size:'200 m²',yield:0,description:'A signature presence above the city. An address designed to be noticed.'}
];
export const challenges = [
  {id:'firstmoves',title:'Make your first moves',tag:'Trading',reward:200,target:2,description:'Complete two market trades. Find something you believe in, then make your move.',kind:'trades',color:'violet'},
  {id:'frontrow',title:'Get on the front row',tag:'Fashion',reward:300,target:1,description:'Add a fashion asset to your portfolio. The next wave starts somewhere.',kind:'fashion',color:'coral'},
  {id:'citybuilder',title:'Put yourself on the map',tag:'Virtu City',reward:500,target:1,description:'Acquire your first Virtu City property and claim an address.',kind:'property',color:'blue'}
];
export const placements = [
  {id:'discover',name:'Discover takeover',location:'SMSX Discover',cost:450,reach:'24K',description:'Your brand in the first placement people see.'},
  {id:'square',name:'Prime Square billboard',location:'Virtu City',cost:280,reach:'18K',description:'Stand out in the city’s busiest digital district.'},
  {id:'event',name:'Event spotlight',location:'Events & Bets',cost:180,reach:'11K',description:'Be part of the cultural conversation.'}
];
export const scenarioNames=['Opening bell','The NanoQ drop','ClimeCore goes citywide','The Meta Gala','Auris hits her stride','The next wave'];
export function pricesAt(day) {
  return Object.fromEntries(assets.map((a,i)=>[a.id,Math.round(a.price * (1 + (day ? (((i*7+day*11)%19)-6)*.006 + day*.012 : 0))*100)/100]));
}
export function assetHistory(asset,day=0) {
  const end=pricesAt(day)[asset.id], start=end/(1+asset.change/100);
  return Array.from({length:32},(_,i)=>Number((start+(end-start)*i/31+Math.sin(i*1.83+asset.price)*end*.008*(i===31?0:1)).toFixed(3)));
}
