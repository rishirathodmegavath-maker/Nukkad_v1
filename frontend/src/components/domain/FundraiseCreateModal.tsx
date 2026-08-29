import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Modal } from '@/components/ui/Modal'
import { Input, Textarea, Select } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { createFundraise } from '@/services/investors.service'
import { toast } from '@/store/toast.store'
import type { StartupStage } from '@/types'

const STAGES: StartupStage[] = ['Idea', 'MVP', 'Early Traction', 'Growth', 'Scaling']

export function FundraiseCreateModal({ open, onClose, startupId, startupStage }: { open: boolean; onClose: () => void; startupId: string; startupStage: StartupStage }) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [targetAmount, setTargetAmount] = useState('')
  const [fundingStage, setFundingStage] = useState<StartupStage>(startupStage)
  const [useOfFunds, setUseOfFunds] = useState('')
  const [minimumTicket, setMinimumTicket] = useState('')

  const mutation = useMutation({
    mutationFn: () =>
      createFundraise({
        startupId,
        targetAmount: Number(targetAmount),
        fundingStage,
        useOfFunds: useOfFunds || undefined,
        minimumTicket: minimumTicket ? Number(minimumTicket) : undefined,
      }),
    onSuccess: (fundraise) => {
      queryClient.invalidateQueries({ queryKey: ['startup', startupId] })
      queryClient.invalidateQueries({ queryKey: ['fundraise', 'by-startup', startupId] })
      toast.success('Fundraise created — your startup is now marked as raising')
      onClose()
      navigate(`/investors/fundraises/${fundraise.id}`)
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : 'Could not create this fundraise'),
  })

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Start a fundraise"
      description="This marks your startup as raising and makes it discoverable to investors."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button disabled={!targetAmount} isLoading={mutation.isPending} onClick={() => mutation.mutate()}>
            Start fundraise
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <Input label="Target amount" type="number" min={1} required value={targetAmount} onChange={(e) => setTargetAmount(e.target.value)} placeholder="e.g. 5000000" />
          <Select label="Stage" value={fundingStage} onChange={(e) => setFundingStage(e.target.value as StartupStage)}>
            {STAGES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </div>
        <Input label="Minimum ticket" type="number" min={0} value={minimumTicket} onChange={(e) => setMinimumTicket(e.target.value)} placeholder="Optional" />
        <Textarea label="Use of funds" value={useOfFunds} onChange={(e) => setUseOfFunds(e.target.value)} placeholder="What will this raise go towards?" />
      </div>
    </Modal>
  )
}
