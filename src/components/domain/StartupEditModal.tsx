import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Modal } from '@/components/ui/Modal'
import { Input, Textarea, Select } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { TagInput } from '@/components/ui/TagInput'
import { updateStartup } from '@/services/startups.service'
import { toast } from '@/store/toast.store'
import type { Startup, StartupStage } from '@/types'

const STAGES: StartupStage[] = ['Idea', 'MVP', 'Early Traction', 'Growth', 'Scaling']

export function StartupEditModal({ open, onClose, startup }: { open: boolean; onClose: () => void; startup: Startup }) {
  const queryClient = useQueryClient()
  const [name, setName] = useState(startup.name)
  const [tagline, setTagline] = useState(startup.tagline)
  const [sector, setSector] = useState(startup.sector)
  const [stage, setStage] = useState<StartupStage>(startup.stage)
  const [problem, setProblem] = useState(startup.problem)
  const [solution, setSolution] = useState(startup.solution)
  const [traction, setTraction] = useState(startup.traction)
  const [isRaising, setIsRaising] = useState(startup.isRaising)
  const [needs, setNeeds] = useState<string[]>(startup.needs)

  const mutation = useMutation({
    mutationFn: () =>
      updateStartup(startup.id, {
        name,
        tagline,
        sector,
        stage,
        problem,
        solution,
        traction,
        isRaising,
        needs,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['startup', startup.id] })
      toast.success('Startup updated')
      onClose()
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : 'Could not update startup'),
  })

  return (
    <Modal open={open} onClose={onClose} title="Edit startup" size="lg">
      <div className="flex flex-col gap-5">
        <div className="grid sm:grid-cols-2 gap-4">
          <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input label="Tagline" value={tagline} onChange={(e) => setTagline(e.target.value)} />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <Input label="Sector" value={sector} onChange={(e) => setSector(e.target.value)} />
          <Select label="Stage" value={stage} onChange={(e) => setStage(e.target.value as StartupStage)}>
            {STAGES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </div>
        <Textarea label="Problem" value={problem} onChange={(e) => setProblem(e.target.value)} rows={3} />
        <Textarea label="Solution" value={solution} onChange={(e) => setSolution(e.target.value)} rows={3} />
        <Textarea label="Traction" value={traction} onChange={(e) => setTraction(e.target.value)} rows={2} />

        <label className="flex items-center gap-2.5 text-sm text-fg cursor-pointer">
          <input
            type="checkbox"
            checked={isRaising}
            onChange={(e) => setIsRaising(e.target.checked)}
            className="size-4 rounded border-border accent-brand-600"
          />
          Currently raising
        </label>

        <div>
          <p className="text-sm font-medium text-fg mb-1.5">What they need</p>
          <TagInput value={needs} onChange={setNeeds} placeholder="Add a need and press Enter…" />
        </div>

        <div className="flex justify-end gap-2 -mx-5 -mb-5 border-t border-border-subtle px-5 pt-4 pb-5">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button isLoading={mutation.isPending} onClick={() => mutation.mutate()}>
            Save changes
          </Button>
        </div>
      </div>
    </Modal>
  )
}
