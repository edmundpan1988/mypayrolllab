/* MY Payroll Lab — Calculator Logic
   EPF / SOCSO / EIS / PCB-MTD per LHDN official formula */

const MONTHS=['January','February','March','April','May','June','July','August','September','October','November','December'];
(function(){
  /* Populate year dropdown dynamically: 2 years back to 3 years ahead of TODAY.
     This means the list always re-centres on whatever year the system clock says,
     so it never goes stale — no manual updates needed in future years. */
  var today = new Date();
  var currentYear = today.getFullYear();
  var yearSelect = document.getElementById('year');
  var startYear = currentYear - 2;
  var endYear   = currentYear + 3;
  for(var y = startYear; y <= endYear; y++){
    var opt = document.createElement('option');
    opt.value = y;
    opt.textContent = y;
    if(y === currentYear) opt.selected = true;
    yearSelect.appendChild(opt);
  }
  /* Auto-select current month + year, sourced live from the device clock.
     Runs fresh on every page load/refresh, so opening the app in any future
     month automatically lands on that month — no hardcoding, ever. */
  document.getElementById('month').value = today.getMonth() + 1;
  document.getElementById('year').value   = currentYear;
})();

/* ── SOCSO table (ceiling RM6,000 since Oct 2024) ─────────────── */
const SOCSO=[
  [30,.40,.10],[50,.70,.20],[70,1.10,.30],[100,1.50,.40],[140,2.10,.60],
  [200,2.95,.85],[300,4.35,1.25],[400,6.15,1.75],[500,7.85,2.25],[600,9.65,2.75],
  [700,11.35,3.25],[800,13.15,3.75],[900,14.85,4.25],[1000,16.65,4.75],
  [1100,18.35,5.25],[1200,20.15,5.75],[1300,21.85,6.25],[1400,23.65,6.75],
  [1500,25.35,7.25],[1600,27.15,7.75],[1700,28.85,8.25],[1800,30.65,8.75],
  [1900,32.35,9.25],[2000,34.15,9.75],[2100,35.85,10.25],[2200,37.65,10.75],
  [2300,39.35,11.25],[2400,41.15,11.75],[2500,42.85,12.25],[2600,44.65,12.75],
  [2700,46.35,13.25],[2800,48.15,13.75],[2900,49.85,14.25],[3000,51.65,14.75],
  [3100,53.35,15.25],[3200,55.15,15.75],[3300,56.85,16.25],[3400,58.65,16.75],
  [3500,60.35,17.25],[3600,62.15,17.75],[3700,63.85,18.25],[3800,65.65,18.75],
  [3900,67.35,19.25],[4000,69.15,19.75],[4100,70.85,20.25],[4200,72.65,20.75],
  [4300,74.35,21.25],[4400,76.15,21.75],[4500,77.85,22.25],[4600,79.65,22.75],
  [4700,81.35,23.25],[4800,83.15,23.75],[4900,84.85,24.25],[5000,86.65,24.75],
  [5100,88.45,25.25],[5200,90.25,25.75],[5300,91.95,26.25],[5400,93.75,26.75],
  [5500,95.45,27.25],[5600,97.25,27.75],[5700,98.95,28.25],[5800,100.75,28.75],
  [5900,102.45,29.25],[6000,104.25,29.75]
];
/* ── EIS table (ceiling RM6,000) ──────────────────────────────── */
const EIS=[
  [30,.05],[50,.10],[70,.15],[100,.20],[140,.25],[200,.35],[300,.50],[400,.70],
  [500,.90],[600,1.10],[700,1.30],[800,1.50],[900,1.70],[1000,1.90],
  [1100,2.10],[1200,2.30],[1300,2.50],[1400,2.70],[1500,2.90],[1600,3.10],
  [1700,3.30],[1800,3.50],[1900,3.70],[2000,3.90],[2100,4.10],[2200,4.30],
  [2300,4.50],[2400,4.70],[2500,4.90],[2600,5.10],[2700,5.30],[2800,5.50],
  [2900,5.70],[3000,5.90],[3100,6.10],[3200,6.30],[3300,6.50],[3400,6.70],
  [3500,6.90],[3600,7.10],[3700,7.30],[3800,7.50],[3900,7.70],[4000,7.90],
  [4100,8.10],[4200,8.30],[4300,8.50],[4400,8.70],[4500,8.90],[4600,9.10],
  [4700,9.30],[4800,9.50],[4900,9.70],[5000,9.90],[5100,10.10],[5200,10.30],
  [5300,10.50],[5400,10.70],[5500,10.90],[5600,11.10],[5700,11.30],
  [5800,11.50],[5900,11.70],[6000,11.90]
];
/* ── PCB progressive brackets ─────────────────────────────────── */
const BRACKETS=[
  {min:0,max:5000,base:0,rate:0},
  {min:5000,max:20000,base:0,rate:.01},
  {min:20000,max:35000,base:150,rate:.03},
  {min:35000,max:50000,base:600,rate:.06},
  {min:50000,max:70000,base:1500,rate:.11},
  {min:70000,max:100000,base:3700,rate:.19},
  {min:100000,max:400000,base:9400,rate:.25},
  {min:400000,max:600000,base:84400,rate:.26},
  {min:600000,max:2000000,base:136400,rate:.28},
  {min:2000000,max:Infinity,base:528400,rate:.30}
];

function fmt(n){return'RM '+parseFloat(n).toLocaleString('en-MY',{minimumFractionDigits:2,maximumFractionDigits:2})}
function roundUp5Cents(amount){ if(amount<=0) return 0; return Math.ceil((amount - 1e-9) * 20) / 20; } // LHDN: round PCB up to nearest 5 cents
function getSocso(w,ee){if(w<=0)return 0;w=Math.min(w,6000);for(var r of SOCSO){if(w<=r[0])return ee?r[2]:r[1];}return ee?29.75:104.25}
function getEis(w){if(w<=0)return 0;w=Math.min(w,6000);for(var r of EIS){if(w<=r[0])return r[1];}return 11.90}
function progressiveTax(c){
  for(var b of BRACKETS){if(c<=b.max)return b.base+Math.max(0,c-b.min)*b.rate;}
  return 528400+(c-2000000)*.30;
}
/* M and R for the LHDN bracket formula */
function getMR(c){
  for(var b of BRACKETS){if(c<=b.max)return{M:b.min,R:b.rate,B:b.base};}
  return{M:2000000,R:.30,B:528400};
}
function getLindungRate(yr){
  if(yr>=2026&&yr<=2027)return 0.0075;
  if(yr>=2028&&yr<=2030)return 0.01;
  if(yr>=2031)return 0.0125;
  return 0;
}

/* ── PCB Explanation engine ──────────────────────────────────── */
var lastCalc = {};
function toggleExplain(){
  var box = document.getElementById('explain_content');
  var btn = document.getElementById('explain_btn');
  var isVisible = (box.style.display === 'block');
  if(isVisible){
    box.style.display = 'none';
    if(btn) btn.textContent = 'Explain My PCB';
  } else {
    buildExplanation();
    box.style.display = 'block';
    if(btn) btn.textContent = 'Hide Explanation';
  }
}
/* Wire up button via addEventListener for reliability */
(function(){
  var btn = document.getElementById('explain_btn');
  if(btn){ btn.addEventListener('click', toggleExplain); }
})();
function buildExplanation(){
  var d = lastCalc;
  // Guard: ensure calc() has run and populated lastCalc
  if(typeof d.gross === 'undefined'){
    var s = document.getElementById('explain_steps');
    if(s) s.innerHTML = '<div class="explain-step"><div class="step-num">!</div><div class="step-text">Enter your salary details above first, then click Explain My PCB.</div></div>';
    return;
  }
  try {
  var steps = [];
  var tc = d.taxCat;
  var isFlat = (tc==='non_resident'||tc==='rep'||tc==='knowledge_worker'||tc==='c_suite');
  var stepN = 1;

  /* Step 1 — Gross pay */
  steps.push({n:stepN++, text:'<strong>Gross pay this month:</strong> ' + fmt(d.gross) +
    ' (Basic ' + fmt(d.salary) +
    (d.allow>0 ? ' + Allowances '+fmt(d.allow) : '') +
    (d.ot>0   ? ' + OT '+fmt(d.ot)             : '') +
    (d.bonus>0? ' + Bonus/Commission '+fmt(d.bonus) : '') +
    (d.bik>0  ? ' + BIK/VOLA '+fmt(d.bik)      : '') + ')'});

  /* Step 2 — EPF */
  var epfText = '<strong>EPF-liable wages:</strong> ' + fmt(d.epfWage) +
    ' (basic + OT only). EPF deducted: ' + fmt(d.epf_ee) + ' mandatory' +
    (d.epf_vol_ee>0 ? ' + '+fmt(d.epf_vol_ee)+' voluntary' : '');
  if(d.bonus>0 && d.epf_bonus_ee>0){
    epfText += ' + '+fmt(d.epf_bonus_ee)+' on bonus (Kt)';
  }
  epfText += ' = <strong>' + fmt(d.epf_total_ee) + '</strong>';
  steps.push({n:stepN++, text:epfText});

  /* Step 3 — Lindung 24 Jam (only if active) */
  if(d.lindungOn){
    steps.push({n:stepN++, text:'<strong>Lindung 24 Jam:</strong> ' + fmt(d.lindung) +
      ' deducted (0.75% of salary capped at RM6,000, employee-only, effective June 2026)'});
  }

  /* Step 4 — K1 / K2 */
  var k1Text = '<strong>K1 (EPF relief in PCB formula):</strong> ' + fmt(d.K1) +
    ' = min(EPF × '+d.nPlus1+' months, RM4,000 remaining cap). K2 (future months) = '+fmt(d.K2);
  if(d.bonus>0 && d.Kt>0){
    k1Text += '. With bonus: Kt = '+fmt(d.Kt)+', K2 adjusted to '+fmt(d.K2b);
  }
  steps.push({n:stepN++, text:k1Text});

  /* Step 5 — Projected P */
  var pText = '<strong>Projected annual income (P_normal):</strong> Acc. net '+fmt(d.accGross - Math.min(d.accEpf,4000))+
    ' + current net ('+fmt(d.gross)+' − '+fmt(d.K1)+')' +
    ' + future '+d.n+' months × ('+fmt(d.gross)+' − '+fmt(d.K2)+') = <strong>'+fmt(d.P_income)+'</strong>';
  if(d.bonus>0 && d.Kt>0){
    pText += '. P_with_bonus includes (Bonus '+fmt(d.bonus)+' − Kt '+fmt(d.Kt)+') = '+fmt(d.bonus-d.Kt)+' added.';
  }
  steps.push({n:stepN++, text:pText});

  /* Step 6 — Reliefs */
  if(!isFlat || tc!=='non_resident'){
    steps.push({n:stepN++, text:'<strong>Annual reliefs:</strong> Personal RM'+d.rPersonal+
      (d.spouseRelief>0 ? ' + Spouse RM'+d.spouseRelief : '') +
      (d.okuRelief>0    ? ' + OKU RM'+d.okuRelief       : '') +
      (d.rChild>0       ? ' + Children RM'+d.rChild      : '') +
      (d.otherRelief>0  ? ' + Other RM'+d.otherRelief.toFixed(0) : '') +
      ' = <strong>'+fmt(d.totalRelief)+'</strong>'});
  }

  /* Step 7 — Tax */
  if(tc==='non_resident'){
    steps.push({n:stepN++, text:'<strong>Non-Resident 30% flat:</strong> No reliefs. Annual tax = '+
      fmt(d.P_income)+' × 30% = <strong>'+fmt(d.annTax)+'</strong>'});
  } else if(isFlat){
    var catName={rep:'REP',knowledge_worker:'Knowledge Worker',c_suite:'C-Suite'}[tc]||'Flat rate';
    steps.push({n:stepN++, text:'<strong>'+catName+' 15% flat:</strong> Chargeable income '+
      fmt(d.P)+' × 15% = <strong>'+fmt(d.annTax)+'</strong>'});
  } else {
    steps.push({n:stepN++, text:'<strong>Chargeable income:</strong> '+fmt(d.P_income)+
      ' − reliefs '+fmt(d.totalRelief)+' = <strong>'+fmt(d.P)+'</strong>'+
      (d.rebate>0 ? ' (Tax rebate RM'+d.rebate+' applied)' : '')});
    steps.push({n:stepN++, text:'<strong>Annual tax:</strong> <strong>'+fmt(d.annTax)+'</strong>'+
      ' (progressive brackets 0%–30%)'+(d.rebate>0?' after rebate of RM'+d.rebate:'')});
  }

  /* Step 8 — PCB formula */
  if(d.bonus>0 && d.MTD_additional>0){
    steps.push({n:stepN++, text:'<strong>MTD(A) — Regular salary PCB:</strong> (Annual tax '+
      fmt(d.annTax)+' − PCB paid '+fmt(d.accPcb)+') ÷ '+d.nPlus1+' months = <strong>'+fmt(d.MTD_A)+'</strong>'});
    steps.push({n:stepN++, text:'<strong>MTD Additional — Bonus PCB:</strong> CS (annual tax on P_with_bonus) − MTD(B) = <strong>'+
      fmt(d.MTD_additional)+'</strong>'});
    steps.push({n:stepN++, text:'<strong>Total PCB = MTD(A) + MTD Additional:</strong> '+
      fmt(d.MTD_A)+' + '+fmt(d.MTD_additional)+
      (d.cp38>0?' + CP38 '+fmt(d.cp38):'')+(d.zakat>0?' − Zakat '+fmt(d.zakat):'')+
      ' = <strong>'+fmt(d.totalPCB)+'</strong>'});
  } else {
    steps.push({n:stepN++, text:'<strong>Monthly PCB formula:</strong> (Annual tax '+fmt(d.annTax)+
      ' − PCB paid '+fmt(d.accPcb)+') ÷ '+d.nPlus1+' remaining months'+
      (d.zakat>0?' − Zakat '+fmt(d.zakat):'')+
      (d.cp38>0?' + CP38 '+fmt(d.cp38):'')+
      ' = <strong>'+fmt(d.totalPCB)+'</strong>'});
  }

  /* Render steps */
  var html = steps.map(function(s){
    return '<div class="explain-step"><div class="step-num">'+s.n+'</div><div class="step-text">'+s.text+'</div></div>';
  }).join('');
  document.getElementById('explain_steps').innerHTML = html;

  /* Final PCB result */
  document.getElementById('explain_final').textContent = fmt(d.totalPCB);
  document.getElementById('explain_pcb_label').textContent =
    (d.bonus>0 && d.MTD_additional>0) ? 'Total PCB / MTD (salary + bonus)' : 'Monthly PCB / MTD';

  /* ── Mirror notices ──────────────────────────────────────────── */
  /* Lindung 24 Jam notice */
  document.getElementById('exp_lindung_notice').style.display = d.lindungOn ? 'block' : 'none';

  /* PCB = RM0 notice */
  document.getElementById('exp_pcb_zero_box').style.display =
    (d.totalPCB === 0 && d.annTax === 0) ? 'block' : 'none';

  /* Tax rebate info */
  var expRebateBox  = document.getElementById('exp_rebate_info');
  var expRebateText = document.getElementById('exp_rebate_text');
  if(d.rebate > 0){
    var desc = 'Individual rebate: RM'+d.rebateIndividual;
    if(d.rebateSpouse>0) desc += ' + Married (spouse not working) rebate: RM'+d.rebateSpouse+
      ' = <strong>RM'+d.rebate+' total</strong>';
    desc += '<br>This rebate reduces your annual tax. It is applied to the PCB formula — it does not affect your net pay directly.';
    expRebateText.innerHTML = desc;
    expRebateBox.style.display = 'flex';
  } else {
    expRebateBox.style.display = 'none';
  }
  } catch(err) {
    var s = document.getElementById('explain_steps');
    if(s) s.innerHTML = '<div class="explain-step"><div class="step-num">!</div><div class="step-text">Could not generate explanation. Please ensure salary is entered and try again. ('+err.message+')</div></div>';
  }
}

/* ── Child relief calculator ─────────────────────────────────── */
var claimRate = '100';
function setClaimRate(rate){
  claimRate = rate;
  document.getElementById('claim_100').classList.toggle('active', rate==='100');
  document.getElementById('claim_50').classList.toggle('active', rate==='50');
  var rates = {a:'2,000',b:'2,000',c:'8,000',d:'6,000',e:'8,000'};
  var mult = rate==='50' ? 0.5 : 1;
  Object.keys(rates).forEach(function(k){
    var base = parseInt(rates[k].replace(',',''));
    document.getElementById('cr_rate_'+k).textContent =
      'RM'+Math.round(base*mult).toLocaleString()+'/child'+(rate==='50'?' (50%)':'');
  });
  calcChild();
}
function calcChild(){
  var mult = claimRate==='50' ? 0.5 : 1.0;
  var a = (parseInt(document.getElementById('cr_a').value)||0);
  var b = (parseInt(document.getElementById('cr_b').value)||0);
  var c = (parseInt(document.getElementById('cr_c').value)||0);
  var d = (parseInt(document.getElementById('cr_d').value)||0);
  var e = (parseInt(document.getElementById('cr_e').value)||0);
  var regular = (a*2000 + b*2000 + c*8000) * mult;
  var disabled = (d*6000 + e*8000) * mult;
  var total = regular + disabled;
  document.getElementById('r_child').value = regular;
  document.getElementById('r_dis_child').value = disabled;
  document.getElementById('child_total_display').textContent =
    'RM '+total.toLocaleString('en-MY',{minimumFractionDigits:2,maximumFractionDigits:2});
  calc();
}

/* ── Voluntary EPF type toggle ─────────────────────────────────── ───────────────────────────────── */
var volState = { ee: 'none', er: 'none' };
function setVolType(side, type){
  volState[side] = type;
  ['none','pct','fixed'].forEach(function(t){
    document.getElementById('vol_'+side+'_'+t).classList.toggle('active', t===type);
  });
  var unit = document.getElementById('vol_'+side+'_unit');
  unit.textContent = type==='pct' ? '%' : 'RM';
  var inp = document.getElementById('vol_'+side+'_val');
  inp.value = 0;
  if(type==='none'){ inp.disabled=true; inp.style.opacity='.4'; }
  else { inp.disabled=false; inp.style.opacity='1'; }
  calc();
}
// initialise disabled state
setVolType('ee','none'); setVolType('er','none');

function calc(){
  /* ── inputs ─────────────────────────────────────────────────── */
  var salary  =parseFloat(document.getElementById('salary').value)||0;
  var allow   =parseFloat(document.getElementById('allow').value)||0;
  var ot      =parseFloat(document.getElementById('ot').value)||0;
  var bonus   =parseFloat(document.getElementById('bonus').value)||0;
  var bik     =parseFloat(document.getElementById('bik').value)||0;
  var age     =document.getElementById('age').value;
  var nat     =document.getElementById('nat').value;
  var taxCat  =document.getElementById('tax_cat').value;
  var marital =document.getElementById('marital').value;
  var oku     =document.getElementById('oku').checked;
  var month   =parseInt(document.getElementById('month').value)||1;
  var year    =parseInt(document.getElementById('year').value)||2026;
  var accGross=parseFloat(document.getElementById('acc_gross').value)||0;
  var accEpf  =parseFloat(document.getElementById('acc_epf').value)||0;
  var accPcb  =parseFloat(document.getElementById('acc_pcb').value)||0;
  var rPersonal=parseFloat(document.getElementById('r_personal').value)||0;
  var rChild  =parseFloat(document.getElementById('r_child').value)||0;
  var rLife   =parseFloat(document.getElementById('r_life').value)||0;
  var rMedical=parseFloat(document.getElementById('r_medical').value)||0;
  var rSspn   =parseFloat(document.getElementById('r_sspn').value)||0;
  var rLifestyle=parseFloat(document.getElementById('r_lifestyle').value)||0;
  var rEduIns =parseFloat(document.getElementById('r_edu_ins').value)||0;
  var rPrs    =parseFloat(document.getElementById('r_prs').value)||0;
  var rDisSpouse=parseFloat(document.getElementById('r_dis_spouse').value)||0;
  var rDisChild=parseFloat(document.getElementById('r_dis_child').value)||0;
  var zakat   =parseFloat(document.getElementById('zakat').value)||0;
  var cp38    =parseFloat(document.getElementById('cp38').value)||0;

  /* ── gross & EPF-liable wages ───────────────────────────────── */
  var gross   = salary+allow+ot+bonus+bik;
  var epfWage = salary+ot; // allowances & BIK excluded from EPF

  /* ── EPF mandatory ──────────────────────────────────────────── */
  var epf_ee=0,epf_er=0,epfEeRate='11%',epfErRate='13%';
  if(nat==='local'){
    if(age==='below60'){
      epf_ee=Math.round(epfWage*0.11);
      epf_er=epfWage<=5000?Math.round(epfWage*0.13):Math.round(epfWage*0.12);
      epfErRate=epfWage<=5000?'13%':'12%';
    } else {
      epf_ee=0;epf_er=Math.round(epfWage*0.04);
      epfEeRate='0%';epfErRate='4%';
    }
  }

  /* ── EPF voluntary ───────────────────────────────────────────── */
  var vol_ee_val=parseFloat(document.getElementById('vol_ee_val').value)||0;
  var vol_er_val=parseFloat(document.getElementById('vol_er_val').value)||0;
  var epf_vol_ee=0, epf_vol_er=0;
  if(volState.ee==='pct')  epf_vol_ee=Math.round(epfWage*(vol_ee_val/100));
  else if(volState.ee==='fixed') epf_vol_ee=Math.round(vol_ee_val);
  if(volState.er==='pct')  epf_vol_er=Math.round(epfWage*(vol_er_val/100));
  else if(volState.er==='fixed') epf_vol_er=Math.round(vol_er_val);
  var epf_total_ee = epf_ee + epf_vol_ee;
  var epf_total_er = epf_er + epf_vol_er;

  /* ── SOCSO ──────────────────────────────────────────────────── */
  var socso_ee=0,socso_er=0;
  if(nat==='local'){socso_ee=getSocso(salary,true);socso_er=getSocso(salary,false);}
  else{socso_er=getSocso(salary,false);}

  /* ── EIS ────────────────────────────────────────────────────── */
  var eis_ee=0,eis_er=0;
  if(nat==='local'){eis_ee=getEis(salary);eis_er=getEis(salary);}

  /* ── Lindung 24 Jam ─────────────────────────────────────────── */
  var lindung=0;
  var lindungOn=(year>2026)||(year===2026&&month>=6);
  if(lindungOn&&nat==='local'){
    lindung=Math.round(Math.min(salary,6000)*getLindungRate(year)*100)/100;
  }

  /* ── Marital status → spouse relief ────────────────────────── */
  var spouseRelief = marital==='married_not_working' ? 4000 : 0;
  document.getElementById('r_spouse').value = spouseRelief;

  /* ── OKU relief ─────────────────────────────────────────────── */
  var okuRelief = oku ? 6000 : 0;
  document.getElementById('r_oku').value = okuRelief;
  document.getElementById('oku_label').style.display = oku ? 'inline-block' : 'none';

  /* ── Bonus EPF — actual deduction amounts ───────────────────── */
  // Kt (PCB formula) is calculated later in the K1/K2/Kt block
  var epf_bonus_ee = 0, epf_bonus_er = 0, Kt = 0;
  if(bonus > 0 && nat==='local'){
    epf_bonus_ee = Math.round(bonus * 0.11);
    epf_bonus_er = bonus <= 5000 ? Math.round(bonus * 0.13) : Math.round(bonus * 0.12);
  }
  // Update totals to include bonus EPF
  var epf_regular = epf_ee + epf_vol_ee;       // for K1/K2 (RM4,000 cap)
  epf_total_ee = epf_regular + epf_bonus_ee;   // all EPF from employee
  epf_total_er = epf_er + epf_vol_er + epf_bonus_er; // all EPF from employer

  /* ── LHDN K1 / K2 / Kt formula — corrected per LHDN official slip ─ */
  // K  = accumulated EPF paid (all months), capped at RM4,000 annual limit
  // K1 = actual EPF this month (regular), capped by remaining room in RM4,000
  // K2 = estimated EPF for each future month = min(K1, remaining_room / n)
  // Kt = actual EPF on bonus, capped by remaining room after K and K1 (shared cap)
  // K2b= estimated future EPF when bonus is paid = min(K1, remaining_after_Kt / n)
  var n      = 12 - month;
  var nPlus1 = n + 1;
  var accEpfCapped = Math.min(accEpf, 4000);          // K (accumulated)
  var capLeft      = Math.max(0, 4000 - accEpfCapped); // room left in annual cap
  var K1  = Math.min(epf_regular, capLeft);            // actual EPF this month, capped
  var K2  = n > 0 ? Math.min(K1, Math.max(0, (4000 - accEpfCapped - K1) / n)) : 0;
  // Kt: bonus EPF uses SAME shared RM4,000 cap (not separate RM6,000)
  var capForKt = Math.max(0, 4000 - accEpfCapped - K1);
  var Kt  = Math.min(epf_bonus_ee, capForKt);
  // K2b: future months EPF after Kt reduces remaining cap
  var K2b = bonus > 0 && n > 0
            ? Math.min(K1, Math.max(0, (4000 - accEpfCapped - K1 - Kt) / n))
            : K2;

  /* ── Total reliefs (D + S + Du + Su + Q*C + LP) ─────────────── */
  var D  = rPersonal;
  var S  = spouseRelief;
  var Du = okuRelief;
  var Su = Math.min(rDisSpouse, 5000);
  var QC = rChild + rDisChild;
  var LP = Math.min(rLife,3000)+Math.min(rMedical,10000)+Math.min(rSspn,8000)
         + Math.min(rLifestyle,2500)+Math.min(rEduIns,3000)+Math.min(rPrs,3000);
  var totalRelief = D + S + Du + Su + QC + LP;

  /* ── Regular salary P (excludes bonus) — for MTD(A) ─────────── */
  var regularGross = salary + allow + ot; // BIK excluded from P formula (Y1/Y2) per LHDN
  var accNet    = accGross - accEpfCapped;       // Σ(Y-K) from previous months
  var currNet   = regularGross - K1;             // Y1 - K1  (regular, no bonus)
  var futureNet = (regularGross - K2) * n;       // (Y2-K2) × n
  var P_normal  = Math.max(0, accNet + currNet + futureNet - totalRelief);

  /* ── Flat rate setup ─────────────────────────────────────────── */
  var flatRate = 0, isFlat = false;
  if(taxCat==='non_resident'){ isFlat=true; flatRate=30; }
  else if(taxCat==='rep'||taxCat==='knowledge_worker'||taxCat==='c_suite'){ isFlat=true; flatRate=15; }

  /* ── Tax rebate helper ───────────────────────────────────────── */
  function calcRebate(chargeable){
    if(isFlat || nat!=='local' || chargeable > 35000) return {total:0,ind:0,sp:0};
    var ind=400, sp=(marital==='married_not_working'?400:0);
    return {total:ind+sp, ind:ind, sp:sp};
  }

  /* ── MTD(A): regular salary PCB ─────────────────────────────── */
  var P_income = accNet + currNet + futureNet; // before reliefs (for display)
  var P = 0, annTax = 0;
  var rebateIndividual=0, rebateSpouse=0, rebate=0;

  if(taxCat==='non_resident'){
    var annGross = accGross + regularGross * nPlus1;
    annTax = annGross * 0.30;
    P = annGross;
  } else if(isFlat){
    P = P_normal;
    annTax = P * 0.15;
  } else {
    P = P_normal;
    annTax = progressiveTax(P);
    var rb = calcRebate(P);
    rebate=rb.total; rebateIndividual=rb.ind; rebateSpouse=rb.sp;
    annTax = Math.max(0, annTax - rebate);
  }
  var remainingTax = Math.max(0, annTax - accPcb);
  var MTD_A = Math.round((remainingTax / nPlus1) * 100) / 100;
  var monthlyPCB = MTD_A; // default (no bonus)

  /* ── MTD Additional: bonus PCB (LHDN two-step formula) ──────── */
  var MTD_additional = 0;
  if(bonus > 0){
    if(taxCat==='non_resident'){
      // Non-resident: bonus taxed at 30% immediately
      MTD_additional = Math.round(bonus * 0.30 * 100) / 100;
    } else {
      // Resident / flat: P includes bonus (Yt-Kt) with recalculated K2b
      var futureNet_b = (regularGross - K2b) * n;
      var P_with_bonus = Math.max(0, accNet + currNet + futureNet_b + (bonus - Kt) - totalRelief);
      var CS = 0;
      if(isFlat){
        CS = P_with_bonus * (flatRate / 100);
      } else {
        var rb2 = calcRebate(P_with_bonus);
        CS = Math.max(0, progressiveTax(P_with_bonus) - rb2.total);
      }
      // MTD(B) = accumulated PCB + MTD(A) × (n+1)
      var MTD_B = accPcb + MTD_A * nPlus1;
      MTD_additional = Math.max(0, CS - MTD_B);
      MTD_additional = Math.round(MTD_additional * 100) / 100;
    }
  }

  /* ── Total PCB this month ────────────────────────────────────── */
  var totalPCB = MTD_A + MTD_additional + cp38 - zakat;
  totalPCB = Math.max(0, Math.round(totalPCB * 100) / 100);
  totalPCB = roundUp5Cents(totalPCB); // final PCB to deduct — LHDN rounds UP to nearest 5 cents

  /* ── Net pay & employer cost ─────────────────────────────────── */
  var totalDeduct = epf_total_ee + socso_ee + eis_ee + lindung + totalPCB;
  var netPay      = gross - totalDeduct;
  var erContribs  = epf_total_er + socso_er + eis_er;
  var totalCost   = gross + erContribs;
  var effRate     = P_income > 0 ? (annTax / P_income * 100) : 0;

  /* ── Update badge ───────────────────────────────────────────── */
  document.getElementById('remaining_badge').textContent =
    nPlus1+' month'+(nPlus1>1?'s':'')+' remaining ('+MONTHS[month-1]+' '+year+')';

  /* ── Flat rate notice ───────────────────────────────────────── */
  var flatLabel  = document.getElementById('flat_rate_label');
  var flatNotice = document.getElementById('flat_rate_notice');
  var reliefSect = document.getElementById('relief_section');
  var pcbTag     = document.getElementById('o_pcb_rate_tag');

  var catLabels = {
    non_resident:'Non-Resident: 30% flat',
    rep:'REP: 15% flat',
    knowledge_worker:'Knowledge Worker: 15% flat',
    c_suite:'C-Suite: 15% flat'
  };
  if(isFlat){
    flatLabel.style.display='inline-block';
    flatLabel.textContent=flatRate+'% flat rate';
    pcbTag.style.display='inline-block';
    pcbTag.textContent=flatRate+'%';
    var msg = taxCat==='non_resident'
      ? '&#9432; Non-Resident: 30% flat rate applies on gross income. No tax reliefs apply. PCB = gross &times; 30% &divide; (n+1).'
      : taxCat==='rep'
      ? '&#9432; Returning Expert Programme (REP): 15% preferential rate on chargeable income, approved by Talent Corp Malaysia. Standard reliefs apply.'
      : taxCat==='knowledge_worker'
      ? '&#9432; Knowledge Worker (IRDA Iskandar): 15% preferential rate for approved knowledge workers in Iskandar Malaysia. Standard reliefs apply.'
      : '&#9432; C-Suite / Principal Hub: 15% preferential rate for qualifying executives in MIDA-approved Principal Hub companies. Standard reliefs apply.';
    flatNotice.innerHTML=msg;
    flatNotice.style.display='block';
    reliefSect.style.opacity = taxCat==='non_resident' ? '0.45' : '1';
  } else {
    flatLabel.style.display='none';
    flatNotice.style.display='none';
    pcbTag.style.display='none';
    reliefSect.style.opacity='1';
  }

  /* ── EPF rates display ──────────────────────────────────────── */
  document.getElementById('epf_ee_rate').textContent = epfEeRate;
  document.getElementById('epf_er_rate').textContent = epfErRate;

  /* ── Employee side ──────────────────────────────────────────── */
  document.getElementById('o_gross').textContent    = fmt(gross);
  document.getElementById('o_epf_wage').textContent  = fmt(epfWage);
  document.getElementById('o_epf_ee').textContent   = '- '+fmt(epf_ee);
  document.getElementById('o_epf_vol_ee').textContent= '- '+fmt(epf_vol_ee);
  document.getElementById('epf_vol_ee_row').style.display = epf_vol_ee > 0 ? 'flex' : 'none';
  document.getElementById('o_epf_bonus_ee').textContent = '- '+fmt(epf_bonus_ee);
  document.getElementById('epf_bonus_ee_row').style.display = epf_bonus_ee > 0 ? 'flex' : 'none';
  /* Voluntary card mini-results */
  document.getElementById('vr_epf_mand_ee').textContent = fmt(epf_ee);
  document.getElementById('vr_epf_vol_ee').textContent  = fmt(epf_vol_ee);
  document.getElementById('vr_epf_total_ee').textContent= fmt(epf_total_ee);
  document.getElementById('vr_epf_mand_er').textContent = fmt(epf_er);
  document.getElementById('vr_epf_vol_er').textContent  = fmt(epf_vol_er);
  document.getElementById('vr_epf_total_er').textContent= fmt(epf_total_er);
  document.getElementById('o_socso_ee').textContent = '- '+fmt(socso_ee);
  document.getElementById('o_eis_ee').textContent   = '- '+fmt(eis_ee);
  document.getElementById('row_socso_ee').style.display = salary > 0 ? 'flex' : 'none';
  document.getElementById('row_eis_ee').style.display   = salary > 0 ? 'flex' : 'none';
  document.getElementById('o_pcb').textContent      = '- '+fmt(totalPCB);
  document.getElementById('o_pcb_a').textContent    = '- '+fmt(MTD_A);
  document.getElementById('o_pcb_addl').textContent = '- '+fmt(MTD_additional);
  var hasBonusPCB = (MTD_additional > 0);
  document.getElementById('pcb_bonus_row').style.display  = hasBonusPCB ? 'flex' : 'none';
  document.getElementById('pcb_addl_row').style.display   = hasBonusPCB ? 'flex' : 'none';
  document.getElementById('o_net').textContent      = fmt(netPay);
  document.getElementById('o_total_deduct').textContent = '- '+fmt(totalDeduct);

  /* Lindung */
  document.getElementById('o_lindung').textContent  = '- '+fmt(lindung);
  document.getElementById('lindung_row').style.display  = lindungOn ? 'flex' : 'none';
  document.getElementById('lindung_notice').style.display = lindungOn ? 'block' : 'none';

  /* CP38 */
  document.getElementById('o_cp38').textContent = '- '+fmt(cp38);
  document.getElementById('cp38_row').style.display = cp38 > 0 ? 'flex' : 'none';

  /* Zakat */
  document.getElementById('o_zakat_show').textContent = '- '+fmt(zakat);
  document.getElementById('zakat_row').style.display = zakat > 0 ? 'flex' : 'none';

  /* Rebate */
  /* Tax rebate info box */
  var rebateBox     = document.getElementById('rebate_info_box');
  var rebateText    = document.getElementById('rebate_info_text');
  var pcbZeroBox    = document.getElementById('pcb_zero_box');
  var rebateNotice  = document.getElementById('rebate_notice');
  var rebateNText   = document.getElementById('rebate_notice_text');
  if(rebate > 0){
    var rebateDesc = 'Individual rebate: RM400';
    if(rebateSpouse > 0) rebateDesc += ' + Married (spouse not working) rebate: RM400 = <strong>RM800 total</strong>';
    rebateDesc += '<br>This rebate reduces your annual tax. It is applied to the PCB formula — it does not affect your net pay directly.';
    rebateText.innerHTML = rebateDesc;
    rebateBox.style.display = 'flex';
    rebateNText.innerHTML = '&#9432; Tax rebate RM' + rebate + ' applied — chargeable income &le; RM35,000';
    rebateNotice.style.display = 'block';
  } else {
    rebateBox.style.display = 'none';
    rebateNotice.style.display = 'none';
  }
  pcbZeroBox.style.display = (totalPCB === 0 && annTax === 0) ? 'block' : 'none';

  /* ── Employer side ──────────────────────────────────────────── */
  document.getElementById('o_gross2').textContent   = fmt(gross);
  document.getElementById('o_epf_er').textContent   = fmt(epf_er);
  document.getElementById('o_epf_vol_er').textContent= fmt(epf_vol_er);
  document.getElementById('epf_vol_er_row').style.display = epf_vol_er > 0 ? 'flex' : 'none';
  document.getElementById('o_epf_bonus_er').textContent = fmt(epf_bonus_er);
  document.getElementById('epf_bonus_er_row').style.display = epf_bonus_er > 0 ? 'flex' : 'none';
  document.getElementById('o_socso_er').textContent = fmt(socso_er);
  document.getElementById('o_eis_er').textContent   = fmt(eis_er);
  document.getElementById('row_socso_er').style.display = salary > 0 ? 'flex' : 'none';
  document.getElementById('row_eis_er').style.display   = salary > 0 ? 'flex' : 'none';
  document.getElementById('o_er_total').textContent = fmt(erContribs);
  document.getElementById('o_total_cost').textContent = fmt(totalCost);

  /* ── PCB summary ────────────────────────────────────────────── */
  document.getElementById('o_P').textContent            = fmt(P);
  document.getElementById('o_chargeable').textContent   = fmt(P);
  document.getElementById('o_annual_tax').textContent   = fmt(annTax);
  document.getElementById('o_K1').textContent           = fmt(K1);
  document.getElementById('o_K2').textContent           = fmt(K2);
  document.getElementById('o_Kt').textContent           = fmt(Kt);
  document.getElementById('o_K2_bonus').textContent     = fmt(K2b);
  document.getElementById('acc_Kt_row').style.display   = bonus>0?'block':'none';
  document.getElementById('acc_K2b_row').style.display  = bonus>0?'block':'none';
  document.getElementById('o_mtd_a').textContent        = fmt(MTD_A);
  document.getElementById('o_mtd_addl').textContent     = fmt(MTD_additional);
  document.getElementById('acc_mtd_addl_row').style.display = MTD_additional>0?'block':'none';
  document.getElementById('o_months_rem').textContent   = nPlus1+' month'+(nPlus1>1?'s':'');
  document.getElementById('o_acc_pcb_show').textContent = fmt(accPcb);
  document.getElementById('o_remaining_tax').textContent= fmt(remainingTax);
  document.getElementById('o_eff_rate').textContent     = effRate.toFixed(2)+'%';

  /* ── Store snapshot for explanation engine ───────────────────── */
  lastCalc = {
    gross, salary, allow, ot, bonus, bik, epfWage,
    epf_ee, epf_vol_ee, epf_bonus_ee, epf_total_ee,
    K1, K2, K2b, Kt, n, nPlus1,
    accGross, accPcb, accEpf,
    P_income, P, annTax, totalRelief,
    MTD_A, MTD_additional, monthlyPCB:MTD_A, totalPCB,
    rebate, rebateIndividual, rebateSpouse,
    taxCat, rPersonal, spouseRelief, okuRelief, rChild,
    otherRelief: Math.min(rLife,3000)+Math.min(rMedical,10000)+Math.min(rSspn,8000)+Math.min(rLifestyle,2500)+Math.min(rEduIns,3000)+Math.min(rPrs,3000),
    zakat, cp38,
    lindungOn, lindung, totalPCB
  };
  /* Refresh explanation if open */
  if(document.getElementById('explain_content').style.display === 'block'){ buildExplanation(); }
}
calc();
