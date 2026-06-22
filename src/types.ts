export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  stock: number;
  maxStock: number;
  color: string; // Tailwind background color prefix
  icon: string;  // Emoji or Lucide icon name representation
  code: string;  // PLU / Barcode representation
}

export interface Category {
  id: string;
  name: string;
  icon: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface Order {
  id: string;
  orderNo: number;
  timestamp: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  discountCode?: string;
  tax: number;
  total: number;
  paymentMethod: 'cash' | 'card' | 'giftcard';
  amountReceived: number;
  changeDue: number;
  status: 'completed' | 'refunded';
  cashier: string;
}

export interface DiscountCode {
  code: string;
  type: 'percent' | 'fixed';
  value: number;
  minSubtotal?: number;
}

export interface HeldOrder {
  id: string;
  name: string;
  items: CartItem[];
  timestamp: string;
}

export interface NotificationPayload {
  id: string;
  type: 'checkout' | 'cancel' | 'system';
  title: string;
  message: string;
  timestamp: string;
  role: string;
  orderId?: string;
  orderNo?: number;
  total?: number;
  channels: {
    slackSimulated?: boolean;
    smsSimulated?: boolean;
    emailSimulated?: boolean;
    audioPing?: boolean;
    telegram?: 'blocked';
  };
}

export type UserRole = 'Admin' | 'Cashier' | 'Other';

export interface Shift {
  id: string;
  userRole: UserRole;
  startTime: string; // ISO string
  endTime?: string;  // ISO string, present if completed
  hoursWorked?: number; // total hours as floating-point number
}

export interface OnlineOrder {
  id: string;
  orderNo: string | number;
  customerName: string;
  items: {
    productId?: string;
    name: string;
    quantity: number;
    price: number;
  }[];
  total: number;
  status: 'pending' | 'accepted' | 'completed' | 'cancelled';
  timestamp: string;
  sourceUrl?: string;
}



