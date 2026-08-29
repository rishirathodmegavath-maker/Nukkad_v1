import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Textarea, Select } from '@/components/ui/Input'
import { requestToJoinStartup } from '@/services/startups.service'
import { toast } from '@/store/toast.store'
import type { StartupRole } from '@/types'

interface JoinStartupModalProps {
  startupId: string
  startupName: string
  roles: StartupRole[]
  open: boolean
  onClose: () => void
}

export function JoinStartupModal({ startupId, startupName, roles, open, onClose }: JoinStartupModalProps) {
  const queryClient = useQueryClient()
  const [roleId, setRoleId] = useState('')
  const [message, setMessage] = useState('')

  const mutation = useMutation({
    mutationFn: () => requestToJoinStartup(startupId, roleId || undefined, message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['startup', startupId] })
      queryClient.invalidateQueries({ queryKey: ['startup', startupId, 'my-membership'] })
      queryClient.invalidateQueries({ queryKey: ['startup', startupId, 'members'] })
      toast.success('Request sent to join the team')
      onClose()
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : 'Could not send request'),
  })

  if (!open) return null

  return (
    <Modal
      open
      onClose={onClose}
      title="Join the team"
      description={`Let the founders of “${startupName}” know why you’d be a good fit.`}
      footer={
        <div className="flex items-center justify-end gap-2.5">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button isLoading={mutation.isPending} onClick={() => mutation.mutate()}>
            Send request
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        {roles.length > 0 && (
          <Select label="Role (optional)" value={roleId} onChange={(e) => setRoleId(e.target.value)}>
            <option value="">General interest</option>
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.title}
              </option>
            ))}
          </Select>
        )}
        <Textarea
          label="Message (optional)"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="A sentence on relevant experience goes a long way."
        />
      </div>
    </Modal>
  )
}
