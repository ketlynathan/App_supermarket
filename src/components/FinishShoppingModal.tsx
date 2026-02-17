import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { CheckCircle, XCircle, Clock, ShoppingBag } from 'lucide-react';

interface ShoppingItem {
  id: number;
  name: string;
  purchased: boolean;
  quantity?: number;
  price?: number;
  total?: number;
}

interface FinishShoppingModalProps {
  isOpen: boolean;
  onClose: () => void;
  listName: string;
  purchasedItems: ShoppingItem[];
  notPurchasedItems: string[];
  totalSpent: number;
  onCreateNewList: (items: string[]) => void;
  onBackToLists: () => void;
}

export function FinishShoppingModal({ 
  isOpen, 
  onClose, 
  listName, 
  purchasedItems, 
  notPurchasedItems, 
  totalSpent,
  onCreateNewList,
  onBackToLists
}: FinishShoppingModalProps) {
  const [selectedNotPurchased, setSelectedNotPurchased] = useState<string[]>([]);

  const handleItemToggle = (item: string) => {
    setSelectedNotPurchased(prev => 
      prev.includes(item) 
        ? prev.filter(i => i !== item)
        : [...prev, item]
    );
  };

  const handleCreateNewList = () => {
    if (selectedNotPurchased.length > 0) {
      onCreateNewList(selectedNotPurchased);
    }
    onClose();
    onBackToLists();
  };

  const handleAbandonItems = () => {
    onClose();
    onBackToLists();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto bg-gradient-to-br from-green-50 to-blue-50 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-green-800 flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Compras Finalizadas
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Summary */}
          <Card className="bg-green-100 border-green-300">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-green-800">Lista: {listName}</span>
                <Badge className="bg-green-600 text-white">
                  <ShoppingBag className="w-3 h-3 mr-1" />
                  Concluída
                </Badge>
              </div>
              <div className="text-2xl text-green-900 mb-1">R$ {totalSpent.toFixed(2)}</div>
              <div className="text-sm text-green-700">
                {purchasedItems.length} itens comprados
              </div>
            </CardContent>
          </Card>

          {/* Purchased Items */}
          <div>
            <h3 className="text-green-800 mb-2 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Itens Comprados
            </h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {purchasedItems.map((item) => (
                <div key={item.id} className="bg-white/70 rounded-lg p-3 border border-green-200">
                  <div className="flex justify-between items-start">
                    <span className="text-green-800">{item.name}</span>
                    <span className="text-green-700">R$ {item.total?.toFixed(2)}</span>
                  </div>
                  <div className="text-xs text-green-600 mt-1">
                    Qtd: {item.quantity} × R$ {item.price?.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Not Purchased Items */}
          {notPurchasedItems.length > 0 && (
            <div>
              <h3 className="text-orange-800 mb-2 flex items-center gap-2">
                <XCircle className="w-4 h-4" />
                Itens Não Comprados ({notPurchasedItems.length})
              </h3>
              <p className="text-sm text-orange-600 mb-3">
                Selecione os itens que deseja comprar depois:
              </p>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {notPurchasedItems.map((item, index) => (
                  <div 
                    key={index}
                    onClick={() => handleItemToggle(item)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedNotPurchased.includes(item)
                        ? 'bg-yellow-100 border-yellow-400 ring-2 ring-yellow-300'
                        : 'bg-white/70 border-orange-200 hover:border-orange-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-orange-800">{item}</span>
                      {selectedNotPurchased.includes(item) && (
                        <Badge variant="secondary" className="bg-yellow-200 text-yellow-800">
                          <Clock className="w-3 h-3 mr-1" />
                          Para depois
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-2 pt-4">
            {selectedNotPurchased.length > 0 && (
              <Button
                onClick={handleCreateNewList}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-white"
              >
                <Clock className="w-4 h-4 mr-2" />
                Criar Nova Lista ({selectedNotPurchased.length} itens)
              </Button>
            )}
            
            <Button
              onClick={handleAbandonItems}
              variant="outline"
              className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              {notPurchasedItems.length > 0 ? 'Abandonar Itens Restantes' : 'Voltar às Listas'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}