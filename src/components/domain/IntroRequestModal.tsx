import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Select, Textarea } from '@/components/ui/Input'
import { createIntroRequest } from '@/services/intro-requests.service'
import { listStartups } from '@/services/startups.service'
import { listIdeas } from '@/services/ideas.service'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { toast } from '@/store/toast.store'
import type { IntroDirection } from '@/types'

interface IntroRequestModalProps {
  open: boolean
  onClose: () => void
  recipientId: string
  recipientName?: string
  direction: IntroDirection
  /** Fixed context (used when an investor requests an intro about a specific startup/idea they're viewing). */
  startupId?: string
  ideaId?: string
  contextLabel?: string
}

export function IntroRequestModal({
  open,
  onClose,
  recipientId,
  recipientName,
  direction,
  startupId,
  ideaId,
  contextLabel,
}: IntroRequestModalProps) {
  const queryClient = useQueryClient()
  const { data: currentUser } = useCurrentUser()
  const [message, setMessage] = useState('')
  const [pickedContext, setPickedContext] = useState('')

  const hasFixedContext = !!startupId || !!ideaId
  const showPicker = direction === 'FOUNDER_TO_INVESTOR' && !hasFixedContext

  const { data: myStartups } = useQuery({
    queryKey: ['startups', 'member', currentUser?.id],
    queryFn: () => listStartups({ memberId: currentUser!.id }),
    enabled: open && showPicker && !!currentUser,
  })
  const { data: myIdeas } = useQuery({
    queryKey: ['ideas', 'creator', currentUser?.id],
    queryFn: () => listIdeas({ creatorId: currentUser!.id }),
    enabled: open && showPicker && !!currentUser,
  })

  function reset() {
    setMessage('')
    setPickedContext('')
  }

  const mutation = useMutation({
    mutationFn: () => {
      let resolvedStartupId = startupId
      let resolvedIdeaId = ideaId
      if (showPicker && pickedContext) {
        const [kind, id] = pickedContext.split(':')
        if (kind === 'startup') resolvedStartupId = id
        if (kind === 'idea') resolvedIdeaId = id
      }
      return createIntroRequest({ recipientId, direction, startupId: resolvedStartupId, ideaId: resolvedIdeaId, message })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['intro-requests'] })
      toast.success('Introduction requested')
      onClose()
      reset()
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : 'Could not send this request'),
  })

  return (
    <Modal
      open={open}
      onClose={() => {
        onClose()
        reset()
      }}
      title={recipientName ? `Request an introduction to ${recipientName}` : 'Request an introduction'}
      description="Explain what you're looking for — this goes straight to them as a real request, not a message."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button disabled={!message.trim()} isLoading={mutation.isPending} onClick={() => mutation.mutate()}>
            Send request
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {contextLabel && (
          <p className="text-sm text-fg-secondary">
            About: <span className="font-medium text-fg">{contextLabel}</span>
          </p>
        )}
        {showPicker && (
          <Select label="About (optional)" hint="Let them know which of your startups or ideas this is about" value={pickedContext} onChange={(e) => setPickedContext(e.target.value)}>
            <option value="">Not tied to a specific startup or idea</option>
            {myStartups?.map((s) => (
              <option key={`startup:${s.id}`} value={`startup:${s.id}`}>
                {s.name}
              </option>
            ))}
            {myIdeas?.map((i) => (
              <option key={`idea:${i.id}`} value={`idea:${i.id}`}>
                {i.title}
              </option>
            ))}
          </Select>
        )}
        <Textarea
          label="Message"
          required
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Why are you interested? What are you looking for?"
        />
      </div>
    </Modal>
  )
}
