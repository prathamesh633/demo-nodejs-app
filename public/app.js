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
      // Update styles using both classList and inline styles for compatibility
      t.classList.toggle('bg-indigo-600', active);
      t.classList.toggle('text-white', active);
      t.classList.toggle('bg-white', !active);
      t.classList.toggle('text-slate-700', !active);
      t.classList.toggle('ring-1', !active);
      t.classList.toggle('ring-slate-300', !active);
      t.classList.toggle('active', active);
      
      // Fallback inline styles
      if (active) {
        t.style.background = '#4f46e5';
        t.style.color = 'white';
        t.style.borderColor = '#4f46e5';
      } else {
        t.style.background = 'white';
        t.style.color = '#374151';
        t.style.borderColor = '#d1d5db';
      }
    });
    panels.forEach(function(p){
      var show = p.getAttribute('data-panel') === name;
      p.classList.toggle('hidden', !show);
      // Fallback inline styles
      p.style.display = show ? 'block' : 'none';
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
    el.innerHTML = '<div class="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center" style="flex-shrink: 0; width: 1.25rem; height: 1.25rem; border-radius: 9999px; display: flex; align-items: center; justify-content: center; ' + (type === 'error' ? 'background: #fef2f2; color: #dc2626;' : 'background: #f0fdf4; color: #16a34a;') + '"><span style="font-size: 0.75rem;">' + (type === 'error' ? '✕' : '✓') + '</span></div><div class="text-slate-700 text-sm" style="color: #374151; font-size: 0.875rem;">' + message + '</div>';
    toastRoot.appendChild(el);
    requestAnimationFrame(function(){
      el.classList.remove('translate-y-4','opacity-0');
      el.classList.add('translate-y-0','opacity-100');
      el.style.transform = 'translateY(0)';
      el.style.opacity = '1';
    });
    setTimeout(function(){
      el.classList.remove('opacity-100');
      el.classList.add('opacity-0');
      el.style.opacity = '0';
      setTimeout(function(){ if (toastRoot.contains(el)) toastRoot.removeChild(el); }, 300);
    }, 2500);
  }

  // Users list
  var usersList = document.getElementById('users-list');
  var emptyState = document.getElementById('users-empty');
  function renderUsers(users){
    usersList.innerHTML = '';
    if(!users || users.length === 0){
      emptyState.style.display = 'block';
      emptyState.classList.remove('hidden');
      return;
    }
    emptyState.style.display = 'none';
    emptyState.classList.add('hidden');
    users.forEach(function(u, idx){
      var card = document.createElement('div');
      card.className = 'transform transition-all duration-500 translate-y-3 opacity-0 user-item';
      card.style.transitionDelay = (idx * 60) + 'ms';
      card.innerHTML = '\n        <div style="background: white; border-radius: 0.5rem; border: 1px solid #e5e7eb; box-shadow: 0 1px 3px rgba(0,0,0,0.1); padding: 1rem; display: flex; align-items: center; justify-content: space-between;">\n          <div>\n            <div style="color: #111827; font-weight: 500;">' + (u.name || '-') + '</div>\n            <div style="color: #6b7280; font-size: 0.875rem;">Age: ' + (u.age ?? '-') + ' • City: ' + (u.city || '-') + '</div>\n          </div>\n          <div style="font-size: 0.75rem; color: #9ca3af;">#' + (u.id || '') + '</div>\n        </div>\n      ';
      usersList.appendChild(card);
      requestAnimationFrame(function(){
        requestAnimationFrame(function(){
          card.classList.remove('translate-y-3','opacity-0');
          card.classList.add('translate-y-0','opacity-100');
          card.style.transform = 'translateY(0)';
          card.style.opacity = '1';
        });
      });
    });
  }

  function fetchUsers(){
    fetch('/users')
      .then(function(r){ 
        if (!r.ok) {
          throw new Error('Failed to fetch users');
        }
        return r.json(); 
      })
      .then(function(data){ renderUsers(data.users); })
      .catch(function(err){ 
        console.error('Error fetching users:', err);
        showToast('Failed to load users data', 'error'); 
      });
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
