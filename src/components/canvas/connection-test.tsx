import { useState } from 'react'
import { ConnectionDialog } from './connection-dialog'
import { ConnectionTypeSelector } from './connection-type-selector'
import { Button } from '@/components/ui/button'
import type { ConnectionType, NodeConnection } from '@/types'

export function ConnectionTest() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [connection, setConnection] = useState<NodeConnection | null>(null)

  const handleCreateConnection = (type: ConnectionType) => {
    console.log('Creating connection of type:', type)
  }

  const handleSaveConnection = (connectionData: Partial<NodeConnection>) => {
    console.log('Saving connection:', connectionData)
    setDialogOpen(false)
  }

  const testConnection: NodeConnection = {
    id: 'test-connection',
    sourceNodeId: 'node-1',
    targetNodeId: 'node-2',
    type: 'dependency',
    label: 'depends on',
    style: {
      strokeColor: '#3b82f6',
      strokeWidth: 2
    }
  }

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-lg font-semibold">Connection System Test</h2>
      
      <div className="space-y-2">
        <h3 className="font-medium">Connection Type Selector</h3>
        <ConnectionTypeSelector
          onSelectType={handleCreateConnection}
          onOpenAdvanced={() => setDialogOpen(true)}
        />
      </div>

      <div className="space-y-2">
        <h3 className="font-medium">Connection Dialog</h3>
        <Button onClick={() => {
          setConnection(testConnection)
          setDialogOpen(true)
        }}>
          Edit Test Connection
        </Button>
      </div>

      <ConnectionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        connection={connection}
        sourceNodeTitle="Source Node"
        targetNodeTitle="Target Node"
        onSave={handleSaveConnection}
        onDelete={() => {
          console.log('Deleting connection')
          setDialogOpen(false)
        }}
      />
    </div>
  )
}