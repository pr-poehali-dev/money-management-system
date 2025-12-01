import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

const BACKEND_URL = 'https://functions.poehali.dev/0e2074cf-0965-4b03-99f2-f81e6f2a2e37';

interface BankCard {
  id: number;
  card_number: string;
  balance: number;
  card_type: string;
  gradient: string;
  expiry?: string;
  cvv?: string;
}

interface Transaction {
  id: number;
  transaction_type: 'income' | 'expense';
  amount: number;
  description: string;
  date: string;
  category: string;
  recipient?: string;
}

export default function Index() {
  const { toast } = useToast();
  const [card, setCard] = useState<BankCard | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [transferAmount, setTransferAmount] = useState<string>('');
  const [transferRecipient, setTransferRecipient] = useState<string>('');
  const [addAmount, setAddAmount] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const fetchCardData = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}?action=balance&card_number=2202 2032 4554 4491`);
      const data = await response.json();
      setCard({
        ...data,
        gradient: 'from-purple-600 via-violet-600 to-indigo-600'
      });
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить данные карты',
        variant: 'destructive'
      });
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}?action=transactions&card_number=2202 2032 4554 4491&limit=20`);
      const data = await response.json();
      setTransactions(data);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    }
  };

  useEffect(() => {
    fetchCardData();
    fetchTransactions();
  }, []);

  const handleTransfer = async () => {
    if (!transferAmount || !transferRecipient) {
      toast({
        title: 'Ошибка',
        description: 'Заполните все поля',
        variant: 'destructive'
      });
      return;
    }

    const amount = parseFloat(transferAmount);
    if (amount <= 0) {
      toast({
        title: 'Ошибка',
        description: 'Сумма должна быть больше 0',
        variant: 'destructive'
      });
      return;
    }

    if (card && amount > card.balance) {
      toast({
        title: 'Ошибка',
        description: 'Недостаточно средств',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(BACKEND_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'transfer',
          card_number: '2202 2032 4554 4491',
          amount: amount,
          recipient: transferRecipient
        })
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        toast({
          title: 'Перевод выполнен',
          description: `${amount} ₽ → ${transferRecipient}`,
        });
        setTransferAmount('');
        setTransferRecipient('');
        await fetchCardData();
        await fetchTransactions();
      } else {
        toast({
          title: 'Ошибка',
          description: data.error || 'Не удалось выполнить перевод',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось выполнить перевод',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddMoney = async () => {
    if (!addAmount) {
      toast({
        title: 'Ошибка',
        description: 'Введите сумму',
        variant: 'destructive'
      });
      return;
    }

    const amount = parseFloat(addAmount);
    if (amount <= 0) {
      toast({
        title: 'Ошибка',
        description: 'Сумма должна быть больше 0',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(BACKEND_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add_money',
          card_number: '2202 2032 4554 4491',
          amount: amount
        })
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        toast({
          title: 'Счет пополнен',
          description: `+${amount} ₽`,
        });
        setAddAmount('');
        await fetchCardData();
        await fetchTransactions();
      } else {
        toast({
          title: 'Ошибка',
          description: data.error || 'Не удалось пополнить счет',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось пополнить счет',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  if (!card) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Icon name="Loader2" size={48} className="animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="flex items-center justify-between mb-8 animate-fade-in">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              FuturePay
            </h1>
            <p className="text-muted-foreground text-sm mt-1">Банк будущего</p>
          </div>
          <Button variant="ghost" size="icon" className="rounded-full glass hover:glow">
            <Icon name="Settings" size={20} />
          </Button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card className="glass glow p-6 border-white/10 animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Моя карта</h2>
              <Button 
                variant="ghost" 
                size="sm" 
                className="glass"
                onClick={() => {
                  fetchCardData();
                  fetchTransactions();
                }}
              >
                <Icon name="RefreshCw" size={16} className="mr-2" />
                Обновить
              </Button>
            </div>

            <div className="space-y-4">
              <div
                className="relative overflow-hidden rounded-2xl p-6 cursor-pointer transition-all duration-300"
              >
                <div className={`bg-gradient-to-r ${card.gradient} absolute inset-0 opacity-90`} />
                
                <div className="relative z-10 space-y-8">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-white/80 text-xs font-medium mb-1">
                        {card.card_type === 'debit' ? 'Дебетовая' : 'Кредитная'}
                      </p>
                      <p className="text-white font-mono text-lg tracking-wider">
                        {card.card_number}
                      </p>
                    </div>
                    <Icon name="CreditCard" size={32} className="text-white/60" />
                  </div>

                  <div className="flex justify-between items-end">
                    <div className="flex-1">
                      <p className="text-white/70 text-xs mb-1">Доступно</p>
                      <p className="text-white text-2xl font-bold">
                        {card.balance.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₽
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {card.expiry && (
                        <p className="text-white/80 text-sm font-mono">{card.expiry}</p>
                      )}
                      {card.cvv && (
                        <p className="text-white/60 text-xs font-mono">CVV: {card.cvv}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mt-6">
              <Button className="glass hover:glow-blue flex-col h-20 gap-2" disabled>
                <Icon name="Send" size={20} />
                <span className="text-xs">Перевод</span>
              </Button>
              <Button className="glass hover:glow-blue flex-col h-20 gap-2" disabled>
                <Icon name="Smartphone" size={20} />
                <span className="text-xs">Пополнить</span>
              </Button>
              <Button className="glass hover:glow-blue flex-col h-20 gap-2" disabled>
                <Icon name="Receipt" size={20} />
                <span className="text-xs">Платежи</span>
              </Button>
            </div>
          </Card>

          <Card className="glass glow p-6 border-white/10 animate-scale-in" style={{ animationDelay: '0.1s' }}>
            <Tabs defaultValue="transfer" className="w-full">
              <TabsList className="w-full glass mb-6">
                <TabsTrigger value="transfer" className="flex-1">
                  <Icon name="ArrowRightLeft" size={16} className="mr-2" />
                  Перевод
                </TabsTrigger>
                <TabsTrigger value="add" className="flex-1">
                  <Icon name="Plus" size={16} className="mr-2" />
                  Пополнить
                </TabsTrigger>
              </TabsList>

              <TabsContent value="transfer" className="space-y-4">
                <div>
                  <Label htmlFor="recipient" className="text-sm font-medium mb-2 block">
                    Получатель
                  </Label>
                  <Input
                    id="recipient"
                    placeholder="+7 (___) ___-__-__ или номер карты"
                    value={transferRecipient}
                    onChange={(e) => setTransferRecipient(e.target.value)}
                    className="glass border-white/20 focus:border-primary h-12"
                    disabled={loading}
                  />
                </div>

                <div>
                  <Label htmlFor="amount" className="text-sm font-medium mb-2 block">
                    Сумма перевода
                  </Label>
                  <div className="relative">
                    <Input
                      id="amount"
                      type="number"
                      placeholder="0"
                      value={transferAmount}
                      onChange={(e) => setTransferAmount(e.target.value)}
                      className="glass border-white/20 focus:border-primary h-12 pr-12 text-lg"
                      disabled={loading}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                      ₽
                    </span>
                  </div>
                </div>

                <div className="glass rounded-lg p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Комиссия</span>
                    <span className="text-green-400">0 ₽</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Итого к списанию</span>
                    <span className="font-bold text-lg">
                      {transferAmount || '0'} ₽
                    </span>
                  </div>
                </div>

                <Button
                  onClick={handleTransfer}
                  disabled={loading}
                  className="w-full h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 glow text-white font-semibold"
                >
                  {loading ? (
                    <Icon name="Loader2" size={18} className="mr-2 animate-spin" />
                  ) : (
                    <Icon name="Send" size={18} className="mr-2" />
                  )}
                  Перевести
                </Button>

                <div className="grid grid-cols-3 gap-2 pt-4">
                  {[100, 500, 1000].map((amount) => (
                    <Button
                      key={amount}
                      onClick={() => setTransferAmount(amount.toString())}
                      variant="outline"
                      className="glass border-white/20 hover:border-primary"
                      disabled={loading}
                    >
                      {amount.toLocaleString('ru-RU')}
                    </Button>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="add" className="space-y-4">
                <div>
                  <Label htmlFor="addAmount" className="text-sm font-medium mb-2 block">
                    Сумма пополнения
                  </Label>
                  <div className="relative">
                    <Input
                      id="addAmount"
                      type="number"
                      placeholder="0"
                      value={addAmount}
                      onChange={(e) => setAddAmount(e.target.value)}
                      className="glass border-white/20 focus:border-primary h-12 pr-12 text-lg"
                      disabled={loading}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                      ₽
                    </span>
                  </div>
                </div>

                <Button
                  onClick={handleAddMoney}
                  disabled={loading}
                  className="w-full h-12 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 glow text-white font-semibold"
                >
                  {loading ? (
                    <Icon name="Loader2" size={18} className="mr-2 animate-spin" />
                  ) : (
                    <Icon name="Plus" size={18} className="mr-2" />
                  )}
                  Пополнить счет
                </Button>

                <div className="grid grid-cols-3 gap-2 pt-4">
                  {[1000, 5000, 10000].map((amount) => (
                    <Button
                      key={amount}
                      onClick={() => setAddAmount(amount.toString())}
                      variant="outline"
                      className="glass border-white/20 hover:border-primary"
                      disabled={loading}
                    >
                      {amount.toLocaleString('ru-RU')}
                    </Button>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        </div>

        <Card className="glass glow p-6 border-white/10 animate-slide-up">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">История операций</h2>
            <Button 
              variant="ghost" 
              size="sm" 
              className="glass"
              onClick={fetchTransactions}
            >
              <Icon name="RefreshCw" size={16} className="mr-2" />
              Обновить
            </Button>
          </div>

          <div className="space-y-3">
            {transactions.length === 0 ? (
              <div className="text-center py-12">
                <Icon name="Receipt" size={48} className="mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Нет операций</p>
              </div>
            ) : (
              transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="glass rounded-lg p-4 flex items-center justify-between hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        transaction.transaction_type === 'income'
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}
                    >
                      <Icon
                        name={transaction.transaction_type === 'income' ? 'ArrowDownLeft' : 'ArrowUpRight'}
                        size={20}
                      />
                    </div>
                    <div>
                      <p className="font-medium">{transaction.description || 'Операция'}</p>
                      <p className="text-sm text-muted-foreground">
                        {transaction.category} • {transaction.date}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-lg font-semibold ${
                        transaction.transaction_type === 'income' ? 'text-green-400' : 'text-foreground'
                      }`}
                    >
                      {transaction.transaction_type === 'income' ? '+' : '−'}
                      {transaction.amount.toLocaleString('ru-RU')} ₽
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
