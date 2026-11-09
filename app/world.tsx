'use client';
import { Component, Suspense, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import { Environment, Lightformer, Line, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { projects, type EstimateConfig } from './project-data';
export type WorldState={progress:number;pointer:{x:number;y:number};reduced:boolean;paused:boolean;mobile:boolean;exploded:boolean;service:number;gallery:number;era:string;quality:boolean;interaction:number};
const RED='#d61f26',WHITE='#dedbd3',METAL='#61686c';
const ease=(a:number,b:number,v:number)=>THREE.MathUtils.smoothstep(v,a,b);
function Box({at=[0,0,0],size=[1,1,1],color=WHITE,metal=0,rough=.65,rotation=[0,0,0],...props}:any){return <mesh position={at} rotation={rotation} castShadow receiveShadow {...props}><boxGeometry args={size}/><meshStandardMaterial color={color} metalness={metal} roughness={rough}/></mesh>}
function Beam({from,to,width=.085,color=WHITE}: {from:number[];to:number[];width?:number;color?:string}){
 const {pos,quaternion,length}=useMemo(()=>{const a=new THREE.Vector3(...from),b=new THREE.Vector3(...to),d=b.clone().sub(a);return {pos:a.add(b).multiplyScalar(.5),length:d.length(),quaternion:new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize())}},[from.join(),to.join()]);
 return <mesh position={pos} quaternion={quaternion} castShadow><boxGeometry args={[width,length,width]}/><meshStandardMaterial color={color} roughness={.45} metalness={.35}/></mesh>
}
function Brickwork({split,state}:{split:React.RefObject<number>;state:WorldState}){
 const mesh=useRef<THREE.InstancedMesh>(null);const pulse=useRef(0);const animationTime=useRef(0);
 const bricks=useMemo(()=>{const a:{x:number;y:number;z:number;ry:number;seed:number}[]=[];const rows=state.mobile?9:12, bh=2.45/rows;
 for(let r=0;r<rows;r++){for(let j=0;j<16;j++){let x=-2.13+j*.278+(r%2)*.075;
 a.push({x,y:.12+r*bh,z:-1.67,ry:0,seed:Math.sin(j*78+r*18)*.5+.5});
 if(j<4||j>12||r>rows-3)a.push({x,y:.12+r*bh,z:1.67,ry:0,seed:Math.cos(j*4+r*2)*.5+.5});}
 for(let j=0;j<11;j++)for(const side of [-1,1])a.push({x:side*2.15,y:.12+r*bh,z:-1.5+j*.288,ry:Math.PI/2,seed:Math.sin(j*19+r*47)*.5+.5})}return a},[state.mobile]);
 const tmp=useMemo(()=>new THREE.Object3D(),[]);
 useEffect(()=>{if(!mesh.current)return;const c=new THREE.Color();bricks.forEach((b,i)=>{c.set('#a64b33').multiplyScalar(.75+b.seed*.38);mesh.current!.setColorAt(i,c)});if(mesh.current.instanceColor)mesh.current.instanceColor.needsUpdate=true},[bricks]);
 useFrame((_,dt)=>{if(!mesh.current)return;if(!state.paused&&!state.reduced)animationTime.current+=dt;const t=animationTime.current;pulse.current=Math.max(0,pulse.current-dt*1.3);const bump=pulse.current;bricks.forEach((b,i)=>{let f=split.current;let drift=f*Math.max(0,(b.seed-.55))*1.4;const arrival=state.reduced?0:1-ease(.15+b.seed,3.6+b.seed,t);const flight=arrival*2.5+f*Math.max(0,(b.y-1.6))*.25;tmp.position.set(b.x*(1+drift*.1)+arrival*Math.sin(i)*.8,b.y+(f*.05*b.y)+flight+(b.seed>.85?Math.sin(t*.65+i)*.025*f:0)+Math.sin(bump*Math.PI)*.18,b.z*(1+drift*.1)+arrival*Math.cos(i)*.6);tmp.rotation.set(0,b.ry+(b.seed>.94?f*.07:0),0);tmp.updateMatrix();mesh.current!.setMatrixAt(i,tmp.matrix)});mesh.current.instanceMatrix.needsUpdate=true});
 return <instancedMesh ref={mesh} args={[undefined,undefined,bricks.length]} castShadow receiveShadow onClick={e=>{e.stopPropagation();pulse.current=1;state.interaction++}}><boxGeometry args={[.264,2.45/(state.mobile?9:12)-.018,.17]}/><meshStandardMaterial roughness={.92}/></instancedMesh>
}
function Roof({split,flat=false,premium=false,insulated=true,windows=true,solar=false,chimney=true,insulationHighlight=false,selected=false}:{split:React.RefObject<number>;flat?:boolean;premium?:boolean;insulated?:boolean;windows?:boolean;solar?:boolean;chimney?:boolean;insulationHighlight?:boolean;selected?:boolean}){
 const root=useRef<THREE.Group>(null),under=useRef<THREE.Group>(null),roof=useRef<THREE.Group>(null);const hit=useRef(0);
 useFrame((_,dt)=>{if(root.current)root.current.position.y=3.02+split.current*.9;if(under.current)under.current.position.y=split.current*.34;if(roof.current)roof.current.position.y=split.current*.9;hit.current=THREE.MathUtils.damp(hit.current,0,5,dt);if(roof.current)roof.current.rotation.z=hit.current*.03});
 return <group ref={root}>
 <group ref={under}>{[-1.55,-.78,0,.78,1.55].map((z,i)=><group key={i}>{!flat&&<><Beam from={[-2.42,0,z]} to={[0,1.4,z]} width={.105} color="#b2a087"/><Beam from={[0,1.4,z]} to={[2.42,0,z]} width={.105} color="#b2a087"/><Beam from={[-1.3,0,z]} to={[0,1.4,z]} width={.07} color="#9d8b72"/><Beam from={[1.3,0,z]} to={[0,1.4,z]} width={.07} color="#9d8b72"/></>}<Beam from={[-2.42,0,z]} to={[2.42,0,z]} color="#b2a087"/></group>)}</group>
 <group ref={roof} onClick={e=>{e.stopPropagation();hit.current=1}}>
 {flat?<><Box at={[0,.1,0]} size={[5.05,.22,4]} color={premium?'#bfc4c5':'#373c40'}/><Box at={[0,.27,0]} size={[4.85,.07,3.8]} color="#4b5157"/>{windows&&<Box at={[.7,.45,.4]} size={[1.3,.18,1.2]} color="#8eafb7" metal={.75} rough={.1}/>}</>:<>
 {[-1,1].map(side=><group key={side} position={[side*1.22,.69,0]} rotation={[0,0,side*Math.atan2(-1.4,2.44)]}>
 {insulated&&<Box at={[0,-.095,0]} size={[2.79,insulationHighlight?.27:.15,4]} color={insulationHighlight?'#f4b94b':'#b99553'}/>}
 <Box size={[2.86,.07,4.05]} color="#4d4e4b"/>
 {Array.from({length:8},(_,i)=><group key={i} position={[-1.24+i*.355,.095,0]}><Box size={[.35,.06,4.08]} color={selected?RED:premium?'#a82b28':'#31383d'} metal={.65} rough={.38}/><Box at={[-.16,.065,0]} size={[.025,.09,4.08]} color={premium?'#bf3c35':'#50595e'} metal={.55}/></group>)}
 <Box at={[0,.04,2.065]} size={[2.9,.14,.075]} color={RED} metal={.3}/>
 {solar&&side===-1&&<group position={[.15,.24,0]}><Box size={[1.75,.12,2.9]} color="#c4cbd0" metal={.7}/><Box at={[0,.075,0]} size={[1.65,.03,2.8]} color="#223e51" metal={.7} rough={.2}/>{[-.5,0,.5].map(z=><Box key={z} at={[0,.1,z]} size={[1.65,.014,.018]} color="#738c9c"/>)}</group>}{windows&&side===1&&<group position={[.25,.18,.55]}><Box size={[1.0,.12,1.35]} color="#b2b5b0" metal={.7}/><Box at={[0,.075,0]} size={[.86,.02,1.19]} color="#526e77" metal={.8} rough={.12}/><Box at={[0,.1,0]} size={[.025,.02,1.2]} color="#1b2429"/></group>}
 </group>)}<Beam from={[0,1.5,-2.07]} to={[0,1.5,2.07]} width={.13} color="#535a60"/>
 {chimney&&<><Box at={[-1.2,1.45,-.7]} size={[.46,1.3,.5]} color="#bfc0b9"/><Box at={[-1.2,2.12,-.7]} size={[.65,.09,.65]} color="#373a3b"/></>}
 </>}
 </group></group>
}
export function House({state,mini=false,config}:{state:WorldState;mini?:boolean;config?:EstimateConfig}){
 const root=useRef<THREE.Group>(null),slab=useRef<THREE.Group>(null);const split=useRef(1.25);const motionTime=useRef(0);
 useFrame(({clock},dt)=>{if(!state.paused&&!state.reduced)motionTime.current+=dt;const intro=state.reduced?1:ease(0,4.6,motionTime.current);const p=state.progress;const target=mini?(config?.extras.includes('Roof insulation')?.16:0):state.exploded?(p<1?1.05:(1-ease(2.7,3.5,p))*.8+.2):0;
 split.current=THREE.MathUtils.damp(split.current,target,3.5,dt);
 if(root.current){root.current.scale.setScalar(mini?.62*THREE.MathUtils.clamp(Math.sqrt((config?.area??100)/100),.75,1.2):1);if(!mini){root.current.position.set(state.mobile?0:3.15,-1.42,-ease(1.45,1.9,p)*4+ease(2.7,3.2,p)*4);root.current.rotation.y=(state.reduced?0:Math.sin(motionTime.current*.075)*.018)+p*.12;root.current.visible=!(p>1.86&&p<2.68)}else root.current.position.set(0,-1.4,0)}
 if(slab.current)slab.current.position.y=(1-intro)*-.8;
 });
 return <group ref={root}>
 <group ref={slab}><Box at={[0,-.28,0]} size={[5.45,.38,4.35]} color="#aaa9a4" rough={.97}/><Box at={[0,-.48,0]} size={[5.6,.09,4.5]} color="#353a3d"/><Box at={[0,-.05,0]} size={[4.7,.08,3.7]} color="#c7c2b9"/></group>
 <Brickwork split={split} state={state}/>
 {[-2.25,2.25].map(x=>[-1.78,1.78].map(z=><Box key={`${x}${z}`} at={[x,1.38,z]} size={[.12,2.88,.12]} color="#d2d3cb" metal={.45}/>))}
 <Box at={[0,2.83,0]} size={[4.72,.15,3.76]} color="#d4d1c8"/>
 <Box at={[.3,1.14,1.68]} size={[2.46,2.25,.045]} color="#3c5053" metal={.73} rough={.17}/>
 {[-.94,.32,1.54].map(x=><Box key={x} at={[x,1.15,1.74]} size={[.055,2.36,.07]} color="#abb3b3" metal={.75}/>)}
 <Box at={[.31,2.3,1.75]} size={[2.55,.05,.07]} color="#c6c3b9"/><Box at={[.31,.015,1.75]} size={[2.55,.05,.07]} color="#c6c3b9"/>
 <Box at={[.3,.13,2.05]} size={[2.7,.16,.53]} color="#d0cbc1"/>
 <Box at={[.3,.025,2.4]} size={[3,.13,.5]} color="#a9a8a1"/>
 {config?.extras.includes('Scaffolding')&&<group position={[-2.8,0,0]}>{[-2,2].map(z=><group key={z}><Beam from={[0,-.2,z]} to={[0,4,z]} width={.07} color="#aaaeb0"/><Beam from={[0,0,z]} to={[0,4,-z]} width={.04} color="#a1a7a8"/></group>)}<Box at={[0,1.4,0]} size={[.8,.08,4.2]} color="#aaa08b"/></group>}<pointLight position={[0,1.3,.7]} color="#ffb36c" intensity={4} distance={4}/>
 <Roof split={split} solar={!!config?.extras.includes('Solar preparation')} chimney={config?config.extras.includes('Chimney work'):true} insulationHighlight={!mini&&state.service===2} flat={config?.type==='Flat roof'||state.service===1} premium={config?.finish==='Premium'} insulated={config?config.extras.includes('Roof insulation')||config.type==='Insulation':true} windows={config?config.extras.includes('Roof windows'):true} selected={!mini&&state.progress>.65&&state.progress<1.65&&state.service===0}/>
 </group>
}
function Tool({kind,position,state}:{kind:'hammer'|'drill'|'tape';position:[number,number,number];state:WorldState}){
 const ref=useRef<THREE.Group>(null),spin=useRef(0),hover=useRef(false),localTime=useRef(0);
 useFrame((_,dt)=>{if(!ref.current)return;if(!state.paused&&!state.reduced)localTime.current+=dt;const t=localTime.current;ref.current.position.set(position[0]+(hover.current?.12:0),position[1]+Math.sin(t*.7+position[0])*.13,position[2]);ref.current.rotation.y=t*.1+spin.current;ref.current.rotation.z=Math.sin(t*.5)*.08;spin.current=THREE.MathUtils.damp(spin.current,0,2,dt);ref.current.visible=state.progress<1.75||state.progress>2.8});
 return <group ref={ref} onPointerOver={e=>{e.stopPropagation();hover.current=true;document.body.style.cursor='pointer'}} onPointerOut={()=>{hover.current=false;document.body.style.cursor=''}} onClick={e=>{e.stopPropagation();spin.current+=Math.PI*2;state.interaction++}}>
 {kind==='hammer'?<group rotation={[0,0,-.45]}><Box size={[.15,1.35,.15]} color="#a28153"/><Box at={[0,.68,0]} size={[.65,.23,.26]} color="#aeb5b6" metal={.9} rough={.3}/><Box at={[0,-.55,0]} size={[.19,.4,.19]} color="#303336"/></group>:kind==='drill'?<group rotation={[0,0,-.2]}><RoundedBox args={[.65,.4,.35]} radius={.07}><meshStandardMaterial color={RED}/></RoundedBox><Box at={[-.17,-.32,0]} size={[.21,.55,.26]} color="#2c3031"/><Box at={[-.19,-.58,0]} size={[.4,.18,.39]} color={RED}/><mesh position={[.56,0,0]} rotation={[0,0,Math.PI/2]}><cylinderGeometry args={[.035,.035,.62,8]}/><meshStandardMaterial color="#bfc4c7" metalness={.9} roughness={.25}/></mesh></group>:<><RoundedBox args={[.65,.52,.38]} radius={.12}><meshStandardMaterial color="#f06522"/></RoundedBox><Box at={[.47,-.15,0]} size={[.48,.025,.17]} color="#ddd5ac"/><Box at={[0,.02,.2]} size={[.3,.23,.025]} color="#20272a"/></>}
 </group>
}
function Crane({state}:{state:WorldState}){
 const jib=useRef<THREE.Group>(null);useFrame(({clock})=>{if(jib.current&&!state.paused&&!state.reduced)jib.current.rotation.y=.1+Math.sin(clock.elapsedTime*.12)*.13});
 return <group position={[-6,-1.5,-8]} scale={.8}>
 {[0,1,2,3,4,5,6,7].map(y=><group key={y}><Beam from={[-.25,y,-.25]} to={[.25,y+1,-.25]} width={.035} color="#87451f"/><Beam from={[-.25,y,.25]} to={[.25,y+1,.25]} width={.035} color="#87451f"/>{[-.25,.25].map(x=><Box key={x} at={[x,y+.5,0]} size={[.07,1,.5]} color="#483829"/>)}</group>)}
 <group ref={jib} position={[0,8,0]}><Box size={[10,.22,.4]} color="#815231"/>{Array.from({length:13},(_,i)=><Beam key={i} from={[-4.8+i*.8,0,0]} to={[-4.4+i*.8,.65,0]} width={.06} color="#9a542c"/>)}<Box at={[0,.65,0]} size={[10,.08,.15]} color="#8b4a24"/><Box at={[-3.5,-.4,0]} size={[1.4,.65,1]} color="#494d4c"/><Beam from={[3,.1,0]} to={[3,-3.5,0]} width={.018} color="#8c8b7f"/><Box at={[3,-3.6,0]} size={[.12,.2,.12]} color="#bd7737"/></group>
 </group>
}
function Atmosphere({state}:{state:WorldState}){
 const ref=useRef<THREE.Points>(null);const positions=useMemo(()=>{const n=state.mobile?55:160;const a=new Float32Array(n*3);for(let i=0;i<n;i++){a[i*3]=Math.sin(i*123.7)*16;a[i*3+1]=(Math.cos(i*56.8)+1)*5;a[i*3+2]=Math.sin(i*17.3)*12}return a},[state.mobile]);
 useFrame((_,dt)=>{if(ref.current){ref.current.visible=!state.reduced&&state.quality;if(!state.paused)ref.current.rotation.y+=dt*.008}});
 return <points ref={ref}><bufferGeometry><bufferAttribute attach="attributes-position" args={[positions,3]}/></bufferGeometry><pointsMaterial size={.024} color="#e9b277" transparent opacity={.4} depthWrite={false}/></points>
}
function PhotoBoard({index,selected,onSelect,state}:{index:number;selected:number;onSelect:(n:number)=>void;state:WorldState}){
 const texture=useLoader(THREE.TextureLoader,projects[index].image);texture.colorSpace=THREE.SRGBColorSpace;
 const ref=useRef<THREE.Group>(null);const i=(index-selected+projects.length)%projects.length;const offset=i>3?i-projects.length:i;
 useFrame((_,dt)=>{if(!ref.current)return;const show=state.progress>1.65&&state.progress<2.8;ref.current.visible=show&&Math.abs(offset)<2;if(!show)return;
 ref.current.position.x=THREE.MathUtils.damp(ref.current.position.x,offset*5.4+(state.mobile?0:1),4,dt);
 ref.current.position.y=THREE.MathUtils.damp(ref.current.position.y,state.mobile?.35:1.0,4,dt);
 ref.current.position.z=THREE.MathUtils.damp(ref.current.position.z,Math.abs(offset)*-2.3,4,dt);
 ref.current.rotation.y=THREE.MathUtils.damp(ref.current.rotation.y,offset*-.26,4,dt);
 });
 return <group ref={ref} onClick={e=>{e.stopPropagation();onSelect(index)}}><Box size={[5.1,3.15,.16]} color="#373b3d" metal={.7}/><mesh position={[0,0,.09]}><planeGeometry args={[4.95,2.98]}/><meshBasicMaterial map={texture}/></mesh><Box at={[0,-1.7,0]} size={[5.1,.045,.045]} color={RED}/><Beam from={[-2.1,1.6,-.04]} to={[-2.1,6,-.04]} width={.012} color="#9d9e99"/><Beam from={[2.1,1.6,-.04]} to={[2.1,6,-.04]} width={.012} color="#9d9e99"/></group>
}
function Rig({state}:{state:WorldState}){
 const {camera,gl,size}=useThree();const target=useMemo(()=>new THREE.Vector3(),[]);const cameraPos=useMemo(()=>new THREE.Vector3(),[]);const qualityTimer=useRef({time:0,frames:0,changed:false});
 useFrame((_,dt)=>{const p=state.progress;const gallery=ease(1.55,1.95,p)*(1-ease(2.6,2.95,p));
 const px=state.reduced?0:state.pointer.x*.28,py=state.reduced?0:state.pointer.y*.16;
 const wide=state.mobile?1.25:1;
 cameraPos.set(THREE.MathUtils.lerp(state.mobile?6.5:8.5,0,gallery)+px,THREE.MathUtils.lerp(6.7,2.2,gallery)+py,THREE.MathUtils.lerp(12.5,12,gallery)*wide);
 target.set(0,state.mobile?THREE.MathUtils.lerp(5.4,3.5,gallery):1.6,0);
 const fit=state.mobile?1:Math.max(1,1.6/(size.width/Math.max(1,size.height)));
 cameraPos.sub(target).multiplyScalar(fit).add(target);
 camera.position.lerp(cameraPos,state.reduced?1:1-Math.exp(-dt*3));camera.lookAt(target);
 const q=qualityTimer.current;if(!q.changed&&dt<.3){q.time+=dt;q.frames++;if(q.time>5){q.changed=true;if(q.frames/q.time<34){gl.setPixelRatio(1);state.quality=false}}}
 });return null
}
function Scene({state,onGallery}:{state:WorldState;onGallery:(n:number)=>void}){
 return <><color attach="background" args={['#17191c']}/><fog attach="fog" args={['#17191c',17,40]}/><ambientLight intensity={.7}/><hemisphereLight args={['#e8e4da','#1c1713',1.3]}/><directionalLight position={[-3,10,7]} intensity={3.8} color="#fff0d9" castShadow shadow-mapSize={[state.mobile?512:1024,state.mobile?512:1024]} shadow-camera-left={-9} shadow-camera-right={9} shadow-camera-top={9} shadow-camera-bottom={-9} shadow-normalBias={.055}/><spotLight position={[9,4,-4]} color="#d63d22" intensity={85} angle={.7} penumbra={1}/><pointLight position={[0,6,-5]} color="#c0ced9" intensity={20}/>
 <Environment resolution={128} frames={1}><Lightformer form="rect" intensity={2.7} position={[0,6,4]} scale={[12,6,1]}/><Lightformer form="rect" color="#f29c72" intensity={1} position={[-6,0,3]} rotation={[0,Math.PI/2,0]} scale={[6,3,1]}/></Environment>
 <mesh rotation={[-Math.PI/2,0,0]} position={[0,-2,0]} receiveShadow><planeGeometry args={[100,100]}/><meshStandardMaterial color="#1d2023" roughness={.94}/></mesh>
 <gridHelper args={[55,55,'#3b3a35','#2b2e30']} position={[0,-1.98,0]}/>
 <group position={[2,-1.96,0]} rotation={[-Math.PI/2,0,0]}><mesh><ringGeometry args={[4.2,4.22,96]}/><meshBasicMaterial color="#7a543a" transparent opacity={.55}/></mesh><mesh><ringGeometry args={[4.4,4.408,96]}/><meshBasicMaterial color="#9f7052" transparent opacity={.25}/></mesh></group>
 <House state={state}/><Crane state={state}/>
 {<><Tool kind="hammer" position={[-1.4,2.4,1]} state={state}/><Tool kind="tape" position={[6.8,1.7,1]} state={state}/></>}
 <Tool kind="drill" position={[5.2,4.3,1.7]} state={state}/><Atmosphere state={state}/>
 <Suspense fallback={null}>{projects.map((_,i)=><PhotoBoard key={i} index={i} selected={state.gallery} state={state} onSelect={onGallery}/>)}</Suspense>
 <Rig state={state}/></>
}
class CanvasBoundary extends Component<{children:ReactNode;onFailure?:()=>void},{failed:boolean}>{state={failed:false};static getDerivedStateFromError(){return{failed:true}}componentDidCatch(){this.props.onFailure?.()}render(){return this.state.failed?null:this.props.children}}
export default function World({state,onGallery,onReady,onFailure}:{state:WorldState;onGallery:(n:number)=>void;onReady:()=>void;onFailure:()=>void}){
 return <CanvasBoundary onFailure={onFailure}><Canvas shadows={!state.mobile} dpr={[1,state.mobile?1.25:1.65]} camera={{position:[8.5,6.7,12.5],fov:38,near:.1,far:80}} gl={{antialias:true,alpha:false,powerPreference:'high-performance'}} onCreated={({gl})=>{gl.toneMapping=THREE.ACESFilmicToneMapping;gl.toneMappingExposure=1.05;gl.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();onFailure()});onReady()}} fallback={null}><Scene state={state} onGallery={onGallery}/></Canvas></CanvasBoundary>
}
export function MiniBuilding({config,reduced}:{config:EstimateConfig;reduced:boolean}){
 const s=useMemo<WorldState>(()=>({progress:0,pointer:{x:0,y:0},reduced,paused:false,mobile:true,exploded:false,service:-1,gallery:0,era:'now',quality:false,interaction:0}),[reduced]);
 return <CanvasBoundary><Canvas dpr={1} camera={{position:[6,4.8,7],fov:36}}><ambientLight intensity={2}/><directionalLight position={[2,6,5]} intensity={4}/><House state={s} mini config={config}/><MiniRig reduced={reduced}/></Canvas></CanvasBoundary>
}
function MiniRig({reduced}:{reduced:boolean}){useFrame(({camera,clock})=>{if(!reduced){camera.position.x=6+Math.sin(clock.elapsedTime*.2)*.3}camera.lookAt(0,.2,0)});return null}
export function BuilderMascot({mode='portal',reduced=false}:{mode?:string;reduced?:boolean}){
 return <CanvasBoundary><Canvas dpr={1} camera={{position:[0,1,5],fov:32}}><ambientLight intensity={2.2}/><directionalLight position={[3,5,4]} intensity={3}/><Mascot mode={mode} reduced={reduced}/></Canvas></CanvasBoundary>
}
function Mascot({mode,reduced}:{mode:string;reduced:boolean}){
 const r=useRef<THREE.Group>(null),arm=useRef<THREE.Group>(null);useFrame(({clock})=>{if(r.current&&!reduced){r.current.rotation.y=Math.sin(clock.elapsedTime*1.4)*.15;r.current.position.y=Math.sin(clock.elapsedTime*1.8)*.04;if(arm.current)arm.current.rotation.z=-.6+Math.sin(clock.elapsedTime*4)*.18}});
 return <group ref={r} position={[0,-.4,0]} scale={.9}>
 <RoundedBox args={[.85,.86,.55]} radius={.18} position={[0,-.02,0]}><meshStandardMaterial color="#d61f26" roughness={.48}/></RoundedBox>
 <mesh position={[0,.78,0]}><sphereGeometry args={[.44,20,16]}/><meshStandardMaterial color="#d4b58a"/></mesh>
 <mesh position={[0,1,0]}><sphereGeometry args={[.49,20,12,0,Math.PI*2,0,Math.PI/2]}/><meshStandardMaterial color="#f46b23" roughness={.38}/></mesh><Box at={[0,1,.16]} size={[1.04,.07,.76]} color="#f46b23"/>
 {[-.16,.16].map(x=><mesh key={x} position={[x,.82,.405]}><sphereGeometry args={[.055,10,8]}/><meshStandardMaterial color="#292e30"/></mesh>)}
 <Box at={[0,-.18,.29]} size={[.87,.12,.05]} color="#282f32"/><Box at={[0,-.18,.33]} size={[.18,.13,.035]} color="#b6b8b4" metal={.7}/>
 <group ref={arm} position={[.53,.2,0]} rotation={[0,0,-.7]}><Box at={[0,.15,0]} size={[.24,.6,.28]} color="#d61f26"/><mesh position={[0,.5,0]}><sphereGeometry args={[.15,12,10]}/><meshStandardMaterial color="#d4b58a"/></mesh></group>
 <Box at={[-.54,-.05,0]} size={[.24,.6,.28]} color="#d61f26"/>
 {[-.22,.22].map(x=><group key={x}><Box at={[x,-.66,0]} size={[.27,.48,.3]} color="#434c53"/><Box at={[x,-.93,.12]} size={[.34,.18,.48]} color="#20272c"/></group>)}
 <mesh rotation={[-Math.PI/2,0,0]} position={[0,-1.05,0]}><ringGeometry args={[.65,.75,32]}/><meshBasicMaterial color={mode==='pool'?'#83b4bc':'#ff671f'} transparent opacity={.7}/></mesh>
 </group>
}
