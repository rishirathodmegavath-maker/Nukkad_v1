import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { Input, Textarea } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { PageHeader } from '@/components/domain/PageHeader'
import { createChapter } from '@/services/chapters.service'
import { toast } from '@/store/toast.store'

export default function CreateChapterPage() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [city, setCity] = useState('')
  const [country, setCountry] = useState('')
  const [description, setDescription] = useState('')
  const [coverImageUrl, setCoverImageUrl] = useState('')

  const mutation = useMutation({
    mutationFn: () =>
      createChapter({
        name,
        city: city || undefined,
        country: country || undefined,
        description,
        coverImageUrl: coverImageUrl || undefined,
      }),
    onSuccess: (chapter) => {
      toast.success(`"${chapter.name}" is live — you're its president`)
      navigate(`/chapters/${chapter.id}`)
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : 'Could not create your chapter'),
  })

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    mutation.mutate()
  }

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader
        title="Create a chapter"
        description="Don't see a chapter for your city yet? Start one — you'll lead it as its first president."
      />
      <Card className="rounded-2xl border border-border/80 shadow-sm p-5 sm:p-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <Input label="Chapter name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Nukkad Bengaluru" required />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="City" value={city} onChange={(e) => setCity(e.target.value)} placeholder="e.g. Bengaluru" />
            <Input label="Country" value={country} onChange={(e) => setCountry(e.target.value)} placeholder="e.g. India" />
          </div>
          <Textarea
            label="About this chapter"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Who is this chapter for, and what will you do as its president?"
            rows={5}
            required
          />
          <Input label="Cover image URL" value={coverImageUrl} onChange={(e) => setCoverImageUrl(e.target.value)} placeholder="https://…" />

          <div className="flex items-center justify-end gap-3 pt-2 mt-2 border-t border-border/60">
            <Button variant="ghost" type="button" onClick={() => navigate('/chapters')}>
              Cancel
            </Button>
            <Button type="submit" size="lg" isLoading={mutation.isPending} disabled={!name.trim() || !description.trim()}>
              Create chapter
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
