
import { useEffect, useMemo, useRef, useState } from "react";
import PageLayout from "../../layouts/PageLayout";
import { getBalance, topUp, transfer } from "../../api/api";

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
      {
        name: "target",
        label: "Nomor HP atau username penerima",
        placeholder: "Contoh: 081234567890",
      },
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
        options: [
          "BCA Virtual Account",
          "Mandiri Virtual Account",
          "BRI Virtual Account",
          "Indomaret",
        ],
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
      {
        name: "bank",
        label: "Bank tujuan",
        options: ["Bank BCA", "Bank Mandiri", "Bank BRI", "Bank BNI"],
      },
      {
        name: "account",
        label: "Nomor rekening",
        placeholder: "Masukkan nomor rekening",
      },
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
      {
        name: "biller",
        label: "Jenis tagihan",
        options: [
          "Listrik PLN",
          "Air PDAM",
          "Internet",
          "BPJS Kesehatan",
        ],
      },
      {
        name: "customerId",
        label: "Nomor pelanggan",
        placeholder: "Masukkan nomor pelanggan",
      },
    ],
    makeTitle: (v) => v.biller,
  },
};

const formatPrice = (value) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

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

// Mengambil response data secara konsisten
const getResponseData = (result) => {
  return result?.data?.data ?? result?.data ?? result;
};

// Mengambil saldo dari response
const getResponseBalance = (result) => {
  const data = getResponseData(result);

  return Number(data?.balance ?? data?.wallet?.balance ?? 0);
};

export default function MerchantDashboard() {
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");

  const [activeTab, setActiveTab] = useState("overview");
  const [balance, setBalance] = useState(0);
  const [hideBalance, setHideBalance] = useState(false);
  const [transactions] = useState(initialTransactions);
  const [historyFilter, setHistoryFilter] = useState("all");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [activeAction, setActiveAction] = useState(null);
  const [form, setForm] = useState({});
  const [amount, setAmount] = useState("");
  const [formError, setFormError] = useState("");
  const [toast, setToast] = useState("");

  const modalRef = useRef(null);

  // Ringkasan transaksi bulan ini
  const summary = useMemo(() => {
    const now = new Date();

    return transactions
      .filter((t) => {
        const date = new Date(t.date);

        return (
          date.getMonth() === now.getMonth() &&
          date.getFullYear() === now.getFullYear()
        );
      })
      .reduce(
        (acc, t) => {
          if (t.type === "in") {
            acc.income += t.amount;
          } else {
            acc.expense += t.amount;
          }

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

  // Fetch saldo
  const fetchBalance = async () => {
    try {
      const result = await getBalance();
      setBalance(getResponseBalance(result));
    } catch (error) {
      console.error("Fetch balance error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, []);

  // Modal keyboard handling
  useEffect(() => {
    if (!activeAction) return;

    const onKey = (e) => {
      if (e.key === "Escape" && !submitting) {
        closeAction();
      }
    };

    document.addEventListener("keydown", onKey);
    modalRef.current?.querySelector("input, select")?.focus();

    return () => document.removeEventListener("keydown", onKey);
  }, [activeAction, submitting]);

  // Toast timeout
  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => setToast(""), 3000);

    return () => clearTimeout(timer);
  }, [toast]);

  // Membuka modal
  const openAction = (key) => {
    const defaults = {};

    actions[key].fields.forEach((field) => {
      defaults[field.name] = field.options ? field.options[0] : "";
    });

    setForm(defaults);
    setAmount("");
    setFormError("");
    setActiveAction(key);
  };

  // Menutup modal
  const closeAction = () => {
    if (submitting) return;

    setActiveAction(null);
    setFormError("");
  };

  // Mengubah nominal
  const handleAmountChange = (e) => {
    setAmount(e.target.value.replace(/\D/g, "").slice(0, 10));
  };

  // Submit transaksi
  const handleSubmitAction = async (e) => {
    e.preventDefault();

    if (submitting) return;

    const value = Number(amount);

    const emptyField = config.fields.find(
      (field) => !String(form[field.name] || "").trim()
    );

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
        `Saldo tidak cukup. Saldo kamu ${formatPrice(balance)}.`
      );
      return;
    }

    setSubmitting(true);
    setFormError("");

    try {
      let result;

      if (activeAction === "topup") {
        result = await topUp(
          value,
          `Top Up via ${form.method}`
        );
      } else if (activeAction === "transfer") {
        result = await transfer(
          form.target,
          value
        );
      } else {
        setFormError("Fitur ini belum tersedia.");
        return;
      }

      const updatedBalance = getResponseBalance(result);

      setBalance(updatedBalance);

      setToast(
        `${config.title} sebesar ${formatPrice(value)} berhasil.`
      );

      setActiveAction(null);
      setFormError("");
    } catch (error) {
      console.error("Transaction error:", error);

      setFormError(
        error.response?.data?.message ||
        error.response?.data?.errors?.amount?.[0] ||
        error.response?.data?.errors?.target?.[0] ||
        "Transaksi gagal. Silakan coba lagi."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Render daftar transaksi
  const renderTransactionList = (list) =>
    list.length > 0 ? (
      <ul className="m-0 list-none overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-0">
        {list.map((t) => (
          <li className="flex items-center gap-4 border-b border-[var(--border)] px-5 py-4 transition-colors last:border-b-0 hover:bg-[var(--lavender-bg)] max-sm:gap-3 max-sm:px-4 max-sm:py-3.5" key={t.id}>
            <span className={`flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-[var(--radius-md)] text-lg font-bold ${t.type === "in" ? "bg-[#dcfce7] text-[var(--success)]" : "bg-[var(--lavender-soft)] text-[var(--primary)]"}`}>
              {categoryIcon[t.category] || "•"}
            </span>

            <div className="min-w-0 flex-1">
              <strong className="block overflow-hidden text-sm text-ellipsis whitespace-nowrap max-sm:text-[13px]">{t.title}</strong>
              <span className="text-xs text-[var(--text-muted)]">
                {t.category} • {formatDate(t.date)}
              </span>
            </div>

            <div className="text-right">
              <strong className={`block text-sm font-extrabold max-sm:text-[13px] ${t.type === "in" ? "text-[var(--success)]" : "text-[var(--text-primary)]"}`}>
                {t.type === "in" ? "+" : "−"} {formatPrice(t.amount)}
              </strong>
              <span className="text-[11px] text-[var(--text-muted)]">Berhasil</span>
            </div>
          </li>
        ))}
      </ul>
    ) : (
      <div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--border)] bg-[var(--surface)] px-5 py-[60px] text-center">
        <div className="text-[40px]">🧾</div>
        <h3 className="mb-1.5 mt-3.5 text-base font-bold">Belum ada transaksi</h3>
        <p className="m-0 text-[13px] text-[var(--text-secondary)]">Transaksi yang kamu lakukan akan muncul di sini.</p>
      </div>
    );

  return (
    <PageLayout title="Dashboard M">
      {/* Welcome */}
      <section className="mb-6">
        <p className="m-0 text-sm text-[var(--text-secondary)]">Selamat datang kembali!</p>
        <h2 className="my-2 text-[28px] font-extrabold tracking-[-0.7px] text-[var(--text-primary)] max-sm:text-[23px]">Halo, {storedUser.name || "Customer"} 👋</h2>
        <p className="m-0 text-sm text-[var(--text-muted)]">
          Kelola saldo dan transaksimu dalam satu tempat.
        </p>
      </section>

      {/* Tabs */}
      <div className="mb-7 flex gap-3 overflow-x-auto pb-2" role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            role="tab"
            aria-selected={activeTab === tab.key}
            className={`shrink-0 rounded-[var(--radius-md)] border px-5 py-[11px] text-[13px] font-semibold transition focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-[var(--lavender)] focus-visible:outline-offset-2 ${activeTab === tab.key ? "border-[var(--primary)] bg-[var(--primary)] text-white shadow-[var(--shadow-sm)]" : "border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:border-[var(--primary-light)] hover:text-[var(--primary)]"}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {activeTab === "overview" && (
        <>
          <section className="relative mb-10 overflow-hidden rounded-[var(--radius-xl)] bg-[linear-gradient(120deg,var(--primary-dark),var(--primary-deep)_55%,var(--primary))] px-12 py-11 text-white max-sm:px-6 max-sm:py-8">
            <div className="relative z-[2] max-w-[560px]">
              <span className="inline-block rounded-[30px] border border-white/20 bg-white/[0.12] px-3.5 py-2 text-[11px] font-bold tracking-[1px]">SALDO MERCATIX</span>

              <div className="my-[22px] mb-3 flex flex-wrap items-center gap-x-4 gap-y-2">
                <h2 className="m-0 text-[40px] font-extrabold leading-[1.2] tracking-[-1px] max-sm:text-[30px]" aria-live="polite">
                  {loading
                    ? "..."
                    : hideBalance
                      ? "Rp ••••••••"
                      : formatPrice(balance)}
                </h2>

                <button
                  className="rounded-[30px] border border-white/30 bg-transparent px-3 py-1.5 text-xs font-semibold text-[var(--lavender-light)] transition hover:bg-white/[0.12] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-[var(--lavender)] focus-visible:outline-offset-2"
                  onClick={() => setHideBalance((v) => !v)}
                  aria-label={
                    hideBalance ? "Tampilkan saldo" : "Sembunyikan saldo"
                  }
                >
                  {hideBalance ? "Tampilkan" : "Sembunyikan"}
                </button>
              </div>

              <p className="m-0 text-sm leading-[1.8] text-[var(--lavender-light)]">
                Pemasukan dan pengeluaran bulan ini sudah dihitung dari
                riwayat transaksimu.
              </p>

              <div className="mt-[22px] flex flex-wrap gap-3">
                <button
                  className="rounded-[var(--radius-md)] border border-transparent bg-white px-[22px] py-[13px] text-[13px] font-bold text-[var(--primary-deep)] transition hover:-translate-y-0.5 hover:bg-[var(--lavender-bg)] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-[var(--lavender)] focus-visible:outline-offset-2"
                  onClick={() => openAction("topup")}
                >
                  Top Up Saldo
                </button>

                <button
                  className="rounded-[var(--radius-md)] border border-white/35 bg-transparent px-[22px] py-[13px] text-[13px] font-bold text-white transition hover:bg-white/[0.12] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-[var(--lavender)] focus-visible:outline-offset-2"
                  onClick={() => openAction("transfer")}
                >
                  Transfer
                </button>
              </div>
            </div>

            <div className="pointer-events-none absolute right-[8%] top-1/2 -translate-y-1/2 text-[180px] opacity-[0.18] max-[900px]:right-[2%] max-[900px]:text-[140px] max-sm:-right-[15px] max-sm:bottom-[-20px] max-sm:top-auto max-sm:translate-y-0 max-sm:text-[100px]" aria-hidden="true">
              💳
            </div>
          </section>

          {/* Quick actions */}
          <section className="mb-10">
            <div className="mb-5">
              <h2 className="m-0 text-xl font-extrabold text-[var(--text-primary)]">Fitur Cepat</h2>
              <p className="mt-1.5 text-[13px] text-[var(--text-secondary)]">Pilih layanan yang kamu butuhkan.</p>
            </div>

            <div className="grid grid-cols-4 gap-5 max-[900px]:grid-cols-2 max-sm:gap-3">
              {Object.entries(actions).map(([key, action]) => (
                <button
                  className="flex cursor-pointer flex-col items-start gap-1 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5 text-left text-[var(--text-primary)] transition duration-200 hover:-translate-y-1 hover:border-[var(--primary-light)] hover:shadow-[var(--shadow-md)] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-[var(--lavender)] focus-visible:outline-offset-2 max-sm:p-4"
                  key={key}
                  onClick={() => openAction(key)}
                >
                  <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-[var(--radius-md)] bg-[var(--lavender-bg)] text-xl font-bold text-[var(--primary)] transition group-hover:bg-[var(--primary)] group-hover:text-white">{action.icon}</span>
                  <strong className="text-sm">{action.label}</strong>
                  <span className="text-xs text-[var(--text-muted)]">{action.hint}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Summary */}
          <section className="mb-10">
            <div className="mb-5">
              <h2 className="m-0 text-xl font-extrabold text-[var(--text-primary)]">Ringkasan Bulan Ini</h2>
              <p className="mt-1.5 text-[13px] text-[var(--text-secondary)]">{monthLabel}</p>
            </div>

            <div className="grid grid-cols-2 gap-5 max-sm:grid-cols-1 max-sm:gap-3">
              <div className="flex flex-col gap-2 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] px-6 py-5">
                <span className="text-[13px] text-[var(--text-secondary)]">Uang masuk</span>
                <strong className="text-[22px] font-extrabold tracking-[-0.5px] text-[var(--success)]">
                  {formatPrice(summary.income)}
                </strong>
              </div>

              <div className="flex flex-col gap-2 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] px-6 py-5">
                <span className="text-[13px] text-[var(--text-secondary)]">Uang keluar</span>
                <strong className="text-[22px] font-extrabold tracking-[-0.5px] text-[var(--text-primary)]">
                  {formatPrice(summary.expense)}
                </strong>
              </div>
            </div>
          </section>

          {/* Recent transactions */}
          <section className="mb-10">
            <div className="mb-5 flex items-start justify-between gap-3">
              <div className="mb-5">
                <h2 className="m-0 text-xl font-extrabold text-[var(--text-primary)]">Transaksi Terakhir</h2>
                <p className="mt-1.5 text-[13px] text-[var(--text-secondary)]">5 aktivitas terbaru di akunmu.</p>
              </div>

              <button
                className="whitespace-nowrap border-0 bg-transparent px-0 py-1 text-[13px] font-bold text-[var(--primary)] hover:text-[var(--primary-hover)] hover:underline focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-[var(--lavender)] focus-visible:outline-offset-2"
                onClick={() => setActiveTab("history")}
              >
                Lihat semua
              </button>
            </div>

            {renderTransactionList(transactions.slice(0, 5))}
          </section>
        </>
      )}

      {/* History */}
      {activeTab === "history" && (
        <section className="mb-10">
          <div className="mb-5 flex items-start justify-between gap-3">
            <div>
              <h2 className="m-0 text-xl font-extrabold text-[var(--text-primary)]">Riwayat Transaksi</h2>
              <p className="mt-1.5 text-[13px] text-[var(--text-secondary)]">Semua aktivitas keuangan di akunmu.</p>
            </div>

            <span className="whitespace-nowrap text-[13px] font-bold text-[var(--primary)]">
              {filteredTransactions.length} Transaksi
            </span>
          </div>

          <div className="mb-5 flex gap-3 overflow-x-auto pb-2">
            {historyFilters.map((filter) => (
              <button
                key={filter.key}
                className={`shrink-0 rounded-[var(--radius-md)] border px-5 py-[11px] text-[13px] font-semibold transition focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-[var(--lavender)] focus-visible:outline-offset-2 ${historyFilter === filter.key ? "border-[var(--primary)] bg-[var(--primary)] text-white shadow-[var(--shadow-sm)]" : "border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:border-[var(--primary-light)] hover:text-[var(--primary)]"}`}
                onClick={() => setHistoryFilter(filter.key)}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {renderTransactionList(filteredTransactions)}
        </section>
      )}

      {/* Footer */}
      <footer className="mt-[60px] border-t border-[var(--border)] py-6 text-center text-xs text-[var(--text-muted)]">
        © 2026 Mercatix. All rights reserved.
      </footer>

      {/* Modal */}
      {config && (
        <div className="fixed inset-0 z-[60] flex items-center transition-opacity duration-200 justify-center bg-[rgba(24,12,45,0.45)] p-4" onClick={closeAction}>
          <div
            className="max-h-[90vh] w-full max-w-[440px] overflow-y-auto transition-transform duration-200 rounded-[var(--radius-xl)] bg-[var(--surface)] p-7 shadow-[var(--shadow-lg)]"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            ref={modalRef}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6 flex items-start justify-between gap-3">
              <div>
                <h3 id="modal-title" className="m-0 text-lg font-extrabold">{config.title}</h3>
                <p className="mt-1.5 text-[13px] text-[var(--text-secondary)]">{config.description}</p>
              </div>

              <button
                className="rounded-[var(--radius-sm)] bg-transparent px-3 py-2 text-[var(--text-secondary)] hover:bg-[var(--lavender-bg)] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-[var(--lavender)] focus-visible:outline-offset-2"
                onClick={closeAction}
                disabled={submitting}
                aria-label="Tutup"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitAction}>
              {config.fields.map((field) => (
                <label className="mb-4 block" key={field.name}>
                  <span className="mb-2 block text-xs font-semibold text-[var(--text-secondary)]">{field.label}</span>

                  {field.options ? (
                    <select
                      className="w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-[13px] text-[var(--text-primary)] outline-none transition focus:border-[var(--primary-light)] focus:bg-[var(--surface)] focus:shadow-[0_0_0_3px_var(--lavender-soft)]"
                      value={form[field.name]}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          [field.name]: e.target.value,
                        })
                      }
                      disabled={submitting}
                    >
                      {field.options.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      className="w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-[13px] text-[var(--text-primary)] outline-none transition focus:border-[var(--primary-light)] focus:bg-[var(--surface)] focus:shadow-[0_0_0_3px_var(--lavender-soft)]"
                      type="text"
                      placeholder={field.placeholder}
                      value={form[field.name]}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          [field.name]: e.target.value,
                        })
                      }
                      disabled={submitting}
                    />
                  )}
                </label>
              ))}

              <label className="mb-4 block">
                <span className="mb-2 block text-xs font-semibold text-[var(--text-secondary)]">Nominal</span>

                <div className="relative">
                  <em className="absolute left-4 top-1/2 -translate-y-1/2 text-[13px] font-bold not-italic text-[var(--text-muted)]">Rp</em>

                  <input
                    className="w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--background)] py-3 pl-11 pr-4 text-base font-bold text-[var(--text-primary)] outline-none transition focus:border-[var(--primary-light)] focus:bg-[var(--surface)] focus:shadow-[0_0_0_3px_var(--lavender-soft)]"
                    type="text"
                    inputMode="numeric"
                    placeholder="0"
                    value={
                      amount
                        ? Number(amount).toLocaleString("id-ID")
                        : ""
                    }
                    onChange={handleAmountChange}
                    disabled={submitting}
                  />
                </div>
              </label>

              <div className="mb-4 flex flex-wrap gap-2">
                {quickAmounts.map((quick) => (
                  <button
                    className="rounded-[30px] border border-[var(--border)] bg-[var(--surface)] px-3.5 py-[7px] text-xs font-semibold text-[var(--text-secondary)] transition hover:border-[var(--primary)] hover:bg-[var(--lavender-bg)] hover:text-[var(--primary)] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-[var(--lavender)] focus-visible:outline-offset-2"
                    type="button"
                    key={quick}
                    onClick={() => setAmount(String(quick))}
                    disabled={submitting}
                  >
                    {quick / 1000}rb
                  </button>
                ))}
              </div>

              {config.checkBalance && (
                <p className="mb-4 text-xs text-[var(--text-secondary)]">
                  Saldo tersedia: {formatPrice(balance)}
                </p>
              )}

              {formError && (
                <p className="mb-4 rounded-[var(--radius-sm)] bg-red-50 px-3.5 py-2.5 text-xs leading-relaxed text-[var(--danger)]" role="alert">
                  {formError}
                </p>
              )}

              <button
                type="submit"
                className="w-full rounded-[var(--radius-md)] bg-[var(--primary)] px-[22px] py-[13px] text-[13px] font-bold text-white transition hover:-translate-y-0.5 hover:bg-[var(--primary-hover)] disabled:cursor-not-allowed disabled:opacity-60"
                disabled={submitting || loading}
              >
                {submitting ? "Memproses..." : config.submit}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 z-[70] max-w-[calc(100%-32px)] -translate-x-1/2  rounded-[var(--radius-md)] bg-[var(--primary-dark)] px-[22px] py-3.5 text-[13px] font-semibold text-white shadow-[var(--shadow-lg)]" role="status">
          {toast}
        </div>
      )}
    </PageLayout>
  );
}
