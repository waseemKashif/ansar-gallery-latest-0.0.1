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
        offerExpiresIn: string;
        hours: string;
        minutes: string;
        seconds: string;
        was: string;
        DiscoverCuratedSelectionJustforYou: string;
        shopNow: string;
        itemsPerPage: string;
        ansarGallery: string;
        shopBy: string;
        selectLocation: string,
        remove: string,
        close: string,
        total: string,
        freeDelivery: string,
        youHaveGot: string,
        free: string,
        gotoCart: string,
        checkout: string,
        removeSoldOutItems: string,
        moreFor: string,
        within15Days: string,
        securePayments: string,
        weAccepts: string,
        selectOptions: string,
        inCart: string,
        options: string,
        categories: string,
        offers: string,
        account: string,
        sortBy: string,
        itemsCount: string,
        filter: string,
        items: string,
        of: string,
        position: string,
        nameAZ: string,
        nameZA: string,
        priceLowHigh: string,
        priceHighLow: string,
        reportAnIssue: string,

    };
    paymentSummary: {
        securePayments: string;
        weAccepts: string;
        ansarGalleryensures: string;
        weAdhereTo: string;
        paymentMethodsWeAccept: string;
        securityCertificationsWeUse: string;
        readPaymentPolicy: string;
        freeReturns: string;
        ifAnyOfOurProducts: string;
        readReturnPolicy: string;
    },
    cartSummary: {
        summary: string;
        noOfItems: string;
        subtotal: string;
        shipping: string;
        freeShipping: string;
        total: string;
        discount: string;
        proceedToCheckout: string;
    },
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
        deliveryAddress: string;
        pleaseSelectAddress: string;
        changeAddress: string;
        selectAddress: string;
        cartError: string;
        soldOutItems: string;
        clear: string;
        removeSoldOutItems: string;
        areYouSureYouWantToRemoveAllSoldOutItems: string;
        thisActionCannotBeUndone: string;
        yesRemoveAll: string;
        noCancel: string;
        item: string;
        price: string;
        status: string;
        itemsInYourCart: string;
        areYouSure: string;
        continue: string;
        itemsExceedingStockLimits: string;
        outOfStockItems: string;
        removeAllItems: string;
        yourCartContainsItems: string;
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
        signInRegister: string;
        enterMobileNumber: string;
        mobileNumber: string;
    };
    category: {
        all: string;
        allCategories: string;
        carpets: string;
        mobilePhones: string;
        electronics: string;
        grocery: string;
    }
    footer: {
        connectWithUs: string;
        informations: string;
        ourServices: string;
        paymentAndShipping: string;
        newsletter: string;
        subscribe: string;
        enterYourEmail: string;
        informationMenu: {
            faqs: string;
            aboutUs: string;
            deliveryInformation: string;
        };
        servicesMenu: {
            privacyPolicy: string;
            termsConditions: string;
            contactUs: string;
            ordersReturns: string;
            brands: string;
        };
        paymentsMenu: {
            paymentMethods: string;
            shippingGuide: string;
            returnPolicy: string;
        };
        socialsMenu: {
            facebook: string;
            instagram: string;
            tiktok: string;
            twitter: string;
            snapchat: string;
        };
    };
    deliveryInformation: {
        title: string;
        subtitle: string;
        data: {
            question: string;
            option1: string;
            option2?: string;
        }[];
    };
}

const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
    en: () => import("@/dictionaries/en.json").then((module) => module.default),
    ar: () => import("@/dictionaries/ar.json").then((module) => module.default),
};

export const getDictionary = async (locale: Locale): Promise<Dictionary> => {
    const dictionaryLoader = dictionaries[locale] || dictionaries[i18n.defaultLocale];
    return dictionaryLoader();
};
