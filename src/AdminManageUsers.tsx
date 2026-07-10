import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { ArrowLeft, UserPlus } from "lucide-react";
import { useState } from "react";

export default function AdminManageUsers() {
  const users = useQuery(api.users.listUsers);
  
  if (users === undefined) {
    return <div className="p-8">Loading users...</div>;
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] dark:bg-gray-900 text-[#424242] dark:text-gray-100 p-5 transition-colors">
      <div className="flex items-center mb-8">
        <a href="/dashboard" className="p-2 -ml-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition">
          <ArrowLeft size={24} />
        </a>
        <h1 className="text-2xl font-semibold ml-4">Manage Users</h1>
      </div>

      <div className="flex justify-end mb-4">
        <button className="flex items-center gap-2 bg-[#229799] hover:bg-[#1d8587] text-white px-4 py-2 rounded-lg font-medium transition">
          <UserPlus size={18} />
          Create New User
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 text-sm">
              <tr>
                <th className="px-6 py-4 font-medium">Email</th>
                <th className="px-6 py-4 font-medium">Role</th>
                <th className="px-6 py-4 font-medium">ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {users.map((u) => (
                <tr key={u._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition">
                  <td className="px-6 py-4 font-medium">{u.email || "No email"}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-md text-xs font-semibold ${
                      u.role === "admin" 
                        ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" 
                        : "bg-[#48CFCB]/20 text-[#229799] dark:bg-[#48CFCB]/10 dark:text-[#48CFCB]"
                    }`}>
                      {u.role || "user"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs font-mono text-gray-400">{u._id}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && (
            <div className="p-8 text-center text-gray-500">No users found.</div>
          )}
        </div>
      </div>
    </div>
  );
}
