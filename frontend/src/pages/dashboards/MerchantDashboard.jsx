import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../utils/auth';

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        navigate('/login', { replace: true });
        return;
      }

      try {
        const response = await fetch('http://127.0.0.1:8000/api/user', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        });

        if (!response.ok) {
          localStorage.removeItem('token');
          navigate('/login', { replace: true });
          return;
        }

        const data = await response.json();
        setUser(data.user);
      } catch (error) {
        console.error('Gagal mengambil data user:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <p className="text-sm text-slate-500">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <>
      <title>Dashboard</title>
      <div className="min-h-screen bg-slate-50 text-slate-800">

        {/* Sidebar */}
        <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 border-r border-slate-200 bg-white p-6 lg:block">
          <div className="mb-10 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 font-bold text-white">
              M
            </div>

            <span className="text-xl font-bold tracking-tight text-slate-900">
              Mercatix
            </span>
          </div>

          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Main Menu
          </p>

          <nav className="space-y-2">
            <a
              href="/dashboard"
              className="flex items-center gap-3 rounded-xl bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-600"
            >
              <span>◫</span>
              Dashboard
            </a>

            <a
              href="#products"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
            >
              <span>▦</span>
              Products
            </a>

            <a
              href="#transactions"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
            >
              <span>▤</span>
              Transactions
            </a>

            <a
              href="#reports"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
            >
              <span>▥</span>
              Reports
            </a>
          </nav>

          <div className="absolute bottom-6 left-6 right-6">
            <button
              onClick={handleLogout}
              className="w-full rounded-xl border border-red-100 px-4 py-3 text-left text-sm font-semibold text-red-500 transition hover:bg-red-50"
            >
              Logout
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="lg:ml-64">

          {/* Header */}
          <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5 sm:px-8">
            <div>
              <h1 className="text-xl font-bold text-slate-900">
                Dashboard
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Overview of your business.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-semibold text-slate-900">
                  {user?.name || 'User'}
                </p>
                <p className="text-xs text-slate-500">
                  {user?.email}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-600">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>

              <button
                onClick={handleLogout}
                className="rounded-lg px-3 py-2 text-sm font-medium text-red-500 hover:bg-red-50 lg:hidden"
              >
                Logout
              </button>
            </div>
          </header>

          {/* Dashboard Content */}
          <div className="space-y-8 p-6 sm:p-8">

            {/* Welcome */}
            <section>
              <h2 className="text-2xl font-bold text-slate-900">
                Welcome back, {user?.name || 'User'}!
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Here's what's happening with your store today.
              </p>
            </section>

            {/* Statistics */}
            <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm font-medium text-slate-500">
                  Total Products
                </p>
                <h3 className="mt-3 text-3xl font-bold text-slate-900">
                  128
                </h3>
                <p className="mt-2 text-xs text-slate-400">
                  Products in inventory
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm font-medium text-slate-500">
                  Total Transactions
                </p>
                <h3 className="mt-3 text-3xl font-bold text-slate-900">
                  256
                </h3>
                <p className="mt-2 text-xs text-slate-400">
                  All recorded transactions
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm font-medium text-slate-500">
                  Total Revenue
                </p>
                <h3 className="mt-3 text-3xl font-bold text-slate-900">
                  Rp12,5jt
                </h3>
                <p className="mt-2 text-xs text-slate-400">
                  Total sales revenue
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm font-medium text-slate-500">
                  Low Stock
                </p>
                <h3 className="mt-3 text-3xl font-bold text-orange-500">
                  8
                </h3>
                <p className="mt-2 text-xs text-slate-400">
                  Products need restocking
                </p>
              </div>

            </section>

            {/* Recent Transactions */}
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
                <div>
                  <h3 className="font-bold text-slate-900">
                    Recent Transactions
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">
                    Latest recorded transactions.
                  </p>
                </div>

                <button className="text-sm font-semibold text-blue-600 hover:text-blue-700">
                  View All
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Transaction ID</th>
                      <th className="px-6 py-4 font-semibold">Product</th>
                      <th className="px-6 py-4 font-semibold">Date</th>
                      <th className="px-6 py-4 font-semibold">Amount</th>
                      <th className="px-6 py-4 font-semibold">Status</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {[
                      { id: '#TRX-001', product: 'Wireless Mouse', date: '11 Nov 2026', amount: 'Rp150.000', status: 'Completed' },
                      { id: '#TRX-002', product: 'Mechanical Keyboard', date: '11 Nov 2026', amount: 'Rp450.000', status: 'Completed' },
                      { id: '#TRX-003', product: 'USB Hub', date: '10 Nov 2026', amount: 'Rp85.000', status: 'Pending' },
                    ].map((transaction) => (
                      <tr key={transaction.id} className="transition hover:bg-slate-50">
                        <td className="whitespace-nowrap px-6 py-4 font-medium text-slate-900">
                          {transaction.id}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-slate-600">
                          {transaction.product}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-slate-500">
                          {transaction.date}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 font-medium text-slate-900">
                          {transaction.amount}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            transaction.status === 'Completed'
                              ? 'bg-green-50 text-green-600'
                              : 'bg-orange-50 text-orange-600'
                          }`}>
                            {transaction.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

          </div>
        </main>
      </div>
    </>
  );
}

export default Dashboard;
