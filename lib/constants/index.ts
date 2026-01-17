
export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "Ansar Gallery";
export const DESCRIPTION = process.env.NEXT_PUBLIC_DESCRIPTION || "Buy online from Ansar Gallery, the leading retail chain in GCC countries. Explore our wide range of products including electronics, fashion, home appliances, and more. Enjoy seamless shopping with fast delivery and excellent customer service.";
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
