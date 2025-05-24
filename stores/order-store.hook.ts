// import { skuId } from '@/lib/utils'
// import { Client  } from '@prisma/client'
// import { Content } from '@tiptap/react'
// import { create } from 'zustand'
// import { persist } from 'zustand/middleware'

// export type Car = {
//   id: string
//   brand: string
//   model: string
// }

// export type Dimensions = {
//   thickness: number
//   width: number
//   height: number
// }

// export type orderCore = {
//   fins: string
//   finsPitch: number
//   tube: string
//   rows: number
//   dimensions: Dimensions
// }

// export type orderCollector = {
//   position: string
//   material: string
//   tightening: string
//   perforation: string
//   isTinned: boolean
//   upperDimensions: Dimensions
//   lowerDimensions?: Dimensions
// }

// export type OrderArticle = {
//   id: string
//   productId: string
//   name: string
//   quantity: number
//   price: number
//   total: number
//   Client: Pick<Client, 'id' | 'name'>
//   Core: Core
//   Collector: Collector
//   Car: Car
//   label: string
//   isCarIncluded: boolean
//   isModificationIncluded: boolean
//   modification: Content
//   note: Content
//   description: Content
//   type: string
//   fabrication: string
//   cooling: string
//   packaging: string
// }

// export type PaymentDetails = {
//   method: string
//   category: 'pending' | 'paid' | 'canceled'
//   amount: number
//   deposit: number
//   remaining: number
// }

// export type OrderStatus =
//   | 'draft'
//   | 'pending'
//   | 'processing'
//   | 'fabrication'
//   | 'ready'
//   | 'delivered'
//   | 'cancelled'

// type OrderState = {
//   // Order metadata
//   id: string
//   createdAt: Date
//   updatedAt: Date
//   status: OrderStatus

//   // Client information
//   client: Client | null
//   setClient: (client: Client | null) => void

//   // Car information
//   car: Car | null
//   setCar: (car: Car | null) => void

//   // Order articles
//   articles: OrderArticle[]
//   addArticle: (article: OrderArticle) => void
//   updateArticle: (id: string, article: Partial<OrderArticle>) => void
//   removeArticle: (id: string) => void
//   clearArticles: () => void

//   // Payment details
//   payment: PaymentDetails | null
//   setPayment: (payment: PaymentDetails | null) => void
//   updatePayment: (details: Partial<PaymentDetails>) => void

//   // Order notes
//   notes: string
//   setNotes: (notes: string) => void

//   // Order totals
//   subtotal: number
//   tax: number
//   discount: number
//   total: number
//   updateTotals: () => void

//   // Order status management
//   setStatus: (status: OrderStatus) => void

//   // Complete order management
//   submitOrder: () => Promise<{
//     success: boolean
//     orderId?: string
//     error?: string
//   }>

//   resetOrder: () => void

//   // Utility functions
//   calculateArticleTotal: (
//     article: Pick<OrderArticle, 'quantity' | 'price'>
//   ) => number
//   duplicateArticle: (id: string) => void
// }

// const calculateSubtotal = (articles: OrderArticle[]): number => {
//   return articles.reduce((sum, article) => sum + article.total, 0)
// }

// const DEFAULT_TAX_RATE = 0.2 // 20% tax rate, adjust as needed

// export const useOrderStore = create<OrderState>()(
//   persist(
//     (set, get) => ({
//       // Order metadata
//       id: skuId('CB'),
//       createdAt: new Date(),
//       updatedAt: new Date(),
//       status: 'draft',

//       // Client information
//       client: null,
//       setClient: (client) => set({ client }),

//       // Car information
//       car: null,
//       setCar: (car) => set({ car }),

//       // Order articles
//       articles: [],
//       addArticle: (article) =>
//         set((state) => {
//           const newArticles = [...state.articles, article]
//           return {
//             articles: newArticles,
//             updatedAt: new Date(),
//             subtotal: calculateSubtotal(newArticles)
//           }
//         }),
//       updateArticle: (id, updatedArticle) =>
//         set((state) => {
//           const newArticles = state.articles.map((article) =>
//             article.id === id ? { ...article, ...updatedArticle } : article
//           )
//           return {
//             articles: newArticles,
//             updatedAt: new Date(),
//             subtotal: calculateSubtotal(newArticles)
//           }
//         }),
//       removeArticle: (id) =>
//         set((state) => {
//           const newArticles = state.articles.filter(
//             (article) => article.id !== id
//           )
//           return {
//             articles: newArticles,
//             updatedAt: new Date(),
//             subtotal: calculateSubtotal(newArticles)
//           }
//         }),
//       clearArticles: () =>
//         set({ articles: [], subtotal: 0, updatedAt: new Date() }),

//       // Payment details
//       payment: null,
//       setPayment: (payment) => set({ payment, updatedAt: new Date() }),
//       updatePayment: (details) =>
//         set((state) => ({
//           payment: state.payment ? { ...state.payment, ...details } : null,
//           updatedAt: new Date()
//         })),

//       // Order notes
//       notes: '',
//       setNotes: (notes) => set({ notes, updatedAt: new Date() }),

//       // Order totals
//       subtotal: 0,
//       tax: 0,
//       discount: 0,
//       total: 0,
//       updateTotals: () =>
//         set((state) => {
//           const subtotal = calculateSubtotal(state.articles)
//           const tax = subtotal * DEFAULT_TAX_RATE
//           const total = subtotal + tax - state.discount
//           return { subtotal, tax, total, updatedAt: new Date() }
//         }),

//       // Order status management
//       setStatus: (status) => set({ status, updatedAt: new Date() }),

//       // Complete order management
//       submitOrder: async () => {
//         const state = get()

//         // Validate order before submission
//         if (!state.client) {
//           return { success: false, error: 'Client information is required' }
//         }

//         if (state.articles.length === 0) {
//           return {
//             success: false,
//             error: 'Order must contain at least one article'
//           }
//         }

//         try {
//           // Here you would typically make an API call to your backend
//           // to create the order in your database

//           // For now, we'll just simulate a successful submission
//           set({
//             status: 'pending',
//             updatedAt: new Date()
//           })

//           return { success: true, orderId: state.id }
//         } catch (error) {
//           return {
//             success: false,
//             error:
//               error instanceof Error ? error.message : 'Failed to submit order'
//           }
//         }
//       },

//       resetOrder: () =>
//         set({
//           id: skuId('CB'),
//           createdAt: new Date(),
//           updatedAt: new Date(),
//           status: 'draft',
//           client: null,
//           car: null,
//           articles: [],
//           payment: null,
//           notes: '',
//           subtotal: 0,
//           tax: 0,
//           discount: 0,
//           total: 0
//         }),

//       // Utility functions
//       calculateArticleTotal: (article) => {
//         return article.quantity * article.price
//       },

//       duplicateArticle: (id) => {
//         const state = get()
//         const articleToDuplicate = state.articles.find(
//           (article) => article.id === id
//         )

//         if (articleToDuplicate) {
//           const duplicatedArticle = {
//             ...articleToDuplicate,
//             id: skuId('CB')
//           }

//           state.addArticle(duplicatedArticle)
//         }
//       }
//     }),
//     {
//       name: 'order-storage',
//       partialize: (state) => ({
//         // Only persist these fields to localStorage
//         id: state.id,
//         client: state.client,
//         car: state.car,
//         articles: state.articles,
//         payment: state.payment,
//         notes: state.notes,
//         status: state.status,
//         subtotal: state.subtotal,
//         tax: state.tax,
//         discount: state.discount,
//         total: state.total
//       })
//     }
//   )
// )

// // Helper hooks for specific parts of the order
// export const useOrderClient = () =>
//   useOrderStore((state) => ({
//     client: state.client,
//     setClient: state.setClient
//   }))

// export const useOrderCar = () =>
//   useOrderStore((state) => ({
//     car: state.car,
//     setCar: state.setCar
//   }))

// export const useOrderArticles = () =>
//   useOrderStore((state) => ({
//     articles: state.articles,
//     addArticle: state.addArticle,
//     updateArticle: state.updateArticle,
//     removeArticle: state.removeArticle,
//     clearArticles: state.clearArticles,
//     duplicateArticle: state.duplicateArticle
//   }))

// export const useOrderPayment = () =>
//   useOrderStore((state) => ({
//     payment: state.payment,
//     setPayment: state.setPayment,
//     updatePayment: state.updatePayment
//   }))

// export const useOrderTotals = () =>
//   useOrderStore((state) => ({
//     subtotal: state.subtotal,
//     tax: state.tax,
//     discount: state.discount,
//     total: state.total,
//     updateTotals: state.updateTotals
//   }))

// export const useOrderStatus = () =>
//   useOrderStore((state) => ({
//     status: state.status,
//     setStatus: state.setStatus
//   }))
