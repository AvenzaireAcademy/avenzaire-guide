import {questions,evaluate,outcomes,summaryFor,paceHints} from './quiz-data.mjs';
const $=id=>document.getElementById(id);
const answers=Array(questions.length).fill(null);let current=0;let result=null;
const config=window.AVENZAIRE_CONFIG||{};
const validUsername=v=>typeof v==='string'&&/^[A-Za-z][A-Za-z0-9_]{4,31}$/.test(v);
const contact=validUsername(config.consultationUsername)?config.consultationUsername:'AvenzaireEDU';
document.querySelectorAll('.consultation-link').forEach(a=>{a.href='https://t.me/'+contact});
if(validUsername(config.botUsername)){$('bot-link').href='https://t.me/'+config.botUsername+'?start=direction';$('bot-link').hidden=false}
function view(id){['intro','quiz','result'].forEach(name=>$(name).hidden=name!==id);window.scrollTo({top:0,behavior:'instant'})}
function renderQuestion(){
 const q=questions[current];$('question-count').textContent=`Вопрос ${current+1} из ${questions.length}`;$('question-title').textContent=q.title;$('question-category').textContent=q.category;$('question-hint').textContent=q.hint;
 const progress=document.querySelector('.progress-track');progress.setAttribute('aria-valuenow',String(current));$('progress-fill').style.width=`${current/questions.length*100}%`;
 const field=$('answers');field.querySelectorAll('label').forEach(n=>n.remove());
 q.options.forEach((o,i)=>{
  const label=document.createElement('label');label.className='answer';const radio=document.createElement('input');radio.type='radio';radio.name='question';radio.value=String(i);radio.checked=answers[current]===i;
  const copy=document.createElement('span');copy.className='answer-copy';copy.textContent=o.label;label.append(radio,copy);field.append(label);
  radio.addEventListener('change',()=>{answers[current]=i;$('next').disabled=false;$('selection-error').hidden=true});
 });
 $('back').disabled=current===0;$('next').disabled=answers[current]===null;$('next').replaceChildren(document.createTextNode(current===questions.length-1?'Посмотреть мой ориентир':'Дальше'));const arrow=document.createElement('span');arrow.textContent='→';arrow.setAttribute('aria-hidden','true');$('next').append(arrow);$('selection-error').hidden=true;$('question-title').focus({preventScroll:true});
}
function renderResult(){
 result=evaluate(answers);const o=outcomes[result.kind];$('result-title').textContent=o.title;$('result-intro').textContent=o.intro;$('trial-title').textContent=o.trialTitle;$('trial-body').textContent=o.trialBody+' Твой комфортный старт: «'+paceHints[result.pace]+'»';$('trial-prompt').textContent=o.prompt;$('course-hint').textContent=o.course;
 $('reasons').replaceChildren(...result.reasons.map(t=>{const li=document.createElement('li');li.textContent=t;return li}));$('interest-tags').replaceChildren(...o.tags.map(t=>{const span=document.createElement('span');span.textContent=t;return span}));
 $('summary-text').value=summaryFor(result);$('copy-status').textContent='Ответы не отправляются автоматически. Решение поделиться итогом — твоё.';$('copy-result').textContent='Скопировать итог';view('result');$('result-title').focus({preventScroll:true});
}
$('start').addEventListener('click',()=>{view('quiz');renderQuestion()});
$('next').addEventListener('click',()=>{if(answers[current]===null){$('selection-error').hidden=false;return}if(current===questions.length-1){renderResult();return}current++;renderQuestion();window.scrollTo({top:0,behavior:'instant'})});
$('back').addEventListener('click',()=>{if(current>0){current--;renderQuestion();window.scrollTo({top:0,behavior:'instant'})}});
$('exit-quiz').addEventListener('click',()=>{view('intro');$('start').textContent='Продолжить опрос →';$('start').focus({preventScroll:true})});
$('change-answers').addEventListener('click',()=>{current=0;view('quiz');renderQuestion()});
$('restart').addEventListener('click',()=>{answers.fill(null);current=0;result=null;$('summary-text').value='';view('quiz');renderQuestion()});
$('copy-result').addEventListener('click',async()=>{
 try{if(!navigator.clipboard?.writeText)throw new Error('Clipboard not supported');await navigator.clipboard.writeText($('summary-text').value);$('copy-status').textContent='Итог скопирован. Теперь можно открыть Telegram и вставить его в сообщение.';$('copy-result').textContent='Итог скопирован ✓'}
 catch{$('summary-text').closest('details').open=true;$('summary-text').focus();$('summary-text').select();$('copy-status').textContent='Не получилось скопировать автоматически. Итог выделен ниже — скопируй его вручную.'}
});
const dialog=$('privacy-dialog');document.querySelectorAll('[data-open-privacy]').forEach(button=>button.addEventListener('click',()=>dialog.showModal()));$('close-privacy').addEventListener('click',()=>dialog.close());dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close()});
