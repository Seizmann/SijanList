const DEFAULT_BOARDS = [{id:"b1",name:"AI & Tech",bookmarks:[{id:"1",title:"ChatGPT",url:"https://chatgpt.com",description:"AI model"},{id:"2",title:"GitHub",url:"https://github.com",description:"Code"}]}];
        const BG_IMGS = ["Blue Green Photocentric Elegant Natural Mountain Inspiration Desktop Wallpaper.png","Blue White Minimalist New Happy Creative Elegant Abstract Beautiful Mountain Desktop Wallpaper.png","Blue and Black Modern Mountains Desktop Wallpaper.png","Gray and Green Minimalist Quote Desktop Wallpaper.png","Green Illustration Desktop Wallpaper.png"];
        let dashboardData = { pages: [{ name: "Home", boards: JSON.parse(JSON.stringify(DEFAULT_BOARDS)) }], activePage: 0, bgImage: 'default', privacyMode: false };
        let trashData = []; let currentMenuBoardId = null;

        function init() {
            navigator.platform.toUpperCase().indexOf('MAC')>=0 ? document.querySelector('.search-shortcut').innerText='⌘K' : null;
            document.addEventListener('click', (e) => { const m = document.getElementById('boardMenu'); if(!e.target.closest('#boardMenu') && !e.target.closest('.menu-trigger')){ m.classList.remove('visible'); m.classList.add('hidden'); } });
            document.addEventListener('keydown', (e) => { 
                if((e.ctrlKey||e.metaKey)&&e.key==='k'){e.preventDefault();document.getElementById('searchInput').focus();} 
                if(e.key==='Escape'){closeAllModals();document.getElementById('searchInput').blur();} 
                if(document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA' && (e.key === 'p' || e.key === 'P')) { e.preventDefault(); togglePrivacy(); }
            });
            document.getElementById('searchInput').addEventListener('input', e => renderGrid(e.target.value));
            document.getElementById('importInput').addEventListener('change', importBookmarks);
            document.getElementById('bmCategory').addEventListener('change', e => { if(e.target.value==="NEW"){ const n=prompt("Board name:"); if(n&&n.trim()){ const id="b_"+Date.now(); getActiveBoards().push({id,name:n.trim(),bookmarks:[]}); saveData(); renderGrid(); e.target.value=id; } else e.target.selectedIndex=0; } });
            
            loadData(); applyBackground(); renderTabs(); renderGrid(); generateBgGallery(); applyPrivacyState();
        }

        function loadData() {
            const stored = localStorage.getItem('bm_dashboard_v3'); if(stored) { try { dashboardData = JSON.parse(stored); } catch(e){} }
            const trash = localStorage.getItem('bm_trash'); if(trash) { try { trashData = JSON.parse(trash); } catch(e){} }
            if(!dashboardData.pages || !dashboardData.pages.length) dashboardData = { pages: [{ name: "Home", boards: JSON.parse(JSON.stringify(DEFAULT_BOARDS)) }], activePage: 0, bgImage: 'default', privacyMode: false };
            saveData(); 
        }
        function saveData() { localStorage.setItem('bm_dashboard_v3', JSON.stringify(dashboardData)); localStorage.setItem('bm_trash', JSON.stringify(trashData)); updateCategorySelect(); }
        function getActiveBoards() { return dashboardData.pages[dashboardData.activePage].boards; }
        
        function updateCategorySelect() { const s = document.getElementById('bmCategory'); s.innerHTML=''; getActiveBoards().forEach(b=>{ const o=document.createElement('option');o.value=b.id;o.innerText=b.name;s.appendChild(o); }); const n=document.createElement('option');n.value="NEW";n.innerText="+ New Board";s.appendChild(n); }
        function getFavicon(url) { try { return `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=64`; } catch(e) { return 'https://via.placeholder.com/64/1e293b/FFFFFF?text=B'; } }

        /* Privacy Mode */
        function togglePrivacy() {
            dashboardData.privacyMode = !dashboardData.privacyMode; saveData(); applyPrivacyState();
            if(navigator.vibrate) navigator.vibrate(50);
        }
        function applyPrivacyState() {
            const btn = document.getElementById('privacyBtn'); const ind = document.getElementById('privacyIndicator');
            if(dashboardData.privacyMode) {
                document.body.classList.add('privacy-mode');
                btn.classList.add('active-tool'); btn.innerHTML = '<i class="fa-solid fa-eye-slash"></i>'; ind.classList.add('visible');
            } else {
                document.body.classList.remove('privacy-mode');
                btn.classList.remove('active-tool'); btn.innerHTML = '<i class="fa-solid fa-eye"></i>'; ind.classList.remove('visible');
            }
        }

        /* Modals Unified */
        function showModal(id, boxId) { document.getElementById('modalOverlay').classList.remove('opacity-0','pointer-events-none'); document.getElementById(id).classList.remove('opacity-0','pointer-events-none'); const b=document.getElementById(boxId); b.classList.remove('scale-95'); setTimeout(()=>b.focus(), 50); }
        function closeAllModals() { 
            document.getElementById('modalOverlay').classList.add('opacity-0','pointer-events-none');
            ['bookmarkModal','pageModal','settingsModal','aboutModal','trashModal'].forEach(id=>{ document.getElementById(id).classList.add('opacity-0','pointer-events-none'); });
            ['modalBox','pageModalBox','settingsModalBox','aboutModalBox','trashModalBox'].forEach(id=>{ document.getElementById(id).classList.add('scale-95'); });
        }

        function openModal(mode, bId='', id='') { document.getElementById('bookmarkForm').reset(); document.getElementById('bmMode').value=mode; if(mode==='edit'){ const bm=getActiveBoards().find(b=>b.id===bId).bookmarks.find(x=>x.id===id); document.getElementById('modalTitle').innerHTML='<i class="fa-solid fa-pen text-purple-400"></i> Edit Bookmark'; document.getElementById('saveBtnText').innerText='Save'; document.getElementById('categoryWrapper').style.display='none'; document.getElementById('bmCategory').removeAttribute('required'); document.getElementById('bmUrl').value=bm.url; document.getElementById('bmTitle').value=bm.title; document.getElementById('bmDesc').value=bm.description||''; document.getElementById('editBId').value=bId; document.getElementById('editId').value=id; } else { document.getElementById('modalTitle').innerHTML='<i class="fa-solid fa-link text-cyan-400"></i> Add Bookmark'; document.getElementById('saveBtnText').innerText='Save'; document.getElementById('categoryWrapper').style.display='block'; document.getElementById('bmCategory').setAttribute('required','true'); } updateCharCount(); showModal('bookmarkModal','modalBox'); }
        function saveBookmark(e) { e.preventDefault(); const mode=document.getElementById('bmMode').value, url=document.getElementById('bmUrl').value, title=document.getElementById('bmTitle').value, desc=document.getElementById('bmDesc').value; if(mode==='add'){ const bm={id:"bm_"+Date.now(),title,url,description:desc}; getActiveBoards().find(b=>b.id===document.getElementById('bmCategory').value).bookmarks.push(bm); } else { const bm=getActiveBoards().find(b=>b.id===document.getElementById('editBId').value).bookmarks.find(x=>x.id===document.getElementById('editId').value); bm.url=url;bm.title=title;bm.description=desc; } saveData(); document.getElementById('searchInput').value=''; renderGrid(); closeAllModals(); }
        function autoFillTitle(){const u=document.getElementById('bmUrl').value;if(u)try{document.getElementById('bmTitle').value=new URL(u).hostname.replace('www.','').split('.')[0].replace(/\b\w/g,c=>c.toUpperCase());}catch(e){}}
        function updateCharCount(){const c=document.getElementById('bmDesc').value.length; document.getElementById('descCount').innerText=`${c}/2000`; document.getElementById('descCount').className=c>=2000?'text-red-400':'text-gray-500';}

        function openPageModal(type, isEdit, id='') { document.getElementById('addPageForm').reset(); document.getElementById('pType').value=type; document.getElementById('pId').value=isEdit?id:''; const title=document.getElementById('pageModalTitle'), label=document.getElementById('pageModalLabel'), btn=document.getElementById('pageModalBtn'), input=document.getElementById('pInput'); input.classList.remove('border-red-500'); if(type==='page'){title.innerHTML=`<i class="fa-solid fa-layer-group text-purple-400"></i> ${isEdit?'Edit Page':'New Page'}`; label.innerText="Page Name"; if(isEdit)input.value=dashboardData.pages[id].name; btn.innerText=isEdit?"Save":"Create";}else{title.innerHTML=`<i class="fa-solid fa-clipboard text-cyan-400"></i> ${isEdit?'Edit Board Name':'New Board'}`; label.innerText="Board Name"; if(isEdit)input.value=getActiveBoards().find(b=>b.id===id).name; btn.innerText=isEdit?"Save":"Create";} showModal('pageModal','pageModalBox'); }
        function savePageModal(e){ e.preventDefault(); const v=document.getElementById('pInput').value.trim(); if(!v) return document.getElementById('pInput').classList.add('border-red-500'); const t=document.getElementById('pType').value, id=document.getElementById('pId').value; if(t==='page'){ if(id!=='') dashboardData.pages[id].name=v; else{dashboardData.pages.push({name:v,boards:[]});dashboardData.activePage=dashboardData.pages.length-1;} renderTabs(); renderGrid(); }else{ if(id!=='') getActiveBoards().find(b=>b.id===id).name=v; else getActiveBoards().push({id:"b_"+Date.now(),name:v,bookmarks:[]}); renderGrid(document.getElementById('searchInput').value); } saveData(); closeAllModals(); }

        function openSettingsModal(){ showModal('settingsModal','settingsModalBox'); }
        function openAboutModal(){ showModal('aboutModal','aboutModalBox'); }

        /* Trash System */
        function deleteBookmark(e, bId, id, btn) {
            e.preventDefault(); e.stopPropagation();
            const b = getActiveBoards().find(x=>x.id===bId); const idx = b.bookmarks.findIndex(x=>x.id===id);
            if(idx > -1) {
                const bm = b.bookmarks[idx]; trashData.push({ id: "t_"+Date.now(), type: 'bookmark', data: bm, origin: { pageId: dashboardData.activePage, boardId: bId }, deletedAt: Date.now() });
                const itemEl = btn.closest('.bookmark-item'); itemEl.style.transition = 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'; itemEl.style.opacity = '0'; itemEl.style.transform = 'scale(0.9) translateX(-10px)';
                setTimeout(() => { b.bookmarks.splice(idx,1); saveData(); renderGrid(document.getElementById('searchInput').value); }, 300);
            }
        }
        function openTrashModal() { renderTrash(); showModal('trashModal','trashModalBox'); }
        function renderTrash() {
            const grid = document.getElementById('trashGrid'); grid.innerHTML = '';
            if(!trashData.length) { grid.innerHTML = `<div class="flex flex-col items-center justify-center h-full text-slate-500"><i class="fa-solid fa-recycle text-5xl mb-4 opacity-30"></i><p>Trash is empty.</p></div>`; return; }
            trashData.slice().reverse().forEach(itm => {
                const isBoard = itm.type === 'board';
                const icon = isBoard ? 'fa-clipboard' : 'fa-link'; const name = isBoard ? itm.data.name : itm.data.title;
                const url = isBoard ? `${itm.data.bookmarks.length} items` : itm.data.url;
                const d = new Date(itm.deletedAt).toLocaleString();
                grid.innerHTML += `
                    <div class="glass-card mb-2 !p-3 flex justify-between items-center group/item hover:bg-white/5 border-white/5 animate-appear">
                        <div class="flex items-center gap-3 overflow-hidden">
                            <div class="w-10 h-10 rounded-lg bg-black/30 flex items-center justify-center border border-white/5 shrink-0"><i class="fa-solid ${icon} text-${isBoard?'cyan':'purple'}-400"></i></div>
                            <div class="flex flex-col"><span class="text-sm font-semibold text-white truncate max-w-[200px]">${name}</span><span class="text-xs text-gray-500 truncate max-w-[200px]">${url}</span></div>
                        </div>
                        <div class="flex gap-2 shrink-0">
                            <button class="w-8 h-8 rounded bg-green-500/10 text-green-400 hover:bg-green-500 hover:text-white flex justify-center items-center transition-all" data-onclick="restoreTrash('${itm.id}')" title="Restore"><i class="fa-solid fa-reply"></i></button>
                            <button class="w-8 h-8 rounded bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white flex justify-center items-center transition-all" data-onclick="permDelete('${itm.id}')" title="Delete Forever"><i class="fa-solid fa-xmark"></i></button>
                        </div>
                    </div>`;
            });
        }
        function restoreTrash(id) {
            const idx = trashData.findIndex(x=>x.id===id); if(idx===-1) return; const itm = trashData[idx];
            if(itm.type === 'board') {
                if(dashboardData.pages[itm.origin.pageId]) dashboardData.pages[itm.origin.pageId].boards.push(itm.data);
                else { dashboardData.pages.push({name:"Restored Page",boards:[itm.data]}); }
            } else if (itm.type === 'bookmark') {
                if(dashboardData.pages[itm.origin.pageId]) {
                    const board = dashboardData.pages[itm.origin.pageId].boards.find(b=>b.id===itm.origin.boardId);
                    if(board) board.bookmarks.push(itm.data); else { dashboardData.pages[itm.origin.pageId].boards.push({id:itm.origin.boardId,name:"Restored Board",bookmarks:[itm.data]}); }
                } else dashboardData.pages[0].boards[0].bookmarks.push(itm.data);
            }
            trashData.splice(idx,1); saveData(); renderTrash(); renderGrid();
        }
        function permDelete(id) { if(confirm("Permanently delete this item?")) { trashData = trashData.filter(x=>x.id!==id); saveData(); renderTrash(); } }
        function emptyTrash() { if(trashData.length && confirm("Empty trash completely? This cannot be undone.")) { trashData=[]; saveData(); renderTrash(); } }

        /* Boards & Grid Content */
        function renderTabs() {
            const container = document.getElementById('tabsContainer'); let html = '';
            dashboardData.pages.forEach((page, idx) => {
                const isActive = (idx === dashboardData.activePage); const activeClasses = isActive ? 'bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border-cyan-400/50 text-white shadow-[0_0_15px_rgba(6,182,212,0.2)] scale-[1.03]' : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10';
                html += `<div class="relative group/tab animate-appear"><button data-onclick="switchTab(${idx})" class="px-5 py-2.5 rounded-2xl border backdrop-blur-md text-sm font-semibold transition-all ${activeClasses}">${page.name}</button><div class="absolute -top-2 -right-2 hidden group-hover/tab:flex gap-1 opacity-0 group-hover/tab:opacity-100 transition-opacity z-30"><button class="w-6 h-6 rounded-full bg-blue-500/90 text-white flex justify-center items-center shadow-lg hover:scale-110 text-[10px]" data-onclick="openPageModal('page',true,${idx})"><i class="fa-solid fa-pen"></i></button>${dashboardData.pages.length>1?`<button class="w-6 h-6 rounded-full bg-red-500/90 text-white flex justify-center items-center shadow-lg hover:scale-110 text-[11px]" data-onclick="deletePage(event,${idx})"><i class="fa-solid fa-xmark"></i></button>`:''}</div></div>`;
            }); html += `<button data-onclick="openPageModal('page',false)" class="w-11 h-11 rounded-2xl border border-white/10 bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 hover:border-cyan-400/30 shadow transition-all ml-1"><i class="fa-solid fa-plus text-lg"></i></button>`; container.innerHTML = html;
        }
        function switchTab(index) { if (index===dashboardData.activePage) return; const grid=document.getElementById('bookmarkGrid'); grid.style.opacity='0'; grid.style.transform='translateY(15px) scale(0.98)'; setTimeout(()=>{ dashboardData.activePage=index; saveData(); renderTabs(); renderGrid(); grid.style.transform='translateY(-15px) scale(0.98)'; requestAnimationFrame(()=>{ grid.style.opacity='1'; grid.style.transform='translateY(0) scale(1)'; }); }, 300); }
        function deletePage(e, i) { e.stopPropagation(); if(confirm(`Delete page "${dashboardData.pages[i].name}"?`)){ dashboardData.pages.splice(i,1); dashboardData.activePage=Math.max(0,dashboardData.pages.length-1); saveData(); renderTabs(); switchTab(dashboardData.activePage); } }

        function openBoardMenu(e, id) { e.stopPropagation(); currentMenuBoardId=id; const m=document.getElementById('boardMenu'); const r=e.currentTarget.getBoundingClientRect(); m.style.top=`${r.bottom+window.scrollY+8}px`; m.style.left='auto'; m.style.right='auto'; if((r.left+160)>window.innerWidth) m.style.right=`${window.innerWidth-r.right}px`; else m.style.left=`${r.right-160}px`; m.classList.remove('hidden'); m.classList.add('visible'); }
        function handleMenuAction(a) { document.getElementById('boardMenu').classList.remove('visible'); document.getElementById('boardMenu').classList.add('hidden'); const b=getActiveBoards().find(x=>x.id===currentMenuBoardId); if(!b) return; if(a==='edit'){openPageModal('board',true,currentMenuBoardId);}else if(a==='delete'){ if(confirm(`Move board "${b.name}" to trash?`)){ trashData.push({id:"t_"+Date.now(), type:'board', data:b, origin:{pageId:dashboardData.activePage}, deletedAt:Date.now()}); const c=document.querySelector(`.glass-card[data-id="${currentMenuBoardId}"]`); if(c){c.style.opacity='0';c.style.transform='scale(0.9)';} setTimeout(()=>{ dashboardData.pages[dashboardData.activePage].boards=getActiveBoards().filter(x=>x.id!==currentMenuBoardId); saveData(); renderGrid(); }, 300); } }else if(a==='open'){b.bookmarks.forEach(x=>window.open(x.url,'_blank'));}else if(a==='fetch'){b.bookmarks.forEach(x=>{try{x.title=new URL(x.url).hostname.replace('www.','').split('.')[0].replace(/\b\w/g,c=>c.toUpperCase());}catch(e){}}); saveData(); renderGrid(); } }

        function renderGrid(filter='') {
            const grid=document.getElementById('bookmarkGrid'); grid.innerHTML=''; filter=filter.toLowerCase();
            getActiveBoards().forEach((board, i) => {
                const arr=board.bookmarks.filter(b=>b.title.toLowerCase().includes(filter)||b.url.toLowerCase().includes(filter)||board.name.toLowerCase().includes(filter)||(b.description&&b.description.toLowerCase().includes(filter))); if(arr.length===0&&filter!=='')return;
                const card=document.createElement('div'); card.className='glass-card p-5 group animate-appear relative z-10'; card.style.animationDelay=`${i*50}ms`; card.dataset.id=board.id;
                let html=`<div class="board-header flex justify-between items-center mb-4 pb-3"><h3 class="text-lg font-bold text-white board-name">${board.name} <span class="text-xs text-gray-500 ml-1 bg-white/5 px-2 py-0.5 rounded-md">${arr.length}</span></h3><button data-onclick="openBoardMenu(event,'${board.id}')" class="menu-trigger w-8 h-8 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 opacity-0 group-hover:opacity-100 transition"><i class="fa-solid fa-ellipsis-vertical"></i></button></div><div class="sortable-list space-y-1.5 min-h-[10px]" data-board="${board.id}">`;
                arr.forEach(b=>{ html+=`<a href="${dashboardData.privacyMode?'javascript:void(0)':b.url}" ${dashboardData.privacyMode?'':'target="_blank"'} class="bookmark-item group/item" data-id="${b.id}" data-onclick="handleLinkClick(event)"><div class="flex items-center gap-3 overflow-hidden pointer-events-none w-full"><img src="${getFavicon(b.url)}" class="bookmark-favicon"><div class="flex flex-col overflow-hidden w-full"><span class="bookmark-title truncate">${b.title}</span>${b.description?`<span class="bookmark-desc">${b.description}</span>`:''}</div></div><div class="flex gap-1.5 opacity-0 group-hover/item:opacity-100 transition duration-300 translate-x-2 group-hover/item:translate-x-0 z-20"><button data-onclick="openModal('edit','${board.id}','${b.id}')" class="w-[28px] h-[28px] rounded bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white shadow-sm"><i class="fa-solid fa-pen text-[11px]"></i></button><button data-onclick="deleteBookmark(event,'${board.id}','${b.id}',this)" class="w-[28px] h-[28px] rounded bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white shadow-sm"><i class="fa-solid fa-trash text-[11px]"></i></button></div></a>`; });
                card.innerHTML=html+`</div>`; grid.appendChild(card);
            });
            document.querySelectorAll('.sortable-list').forEach(l=>new Sortable(l,{group:'shared',animation:250,handle:'.bookmark-item',filter:'button',ghostClass:'opacity-30',onEnd:function(e){const bs=getActiveBoards();const from=bs.find(x=>x.id===e.from.dataset.board);const to=bs.find(x=>x.id===e.to.dataset.board);const i=from.bookmarks.findIndex(x=>x.id===e.item.dataset.id);if(i>-1){to.bookmarks.splice(e.newIndex,0,from.bookmarks.splice(i,1)[0]);saveData();}}}));
            new Sortable(document.getElementById('bookmarkGrid'),{animation:250,handle:'.board-header',ghostClass:'opacity-50',onEnd:function(){const ns=[];getActiveBoards();document.querySelectorAll('.glass-card').forEach(c=>{const b=getActiveBoards().find(x=>x.id===c.dataset.id);if(b)ns.push(b);});dashboardData.pages[dashboardData.activePage].boards=ns;saveData();}});
        }
        function handleLinkClick(e){if(e.target.closest('button')){e.preventDefault();e.stopPropagation();}}
        
        /* Utils */
        function applyBackground() { const bl=document.getElementById('custom-bg-layer'); const ol=document.getElementById('bg-overlay'); if(dashboardData.bgImage==='default'||!dashboardData.bgImage){bl.style.opacity='0';ol.style.opacity='0';}else{bl.style.backgroundImage=`url('./asset/bg-img/${dashboardData.bgImage}')`;bl.style.opacity='1';ol.style.opacity='1';} }
        function setBackground(n) { dashboardData.bgImage=n; saveData(); applyBackground(); document.querySelectorAll('.bg-thumb').forEach(t=>t.dataset.img===n?t.classList.add('active'):t.classList.remove('active')); }
        function generateBgGallery() { const g=document.getElementById('bgGallery'); g.innerHTML=`<div class="bg-thumb relative rounded-xl aspect-video bg-gradient-to-br from-slate-900 to-indigo-900 flex items-center justify-center ${dashboardData.bgImage==='default'?'active':''}" data-img="default" data-onclick="setBackground('default')"><span class="text-white text-xs font-semibold px-2">Default</span></div>`; BG_IMGS.forEach(i=>{g.innerHTML+=`<div class="bg-thumb relative rounded-xl aspect-video bg-slate-800 ${dashboardData.bgImage===i?'active':''}" data-img="${i}" data-onclick="setBackground('${i}')"><img src="./asset/bg-img/${i}" class="w-full h-full object-cover opacity-80" loading="lazy"></div>`;}); }
        function exportBookmarks(){const a=document.createElement('a');a.href="data:text/json;charset=utf-8,"+encodeURIComponent(JSON.stringify({d:dashboardData,t:trashData}));a.download='bookmarks_backup.json';document.body.appendChild(a);a.click();a.remove();}
        function importBookmarks(e){const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=evt=>{try{const d=JSON.parse(evt.target.result);if(d.pages)dashboardData=d;else if(d.d){dashboardData=d.d;trashData=d.t||[];}saveData();renderTabs();renderGrid();alert('Success');}catch(err){alert('Format error');}};r.readAsText(f);e.target.value='';}
        function resetData(){if(confirm('Reset EVERYTHING?')){dashboardData={pages:[{name:"Home",boards:JSON.parse(JSON.stringify(DEFAULT_BOARDS))}],activePage:0,bgImage:'default',privacyMode:false};trashData=[];saveData();applyBackground();applyPrivacyState();renderTabs();renderGrid();}}
        init();
    

// Chrome Extension MV3 Inline Handler Delegator
document.addEventListener('DOMContentLoaded', () => {
    document.addEventListener('click', (e) => {
        const el = e.target.closest('[data-onclick]');
        if (!el) return;
        const action = el.getAttribute('data-onclick');
        
        if (action.includes('focus()')) document.getElementById('searchInput').focus();
        else if (action === 'togglePrivacy()') togglePrivacy();
        else if (action.includes('importInput')) document.getElementById('importInput').click();
        else if (action === 'exportBookmarks()') exportBookmarks();
        else if (action === 'openSettingsModal()') openSettingsModal();
        else if (action === 'openTrashModal()') openTrashModal();
        else if (action === 'openAboutModal()') openAboutModal();
        else if (action === 'resetData()') resetData();
        else if (action === "openModal('add')") openModal('add');
        else if (action === 'closeAllModals()') closeAllModals();
        else if (action === 'autoFillTitle()') autoFillTitle();
        else if (action.includes('window.open')) { window.open('https://sijan.pro.bd/', '_blank'); closeAllModals(); }
        else if (action === 'emptyTrash()') emptyTrash();
        else if (action === "handleMenuAction('open')") handleMenuAction('open');
        else if (action === "handleMenuAction('fetch')") handleMenuAction('fetch');
        else if (action === "handleMenuAction('edit')") handleMenuAction('edit');
        else if (action === "handleMenuAction('delete')") handleMenuAction('delete');
        
        else if (action.startsWith('switchTab(')) {
            const id = parseInt(action.match(/\d+/)[0]);
            switchTab(id);
        }
        else if (action.startsWith('openPageModal(')) {
            const parts = action.split('(')[1].split(')')[0].split(',');
            openPageModal(parts[0].replace(/'/g,'').trim(), parts[1].trim()==='true', parts[2]?parts[2].replace(/'/g,'').trim():'');
        }
        else if (action.startsWith('deletePage(')) {
            const id = parseInt(action.match(/\d+/g)[0]); 
            deletePage(e, id);
        }
        else if (action.startsWith('openBoardMenu(')) {
            const id = action.split("'")[1];
            openBoardMenu(e, id);
        }
        else if (action.startsWith('handleLinkClick(')) handleLinkClick(e);
        else if (action.startsWith('openModal(')) {
            const parts = action.split('(')[1].split(')')[0].split(',');
            openModal(parts[0].replace(/'/g,'').trim(), parts[1]?parts[1].replace(/'/g,'').trim():'', parts[2]?parts[2].replace(/'/g,'').trim():'');
        }
        else if (action.startsWith('deleteBookmark(')) {
            const parts = action.split('(')[1].split(')')[0].split(',');
            deleteBookmark(e, parts[1].replace(/'/g,'').trim(), parts[2].replace(/'/g,'').trim(), el);
        }
        else if (action.startsWith('restoreTrash(')) {
            const id = action.split("'")[1];
            restoreTrash(id);
        }
        else if (action.startsWith('permDelete(')) {
            const id = action.split("'")[1];
            permDelete(id);
        }
        else if (action.startsWith("setBackground('")) {
            let img = action.match(/['"](.*?)['"]/)[1];
            setBackground(img);
        }
    });

    document.addEventListener('submit', e => {
        const el = e.target.closest('[data-onsubmit]');
        if (!el) return;
        const action = el.getAttribute('data-onsubmit');
        if (action === 'saveBookmark(event)' || action.includes('saveBookmark')) saveBookmark(e);
        else if (action === 'savePageModal(event)' || action.includes('savePageModal')) savePageModal(e);
    });

    document.addEventListener('input', e => {
        const el = e.target.closest('[data-oninput]');
        if (!el) return;
        const action = el.getAttribute('data-oninput');
        if (action === 'updateCharCount()') updateCharCount();
    });
});
