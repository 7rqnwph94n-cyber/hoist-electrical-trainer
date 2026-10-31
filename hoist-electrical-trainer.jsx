import { useState, useEffect } from "react";

// ── COLOURS ──────────────────────────────────────────────────
const AMBER="#F59E0B",DARK="#0F1117",PANEL="#1A1D27",PANEL2="#141720",BORDER="#2A2D3E",
  TEXT="#E2E5F0",MUTED="#6B7280",GREEN="#10B981",RED="#EF4444",BLUE="#3B82F6",ORANGE="#F97316",
  BROWN="#92400E",NEUTRAL_BLUE="#1D4ED8";

// Device category colours (consistent across all diagrams)
const DC={
  safety:"#EF4444",      // red   — e-stop, limits, OLR
  logic:"#F59E0B",       // amber — buttons, interlocks, aux contacts
  load:"#3B82F6",        // blue  — coils, motors, brake
  supply:"#10B981",      // green — supply, transformer, fuses
  earth:"#16A34A",       // green — PE/earth
};

// ── STYLES ───────────────────────────────────────────────────
const S={
  app:{minHeight:"100vh",background:DARK,backgroundImage:`repeating-linear-gradient(0deg,${BORDER}33 0px,transparent 1px,transparent 40px),repeating-linear-gradient(90deg,${BORDER}33 0px,transparent 1px,transparent 40px)`,color:TEXT,fontFamily:"'IBM Plex Mono','Courier New',monospace",fontSize:14},
  header:{background:PANEL,borderBottom:`2px solid ${AMBER}`,padding:"12px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:8},
  logo:{color:AMBER,fontSize:15,fontWeight:700,letterSpacing:"0.08em"},
  sub:{color:MUTED,fontSize:9,marginTop:2},
  nav:{display:"flex",gap:5,flexWrap:"wrap"},
  navBtn:a=>({background:a?AMBER:"transparent",color:a?DARK:MUTED,border:`1px solid ${a?AMBER:BORDER}`,padding:"6px 11px",borderRadius:4,cursor:"pointer",fontSize:11,fontFamily:"inherit",fontWeight:a?700:400}),
  main:{maxWidth:700,margin:"0 auto",padding:"16px 12px"},
  card:{background:PANEL,border:`1px solid ${BORDER}`,borderRadius:8,padding:16,marginBottom:12},
  h2:{color:TEXT,fontSize:16,fontWeight:700,marginBottom:4},
  h3:{color:AMBER,fontSize:13,fontWeight:700,marginBottom:8,borderBottom:`1px solid ${BORDER}`,paddingBottom:5},
  body:{color:"#C5C9D9",lineHeight:1.75,fontSize:13},
  tag:c=>({background:c+"22",color:c,border:`1px solid ${c}44`,padding:"2px 7px",borderRadius:3,fontSize:10,display:"inline-block",fontWeight:700}),
  secTitle:c=>({color:c||AMBER,fontSize:10,letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:8,display:"flex",alignItems:"center",gap:6}),
  btn:v=>({background:v==="primary"?AMBER:v==="success"?GREEN:v==="danger"?RED:v==="warn"?ORANGE:"transparent",color:v==="primary"?DARK:TEXT,border:`1px solid ${v==="ghost"?BORDER:"transparent"}`,padding:"9px 14px",borderRadius:4,cursor:"pointer",fontSize:12,fontFamily:"inherit",fontWeight:700,display:"inline-flex",alignItems:"center",gap:6}),
  prog:{height:4,background:BORDER,borderRadius:2,overflow:"hidden"},
  progFill:p=>({height:"100%",width:p+"%",background:AMBER,borderRadius:2,transition:"width 0.5s"}),
  faultBtn:{background:"#1E2235",border:`1px solid ${BORDER}`,borderRadius:6,padding:"13px 14px",cursor:"pointer",color:TEXT,fontFamily:"inherit",fontSize:13,textAlign:"left",width:"100%",marginBottom:8,display:"flex",alignItems:"center",gap:10},
  resBox:c=>({background:c+"11",border:`1px solid ${c}44`,borderRadius:6,padding:12,marginTop:8}),
  quizOpt:s=>({background:s==="correct"?"#0A2E1F":s==="wrong"?"#2E0A0A":s==="selected"?"#2a1f00":"#1E2235",border:`1px solid ${s==="correct"?GREEN:s==="wrong"?RED:s==="selected"?AMBER:BORDER}`,boxShadow:s==="selected"?`0 0 0 1px ${AMBER}55 inset`:"none",borderRadius:6,padding:"10px 12px",cursor:s==="correct"||s==="wrong"?"default":"pointer",color:TEXT,fontFamily:"inherit",fontSize:13,textAlign:"left",width:"100%",marginBottom:7,display:"flex",alignItems:"center",gap:10}),
  modCard:d=>({background:PANEL,border:`1px solid ${d?GREEN:BORDER}`,borderRadius:8,padding:13,cursor:"pointer",marginBottom:9}),
};

const ABBREVIATIONS=[
  {term:"A1/A2",meaning:"Coil terminals on a contactor or relay. A1 is the positive/line side, A2 is the negative/neutral side of the coil."},
  {term:"AC",meaning:"Alternating Current. The supply voltage changes direction many times per second."},
  {term:"DC",meaning:"Direct Current. Current flows one way, used by many brake coils after rectification."},
  {term:"DOL",meaning:"Direct-On-Line. The contactor applies the full supply directly to the motor."},
  {term:"FLA",meaning:"Full Load Amps. The motor current shown on the motor nameplate at rated load."},
  {term:"GS38",meaning:"HSE guidance for safe electrical test equipment and insulated probes."},
  {term:"HRC",meaning:"High Rupturing Capacity fuse. A fuse designed to break high fault currents safely."},
  {term:"IEC",meaning:"International Electrotechnical Commission. The standards body behind many electrical labels and rules."},
  {term:"LOLER",meaning:"Lifting Operations and Lifting Equipment Regulations 1998. UK lifting equipment safety law."},
  {term:"LOTO",meaning:"Lock Out Tag Out. Isolate, lock, tag, and prove dead before work."},
  {term:"MCB",meaning:"Miniature Circuit Breaker. A resettable protective device used instead of some fuses."},
  {term:"NC",meaning:"Normally Closed. The contact passes current in its normal/rest state and opens when operated."},
  {term:"NO",meaning:"Normally Open. The contact is open in its normal/rest state and closes when operated."},
  {term:"OLR",meaning:"Overload Relay. Trips when the motor draws too much current for too long."},
  {term:"PE",meaning:"Protective Earth. The green/yellow safety earth conductor."},
  {term:"PL",meaning:"Performance Level (EN ISO 13849). Safety integrity rating for safety-related control systems. PLd or PLe required for hoist safety functions."},
  {term:"PUWER",meaning:"Provision and Use of Work Equipment Regulations 1998. UK work equipment safety law."},
  {term:"SIL",meaning:"Safety Integrity Level (IEC 62061). Alternative safety integrity rating system to PL. SIL 2 is typical for hoist safety circuits."},
  {term:"STO",meaning:"Safe Torque Off. A VFD safety function that prevents motor torque, but does not isolate the drive."},
  {term:"SWL",meaning:"Safe Working Load. The maximum rated load the hoist is allowed to lift."},
  {term:"VFD",meaning:"Variable Frequency Drive. Electronic motor controller that changes speed using frequency control."},
  {term:"V AC",meaning:"Volts AC. Meter setting for alternating-current voltage."},
  {term:"V DC",meaning:"Volts DC. Meter setting for direct-current voltage."},
];

function termsInText(text){
  return ABBREVIATIONS.filter(({term})=>{
    const escaped=term.replace(/[.*+?^${}()|[\]\\]/g,"\\$&").replace(/\s+/g,"\\s+");
    return new RegExp(`(^|[^A-Za-z0-9])${escaped}([^A-Za-z0-9]|$)`).test(text);
  });
}

function AbbreviationPanel({text}){
  const terms=termsInText(text);
  if(!terms.length) return null;
  return(
    <div style={{...S.resBox(BLUE),background:"#0A1829",marginTop:0,marginBottom:12}}>
      <div style={{color:BLUE,fontSize:10,fontWeight:700,marginBottom:7,letterSpacing:"0.1em"}}>PLAIN ENGLISH TERMS IN THIS SECTION</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr",gap:7}}>
        {terms.map(t=>(
          <div key={t.term} style={{color:"#C5C9D9",fontSize:12,lineHeight:1.55}}>
            <span style={{color:AMBER,fontWeight:700}}>{t.term}</span>: {t.meaning}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── GLOSSARY MODAL ───────────────────────────────────────────
function GlossaryModal({onClose}){
  const [q,setQ]=useState("");
  const terms=q.trim()?ABBREVIATIONS.filter(t=>t.term.toLowerCase().includes(q.toLowerCase())||t.meaning.toLowerCase().includes(q.toLowerCase())):ABBREVIATIONS;
  return(
    <div style={{position:"fixed",inset:0,background:"#000000cc",zIndex:1000,display:"flex",alignItems:"flex-start",justifyContent:"center",padding:"16px 8px",overflowY:"auto"}}>
      <div style={{background:PANEL,border:`2px solid ${AMBER}`,borderRadius:10,width:"100%",maxWidth:580,padding:20}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
          <div style={{color:AMBER,fontSize:15,fontWeight:700,letterSpacing:"0.06em"}}>? GLOSSARY</div>
          <button style={{...S.btn("ghost"),padding:"4px 10px",fontSize:12}} onClick={onClose}>✕ Close</button>
        </div>
        <input
          type="text"
          placeholder="Search terms..."
          value={q}
          onChange={e=>setQ(e.target.value)}
          style={{width:"100%",background:"#0F1117",border:`1px solid ${BORDER}`,borderRadius:5,padding:"8px 11px",color:TEXT,fontFamily:"inherit",fontSize:13,marginBottom:14,outline:"none"}}
        />
        <div style={{display:"grid",gap:8}}>
          {terms.map(t=>(
            <div key={t.term} style={{background:PANEL2,border:`1px solid ${BORDER}`,borderRadius:6,padding:"10px 12px"}}>
              <div style={{color:AMBER,fontWeight:700,fontSize:13,marginBottom:3}}>{t.term}</div>
              <div style={{color:"#C5C9D9",fontSize:12,lineHeight:1.6}}>{t.meaning}</div>
            </div>
          ))}
          {terms.length===0&&<div style={{color:MUTED,fontSize:12,textAlign:"center",padding:"20px 0"}}>No terms match "{q}"</div>}
        </div>
      </div>
    </div>
  );
}

// ── PROCESS FLOW SVG PRIMITIVES ──────────────────────────────

// Animated wire segment — fills green left-to-right when active
function FlowWire({x1,y1,x2,y2,state,vertical}){
  // state: "live"=green, "fault"=red, "dead"=dark, "pending"=dim
  const col=state==="live"?GREEN:state==="fault"?RED:state==="pending"?AMBER+"66":BORDER;
  const w=state==="live"||state==="fault"?3:2;
  return(
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={BORDER} strokeWidth={4} strokeLinecap="round"/>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={col} strokeWidth={w} strokeLinecap="round"
        style={{transition:"stroke 0.4s"}}/>
      {state==="live"&&(
        <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={GREEN} strokeWidth={1} opacity={0.4} strokeLinecap="round">
          <animate attributeName="opacity" from={0.6} to={0} dur="1.5s" repeatCount="indefinite"/>
        </line>
      )}
    </g>
  );
}

// Device block — chunky labelled box with category colour
function DeviceBlock({x,y,w=70,h=44,label,sub,category,state,active,schematic}){
  const catCol=DC[category]||AMBER;
  const borderCol=active?AMBER:state==="live"?catCol:state==="fault"?RED:BORDER;
  const bgCol=active?"#2a1f00":state==="live"?catCol+"18":state==="fault"?RED+"18":PANEL2;
  const textCol=active?AMBER:state==="live"?catCol:state==="fault"?RED:TEXT;
  return(
    <g>
      <rect x={x-w/2} y={y-h/2} width={w} height={h} rx={5}
        fill={bgCol} stroke={borderCol} strokeWidth={active?2.5:1.5}/>
      {active&&<rect x={x-w/2} y={y-h/2} width={w} height={h} rx={5}
        fill="none" stroke={AMBER} strokeWidth={1} opacity={0.4}>
        <animate attributeName="opacity" from={0.6} to={0} dur="1s" repeatCount="indefinite"/>
      </rect>}
      <text x={x} y={sub?y-4:y+1} textAnchor="middle" dominantBaseline="middle"
        fontSize={sub?9:10} fill={textCol} fontWeight="bold">{label}</text>
      {sub&&<text x={x} y={y+9} textAnchor="middle" fontSize={7} fill={active?AMBER+"aa":MUTED}>{sub}</text>}
      {/* Category indicator dot */}
      <circle cx={x+w/2-5} cy={y-h/2+5} r={3} fill={catCol} opacity={0.8}/>
    </g>
  );
}

// Animated probe icon
function Probe({x,y,type,pulse}){
  const col=type==="red"?RED:"#555";
  const textCol=type==="red"?"#fff":"#aaa";
  const label=type==="red"?"V+":"COM";
  return(
    <g>
      {pulse&&<circle cx={x} cy={y} r={10} fill="none" stroke={col} strokeWidth={1.5}>
        <animate attributeName="r" from={9} to={20} dur="1.1s" repeatCount="indefinite"/>
        <animate attributeName="opacity" from={0.8} to={0} dur="1.1s" repeatCount="indefinite"/>
      </circle>}
      <circle cx={x} cy={y} r={7} fill={col} stroke={type==="red"?"#fff":"#888"} strokeWidth={1}/>
      <text x={x} y={y+1} textAnchor="middle" dominantBaseline="middle" fontSize={6} fill={textCol} fontWeight="bold">{label}</text>
    </g>
  );
}

// Meter display
function Meter({x,y,mode,reading,active}){
  return(
    <g opacity={active?1:0.4}>
      <rect x={x} y={y} width={64} height={40} rx={4} fill="#1a2040" stroke={active?AMBER:BORDER} strokeWidth={active?1.5:1}/>
      <rect x={x+4} y={y+4} width={56} height={20} rx={2} fill="#071210"/>
      <text x={x+32} y={y+17} textAnchor="middle" fontSize={active?9:8} fill={active?GREEN:MUTED} fontWeight="bold" fontFamily="monospace">{reading||"- - - -"}</text>
      <text x={x+32} y={y+33} textAnchor="middle" fontSize={7} fill={active?AMBER:MUTED} fontWeight="bold">{mode}</text>
    </g>
  );
}

// Supply rail terminal
function SupplyTerminal({x,y,voltage,active}){
  const col=active?GREEN:BORDER;
  return(
    <g>
      <rect x={x-20} y={y-16} width={40} height={32} rx={4} fill={active?"#071a10":PANEL2} stroke={col} strokeWidth={active?2:1}/>
      <text x={x} y={y-3} textAnchor="middle" fontSize={9} fill={active?GREEN:MUTED} fontWeight="bold">{voltage}</text>
      <text x={x} y={y+9} textAnchor="middle" fontSize={7} fill={MUTED}>SUPPLY</text>
    </g>
  );
}

// Neutral rail terminal
function NeutralTerminal({x,y}){
  return(
    <g>
      <rect x={x-20} y={y-14} width={40} height={28} rx={4} fill={PANEL2} stroke={NEUTRAL_BLUE} strokeWidth={1}/>
      <text x={x} y={y-1} textAnchor="middle" fontSize={8} fill={NEUTRAL_BLUE} fontWeight="bold">0V</text>
      <text x={x} y={y+10} textAnchor="middle" fontSize={6} fill={MUTED}>NEUTRAL</text>
    </g>
  );
}

// Info callout pill
function InfoPill({text,show}){
  if(!show||!text) return null;
  return(
    <div style={{background:"#0a1829",border:`1px solid ${BLUE}33`,borderRadius:5,padding:"6px 10px",marginTop:6,display:"flex",gap:6,alignItems:"flex-start"}}>
      <span style={{color:BLUE,fontSize:10,marginTop:1}}>ℹ</span>
      <span style={{color:"#93C5FD",fontSize:11,lineHeight:1.5}}>{text}</span>
    </div>
  );
}

// ── DIAGRAM 1: CONTROL CIRCUIT — PROCESS FLOW ────────────────
// Phone-first: vertical flow top-to-bottom
function DiagControlCircuit({step,showInfo,schematic}){
  const W=320,H=480;
  // Devices top to bottom, each with x,y,wire state based on step
  const devices=[
    {id:"estop", x:160,y:80,  label:"E-STOP",   sub:"NC contact", cat:"safety",
     info:"Normally Closed contact. Pressing opens the circuit — all coil supply is cut instantly."},
    {id:"olr",   x:160,y:158, label:"OVERLOAD",  sub:"NC contact", cat:"safety",
     info:"Thermal overload relay NC contact. Trips open when motor draws sustained overcurrent."},
    {id:"ulim",  x:160,y:236, label:"UPPER LIM", sub:"NC contact", cat:"safety",
     info:"Upper limit switch NC contact. Opens when hook reaches top position — prevents two-blocking."},
    {id:"upbtn", x:160,y:314, label:"UP BUTTON", sub:"NO contact", cat:"logic",
     info:"Normally Open pushbutton. Only closes while pressed. Hold-in aux contact maintains circuit after initial press."},
    {id:"intlk", x:160,y:392, label:"DN INTLK",  sub:"NC aux",     cat:"logic",
     info:"NC auxiliary contact of the DOWN contactor. Opens if DOWN contactor is energised — prevents both directions simultaneously."},
    {id:"coil",  x:160,y:450, label:"UP COIL",   sub:"A1 → A2",   cat:"load",
     info:"UP contactor coil. 48V across A1-A2 pulls in the armature, closing main power contacts to the motor."},
  ];
  // Wire segment y-positions between devices
  const wireSegs=[
    {y1:96, y2:136},   // supply → estop
    {y1:180,y2:214},   // estop → olr
    {y1:258,y2:292},   // olr → ulim
    {y1:336,y2:370},   // ulim → upbtn
    {y1:414,y2:428},   // upbtn → intlk
    {y1:450,y2:468},   // intlk → coil (short)
  ];
  // State for each segment: "live", "fault", "dead", "pending"
  function segState(i){
    if(step<0) return "dead";
    if(i<step) return "live";
    if(i===step) return "live";
    return "dead";
  }
  function devState(i){
    if(i<step) return "live";
    if(i===step) return "live";
    return "dead";
  }
  const activeDevice=devices[step]||null;
  return(
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{background:PANEL2,borderRadius:8,border:`1px solid ${BORDER}`,display:"block",maxWidth:"100%"}}>
      {/* Supply terminal */}
      <SupplyTerminal x={160} y={44} voltage="48/110V AC" active={true}/>
      {/* Vertical spine wire */}
      <line x1={160} y1={60} x2={160} y2={468} stroke={BORDER} strokeWidth={1} strokeDasharray="3,3" opacity={0.3}/>
      {/* Wire segments — coloured by state */}
      {wireSegs.map((seg,i)=>(
        <FlowWire key={i} x1={160} y1={seg.y1} x2={160} y2={seg.y2} state={segState(i)}/>
      ))}
      {/* Return wire down right side to neutral */}
      <line x1={160} y1={462} x2={260} y2={462} stroke={segState(5)==="live"?GREEN:BORDER} strokeWidth={2}/>
      <line x1={260} y1={462} x2={260} y2={480} stroke={NEUTRAL_BLUE} strokeWidth={2}/>
      <NeutralTerminal x={260} y={480}/>
      {/* Devices */}
      {devices.map((d,i)=>(
        <DeviceBlock key={d.id} x={d.x} y={d.y} w={84} h={44}
          label={d.label} sub={d.sub} category={d.cat}
          state={devState(i)} active={step===i}/>
      ))}
      {/* Probe on active device */}
      {activeDevice&&(
        <g>
          <Probe x={activeDevice.x+60} y={activeDevice.y-6} type="red" pulse={true}/>
          <Probe x={260} y={462} type="black" pulse={false}/>
          {/* Reading label */}
          <rect x={activeDevice.x+72} y={activeDevice.y-24} width={44} height={14} rx={3} fill={PANEL2} stroke={AMBER+"44"}/>
          <text x={activeDevice.x+94} y={activeDevice.y-14} textAnchor="middle" fontSize={8} fill={AMBER} fontWeight="bold">48V?</text>
        </g>
      )}
      {/* Voltage confirmed labels */}
      {devices.map((d,i)=>(
        i<step&&<g key={`v${i}`}>
          <text x={d.x-58} y={d.y+2} textAnchor="middle" fontSize={8} fill={GREEN} fontWeight="bold">✓ OK</text>
        </g>
      ))}
      {/* Legend */}
      <g>
        {[{c:DC.safety,l:"Safety"},{c:DC.logic,l:"Logic"},{c:DC.load,l:"Load"},{c:GREEN,l:"Confirmed"}].map((item,i)=>(
          <g key={i} transform={`translate(${8+i*74},${H-14})`}>
            <circle cx={4} cy={4} r={3} fill={item.c}/>
            <text x={10} y={8} fontSize={7} fill={MUTED}>{item.l}</text>
          </g>
        ))}
      </g>
    </svg>
  );
}

// ── DIAGRAM 2: CONTACTOR FACE — PROCESS FLOW ────────────────
function DiagContactorFace({step,mode,showInfo}){
  const W=340,H=380;
  // All 8+4 ports as labelled blocks
  const topPorts=[
    {id:"L1",x:80, y:50, label:"L1",sub:"Ph1 In",  cat:"supply"},
    {id:"L2",x:160,y:50, label:"L2",sub:"Ph2 In",  cat:"supply"},
    {id:"L3",x:240,y:50, label:"L3",sub:"Ph3 In",  cat:"supply"},
    {id:"13",x:310,y:110,label:"13",sub:"NO Aux In",cat:"logic"},
  ];
  const botPorts=[
    {id:"T1",x:80, y:330,label:"T1",sub:"Motor U",  cat:"load"},
    {id:"T2",x:160,y:330,label:"T2",sub:"Motor V",  cat:"load"},
    {id:"T3",x:240,y:330,label:"T3",sub:"Motor W",  cat:"load"},
    {id:"14",x:310,y:270,label:"14",sub:"NO Aux Out",cat:"logic"},
  ];
  const sidePorts=[
    {id:"11",x:30,y:150,label:"11",sub:"NC Aux",cat:"safety"},
    {id:"12",x:30,y:230,label:"12",sub:"NC Aux",cat:"safety"},
    {id:"A1",x:310,y:150,label:"A1",sub:"Coil+",cat:"load"},
    {id:"A2",x:310,y:230,label:"A2",sub:"Coil-",cat:"load"},
  ];

  // Which ports are highlighted per mode/step
  const testSets={
    continuity:[["L1","T1"],["L2","T2"],["L3","T3"],["13","14"],["11","12"]],
    voltage_coil:[["A1","A2"]],
    interlock:[["11","12"]],
  };
  const active=(testSets[mode]||[])[step]||[];
  function isActive(id){return active.includes(id);}
  function portState(id){return isActive(id)?"live":"dead";}

  // Interlock bar
  const showInterlockBar=mode==="interlock";

  return(
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{background:PANEL2,borderRadius:8,border:`1px solid ${BORDER}`,display:"block",maxWidth:"100%"}}>
      {/* Body */}
      <rect x={58} y={70} width={204} height={240} rx={8} fill="#1a2040" stroke={AMBER} strokeWidth={2}/>
      {/* Internal contact bars */}
      {[80,160,240].map((cx,i)=>(
        <g key={i}>
          <rect x={cx-10} y={140} width={20} height={80} rx={3}
            fill={isActive(`L${i+1}`)||isActive(`T${i+1}`)?"#1a2a1a":PANEL2}
            stroke={isActive(`L${i+1}`)?"#10B981":BORDER} strokeWidth={1}/>
          <text x={cx} y={183} textAnchor="middle" fontSize={7} fill={MUTED}>Ph{i+1}</text>
        </g>
      ))}
      {/* Label */}
      <text x={160} y={108} textAnchor="middle" fontSize={11} fill={MUTED} fontWeight="bold">CONTACTOR</text>
      <text x={160} y={122} textAnchor="middle" fontSize={8} fill={BORDER}>IEC FACE VIEW</text>

      {/* Interlock bar */}
      {showInterlockBar&&(
        <g>
          <rect x={58} y={300} width={204} height={20} rx={4}
            fill={ORANGE+"33"} stroke={ORANGE} strokeWidth={2} strokeDasharray="6,3"/>
          <text x={160} y={314} textAnchor="middle" fontSize={8} fill={ORANGE} fontWeight="bold">◄ MECHANICAL INTERLOCK BAR ►</text>
          <text x={160} y={340} textAnchor="middle" fontSize={7} fill={MUTED}>Physically prevents both contactors closing together</text>
        </g>
      )}

      {/* Wire stubs to top ports */}
      {topPorts.map(p=>(
        <g key={p.id}>
          <line x1={p.x} y1={p.y+22} x2={p.x} y2={70} stroke={isActive(p.id)?GREEN:BORDER} strokeWidth={isActive(p.id)?2.5:1}/>
        </g>
      ))}
      {/* Wire stubs to bottom ports */}
      {botPorts.map(p=>(
        <g key={p.id}>
          <line x1={p.x} y1={p.y-22} x2={p.x} y2={310} stroke={isActive(p.id)?GREEN:BORDER} strokeWidth={isActive(p.id)?2.5:1}/>
        </g>
      ))}
      {/* Wire stubs to side ports */}
      {sidePorts.map(p=>(
        <g key={p.id}>
          <line x1={p.id==="11"||p.id==="12"?p.x+24:p.x-24} y1={p.y}
            x2={p.id==="11"||p.id==="12"?58:262} y2={p.y}
            stroke={isActive(p.id)?GREEN:BORDER} strokeWidth={isActive(p.id)?2.5:1}/>
        </g>
      ))}

      {/* All port blocks */}
      {[...topPorts,...botPorts,...sidePorts].map(p=>(
        <g key={p.id}>
          <DeviceBlock x={p.x} y={p.y} w={46} h={32} label={p.id} sub={p.sub} category={p.cat}
            state={portState(p.id)} active={isActive(p.id)}/>
          {isActive(p.id)&&active[0]===p.id&&<Probe x={p.x+(p.x<160?-26:26)} y={p.y} type="red" pulse={true}/>}
          {isActive(p.id)&&active[1]===p.id&&<Probe x={p.x+(p.x<160?-26:26)} y={p.y} type="black" pulse={true}/>}
        </g>
      ))}

      {/* Category legend */}
      <g>
        {[{c:DC.supply,l:"Supply"},{c:DC.load,l:"Motor/Coil"},{c:DC.logic,l:"Aux/Logic"},{c:DC.safety,l:"Safety"}].map((item,i)=>(
          <g key={i} transform={`translate(${6+i*78},${H-14})`}>
            <circle cx={4} cy={4} r={3} fill={item.c}/>
            <text x={10} y={8} fontSize={7} fill={MUTED}>{item.l}</text>
          </g>
        ))}
      </g>
    </svg>
  );
}

// ── DIAGRAM 3: BRAKE RECTIFIER — PROCESS FLOW ───────────────
function DiagBrakeRectifier({step,showInfo}){
  const W=320,H=320;
  // Horizontal flow left to right, two rows
  const nodes=[
    {x:50, y:120,label:"AC INPUT",  sub:"L + N",    cat:"supply", info:"AC supply to rectifier. From motor contactor or dedicated brake supply. Typically 230V AC."},
    {x:160,y:120,label:"RECTIFIER", sub:"4× diode", cat:"logic",  info:"Bridge rectifier converts AC to DC. Full-wave: ~207V DC. Half-wave: ~103V DC. Failed diode = no DC output."},
    {x:270,y:120,label:"DC OUTPUT", sub:"BR+ BR-",   cat:"load",   info:"DC supply to brake coil. Full-wave output ~0.9×VAC. Forced-voltage types give 2× briefly on energise for fast release."},
    {x:270,y:240,label:"BRAKE COIL",sub:"5–300Ω",   cat:"load",   info:"Electromagnetic coil. DC energisation pulls armature against spring, releasing brake disc. Open circuit = no release. Resistance varies with coil voltage: 24V≈5–15Ω, 48V≈20–40Ω, 110V≈80–150Ω, 205V≈180–300Ω."},
  ];
  const wires=[
    {x1:78,y1:120,x2:122,y2:120,state:step>=0?"live":"dead"},
    {x1:198,y1:120,x2:232,y2:120,state:step>=1?"live":"dead"},
    {x1:270,y1:136,x2:270,y2:218,state:step>=2?"live":"dead"},
  ];
  // Meter position
  const meterConfigs=[
    {x:30,y:190,mode:"V AC",reading:"230 AC"},
    {x:214,y:58,mode:"V DC",reading:"207 DC"},
    {x:290,y:190,mode:"Ω",reading:"5–300Ω"},
  ];
  return(
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{background:PANEL2,borderRadius:8,border:`1px solid ${BORDER}`,display:"block",maxWidth:"100%"}}>
      {/* Background flow arrows */}
      {wires.map((w,i)=><FlowWire key={i} x1={w.x1} y1={w.y1} x2={w.x2} y2={w.y2} state={w.state}/>)}

      {/* Nodes */}
      {nodes.map((n,i)=>(
        <DeviceBlock key={n.label} x={n.x} y={n.y} w={80} h={44} label={n.label} sub={n.sub}
          category={n.cat} state={i<=step?"live":"dead"} active={i===step}/>
      ))}

      {/* Probes */}
      {step===0&&<><Probe x={50} y={90} type="red" pulse={true}/><Probe x={50} y={152} type="black" pulse={true}/></>}
      {step===1&&<><Probe x={270} y={90} type="red" pulse={true}/><Probe x={270} y={152} type="black" pulse={true}/></>}
      {step===2&&<><Probe x={240} y={240} type="red" pulse={true}/><Probe x={300} y={240} type="black" pulse={true}/></>}

      {/* Meters */}
      {meterConfigs.map((m,i)=>(
        <Meter key={i} x={m.x} y={m.y} mode={m.mode} reading={m.reading} active={step===i}/>
      ))}

      {/* Step labels */}
      {[{x:50,y:172,l:"STEP 1"},{x:270,y:172,l:"STEP 2"},{x:270,y:292,l:"STEP 3"}].map((l,i)=>(
        <text key={i} x={l.x} y={l.y} textAnchor="middle" fontSize={8}
          fill={step===i?AMBER:MUTED} fontWeight={step===i?"bold":"normal"}>{l.l}</text>
      ))}

      {/* Flow direction arrow */}
      <text x={160} y={80} textAnchor="middle" fontSize={8} fill={MUTED}>AC IN ──────────────→ DC OUT</text>
      <text x={160} y={300} textAnchor="middle" fontSize={7} fill={MUTED}>BRAKE CIRCUIT — AC INPUT LIVE · COIL TEST ISOLATED</text>
    </svg>
  );
}

// ── DIAGRAM 4: MOTOR TERMINAL BOX — PROCESS FLOW ────────────
function DiagMotorTerminals({step,showInfo}){
  const W=320,H=300;
  const topRow=[
    {id:"U1",x:80, y:80, label:"U1",sub:"Ph1 Start",cat:"supply"},
    {id:"V1",x:160,y:80, label:"V1",sub:"Ph2 Start",cat:"supply"},
    {id:"W1",x:240,y:80, label:"W1",sub:"Ph3 Start",cat:"supply"},
  ];
  const botRow=[
    {id:"U2",x:80, y:200,label:"U2",sub:"Ph1 End",cat:"load"},
    {id:"V2",x:160,y:200,label:"V2",sub:"Ph2 End",cat:"load"},
    {id:"W2",x:240,y:200,label:"W2",sub:"Ph3 End",cat:"load"},
  ];
  const pe={id:"PE",x:290,y:140,label:"PE",sub:"Earth",cat:"earth"};
  const starLink=step<=0;
  return(
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{background:PANEL2,borderRadius:8,border:`1px solid ${BORDER}`,display:"block",maxWidth:"100%"}}>
      {/* Box */}
      <rect x={50} y={50} width={220} height={200} rx={8} fill="#1a2040" stroke={AMBER} strokeWidth={2}/>
      <text x={160} y={36} textAnchor="middle" fontSize={10} fill={AMBER} fontWeight="bold">MOTOR TERMINAL BOX</text>

      {/* Star link */}
      {starLink&&<>
        <line x1={80} y1={102} x2={240} y2={102} stroke={BLUE} strokeWidth={3} strokeDasharray="5,3"/>
        <text x={160} y={118} textAnchor="middle" fontSize={7} fill={BLUE}>──── STAR LINK ────</text>
      </>}

      {/* Phase voltage lines */}
      {step===0&&<>
        <line x1={80} y1={92} x2={160} y2={92} stroke={GREEN} strokeWidth={2}/>
        <text x={120} y={76} textAnchor="middle" fontSize={8} fill={GREEN} fontWeight="bold">~415V ✓</text>
      </>}

      {/* All terminal blocks */}
      {[...topRow,...botRow].map(t=>(
        <DeviceBlock key={t.id} x={t.x} y={t.y} w={46} h={32} label={t.label} sub={t.sub}
          category={t.cat} state={step===0&&t.id[1]==="1"?"live":step===1?"live":"dead"}
          active={step===0&&(t.id==="U1"||t.id==="V1")||step===1&&(t.id==="U2"||t.id==="PE")}/>
      ))}
      <DeviceBlock x={pe.x} y={pe.y} w={40} h={32} label={pe.label} sub={pe.sub}
        category={pe.cat} state={step===1?"live":"dead"} active={step===1}/>

      {/* Probes */}
      {step===0&&<><Probe x={60} y={80} type="red" pulse={true}/><Probe x={60} y={100} type="black" pulse={true}/></>}
      {step===1&&<><Probe x={270} y={130} type="red" pulse={true}/><Probe x={60} y={200} type="black" pulse={true}/></>}

      {/* Labels */}
      {step===0&&<text x={160} y={268} textAnchor="middle" fontSize={8} fill={GREEN} fontWeight="bold">U1–V1 / V1–W1 / U1–W1 all ~415V = OK</text>}
      {step===1&&<text x={160} y={268} textAnchor="middle" fontSize={8} fill={RED} fontWeight="bold">⚠ 500V MEGGER · ISOLATED · &gt;1MΩ = OK</text>}
      <text x={160} y={284} textAnchor="middle" fontSize={7} fill={MUTED}>STANDARD IEC LAYOUT — CONNECT TO CONTACTOR T1/T2/T3</text>
    </svg>
  );
}

// ── DIAGRAM 5: E-STOP CIRCUIT — PROCESS FLOW ────────────────
function DiagEStop({step,showInfo}){
  const W=320,H=260;
  const nodes=[
    {x:40, y:110,label:"48V",      sub:"Control",  cat:"supply", w:52,h:36},
    {x:130,y:110,label:"E-STOP",   sub:"NC B1–B2", cat:"safety", w:72,h:44},
    {x:220,y:110,label:"SAFETY",   sub:"Relay",    cat:"safety", w:68,h:44},
    {x:290,y:110,label:"COIL",     sub:"Circuit",  cat:"load",   w:52,h:36},
  ];
  const wires=[
    {x1:66,y1:110,x2:94,y2:110,state:step>=0?"live":"dead"},
    {x1:166,y1:110,x2:186,y2:110,state:step>=1?"live":"dead"},
    {x1:254,y1:110,x2:264,y2:110,state:step>=2?"live":"dead"},
  ];
  // Dual channel LEDs on safety relay
  const relayHealthy=step>=2;
  return(
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{background:PANEL2,borderRadius:8,border:`1px solid ${BORDER}`,display:"block",maxWidth:"100%"}}>
      {wires.map((w,i)=><FlowWire key={i} x1={w.x1} y1={w.y1} x2={w.x2} y2={w.y2} state={w.state}/>)}
      {nodes.map((n,i)=>(
        <DeviceBlock key={n.label} x={n.x} y={n.y} w={n.w} h={n.h} label={n.label} sub={n.sub}
          category={n.cat} state={i<=step?"live":"dead"} active={i===step}/>
      ))}
      {/* E-stop terminals B1/B2 */}
      <text x={130} y={166} textAnchor="middle" fontSize={7} fill={step===0?AMBER:MUTED}>B1 ─── B2</text>
      {/* Safety relay channel LEDs */}
      <circle cx={205} cy={96} r={4} fill={relayHealthy?GREEN:BORDER} stroke={relayHealthy?GREEN:MUTED} strokeWidth={1}/>
      <circle cx={215} cy={96} r={4} fill={relayHealthy?GREEN:BORDER} stroke={relayHealthy?GREEN:MUTED} strokeWidth={1}/>
      <text x={210} y={84} textAnchor="middle" fontSize={6} fill={relayHealthy?GREEN:MUTED}>CH1 CH2</text>
      {/* Probes */}
      {step===0&&<><Probe x={108} y={96} type="red" pulse={true}/><Probe x={152} y={96} type="black" pulse={true}/></>}
      {step===1&&<><Probe x={94} y={100} type="red" pulse={true}/><Probe x={38} y={120} type="black" pulse={true}/></>}
      {/* Meter */}
      <Meter x={20} y={170} mode={step===0?"Ω / CONT":step===1?"V AC":"V AC"} reading={step===0?"BEEP=OK":step===1?"48V=OK":"CHECK"} active={true}/>
      {/* Step labels */}
      {[{x:130,l:"STEP 1\nContact test"},{x:220,l:"STEP 2\nWiring V"},{x:290,l:"STEP 3\nRelay LED"}].map((l,i)=>(
        <text key={i} x={l.x} y={200+i*0} textAnchor="middle" fontSize={7}
          fill={step===i?AMBER:MUTED} fontWeight={step===i?"bold":"normal"}>{l.l.split("\n")[0]}</text>
      ))}
      <text x={160} y={240} textAnchor="middle" fontSize={7} fill={MUTED}>E-STOP CIRCUIT — NC = FAIL SAFE · NEVER BRIDGE</text>
    </svg>
  );
}

// ── DIAGRAM CONFIGS ──────────────────────────────────────────

// ============================================================
// ISOLATION PROCEDURE — GAP 1 (Safety critical — shown before
// any test, accessible from header at all times)
// ============================================================
const ISOLATION_STEPS=[
  {
    id:"iso1", phase:"BEFORE YOU START", icon:"🔴",
    title:"Identify ALL isolation points",
    body:`A hoist installation may have MORE than one isolator:\n• Main panel isolator (usually rotary cam switch on panel door)\n• Crane bridge isolator (sometimes a second rotary switch on the bridge)\n• Incoming supply isolator at the distribution board\n\nIdentify ALL of them before you begin. Isolating only one may leave the equipment partially live.`,
    warning:null
  },
  {
    id:"iso2", phase:"STEP 1", icon:"🔒",
    title:"Isolate — turn all isolators to OFF",
    body:`Turn every identified isolator to the OFF position. On rotary cam switches — OFF is fully anticlockwise or as marked. Confirm the handle is fully in the OFF detent, not half-way.\n\nDo NOT rely on pressing the E-stop as your isolation method. The E-stop is a safety device, not an isolator. It does not disconnect the incoming supply.`,
    warning:"Never work on a hoist that has only been E-stopped. That is NOT isolation."
  },
  {
    id:"iso3", phase:"STEP 2", icon:"🔐",
    title:"Lock Off — apply your personal padlock",
    body:`Apply your own padlock to every isolator hasp. Your lock, your key, in your pocket.\n\nIf no hasp is fitted, fit one. A cable tie or tape is NOT an acceptable substitute.\n\nIf multiple people are working on the equipment, every person applies their OWN lock. The equipment stays isolated until EVERY lock is removed.`,
    warning:"Never remove another person's lock. Never work under someone else's lock."
  },
  {
    id:"iso4", phase:"STEP 3", icon:"🏷️",
    title:"Tag Out — attach a danger tag",
    body:`Attach a danger tag to the locked isolator(s) stating:\n• Your name\n• Date and time of isolation\n• Reason for isolation\n• Contact number\n\nThis tells anyone who finds the locked-out equipment what is happening and who to contact.`,
    warning:null
  },
  {
    id:"iso5", phase:"STEP 4", icon:"⚡",
    title:"Try to Operate — prove the isolation worked",
    body:`With everything locked out, go to the pendant or control panel and attempt to operate the hoist in all directions.\n\nExpected result: nothing happens.\n\nIf the hoist attempts to move — STOP. Your isolation is incomplete. Return to Step 1 and identify what you missed.`,
    warning:"This step is not optional. Always try to operate after locking out."
  },
  {
    id:"iso6", phase:"STEP 5", icon:"🔬",
    title:"Prove Dead — test with a GS38-compliant meter",
    body:`Using a meter or test lamp that complies with HSE GS38 (properly rated, insulated probes, no exposed metal above the finger guards):\n\n• Test between L1–L2, L2–L3, L1–L3 at the point you intend to work\n• Test L1, L2, L3 to earth/neutral\n• All readings should be zero\n\nIf any voltage is present — STOP. Do not work on the equipment until you have identified and isolated the live source.`,
    warning:"Test your meter on a KNOWN LIVE source before and after proving dead. A faulty meter can give a false zero reading."
  },
  {
    id:"iso7", phase:"STEP 6 — CAPACITOR DISCHARGE", icon:"⚠️",
    title:"Wait for capacitor discharge — brake circuits and VFD",
    body:`Capacitors hold charge after isolation. Discharge times differ significantly by circuit type — do not treat them as the same.\n\nBRAKE RECTIFIER CIRCUITS (Demag GE/GP/GS, 3TK modules and similar):\n• Capacitors discharge within 10–30 seconds after isolation\n• Wait a minimum of 30 seconds before touching brake coil terminals or rectifier connections\n• Then measure DC voltage across BR+ and BR- (or equivalent brake DC output terminals)\n• Confirm reading is zero volts before working\n\nVFD / VARIABLE FREQUENCY DRIVE DC BUS:\n• The DC bus holds approximately 565V DC (from a 400V supply) and takes significantly longer to discharge than a brake rectifier\n• Wait a minimum of 5 minutes after isolating the VFD supply before opening the drive enclosure or touching any DC bus terminals\n• Then measure DC bus voltage directly — confirm zero before working\n• Do not rely on the drive display going dark as confirmation that the DC bus is safe\n\nIf unsure which type of circuit you are working on: apply the 5-minute figure — it is always safe.`,
    warning:"VFD DC bus holds ~565V DC — minimum 5-minute discharge wait. Brake rectifier holds 100–200V DC — minimum 30-second discharge wait. These are different hazards with different required wait times."
  },
];

function IsolationProcedure({onClose}){
  const [step,setStep]=useState(0);
  const [confirmed,setConfirmed]=useState(false);
  const s=ISOLATION_STEPS[step];
  const isLast=step===ISOLATION_STEPS.length-1;
  return(
    <div style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"#000000dd",zIndex:1000,overflowY:"auto",padding:"16px 12px"}}>
      <div style={{maxWidth:600,margin:"0 auto"}}>
        <div style={{background:"#2a0800",border:`2px solid ${RED}`,borderRadius:10,padding:18,marginBottom:12}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
            <div style={{color:RED,fontSize:14,fontWeight:700,letterSpacing:"0.05em"}}>⚡ ISOLATION PROCEDURE</div>
            <button style={{...S.btn("ghost"),fontSize:10,padding:"4px 8px",color:MUTED}} onClick={onClose}>✕ Close</button>
          </div>
          <div style={{color:"#F9A8A8",fontSize:11,lineHeight:1.6}}>
            Read and follow every step before starting any electrical work on this equipment. This procedure satisfies the requirements of PUWER 1998, LOLER 1998, and HSE GS38.
          </div>
        </div>

        {/* Step progress */}
        <div style={{display:"flex",gap:5,marginBottom:12,flexWrap:"wrap"}}>
          {ISOLATION_STEPS.map((_,i)=>(
            <div key={i} onClick={()=>setStep(i)}
              style={{width:28,height:28,borderRadius:14,background:i===step?RED:i<step?GREEN:BORDER,
                color:i===step||i<step?TEXT:MUTED,fontSize:10,fontWeight:700,
                display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0}}>
              {i<step?"✓":i+1}
            </div>
          ))}
        </div>

        {/* Current step */}
        <div style={{background:PANEL,border:`1px solid ${s.warning?RED:BORDER}`,borderRadius:8,padding:16,marginBottom:10}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
            <span style={{fontSize:22}}>{s.icon}</span>
            <div>
              <div style={{color:AMBER,fontSize:9,fontWeight:700,letterSpacing:"0.15em"}}>{s.phase}</div>
              <div style={{color:TEXT,fontSize:14,fontWeight:700,marginTop:2}}>{s.title}</div>
            </div>
          </div>
          <div style={{color:"#C5C9D9",fontSize:13,lineHeight:1.8,whiteSpace:"pre-wrap",marginBottom:s.warning?12:0}}>
            {s.body}
          </div>
          {s.warning&&(
            <div style={{background:RED+"18",border:`1px solid ${RED}44`,borderRadius:6,padding:"9px 12px",marginTop:10}}>
              <div style={{color:RED,fontSize:11,fontWeight:700,lineHeight:1.6}}>⚠ {s.warning}</div>
            </div>
          )}
        </div>

        {/* Last step confirmation */}
        {isLast&&(
          <div style={{background:PANEL,border:`1px solid ${GREEN}44`,borderRadius:8,padding:14,marginBottom:10}}>
            <div style={{display:"flex",alignItems:"flex-start",gap:10}}>
              <div onClick={()=>setConfirmed(c=>!c)}
                style={{width:22,height:22,borderRadius:4,border:`2px solid ${confirmed?GREEN:BORDER}`,
                  background:confirmed?GREEN:"transparent",flexShrink:0,cursor:"pointer",marginTop:1,
                  display:"flex",alignItems:"center",justifyContent:"center"}}>
                {confirmed&&<span style={{color:DARK,fontSize:12,fontWeight:700}}>✓</span>}
              </div>
              <div style={{color:TEXT,fontSize:13,lineHeight:1.6,cursor:"pointer"}} onClick={()=>setConfirmed(c=>!c)}>
                I confirm I have completed all isolation steps and the equipment is proven dead before I begin work.
              </div>
            </div>
          </div>
        )}

        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          {step>0&&<button style={S.btn("ghost")} onClick={()=>setStep(s=>s-1)}>← Back</button>}
          {!isLast&&<button style={S.btn("primary")} onClick={()=>setStep(s=>s+1)}>Next Step →</button>}
          {isLast&&<button style={{...S.btn("success"),opacity:confirmed?1:0.4}} disabled={!confirmed} onClick={onClose}>
            ✓ Procedure complete — proceed to work
          </button>}
          <button style={{...S.btn("ghost"),marginLeft:"auto",color:MUTED,fontSize:11}} onClick={onClose}>Return to app</button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// DIAGRAM CONFIGS — with clarified wording (GAP 2, 3, 4, 5)
// ============================================================

// ============================================================
// OUT OF SERVICE PROCEDURE — Item 1
// ============================================================
const OOS_STEPS=[
  {icon:"🛑",phase:"IMMEDIATELY",title:"Stop all operations",
   body:`As soon as you identify a LOLER Regulation 9 defect (brake not holding, structural damage, safety system failure, or any condition making the equipment unsafe to use):\n\n• Stop the hoist immediately\n• If a load is suspended: lower it to the ground using the DOWN direction if the hoist is still capable of controlled lowering. Do NOT leave a load suspended on a defective hoist.\n• If the hoist cannot safely lower the load: do not attempt further operation. Call for specialist recovery support.`,
   warning:"Never leave a suspended load on equipment you have declared out of service."},
  {icon:"🔒",phase:"STEP 1",title:"Physically prevent operation",
   body:`Prevent anyone from operating the hoist while you investigate or wait for repair:\n\n• Lock off the main isolator with your personal padlock\n• Remove the pendant from the hook or tie it up out of reach if no lockoff is possible\n• Place physical barriers or safety tape around the hoist operating area\n• On crane installations: consider locking the bridge travel too — a moving crane with a defective hoist is still a danger\n\nA verbal instruction to "not use it" is NOT sufficient. People forget. Physical prevention is mandatory.`,
   warning:null},
  {icon:"🏷️",phase:"STEP 2",title:"Tag the equipment Out of Service",
   body:`Attach a prominent Out of Service tag to the main isolator AND the pendant:\n\n• Your name and contact number\n• Date and time\n• Brief description of the defect found\n• "DO NOT USE — OUT OF SERVICE" in large clear text\n\nIf you don't have a formal tag, write on tape or card. The important thing is that it's on the equipment and clearly visible.`,
   warning:null},
  {icon:"📞",phase:"STEP 3",title:"Report to the responsible person",
   body:`Notify the following people as appropriate to your organisation:\n\n• Your direct supervisor or line manager — immediately, before leaving site\n• The equipment owner or duty holder (the employer responsible for the equipment under LOLER)\n• Your company's maintenance manager or safety officer\n\nGive them:\n• The specific defect found\n• What checks you carried out\n• Your assessment of the safety risk\n• Whether any load was involved\n\nDo NOT leave site without reporting. A verbal report is the minimum — a written record is better.`,
   warning:null},
  {icon:"📋",phase:"STEP 4",title:"Document the defect",
   body:`Complete a written record of the defect. This is a legal requirement under LOLER 1998 Regulation 10.\n\nRecord:\n• Equipment identification (serial number, asset number, or location)\n• Date and time defect found\n• Nature of the defect in plain English\n• What tests you carried out and what results you found\n• Who you notified and when\n• Current status: out of service, waiting for repair, repair in progress\n\nKeep a copy. The duty holder must retain thorough examination records for a minimum of 2 years (LOLER Reg 11).`,
   warning:null},
  {icon:"✅",phase:"STEP 5",title:"Return to service requirements",
   body:`The hoist MUST NOT be returned to service until:\n\n• The defect has been repaired by a competent person\n• The repair has been tested and verified\n• For brake repairs: a static load test (at rated SWL) confirms the brake holds\n• For safety circuit repairs: full functional test of all safety functions\n• For rope/chain work: re-setting and testing of limit switches\n• A record of the repair and test is documented\n• The duty holder or their representative has authorised return to service\n\nRemoving your own Out of Service tag and returning a hoist to service without authorisation is a serious safety and legal matter.`,
   warning:"Do not remove the Out of Service tag or restore the hoist to service without explicit authorisation from the responsible person."},
];

function OOSProcedure({onClose}){
  const [step,setStep]=useState(0);
  const s=OOS_STEPS[step];
  const isLast=step===OOS_STEPS.length-1;
  return(
    <div style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"#000000ee",zIndex:1000,overflowY:"auto",padding:"16px 12px"}}>
      <div style={{maxWidth:600,margin:"0 auto"}}>
        <div style={{background:"#2a0800",border:`2px solid ${RED}`,borderRadius:10,padding:16,marginBottom:12}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
            <div style={{color:RED,fontSize:14,fontWeight:700}}>🛑 OUT OF SERVICE PROCEDURE</div>
            <button style={{...S.btn("ghost"),fontSize:10,padding:"3px 8px",color:MUTED}} onClick={onClose}>✕</button>
          </div>
          <div style={{color:"#F9A8A8",fontSize:11,lineHeight:1.6}}>LOLER Regulation 9 defect identified. Follow every step before leaving the equipment.</div>
        </div>
        <div style={{display:"flex",gap:5,marginBottom:12,flexWrap:"wrap"}}>
          {OOS_STEPS.map((_,i)=>(
            <div key={i} onClick={()=>setStep(i)}
              style={{width:28,height:28,borderRadius:14,background:i===step?RED:i<step?GREEN:BORDER,
                color:TEXT,fontSize:10,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0}}>
              {i<step?"✓":i+1}
            </div>
          ))}
        </div>
        <div style={{background:PANEL,border:`1px solid ${s.warning?RED:BORDER}`,borderRadius:8,padding:16,marginBottom:10}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
            <span style={{fontSize:22}}>{s.icon}</span>
            <div>
              <div style={{color:RED,fontSize:9,fontWeight:700,letterSpacing:"0.15em"}}>{s.phase}</div>
              <div style={{color:TEXT,fontSize:14,fontWeight:700,marginTop:2}}>{s.title}</div>
            </div>
          </div>
          <div style={{color:"#C5C9D9",fontSize:13,lineHeight:1.8,whiteSpace:"pre-wrap",marginBottom:s.warning?12:0}}>{s.body}</div>
          {s.warning&&<div style={{background:RED+"18",border:`1px solid ${RED}44`,borderRadius:6,padding:"9px 12px"}}>
            <div style={{color:RED,fontSize:11,fontWeight:700,lineHeight:1.6}}>⚠ {s.warning}</div>
          </div>}
        </div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          {step>0&&<button style={S.btn("ghost")} onClick={()=>setStep(s=>s-1)}>← Back</button>}
          {!isLast&&<button style={S.btn("danger")} onClick={()=>setStep(s=>s+1)}>Next Step →</button>}
          {isLast&&<button style={S.btn("success")} onClick={onClose}>✓ Procedure complete</button>}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// PROBE TECHNIQUE — Item 2
// ============================================================
const PROBE_TECHNIQUE_CONTENT=[
  {heading:"The One-Hand Rule — Most Important Habit in Live Work",
   body:`When measuring voltage on live equipment, keep your second hand in your pocket or behind your back. Always.\n\nWhy: if your red probe contacts a live terminal and your other hand is touching earthed metalwork, current can flow hand-to-hand — through your chest and heart. This is the path that causes cardiac arrest. Hand-to-hand is the most dangerous current path in the body.\n\nWith one hand in your pocket: the only path for fault current is from probe, through your hand, down your arm, and through your feet to earth. This path is less likely to cause cardiac arrest.\n\nThis applies to every voltage measurement you ever make. Make it automatic.`},
  {heading:"Meter and Probe Check — Before Every Live Test",
   body:`Before applying probes to any live circuit:\n\n1. CHECK PROBE INSULATION: Inspect probe leads for cuts, exposed wire, cracked insulation at the tip or at the lead entry. A probe with damaged insulation is a conductor, not an insulated test instrument.\n\n2. CHECK FINGER GUARDS: GS38 (HSE guidance on test equipment) requires probes to have finger guards that prevent fingers from sliding onto exposed metal. If your probes don't have finger guards, you should not be using them for live work.\n\n3. VERIFY ON KNOWN LIVE: Before testing the circuit under investigation, test your meter on a known live source (a socket outlet you know is live). This confirms the meter is working. A faulty meter can display zero on a live circuit — a false reading that kills.\n\n4. CHECK BATTERY: A low battery causes incorrect readings on some meters. Check the battery indicator before starting.`},
  {heading:"Setting Up the Meter",
   body:`The most common mistake: probing a circuit on the wrong meter setting.\n\nBefore touching any circuit:\n• Identify whether you're measuring AC or DC\n• Hoist control circuit (48V, 110V): V AC\n• Brake rectifier output: V DC\n• Coil and contact resistance: Ω or continuity mode\n• Motor insulation: 500V Megger (separate instrument — NOT a standard multimeter)\n\nSet the range BEFORE applying probes. On auto-ranging meters this is less critical but you should still select AC or DC manually.\n\nOn analogue meters: always start on the highest range and work down. Starting on a low range on a high voltage circuit damages the meter and can cause flashover.\n\nAfter testing: return the meter to a safe setting (V AC on a high range). Don't leave it in continuity mode — someone picking it up next will touch a live circuit thinking it's in voltage mode.`},
  {heading:"Physically Approaching Live Terminals",
   body:`Before probing a live terminal in a panel:\n\n1. LOOK FIRST: Identify the exact terminal you want to probe. Don't probe and then look — find the terminal visually first, note what's near it, identify any exposed adjacent live parts.\n\n2. BRACE YOUR HAND: Rest the back of your probing hand against the panel or a fixed surface if possible. This prevents sudden movement driving the probe deeper or across to an adjacent terminal.\n\n3. INSERT BLACK PROBE FIRST: Connect the COM (black) probe to the reference point (neutral, earth) first. This probe is less likely to cause a problem at a neutral or earth connection. Then bring in the red probe to the live terminal.\n\n4. WITHDRAW RED PROBE FIRST: When finished, remove the red probe from the live terminal first, then the black. Same principle — COM probe on neutral is less hazardous than red probe on live.\n\n5. DON'T RUSH: Site pressure is real. A site manager wanting the hoist back is real. Rushing live electrical work is how accidents happen. Take 30 extra seconds and do it right.`},
  {heading:"On Hoist Panels Specifically",
   body:`Hoist panels are often cramped, poorly lit, and installed in awkward locations. A few site-specific points:\n\n• TERMINAL SHROUDS: Many hoist contactors have plastic shrouds over the power terminals. These can usually be lifted or removed with a flat screwdriver to access the terminals — with supply isolated. Do not probe behind shrouds with supply live unless you can see clearly what you're probing.\n\n• CONTACTOR ORIENTATION: Contactors are mounted in any orientation — face-on, sideways, upside down. The terminal labelling is always consistent (L1/L2/L3 on top when face-on) but you may need to rotate your mental picture of the diagram.\n\n• BUSBAR PROXIMITY: In the power section of the panel, live busbars may be very close to test points. Know where the live busbars are before probing.\n\n• TORCH: Carry a decent torch. Panel lighting is often inadequate or non-existent. A head torch keeps both hands free.`},
];

// ============================================================
// PANEL ORIENTATION — Item 3
// ============================================================
const PANEL_ORIENTATION_CONTENT=[
  {heading:"Opening the Panel — What You're Looking At",
   body:`When you open a hoist panel door for the first time, you'll typically see:\n\nTOP SECTION — POWER: Main isolator, incoming cable gland, main fuses or MCBs, possibly the control transformer. High voltage (415V) components. Often separated from the control section by a physical barrier or shroud.\n\nMIDDLE SECTION — CONTACTORS: The motor direction contactors (UP/DOWN), possibly star-delta contactors if fitted. Usually the largest components in the panel. On Demag: typically two identical contactors side by side with a mechanical interlock bar between them.\n\nLOWER SECTION — CONTROL: Terminal blocks (the numbered strips where all the wires connect), overload relay, control transformer secondary fuse, safety relay. This is where most fault-finding happens.\n\nSIDE OR BACK — VFD: If a variable frequency drive is fitted, it's often mounted on the back of the panel door or on a separate plate. The VFD display faces outward when the door is open.`},
  {heading:"Finding Terminal Blocks and Terminal Numbers",
   body:`Terminal blocks are the strips of numbered connectors where all the wires in the control circuit connect. They're usually mounted on DIN rail in the lower section of the panel.\n\nFinding the right terminal:\n• Terminal numbers are printed on the terminal block body, usually on a small white or yellow label between the connection points\n• The schematic's terminal numbers correspond directly to these labels — Terminal 3 on the schematic is Terminal 3 on the block\n• Wires are also usually numbered — look for small numbered ferrules (metal or plastic sleeves) on each wire end\n• If the wire has no ferrule: follow the wire from the terminal back to the component and identify it that way\n\nWhen wire numbers and terminal numbers don't match: this is common on older or modified installations. Trust the physical connection — trace the wire from the component you're interested in to the terminal block, not the other way.`},
  {heading:"Locating Specific Components",
   body:`How to find what you're looking for quickly:\n\nCONTACTORS: Look for the largest relay-type components in the panel — rectangular blocks typically 60–120mm tall. Direction contactors are usually labelled KM1/KM2 or UP/DOWN. The coil terminals A1 and A2 are typically on the side or bottom of the contactor body.\n\nOVERLOAD RELAY: Usually attached directly to the bottom of one of the motor contactors. Has a small RESET button (often blue or yellow) and a dial or DIP switches for current setting. May also be standalone on DIN rail.\n\nCONTROL TRANSFORMER: A small transformer, typically 50–200VA for a hoist control circuit. Has primary connections (to 415V supply) and secondary connections (48V or 110V to control circuit). Often has integral fuse holders.\n\nSAFETY RELAY: A dedicated relay module on DIN rail — Pilz PNOZ (yellow/grey), Sick i10 (grey/green), or Schmersal SRB (grey). Has multiple LED indicators on the face. Look for the dual-channel wiring (two wires going to the e-stop circuit).\n\nBRAKE RECTIFIER: On Demag: a small grey or black plastic module, typically 50–80mm, marked 'GE', 'GP', or 'GS' and a voltage rating. Mounted on DIN rail. Has screw terminals for AC input and DC output. The Demag 3TK signal converter is slightly larger and has additional terminals for brake monitoring.`},
  {heading:"When There's No Schematic",
   body:`The panel schematic is missing. This happens — lost, damaged, never fitted. Here's how to proceed:\n\nFIRST: Check everywhere. Folded inside the panel door (sometimes tucked in the hinge area), attached to the back of the door, taped inside the cable duct lid, in a plastic wallet behind a component.\n\nNOT FOUND — GET IT:\n• Find the hoist serial number (on the nameplate — usually on the hoist body near the rope guide or chain guide, or on the end plate)\n• Contact the manufacturer's technical support with the serial number — Demag, Konecranes, SWF, and most major manufacturers can supply a schematic from the serial number, sometimes within hours\n• Your company may have a copy on file — check with the office\n\nNOT FOUND — WORK WITHOUT IT:\n• Use the generic circuit knowledge from the app — the fundamental topology (supply → e-stop → OLR → limits → button → coil) is the same on virtually every hoist\n• Trace wires physically — follow each wire from its component to its termination point and build your own circuit picture\n• Document what you find — if you trace the circuit, sketch it down. You've just created the missing schematic for next time.\n\nNOT COMFORTABLE — STOP:\n• If the circuit is non-standard, extensively modified, or you cannot determine the circuit topology safely, do not proceed with live testing\n• Get the manufacturer's documentation before continuing\n• A hoist that's been modified by someone who also removed or never had the schematic is a significant unknown risk`},
  {heading:"Reading Wire Ferrules and Terminal Labels",
   body:`Wire ferrules are the small numbered sleeves crimped onto wire ends. They tell you which circuit the wire belongs to.\n\nIEC standard wire numbering:\n• Wires in the power circuit: typically L1, L2, L3, or numbered by phase\n• Control circuit wires: numbered sequentially (1, 2, 3...) following the circuit path\n• The number on the wire matches the terminal it connects to\n\nWhen following a circuit in the panel:\n1. Find the component (e.g., e-stop NC contact output terminal)\n2. Find the wire leaving that terminal — note its ferrule number\n3. Follow that wire to the terminal block — the terminal with that number\n4. The next device in the circuit connects to the same terminal or the next number\n\nOn older or maintained-in-service hoists: wire numbers may not match the schematic, ferrules may be missing, or multiple modifications may have been made. In this case, trace physically and don't trust numbers alone.`},
];

// ============================================================
// PRE-ENERGISATION CHECKLIST — Item 4
// ============================================================
const PRE_ENERGISATION_CHECKS=[
  {id:"pe1",cat:"WIRING",text:"All wiring connections tightened and no bare conductors exposed near adjacent terminals or busbars"},
  {id:"pe2",cat:"WIRING",text:"Replaced component wiring matches original — check terminal numbers on schematic against physical connections"},
  {id:"pe3",cat:"WIRING",text:"No tools, wire off-cuts, screws, or foreign objects left inside the panel"},
  {id:"pe4",cat:"COMPONENT",text:"Replacement component is the correct type, voltage rating, and current rating — compare nameplate data"},
  {id:"pe5",cat:"COMPONENT",text:"Contactor: coil voltage matches control circuit voltage (check coil label — 48V AC, 110V AC, 24V DC etc.)"},
  {id:"pe6",cat:"COMPONENT",text:"Contactor: mechanical interlock bar refitted and confirmed free to move if contactors were removed"},
  {id:"pe7",cat:"COMPONENT",text:"Overload relay: current setting checked against motor nameplate FLA and reset to correct value"},
  {id:"pe8",cat:"COMPONENT",text:"Fuses: replacement fuses are correct type (HRC/cartridge) and correct current rating — compare to blown fuse and schematic"},
  {id:"pe9",cat:"BRAKE",text:"Brake circuit: if brake components were disturbed, brake coil leads reconnected to correct polarity (DC+/DC-)"},
  {id:"pe10",cat:"BRAKE",text:"Brake circuit: rectifier module reconnected with correct AC input and DC output terminals"},
  {id:"pe11",cat:"SAFETY",text:"E-stop: if e-stop was worked on, button resets correctly and NC contact confirmed (continuity when released)"},
  {id:"pe12",cat:"SAFETY",text:"Safety relay: if safety relay was disturbed, dual-channel wiring reconnected and reset procedure understood"},
  {id:"pe13",cat:"LIMITS",text:"Limit switches: if any rope or chain work was done, limits have been re-set and will be tested at slow speed before full operation"},
  {id:"pe14",cat:"PANEL",text:"Panel door can be closed fully — no wires trapped, no components fouling the door"},
  {id:"pe15",cat:"PANEL",text:"All terminal shrouds and protective covers refitted"},
  {id:"pe16",cat:"TEST",text:"Isolation locks removed, all personnel clear, barriers in place for initial energisation"},
  {id:"pe17",cat:"TEST",text:"First operation: command UP at slow speed (or lowest speed if two-speed) with NO load, ready to E-stop immediately"},
  {id:"pe18",cat:"TEST",text:"For brake repairs: static load test at rated SWL — lower load to ground, stop, confirm load does not drift"},
  {id:"pe19",cat:"TEST",text:"For limit switch work: test upper limit at slow speed with no load before any loaded operation"},
  {id:"pe20",cat:"TEST",text:"Document the repair: what was found, what was replaced, what tests were carried out, return to service authorised by whom"},
];

function PreEnergisationChecklist({onClose}){
  const [checked,setChecked]=useState({});
  const cats=[...new Set(PRE_ENERGISATION_CHECKS.map(c=>c.cat))];
  const allChecked=PRE_ENERGISATION_CHECKS.every(c=>checked[c.id]);
  const doneCount=Object.keys(checked).length;
  function toggle(id){setChecked(prev=>({...prev,[id]:!prev[id]}));}
  return(
    <div style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"#000000ee",zIndex:1000,overflowY:"auto",padding:"16px 12px"}}>
      <div style={{maxWidth:600,margin:"0 auto"}}>
        <div style={{background:"#071a10",border:`2px solid ${GREEN}`,borderRadius:10,padding:14,marginBottom:12}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
            <div style={{color:GREEN,fontSize:14,fontWeight:700}}>✓ PRE-ENERGISATION CHECKLIST</div>
            <button style={{...S.btn("ghost"),fontSize:10,padding:"3px 8px",color:MUTED}} onClick={onClose}>✕</button>
          </div>
          <div style={{color:"#86EFAC",fontSize:11,lineHeight:1.6,marginBottom:8}}>Complete before switching supply back on after any repair. Tick each item as confirmed.</div>
          <div style={{...S.prog}}><div style={S.progFill(Math.round((doneCount/PRE_ENERGISATION_CHECKS.length)*100))}/></div>
          <div style={{color:GREEN,fontSize:10,marginTop:4}}>{doneCount}/{PRE_ENERGISATION_CHECKS.length} confirmed</div>
        </div>
        {cats.map(cat=>(
          <div key={cat} style={{marginBottom:14}}>
            <div style={{color:AMBER,fontSize:9,fontWeight:700,letterSpacing:"0.15em",marginBottom:8}}>{cat}</div>
            {PRE_ENERGISATION_CHECKS.filter(c=>c.cat===cat).map(c=>(
              <div key={c.id} onClick={()=>toggle(c.id)}
                style={{display:"flex",gap:10,alignItems:"flex-start",background:checked[c.id]?"#071a10":PANEL2,
                  border:`1px solid ${checked[c.id]?GREEN:BORDER}`,borderRadius:6,padding:"10px 12px",marginBottom:6,cursor:"pointer"}}>
                <div style={{width:20,height:20,borderRadius:4,border:`2px solid ${checked[c.id]?GREEN:BORDER}`,
                  background:checked[c.id]?GREEN:"transparent",flexShrink:0,marginTop:1,
                  display:"flex",alignItems:"center",justifyContent:"center"}}>
                  {checked[c.id]&&<span style={{color:DARK,fontSize:11,fontWeight:700}}>✓</span>}
                </div>
                <span style={{color:checked[c.id]?GREEN:TEXT,fontSize:12,lineHeight:1.6}}>{c.text}</span>
              </div>
            ))}
          </div>
        ))}
        <div style={{...S.resBox(allChecked?GREEN:ORANGE),marginBottom:12}}>
          {allChecked
            ?<div style={{color:GREEN,fontWeight:700,fontSize:13}}>✓ All items confirmed — safe to energise</div>
            :<div style={{color:ORANGE,fontWeight:700,fontSize:13}}>Complete all items before energising — {PRE_ENERGISATION_CHECKS.length-doneCount} remaining</div>}
        </div>
        <button style={S.btn("ghost")} onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

// ============================================================
// VFD FAULT CODE LOOKUP — Item 6 (high value, needed early)
// ============================================================
const VFD_CODES={
  "Demag Dedrive Compact":[
    {code:"F0001",meaning:"Overcurrent",action:"Check brake release timing, accel ramp, motor data"},
    {code:"F0002",meaning:"Overvoltage DC bus",action:"Extend decel ramp, check for regeneration — fit braking resistor"},
    {code:"F0003",meaning:"Undervoltage DC bus",action:"Check incoming supply voltage, phase loss, fuses"},
    {code:"F0004",meaning:"Drive overtemperature",action:"Check cooling fan, clean heatsink, check ambient temperature"},
    {code:"F0005",meaning:"Motor overtemperature",action:"Check motor thermistor circuit, check duty cycle, check brake"},
    {code:"F0007",meaning:"Ground fault / earth fault",action:"Megger motor and cables with drive disconnected"},
    {code:"F0011",meaning:"Motor stall",action:"Check mechanical load, brake release, ramp times"},
    {code:"F0021",meaning:"Safe Torque Off (STO) active",action:"Check e-stop chain, safety relay, reset procedure"},
    {code:"A0501",meaning:"Current limit reached (warning)",action:"Check load, brake, ramp — not yet a trip"},
    {code:"A0503",meaning:"Motor overload warning",action:"Reduce duty cycle or check brake drag before it trips"},
  ],
  "Siemens G120 / G120C":[
    {code:"F30001",meaning:"Overcurrent",action:"Check accel ramp, motor parameters, brake release sequence"},
    {code:"F30002",meaning:"DC bus overvoltage",action:"Extend decel ramp, fit braking resistor (BOP)"},
    {code:"F30003",meaning:"DC bus undervoltage",action:"Check supply, fuses, phase loss"},
    {code:"F30004",meaning:"Drive overtemperature",action:"Check fan, ambient temp, duty cycle"},
    {code:"F30021",meaning:"Ground fault",action:"Megger motor and cables"},
    {code:"F01500",meaning:"Motor blocked / stall",action:"Check brake, mechanical load"},
    {code:"F09000",meaning:"Safe Torque Off (STO) active",action:"Check e-stop and safety relay"},
  ],
  "ABB ACS355 / ACS580":[
    {code:"OC",meaning:"Overcurrent",action:"Accel ramp too short, brake not releasing, motor fault"},
    {code:"OV",meaning:"Overvoltage",action:"Decel ramp too short, regenerative load — fit braking resistor"},
    {code:"UV",meaning:"Undervoltage",action:"Supply dip, phase loss, incoming fuse"},
    {code:"OT",meaning:"Overtemperature",action:"Check drive cooling, ambient temperature"},
    {code:"EF",meaning:"Earth/ground fault",action:"Megger motor and cables"},
    {code:"STO",meaning:"Safe Torque Off active",action:"Check e-stop circuit, safety relay, reset"},
    {code:"STALL",meaning:"Motor stall",action:"Mechanical load, brake release"},
  ],
  "Konecranes / SX Drive":[
    {code:"OCA",meaning:"Overcurrent — hardware trip",action:"Check motor, cables, accel ramp"},
    {code:"OCS",meaning:"Overcurrent — software limit",action:"Check load, ramp, brake"},
    {code:"OV",meaning:"DC bus overvoltage",action:"Decel ramp, braking resistor"},
    {code:"UV",meaning:"DC bus undervoltage",action:"Supply, fuses, phase loss"},
    {code:"OH",meaning:"Overtemperature",action:"Cooling, ambient, duty cycle"},
    {code:"GF",meaning:"Ground fault",action:"Megger motor and cables"},
    {code:"STO",meaning:"Safe Torque Off",action:"E-stop chain, safety relay"},
  ],
};

function VFDCodeLookup({onClose}){
  const [drive,setDrive]=useState(Object.keys(VFD_CODES)[0]);
  const [search,setSearch]=useState("");
  const codes=VFD_CODES[drive].filter(c=>
    !search||c.code.toLowerCase().includes(search.toLowerCase())||
    c.meaning.toLowerCase().includes(search.toLowerCase())
  );
  return(
    <div style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"#000000ee",zIndex:1000,overflowY:"auto",padding:"16px 12px"}}>
      <div style={{maxWidth:600,margin:"0 auto"}}>
        <div style={{background:PANEL,border:`1px solid ${AMBER}`,borderRadius:10,padding:14,marginBottom:12}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
            <div style={{color:AMBER,fontSize:14,fontWeight:700}}>🔴 VFD FAULT CODE LOOKUP</div>
            <button style={{...S.btn("ghost"),fontSize:10,padding:"3px 8px",color:MUTED}} onClick={onClose}>✕</button>
          </div>
          <div style={{color:MUTED,fontSize:11,marginBottom:10}}>Select the drive manufacturer, then find your fault code.</div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:10}}>
            {Object.keys(VFD_CODES).map(d=>(
              <button key={d} style={{...S.navBtn(drive===d),fontSize:10,padding:"5px 9px"}} onClick={()=>setDrive(d)}>{d}</button>
            ))}
          </div>
          <input
            placeholder="Search code or description..."
            value={search} onChange={e=>setSearch(e.target.value)}
            style={{width:"100%",background:PANEL2,border:`1px solid ${BORDER}`,borderRadius:5,padding:"8px 10px",
              color:TEXT,fontFamily:"inherit",fontSize:12,outline:"none"}}/>
        </div>
        {codes.map((c,i)=>(
          <div key={i} style={{background:PANEL,border:`1px solid ${BORDER}`,borderRadius:7,padding:13,marginBottom:8}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:6}}>
              <span style={{...S.tag(RED),fontSize:12,fontFamily:"monospace"}}>{c.code}</span>
              <span style={{color:TEXT,fontWeight:700,fontSize:13}}>{c.meaning}</span>
            </div>
            <div style={{color:"#C5C9D9",fontSize:12,lineHeight:1.6}}>
              <span style={{color:AMBER,fontWeight:700}}>Action: </span>{c.action}
            </div>
          </div>
        ))}
        {codes.length===0&&<div style={{color:MUTED,fontSize:12,textAlign:"center",padding:20}}>
          No codes found. Check the drive manual for this code — manufacturer fault code documentation is available on their websites.
        </div>}
        <div style={{...S.resBox(BLUE),marginTop:10}}>
          <div style={{color:BLUE,fontSize:10,fontWeight:700,marginBottom:4}}>ℹ NOTE</div>
          <div style={{color:"#C5C9D9",fontSize:11,lineHeight:1.6}}>Fault code formats vary by drive firmware version. If your code isn't listed, search "[manufacturer] [code] fault" or consult the drive's parameter manual. The general categories (OC, OV, UV, OH, GF, STO) translate across manufacturers even if the exact code differs.</div>
        </div>
        <button style={{...S.btn("ghost"),marginTop:10}} onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

// ============================================================
// COMPONENT RECOGNITION — Item 8 (what things look like)
// ============================================================
const COMPONENT_RECOGNITION=[
  {name:"Contactor",
   description:`A relay designed for switching motor-level currents. Rectangular block, typically 80–150mm tall depending on current rating. Mounted on DIN rail or panel backplate.\n\nWhat to look for:\n• Four rows of terminals visible from the front — power terminals top (L1/L2/L3) and bottom (T1/T2/T3), auxiliary terminals on the sides or front face\n• A smooth flat face (the armature face) that pulls in when energised\n• A coil voltage label on the body or coil module (e.g. 'AC 48V', 'AC 110V')\n• On Demag: MOELLER (now Eaton) or Siemens 3RT contactors are typical\n• On Konecranes: ABB or Schneider contactors common\n• The mechanical interlock bar between UP and DOWN contactors — a grey or white plastic/metal bar linking the two armature faces`,
   tag:"CONTACTOR",tagColor:AMBER},
  {name:"Thermal Overload Relay",
   description:`Usually bolted directly to the bottom of the motor contactor or mounted on DIN rail nearby. Smaller than the contactor — typically 50–80mm tall.\n\nWhat to look for:\n• A small knob or dial on the face (current setting — should match motor FLA)\n• A small RESET button — usually blue, yellow, or red — often recessed\n• Sometimes a TEST button\n• On Siemens: 3RU or 3RB series — grey with orange or yellow accents\n• On Eaton: PKE or PKZ series\n• On Schneider: LR9 or LRD series\n• A TRIP indicator — a small window that shows red when tripped`,
   tag:"OLR",tagColor:RED},
  {name:"Brake Rectifier Module",
   description:`Converts AC supply to DC for the brake electromagnet. Small module, typically 40–80mm, mounted on DIN rail.\n\nWhat to look for:\n• On Demag: grey or black plastic module labelled 'GE xxx V' (xxx = voltage rating, e.g. GE 200V). Screw terminals for AC input (L, N) and DC output (BR+, BR-). Sometimes integrated into the larger '3TK signal converter' module which is slightly larger and has more terminals.\n• On Stahl: similar small DIN-rail module, may be labelled with voltage rating\n• On older hoists: may be a separate PCB in a housing, or a discrete diode bridge in a heat-sink block\n• The Demag GP/GS/GE suffix indicates the rectifier type — GE is the most common (full-wave, standard)\n\nIf you can't find it: follow the brake coil wires back from the brake. They'll lead to this module.`,
   tag:"RECTIFIER",tagColor:BLUE},
  {name:"Safety Relay",
   description:`A dedicated safety-certified relay that monitors the e-stop circuit and other safety functions. Mounted on DIN rail, usually in the lower section of the panel.\n\nWhat to look for:\n• PILZ PNOZ series: yellow body with grey face, multiple LEDs, 'PNOZ' printed on body — very common on UK hoists\n• PILZ PNOZmini: smaller, similar yellow/grey colour scheme\n• SICK i10/i12: grey/green body\n• SCHMERSAL SRB: grey body with coloured LED strip\n• Look for the LED indicators — typically CH1 and CH2 showing green when healthy\n• Look for dual-channel wiring — two pairs of wires going to the e-stop circuit\n• A RESET button on the face or a reset input terminal`,
   tag:"SAFETY RELAY",tagColor:GREEN},
  {name:"Control Transformer",
   description:`Steps 415V down to 48V or 110V for the control circuit. Usually in the top or middle section of the panel.\n\nWhat to look for:\n• A small transformer — typically epoxy-resin or open-wound, 50–200VA\n• Often mounted directly with bolts through the panel backplate\n• Four connection points — two primary (415V, connected to two phases via fuses) and two secondary (48V or 110V, with a small fuse on one secondary terminal)\n• May have a cover or shroud over the primary connections\n• On some Demag panels: the transformer is inside a small metal housing with a cover`,
   tag:"TRANSFORMER",tagColor:BLUE},
  {name:"Slip Clutch",
   description:`A friction overload device on the motor shaft that slips when the load exceeds the rated trip torque (typically 110–160% SWL). Found on chain hoists — not normally present on rope hoists.\n\nWhere it sits: inside the hoist body, between the motor shaft and the chain drive gearing. You cannot usually see it without opening the hoist cover.\n\nWhat to listen for:\n• Motor running sound — you can hear the motor and feel vibration through the hoist body\n• Chain completely stationary — not moving at all\n• Sometimes a faint grinding or rubbing sound from inside the unit as the clutch slips\n• On hoists with a display: a slip code or indicator appears\n\nWhat you can see from outside:\n• Motor fan spinning (visible through guard or by feeling airflow)\n• No chain movement despite motor running\n• Hoist body vibrating — motor is energised\n\nWhat it is NOT:\n• If motor is humming but not freely turning — more likely brake stuck or phase loss, not clutch\n• If chain moves but slowly — not clutch, check brake drag or supply voltage\n\nElectrical diagnosis: measure current at panel with clamp meter while motor runs with no chain movement. Current present + no movement = electrical path is complete. Mechanical investigation required.`,
   tag:"SLIP CLUTCH",tagColor:ORANGE},
  {name:"Limit Switch Types",
   description:`Two fundamentally different limit switch types — one for rope hoists, one for chain hoists. Getting these confused is a common apprentice mistake.\n\nROTARY CAM TYPE (rope hoists — Demag DR, Konecranes, Street, SWF rope hoists):\n• Mounted inside the hoist body, mechanically driven from the rope drum shaft\n• As the drum rotates, a cam disc rotates in proportion\n• Multiple cams on the same spindle — one for upper slow-down, one for cut-out, sometimes a third for lower\n• What you see: a small gearbox/switch assembly with two or more micro-switches inside a housing, wired into the control circuit\n• Adjustment: the cam positions can be rotated on the shaft to change the cut-out point — always consult the hoist manual\n• Must be re-set and re-tested after any rope resocketing (rope length change moves the effective cut-out position)\n\nGRAVITY WEIGHT TYPE (chain hoists — Demag DC chain, Yale, STAHL ST, most small chain hoists):\n• A weight hangs on a lever arm that projects into the chain path\n• When the bottom block rises and lifts the weight, the lever trips a micro-switch\n• What you see: a small cast or pressed metal weight hanging from a pivot on the underside or side of the hoist body, with a micro-switch behind it\n• Adjustment: moving the weight position on the lever or adjusting the chain guide height sets the cut-out point\n• Check: the weight must hang freely, not fouled on any chain guide, structure, or chain fall\n\nBOTH TYPES — same electrical principle: NC contact in series with the UP coil circuit. Fails safe — broken wire or failed switch opens the circuit and stops upward travel.`,
   tag:"LIMIT SWITCH",tagColor:GREEN},
];

// ============================================================
// ROPE AND CHAIN CONDEMNATION — Item 12
// ============================================================
const ROPE_CHAIN_CONTENT=[
  {heading:"Why This Matters for Electrical Engineers",
   body:`As an electrical engineer on a hoist, you will routinely open panels, access the hoist body, and work near the lifting medium. You are not responsible for the structural examination — that's the thorough examiner's role — but you ARE responsible for stopping work and reporting if you observe an obvious defect.\n\nUnder PUWER and LOLER, any person who identifies a defect that makes equipment unsafe has a duty to report it. "That's not my job" is not a defence if you saw a condemnable rope and said nothing.`},
  {heading:"Wire Rope — What to Look For",
   body:`CONDEMN if you observe any of the following:\n\n• BROKEN WIRES: More than a certain number of broken wires within one rope lay length (the distance for one complete strand rotation — typically 6–8× the rope diameter). The specific limit depends on the rope construction and is in EN 14492-2 and the manufacturer's manual. As a guide: more than 3 broken wires in one lay length should be reported immediately.\n• CORROSION: Surface rust on rope wires indicates moisture ingress. Heavy corrosion or pitting of wires = condemn.\n• REDUCTION IN DIAMETER: If the rope appears thinner than its nominal diameter at any point (kink, crush, or internal corrosion). Check with calipers if you have them.\n• KINKING: A kink in a wire rope cannot be straightened. A kinked rope must be replaced — the wire arrangement is permanently damaged.\n• BIRD-CAGING: The rope wires separating outward in a cage pattern. Caused by shock loading or over-torquing. Condemn immediately.\n• HEAT DAMAGE: Discolouration, stiffness, or brittleness from contact with hot surfaces.\n• END TERMINATIONS: Check the rope socket or swage at the drum and at the hook block. Broken wires adjacent to a socket, corrosion at the entry point, or a socket that moves on the rope = condemn.`},
  {heading:"Roller Chain — What to Look For",
   body:`For Demag DC and similar chain hoists:\n\n• ELONGATION: Chain stretches over time. Measure a known number of links and compare to the manufacturer's new-chain length specification. Typically: elongation of more than 2% = condemn. Check with the hoist manufacturer's manual.\n• TWISTED OR KINKED LINKS: Any twist or kink in a chain link = condemn.\n• CRACKED LINKS: Visible cracks in link plates = condemn.\n• CORROSION: Surface rust is acceptable if lubricated. Deep pitting or flaking = condemn.\n• WORN PINS OR ROLLERS: Significant wear on chain pins or rollers = condemn.\n• HOOK LATCH: Check the hook safety latch engages and springs back. A latch that doesn't engage = condemn until repaired.`},
  {heading:"What to Do if You Find a Defect",
   body:`1. Stop work on the hoist immediately\n2. Take the hoist out of service (follow the Out of Service procedure)\n3. Note what you found and where — a photo is very useful\n4. Report to your supervisor and the equipment duty holder\n5. DO NOT attempt to repair rope or chain defects yourself — rope and chain replacement is a separate competence and requires its own testing and documentation\n6. The hoist must not return to service until the rope or chain has been replaced and the thorough examination record updated`},
];

// ============================================================
// LOAD TEST GUIDANCE — Item 13
// ============================================================
const LOAD_TEST_CONTENT=[
  {heading:"When a Load Test is Required After Repair",
   body:`Not every repair requires a formal load test — but some do. As a guide:\n\nALWAYS TEST AFTER:\n• Any brake component replacement (disc, coil, springs, rectifier module)\n• Any rope or chain replacement or resocketing\n• Any repair to the safety circuit (e-stop, safety relay)\n• Any repair to the limit switch system\n• Any structural repair (not applicable to electrical engineers but listed for completeness)\n\nFUNCTIONAL TEST (no load) IS SUFFICIENT FOR:\n• Contactor replacement\n• Overload relay replacement\n• Control circuit wiring repair\n• Pendant replacement\n• VFD parameter adjustment\n\nALWAYS CHECK WITH YOUR SUPERVISOR — your company's safe system of work and the equipment's current thorough examination certificate may specify requirements beyond the minimum above.`},
  {heading:"Static Load Test — Brake After Repair",
   body:`After any brake repair, perform a static load test to confirm the brake holds rated load:\n\n1. ATTACH A TEST LOAD equal to or slightly above the SWL (Safe Working Load) of the hoist — typically SWL for a static test. Your company procedure will specify the exact test load.\n2. RAISE THE LOAD approximately 300mm off the ground — no higher than necessary.\n3. STOP THE HOIST — release all direction buttons.\n4. OBSERVE FOR 5 MINUTES — the load must not drift, lower, or move.\n5. IF LOAD HOLDS: lower it to ground, test is passed, document the test.\n6. IF LOAD DRIFTS: the brake has not passed the test. Take out of service. Do not lower the load under gravity — use the hoist controls to lower it if possible, or call for specialist recovery.\n\nThe test load and duration may be specified by your company's safe system of work or by the hoist manufacturer's maintenance documentation. Follow those requirements over the generic guidance above.`},
  {heading:"Documenting the Test",
   body:`After any load test, document:\n\n• Date and time of test\n• Equipment identity (serial number, asset number)\n• Nature of repair carried out\n• Test load used (in kg or tonnes)\n• Test duration\n• Result: PASS or FAIL\n• Name and signature of person who carried out the test\n• Name of person who witnessed the test (if required by company procedure)\n\nThis documentation forms part of the equipment's maintenance history and supports the thorough examination record under LOLER.`},
];

// ============================================================
// SLIP CLUTCH — GENERIC CROSS-HOIST REFERENCE
// ============================================================
const SLIP_CLUTCH_CONTENT=[
  {heading:"What the Slip Clutch Is — and Where It Sits",
   body:`The slip clutch is a friction device on the motor shaft that slips when the chain load exceeds the set trip torque — chain stops, motor keeps turning.\n\nThree purposes:\n• Overload protection — primary function, stops chain at rated overload (typically 110–160% SWL)\n• Emergency travel stop — backup if both limit switches fail at end of travel\n• EC-required load-control device (mandatory for capacity ≥ 1,000 kg)\n\nLOAD PATH: Motor → Slip Clutch → Chain\nThe brake sits before the clutch on most designs. So when the clutch slips, the brake still holds the load. The load does not drop.\n\nHOW YOU KNOW IT'S ACTIVE:\n• Motor is running — you can hear it, feel vibration on the hoist body\n• Chain is not moving\n• No electrical fault — contactors are in, supply is correct\n• On hoists with a display (Demag DC-Pro): a fault or slip code appears\n• On all other hoists: symptom only — motor sound + no movement\n\nELECTRICAL CONFIRMATION: Measure current draw at the panel with a clamp meter while the motor runs without chain movement. Current will be present (motor is loaded) but the chain won't feed. This confirms the electrical path is complete and the slip is mechanical. Your job stops there — call for mechanical support if the clutch is tripping at rated load.`},
  {heading:"Confirming It's the Clutch — Not an Electrical Fault",
   body:`Before calling it a slip clutch issue, eliminate electrical causes:\n\n1. Is the brake releasing? Listen for the brake clack on power-up. No clack = brake not releasing = motor straining against the brake, not a clutch issue. Go to Brake Not Releasing in the fault tree.\n\n2. Are all three phases present at the motor? Phase loss causes the motor to hum under high current without turning — that's not the same as the motor turning freely. Check phases at motor terminals.\n\n3. Is the motor actually turning? On some enclosed hoists you can feel the motor body vibrate and hear it. On others, inspect the motor fan through the guard — it should be spinning.\n\nIF motor is turning freely, brake is releasing, all phases confirmed, chain not moving → this is a mechanical slip clutch issue. The electrical path is correct.\n\nIF motor is humming but barely moving, drawing very high current, and the hoist feels "stiff" → suspect brake drag first, then mechanical seizure. Not a clutch slip.`},
  {heading:"What Happens Next — Your Role and the Handoff",
   body:`Once you've confirmed the electrical circuit is correct and the slip clutch is active:\n\n1. Reduce the load — if the hoist is overloaded, reducing the load will allow operation to resume. Test at rated SWL before calling anything a fault.\n\n2. If clutch trips at or below rated SWL: this is a mechanical fault — the clutch trip torque has drifted or the clutch is worn. This is NOT an electrical diagnosis. Your job is to:\n   • Confirm the electrical path is working (motor runs, supply correct, brake releases)\n   • Document what you found: motor running, no chain movement, current present\n   • Take the hoist out of service if clutch trips at rated load\n   • Report to supervisor for mechanical investigation\n\n3. DO NOT attempt to operate repeatedly if the clutch is slipping — repeated slip without cool-down periods causes thermal damage to the lining.\n\n4. DO NOT attempt to adjust the clutch unless you are specifically trained and authorised to do so. Adjustment procedures vary by manufacturer and some hoists (Demag DC-Pro) must not be adjusted in the field at all — the factory setting is part of the EC conformity declaration.\n\nMINIMUM COOL-DOWN between clutch test cycles: 20 minutes.`},
];

// ============================================================
// PROBE TECHNIQUE VIEWER (shared content viewer component)
// ============================================================
function ContentModal({title,color,icon,sections,onClose}){
  const [idx,setIdx]=useState(0);
  const s=sections[idx];
  return(
    <div style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"#000000ee",zIndex:1000,overflowY:"auto",padding:"16px 12px"}}>
      <div style={{maxWidth:600,margin:"0 auto"}}>
        <div style={{background:PANEL,border:`2px solid ${color}`,borderRadius:10,padding:14,marginBottom:12}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
            <div style={{color:color,fontSize:14,fontWeight:700}}>{icon} {title}</div>
            <button style={{...S.btn("ghost"),fontSize:10,padding:"3px 8px",color:MUTED}} onClick={onClose}>✕</button>
          </div>
          <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
            {sections.map((_,i)=>(
              <button key={i} style={{...S.navBtn(i===idx),fontSize:10,padding:"3px 8px"}} onClick={()=>setIdx(i)}>
                {i+1}
              </button>
            ))}
          </div>
        </div>
        <div style={S.card}>
          <div style={S.h3}>{s.heading}</div>
          <div style={{...S.body,whiteSpace:"pre-wrap"}}>{s.body}</div>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:8}}>
          <button style={S.btn("ghost")} onClick={()=>setIdx(i=>Math.max(0,i-1))} disabled={idx===0}>← Prev</button>
          <span style={{color:MUTED,fontSize:11}}>{idx+1}/{sections.length}</span>
          {idx<sections.length-1
            ?<button style={S.btn("primary")} onClick={()=>setIdx(i=>i+1)}>Next →</button>
            :<button style={S.btn("ghost")} onClick={onClose}>Close ✕</button>}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// COMPONENT RECOGNITION MODAL
// ============================================================
function ComponentRecognitionModal({onClose}){
  const [idx,setIdx]=useState(0);
  const c=COMPONENT_RECOGNITION[idx];
  return(
    <div style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"#000000ee",zIndex:1000,overflowY:"auto",padding:"16px 12px"}}>
      <div style={{maxWidth:600,margin:"0 auto"}}>
        <div style={{background:PANEL,border:`2px solid ${AMBER}`,borderRadius:10,padding:14,marginBottom:12}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
            <div style={{color:AMBER,fontSize:14,fontWeight:700}}>🔍 COMPONENT RECOGNITION</div>
            <button style={{...S.btn("ghost"),fontSize:10,padding:"3px 8px",color:MUTED}} onClick={onClose}>✕</button>
          </div>
          <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
            {COMPONENT_RECOGNITION.map((comp,i)=>(
              <button key={i} style={{...S.navBtn(i===idx),fontSize:10,padding:"4px 8px"}} onClick={()=>setIdx(i)}>
                {comp.name.split(" ")[0]}
              </button>
            ))}
          </div>
        </div>
        <div style={S.card}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
            <span style={S.tag(c.tagColor)}>{c.tag}</span>
            <div style={{...S.h3,marginBottom:0,borderBottom:"none",paddingBottom:0}}>{c.name}</div>
          </div>
          <div style={{...S.body,whiteSpace:"pre-wrap"}}>{c.description}</div>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",marginTop:8}}>
          <button style={S.btn("ghost")} onClick={()=>setIdx(i=>Math.max(0,i-1))} disabled={idx===0}>← Prev</button>
          <span style={{color:MUTED,fontSize:11}}>{idx+1}/{COMPONENT_RECOGNITION.length}</span>
          {idx<COMPONENT_RECOGNITION.length-1
            ?<button style={S.btn("primary")} onClick={()=>setIdx(i=>i+1)}>Next →</button>
            :<button style={S.btn("ghost")} onClick={onClose}>Close ✕</button>}
        </div>
      </div>
    </div>
  );
}
const DIAGRAM_CONFIGS={
  control_circuit:{title:"Control Circuit Voltage Trace",isLive:true,meterMode:"V AC — 48V or 110V range",component:"control",
    steps:[
      {label:"Test Point 1 — After E-Stop (terminal 2)",
       expect:"Supply voltage (48V or 110V — confirm your actual control voltage first) = E-stop NC contact closed and healthy",
       fault:"0V = E-stop pressed in, or NC contact open/faulty — twist/pull to release and retest",
       info:"The E-stop NC contact is the first device in the chain. Voltage disappearing here before any buttons are pressed means either the e-stop is latched in, or its NC contact has failed open. Check the physical state of the button first."},
      {label:"Test Point 2 — After Overload Relay (terminal 3)",
       expect:"Supply voltage = OLR NC contact closed, overload not tripped",
       fault:"0V = thermal overload has tripped. Press the RESET button on the OLR body (usually a small blue or yellow button). Find out WHY it tripped before restarting.",
       info:"A tripped OLR looks identical on the circuit to a pressed e-stop — both open the coil circuit. Only the component location tells you which it is. The OLR reset button is on the relay body, usually accessible through the panel door."},
      {label:"Test Point 3 — After Upper Limit Switch (terminal 4)",
       expect:"Supply voltage = limit switch NC contact closed, hook not at top position",
       fault:"0V = hook may be at or near top position (lower it slightly and retest), OR limit switch NC contact has failed open, OR cable to switch is broken",
       info:"Limit switches use NC contacts — fail-safe design. A broken cable to the switch gives the same reading as the limit operating. If lowering the hook restores voltage, the limit operated normally. If not, test continuity of the switch and its cable with supply isolated."},
      {label:"Test Point 4 — After UP Button (terminal 5)",
       expect:"Supply voltage = button NO contact making correctly while pressed",
       fault:"0V = worn or dirty button contact, OR broken conductor in pendant cable. Try pressing the button firmly several times and retest.",
       info:"This is the only Normally Open (NO) contact in the UP chain. All the others are NC. Voltage only appears here while the button is pressed, OR while the hold-in auxiliary contact is closed (contactor already energised)."},
      {label:"Test Point 5 — After DOWN Interlock NC Aux (terminal 6)",
       expect:"Supply voltage = DOWN contactor NC auxiliary is closed (DOWN contactor is de-energised, as expected)",
       fault:"0V = DOWN contactor NC auxiliary is stuck OPEN. The DOWN contactor itself is the fault — even though UP is the symptom. Inspect the DOWN contactor NC auxiliary contact.",
       info:"This is the classic trap. The hoist won't go UP but the fault is in the DOWN contactor. The DOWN contactor's NC auxiliary contact sits in series in the UP coil circuit. When the DOWN contactor de-energises, that NC contact should return to closed. If it's stuck open, UP is blocked."},
      {label:"Test Point 6 — At UP Coil A1",
       expect:"Supply voltage = full chain confirmed — contactor should pull in cleanly",
       fault:"0V = open circuit between last test point and coil terminal | Supply voltage present but contactor won't pull in = measure coil resistance across A1–A2 with supply ISOLATED (open circuit = burnt coil)",
       info:"If you have supply voltage at A1 and the contactor chatters rather than pulling in cleanly, the voltage is marginal — possibly dropping under load. Check for corroded terminals or a failing control transformer secondary. Chattering rapidly destroys contact surfaces."},
    ]},
  contactor_continuity:{title:"Contactor — Contact Continuity Tests",isLive:false,meterMode:"Ω / Continuity beep mode",component:"contactor",mode:"continuity",
    isolationRequired:true,
    steps:[
      {label:"L1 → T1: Phase 1 main power contact",
       expect:"Continuity / beep = contact closed. Note: contactor must be manually held IN to close the main contacts for this test — SUPPLY MUST BE ISOLATED AND LOCKED OFF FIRST.",
       fault:"Open circuit = pitted, burnt, or fused-open contact. If one contact is open, inspect all three — they often fail together after a fault current event.",
       info:"Main contacts are rated for full motor current including starting inrush. A single open contact creates phase loss — the motor hums, draws very high current on the remaining two phases (1.73× normal), and the OLR trips. Always replace a contactor with all three phases failed, not just one — the others are worn too."},
      {label:"L2 → T2: Phase 2 main power contact",
       expect:"Continuity = contact OK",
       fault:"Open = contact fault Ph2. If all three phases open: the contactor is almost certainly welded — the main contacts won't open. Do not force.",
       info:"When checking contact resistance: all three should read nearly identical values. Any significant difference between phases suggests uneven wear. A new contact set will read near zero resistance on continuity test."},
      {label:"L3 → T3: Phase 3 main power contact",
       expect:"Continuity = contact OK. All three phases should read the same.",
       fault:"Open = contact fault Ph3. Replace the full contactor — contact kits are available but fitting them requires matching the exact contactor type and rating.",
       info:"After any short circuit or fault current event, always check all three phases before returning to service. Fault current passes unequally through contacts and the damage is not always visible."},
      {label:"13 → 14: NO auxiliary contact",
       expect:"OPEN when contactor is released. Continuity when contactor is manually held IN (isolated).",
       fault:"Stays open when held in = worn NO auxiliary — the hold-in circuit won't work and the contactor will drop out the moment the button is released.",
       info:"The NO aux closes when the contactor armature pulls in. It's used for the hold-in (seal-in) circuit. If this contact is worn or dirty, the hoist only runs while the button is held — the hold-in circuit doesn't maintain energisation."},
      {label:"11 → 12: NC auxiliary contact",
       expect:"Continuity when contactor RELEASED. Open when contactor manually held in.",
       fault:"OPEN when contactor is released = welded or stuck NC auxiliary. This is the interlock contact — it's blocking the opposite direction from operating. Replace the contactor immediately.",
       info:"This is the most important auxiliary contact for fault finding. If the NC aux is stuck open when the contactor is de-energised, it breaks the coil circuit of the opposite direction contactor. Result: hoist goes one way only. The faulty contactor is the one that goes in the direction that WORKS, not the direction that's blocked."},
    ]},
  contactor_coil:{title:"Contactor — Coil Voltage Test",isLive:true,meterMode:"V AC — 48V or 110V range",component:"contactor",mode:"voltage_coil",
    steps:[
      {label:"Measure A1 to A2 while pressing the direction button",
       expect:"Supply voltage (48V or 110V) = coil supply confirmed — contactor should pull in cleanly and stay in",
       fault:"0V = coil supply missing — trace the control circuit upstream from A1 one terminal at a time | Supply voltage present but contactor won't pull in = isolate supply, lock off, then measure coil resistance across A1–A2. Open circuit (OL) = burnt coil — replace contactor.",
       info:"If voltage is correct but the contactor chatters (rapidly in/out) rather than holding in, the voltage is marginal — probably dropping under motor starting load. The hold-in auxiliary contact may also be intermittent. Chattering rapidly damages contact surfaces — address it promptly."},
    ]},
  contactor_interlock:{title:"Forward/Reverse Mechanical Interlock Check",isLive:false,meterMode:"Visual + manual test + Ω continuity",component:"contactor",mode:"interlock",
    isolationRequired:true,
    steps:[
      {label:"Inspect the mechanical interlock bar between UP and DOWN contactors",
       expect:"Bar present, undamaged, free to slide without binding or corrosion",
       fault:"Bar missing, broken, or seized = either contactor can close independently — SAFETY HAZARD. Do not return to service until repaired.",
       info:"The mechanical interlock bar physically connects the two contactor armatures. When one pulls in, the bar physically prevents the other from closing. It works independently of the electrical interlock. In a correctly designed system BOTH are present. If only one is working, the system is still protected — but the redundancy is gone."},
      {label:"Functional test — manually push IN one contactor (isolated), attempt to push in the other",
       expect:"Second contactor cannot be pushed in while the first is held in",
       fault:"Both contactors close simultaneously = interlock mechanism failed. Do not operate the hoist until repaired.",
       info:"A corroded or bent interlock bar can appear intact on visual inspection but still fail the functional test. Always do both the visual check AND the functional test."},
      {label:"NC auxiliary contact test — 11 to 12 on EACH contactor individually",
       expect:"NC contact shows continuity when THAT contactor is released (de-energised). Opens when that contactor is manually held in.",
       fault:"NC contact open when contactor is released = welded or stuck auxiliary contact. Replace that contactor.",
       info:"Test each contactor's NC aux independently. The UP contactor's NC aux protects the DOWN circuit and vice versa. Both must work correctly for full electrical interlocking."},
    ]},
  brake_rectifier:{title:"Brake Rectifier Circuit Test",isLive:true,meterMode:"V AC, then V DC, then Ω (Step 3 isolated)",component:"brake",
    steps:[
      {label:"Step 1 — AC input to rectifier (live)",
       expect:"~230V AC = AC supply confirmed at rectifier input terminals",
       fault:"0V = check the contactor that switches the brake supply (usually in parallel with the motor contactor output), check fuse, check wiring from contactor to rectifier. Acceptable range: 210–250V AC.",
       info:"The brake supply is usually taken from the motor contactor output — it energises when the motor contactor closes. Measure with the direction button held in (contactor energised)."},
      {label:"Step 2 — DC output from rectifier (live)",
       expect:"~207V DC from full-wave rectifier (acceptable range 185–225V DC). ~103V DC from half-wave rectifier. NOTE: measure after 1 second of running, not at the instant of energisation — forced-voltage types (Demag GP/GS/GE) peak at 350–420V DC briefly on energisation for fast brake release, then settle to the steady-state holding voltage. Readings outside the expected steady-state range indicate a rectifier fault.",
       fault:"0V = all rectifier diodes failed | ~103V where ~207V expected = one diode failed (half-wave output) | AC voltage reading on DC terminals = short across DC output or capacitor fault. Replace rectifier module.",
       info:"A full-wave bridge uses 4 diodes. One failed diode gives half-wave output (~103V) rather than killing the DC entirely — the brake may partially release but not fully, causing drag and overheating. If you read approximately half the expected DC voltage, replace the rectifier module. Forced-voltage rectifiers (Demag GP/GS/GE) intentionally spike to 350–420V DC for approximately 0.5 seconds on energisation to release the brake quickly, then drop to the normal holding voltage (~207V DC for a 230V AC supply). If you catch this peak on your meter, wait 1 second and re-read to confirm the steady-state value."},
      {label:"Step 3 — Brake coil resistance (FULLY ISOLATED, coil leads disconnected)",
       expect:"Expected resistance depends on coil rated voltage — check the rectifier or coil nameplate: 24V DC coil ≈ 5–15Ω | 48V DC coil ≈ 20–40Ω | 110V DC coil ≈ 80–150Ω | 205V DC coil ≈ 180–300Ω. Where possible, compare against the other direction's brake coil of the same type — they should match within 10%.",
       fault:"Open circuit (OL/infinite) = coil burnt out — replace brake coil or brake module | Near zero (short circuit) = coil shorted — replace | If reading seems low: CONFIRM coil leads are disconnected from the rectifier — the rectifier in parallel gives a false low reading.",
       info:"CRITICAL: disconnect the brake coil leads from the rectifier output terminals before measuring resistance. With the rectifier connected, you are measuring the coil in parallel with the rectifier output impedance — this gives a false low reading and will make a burnt-out coil appear healthy. After isolating, also wait 30 seconds for capacitors to discharge before touching brake terminals."},
    ]},
  motor_terminals:{title:"Motor Terminal Box Tests",isLive:true,meterMode:"V AC (step 1) then 500V Megger isolated (step 2)",component:"motor",
    steps:[
      {label:"Step 1 — Phase voltages at U1, V1, W1 (contactor closed, supply live)",
       expect:"~415V between any two phases — U1–V1, V1–W1, U1–W1 all approximately equal. Acceptable range: 380–440V.",
       fault:"One reading near 0V = missing phase (phase loss). Pattern: if L2 is missing — U1–V1 reads 0V, V1–W1 reads 0V, U1–W1 reads ~415V. The missing phase is the one common to both zero readings. Check fuse for that phase. Check contactor main contact L–T for that phase.",
       info:"Phase loss pattern explained: with three test points (U1-V1, V1-W1, U1-W1), the missing phase appears in TWO of the three readings as zero. The phase that's present in the one reading that still shows voltage is not the fault. This lets you identify WHICH phase is missing."},
      {label:"Step 2 — Insulation resistance phase to earth (FULLY ISOLATED, motor disconnected from drive/contactor)",
       expect:">1MΩ = healthy insulation. >10MΩ = excellent. New motors typically >100MΩ.",
       fault:"<1MΩ = suspect — retest after allowing motor to cool and dry out. <100kΩ = definite fault — do NOT run. Arrange motor rewind or replacement.",
       info:"CRITICAL FOR VFD-CONTROLLED HOISTS: disconnect motor cables at the VFD OUTPUT TERMINALS, not just at the panel isolator. The 500V megger test voltage will destroy VFD IGBT output stages if the drive is connected. Also disconnect any motor thermistors — they will give false low readings. Some VFDs have MOV surge suppressors on the output that will give a false low reading even with the drive isolated — disconnect them from the cable under test."},
    ]},
  estop_circuit:{title:"E-Stop & Safety Circuit Test",isLive:false,meterMode:"Ω / Continuity then V AC",component:"estop",
    steps:[
      {label:"Step 1 — E-stop NC contact test at B1 to B2 (isolated)",
       expect:"Continuity B1→B2 when e-stop RELEASED (button out). Open circuit when e-stop PRESSED (button in).",
       fault:"Open circuit when released = worn or failed NC contact — replace the e-stop unit. Do NOT bridge or bypass. Check for water ingress and corroded connector pins — most common cause on outdoor and washdown installations.",
       info:"E-stops use NC contacts deliberately. Any failure mode — contact wear, broken wire, water ingress, disconnected unit — results in an open circuit which stops the hoist. This is the fail-safe principle. Never bypass an e-stop, even temporarily."},
      {label:"Step 2 — Supply voltage after e-stop in the circuit (supply live, e-stop released)",
       expect:"Supply voltage (48V or 110V) present at the circuit terminal after the e-stop contact when e-stop is released and supply is on",
       fault:"0V = broken conductor in pendant cable. Most common break point: where cable enters pendant at strain relief, or at the pendant connector. To test cable: disconnect both ends, test continuity between matching pin numbers at each end. A good core reads continuity; a broken core reads open circuit.",
       info:"Pendant cables are multi-core — typically 12, 16, or 20 cores. Each core is numbered or colour coded. The e-stop typically uses two dedicated cores (NC dual-channel on modern systems). Testing core-by-core: disconnect at both ends, probe matching pin numbers. Write down which cores pass — this identifies the specific broken core(s) for replacement."},
      {label:"Step 3 — Safety relay dual-channel status LEDs",
       expect:"Both CH1 and CH2 LEDs green = relay energised and both channels healthy. Exact LED arrangement varies by manufacturer.",
       fault:"One or both LEDs off or red = channel fault. Check: both cable cores of the e-stop wiring for continuity, both poles of the e-stop contact, and the wiring to the safety relay input terminals. The safety relay must be manually reset after any fault — consult the relay label or manual for the specific reset procedure (typically a dedicated RESET button on the relay face).",
       info:"Common safety relay types on UK hoists: Pilz PNOZ X series (older), Pilz PNOZmini (newer), Sick i10 series, Schmersal SRB series. All have dual-channel monitoring. Reset procedure varies — on Pilz PNOZ the reset button is on the relay face. On PLC-controlled systems the reset may be a software acknowledgement via HMI. Check the schematic for the specific reset circuit."},
    ]},
};

const DIAG_LABELS={
  control_circuit:"🔍 Control Circuit Trace",
  contactor_continuity:"🔌 Contactor Continuity",
  contactor_coil:"⚡ Coil Voltage Test",
  contactor_interlock:"🔒 Interlock Check",
  brake_rectifier:"🛞 Brake Rectifier",
  motor_terminals:"🔋 Motor Terminals",
  estop_circuit:"🛑 E-Stop Circuit",
};

// ── DIAGRAM PANEL — with isolation reminder for isolated tests
function DiagramPanel({diagKey,defaultShowInfo=false}){
  const cfg=DIAGRAM_CONFIGS[diagKey];
  const [safetyAck,setSafetyAck]=useState(false);
  const [isoAck,setIsoAck]=useState(false);
  const [step,setStep]=useState(0);
  const [showInfo,setShowInfo]=useState(defaultShowInfo);
  if(!cfg) return null;
  const maxStep=cfg.steps.length-1;
  const cur=cfg.steps[step];

  function renderDiag(){
    const props={step,showInfo};
    if(cfg.component==="control") return <DiagControlCircuit {...props}/>;
    if(cfg.component==="contactor") return <DiagContactorFace {...props} mode={cfg.mode}/>;
    if(cfg.component==="brake") return <DiagBrakeRectifier {...props}/>;
    if(cfg.component==="motor") return <DiagMotorTerminals {...props}/>;
    if(cfg.component==="estop") return <DiagEStop {...props}/>;
    return null;
  }

  return(
    <div style={{marginTop:14}}>
      <div style={{...S.resBox(AMBER),marginTop:0,marginBottom:10,background:"#1a1200",borderRadius:8,padding:"10px 12px"}}>
        <div style={S.secTitle(AMBER)}><span>◈</span> {cfg.title}</div>
        <div style={{display:"flex",gap:6,flexWrap:"wrap",alignItems:"center"}}>
          <span style={S.tag(BLUE)}>🔌 {cfg.meterMode}</span>
          {cfg.isLive?<span style={S.tag(RED)}>⚡ LIVE TEST</span>:<span style={S.tag(GREEN)}>🔒 ISOLATED TEST</span>}
          <button style={{...S.btn("ghost"),fontSize:10,padding:"3px 8px",marginLeft:"auto"}}
            onClick={()=>setShowInfo(s=>!s)}>{showInfo?"ℹ Hide tips":"ℹ Tips"}</button>
        </div>
      </div>

      {/* Isolation gate for isolated tests */}
      {cfg.isolationRequired&&!isoAck&&(
        <div style={{background:"#071a10",border:`2px solid ${GREEN}`,borderRadius:8,padding:16,marginBottom:12}}>
          <div style={{color:GREEN,fontSize:14,fontWeight:700,marginBottom:10}}>🔒 ISOLATED TEST — CONFIRM BEFORE PROCEEDING</div>
          <div style={{color:"#86EFAC",fontSize:13,lineHeight:1.8,marginBottom:14}}>
            This test must be performed with the supply ISOLATED AND LOCKED OFF.<br/>
            • Main isolator turned to OFF and padlocked<br/>
            • Equipment proven dead with a GS38-compliant meter<br/>
            • Brake circuit capacitors discharged (wait 30 seconds minimum after proving AC dead)<br/>
            • Your personal lock is on the isolator
          </div>
          <button style={S.btn("success")} onClick={()=>setIsoAck(true)}>
            🔒 Confirmed — supply is isolated, locked off and proven dead
          </button>
        </div>
      )}

      {/* Live test safety gate */}
      {cfg.isLive&&!safetyAck&&(
        <div style={{background:"#2a0800",border:`2px solid ${RED}`,borderRadius:8,padding:16,marginBottom:12}}>
          <div style={{color:RED,fontSize:14,fontWeight:700,marginBottom:10}}>⚡ LIVE SUPPLY — READ BEFORE PROCEEDING</div>
          <div style={{color:"#F9A8A8",fontSize:13,lineHeight:1.8,marginBottom:14}}>
            • Use CAT III 1000V minimum insulated probes — check finger guards are intact<br/>
            • Test your meter on a known live source before use<br/>
            • Do NOT touch bare conductors or uninsulated terminals<br/>
            • You are the only person working on this equipment<br/>
            • All other personnel are clear of the hoist<br/>
            • Set meter to correct range BEFORE applying probes
          </div>
          <button style={S.btn("danger")} onClick={()=>setSafetyAck(true)}>
            ⚡ Confirmed — proceeding with live test
          </button>
        </div>
      )}

      {((!cfg.isLive&&(!cfg.isolationRequired||isoAck))||(cfg.isLive&&safetyAck))&&(
        <div>
          {renderDiag()}
          <InfoPill text={cur.info} show={showInfo}/>
          <div style={{marginTop:10,background:PANEL2,border:`1px solid ${BORDER}`,borderRadius:8,padding:13}}>
            <div style={{display:"flex",gap:6,marginBottom:10,alignItems:"center",flexWrap:"wrap"}}>
              <span style={{color:AMBER,fontSize:10,fontWeight:700,marginRight:4}}>STEP {step+1}/{cfg.steps.length}</span>
              {cfg.steps.map((_,i)=>(
                <div key={i} onClick={()=>setStep(i)}
                  style={{width:28,height:28,borderRadius:14,background:i===step?AMBER:i<step?GREEN:BORDER,
                    color:i===step?DARK:TEXT,fontSize:11,fontWeight:700,display:"flex",alignItems:"center",
                    justifyContent:"center",cursor:"pointer",flexShrink:0}}>
                  {i+1}
                </div>
              ))}
              <div style={{marginLeft:"auto",display:"flex",gap:6}}>
                <button style={{...S.btn("ghost"),padding:"6px 10px"}} onClick={()=>setStep(s=>Math.max(0,s-1))} disabled={step===0}>←</button>
                <button style={{...S.btn("primary"),padding:"6px 10px"}} onClick={()=>setStep(s=>Math.min(maxStep,s+1))} disabled={step===maxStep}>→</button>
              </div>
            </div>
            <div style={{color:TEXT,fontSize:13,fontWeight:700,marginBottom:8,lineHeight:1.4}}>{cur.label}</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr",gap:7}}>
              <div style={{background:"#0A2E1F",border:`1px solid ${GREEN}44`,borderRadius:6,padding:"9px 11px"}}>
                <div style={{color:GREEN,fontSize:9,fontWeight:700,marginBottom:4,letterSpacing:"0.1em"}}>✓ SHOULD READ</div>
                <div style={{color:"#86EFAC",fontSize:12,lineHeight:1.65}}>{cur.expect}</div>
              </div>
              <div style={{background:"#2E0A0A",border:`1px solid ${RED}44`,borderRadius:6,padding:"9px 11px"}}>
                <div style={{color:RED,fontSize:9,fontWeight:700,marginBottom:4,letterSpacing:"0.1em"}}>✗ IF FAULT</div>
                <div style={{color:"#FCA5A5",fontSize:12,lineHeight:1.65}}>{cur.fault}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DiagramSelector({node,inModule=false}){
  const [activeDiag,setActiveDiag]=useState(null);
  const opts=[];
  if(node.diag) opts.push(node.diag);
  if(node.diag2) opts.push(node.diag2);
  if(!opts.length) return null;
  return(
    <div style={{marginTop:14}}>
      <div style={S.secTitle(BLUE)}><span>◈</span> TEST DIAGRAMS</div>
      <div style={{display:"flex",gap:7,flexWrap:"wrap",marginBottom:6}}>
        {opts.map(d=>(
          <button key={d} style={{...S.btn(activeDiag===d?"primary":"ghost"),fontSize:11,padding:"7px 11px"}}
            onClick={()=>setActiveDiag(activeDiag===d?null:d)}>
            {DIAG_LABELS[d]||d}
          </button>
        ))}
        {activeDiag&&<button style={{...S.btn("ghost"),fontSize:10,color:MUTED}} onClick={()=>setActiveDiag(null)}>✕ Hide</button>}
      </div>
      {activeDiag&&<DiagramPanel diagKey={activeDiag} defaultShowInfo={inModule}/>}
    </div>
  );
}
const MODULES=[
  {id:"m1",title:"Power Supply & Isolation",icon:"⚡",duration:"12 min",sections:[
    {heading:"3-Phase Supply — The Basics",goal:"Identify and name the 3-phase supply conductors on a hoist installation and correctly read line and phase voltages.",body:`Hoists up to 6T in the UK run on 3-phase 415V AC, 50Hz. You'll see it written as 415V L-L (line-to-line) or 240V L-N (line-to-neutral). Three live conductors (L1, L2, L3) plus neutral (N) and protective earth (PE).\n\nThe incoming supply feeds via busbar trunking (power track), festoon cable, or conductors on the crane girder into the hoist's main panel.`},
    {heading:"Phase Rotation",goal:"Understand why phase rotation matters and confirm correct rotation before energising any reconnected hoist supply.",body:`Phase rotation matters critically. Get it wrong and the hoist goes UP when you press DOWN — potentially fatal. Standard UK rotation: L1-L2-L3 (brown-black-grey modern, red-yellow-blue older).\n\nAlways check rotation with a phase rotation meter after any supply reconnection. On VFD hoists the drive corrects internally, but the brake rectifier and control transformer still care about supply integrity.`},
    {heading:"Main Isolator",goal:"Locate the main isolator, understand its function, and apply correct LOTO before any hands-on work.",body:`Lockable load-break switch isolating the entire installation. Typically a rotary cam switch (Kraus & Naimer, Salzer) rated for full combined load current of all motors.\n\nMust be lockable in OFF — Machinery Directive requirement. Always isolate ALL isolators and apply your own personal lock.\n\nLOTO is not optional. Brake rectifier capacitors hold charge for 10+ seconds after isolation.`},
    {heading:"Fusing & Protection",goal:"Identify the correct fuse type and rating for a hoist circuit and explain why fitting an oversized fuse is a safety violation.",body:`HRC fuses or MCBs protect each motor circuit downstream of the isolator. Typical ratings: 10–16A for a 2T hoist motor on DOL.\n\nControl circuit fuses: typically 2–4A on the 48V or 110V secondary.\n\nAlways replace fuses with the correct type and rating. Fitting an oversized fuse to cure a nuisance trip is a safety violation — it can allow a fault to develop into a fire or electrocution.`},
    {heading:"Terminal Identification",goal:"Read and locate any labelled terminal in a hoist panel using IEC 60445 designations.",body:`IEC 60445 terminal labelling:\n• L1, L2, L3 — incoming 3-phase supply\n• PE — protective earth (green/yellow)\n• U, V, W — motor terminals\n• 1, 2, 3… — control circuit terminals sequential\n• A1, A2 — contactor coil\n\nDemag units: XB = brake terminals, XS = safety circuit, XC = control. Always retrieve the schematic from the panel door before working.`},
  ],quiz:[
    {q:"Standard 3-phase supply voltage for industrial hoists in the UK?",options:["240V","415V","110V","690V"],correct:1,explanation:"415V line-to-line (L-L) is the UK standard 3-phase industrial supply. 240V is single-phase line-to-neutral."},
    {q:"Why does phase rotation matter when reconnecting a hoist supply?",options:["Affects motor speed only","Incorrect rotation reverses hoist direction — pressing DOWN raises the load","Only matters for travel motors","Affects control transformer only"],correct:1,explanation:"Incorrect phase rotation reverses motor direction. Hoist goes up when commanded down. Always check with a phase rotation meter."},
    {q:"Why wait after isolating before working on brake circuit components?",options:["Allow motors to cool","Brake rectifier capacitors hold charge and can deliver a shock for 10+ seconds","Control transformer holds charge","No reason to wait"],correct:1,explanation:"Brake rectifier capacitors store charge at DC voltage levels and can deliver a dangerous shock for several seconds post-isolation."},
  ]},
  {id:"m2",title:"Motor Circuits & Starting Methods",icon:"🔄",duration:"15 min",sections:[
    {heading:"Hoist Motor Construction",goal:"Identify the key differences between a hoist motor and a standard industrial motor and explain the integrated brake arrangement.",body:`Purpose-designed, not standard industrial motors:\n• High duty cycles — frequent starts, stops, reversals\n• Class F or H insulation (155°C and 180°C)\n• Integrated brake — usually non-drive end\n• Short-time ratings: S3 or S4 duty per IEC 60034\n\nSmall hoists up to 2T: conical rotor motors (Demag KB series). The conical rotor slides axially under spring pressure engaging a friction cone brake when power is removed.\n\nLarger units 2T–6T: standard frame motors with separate disc brake on the rear.`},
    {heading:"Direct-On-Line (DOL) Starting",goal:"Calculate approximate starting inrush current for a DOL hoist motor and understand why protection must tolerate it without nuisance tripping.",body:`Press UP → UP contactor closes → full 415V applied directly to motor terminals.\n\nStarting current: typically 6–8× Full Load Amps. A 2.2kW motor drawing 5A FLA produces 30–40A inrush for 1–3 seconds.\n\nFuses and MCBs must tolerate this without nuisance tripping. DOL used on small hoists up to about 5.5kW.`},
    {heading:"Two-Speed Motors (Pole Changing)",goal:"Explain pole-changing and identify the four separate contactors needed on a two-speed DOL hoist.",body:`Most hoist motors above 1T have two speeds — fast and slow creep. Achieved by a pole-changing (Dahlander) winding.\n\nFast: 2-pole (~2800 RPM)\nSlow: 8-pole (~700 RPM)\nRatio: ~4:1\n\nSeparate contactors for fast-up, slow-up, fast-down, slow-down. On VFD-controlled units speed is handled electronically.`},
    {heading:"Star-Delta Starting",goal:"Identify the three contactors in a star-delta circuit and explain why simultaneous star and delta closure must be electrically and mechanically prevented.",body:`Used on larger motors (typically 7.5kW+). Motor starts in STAR — ~58% line voltage per winding, ~1/3 DOL starting current. Timer switches to DELTA after 5–15 seconds.\n\nRequires three contactors: Main (KM1), Star (KM2), Delta (KM3).\n\nCritical: Star and Delta MUST NEVER close simultaneously = direct short circuit. Both electrical AND mechanical interlocking mandatory.`},
    {heading:"Thermal Overload Relays",goal:"Set an OLR correctly to motor FLA and identify the root cause before resetting a tripped relay.",body:`Bimetallic strips heat under overcurrent, deflect and trip an NC contact breaking the coil circuit.\n\nSet exactly to motor nameplate FLA. A tripped OLR is a symptom not the fault. Find root cause before resetting — brake drag, mechanical seizure, phase loss, and overloading are common causes.`},
  ],quiz:[
    {q:"Typical starting current for a DOL-started motor?",options:["1–2× FLA","3–4× FLA","6–8× FLA","10–12× FLA"],correct:2,explanation:"DOL starting produces 6–8× Full Load Amps inrush for 1–3 seconds. Protection devices must tolerate this without nuisance tripping."},
    {q:"What happens if Star and Delta contactors close simultaneously?",options:["Motor runs at half speed","Timer resets","Direct short circuit across the 3-phase supply","Overload trips"],correct:2,explanation:"Simultaneous closure creates a direct short circuit. Both electrical AND mechanical interlocking is mandatory."},
    {q:"Thermal overload trips. Correct first action?",options:["Reset and increase current setting","Reset and investigate why motor drew excessive current","Replace the OLR","Bypass temporarily"],correct:1,explanation:"A tripped OLR is a symptom. Reset and find the root cause — brake drag, mechanical seizure, phase loss, or overloading."},
  ]},
  {id:"m3",title:"Contactor Logic & Interlocking",icon:"🔌",duration:"14 min",sections:[
    {heading:"How a Contactor Works",goal:"Identify the power circuit, coil terminals (A1/A2), and auxiliary contacts on a contactor, and explain why coil voltage must exactly match the control supply.",body:`Two separate circuits:\n\nPOWER CIRCUIT: Main contacts (L1-T1, L2-T2, L3-T3) switch the motor supply at full current. Heavy-duty silver alloy contacts designed for arc interruption.\n\nCONTROL CIRCUIT: Coil (A1-A2) at lower voltage (48V or 110V AC). Creates a magnetic field pulling in the armature, closing the main contacts.\n\nAUXILIARY CONTACTS: Small contacts that open (NC) or close (NO) with the armature. Used for logic, interlocking, and status.\n\nCoil voltage must match control circuit voltage exactly.`},
    {heading:"Hold-In (Seal-In) Circuit",goal:"Trace the hold-in auxiliary contact on a schematic and explain why the contactor stays energised after the pushbutton is released.",body:`Press UP → coil circuit completes → contactor pulls in. Release button → would drop out.\n\nHold-in solution: NO auxiliary contact wired in parallel with the pushbutton. When contactor closes, its aux closes, bypassing the button.\n\nContactor stays energised until an NC contact (stop, overload, e-stop, limit switch) breaks the circuit.`},
    {heading:"Forward/Reverse Interlocking",goal:"Describe both electrical and mechanical interlock methods and explain why both must be present and working.",body:`UP and DOWN contactors simultaneously closed = two phases shorted = catastrophic fault.\n\nELECTRICAL INTERLOCK: NC auxiliary of UP contactor in series with DOWN coil (and vice versa).\n\nMECHANICAL INTERLOCK: Physical link between armatures prevents both closing mechanically.\n\nUse BOTH. Either alone can fail — a welded contact defeats electrical, a worn mechanism defeats mechanical.`},
    {heading:"Contact Welding",goal:"Diagnose a welded contactor contact using the correct isolated manual-operation method and understand why it must be replaced, not freed.",body:`Contacts weld (stick closed) due to excessive inrush, wrong voltage, or over-duty.\n\nA welded UP contact: hoist runs upward continuously after button release until upper limit operates or two-blocking occurs.\n\nDiagnosis (isolated): manually operate the contactor. If it won't move, contacts are welded. Replace — never try to free welded contacts with a screwdriver.`},
  ],quiz:[
    {q:"Purpose of the hold-in (seal-in) circuit?",options:["Protect motor from overload","Keep contactor energised after pushbutton released","Prevent two contactors operating simultaneously","Step down coil voltage"],correct:1,explanation:"The hold-in circuit uses an NO auxiliary in parallel with the pushbutton to maintain coil energisation after the button is released."},
    {q:"Immediate danger of a welded UP contactor contact?",options:["Hoist runs upward continuously and may two-block","Motor overheats","Brake won't release","Pendant goes dead"],correct:0,explanation:"A welded UP contact means the hoist runs upward even after button release, risking two-blocking and catastrophic chain/rope failure."},
  ]},
  {id:"m4",title:"Control Transformer & Pendant",icon:"🔋",duration:"10 min",sections:[
    {heading:"Why a Control Transformer?",goal:"State the purpose of a control transformer and identify the common secondary voltages used in hoist control circuits.",body:`Steps down 415V to safer pendant voltage.\n\nCommon secondary voltages:\n• 48V AC — modern European hoists (Demag, Stahl, Konecranes)\n• 110V AC — older UK industrial equipment\n• 24V AC/DC — newer VFD/PLC-controlled systems\n\nPrimary connected across two phases of the 415V supply. Primary fused separately. Secondary fused at 2–4A.`},
    {heading:"Transformer Fusing",goal:"State the correct primary and secondary fuse ratings for a control transformer and explain why repeated secondary fuse blowing must be investigated.",body:`Both primary and secondary must be fused.\n\nPrimary fuse: 125% of rated primary current.\nSecondary fuse: typically 2A for 48V. Must blow before primary fuse.\n\nRepeated secondary fuse blowing = short or overload on control circuit. Check damaged pendant cable, shorted buttons, water ingress. Never uprate these fuses.`},
    {heading:"Pendant Construction",goal:"Identify e-stop, direction buttons, and strain relief on a pendant and explain why the e-stop is wired as an NC contact in the common return.",body:`Key elements:\n• E-STOP: Red mushroom head, NC contact. Pressing OPENS the circuit.\n• DIRECTION BUTTONS: Momentary NO contacts.\n• SPEED SELECTION: Spring-loaded — first press slow, full depression fast.\n• STRAIN RELIEF: Must be properly strain-relieved at pendant entry. Repeated pulling without strain relief breaks conductor cores.\n\nE-stop must be in the COMMON return wire so any failure isolates all functions.`},
  ],quiz:[
    {q:"Most common control circuit voltage on modern European hoists?",options:["230V AC","110V AC","48V AC","24V DC"],correct:2,explanation:"48V AC is standard on modern European hoists. Meets IEC requirements, safer for handheld pendant applications."},
    {q:"Secondary pendant fuse keeps blowing. Most likely cause?",options:["Transformer too small","Short circuit on control wiring — check pendant cable and button contacts","Contactor coil wrong voltage","Primary fuse too large"],correct:1,explanation:"Repeated secondary fuse blowing means a fault on the control circuit — damaged cable, shorted button, or water ingress."},
  ]},
  {id:"m5",title:"Pendant & Control Circuit",icon:"🎮",duration:"13 min",sections:[
    {heading:"Tracing the Control Circuit",goal:"Trace the complete UP coil circuit step-by-step from transformer secondary to coil terminal, naming every series component.",body:`The UP coil circuit chain:\n\n1. Transformer secondary → fuse → terminal 1 (live rail)\n2. → E-stop NC contact → terminal 2\n3. → Thermal overload NC contact → terminal 3\n4. → Upper limit switch NC contact → terminal 4\n5. → UP button NO contact → terminal 5\n6. → DOWN contactor NC auxiliary → terminal 6\n7. → UP contactor coil A1 → A2 → neutral\n\nANY open contact = contactor won't energise. Trace from source, one contact at a time.`},
    {heading:"Voltage Method Fault Finding",goal:"Apply the voltage method to locate an open circuit in a control circuit using a meter, working systematically from supply toward the coil.",body:`With supply live, measure voltage at each terminal.\n\nTerminal before fault = voltage present.\nTerminal after fault = no voltage.\nFault = the device between those two terminals.\n\nWork from supply rail toward the coil. Don't skip. Don't assume. One test point at a time.`},
    {heading:"Interlock Faults in Practice",goal:"Diagnose the classic 'one direction only' fault where the root cause is a faulty auxiliary contact on the working contactor.",body:`Classic fault: hoist goes DOWN but not UP.\n\nThe DOWN contactor's NC auxiliary sits in the UP coil circuit. With DOWN de-energised, that NC should be CLOSED.\n\nIf NC aux shows OPEN when DOWN is released = auxiliary contact is stuck/welded.\n\nThe DOWN contactor is the fault — even though it's UP that won't operate. Classic trap.`},
  ],quiz:[
    {q:"Voltage at terminal 3 but not terminal 4 in the UP circuit?",options:["E-stop pressed","OLR tripped","Upper limit switch contact open","UP button contacts faulty"],correct:2,explanation:"Terminal 3 is after the overload, terminal 4 is after the upper limit switch. Voltage at 3 not 4 = upper limit switch contact has opened."},
    {q:"Hoist goes DOWN but not UP. First check?",options:["UP pushbutton","UP coil","NC auxiliary contact of the DOWN contactor","Upper limit switch"],correct:2,explanation:"The DOWN contactor's NC auxiliary sits in the UP coil circuit. Welded or stuck contacts prevent the UP contactor energising even when DOWN is not commanded."},
  ]},
  {id:"m6",title:"Limit Switches",icon:"🛑",duration:"10 min",sections:[
    {heading:"Upper Limit Switch",goal:"Identify the three common upper limit switch types and explain the fail-safe principle that makes all of them use NC contacts.",body:`Prevents two-blocking — hook block travelling into the hoist body, causing rope/chain failure and catastrophic load drop.\n\nTypes:\n• GRAVITY/WEIGHT: Weight on lever. Hook lifts weight, operates switch. Simple, reliable.\n• ROTARY/CAM: Driven from drum/gearbox shaft. Multiple cams for slow-down and cut-out.\n• SCREW-SPINDLE: Nut travels along rotating spindle, contacts micro-switches.\n\nDemag DR rope hoists: rotary from drum shaft. Demag DC chain hoists: gravity weight on lower hook chain.`},
    {heading:"NC Contact Logic — Fail Safe",goal:"Explain why NC wiring is fail-safe and describe what happens to the hoist if a limit switch cable breaks.",body:`Limit switches wired as NC contacts in series with the direction coil circuit.\n\nNORMAL: Contact closed → circuit complete → hoist can move.\nLIMIT REACHED: Contact opens → circuit broken → coil de-energises → stops.\n\nWHY NC? Fail-safe. A broken cable or failed switch opens the circuit and stops the hoist. NO wiring would leave the hoist unprotected on any failure.\n\nNever bridge out a limit switch.`},
    {heading:"LOLER Duty",goal:"State the LOLER requirement for upper limit switch testing frequency and the correct action when a limit switch is found faulty.",body:`Per LOLER 1998 and all major OEM operating instructions:\n\n• Test upper limit switch at start of EACH OPERATING PERIOD\n• Test at slow speed, no load\n• After any rope resocketing or chain replacement: re-set and re-test before returning to service\n• Record every test in the equipment log\n\nA hoist with a faulty or untested upper limit switch must be taken OUT OF SERVICE immediately — LOLER regulation 9 defect.\n\nNever use the upper limit switch as a normal operating control.`},
  ],quiz:[
    {q:"Why are limit switch contacts wired NC?",options:["NC contacts cheaper","Fail-safe — broken cable or faulty switch opens circuit and stops hoist","NC contacts handle higher current","Allows use as operating control"],correct:1,explanation:"NC wiring is fail-safe: any failure opens the circuit and stops the hoist. NO wiring would leave the hoist unprotected on failure."},
    {q:"Just re-socketed a hoist rope. Mandatory action before returning to service?",options:["Nothing — limit position doesn't change","Re-set and test the upper limit switch — rope length change affects cut-out position","Replace the OLR","Only re-test if rope length changed significantly"],correct:1,explanation:"Any rope length change requires upper limit switch re-setting and testing. Failure to do so can result in two-blocking."},
  ]},
  {id:"m7",title:"Brake Circuit",icon:"🛞",duration:"14 min",sections:[
    {heading:"Fail-Safe Brake Fundamentals",goal:"State the spring-applied, electrically-released principle and explain why power loss causes the brake to engage, not release.",body:`All hoist brakes are SPRING-APPLIED, ELECTRICALLY-RELEASED:\n• Springs hold the brake ON — no power needed to brake\n• Electrical supply releases against spring force\n• Power loss = brake automatically engages\n\nDo NOT confuse with vehicle brakes. On a hoist: power = brake OFF. No power = brake ON.\n\nThis is a safety device. It must hold rated load stationary when power is removed.`},
    {heading:"DC Brake Rectifier",goal:"Measure DC output voltage at a brake coil and interpret the reading to distinguish between a rectifier fault, coil fault, and correct operation.",body:`Brake electromagnet requires DC (AC causes chatter and buzzing).\n\nBridge rectifier converts AC to DC:\n• Full-wave: ~0.9 × VAC = ~207VDC from 230VAC\n• Half-wave: ~0.45 × VAC = ~103VDC\n\nFORCED-VOLTAGE (Demag GP, GS, GE): Applies ~2× normal DC for ~0.5s for fast release, then drops to holding voltage.\n\nNever apply AC directly to a DC brake coil.`},
    {heading:"Brake Fault Diagnosis",goal:"Follow the correct diagnostic sequence for 'brake not releasing' and 'brake not holding' symptoms, and correctly distinguish electrical from mechanical causes.",body:`BRAKE NOT RELEASING:\n• No DC at coil → check AC input, check rectifier output\n• DC too low → half-wave where full-wave needed\n• DC correct: mechanical — seized pin, corroded armature\n\nBRAKE NOT HOLDING (LOLER REG 9 — OUT OF SERVICE):\n• Coil staying energised after stop → check DC switching circuit\n• Coil de-energises correctly → worn disc, oil contamination, weak springs\n\nBRAKE CHATTERING:\n• AC supply to DC coil\n• Low DC voltage — insufficient holding force`},
  ],quiz:[
    {q:"Why is spring-applied, electrically-released critical?",options:["Reduces energy consumption","Fail-safe — power loss automatically applies brake and holds load","Faster release","Reduces disc wear"],correct:1,explanation:"Fail-safe design means the brake applies without power. Any power failure automatically stops and holds the load."},
    {q:"230VAC confirmed at rectifier input but brake won't release. Next check?",options:["Replace the motor","Measure DC output from rectifier under load","Check upper limit switch","Inspect OLR"],correct:1,explanation:"AC input confirmed — next verify the rectifier is producing correct DC output under load. Failed diode = little or no DC despite correct AC input."},
    {q:"Brake won't hold, load drifts. Regulatory implication?",options:["Schedule for next maintenance","LOLER Regulation 9 defect — hoist must be taken out of service immediately","Adjust spring tension and continue","Increase coil supply voltage"],correct:1,explanation:"A brake that won't hold is a LOLER Reg 9 defect. The hoist must be withdrawn from service and not returned until repaired and re-tested."},
  ]},
  {id:"m8",title:"Variable Frequency Drive (VFD) Fundamentals",icon:"📊",duration:"16 min",sections:[
    {heading:"Why VFDs on Hoists?",goal:"Explain the benefits of VFD control on a hoist and identify a VFD-equipped installation compared to a DOL-only unit.",body:`VFDs control motor speed by varying frequency and voltage:\n• Smooth, stepless acceleration/deceleration\n• Precise speed control for load positioning\n• Controlled brake engagement — motor decelerates to near-zero before brake applies\n• Built-in fault logging and diagnostics\n\nNow standard on new hoists above ~2T. Demag Dedrive Compact STO, Konecranes SX, and Stahl frequency inverters are common on UK sites.`},
    {heading:"VFD Operating Principle",goal:"State the DC bus voltage in a 400V VFD and explain why isolation alone is not sufficient — capacitor discharge must be confirmed before working inside.",body:`Rectifies incoming 3-phase AC to DC bus (~565VDC for 400V supply), then inverts back to AC at desired frequency via IGBTs.\n\nDC bus remains live even when motor is stopped. Wait 5 minutes after isolation before working inside a VFD — capacitors hold this charge.\n\nOutput frequency controls speed. 4-pole motor: ~1450 RPM at 50Hz, ~725 RPM at 25Hz.`},
    {heading:"Safe Torque Off (STO)",goal:"Distinguish between STO and supply isolation and explain why bridging STO input terminals to restore operation is never acceptable.",body:`Hardware safety function per IEC 61800-5-2, typically PLe/SIL 3.\n\nSTO disables IGBT gate signals — drive cannot produce output torque. NOT the same as switching off the supply.\n\nActivated by dual-channel NC safety circuit — e-stop buttons, safety relay outputs, door interlocks.\n\nKey: STO stops torque but DC bus remains at ~565VDC. STO = safety stop, not maintenance isolation.\n\nNever bridge STO terminals to restore operation.`},
    {heading:"Common VFD Fault Codes",goal:"Interpret the six most common VFD fault codes and identify the likely cause and correct first diagnostic action for each.",body:`OC (Overcurrent): Jammed brake, motor short, too-fast accel ramp, stalled motor.\n\nOV (Overvoltage): Regenerative energy during decel/lowering → extend decel ramp, consider braking resistor.\n\nUV (Undervoltage): Supply too low or phase loss.\n\nOH/OT (Overtemperature): Check ventilation, clean heatsink.\n\nGF/EF (Earth Fault): Phase-to-earth fault → megger motor and cables.\n\nSTO: Safe Torque Off active → check e-stop chain, safety relay, STO wiring.`},
  ],quiz:[
    {q:"Expected DC bus voltage inside a 400V VFD?",options:["400VDC","~565VDC — rectified peak, held in capacitors after isolation","230VDC","48VDC"],correct:1,explanation:"DC bus holds ~565VDC. Capacitors maintain this for several minutes after isolation — wait at least 5 minutes and verify zero volts before working inside."},
    {q:"Difference between STO and switching off the VFD supply?",options:["No difference","STO disables IGBT gates — no torque — but DC bus remains live. Safety stop, not isolation.","STO is faster","STO only works on brake circuit"],correct:1,explanation:"STO removes the ability to produce torque. The DC bus remains live. The main isolator is still required for safe working."},
    {q:"VFD shows OV fault during lowering. Cause and fix?",options:["Incoming supply too high","Regenerative energy during lowering charging DC bus — extend decel ramp or fit braking resistor","Motor drawing too much current","STO activated"],correct:1,explanation:"Overvoltage during lowering is caused by regenerative energy from the load feeding back into the DC bus."},
  ]},
  {id:"m9",title:"Safety, Interlocks & Standards",icon:"🦺",duration:"11 min",sections:[
    {heading:"Relevant Legislation",goal:"Name the key legislation applying to hoist electrical work and state the LOLER Reg 9 withdrawal requirement.",body:`LOLER 1998: Governs thorough examination, testing, and safe use of lifting equipment. Regulation 9 — defects making equipment unsafe require immediate withdrawal from service.\n\nPUWER 1998: Equipment must be maintained in efficient working order. Faults must be rectified, not tolerated.\n\nBS EN 14492-2: European standard for power-driven hoists.\n\nEN 60204-1: Electrical equipment of machines.\n\nHSE PM56: Overhead travelling cranes — safe use in practice.`},
    {heading:"Performance Levels",goal:"State the minimum Performance Level required for hoist emergency stop and overtravel limiting, and explain what PLd requires in practice.",body:`Safety-related control systems must meet defined Performance Levels (PL) under EN ISO 13849-1:\n\n• Emergency stop: PLd minimum (Category 3 or 4)\n• Overtravel limiting: PLd or PLe\n• Anti-collision: PLc or PLd\n• Overload limiting: PLc\n\nPLd in practice: dual-channel monitoring, single fault does not cause loss of safety function. Safety relay required (Pilz PNOZ, Sick, Schmersal).`},
    {heading:"Overload Protection",goal:"Explain the three overload protection methods and state the critical rule: overload cutout must ONLY affect the UP direction.",body:`SLIP CLUTCH: Mechanical. Demag DC-series — slips at 110–125% SWL.\n\nLOAD CELL: Strain gauge in suspension. At 100% SWL: audible warning. At 110–125%: lift direction cut out.\n\nTORQUE MONITORING (VFD): Electronic threshold based on motor current.\n\nCritical rule: overload protection must ONLY cut out the UP direction. The hoist must always be able to lower a load to safety.`},
  ],quiz:[
    {q:"Under LOLER 1998, who is responsible for ensuring hoist electrical systems are maintained safely?",options:["Only the manufacturer","The employer/duty holder who owns or controls the equipment","Only the installing contractor","The HSE inspector"],correct:1,explanation:"LOLER places the duty on the employer/duty holder. They must ensure maintenance, thorough examination, and defects are rectified before return to service."},
    {q:"Why must overload protection only cut out the UP direction?",options:["Down uses less current","Load must always be able to be lowered to safety, even when overloaded","Down contactors have different fuses","Limit switches protect the down direction"],correct:1,explanation:"If an overloaded hoist cannot be lowered, the load is trapped in the air — potentially more dangerous. Overload protection must always permit lowering."},
  ]},
  {id:"m11",title:"Chain Hoist Electrics",icon:"⛓️",duration:"14 min",sections:[
    {heading:"Chain Hoist vs Rope Hoist — What's Different Electrically",goal:"Identify whether a unit is a chain or rope hoist and describe the key electrical differences that affect your diagnostic approach on site.",body:`Most of the electrical theory in this trainer applies to both chain and rope hoists. The same contactor logic, same brake principles, same limit switch NC wiring. But there are differences an electrician needs to know before arriving on site.\n\nROPE HOIST:\n• Wire rope on a drum — heavier, typically above 2T\n• Usually a separate electrical panel mounted nearby\n• Motor, brake, gearbox are discrete components you can see and access separately\n• Two-speed (pole-changing) or VFD controlled\n• Rotary cam limit switch driven from the drum shaft\n• Control transformer and contactors in the panel\n\nCHAIN HOIST:\n• Link chain in a collector bag/box — lighter, typically up to 10T as a single unit\n• Electronics often integrated into the hoist body — no separate panel\n• Motor, brake, gearbox and control electronics all inside one housing\n• Single-speed, two-speed, or VFD\n• Gravity weight limit switch (or cam type on some)\n• DOL versions: contactors may be inside the housing cover\n• VFD versions: drive module inside the cover or sometimes externally mounted\n\nKEY PRACTICAL DIFFERENCE: on a chain hoist you may not find a conventional panel at all. The service cover on the hoist body IS the panel. Don't spend 10 minutes looking for a wall-mounted enclosure that doesn't exist.`},
    {heading:"Integrated Electronics — Accessing and Working On",goal:"Locate the service cover on an integrated chain hoist and carry out the correct preparation before opening it for diagnosis.",body:`Chain hoists with integrated control electronics (common on modern units) require a different approach to opening up for diagnosis.\n\n1. IDENTIFY: Look for a cover on the underside or side of the hoist body, usually secured with 4–6 screws or a quarter-turn fastener. This is the electrical/service cover.\n\n2. BEFORE OPENING: Supply must be ISOLATED AND LOCKED OFF. Wait a minimum of 3 minutes for internal capacitors to discharge — especially on VFD-equipped units where the DC bus holds charge.\n\n3. WHAT YOU'LL FIND INSIDE: A compact PCB or module assembly, possibly a small display, terminal blocks for supply, motor, brake, and pendant. On VFD types, a drive module with output terminals.\n\n4. WORKING SPACE: Tight. Use a head torch. Most test points are accessible but connectors are small and easily damaged by probing. Know what you're testing before you put a probe near it.\n\n5. CONNECTOR TYPES: Many integrated hoists use proprietary multi-pin connectors rather than screw terminals. These connectors can fail — pins push back or corrode. Before tracing a fault through the PCB, disconnect and inspect every connector.\n\n6. DOCUMENTATION: The circuit diagram is usually on the inside of the cover or in a pouch attached to the hoist. If absent, contact the manufacturer with the serial number. Don't guess the circuit topology on an integrated hoist.`},
    {heading:"The Slip Clutch — Electrical Diagnosis Limit",goal:"Complete the five-point electrical confirmation checklist to prove the slip clutch is active, then hand off correctly to mechanical support.",body:`Chain hoists have a slip clutch. Rope hoists generally don't — they rely on electronic overload limiting in the VFD or a load cell.\n\nThe slip clutch is a mechanical device you cannot diagnose or adjust electrically. Your job as an electrician is to confirm the electrical path is correct — then stop.\n\nELECTRICAL CONFIRMATION CHECKLIST:\n✓ All 3 phases present at motor terminals\n✓ Brake releasing — audible clack on power-up\n✓ Motor running freely — fan turning, body vibrating\n✓ Current present in motor circuit — clamp meter shows load current\n✓ No fault codes on display (if fitted)\n\nIf all five are confirmed and chain still won't move: the electrical path is complete. The slip clutch is activated. Your diagnosis ends here. Document findings, take out of service if tripping at rated SWL, report for mechanical investigation.\n\nCOMMON TRAP: apprentice re-energises repeatedly to "try again." Every re-energisation with the clutch slipping cycles heat into the lining. After 2–3 attempts with no load, stop and diagnose systematically.`},
    {heading:"Chain Hoist Limit Switches",goal:"Test both gravity-weight and rotary cam limit switch types using the correct isolated continuity method and identify common failure modes for each.",body:`Two types you'll encounter. Both use NC contacts in the UP coil circuit — same fail-safe principle as rope hoist limits.\n\nGRAVITY WEIGHT TYPE (most common on chain hoists):\n• A weight hangs on a pivot arm projecting into the chain path\n• Bottom block rises → lifts the weight → lever trips a micro-switch → UP circuit opens\n• WHAT CAN GO WRONG (electrically): micro-switch contact failure (test continuity isolated), broken cable to switch, water ingress at switch housing\n• WHAT CAN GO WRONG (non-electrical — observe and report): weight not hanging freely, weight fouled on chain guide or structure, pivot mechanism seized\n• FAULT PATTERN: limit trips before hook reaches top, or won't reset after lowering. Lower the hook 500mm and check if circuit re-closes.\n\nROTARY CAM TYPE (some chain hoists and most rope hoists):\n• Mechanically driven from drum or gearbox shaft\n• Multiple cams — slow-down and cut-out\n• AFTER ANY CHAIN REPLACEMENT: re-set and re-test. The new chain may have different pitch or the collector box position changes the effective cut-out point.\n• FAULT PATTERN: limit trips too early or too late — cam position needs adjusting\n\nTEST PROCEDURE (both types — isolated):\nDisconnect from circuit. Test NC contact continuity in normal (not tripped) state — should show continuity. Operate switch manually — should open (no continuity). If stuck open in normal state: replace switch.`},
    {heading:"Chain Condition — Observe and Report",goal:"Identify observable chain defects that require immediate out-of-service action and report correctly — even when your job was electrical.",body:`You are not responsible for the mechanical chain inspection — that's the LOLER thorough examination. But you will be working near the chain and you have a duty to stop and report if you observe an obvious defect.\n\nOBSERVE AND REPORT IF YOU SEE:\n• Broken or cracked links\n• Links that are bent, twisted, or deformed\n• Chain stretched visibly (links look elongated compared to new chain)\n• Rust or corrosion — surface rust acceptable if chain is still supple; flaking, pitting, or seized links are not\n• Chain jumping on the sprocket during operation — indicates wear or incorrect chain for the unit\n• Weld marks on links — a welded chain link has been "repaired" by someone. This is never acceptable. Out of service immediately.\n• Chain not stamped with the manufacturer's mark — some OEMs require genuine branded chain for EC conformity. Non-OEM chain may fit but may not be rated correctly.\n\nYOUR ACTION: If you observe any of the above, stop work, take the hoist out of service per the OOS procedure, and report to your supervisor. Do not attempt further electrical diagnosis until the chain has been assessed by a competent person.\n\nDO NOT: attempt to assess elongation with a ruler on site unless you have been trained to do so. "Looks a bit stretched" is enough reason to flag and report.`},
  ],quiz:[
    {q:"You arrive at a chain hoist. Motor is running, you can hear it and feel vibration. Chain is stationary. First check?",options:["Replace the contactor","Confirm brake is releasing — listen for the brake clack","Check the pendant cable","Replace the chain"],correct:1,explanation:"Motor running + chain stationary = suspect slip clutch OR brake not releasing. Brake not releasing is the first electrical check — listen for the brake clack on power-up. If there's no clack, go to the brake circuit. If the brake is releasing and the motor is freely turning, then investigate the slip clutch."},
    {q:"A chain hoist has integrated electronics — no separate panel. You need to access the control circuit. First step?",options:["Isolate supply, lock off, wait 3 minutes minimum before opening the service cover","Open the cover immediately — it's only low voltage inside","Find the panel on the wall","Remove the pendant connector"],correct:0,explanation:"Integrated hoist covers house electronics that may include VFD modules with charged capacitors. Isolate, lock off, and wait at least 3 minutes before opening."},
    {q:"Direction is reversed on a VFD-controlled chain hoist. Correct action?",options:["Swap L2 and L3 at the incoming supply","Check the drive's motor rotation direction parameter or command wiring — do NOT swap input phases","Replace the pendant","Swap two motor cables at the motor terminal box"],correct:1,explanation:"VFD hoists rectify the incoming supply internally — swapping input phases does not change output motor direction. Motor direction is set by drive parameters or command wiring. Swap input phases only on DOL/two-speed hoists."},
    {q:"During a chain hoist job you notice two links of the chain appear bent and deformed at the lower limit area. Action?",options:["Continue with the electrical diagnosis — that's the fitter's problem","Stop, take the hoist out of service, report to supervisor — chain defect","Straighten the links and carry on","Log it in the report but continue for now"],correct:1,explanation:"Deformed chain links are a LOLER defect. Any person who identifies an obvious defect has a duty to report it. Stop work, OOS procedure, report — regardless of whether the job was electrical or not."},
  ]},
  {id:"m10",title:"Reading Hoist Schematics",icon:"📐",duration:"12 min",sections:[
    {heading:"Schematic Structure",goal:"Navigate a multi-page hoist schematic and locate the power circuit, control circuit, and terminal schedule pages within 60 seconds.",body:`Multi-page documents:\n\nPage 1: Supply overview, main isolator, incoming terminals\nPage 2: Power circuit — contactor main contacts, motor terminals, overload relays\nPage 3: Control transformer, fusing, control supply rail\nPage 4+: Control circuit — coil circuits, limit switches, pushbutton logic\nLast pages: Terminal schedules, cable lists, component index\n\nFormat: IEC 60617 ladder layout. Power rails vertical. Each rung is one circuit path.\n\nAlways retrieve the schematic from the panel door before starting work.`},
    {heading:"Component Designations",goal:"Identify any IEC-designated component (KM, KT, KA, F, Q, T, M, S, B) on a hoist schematic using the standard letter codes.",body:`IEC standard designations:\n• KM — contactor\n• KT — timer relay\n• KA — auxiliary relay\n• F — fuse\n• Q — breaker/isolator\n• T — transformer\n• M — motor\n• S — switch/button\n• B — sensor\n\nTerminals numbered sequentially — same terminal number everywhere that conductor connects. Find it on the schematic, find it on the panel.`},
    {heading:"Practical Fault-Finding Workflow",goal:"Apply the six-step fault-finding workflow to a given symptom, tracing from coil back to supply without skipping steps or guessing.",body:`1. IDENTIFY SYMPTOM: What's the hoist doing?\n2. IDENTIFY CIRCUIT: Power fault or control fault?\n3. FIND STARTING POINT: Find the relevant contactor coil.\n4. TRACE BACKWARDS: From coil to supply — identify every NC and NO contact.\n5. ON THE MACHINE: Voltage method from supply toward coil.\n6. CROSS-REFERENCE: Unexpected relay contact? Find that relay's coil and trace backwards.\n\nNEVER shotgun (replace components randomly). One step at a time. Document findings.`},
  ],quiz:[
    {q:"On an IEC schematic, 'KM3' refers to?",options:["Terminal 3 on cable KM","Contactor number 3","Motor fuse 3","Timer relay 3"],correct:1,explanation:"KM is the IEC prefix for contactors. KM3 = third contactor. KT = timer relay, KA = auxiliary relay, F = fuse."},
    {q:"5 NC contacts in series in a coil circuit. Most efficient fault-finding approach?",options:["Replace all 5","Voltage method — find where voltage disappears","Bypass contacts one by one","Replace the coil first"],correct:1,explanation:"Voltage method: measure progressively along the chain. Where voltage disappears is the open contact. No random replacing, no bypasses."},
  ]},
];


const FAULT_TREE={
  root:{id:"root",text:"What is the symptom?",type:"question",options:[
    {label:"🚫 Hoist completely dead — nothing works",next:"dead_all"},
    {label:"⬆️ Hoist won't lift (UP)",next:"wont_up"},
    {label:"⬇️ Hoist won't lower (DOWN)",next:"wont_down"},
    {label:"🔄 One direction only",next:"one_dir"},
    {label:"🎮 Pendant dead / no response",next:"pendant_dead"},
    {label:"🛑 Trips immediately on operation",next:"trips_immediate"},
    {label:"🔥 Motor overheating",next:"motor_hot"},
    {label:"⚙️ Brake not releasing",next:"brake_no_release"},
    {label:"📉 Brake not holding — load drifts",next:"brake_no_hold"},
    {label:"💬 Contactor chattering / buzzing",next:"contactor_chatter"},
    {label:"🔴 VFD fault code showing",next:"vfd_fault"},
    {label:"🔝 Upper limit activates before hook reaches top",next:"limit_early"},
    {label:"⬇️ Load drops / brake fails on power loss",next:"brake_power_loss"},
    {label:"⬆️ Hook drifts UP after stopping",next:"hook_drift_up"},
    {label:"🔊 Unusual noise during operation",next:"unusual_noise"},
    {label:"⚙️ Motor runs — chain not moving",next:"slip_active"},
    {label:"↔️ Direction wrong on first power-up",next:"phase_rotation"},
    {label:"⛓️ Chain jam / won't feed",next:"chain_jam"},
    {label:"🔌 Pendant connector suspect",next:"pendant_connector"},
    {label:"⚡ RCD / RCCB keeps tripping",next:"rcd_trip"},
    {label:"🚂 Motorised trolley won't travel",next:"trolley_dead"},
  ]},
  dead_all:{id:"dead_all",text:"Any power indication at the panel?",type:"question",options:[
    {label:"No lights, nothing at all",next:"dead_no_power"},
    {label:"Lights on but nothing responds",next:"dead_control"},
  ]},
  dead_no_power:{id:"dead_no_power",text:"Check voltage at main isolator input terminals",type:"question",options:[
    {label:"No supply voltage at isolator input",next:"fix_no_incoming"},
    {label:"Supply at input, not at output",next:"fix_isolator_fault"},
    {label:"Supply through isolator — fuse/breaker downstream tripped",next:"fix_fuse_blown"},
  ]},
  fix_no_incoming:{id:"fix_no_incoming",type:"result",loler:false,title:"No Incoming Supply",
    findings:["No voltage at main isolator L1, L2, L3 input terminals"],
    checks:["Check upstream supply — distribution board, busbar trunking, runway conductors","Check if other equipment on the same supply is also dead","Measure voltage at the supply distribution point","Check for tripped MCCB/MCB at distribution board","Inspect conductor/busbar contact shoes on crane runway — corrosion or mechanical damage is common"],
    warning:"Supply or site infrastructure issue. Do not energise the hoist until supply is restored and verified correct at all three phases."
  },
  fix_isolator_fault:{id:"fix_isolator_fault",type:"result",loler:false,title:"Main Isolator Fault",
    findings:["Supply present at isolator input, not at output"],
    checks:["Verify isolator is FULLY in ON position — rotary cam types can feel like they're on but not be fully seated","ISOLATE UPSTREAM and lock off before continuing","Check contact continuity through each pole with supply isolated","Inspect contact faces for burning, pitting, or carbon tracking","Replace faulty isolator — do not attempt to operate with a faulty main isolator"],
    diag:"contactor_continuity",
  },
  fix_fuse_blown:{id:"fix_fuse_blown",type:"result",loler:false,title:"Blown Fuse or Tripped Breaker",
    findings:["Supply through isolator, no output from fuse/breaker"],
    checks:["HRC fuses — the element inside may have blown but the ceramic body looks intact. ALWAYS test continuity with the fuse removed and supply isolated.","DO NOT replace fuse until you know why it blew","Disconnect ALL motor cables from the contactors. Reset and re-energise — if fuse still blows, the fault is in the panel wiring itself","If fuse holds with motors disconnected: reconnect motor circuits one at a time, testing between each reconnection"],
    warning:"A blown fuse is a symptom. If a replacement fuse blows immediately — STOP. There is an active fault drawing fault current. Repeated replacement causes additional damage."
  },
  dead_control:{id:"dead_control",text:"Is the E-stop released (pulled out / twisted)?",type:"question",options:[
    {label:"E-stop was pressed in",next:"fix_estop_pressed"},
    {label:"E-stop released, still no response",next:"dead_control2"},
  ]},
  fix_estop_pressed:{id:"fix_estop_pressed",type:"result",loler:false,title:"E-Stop Engaged",
    findings:["Emergency stop button was pressed/latched in"],
    checks:["Twist or pull to release (direction marked on button — usually turn clockwise to release)","If it won't release: check for bent mushroom head, debris in the button body, or damaged latch mechanism","After releasing, confirm hoist functions correctly in all directions","MANDATORY: establish why it was activated before restarting — was it pressed for a safety reason?"],
    diag:"estop_circuit",
    warning:"Never assume an e-stop activation was accidental. If it was activated for a safety reason and you restart without resolving that reason, you may be creating a dangerous situation."
  },
  dead_control2:{id:"dead_control2",text:"Check control transformer secondary voltage (48V or 110V side)",type:"question",options:[
    {label:"No voltage on secondary side",next:"fix_transformer"},
    {label:"Secondary voltage present — pendant still dead",next:"fix_pendant_fuse"},
  ]},
  fix_transformer:{id:"fix_transformer",type:"result",loler:false,title:"Control Transformer / Secondary Fuse Fault",
    findings:["No control voltage on transformer secondary side"],
    checks:["Check secondary fuse (2–4A) — continuity test with supply ISOLATED. The secondary fuse is usually inside the panel on a small fuse holder near the transformer","Check primary fuse — usually on the line side of the transformer primary connections","Measure primary voltage with supply on — should be ~415V L-L between the two phases the transformer primary is connected across","If primary voltage OK and both fuses OK but no secondary output: transformer may have an open-circuit winding — replace","Check for short circuit on secondary wiring — a damaged pendant cable or shorted button contact will blow the secondary fuse repeatedly"],
    diag:"estop_circuit",
  },
  fix_pendant_fuse:{id:"fix_pendant_fuse",type:"result",loler:false,title:"Pendant Circuit Fault",
    findings:["Control voltage present at panel but pendant not responding"],
    checks:["Check pendant connector is fully mated, locked, and pins are not corroded. Corrosion at the connector is the most common cause on outdoor and washdown installations.","Inspect pendant cable — particularly where cable enters pendant body at strain relief (most common break point) and at the panel connector","To test cable cores: disconnect pendant at BOTH ends, test continuity between matching pin numbers at each end. Good core = continuity. Broken core = open circuit. Write down results.","With pendant disconnected, jumper the button functions directly at the panel terminal strip — if contactors now operate, the fault is confirmed in the pendant or cable","Check for water ingress in pendant body — remove screws, inspect for moisture, corrosion, or shorted button contacts"],
    diag:"estop_circuit",
  },
  wont_up:{id:"wont_up",text:"Does the UP contactor pull in when UP is pressed?",type:"question",options:[
    {label:"Contactor pulls in but hoist doesn't move",next:"up_contactor_ok_no_motion"},
    {label:"Contactor does NOT pull in",next:"up_no_contactor"},
  ]},
  up_no_contactor:{id:"up_no_contactor",text:"Is the DOWN direction working?",type:"question",options:[
    {label:"Yes — DOWN works fine",next:"up_only_fault"},
    {label:"No — both directions dead",next:"dead_control"},
  ]},
  up_only_fault:{id:"up_only_fault",type:"result",loler:false,title:"UP Direction Only Fault",
    findings:["DOWN works, UP contactor will not pull in"],
    checks:["1. Check upper limit switch first — is the hook near the top? Lower it slightly and retry UP before going further","2. With supply live and UP button pressed, measure voltage at UP coil terminal A1. If supply voltage (48V or 110V) is present but the contactor won't pull in: isolate, lock off, measure coil resistance A1–A2 (open circuit = burnt coil)","3. If no voltage at A1: trace the control circuit terminal by terminal from the supply rail toward the coil — use the Control Circuit Voltage Trace diagram","4. Most likely culprit: NC auxiliary contact of the DOWN contactor stuck open (isolate, lock off, test 11→12 continuity on DOWN contactor with DOWN de-energised — should show continuity)","5. Also check: upper limit switch NC contact continuity (isolated), UP pushbutton NO contact continuity (isolated)"],
    diag:"control_circuit",diag2:"contactor_interlock",
  },
  up_contactor_ok_no_motion:{id:"up_contactor_ok_no_motion",text:"Can you hear the brake release when UP is pressed?",type:"question",options:[
    {label:"No brake release sound — motor straining or stalling",next:"brake_no_release"},
    {label:"Brake releases but motor won't turn",next:"fix_motor_fault"},
    {label:"All sounds normal but no hook movement",next:"fix_mechanical"},
  ]},
  fix_motor_fault:{id:"fix_motor_fault",type:"result",loler:false,title:"Motor Fault — Brake Releasing OK",
    findings:["Brake releases but motor not rotating"],
    checks:["1. First, measure phase-to-phase voltage at the contactor INPUT terminals L1–L2, L2–L3, L1–L3 with the supply live and contactor de-energised. All three should read ~415V. If any reading is low or zero here, the fault is upstream of the contactor — check incoming fuses, supply cables, and busbar connections before going further.","2. Then, with the direction button held in (contactor energised), measure at the contactor OUTPUT terminals T1–T2, T2–T3, T1–T3. Supply correct at L terminals but missing at T terminals for one phase = that contactor main contact is faulty. Test L–T continuity for that phase with supply isolated.","3. Then measure phase-to-phase voltage at motor terminals U1–V1, V1–W1, U1–W1 with the contactor closed. All three should read ~415V. Phase loss pattern: the missing phase appears in two of the three readings as zero — example: L2 missing gives U1–V1 = 0V, V1–W1 = 0V, U1–W1 = ~415V.","4. If all three phase voltages are correct at motor terminals: isolate, lock off, discharge brake capacitors, disconnect motor leads from contactor. Megger test each winding to earth — below 1MΩ is suspect, below 100kΩ is a definite fault.","5. On VFD hoists: DO NOT megger with drive connected. Disconnect motor cables at VFD OUTPUT terminals before testing."],
    diag:"motor_terminals",
    warning:"A motor with failed winding insulation is a shock and fire risk. Do not return to service until insulation is confirmed acceptable."
  },
  fix_mechanical:{id:"fix_mechanical",type:"result",loler:false,title:"Mechanical Fault Suspected",
    findings:["Electrical supply and brake appear OK but no movement"],
    checks:["ISOLATE AND LOCK OFF before any investigation","Manually turn the brake drum (with brake manually released) — check for gearbox or drum seizure","Check rope drum or chain sprocket for jam, crossed rope, or chain off-sprocket","Check hook block for fouling on structure, rope guide, or chain guide","This is no longer an electrical fault — mechanical investigation required"],
    warning:"Do not attempt to force any seized mechanical component under power or by hand. Obtain mechanical engineering support."
  },
  wont_down:{id:"wont_down",text:"Does the DOWN contactor pull in when DOWN is pressed?",type:"question",options:[
    {label:"Contactor pulls in but hoist doesn't lower",next:"down_contactor_ok"},
    {label:"Contactor does NOT pull in",next:"down_no_contactor"},
  ]},
  down_no_contactor:{id:"down_no_contactor",text:"Is UP direction working?",type:"question",options:[
    {label:"Yes — UP works fine",next:"down_only_fault"},
    {label:"No — both directions dead",next:"dead_control"},
  ]},
  down_only_fault:{id:"down_only_fault",type:"result",loler:false,title:"DOWN Direction Only Fault",
    findings:["UP works, DOWN contactor will not pull in"],
    checks:["1. Check lower limit switch — is the hook fully lowered or near the bottom? Raise it slightly then retry DOWN.","2. With supply live and DOWN button pressed, measure voltage at DOWN coil terminal A1. No voltage = trace the circuit from the supply rail.","3. Most likely culprit: NC auxiliary contact of the UP contactor stuck open. Isolate, lock off, test 11→12 continuity on UP contactor with UP de-energised — should show continuity.","4. Check DOWN pushbutton NO contact continuity (isolated)"],
    diag:"control_circuit",diag2:"contactor_interlock",
  },
  down_contactor_ok:{id:"down_contactor_ok",type:"result",loler:false,title:"DOWN Contactor OK — No Lowering Motion",
    findings:["DOWN contactor closes but load doesn't lower"],
    checks:["Check brake release — is the brake releasing when DOWN energises? Use the brake rectifier test diagram.","Check phase sequence at motor — if phase rotation was reversed during a recent reconnection, motor direction may be wrong","On VFD hoists: check drive display is showing forward/reverse command correctly and brake relay output is operating"],
    diag:"brake_rectifier",
  },
  one_dir:{id:"one_dir",type:"result",loler:false,title:"One Direction Only Working",
    findings:["Hoist operates in one direction only"],
    checks:["Identify which direction fails, then follow 'UP Only Fault' or 'DOWN Only Fault' path as appropriate","Remember: the fault is usually in the contactor for the direction that WORKS — its NC auxiliary contact is stuck open, blocking the other direction","Use the Mechanical Interlock diagram to confirm interlock integrity"],
    diag:"contactor_interlock",
  },
  pendant_dead:{id:"pendant_dead",text:"Are lights or displays on the hoist panel still active?",type:"question",options:[
    {label:"Yes — panel has power but pendant dead",next:"fix_pendant_fuse"},
    {label:"No — everything dead",next:"dead_no_power"},
  ]},
  trips_immediate:{id:"trips_immediate",text:"What trips when the hoist is operated?",type:"question",options:[
    {label:"Main fuse or breaker at panel",next:"trip_main"},
    {label:"Thermal overload relay",next:"trip_olr"},
    {label:"VFD trips on fault code",next:"vfd_fault"},
    {label:"Safety relay / e-stop circuit activates",next:"trip_safety"},
  ]},
  trip_main:{id:"trip_main",type:"result",loler:false,title:"Main Fuse / Breaker Tripping",
    findings:["Main fuse/breaker trips immediately on operation"],
    checks:["Disconnect ALL motor cables from contactor output terminals. Reset and re-energise — if fuse still blows, fault is in the panel wiring or contactors themselves.","If fuse holds with motors disconnected: reconnect one motor circuit at a time. The circuit that trips the fuse when reconnected is the faulty one.","With faulty circuit identified: megger test cable phase-to-phase and phase-to-earth. Megger motor windings. Look for burned cable insulation."],
    diag:"motor_terminals",
    warning:"Do not repeatedly reset and attempt to operate — fault current causes additional insulation damage and fire risk each time."
  },
  trip_olr:{id:"trip_olr",type:"result",loler:false,title:"Thermal Overload Tripping",
    findings:["Thermal overload relay trips on operation"],
    checks:["1. Check OLR current setting — must match motor nameplate FLA exactly. If set higher than FLA, reduce it before investigating further.","2. Check all 3 phase currents with a clamp meter while running — they should be balanced and close to FLA. A significant imbalance indicates phase loss.","3. Phase loss effect: if one phase is missing, the remaining two phases carry ~1.73× normal current each. The motor struggles, overheats, and the OLR trips.","4. Check brake is fully releasing — brake drag forces the motor to work against the brake, drawing excess current and tripping the OLR.","5. Check for mechanical overload — seized gearbox, tight rope or chain, overloaded hoist (check load against SWL)."],
    diag:"brake_rectifier",
  },
  trip_safety:{id:"trip_safety",type:"result",loler:false,title:"Safety Circuit Activating",
    findings:["Safety relay or e-stop circuit preventing operation"],
    checks:["Check ALL e-stop buttons are fully released across the entire system — pendant, panel, any remote stations or radio remote","Check safety relay status LED indicators — most show which channel has faulted (CH1 or CH2)","Check all door and access interlocks — panel doors, crane access hatches, service platforms","Check e-stop NC contacts for wear or failure — a worn contact can read open even when the button is released","Safety relay must be manually reset after any activation — locate the RESET button on the relay face or follow the schematic for the reset circuit"],
    diag:"estop_circuit",
  },
  motor_hot:{id:"motor_hot",type:"result",loler:false,title:"Motor Overheating",
    findings:["Motor casing excessively hot to touch (>60°C ambient feel, >80°C is critical)"],
    checks:["1. Brake dragging — the single most common cause. Measure DC at brake coil terminals during operation. ~207V DC (full-wave) = brake should release fully. Low or no DC = brake dragging against the motor, generating enormous heat.","2. Phase loss — measure all three phase voltages at motor terminals while running. Missing phase = two phases carry 1.73× normal current = very rapid overheating.","3. Duty cycle abuse — is the hoist being operated beyond its rated S3/S4 cycle? Repeated starts without adequate cooling intervals will overheat any hoist motor.","4. Ventilation — check fan guard is clear, fan is rotating (visible through guard on most hoists), and ambient temperature in the area is within motor rating.","5. Overloading — check actual load against SWL. Sustained overloading overheats windings."],
    diag:"brake_rectifier",
    warning:"A motor with a casing temperature above 80°C may have damaged winding insulation. Allow to cool, then megger test before returning to service."
  },
  brake_no_release:{id:"brake_no_release",type:"result",loler:false,title:"Brake Not Releasing",
    findings:["Motor runs but brake doesn't release, or hoist strains and barely moves"],
    checks:["1. With direction button held in (contactor energised), measure DC voltage at brake coil terminals: ~207V DC expected (full-wave) or ~103V DC (half-wave). Acceptable range: ±15% of expected value.","2. No DC output: check AC input voltage to rectifier (live, with contactor closed). No AC = check brake supply wiring and fuse. AC present, no DC = rectifier diodes failed — replace rectifier module.","3. DC approximately half expected value (~103V where ~207V expected): one diode in the bridge has failed (half-wave output) — replace rectifier module.","4. DC correct but low (below acceptable range): check rectifier type — half-wave module where full-wave needed.","5. DC voltage correct and at correct level but brake still won't release: ISOLATE AND LOCK OFF. Disconnect coil leads from rectifier. Wait 30 seconds. Measure coil resistance. Expected values by coil rated voltage: 24V DC ≈ 5–15Ω | 48V DC ≈ 20–40Ω | 110V DC ≈ 80–150Ω | 205V DC ≈ 180–300Ω. Open circuit (OL) = burnt coil. Near zero Ω = shorted coil. Resistance in expected range but brake won't release = mechanical fault (seized pin, corroded armature plate, swollen coil body)."],
    diag:"brake_rectifier",
    warning:"Never run a hoist with the brake mechanically released or bridged out, even briefly for testing. If power is lost, there is nothing to hold the load."
  },
  brake_no_hold:{id:"brake_no_hold",type:"result",loler:true,title:"Brake Not Holding — Load Drifts",
    findings:["Load drifts or creeps downward when hoist is stopped and de-energised"],
    checks:["1. Confirm the brake is actually de-energising: measure DC at brake coil terminals after hoist stops. Should drop to zero within 1 second. If DC remains: welded brake switch contact or DC-side switching fault — trace the DC switching circuit.","2. If coil de-energises correctly (DC drops to zero) but load still drifts: mechanical brake inspection required. ISOLATE AND LOCK OFF.","3. Check brake disc thickness against manufacturer wear limit (in the hoist maintenance manual — typically marked on the brake housing).","4. Check for contamination on brake disc — oil, grease, or moisture dramatically reduces braking torque. Source of contamination must be found and fixed.","5. Check brake spring free length — compare against manufacturer's specification. Weakened springs reduce clamping force below the required holding torque."],
    diag:"brake_rectifier",
    warning:"⚠ LOLER REGULATION 9 DEFECT. A brake that will not hold a load is an immediate danger of personal injury. This hoist MUST be taken out of service immediately by physically preventing its use (locked off, barriers in place). Must not be returned to service until the brake is repaired and re-tested by a competent person. The defect must be documented in the hoist's examination record."
  },
  contactor_chatter:{id:"contactor_chatter",type:"result",loler:false,title:"Contactor Chattering / Buzzing",
    findings:["Contactor rapidly pulling in and dropping out, or buzzing continuously"],
    checks:["1. Measure coil supply voltage at A1–A2 while operating — chattering typically occurs when voltage drops below ~85% of nominal coil voltage (e.g. below ~41V on a 48V coil, or ~94V on a 110V coil). Confirm your control voltage first so you know the expected threshold.","2. Check control transformer secondary voltage under load (motor starting) — the large starting current can cause a voltage dip on a marginal transformer or high-resistance connection.","3. Check all control circuit connections for high resistance — corroded screw terminals, loose connections. Any one of these in the coil supply chain can cause a voltage drop.","4. Check the hold-in (NO) auxiliary contact — test continuity with contactor manually held in (isolated). An intermittent hold-in contact causes the contactor to drop out and re-energise rapidly.","5. Check coil condition — isolate, lock off, disconnect A1 and A2, measure coil resistance. Compare to identical contactor if available. High resistance indicates partial burnout."],
    diag:"contactor_coil",diag2:"control_circuit",
  },
  vfd_fault:{id:"vfd_fault",text:"What fault code is showing on the VFD display?",type:"question",options:[
    {label:"OC / OCA — Overcurrent",next:"vfd_oc"},
    {label:"OV / OVn — Overvoltage (DC bus)",next:"vfd_ov"},
    {label:"UV / LU — Undervoltage",next:"vfd_uv"},
    {label:"OH / OT — Overtemperature",next:"vfd_oh"},
    {label:"GF / EF — Earth / Ground Fault",next:"vfd_gf"},
    {label:"STO / HW — Safe Torque Off active",next:"vfd_sto"},
    {label:"OL / OLF — Motor Overload",next:"vfd_ol"},
  ]},
  vfd_oc:{id:"vfd_oc",type:"result",loler:false,title:"VFD Overcurrent Fault",
    findings:["Drive output current exceeded trip threshold"],
    checks:["1. Brake not releasing before motor starts — the most common cause. Check brake release DC voltage during the start sequence. The brake must be fully released before the motor tries to accelerate. Check the 'brake release frequency' parameter — typically 3–5Hz, the minimum frequency at which the drive applies torque before the brake releases.","2. Acceleration ramp too fast — the 'acceleration time' parameter (usually in seconds) controls how quickly the drive ramps up from 0Hz to running frequency. Too short = the drive demands more current than the motor can supply = OC trip. Increase the ramp time.","3. Motor or cable short circuit — isolate drive, disconnect motor cables at drive OUTPUT terminals, megger test cables and motor.","4. Motor stalled mechanically — hoist jammed, rope crossed, hook block fouled.","5. Motor nameplate data incorrectly entered in drive — verify rated kW, voltage, current, Hz, and RPM match the motor nameplate exactly."],
    diag:"motor_terminals",
  },
  vfd_ov:{id:"vfd_ov",type:"result",loler:false,title:"VFD Overvoltage Fault",
    findings:["DC bus voltage exceeded trip level — typically during deceleration or lowering"],
    checks:["1. During lowering or deceleration, the motor acts as a generator (regenerative braking), feeding energy back into the VFD DC bus. If the bus voltage rises above the trip threshold (~800V on a 400V supply), the drive trips OV.","2. Extend the deceleration ramp time parameter — gives the DC bus more time to dissipate energy. Try doubling the current decel time as a starting point.","3. Fit a braking resistor — this is the proper solution for hoists with frequent or heavy loads. The resistor absorbs the regenerative energy as heat. The drive needs a braking resistor output — check if fitted.","4. Check incoming supply voltage — high supply voltage means the DC bus starts higher and has less headroom before OV trip."],
  },
  vfd_uv:{id:"vfd_uv",type:"result",loler:false,title:"VFD Undervoltage Fault",
    findings:["DC bus voltage fell below minimum threshold"],
    checks:["1. Measure supply voltage at VFD input terminals during operation (not just at rest) — should be 400V ±10% (360–440V) under load.","2. Check for momentary supply dips from other large equipment starting on the same distribution — a clamp meter logger on the supply can confirm this.","3. Check incoming fuses and cable terminations — corroded or loose connections cause voltage to drop under load.","4. Check for phase loss — the drive may start on 2 phases but the reduced DC bus voltage trips UV under load."],
  },
  vfd_oh:{id:"vfd_oh",type:"result",loler:false,title:"VFD Overtemperature Fault",
    findings:["Drive internal temperature sensor exceeded limit"],
    checks:["1. Check drive cooling fan is running — hold a piece of paper near the vents, you should feel airflow. Fan bearings fail silently on older drives.","2. Check all ventilation slots are clear — dust and fluff build-up on heatsink fins dramatically reduces cooling. Clean with dry compressed air.","3. Check panel ambient temperature — if the panel is in a hot environment (near furnaces, in direct sun) the drive may not be able to cool adequately.","4. Review operating duty cycle — if the hoist is being used very intensively, the drive may simply not be sized for that duty. Check drive current rating against motor FLA."],
  },
  vfd_gf:{id:"vfd_gf",type:"result",loler:false,title:"VFD Earth / Ground Fault",
    findings:["Insulation fault detected between motor phase(s) and earth"],
    checks:["1. ISOLATE DRIVE SUPPLY AND LOCK OFF. Wait 5 minutes for DC bus capacitors to discharge. Verify DC bus voltage is zero before working on motor cables.","2. Disconnect motor cables at VFD OUTPUT TERMINALS (not just at the panel isolator).","3. Megger test each motor cable phase-to-earth at 500V — below 1MΩ is suspect. Test each cable separately.","4. Megger test motor windings phase-to-earth — below 1MΩ is suspect, below 100kΩ is a definite fault.","5. Check motor cable entry points for physical damage — particularly at flexible conduit entries, cable glands, and festoon cable flexing points.","6. On VFD hoists, do NOT reconnect the drive to the motor cables until the fault is found and rectified — running with an earth fault destroys motor windings."],
    diag:"motor_terminals",
    warning:"An earth fault means fault current is flowing through the protective earth conductor. Do not operate the equipment until the fault is rectified."
  },
  vfd_sto:{id:"vfd_sto",type:"result",loler:false,title:"VFD Safe Torque Off Active",
    findings:["STO input removed — drive cannot produce motor torque"],
    checks:["1. Check ALL e-stop buttons are fully released — pendant, panel, remote stations. One latched e-stop anywhere in the system activates STO.","2. Check safety relay status LED indicators — note which channel (CH1/CH2) is showing a fault condition.","3. Check STO input wiring continuity — the STO input uses a dual-channel circuit. Both channels must be intact. Test continuity of each channel separately with supply isolated.","4. Locate and follow the safety relay reset procedure — STO requires deliberate manual reset. Find the RESET button on the safety relay face or the reset circuit on the schematic.","5. If STO activates intermittently under vibration: suspect an NC contact in the e-stop chain that vibrates open. A clamp-style logger on the STO input can confirm this.","6. Note: STO disables the IGBT gate drive signals. The DC bus remains at ~565V after STO activation. STO is not electrical isolation — use the main isolator for safe working."],
    diag:"estop_circuit",
    warning:"Never bridge or bypass STO input terminals to restore operation. STO activated for a reason — find and fix it."
  },
  vfd_ol:{id:"vfd_ol",type:"result",loler:false,title:"VFD Motor Overload",
    findings:["Drive electronic overload protection has tripped"],
    checks:["1. Check motor parameters in drive — rated kW, voltage, current (FLA), Hz, RPM must match motor nameplate exactly. If FLA is set too low, the drive trips at normal load.","2. Check actual load — is the hoist being used above its SWL? The drive OL is a motor protection device, not an overload limiter.","3. Check brake is fully releasing — brake drag forces the motor to draw excess current, tripping the OL.","4. Review duty cycle — too many starts per hour will trip the electronic OL even at rated load.","5. Check motor for developing fault — a winding starting to break down draws higher than normal current before failing completely."],
    diag:"brake_rectifier",
  },

  // ── THREE NEW FAULT NODES (GAP 6 from review) ─────────────
  limit_early:{id:"limit_early",type:"result",loler:false,title:"Upper Limit Activating Too Early",
    findings:["Upper limit switch operates before hook reaches top of travel"],
    checks:["1. On ROTARY/CAM limit switches (Demag DR, most rope hoists): the cut-out cam position needs adjusting. With supply isolated and locked off, manually wind the hoist drum slowly toward the cut-out point and identify which cam operates the cut-out switch. The cam can usually be rotated on the shaft to change the cut-out position — consult the hoist maintenance manual for the specific adjustment procedure.","2. If a ROPE HAS BEEN RESOCKETED: the rope length has changed and the drum position for hook-at-top is different. The limit switch cut-out position must be re-set to match the new rope arrangement. Re-setting and testing after any rope work is a LOLER duty.","3. On GRAVITY/WEIGHT limits (Demag DC chain, most chain hoists): check the weight is hanging correctly on the lever and is not fouled on any structure or chain guide. A weight that catches on anything before the hook reaches the top will trip the limit early.","4. Check the slow-down limit (if fitted) — if the slow-down limit cam is out of adjustment it may be activating the cut-out switch instead of the slow-down switch.","5. After any adjustment: test limit switch operation from slow speed with NO LOAD before returning to service. Document the adjustment in the equipment log."],
    warning:"Never increase the cut-out position beyond the manufacturer's maximum hook height. The upper limit switch must stop the hook before it contacts the hoist body."
  },
  brake_power_loss:{id:"brake_power_loss",type:"result",loler:true,title:"Load Drops or Brake Fails on Power Loss",
    findings:["Load moves or drops when power is removed or on emergency stop"],
    checks:["1. This should NOT happen on a correctly functioning hoist. Spring-applied brakes are designed to hold rated load when de-energised. If a load moves on power loss, the brake has failed to apply — this is a LOLER Regulation 9 defect.","2. Check brake coil is actually de-energising on power loss. On DC-side switched brakes: confirm the DC switching contact opens when the contactor drops out. A welded DC switch contact holds the brake off even with the motor contactor open.","3. On AC-side switched brakes: the brake supply is removed when the motor contactor opens. However, if the motor is regenerating (lowering under gravity), back-EMF from the motor can feed through the rectifier and hold the brake partially released. This is why DC-side switching is the correct method.","4. Check brake spring condition — springs weaken over time. If springs lack force, the brake may hold at rest but fail to hold when the load is in motion (dynamic braking failure).","5. On VFD hoists: check the brake control relay output function — the VFD should close the brake (de-energise the brake relay) before the output frequency reaches zero. If brake timing is wrong, the brake tries to hold a still-moving motor."],
    warning:"⚠ LOLER REGULATION 9 DEFECT. A brake that fails to hold on power loss is an immediate danger of injury or death from a dropped load. Take the hoist out of service immediately. Do not return to service until the brake system is fully repaired, tested under load, and documented."
  },
  unusual_noise:{id:"unusual_noise",text:"When does the noise occur?",type:"question",options:[
    {label:"Grinding or dragging on lift/lower — brake area",next:"noise_brake"},
    {label:"Rumbling or whining from gearbox area",next:"noise_gearbox"},
    {label:"Clicking, slapping or irregular noise — rope/chain",next:"noise_rope"},
    {label:"Electrical hum or buzz from panel or motor",next:"noise_electrical"},
  ]},
  noise_brake:{id:"noise_brake",type:"result",loler:false,title:"Brake Area Noise",
    findings:["Grinding, dragging or squealing from brake area on movement"],
    checks:["1. Brake not fully releasing — measure DC voltage at brake coil during operation. Low or no DC = brake dragging against rotating disc while motor runs.","2. Worn brake disc — disc surface becomes grooved or uneven. Noise is grinding/metallic. Mechanical inspection required with supply isolated.","3. Contaminated brake disc — oil or grease on disc surface produces squealing. Source must be found — gearbox seal failure is common.","4. Brake housing bolts loose — brake body can vibrate against hoist casing. Check all fasteners.","5. Conical rotor (Demag KB type) — worn brake ring produces drag noise on every start and stop. Motor must be disassembled to replace."],
    diag:"brake_rectifier",
    warning:"Brake noise on every start or stop indicates the brake is not releasing or applying cleanly. This will cause motor overheating and accelerated brake wear. Investigate promptly."
  },
  noise_gearbox:{id:"noise_gearbox",type:"result",loler:false,title:"Gearbox Noise",
    findings:["Rumbling, whining or knocking from gearbox area"],
    checks:["1. Check gearbox oil level — low oil causes gear whine and rapid bearing wear. Check oil level/sight glass per manufacturer instructions.","2. Listen for pattern — whine that changes with speed = gear mesh fault. Irregular knocking = bearing fault or loose internal component.","3. Check for oil leaks at gearbox seals — leaking oil contaminates brake and other components.","4. This is a mechanical fault — stop using the hoist under load until investigated by a mechanical engineer.","5. If noise developed suddenly: suspect bearing failure or gear tooth damage. Do not continue operating."],
    warning:"A gearbox making new or worsening noise should be taken out of service for mechanical investigation. Gearbox failure under load can cause uncontrolled load movement."
  },
  noise_rope:{id:"noise_rope",type:"result",loler:false,title:"Rope or Chain Noise",
    findings:["Clicking, slapping, rattling or irregular noise from rope/chain area"],
    checks:["1. Rope clicking or slapping: rope is jumping on the drum or through a guide. Check rope is wound evenly on drum — no crossed layers or loose wraps.","2. Chain slapping: chain not meshing smoothly with pocket wheel/sprocket. Check chain lubrication and wear against manufacturer specification.","3. Hook block noise: sheave bearing worn, hook bearing dry. Rotate hook and sheave by hand (isolated) — should move smoothly.","4. Inspect rope and chain for damage — see rope/chain condemnation guidance in this app.","5. Limit switch weight dragging on chain (Demag DC type) — weight should hang freely on the chain guide rod."],
    warning:"Inspect rope or chain carefully before continuing operation. An unusual noise from the lifting medium should be treated as a potential defect until proven otherwise."
  },
  noise_electrical:{id:"noise_electrical",type:"result",loler:false,title:"Electrical Hum or Buzz",
    findings:["Electrical hum, buzz, or clicking from panel, motor or brake"],
    checks:["1. Contactor buzzing — coil supply voltage low or hold-in contact intermittent. See Contactor Chattering fault path.","2. Motor humming without rotating — phase loss. Measure all three phase voltages at motor terminals immediately.","3. Brake buzzing — AC supply reaching DC brake coil. Measure DC at brake coil terminals (should be DC, not AC reading).","4. Transformer hum — slight hum from control transformer is normal. Loud hum indicates overload or loose laminations.","5. VFD switching noise — a high-frequency whine from VFD output is normal. Low-frequency hum from motor on VFD = check carrier frequency parameter."],
    diag:"contactor_coil"
  },
  // ── TRIAGE — "what have you got" entry point ─────────────
  triage:{id:"triage",text:"What type of hoist are you working on?",type:"question",options:[
    {label:"⛓️ Chain hoist (pendant hangs from hoist body, no rope drum)",next:"triage_chain"},
    {label:"🪢 Rope hoist (wire rope on a drum, usually larger unit)",next:"root"},
    {label:"Not sure — just show me symptoms",next:"root"},
  ]},
  triage_chain:{id:"triage_chain",text:"How is the chain hoist controlled?",type:"question",options:[
    {label:"DOL or two-speed — contactors in a panel or inside the hoist body",next:"root"},
    {label:"VFD controlled — drive display visible on hoist or panel",next:"root"},
    {label:"Integrated electronics — no separate panel, controls built into hoist",next:"triage_integrated"},
  ]},
  triage_integrated:{id:"triage_integrated",type:"result",loler:false,title:"Integrated Electronics — No Separate Panel",
    findings:["Chain hoist with electronics built into the hoist body — no external contactor panel"],
    checks:["This type of hoist (common on Demag DC-Pro, Kito ER2, Yale CPV and similar) has its control electronics inside the hoist cover rather than in a separate panel enclosure.","1. Look for a small display, LED indicators, or a label on the underside of the hoist body — this may show fault codes or operating status.","2. The control supply and motor wiring connect through a service cover or cable entry point on the hoist body.","3. The same fundamental circuit principles apply: supply → E-stop → limit switches → control electronics → motor + brake. The components are just in different physical locations.","4. To access the control electronics: the service or electrical cover must be removed with supply ISOLATED AND LOCKED OFF.","5. Use the symptom-based fault tree below — start with 'What is the symptom?' The diagnostic logic is the same regardless of where the electronics are housed."],
    warning:"Wait a minimum of 3 minutes after isolating before opening any service cover — internal capacitors hold charge on some integrated electronic hoists."
  },

  // ── SLIP CLUTCH ACTIVE ───────────────────────────────────
  slip_active:{id:"slip_active",type:"result",loler:false,title:"Slip Clutch Active — Motor Running, Chain Not Moving",
    findings:["Motor is running (audible, hoist body vibrating or fan visible spinning)","Chain is stationary — not moving in either direction","No electrical fault code — contactors appear in, supply present"],
    checks:["1. FIRST: reduce the load completely. Test with no load. If the chain feeds correctly with no load, the hoist was overloaded. Confirm rated SWL and re-test at rated load before concluding the clutch is faulty.","2. Confirm the brake is releasing: listen for the brake clack (audible click from hoist body) on power-up. No clack = brake not releasing. Go to 'Brake Not Releasing' instead — the symptom is similar but the cause is different.","3. Confirm all 3 phases are present at the motor terminals. Phase loss causes the motor to draw very high current on two phases without freely rotating — this mimics a clutch slip symptom. Measure phase-to-phase voltages while the direction button is held in.","4. Confirm the motor is actually turning freely: observe the motor fan through the guard, or feel for vibration. If the motor is humming but the body is not vibrating freely, the motor itself may be seized or the brake is still on.","5. If all electrical checks pass (phases correct, brake releasing, motor turning, current present) and chain still won't move: this is a mechanical slip clutch issue. The electrical path is correct.","6. Take the hoist out of service if the clutch trips at or below rated SWL with no load applied — this indicates the clutch trip torque has drifted and the hoist cannot lift its rated load safely."],
    warning:"Do not operate the hoist repeatedly if the clutch is slipping. Allow minimum 20 minutes cool-down between test attempts. Repeated slip without cool-down causes thermal damage to the clutch lining."
  },

  // ── PHASE ROTATION ───────────────────────────────────────
  phase_rotation:{id:"phase_rotation",text:"Is this hoist DOL / two-speed, or VFD controlled?",type:"question",options:[
    {label:"DOL or two-speed — direct contactor control",next:"phase_rotation_dol"},
    {label:"VFD controlled",next:"phase_rotation_vfd"},
  ]},
  phase_rotation_dol:{id:"phase_rotation_dol",type:"result",loler:false,title:"Phase Rotation Wrong — DOL / Two-Speed Hoist",
    findings:["Hoist direction is reversed — pressing UP lowers the load, pressing DOWN raises it"],
    checks:["1. ISOLATE SUPPLY AND LOCK OFF before doing anything to the supply connections.","2. At the main isolator or supply terminals (NOT at the motor or contactor), swap any two of the three phase conductors. Convention: swap L2 and L3. This reverses the phase sequence presented to the motor, reversing motor rotation.","3. DO NOT swap phases at the motor terminals or inside the panel — swap at the incoming supply point (isolator input terminals) to correct the sequence for the whole installation.","4. After swapping, re-energise and test both UP and DOWN directions with NO LOAD at slow speed.","5. Re-test the upper limit switch — confirm it stops upward travel at the correct position.","6. Document the change: note that phase rotation was corrected and the L2/L3 supply conductors were transposed."],
    warning:"Always isolate and lock off before touching supply connections. Confirm correct direction with no load before applying any load. Re-test all limit switches after correcting phase rotation."
  },
  phase_rotation_vfd:{id:"phase_rotation_vfd",type:"result",loler:false,title:"Phase Rotation — VFD Controlled Hoist",
    findings:["Direction may appear incorrect on VFD hoist"],
    checks:["1. VFD hoists correct for phase rotation internally — the drive rectifies incoming AC to DC then synthesises its own output frequency. The motor direction is determined by the drive's internal UP/DOWN command logic, not by the incoming phase sequence.","2. If direction is reversed on a VFD hoist: the fault is in the UP/DOWN command wiring to the drive, a drive parameter (motor rotation direction parameter — check the drive manual), or the physical motor cable connections at the drive output terminals.","3. DO NOT swap phases at the incoming supply to fix direction on a VFD hoist — this will not change motor direction and may affect other equipment on the same supply.","4. Check the drive display: run in the UP direction and observe whether the drive is commanding forward or reverse frequency. Compare with the motor rotation direction parameter in the drive settings.","5. If motor cable connections at the drive output are suspected (e.g. after a motor cable replacement): with supply isolated, swap two of the three motor cable cores at the drive OUTPUT terminals (not the input)."],
    warning:"Never swap phases at the VFD input to correct motor direction. The VFD input phase sequence does not determine motor rotation direction on a properly configured drive."
  },

  // ── CHAIN JAM / FEED FAULT ───────────────────────────────
  chain_jam:{id:"chain_jam",type:"result",loler:false,title:"Chain Won't Feed / Chain Jam",
    findings:["Chain is blocked, jammed, or not feeding correctly through the hoist"],
    checks:["1. STOP IMMEDIATELY and ISOLATE. Do not attempt to power through a chain jam — continued operation with a jammed chain risks chain breakage, sprocket damage, and chain bag rupture.","2. Check whether the motor is running (fan turning, body vibrating) or stalled. If stalled: the drive or OLR will trip on overcurrent. If running with no chain movement: suspect slip clutch active — see 'Slip Clutch Active' fault path.","3. ELECTRICALLY CONFIRM: With supply isolated, manually rotate the motor fan/shaft if accessible. The motor should turn with moderate resistance from the brake spring. If it won't turn at all: gearbox or drive seizure — mechanical investigation required.","4. Common causes of chain jam (investigate with supply isolated):\n   • Chain twisted — particularly on multi-fall (2/1) arrangements after a load swing or incorrect chain replacement\n   • Foreign object in chain guide or sprocket area\n   • Chain weld orientation incorrect after chain replacement (weld link should be oriented outward over the sprocket on most brands)\n   • Chain out of the sprocket pockets — jumped off sprocket due to shock load\n   • Chain bag full or chain tangled in the collector box\n   • Chain stretched beyond wear limit causing irregular pitch and skipping on sprocket","5. If chain appears undamaged and moves freely by hand after clearing the jam: check the electrical path is complete before re-energising (limit switches correct, no broken wires in chain area).","6. After any chain jam event: inspect the chain for kinks, twisted links, cracked links, and damage at the jam point before returning to service."],
    warning:"Never attempt to clear a chain jam with supply energised. Inspect the chain for damage at the jam point. If any chain damage is found, take out of service — a damaged chain link is a LOLER defect."
  },

  // ── PENDANT CONNECTOR FAULT ──────────────────────────────
  pendant_connector:{id:"pendant_connector",type:"result",loler:false,title:"Pendant Connector Fault",
    findings:["Pendant appears dead or intermittent — check connector before testing cable cores"],
    checks:["1. CHECK THE CONNECTOR FIRST. The pendant connector (where the pendant plugs into the hoist or festoon) is the single most common cause of pendant faults. Inspect before opening the pendant or tracing cable cores.","2. Visual check: Is the connector fully mated? Is the locking ring or spring clip fully engaged? A connector that looks plugged in but is not fully seated will give intermittent or complete loss of function.","3. Inspect the connector pins (male) and sockets (female) for:\n   • Corrosion — green, white, or brown oxidation on pin surfaces. Common on outdoor, washdown, and coastal sites.\n   • Bent or pushed-back pins — a pin that has been pushed back into the housing will not make contact\n   • Missing or damaged O-ring seal — allows moisture ingress, causing corrosion internally\n   • Foreign matter — swarf, grease, or water in the connector body","4. If corrosion is visible: try cleaning pins with a dry cloth or contact cleaner. Reconnect and test. If function restores, confirm operation over several cycles.","5. If a bent pin is found: do not attempt to operate. A deformed pin can short adjacent pins on connection. Repair or replace the connector.","6. If connector appears clean and fully mated but pendant is still dead: disconnect at both ends and test cable core continuity pin-by-pin. The break point is usually where the cable enters the pendant body at the strain relief, or adjacent to the connector at the hoist end.","7. Document which pins/cores failed — this speeds up cable repair or spare pendant identification."],
    diag:"estop_circuit",
  },

  // ── RCD / RCCB NUISANCE TRIPPING ────────────────────────
  rcd_trip:{id:"rcd_trip",type:"result",loler:false,title:"RCD / RCCB Tripping — Nuisance Trip on VFD Hoist",
    findings:["RCD or RCCB trips on or shortly after energising a VFD-controlled hoist","No trip on DOL hoists or other equipment on the same distribution"],
    checks:["1. This is a very common issue on VFD hoist installations and is usually NOT a fault with the hoist. VFD output produces high-frequency switching (typically 2–16 kHz carrier frequency) which generates earth leakage current through motor cable and motor winding capacitance to earth. Standard 30mA RCDs detect this as a fault and trip.","2. CONFIRM IT'S NUISANCE: Disconnect the motor cables at the VFD output terminals (supply isolated, locked off). Re-energise the VFD only (no motor connected). If the RCD holds: the leakage is in the motor cables or motor. If the RCD still trips with no motor connected: the VFD itself is the leakage source.","3. CORRECT PROTECTION DEVICE: Standard Type AC or Type A RCDs are not suitable for VFD installations. The correct device is a Type B RCD (detects AC, pulsed DC, and smooth DC leakage components) or a Type F for some applications. If the existing protection is Type AC or Type A, replacement with the correct type is the fix — not fault-finding the hoist.","4. CHECK CABLE SCREENING: Unscreened motor cables on VFD installations radiate high-frequency leakage. If the existing cable is unscreened, adding a screened cable (SY or CY type) bonded at both ends reduces leakage significantly.","5. CHECK CABLE LENGTH: Earth leakage current is proportional to cable length and capacitance. Very long runs (>50m) between VFD and motor increase leakage. VFD manufacturers publish maximum cable length specifications — if exceeded, output reactors (du/dt filters) are required.","6. If it is a genuine earth fault (megger test below 1MΩ phase-to-earth): investigate motor and cable insulation per the normal earth fault procedure."],
    diag:"motor_terminals",
    warning:"Do not disable or bypass an RCD to resolve a nuisance trip. Identify the correct device type and fit it. A Type AC RCD on a VFD installation is wrong equipment for the application — the RCD is doing its job correctly, it's just the wrong type."
  },

  // ── MOTORISED TROLLEY DEAD ───────────────────────────────
  trolley_dead:{id:"trolley_dead",text:"Does the hoist itself work normally?",type:"question",options:[
    {label:"Yes — hoist lifts and lowers correctly, only trolley travel is dead",next:"trolley_only_dead"},
    {label:"Both hoist and trolley are dead",next:"dead_all"},
  ]},
  trolley_only_dead:{id:"trolley_only_dead",text:"Any response from trolley at all — contactor click, motor hum?",type:"question",options:[
    {label:"No response at all — completely silent",next:"trolley_no_power"},
    {label:"Contactor clicks in but trolley won't move",next:"trolley_contactor_in"},
    {label:"One direction only",next:"trolley_one_dir"},
  ]},
  trolley_no_power:{id:"trolley_no_power",type:"result",loler:false,title:"Motorised Trolley — No Power",
    findings:["Trolley travel circuit completely dead — no click, no hum, no response"],
    checks:["1. Check the trolley travel fuse or MCB in the panel. Trolley travel circuits are often on a separate fuse from the hoist — typically a smaller rating (4–10A). Check continuity of fuse with supply isolated.","2. Check the pendant wiring for travel functions. On many cranes the travel buttons share the pendant cable with hoist functions but on separate cores. Disconnect at panel end and test continuity of the travel button cores.","3. Check the travel direction contactor supply. The travel control circuit draws from the same control transformer as the hoist — verify control voltage is present at the travel contactor coil terminals.","4. Check travel limit switches (end-of-travel buffers). Most motorised trolleys have end-of-travel limit switches in the NC circuit of each travel direction. If the trolley is at one end of travel, the corresponding limit switch may be held open. Try commanding the opposite direction first.","5. If the trolley circuit is entirely separate from the hoist panel: check the trolley panel for power, check any junction box between the pendant and trolley motor for loose connections."],
    diag:"control_circuit",
  },
  trolley_contactor_in:{id:"trolley_contactor_in",type:"result",loler:false,title:"Trolley Contactor In — No Movement",
    findings:["Travel contactor energises but trolley won't move"],
    checks:["1. Check brake release on trolley motor (if fitted — not all trolleys have a dedicated brake). Same DC rectifier principle as hoist brake. Measure DC at trolley brake coil during operation.","2. Check phase voltages at trolley motor terminals while contactor is in. Phase loss pattern identical to hoist motor diagnosis — check all three phase-to-phase readings.","3. Check for mechanical obstruction: beam flange clearance too tight, wheel jammed, beam profile obstruction. With supply isolated, attempt to push trolley by hand — it should move with moderate resistance.","4. Check wheel condition: a seized or flat-spotted wheel locks under load even if the motor is running."],
    diag:"motor_terminals",
  },
  trolley_one_dir:{id:"trolley_one_dir",type:"result",loler:false,title:"Trolley Travel — One Direction Only",
    findings:["Motorised trolley travels in one direction but not the other"],
    checks:["1. Check the travel end-of-travel limit switch for the dead direction. If the trolley has reached the end of its travel range (or the limit switch is mis-set), the limit holds open and prevents travel in that direction. Try commanding travel away from the limit first.","2. The NC auxiliary contact of the working-direction contactor may be stuck open — identical principle to the hoist UP/DOWN interlock. Test continuity on the NC auxiliary of the travel contactor for the direction that works (isolated). Should show continuity when that contactor is de-energised.","3. Check pendant wiring — test continuity of the dead-direction travel button core at the panel terminals.","4. Check the dead-direction contactor coil — measure supply voltage at coil A1 while pressing the dead-direction button. If supply voltage (48V or 110V) is present but no pull-in: measure coil resistance with supply isolated (open circuit = burnt coil)."],
    diag:"contactor_interlock",
  },

  hook_drift_up:{id:"hook_drift_up",type:"result",loler:false,title:"Hook Drifts UP After Stopping",
    findings:["After releasing the UP button, hook continues to rise briefly or intermittently"],
    checks:["1. This is most commonly caused by AC-side brake switching on a hoist where the motor is generating during deceleration. When the contactor opens to stop the motor, the decelerating motor acts as a generator and feeds current back through the brake rectifier, keeping the brake partially released during coast-down. The motor overspeeds slightly before the brake grabs.","2. Confirm the brake switching method: look at the brake circuit on the schematic. If the brake supply is taken before the rectifier and is switched at AC (i.e., from the motor contactor output), this is AC-side switching. DC-side switching (a separate contact or relay in the DC circuit after the rectifier) is the correct method for hoists and eliminates this problem.","3. Check brake response time — Demag forced-voltage rectifiers (GP/GS/GE) apply 2× normal DC briefly to accelerate release and then reduce to holding voltage. On stop they should cut DC rapidly. If the hold-down time is too long, the brake is late to apply.","4. On VFD hoists: check the brake close delay parameter. If set too long, the brake doesn't apply until the motor has already decelerated past standstill, allowing slight upward drift on stopping.","5. Check brake coil discharge time — if there's no freewheeling/suppression diode across the DC brake coil, the coil stores magnetic energy on de-energisation and the brake applies slowly."],
    diag:"brake_rectifier",
    warning:"Upward drift on stopping, even slight, indicates a brake timing or switching problem. On a hoist carrying a load, this could cause the load to contact structure above. Investigate and rectify before returning to service."
  },
};

// ── OUTCOME MAP ──────────────────────────────────────────────
// status: "live" = initial voltage checks with supply ON acceptable
//         "isolate" = must isolate before hands-on work
//         "oos" = hoist out of service, do not operate
//         "mechanical" = electrical path is clear, refer to mechanical
const OUTCOME_MAP={
  fix_estop_pressed:   {status:"live",       label:"Reset E-stop and verify supply is restored before any hands-on work"},
  vfd_uv:              {status:"live",       label:"Check live supply voltage to drive input — no hands-on work on live terminals"},
  vfd_ov:              {status:"live",       label:"Check live — monitor DC bus voltage and braking resistor with meter"},
  vfd_oh:              {status:"live",       label:"Check live — inspect ventilation, ambient temp, and drive load"},
  rcd_trip:            {status:"live",       label:"Check live supply quality and RCD type before isolating for insulation tests"},
  fix_no_incoming:     {status:"isolate",    label:"Isolate upstream supply before working on incoming conductors"},
  fix_isolator_fault:  {status:"isolate",    label:"Isolate upstream before replacing or working on main isolator"},
  fix_fuse_blown:      {status:"isolate",    label:"Isolate and lock off before replacing fuse or breaker"},
  fix_transformer:     {status:"isolate",    label:"Isolate before inspecting transformer and secondary fuse"},
  fix_pendant_fuse:    {status:"isolate",    label:"Isolate before tracing control circuit and pendant wiring"},
  up_only_fault:       {status:"isolate",    label:"Isolate before tracing UP direction circuit"},
  fix_motor_fault:     {status:"isolate",    label:"Isolate and lock off before motor or cable testing"},
  down_only_fault:     {status:"isolate",    label:"Isolate before tracing DOWN direction circuit"},
  down_contactor_ok:   {status:"isolate",    label:"Isolate before checking motor, brake, and mechanical path"},
  one_dir:             {status:"isolate",    label:"Isolate before tracing direction circuit and contactor wiring"},
  trip_main:           {status:"isolate",    label:"Identify fault cause before resetting — isolate to inspect wiring"},
  trip_olr:            {status:"isolate",    label:"Isolate before checking motor current draw and OLR setting"},
  trip_safety:         {status:"isolate",    label:"Isolate before tracing safety circuit — find root cause before reset"},
  motor_hot:           {status:"isolate",    label:"Isolate — allow motor to cool before measuring resistance or inspecting"},
  brake_no_release:    {status:"isolate",    label:"Isolate and lock off before brake coil or rectifier testing"},
  contactor_chatter:   {status:"isolate",    label:"Isolate before contactor coil resistance and contact inspection"},
  vfd_oc:              {status:"isolate",    label:"Isolate — check motor cables and motor windings before resetting drive"},
  vfd_gf:              {status:"isolate",    label:"Isolate and lock off — 500V megger test of motor cables required"},
  vfd_sto:             {status:"isolate",    label:"Isolate before tracing STO input wiring and safety relay"},
  vfd_ol:              {status:"isolate",    label:"Isolate before checking motor and adjusting drive overload parameters"},
  limit_early:         {status:"isolate",    label:"Isolate before adjusting or replacing limit switch"},
  noise_brake:         {status:"isolate",    label:"Isolate before brake mechanical inspection — may need fitter support"},
  noise_electrical:    {status:"isolate",    label:"Isolate before tracing electrical noise source"},
  triage_integrated:   {status:"isolate",    label:"Isolate and lock off, wait 3 min before opening hoist cover"},
  slip_active:         {status:"isolate",    label:"Isolate to confirm electrical path is complete, then refer to mechanical"},
  phase_rotation_dol:  {status:"isolate",    label:"Isolate before swapping phases at supply point"},
  phase_rotation_vfd:  {status:"isolate",    label:"Isolate before adjusting motor rotation direction in drive parameters"},
  chain_jam:           {status:"isolate",    label:"Isolate immediately — never attempt to power through a chain jam"},
  pendant_connector:   {status:"isolate",    label:"Isolate before inspecting pendant connector pins and wiring"},
  trolley_no_power:    {status:"isolate",    label:"Isolate before tracing trolley supply conductors"},
  trolley_contactor_in:{status:"isolate",    label:"Isolate before checking trolley motor and mechanical drive"},
  trolley_one_dir:     {status:"isolate",    label:"Isolate before tracing trolley direction circuit"},
  hook_drift_up:       {status:"isolate",    label:"Isolate before tracing upper limit circuit and brake timing"},
  brake_no_hold:       {status:"oos",        label:"LOLER Reg 9 — hoist must not be operated until brake is repaired and tested"},
  brake_power_loss:    {status:"oos",        label:"LOLER Reg 9 — brake failure on power loss. Do not operate. Mechanical inspection required"},
  fix_mechanical:      {status:"mechanical", label:"Electrical path is clear — refer to mechanical engineer or fitter"},
  noise_gearbox:       {status:"mechanical", label:"Electrical path is clear — gearbox inspection required by mechanical engineer"},
  noise_rope:          {status:"mechanical", label:"Electrical path is clear — inspect rope or chain condition before re-use"},
};

const OUTCOME_CONFIG={
  live:      {col:GREEN,  icon:"⚡", label:"INITIAL CHECK — SUPPLY ON"},
  isolate:   {col:AMBER,  icon:"🔒", label:"ISOLATE BEFORE HANDS-ON WORK"},
  oos:       {col:RED,    icon:"🛑", label:"OUT OF SERVICE — DO NOT OPERATE"},
  mechanical:{col:BLUE,   icon:"🔧", label:"REFER TO MECHANICAL"},
};

function OutcomeBanner({nodeId}){
  const outcome=OUTCOME_MAP[nodeId];
  if(!outcome) return null;
  const cfg=OUTCOME_CONFIG[outcome.status];
  return(
    <div style={{background:cfg.col+"18",border:`2px solid ${cfg.col}`,borderRadius:6,padding:"10px 13px",marginBottom:12,display:"flex",gap:10,alignItems:"flex-start"}}>
      <span style={{color:cfg.col,fontSize:18,flexShrink:0,lineHeight:1}}>{cfg.icon}</span>
      <div>
        <div style={{color:cfg.col,fontSize:10,fontWeight:700,letterSpacing:"0.12em",marginBottom:3}}>{cfg.label}</div>
        <div style={{color:"#C5C9D9",fontSize:12,lineHeight:1.55}}>{outcome.label}</div>
      </div>
    </div>
  );
}

function ModIcon({id}){
  const icons={
    m1:<polygon points="13,2 7,11 12,11 9,20 15,11 10,11" fill={AMBER}/>,
    m2:<><path d="M5 11 A6 6 0 1 1 17 11" fill="none" stroke={AMBER} strokeWidth="2.5" strokeLinecap="round"/><polygon points="4,8 4,14 8,11" fill={AMBER}/></>,
    m3:<><line x1="3" y1="11" x2="8" y2="11" stroke={AMBER} strokeWidth="2"/><line x1="14" y1="11" x2="19" y2="11" stroke={AMBER} strokeWidth="2"/><line x1="8" y1="7" x2="14" y2="14" stroke={AMBER} strokeWidth="2" strokeLinecap="round"/></>,
    m4:<path d="M3 12 Q5 7 7.5 12 Q10 17 12 12 Q14 7 16.5 12 Q19 17 19 12" fill="none" stroke={AMBER} strokeWidth="2" strokeLinecap="round"/>,
    m5:<><rect x="7" y="9" width="8" height="7" rx="1.5" fill="none" stroke={AMBER} strokeWidth="1.5"/><line x1="11" y1="5" x2="11" y2="9" stroke={AMBER} strokeWidth="2"/><circle cx="11" cy="5" r="1.5" fill={AMBER}/><circle cx="9" cy="12.5" r="1.2" fill={AMBER}/><circle cx="13" cy="12.5" r="1.2" fill={AMBER}/></>,
    m6:<><rect x="3" y="9.5" width="16" height="3.5" rx="1.5" fill={AMBER}/><rect x="9" y="4" width="4" height="5.5" rx="1" fill={AMBER}/></>,
    m7:<><circle cx="11" cy="11" r="7" fill="none" stroke={AMBER} strokeWidth="1.5"/><circle cx="11" cy="11" r="3" fill="none" stroke={AMBER} strokeWidth="2.5"/><line x1="4" y1="11" x2="8" y2="11" stroke={AMBER} strokeWidth="1.5"/><line x1="14" y1="11" x2="18" y2="11" stroke={AMBER} strokeWidth="1.5"/></>,
    m8:<path d="M2 11 Q5 4 8 11 Q11 18 14 11 Q17 4 20 11" fill="none" stroke={AMBER} strokeWidth="2" strokeLinecap="round"/>,
    m9:<><path d="M11 2 L18 5.5 V12 Q18 17 11 20.5 Q4 17 4 12 V5.5 Z" fill="none" stroke={AMBER} strokeWidth="1.5"/><path d="M7 11 L10 14 L15 8" fill="none" stroke={AMBER} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></>,
    m10:<><rect x="5" y="2" width="12" height="18" rx="2" fill="none" stroke={AMBER} strokeWidth="1.5"/><line x1="8" y1="7" x2="14" y2="7" stroke={AMBER} strokeWidth="1.5"/><line x1="8" y1="11" x2="14" y2="11" stroke={AMBER} strokeWidth="1.5"/><line x1="8" y1="15" x2="11" y2="15" stroke={AMBER} strokeWidth="1.5"/></>,
    m11:<><rect x="2" y="8" width="8" height="6" rx="3" fill="none" stroke={AMBER} strokeWidth="2"/><rect x="12" y="8" width="8" height="6" rx="3" fill="none" stroke={AMBER} strokeWidth="2"/><line x1="10" y1="11" x2="12" y2="11" stroke={AMBER} strokeWidth="2.5"/></>,
  };
  return(
    <svg width="22" height="22" viewBox="0 0 22 22" style={{flexShrink:0}}>
      <rect width="22" height="22" rx="4" fill={PANEL2}/>
      {icons[id]||<circle cx="11" cy="11" r="6" fill="none" stroke={AMBER} strokeWidth="1.5"/>}
    </svg>
  );
}

// ── DASHBOARD ────────────────────────────────────────────────

function Dashboard({progress,onNavigate,onIsolation,onOOS,onPre,onProbe,onPanel,onVFD,onComp,onRope,onLoad,onClutch}){
  const completed=Object.keys(progress).filter(k=>progress[k]?.quizPassed).length;
  const started=Object.keys(progress).some(k=>progress[k]?.started);
  const pct=Math.round((completed/MODULES.length)*100);
  return(
    <div>
      {/* First-time user banner */}
      {!started&&(
        <div style={{background:"#0a1220",border:`2px solid ${BLUE}`,borderRadius:8,padding:14,marginBottom:12,display:"flex",alignItems:"flex-start",gap:12}}>
          <span style={{fontSize:22,flexShrink:0}}>👋</span>
          <div>
            <div style={{color:BLUE,fontWeight:700,fontSize:13,marginBottom:4}}>New here? Start with the Fault Finder.</div>
            <div style={{color:"#93C5FD",fontSize:12,lineHeight:1.55,marginBottom:10}}>Got a hoist on site that won't work? Tell it the symptom and it walks you through the diagnosis. Or use the Learn section to build your knowledge before your next job.</div>
            <button style={{...S.btn("primary"),fontSize:12}} onClick={()=>onNavigate("fault")}>🔍 Start Diagnosis →</button>
          </div>
        </div>
      )}

      {/* Fault Finder — primary hero card */}
      <div style={{...S.card,cursor:"pointer",borderColor:BLUE,border:`2px solid ${BLUE}`,background:"#060d1a",padding:16,marginBottom:12}} onClick={()=>onNavigate("fault")}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,flexWrap:"wrap"}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <span style={{fontSize:28}}>🔍</span>
            <div>
              <div style={{color:BLUE,fontWeight:700,fontSize:15,marginBottom:3}}>Fault Finder</div>
              <div style={{color:"#93C5FD",fontSize:12,lineHeight:1.5}}>Symptom-led diagnosis with interactive test diagrams.</div>
              <div style={{marginTop:6,display:"flex",gap:6,flexWrap:"wrap"}}>
                <span style={S.tag(BLUE)}>ON SITE</span>
                <span style={S.tag(GREEN)}>21 fault paths</span>
              </div>
            </div>
          </div>
          <button style={{...S.btn("primary"),fontSize:13,padding:"10px 18px",flexShrink:0}} onClick={e=>{e.stopPropagation();onNavigate("fault");}}>Start →</button>
        </div>
      </div>

      {/* Safety procedures bar */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
        <div style={{background:"#2a0800",border:`2px solid ${RED}`,borderRadius:8,padding:12,cursor:"pointer"}} onClick={onIsolation}>
          <div style={{color:RED,fontWeight:700,fontSize:12}}>⚡ Isolation</div>
          <div style={{color:"#F9A8A8",fontSize:10,marginTop:2}}>LOTO · Prove Dead · GS38</div>
        </div>
        <div style={{background:"#2a0800",border:`1px solid ${RED}44`,borderRadius:8,padding:12,cursor:"pointer"}} onClick={onOOS}>
          <div style={{color:RED,fontWeight:700,fontSize:12}}>🛑 Out of Service</div>
          <div style={{color:"#F9A8A8",fontSize:10,marginTop:2}}>LOLER Reg 9 procedure</div>
        </div>
        <div style={{background:"#071a10",border:`1px solid ${GREEN}44`,borderRadius:8,padding:12,cursor:"pointer"}} onClick={onPre}>
          <div style={{color:GREEN,fontWeight:700,fontSize:12}}>✓ Pre-Energisation</div>
          <div style={{color:"#86EFAC",fontSize:10,marginTop:2}}>20-item checklist</div>
        </div>
        <div style={{background:PANEL2,border:`1px solid ${BORDER}`,borderRadius:8,padding:12,cursor:"pointer"}} onClick={onProbe}>
          <div style={{color:AMBER,fontWeight:700,fontSize:12}}>🔬 Probe Technique</div>
          <div style={{color:MUTED,fontSize:10,marginTop:2}}>Live work · one-hand rule</div>
        </div>
      </div>

      {/* Progress card */}
      <div style={S.card}>
        <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:12,flexWrap:"wrap"}}>
          <div>
            <div style={S.h2}>⚡ Hoist Electrical Trainer</div>
            <div style={{color:MUTED,fontSize:11,marginTop:3}}>Field Engineer — Power & Control Systems up to 6T</div>
            <div style={{marginTop:10,display:"flex",gap:7,flexWrap:"wrap"}}>
              <span style={S.tag(AMBER)}>11 Modules</span>
              <span style={S.tag(BLUE)}>7 Diagrams</span>
              <span style={S.tag(GREEN)}>{completed}/{MODULES.length} Done</span>
            </div>
            <div style={{marginTop:8,color:MUTED,fontSize:9,lineHeight:1.6}}>
              SCOPE: Chain &amp; rope hoists · Direct-On-Line (DOL) / two-speed / Variable Frequency Drive (VFD) · up to 6T · electrical diagnosis only.<br/>
              Reference tool — always work under supervision of a competent person.
            </div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:32,fontWeight:700,color:AMBER}}>{pct}%</div>
            <div style={{color:MUTED,fontSize:9,marginBottom:4}}>PROGRESS</div>
            <div style={{...S.prog,width:90}}><div style={S.progFill(pct)}/></div>
          </div>
        </div>
      </div>

      {/* Modules tile */}
      <div style={{...S.card,cursor:"pointer",borderColor:AMBER+"66",background:"#1a1200",padding:14,marginBottom:12,display:"flex",alignItems:"center",gap:12}} onClick={()=>onNavigate("modules")}>
        <span style={{fontSize:24}}>📚</span>
        <div style={{flex:1}}>
          <div style={{color:AMBER,fontWeight:700,fontSize:13,marginBottom:2}}>Learn — Modules & Quizzes</div>
          <div style={{color:MUTED,fontSize:11}}>11 modules covering supply, motors, contactors, brakes, VFDs and more.</div>
        </div>
        <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4,flexShrink:0}}>
          <span style={S.tag(AMBER)}>{completed}/{MODULES.length}</span>
          <div style={{...S.prog,width:70}}><div style={S.progFill(pct)}/></div>
        </div>
      </div>

      {/* Reference section */}
      <div style={S.secTitle()}><span>▸</span> REFERENCE</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:14}}>
        {[
          {icon:"🔍",label:"Component ID",sub:"What things look like",fn:onComp,col:AMBER},
          {icon:"🔴",label:"Drive Fault Codes",sub:"VFD variable-speed drives",fn:onVFD,col:RED},
          {icon:"🏗️",label:"Panel Navigation",sub:"Finding your way around",fn:onPanel,col:BLUE},
          {icon:"⚙️",label:"Slip Clutch Guide",sub:"Chain hoist overload device",fn:onClutch,col:ORANGE},
          {icon:"🧵",label:"Rope & Chain",sub:"Condemnation criteria",fn:onRope,col:ORANGE},
          {icon:"⚖️",label:"Load Test Guide",sub:"When & how to test",fn:onLoad,col:GREEN},
        ].map((item,i)=>(
          <div key={i} style={{...S.card,cursor:"pointer",borderColor:item.col+"44",padding:12}} onClick={item.fn}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontSize:18}}>{item.icon}</span>
              <div>
                <div style={{fontWeight:700,fontSize:12,color:item.col}}>{item.label}</div>
                <div style={{color:MUTED,fontSize:10,marginTop:1}}>{item.sub}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={S.secTitle()}><span>▸</span> MODULE PROGRESS</div>
      {MODULES.map(m=>{
        const done=progress[m.id]?.quizPassed;
        const started=progress[m.id]?.started;
        return(
          <div key={m.id} style={S.modCard(done)} onClick={()=>onNavigate("module",m.id)}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:8}}>
              <div style={{display:"flex",alignItems:"center",gap:9}}>
                <ModIcon id={m.id}/>
                <div>
                  <div style={{fontWeight:700,fontSize:12}}>{m.title}</div>
                  <div style={{color:MUTED,fontSize:10,marginTop:1}}>⏱ {m.duration} · {m.quiz.length}q</div>
                </div>
              </div>
              {done?<span style={S.tag(GREEN)}>✓</span>:started?<span style={S.tag(AMBER)}>…</span>:<span style={S.tag(MUTED)}>–</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ModuleList({progress,onNavigate}){
  return(
    <div>
      <div style={{marginBottom:12}}><button style={S.btn("ghost")} onClick={()=>onNavigate("dashboard")}>← Dashboard</button></div>
      <div style={S.secTitle()}><span>▸</span> ALL MODULES</div>
      {MODULES.map(m=>{
        const done=progress[m.id]?.quizPassed;
        return(
          <div key={m.id} style={S.modCard(done)} onClick={()=>onNavigate("module",m.id)}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:8}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <ModIcon id={m.id}/>
                <div>
                  <div style={{fontWeight:700,fontSize:13}}>{m.title}</div>
                  <div style={{color:MUTED,fontSize:10,marginTop:1}}>{m.duration} · {m.sections.length} sections · {m.quiz.length} questions</div>
                </div>
              </div>
              {done?<span style={S.tag(GREEN)}>✓ PASSED</span>:<span style={{color:AMBER,fontSize:12}}>→</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Module-to-diagram cross-links (Item 6 from review)
const MODULE_DIAGRAMS={
  m2:["contactor_continuity"],
  m3:["contactor_continuity","contactor_coil","contactor_interlock"],
  m5:["control_circuit","estop_circuit"],
  m6:["control_circuit"],
  m7:["brake_rectifier"],
  m8:["estop_circuit","motor_terminals"],
  m11:["brake_rectifier","control_circuit"],
};

// Module-to-related-module cross-links
const MODULE_RELATED={
  m5:{label:"Module 3 — Contactor Logic",id:"m3"},
  m6:{label:"Module 5 — Control Circuit",id:"m5"},
  m7:{label:"Module 2 — Motor Circuits",id:"m2"},
  m8:{label:"Module 7 — Brake Circuit",id:"m7"},
};

function BodyRenderer({text,maxBlocks}){
  const allBlocks=text.split(/\n\n/);
  const blocks=maxBlocks!=null?allBlocks.slice(0,maxBlocks):allBlocks;
  return(
    <div style={S.body}>
      {blocks.map((block,bi)=>{
        const lines=block.split("\n");
        const isList=lines.some(l=>/^[•]\s/.test(l)||/^\d+[.)]\s/.test(l));
        if(isList){
          return(
            <div key={bi} style={{background:PANEL2,border:`1px solid ${BORDER}`,borderRadius:5,padding:"10px 12px",marginBottom:10}}>
              {lines.map((line,li)=>{
                const bm=line.match(/^•\s+(.*)/);
                const nm=line.match(/^(\d+)[.)]\s+(.*)/);
                if(bm) return(
                  <div key={li} style={{display:"flex",gap:8,marginBottom:4,alignItems:"flex-start"}}>
                    <span style={{color:AMBER,flexShrink:0,lineHeight:1.75}}>▸</span>
                    <span style={{color:"#C5C9D9",fontSize:13,lineHeight:1.75}}>{bm[1]}</span>
                  </div>
                );
                if(nm) return(
                  <div key={li} style={{display:"flex",gap:8,marginBottom:4,alignItems:"flex-start"}}>
                    <span style={{color:AMBER,fontWeight:700,fontSize:12,flexShrink:0,minWidth:18,lineHeight:1.75}}>{nm[1]}.</span>
                    <span style={{color:"#C5C9D9",fontSize:13,lineHeight:1.75}}>{nm[2]}</span>
                  </div>
                );
                return line?<div key={li} style={{color:MUTED,fontSize:12,lineHeight:1.5,marginBottom:2}}>{line}</div>:null;
              })}
            </div>
          );
        }
        return <p key={bi} style={{color:"#C5C9D9",fontSize:13,lineHeight:1.75,marginBottom:10,marginTop:0}}>{block}</p>;
      })}
    </div>
  );
}

function ModuleViewer({moduleId,progress,onProgress,onNavigate,simple}){
  const mod=MODULES.find(m=>m.id===moduleId);
  const [view,setView]=useState("learn");
  const [secIdx,setSecIdx]=useState(0);
  const [showFull,setShowFull]=useState(false);
  const [quiz,setQuiz]=useState({answers:{},submitted:false,score:0});
  const modIdx=MODULES.findIndex(m=>m.id===moduleId);
  useEffect(()=>{onProgress(moduleId,{started:true});setSecIdx(0);setView("learn");setQuiz({answers:{},submitted:false,score:0});setShowFull(false);},[moduleId]);
  useEffect(()=>{setShowFull(false);},[secIdx]);
  const section=mod.sections[secIdx];
  const isLast=secIdx===mod.sections.length-1;
  const relatedDiags=MODULE_DIAGRAMS[moduleId]||[];
  const relatedMod=MODULE_RELATED[moduleId];
  function submitQuiz(){
    let score=0;
    mod.quiz.forEach((q,i)=>{if(quiz.answers[i]===q.correct)score++;});
    setQuiz(s=>({...s,submitted:true,score}));
    if(score===mod.quiz.length) onProgress(moduleId,{started:true,quizPassed:true});
  }
  return(
    <div>
      <div style={{marginBottom:12,display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
        <button style={S.btn("ghost")} onClick={()=>onNavigate("modules")}>← Modules</button>
        <span style={{color:MUTED,fontSize:10}}>{modIdx+1}/{MODULES.length}</span>
        <ModIcon id={mod.id}/>
        <span style={{fontWeight:700,fontSize:13}}>{mod.title}</span>
      </div>
      <div style={{display:"flex",gap:7,marginBottom:12}}>
        <button style={S.navBtn(view==="learn")} onClick={()=>setView("learn")}>📖 Learn</button>
        <button style={S.navBtn(view==="quiz")} onClick={()=>setView("quiz")}>❓ Quiz ({mod.quiz.length}q)</button>
        {relatedDiags.length>0&&<button style={S.navBtn(view==="diags")} onClick={()=>setView("diags")}>📐 Diagrams</button>}
      </div>

      {view==="learn"&&(
        <div>
          <div style={{display:"flex",gap:5,marginBottom:10,overflowX:"auto",flexWrap:"nowrap",WebkitOverflowScrolling:"touch",paddingBottom:2}}>
            {mod.sections.map((s,i)=>(
              <button key={i} style={{...S.navBtn(i===secIdx),fontSize:10,padding:"4px 8px",flexShrink:0,whiteSpace:"nowrap"}} onClick={()=>setSecIdx(i)}>
                {i+1}. {s.heading.length>20?s.heading.slice(0,18)+"…":s.heading}
              </button>
            ))}
          </div>
          <div style={S.card}>
            <div style={S.h3}>{section.heading}</div>
            {section.goal&&(
              <div style={{background:"#0a1829",border:`1px solid ${BLUE}33`,borderRadius:5,padding:"8px 11px",marginBottom:10,display:"flex",gap:8,alignItems:"flex-start"}}>
                <span style={{color:BLUE,fontSize:11,flexShrink:0,marginTop:1}}>▸</span>
                <div>
                  <div style={{color:BLUE,fontSize:9,fontWeight:700,letterSpacing:"0.1em",marginBottom:2}}>WHAT YOU ARE TRYING TO PROVE</div>
                  <div style={{color:"#93C5FD",fontSize:12,lineHeight:1.5}}>{section.goal}</div>
                </div>
              </div>
            )}
            {!simple&&<AbbreviationPanel text={`${mod.title}\n${section.heading}\n${section.body}`}/>}
            {simple&&!showFull?(
              <div>
                <BodyRenderer text={section.body} maxBlocks={2}/>
                {section.body.split("\n\n").length>2&&<button style={{...S.btn("ghost"),marginTop:8,fontSize:11,color:AMBER,borderColor:AMBER+"44"}} onClick={()=>setShowFull(true)}>Show full detail ↓</button>}
              </div>
            ):(
              <BodyRenderer text={section.body}/>
            )}
          </div>
          {/* Cross-link to related module */}
          {relatedMod&&isLast&&(
            <div style={{...S.resBox(BLUE),marginTop:10,cursor:"pointer"}} onClick={()=>onNavigate("module",relatedMod.id)}>
              <div style={{color:BLUE,fontSize:10,fontWeight:700,marginBottom:3}}>📚 RELATED MODULE</div>
              <div style={{color:"#C5C9D9",fontSize:12}}>→ {relatedMod.label}</div>
            </div>
          )}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:10}}>
            <button style={S.btn("ghost")} onClick={()=>setSecIdx(i=>Math.max(0,i-1))} disabled={secIdx===0}>← Prev</button>
            <span style={{color:MUTED,fontSize:11}}>{secIdx+1}/{mod.sections.length}</span>
            {isLast?<button style={S.btn("primary")} onClick={()=>setView("quiz")}>Take Quiz →</button>
              :<button style={S.btn("primary")} onClick={()=>setSecIdx(i=>i+1)}>Next →</button>}
          </div>
        </div>
      )}

      {view==="diags"&&(
        <div>
          <div style={{color:MUTED,fontSize:11,marginBottom:12}}>Interactive test diagrams relevant to this module. Tips are shown by default here.</div>
          {relatedDiags.map(d=>(
            <div key={d} style={{marginBottom:16}}>
              <DiagramPanel diagKey={d} defaultShowInfo={true}/>
            </div>
          ))}
        </div>
      )}

      {view==="quiz"&&(
        <div>
          <div style={S.card}>
            <div style={S.h3}>Quiz — {mod.title}</div>
            {mod.quiz.map((q,qi)=>(
              <div key={qi} style={{marginBottom:18}}>
                <div style={{fontWeight:700,marginBottom:9,color:TEXT,lineHeight:1.5,fontSize:13}}>Q{qi+1}: {q.q}</div>
                {q.options.map((opt,oi)=>{
                  const chosen=quiz.answers[qi]===oi,correct=oi===q.correct;
                  let state=null;
                  if(quiz.submitted){if(chosen&&correct)state="correct";else if(chosen&&!correct)state="wrong";else if(correct)state="correct";}
                  else if(chosen) state="selected";
                  return(
                    <button key={oi} style={quiz.submitted?{...S.quizOpt(state),pointerEvents:"none"}:S.quizOpt(state)}
                      onClick={()=>!quiz.submitted&&setQuiz(s=>({...s,answers:{...s.answers,[qi]:oi}}))}>
                      <span style={{color:AMBER,minWidth:18,flexShrink:0}}>{String.fromCharCode(65+oi)}.</span>
                      <span style={{flex:1}}>{opt}</span>
                      {!quiz.submitted&&chosen&&<span style={{color:AMBER}}>✓</span>}
                      {quiz.submitted&&correct&&<span style={{color:GREEN}}>✓</span>}
                      {quiz.submitted&&chosen&&!correct&&<span style={{color:RED}}>✗</span>}
                    </button>
                  );
                })}
                {quiz.submitted&&(
                  <div style={{...S.resBox(BLUE),background:"#0A1829",marginTop:7}}>
                    <div style={{color:BLUE,fontSize:9,fontWeight:700,marginBottom:3,letterSpacing:"0.1em"}}>EXPLANATION</div>
                    <div style={{color:"#C5C9D9",fontSize:12,lineHeight:1.65}}>{q.explanation}</div>
                  </div>
                )}
              </div>
            ))}
            {!quiz.submitted&&(
              <button style={{...S.btn("primary"),marginTop:4}} disabled={Object.keys(quiz.answers).length<mod.quiz.length} onClick={submitQuiz}>
                Submit Answers
              </button>
            )}
            {quiz.submitted&&(
              <div style={S.resBox(quiz.score===mod.quiz.length?GREEN:ORANGE)}>
                <div style={{fontWeight:700,fontSize:14,color:quiz.score===mod.quiz.length?GREEN:ORANGE,marginBottom:5}}>
                  {quiz.score===mod.quiz.length?"✓ PASSED":"✗ Review Required"}
                </div>
                <div style={{color:TEXT,marginBottom:quiz.score<mod.quiz.length?9:0}}>Score: {quiz.score}/{mod.quiz.length}</div>
                {quiz.score<mod.quiz.length&&<button style={S.btn("ghost")} onClick={()=>setQuiz({answers:{},submitted:false,score:0})}>Retry</button>}
              </div>
            )}
          </div>
          <div style={{display:"flex",justifyContent:"space-between",marginTop:10,flexWrap:"wrap",gap:8}}>
            {MODULES[modIdx-1]&&<button style={S.btn("ghost")} onClick={()=>onNavigate("module",MODULES[modIdx-1].id)}>← {MODULES[modIdx-1].title}</button>}
            {MODULES[modIdx+1]&&<button style={S.btn("primary")} onClick={()=>onNavigate("module",MODULES[modIdx+1].id)}>Next →</button>}
          </div>
        </div>
      )}
    </div>
  );
}

// Fault-to-module cross-links (Item 6)
const FAULT_MODULE_LINKS={
  up_only_fault:{id:"m5",label:"Module 5 — Pendant & Control Circuit"},
  down_only_fault:{id:"m5",label:"Module 5 — Pendant & Control Circuit"},
  contactor_chatter:{id:"m3",label:"Module 3 — Contactor Logic"},
  brake_no_release:{id:"m7",label:"Module 7 — Brake Circuit"},
  brake_no_hold:{id:"m7",label:"Module 7 — Brake Circuit"},
  motor_hot:{id:"m7",label:"Module 7 — Brake Circuit"},
  vfd_oc:{id:"m8",label:"Module 8 — Variable Frequency Drive (VFD) Fundamentals"},
  vfd_ov:{id:"m8",label:"Module 8 — Variable Frequency Drive (VFD) Fundamentals"},
  vfd_sto:{id:"m8",label:"Module 8 — Variable Frequency Drive (VFD) Fundamentals"},
  fix_motor_fault:{id:"m2",label:"Module 2 — Motor Circuits"},
  trip_olr:{id:"m2",label:"Module 2 — Motor Circuits"},
  slip_active:{id:"m11",label:"Module 11 — Chain Hoist Electrics"},
  chain_jam:{id:"m11",label:"Module 11 — Chain Hoist Electrics"},
  trolley_no_power:{id:"m11",label:"Module 11 — Chain Hoist Electrics"},
  rcd_trip:{id:"m8",label:"Module 8 — Variable Frequency Drive (VFD) Fundamentals"},
};

function JobSheetBlock({node}){
  const [open,setOpen]=useState(false);
  const [copied,setCopied]=useState(false);
  function buildText(){
    const d=new Date().toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"});
    const findings=node.findings?.map(f=>`  • ${f}`).join("\n")||"";
    const checks=node.checks?.map((c,i)=>`  ${i+1}. ${c}`).join("\n")||"";
    return[
      `HEAD — HOIST ELECTRICAL TRAINER`,
      `Job Sheet — ${d}`,
      ``,
      `FAULT DIAGNOSIS: ${node.title}`,
      findings?`\nFINDINGS:\n${findings}`:"",
      checks?`\nCHECKS & ACTIONS:\n${checks}`:"",
      node.warning?`\nSAFETY NOTE: ${node.warning}`:"",
      ``,
      `Reference tool — always work under supervision of a competent person.`,
    ].filter(l=>l!==null).join("\n");
  }
  function copy(){
    navigator.clipboard.writeText(buildText()).then(()=>{setCopied(true);setTimeout(()=>setCopied(false),2500);});
  }
  return(
    <div style={{marginTop:12}}>
      {!open?(
        <button style={{...S.btn("ghost"),fontSize:10,padding:"5px 10px",color:MUTED,borderColor:BORDER,width:"100%"}}
          onClick={()=>setOpen(true)}>📋 Show Job Sheet Output</button>
      ):(
        <div style={{...S.resBox(MUTED),background:"#0d0f17"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
            <div style={{color:MUTED,fontSize:9,fontWeight:700,letterSpacing:"0.12em"}}>📋 JOB SHEET OUTPUT</div>
            <div style={{display:"flex",gap:6}}>
              <button style={{...S.btn("ghost"),fontSize:10,padding:"3px 9px",color:copied?GREEN:MUTED,borderColor:copied?GREEN+"44":BORDER}}
                onClick={copy}>{copied?"✓ Copied":"Copy"}</button>
              <button style={{...S.btn("ghost"),fontSize:10,padding:"3px 9px",color:MUTED}}
                onClick={()=>setOpen(false)}>✕</button>
            </div>
          </div>
          <pre style={{color:"#8B9099",fontSize:10,lineHeight:1.6,whiteSpace:"pre-wrap",margin:0,fontFamily:"inherit"}}>{buildText()}</pre>
        </div>
      )}
    </div>
  );
}

function faultBtnAccent(label){
  if(/brake|trip|🛑|drops|RCD/i.test(label)) return RED;
  if(/⬆️|⬇️|🔄|direction/i.test(label)) return AMBER;
  if(/🎮|VFD|connector/i.test(label)) return BLUE;
  if(/motor|🔥|noise/i.test(label)) return ORANGE;
  return MUTED;
}

function FaultFinder({onNavigate,onIsolation,onOOS,onPre,onVFD,onClutch}){
  const [history,setHistory]=useState(["triage"]);
  const node=FAULT_TREE[history[history.length-1]];
  function go(id){setHistory(h=>[...h,id]);}
  function back(){setHistory(h=>h.slice(0,-1));}
  function reset(){setHistory(["triage"]);}
  const moduleLink=node?.type==="result"?FAULT_MODULE_LINKS[node.id]:null;
  return(
    <div>
      <div style={{marginBottom:10,display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
        <button style={S.btn("ghost")} onClick={()=>onNavigate("dashboard")}>← Home</button>
        {history.length>1&&<button style={S.btn("ghost")} onClick={back}>↩</button>}
        {history.length>1&&<button style={{...S.btn("ghost"),color:RED,borderColor:RED+"44"}} onClick={reset}>✕</button>}
        <div style={{marginLeft:"auto",display:"flex",gap:5}}>
          <button style={{...S.btn("ghost"),fontSize:10,padding:"5px 8px",color:RED,borderColor:RED+"44"}} onClick={onIsolation}>⚡ Isolation</button>
          <button style={{...S.btn("ghost"),fontSize:10,padding:"5px 8px",color:RED,borderColor:RED+"44"}} onClick={onOOS}>🛑 Out of Service</button>
          <button style={{...S.btn("ghost"),fontSize:10,padding:"5px 8px",color:GREEN,borderColor:GREEN+"44"}} onClick={onPre}>✓ Pre-Energise</button>
          <button style={{...S.btn("ghost"),fontSize:10,padding:"5px 8px",color:AMBER,borderColor:AMBER+"44"}} onClick={onVFD}>🔴 VFD</button>
          <button style={{...S.btn("ghost"),fontSize:10,padding:"5px 8px",color:ORANGE,borderColor:ORANGE+"44"}} onClick={onClutch}>⚙️ Clutch</button>
        </div>
      </div>
      {history.length>1&&(
        <div style={{marginBottom:9,display:"flex",gap:3,flexWrap:"wrap",alignItems:"center"}}>
          <span style={{color:MUTED,fontSize:9}}>PATH:</span>
          {history.slice(1).map((id,i)=>(
            <span key={i} style={{color:MUTED,fontSize:9}}>→ {(FAULT_TREE[id]?.text||FAULT_TREE[id]?.title||id).slice(0,24)}</span>
          ))}
        </div>
      )}
      <div style={{...S.card,borderColor:node?.type==="result"?GREEN:AMBER,borderWidth:2,padding:14}}>
        {node?.type==="question"&&(
          <div>
            <div style={S.secTitle(BLUE)}><span>▸</span> FAULT FINDER</div>
            <div style={{fontSize:14,fontWeight:700,color:TEXT,marginBottom:14,lineHeight:1.4}}>{node.text}</div>
            {node.options.map((opt,i)=>{
              const accent=faultBtnAccent(opt.label);
              return(
                <button key={i} style={{...S.faultBtn,borderLeft:`3px solid ${accent}`,paddingLeft:11}}
                  onMouseEnter={e=>{e.currentTarget.style.borderTopColor=AMBER;e.currentTarget.style.borderRightColor=AMBER;e.currentTarget.style.borderBottomColor=AMBER;}}
                  onMouseLeave={e=>{e.currentTarget.style.borderTopColor=BORDER;e.currentTarget.style.borderRightColor=BORDER;e.currentTarget.style.borderBottomColor=BORDER;}}
                  onClick={()=>go(opt.next)}>
                  <span style={{color:AMBER,fontSize:15,flexShrink:0}}>›</span>
                  <span style={{lineHeight:1.4}}>{opt.label}</span>
                </button>
              );
            })}
          </div>
        )}
        {node?.type==="result"&&(
          <div>
            <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",marginBottom:9}}>
              <div style={S.secTitle(GREEN)}><span>▸</span> DIAGNOSIS</div>
              {node.loler&&<span style={{...S.tag(RED),fontSize:10}}>⚠ LOLER REG 9 — OOS</span>}
            </div>
            <div style={{fontSize:14,fontWeight:700,color:GREEN,marginBottom:10,lineHeight:1.3}}>{node.title}</div>
            <OutcomeBanner nodeId={node.id}/>
            {node.findings&&(
              <div style={{...S.resBox(BLUE),background:"#0A1829",marginBottom:10}}>
                <div style={{color:BLUE,fontSize:9,fontWeight:700,marginBottom:3,letterSpacing:"0.1em"}}>OBSERVATION</div>
                {node.findings.map((f,i)=><div key={i} style={{color:"#C5C9D9",fontSize:12}}>{f}</div>)}
              </div>
            )}
            <div style={{color:AMBER,fontSize:9,fontWeight:700,letterSpacing:"0.12em",marginBottom:9}}>CHECKS & ACTIONS</div>
            {node.checks?.map((c,i)=>(
              <div key={i} style={{display:"flex",gap:9,marginBottom:9,alignItems:"flex-start"}}>
                <span style={{color:AMBER,minWidth:18,fontSize:12,fontWeight:700,flexShrink:0}}>{i+1}.</span>
                <span style={{color:"#C5C9D9",fontSize:12,lineHeight:1.65}}>{c}</span>
              </div>
            ))}
            <DiagramSelector node={node} inModule={false}/>
            {/* Fault-to-module cross-link */}
            {moduleLink&&(
              <div style={{...S.resBox(AMBER),marginTop:12,cursor:"pointer",background:"#1a1200"}}
                onClick={()=>onNavigate("module",moduleLink.id)}>
                <div style={{color:AMBER,fontSize:9,fontWeight:700,marginBottom:3}}>📚 LEARN MORE</div>
                <div style={{color:"#C5C9D9",fontSize:12}}>→ {moduleLink.label}</div>
              </div>
            )}
            {/* LOLER OOS quick-launch */}
            {node.loler&&(
              <div style={{...S.resBox(RED),marginTop:8,cursor:"pointer"}} onClick={onOOS}>
                <div style={{color:RED,fontSize:10,fontWeight:700,marginBottom:3}}>🛑 OPEN OUT OF SERVICE PROCEDURE →</div>
                <div style={{color:"#FCA5A5",fontSize:11}}>Follow the 6-step Out of Service procedure now</div>
              </div>
            )}
            {node.warning&&(
              <div style={{...S.resBox(RED),marginTop:8}}>
                <div style={{color:RED,fontSize:9,fontWeight:700,marginBottom:3,letterSpacing:"0.1em"}}>⚠ SAFETY NOTE</div>
                <div style={{color:"#FCA5A5",fontSize:12,lineHeight:1.65}}>{node.warning}</div>
              </div>
            )}
            <JobSheetBlock node={node}/>
            <div style={{marginTop:14,display:"flex",gap:8,flexWrap:"wrap"}}>
              <button style={S.btn("ghost")} onClick={back}>↩ Back</button>
              <button style={S.btn("primary")} onClick={reset}>New Fault</button>
              <button style={{...S.btn("success"),fontSize:11,padding:"7px 12px"}} onClick={onPre}>✓ Pre-Energise</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function App(){
  const [view,setView]=useState("dashboard");
  const [activeModule,setActiveModule]=useState(null);
  const [modal,setModal]=useState(null); // "iso"|"oos"|"pre"|"probe"|"panel"|"vfd"|"comp"|"rope"|"load"|"clutch"
  const [simple,setSimple]=useState(false);
  const [progress,setProgress]=useState(()=>{
    try{return JSON.parse(localStorage.getItem("hoist_progress_v2")||"{}");}catch{return {};}
  });
  function saveProgress(moduleId,data){
    setProgress(prev=>{
      const next={...prev,[moduleId]:{...prev[moduleId],...data}};
      try{localStorage.setItem("hoist_progress_v2",JSON.stringify(next));}catch{}
      return next;
    });
  }
  function navigate(target,id=null){setView(target);if(id)setActiveModule(id);window.scrollTo(0,0);}
  function openModal(m){setModal(m);}
  function closeModal(){setModal(null);}

  return(
    <div style={S.app}>
      {/* All modals */}
      {modal==="iso"&&<IsolationProcedure onClose={closeModal}/>}
      {modal==="oos"&&<OOSProcedure onClose={closeModal}/>}
      {modal==="pre"&&<PreEnergisationChecklist onClose={closeModal}/>}
      {modal==="probe"&&<ContentModal title="PROBE TECHNIQUE" color={AMBER} icon="🔬" sections={PROBE_TECHNIQUE_CONTENT} onClose={closeModal}/>}
      {modal==="panel"&&<ContentModal title="PANEL NAVIGATION" color={BLUE} icon="🏗️" sections={PANEL_ORIENTATION_CONTENT} onClose={closeModal}/>}
      {modal==="vfd"&&<VFDCodeLookup onClose={closeModal}/>}
      {modal==="comp"&&<ComponentRecognitionModal onClose={closeModal}/>}
      {modal==="rope"&&<ContentModal title="ROPE & CHAIN CONDEMNATION" color={ORANGE} icon="🧵" sections={ROPE_CHAIN_CONTENT} onClose={closeModal}/>}
      {modal==="load"&&<ContentModal title="LOAD TEST GUIDANCE" color={GREEN} icon="⚖️" sections={LOAD_TEST_CONTENT} onClose={closeModal}/>}
      {modal==="clutch"&&<ContentModal title="SLIP CLUTCH — FIELD GUIDE" color={ORANGE} icon="⚙️" sections={SLIP_CLUTCH_CONTENT} onClose={closeModal}/>}
      {modal==="glossary"&&<GlossaryModal onClose={closeModal}/>}

      <div style={S.header}>
        <div>
          <div style={S.logo}>⚡ HOIST ELECTRICAL TRAINER</div>
          <div style={S.sub}>DEMAG · STAHL · KONECRANES · STREET · SWF</div>
        </div>
        <div style={S.nav}>
          <button style={S.navBtn(view==="dashboard")} onClick={()=>navigate("dashboard")}>Home</button>
          <button style={S.navBtn(view==="fault")} onClick={()=>navigate("fault")}>🔍 Diagnose</button>
          <button style={S.navBtn(view==="modules"||view==="module")} onClick={()=>navigate("modules")}>📚 Learn</button>
          <button style={{...S.navBtn(false),background:"#2a0800",color:RED,borderColor:RED+"66",fontWeight:700}}
            onClick={()=>openModal("iso")}>⚡ Isolation</button>
          <button style={{...S.navBtn(false),color:AMBER,borderColor:AMBER+"44",padding:"6px 10px"}}
            onClick={()=>openModal("glossary")}>? Glossary</button>
          <button style={{...S.navBtn(simple),padding:"6px 10px",fontSize:10}}
            onClick={()=>setSimple(s=>!s)} title={simple?"Switch to full detail mode":"Switch to simplified reading mode"}>{simple?"📖 Simple":"📖 Full"}</button>
        </div>
      </div>

      <div style={S.main}>
        {view==="dashboard"&&<Dashboard progress={progress} onNavigate={navigate}
          onIsolation={()=>openModal("iso")} onOOS={()=>openModal("oos")}
          onPre={()=>openModal("pre")} onProbe={()=>openModal("probe")}
          onPanel={()=>openModal("panel")} onVFD={()=>openModal("vfd")}
          onComp={()=>openModal("comp")} onRope={()=>openModal("rope")}
          onLoad={()=>openModal("load")} onClutch={()=>openModal("clutch")}/>}
        {view==="fault"&&<FaultFinder onNavigate={navigate}
          onIsolation={()=>openModal("iso")} onOOS={()=>openModal("oos")}
          onPre={()=>openModal("pre")} onVFD={()=>openModal("vfd")}
          onClutch={()=>openModal("clutch")}/>}
        {view==="modules"&&<ModuleList progress={progress} onNavigate={navigate}/>}
        {view==="module"&&activeModule&&<ModuleViewer moduleId={activeModule} progress={progress} onProgress={saveProgress} onNavigate={navigate} simple={simple}/>}
      </div>
    </div>
  );
}
