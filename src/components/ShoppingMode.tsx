import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { ArrowLeft, Check, ShoppingCart, Calculator, DollarSign, AlertTriangle, Target } from 'lucide-react';

interface ShoppingItem {
  id: number;
  name: string;
  purchased: boolean;
  quantity?: number;
  price?: number;
  total?: number;
}

interface ShoppingModeProps {
  listName: string;
  initialItems: string[];
  onBackToLists: () => void;
  onFinishShopping: (purchasedItems: ShoppingItem[], notPurchased: string[]) => void;
}

export function ShoppingMode({ listName, initialItems, onBackToLists, onFinishShopping }: ShoppingModeProps) {
  const [items, setItems] = useState<ShoppingItem[]>(
    initialItems.map((item, index) => ({
      id: index,
      name: item,
      purchased: false
    }))
  );
  const [currentItem, setCurrentItem] = useState<number | null>(null);
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [budget, setBudget] = useState<number | null>(null);
  const [budgetInput, setBudgetInput] = useState('');
  const [showBudgetInput, setShowBudgetInput] = useState(true);
  const [simulationMode, setSimulationMode] = useState(false);
  const [simulatedItems, setSimulatedItems] = useState<ShoppingItem[]>([]);

  const totalSpent = items
    .filter(item => item.purchased)
    .reduce((sum, item) => sum + (item.total || 0), 0);

  const simulatedTotal = simulatedItems
    .reduce((sum, item) => sum + (item.total || 0), 0);

  const currentTotal = simulationMode ? simulatedTotal : totalSpent;
  const purchasedCount = items.filter(item => item.purchased).length;
  const simulatedCount = simulatedItems.length;
  
  // Budget alerts
  const budgetWarning = budget && currentTotal > budget * 0.8;
  const budgetExceeded = budget && currentTotal > budget;
  const remainingBudget = budget ? budget - currentTotal : null;

  const handleAddItemData = () => {
    if (currentItem !== null && quantity && price) {
      const quantityNum = parseFloat(quantity);
      const priceNum = parseFloat(price);
      const total = quantityNum * priceNum;

      const itemData = {
        id: currentItem,
        name: items.find(item => item.id === currentItem)?.name || '',
        purchased: true,
        quantity: quantityNum,
        price: priceNum,
        total
      };

      if (simulationMode) {
        setSimulatedItems([...simulatedItems, itemData]);
      } else {
        setItems(items.map(item => 
          item.id === currentItem
            ? { ...item, purchased: true, quantity: quantityNum, price: priceNum, total }
            : item
        ));
      }
      
      setCurrentItem(null);
      setQuantity('');
      setPrice('');
    }
  };

  const handleSetBudget = () => {
    if (budgetInput) {
      setBudget(parseFloat(budgetInput));
      setShowBudgetInput(false);
    }
  };

  const handleToggleSimulation = () => {
    setSimulationMode(!simulationMode);
    if (simulationMode) {
      // Clear simulation when turning off
      setSimulatedItems([]);
    }
  };

  const handleRemoveSimulatedItem = (itemId: number) => {
    setSimulatedItems(simulatedItems.filter(item => item.id !== itemId));
  };

  const handleConfirmSimulation = () => {
    // Move all simulated items to actual purchases
    const simulatedItemIds = simulatedItems.map(item => item.id);
    setItems(items.map(item => {
      const simulatedItem = simulatedItems.find(sim => sim.id === item.id);
      return simulatedItem ? simulatedItem : item;
    }));
    setSimulatedItems([]);
    setSimulationMode(false);
  };

  const handleFinishShopping = () => {
    const purchased = items.filter(item => item.purchased);
    const notPurchased = items.filter(item => !item.purchased).map(item => item.name);
    onFinishShopping(purchased, notPurchased);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50 p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button
            onClick={onBackToLists}
            size="sm"
            variant="ghost"
            className="text-orange-700 hover:bg-orange-100"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-orange-800">{listName}</h1>
            <p className="text-sm text-orange-600">
              {simulationMode ? 'Modo Simulação' : 'Modo Compras'}
            </p>
          </div>
          <div className="text-right">
            <div className={`${budgetExceeded ? 'text-red-600' : 'text-orange-800'}`}>
              R$ {currentTotal.toFixed(2)}
            </div>
            {budget && (
              <div className="text-xs text-orange-600">
                Orçamento: R$ {budget.toFixed(2)}
              </div>
            )}
            <div className="text-xs text-orange-600">
              {simulationMode ? `${simulatedCount} simulados` : `${purchasedCount}/${items.length} itens`}
            </div>
          </div>
        </div>

        {/* Budget Setup */}
        {showBudgetInput && (
          <Card className="mb-6 bg-blue-50 border-blue-300">
            <CardHeader className="pb-3">
              <CardTitle className="text-blue-800 flex items-center gap-2">
                <Target className="w-5 h-5" />
                Definir Orçamento (Opcional)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  type="number"
                  step="0.01"
                  value={budgetInput}
                  onChange={(e) => setBudgetInput(e.target.value)}
                  placeholder="Ex: 150.00"
                  className="border-blue-300 focus:border-blue-500"
                />
                <Button
                  onClick={handleSetBudget}
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  <DollarSign className="w-4 h-4" />
                </Button>
              </div>
              <Button
                onClick={() => setShowBudgetInput(false)}
                variant="ghost"
                className="w-full mt-2 text-blue-700 hover:bg-blue-100"
              >
                Pular orçamento
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Budget Alerts */}
        {budget && budgetWarning && (
          <Alert className={`mb-4 ${budgetExceeded ? 'border-red-500 bg-red-50' : 'border-yellow-500 bg-yellow-50'}`}>
            <AlertTriangle className={`h-4 w-4 ${budgetExceeded ? 'text-red-600' : 'text-yellow-600'}`} />
            <AlertDescription className={budgetExceeded ? 'text-red-800' : 'text-yellow-800'}>
              {budgetExceeded 
                ? `Orçamento excedido em R$ ${(currentTotal - budget).toFixed(2)}!`
                : `Atenção! Restam apenas R$ ${remainingBudget?.toFixed(2)} do seu orçamento.`
              }
            </AlertDescription>
          </Alert>
        )}

        {/* Simulation Controls */}
        <Card className="mb-6 bg-purple-50 border-purple-300">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-purple-800">Modo Simulação</h3>
                <p className="text-sm text-purple-600">
                  {simulationMode ? 'Testando preços sem comprar' : 'Simule para testar seu orçamento'}
                </p>
              </div>
              <Button
                onClick={handleToggleSimulation}
                variant={simulationMode ? "default" : "outline"}
                className={simulationMode 
                  ? "bg-purple-500 hover:bg-purple-600 text-white" 
                  : "border-purple-300 text-purple-700 hover:bg-purple-100"
                }
              >
                {simulationMode ? 'Simulando' : 'Simular'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Progress */}
        {!simulationMode && (
          <div className="mb-6">
            <div className="flex justify-between text-sm text-orange-700 mb-2">
              <span>Progresso</span>
              <span>{Math.round((purchasedCount / items.length) * 100)}%</span>
            </div>
            <div className="w-full bg-orange-200 rounded-full h-2">
              <div 
                className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(purchasedCount / items.length) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Budget Progress */}
        {budget && (
          <div className="mb-6">
            <div className="flex justify-between text-sm text-blue-700 mb-2">
              <span>Orçamento Usado</span>
              <span>{Math.round((currentTotal / budget) * 100)}%</span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  budgetExceeded ? 'bg-red-500' : budgetWarning ? 'bg-yellow-500' : 'bg-blue-500'
                }`}
                style={{ width: `${Math.min((currentTotal / budget) * 100, 100)}%` }}
              />
            </div>
            <div className="text-xs text-blue-600 mt-1">
              {remainingBudget && remainingBudget >= 0 
                ? `Restam R$ ${remainingBudget.toFixed(2)}`
                : `Excedeu em R$ ${Math.abs(remainingBudget || 0).toFixed(2)}`
              }
            </div>
          </div>
        )}

        {/* Simulated Items */}
        {simulationMode && simulatedItems.length > 0 && (
          <div className="mb-6">
            <h3 className="text-purple-800 mb-3 flex items-center gap-2">
              <Calculator className="w-4 h-4" />
              Itens Simulados
            </h3>
            <div className="space-y-2">
              {simulatedItems.map((item) => (
                <Card key={`sim-${item.id}`} className="bg-purple-100 border-purple-300">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="text-purple-800">{item.name}</div>
                        <div className="text-sm text-purple-600">
                          Qtd: {item.quantity} | Preço: R$ {item.price?.toFixed(2)} | Total: R$ {item.total?.toFixed(2)}
                        </div>
                      </div>
                      <Button
                        onClick={() => handleRemoveSimulatedItem(item.id)}
                        size="sm"
                        variant="ghost"
                        className="text-red-500 hover:text-red-700 hover:bg-red-100"
                      >
                        ×
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <div className="mt-4 flex gap-2">
              <Button
                onClick={handleConfirmSimulation}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white"
              >
                <Check className="w-4 h-4 mr-2" />
                Confirmar Simulação
              </Button>
              <Button
                onClick={() => setSimulatedItems([])}
                variant="outline"
                className="flex-1 border-red-300 text-red-700 hover:bg-red-50"
              >
                Limpar Simulação
              </Button>
            </div>
          </div>
        )}

        {/* Items List */}
        <div className="space-y-3 mb-6">
          {items.map((item) => {
            const isSimulated = simulatedItems.some(sim => sim.id === item.id);
            
            return (
              <Card 
                key={item.id} 
                className={`transition-all duration-200 ${
                  item.purchased 
                    ? 'bg-green-100 border-green-300' 
                    : isSimulated && simulationMode
                    ? 'bg-purple-100 border-purple-300'
                    : currentItem === item.id
                    ? 'bg-yellow-100 border-yellow-400 ring-2 ring-yellow-300'
                    : 'bg-white border-orange-200 hover:border-orange-300'
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className={`flex items-center gap-2 ${
                        item.purchased ? 'line-through text-green-700' : 
                        isSimulated && simulationMode ? 'text-purple-800' : 'text-orange-800'
                      }`}>
                        {item.purchased && <Check className="w-4 h-4 text-green-600" />}
                        {isSimulated && simulationMode && <Calculator className="w-4 h-4 text-purple-600" />}
                        <span>{item.name}</span>
                      </div>
                      {item.purchased && (
                        <div className="text-sm text-green-600 mt-1">
                          Qtd: {item.quantity} | Preço: R$ {item.price?.toFixed(2)} | Total: R$ {item.total?.toFixed(2)}
                        </div>
                      )}
                      {isSimulated && simulationMode && (
                        <div className="text-sm text-purple-600 mt-1">
                          Simulado - clique no botão para ajustar
                        </div>
                      )}
                    </div>
                    
                    {!item.purchased && (
                      <Button
                        onClick={() => setCurrentItem(item.id)}
                        size="sm"
                        className={`${
                          simulationMode 
                            ? 'bg-purple-500 hover:bg-purple-600' 
                            : 'bg-orange-500 hover:bg-orange-600'
                        } text-white`}
                      >
                        {simulationMode ? <Calculator className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Input for current item */}
        {currentItem !== null && (
          <Card className="bg-yellow-100 border-yellow-400 mb-6">
            <CardContent className="p-4">
              <div className="text-center mb-3">
                <Badge variant="secondary" className="bg-yellow-200 text-yellow-800">
                  Adicionando: {items.find(item => item.id === currentItem)?.name}
                </Badge>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-yellow-700">Quantidade</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="Ex: 2 ou 1.5"
                    className="border-yellow-300 focus:border-yellow-500"
                  />
                </div>
                
                <div>
                  <label className="text-sm text-yellow-700">Preço unitário (R$)</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="Ex: 4.50"
                    className="border-yellow-300 focus:border-yellow-500"
                  />
                </div>
                
                {quantity && price && (
                  <div className="text-center p-2 bg-yellow-200 rounded-lg">
                    <span className="text-yellow-800">
                      Total: R$ {(parseFloat(quantity) * parseFloat(price)).toFixed(2)}
                    </span>
                  </div>
                )}
                
                <div className="flex gap-2">
                  <Button
                    onClick={() => setCurrentItem(null)}
                    variant="outline"
                    className="flex-1 border-yellow-400 text-yellow-700 hover:bg-yellow-200"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleAddItemData}
                    disabled={!quantity || !price}
                    className={`flex-1 ${
                      simulationMode 
                        ? 'bg-purple-500 hover:bg-purple-600' 
                        : 'bg-green-500 hover:bg-green-600'
                    } text-white`}
                  >
                    <Calculator className="w-4 h-4 mr-2" />
                    {simulationMode ? 'Simular' : 'Confirmar'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Finish Shopping Button */}
        {!simulationMode && (
          <Button
            onClick={handleFinishShopping}
            className="w-full bg-red-500 hover:bg-red-600 text-white py-4"
            disabled={purchasedCount === 0}
          >
            Finalizar Compras
          </Button>
        )}
        
        {simulationMode && (
          <div className="text-center p-4 bg-purple-100 rounded-lg">
            <p className="text-purple-800 mb-2">Modo Simulação Ativo</p>
            <p className="text-sm text-purple-600">
              Teste diferentes combinações de preços antes de fazer suas compras reais
            </p>
          </div>
        )}
      </div>
    </div>
  );
}