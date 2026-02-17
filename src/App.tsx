import { useState } from 'react';
import { Button } from './components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Badge } from './components/ui/badge';
import { CreateListModal } from './components/CreateListModal';
import { ShoppingMode } from './components/ShoppingMode';
import { FinishShoppingModal } from './components/FinishShoppingModal';
import { Plus, ShoppingCart, Users, Trash2, Calendar } from 'lucide-react';

interface ShoppingList {
  id: number;
  name: string;
  items: string[];
  createdAt: Date;
  sharedWith: string[];
  completed?: boolean;
  totalSpent?: number;
}

interface ShoppingItem {
  id: number;
  name: string;
  purchased: boolean;
  quantity?: number;
  price?: number;
  total?: number;
}

type ViewMode = 'list' | 'shopping';

export default function App() {
  const [list, setList] = useState<ShoppingList | null>({
    id: 1,
    name: 'Compras da Semana',
    items: ['Arroz', 'Feijão', 'Carne', 'Verduras', 'Frutas'],
    createdAt: new Date(),
    sharedWith: ['familia@exemplo.com']
  });

  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isFinishModalOpen, setIsFinishModalOpen] = useState(false);
  const [currentList, setCurrentList] = useState<ShoppingList | null>(null);
  const [finishData, setFinishData] = useState<{
    purchasedItems: ShoppingItem[];
    notPurchased: string[];
  } | null>(null);

  const handleCreateList = (newListData: { name: string; items: string[]; sharedWith: string[] }) => {
    const newList: ShoppingList = {
      id: Date.now(),
      name: newListData.name,
      items: newListData.items,
      createdAt: new Date(),
      sharedWith: newListData.sharedWith
    };
    setList(newList);
  };

  const handleStartShopping = (shoppingList: ShoppingList) => {
    setCurrentList(shoppingList);
    setViewMode('shopping');
  };

  const handleFinishShopping = (purchasedItems: ShoppingItem[], notPurchased: string[]) => {
    if (currentList) {
      const totalSpent = purchasedItems.reduce((sum, item) => sum + (item.total || 0), 0);

      setList((previousList) => {
        if (!previousList || previousList.id !== currentList.id) {
          return previousList;
        }

        return {
          ...previousList,
          completed: true,
          totalSpent
        };
      });

      setFinishData({ purchasedItems, notPurchased });
      setIsFinishModalOpen(true);
    }
  };

  const handleCreateNewListFromRemaining = (items: string[]) => {
    if (currentList) {
      const newList: ShoppingList = {
        id: Date.now(),
        name: `${currentList.name} - Pendentes`,
        items,
        createdAt: new Date(),
        sharedWith: currentList.sharedWith
      };
      setList(newList);
    }
  };

  const handleBackToLists = () => {
    setViewMode('list');
    setCurrentList(null);
    setFinishData(null);
  };

  const handleDeleteList = (listId: number) => {
    if (list?.id === listId) {
      setList(null);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (viewMode === 'shopping' && currentList) {
    return (
      <ShoppingMode
        listName={currentList.name}
        initialItems={currentList.items}
        onBackToLists={handleBackToLists}
        onFinishShopping={handleFinishShopping}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50">
      <div className="max-w-md mx-auto p-4">
        <div className="text-center mb-6">
          <h1 className="text-orange-800 mb-2 flex items-center justify-center gap-2">
            <ShoppingCart className="w-6 h-6" />
            Lista do Mercado
          </h1>
          <p className="text-orange-600">Sua compra organizada e inteligente</p>
        </div>

        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="w-full mb-6 bg-orange-500 hover:bg-orange-600 text-white py-4"
        >
          <Plus className="w-5 h-5 mr-2" />
          {list ? 'Substituir Lista de Compras' : 'Nova Lista de Compras'}
        </Button>

        <div className="space-y-4">
          {!list ? (
            <Card className="border-orange-200">
              <CardContent className="p-6 text-center">
                <ShoppingCart className="w-12 h-12 mx-auto text-orange-400 mb-4" />
                <h3 className="text-orange-800 mb-2">Nenhuma lista criada</h3>
                <p className="text-orange-600 text-sm mb-4">
                  Crie sua lista de compras para começar!
                </p>
                <Button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Lista
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card
              key={list.id}
              className={`border-orange-200 hover:border-orange-300 transition-all ${
                list.completed ? 'bg-green-50 border-green-300' : 'bg-white/70'
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-orange-800 text-lg">{list.name}</CardTitle>
                    <div className="flex items-center gap-4 mt-2 text-sm text-orange-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(list.createdAt)}
                      </div>
                      {list.sharedWith.length > 0 && (
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {list.sharedWith.length}
                        </div>
                      )}
                    </div>
                  </div>

                  {list.completed ? (
                    <Badge className="bg-green-600 text-white">
                      Concluída - R$ {list.totalSpent?.toFixed(2)}
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                      {list.items.length} itens
                    </Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="mb-4">
                  <div className="text-sm text-orange-700 mb-2">Itens:</div>
                  <div className="flex flex-wrap gap-1">
                    {list.items.slice(0, 4).map((item, index) => (
                      <Badge key={index} variant="outline" className="text-xs border-orange-300 text-orange-700">
                        {item}
                      </Badge>
                    ))}
                    {list.items.length > 4 && (
                      <Badge variant="outline" className="text-xs border-orange-300 text-orange-700">
                        +{list.items.length - 4} mais
                      </Badge>
                    )}
                  </div>
                </div>

                {list.sharedWith.length > 0 && (
                  <div className="mb-4">
                    <div className="text-sm text-orange-700 mb-1">Compartilhada com:</div>
                    <div className="text-xs text-orange-600">
                      {list.sharedWith.join(', ')}
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  {!list.completed && (
                    <Button
                      onClick={() => handleStartShopping(list)}
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Iniciar Compras
                    </Button>
                  )}

                  <Button
                    onClick={() => handleDeleteList(list.id)}
                    variant="outline"
                    size="sm"
                    className="border-red-300 text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <CreateListModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onCreateList={handleCreateList}
        />

        {finishData && currentList && (
          <FinishShoppingModal
            isOpen={isFinishModalOpen}
            onClose={() => setIsFinishModalOpen(false)}
            listName={currentList.name}
            purchasedItems={finishData.purchasedItems}
            notPurchasedItems={finishData.notPurchased}
            totalSpent={finishData.purchasedItems.reduce((sum, item) => sum + (item.total || 0), 0)}
            onCreateNewList={handleCreateNewListFromRemaining}
            onBackToLists={handleBackToLists}
          />
        )}
      </div>
    </div>
  );
}
