// Static floating composer echoing Kun's chat composer: a rounded frosted
// shell with a textarea, a plus menu + model chip on the left, and a circular
// send button on the right. Visual only — it manages its own text state but
// never sends anywhere.

import { useState } from 'react'
import { Plus, ChevronDown, ArrowUp } from 'lucide-react'

export function Composer() {
  const [value, setValue] = useState('')

  return (
    <div className="composer-wrap">
      <div className="composer">
        <textarea
          rows={1}
          placeholder="Send a message to Navi…"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <div className="composer-toolbar">
          <div className="composer-toolbar-left">
            <button className="tool-btn" aria-label="Add" title="Add">
              <Plus />
            </button>
            <button className="model-chip" aria-label="Model">
              GLM-5.2
              <ChevronDown />
            </button>
          </div>
          <div className="composer-toolbar-right">
            <button
              className="send-btn"
              disabled={!value.trim()}
              aria-label="Send"
              title="Send"
            >
              <ArrowUp />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
