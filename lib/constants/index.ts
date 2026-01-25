
export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "Ansar Gallery";
export const DEFAULT_TITLE = "Online Shopping in Qatar - Ansar Gallery Stores";
export const DESCRIPTION = process.env.NEXT_PUBLIC_DESCRIPTION || "Shop online at Ansar Gallery offers best prices in Qatar for grocery, mobile phones, electronics, furniture, carpets, and building materials ✓ Secure online shopping store ✓ COD ✓ Card Payment. Order now for seamless shopping experience!";
export const KEYWORDS = "shopping, online shopping, shop online, online stores, Ansar Gallery, fast delivery, grocery, mobile phones, electronics, furniture, carpets, fashion, and building materials, Doha, Qatar, www.ansargallery.com";
export const SERVER_URL =
    process.env.NEXT_PUBLIC_SERVER_URL || "http//localhost:3000";
export const BahrainUrl = "https://bahrain.ahmarket.com/";
export const UAEUrl = "https://uae.ahmarket.com/";
export const OmanUrl = "https://oman.ahmarket.com/";
export const statusLabels = {
    pending: 'Order Placed',
    processing: 'Processing',
    assigned_picker: 'Preparing Order',
    start_picking: 'Preparing Order',
    end_picking: 'Ready to Dispatch',
    assigned_driver: 'Ready for Pickup',
    on_the_way: 'On the way',
    complete: 'Delivered',
    holded: 'Processing',
    order_collected: 'Need to Discuss',
    canceled: 'Cancelled',
    pending_payment: 'Pending Payment',
    cancel_request: 'Cancelled',
    canceled_by_team: 'Cancelled',
    payment_collected: 'Payment Collected',
    payment_failed: 'Payment Failed',
    confirmation: 'Processing',
    pickup: 'Processing',
    refund_request: 'Refund Request',
    refunded: 'Refunded',
    sfo_order: 'Processing',
    partial_refund: 'Partial Refund',
    rescheduled: 'Processing',
    material_request: 'Processing',
    ready_to_dispatch: 'Processing',
    item_not_available: 'Out of Stock',
    submitted: 'Processing',
    note: 'Processing',
    customer_not_answer: 'Customer Not Answer',
}
