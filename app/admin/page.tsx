"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import AppShell from "@/app/components/AppShell";

const ADMIN_EMAIL = "marcussafar@gmail.com";

interface AuthUser {
  id: string;
  email?: string;
  created_at: string;
  last_sign_in_at?: string;
}

export default function AdminPage() {
  const router = useRouter();
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState("");
  const [inviteError, setInviteError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push("/login");
        return;
      }
      if (user.email !== ADMIN_EMAIL) {
        router.push("/");
        return;
      }
      setCurrentUserEmail(user.email);
      fetchUsers();
    });
  }, [router]);

  async function fetchUsers() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/users");
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to load users");
        return;
      }
      const data = await res.json();
      setUsers(data.users || []);
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setInviting(true);
    setInviteError("");
    setInviteSuccess("");
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail }),
      });
      const data = await res.json();
      if (!res.ok) {
        setInviteError(data.error || "Failed to invite user");
      } else {
        setInviteSuccess(`Invitation sent to ${inviteEmail}`);
        setInviteEmail("");
        fetchUsers();
      }
    } catch {
      setInviteError("Network error");
    } finally {
      setInviting(false);
    }
  }

  async function handleDelete(userId: string, userEmail?: string) {
    if (!confirm(`Delete user ${userEmail || userId}? This cannot be undone.`)) return;
    setDeletingId(userId);
    try {
      const res = await fetch("/api/admin/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to delete user");
      } else {
        fetchUsers();
      }
    } catch {
      alert("Network error");
    } finally {
      setDeletingId(null);
    }
  }

  function formatDate(dateStr?: string) {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  if (!currentUserEmail) {
    return null; // redirecting
  }

  return (
    <AppShell>
      <div className="p-8 max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">User Management</h1>
          <p className="text-slate-400 text-sm mt-1">
            Admin panel — manage who has access to Dev CRM
          </p>
        </div>

        {/* Invite User */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-8">
          <h2 className="text-base font-semibold text-white mb-4">Invite a New User</h2>
          <form onSubmit={handleInvite} className="flex gap-3">
            <input
              type="email"
              required
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="user@example.com"
              className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <button
              type="submit"
              disabled={inviting}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 disabled:text-indigo-400 text-white font-medium rounded-lg px-5 py-2.5 text-sm transition"
            >
              {inviting ? "Sending..." : "Send Invite"}
            </button>
          </form>
          {inviteSuccess && (
            <p className="text-green-400 text-sm mt-3">✓ {inviteSuccess}</p>
          )}
          {inviteError && (
            <p className="text-red-400 text-sm mt-3">✗ {inviteError}</p>
          )}
        </div>

        {/* Users List */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
            <h2 className="text-base font-semibold text-white">
              All Users
              {!loading && (
                <span className="ml-2 text-xs font-normal text-slate-400">
                  ({users.length})
                </span>
              )}
            </h2>
            <button
              onClick={fetchUsers}
              className="text-xs text-slate-400 hover:text-white transition"
            >
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="px-6 py-12 text-center text-slate-500 text-sm">
              Loading users...
            </div>
          ) : error ? (
            <div className="px-6 py-8 text-center text-red-400 text-sm">{error}</div>
          ) : users.length === 0 ? (
            <div className="px-6 py-12 text-center text-slate-500 text-sm">
              No users found
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs text-slate-500 uppercase tracking-wide border-b border-slate-800">
                  <th className="px-6 py-3 font-medium">Email</th>
                  <th className="px-6 py-3 font-medium">Created</th>
                  <th className="px-6 py-3 font-medium">Last Sign In</th>
                  <th className="px-6 py-3 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {users.map((u) => {
                  const isCurrentUser = u.email === currentUserEmail;
                  return (
                    <tr key={u.id} className="hover:bg-slate-800/50 transition">
                      <td className="px-6 py-4 text-sm text-white">
                        {u.email || "—"}
                        {isCurrentUser && (
                          <span className="ml-2 text-xs bg-indigo-900/60 text-indigo-300 px-1.5 py-0.5 rounded-full border border-indigo-700/50">
                            you (admin)
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-400">
                        {formatDate(u.created_at)}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-400">
                        {formatDate(u.last_sign_in_at)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {!isCurrentUser && (
                          <button
                            onClick={() => handleDelete(u.id, u.email)}
                            disabled={deletingId === u.id}
                            className="text-xs text-red-400 hover:text-red-300 disabled:text-slate-600 transition font-medium"
                          >
                            {deletingId === u.id ? "Deleting..." : "Delete"}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AppShell>
  );
}
