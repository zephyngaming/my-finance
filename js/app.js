/* My Finance — modular, local-first prototype */
const STORE_KEY = 'my-finance-v1';
const today = new Date();
const monthKey = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}`;
const money = n => new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}).format(Number(n||0));
const escapeHtml = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const starter = () => ({
  cards:[
    {id:crypto.randomUUID(),name:'SBM Zet',kind:'FD-backed credit card',limit:2000,statementDay:'10',dueDay:'',color:'sbm'},
    {id:crypto.randomUUID(),name:'Kotak SuperMoney',kind:'FD-backed credit card',limit:1000,statementDay:'21',dueDay:'',color:'kotak'}
  ],
  transactions:[], bills:[], goals:[],
  profile:{monthlyIncome:30000,illustrative:true}
});
let db = load();
function load(){try{return JSON.parse(localStorage.getItem(STORE_KEY)) || starter()}catch{return starter()}}
function save(){localStorage.setItem(STORE_KEY,JSON.stringify(db));renderAll()}
function toast(msg){const t=document.getElementById('toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2200)}
function showPage(name){
  document.querySelectorAll('.page').forEach(p=>p.classList.toggle('active',p.id===`page-${name}`));
  document.querySelectorAll('.tab').forEach(t=>t.classList.toggle('active',t.dataset.page===name));
  window.scrollTo({top:0,behavior:'smooth'});
}
document.querySelectorAll('[data-page]').forEach(b=>b.addEventListener('click',()=>showPage(b.dataset.page)));
document.querySelectorAll('[data-go]').forEach(b=>b.addEventListener('click',()=>showPage(b.dataset.go)));
document.getElementById('todayLabel').textContent=today.toLocaleDateString('en-IN',{day:'2-digit',month:'short'}).toUpperCase();

function renderAll(){renderCards();renderTransactions();renderBills();renderGoals();renderDashboard()}
function renderDashboard(){
  const income=Number(db.profile.monthlyIncome||0);
  const monthTx=db.transactions.filter(t=>t.date?.startsWith(monthKey));
  const expenses=monthTx.filter(t=>t.type==='expense').reduce((a,t)=>a+Number(t.amount),0);
  const incomeTx=monthTx.filter(t=>t.type==='income').reduce((a,t)=>a+Number(t.amount),0);
  const recurring=db.bills.reduce((a,b)=>a+Number(b.amount||0),0);
  const shownIncome=incomeTx>0?incomeTx:income;
  document.getElementById('incomeTotal').textContent=money(shownIncome);
  document.getElementById('expenseTotal').textContent=money(expenses);
  document.getElementById('emiTotal').textContent=money(recurring);
  document.getElementById('remainingTotal').textContent=money(shownIncome-expenses-recurring);
  const sample=document.querySelector('.sample-chip');
  if(sample)sample.textContent=(db.transactions.length||db.bills.length)?'YOUR RECORDS':'SAMPLE DATA';
}
function renderCards(){
  const el=document.getElementById('cardsList');
  el.innerHTML=db.cards.length?db.cards.map((c,i)=>`<article class="bank-card ${c.color==='kotak'?'kotak':''}">
    <div class="bank-top"><span>MY FINANCE · CARD ${String(i+1).padStart(2,'0')}</span><span>◉</span></div>
    <div class="bank-name">${escapeHtml(c.name)}</div><div class="bank-sub">${escapeHtml(c.kind||'Credit card')}</div>
    <div class="bank-bottom"><div><small>CREDIT LIMIT</small><b>${money(c.limit)}</b></div><div><small>STATEMENT DAY</small><b>${escapeHtml(c.statementDay||'—')}</b></div></div>
  </article>`).join(''):'<div class="empty-card">No cards added yet.</div>';
}
function renderTransactions(){
  const el=document.getElementById('transactionsList');
  const sorted=[...db.transactions].sort((a,b)=>b.date.localeCompare(a.date));
  el.innerHTML=sorted.length?sorted.map(t=>`<div class="transaction-row"><div class="row-icon">${t.type==='income'?'＋':'−'}</div><div class="row-main"><b>${escapeHtml(t.title)}</b><small>${escapeHtml(t.category)} · ${escapeHtml(t.date)}</small></div><div class="row-amount" style="color:${t.type==='income'?'#168257':'#253348'}">${t.type==='income'?'+':'−'}${money(t.amount)}</div></div>`).join(''):'<div class="empty-card"><div><b>No transactions recorded</b><p>Add income and expenses to build your spending picture.</p></div></div>';
  document.getElementById('transactionCount').textContent=db.transactions.length;
  const m=db.transactions.filter(t=>t.date?.startsWith(monthKey)&&t.type==='expense').reduce((a,t)=>a+Number(t.amount),0);
  document.getElementById('activitySpend').textContent=money(m);
}
function renderBills(){
  const el=document.getElementById('billsList');
  el.innerHTML=db.bills.length?db.bills.map(b=>`<div class="bill-row"><div class="row-icon">▣</div><div class="row-main"><b>${escapeHtml(b.name)}</b><small>${escapeHtml(b.kind)} · Due day ${escapeHtml(b.dueDay||'—')}</small></div><div class="row-amount">${money(b.amount)}</div></div>`).join(''):'<div class="empty-card"><div><b>No bills added</b><p>Add your card bills, rent, EMI and insurance renewals.</p></div></div>';
}
function renderGoals(){
  const el=document.getElementById('goalsList');
  el.innerHTML=db.goals.length?db.goals.map(g=>{const p=Math.min(100,Math.round((Number(g.saved)/Math.max(1,Number(g.target)))*100));return `<div class="goal-row"><div class="goal-row-top"><b>${escapeHtml(g.name)}</b><small>${p}%</small></div><p>${money(g.saved)} saved of ${money(g.target)}</p><div class="goal-progress"><span style="width:${p}%"></span></div></div>`}).join(''):'<div class="empty-card"><div><b>No savings goals yet</b><p>Plan your PS5, bike repairs or emergency fund.</p></div></div>';
}
renderAll();

const dialog=document.getElementById('entryDialog'), fields=document.getElementById('dialogFields'), form=document.getElementById('entryForm');
let currentType='';
function field(label,name,type='text',placeholder='',required=true,options=null){
  let control=options?`<select name="${name}" ${required?'required':''}>${options.map(o=>`<option value="${escapeHtml(o)}">${escapeHtml(o)}</option>`).join('')}</select>`:`<input name="${name}" type="${type}" placeholder="${placeholder}" ${required?'required':''} ${type==='number'?'min="0" step="0.01"':''}>`;
  return `<div class="field"><label>${label}</label>${control}</div>`;
}
function openForm(type,title,html){
  currentType=type;document.getElementById('dialogTitle').textContent=title;fields.innerHTML=html;dialog.showModal();
}
document.getElementById('addCardBtn').onclick=()=>openForm('card','Add a card',
  field('Card name','name','text','e.g. HDFC Millennia')+field('Card type','kind','text','Credit card')+field('Credit limit (₹)','limit','number','0')+field('Statement date (day of month)','statementDay','number','e.g. 10',false)+field('Due date (day of month)','dueDay','number','e.g. 25',false));
document.getElementById('addTransactionBtn').onclick=()=>openForm('transaction','Add transaction',
  field('Description','title','text','e.g. Monthly groceries')+field('Type','type','text','',true,['expense','income'])+field('Category','category','text','Groceries, fuel, salary...')+field('Amount (₹)','amount','number','0')+field('Date','date','date',new Date().toISOString().slice(0,10)));
document.getElementById('addBillBtn').onclick=()=>openForm('bill','Add bill or EMI',
  field('Bill name','name','text','e.g. Bike EMI')+field('Type','kind','text','EMI, rent, card bill...')+field('Monthly amount (₹)','amount','number','0')+field('Due day','dueDay','number','1–31',false));
document.getElementById('addGoalBtn').onclick=()=>openForm('goal','Create savings goal',
  field('Goal name','name','text','e.g. PlayStation 5')+field('Target amount (₹)','target','number','0')+field('Already saved (₹)','saved','number','0'));
form.addEventListener('submit',e=>{
  if(e.submitter?.value==='cancel')return;
  e.preventDefault();const data=Object.fromEntries(new FormData(form).entries());
  if(currentType==='card')db.cards.push({...data,id:crypto.randomUUID(),limit:Number(data.limit),color:'custom'});
  if(currentType==='transaction')db.transactions.push({...data,id:crypto.randomUUID(),amount:Number(data.amount)});
  if(currentType==='bill')db.bills.push({...data,id:crypto.randomUUID(),amount:Number(data.amount)});
  if(currentType==='goal')db.goals.push({...data,id:crypto.randomUUID(),target:Number(data.target),saved:Number(data.saved)});
  save();dialog.close();form.reset();toast('Saved on this device');
});
document.getElementById('privacyBtn').onclick=()=>alert('My Finance stores records locally in this browser in this prototype. It does not connect to banks or credit bureaus. Do not enter CVV, PIN, OTP or banking passwords.');
document.getElementById('exportBtn').onclick=()=>{
  const blob=new Blob([JSON.stringify(db,null,2)],{type:'application/json'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='my-finance-backup.json';a.click();URL.revokeObjectURL(a.href);toast('Backup exported');
};
document.getElementById('resetBtn').onclick=()=>{
  if(confirm('Reset My Finance data on this device? This cannot be undone unless you exported a backup.')){db=starter();save();toast('Starter data restored')}
};
