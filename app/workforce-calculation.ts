// Editable planning assumptions, not contractual productivity or legal staffing requirements.
export const LABOUR_PRESETS = [
  {id:'Roof renovation', rate:1.5, crew:2},
  {id:'Complete roof replacement', rate:2.8, crew:3},
  {id:'Flat roof', rate:1.2, crew:2},
  {id:'Pitched roof', rate:2, crew:2},
  {id:'Interior renovation', rate:3, crew:2},
  {id:'Exterior renovation', rate:1.6, crew:2},
  {id:'Complete renovation', rate:6, crew:3},
  {id:'Insulation', rate:0.65, crew:2},
  {id:'Bathroom', rate:5, crew:2},
  {id:'Kitchen', rate:4, crew:2},
  {id:'Other', rate:1, crew:1},
] as const;
export const MAX_CREW = 20;
export type WorkforceInput = {
  area:number; rate:number; complexity:number; setupHours:number; bufferPercent:number;
  hoursPerDay:number; targetDays:number; minimumCrew:number; crew:number; serialPercent:number;
};
export function calculateWorkforce(p: WorkforceInput) {
  if (Object.values(p).some(v => !Number.isFinite(v)) || p.area<=0 || p.area>10000 || p.rate<=0 || p.rate>100 ||
      p.complexity<0.5 || p.complexity>2 || p.setupHours<0 || p.setupHours>1000 || p.bufferPercent<0 || p.bufferPercent>100 ||
      p.hoursPerDay<1 || p.hoursPerDay>12 || p.targetDays<1 || p.targetDays>365 || !Number.isInteger(p.minimumCrew) ||
      p.minimumCrew<1 || p.minimumCrew>MAX_CREW || !Number.isInteger(p.crew) || p.crew<p.minimumCrew || p.crew>MAX_CREW ||
      p.serialPercent<0 || p.serialPercent>80) return null;
  const labourHours = (p.area*p.rate*p.complexity+p.setupHours)*(1+p.bufferPercent/100);
  const serial = p.serialPercent/100;
  const duration = (crew:number) => labourHours / p.hoursPerDay * (serial+(1-serial)/crew);
  const baselineDays = duration(p.minimumCrew), selectedDays=duration(p.crew), shortestDays=duration(MAX_CREW);
  let requiredCrew:number|null = null;
  for(let crew=p.minimumCrew; crew<=MAX_CREW; crew++) {
    if(duration(crew)<=p.targetDays+1e-9) { requiredCrew=crew; break; }
  }
  const savedDays=Math.max(0,baselineDays-selectedDays);
  return {labourHours,baselineDays,selectedDays,shortestDays,requiredCrew,savedDays,
    savingsPercent:baselineDays?Math.round(savedDays/baselineDays*100):0,
    meetsDeadline:selectedDays<=p.targetDays+1e-9, serialDays:labourHours/p.hoursPerDay*serial};
}
