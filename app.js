(function(){
  var T=window.I18N,btn=document.getElementById('menuBtn'),nav=document.getElementById('nav');
  function setMenu(o){nav.classList.toggle('open',o);btn.setAttribute('aria-expanded',o);btn.textContent=o?'✕':'☰'}
  btn.addEventListener('click',function(){setMenu(!nav.classList.contains('open'))});
  nav.addEventListener('click',function(e){if(e.target.tagName==='A')setMenu(false)});
  var form=document.getElementById('leadForm'),st=document.getElementById('status');
  form.addEventListener('submit',function(e){
    e.preventDefault();
    if(!form.checkValidity()){form.reportValidity();return}
    var b=form.querySelector('button'),d=new FormData(form);
    b.disabled=true;st.textContent=T.sending;
    fetch('/api/lead',{method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({name:d.get('name'),contact:d.get('contact'),task:d.get('task'),website:d.get('website'),lang:document.documentElement.lang})})
    .then(function(r){return r.json().then(function(j){return{ok:r.ok,j:j}})})
    .then(function(x){
      if(x.ok){form.reset();st.textContent=T.ok}
      else{st.textContent=x.j.error||T.fail}
    })
    .catch(function(){st.textContent=T.fail})
    .finally(function(){b.disabled=false});
  });
})();
