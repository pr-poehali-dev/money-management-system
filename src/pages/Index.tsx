import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface BankCard {
  id: string;
  number: string;
  balance: number;
  type: 'debit' | 'credit';
  gradient: string;
  expiry?: string;
  cvv?: string;
}

interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  date: string;
  category: string;
}

export default function Index() {
  const { toast } = useToast();
  const [activeCard, setActiveCard] = useState<string>('1');
  const [transferAmount, setTransferAmount] = useState<string>('');
  const [transferRecipient, setTransferRecipient] = useState<string>('');

  const cards: BankCard[] = [
    {
      id: '1',
      number: '2202 2032 4554 4491',
      balance: 125840.50,
      type: 'debit',
      gradient: 'from-purple-600 via-violet-600 to-indigo-600',
      expiry: '11/26',
      cvv: '648'
    }
  ];

  const transactions: Transaction[] = [
    {
      id: '1',
      type: 'expense',
      amount: 1250,
      description: 'Продуктовый магазин',
      date: '17 нояб. 14:23',
      category: 'Покупки'
    },
    {
      id: '2',
      type: 'income',
      amount: 45000,
      description: 'Зачисление зарплаты',
      date: '15 нояб. 09:00',
      category: 'Доход'
    },
    {
      id: '3',
      type: 'expense',
      amount: 3200,
      description: 'Кафе "Звездное"',
      date: '14 нояб. 19:45',
      category: 'Рестораны'
    },
    {
      id: '4',
      type: 'expense',
      amount: 850,
      description: 'Яндекс Такси',
      date: '13 нояб. 22:10',
      category: 'Транспорт'
    }
  ];

  const handleTransfer = () => {
    if (!transferAmount || !transferRecipient) {
      toast({
        title: 'Ошибка',
        description: 'Заполните все поля',
        variant: 'destructive'
      });
      return;
    }

    toast({
      title: 'Перевод выполнен',
      description: `${transferAmount} ₽ → ${transferRecipient}`,
    });

    setTransferAmount('');
    setTransferRecipient('');
  };

  const currentCard = cards.find(c => c.id === activeCard);

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
              <h2 className="text-xl font-semibold">Мои карты</h2>
              <Button variant="ghost" size="sm" className="glass">
                <Icon name="Plus" size={16} className="mr-2" />
                Добавить
              </Button>
            </div>

            <div className="space-y-4">
              {cards.map((card, index) => (
                <div
                  key={card.id}
                  onClick={() => setActiveCard(card.id)}
                  className={`relative overflow-hidden rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:scale-105 ${
                    activeCard === card.id ? 'ring-2 ring-primary glow' : ''
                  }`}
                  style={{
                    background: `linear-gradient(135deg, var(--tw-gradient-stops))`,
                    animationDelay: `${index * 0.1}s`
                  }}
                >
                  <div className={`bg-gradient-to-r ${card.gradient} absolute inset-0 opacity-90`} />
                  
                  <div className="relative z-10 space-y-8">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-white/80 text-xs font-medium mb-1">
                          {card.type === 'debit' ? 'Дебетовая' : 'Кредитная'}
                        </p>
                        <p className="text-white font-mono text-lg tracking-wider">
                          {card.number}
                        </p>
                      </div>
                      <Icon name="CreditCard" size={32} className="text-white/60" />
                    </div>

                    <div className="flex justify-between items-end">
                      <div className="flex-1">
                        <p className="text-white/70 text-xs mb-1">Доступно</p>
                        <p className="text-white text-2xl font-bold">
                          {card.balance.toLocaleString('ru-RU')} ₽
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
              ))}
            </div>

            <div className="grid grid-cols-3 gap-3 mt-6">
              <Button className="glass hover:glow-blue flex-col h-20 gap-2">
                <Icon name="Send" size={20} />
                <span className="text-xs">Перевод</span>
              </Button>
              <Button className="glass hover:glow-blue flex-col h-20 gap-2">
                <Icon name="Smartphone" size={20} />
                <span className="text-xs">Пополнить</span>
              </Button>
              <Button className="glass hover:glow-blue flex-col h-20 gap-2">
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
                <TabsTrigger value="payment" className="flex-1">
                  <Icon name="Wallet" size={16} className="mr-2" />
                  Платеж
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
                  className="w-full h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 glow text-white font-semibold"
                >
                  <Icon name="Send" size={18} className="mr-2" />
                  Перевести
                </Button>

                <div className="grid grid-cols-3 gap-2 pt-4">
                  {[1000, 5000, 10000].map((amount) => (
                    <Button
                      key={amount}
                      onClick={() => setTransferAmount(amount.toString())}
                      variant="outline"
                      className="glass border-white/20 hover:border-primary"
                    >
                      {amount.toLocaleString('ru-RU')}
                    </Button>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="payment">
                <div className="text-center py-12">
                  <Icon name="Smartphone" size={48} className="mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Платежи и услуги</p>
                  <p className="text-sm text-muted-foreground/60 mt-2">Скоро появятся</p>
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        </div>

        <Card className="glass glow p-6 border-white/10 animate-slide-up">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">История операций</h2>
            <Button variant="ghost" size="sm" className="glass">
              <Icon name="Filter" size={16} className="mr-2" />
              Фильтры
            </Button>
          </div>

          <div className="space-y-3">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="glass rounded-lg p-4 flex items-center justify-between hover:bg-white/10 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      transaction.type === 'income'
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}
                  >
                    <Icon
                      name={transaction.type === 'income' ? 'ArrowDownLeft' : 'ArrowUpRight'}
                      size={20}
                    />
                  </div>
                  <div>
                    <p className="font-medium">{transaction.description}</p>
                    <p className="text-sm text-muted-foreground">
                      {transaction.category} • {transaction.date}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={`text-lg font-semibold ${
                      transaction.type === 'income' ? 'text-green-400' : 'text-foreground'
                    }`}
                  >
                    {transaction.type === 'income' ? '+' : '−'}
                    {transaction.amount.toLocaleString('ru-RU')} ₽
                  </p>
                </div>
              </div>
            ))}
          </div>

          <Button variant="ghost" className="w-full mt-4 glass hover:bg-white/10">
            Показать все операции
          </Button>
        </Card>
      </div>
    </div>
  );
}