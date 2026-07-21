/**
 * Application "Tutos Numériques Hôpital" — prototype front-end statique.
 * Routage par hash (#/...), état persisté en localStorage via Store.
 */

const App = {
  root: null,

  init() {
    Store.init();
    this.root = document.getElementById('app');
    window.addEventListener('hashchange', () => this.route());
    this.route();
  },

  // ---------- Routage ----------

  route() {
    const hash = location.hash.replace(/^#\/?/, '');
    const parts = hash.split('/').filter(Boolean);
    const user = Store.getCurrentUser();

    if (!user) {
      if (parts[0] !== 'login') { location.hash = '#/login'; return; }
      this.renderLogin();
      return;
    }

    const seg = parts[0] || 'catalogue';

    if (seg === 'login') { location.hash = '#/catalogue'; return; }
    if (seg === 'catalogue') return this.renderShell(user, () => this.renderCatalogue());
    if (seg === 'outil') return this.renderShell(user, () => this.renderOutil(parts[1]));
    if (seg === 'tutoriel') return this.renderShell(user, () => this.renderTutoriel(parts[1]));
    if (seg === 'mon-espace') return this.renderShell(user, () => this.renderMonEspace(user));
    if (seg === 'contribuer') {
      if (!['contributeur', 'admin'].includes(user.role)) return this.renderShell(user, () => this.renderInterdit());
      return this.renderShell(user, () => this.renderContribuer(user, parts[1]));
    }
    if (seg === 'admin') {
      if (user.role !== 'admin') return this.renderShell(user, () => this.renderInterdit());
      return this.renderShell(user, () => this.renderAdmin(parts[1] || 'utilisateurs'));
    }
    return this.renderShell(user, () => this.renderCatalogue());
  },

  // ---------- Aides ----------

  esc(s) {
    const d = document.createElement('div');
    d.textContent = s == null ? '' : String(s);
    return d.innerHTML;
  },

  fmtDate(ts) {
    return new Date(ts).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  },

  tutorialsForTool(toolId) {
    return Store.getTutorials().filter(t => t.toolId === toolId).sort((a, b) => b.createdAt - a.createdAt);
  },

  userName(id) {
    const u = Store.getUsers().find(u => u.id === id);
    return u ? u.name : 'Utilisateur supprimé';
  },

  coverage() {
    const tools = Store.getTools();
    const tutorials = Store.getTutorials();
    const withTuto = new Set(tutorials.map(t => t.toolId));
    return { totalTools: tools.length, coveredTools: withTuto.size, totalTutorials: tutorials.length };
  },

  // ---------- Layout ----------

  renderShell(user, renderContent) {
    const initials = user.initials || user.name.split(' ').map(w => w[0]).join('');
    const nav = [
      { route: 'catalogue', label: 'Catalogue' },
      { route: 'mon-espace', label: 'Mon espace' }
    ];
    if (['contributeur', 'admin'].includes(user.role)) nav.push({ route: 'contribuer', label: 'Contribuer' });
    if (user.role === 'admin') nav.push({ route: 'admin', label: 'Administration' });

    const currentSeg = (location.hash.replace(/^#\/?/, '').split('/')[0]) || 'catalogue';

    this.root.innerHTML = `
      <header class="topbar">
        <div class="topbar-inner">
          <a href="#/catalogue" class="brand">🎬 Tutos Numériques <span>Hôpital</span></a>
          <nav class="mainnav">
            ${nav.map(n => `<a href="#/${n.route}" class="${currentSeg === n.route ? 'active' : ''}">${n.label}</a>`).join('')}
          </nav>
          <div class="userbox">
            <div class="avatar" title="${this.esc(user.name)}">${this.esc(initials)}</div>
            <div class="userinfo">
              <strong>${this.esc(user.name)}</strong>
              <span class="role-badge role-${user.role}">${this.roleLabel(user.role)}</span>
            </div>
            <button class="btn-link" id="logout-btn">Se déconnecter</button>
          </div>
        </div>
      </header>
      <main class="view" id="view"></main>
      <footer class="footer">Prototype interne — ${this.coverage().coveredTools}/${this.coverage().totalTools} outils couverts par au moins un tutoriel · ${this.coverage().totalTutorials} tutoriels publiés</footer>
    `;
    document.getElementById('logout-btn').addEventListener('click', () => {
      Store.setSessionUserId(null);
      location.hash = '#/login';
    });
    renderContent();
  },

  roleLabel(role) {
    return { admin: 'Administrateur', contributeur: 'Contributeur', lecteur: 'Lecteur' }[role] || role;
  },

  view(html) {
    document.getElementById('view').innerHTML = html;
  },

  // ---------- Connexion ----------

  renderLogin() {
    const users = Store.getUsers();
    this.root.innerHTML = `
      <div class="login-screen">
        <div class="login-card">
          <h1>🎬 Tutos Numériques <span>Hôpital</span></h1>
          <p class="subtitle">Plateforme intranet de capsules vidéo pour la prise en main des outils numériques métiers.</p>
          <p class="notice">Prototype de démonstration — la connexion réelle se ferait via l'annuaire LDAP / SSO de l'établissement. Choisissez un compte de démonstration :</p>
          <div class="demo-users">
            ${users.map(u => `
              <button class="demo-user" data-id="${u.id}">
                <div class="avatar">${this.esc(u.initials)}</div>
                <div>
                  <strong>${this.esc(u.name)}</strong>
                  <div class="muted">${this.esc(u.department)}</div>
                  <span class="role-badge role-${u.role}">${this.roleLabel(u.role)}</span>
                </div>
              </button>
            `).join('')}
          </div>
        </div>
      </div>
    `;
    this.root.querySelectorAll('.demo-user').forEach(btn => {
      btn.addEventListener('click', () => {
        Store.setSessionUserId(btn.dataset.id);
        location.hash = '#/catalogue';
      });
    });
  },

  renderInterdit() {
    this.view(`<div class="empty-state"><h2>Accès non autorisé</h2><p>Votre rôle ne permet pas d'accéder à cette page.</p><a class="btn" href="#/catalogue">Retour au catalogue</a></div>`);
  },

  // ---------- Catalogue ----------

  renderCatalogue(filters) {
    filters = filters || { q: '', cat: '', onlyWithTuto: false };
    const tools = Store.getTools();
    const tutorials = Store.getTutorials();
    const tutoCountByTool = {};
    tutorials.forEach(t => { tutoCountByTool[t.toolId] = (tutoCountByTool[t.toolId] || 0) + 1; });

    const categories = [...new Map(tools.map(t => [t.categoryKey, t.category])).entries()];

    const q = filters.q.trim().toLowerCase();
    const filtered = tools.filter(t => {
      if (filters.cat && t.categoryKey !== filters.cat) return false;
      if (filters.onlyWithTuto && !tutoCountByTool[t.id]) return false;
      if (q && !(t.name.toLowerCase().includes(q) || t.category.toLowerCase().includes(q) || t.description.toLowerCase().includes(q))) return false;
      return true;
    });

    const grouped = new Map();
    filtered.forEach(t => {
      if (!grouped.has(t.categoryKey)) grouped.set(t.categoryKey, []);
      grouped.get(t.categoryKey).push(t);
    });

    this.view(`
      <div class="catalogue-header">
        <h1>Catalogue des outils numériques</h1>
        <p class="muted">${tools.length} outils référencés · ${tutorials.length} tutoriels disponibles</p>
        <div class="filters">
          <input type="search" id="f-q" placeholder="Rechercher un outil, une catégorie…" value="${this.esc(filters.q)}">
          <select id="f-cat">
            <option value="">Toutes les catégories</option>
            ${categories.map(([key, name]) => `<option value="${key}" ${filters.cat === key ? 'selected' : ''}>${this.esc(name)}</option>`).join('')}
          </select>
          <label class="checkbox">
            <input type="checkbox" id="f-tuto" ${filters.onlyWithTuto ? 'checked' : ''}>
            Avec tutoriel disponible
          </label>
        </div>
      </div>
      <div id="cat-results">${this.renderCatalogueGroups(grouped, tutoCountByTool)}</div>
    `);

    const apply = () => {
      this.renderCatalogue({
        q: document.getElementById('f-q').value,
        cat: document.getElementById('f-cat').value,
        onlyWithTuto: document.getElementById('f-tuto').checked
      });
    };
    document.getElementById('f-q').addEventListener('input', apply);
    document.getElementById('f-cat').addEventListener('change', apply);
    document.getElementById('f-tuto').addEventListener('change', apply);
  },

  renderCatalogueGroups(grouped, tutoCountByTool) {
    if (grouped.size === 0) return `<div class="empty-state"><p>Aucun outil ne correspond à votre recherche.</p></div>`;
    let html = '';
    for (const [key, items] of grouped) {
      const covered = items.filter(t => tutoCountByTool[t.id]).length;
      html += `
        <details class="cat-group" open>
          <summary>
            <span>${items[0].icon} ${this.esc(items[0].category)}</span>
            <span class="muted">${covered}/${items.length} avec tutoriel</span>
          </summary>
          <div class="tool-grid">
            ${items.map(t => `
              <a class="tool-card" href="#/outil/${t.id}">
                <div class="tool-card-top">
                  <span class="tool-icon">${t.icon}</span>
                  ${tutoCountByTool[t.id] ? `<span class="badge badge-ok">${tutoCountByTool[t.id]} tuto${tutoCountByTool[t.id] > 1 ? 's' : ''}</span>` : `<span class="badge badge-empty">Aucun tuto</span>`}
                </div>
                <strong>${this.esc(t.module)}</strong>
                <span class="muted small">${this.esc(t.suite)}</span>
              </a>
            `).join('')}
          </div>
        </details>
      `;
    }
    return html;
  },

  // ---------- Fiche outil ----------

  renderOutil(toolId) {
    const tool = Store.getTools().find(t => t.id === toolId);
    if (!tool) return this.view(`<div class="empty-state"><p>Outil introuvable.</p></div>`);
    const user = Store.getCurrentUser();
    const tutos = this.tutorialsForTool(toolId);
    const progress = Store.getProgress()[user.id] || {};

    this.view(`
      <a class="back-link" href="#/catalogue">&larr; Retour au catalogue</a>
      <div class="tool-header">
        <span class="tool-icon big">${tool.icon}</span>
        <div>
          <span class="muted">${this.esc(tool.category)}</span>
          <h1>${this.esc(tool.name)}</h1>
          <p>${this.esc(tool.description)}</p>
        </div>
      </div>
      ${['contributeur', 'admin'].includes(user.role) ? `<a class="btn" href="#/contribuer/${tool.id}">+ Ajouter un tutoriel pour cet outil</a>` : ''}
      <h2 class="section-title">Tutoriels vidéo (${tutos.length})</h2>
      ${tutos.length === 0 ? `<div class="empty-state"><p>Aucun tutoriel n'a encore été publié pour cet outil.</p></div>` : `
        <div class="tuto-list">
          ${tutos.map(t => {
            const p = progress[t.id];
            return `
            <a class="tuto-row" href="#/tutoriel/${t.id}">
              <div class="tuto-thumb">▶</div>
              <div class="tuto-meta">
                <strong>${this.esc(t.title)}</strong>
                <span class="muted small">Par ${this.esc(this.userName(t.authorId))} · ${this.fmtDate(t.createdAt)} · ${this.esc(t.durationLabel || '')}</span>
              </div>
              ${p && p.watched ? '<span class="badge badge-ok">Vu</span>' : '<span class="badge badge-empty">À voir</span>'}
            </a>
          `; }).join('')}
        </div>
      `}
    `);
  },

  // ---------- Lecteur de tutoriel ----------

  renderTutoriel(tutoId) {
    const tuto = Store.getTutorials().find(t => t.id === tutoId);
    if (!tuto) return this.view(`<div class="empty-state"><p>Tutoriel introuvable.</p></div>`);
    const tool = Store.getTools().find(t => t.id === tuto.toolId);
    const user = Store.getCurrentUser();
    const progress = (Store.getProgress()[user.id] || {})[tuto.id] || {};
    const others = this.tutorialsForTool(tuto.toolId).filter(t => t.id !== tuto.id);

    this.view(`
      <a class="back-link" href="#/outil/${tool.id}">&larr; Retour à ${this.esc(tool.name)}</a>
      <div class="player-layout">
        <div>
          <video id="player" controls preload="metadata" src="${this.esc(tuto.videoUrl)}"></video>
          <div class="player-info">
            <h1>${this.esc(tuto.title)}</h1>
            <p class="muted">Outil : <a href="#/outil/${tool.id}">${this.esc(tool.name)}</a> · Par ${this.esc(this.userName(tuto.authorId))} · Publié le ${this.fmtDate(tuto.createdAt)}</p>
            <p>${this.esc(tuto.description)}</p>
            <button class="btn ${progress.watched ? 'btn-secondary' : ''}" id="toggle-watched">
              ${progress.watched ? '✓ Marqué comme vu — annuler' : 'Marquer comme vu'}
            </button>
          </div>
        </div>
        <aside class="sidebar">
          <h3>Autres tutoriels sur ${this.esc(tool.name)}</h3>
          ${others.length === 0 ? '<p class="muted small">Aucun autre tutoriel.</p>' : others.map(t => `
            <a class="tuto-row compact" href="#/tutoriel/${t.id}">
              <div class="tuto-thumb small">▶</div>
              <div class="tuto-meta"><strong>${this.esc(t.title)}</strong><span class="muted small">${this.esc(t.durationLabel || '')}</span></div>
            </a>
          `).join('')}
        </aside>
      </div>
    `);

    const video = document.getElementById('player');
    if (progress.lastPositionSec) {
      video.addEventListener('loadedmetadata', () => { video.currentTime = progress.lastPositionSec; }, { once: true });
    }
    let lastSave = 0;
    video.addEventListener('timeupdate', () => {
      const now = Date.now();
      if (now - lastSave > 3000) {
        lastSave = now;
        Store.setPosition(user.id, tuto.id, video.currentTime);
      }
      if (video.duration && video.currentTime / video.duration > 0.9 && !progress.watched) {
        progress.watched = true;
        Store.markWatched(user.id, tuto.id, true);
        this.updateWatchedButton(true);
      }
    });
    document.getElementById('toggle-watched').addEventListener('click', () => {
      const newVal = !(Store.getProgress()[user.id] && Store.getProgress()[user.id][tuto.id] && Store.getProgress()[user.id][tuto.id].watched);
      Store.markWatched(user.id, tuto.id, newVal);
      this.updateWatchedButton(newVal);
    });
  },

  updateWatchedButton(watched) {
    const btn = document.getElementById('toggle-watched');
    if (!btn) return;
    btn.textContent = watched ? '✓ Marqué comme vu — annuler' : 'Marquer comme vu';
    btn.classList.toggle('btn-secondary', watched);
  },

  // ---------- Mon espace ----------

  renderMonEspace(user) {
    const tutorials = Store.getTutorials();
    const progress = Store.getProgress()[user.id] || {};
    const watchedIds = Object.keys(progress).filter(id => progress[id].watched);
    const inProgressIds = Object.keys(progress).filter(id => !progress[id].watched && progress[id].lastPositionSec);

    const rowFor = (id) => {
      const t = tutorials.find(x => x.id === id);
      if (!t) return '';
      const tool = Store.getTools().find(x => x.id === t.toolId);
      return `<a class="tuto-row" href="#/tutoriel/${t.id}">
        <div class="tuto-thumb">▶</div>
        <div class="tuto-meta"><strong>${this.esc(t.title)}</strong><span class="muted small">${this.esc(tool ? tool.name : '')}</span></div>
      </a>`;
    };

    this.view(`
      <h1>Mon espace</h1>
      <div class="stat-cards">
        <div class="stat-card"><strong>${watchedIds.length}</strong><span>tutoriels vus</span></div>
        <div class="stat-card"><strong>${inProgressIds.length}</strong><span>en cours</span></div>
        <div class="stat-card"><strong>${tutorials.length}</strong><span>tutoriels disponibles</span></div>
      </div>
      ${inProgressIds.length ? `<h2 class="section-title">Reprendre la lecture</h2><div class="tuto-list">${inProgressIds.map(rowFor).join('')}</div>` : ''}
      <h2 class="section-title">Historique de visionnage</h2>
      ${watchedIds.length === 0 ? '<div class="empty-state"><p>Vous n\'avez pas encore visionné de tutoriel.</p></div>' : `<div class="tuto-list">${watchedIds.map(rowFor).join('')}</div>`}
    `);
  },

  // ---------- Contribuer ----------

  renderContribuer(user, preselectToolId) {
    const tools = Store.getTools();
    const myTutorials = Store.getTutorials().filter(t => t.authorId === user.id).sort((a, b) => b.createdAt - a.createdAt);

    this.view(`
      <h1>Espace contributeur</h1>
      <p class="muted">Ajoutez un tutoriel vidéo pour un outil numérique. Il sera immédiatement visible par tous les professionnels dans le catalogue.</p>
      <form id="tuto-form" class="card form">
        <label>Outil concerné
          <select id="f-tool" required>
            <option value="">— Choisir un outil —</option>
            ${tools.map(t => `<option value="${t.id}" ${t.id === preselectToolId ? 'selected' : ''}>${this.esc(t.category)} · ${this.esc(t.name)}</option>`).join('')}
          </select>
        </label>
        <label>Titre du tutoriel
          <input type="text" id="f-title" placeholder="Ex : Créer une prescription en 3 étapes" required>
        </label>
        <label>Description
          <textarea id="f-desc" rows="3" placeholder="Ce que le tutoriel permet d'apprendre…" required></textarea>
        </label>
        <label>Source vidéo
          <select id="f-source">
            <option value="url">URL vidéo (recommandé — accessible à tous, en permanence)</option>
            <option value="file">Importer un fichier (aperçu local, session en cours uniquement)</option>
          </select>
        </label>
        <div id="f-source-url">
          <label>URL de la vidéo
            <input type="url" id="f-video-url" placeholder="https://mediaserver.hopital.local/...">
          </label>
        </div>
        <div id="f-source-file" style="display:none">
          <label>Fichier vidéo
            <input type="file" id="f-video-file" accept="video/*">
          </label>
          <p class="notice small">⚠️ Dans ce prototype sans serveur, le fichier importé n'est prévisualisable que durant cette session de navigation : il ne sera pas conservé après fermeture de l'onglet. En production, le fichier serait envoyé vers le serveur média de l'hôpital.</p>
        </div>
        <label>Durée (facultatif)
          <input type="text" id="f-duration" placeholder="Ex : 4:30">
        </label>
        <button type="submit" class="btn">Publier le tutoriel</button>
        <p id="f-msg" class="notice success" style="display:none">Tutoriel publié avec succès.</p>
      </form>

      <h2 class="section-title">Mes tutoriels (${myTutorials.length})</h2>
      ${myTutorials.length === 0 ? '<div class="empty-state"><p>Vous n\'avez pas encore publié de tutoriel.</p></div>' : `
        <div class="tuto-list">
          ${myTutorials.map(t => {
            const tool = tools.find(x => x.id === t.toolId);
            return `
            <div class="tuto-row">
              <a class="tuto-thumb" href="#/tutoriel/${t.id}">▶</a>
              <div class="tuto-meta">
                <a href="#/tutoriel/${t.id}"><strong>${this.esc(t.title)}</strong></a>
                <span class="muted small">${this.esc(tool ? tool.name : '')} · ${this.fmtDate(t.createdAt)}</span>
              </div>
              <button class="btn-link danger" data-delete="${t.id}">Supprimer</button>
            </div>
          `; }).join('')}
        </div>
      `}
    `);

    document.getElementById('f-source').addEventListener('change', (e) => {
      const isUrl = e.target.value === 'url';
      document.getElementById('f-source-url').style.display = isUrl ? '' : 'none';
      document.getElementById('f-source-file').style.display = isUrl ? 'none' : '';
    });

    document.getElementById('tuto-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const toolId = document.getElementById('f-tool').value;
      const title = document.getElementById('f-title').value.trim();
      const desc = document.getElementById('f-desc').value.trim();
      const source = document.getElementById('f-source').value;
      const duration = document.getElementById('f-duration').value.trim();
      if (!toolId || !title || !desc) return;

      const finish = (videoUrl) => {
        const list = Store.getTutorials();
        list.push({
          id: 'tuto-' + Date.now(),
          toolId, title, description: desc, videoUrl,
          authorId: user.id, createdAt: Date.now(), durationLabel: duration
        });
        Store.saveTutorials(list);
        this.renderContribuer(user);
        document.getElementById('f-msg') && (document.getElementById('f-msg').style.display = '');
      };

      if (source === 'file') {
        const file = document.getElementById('f-video-file').files[0];
        if (!file) { alert('Veuillez sélectionner un fichier vidéo.'); return; }
        finish(URL.createObjectURL(file));
      } else {
        const url = document.getElementById('f-video-url').value.trim();
        if (!url) { alert('Veuillez saisir une URL vidéo.'); return; }
        finish(url);
      }
    });

    this.root.querySelectorAll('[data-delete]').forEach(btn => {
      btn.addEventListener('click', () => {
        if (!confirm('Supprimer ce tutoriel ?')) return;
        Store.saveTutorials(Store.getTutorials().filter(t => t.id !== btn.dataset.delete));
        this.renderContribuer(user);
      });
    });
  },

  // ---------- Administration ----------

  renderAdmin(tab) {
    const tabs = [
      { key: 'utilisateurs', label: 'Utilisateurs' },
      { key: 'statistiques', label: 'Statistiques' }
    ];
    this.view(`
      <h1>Administration</h1>
      <div class="tabs">
        ${tabs.map(t => `<a class="tab ${tab === t.key ? 'active' : ''}" href="#/admin/${t.key}">${t.label}</a>`).join('')}
      </div>
      <div id="admin-content"></div>
    `);
    if (tab === 'statistiques') this.renderAdminStats();
    else this.renderAdminUsers();
  },

  renderAdminUsers() {
    const users = Store.getUsers();
    document.getElementById('admin-content').innerHTML = `
      <table class="table">
        <thead><tr><th>Utilisateur</th><th>Service</th><th>Rôle</th></tr></thead>
        <tbody>
          ${users.map(u => `
            <tr>
              <td>${this.esc(u.name)}</td>
              <td class="muted">${this.esc(u.department)}</td>
              <td>
                <select data-role="${u.id}">
                  <option value="lecteur" ${u.role === 'lecteur' ? 'selected' : ''}>Lecteur</option>
                  <option value="contributeur" ${u.role === 'contributeur' ? 'selected' : ''}>Contributeur</option>
                  <option value="admin" ${u.role === 'admin' ? 'selected' : ''}>Administrateur</option>
                </select>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <p class="notice small">Dans ce prototype, la liste des utilisateurs est simulée. En production, elle serait synchronisée avec l'annuaire de l'hôpital (LDAP/Active Directory).</p>
    `;
    document.querySelectorAll('[data-role]').forEach(sel => {
      sel.addEventListener('change', () => {
        const users = Store.getUsers();
        const u = users.find(u => u.id === sel.dataset.role);
        u.role = sel.value;
        Store.saveUsers(users);
      });
    });
  },

  renderAdminStats() {
    const tools = Store.getTools();
    const tutorials = Store.getTutorials();
    const byCat = new Map();
    tools.forEach(t => {
      if (!byCat.has(t.categoryKey)) byCat.set(t.categoryKey, { name: t.category, icon: t.icon, total: 0, covered: 0 });
      byCat.get(t.categoryKey).total++;
    });
    const withTuto = new Set(tutorials.map(t => t.toolId));
    tools.forEach(t => { if (withTuto.has(t.id)) byCat.get(t.categoryKey).covered++; });

    const progress = Store.getProgress();
    const viewCount = {};
    Object.values(progress).forEach(userProg => {
      Object.entries(userProg).forEach(([tutoId, p]) => { if (p.watched) viewCount[tutoId] = (viewCount[tutoId] || 0) + 1; });
    });
    const topTutorials = tutorials
      .map(t => ({ t, views: viewCount[t.id] || 0 }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 5);

    document.getElementById('admin-content').innerHTML = `
      <div class="stat-cards">
        <div class="stat-card"><strong>${tools.length}</strong><span>outils référencés</span></div>
        <div class="stat-card"><strong>${withTuto.size}</strong><span>outils couverts</span></div>
        <div class="stat-card"><strong>${tutorials.length}</strong><span>tutoriels publiés</span></div>
      </div>
      <h2 class="section-title">Couverture par catégorie</h2>
      <div class="bars">
        ${[...byCat.values()].sort((a, b) => b.total - a.total).map(c => `
          <div class="bar-row">
            <span class="bar-label">${c.icon} ${this.esc(c.name)}</span>
            <div class="bar-track"><div class="bar-fill" style="width:${(c.covered / c.total) * 100}%"></div></div>
            <span class="bar-value">${c.covered}/${c.total}</span>
          </div>
        `).join('')}
      </div>
      <h2 class="section-title">Tutoriels les plus vus</h2>
      ${topTutorials.length === 0 || topTutorials[0].views === 0 ? '<p class="muted">Aucune vue enregistrée pour le moment.</p>' : `
        <div class="tuto-list">
          ${topTutorials.map(({ t, views }) => `
            <a class="tuto-row" href="#/tutoriel/${t.id}">
              <div class="tuto-thumb">▶</div>
              <div class="tuto-meta"><strong>${this.esc(t.title)}</strong></div>
              <span class="badge badge-ok">${views} vue${views > 1 ? 's' : ''}</span>
            </a>
          `).join('')}
        </div>
      `}
    `;
  }
};

document.addEventListener('DOMContentLoaded', () => App.init());
