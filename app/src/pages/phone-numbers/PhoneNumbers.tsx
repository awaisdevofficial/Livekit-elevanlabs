import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { PhoneNumber } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Phone, Plus, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

export default function PhoneNumbers() {
  const [numbers, setNumbers] = useState<PhoneNumber[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    fetchNumbers();
  }, []);

  const fetchNumbers = async () => {
    try {
      const data = await api.getPhoneNumbers();
      setNumbers(data);
    } catch (error) {
      toast.error('Failed to load phone numbers');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImport = async () => {
    setIsImporting(true);
    try {
      const result = await api.importPhoneNumbers();
      toast.success(result.message);
      fetchNumbers();
    } catch (error) {
      toast.error('Failed to import numbers');
    } finally {
      setIsImporting(false);
    }
  };

  const getStatusBadge = (number: PhoneNumber) => {
    if (number.inbound_configured && number.outbound_configured) {
      return <Badge className="bg-green-500">Fully Configured</Badge>;
    } else if (number.inbound_configured || number.outbound_configured) {
      return <Badge variant="outline">Partially Configured</Badge>;
    }
    return <Badge variant="secondary">Not Configured</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Phone Numbers</h1>
          <p className="text-muted-foreground">
            Manage your Twilio phone numbers
          </p>
        </div>
        <Button onClick={handleImport} disabled={isImporting}>
          {isImporting ? (
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Plus className="mr-2 h-4 w-4" />
          )}
          Import from Twilio
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : numbers.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Phone className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No phone numbers</h3>
            <p className="text-muted-foreground mb-4">
              Import phone numbers from your Twilio account to get started
            </p>
            <Button onClick={handleImport} disabled={isImporting}>
              {isImporting ? (
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Plus className="mr-2 h-4 w-4" />
              )}
              Import from Twilio
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {numbers.map((number) => (
            <Card key={number.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Phone className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{number.phone_number}</h3>
                      <p className="text-sm text-muted-foreground">
                        {number.friendly_name || 'Unnamed'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    {getStatusBadge(number)}
                    <div className="flex space-x-2">
                      {number.inbound_configured ? (
                        <CheckCircle className="h-5 w-5 text-green-500" title="Inbound configured" />
                      ) : (
                        <XCircle className="h-5 w-5 text-gray-300" title="Inbound not configured" />
                      )}
                      {number.outbound_configured ? (
                        <CheckCircle className="h-5 w-5 text-green-500" title="Outbound configured" />
                      ) : (
                        <XCircle className="h-5 w-5 text-gray-300" title="Outbound not configured" />
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
