import test from 'node:test';
import assert from 'node:assert/strict';
import {calculatePremium,premiumCategory} from '../app/premium-calculation.ts';
import {calculateWorkforce} from '../app/workforce-calculation.ts';
import {TOOL_IDS,TOOL_PATHS,toolFromPath,safeReturnPath} from '../app/tool-routing.ts';

const premium={date:'2026-10-15',income:20000,household:'single',dependants:0,extraProperty:false,costs:{roof:10000},asbestosArea:0};
test('income thresholds include their boundary and account for household/dependants',()=>{
  for(const [income,category] of [[24750,4],[24750.01,3],[43240,3],[43240.01,2],[55020,2],[55020.01,1]]) assert.equal(premiumCategory(income,'single',0,false),category);
  assert.equal(premiumCategory(37110,'single',1,false),4);
  assert.equal(premiumCategory(41530,'single',2,false),4);
  assert.equal(premiumCategory(41530,'multiple',1,false),4);
  assert.equal(premiumCategory(60520,'multiple',0,false),3);
  assert.equal(premiumCategory(78610,'multiple',0,false),2);
  assert.equal(premiumCategory(1000,'single',0,true),1);
});
test('eligible grants apply each cost cap and minimum invoice separately',()=>{
  assert.equal(calculatePremium(premium).total,5000);
  assert.equal(calculatePremium({...premium,costs:{roof:999.99}}).total,0);
  assert.equal(calculatePremium({...premium,costs:{roof:1000}}).total,500);
  assert.equal(calculatePremium({...premium,costs:{roof:20000,wall:20000,floor:20000,windows:20000}}).total,17500);
  assert.equal(calculatePremium({...premium,income:30000,costs:{roof:20000,wall:20000,floor:20000,windows:20000}}).total,12250);
  assert.equal(calculatePremium({...premium,income:50000}).total,0);
  assert.equal(calculatePremium({...premium,extraProperty:true}).total,0);
});
test('roof asbestos bonus is capped at half the invoice and never applied to other categories',()=>{
  const result=calculatePremium({...premium,income:30000,asbestosArea:1000});
  assert.equal(result.rows[0].base,3500);
  assert.equal(result.rows[0].bonus,1500);
  assert.equal(result.total,5000);
  assert.equal(calculatePremium({...premium,asbestosArea:1000}).total,5000);
  assert.equal(calculatePremium({...premium,costs:{roof:20000},asbestosArea:200}).total,7350);
  assert.equal(calculatePremium({...premium,costs:{wall:10000},asbestosArea:1000}).total,5000);
  assert.equal(calculatePremium({...premium,costs:{roof:999},asbestosArea:1000}).total,0);
});
test('premiums refuse unverified dates, invalid numbers and missing work',()=>{
  for(const date of ['2026-02-28','2027-01-01','2026-02-31','invalid','']) assert.equal(calculatePremium({...premium,date}),null);
  for(const date of ['2026-03-01','2026-12-31']) assert.ok(calculatePremium({...premium,date}));
  for(const income of [NaN,Infinity,-1]) assert.equal(calculatePremium({...premium,income}),null);
  assert.equal(calculatePremium({...premium,costs:{}}),null);
  assert.equal(calculatePremium({...premium,costs:{roof:NaN}}),null);
  assert.equal(calculatePremium({...premium,costs:{roof:-1000}}),null);
  assert.equal(calculatePremium({...premium,dependants:1.5}),null);
});

const work={area:100,rate:2,complexity:1,setupHours:16,bufferPercent:15,hoursPerDay:8,targetDays:15,minimumCrew:2,crew:2,serialPercent:10};
test('labour hours include setup and margin; deadline team is minimal',()=>{
  const result=calculateWorkforce(work);
  assert.ok(Math.abs(result.labourHours-248.4)<1e-8);
  assert.ok(Math.abs(result.selectedDays-17.0775)<1e-8);
  assert.equal(result.requiredCrew,3);
  assert.equal(result.meetsDeadline,false);
  assert.equal(calculateWorkforce({...work,crew:3}).meetsDeadline,true);
});
test('adding workers reduces duration without accelerating sequential work',()=>{
  let previous=Infinity;
  for(let crew=2;crew<=20;crew++){
    const result=calculateWorkforce({...work,crew});
    assert.ok(result.selectedDays<previous);
    assert.ok(result.selectedDays>=result.serialDays);
    assert.equal(result.labourHours,calculateWorkforce(work).labourHours);
    previous=result.selectedDays;
  }
  assert.equal(calculateWorkforce({...work,targetDays:1}).requiredCrew,null);
  assert.equal(calculateWorkforce({...work,serialPercent:0,targetDays:16}).requiredCrew,2);
});
test('minimum staffing is respected and invalid values do not yield results',()=>{
  assert.equal(calculateWorkforce({...work,minimumCrew:4,crew:4,targetDays:365}).requiredCrew,4);
  for(const patch of [{area:NaN},{area:0},{rate:-1},{crew:1},{crew:2.5},{crew:21},{targetDays:0},{hoursPerDay:13},{serialPercent:100},{bufferPercent:Infinity}]) assert.equal(calculateWorkforce({...work,...patch}),null);
});
test('each calculator has a unique exact deep link and safe return navigation',()=>{
  assert.equal(new Set(Object.values(TOOL_PATHS)).size,3);
  for(const tool of TOOL_IDS){assert.equal(toolFromPath(TOOL_PATHS[tool]),tool);assert.equal(toolFromPath(TOOL_PATHS[tool]+'/'),tool);assert.equal(safeReturnPath(TOOL_PATHS[tool]),'/')}
  assert.equal(toolFromPath('/zottetools/unknown'),null);
  assert.equal(toolFromPath('/other/renculator'),null);
  assert.equal(safeReturnPath('/?lang=fr#contact'),'/?lang=fr#contact');
  for(const path of ['https://example.com','//example.com','/\\example.com','/\nexample.com',null]) assert.equal(safeReturnPath(path),'/');
});
