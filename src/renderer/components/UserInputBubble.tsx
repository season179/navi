// Agent user-input prompt bubble echoing Kun's UserInputBubble
// (../Kun/src/renderer/src/components/chat/message-timeline-bubbles.tsx).
// Visual only: parent supplies a user-input snapshot.

import { Check, Loader2 } from 'lucide-react'
import { useEffect, useState, type ReactElement } from 'react'

const USER_INPUT_OTHER_LABEL = 'Other'
const USER_INPUT_FREEFORM_LABEL = 'Answer'

export type UserInputOption = {
  label: string
  description?: string
}

export type UserInputQuestion = {
  id: string
  header?: string
  question: string
  options: UserInputOption[]
}

export type UserInputAnswer = {
  id: string
  label: string
  value: string
}

export type UserInputSnapshot = {
  id: string
  status: 'pending' | 'submitted' | 'cancelled' | 'error'
  questions: UserInputQuestion[]
  answers?: UserInputAnswer[]
  errorMessage?: string
}

type Props = {
  block: UserInputSnapshot
  nested?: boolean
}

/** Sample data for ?userInputBubble=1 visual verification (multiple choice). */
export const USER_INPUT_BUBBLE_PREVIEW: UserInputSnapshot = {
  id: 'preview-user-input',
  status: 'pending',
  questions: [
    {
      id: 'q1',
      header: 'Deployment',
      question: 'Which environment should we deploy to first?',
      options: [
        {
          label: 'Staging',
          description: 'Run smoke tests against the staging cluster.',
        },
        {
          label: 'Production',
          description: 'Ship directly after CI passes.',
        },
      ],
    },
  ],
}

/** Freeform textarea preview for ?userInputBubble=freeform. */
export const USER_INPUT_BUBBLE_PREVIEW_FREEFORM: UserInputSnapshot = {
  id: 'preview-user-input-freeform',
  status: 'pending',
  questions: [
    {
      id: 'q1',
      question: 'What should the migration script do with legacy session tokens?',
      options: [],
    },
  ],
}

/** Submitted preview for ?userInputBubble=submitted. */
export const USER_INPUT_BUBBLE_PREVIEW_SUBMITTED: UserInputSnapshot = {
  id: 'preview-user-input-submitted',
  status: 'submitted',
  questions: [
    {
      id: 'q1',
      question: 'Which environment should we deploy to first?',
      options: [
        { label: 'Staging', description: 'Run smoke tests against the staging cluster.' },
        { label: 'Production', description: 'Ship directly after CI passes.' },
      ],
    },
  ],
  answers: [{ id: 'q1', label: 'Staging', value: 'Staging' }],
}

/** Cancelled preview for ?userInputBubble=cancelled. */
export const USER_INPUT_BUBBLE_PREVIEW_CANCELLED: UserInputSnapshot = {
  ...USER_INPUT_BUBBLE_PREVIEW,
  id: 'preview-user-input-cancelled',
  status: 'cancelled',
}

/** Error preview for ?userInputBubble=error. */
export const USER_INPUT_BUBBLE_PREVIEW_ERROR: UserInputSnapshot = {
  ...USER_INPUT_BUBBLE_PREVIEW,
  id: 'preview-user-input-error',
  status: 'error',
  errorMessage: 'The agent could not persist your answer.',
}

/** Multi-question preview for ?userInputBubble=multi. */
export const USER_INPUT_BUBBLE_PREVIEW_MULTI: UserInputSnapshot = {
  id: 'preview-user-input-multi',
  status: 'pending',
  questions: [
    {
      id: 'q1',
      header: 'Database',
      question: 'Should we run the migration during maintenance window?',
      options: [
        { label: 'Yes', description: 'Schedule for tonight at 2 AM UTC.' },
        { label: 'No', description: 'Wait until next weekend.' },
      ],
    },
    {
      id: 'q2',
      header: 'Rollback',
      question: 'Do you want an automatic rollback on failure?',
      options: [
        { label: 'Enable rollback', description: 'Revert schema changes if health checks fail.' },
        { label: 'Manual only', description: 'Notify the team and wait for approval.' },
      ],
    },
  ],
}

function answersByQuestionId(
  answers: UserInputAnswer[] | undefined,
): Record<string, UserInputAnswer> {
  const out: Record<string, UserInputAnswer> = {}
  for (const answer of answers ?? []) {
    out[answer.id] = answer
  }
  return out
}

export function UserInputBubble({ block, nested = false }: Props): ReactElement {
  const [answers, setAnswers] = useState<Record<string, UserInputAnswer>>(() =>
    answersByQuestionId(block.answers),
  )
  const pending = block.status === 'pending'
  const done = block.status !== 'pending'

  useEffect(() => {
    setAnswers(answersByQuestionId(block.answers))
  }, [block.id, block.answers])

  const chooseOption = (question: UserInputQuestion, label: string, value = label): void => {
    setAnswers((prev) => ({
      ...prev,
      [question.id]: { id: question.id, label, value },
    }))
  }

  const canSubmit = block.questions.every((question) => {
    const answer = answers[question.id]
    if (!answer) return false
    if (question.options.length === 0 || answer.label === USER_INPUT_OTHER_LABEL) {
      return answer.value.trim().length > 0
    }
    return true
  })

  const submit = (): void => {
    if (!canSubmit || !pending) return
  }

  const cancel = (): void => {
    if (!pending) return
  }

  const statusLabel =
    block.status === 'submitted'
      ? 'Submitted'
      : block.status === 'cancelled'
        ? 'Cancelled'
        : block.status === 'error'
          ? 'Submit failed'
          : 'Waiting for your answer…'

  const tone =
    block.status === 'error'
      ? 'error'
      : block.status === 'submitted'
        ? 'success'
        : block.status === 'cancelled'
          ? 'muted'
          : 'active'

  const questionCount = block.questions.length

  return (
    <div
      className={`user-input-bubble tone-${tone}${nested ? ' is-nested' : ''}`}
    >
      <div className="user-input-bubble-header">
        <div className="user-input-bubble-header-main">
          <span className="user-input-bubble-icon-frame">
            {tone === 'active' ? (
              <Loader2 className="user-input-bubble-status-icon is-spin" strokeWidth={2} />
            ) : tone === 'success' ? (
              <Check className="user-input-bubble-status-icon" strokeWidth={2} />
            ) : tone === 'error' ? (
              <span className="user-input-bubble-status-icon is-error">!</span>
            ) : (
              <span className="user-input-bubble-status-icon is-muted-dot" />
            )}
          </span>
          <div className="user-input-bubble-title-wrap">
            <div className="user-input-bubble-title">Input required</div>
            <div className={`user-input-bubble-status tone-${tone}`}>{statusLabel}</div>
          </div>
        </div>
        {questionCount > 1 ? (
          <span className="user-input-bubble-count">{questionCount}</span>
        ) : null}
      </div>

      <div className={`user-input-bubble-questions${nested ? ' is-nested' : ''}`}>
        {block.questions.map((question, index) => {
          const answer = answers[question.id]
          const hasOptions = question.options.length > 0
          const otherSelected = answer?.label === USER_INPUT_OTHER_LABEL
          const submittedAnswer = done ? (answer?.value || answer?.label || '') : ''
          const showProgress = questionCount > 1
          const showHeader =
            typeof question.header === 'string' &&
            question.header.trim().length > 0 &&
            !(questionCount === 1 && question.header.trim().toLowerCase() === 'input')

          return (
            <div
              key={question.id}
              className={`user-input-bubble-question${submittedAnswer ? ' has-answer' : ''}`}
            >
              {showHeader || showProgress ? (
                <div className="user-input-bubble-question-meta">
                  <div className="user-input-bubble-question-meta-left">
                    {showHeader ? (
                      <div className="user-input-bubble-question-header">{question.header}</div>
                    ) : null}
                  </div>
                  {showProgress ? (
                    <div className="user-input-bubble-question-progress">
                      Question {index + 1} / {block.questions.length}
                    </div>
                  ) : null}
                </div>
              ) : null}
              <p
                className={`user-input-bubble-question-text${
                  showHeader || showProgress ? ' has-meta' : ''
                }`}
              >
                {question.question}
              </p>

              {submittedAnswer ? (
                <div className="user-input-bubble-submitted-answer">
                  <span className="user-input-bubble-submitted-icon">
                    <Check className="user-input-bubble-submitted-check" strokeWidth={2.1} />
                  </span>
                  <span className="user-input-bubble-submitted-text">{submittedAnswer}</span>
                </div>
              ) : done ? (
                <div className="user-input-bubble-done-placeholder">{statusLabel}</div>
              ) : hasOptions ? (
                <div className="user-input-bubble-options">
                  {question.options.map((option) => {
                    const selected =
                      answer?.label === option.label && answer.value === option.label
                    return (
                      <button
                        key={option.label}
                        type="button"
                        disabled={done}
                        onClick={() => chooseOption(question, option.label)}
                        className={`user-input-bubble-option${selected ? ' is-selected' : ''}`}
                      >
                        <span
                          className={`user-input-bubble-option-radio${
                            selected ? ' is-selected' : ''
                          }`}
                        >
                          {selected ? (
                            <span className="user-input-bubble-option-radio-dot" />
                          ) : null}
                        </span>
                        <span className="user-input-bubble-option-content">
                          <span className="user-input-bubble-option-label">{option.label}</span>
                          {option.description ? (
                            <span className="user-input-bubble-option-description">
                              {option.description}
                            </span>
                          ) : null}
                        </span>
                      </button>
                    )
                  })}
                  <button
                    type="button"
                    disabled={done}
                    onClick={() =>
                      chooseOption(
                        question,
                        USER_INPUT_OTHER_LABEL,
                        answer?.label === USER_INPUT_OTHER_LABEL ? answer.value : '',
                      )
                    }
                    className={`user-input-bubble-option${otherSelected ? ' is-selected' : ''}`}
                  >
                    <span
                      className={`user-input-bubble-option-radio${
                        otherSelected ? ' is-selected' : ''
                      }`}
                    >
                      {otherSelected ? (
                        <span className="user-input-bubble-option-radio-dot" />
                      ) : null}
                    </span>
                    <span className="user-input-bubble-option-content">
                      <span className="user-input-bubble-option-label">Other</span>
                      <span className="user-input-bubble-option-description">
                        Type a custom response
                      </span>
                    </span>
                  </button>
                  {otherSelected ? (
                    <textarea
                      rows={2}
                      disabled={done}
                      value={answer?.value ?? ''}
                      onChange={(e) =>
                        chooseOption(question, USER_INPUT_OTHER_LABEL, e.target.value)
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                          e.preventDefault()
                          submit()
                        }
                      }}
                      placeholder="Type your answer…"
                      className="user-input-bubble-textarea is-compact"
                    />
                  ) : null}
                </div>
              ) : (
                <div className="user-input-bubble-freeform">
                  <textarea
                    rows={3}
                    disabled={done}
                    value={answer?.value ?? ''}
                    onChange={(e) =>
                      chooseOption(question, USER_INPUT_FREEFORM_LABEL, e.target.value)
                    }
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                        e.preventDefault()
                        submit()
                      }
                    }}
                    placeholder="Type your answer…"
                    className="user-input-bubble-textarea"
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>

      {block.errorMessage ? (
        <p className="user-input-bubble-error-message">{block.errorMessage}</p>
      ) : null}

      {pending ? (
        <div className="user-input-bubble-actions">
          <button
            type="button"
            disabled={!canSubmit}
            className="user-input-bubble-submit"
            onClick={submit}
          >
            <Check className="user-input-bubble-submit-icon" strokeWidth={2} />
            Submit
          </button>
          <button type="button" className="user-input-bubble-cancel" onClick={cancel}>
            Cancel
          </button>
        </div>
      ) : null}
    </div>
  )
}
