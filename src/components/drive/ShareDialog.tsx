'use client';

import * as React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/lib/api-client';
import { FileGridItem } from '@/types';
import toast from 'react-hot-toast';
import { Link2, Copy, Globe, Lock, Users, Calendar, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type Role = 'viewer' | 'editor' | 'owner';
type AccessType = 'public' | 'restricted' | 'private';

interface ShareAccess {
  id: string;
  email: string;
  role: Role;
  added_at: string;
}

interface ShareSettings {
  access_type: AccessType;
  password_protected: boolean;
  password?: string;
  expires_at?: string;
  allow_download: boolean;
  allow_reshare: boolean;
}

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: FileGridItem | null;
}

export default function ShareDialog({ open, onOpenChange, item }: ShareDialogProps) {
  const [settings, setSettings] = React.useState<ShareSettings>({
    access_type: 'private',
    password_protected: false,
    allow_download: true,
    allow_reshare: false
  });
  const [shareLink, setShareLink] = React.useState<string | null>(null);
  const [accessList, setAccessList] = React.useState<ShareAccess[]>([]);
  const [newEmail, setNewEmail] = React.useState('');
  const [newRole, setNewRole] = React.useState<Role>('viewer');
  const [loading, setLoading] = React.useState(false);

  // Load current share settings when dialog opens
  React.useEffect(() => {
    if (!open || !item) return;
    loadShareSettings();
  }, [open, item]);

  const loadShareSettings = async () => {
    if (!item) return;
    try {
      setLoading(true);
      const response = await apiClient.getShareByToken(item.id);
      if (response.success && response.data) {
        const share = response.data;
        setSettings({
          access_type: share.password_protected ? 'restricted' : 'public',
          password_protected: share.password_protected,
          password: undefined,
          expires_at: share.expires_at,
          allow_download: true,
          allow_reshare: false
        });
        setShareLink(share.share_token);

        // Load access list
        const accessResponse = await apiClient.getPermissions(item.id, item.type);
        if (accessResponse.success && accessResponse.data) {
          setAccessList(accessResponse.data.map(p => ({
            id: p.id,
            email: p.user_id, // TODO: This should be user email, need to fetch user details
            role: p.permission_level === 'write' ? 'editor' : 'viewer',
            added_at: p.created_at
          })));
        }
      } else {
        // No existing share, set to private
        setSettings({
          access_type: 'private',
          password_protected: false,
          allow_download: true,
          allow_reshare: false
        });
        setShareLink(null);
        setAccessList([]);
      }
    } catch (error) {
      console.error('Failed to load share settings:', error);
      toast.error('Failed to load sharing settings');
    } finally {
      setLoading(false);
    }
  };

  const handleAccessTypeChange = async (type: AccessType) => {
    if (!item) return;
    try {
      setLoading(true);
      if (type === 'private') {
        // Remove sharing
        setShareLink(null);
        setSettings({ ...settings, access_type: type });
        toast.success('Sharing disabled');
      } else {
        // Create share link
        const response = await apiClient.shareFile(item.id, 7); // 7 days default
        if (response.success && response.data) {
          setShareLink(response.data.shareUrl);
          setSettings({ 
            ...settings, 
            access_type: type,
            expires_at: response.data.expiresAt
          });
          toast.success('Share link created successfully');
        } else {
          toast.error('Failed to create share link');
        }
      }
    } catch (error) {
      console.error('Failed to update access type:', error);
      toast.error('Failed to update sharing settings');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordToggle = async (enabled: boolean) => {
    if (!item || !shareLink) return;
    try {
      setLoading(true);
      // TODO: Implement updateShare method
      // await apiClient.updateShare(item.id, {
      //   password_protected: enabled,
      //   password: enabled ? settings.password : undefined
      // });
      toast.error('Update share not implemented yet');
      return;
      setSettings({ ...settings, password_protected: enabled });
      toast.success('Password protection updated');
    } catch (error) {
      console.error('Failed to update password protection:', error);
      toast.error('Failed to update password protection');
    } finally {
      setLoading(false);
    }
  };

  const handleExpiryChange = async (date: string) => {
    if (!item || !shareLink) return;
    try {
      setLoading(true);
      // TODO: Implement updateShare method
      // await apiClient.updateShare(item.id, {
      //   expires_at: date || undefined
      // });
      toast.error('Update share expiry not implemented yet');
      return;
      setSettings({ ...settings, expires_at: date || undefined });
      toast.success('Expiry date updated');
    } catch (error) {
      console.error('Failed to update expiry date:', error);
      toast.error('Failed to update expiry date');
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async () => {
    if (!item || !newEmail.trim()) return;
    try {
      setLoading(true);
      // TODO: Implement createPermission method
      // await apiClient.createPermission({
      //   resource_id: item.id,
      //   resource_type: item.type,
      //   user_id: newEmail.trim(), // TODO: This should be user_id, not email
      //   permission_level: newRole === 'editor' ? 'write' : 'read'
      // });
      toast.error('Create permission not implemented yet');
      return;
      setNewEmail('');
      await loadShareSettings(); // Refresh access list
      toast.success('User invited successfully');
    } catch (error) {
      console.error('Failed to invite user:', error);
      toast.error('Failed to invite user');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAccess = async (accessId: string) => {
    if (!item) return;
    try {
      setLoading(true);
      // TODO: Implement deletePermission method
      // await apiClient.deletePermission(accessId);
      toast.error('Delete permission not implemented yet');
      return;
      setAccessList(prev => prev.filter(a => a.id !== accessId));
      toast.success('Access removed');
    } catch (error) {
      console.error('Failed to remove access:', error);
      toast.error('Failed to remove access');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            Share {item?.type === 'folder' ? 'Folder' : 'File'}
          </DialogTitle>
          <DialogDescription>
            Share &quot;{item?.name}&quot; with others
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="link" className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="link" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Share Link
            </TabsTrigger>
            <TabsTrigger value="people" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              People
            </TabsTrigger>
          </TabsList>

          <TabsContent value="link" className="space-y-4">
            {/* Access Type */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Button
                  variant={settings.access_type === 'private' ? 'default' : 'outline'}
                  className="flex-1"
                  onClick={() => handleAccessTypeChange('private')}
                  disabled={loading}
                >
                  <Lock className="mr-2 h-4 w-4" />
                  Private
                </Button>
                <Button
                  variant={settings.access_type === 'restricted' ? 'default' : 'outline'}
                  className="flex-1"
                  onClick={() => handleAccessTypeChange('restricted')}
                  disabled={loading}
                >
                  <Users className="mr-2 h-4 w-4" />
                  Restricted
                </Button>
                <Button
                  variant={settings.access_type === 'public' ? 'default' : 'outline'}
                  className="flex-1"
                  onClick={() => handleAccessTypeChange('public')}
                  disabled={loading}
                >
                  <Globe className="mr-2 h-4 w-4" />
                  Public
                </Button>
              </div>

              {settings.access_type !== 'private' && (
                <>
                  {/* Share Link */}
                  {shareLink && (
                    <div className="flex gap-2">
                      <Input
                        readOnly
                        value={`${window.location.origin}/share/${shareLink}`}
                      />
                      <Button
                        variant="outline"
                        onClick={() => {
                          navigator.clipboard.writeText(`${window.location.origin}/share/${shareLink}`);
                          toast.success('Link copied to clipboard');
                        }}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  )}

                  <Separator />

                  {/* Advanced Settings */}
                  <div className="space-y-4">
                    {/* Password Protection */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Password Protection</p>
                        <p className="text-sm text-muted-foreground">
                          Require a password to access
                        </p>
                      </div>
                      <Switch
                        checked={settings.password_protected}
                        onCheckedChange={handlePasswordToggle}
                        disabled={loading || !shareLink}
                      />
                    </div>

                    {settings.password_protected && (
                      <Input
                        type="password"
                        placeholder="Enter password"
                        value={settings.password || ''}
                        onChange={(e) => setSettings({ ...settings, password: e.target.value })}
                        disabled={loading}
                      />
                    )}

                    {/* Expiry Date */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Link Expiry</p>
                        <p className="text-sm text-muted-foreground">
                          Set an expiration date for the link
                        </p>
                      </div>
                      <Input
                        type="date"
                        className="w-auto"
                        value={settings.expires_at || ''}
                        onChange={(e) => handleExpiryChange(e.target.value)}
                        disabled={loading || !shareLink}
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>

                    {/* Additional Options */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">Allow Download</p>
                        <Switch
                          checked={settings.allow_download}
                          onCheckedChange={(checked) => setSettings({ ...settings, allow_download: checked })}
                          disabled={loading || !shareLink}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="font-medium">Allow Resharing</p>
                        <Switch
                          checked={settings.allow_reshare}
                          onCheckedChange={(checked) => setSettings({ ...settings, allow_reshare: checked })}
                          disabled={loading || !shareLink}
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </TabsContent>

          <TabsContent value="people" className="space-y-4">
            {/* Invite People */}
            <div className="flex gap-2">
              <Input
                placeholder="Enter email address"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                disabled={loading}
              />
              <Select
                value={newRole}
                onValueChange={(value: Role) => setNewRole(value)}
                disabled={loading}
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="viewer">Viewer</SelectItem>
                  <SelectItem value="editor">Editor</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleInvite} disabled={loading || !newEmail.trim()}>
                Invite
              </Button>
            </div>

            {/* Access List */}
            <div className="space-y-2">
              {accessList.map((access) => (
                <div
                  key={access.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <p className="font-medium">{access.email}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant={access.role === 'editor' ? 'default' : 'secondary'}>
                        {access.role}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        Added {new Date(access.added_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveAccess(access.id)}
                    disabled={loading || access.role === 'owner'}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              {accessList.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No one has been invited yet</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
