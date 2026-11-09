// Renculator allowances and calculation (unchanged from v1.0.9). Company and gallery data now live in app/content.
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
