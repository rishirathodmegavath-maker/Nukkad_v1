import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Modal } from '@/components/ui/Modal'
import { Input, Textarea, Select } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { TagInput } from '@/components/ui/TagInput'
import { updateResource } from '@/services/resources.service'
import { listChapters } from '@/services/chapters.service'
import { toast } from '@/store/toast.store'
import type { Resource, ResourceType } from '@/types'

const TYPES: ResourceType[] = ['Document', 'Link', 'Video', 'Note', 'Template']

export function ResourceEditModal({ open, onClose, resource }: { open: boolean; onClose: () => void; resource: Resource }) {
  const queryClient = useQueryClient()
  const [title, setTitle] = useState(resource.title)
  const [description, setDescription] = useState(resource.description)
  const [type, setType] = useState<ResourceType>(resource.type)
  const [url, setUrl] = useState(resource.url)
  const [chapterId, setChapterId] = useState(resource.chapterId ?? '')
  const [tags, setTags] = useState<string[]>(resource.tags)

  const { data: chapters } = useQuery({ queryKey: ['chapters', 'all'], queryFn: () => listChapters(), enabled: open })

  const mutation = useMutation({
    mutationFn: () => updateResource(resource.id, { title, description, type, url, chapterId, tags }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resource', resource.id] })
      queryClient.invalidateQueries({ queryKey: ['resources'] })
      toast.success('Resource updated')
      onClose()
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : 'Could not update resource'),
  })

  return (
    <Modal open={open} onClose={onClose} title="Edit resource" size="lg">
      <div className="flex flex-col gap-5">
        <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <Textarea label="Description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />

        <div className="grid sm:grid-cols-2 gap-4">
          <Select label="Type" value={type} onChange={(e) => setType(e.target.value as ResourceType)}>
            {TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </Select>
          <Select label="Chapter" value={chapterId} onChange={(e) => setChapterId(e.target.value)}>
            <option value="">No chapter — platform-wide</option>
            {(chapters ?? []).map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </div>

        <Input label="URL" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://…" />

        <div>
          <p className="text-sm font-medium text-fg mb-1.5">Tags</p>
          <TagInput value={tags} onChange={setTags} placeholder="Add a tag and press Enter…" />
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
