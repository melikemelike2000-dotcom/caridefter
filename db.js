/* CariDefter — yerel veri katmanı (localStorage).
   Her değişiklik anında kaydedilir. İnternet gerekmez. */
const DB = (() => {
  const KEY = 'caridefter_v1';

  const seed = {
    profile: { name: 'Ramazan Yedlir', email: '', whatsapp: '', pin: '' },
    accounts: [
      { id: 'a1', name: 'Garanti BBVA', type: 'card', color: '#00A94F', limit: 0, dueDay: 1 },
      { id: 'a2', name: 'Ziraat Bankası', type: 'card', color: '#E2001A', limit: 0, dueDay: 1 },
      { id: 'a3', name: 'Akbank', type: 'card', color: '#D5121C', limit: 0, dueDay: 1 },
      { id: 'a4', name: 'Halkbank', type: 'card', color: '#005BAA', limit: 0, dueDay: 1 },
      { id: 'a5', name: 'VakıfBank', type: 'card', color: '#F4B223', limit: 0, dueDay: 1 },
      { id: 'a6', name: 'İş Bankası', type: 'card', color: '#1C3F94', limit: 0, dueDay: 1 },
      { id: 'a7', name: 'Nakit', type: 'cash', color: '#1D9E75', limit: 0, dueDay: 0 },
    ],
    categories: [
      { id: 'c1', name: 'Araba ödemesi', color: '#E24B4A', icon: 'car' },
      { id: 'c2', name: 'Araba geliri', color: '#1D9E75', icon: 'car' },
      { id: 'c3', name: 'Alışveriş', color: '#7F77DD', icon: 'cart' },
      { id: 'c4', name: 'Yemek', color: '#EF9F27', icon: 'food' },
      { id: 'c5', name: 'Fatura', color: '#185FA5', icon: 'bill' },
      { id: 'c6', name: 'Beyaz eşya', color: '#D4537E', icon: 'fridge' },
    ],
    people: [],
    transactions: [],
    rules: {
      limitPct: 90, limitWhatsapp: true, limitEmail: false,
      monthlyEmail: true, dueReminder: false,
    },
  };

  let state = load();

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return JSON.parse(JSON.stringify(seed));
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {}
  }
  function uid(p) { return p + Math.random().toString(36).slice(2, 9); }

  return {
    get state() { return state; },

    // ---- Genel
    save,
    replaceAll(obj) { state = obj; save(); },
    reset() { state = JSON.parse(JSON.stringify(seed)); save(); },

    // ---- Profil & kurallar
    setProfile(p) { Object.assign(state.profile, p); save(); },
    setRule(k, v) { state.rules[k] = v; save(); },

    // ---- Hesaplar
    accounts: () => state.accounts,
    account: (id) => state.accounts.find(a => a.id === id),
    addAccount(a) { a.id = uid('a'); state.accounts.push(a); save(); return a; },
    updateAccount(id, patch) { Object.assign(DB.account(id), patch); save(); },
    removeAccount(id) { state.accounts = state.accounts.filter(a => a.id !== id); save(); },

    // ---- Kategoriler
    categories: () => state.categories,
    category: (id) => state.categories.find(c => c.id === id),
    addCategory(c) { c.id = uid('c'); state.categories.push(c); save(); return c; },
    updateCategory(id, patch) { Object.assign(DB.category(id), patch); save(); },
    removeCategory(id) { state.categories = state.categories.filter(c => c.id !== id); save(); },

    // ---- Kişiler
    people: () => state.people,
    person: (id) => state.people.find(p => p.id === id),
    addPerson(p) { p.id = uid('p'); state.people.push(p); save(); return p; },
    updatePerson(id, patch) { Object.assign(DB.person(id), patch); save(); },
    removePerson(id) { state.people = state.people.filter(p => p.id !== id); save(); },

    // ---- İşlemler
    transactions: () => state.transactions,
    addTransaction(t) {
      t.id = uid('t');
      t.createdAt = new Date().toISOString();
      state.transactions.unshift(t);
      save();
      return t;
    },
    removeTransaction(id) { state.transactions = state.transactions.filter(t => t.id !== id); save(); },

    // ---- Hesaplamalar
    accountBalance(id) {
      // Kartta birikmiş borç: harcama + (borç) - ödeme
      return state.transactions
        .filter(t => t.accountId === id)
        .reduce((s, t) => {
          if (t.dir === 'expense' || t.dir === 'debt') return s + t.amount;
          if (t.dir === 'payment' || t.dir === 'income') return s - t.amount;
          return s;
        }, 0);
    },
    personBalance(id) {
      // + : kişi bana borçlu (ben tahsil edeceğim) ; - : ben kişiye borçluyum
      return state.transactions
        .filter(t => t.personId === id)
        .reduce((s, t) => {
          if (t.dir === 'income' || t.dir === 'debt') return s + t.amount; // alacak
          if (t.dir === 'expense' || t.dir === 'payment') return s - t.amount; // borç
          return s;
        }, 0);
    },
    monthTotals(year, month) {
      let exp = 0, inc = 0;
      for (const t of state.transactions) {
        const d = new Date(t.date);
        if (d.getFullYear() === year && d.getMonth() === month) {
          if (t.dir === 'expense') exp += t.amount;
          if (t.dir === 'income') inc += t.amount;
        }
      }
      return { exp, inc };
    },
    categoryTotals(year, month) {
      const map = {};
      for (const t of state.transactions) {
        if (t.dir !== 'expense') continue;
        const d = new Date(t.date);
        if (d.getFullYear() !== year || d.getMonth() !== month) continue;
        map[t.categoryId] = (map[t.categoryId] || 0) + t.amount;
      }
      return map;
    },
  };
})();
