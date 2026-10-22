/* 先生用ページの復号（AES-256-GCM / PBKDF2-SHA256）。パスワードはここにもない */
(function(){"use strict";
var enc=JSON.parse(document.getElementById("enc").textContent),SK="uketsugi-kyoshi-key";
function b(s){var x=atob(s),u=new Uint8Array(x.length);for(var i=0;i<x.length;i++)u[i]=x.charCodeAt(i);return u;}
function show(key){return crypto.subtle.decrypt({name:"AES-GCM",iv:b(enc.iv)},key,b(enc.ct)).then(function(p){
 var doc=JSON.parse(new TextDecoder().decode(p)).html;document.open();document.write(doc);document.close();});}
function derive(pw){var e=new TextEncoder();return crypto.subtle.importKey("raw",e.encode(pw),"PBKDF2",false,["deriveKey"]).then(function(k){
 return crypto.subtle.deriveKey({name:"PBKDF2",salt:b(enc.salt),iterations:enc.iter,hash:"SHA-256"},k,{name:"AES-GCM",length:256},false,["decrypt"]);});}
var saved=null;try{saved=sessionStorage.getItem(SK);}catch(e){}
if(saved){derive(saved).then(show).catch(function(){try{sessionStorage.removeItem(SK);}catch(e){}});}
document.getElementById("f").addEventListener("submit",function(ev){ev.preventDefault();var pw=document.getElementById("pw").value;
 document.getElementById("err").textContent="ひらいています…";
 derive(pw).then(function(k){return show(k).then(function(){try{sessionStorage.setItem(SK,pw);}catch(e){}});})
 .catch(function(){document.getElementById("err").textContent="パスワードがちがいます";});});
})();
