import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Building, FileText, CreditCard, Upload, History, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import PendingPostingsView from '@/components/treasury/PendingPostingsView';

interface CBSNote {
  id: string;
  note_type: 'credit' | 'debit';
  amount: number;
  description: string;
  account_reference: string;
  status: 'pending' | 'approved' | 'rejected' | 'processed';
  compliance_status: 'reviewing' | 'approved' | 'flagged';
  created_at: string;
}

interface LawyerLetter {
  id: string;
  title: string;
  credit_amount: number;
  letter_content: string;
  account_to_credit: string;
  status: 'pending' | 'approved' | 'rejected';
  uploaded_at: string;
}

interface BalanceUpdate {
  id: string;
  account_id: string;
  old_balance: number;
  new_balance: number;
  adjustment_amount: number;
  reason: string;
  compliance_approved: boolean;
  updated_at: string;
}

const CBSDashboard = () => {
  const [cbsNotes, setCbsNotes] = useState<CBSNote[]>([]);
  const [lawyerLetters, setLawyerLetters] = useState<LawyerLetter[]>([]);
  const [balanceUpdates, setBalanceUpdates] = useState<BalanceUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Form states
  const [noteForm, setNoteForm] = useState({
    note_type: 'credit' as 'credit' | 'debit',
    amount: '',
    description: '',
    account_reference: ''
  });

  const [letterForm, setLetterForm] = useState({
    title: '',
    credit_amount: '',
    letter_content: '',
    account_to_credit: ''
  });

  const [balanceForm, setBalanceForm] = useState({
    account_id: '',
    old_balance: '',
    new_balance: '',
    reason: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [notesRes, lettersRes, updatesRes] = await Promise.all([
        supabase.from('cbs_notes').select('*').order('created_at', { ascending: false }),
        supabase.from('cbs_lawyer_letters').select('*').order('uploaded_at', { ascending: false }),
        supabase.from('cbs_balance_updates').select('*').order('updated_at', { ascending: false })
      ]);

      if (notesRes.data) setCbsNotes(notesRes.data as CBSNote[]);
      if (lettersRes.data) setLawyerLetters(lettersRes.data as LawyerLetter[]);
      if (updatesRes.data) setBalanceUpdates(updatesRes.data);
    } catch (error) {
      console.error('Error fetching CBS data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitNote = async () => {
    try {
      const { data, error } = await supabase.from('cbs_notes').insert([
        {
          user_id: (await supabase.auth.getUser()).data.user?.id,
          note_type: noteForm.note_type,
          amount: parseFloat(noteForm.amount),
          description: noteForm.description,
          account_reference: noteForm.account_reference
        }
      ]);

      if (error) throw error;

      toast({
        title: "CBS Note Created",
        description: `${noteForm.note_type.charAt(0).toUpperCase() + noteForm.note_type.slice(1)} note submitted for review`,
      });

      setNoteForm({ note_type: 'credit', amount: '', description: '', account_reference: '' });
      fetchData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create CBS note",
        variant: "destructive"
      });
    }
  };

  const handleSubmitLetter = async () => {
    try {
      const { error } = await supabase.from('cbs_lawyer_letters').insert([
        {
          user_id: (await supabase.auth.getUser()).data.user?.id,
          title: letterForm.title,
          credit_amount: parseFloat(letterForm.credit_amount),
          letter_content: letterForm.letter_content,
          account_to_credit: letterForm.account_to_credit
        }
      ]);

      if (error) throw error;

      toast({
        title: "Lawyer Letter Uploaded",
        description: "Letter submitted for legal review and compliance approval",
      });

      setLetterForm({ title: '', credit_amount: '', letter_content: '', account_to_credit: '' });
      fetchData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload lawyer letter",
        variant: "destructive"
      });
    }
  };

  const handleBalanceUpdate = async () => {
    try {
      const oldBalance = parseFloat(balanceForm.old_balance);
      const newBalance = parseFloat(balanceForm.new_balance);
      const adjustmentAmount = newBalance - oldBalance;

      const { error } = await supabase.from('cbs_balance_updates').insert([
        {
          account_id: balanceForm.account_id,
          old_balance: oldBalance,
          new_balance: newBalance,
          adjustment_amount: adjustmentAmount,
          reason: balanceForm.reason,
          updated_by: (await supabase.auth.getUser()).data.user?.id
        }
      ]);

      if (error) throw error;

      toast({
        title: "Balance Update Recorded",
        description: "Balance adjustment pending compliance approval",
      });

      setBalanceForm({ account_id: '', old_balance: '', new_balance: '', reason: '' });
      fetchData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to record balance update",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'processed': return 'bg-blue-100 text-blue-800';
      case 'flagged': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading CBS Dashboard...</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Building className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Central Banking System</h1>
          <p className="text-muted-foreground">Manage credit/debit notes, lawyer letters, and balance adjustments</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CreditCard className="h-6 w-6 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{cbsNotes.length}</p>
                <p className="text-sm text-muted-foreground">Total Notes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileText className="h-6 w-6 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{lawyerLetters.length}</p>
                <p className="text-sm text-muted-foreground">Lawyer Letters</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <History className="h-6 w-6 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{balanceUpdates.length}</p>
                <p className="text-sm text-muted-foreground">Balance Updates</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="postings" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="postings">Pending Postings</TabsTrigger>
          <TabsTrigger value="notes">Credit/Debit Notes</TabsTrigger>
          <TabsTrigger value="letters">Lawyer Letters</TabsTrigger>
          <TabsTrigger value="balances">Balance Updates</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="postings">
          <PendingPostingsView />
        </TabsContent>

        <TabsContent value="notes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Create Credit/Debit Note</CardTitle>
              <CardDescription>Post credit or debit notes for account adjustments</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="note_type">Note Type</Label>
                  <Select value={noteForm.note_type} onValueChange={(value: 'credit' | 'debit') => setNoteForm({...noteForm, note_type: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="credit">Credit Note</SelectItem>
                      <SelectItem value="debit">Debit Note</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="amount">Amount</Label>
                  <Input 
                    type="number" 
                    value={noteForm.amount}
                    onChange={(e) => setNoteForm({...noteForm, amount: e.target.value})}
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="account_reference">Account Reference</Label>
                <Input 
                  value={noteForm.account_reference}
                  onChange={(e) => setNoteForm({...noteForm, account_reference: e.target.value})}
                  placeholder="Account number or reference"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  value={noteForm.description}
                  onChange={(e) => setNoteForm({...noteForm, description: e.target.value})}
                  placeholder="Reason for the note..."
                />
              </div>
              <Button onClick={handleSubmitNote} className="w-full">
                Submit {noteForm.note_type.charAt(0).toUpperCase() + noteForm.note_type.slice(1)} Note
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Account</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Compliance</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cbsNotes.map((note) => (
                    <TableRow key={note.id}>
                      <TableCell>
                        <Badge variant={note.note_type === 'credit' ? 'default' : 'secondary'}>
                          {note.note_type}
                        </Badge>
                      </TableCell>
                      <TableCell>${note.amount.toLocaleString()}</TableCell>
                      <TableCell>{note.account_reference}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(note.status)}>
                          {note.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(note.compliance_status)}>
                          {note.compliance_status}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(note.created_at).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="letters" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upload Lawyer Letter</CardTitle>
              <CardDescription>Submit legal documents for credit authorization</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Letter Title</Label>
                <Input 
                  value={letterForm.title}
                  onChange={(e) => setLetterForm({...letterForm, title: e.target.value})}
                  placeholder="Legal authorization title"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="credit_amount">Credit Amount</Label>
                  <Input 
                    type="number"
                    value={letterForm.credit_amount}
                    onChange={(e) => setLetterForm({...letterForm, credit_amount: e.target.value})}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="account_to_credit">Account to Credit</Label>
                  <Input 
                    value={letterForm.account_to_credit}
                    onChange={(e) => setLetterForm({...letterForm, account_to_credit: e.target.value})}
                    placeholder="Target account"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="letter_content">Letter Content</Label>
                <Textarea 
                  value={letterForm.letter_content}
                  onChange={(e) => setLetterForm({...letterForm, letter_content: e.target.value})}
                  placeholder="Legal authorization content..."
                  rows={6}
                />
              </div>
              <Button onClick={handleSubmitLetter} className="w-full">
                <Upload className="h-4 w-4 mr-2" />
                Upload Lawyer Letter
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Uploaded Letters</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Credit Amount</TableHead>
                    <TableHead>Target Account</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Upload Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lawyerLetters.map((letter) => (
                    <TableRow key={letter.id}>
                      <TableCell>{letter.title}</TableCell>
                      <TableCell>${letter.credit_amount.toLocaleString()}</TableCell>
                      <TableCell>{letter.account_to_credit}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(letter.status)}>
                          {letter.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(letter.uploaded_at).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="balances" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Update Account Balance</CardTitle>
              <CardDescription>Record balance adjustments pending compliance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="account_id">Account ID</Label>
                <Input 
                  value={balanceForm.account_id}
                  onChange={(e) => setBalanceForm({...balanceForm, account_id: e.target.value})}
                  placeholder="Account identifier"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="old_balance">Current Balance</Label>
                  <Input 
                    type="number"
                    value={balanceForm.old_balance}
                    onChange={(e) => setBalanceForm({...balanceForm, old_balance: e.target.value})}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="new_balance">New Balance</Label>
                  <Input 
                    type="number"
                    value={balanceForm.new_balance}
                    onChange={(e) => setBalanceForm({...balanceForm, new_balance: e.target.value})}
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="reason">Adjustment Reason</Label>
                <Textarea 
                  value={balanceForm.reason}
                  onChange={(e) => setBalanceForm({...balanceForm, reason: e.target.value})}
                  placeholder="Reason for balance adjustment..."
                />
              </div>
              <Button onClick={handleBalanceUpdate} className="w-full">
                Record Balance Update
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Balance Update History</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Account ID</TableHead>
                    <TableHead>Old Balance</TableHead>
                    <TableHead>New Balance</TableHead>
                    <TableHead>Adjustment</TableHead>
                    <TableHead>Compliance</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {balanceUpdates.map((update) => (
                    <TableRow key={update.id}>
                      <TableCell>{update.account_id}</TableCell>
                      <TableCell>${update.old_balance.toLocaleString()}</TableCell>
                      <TableCell>${update.new_balance.toLocaleString()}</TableCell>
                      <TableCell className={update.adjustment_amount >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {update.adjustment_amount >= 0 ? '+' : ''}${update.adjustment_amount.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {update.compliance_approved ? (
                          <Badge className="bg-green-100 text-green-800">Approved</Badge>
                        ) : (
                          <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                        )}
                      </TableCell>
                      <TableCell>{new Date(update.updated_at).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Alert</CardTitle>
              <CardDescription>Important regulatory information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-3 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-yellow-800">Compliance Notice</h4>
                  <p className="text-yellow-700 text-sm mt-1">
                    All CBS operations require compliance approval and regulatory oversight. 
                    Balance adjustments and credit authorizations must be reviewed by the compliance team
                    before processing. Ensure all documentation is complete and accurate.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CBSDashboard;