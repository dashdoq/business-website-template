export const company = {name:'INGBELG',phone:'+32 488 87 60 61',phoneHref:'tel:+32488876061',email:'info@ingbelg.be',whatsapp:'https://wa.me/32488876061',address:'Hoogstraat 59, 9620 Zottegem',source:'https://ingbelg.be/'};
export const projects = [
 {image:'/images/work-01.webp',title:'The roof, renewed.',tag:'Pitched roof',description:'An aerial view of three homes with grey pitched roofs and solar panels.',era:'now'},
 {image:'/images/work-02.webp',title:'Every detail matters.',tag:'Roofing craftsmanship',description:'A new dark tiled roof with the INGBELG team and van outside the home.',era:'now'},
 {image:'/images/work-03.webp',title:'A new perspective.',tag:'Aerial view',description:'A tiled roof with roof windows, a flat roof with a skylight, and a pyramid-roofed extension.',era:'now'},
 {image:'/images/work-04.webp',title:'Built to protect.',tag:'Roof renovation',description:'Another angle on the same completed roof shown in the aerial view.',era:'now'},
 {image:'/images/work-06.webp',title:'A familiar roof, renewed.',tag:'Roof construction',description:'A brown tiled roof and roof window, with the INGBELG van outside.',era:'then'},
 {image:'/images/work-13.webp',title:'Craft, up close.',tag:'Project detail',description:'A timber cornice with a decorative dentil detail along the roof edge.',era:'then'}
];
export const services = [
 {name:'Pitched roofs',short:'The first line of protection.',description:'Roof tiles, timber structures, roof windows and the details that keep your home weatherproof.',details:['Tiles and slates','Timber roof structures','Dormers and roof windows'],object:'roof'},
 {name:'Flat roofs',short:'Clean lines. Complete protection.',description:'EPDM and bituminous roof systems, carefully finished around edges, outlets and upstands.',details:['EPDM and bitumen','Drainage and roof edges','Roof repairs'],object:'flat'},
 {name:'Insulation',short:'Comfort starts underneath.',description:'A layered approach to roof insulation, with attention to moisture, airtightness and the existing structure.',details:['Roof insulation','Airtight details','Renovation advice'],object:'insulation'},
 {name:'Renovation',short:'Give good buildings a future.',description:'Roof repairs, carpentry and façade cladding, coordinated by one team from survey to finish.',details:['Roof repairs','Façade cladding','Carpentry and dormers'],object:'frame'},
 {name:'Asbestos removal',short:'A carefully managed new beginning.',description:'Assessment and appropriate asbestos removal, coordinated with the replacement of your roof.',details:['Site assessment','Controlled removal','Roof replacement'],object:'brick'}
];
export const facts = [
 {category:'BUILDING PRESERVATION',title:'Good repair starts with the cause.',text:'Before covering a damp patch, find out where the moisture entered. A fresh finish cannot fix the source.'},
 {category:'MATERIAL MATTERS',title:'A roof is more than its tiles.',text:'The visible surface works together with structure, insulation, membranes, ventilation and drainage.'},
 {category:'THEN & NOW',title:'Keep what still works.',text:'Inspect existing timber before planning a replacement. Repairing individual elements can preserve the character of a roof.'},
 {category:'SMALL DETAILS',title:'Water always needs a way out.',text:'Clear gutters and outlets are part of roof maintenance. Ask a professional to inspect areas you cannot reach safely.'}
];
export const projectTypes=['Roof renovation','Complete roof replacement','Flat roof','Pitched roof','Interior renovation','Exterior renovation','Complete renovation','Insulation','Bathroom','Kitchen','Other'] as const;
export type EstimateConfig={type:string;area:number;condition:string;finish:string;extras:string[]};
export const defaultEstimate:EstimateConfig={type:'Pitched roof',area:100,condition:'Moderate',finish:'Standard',extras:['Roof insulation']};
const rates:Record<string,number>={'Roof renovation':100,'Complete roof replacement':220,'Flat roof':115,'Pitched roof':165,'Interior renovation':480,'Exterior renovation':150,'Complete renovation':1100,'Insulation':55,'Bathroom':1050,'Kitchen':850};
export const extraOptions=['Roof insulation','Scaffolding','Demolition','Waste removal','Solar preparation','Roof windows','Chimney work'];
export function calculateEstimate(c:EstimateConfig){
 if(c.type==='Other')return null;
 const base=rates[c.type];if(!base||!Number.isFinite(c.area)||c.area<5||c.area>1000)return null;
 const condition=c.condition==='Good'?0.9:c.condition==='Major renovation'?1.3:1;
 const finish=c.finish==='Essential'?0.85:c.finish==='Premium'?1.35:1;
 const extras=c.extras.reduce((sum,x)=>sum+(x==='Roof insulation'?(c.type==='Insulation'?0:c.area*40):x==='Scaffolding'?1500:x==='Demolition'?c.area*22:x==='Waste removal'?650:x==='Solar preparation'?950:x==='Roof windows'?1600:x==='Chimney work'?950:0),0);
 const mid=base*c.area*condition*finish+extras;
 return {low:Math.round(mid*.82/100)*100,high:Math.round(mid*1.22/100)*100};
}
export const euros=(n:number)=>new Intl.NumberFormat('nl-BE',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(n);
