import { useEffect, useMemo, useRef, useState } from "react";
import "./Dashboard.css";
import Sidebar from "../../components/Sidebar";

/* ========================================
   DATA (dummy — ganti dengan response API)
======================================== */

const initialTransactions = [
  { id: 1, type: "out", title: "Pembelian di Dapur Mama", category: "Pembelian", amount: 36000, date: "2026-11-10T12:24:00" },
  { id: 2, type: "in", title: "Top Up via BCA Virtual Account", category: "Top Up", amount: 500000, date: "2026-11-09T09:10:00" },
  { id: 3, type: "out", title: "Transfer ke Rina Safitri", category: "Transfer", amount: 150000, date: "2026-11-08T19:42:00" },
  { id: 4, type: "out", title: "Pembelian di Burger House", category: "Pembelian", amount: 50000, date: "2026-11-07T13:05:00" },
  { id: 5, type: "in", title: "Transfer dari Budi Hartono", category: "Transfer", amount: 200000, date: "2026-11-05T16:30:00" },
  { id: 6, type: "out", title: "Listrik PLN", category: "Tagihan", amount: 245000, date: "2026-11-03T08:15:00" },
  { id: 7, type: "in", title: "Top Up via Indomaret", category: "Top Up", amount: 300000, date: "2026-11-01T10:00:00" },
  { id: 8, type: "out", title: "Tarik ke Bank Mandiri", category: "Penarikan", amount: 400000, date: "2026-10-28T14:48:00" },
];

const INITIAL_BALANCE = 1250000;

const tabs = [
  { key: "overview", label: "Ringkasan" },
  { key: "history", label: "Riwayat Transaksi" },
];

const historyFilters = [
  { key: "all", label: "Semua" },
  { key: "in", label: "Uang Masuk" },
  { key: "out", label: "Uang Keluar" },
];

const quickAmounts = [50000, 100000, 200000, 500000];

const actions = {
  transfer: {
    icon: "⇄",
    label: "Transfer",
    hint: "Kirim ke sesama pengguna",
    title: "Transfer Uang",
    description: "Kirim saldo ke pengguna Mercatix lain.",
    type: "out",
    category: "Transfer",
    submit: "Kirim Sekarang",
    checkBalance: true,
    fields: [
      { name: "target", label: "Nomor HP atau username penerima", placeholder: "Contoh: 081234567890" },
    ],
    makeTitle: (v) => `Transfer ke ${v.target}`,
  },
  topup: {
    icon: "＋",
    label: "Top Up",
    hint: "Isi saldo dompetmu",
    title: "Top Up Saldo",
    description: "Pilih metode pembayaran untuk menambah saldo.",
    type: "in",
    category: "Top Up",
    submit: "Top Up Sekarang",
    checkBalance: false,
    fields: [
      {
        name: "method",
        label: "Metode pembayaran",
        options: ["BCA Virtual Account", "Mandiri Virtual Account", "BRI Virtual Account", "Indomaret"],
      },
    ],
    makeTitle: (v) => `Top Up via ${v.method}`,
  },
  withdraw: {
    icon: "↓",
    label: "Tarik Dana",
    hint: "Cairkan ke rekening bank",
    title: "Tarik Dana",
    description: "Pindahkan saldo ke rekening bankmu.",
    type: "out",
    category: "Penarikan",
    submit: "Tarik Dana",
    checkBalance: true,
    fields: [
      { name: "bank", label: "Bank tujuan", options: ["Bank BCA", "Bank Mandiri", "Bank BRI", "Bank BNI"] },
      { name: "account", label: "Nomor rekening", placeholder: "Masukkan nomor rekening" },
    ],
    makeTitle: (v) => `Tarik ke ${v.bank}`,
  },
  bill: {
    icon: "🧾",
    label: "Bayar Tagihan",
    hint: "Listrik, air, internet",
    title: "Bayar Tagihan",
    description: "Bayar tagihan bulananmu langsung dari saldo.",
    type: "out",
    category: "Tagihan",
    submit: "Bayar Tagihan",
    checkBalance: true,
    fields: [
      { name: "biller", label: "Jenis tagihan", options: ["Listrik PLN", "Air PDAM", "Internet", "BPJS Kesehatan"] },
      { name: "customerId", label: "Nomor pelanggan", placeholder: "Masukkan nomor pelanggan" },
    ],
    makeTitle: (v) => v.biller,
  },
};

/* ========================================
   HELPERS
======================================== */

const formatPrice = (value) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

const formatDate = (iso) =>
  new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));

const categoryIcon = {
  Transfer: "⇄",
  "Top Up": "＋",
  Pembelian: "🛍",
  Tagihan: "🧾",
  Penarikan: "↓",
};

/* ========================================
   COMPONENT
======================================== */

export default function Dashboard() {
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");

  const [activeTab, setActiveTab] = useState("overview");
  const [balance, setBalance] = useState(INITIAL_BALANCE);
  const [hideBalance, setHideBalance] = useState(false);
  const [transactions, setTransactions] = useState(initialTransactions);
  const [historyFilter, setHistoryFilter] = useState("all");

  // Modal aksi
  const [activeAction, setActiveAction] = useState(null);
  const [form, setForm] = useState({});
  const [amount, setAmount] = useState("");
  const [formError, setFormError] = useState("");

  const [toast, setToast] = useState("");

  const modalRef = useRef(null);

  /* ---------- derived ---------- */

  const summary = useMemo(() => {
    const now = new Date();
    return transactions
      .filter((t) => {
        const d = new Date(t.date);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      })
      .reduce(
        (acc, t) => {
          if (t.type === "in") acc.income += t.amount;
          else acc.expense += t.amount;
          return acc;
        },
        { income: 0, expense: 0 }
      );
  }, [transactions]);

  const filteredTransactions = transactions.filter(
    (t) => historyFilter === "all" || t.type === historyFilter
  );

  const monthLabel = new Intl.DateTimeFormat("id-ID", {
    month: "long",
    year: "numeric",
  }).format(new Date());

  const config = activeAction ? actions[activeAction] : null;

  /* ---------- effects ---------- */

  // Tutup modal dengan Escape + fokus ke input pertama
  useEffect(() => {
    if (!activeAction) return;

    const onKey = (e) => e.key === "Escape" && closeAction();
    document.addEventListener("keydown", onKey);
    modalRef.current?.querySelector("input, select")?.focus();

    return () => document.removeEventListener("keydown", onKey);
  }, [activeAction]);

  // Toast hilang otomatis
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  /* ---------- handlers ---------- */

  const openAction = (key) => {
    const defaults = {};
    actions[key].fields.forEach((f) => {
      defaults[f.name] = f.options ? f.options[0] : "";
    });
    setForm(defaults);
    setAmount("");
    setFormError("");
    setActiveAction(key);
  };

  const closeAction = () => {
    setActiveAction(null);
    setFormError("");
  };

  const handleAmountChange = (e) => {
    setAmount(e.target.value.replace(/\D/g, "").slice(0, 10));
  };

  const handleSubmitAction = (e) => {
    e.preventDefault();

    const value = Number(amount);

    const emptyField = config.fields.find((f) => !String(form[f.name] || "").trim());
    if (emptyField) {
      setFormError(`${emptyField.label} wajib diisi.`);
      return;
    }
    if (!value || value < 10000) {
      setFormError("Nominal minimal Rp10.000.");
      return;
    }
    if (config.checkBalance && value > balance) {
      setFormError(
        `Saldo tidak cukup. Saldo kamu ${formatPrice(balance)}, kurangi nominal atau top up dulu.`
      );
      return;
    }

    // TODO: ganti dengan request ke API
    setBalance((b) => (config.type === "in" ? b + value : b - value));
    setTransactions((list) => [
      {
        id: Date.now(),
        type: config.type,
        title: config.makeTitle(form),
        category: config.category,
        amount: value,
        date: new Date().toISOString(),
      },
      ...list,
    ]);

    setToast(`${config.title} sebesar ${formatPrice(value)} berhasil.`);
    closeAction();
  };

  /* ---------- sub render ---------- */

  const renderTransactionList = (list) =>
    list.length > 0 ? (
      <ul className="tx-list">
        {list.map((t) => (
          <li className="tx-item" key={t.id}>
            <span className={`tx-icon ${t.type}`}>
              {categoryIcon[t.category] || "•"}
            </span>

            <div className="tx-info">
              <strong>{t.title}</strong>
              <span>
                {t.category} • {formatDate(t.date)}
              </span>
            </div>

            <div className="tx-amount">
              <strong className={t.type}>
                {t.type === "in" ? "+" : "−"} {formatPrice(t.amount)}
              </strong>
              <span>Berhasil</span>
            </div>
          </li>
        ))}
      </ul>
    ) : (
      <div className="dash-empty">
        <div className="dash-empty-icon">🧾</div>
        <h3>Belum ada transaksi</h3>
        <p>Transaksi yang kamu lakukan akan muncul di sini.</p>
      </div>
    );

  /* ---------- render ---------- */

  return (
    <Sidebar>
      {/* Welcome */}
      <section className="dash-welcome">
        <p>Selamat datang kembali!</p>
        <h2>Halo, {storedUser.name || "Customer"} 👋</h2>
        <p className="dash-welcome-description">
          Kelola saldo dan transaksimu dalam satu tempat.
        </p>
      </section>

      {/* Tabs */}
      <div className="dash-tabs" role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            role="tab"
            aria-selected={activeTab === tab.key}
            className={`dash-tab ${activeTab === tab.key ? "active" : ""}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ================= OVERVIEW ================= */}
      {activeTab === "overview" && (
        <>
          {/* Balance */}
          <section className="balance-card">
            <div className="balance-content">
              <span className="balance-badge">SALDO MERCATIX</span>

              <div className="balance-row">
                <h2 className="balance-amount" aria-live="polite">
                  {hideBalance ? "Rp ••••••••" : formatPrice(balance)}
                </h2>

                <button
                  className="balance-toggle"
                  onClick={() => setHideBalance((v) => !v)}
                  aria-label={hideBalance ? "Tampilkan saldo" : "Sembunyikan saldo"}
                >
                  {hideBalance ? "Tampilkan" : "Sembunyikan"}
                </button>
              </div>

              <p>
                Pemasukan dan pengeluaran bulan ini sudah dihitung dari riwayat
                transaksimu.
              </p>

              <div className="balance-buttons">
                <button className="balance-button primary" onClick={() => openAction("topup")}>
                  Top Up Saldo
                </button>
                <button className="balance-button ghost" onClick={() => openAction("transfer")}>
                  Transfer
                </button>
              </div>
            </div>

            <div className="balance-decoration" aria-hidden="true">💳</div>
          </section>

          {/* Quick actions */}
          <section className="dash-section">
            <div className="dash-heading">
              <h2>Fitur Cepat</h2>
              <p>Pilih layanan yang kamu butuhkan.</p>
            </div>

            <div className="action-grid">
              {Object.entries(actions).map(([key, a]) => (
                <button className="action-card" key={key} onClick={() => openAction(key)}>
                  <span className="action-icon">{a.icon}</span>
                  <strong>{a.label}</strong>
                  <span>{a.hint}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Summary */}
          <section className="dash-section">
            <div className="dash-heading">
              <h2>Ringkasan Bulan Ini</h2>
              <p>{monthLabel}</p>
            </div>

            <div className="stat-grid">
              <div className="stat-card">
                <span>Uang masuk</span>
                <strong className="in">{formatPrice(summary.income)}</strong>
              </div>
              <div className="stat-card">
                <span>Uang keluar</span>
                <strong className="out">{formatPrice(summary.expense)}</strong>
              </div>
            </div>
          </section>

          {/* Recent transactions */}
          <section className="dash-section">
            <div className="dash-heading-row">
              <div className="dash-heading">
                <h2>Transaksi Terakhir</h2>
                <p>5 aktivitas terbaru di akunmu.</p>
              </div>

              <button className="link-button" onClick={() => setActiveTab("history")}>
                Lihat semua
              </button>
            </div>

            {renderTransactionList(transactions.slice(0, 5))}
          </section>
        </>
      )}

      {/* ================= HISTORY ================= */}
      {activeTab === "history" && (
        <section className="dash-section">
          <div className="dash-heading-row">
            <div className="dash-heading">
              <h2>Riwayat Transaksi</h2>
              <p>Semua aktivitas keuangan di akunmu.</p>
            </div>

            <span className="dash-count">{filteredTransactions.length} Transaksi</span>
          </div>

          <div className="dash-filters">
            {historyFilters.map((f) => (
              <button
                key={f.key}
                className={`dash-filter ${historyFilter === f.key ? "active" : ""}`}
                onClick={() => setHistoryFilter(f.key)}
              >
                {f.label}
              </button>
            ))}
          </div>

          {renderTransactionList(filteredTransactions)}
        </section>
      )}

      {/* Footer */}
      <footer className="dash-footer">© 2026 Mercatix. All rights reserved.</footer>

      {/* ================= MODAL ================= */}
      {config && (
        <div className="modal-overlay" onClick={closeAction}>
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            ref={modalRef}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <h3 id="modal-title">{config.title}</h3>
                <p>{config.description}</p>
              </div>

              <button className="modal-close" onClick={closeAction} aria-label="Tutup">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitAction}>
              {config.fields.map((f) => (
                <label className="field" key={f.name}>
                  <span>{f.label}</span>

                  {f.options ? (
                    <select
                      value={form[f.name]}
                      onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
                    >
                      {f.options.map((opt) => (
                        <option key={opt}>{opt}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      placeholder={f.placeholder}
                      value={form[f.name]}
                      onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
                    />
                  )}
                </label>
              ))}

              <label className="field">
                <span>Nominal</span>
                <div className="amount-input">
                  <em>Rp</em>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="0"
                    value={amount ? Number(amount).toLocaleString("id-ID") : ""}
                    onChange={handleAmountChange}
                  />
                </div>
              </label>

              <div className="quick-amounts">
                {quickAmounts.map((q) => (
                  <button type="button" key={q} onClick={() => setAmount(String(q))}>
                    {q / 1000}rb
                  </button>
                ))}
              </div>

              {config.checkBalance && (
                <p className="modal-balance">Saldo tersedia: {formatPrice(balance)}</p>
              )}

              {formError && <p className="form-error" role="alert">{formError}</p>}

              <button type="submit" className="btn-primary btn-block">
                {config.submit}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="toast" role="status">
          {toast}
        </div>
      )}
    </Sidebar>
  );
}