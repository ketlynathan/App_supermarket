import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { X, Plus } from 'lucide-react';

interface CreateListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateList: (list: {
    name: string;
    items: string[];
    sharedWith: string[];
  }) => void;
}

export function CreateListModal({ isOpen, onClose, onCreateList }: CreateListModalProps) {
  const [listName, setListName] = useState('');
  const [itemInput, setItemInput] = useState('');
  const [items, setItems] = useState<string[]>([]);
  const [sharedWith, setSharedWith] = useState('');

  const addItem = () => {
    if (itemInput.trim()) {
      setItems([...items, itemInput.trim()]);
      setItemInput('');
    }
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (listName.trim() && items.length > 0) {
      const sharedEmails = sharedWith
        .split(',')
        .map(email => email.trim())
        .filter(email => email);
      
      onCreateList({
        name: listName.trim(),
        items,
        sharedWith: sharedEmails
      });
      
      // Reset form
      setListName('');
      setItems([]);
      setItemInput('');
      setSharedWith('');
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto bg-gradient-to-br from-orange-50 to-yellow-50">
        <DialogHeader>
          <DialogTitle className="text-orange-800">Nova Lista de Compras</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="listName" className="text-orange-700">Nome da Lista</Label>
            <Input
              id="listName"
              value={listName}
              onChange={(e) => setListName(e.target.value)}
              placeholder="Ex: Compras da semana"
              className="border-orange-200 focus:border-orange-400"
            />
          </div>

          <div>
            <Label className="text-orange-700">Itens da Lista</Label>
            <div className="flex gap-2">
              <Input
                value={itemInput}
                onChange={(e) => setItemInput(e.target.value)}
                placeholder="Digite um item"
                className="border-orange-200 focus:border-orange-400"
                onKeyPress={(e) => e.key === 'Enter' && addItem()}
              />
              <Button
                onClick={addItem}
                size="sm"
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
              {items.map((item, index) => (
                <div key={index} className="flex items-center justify-between bg-white/70 rounded-lg px-3 py-2">
                  <span className="text-orange-800">{item}</span>
                  <Button
                    onClick={() => removeItem(index)}
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="sharedWith" className="text-orange-700">Compartilhar com (emails)</Label>
            <Textarea
              id="sharedWith"
              value={sharedWith}
              onChange={(e) => setSharedWith(e.target.value)}
              placeholder="email1@exemplo.com, email2@exemplo.com"
              className="border-orange-200 focus:border-orange-400 resize-none h-20"
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1 border-orange-300 text-orange-700 hover:bg-orange-50"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!listName.trim() || items.length === 0}
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
            >
              Criar Lista
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}