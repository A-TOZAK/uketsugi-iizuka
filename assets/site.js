// メニューの開閉（スマホ）
(function(){var b=document.querySelector('.nav-toggle'),n=document.querySelector('.gnav');if(!b||!n)return;
b.addEventListener('click',function(){var o=n.classList.toggle('open');b.setAttribute('aria-expanded',o?'true':'false')});
n.querySelectorAll('a').forEach(function(a){a.addEventListener('click',function(){n.classList.remove('open')})});})();
// いまここ：見ている箱をバーで光らせる
(function(){var links=document.querySelectorAll('.stepnav a[data-step]');if(!links.length||!('IntersectionObserver' in window))return;
var cur=null;function set(id){if(cur===id)return;cur=id;links.forEach(function(a){a.classList.toggle('on',a.dataset.step===id)});}
var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting)set(e.target.id)})},{rootMargin:'-28% 0px -62% 0px',threshold:0});
links.forEach(function(a){var el=document.getElementById(a.dataset.step);if(el)io.observe(el)});})();
// トップ：きょうの時間を光らせる（日付の表から）
(function(){var box=document.getElementById('today');if(!box)return;var DATES=["10/6（火）4校時", "10/9（金）4校時", "10/16（金）2校時", "10/20（火）4校時", "10/23（金）2校時", "10/26（月）2校時", "10/27（火）4校時", "10/30（金）2校時", "11/2（月）2校時", "11/6（金）2校時"];var d=new Date();var key=(d.getMonth()+1)+'/'+d.getDate();
for(var i=0;i<DATES.length;i++){if(DATES[i].indexOf(key+'（')===0){var a=document.getElementById('today-link');a.textContent='第'+(i+1)+'時　'+DATES[i];a.href='h'+String(i+1).padStart(2,'0')+'.html';box.hidden=false;
var c=document.querySelectorAll('.lcard')[i];if(c)c.classList.add('today');break}}})();
// 付箋：タップではがす
(function(){document.querySelectorAll('.fusen').forEach(function(b){b.addEventListener('click',function(){var w=b.closest('.fusen-wrap');b.classList.add('peel');setTimeout(function(){w.classList.add('open');b.remove()},420)})})})();
// しらべメモ・確かめるチェック：この端末のブラウザにだけ残す（送信しない）。保存できない環境でも画面はそのまま使える
(function(){var NS='uketsugi-iizuka:';
function get(k){try{return localStorage.getItem(NS+k)}catch(e){return null}}
function put(k,v){try{if(v===''||v===null)localStorage.removeItem(NS+k);else localStorage.setItem(NS+k,v);return true}catch(e){return false}}
function flash(el,ok){var s=el.closest('.memo,.block')&&el.closest('.memo,.block').querySelector('.saved');if(!s)return;s.textContent=ok?'このタブレットに残しました':'このブラウザでは残せません（ノートに書いてね）';clearTimeout(s._t);s._t=setTimeout(function(){s.textContent=''},2200)}
document.querySelectorAll('textarea[data-k]').forEach(function(t){var v=get(t.dataset.k);if(v)t.value=v;var tm;
t.addEventListener('input',function(){clearTimeout(tm);tm=setTimeout(function(){var ok=put(t.dataset.k,t.value);flash(t,ok);
document.querySelectorAll('textarea[data-k="'+t.dataset.k+'"]').forEach(function(o){if(o!==t)o.value=t.value})},400)})});
document.querySelectorAll('input[data-ck]').forEach(function(c){c.checked=get('ck:'+c.dataset.ck)==='1';c.addEventListener('change',function(){put('ck:'+c.dataset.ck,c.checked?'1':'')})});
var pr=document.getElementById('nb-print');if(pr)pr.addEventListener('click',function(){window.print()});
var cp=document.getElementById('nb-copy');if(cp)cp.addEventListener('click',function(){var out=[];
document.querySelectorAll('.nb-lesson').forEach(function(b){var h=b.querySelector('h3').innerText.replace(/\n/g,'');var parts=[];
b.querySelectorAll('.memo-f').forEach(function(f){var v=f.querySelector('textarea').value.trim();if(v)parts.push('【'+f.querySelector('.mt').innerText+'】'+v)});
if(parts.length)out.push(h+'\n'+parts.join('\n'))});
var txt=out.join('\n\n')||'（まだメモはありません）';var s=document.querySelector('.note-tools .saved');
function done(){if(s){s.textContent='コピーしました';setTimeout(function(){s.textContent=''},2200)}}
if(navigator.clipboard)navigator.clipboard.writeText(txt).then(done,function(){prompt('コピーしてください',txt)});else prompt('コピーしてください',txt)});
})();
