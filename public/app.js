// Client-side dynamic UI/UX for the demo app
(function(){
  // Background slideshow
  var images = [
    'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=1600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=1600&auto=format&fit=crop'
  ];
  var i = 0;
  function setBg(el, url){ if(el) el.style.backgroundImage = 'url(' + url + ')'; }
  function cycle(){
    var nextIdx = (i + 1) % images.length;
    setBg(bgNext, images[nextIdx]);
    bgNext.classList.remove('opacity-0');
    bgNext.classList.add('opacity-100');
    bgLayer.classList.remove('opacity-100');
    bgLayer.classList.add('opacity-0');
    var tmp = bgLayer; bgLayer = bgNext; bgNext = tmp; i = nextIdx;
  }

  var bgLayer = document.getElementById('bgLayer');
  var bgNext = document.getElementById('bgLayerNext');
  setBg(bgLayer, images[0]);
  setInterval(cycle, 8000);

  // Tabs
  var tabs = document.querySelectorAll('[data-tab]');
  var panels = document.querySelectorAll('[data-panel]');
  function activateTab(name){
    tabs.forEach(function(t){
      var active = t.getAttribute('data-tab') === name;
      t.classList.toggle('bg-indigo-600', active);
      t.classList.toggle('text-white', active);
      t.classList.toggle('bg-white', !active);
      t.classList.toggle('text-slate-700', !active);
      t.classList.toggle('ring-1', !active);
      t.classList.toggle('ring-slate-300', !active);
    });
    panels.forEach(function(p){
      var show = p.getAttribute('data-panel') === name;
      p.classList.toggle('hidden', !show);
    });
  }
  tabs.forEach(function(t){
    t.addEventListener('click', function(){ activateTab(t.getAttribute('data-tab')); });
  });

  // Toasts
  var toastRoot = document.getElementById('toast-root');
  function showToast(message, type){
    var el = document.createElement('div');
    el.className = 'pointer-events-auto max-w-xs w-full bg-white ring-1 ring-slate-900/5 shadow-xl rounded-lg px-4 py-3 flex items-start gap-3 translate-y-4 opacity-0 transition-all duration-300';
    var color = type === 'error' ? 'text-red-600 bg-red-100' : 'text-green-600 bg-green-100';
    el.innerHTML = '\n      <div class="h-8 w-8 rounded-full flex items-center justify-center ' + color + '">\n        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5">\n          ' + (type === 'error' ? '<path fill-rule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-1.06 6.44a.75.75 0 0 0-1.06 1.06L10.94 12l-1.06 1.06a.75.75 0 1 0 1.06 1.06L12 13.06l1.06 1.06a.75.75 0 0 0 1.06-1.06L13.06 12l1.06-1.06a.75.75 0 1 0-1.06-1.06L12 10.94l-1.06-1.06Z" clip-rule="evenodd"/>' : '<path fill-rule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-2.59a.75.75 0 1 0-1.06-1.06L10.5 12.44l-1.49-1.49a.75.75 0 1 0-1.06 1.06l2.02 2.02c.293.293.767.293 1.06 0l4.68-4.62Z" clip-rule="evenodd"/>') + '\n        </svg>\n      </div>\n      <div class="text-sm text-slate-800">' + message + '</div>\n    ';
    toastRoot.appendChild(el);
    requestAnimationFrame(function(){
      el.classList.remove('translate-y-4','opacity-0');
      el.classList.add('translate-y-0','opacity-100');
    });
    setTimeout(function(){
      el.classList.remove('opacity-100');
      el.classList.add('opacity-0');
      setTimeout(function(){ toastRoot.removeChild(el); }, 300);
    }, 2500);
  }

  // Users list
  var usersList = document.getElementById('users-list');
  var emptyState = document.getElementById('users-empty');
  function renderUsers(users){
    usersList.innerHTML = '';
    if(!users || users.length === 0){
      emptyState.classList.remove('hidden');
      return;
    }
    emptyState.classList.add('hidden');
    users.forEach(function(u, idx){
      var card = document.createElement('div');
      card.className = 'transform transition-all duration-500 translate-y-3 opacity-0';
      card.style.transitionDelay = (idx * 60) + 'ms';
      card.innerHTML = '\n        <div class="bg-white rounded-lg ring-1 ring-slate-900/5 shadow-xl shadow-slate-200/70 p-4 flex items-center justify-between">\n          <div>\n            <div class="text-slate-900 font-medium">' + (u.name || '-') + '</div>\n            <div class="text-slate-500 text-sm">Age: ' + (u.age ?? '-') + ' • City: ' + (u.city || '-') + '</div>\n          </div>\n          <div class="text-xs text-slate-400">#' + (u.id || '') + '</div>\n        </div>\n      ';
      usersList.appendChild(card);
      requestAnimationFrame(function(){
        requestAnimationFrame(function(){
          card.classList.remove('translate-y-3','opacity-0');
          card.classList.add('translate-y-0','opacity-100');
        });
      });
    });
  }

  function fetchUsers(){
    fetch('/users')
      .then(function(r){ return r.json(); })
      .then(function(data){ renderUsers(data); })
      .catch(function(){ /* ignore for now */ });
  }

  // Form submit via AJAX
  var form = document.getElementById('user-form');
  if(form){
    form.addEventListener('submit', function(e){
      e.preventDefault();
      var fd = new FormData(form);
      var params = new URLSearchParams(fd);
      fetch('/submit', { method: 'POST', headers: { 'Content-Type':'application/x-www-form-urlencoded' }, body: params })
        .then(function(){
          showToast('User added successfully','success');
          form.reset();
          activateTab('users');
          fetchUsers();
        })
        .catch(function(){ showToast('Failed to add user','error'); });
    });
  }

  // Initial UI state
  activateTab('form');
  fetchUsers();
})();
