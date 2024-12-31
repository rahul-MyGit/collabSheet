"use client"
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Check, Mail } from 'lucide-react';

export const ShareModal = ({ documentId, onClose, currentCollaborators } : any) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('EDITOR');
  const queryClient = useQueryClient();

  //inviting new folks
  //@ts-ignore
  const { mutate: inviteCollaborator, isLoading} = useMutation<any, Error, { email: string; role: string }>({
    mutationFn: async ({ email, role }) => {
      const response = await fetch(`/api/v1/sheet/${documentId}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role }),
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to invite collaborator');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['document', documentId] as any);
      setEmail('');
    }
  });

  const { mutate: removeCollaborator } = useMutation({
    mutationFn: async (collaboratorId) => {
      const response = await fetch(`/api/documents/${documentId}/collaborators/${collaboratorId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to remove collaborator');
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['document', documentId] as any);
    }
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-[480px]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Share Document</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-6">
          <div className="flex gap-2 mb-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email address"
              className="flex-1 p-2 border rounded"
            />
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="p-2 border rounded"
            >
              <option value="VIEWER">Viewer</option>
              <option value="EDITOR">Editor</option>
            </select>
            <button
              onClick={() => inviteCollaborator({ email, role })}
              disabled={!email || isLoading}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              Invite
            </button>
          </div>

          <div className="space-y-2">
            {currentCollaborators.map((collaborator: any) => (
              <div
                key={collaborator.id}
                className="flex items-center justify-between p-2 bg-gray-50 rounded"
              >
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                    {collaborator.user.username[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium">{collaborator.user.username}</p>
                    <p className="text-sm text-gray-500">{collaborator.user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">{collaborator.role}</span>
                  {collaborator.role !== 'OWNER' && (
                    <button
                      onClick={() => removeCollaborator(collaborator.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export const PresenceIndicator = ({ userId, username, cursorPosition }: any) => {
  const colors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-yellow-500'
  ];
  const color = colors[parseInt(userId, 16) % colors.length];

  return (
    <div
      className="absolute pointer-events-none"
      style={{
        top: cursorPosition.row * 20, // Assuming 20px line height
        left: cursorPosition.column * 8, // Assuming 8px character width
      }}
    >
      <div className={`h-4 w-0.5 ${color} animate-blink`} />
      <div className={`${color} text-white text-xs px-2 py-1 rounded mt-1 whitespace-nowrap`}>
        {username}
      </div>
    </div>
  );
};