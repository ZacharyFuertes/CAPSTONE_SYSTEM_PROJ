import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import {
  AlertTriangle,
  Users,
  Clock,
  CheckCircle,
  DollarSign,
} from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'
import { useAuth } from '../contexts/AuthContext'

// Mock data - replace with real Supabase queries
const mockRevenueData = [
  { date: 'Mon', revenue: 2400 },
  { date: 'Tue', revenue: 1398 },
  { date: 'Wed', revenue: 9800 },
  { date: 'Thu', revenue: 3908 },
  { date: 'Fri', revenue: 4800 },
  { date: 'Sat', revenue: 3800 },
  { date: 'Sun', revenue: 4300 },
]

const mockStatusData = [
  { name: 'Completed', value: 35, color: '#10b981' },
  { name: 'In Progress', value: 12, color: '#f59e0b' },
  { name: 'Pending', value: 8, color: '#ef4444' },
]

const mockPartUsageData = [
  { name: 'Brake Pads', usage: 24 },
  { name: 'Oil Filter', usage: 18 },
  { name: 'Air Filter', usage: 15 },
  { name: 'Spark Plugs', usage: 12 },
  { name: 'Coolant', usage: 8 },
]

interface StatCard {
  label: string
  value: string | number
  change?: string
  icon: React.ReactNode
  color: string
}

const Dashboard: React.FC = () => {
  const { t } = useLanguage()
  const { user } = useAuth()
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('week')

  const stats: StatCard[] = [
    {
      label: t('dashboard.revenue'),
      value: '₱47,500',
      change: '+12.5% from last week',
      icon: <DollarSign className="w-8 h-8" />,
      color: 'from-green-500 to-emerald-600',
    },
    {
      label: t('dashboard.today_jobs'),
      value: '12',
      change: '5 completed today',
      icon: <CheckCircle className="w-8 h-8" />,
      color: 'from-blue-500 to-cyan-600',
    },
    {
      label: t('dashboard.pending'),
      value: '8',
      change: '3 new this week',
      icon: <Clock className="w-8 h-8" />,
      color: 'from-orange-500 to-red-600',
    },
    {
      label: 'Active Customers',
      value: '34',
      change: '+5 this month',
      icon: <Users className="w-8 h-8" />,
      color: 'from-purple-500 to-pink-600',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold text-white mb-2">{t('dashboard.title')}</h1>
        <p className="text-slate-400">
          Welcome back, {user?.name}! Here's your shop performance overview.
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`bg-gradient-to-br ${stat.color} rounded-lg p-6 text-white shadow-lg hover:shadow-xl transition-shadow`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="bg-white/20 p-3 rounded-lg">{stat.icon}</div>
              <span className="text-xs bg-white/20 px-2 py-1 rounded text-xs">
                {stat.change}
              </span>
            </div>
            <p className="text-slate-200 text-sm mb-2">{stat.label}</p>
            <p className="text-3xl font-bold">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Revenue Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 bg-slate-800 rounded-lg p-6 shadow-lg border border-slate-700"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Revenue Trend</h2>
            <div className="flex gap-2">
              {(['week', 'month', 'year'] as const).map((period) => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={`px-3 py-1 rounded text-sm transition ${
                    selectedPeriod === period
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {period.charAt(0).toUpperCase() + period.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={mockRevenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
              <XAxis stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
                labelStyle={{ color: '#e2e8f0' }}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: '#3b82f6', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Job Status Pie */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-slate-800 rounded-lg p-6 shadow-lg border border-slate-700"
        >
          <h2 className="text-xl font-bold text-white mb-6">Job Status Distribution</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={mockStatusData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {mockStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
                labelStyle={{ color: '#e2e8f0' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {mockStatusData.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-slate-300">{item.name}</span>
                </div>
                <span className="text-white font-semibold">{item.value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Part Usage & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Parts Used */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-slate-800 rounded-lg p-6 shadow-lg border border-slate-700"
        >
          <h2 className="text-xl font-bold text-white mb-6">Top Parts Used</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={mockPartUsageData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
              <XAxis stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
                labelStyle={{ color: '#e2e8f0' }}
              />
              <Bar dataKey="usage" fill="#f59e0b" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Low Stock Alerts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-slate-800 rounded-lg p-6 shadow-lg border border-slate-700"
        >
          <div className="flex items-center gap-3 mb-6">
            <AlertTriangle className="w-6 h-6 text-red-500" />
            <h2 className="text-xl font-bold text-white">{t('dashboard.low_stock')}</h2>
          </div>
          <div className="space-y-4">
            {[
              { name: 'Spark Plugs', current: 3, reorder: 10 },
              { name: 'Oil Filter', current: 5, reorder: 15 },
              { name: 'Brake Fluid', current: 2, reorder: 8 },
            ].map((item) => (
              <div key={item.name} className="bg-slate-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-semibold">{item.name}</span>
                  <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded">
                    Critical
                  </span>
                </div>
                <div className="w-full bg-slate-600 rounded-full h-2">
                  <div
                    className="bg-red-500 h-2 rounded-full"
                    style={{ width: `${(item.current / item.reorder) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  {item.current} units (need {item.reorder})
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Dashboard
