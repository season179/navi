// SDD requirement heading status pills echoing Kun's SddRequirementBadges TipTap
// extension (../Kun/src/renderer/src/write/tiptap/extensions/sdd-requirement-badges.ts).
// Visual only: static pills on h3 headings with hidden {status} tokens.

import { type ReactElement, type ReactNode } from 'react'

export type SddRequirementBadgeStatus =
  | 'draft'
  | 'planned'
  | 'building'
  | 'done'
  | 'verified'

const STATUS_LABEL: Record<SddRequirementBadgeStatus, string> = {
  draft: 'Draft',
  planned: 'Planned',
  building: 'Building',
  done: 'Done',
  verified: 'Verified',
}

type PillProps = {
  status: SddRequirementBadgeStatus
}

export function SddRequirementStatusPill({ status }: PillProps): ReactElement {
  return (
    <span className={`sdd-req-pill sdd-req-pill-${status}`} contentEditable={false}>
      {STATUS_LABEL[status]}
    </span>
  )
}

type HeadingProps = {
  id: string
  title: string
  status?: SddRequirementBadgeStatus
  children?: ReactNode
}

/** h3 requirement heading with hidden {status} token and trailing status pill. */
export function SddRequirementHeading({
  id,
  title,
  status = 'draft',
  children,
}: HeadingProps): ReactElement {
  const token = status === 'draft' ? null : `{${status}}`

  return (
    <>
      <h3>
        {id}: {title}
        {token ? <span className="sdd-req-token-hidden">{token}</span> : null}
        <SddRequirementStatusPill status={status} />
      </h3>
      {children}
    </>
  )
}

/** TipTap-shaped SDD draft sample with requirement status pills on headings. */
export function SddRequirementRichSampleContent(): ReactElement {
  return (
    <>
      <h1>Export feature requirements</h1>
      <p>Background notes that sit outside structured requirement blocks.</p>
      <SddRequirementHeading id="R-1" title="Toolbar export button" status="planned">
        <p>Users see an export entry in the toolbar.</p>
        <ul data-type="taskList">
          <li>
            <label>
              <input type="checkbox" readOnly />
            </label>
            <div>
              <p>Button visible in toolbar</p>
            </div>
          </li>
          <li>
            <label>
              <input type="checkbox" checked readOnly />
            </label>
            <div>
              <p>Disabled state shows a tooltip</p>
            </div>
          </li>
        </ul>
      </SddRequirementHeading>
      <SddRequirementHeading id="R-2" title="CSV content complete" status="done">
        <p>Export includes every column from the table view.</p>
        <ul data-type="taskList">
          <li>
            <label>
              <input type="checkbox" checked readOnly />
            </label>
            <div>
              <p>Includes all columns</p>
            </div>
          </li>
          <li>
            <label>
              <input type="checkbox" readOnly />
            </label>
            <div>
              <p>Handles empty rows gracefully</p>
            </div>
          </li>
        </ul>
      </SddRequirementHeading>
      <SddRequirementHeading id="R-3" title="Format selection" status="building">
        <p>Let users pick CSV or JSON before downloading.</p>
      </SddRequirementHeading>
      <SddRequirementHeading id="R-4" title="Email delivery" status="verified">
        <p>Send the export to a verified email address.</p>
        <ul data-type="taskList">
          <li>
            <label>
              <input type="checkbox" checked readOnly />
            </label>
            <div>
              <p>Validates email format</p>
            </div>
          </li>
          <li>
            <label>
              <input type="checkbox" checked readOnly />
            </label>
            <div>
              <p>Shows confirmation toast</p>
            </div>
          </li>
        </ul>
      </SddRequirementHeading>
    </>
  )
}
