// lib/i18n/dictionaries.ts

import { i18n, type Locale } from "./config";

// Define the dictionary structure
export interface Dictionary {
    common: {
        home: string;
        cart: string;
        search: string;
        myAccount: string;
        language: string;
        loading: string;
        error: string;
        retry: string;
        cancel: string;
        save: string;
        delete: string;
        edit: string;
        back: string;
        next: string;
        previous: string;
        viewAll: string;
        addToCart: string;
        removeFromCart: string;
        continueShopping: string;
        proceedToCheckout: string;
        relatedProducts: string;
        boughtTogetherBy: string;
        deliverTo: string;
        searchFor: string;
        soldOut: string;
        QAR: string;
        loadMore: string;
        promotions: string;
        booklets: string;
    };
    home: {
        welcome: string;
        featuredProducts: string;
        newArrivals: string;
        bestSellers: string;
        shopByCategory: string;
    };
    cart: {
        title: string;
        emptyCart: string;
        subtotal: string;
        shipping: string;
        freeShipping: string;
        total: string;
        quantity: string;
        removeItem: string;
        clearCart: string;
        itemsInCart: string;
    };
    checkout: {
        title: string;
        personalInfo: string;
        shippingAddress: string;
        paymentMethod: string;
        orderSummary: string;
        placeOrder: string;
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
        street: string;
        building: string;
        floor: string;
        city: string;
        area: string;
    };
    product: {
        addToCart: string;
        outOfStock: string;
        inStock: string;
        price: string;
        description: string;
        reviews: string;
        relatedProducts: string;
        add: string;
        availability: string;
        quantity: string;
        delivery: string;
        payment: string;
        returns: string;
    };
    auth: {
        register: string;
        forgotPassword: string;
        enterPhone: string;
        enterOtp: string;
        verifyOtp: string;
        resendOtp: string;
        profile: string;
        login: string;
        logout: string;
    };
    category: {
        all: string;
        allCategories: string;
        carpets: string;
        mobilePhones: string;
        electronics: string;
        grocery: string;
    }
}

const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
    en: () => import("@/dictionaries/en.json").then((module) => module.default),
    ar: () => import("@/dictionaries/ar.json").then((module) => module.default),
};

export const getDictionary = async (locale: Locale): Promise<Dictionary> => {
    const dictionaryLoader = dictionaries[locale] || dictionaries[i18n.defaultLocale];
    return dictionaryLoader();
};
