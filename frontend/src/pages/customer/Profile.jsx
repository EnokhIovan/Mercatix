import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Profile.css";
import Sidebar from "../../components/Sidebar";

const preferenceItems = [
  {
    key: "transactionAlerts",
    title: "Notifikasi transaksi",
    desc: "Terima pemberitahuan setiap ada uang masuk atau keluar.",
  },
  {
    key: "promoAlerts",
    title: "Info promo",
    desc: "Dapatkan penawaran dari merchant favoritmu.",
  },
  {
    key: "twoStep",
    title: "Verifikasi 2 langkah",
    desc: "Minta kode tambahan saat masuk dari perangkat baru.",
  },
];

const getInitial = (name) => (name || "C").trim().charAt(0).toUpperCase();

export default function Profile() {
  const navigate = useNavigate();

  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");

  const [profile, setProfile] = useState({
    name: storedUser.name || "",
    email: storedUser.email || "",
    phone: storedUser.phone || "",
  });
  const [profileError, setProfileError] = useState("");

  const [passwords, setPasswords] = useState({ current: "", next: "", confirm: "" });
  const [passwordError, setPasswordError] = useState("");

  const [preferences, setPreferences] = useState({
    transactionAlerts: true,
    promoAlerts: false,
    twoStep: false,
  });

  const [toast, setToast] = useState("");

  // Toast hilang otomatis
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  const handleSaveProfile = (e) => {
    e.preventDefault();

    if (!profile.name.trim()) {
      setProfileError("Nama lengkap wajib diisi.");
      return;
    }
    if (profile.email && !/^\S+@\S+\.\S+$/.test(profile.email)) {
      setProfileError("Format email belum benar.");
      return;
    }

    // TODO: ganti dengan request ke API
    localStorage.setItem("user", JSON.stringify({ ...storedUser, ...profile }));
    setProfileError("");
    setToast("Perubahan profil disimpan.");
  };

  const handleChangePassword = (e) => {
    e.preventDefault();

    if (!passwords.current) {
      setPasswordError("Kata sandi saat ini wajib diisi.");
      return;
    }
    if (passwords.next.length < 8) {
      setPasswordError("Kata sandi baru minimal 8 karakter.");
      return;
    }
    if (passwords.next !== passwords.confirm) {
      setPasswordError("Konfirmasi kata sandi tidak sama.");
      return;
    }

    // TODO: ganti dengan request ke API
    setPasswords({ current: "", next: "", confirm: "" });
    setPasswordError("");
    setToast("Kata sandi berhasil diubah.");
  };

  const togglePreference = (key) =>
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <Sidebar>
      {/* Header */}
      <section className="profile-header">
        <div className="profile-avatar">{getInitial(profile.name)}</div>

        <div>
          <h2>{profile.name || "Customer"}</h2>
          <p>Customer Account</p>
        </div>
      </section>

      <div className="profile-grid">
        {/* Data diri */}
        <form className="profile-panel" onSubmit={handleSaveProfile}>
          <h3>Data Diri</h3>
          <p className="profile-panel-description">Perbarui informasi akunmu.</p>

          <label className="profile-field">
            <span>Nama lengkap</span>
            <input
              type="text"
              autoComplete="name"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            />
          </label>

          <label className="profile-field">
            <span>Email</span>
            <input
              type="email"
              autoComplete="email"
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
            />
          </label>

          <label className="profile-field">
            <span>Nomor HP</span>
            <input
              type="tel"
              autoComplete="tel"
              value={profile.phone}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
            />
          </label>

          {profileError && (
            <p className="profile-error" role="alert">
              {profileError}
            </p>
          )}

          <button type="submit" className="profile-button">
            Simpan Perubahan
          </button>
        </form>

        {/* Ganti password */}
        <form className="profile-panel" onSubmit={handleChangePassword}>
          <h3>Ganti Kata Sandi</h3>
          <p className="profile-panel-description">Gunakan minimal 8 karakter.</p>

          <label className="profile-field">
            <span>Kata sandi saat ini</span>
            <input
              type="password"
              autoComplete="current-password"
              value={passwords.current}
              onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
            />
          </label>

          <label className="profile-field">
            <span>Kata sandi baru</span>
            <input
              type="password"
              autoComplete="new-password"
              value={passwords.next}
              onChange={(e) => setPasswords({ ...passwords, next: e.target.value })}
            />
          </label>

          <label className="profile-field">
            <span>Konfirmasi kata sandi baru</span>
            <input
              type="password"
              autoComplete="new-password"
              value={passwords.confirm}
              onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
            />
          </label>

          {passwordError && (
            <p className="profile-error" role="alert">
              {passwordError}
            </p>
          )}

          <button type="submit" className="profile-button">
            Ubah Kata Sandi
          </button>
        </form>

        {/* Preferensi */}
        <div className="profile-panel profile-panel-wide">
          <h3>Notifikasi & Keamanan</h3>
          <p className="profile-panel-description">
            Atur bagaimana Mercatix menghubungimu.
          </p>

          {preferenceItems.map((item) => (
            <div className="profile-switch-row" key={item.key}>
              <div>
                <strong>{item.title}</strong>
                <span>{item.desc}</span>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={preferences[item.key]}
                aria-label={item.title}
                className={`profile-switch ${preferences[item.key] ? "on" : ""}`}
                onClick={() => togglePreference(item.key)}
              />
            </div>
          ))}
        </div>

        {/* Logout */}
        <div className="profile-panel profile-panel-wide profile-logout">
          <div>
            <h3>Keluar dari akun</h3>
            <p className="profile-panel-description">
              Kamu perlu masuk lagi untuk mengakses dompetmu.
            </p>
          </div>

          <button className="profile-button-danger" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="profile-footer">© 2026 Mercatix. All rights reserved.</footer>

      {/* Toast */}
      {toast && (
        <div className="profile-toast" role="status">
          {toast}
        </div>
      )}
    </Sidebar>
  );
}