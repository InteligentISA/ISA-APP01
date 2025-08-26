import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { NotificationService } from '@/services/notificationService';

export default function AdminNotifications() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [category, setCategory] = useState('marketing');
  const [targetUsers, setTargetUsers] = useState<string[]>([]);
  const [isSending, setIsSending] = useState(false);

  const handleSendNotification = async () => {
    if (!title.trim() || !body.trim()) {
      toast({
        title: "Error",
        description: "Please fill in both title and body",
        variant: "destructive"
      });
      return;
    }

    setIsSending(true);
    try {
      const notification = {
        title,
        body,
        data: { category, admin_sent: true }
      };

      if (targetUsers.length > 0) {
        await NotificationService.sendBulkNotification(targetUsers, notification);
        toast({
          title: "Success",
          description: `Notification sent to ${targetUsers.length} users`
        });
      } else {
        await NotificationService.sendTargetedNotification({}, notification);
        toast({
          title: "Success",
          description: "Notification sent to all users"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send notification",
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">Notification Management</h2>
      
      <Card>
        <CardHeader>
          <CardTitle>Send Push Notification</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Notification title..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="order">Order</SelectItem>
                  <SelectItem value="payment">Payment</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="body">Message</Label>
            <Textarea
              id="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Notification message..."
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="users">Target User IDs (Optional)</Label>
            <Input
              id="users"
              placeholder="Enter user IDs separated by commas..."
              onChange={(e) => setTargetUsers(e.target.value.split(',').map(id => id.trim()).filter(id => id))}
            />
            <p className="text-sm text-muted-foreground">
              Leave empty to send to all users
            </p>
          </div>

          <Button 
            onClick={handleSendNotification} 
            disabled={isSending}
            className="w-full"
          >
            {isSending ? 'Sending...' : 'Send Notification'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
