// Mijn VerbouwPremie: owner-occupiers, individual housing, applications 1 March–31 December 2026.
// Sources are linked beside each work category in Premculator. Last checked 15 October 2026.
export const PREMIUM_SOURCES = {
  income:'https://www.vlaanderen.be/bouwen-wonen-en-energie/bouwen-en-verbouwen/premies-voor-renovatie/mijn-verbouwpremie/wie-in-aanmerking-komt-voor-mijn-verbouwpremie/mijn-verbouwpremie-voor-eigenaar-bewoner',
  roof:'https://www.vlaanderen.be/bouwen-wonen-en-energie/bouwen-en-verbouwen/premies-voor-renovatie/mijn-verbouwpremie/mijn-verbouwpremie-voor-dak',
  wall:'https://www.vlaanderen.be/bouwen-wonen-en-energie/bouwen-en-verbouwen/premies-voor-renovatie/mijn-verbouwpremie/mijn-verbouwpremie-voor-buitenmuur',
  floor:'https://www.vlaanderen.be/bouwen-wonen-en-energie/bouwen-en-verbouwen/premies-voor-renovatie/mijn-verbouwpremie/mijn-verbouwpremie-voor-vloer',
  windows:'https://www.vlaanderen.be/bouwen-wonen-en-energie/bouwen-en-verbouwen/premies-voor-renovatie/mijn-verbouwpremie/mijn-verbouwpremie-voor-ramen-en-deuren',
  simulator:'https://apps.energiesparen.be/simulator-mijnverbouwpremie',
};
export const PREMIUM_WORKS = ['roof','wall','floor','windows'] as const;
export type PremiumWork = typeof PREMIUM_WORKS[number];
export const PREMIUM_CAPS:Record<PremiumWork,number> = {roof:11500,wall:10000,floor:3000,windows:10500};
export type PremiumInput = {
  date:string; income:number; household:'single'|'multiple'; dependants:number; extraProperty:boolean;
  costs:Partial<Record<PremiumWork,number>>; asbestosArea:number;
};
export function premiumCategory(income:number, household:PremiumInput['household'], dependants:number, extraProperty:boolean) {
  if (!Number.isFinite(income) || income<0 || !Number.isInteger(dependants) || dependants<0 || dependants>20) return null;
  if (extraProperty) return 1;
  const solo=household==='single'&&dependants===0;
  const extra=solo?0:4420*Math.max(0,dependants-(household==='single'?1:0));
  const limits=solo?[24750,43240,55020]:[37110+extra,60520+extra,78610+extra];
  return income<=limits[0]?4:income<=limits[1]?3:income<=limits[2]?2:1;
}
export function calculatePremium(p:PremiumInput) {
  const date=Date.parse(p.date+'T12:00:00Z');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(p.date) || !Number.isFinite(date) || new Date(date).toISOString().slice(0,10)!==p.date || p.date<'2026-03-01' || p.date>'2026-12-31') return null;
  const category=premiumCategory(p.income,p.household,p.dependants,p.extraProperty);
  if (!category || !Number.isFinite(p.asbestosArea) || p.asbestosArea<0 || p.asbestosArea>10000) return null;
  const selected=PREMIUM_WORKS.filter(id=>p.costs[id]!==undefined);
  if (!selected.length || selected.some(id=>!Number.isFinite(p.costs[id]) || p.costs[id]!<0 || p.costs[id]!>10000000)) return null;
  const rate=category===4?0.5:category===3?0.35:0;
  const rows=selected.map(id=>{
    const invoice=p.costs[id]!;
    const base=invoice>=1000?rate*Math.min(invoice,PREMIUM_CAPS[id]):0;
    const bonus=id==='roof'&&invoice>=1000&&rate>0?Math.max(0,Math.min(8*p.asbestosArea,0.5*invoice-base)):0;
    return {id,invoice,base,bonus,total:Math.round((base+bonus)*100)/100};
  });
  return {category,rate,rows,total:Math.round(rows.reduce((sum,row)=>sum+row.total,0)*100)/100};
}
