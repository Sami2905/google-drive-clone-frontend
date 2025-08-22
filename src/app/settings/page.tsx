'use client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import api from '@/lib/api';

const profileSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  locale: z.string(),
});
type ProfileForm = z.infer<typeof profileSchema>;

const passwordSchema = z.object({
  current: z.string().min(6),
  next: z.string().min(8),
  confirm: z.string().min(8),
}).refine((v) => v.next === v.confirm, { message: 'Passwords do not match', path: ['confirm'] });
type PasswordForm = z.infer<typeof passwordSchema>;

export default function SettingsPage() {
  const prof = useForm<ProfileForm>({ resolver: zodResolver(profileSchema), defaultValues: { name: '', email: '', locale: 'en' } });
  const sec = useForm<PasswordForm>({ resolver: zodResolver(passwordSchema) });

  const saveProfile = async (data: ProfileForm) => {
    try { await api.patch('/me', data); toast.success('Profile updated'); } catch { toast.error('Update failed'); }
  };
  const changePassword = async (data: PasswordForm) => {
    try { await api.post('/auth/change-password', data); toast.success('Password updated'); sec.reset(); } catch { toast.error('Update failed'); }
  };

  return (
    <main className="mx-auto max-w-3xl p-4">
      <h1 className="mb-4 text-lg font-semibold">Settings</h1>
      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-4">
          <form onSubmit={prof.handleSubmit(saveProfile)} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input id="name" {...prof.register('name')} />
                <p className="mt-1 text-xs text-red-600">{prof.formState.errors.name?.message}</p>
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...prof.register('email')} />
                <p className="mt-1 text-xs text-red-600">{prof.formState.errors.email?.message}</p>
              </div>
              <div>
                <Label htmlFor="locale">Language</Label>
                <Input id="locale" placeholder="en" {...prof.register('locale')} />
              </div>
            </div>
            <Button type="submit" className="bg-brand-600 hover:bg-brand-700">Save changes</Button>
          </form>
        </TabsContent>

        <TabsContent value="security" className="mt-4">
          <form onSubmit={sec.handleSubmit(changePassword)} className="space-y-4">
            <div>
              <Label htmlFor="current">Current password</Label>
              <Input id="current" type="password" {...sec.register('current')} />
              <p className="mt-1 text-xs text-red-600">{sec.formState.errors.current?.message}</p>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="next">New password</Label>
                <Input id="next" type="password" {...sec.register('next')} />
                <p className="mt-1 text-xs text-red-600">{sec.formState.errors.next?.message}</p>
              </div>
              <div>
                <Label htmlFor="confirm">Confirm password</Label>
                <Input id="confirm" type="password" {...sec.register('confirm')} />
                <p className="mt-1 text-xs text-red-600">{sec.formState.errors.confirm?.message}</p>
              </div>
            </div>
            <Button type="submit" className="bg-brand-600 hover:bg-brand-700">Update password</Button>
          </form>
        </TabsContent>
      </Tabs>
    </main>
  );
}
