import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SupportService } from "@/services/supportService";
import { format } from "date-fns";
import { MessageCircle, Clock, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface VendorSupportProps {
  vendorId: string;
}

const VendorSupport = ({ vendorId }: VendorSupportProps) => {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (vendorId) fetchTickets();
  }, [vendorId]);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const userTickets = await SupportService.getUserTickets(vendorId);
      setTickets(userTickets);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast({ title: "Error", description: "Failed to load support tickets", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open': return <Badge variant="secondary" className="bg-blue-100 text-blue-800"><Clock className="h-3 w-3 mr-1" />Open</Badge>;
      case 'in_progress': return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><MessageCircle className="h-3 w-3 mr-1" />In Progress</Badge>;
      case 'resolved': return <Badge variant="secondary" className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Resolved</Badge>;
      case 'closed': return <Badge variant="secondary" className="bg-gray-100 text-gray-800"><XCircle className="h-3 w-3 mr-1" />Closed</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high': return <Badge variant="destructive">High Priority</Badge>;
      case 'medium': return <Badge variant="secondary" className="bg-orange-100 text-orange-800">Medium Priority</Badge>;
      default: return <Badge variant="secondary">Low Priority</Badge>;
    }
  };

  if (loading) return <div className="flex justify-center items-center h-64">Loading support tickets...</div>;

  const openTickets = tickets.filter(t => t.status === 'open' || t.status === 'in_progress');
  const closedTickets = tickets.filter(t => t.status === 'resolved' || t.status === 'closed');

  return (
    <div className="space-y-6">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Customer Support</h1>

      <Tabs defaultValue="open" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="open">Open Tickets ({openTickets.length})</TabsTrigger>
          <TabsTrigger value="closed">Closed Tickets ({closedTickets.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="open">
          <div className="space-y-4">
            {openTickets.length === 0 ? (
              <Card><CardContent className="pt-6"><p className="text-center text-gray-500">No open tickets</p></CardContent></Card>
            ) : (
              openTickets.map((ticket) => (
                <Card key={ticket.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{ticket.title || ticket.subject}</CardTitle>
                      <div className="flex gap-2">{getStatusBadge(ticket.status)}{getPriorityBadge(ticket.priority)}</div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">{ticket.description || ticket.message}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Category: {ticket.category}</span>
                      <span>Created: {format(new Date(ticket.created_at), 'MMM dd, yyyy HH:mm')}</span>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="closed">
          <div className="space-y-4">
            {closedTickets.length === 0 ? (
              <Card><CardContent className="pt-6"><p className="text-center text-gray-500">No closed tickets</p></CardContent></Card>
            ) : (
              closedTickets.map((ticket) => (
                <Card key={ticket.id} className="opacity-75">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{ticket.title || ticket.subject}</CardTitle>
                      <div className="flex gap-2">{getStatusBadge(ticket.status)}{getPriorityBadge(ticket.priority)}</div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">{ticket.description || ticket.message}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Category: {ticket.category}</span>
                      <span>Updated: {format(new Date(ticket.updated_at), 'MMM dd, yyyy HH:mm')}</span>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VendorSupport;