'use client';
import * as React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import toast from 'react-hot-toast';
import api from '@/lib/api';

type Role = 'viewer' | 'editor';

export function ShareDialog({ fileId, open, onOpenChange }: { fileId: string | null; open: boolean; onOpenChange: (o: boolean) => void }) {
  const [publicLink, setPublicLink] = React.useState<string | null>(null);
  const [email, setEmail] = React.useState('');
  const [role, setRole] = React.useState<Role>('viewer');
  const [list, setList] = React.useState<{ id: string; email: string; role: Role }[]>([]);

  React.useEffect(() => {
    if (!open || !fileId) return;
    (async () => {
      const r = await api.get(`/files/${fileId}/access`);
      setPublicLink(r.data.public_link || null);
      setList(r.data.users || []);
    })();
  }, [open, fileId]);

  const togglePublic = async (val: boolean) => {
    if (!fileId) return;
    try {
      if (val) {
        const r = await api.post(`/shares/${fileId}/public`);
        setPublicLink(r.data.shareable_link);
        toast.success('Public link enabled');
      } else {
        await api.delete(`/shares/${fileId}/public`);
        setPublicLink(null);
        toast.success('Public link disabled');
      }
    } catch { toast.error('Could not update link'); }
  };

  const invite = async () => {
    if (!fileId || !email) return;
    try {
      await api.post(`/shares/${fileId}/user`, { email, role });
      setEmail('');
      const r = await api.get(`/files/${fileId}/access`);
      setList(r.data.users || []);
      toast.success('User invited');
    } catch { toast.error('Invite failed'); }
  };

  const remove = async (uid: string) => {
    if (!fileId) return;
    await api.delete(`/shares/${fileId}/user/${uid}`);
    const r = await api.get(`/files/${fileId}/access`);
    setList(r.data.users || []);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Share</DialogTitle>
          <DialogDescription>Manage public link and collaborator access.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Public link</p>
              <p className="text-xs text-slate-500">Enable a secure link anyone can view.</p>
            </div>
            <Switch checked={!!publicLink} onCheckedChange={togglePublic} aria-label="Toggle public link" />
          </div>

          {publicLink && (
            <div className="flex gap-2">
              <Input readOnly value={publicLink} />
              <Button variant="outline" onClick={() => { navigator.clipboard.writeText(publicLink); toast.success('Link copied'); }}>
                Copy
              </Button>
            </div>
          )}

          <Separator />

          <div className="flex gap-2">
            <Input type="email" placeholder="email@company.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Select value={role} onValueChange={(v: Role) => setRole(v)}>
              <SelectTrigger className="w-32"><SelectValue placeholder="Role" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="viewer">Viewer</SelectItem>
                <SelectItem value="editor">Editor</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={invite}>Add</Button>
          </div>

          <div className="rounded-md border">
            {list.length === 0 ? (
              <p className="p-3 text-sm text-slate-500">No collaborators yet.</p>
            ) : (
              <ul className="divide-y">
                {list.map((u) => (
                  <li key={u.id} className="flex items-center justify-between p-3 text-sm">
                    <span>{u.email} • {u.role}</span>
                    <Button variant="outline" size="sm" onClick={() => remove(u.id)}>Remove</Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
