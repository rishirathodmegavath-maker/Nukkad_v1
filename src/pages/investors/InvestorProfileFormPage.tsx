import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { Input, Textarea, Select } from '@/components/ui/Input'
import { TagInput } from '@/components/ui/TagInput'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { PageHeader } from '@/components/domain/PageHeader'
import { createInvestorProfile } from '@/services/investors.service'
import { toast } from '@/store/toast.store'
import type { InvestorType } from '@/types'

const TYPES: InvestorType[] = ['Angel', 'VC', 'Family Office', 'Corporate VC', 'Accelerator', 'Other']

export default function InvestorProfileFormPage() {
  const navigate = useNavigate()
  const [investorType, setInvestorType] = useState<InvestorType>('Angel')
  const [firmName, setFirmName] = useState('')
  const [thesis, setThesis] = useState('')
  const [sectors, setSectors] = useState<string[]>([])
  const [stages, setStages] = useState<string[]>([])
  const [geographies, setGeographies] = useState<string[]>([])
  const [ticketMin, setTicketMin] = useState('')
  const [ticketMax, setTicketMax] = useState('')
  const [portfolioCount, setPortfolioCount] = useState('')
  const [website, setWebsite] = useState('')

  const mutation = useMutation({
    mutationFn: () =>
      createInvestorProfile({
        investorType,
        firmName: firmName || undefined,
        thesis: thesis || undefined,
        sectors,
        stages,
        geographies,
        ticketMin: ticketMin ? Number(ticketMin) : undefined,
        ticketMax: ticketMax ? Number(ticketMax) : undefined,
        portfolioCount: portfolioCount ? Number(portfolioCount) : undefined,
        website: website || undefined,
      }),
    onSuccess: (profile) => {
      toast.success('Investor profile activated')
      navigate(`/investors/${profile.id}`)
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : 'Could not activate your investor profile'),
  })

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    mutation.mutate()
  }

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader
        title="Activate your investor profile"
        description="Your name, photo and headline come from your Nukkad profile — this just adds your investing details."
      />
      <Card className="rounded-2xl border border-border/80 shadow-sm p-5 sm:p-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select label="Investor type" value={investorType} onChange={(e) => setInvestorType(e.target.value as InvestorType)}>
              {TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </Select>
            <Input label="Firm" value={firmName} onChange={(e) => setFirmName(e.target.value)} placeholder="e.g. Sequoia, or blank if angel" />
          </div>

          <Textarea
            label="Investment thesis"
            value={thesis}
            onChange={(e) => setThesis(e.target.value)}
            placeholder="What do you look for in founders and startups?"
          />

          <div>
            <p className="text-sm font-medium text-fg mb-1.5">Sectors</p>
            <TagInput value={sectors} onChange={setSectors} placeholder="Add a sector and press Enter…" />
          </div>
          <div>
            <p className="text-sm font-medium text-fg mb-1.5">Stage preference</p>
            <TagInput value={stages} onChange={setStages} placeholder="e.g. Idea, MVP, Growth…" />
          </div>
          <div>
            <p className="text-sm font-medium text-fg mb-1.5">Geography</p>
            <TagInput value={geographies} onChange={setGeographies} placeholder="Add a region and press Enter…" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input label="Min ticket" type="number" min={0} value={ticketMin} onChange={(e) => setTicketMin(e.target.value)} placeholder="e.g. 50000" />
            <Input label="Max ticket" type="number" min={0} value={ticketMax} onChange={(e) => setTicketMax(e.target.value)} placeholder="e.g. 500000" />
            <Input label="Portfolio size" type="number" min={0} value={portfolioCount} onChange={(e) => setPortfolioCount(e.target.value)} placeholder="e.g. 12" />
          </div>
          <Input label="Website" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://…" />

          <div className="flex items-center justify-end gap-3 pt-2 mt-2 border-t border-border/60">
            <Button variant="ghost" type="button" onClick={() => navigate('/investors')}>
              Cancel
            </Button>
            <Button type="submit" size="lg" isLoading={mutation.isPending}>
              Activate profile
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
