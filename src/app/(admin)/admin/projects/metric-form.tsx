'use client'

import { useState } from 'react'
import { saveMetric } from './metrics-actions'
import { METRIC_GROUPS } from '@/lib/metric-presets'

export default function MetricForm({ projectId }: { projectId: string }) {
  const [metric, setMetric] = useState('')
  const isCustom = metric === '__custom__'
  const input = 'mt-1 w-full rounded border border-gray-300 p-2 text-sm'

  return (
    <form action={saveMetric} className="space-y-3 rounded border bg-gray-50 p-3">
      <input type="hidden" name="project_id" value={projectId} />

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600">Metric</label>
          <select
            name="metric"
            value={metric}
            onChange={(e) => setMetric(e.target.value)}
            required
            className={input}
          >
            <option value="">Select a metric</option>
            {METRIC_GROUPS.map((group) => (
              <optgroup key={group.label} label={group.label}>
                {group.metrics.map((m) => (
                  <option key={m.name} value={m.name}>{m.name}</option>
                ))}
              </optgroup>
            ))}
            <option value="__custom__">Custom metric…</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600">Period date (the day, week or month it covers)</label>
          <input type="date" name="period_date" required className={input} />
        </div>

        {isCustom && (
          <>
            <div>
              <label className="block text-xs font-medium text-gray-600">Custom metric name</label>
              <input type="text" name="custom_name" required className={input} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600">Type</label>
              <select name="custom_unit" defaultValue="number" className={input}>
                <option value="number">Number</option>
                <option value="currency">Amount (R)</option>
                <option value="percent">Percentage</option>
              </select>
            </div>
          </>
        )}

        <div>
          <label className="block text-xs font-medium text-gray-600">Value (percentages as plain numbers, e.g. 3.2 for 3.2%)</label>
          <input type="number" name="value" step="any" required className={input} />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600">Note (optional)</label>
          <input type="text" name="note" className={input} />
        </div>
      </div>

      <button type="submit" className="rounded bg-blue-600 px-3 py-1.5 text-sm text-white">
        Save figure
      </button>
    </form>
  )
}