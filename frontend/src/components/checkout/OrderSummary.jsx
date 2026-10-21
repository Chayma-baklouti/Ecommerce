import React, { useState, useEffect } from 'react';
import { formatPriceCalculation } from '../util/formatPrice';
const getImageUrl = (image) => {
  if (!image) return "";
  if (image.startsWith("/assets/") || image.startsWith("http")) return image;
  return `${import.meta.env.VITE_BACK_END_URL}/images/${image}`;
};
const OrderSummary = ({ address, paymentMethod }) => {
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const savedCart = localStorage.getItem('cartItems');
        if (savedCart) {
            try {
                const parsedCart = JSON.parse(savedCart);
                setCart(parsedCart);
            } catch (e) {
                console.error("Erreur parsing du panier localStorage", e);
                setCart([]);
            }
        } else {
            setCart([]);
        }
        setLoading(false);
    }, []);

    const totalPrice = cart.reduce((sum, item) => {
        const price = item.specialPrice ?? item.price ?? 0;
        const qty = item.quantity ?? 1;
        return sum + (price * qty);
    }, 0);

    if (loading) {
        return <div className="text-center py-8">Chargement du panier...</div>;
    }
    return (
        <div className="container mx-auto px-4 mb-8">
            <div className="flex flex-wrap">
                <div className="w-full lg:w-8/12 lg:pr-4">
                    <div className="space-y-4">
                        {/* Adresse de livraison */}
                        <div className="p-6 border rounded-lg shadow-xs">
                            <h2 className="text-2xl font-semibold mb-4">Billing Address</h2>
                            <p><strong>Building Name: </strong>{address?.buildingName || '—'}</p>
                            <p><strong>City: </strong>{address?.city || '—'}</p>
                            <p><strong>Street: </strong>{address?.street || '—'}</p>
                            <p><strong>State: </strong>{address?.state || '—'}</p>
                            <p><strong>Pincode: </strong>{address?.pincode || '—'}</p>
                            <p><strong>Country: </strong>{address?.country || '—'}</p>
                        </div>

                        {/* Moyen de paiement */}
                        <div className="p-6 border rounded-lg shadow-xs">
                            <h2 className="text-2xl font-semibold mb-4">Payment Method</h2>
                            <p><strong>Method: </strong>{paymentMethod || 'Not selected'}</p>
                        </div>

                        {/* Articles commandés */}
                        <div className="p-6 border rounded-lg shadow-xs">
                            <h2 className="text-2xl font-semibold mb-4">Order Items</h2>

                            {cart.length === 0 ? (
                                <p className="text-gray-400 p-4">No items in cart</p>
                            ) : (
                                <ul className="divide-y divide-gray-200">
                                    {cart.map((item) => {
                                        const price = item.specialPrice ?? item.price ?? 0;
                                        const quantity = item.quantity ?? 1;
                                        const lineTotal = price * quantity;
                                        const imageUrl = getImageUrl(item.image);
                                        const key = `${item.productId}-${item.selectedSize}-${item.selectedColor}`;

                                        return (
                                            <li key={key} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                                                <div className="w-20 h-20 shrink-0 rounded-lg border bg-gray-50 flex items-center justify-center overflow-hidden">
                                                    <img
                                                        src={imageUrl}
                                                        alt={item.productName || item.title}
                                                        className="max-w-full max-h-full object-contain"
                                                        onError={(e) => {
                                                            e.currentTarget.onerror = null;
                                                            e.currentTarget.style.visibility = 'hidden';
                                                        }}
                                                    />
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-black truncate">
                                                        {item.productName || item.title}
                                                    </p>
                                                    <p className="text-sm text-gray-500 mt-1">
                                                        {quantity} × ${price.toFixed(2)}
                                                    </p>
                                                    <div className="flex flex-wrap items-center gap-2 mt-2">
                                                        {item.selectedSize && (
                                                            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                                                                Size: {item.selectedSize}
                                                            </span>
                                                        )}
                                                        {item.selectedColor && (
                                                            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 flex items-center gap-1">
                                                                Color:
                                                                <span
                                                                    style={{
                                                                        display: 'inline-block',
                                                                        width: 12,
                                                                        height: 12,
                                                                        borderRadius: '50%',
                                                                        backgroundColor: item.selectedColor,
                                                                        border: '1px solid #ccc',
                                                                    }}
                                                                />
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="font-semibold text-right whitespace-nowrap">
                                                    ${lineTotal.toFixed(2)}
                                                </div>
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>

                {/* Résumé de la commande */}
                <div className="w-full lg:w-4/12 mt-4 lg:mt-0">
                    <div className="border rounded-lg shadow-xs p-6 space-y-4">
                        <h2 className="text-2xl font-semibold mb-4">Order Summary</h2>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span>Products</span>
                                <span>${totalPrice.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Tax (0%)</span>
                                <span>$0.00</span>
                            </div>
                            <div className="flex justify-between font-semibold border-t pt-2">
                                <span>SubTotal</span>
                                <span>${totalPrice.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderSummary;