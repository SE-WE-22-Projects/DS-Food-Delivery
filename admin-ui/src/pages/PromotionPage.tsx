import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { PlusCircle, Edit, Trash2, Gift, Save, XCircle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Promotion {
    id: string;
    name: string;
    amount: number;
    description: string;
    code: string;
}

const PromotionManagement = () => {
    const [promotions, setPromotions] = useState<Promotion[]>(() => {
        if (typeof window !== 'undefined') {
            const savedPromotions = localStorage.getItem('promotions');
            return savedPromotions ? JSON.parse(savedPromotions) : [];
        }
        return [];
    });

    const [open, setOpen] = useState(false);
    const [editPromotion, setEditPromotion] = useState<Promotion | null>(null);
    const [name, setName] = useState('');
    const [amount, setAmount] = useState<number | string>('');  // Use union type
    const [description, setDescription] = useState('');
    const [code, setCode] = useState('');
    const [isSaving, setIsSaving] = useState(false); // Track saving state
    const [deleteId, setDeleteId] = useState<string | null>(null); // Track ID to delete

    // Save to localStorage whenever promotions change
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('promotions', JSON.stringify(promotions));
        }
    }, [promotions]);

    const handleAddPromotion = () => {
        setEditPromotion(null); // Reset for add
        setName('');
        setAmount('');
        setDescription('');
        setCode('');
        setOpen(true);
    };

    const handleSavePromotion = async () => {
        setIsSaving(true); // Start saving
        // Simulate network delay (remove in production)
        await new Promise(resolve => setTimeout(resolve, 500));

        if (!name.trim() || !amount || !description.trim() || !code.trim()) {
            setIsSaving(false);
            return; //  basic validation
        }

        const parsedAmount = Number(amount);
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            setIsSaving(false);
            return; // Ensure amount is a valid positive number
        }


        if (editPromotion) {
            // Update existing promotion
            setPromotions(promotions.map(p =>
                p.id === editPromotion.id ? { ...p, name, amount: parsedAmount, description, code } : p
            ));
        } else {
            // Add new promotion
            const newPromotion: Promotion = {
                id: crypto.randomUUID(),
                name,
                amount: parsedAmount,
                description,
                code,
            };
            setPromotions([...promotions, newPromotion]);
        }
        setOpen(false);
        setIsSaving(false); // End saving
        setName('');
        setAmount('');
        setDescription('');
        setCode('');
    };

    const handleEditPromotion = (promotion: Promotion) => {
        setEditPromotion(promotion);
        setName(promotion.name);
        setAmount(promotion.amount);
        setDescription(promotion.description);
        setCode(promotion.code);
        setOpen(true);
    };

    const handleDeletePromotion = (id: string) => {
        setDeleteId(id);
    };

    const confirmDeletePromotion = async () => {
        setIsSaving(true);
        await new Promise(resolve => setTimeout(resolve, 300));
        setPromotions(promotions.filter(p => p.id !== deleteId));
        setDeleteId(null);
        setIsSaving(false);
    };

    const cancelDelete = () => {
        setDeleteId(null);
    };

    const navigate = useNavigate()

    return (
        <div className="p-4 md:p-8">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl md:text-4xl font-bold text-gray-200 flex items-center gap-2">
                    <Button variant='ghost' size="lg" onClick={() => navigate(-1)}><ArrowLeft /></Button>
                    <Gift className="w-6 h-6 md:w-8 md:h-8 text-purple-400" />
                    Promotions
                </h1>
                <Button
                    onClick={handleAddPromotion}
                    className="bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 hover:text-purple-200
                             border border-purple-500/30 transition-colors duration-200
                             flex items-center gap-2"
                >
                    <PlusCircle className="w-4 h-4 md:w-5 md:h-5" />
                    Add Promotion
                </Button>
            </div>

            <div className="bg-gray-900 rounded-xl shadow-lg border border-gray-800 overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="text-gray-300">Name</TableHead>
                            <TableHead className="text-gray-300">Amount</TableHead>
                            <TableHead className="text-gray-300">Code</TableHead>
                            <TableHead className="text-gray-300">Description</TableHead>
                            <TableHead className="text-gray-300 text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {promotions.map((promotion) => (
                            <TableRow>
                                <TableCell className="font-medium text-white">{promotion.name}</TableCell>
                                <TableCell className="text-gray-400">{promotion.amount.toFixed(2)}%</TableCell>
                                <TableCell className="text-gray-400">{promotion.code}</TableCell>
                                <TableCell className="text-gray-400">{promotion.description}</TableCell>
                                <TableCell className="text-right space-x-2">
                                    <Button
                                        size="icon"
                                        variant="outline"
                                        onClick={() => handleEditPromotion(promotion)}
                                        className="bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 hover:text-blue-200 border border-blue-500/30"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        size="icon"
                                        variant="outline"
                                        onClick={() => handleDeletePromotion(promotion.id)}
                                        className="bg-red-500/20 text-red-300 hover:bg-red-500/30 hover:text-red-200 border border-red-500/30"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="bg-gray-900 border-gray-700 text-white sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="text-gray-200">
                            {editPromotion ? 'Edit Promotion' : 'Add Promotion'}
                        </DialogTitle>
                        <DialogDescription className="text-gray-400">
                            Fill in the details below.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right text-gray-300">
                                Name
                            </Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="col-span-3 bg-gray-800 border-gray-700 text-white"
                                placeholder="Promotion Name"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="amount" className="text-right text-gray-300">
                                Amount
                            </Label>
                            <Input
                                id="amount"
                                value={amount}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    // Allow only numbers and a single decimal point
                                    if (/^(\d+(\.\d{0,2})?)?$/.test(value)) {
                                        setAmount(value);
                                    }
                                }}
                                className="col-span-3 bg-gray-800 border-gray-700 text-white"
                                placeholder="0.00"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="code" className="text-right text-gray-300">
                                Code
                            </Label>
                            <Input
                                id="code"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                className="col-span-3 bg-gray-800 border-gray-700 text-white"
                                placeholder="PROMOCODE"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-start gap-4">
                            <Label htmlFor="description" className="text-right mt-2 text-gray-300">
                                Description
                            </Label>
                            <Textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="col-span-3 bg-gray-800 border-gray-700 text-white min-h-[80px] resize-y"
                                placeholder="Promotion details..."
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setOpen(false)}
                            className="bg-gray-700 hover:bg-gray-600 text-white border-gray-600"
                            disabled={isSaving}
                        >
                            <XCircle className="w-4 h-4 mr-2" />
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            onClick={handleSavePromotion}
                            className="bg-purple-500 hover:bg-purple-600 text-white"
                            disabled={isSaving}
                        >
                            {isSaving ? (
                                <>
                                    <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4 mr-2" />
                                    Save
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={!!deleteId} onOpenChange={setDeleteId ? cancelDelete : undefined}>
                <DialogContent className="bg-gray-900 border-gray-700 text-white">
                    <DialogHeader>
                        <DialogTitle className="text-red-400">Confirm Deletion</DialogTitle>
                        <DialogDescription className="text-gray-400">
                            Are you sure you want to delete this promotion? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={cancelDelete}
                            className="bg-gray-700 hover:bg-gray-600 text-white border-gray-600"
                            disabled={isSaving}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={confirmDeletePromotion}
                            className="bg-red-500 hover:bg-red-600 text-white"
                            disabled={isSaving}
                        >
                            {isSaving ? (
                                <>
                                    <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Deleting...
                                </>
                            ) : (
                                "Delete"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default PromotionManagement;
